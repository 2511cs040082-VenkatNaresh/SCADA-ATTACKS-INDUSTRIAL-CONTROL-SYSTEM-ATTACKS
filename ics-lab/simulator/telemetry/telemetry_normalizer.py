"""
Telemetry Normalizer: Converts raw simulator readings to backend REST schema.
"""

from typing import Dict, Any

class TelemetryNormalizer:
    @staticmethod
    def normalize_reading(raw_reading: Dict[str, Any], metric_id_map: Dict[str, int]) -> Dict[str, Any]:
        metric_name = raw_reading.get("metric")
        metric_id = metric_id_map.get(metric_name, 1)

        return {
            "metricId": metric_id,
            "value": raw_reading.get("value", 0.0),
            "quality": raw_reading.get("quality", "GOOD"),
            "source": raw_reading.get("source", {}).get("asset_id", "SENSOR"),
            "timestamp": raw_reading.get("timestamp")
        }
