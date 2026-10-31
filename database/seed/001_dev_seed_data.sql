-- ICS-SHIELD Development Seed Data (Phase 2 Lab Environment)
USE ics_shield;

-- 1. Roles & Permissions
INSERT INTO roles (role_uuid, name, description) VALUES
('r-00000000-0000-0000-0000-000000000001', 'ADMIN', 'System Administrator with full access'),
('r-00000000-0000-0000-0000-000000000002', 'SECURITY_ANALYST', 'SOC Lead Analyst & Incident Investigator'),
('r-00000000-0000-0000-0000-000000000003', 'SOC_OPERATOR', 'SecOps Operator monitoring real-time telemetry'),
('r-00000000-0000-0000-0000-000000000004', 'OT_OPERATOR', 'Operational Technology Plant Operator'),
('r-00000000-0000-0000-0000-000000000005', 'VIEWER', 'Read-only dashboard auditor')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Dev Users (password hash for dev testing: 'argon2_or_bcrypt_hash_placeholder')
INSERT INTO users (user_uuid, username, email, password_hash, full_name, status) VALUES
('u-00000000-0000-0000-0000-000000000001', 'soc_analyst', 'analyst@lab.icsshield.internal', '$2b$12$eImiTXuWVxfM37uY4JANjO5E/S5vJqZ7WkHkYjXvW2qS1m1P3zQ6G', 'Lead SecOps Analyst', 'ACTIVE'),
('u-00000000-0000-0000-0000-000000000002', 'scada_admin', 'admin@lab.icsshield.internal', '$2b$12$eImiTXuWVxfM37uY4JANjO5E/S5vJqZ7WkHkYjXvW2qS1m1P3zQ6G', 'SCADA Administrator', 'ACTIVE')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- 2. Asset Types & Zones
INSERT INTO asset_types (code, name, description) VALUES
('PLC', 'Programmable Logic Controller', 'Field execution unit'),
('RTU', 'Remote Terminal Unit', 'Telemetry telemetry gateway'),
('SCADA_SERVER', 'SCADA Master Server', 'Supervisory master host'),
('HMI', 'Human-Machine Interface', 'Operator visual console'),
('ENGINEERING_WORKSTATION', 'Engineering Workstation', 'PLC programming workstation'),
('HISTORIAN', 'Data Historian', 'Long-term process historian'),
('SENSOR', 'Field Sensor', 'Physical measurement transmitter'),
('ACTUATOR', 'Field Actuator', 'Physical control valve or motor'),
('NETWORK_DEVICE', 'Industrial Network Device', 'Managed switch or router'),
('FIREWALL', 'Industrial Firewall', 'Purdue boundary firewall')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO asset_zones (code, name, description) VALUES
('CORPORATE', 'Corporate IT Network', 'Purdue Level 4/5'),
('DMZ', 'Industrial DMZ', 'Purdue Level 3.5'),
('OT', 'Operations Technology Site', 'Purdue Level 3'),
('CONTROL', 'Supervisory Control Zone', 'Purdue Level 2'),
('SAFETY', 'Safety Instrumented System (SIS)', 'Purdue Level 1 (SIS)'),
('FIELD', 'Field Controller & I/O Zone', 'Purdue Level 1'),
('LAB', 'Defensive Simulation Lab', 'Isolated Testbed')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO network_zones (code, name, purdue_level, description) VALUES
('CORPORATE', 'Corporate IT Network', 4, 'Enterprise Zone'),
('DMZ', 'Industrial DMZ', 3, 'Security Gateway DMZ'),
('OT', 'Operations Site', 3, 'Site Operations Zone'),
('CONTROL', 'Control Room HMI', 2, 'Supervisory Control'),
('SAFETY', 'Safety Instrumented Systems', 1, 'Safety Shutdown Zone'),
('FIELD', 'Field Controller Network', 1, 'Field I/O Loop'),
('LAB', 'Defensive Simulation Lab', 0, 'Isolated Lab Zone')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Example ICS Assets (10.10.x.x Lab Subnet)
INSERT INTO assets (asset_uuid, asset_name, hostname, ip_address, mac_address, asset_type_id, vendor, model, firmware_version, zone_id, criticality, status) VALUES
('a-00000000-0000-0000-0000-000000000001', 'SCADA-SRV-01', 'scada-master.lab.internal', '10.10.1.10', '00:1D:9C:A1:00:01', 3, 'Siemens', 'WinCC Professional', 'v7.5', 4, 'CRITICAL', 'ONLINE'),
('a-00000000-0000-0000-0000-000000000002', 'HMI-001', 'hmi-console-01.lab.internal', '10.10.1.15', '00:1D:9C:A1:00:02', 4, 'Schneider Electric', 'Magelis GTU', 'v6.2', 4, 'MEDIUM', 'ONLINE'),
('a-00000000-0000-0000-0000-000000000003', 'ENG-WS-001', 'eng-ws.lab.internal', '10.10.1.20', '00:1D:9C:A1:00:03', 5, 'Siemens', 'TIA Portal v18', 'v18.0', 4, 'HIGH', 'ONLINE'),
('a-00000000-0000-0000-0000-000000000004', 'PLC-001', 'plc-water-01.lab.internal', '10.10.2.101', '00:1D:9C:B2:00:01', 1, 'Rockwell Automation', 'ControlLogix 5580', 'v33.011', 6, 'CRITICAL', 'ONLINE'),
('a-00000000-0000-0000-0000-000000000005', 'PLC-002', 'plc-chem-02.lab.internal', '10.10.2.102', '00:1D:9C:B2:00:02', 1, 'Siemens', 'S7-1500', 'v2.9.2', 6, 'HIGH', 'ONLINE'),
('a-00000000-0000-0000-0000-000000000006', 'RTU-001', 'rtu-feeder-01.lab.internal', '10.10.2.120', '00:1D:9C:B2:00:06', 2, 'SEL', 'SEL-3530 Real-Time Automation Controller', 'v4.1', 6, 'HIGH', 'ONLINE'),
('a-00000000-0000-0000-0000-000000000007', 'SENSOR-001', 'sensor-pt101.lab.internal', '10.10.3.50', '00:1D:9C:C3:00:01', 7, 'Endress+Hauser', 'Cerabar M PMP51', 'v1.0', 6, 'LOW', 'ONLINE'),
('a-00000000-0000-0000-0000-000000000008', 'ACTUATOR-001', 'actuator-valv201.lab.internal', '10.10.3.60', '00:1D:9C:C3:00:02', 8, 'Auma', 'SAEx 07.2', 'v2.1', 6, 'MEDIUM', 'ONLINE')
ON DUPLICATE KEY UPDATE asset_name=VALUES(asset_name);

