# Real-Time Telemetry & Pipeline Architecture

## Overview
The **ICS-SHIELD Real-Time Telemetry & Event Ingestion Pipeline** processes high-frequency industrial telemetry and event records from the Phase 4 laboratory simulator, standardizes them into standardized JSON envelopes, enforces idempotency, queues them with priority, and broadcasts them via WebSockets to connected frontend security operation interfaces.

```
  [ ICS Laboratory Simulator ] (Port 8085)
               │
               ▼
  [ Telemetry Collector Microservice ] (Port 8086)
               │
    (Validation & UTC Normalization)
               │
      [ Priority Bounded Queue ]
               │
     (Deduplication & Worker)
               │
    [ Backend Ingestion API ] (Port 5050 /api/v1/internal/events)
               │
       ┌───────┴───────┐
       ▼               ▼
   [ MySQL DB ]   [ WebSocket Broadcast ]
                       │
                       ▼
             [ React Frontend SOC ]
```

## Key Capabilities
- **Priority Queue**: CRITICAL security events bypass low-priority telemetry bursts.
- **Idempotency**: `event_id` UUID verification prevents duplicate record insertions.
- **Sub-millisecond Ingestion**: Batch HTTP dispatch to backend Express service.
- **WebSocket Push**: Push updates for process variables, telemetry metrics, and device state changes.
