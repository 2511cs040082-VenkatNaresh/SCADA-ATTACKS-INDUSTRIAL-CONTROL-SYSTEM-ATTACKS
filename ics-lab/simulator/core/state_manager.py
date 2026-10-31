"""
State Manager: Maintains live laboratory device states and physical process variable states.
"""

from typing import Dict, Any

class StateManager:
    def __init__(self):
        self.devices: Dict[str, Dict[str, Any]] = {}
        self.process_state: Dict[str, Any] = {
            "mode": "NORMAL",
            "variables": {}
        }
        self.active_scenario: str = "NORMAL_OPERATION"

    def update_device_state(self, device_id: str, updates: Dict[str, Any]):
        if device_id not in self.devices:
            self.devices[device_id] = {"device_id": device_id, "status": "ONLINE"}
        self.devices[device_id].update(updates)

    def get_device_state(self, device_id: str) -> Dict[str, Any]:
        return self.devices.get(device_id, {})

    def update_process_variable(self, var_name: str, val: float):
        self.process_state["variables"][var_name] = val

    def get_process_state(self) -> Dict[str, Any]:
        return self.process_state
