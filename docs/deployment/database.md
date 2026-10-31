# Phase 21 — Database Deployment & Initialization

## Initial Schema Initialization
When the `mysql` container starts for the first time, Docker automatically executes `database/schema/full_schema.sql` via `/docker-entrypoint-initdb.d/001_full_schema.sql`.

## Persistent Volumes
Database state is stored in the Docker volume `mysql_data` mapped to `/var/lib/mysql`. Container restarts or updates do not destroy existing data.
