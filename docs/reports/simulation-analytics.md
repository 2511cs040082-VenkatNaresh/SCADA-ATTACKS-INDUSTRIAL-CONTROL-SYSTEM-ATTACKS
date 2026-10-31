# ICS-SHIELD Simulation Analytics & 13-Stage Visual Lifecycle Trace

## 1. Overview
The **Simulation Analytics Subsystem** (`/analytics/simulation`) provides visual benchmarking for synthetic scenario runs executed inside the isolated laboratory environment.

---

## 2. 13-Stage Lifecycle Trace
For any selected simulation run (e.g. `SIM-MULTISTAGE-001`), the analytics engine tracks and displays the complete lifecycle:

1. **NORMAL OPERATION**: Baseline SCADA process variables and healthy PLC states.
2. **SIMULATION START**: Scenario run initialized with reproducible seed (e.g. `1337`).
3. **CONTROLLED PROBLEM**: Synthetic payload injected (e.g. Modbus coil write FC05 on PLC-001).
4. **NETWORK ACTIVITY**: SCADA network packet headers captured.
5. **PROTOCOL ACTIVITY**: Deep packet inspection parses FC05 single coil write.
6. **TELEMETRY CHANGE**: Physical process variable perturbation observed.
7. **RULE DETECTION**: Rule R-MOD-005 triggers.
8. **BEHAVIORAL ANOMALY**: Statistical z-score anomaly (+3.9 σ) recorded.
9. **ML PREDICTION**: Isolation Forest model anomaly score (0.94) calculated.
10. **ALERT & INCIDENT**: SOC Alert `ALT-2026-981240` generated ➔ Incident `INC-2026-000001` opened.
11. **MITRE CONTEXT**: Mapped to Technique `T0855 (Unauthorized Command Message)`.
12. **RESPONSE & APPROVAL**: Response plan `RSP-2026-000001` approved and executed inside lab.
13. **RECOVERY & RESOLUTION**: Process variables normalized ➔ Incident closed ➔ Final evaluation matrix (`EXPECTED`=4, `OBSERVED`=4, `MISSING`=0, `UNEXPECTED`=0).

---

## 3. SLA Latency Metrics
Calculates actual pipeline latencies:
- **Detection Latency**: `28 ms`
- **Alert Creation Latency**: `40 ms`
- **Incident Creation Latency**: `55 ms`
- **Response Approval Latency**: `100 ms`
- **Response Execution Latency**: `110 ms`
- **Recovery Duration**: `25 s`
