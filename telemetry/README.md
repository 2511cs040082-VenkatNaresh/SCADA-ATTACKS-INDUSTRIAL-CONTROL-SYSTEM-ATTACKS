# ICS-SHIELD Real-Time Telemetry & Event Pipeline

The **Telemetry Microservice** collects, validates, normalizes, queues, and dispatches industrial control system telemetry and security events from the Phase 4 isolated laboratory simulator to the ICS-SHIELD backend REST & WebSocket services.

## Architecture

```
  [ ICS Simulator ]
          │
  [ Telemetry Collector ]
          │
    [ Normalizer ]  <--- (Unit & UTC Timestamp Normalization)
          │
   [ Bounded Queue ] <--- (Priority & Backpressure)
          │
  [ Event Processor ] <--- (Idempotency & Deduplication)
          │
  [ Event Dispatcher ]
          │
  [ Express Backend API ]
```

## Supported Event Types
- `TELEMETRY`: Raw sensor and actuator metrics
- `PROCESS`: Physical process parameters (tank level, pressure, flow)
- `DEVICE`: Device online/warning/offline state transitions
- `NETWORK`: Synthetic network flow events
- `PROTOCOL`: Modbus/TCP request events
- `SECURITY`: Anomaly & security event notifications
- `AUTHENTICATION`: Authentication events
- `CONFIGURATION`: System configuration events
- `SIMULATION`: Simulator lifecycle events
- `SYSTEM`: Internal health & system events

## Running the Service
```bash
python3 -m telemetry.main
```
Service runs on `http://localhost:8086`. Health endpoint: `http://localhost:8086/health`.
