import logging
import time
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from network_monitor.schemas.protocol_schema import ProtocolEventModel

logger = logging.getLogger(__name__)

class TransactionCorrelator:
    """Correlates protocol requests with corresponding responses and calculates transaction latency."""

    def __init__(self, timeout_seconds: float = 5.0):
        self.pending_requests: Dict[str, Dict[str, Any]] = {}
        self.timeout_seconds = timeout_seconds
        self.completed_transactions = 0
        self.timed_out_transactions = 0

    def _make_key(self, transaction_id: Any, src: str, dst: str, unit_id: Any) -> str:
        return f"{transaction_id}:{src}:{dst}:{unit_id}"

    def process_event(self, event: ProtocolEventModel) -> Optional[Dict[str, Any]]:
        msg_type = event.message_type.upper()
        tid = event.transaction_id
        src = event.source_asset_id or "UNKNOWN"
        dst = event.destination_asset_id or "UNKNOWN"
        unit_id = event.metadata.get("unit_id", 1)

        key = self._make_key(tid, src, dst, unit_id)
        reverse_key = self._make_key(tid, dst, src, unit_id)

        now = time.time()

        if msg_type == "REQUEST":
            self.pending_requests[key] = {
                "event": event,
                "timestamp": now,
                "iso_timestamp": event.timestamp
            }
            self.cleanup_expired(now)
            return None

        elif msg_type == "RESPONSE" or msg_type == "UNASSIGNED":
            req_data = self.pending_requests.pop(reverse_key, None) or self.pending_requests.pop(key, None)

            if req_data:
                req_ts = req_data["timestamp"]
                latency_ms = round((now - req_ts) * 1000.0, 2)
                event.latency = latency_ms
                self.completed_transactions += 1

                return {
                    "transaction_id": tid,
                    "session_id": f"SESSION-{src}-{dst}",
                    "protocol": event.protocol,
                    "source_asset_id": req_data["event"].source_asset_id,
                    "destination_asset_id": event.destination_asset_id,
                    "request_time": req_data["iso_timestamp"],
                    "response_time": event.timestamp,
                    "latency_ms": latency_ms,
                    "operation": event.operation,
                    "function_code": event.metadata.get("function_code"),
                    "function_name": event.metadata.get("function_name"),
                    "status": event.status,
                    "exception_code": event.metadata.get("exception_code"),
                    "matched": True
                }
            else:
                return {
                    "transaction_id": tid,
                    "session_id": f"SESSION-{src}-{dst}",
                    "protocol": event.protocol,
                    "source_asset_id": src,
                    "destination_asset_id": dst,
                    "request_time": event.timestamp,
                    "response_time": event.timestamp,
                    "latency_ms": 0.0,
                    "operation": event.operation,
                    "function_code": event.metadata.get("function_code"),
                    "function_name": event.metadata.get("function_name"),
                    "status": event.status,
                    "matched": False
                }

        self.cleanup_expired(now)
        return None

    def cleanup_expired(self, current_time: float):
        expired_keys = [
            k for k, v in self.pending_requests.items()
            if current_time - v["timestamp"] > self.timeout_seconds
        ]
        for k in expired_keys:
            self.pending_requests.pop(k, None)
            self.timed_out_transactions += 1
