from enum import Enum
from typing import Union, Optional
from pydantic import BaseModel
from telemetry.schemas.telemetry_schema import DataQuality

class ProcessParameter(str, Enum):
    TEMPERATURE = "temperature"
    PRESSURE = "pressure"
    FLOW_RATE = "flow_rate"
    TANK_LEVEL = "tank_level"
    PUMP_STATE = "pump_state"
    VALVE_STATE = "valve_state"
    MOTOR_STATE = "motor_state"
    WATER_QUALITY = "water_quality"

class ProcessPayload(BaseModel):
    parameter: str
    value: Union[float, int, str]
    unit: Optional[str] = ""
    quality: DataQuality = DataQuality.GOOD
