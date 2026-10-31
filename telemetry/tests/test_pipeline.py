import unittest
from telemetry.schemas.event_schema import EventEnvelope, EventType, EventPriority
from telemetry.normalization.normalizer import TelemetryNormalizer
from telemetry.normalization.units import normalize_unit
from telemetry.normalization.timestamps import normalize_timestamp

class TestTelemetryPipeline(unittest.TestCase):
    def test_unit_normalization(self):
        self.assertEqual(normalize_unit("CELSIUS"), "C")
        self.assertEqual(normalize_unit("°C"), "C")
        self.assertEqual(normalize_unit("BAR"), "bar")
        self.assertEqual(normalize_unit("L/MIN"), "L/min")

    def test_timestamp_normalization(self):
        ts = normalize_timestamp("2026-09-24 04:00:00")
        self.assertTrue(ts.endswith("Z"))
        self.assertIn("2026-09-24", ts)

    def test_event_normalizer(self):
        raw = {
            "event_type": "TELEMETRY",
            "source": {"asset_id": "plc-001"},
            "payload": {
                "metric": "TEMP",
                "value": 24.5,
                "unit": "CELSIUS"
            }
        }
        event = TelemetryNormalizer.normalize_event(raw)
        self.assertEqual(event.event_type, EventType.TELEMETRY)
        self.assertEqual(event.source.asset_id, "PLC-001")
        self.assertEqual(event.payload["metric"], "temperature")
        self.assertEqual(event.payload["unit"], "C")

if __name__ == "__main__":
    unittest.main()
