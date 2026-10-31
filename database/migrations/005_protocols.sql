-- Migration 005: Industrial Protocol Telemetry Metadata

CREATE TABLE IF NOT EXISTS protocols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    default_port INT NULL,
    layer VARCHAR(50) NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS protocol_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_uuid VARCHAR(36) NOT NULL UNIQUE,
    protocol_id INT NOT NULL,
    source_asset_id INT NULL,
    destination_asset_id INT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_ps_proto FOREIGN KEY (protocol_id) REFERENCES protocols(id),
    CONSTRAINT fk_ps_src FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_dst FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS protocol_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_uuid VARCHAR(36) NOT NULL UNIQUE,
    timestamp DATETIME(3) NOT NULL,
    protocol_id INT NOT NULL,
    source_asset_id INT NULL,
    destination_asset_id INT NULL,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    source_port INT NULL,
    destination_port INT NULL,
    function_code VARCHAR(50) NULL,
    request_type VARCHAR(100) NULL,
    response_status VARCHAR(50) NULL,
    payload_metadata JSON NULL,
    anomaly_flag BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pe_proto FOREIGN KEY (protocol_id) REFERENCES protocols(id),
    CONSTRAINT fk_pe_src FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_pe_dst FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_pe_ts_proto (timestamp, protocol_id),
    INDEX idx_pe_ips (source_ip, destination_ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
