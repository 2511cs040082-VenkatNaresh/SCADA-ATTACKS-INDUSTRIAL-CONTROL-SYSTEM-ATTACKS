from typing import Optional
from pydantic import BaseModel

class NetworkPayload(BaseModel):
    source_asset: Optional[str] = None
    destination_asset: str
    source_ip: Optional[str] = "10.10.0.0"
    destination_ip: Optional[str] = "10.10.0.0"
    source_port: int
    destination_port: int
    protocol: str = "MODBUS/TCP"
    bytes: int = 0
    direction: Optional[str] = "INBOUND"
    status: str = "SUCCESS"
