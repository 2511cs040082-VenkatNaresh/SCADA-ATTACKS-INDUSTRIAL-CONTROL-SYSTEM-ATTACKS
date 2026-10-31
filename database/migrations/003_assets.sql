-- Migration 003: ICS Asset Management

CREATE TABLE IF NOT EXISTS asset_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_uuid VARCHAR(36) NOT NULL UNIQUE,
    asset_name VARCHAR(100) NOT NULL UNIQUE,
    hostname VARCHAR(100) NULL,
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(17) NULL,
    asset_type_id INT NOT NULL,
    vendor VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    firmware_version VARCHAR(50) NULL,
    zone_id INT NULL,
    criticality VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    description TEXT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assets_type FOREIGN KEY (asset_type_id) REFERENCES asset_types(id),
    CONSTRAINT fk_assets_zone FOREIGN KEY (zone_id) REFERENCES asset_zones(id) ON DELETE SET NULL,
    CONSTRAINT chk_asset_criticality CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_interfaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    interface_name VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    mac_address VARCHAR(17) NULL,
    interface_type VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interfaces_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_protocols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    protocol_name VARCHAR(50) NOT NULL,
    port INT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_asset_protocols_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
