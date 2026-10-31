# ICS-SHIELD API Documentation

## Health Check Endpoint

### GET /api/health
Returns the operational health and readiness state of backend subsystems.

#### Response Example (200 OK)
```json
{
  "service": "ICS-SHIELD Backend API",
  "status": "ONLINE",
  "phase": "PHASE_1_FOUNDATION",
  "environment": "development",
  "version": "1.0.0-phase1",
  "uptimeSeconds": 142,
  "timestamp": "2026-09-23T19:18:03.000Z",
  "components": {
    "api": { "status": "HEALTHY" },
    "database": { "status": "HEALTHY", "type": "MySQL" },
    "websocket": { "status": "OPERATIONAL" },
    "detectionEngine": { "status": "STANDBY", "url": "http://localhost:8000" }
  }
}
```
