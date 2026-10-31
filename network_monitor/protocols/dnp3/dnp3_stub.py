from network_monitor.protocols.base.base_adapter import BaseProtocolAdapter
from network_monitor.schemas.protocol_schema import ProtocolEventModel
from typing import Dict, Any

class DNP3ProtocolStub(BaseProtocolAdapter):
    def __init__(self):
        super().__init__(protocol_name="DNP3", default_port=20000)

    def identify(self, raw_data: Dict[str, Any]) -> bool:
        return "DNP3" in str(raw_data.get("protocol", "")).upper()

    def parse(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        return {"operation": "DNP3_UNSOLICITED_RESPONSE", "status": "STUB_READY"}

    def normalize(self, raw_data: Dict[str, Any]) -> ProtocolEventModel:
        return ProtocolEventModel(
            protocol="DNP3",
            source_asset_id=raw_data.get("source", {}).get("asset_id", "RTU-001"),
            destination_asset_id="PLC-001",
            source_ip="10.10.3.20",
            destination_ip="10.10.3.10",
            source_port=20000,
            destination_port=20000,
            operation="DNP3_READ",
            status="ADAPTER_READY"
        )

    def extract_metrics(self, event: ProtocolEventModel) -> Dict[str, Any]:
        return {"protocol": "DNP3", "status": "STUB"}
