from .base_device import BaseDevice
from typing import Dict, Any

class HMIDevice(BaseDevice):
    active_screen: str = "OVERVIEW_DIAGRAM"
    alarm_count: int = 0

    def get_state(self) -> Dict[str, Any]:
        state = super().get_state()
        state.update({
            "active_screen": self.active_screen,
            "alarm_count": self.alarm_count
        })
        return state