-- 4. Protocols
INSERT INTO protocols (code, name, default_port, layer, description) VALUES
('Modbus/TCP', 'Modbus TCP Protocol', 502, 'Application Layer', 'Standard industrial master-slave polling protocol'),
('DNP3', 'Distributed Network Protocol 3', 20000, 'Application Layer', 'SCADA telecontrol protocol used in utilities'),
('OPC UA', 'OPC Unified Architecture', 4840, 'Application Layer', 'Cross-platform industrial automation protocol'),
('S7', 'Siemens S7 Communication', 102, 'Application Layer', 'Proprietary Siemens PLC communication protocol'),
('EtherNet/IP', 'EtherNet Industrial Protocol', 44818, 'Application Layer', 'Common Industrial Protocol (CIP) over TCP/IP')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Telemetry Metrics for Assets
INSERT INTO telemetry_metrics (asset_id, metric_name, metric_type, unit, normal_min, normal_max, description) VALUES
(4, 'primary_pressure', 'pressure', 'PSI', 30.0, 60.0, 'Primary Water Pump Pressure'),
(5, 'reactor_temperature', 'temperature', '°C', 20.0, 80.0, 'Chemical Dosing Reactor Temperature'),
(6, 'feeder_voltage', 'voltage', 'kV', 11.5, 12.5, 'Substation Busbar Voltage')
ON DUPLICATE KEY UPDATE metric_name=VALUES(metric_name);

