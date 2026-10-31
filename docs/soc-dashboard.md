# ICS-SHIELD SOC Dashboard Documentation

## 1. Overview
The **SCADA & ICS Operational SOC Dashboard** (`/dashboard`) provides a real-time, zero-hardcoding overview of the entire industrial control system security posture.

## 2. Telemetry Widgets
The dashboard consumes real API data across 14 multi-domain widgets:
1. **Critical Alerts**: Real-time count of active critical severity alerts.
2. **Active Incidents**: Open correlated case count.
3. **Asset Inventory & Health**: Purdue Level 0-3 assets count and online/degraded ratio.
4. **Network Activity**: Industrial SCADA packet/flow throughput.
5. **Protocol Activity**: Deep packet inspection transaction breakdown.
6. **Process Health**: Water treatment loop physical sensor readings (tank level, temperature, pressure, flow rate).
7. **Rule Detection Activity**: Deterministic rule triggers count.
8. **Behavioral Anomalies**: Z-score baseline statistical anomalies count.
9. **Machine Learning Predictions**: Isolation forest anomaly predictions.
10. **MITRE ATT&CK Coverage**: Technique coverage percentage.
11. **Response Activity**: Active response plans & pending approval count.
12. **Simulation Laboratory Status**: Live simulation run status & environment tag.
13. **WebSocket Connection**: Real-time WebSocket event bus status.
14. **System & Database Health**: MySQL connection pool & backend status.

## 3. Global Real-Time Security Timeline
Displays a live stream of system events via WebSocket:
- Asset discovery & status changes
- SCADA telemetry ingestion
- Network flow observations
- Protocol transactions
- Rule, Behavioral & ML detections
- SOC Alerts & Incidents
- Response recommendations & execution
- Simulation scenario events

No fake metrics or hardcoded counts are used. When backend data is absent, the dashboard displays `"No data available"`.
