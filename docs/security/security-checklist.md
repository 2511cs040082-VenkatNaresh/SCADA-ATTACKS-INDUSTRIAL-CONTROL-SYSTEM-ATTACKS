# Platform Security Hardening Checklist

## Security Controls Verification Checklist

- [x] **Authentication**: Passwords hashed with bcrypt (10 rounds); short-lived JWT access tokens; disabled users and revoked sessions rejected.
- [x] **Authorization & RBAC**: Authoritative server-side `authorize()` middleware on all routes (`ADMIN`, `SECURITY_ANALYST`, `SOC_OPERATOR`, `OT_OPERATOR`, `VIEWER`). Privilege escalation blocked.
- [x] **API Security**: Request size limits (1MB); query sanitization; path traversal prevention; rate limiting.
- [x] **Database Security**: 100% parameterized SQL queries via `mysql2`; no raw string concatenation of untrusted inputs.
- [x] **WebSocket Security**: JWT authentication on WS handshake; channel-level RBAC filtering; client payload validation.
- [x] **Security Headers**: `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Strict-Transport-Security`, `Referrer-Policy`.
- [x] **Production Error Handling**: Stack traces hidden from production clients; server-side structured logging.
- [x] **Secrets Management**: No plaintext passwords or JWT secrets hardcoded in source code; `.env.example` audited.
- [x] **Simulation Safety**: Target selection restricted strictly to allowlisted laboratory assets (`PLC-001`, `RTU-001`, `HMI-001`); external target IPs (`8.8.8.8`) fail closed.
- [x] **Response Safety**: Safe allowlisted action adapters only; separation of duties enforced for approvals.
- [x] **Audit Trail**: Append-only administrative audit records emitting real-time WebSocket notifications.
