from .base_device import BaseDevice
from typing import Dict, Any

class RTUDevice(BaseDevice):
    telemetry_channel: str = "DNP3_CH1"
    comm_status: str = "ACTIVE"
    digital_inputs: Dict[int, bool] = {0: True, 1: False}
    analog_inputs: Dict[int, float] = {10: 11.8, 11: 4.8}

    def get_state(self) -> Dict[str, Any]:
        state = super().get_state()
        state.update({
            "telemetry_channel": self.telemetry_channel,
            "comm_status": self.comm_status,
            "analog_inputs": self.analog_inputs
        })
        return state
