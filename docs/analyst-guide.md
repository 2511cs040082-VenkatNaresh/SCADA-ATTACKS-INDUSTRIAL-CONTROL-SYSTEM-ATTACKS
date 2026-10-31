# ICS-SHIELD — Analyst Investigation & Response Guide

## Incident Investigation Workflow
1. **Alert Triage**: When an alert fires in `/alerts`, inspect the detection sources (Rule, Behavioral Z-score, ML Isolation Forest).
2. **Case Creation**: Escalated alerts auto-correlate into incident cases (`INC-YYYY-XXXXXX`).
3. **Timeline Analysis**: Use the incident timeline view to inspect chronological telemetry changes, network flows, and Modbus function code overrides.
4. **MITRE Context**: Map observed evidence to MITRE ATT&CK for ICS Techniques (e.g. `T0855` Unauthorized Command Message).
5. **Response Approval**: Review recommended playbooks (e.g., `SIMULATE_NETWORK_ISOLATION`). Submit approval request for Admin authorization.
6. **Simulated Action Execution**: Execute simulated containment inside the laboratory sandbox. Verify SHA-256 evidence signature.
7. **Resolution**: Update incident status to `RESOLVED` and generate PDF audit report.
