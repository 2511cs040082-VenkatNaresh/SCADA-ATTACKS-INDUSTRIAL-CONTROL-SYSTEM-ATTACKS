from typing import Dict, Any
from network_monitor.protocols.base.base_adapter import BaseProtocolAdapter
from network_monitor.protocols.modbus.modbus_parser import ModbusParser
from network_monitor.schemas.protocol_schema import ProtocolEventModel

class ModbusProtocolAdapter(BaseProtocolAdapter):
    def __init__(self):
        super().__init__(protocol_name="MODBUS_TCP", default_port=502)

    def identify(self, raw_data: Dict[str, Any]) -> bool:
        proto = str(raw_data.get("protocol", "")).upper()
        port = raw_data.get("destination_port", raw_data.get("port", 0))
        return "MODBUS" in proto or port == 502

    def parse(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        payload = raw_data.get("payload", raw_data)
        return ModbusParser.parse_payload(payload)

    def normalize(self, raw_data: Dict[str, Any]) -> ProtocolEventModel:
        parsed = self.parse(raw_data)
        source = raw_data.get("source", {})
        if isinstance(source, str):
            src_asset = source
        else:
            src_asset = source.get("asset_id", "HMI-001")

        payload = raw_data.get("payload", {})
        dst_asset = payload.get("destination_asset", "PLC-001")

        status = "SUCCESS"
        if parsed.get("is_exception"):
            status = "EXCEPTION"
        elif raw_data.get("status") in ["ERROR", "TIMEOUT", "EXCEPTION"]:
            status = raw_data.get("status")

        return ProtocolEventModel(
            protocol="MODBUS_TCP",
            timestamp=raw_data.get("timestamp"),
            source_asset_id=src_asset,
            destination_asset_id=dst_asset,
            source_ip=payload.get("source_ip", "10.10.2.10"),
            destination_ip=payload.get("destination_ip", "10.10.3.10"),
            source_port=payload.get("source_port", 40001),
            destination_port=payload.get("destination_port", 502),
            direction=payload.get("direction", "INBOUND"),
            message_type=payload.get("message_type", "REQUEST"),
            operation=parsed.get("operation", "READ_HOLDING_REGISTERS"),
            transaction_id=parsed.get("transaction_id"),
            status=status,
            latency=raw_data.get("latency", 0.8),
            metadata={
                "unit_id": parsed.get("unit_id"),
                "function_code": parsed.get("function_code"),
                "function_name": parsed.get("function_name"),
                "address": parsed.get("address"),
                "quantity": parsed.get("quantity"),
                "values": parsed.get("values"),
                "exception_code": parsed.get("exception_code"),
                "exception_name": parsed.get("exception_name")
            }
        )

    def extract_metrics(self, event: ProtocolEventModel) -> Dict[str, Any]:
        return {
            "protocol": "MODBUS_TCP",
            "function_code": event.metadata.get("function_code"),
            "status": event.status,
            "latency": event.latency
        }
