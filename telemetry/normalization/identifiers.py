import uuid
import hashlib

def ensure_uuid(event_id: str | None) -> str:
    """Preserves valid UUID or generates a new RFC 4122 UUID v4."""
    if not event_id:
        return str(uuid.uuid4())
    try:
        uuid.UUID(str(event_id))
        return str(event_id)
    except ValueError:
        return str(uuid.uuid4())

def generate_idempotency_key(asset_id: str, metric_or_param: str, timestamp_str: str, value: str | float) -> str:
    """Generates a deterministic hash for deduplicating identical event ticks."""
    raw = f"{asset_id}:{metric_or_param}:{timestamp_str}:{value}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

def normalize_asset_id(asset_id: str | None) -> str:
    """Normalizes asset identifier to uppercase standard asset code."""
    if not asset_id:
        return "UNKNOWN"
    return asset_id.strip().upper()
