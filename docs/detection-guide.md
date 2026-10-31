# ICS-SHIELD — Multi-Layer Detection Pipeline Guide

## Detection Tiers
1. **Rule Engine**: Evaluates SCADA protocol commands (e.g. Modbus FC05 Write Coil) against unbaselined whitelist rules.
2. **Behavioral Engine**: Calculates statistical rolling Z-scores on continuous process variables (Water Tank Level, Pressure). Flags anomalies when $|Z| > 3.0$.
3. **ML Engine**: Runs Python Isolation Forest model inference on multi-variate telemetry features, computing normalized anomaly confidence scores (0.00 to 1.00).
