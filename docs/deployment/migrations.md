# Phase 21 — Database Migrations & Version Upgrades

## Migration Runner
The migration runner script at `database/migrations/migrate.js` tracks executed migrations in table `schema_migrations`.

## Running Migrations in Deployment
```bash
docker-compose exec backend node /app/database/migrations/migrate.js
```
The migration runner is non-destructive. Destructive table drops are strictly prohibited during automated production startup.
