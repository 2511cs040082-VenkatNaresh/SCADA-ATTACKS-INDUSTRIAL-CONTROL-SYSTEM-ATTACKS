# Telemetry & Event Format Specifications

## Telemetry Data Schema
All simulated devices emit periodic normalized telemetry records formatted as strict JSON payloads.

### Standard Telemetry JSON Payload Example
```json
{
  "timestamp": "2026-09-23T16:00:00.123Z",
  "device_id": "PLC-001",
  "device_name": "Primary Water Treatment PLC",
  "purdue_level": 1,
  "ip_address": "10.10.3.10",
  "status": "ONLINE",
  "protocol": "MODBUS_TCP",
  "metrics": {
    "tank_level": 52.4,
    "temperature": 24.1,
    "pressure": 4.8,
    "flow_rate": 120.4,
    "pump_speed": 1450,
    "valve_position": 60.0,
    "cpu_utilization": 14.2,
    "memory_utilization": 38.5,
    "scan_cycle_ms": 12.1
  },
  "modbus_registers": {
    "40001": 524,
    "40002": 48,
    "40003": 1204,
    "00001": true
  }
}
```

## Security & Anomaly Event Schema
When security scenarios or abnormal threshold events occur, the simulator emits structured security event records:

### Security Event JSON Payload Example
```json
{
  "event_id": "EVT-20260923-00892",
  "timestamp": "2026-09-23T16:05:12.890Z",
  "event_type": "UNAUTHORIZED_WRITE_COMMAND",
  "severity": "CRITICAL",
  "source_ip": "10.10.1.20",
  "destination_ip": "10.10.3.10",
  "source_device": "ENG-WS-001",
  "target_device": "PLC-001",
  "protocol": "MODBUS_TCP",
  "details": {
    "function_code": 6,
    "register_address": 40004,
    "attempted_value": 9999,
    "policy_violation": "Write to safety setpoint from unauthorized engineering host outside maintenance window",
    "mitre_technique": "T0855 - Unauthorized Command Message"
  }
}
```

## Ingestion & Transmission Specification
- **Method**: HTTP POST
- **Endpoint**: `http://backend:5050/api/telemetry/ingest` (or Python engine `http://engine:8080/api/v1/telemetry`)
- **Headers**:
  - `Content-Type: application/json`
  - `X-ICS-Lab-Source: simulator-v1`
  - `Authorization: Bearer <lab_telemetry_token>`
- **Retry Logic**: Exponential backoff with up to 3 retry attempts and localized buffering on transient net drop.
