# ICS-SHIELD Security Architecture & Protection Boundaries

## 1. Security Architecture Principles

ICS-SHIELD enforces a **Defense-in-Depth** security architecture designed for high-consequence Industrial Control System (ICS) environments.

---

## 2. Core Protection Mechanisms

1. **Server-Side Authoritative RBAC**:
   - Authorization decisions are made exclusively on the backend via `authenticate` and `authorize(...allowedRoles)` middleware.
   - Request URLs, headers, and bodies are validated against server-side session state.

2. **Simulation Safety & Fail-Closed Boundary**:
   - The attack simulation engine (`simulationEngine`) verifies target IP addresses and asset codes against an allowlisted laboratory inventory (`PLC-001`, `PLC-002`, `RTU-001`, `HMI-001`, `ENG-WS-001`, `HISTORIAN-001`).
   - External IP targeting (e.g. `8.8.8.8`) or arbitrary domain names fail closed with an immediate `SAFETY_BOUNDARY_VIOLATION`.

3. **Approval-Based Controlled Response**:
   - Response execution requires explicit multi-layer approvals (`ADMIN_APPROVAL`, `TWO_PERSON_APPROVAL`).
   - Enforces Separation of Duties: plan creators cannot self-approve response plans.
   - Command adapters are allowlisted and execute strictly within the simulated laboratory environment.

4. **Cryptographic Integrity & Evidence Protection**:
   - Reports, response actions, and investigation evidence generate SHA-256 integrity hashes.
   - Retention policies preserve evidence linked to active incidents.

5. **Sanitized Error Handling & Audit**:
   - Production API error responses return sanitized error messages without exposing SQL queries or stack traces.
   - Administrative actions record append-only audit entries and broadcast real-time WebSocket notifications.
