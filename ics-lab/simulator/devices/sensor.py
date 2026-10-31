from .base_device import BaseDevice
from typing import Dict, Any

class SensorDevice(BaseDevice):
    metric_name: str = "temperature"
    current_value: float = 72.0
    unit: str = "°C"

    def get_state(self) -> Dict[str, Any]:
        state = super().get_state()
        state.update({
            "metric_name": self.metric_name,
            "current_value": self.current_value,
            "unit": self.unit
        })
        return state