-- 6. Event Types & Severities
INSERT INTO event_types (code, name, description) VALUES
('NETWORK_ANOMALY', 'Network Anomalous Flow', 'Unusual bandwidth or packet rate'),
('PROTOCOL_ANOMALY', 'Protocol Malformation / Unauthorized Function Code', 'Anomalous protocol header or coil write'),
('DEVICE_ANOMALY', 'Device Firmware or State Change', 'Unexpected restart or CPU stop command'),
('PROCESS_ANOMALY', 'Physical Process Out of Bounds', 'Sensor reading exceeding safety thresholds'),
('AUTHENTICATION_ANOMALY', 'Authentication Anomaly', 'Failed operator logins or credential abuse'),
('CONFIGURATION_ANOMALY', 'Unauthorized Configuration Modification', 'Logic block or coil write attempt'),
('BEHAVIORAL_ANOMALY', 'Behavioral Sequence Deviation', 'Deviating message sequence'),
('UNKNOWN_EVENT', 'Unclassified Event', 'General unclassified security telemetry')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 7. Verified MITRE ATT&CK for ICS (v14) Records
INSERT INTO mitre_tactics (tactic_id, name, description) VALUES
('TA0108', 'Inhibit Process Control', 'Block or distort control signals'),
('TA0105', 'Impair Process Control', 'Unauthorized modification of control variables'),
('TA0109', 'Impact', 'Damage or disruption to industrial assets')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO mitre_techniques (technique_id, name, tactic_id, description, version, reference_url) VALUES
('T0855', 'Unauthorized Command Message', 'TA0105', 'Adversaries may send unauthorized command messages to control functions.', 'v14', 'https://attack.mitre.org/techniques/T0855/'),
('T0826', 'Loss of Availability', 'TA0109', 'Adversaries may cause a loss of availability of control services.', 'v14', 'https://attack.mitre.org/techniques/T0826/'),
('T0886', 'Remote Services', 'TA0108', 'Adversaries may abuse remote services like Modbus/DNP3.', 'v14', 'https://attack.mitre.org/techniques/T0886/'),
('T0836', 'Modify Parameter', 'TA0105', 'Adversaries may modify parameter settings on industrial devices.', 'v14', 'https://attack.mitre.org/techniques/T0836/')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. Attack Simulation Scenarios
INSERT INTO simulation_scenarios (scenario_uuid, scenario_name, description, severity, enabled) VALUES
('s-00000000-0000-0000-0000-000000000001', 'NORMAL_OPERATION', 'Baseline synthetic telemetry simulation', 'LOW', TRUE),
('s-00000000-0000-0000-0000-000000000002', 'UNAUTHORIZED_MODBUS_WRITE', 'FC06 Modbus coil write injection targeting PLC-001', 'CRITICAL', TRUE),
('s-00000000-0000-0000-0000-000000000003', 'DNP3_BURST_FLOOD', 'Unsolicited DNP3 response flood targeting RTU-001', 'HIGH', TRUE),
('s-00000000-0000-0000-0000-000000000004', 'S7_STOP_COMMAND', 'Inject S7 CPU Stop request targeting PLC-002', 'CRITICAL', TRUE)
ON DUPLICATE KEY UPDATE scenario_name=VALUES(scenario_name);

-- 9. Non-Destructive Response Actions
INSERT INTO response_actions (code, name, is_controlled) VALUES
('INVESTIGATE', 'Initiate Operator Forensic Investigation', TRUE),
('COLLECT_EVIDENCE', 'Capture Telemetry Packet Dump', TRUE),
('ACKNOWLEDGE_ALERT', 'Acknowledge Alert in SOC Console', TRUE),
('ESCALATE', 'Escalate Case to Incident Response Team', TRUE),
('SIMULATE_ISOLATION', 'Simulate Industrial Firewall Block Rule', TRUE),
('SIMULATE_BLOCK', 'Simulate Modbus Port Rate Limit', TRUE),
('VALIDATE_PROCESS', 'Request Sensor Physical Verification', TRUE),
('CLOSE_INCIDENT', 'Close Resolved Case', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 10. System Settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('system_name', 'ICS-SHIELD Defensive Research Platform', 'STRING', 'Platform display identifier'),
('environment', 'LAB_SIMULATION', 'STRING', 'Active execution environment'),
('timezone', 'UTC', 'STRING', 'Database default time reference'),
('alert_retention_days', '90', 'NUMBER', 'Retention duration for security alerts'),
('telemetry_retention_days', '30', 'NUMBER', 'Retention duration for raw telemetry readings'),
('simulation_enabled', 'true', 'BOOLEAN', 'Lab attack simulation toggle'),
('maintenance_mode', 'false', 'BOOLEAN', 'Maintenance state toggle')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
