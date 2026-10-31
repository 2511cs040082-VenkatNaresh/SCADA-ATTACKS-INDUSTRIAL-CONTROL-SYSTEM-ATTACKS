"""
Modbus/TCP Protocol Simulator
Generates synthetic Modbus TCP request/response events for simulated lab PLCs.
"""

import time
import uuid
from typing import Dict, Any
from .protocol_events import ProtocolEvent

class ModbusTCPSimulator:
    def simulate_read_holding_registers(self, src_id: str, src_ip: str, dst_id: str, dst_ip: str, start_reg: int, qty: int) -> ProtocolEvent:
        return ProtocolEvent(
            event_id=f"evt-modbus-{uuid.uuid4().hex[:8]}",
            timestamp=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            protocol="MODBUS/TCP",
            source=src_id,
            destination=dst_id,
            source_ip=src_ip,
            destination_ip=dst_ip,
            source_port=49152,
            destination_port=502,
            operation="READ_HOLDING_REGISTERS",
            register_address=start_reg,
            value=f"Qty: {qty}",
            status="SUCCESS",
            anomaly_flag=False,
            details={"function_code": 3, "qty": qty}
        )

    def simulate_write_coil(self, src_id: str, src_ip: str, dst_id: str, dst_ip: str, coil_reg: int, value: bool, anomaly: bool = False) -> ProtocolEvent:
        return ProtocolEvent(
            event_id=f"evt-modbus-{uuid.uuid4().hex[:8]}",
            timestamp=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            protocol="MODBUS/TCP",
            source=src_id,
            destination=dst_id,
            source_ip=src_ip,
            destination_ip=dst_ip,
            source_port=58210 if anomaly else 49153,
            destination_port=502,
            operation="WRITE_SINGLE_COIL",
            register_address=coil_reg,
            value=value,
            status="SUCCESS",
            anomaly_flag=anomaly,
            details={"function_code": 5, "raw_val": "0xFF00" if value else "0x0000"}
        )
