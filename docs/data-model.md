# ICS-SHIELD — Database Data Model & Entity Schema

## Core Relational Tables
- `users`: User profiles, bcrypt password hashes, roles, and status flags.
- `assets`: Discovered PLCs, RTUs, HMIs, IP addresses, criticality, and health scores.
- `telemetry_readings`: Process variable time-series data with quality flags.
- `protocol_events`: SCADA protocol transactions (Modbus function codes, coils, registers).
- `detection_results`: Rule, Behavioral Z-score, and ML Isolation Forest detections.
- `alerts`: Correlated alert records with priority routing and deduplication tags.
- `incidents`: Case workspace records, severity, status, and assignment.
- `response_plans`: Recommended response playbooks, approvals, and execution logs.
- `simulation_runs`: Preflight checks, scenarios, state machines, and evaluation matrices.
- `reports`: PDF/CSV report definitions and export SHA-256 signatures.
- `audit_logs`: Immutable transaction log catalog.
