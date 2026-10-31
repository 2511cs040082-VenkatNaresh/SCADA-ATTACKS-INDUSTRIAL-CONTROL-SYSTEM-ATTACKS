from .base_scenario import BaseScenario
import time

class NormalOperationScenario(BaseScenario):
    def __init__(self):
        super().__init__(
            name="NORMAL_OPERATION",
            description="Baseline normal industrial water treatment control loop operation",
            severity="LOW"
        )

    async def start(self, engine):
        await super().start(engine)
        engine.state_manager.active_scenario = "NORMAL_OPERATION"

    async def stop(self, engine):
        await super().stop(engine)

    def generate_events(self, engine) -> list:
        # Generate baseline periodic Modbus TCP poll from HMI -> PLC-001
        event = engine.modbus_sim.simulate_read_holding_registers(
            src_id="HMI-001", src_ip="10.10.20.10",
            dst_id="PLC-001", dst_ip="10.10.20.11",
            start_reg=100, qty=4
        )
        return [event.dict()]
