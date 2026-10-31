# Common Event Model Schema Reference

## Event Envelope Schema

```json
{
  "event_id": "9b1deb4d-3b7d-4142-910d-2b4742a0b220",
  "event_type": "TELEMETRY",
  "timestamp": "2026-09-24T04:00:00.000Z",
  "source": {
    "asset_id": "PLC-001",
    "asset_type": "PLC"
  },
  "environment": "LAB",
  "priority": "NORMAL",
  "payload": {
    "metric": "temperature",
    "value": 24.1,
    "unit": "C",
    "quality": "GOOD"
  },
  "metadata": {
    "simulation": true
  }
}
```

## Standardized Event Types
1. `TELEMETRY`: Raw sensor metrics
2. `PROCESS`: Physical process parameters (tank level, temperature, pressure)
3. `DEVICE`: Device online/warning/offline state transitions
4. `NETWORK`: Synthetic network flow events
5. `PROTOCOL`: Modbus/TCP request/response events
6. `SECURITY`: Anomaly & security notifications
7. `AUTHENTICATION`: User login/logout events
8. `CONFIGURATION`: Settings changes
9. `SIMULATION`: Simulator state events
10. `SYSTEM`: Engine health & status
