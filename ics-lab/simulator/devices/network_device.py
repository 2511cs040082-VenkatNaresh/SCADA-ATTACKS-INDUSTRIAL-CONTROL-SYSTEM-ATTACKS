from .base_device import BaseDevice
from typing import Dict, Any

class NetworkDevice(BaseDevice):
    active_ports: int = 24
    dropped_packets: int = 0

    def get_state(self) -> Dict[str, Any]:
        state = super().get_state()
        state.update({
            "active_ports": self.active_ports,
            "dropped_packets": self.dropped_packets
        })
        return state
