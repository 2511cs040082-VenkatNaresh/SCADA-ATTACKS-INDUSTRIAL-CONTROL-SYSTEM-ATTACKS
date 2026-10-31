from typing import Optional, Union
from pydantic import BaseModel

class ProtocolPayload(BaseModel):
    protocol: str = "MODBUS/TCP"
    operation: str
    destination_asset: str
    register: Optional[Union[int, str]] = None
    value: Optional[Union[int, float, str]] = None
    status: str = "SUCCESS"
