export type StatusType = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE' | 'ONLINE' | 'STANDBY';

export type SeverityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SystemHealthData {
  service: string;
  status: string;
  phase: string;
  environment: string;
  version: string;
  uptimeSeconds: number;
  timestamp: string;
  components: {
    api: { status: string };
    database: { status: string; type: string };
    websocket: { status: string };
    detectionEngine: { status: string; url: string };
  };
}

export interface MetricItem {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  status?: StatusType;
  icon?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'PLC' | 'RTU' | 'HMI' | 'SCADA_SERVER' | 'SENSOR' | 'FIREWALL';
  ipAddress: string;
  macAddress?: string;
  firmware?: string;
  status: StatusType;
  criticality: SeverityType;
  protocol: string;
  lastSeen: string;
}

export interface Alert {
  id: string;
  assetId: string;
  assetName: string;
  severity: SeverityType;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
  srcIp?: string;
  destIp?: string;
  protocol?: string;
}

export interface TelemetryTick {
  type: string;
  systemStatus: StatusType;
  activeAlertsCount: number;
  packetRate: number;
  timestamp: string;
}

export interface DetectionRule {
  id: number;
  rule_uuid: string;
  rule_name: string;
  description: string;
  category: string;
  protocol: string;
  severity: SeverityType;
  enabled: boolean | number;
  version: string;
  condition_json: any;
  threshold: number;
  time_window: number;
  cooldown_seconds: number;
  confidence: number;
  mitre_tactic_id?: string;
  mitre_technique_id?: string;
  trigger_count: number;
  last_triggered_at?: string;
}

export interface DetectionResult {
  id: number | string;
  detection_uuid: string;
  rule_id: number | string;
  rule_name?: string;
  category: string;
  protocol: string;
  severity: SeverityType;
  confidence: number;
  source_asset_id?: number | null;
  destination_asset_id?: number | null;
  source_ip: string;
  destination_ip: string;
  status: 'NEW' | 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'BENIGN' | 'NEEDS_REVIEW';
  timestamp?: string;
  created_at?: string;
  evidence_json?: any;
  explanation?: string;
  mitre_tactic_id?: string;
  mitre_technique_id?: string;
  analyst_feedback?: string;
  analyst_comments?: string;
}
