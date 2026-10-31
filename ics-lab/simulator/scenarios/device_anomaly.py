from .base_scenario import BaseScenario
import time

class DeviceAnomalyScenario(BaseScenario):
    def __init__(self):
        super().__init__(
            name="DEVICE_OFFLINE",
            description="Simulate PLC-002 transitioning from ONLINE to WARNING to OFFLINE",
            severity="HIGH"
        )

    async def start(self, engine):
        await super().start(engine)
        engine.state_manager.active_scenario = "DEVICE_OFFLINE"
        engine.state_manager.update_device_state("PLC-002", {"status": "OFFLINE"})

    async def stop(self, engine):
        await super().stop(engine)
        engine.state_manager.update_device_state("PLC-002", {"status": "ONLINE"})

    def generate_events(self, engine) -> list:
        event = {
            "event_id": f"evt-dev-off-{int(time.time())}",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            "event_type": "DEVICE_ANOMALY",
            "source": {"asset_id": "PLC-002", "asset_type": "PLC"},
            "old_status": "ONLINE",
            "new_status": "OFFLINE",
            "reason": "Simulated Heartbeat Timeout",
            "anomaly_flag": True
        }
        return [event]
