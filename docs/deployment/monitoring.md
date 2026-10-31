# Phase 21 — Health Monitoring & Metrics

## 1. Container Health Endpoints
- Backend API: `GET /api/system/health`
- Reports Engine: `GET /api/v1/system/reports/health` (or `getReportsHealth()`)
- Defense Engine: `GET /api/v1/response/health` (or `getResponseHealth()`)
- Simulation Lab: `GET /api/v1/system/simulation/health` (or `getSimulationHealth()`)

## 2. Health Status Classifications
- **HEALTHY**: All dependencies connected and operating normally.
- **DEGRADED**: Secondary component offline; fallback store active.
- **WARNING**: Memory threshold or processing latency alert.
- **OFFLINE**: Required service unreachable.
