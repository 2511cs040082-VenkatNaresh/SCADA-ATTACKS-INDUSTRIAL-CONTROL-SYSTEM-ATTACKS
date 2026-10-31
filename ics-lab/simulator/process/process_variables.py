from pydantic import BaseModel
from typing import Optional

class ProcessVariableConfig(BaseModel):
    min: float
    max: float
    initial: float
    normal_min: Optional[float] = None
    normal_max: Optional[float] = None
    unit: str

class WaterTreatmentVariables(BaseModel):
    tank_level: float = 50.0        # %
    temperature: float = 72.0       # °C
    pressure: float = 4.8           # bar
    flow_rate: float = 120.0        # L/min
    pump_speed: float = 1450.0      # RPM
    valve_position: float = 60.0    # %
    water_quality: float = 98.5     # Index 0-100
    motor_state: str = "RUNNING"
