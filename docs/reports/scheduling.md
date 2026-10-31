# ICS-SHIELD Report Scheduling & RBAC Security

## 1. Automated Report Scheduler
The scheduling engine (`report_schedules`) enables automated recurring report generation:
- **Frequencies**: `DAILY`, `WEEKLY`, `MONTHLY`.
- **Saved Parameters**: Time window, report type, export format, environment scope, and filter criteria are preserved with each schedule.

## 2. Access Control (RBAC)
- **ADMIN**: Full access to view, create, export, schedule, and delete all reports.
- **SECURITY_ANALYST**: View, create, export, and schedule security and simulation reports.
- **SOC_OPERATOR**: View and export operational reports.
- **OT_OPERATOR**: View asset and process health reports.
- **VIEWER**: Read-only view of authorized reports.

Backend REST API endpoints enforce authoritative authorization.
