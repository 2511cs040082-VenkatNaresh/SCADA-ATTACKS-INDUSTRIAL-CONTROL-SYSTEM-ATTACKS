# ICS-SHIELD — Operational Limitations & Safety Restrictions

## Explicit Platform Boundaries
- **No Real PLC/SCADA Exploitation**: ICS-SHIELD does NOT contain real-world attack exploitation tools. All attack scenarios operate strictly on synthetic laboratory models (`LAB_SIMULATION`).
- **No Unrestricted OT Network Control**: Response execution is restricted to safe, allowlisted laboratory adapters. Direct physical OT output mutations in real operational plants are strictly prohibited.
- **No Uncontrolled External Scanning**: Telemetry ingestion and network monitoring operate in passive mode or within the air-gapped container network (`lab_net`). Outbound internet or corporate network scanning is disabled.
- **Human-in-the-Loop Requirement**: High-risk response playbooks require explicit analyst/admin authorization (`ADMIN_APPROVAL`). Automated response execution without approval is disabled for consequential actions.
