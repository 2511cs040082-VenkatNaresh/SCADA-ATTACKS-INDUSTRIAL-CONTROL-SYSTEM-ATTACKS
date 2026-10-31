# ICS-SHIELD Threat Model & Security Architecture Review

## 1. Executive Summary

This document establishes the official **Threat Model** for **ICS-SHIELD — Real-Time SCADA & Industrial Control System Attack Detection and Defense Platform**.
It identifies assets, trust boundaries, threat vectors, attack surfaces, technical impacts, existing defenses, hardening mitigations, and residual risks across the platform.

---

## 2. Platform Trust Boundaries & System Assets

### System Assets
1. **SCADA Ingestion & Sensor Telemetry**: Real-time Modbus, DNP3, S7comm protocol packets, pressure/flow readings, and PLC coil states.
2. **Detection & Behavioral Engine State**: Rule definitions, EWMA/Z-Score baselines, Isolation Forest ML models, and drift metrics.
3. **SOC Incident Workspace & Artifacts**: Correlated alerts, investigation case files, analyst notes, and cryptographic SHA-256 evidence.
4. **Defense & Response Playbooks**: Safe laboratory containment plans, action execution records, and approval policies.
5. **Attack Simulation Laboratory**: Synthetic attack scenarios, step execution states, and pipeline evaluation matrices.
6. **Identity, Credentials & Audit Records**: Password hashes, JWT tokens, session records, RBAC permission matrices, and append-only audit logs.

### Trust Boundaries
- **TB-1 (Browser / Untrusted User $\rightarrow$ REST API / WS Engine)**: Enforces JWT Bearer authentication, role-based authorization, rate limiting, and input sanitization.
- **TB-2 (Backend API Engine $\rightarrow$ MySQL Database Pool)**: Enforces parameterized queries and restricted application DB user permissions.
- **TB-3 (Backend API Engine $\rightarrow$ Python ML / Detection Microservice)**: Enforces internal service token authentication (`X-Internal-Service-Key`).
- **TB-4 (Platform Engine $\rightarrow$ ICS Laboratory Simulator)**: Fail-Closed boundary restricting simulation and response executions strictly to allowlisted laboratory inventory (`PLC-001`, `RTU-001`, `HMI-001`). External IP targeting is strictly blocked.

---

## 3. Comprehensive Threat Matrix (25 Categories)

