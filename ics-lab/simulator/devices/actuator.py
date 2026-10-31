from .base_device import BaseDevice
from typing import Dict, Any

class ActuatorDevice(BaseDevice):
    state: str = "RUNNING"
    position_pct: float = 60.0
    command: str = "AUTO"

    def get_state(self) -> Dict[str, Any]:
        state = super().get_state()
        state.update({
            "state": self.state,
            "position_pct": self.position_pct,
            "command": self.command
        })
        return state
