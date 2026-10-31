import logging
import time
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from network_monitor.schemas.protocol_schema import ProtocolEventModel

logger = logging.getLogger(__name__)

class ProtocolSession:
    def __init__(self, session_id: str, src: str, dst: str, src_ip: str, dst_ip: str, src_port: int, dst_port: int, protocol: str):
        self.session_id = session_id
        self.source_asset_id = src
        self.destination_asset_id = dst
        self.source_ip = src_ip
        self.destination_ip = dst_ip
        self.source_port = src_port
        self.destination_port = dst_port
        self.protocol = protocol
        self.start_time = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        self.last_activity = self.start_time
        self.end_time = None
        self.status = "ACTIVE"
        self.request_count = 0
        self.response_count = 0
        self.error_count = 0
        self.exception_count = 0
        self.bytes_sent = 0
        self.bytes_received = 0
        self.total_latency = 0.0

    def to_dict(self) -> Dict[str, Any]:
        avg_lat = round(self.total_latency / max(self.response_count, 1), 2)
        return {
            "session_id": self.session_id,
            "source_asset_id": self.source_asset_id,
            "destination_asset_id": self.destination_asset_id,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "source_port": self.source_port,
            "destination_port": self.destination_port,
            "protocol": self.protocol,
            "start_time": self.start_time,
            "last_activity": self.last_activity,
            "status": self.status,
            "request_count": self.request_count,
            "response_count": self.response_count,
            "error_count": self.error_count,
            "exception_count": self.exception_count,
            "bytes_sent": self.bytes_sent,
            "bytes_received": self.bytes_received,
            "average_latency": avg_lat
        }

class SessionManager:
    def __init__(self, timeout_seconds: int = 300):
        self.sessions: Dict[str, ProtocolSession] = {}
        self.timeout_seconds = timeout_seconds

    def _get_key(self, src: str, dst: str, proto: str, port: int) -> str:
        return f"SESS-{src}-{dst}-{proto}-{port}"

    def update_session(self, event: ProtocolEventModel) -> ProtocolSession:
        src = event.source_asset_id or "UNKNOWN"
        dst = event.destination_asset_id or "UNKNOWN"
        key = self._get_key(src, dst, event.protocol, event.destination_port)

        now_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        if key not in self.sessions:
            sess = ProtocolSession(key, src, dst, event.source_ip, event.destination_ip, event.source_port, event.destination_port, event.protocol)
            self.sessions[key] = sess
        else:
            sess = self.sessions[key]

        sess.last_activity = now_str
        sess.status = "ACTIVE"

        if event.message_type == "REQUEST":
            sess.request_count += 1
            sess.bytes_sent += event.metadata.get("bytes", 128)
        else:
            sess.response_count += 1
            sess.bytes_received += event.metadata.get("bytes", 128)

        if event.status == "EXCEPTION":
            sess.exception_count += 1
        elif event.status in ["ERROR", "TIMEOUT"]:
            sess.error_count += 1

        if event.latency:
            sess.total_latency += event.latency

        return sess

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        return [s.to_dict() for s in self.sessions.values()]