| # | Threat Category | Asset | Attack Surface | Technical Impact | Existing Protection | Hardening Mitigation | Residual Risk |
|---|---|---|---|---|---|---|---|
| 1 | **Unauthorized Access** | REST APIs, User Accounts | `/api/v1/auth/login` | Account takeover, unauthorized platform access | JWT authentication & bcrypt hashing | Failed login lockout, strict session timeout | Stolen valid operator credentials |
| 2 | **Credential Theft** | Operator Credentials | Login form, HTTP traffic | Account compromise | Bcrypt hashing (10 rounds) | Enforce HSTS, HTTPS, no credential logging | Keyloggers on client workstation |
| 3 | **Session Hijacking** | Active JWT Sessions | Browser storage, Network | User impersonation | Short-lived JWTs (24h) | Session revocation check on every request | Token theft from compromised client browser |
| 4 | **JWT Abuse** | JWT Signature & Claims | HTTP `Authorization` Header | Unauthorized access via forged token | HMAC-SHA256 signature verification | Explicit secret check, reject revoked/disabled tokens | Secret key compromise |
| 5 | **Privilege Escalation** | RBAC Authorizations | API parameters, JWT payload | Low-privilege user executing admin commands | Server-side `authorize()` middleware | Authoritative backend role validation | Compromised admin account |
| 6 | **IDOR** | Alerts, Incidents, Reports | URL parameters (`/api/v1/reports/:id`) | Viewing unauthorized resources | Resource ownership checks | Centralized input validator for UUIDs/IDs | Internal user with read rights |
| 7 | **SQL Injection** | MySQL Database | Query strings, Search inputs | Data exfiltration or database corruption | Parameterized SQL queries via `mysql2` | Strict input sanitization middleware | Zero-day SQL parser bug |
| 8 | **Cross-Site Scripting (XSS)** | SOC Frontend Workspace | Analyst notes, Incident titles | Session hijack via malicious script | React JSX automatic escaping | `sanitizer.js` input HTML stripping & CSP headers | Unsafe browser extension |
| 9 | **CSRF** | State-changing API routes | HTTP POST/PATCH/DELETE | Unintended state mutation | Bearer Token authentication (no auto-cookies) | CORS origin whitelist & SameSite policies | Cross-origin malicious site |
| 10 | **Command Injection** | Backend OS Process | API inputs, Execution adapters | OS compromise | No `eval()` or shell execution | Allowlisted adapter functions only | Subprocess execution bug |
| 11 | **Path Traversal** | Report & Evidence Exporters | Download endpoints (`/reports/export`) | Arbitrary file read/write | Memory-based buffer rendering | Path traversal parameter block (`../` check) | Misconfigured download path |
| 12 | **Mass Assignment** | User & Role Models | JSON request body | Unauthorized role or status mutation | Explicit controller field extraction | Whitelisted payload parsing | Missing controller check |
| 13 | **API Abuse** | REST API Endpoints | Public API routes | Resource exhaustion, DoS | Rate limiting (`express-rate-limit`) | Per-endpoint strict rate limits | Distributed IP botnet |
| 14 | **WebSocket Abuse** | WS Stream (`/ws`) | WebSocket connection | Unauthorized event eavesdropping | Token validation on connection | Channel-level RBAC event filtering | Eavesdropping on authorized socket |
| 15 | **Secret Leakage** | Database & JWT Secrets | Codebase, Git repository | Complete system compromise | Environment variables (`process.env`) | Secret scanning test suite & `.env.example` audit | Misconfigured deployment env |
| 16 | **Malicious Configuration** | System Settings | `/api/v1/admin/settings` | Platform security boundary disabling | Administrator RBAC check | Dangerous edit confirmation & version rollback | Compromised administrator account |
| 17 | **Unsafe Simulation Target** | Physical SCADA Systems | `/api/v1/simulation/runs` | Physical plant disruption | Lab simulator isolation | Fail-Closed target allowlist (`PLC-001` only) | Authorized user deliberately misconfiguring simulator |
| 18 | **Unsafe Response Execution** | Industrial Controllers | `/api/v1/response/execute` | Process shutdown | Approval policy engine | Separation of duties & simulation-only mode | Unapproved manual lab override |
| 19 | **Report Data Exposure** | PDF/CSV Report Exports | `/api/v1/reports/:id/export` | Confidential security metrics leak | RBAC authorization check | Cryptographic SHA-256 evidence hashing | Authorized user downloading report |
| 20 | **ML Model Tampering** | Isolation Forest ML Models | Model storage, `/ml` routes | False negative anomaly evasion | Validation score checks | Mandatory admin approval for model activation | Malicious training data injection |
| 21 | **Evidence Tampering** | Investigation Artifacts | `/api/v1/incidents/:id/evidence` | Forensic invalidation | SHA-256 hash generation | Immutable DB records & evidence preservation policy | Physical DB disk tampering |
| 22 | **Audit Log Manipulation** | Administrative Audit Trail | `/api/v1/admin/audit` | Hiding unauthorized administrative actions | Append-only SQL schema | Prohibit UPDATE/DELETE operations on audit logs | Database root user tampering |
| 23 | **Container Compromise** | Docker Microservices | Container runtime | Host breakout, lateral movement | Non-root user in Dockerfiles | Minimal base images & dropped capabilities | Unpatched Linux kernel vulnerability |
| 24 | **Service Impersonation** | Python Detection Microservice | Internal HTTP communication | Injecting fake ML predictions | Internal service key check | Shared secret header `X-Internal-Service-Key` | Internal network sniffing |
| 25 | **Denial of Service (DoS)** | Platform Availability | API, Ingestion Pipeline | Telemetry dropping, SOC outage | Queue limits & batching | Request size limits (1MB) & rate limiters | Massive network flooding |
