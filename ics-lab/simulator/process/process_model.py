"""
Industrial Water Treatment Physical Process Differential Model
Computes realistic continuous physical variable transitions with small Gaussian noise.
"""

import random
from .process_variables import WaterTreatmentVariables
from .control_logic import ControlLogic
from .process_state import ProcessMode

class WaterTreatmentProcessModel:
    def __init__(self):
        self.vars = WaterTreatmentVariables()
        self.control_logic = ControlLogic()
        self.mode = ProcessMode.NORMAL

    def step(self, dt: float = 1.0):
        # 1. Execute simulated PLC feedback control logic
        self.control_logic.execute_loop(self.vars)

        # 2. Physics Relationships:
        # Flow rate depends on pump speed & valve position
        target_flow = (self.vars.pump_speed / 3000.0) * (self.vars.valve_position / 100.0) * 220.0
        self.vars.flow_rate += (target_flow - self.vars.flow_rate) * 0.2

        # Pressure depends on flow rate & valve constriction
        target_pressure = (self.vars.flow_rate / 200.0) * 6.5 + (1.0 - self.vars.valve_position / 100.0) * 2.0
        self.vars.pressure += (target_pressure - self.vars.pressure) * 0.15

        # Tank level changes based on net flow
        net_flow = (self.vars.flow_rate - 120.0) * 0.05
        self.vars.tank_level = max(0.0, min(100.0, self.vars.tank_level + net_flow * dt))

        # Add small realistic measurement noise (+/- 0.25%)
        noise = random.gauss(0, 0.05)
        self.vars.temperature = round(max(20.0, min(100.0, self.vars.temperature + noise)), 2)
        self.vars.pressure = round(max(0.0, min(10.0, self.vars.pressure + noise * 0.02)), 2)
        self.vars.flow_rate = round(max(0.0, min(250.0, self.vars.flow_rate + noise * 0.5)), 2)
        self.vars.tank_level = round(max(0.0, min(100.0, self.vars.tank_level)), 2)

        return self.vars
