from .base_scenario import BaseScenario
import time

class ProcessAnomalyScenario(BaseScenario):
    def __init__(self):
        super().__init__(
            name="PROCESS_VALUE_ANOMALY",
            description="Simulated physical process variable drift exceeding safety thresholds (Temperature > 95°C)",
            severity="HIGH"
        )

    async def start(self, engine):
        await super().start(engine)
        engine.state_manager.active_scenario = "PROCESS_VALUE_ANOMALY"

    async def stop(self, engine):
        await super().stop(engine)

    def generate_events(self, engine) -> list:
        # Gradually drift reactor temperature upwards in simulation
        engine.process_model.vars.temperature += 2.5
        event = {
            "event_id": f"evt-proc-anom-{int(time.time())}",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            "event_type": "PROCESS_ANOMALY",
            "source": {"asset_id": "SENSOR-001", "asset_type": "SENSOR"},
            "metric": "temperature",
            "expected_range": "65 - 82 °C",
            "actual_value": engine.process_model.vars.temperature,
            "anomaly_flag": True
        }
        return [event]
