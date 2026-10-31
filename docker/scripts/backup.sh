#!/usr/bin/env bash
# ==============================================================================
# ICS-SHIELD — DATABASE & ASSET BACKUP UTILITY SCRIPT
# ==============================================================================
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="${BACKUP_DIR:-/backups}"
DB_HOST="${DATABASE_HOST:-mysql}"
DB_USER="${DATABASE_USER:-icsshield_user}"
DB_PASS="${DATABASE_PASSWORD:-icsshield_secure_password_change_me}"
DB_NAME="${DATABASE_NAME:-ics_shield}"

echo "=================================================="
echo " [ICS-SHIELD BACKUP] Starting System Backup"
echo " Timestamp: ${TIMESTAMP}"
echo " Backup Directory: ${BACKUP_DIR}"
echo "=================================================="

mkdir -p "${BACKUP_DIR}"

DB_BACKUP_FILE="${BACKUP_DIR}/db_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "[1/2] Backing up MySQL database schema and records..."
if command -v mysqldump &> /dev/null; then
  mysqldump -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASS}" --single-transaction --quick "${DB_NAME}" | gzip > "${DB_BACKUP_FILE}"
  echo "  └─ Database backup saved: ${DB_BACKUP_FILE}"
else
  echo "  └─ [WARN] mysqldump command not found in container host environment. Skipping live dump."
fi

# Audit evidence & report backup
EVIDENCE_DIR="./exports/reports"
if [ -d "${EVIDENCE_DIR}" ]; then
  REPORT_BACKUP_FILE="${BACKUP_DIR}/reports_${TIMESTAMP}.tar.gz"
  echo "[2/2] Archiving exported PDF/CSV audit reports..."
  tar -czf "${REPORT_BACKUP_FILE}" -C "${EVIDENCE_DIR}" .
  echo "  └─ Reports archived: ${REPORT_BACKUP_FILE}"
fi

echo "\n✅ [SUCCESS] Backup operations completed successfully."
