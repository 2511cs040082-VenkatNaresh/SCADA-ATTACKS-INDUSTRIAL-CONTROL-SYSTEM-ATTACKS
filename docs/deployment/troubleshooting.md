# Phase 21 — Deployment Troubleshooting Guide

## Common Issues & Remediation

### 1. Database Connection Failure (`ECONNREFUSED` / Access Denied)
- *Cause*: `mysql` container not healthy yet or incorrect `DATABASE_PASSWORD`.
- *Fix*: Check status with `docker-compose ps`. View logs via `docker-compose logs mysql`. Verify credentials in `.env`.

### 2. Frontend Cannot Reach Backend API
- *Cause*: Port mismatch or incorrect `VITE_API_BASE_URL`.
- *Fix*: Ensure Nginx proxy settings in `docker/configs/nginx.conf` route `/api` to `http://backend:5050/api`.

### 3. Simulator Target Safety Violation
- *Cause*: Attempting to target IP outside allowlist (`PLC-001`, `RTU-001`, `HMI-001`).
- *Fix*: Ensure `ALLOW_REAL_INFRASTRUCTURE_CONNECT` remains `false`. Target only allowlisted synthetic laboratory devices.
