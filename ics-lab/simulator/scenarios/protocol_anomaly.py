from .base_scenario import BaseScenario

class ProtocolAnomalyScenario(BaseScenario):
    def __init__(self):
        super().__init__(
            name="PROTOCOL_ANOMALY",
            description="Simulate unauthorized Modbus FC06 write coil command execution targeting PLC-001",
            severity="CRITICAL"
        )

    async def start(self, engine):
        await super().start(engine)
        engine.state_manager.active_scenario = "PROTOCOL_ANOMALY"

    async def stop(self, engine):
        await super().stop(engine)

    def generate_events(self, engine) -> list:
        event = engine.modbus_sim.simulate_write_coil(
            src_id="ENG-WS-001", src_ip="10.10.10.20",
            dst_id="PLC-001", dst_ip="10.10.20.11",
            coil_reg=4, value=True, anomaly=True
        )
        return [event.dict()]
