UNIT_MAP = {
    # Temperature
    "CELSIUS": "C",
    "DEGC": "C",
    "°C": "C",
    "DEG_C": "C",
    "FAHRENHEIT": "F",
    "°F": "F",

    # Pressure
    "BAR": "bar",
    "BARS": "bar",
    "PSI": "psi",
    "KPA": "kPa",

    # Flow
    "L/MIN": "L/min",
    "LPM": "L/min",
    "LITERS/MIN": "L/min",

    # Level / Percentage
    "%": "%",
    "PCT": "%",
    "PERCENT": "%",

    # Electrical
    "V": "V",
    "VOLTS": "V",
    "A": "A",
    "AMPS": "A",

    # Speed
    "RPM": "RPM",
    "REV/MIN": "RPM"
}

def normalize_unit(unit_raw: str | None) -> str:
    """Standardizes metric units (C, bar, L/min, %, V, A, RPM)."""
    if not unit_raw:
        return ""
    cleaned = unit_raw.strip().upper()
    return UNIT_MAP.get(cleaned, unit_raw.strip())

def convert_unit_if_needed(value: float, from_unit: str, to_unit: str) -> tuple[float, str]:
    """Converts metric value to standard baseline unit if necessary."""
    from_std = normalize_unit(from_unit)
    to_std = normalize_unit(to_unit)

    if from_std == "F" and to_std == "C":
        return round((value - 32.0) * (5.0 / 9.0), 2), "C"

    if from_std == "psi" and to_std == "bar":
        return round(value * 0.0689476, 2), "bar"

    return value, from_std
