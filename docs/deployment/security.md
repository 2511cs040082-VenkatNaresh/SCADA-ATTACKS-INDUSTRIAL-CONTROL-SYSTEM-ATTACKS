# Phase 21 — Deployment Security & Hardening Controls

## 1. Safety Boundary Controls
- **Air-Gapped Lab Network**: `lab_net` operates in `internal: true` mode. Outbound connections to external OT or internet networks are blocked.
- **Forbidden Actions**: Remote shell, PowerShell, SSH, or direct physical PLC command execution via containers is strictly prohibited.

## 2. Secrets & Credential Protection
- Plaintext secrets are strictly excluded from Dockerfiles, source code, image layers, and repository files.
- Credentials are supplied exclusively via environment injection or Docker secret volumes.
