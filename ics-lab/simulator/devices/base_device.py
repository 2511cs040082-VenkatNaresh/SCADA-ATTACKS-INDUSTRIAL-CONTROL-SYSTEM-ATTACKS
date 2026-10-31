from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time

class BaseDevice(BaseModel):
    id: str
    name: str
    type: str
    ip_address: str
    mac_address: str
    status: str = "ONLINE"
    zone: str = "FIELD"
    vendor: Optional[str] = None
    model: Optional[str] = None
    firmware: Optional[str] = None
    last_seen: Optional[float] = None
    metadata: Dict[str, Any] = {}

    def get_state(self) -> Dict[str, Any]:
        return {
            "device_id": self.id,
            "name": self.name,
            "type": self.type,
            "ip_address": self.ip_address,
            "status": self.status,
            "zone": self.zone,
            "last_seen": self.last_seen or time.time(),
            "metadata": self.metadata
        }
