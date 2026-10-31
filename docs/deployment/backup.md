# Phase 21 — Backup Procedures & Schedule

## 1. Automated Backup Script
Run the automated backup utility script:
```bash
./docker/scripts/backup.sh
```
This script dumps the MySQL database using `mysqldump` with `--single-transaction`, gzips the output, and archives exported PDF/CSV audit reports into `docker/backups/`.

## 2. Recommended Cron Backup Schedule
To configure a daily automated backup at 02:00 AM:
```cron
0 2 * * * cd /opt/SCADA && ./docker/scripts/backup.sh >> /var/log/icsshield_backup.log 2>&1
```
