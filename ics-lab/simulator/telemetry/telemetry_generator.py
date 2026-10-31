"""
Telemetry Generator: Builds structured telemetry frames from physical process model updates.
"""

import time
import uuid
from typing import Dict, Any, List

class TelemetryGenerator:
    def generate_sensor_telemetry(self, sensor_id: str, metric_name: str, val: float, unit: str, quality: str = "GOOD") -> Dict[str, Any]:
        return {
            "event_id": f"tel-{uuid.uuid4().hex[:8]}",
            "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            "source": {
                "asset_id": sensor_id,
                "asset_type": "SENSOR"
            },
            "metric": metric_name,
            "value": val,
            "unit": unit,
            "quality": quality
        }
