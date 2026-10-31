# ICS-SHIELD Standard Report Types Reference

ICS-SHIELD supports 16 standard report definitions:

1. `EXECUTIVE_SECURITY_SUMMARY`: High-level executive overview of SCADA posture, critical alerts, and active incident trends.
2. `SOC_OPERATIONS_REPORT`: Operational report tracking SOC analyst workload, triage SLA performance, and shift handover metrics.
3. `INCIDENT_REPORT`: Deep forensic investigation case audit for resolved and active incidents with SHA-256 evidence logs.
4. `ALERT_ANALYTICS_REPORT`: Alert volume, severity distribution, false positive rates, suppression counts, and MTTD/MTTA/MTTR metrics.
5. `DETECTION_EFFECTIVENESS_REPORT`: Rule Engine, Behavioral Engine, and ML Model trigger rates and conversion to alerts/incidents.
6. `ASSET_HEALTH_REPORT`: Purdue Level 0-3 asset inventory, online status, firmware, and telemetry freshness.
7. `ASSET_RISK_REPORT`: Asset risk scores, vulnerability exposures, and unmitigated threat vectors.
8. `NETWORK_ACTIVITY_REPORT`: SCADA network flow volumes, bandwidth throughput, and session statistics.
9. `PROTOCOL_ACTIVITY_REPORT`: Modbus/TCP, DNP3, S7comm, and IEC 104 transaction counts and exception response rates.
10. `PROCESS_HEALTH_REPORT`: Physical process variable trends (tank level, flow rate, header pressure, water temperature).
11. `MITRE_COVERAGE_REPORT`: MITRE ATT&CK for ICS (v14) tactic and technique coverage breakdown.
12. `RESPONSE_EFFECTIVENESS_REPORT`: Defense playbook execution counts, approval durations, and rollback rates.
13. `SIMULATION_VALIDATION_REPORT`: Phase 15 attack simulation run results and Expected vs Observed evaluation matrix.
14. `ML_ANALYTICS_REPORT`: Isolation forest ML predictions, anomaly score calibration, and feature drift metrics.
15. `SYSTEM_HEALTH_REPORT`: System node uptime, MySQL pool status, and telemetry ingest rates.
16. `CUSTOM_SECURITY_REPORT`: Custom user-defined security report with saved parameters and filters.
