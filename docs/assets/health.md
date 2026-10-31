# Asset Health Calculation Specification

## Health Formulation
Asset Health represents operational availability, communication stability, and telemetry freshness.

$$\text{HealthScore} = f(\text{TelemetryFreshness}, \text{DeviceState}, \text{ErrorRate})$$

### Threshold Criteria
- **`HEALTHY` (Score 100)**: Telemetry received within 15 seconds AND status is `ONLINE`.
- **`WARNING` / `DEGRADED` (Score 60)**: Telemetry delayed between 15s and 45s OR status is `WARNING` / `DEGRADED`.
- **`OFFLINE` (Score 0)**: No telemetry for >45 seconds OR status is `OFFLINE`.

> [!IMPORTANT]
> Asset Health measures **operational availability** and is distinct from **cybersecurity risk posture**. An asset can be 100% HEALTHY while carrying HIGH RISK.
