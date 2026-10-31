# Anomaly & Threat Simulation Scenarios

The simulator features **8 safe, fully isolated anomaly scenarios** to simulate operational failures and adversary behaviors for MITRE ATT&CK for ICS mapping.

## Scenario Catalog

### 1. `NORMAL_OPERATION` (Baseline)
- **Description**: Baseline normal industrial water treatment control loop. Physical variables follow smooth curves, sensors operate within normal tolerance, and PLCs adjust valves dynamically.
- **Severity**: `LOW` (Info)
- **MITRE ICS Technique**: N/A (Baseline)

### 2. `PROCESS_VALUE_ANOMALY` (Over-Pressure / Fluid Overflow)
- **Description**: Simulates physical process variable drift exceeding safety thresholds (e.g. Tank level reaching 95% or Header Pressure spiking to 9.2 bar).
- **Severity**: `HIGH`
- **MITRE ICS Technique**: `T0836 - Modify Parameter`

### 3. `DEVICE_OFFLINE` (PLC / RTU Disconnection)
- **Description**: Simulates `PLC-002` transitioning from `ONLINE` to `WARNING` and eventually `OFFLINE`, resulting in missing telemetry heartbeats.
- **Severity**: `HIGH`
- **MITRE ICS Technique**: `T0826 - Loss of Availability`

### 4. `PROTOCOL_ANOMALY` (Unauthorized Modbus Write)
- **Description**: Simulates an unauthorized Modbus FC06 (Write Single Register) command sent from `ENG-WS-001` (`10.10.1.20`) to `PLC-001` (`10.10.3.10`) attempting to overwrite coil setpoints.
- **Severity**: `CRITICAL`
- **MITRE ICS Technique**: `T0855 - Unauthorized Command Message`

### 5. `ABNORMAL_REQUEST_RATE` (Polling Burst / Denial of Service)
- **Description**: Simulates high-frequency synthetic protocol request burst polling (>500 req/sec) targeting `PLC-001`, causing response latency degradation.
- **Severity**: `HIGH`
- **MITRE ICS Technique**: `T0814 - Denial of Service`

### 6. `UNAUTHORIZED_IP_ACCESS` (Rogue Network Asset)
- **Description**: Simulates an unknown IP address (`10.10.99.88`) executing unauthorized Modbus FC03 read scans across Purdue Level 1 controllers.
- **Severity**: `HIGH`
- **MITRE ICS Technique**: `T0846 - Network Service Discovery`

### 7. `MALICIOUS_FIRMWARE_UPLOAD` (Engineering Workstation Exploitation)
- **Description**: Simulates an unauthorized firmware block transfer operation (`FC90` / vendor-specific diagnostic command) targeted at `PLC-001`.
- **Severity**: `CRITICAL`
- **MITRE ICS Technique**: `T0839 - Program Organization Unit (POU) Corruption`

### 8. `SENSOR_TAMPERING` (Stuck Sensor Value)
- **Description**: Simulates a frozen/manipulated sensor output (`SENSOR-L01` locked at 50.0% tank level while actual fluid physical volume increases), deceiving control logic.
- **Severity**: `HIGH`
- **MITRE ICS Technique**: `T0830 - Loss of Control / Spoof Reporting Message`

## Scenario Execution Lifecycle

```
 +-------------+       POST /api/simulator/scenarios/{id}/start       +-------------+
 | IDLE /      | ---------------------------------------------------> |  ACTIVE     |
 | NORMAL      |                                                      |  ANOMALY    |
 +-------------+                                                      +-------------+
        ^                                                                    |
        |                  POST /api/simulator/reset                         |
        +--------------------------------------------------------------------+
```
- **Activation**: Via REST API or Frontend Simulation UI toggle.
- **Isolation**: All scenario behaviors are synthetically calculated in memory. Zero external packets are transmitted.
