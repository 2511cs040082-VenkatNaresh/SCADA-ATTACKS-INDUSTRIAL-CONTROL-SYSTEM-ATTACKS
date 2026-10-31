from pydantic import BaseModel
from typing import Optional, Dict, Any

class ProtocolEvent(BaseModel):
    event_id: str
    timestamp: str
    protocol: str
    source: str
    destination: str
    source_ip: str
    destination_ip: str
    source_port: int
    destination_port: int
    operation: str
    register_address: Optional[int] = None
    value: Optional[Any] = None
    status: str = "SUCCESS"
    anomaly_flag: bool = False
    details: Dict[str, Any] = {}
