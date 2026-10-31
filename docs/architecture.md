# ICS-SHIELD — Final System Architecture & Topology

## 1. System Topology & Data Flow
The **ICS-SHIELD** platform is architected as a modular, defense-in-depth cybersecurity platform for SCADA and Industrial Control System monitoring.

```text
                 ┌─────────────────────────┐
                 │    React 18 SOC UI      │
                 └────────────┬────────────┘
                              │ REST / WS
                 ┌────────────▼────────────┐
                 │     Node.js Backend     │
                 └────────────┬────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
 Telemetry Pipeline     Security Engines       Administration
       │                      │                      │
       ▼              ┌───────┼────────┐            ▼
   ICS Lab            ▼       ▼        ▼       Configuration
                  Detection  ML     Alerts
                     │        │        │
                     └────────┼────────┘
                              ▼
                         Incidents
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              MITRE       Response      Reports
                 │            │            │
                 └────────────┼────────────┘
                              ▼
                           MySQL
```

## 2. Core Subsystems Overview
1. **Frontend UI Tier**: React 18 + Vite + TypeScript + Tailwind CSS industrial SOC dark UI with WebSocket real-time updates.
2. **Backend Services Tier**: Node.js 20 Express service providing API endpoints (`/api/v1/`), WebSocket server, JWT authentication, RBAC authorization, and service orchestrators.
3. **Database Tier**: MySQL 8.0 database catalog storing assets, events, detections, alerts, incidents, MITRE mappings, response plans, audit logs, and system configuration.
4. **Detection Tier**: Multi-layer detection combining condition-based rules, statistical Z-score behavioral tracking, and Python Isolation Forest machine learning.
5. **Simulation & Lab Tier**: Isolated synthetic SCADA environment simulating PLCs, RTUs, HMIs, and process variables under strict air-gapped network boundaries (`lab_net`).
