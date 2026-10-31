#!/usr/bin/env bash
# ==============================================================================
# ICS-SHIELD — GUARDED RESTORE UTILITY SCRIPT
# ==============================================================================
set -euo pipefail

BACKUP_FILE="${1:-}"
DB_HOST="${DATABASE_HOST:-mysql}"
DB_USER="${DATABASE_USER:-icsshield_user}"
DB_PASS="${DATABASE_PASSWORD:-icsshield_secure_password_change_me}"
DB_NAME="${DATABASE_NAME:-ics_shield}"

echo "=================================================="
echo " [ICS-SHIELD RESTORE] Guarded System Restore"
echo "=================================================="

if [ -z "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file path argument required."
  echo "Usage: ./restore.sh <path-to-sql.gz-backup-file>"
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file '${BACKUP_FILE}' not found."
  exit 1
fi

echo "[1/2] Verifying backup archive integrity..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  gzip -t "${BACKUP_FILE}" || { echo "❌ Corrupted gzip archive"; exit 1; }
fi

echo "[2/2] Restoring database schema and records to '${DB_NAME}'..."
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  gunzip -c "${BACKUP_FILE}" | mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}"
else
  mysql -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" < "${BACKUP_FILE}"
fi

echo "\n✅ [SUCCESS] Restore completed cleanly from '${BACKUP_FILE}'."
