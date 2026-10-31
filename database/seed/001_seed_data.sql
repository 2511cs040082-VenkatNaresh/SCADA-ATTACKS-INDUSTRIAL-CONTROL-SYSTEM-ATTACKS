-- ICS-SHIELD Seed Data - Phase 1 Foundation

INSERT INTO assets (id, name, type, ip_address, status, criticality) VALUES
('PLC-WATER-01', 'Primary Water Filtration PLC', 'PLC', '192.168.1.101', 'ONLINE', 'HIGH'),
('RTU-ELEC-04', 'Feeder Substation RTU 04', 'RTU', '192.168.1.120', 'ONLINE', 'CRITICAL'),
('HMI-SOC-MASTER', 'SOC Main Operator Console', 'HMI', '192.168.1.15', 'ONLINE', 'MEDIUM'),
('SCADA-SRV-01', 'Master SCADA Telemetry Server', 'SCADA_SERVER', '192.168.1.10', 'ONLINE', 'CRITICAL')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO alerts (asset_id, severity, alert_type, title, description, status) VALUES
('PLC-WATER-01', 'HIGH', 'UNAUTHORIZED_MODBUS_WRITE', 'Modbus Function Code 06 Executed', 'Unexpected coil register modification detected on Water PLC.', 'NEW'),
('RTU-ELEC-04', 'CRITICAL', 'ANOMALOUS_PACKET_BURST', 'DNP3 Telemetry Flood Detected', 'High volume unsolicited responses received from RTU 04.', 'NEW');
