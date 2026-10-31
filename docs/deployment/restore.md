# Phase 21 — Database & Asset Restore Procedures

## Guarded Restore Workflow
1. Locate target `.sql.gz` backup file in `docker/backups/`.
2. Execute the guarded restore script specifying backup path:
   ```bash
   ./docker/scripts/restore.sh docker/backups/db_ics_shield_20260930_020000.sql.gz
   ```
3. The restore script validates gzip integrity before streaming data to MySQL.
