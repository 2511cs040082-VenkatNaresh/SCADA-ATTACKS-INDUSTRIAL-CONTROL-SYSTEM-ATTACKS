# Phase 21 — Network Topology & Service Discovery

## Docker Service Discovery Names
Services communicate internally using Docker DNS service aliases rather than hardcoded IP addresses:
- MySQL Database: `mysql:3306`
- Backend API: `backend:5050`
- Detection Engine: `detection-engine:8080`
- Telemetry Ingestion: `telemetry:8086`
- ICS Simulator: `ics-lab:8085`

## Network Isolation Boundaries
- `data_net` network has `internal: true`. The MySQL container has no external port bindings in production and is reachable only by the `backend` service.
- `lab_net` network has `internal: true`. The simulator communicates exclusively with `backend` and `telemetry` containers.
