-- Migration 004: Network & Purdue Model Topology

CREATE TABLE IF NOT EXISTS network_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    purdue_level INT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS network_segments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    segment_name VARCHAR(100) NOT NULL,
    cidr_block VARCHAR(45) NOT NULL,
    vlan_id INT NULL,
    description TEXT NULL,
    CONSTRAINT fk_net_seg_zone FOREIGN KEY (zone_id) REFERENCES network_zones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS network_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_asset_id INT NOT NULL,
    destination_asset_id INT NOT NULL,
    protocol VARCHAR(50) NULL,
    port INT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_net_conn_src FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_net_conn_dst FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_asset_id INT NOT NULL,
    child_asset_id INT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rel_parent FOREIGN KEY (parent_asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_rel_child FOREIGN KEY (child_asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
