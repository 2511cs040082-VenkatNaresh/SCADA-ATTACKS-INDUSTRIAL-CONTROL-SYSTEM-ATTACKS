# Phase 21 — Deployment Architecture & Topology

## 1. System Deployment Topology
The **ICS-SHIELD** containerized architecture separates application traffic, management services, database storage, and the isolated ICS laboratory simulation environment into distinct Docker networks and container tiers.

```
                  ┌────────────────────────┐
                  │   Browser / SOC Client  │
                  └───────────┬────────────┘
                              │ HTTP (Port 80)
                              ▼
                  ┌────────────────────────┐
                  │    frontend (Nginx)    │
                  └───────────┬────────────┘
                              │ REST / WS (Port 5050)
                              ▼
                  ┌────────────────────────┐
                  │   backend (Node.js)    │
                  └──────┬─────┬─────┬─────┘
                         │     │     │
            ┌────────────┘     │     └────────────┐
            ▼                  ▼                  ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   mysql (8.0)    │  │ detection-engine │  │ ics-lab (Sim)    │
│  (Internal Data) │  │  (Python FastAPI)│  │ (Isolated Lab)   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

## 2. Container Inventory
1. **`frontend`**: Multi-stage React SPA build served via Nginx with custom security headers and proxy rules.
2. **`backend`**: Node.js 20 Express service providing REST endpoints, authenticated WebSockets, incident management, MITRE mapping, report exporter, and administration.
3. **`mysql`**: MySQL 8.0 relational store with persistent volumes and migration scripts.
4. **`telemetry`**: Protocol and process variable ingestion service connecting the simulator to the backend.
5. **`detection-engine`**: Python 3.11 FastAPI service evaluating rule-based, behavioral Z-score, and ML Isolation Forest models.
6. **`ics-lab`**: Isolated laboratory simulator running synthetic SCADA, PLC-001, RTU-001, and HMI-001 device models.

## 3. Network Segmentation Matrix
- **`frontend_net`**: Public/client-facing bridge network (Ports 80, 5050).
- **`backend_net`**: Internal service communication network between Node backend, Python detection engine, and telemetry pipeline.
- **`data_net`**: Isolated database network (`internal: true`). Only `backend` and `mysql` containers are attached.
- **`lab_net`**: Air-gapped laboratory network (`internal: true`). No external internet or physical OT network bridging allowed.
