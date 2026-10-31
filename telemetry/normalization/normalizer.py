from typing import Dict, Any
from telemetry.schemas.event_schema import EventEnvelope, EventType, EventPriority
from telemetry.normalization.timestamps import normalize_timestamp
from telemetry.normalization.units import normalize_unit
from telemetry.normalization.identifiers import ensure_uuid, normalize_asset_id

METRIC_NAME_MAP = {
    "TEMP": "temperature",
    "TEMPERATURE_C": "temperature",
    "TEMP_VAL": "temperature",
    "PRESS": "pressure",
    "PRESSURE_BAR": "pressure",
    "FLOW": "flow_rate",
    "FLOW_LPM": "flow_rate",
    "LEVEL": "tank_level",
    "TANK_LEVEL_PCT": "tank_level",
    "PUMP": "pump_speed",
    "PUMP_RPM": "pump_speed",
    "VALVE": "valve_position",
    "VALVE_PCT": "valve_position"
}

EVENT_TYPE_MAP = {
    "TELEMETRY": EventType.TELEMETRY,
    "PROCESS": EventType.PROCESS,
    "DEVICE": EventType.DEVICE,
    "NETWORK": EventType.NETWORK,
    "PROTOCOL": EventType.PROTOCOL,
    "SECURITY": EventType.SECURITY,
    "AUTHENTICATION": EventType.AUTHENTICATION,
    "CONFIGURATION": EventType.CONFIGURATION,
    "SIMULATION": EventType.SIMULATION,
    "SYSTEM": EventType.SYSTEM
}

class TelemetryNormalizer:
    @staticmethod
    def normalize_event(raw_data: Dict[str, Any]) -> EventEnvelope:
        """Standardizes raw incoming events into a clean EventEnvelope."""
        # 1. Normalize Event ID
        event_id = ensure_uuid(raw_data.get("event_id"))

        # 2. Normalize Timestamp
        ts = normalize_timestamp(raw_data.get("timestamp"))

        # 3. Normalize Event Type
        type_str = str(raw_data.get("event_type", "TELEMETRY")).upper()
        event_type = EVENT_TYPE_MAP.get(type_str, EventType.TELEMETRY)

        # 4. Normalize Source
        source_raw = raw_data.get("source", {})
        if isinstance(source_raw, str):
            asset_id = normalize_asset_id(source_raw)
            asset_type = "UNKNOWN"
        else:
            asset_id = normalize_asset_id(source_raw.get("asset_id"))
            asset_type = str(source_raw.get("asset_type", "UNKNOWN")).upper()

        # 5. Determine Priority
        priority_str = str(raw_data.get("priority", "NORMAL")).upper()
        if event_type == EventType.SECURITY:
            priority = EventPriority.HIGH
        elif priority_str in [p.value for p in EventPriority]:
            priority = EventPriority(priority_str)
        else:
            priority = EventPriority.NORMAL

        # 6. Normalize Payload
        payload = raw_data.get("payload", {})
        if not isinstance(payload, dict):
            payload = {}

        if "metric" in payload:
            raw_m = str(payload["metric"]).upper()
            payload["metric"] = METRIC_NAME_MAP.get(raw_m, payload["metric"].lower())

        if "parameter" in payload:
            raw_p = str(payload["parameter"]).upper()
            payload["parameter"] = METRIC_NAME_MAP.get(raw_p, payload["parameter"].lower())

        if "unit" in payload:
            payload["unit"] = normalize_unit(payload["unit"])

        if "quality" not in payload:
            payload["quality"] = "GOOD"

        # 7. Metadata
        metadata = raw_data.get("metadata", {})
        if not isinstance(metadata, dict):
            metadata = {}
        metadata.setdefault("simulation", True)
        metadata.setdefault("normalized_by", "ICS-SHIELD TelemetryNormalizer v1.0")

        return EventEnvelope(
            event_id=event_id,
            event_type=event_type,
            timestamp=ts,
            source={"asset_id": asset_id, "asset_type": asset_type},
            environment=raw_data.get("environment", "LAB"),
            priority=priority,
            payload=payload,
            metadata=metadata,
            correlation_id=raw_data.get("correlation_id")
        )
