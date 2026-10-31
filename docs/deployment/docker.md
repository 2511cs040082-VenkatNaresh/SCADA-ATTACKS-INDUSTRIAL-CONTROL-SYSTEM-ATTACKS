# Phase 21 — Docker Configuration & Container Hardening Guide

## 1. Container Security Hardening Controls
- **Non-Root Execution**: All containers execute under unprivileged dedicated user accounts (`nginx`, `node`, `telemetryuser`, `detectionuser`, `labuser`).
- **Minimal Base Images**: Multi-stage alpine builds (`node:20-alpine`, `nginx:1.25-alpine`) and minimal Python runtimes (`python:3.11-slim`) minimize attack surfaces.
- **Resource Limits**: CPU and memory limits are defined in Docker Compose to prevent denial of service resource exhaustion.
- **Capabilities**: Unnecessary Linux capabilities (`NET_ADMIN`, `SYS_ADMIN`) are dropped.
- **No Privileged Containers**: Containers run strictly unprivileged without host PID or host filesystem sharing.

## 2. Docker Compose Profiles
- `docker-compose.yml`: Production configuration with health checks, volume persistence, restart policies, and network isolation.
- `docker-compose.dev.yml`: Development profile with hot-reload volume mounts.
- `docker-compose.test.yml`: Automated test runner environment executing `node tests/run_all_tests.js`.
- `docker-compose.lab.yml`: Air-gapped synthetic laboratory simulation profile.
