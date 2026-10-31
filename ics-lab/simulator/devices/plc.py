"""
PLC Simulator: Simulates Modbus data areas (Coils, Discrete Inputs, Holding Registers, Input Registers) & Scan Cycles.
"""

from typing import Dict, Any, List
from .base_device import BaseDevice

class PLCDevice(BaseDevice):
    mode: str = "RUN"
    scan_cycle_ms: float = 10.0
    coils: Dict[int, bool] = {}
    holding_registers: Dict[int, int] = {}
    discrete_inputs: Dict[int, bool] = {}
    input_registers: Dict[int, int] = {}

    def __init__(self, **data):
        super().__init__(**data)
        # Initialize default registers
        self.coils = {0: True, 1: True, 2: False, 3: True}
        self.holding_registers = {100: 1450, 101: 60, 102: 48, 103: 72}
        self.input_registers = {200: 724, 201: 480, 202: 1204}

    def read_holding_register(self, address: int) -> int:
        return self.holding_registers.get(address, 0)

    def write_holding_register(self, address: int, value: int):
        self.holding_registers[address] = value

    def write_coil(self, address: int, value: bool):
        self.coils[address] = value

    def get_state(self) -> Dict[str, Any]:
        state = super().get_state()
        state.update({
            "mode": self.mode,
            "scan_cycle_ms": self.scan_cycle_ms,
            "coils": self.coils,
            "holding_registers": self.holding_registers,
            "cpu_usage": 32,
            "memory_usage": 45
        })
        return state
