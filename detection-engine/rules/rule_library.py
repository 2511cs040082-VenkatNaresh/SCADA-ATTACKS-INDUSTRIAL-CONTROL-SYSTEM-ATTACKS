"""
ICS-SHIELD Phase 8 Rule Library
Contains definitions for the 13 required ICS defensive detection rules.
"""

INITIAL_RULES = [
    {
        "rule_uuid": "RULE-001-ASSET-COMM",
        "rule_name": "Unexpected Asset Communication",
        "description": "Communication between assets not in communication baseline",
        "category": "NETWORK_ANOMALY",
        "protocol": "ANY",
        "severity": "HIGH",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "is_in_baseline", "operator": "==", "value": False},
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.90,
        "mitre_tactic_id": "TA0102",
        "mitre_technique_id": "T0843"
    },
    {
        "rule_uuid": "RULE-002-UNEXP-PROTO",
        "rule_name": "Unexpected Protocol",
        "description": "Unbaselined protocol traffic detected between assets",
        "category": "PROTOCOL_ANOMALY",
        "protocol": "ANY",
        "severity": "MEDIUM",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "protocol_matched", "operator": "==", "value": False},
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.85,
        "mitre_tactic_id": "TA0104",
        "mitre_technique_id": "T0855"
    },
    {
        "rule_uuid": "RULE-003-MODBUS-FC",
        "rule_name": "Unexpected Modbus Function",
        "description": "Modbus function code outside normal operational whitelist",
        "category": "COMMAND_ANOMALY",
        "protocol": "MODBUS_TCP",
        "severity": "HIGH",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "function_code", "operator": "NOT_IN", "value": [1, 2, 3, 4, 5, 6, 15, 16]},
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.95,
        "mitre_tactic_id": "TA0104",
        "mitre_technique_id": "T0855"
    },
    {
        "rule_uuid": "RULE-004-MODBUS-WRITE",
        "rule_name": "Unauthorized Modbus Write",
        "description": "Modbus write operation issued by non-authoritative host",
        "category": "UNAUTHORIZED_WRITE",
        "protocol": "MODBUS_TCP",
        "severity": "CRITICAL",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {
            "logical": "AND",
            "conditions": [
                {"field": "is_write_function", "operator": "==", "value": True},
                {"field": "source_role", "operator": "!=", "value": "HMI"}
            ]
        },
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 180,
        "confidence": 0.98,
        "mitre_tactic_id": "TA0105",
        "mitre_technique_id": "T0836"
    },
    {
        "rule_uuid": "RULE-005-MODBUS-RATE",
        "rule_name": "Excessive Modbus Request Rate",
        "description": "High frequency Modbus requests exceeding safety threshold",
        "category": "TRAFFIC_SPIKE",
        "protocol": "MODBUS_TCP",
        "severity": "MEDIUM",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "request_rate_per_sec", "operator": ">", "value": 50},
        "threshold": 50,
        "time_window": 10,
        "cooldown_seconds": 300,
        "confidence": 0.85,
        "mitre_tactic_id": "TA0106",
        "mitre_technique_id": "T0814"
    },
    {
        "rule_uuid": "RULE-006-MODBUS-TIMEOUT",
        "rule_name": "Modbus Response Timeout",
        "description": "Modbus request sent without PLC response",
        "category": "COMM_FAILURE",
        "protocol": "MODBUS_TCP",
        "severity": "MEDIUM",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "response_status", "operator": "==", "value": "TIMEOUT"},
        "threshold": 3,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.80,
        "mitre_tactic_id": "TA0106",
        "mitre_technique_id": "T0826"
    },
    {
        "rule_uuid": "RULE-007-MODBUS-EXCEPT",
        "rule_name": "Modbus Exception Spike",
        "description": "Elevated rate of Modbus exception responses from target PLC",
        "category": "PROTOCOL_ERROR",
        "protocol": "MODBUS_TCP",
        "severity": "HIGH",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "exception_rate_per_min", "operator": ">", "value": 5},
        "threshold": 5,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.90,
        "mitre_tactic_id": "TA0102",
        "mitre_technique_id": "T0843"
    },
    {
        "rule_uuid": "RULE-008-MODBUS-UNKFC",
        "rule_name": "Unknown Modbus Function",
        "description": "Non-standard or reserved Modbus function code detected",
        "category": "MALFORMED_TRAFFIC",
        "protocol": "MODBUS_TCP",
        "severity": "HIGH",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "is_valid_fc", "operator": "==", "value": False},
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.95,
        "mitre_tactic_id": "TA0104",
        "mitre_technique_id": "T0855"
    },
    {
        "rule_uuid": "RULE-009-UNEXP-DIR",
        "rule_name": "Unexpected Direction",
        "description": "Protocol traffic initiated in prohibited direction (e.g., PLC to HMI)",
        "category": "FLOW_ANOMALY",
        "protocol": "MODBUS_TCP",
        "severity": "HIGH",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {
            "logical": "AND",
            "conditions": [
                {"field": "source_type", "operator": "==", "value": "PLC"},
                {"field": "destination_type", "operator": "==", "value": "HMI"}
            ]
        },
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.92,
        "mitre_tactic_id": "TA0108",
        "mitre_technique_id": "T0886"
    },
    {
        "rule_uuid": "RULE-010-NEW-PARTNER",
        "rule_name": "New Communication Partner",
        "description": "First observed connection between an asset and a new IP/MAC address",
        "category": "NETWORK_ANOMALY",
        "protocol": "ANY",
        "severity": "LOW",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "is_known_partner", "operator": "==", "value": False},
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 600,
        "confidence": 0.75,
        "mitre_tactic_id": "TA0102",
        "mitre_technique_id": "T0843"
    },
    {
        "rule_uuid": "RULE-011-CORRELATION",
        "rule_name": "Process/Network Correlation",
        "description": "Network write command correlates with severe process threshold breach",
        "category": "PROCESS_ANOMALY",
        "protocol": "MODBUS_TCP",
        "severity": "CRITICAL",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {
            "logical": "AND",
            "conditions": [
                {"field": "network_write_detected", "operator": "==", "value": True},
                {"field": "process_anomaly_detected", "operator": "==", "value": True}
            ]
        },
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 120,
        "confidence": 0.99,
        "mitre_tactic_id": "TA0105",
        "mitre_technique_id": "T0836"
    },
    {
        "rule_uuid": "RULE-012-ASSET-STATE",
        "rule_name": "Asset State Anomaly",
        "description": "Asset transmitting telemetry while in degraded or critical state",
        "category": "ASSET_ANOMALY",
        "protocol": "ANY",
        "severity": "HIGH",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {"field": "asset_health_status", "operator": "IN", "value": ["CRITICAL", "OFFLINE_UNEXPECTED", "DEGRADED"]},
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.88,
        "mitre_tactic_id": "TA0106",
        "mitre_technique_id": "T0816"
    },
    {
        "rule_uuid": "RULE-013-PORT-MISMATCH",
        "rule_name": "Protocol Port Mismatch",
        "description": "Modbus TCP traffic detected on non-standard port or non-Modbus on port 502",
        "category": "PORT_ANOMALY",
        "protocol": "ANY",
        "severity": "MEDIUM",
        "enabled": True,
        "version": "1.0.0",
        "condition_json": {
            "logical": "OR",
            "conditions": [
                {
                    "logical": "AND",
                    "conditions": [
                        {"field": "detected_protocol", "operator": "==", "value": "MODBUS_TCP"},
                        {"field": "destination_port", "operator": "!=", "value": 502}
                    ]
                },
                {
                    "logical": "AND",
                    "conditions": [
                        {"field": "destination_port", "operator": "==", "value": 502},
                        {"field": "detected_protocol", "operator": "!=", "value": "MODBUS_TCP"}
                    ]
                }
            ]
        },
        "threshold": 1,
        "time_window": 60,
        "cooldown_seconds": 300,
        "confidence": 0.85,
        "mitre_tactic_id": "TA0104",
        "mitre_technique_id": "T0885"
    }
]
