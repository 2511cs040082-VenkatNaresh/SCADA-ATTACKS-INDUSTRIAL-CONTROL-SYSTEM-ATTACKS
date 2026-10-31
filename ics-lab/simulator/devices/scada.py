from .base_device import BaseDevice
from typing import Dict, Any

class SCADADevice(BaseDevice):
    active_connections: int = 12
    telemetry_rate_pps: int = 135

    def get_state(self) -> Dict[str, Any]:
        state = super().get_state()
        state.update({
            "active_connections": self.active_connections,
            "telemetry_rate_pps": self.telemetry_rate_pps,
            "role": "SCADA Master"
        })
        return state
