from enum import Enum
from typing import Optional, Union
from pydantic import BaseModel, Field

class DataQuality(str, Enum):
    GOOD = "GOOD"
    BAD = "BAD"
    UNCERTAIN = "UNCERTAIN"

class TelemetryPayload(BaseModel):
    metric: str
    value: Union[float, int]
    unit: str
    quality: DataQuality = DataQuality.GOOD
    source: Optional[str] = "SENSOR"
