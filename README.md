# ICS-SHIELD
### Real-Time SCADA & Industrial Control System Attack Detection and Defense Platform

[![Phase](https://img.shields.io/badge/Phase-21%20Docker%20%26%20Deployment-emerald.svg)](docs/deployment/architecture.md)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

**ICS-SHIELD** is an isolated defensive cybersecurity platform designed for real-time monitoring of industrial control systems (SCADA, PLCs, RTUs, HMIs), SCADA protocol anomaly detection (Modbus TCP, DNP3, S7comm), threat classification mapped to **MITRE ATT&CK for ICS (v14)**, guided SOC incident response, controlled attack simulation laboratory validation, professional security audit reporting, multi-domain analytics, administrator-controlled configuration center, comprehensive security hardening, end-to-end automated testing, and production-ready containerized Docker deployment.

---

## Technical Architecture

```
Frontend (React 18 + TS + Vite + Nginx Reverse Proxy)
       │ (REST APIs / Authenticated WebSocket Stream)
       ▼
Backend Service (Node.js 20 + Express + WS Engine + Security Hardened Middleware)
       │ (SQL Pool)
       ├──────────────► MySQL Database (icsshield_db / Volume Persistence)
       │
       ▼ (HTTP Async REST)
Python Detection Engine (FastAPI + ML Anomaly Pipeline)
```

---

## Platform Modules & Completed Phases

* **Phase 1** — Project Foundation & Architecture
* **Phase 2** — Database & Data Model
* **Phase 3** — Backend API & Authentication
* **Phase 4** — Isolated ICS/SCADA Laboratory Simulator
* **Phase 5** — Real-Time Telemetry & Event Pipeline
* **Phase 6** — Asset Discovery, Inventory, Health & Risk
* **Phase 7** — Real-Time ICS Network & Industrial Protocol Monitoring
* **Phase 8** — Rule-Based ICS Attack Detection Engine
* **Phase 9** — Behavioral & Statistical Anomaly Detection Engine
* **Phase 10** — Machine Learning Based ICS Anomaly Detection
* **Phase 11** — Real-Time Alert Management & Alert Correlation
* **Phase 12** — Incident Investigation & Case Management Workspace
* **Phase 13** — MITRE ATT&CK for ICS Integration, Mapping & Coverage
* **Phase 14** — Defense & Response Engine (Approval-Based Response)
* **Phase 15** — Controlled ICS Attack Simulation Laboratory
* **Phase 16** — Advanced SOC Dashboard & Unified Interface
* **Phase 17** — Reports & Advanced Analytics Subsystem
* **Phase 18** — Administration & Configuration Center
* **Phase 19** — Comprehensive Security Hardening
* **Phase 20** — Comprehensive Testing & Validation (19 Test Suites, Master 18-Stage E2E Simulation Test)
* **Phase 21** — Docker & Deployment (Multi-Stage Containers, Compose Profiles, Air-Gapped Lab Network, Health Checks, Backup/Restore Scripts, 17 Deployment Guides)

## Quickstart Application Launcher (`run.py`)

Run the complete platform and automatically open the UI in your browser with a single command:
```bash
python run.py
```
This automatically verifies dependencies, starts the backend REST & WebSocket server (port 5050), starts the frontend Vite UI (port 3000), waits for server readiness, and opens your default browser to `http://localhost:3000`.

---

## Deployment Quickstart (Phase 21)

### 1. Production Deployment
```bash
# Prepare environment variables
cp .env.example .env

# Launch production container stack
docker-compose up -d --build
```

### 2. Air-Gapped Laboratory Simulation Profile
```bash
docker-compose -f docker-compose.lab.yml up -d --build
```

### 3. Automated Test Execution
```bash
node tests/run_all_tests.js
```

---

## Directory Overview

```
SCADA/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS Unified SOC UI
├── backend/              # Node.js + Express REST API, WS server & Report Engine
├── detection-engine/     # Python ML/Detection engine service
├── telemetry/            # Telemetry collector & parser modules
├── ics-lab/              # Simulated ICS/SCADA environment models
├── response-engine/      # Defensive response recommendation module
├── database/             # Schema SQL, migration runner, seed scripts
├── docker/               # Dockerfiles, healthchecks, scripts & configs
├── tests/                # 19 automated test suites & master runner
├── docs/                 # System architecture, API, security, testing & deployment docs
├── docker-compose.yml    # Production Docker Compose orchestration
├── docker-compose.dev.yml# Development Compose orchestration
├── docker-compose.test.yml# Automated test Compose orchestration
└── docker-compose.lab.yml# Isolated Laboratory Compose orchestration
```
# SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS
