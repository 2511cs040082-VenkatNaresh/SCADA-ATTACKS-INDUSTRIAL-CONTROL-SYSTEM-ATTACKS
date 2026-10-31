# Simulated Industrial Devices Reference

The ICS-SHIELD Laboratory models 16 industrial assets organized according to the **Purdue Model for Industrial Control Systems**.

## Asset Inventory

| Device ID | Asset Name | Purdue Level | Role / Type | IP Address | Vendor / Model | Protocol |
|---|---|---|---|---|---|---|
| `SCADA-SRV-01` | Main SCADA Server | Level 3 | Supervisory Control | `10.10.1.10` | Inductive Automation Ignition | Modbus TCP / OPC UA |
| `HISTORIAN-001` | Data Historian | Level 3 | Process Data Logging | `10.10.1.15` | OSIsoft PI Server | Proprietary DB / REST |
| `ENG-WS-001` | Engineering Workstation | Level 3 | Configuration & Programming | `10.10.1.20` | Siemens TIA Portal | S7comm / Modbus |
| `HMI-001` | Operator Console HMI 1 | Level 2 | Operator Visualization | `10.10.2.10` | Wonderware InTouch | Modbus TCP |
| `HMI-002` | Operator Console HMI 2 | Level 2 | Secondary Monitoring | `10.10.2.11` | Rockwell FactoryTalk | Modbus TCP |
| `PLC-001` | Primary Water Treatment PLC | Level 1 | Process Controller | `10.10.3.10` | Siemens S7-1500 | Modbus TCP |
| `PLC-002` | Secondary Filtration PLC | Level 1 | Process Controller | `10.10.3.11` | Allen-Bradley ControlLogix | Modbus TCP |
| `PLC-003` | Chemical Dosing PLC | Level 1 | Process Controller | `10.10.3.12` | Schneider Electric M580 | Modbus TCP |
| `RTU-001` | Remote Distribution RTU | Level 1 | Remote Telemetry Unit | `10.10.3.20` | SEL-3530 Real-Time Automation Controller | DNP3 / Modbus TCP |
| `SENSOR-L01` | Inlet Tank Level Sensor | Level 0 | Hydrostatic Level Sensor | `10.10.4.10` | Endress+Hauser Deltapilot | 4-20mA / Modbus |
| `SENSOR-T01` | Water Temp Sensor | Level 0 | Resistance Temp Detector | `10.10.4.11` | WIKA TR10 | 4-20mA / Modbus |
| `SENSOR-P01` | Main Header Pressure | Level 0 | Piezoresistive Transducer | `10.10.4.12` | Rosemount 3051 | HART / Modbus |
| `ACT-PUMP01` | Main Feed Water Pump | Level 0 | Variable Speed Motor Pump | `10.10.4.20` | Grundfos VFD Drive | Modbus TCP |
| `ACT-VALVE01` | Inlet Control Valve | Level 0 | Motorized Control Valve | `10.10.4.21` | AUMA Electric Actuator | Modbus TCP |
| `SWITCH-001` | Industrial Switch | Subnet Core | Managed Ethernet Switch | `10.10.0.1` | Cisco IE-4000 | SNMP / SSH |
| `FIREWALL-001` | OT Security Gateway | OT Boundary | Industrial Firewall | `10.10.0.254` | Fortinet FortiGate 60F | HTTPS / Syslog |

## Device States & Lifecycle
Each device model maintains a dynamic status field:
- **`ONLINE`**: Operational normally within process safety parameters.
- **`WARNING`**: Non-critical threshold warning (e.g. elevated temperature or minor latency).
- **`DEGRADED`**: Intermittent communications or minor hardware fault.
- **`OFFLINE`**: Disconnected, failed, or unresponsive due to network failure or simulated attack.
- **`MAINTENANCE`**: Device taken offline intentionally for servicing.

## Modbus Coil & Register Mappings (PLC-001 Example)

| Address Range | Data Type | Description | Unit | Access |
|---|---|---|---|---|
| `00001` | Coil (Bool) | Pump Start/Stop Control | Flag (0/1) | Read / Write |
| `00002` | Coil (Bool) | Emergency Shutoff Valve | Flag (0/1) | Read / Write |
| `40001` | Holding Register | Tank Level PV | % ($0-1000$ scaled) | Read Only |
| `40002` | Holding Register | System Pressure PV | Bar ($0-100$ scaled) | Read Only |
| `40003` | Holding Register | Flow Rate PV | L/min ($0-3000$ scaled)| Read Only |
| `40004` | Holding Register | Target Level Setpoint | % ($0-1000$ scaled) | Read / Write |
