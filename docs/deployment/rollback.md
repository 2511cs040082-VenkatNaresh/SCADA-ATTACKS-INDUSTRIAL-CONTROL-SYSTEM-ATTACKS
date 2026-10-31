# Phase 21 — Deployment Rollback Procedures

## Rolling Back Container Deployment
1. Roll back containers to previous image tag:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```
2. In-memory data structures automatically recover state from persistent database volumes upon container restart.
