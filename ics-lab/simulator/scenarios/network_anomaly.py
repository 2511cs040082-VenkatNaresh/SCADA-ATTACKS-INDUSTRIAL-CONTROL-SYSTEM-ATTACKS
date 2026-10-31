from .base_scenario import BaseScenario
import time

class NetworkAnomalyScenario(BaseScenario):
    def __init__(self):
        super().__init__(
            name="ABNORMAL_REQUEST_RATE",
            description="Simulate high-frequency synthetic protocol request burst polling targeting SCADA Master",
            severity="HIGH"
        )

    async def start(self, engine):
        await super().start(engine)
        engine.state_manager.active_scenario = "ABNORMAL_REQUEST_RATE"

    async def stop(self, engine):
        await super().stop(engine)

    def generate_events(self, engine) -> list:
        events = []
        for i in range(5):
            evt = engine.modbus_sim.simulate_read_holding_registers(
                src_id="RTU-001", src_ip="10.10.30.10",
                dst_id="SCADA-SRV-01", dst_ip="10.10.10.10",
                start_reg=100 + i, qty=10
            )
            evt.anomaly_flag = True
            events.append(evt.dict())
        return events
