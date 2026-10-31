from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone

class NetworkFlowModel(BaseModel):
    flow_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
    source_asset_id: Optional[str] = None
    destination_asset_id: Optional[str] = None
    source_ip: str
    destination_ip: str
    source_port: int
    destination_port: int
    transport_protocol: str = "TCP"
    application_protocol: str = "MODBUS_TCP"
    direction: str = "INBOUND"
    packet_count: int = 1
    byte_count: int = 0
    first_seen: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
    last_seen: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"))
    duration: float = 0.0
    status: str = "ACTIVE"
    metadata: Dict[str, Any] = Field(default_factory=dict)
