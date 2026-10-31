# ICS-SHIELD Administration & Configuration Center Architecture

## 1. Overview

The **Administration & Configuration Center** provides a complete, secure, professional management framework for **ICS-SHIELD**. It empowers authorized administrators to control and configure all platform subsystems through the UI without modifying source code.

---

## 2. Core Architectural Pillars

1. **Server-Side Authoritative Security Boundary**:
   - Every administrative action is enforced server-side via JWT authentication and role-based access control (RBAC).
   - Unauthenticated or unauthorized HTTP requests fail closed with `403 Forbidden`.

2. **Full Configuration Catalog Across 16 Categories**:
   - `General`, `Security`, `Telemetry`, `Detection`, `Behavior`, `ML`, `Alerts`, `Incidents`, `MITRE`, `Response`, `Simulation`, `Reports`, `Retention`, `Logging`, `WebSocket`, `Performance`.
   - Settings enforce strict data types (`STRING`, `NUMBER`, `BOOLEAN`), default fallbacks, and min/max bounds.

3. **Audited Versioning & Rollback**:
   - Setting mutations automatically increment parameter version numbers and create entries in `configuration_history`.
   - Administrators can inspect past versions and execute audited rollbacks.

4. **Active Evidence Preservation Protection**:
   - Retention policies prevent accidental purging of telemetry, alerts, and evidence linked to active incidents.

5. **Laboratory Fail-Closed Safety**:
   - Simulation and response configuration strictly restricts execution to allowlisted laboratory assets (`PLC-001`, `RTU-001`, `HMI-001`). Real SCADA or internet targets fail closed.

6. **Append-Only Audit Logging**:
   - All administrative changes (`USER_CREATED`, `USER_DISABLED`, `CONFIGURATION_CHANGED`, `RETENTION_CHANGED`, `ROLE_CHANGED`) emit append-only audit events and broadcast real-time WebSocket notifications (`admin.*`).
