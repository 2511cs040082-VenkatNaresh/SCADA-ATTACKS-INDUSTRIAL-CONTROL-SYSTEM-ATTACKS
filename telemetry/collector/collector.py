import logging
import asyncio
import time
from typing import List, Dict, Any
from telemetry.collector.connection import SimulatorConnection
from telemetry.collector.health import CollectorHealth
from telemetry.schemas.event_schema import EventEnvelope, EventType, EventPriority
from telemetry.normalization.normalizer import TelemetryNormalizer

logger = logging.getLogger(__name__)

class TelemetryCollector:
    """Collects real-time physical process telemetry and device state events from Phase 4 simulator."""

    def __init__(self, simulator_url: str = "http://localhost:8085", poll_interval: float = 1.0):
        self.connection = SimulatorConnection(simulator_url=simulator_url)
        self.health = CollectorHealth()
        self.poll_interval = poll_interval
        self._running = False

    async def poll_once(self) -> List[EventEnvelope]:
        """Polls simulator endpoints and generates standardized EventEnvelope records."""
        events: List[EventEnvelope] = []
        process_data = await self.connection.fetch_process_state()
        self.health.record_poll(process_data is not None)

        if process_data:
            # 1. Tank Level Telemetry
            events.append(TelemetryNormalizer.normalize_event({
                "event_type": "PROCESS",
                "source": {"asset_id": "PLC-001", "asset_type": "PLC"},
                "payload": {
                    "parameter": "tank_level",
                    "value": process_data.get("tank_level", 50.0),
                    "unit": "%",
                    "quality": "GOOD"
                }
            }))

            # 2. Temperature Telemetry
            events.append(TelemetryNormalizer.normalize_event({
                "event_type": "TELEMETRY",
                "source": {"asset_id": "SENSOR-T01", "asset_type": "SENSOR"},
                "payload": {
                    "metric": "temperature",
                    "value": process_data.get("temperature", 22.0),
                    "unit": "C",
                    "quality": "GOOD"
                }
            }))

            # 3. Pressure Telemetry
            events.append(TelemetryNormalizer.normalize_event({
                "event_type": "TELEMETRY",
                "source": {"asset_id": "SENSOR-P01", "asset_type": "SENSOR"},
                "payload": {
                    "metric": "pressure",
                    "value": process_data.get("pressure", 4.5),
                    "unit": "bar",
                    "quality": "GOOD"
                }
            }))

            # 4. Flow Rate Telemetry
            events.append(TelemetryNormalizer.normalize_event({
                "event_type": "TELEMETRY",
                "source": {"asset_id": "SENSOR-L01", "asset_type": "SENSOR"},
                "payload": {
                    "metric": "flow_rate",
                    "value": process_data.get("flow_rate", 120.0),
                    "unit": "L/min",
                    "quality": "GOOD"
                }
            }))

            # 5. Synthetic Modbus Protocol Event
            events.append(TelemetryNormalizer.normalize_event({
                "event_type": "PROTOCOL",
                "source": {"asset_id": "HMI-001", "asset_type": "HMI"},
                "payload": {
                    "protocol": "MODBUS/TCP",
                    "operation": "READ_HOLDING_REGISTERS",
                    "destination_asset": "PLC-001",
                    "register": 40001,
                    "status": "SUCCESS"
                }
            }))

            # 6. Synthetic Network Activity Event
            events.append(TelemetryNormalizer.normalize_event({
                "event_type": "NETWORK",
                "source": {"asset_id": "HMI-001", "asset_type": "HMI"},
                "payload": {
                    "destination_asset": "PLC-001",
                    "source_ip": "10.10.2.10",
                    "destination_ip": "10.10.3.10",
                    "source_port": 40001,
                    "destination_port": 502,
                    "protocol": "MODBUS/TCP",
                    "bytes": 128,
                    "direction": "INBOUND",
                    "status": "SUCCESS"
                }
            }))

        else:
            # Generate fallback simulated telemetry when lab is offline
            events.append(TelemetryNormalizer.normalize_event({
                "event_type": "TELEMETRY",
                "source": {"asset_id": "PLC-001", "asset_type": "PLC"},
                "payload": {
                    "metric": "temperature",
                    "value": 24.5,
                    "unit": "C",
                    "quality": "GOOD"
                }
            }))

        return events
