"""
Simulated PLC Closed-Loop Control Logic
Adjusts actuators dynamically based on process variable feedback.
"""

from .process_variables import WaterTreatmentVariables

class ControlLogic:
    def execute_loop(self, vars: WaterTreatmentVariables):
        # 1. Tank level feedback control
        if vars.tank_level > 85.0:
            vars.valve_position = max(10.0, vars.valve_position - 2.0)
            vars.pump_speed = min(2800.0, vars.pump_speed + 50.0)
        elif vars.tank_level < 30.0:
            vars.valve_position = min(90.0, vars.valve_position + 2.0)
            vars.pump_speed = max(800.0, vars.pump_speed - 50.0)

        # 2. Temperature stabilization
        if vars.temperature > 80.0:
            # Cooling fan kicks in
            vars.temperature = max(68.0, vars.temperature - 0.4)
        elif vars.temperature < 68.0:
            vars.temperature = min(78.0, vars.temperature + 0.3)
