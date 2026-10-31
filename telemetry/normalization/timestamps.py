from datetime import datetime, timezone
import dateutil.parser

def normalize_timestamp(ts: str | float | int | datetime | None) -> str:
    """
    Parses any incoming timestamp format and converts it strictly to ISO-8601 UTC string.
    Example: 2026-09-24T03:55:00.000Z
    """
    if ts is None:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    if isinstance(ts, (int, float)):
        # Epoch timestamp in seconds or milliseconds
        if ts > 1e11:  # Milliseconds
            ts = ts / 1000.0
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        return dt.isoformat().replace("+00:00", "Z")

    if isinstance(ts, datetime):
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        else:
            ts = ts.astimezone(timezone.utc)
        return ts.isoformat().replace("+00:00", "Z")

    if isinstance(ts, str):
        try:
            dt = dateutil.parser.parse(ts)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            else:
                dt = dt.astimezone(timezone.utc)
            return dt.isoformat().replace("+00:00", "Z")
        except Exception:
            return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
