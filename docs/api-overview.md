# ICS-SHIELD — REST API Overview & Endpoints

## Core Endpoint Reference
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- System Health: `GET /api/system/health`
- Assets: `GET /api/assets`, `GET /api/assets/:id`, `GET /api/assets/discovery`
- Network: `GET /api/network/sessions`, `GET /api/protocols/modbus`
- Detection: `GET /api/detection/results`, `GET /api/behavioral/anomalies`, `GET /api/ml/predictions`
- Alerts & Incidents: `GET /api/alerts`, `GET /api/incidents`, `PATCH /api/incidents/:id/status`
- MITRE: `GET /api/mitre/matrix`, `GET /api/mitre/techniques/:id`
- Response: `GET /api/response/recommendations`, `POST /api/response/plans/:id/approve`
- Simulation: `GET /api/simulation/scenarios`, `POST /api/simulation/runs/start`
- Reports: `GET /api/reports`, `POST /api/reports/create`, `GET /api/reports/:id/export`
- Admin: `GET /api/admin/users`, `GET /api/admin/settings`, `GET /api/admin/audit`
