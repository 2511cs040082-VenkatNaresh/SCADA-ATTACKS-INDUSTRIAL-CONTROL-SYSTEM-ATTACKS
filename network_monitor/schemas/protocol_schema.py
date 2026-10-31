from typing import Optional, Dict, Any, Union
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone

class ProtocolEventModel(BaseModel):
    protocol_event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    protocol: str = "MODBUS_TCP"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
    source_asset_id: Optional[str] = None
    destination_asset_id: Optional[str] = None
    source_ip: str
    destination_ip: str
    source_port: int
    destination_port: int
    direction: str = "INBOUND"
    message_type: str = "REQUEST"  # REQUEST, RESPONSE, UNASSIGNED
    operation: str = "READ_HOLDING_REGISTERS"
    transaction_id: Optional[Union[int, str]] = None
    request_id: Optional[str] = None
    response_id: Optional[str] = None
    status: str = "SUCCESS"  # SUCCESS, ERROR, EXCEPTION, TIMEOUT, UNKNOWN
    latency: Optional[float] = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)
