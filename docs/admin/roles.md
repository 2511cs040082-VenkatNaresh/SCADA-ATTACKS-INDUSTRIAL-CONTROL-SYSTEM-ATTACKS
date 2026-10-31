# Role-Based Access Control (RBAC) & Roles

## System Roles & Protection Rules

ICS-SHIELD supports 5 pre-configured system-critical roles:
1. `ADMIN`: Full administrative access to system configuration, RBAC, users, and health.
2. `SECURITY_ANALYST`: Lead researcher with detection, incident, ML, and response permissions.
3. `SOC_OPERATOR`: Real-time triage operator for alert queue and event monitoring.
4. `OT_OPERATOR`: Field engineer with asset inventory and telemetry rights.
5. `VIEWER`: Read-only observer for dashboards and report exports.

### System Protection Rule
System-critical roles cannot be deleted. Custom roles can be created, edited, and safely removed when no users are assigned.
