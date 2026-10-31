# ICS-SHIELD Containerization & Deployment Documentation

## Overview
This directory contains containerization assets, health checks, security configurations, and operational management scripts for **ICS-SHIELD Phase 21 — Docker & Deployment**.

## File Map
```
docker/
├── frontend.Dockerfile     # Multi-stage React + Vite + Nginx container build
├── backend.Dockerfile      # Hardened Node.js 20 Express container build
├── telemetry.Dockerfile    # Python/Node telemetry ingestion pipeline build
├── detection.Dockerfile    # FastAPI + ML Anomaly Detection Engine container
├── lab.Dockerfile          # Isolated ICS Laboratory simulator container
├── configs/
│   ├── nginx.conf          # Nginx production reverse proxy & security headers
│   └── mysql.cnf           # Hardened MySQL 8.0 server configuration
├── healthchecks/
│   ├── backend_health.js   # HTTP health check script for Node backend
│   ├── frontend_health.sh  # Wget health check for Nginx frontend
│   ├── python_health.py    # Python urllib health check for detection & lab
│   └── mysql_health.sh     # mysqladmin ping check for MySQL server
└── scripts/
    ├── backup.sh           # Database mysqldump and report archiving script
    ├── restore.sh          # Guarded backup restore utility script
    └── entrypoint_backend.sh # Backend startup dependency waiter script
```

## Docker Compose Profiles
- `docker-compose.yml`: Production-style deployment profile.
- `docker-compose.dev.yml`: Local development profile with volume mounts and hot reload.
- `docker-compose.test.yml`: Automated test execution environment.
- `docker-compose.lab.yml`: Complete isolated ICS laboratory simulation environment.
