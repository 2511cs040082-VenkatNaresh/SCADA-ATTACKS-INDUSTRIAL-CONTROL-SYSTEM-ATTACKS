# Phase 21 — Isolated ICS Laboratory Deployment Guide

## 1. Safety & Air-Gap Boundaries
The laboratory simulation profile (`docker-compose.lab.yml`) establishes a synthetic SCADA laboratory environment.
- **Air-Gapped Network**: Attached to `lab_net` (`internal: true`). Outbound traffic to the internet, corporate LAN, or physical OT networks is blocked.
- **Allowlisted Targets**: Simulation actions are restricted to synthetic device IDs (`PLC-001`, `RTU-001`, `HMI-001`). Real IP addresses (`8.8.8.8`) are blocked by safety boundary middleware.

## 2. Launching the Laboratory Deployment
```bash
docker-compose -f docker-compose.lab.yml up -d --build
```

## 3. Laboratory Workflow Verification
1. Access Frontend UI at `http://localhost:80`.
2. Login with SOC credentials (`username: soc_analyst`, `password: password123`).
3. Navigate to **Attack Simulation Laboratory** workspace.
4. Launch scenario `SIM-MULTISTAGE-001`.
5. Observe telemetry drift, rule detection, behavioral Z-score, ML prediction, incident triage, response execution, lab recovery, and report export.
