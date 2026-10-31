import logging
import time
from typing import Dict, Any, List
from datetime import datetime, timezone
from network_monitor.schemas.flow_schema import NetworkFlowModel
from network_monitor.schemas.protocol_schema import ProtocolEventModel

logger = logging.getLogger(__name__)

class FlowAggregator:
    """Aggregates discrete network and protocol events into persistent logical network flows."""

    def __init__(self):
        self.active_flows: Dict[str, NetworkFlowModel] = {}

    def _make_flow_key(self, src_ip: str, dst_ip: str, proto: str, port: int) -> str:
        return f"FLOW-{src_ip}:{dst_ip}:{proto}:{port}"

    def process_event(self, event: ProtocolEventModel) -> NetworkFlowModel:
        key = self._make_flow_key(event.source_ip, event.destination_ip, event.protocol, event.destination_port)
        now_str = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

        if key in self.active_flows:
            flow = self.active_flows[key]
            flow.packet_count += 1
            flow.byte_count += event.metadata.get("bytes", 128)
            flow.last_seen = now_str
            t1 = datetime.fromisoformat(flow.first_seen.replace("Z", "+00:00"))
            t2 = datetime.fromisoformat(now_str.replace("Z", "+00:00"))
            flow.duration = round((t2 - t1).total_seconds(), 2)
        else:
            flow = NetworkFlowModel(
                flow_id=key,
                timestamp=now_str,
                source_asset_id=event.source_asset_id,
                destination_asset_id=event.destination_asset_id,
                source_ip=event.source_ip,
                destination_ip=event.destination_ip,
                source_port=event.source_port,
                destination_port=event.destination_port,
                transport_protocol="TCP",
                application_protocol=event.protocol,
                direction=event.direction,
                packet_count=1,
                byte_count=128,
                first_seen=now_str,
                last_seen=now_str,
                duration=0.0,
                status="ACTIVE",
                metadata={"request_operation": event.operation}
            )
            self.active_flows[key] = flow

        return flow

    def get_all_flows(self) -> List[Dict[str, Any]]:
        return [f.model_dump() for f in self.active_flows.values()]
