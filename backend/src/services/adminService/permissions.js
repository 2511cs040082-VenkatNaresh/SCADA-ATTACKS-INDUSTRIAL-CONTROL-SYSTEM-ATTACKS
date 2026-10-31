export const ALL_PERMISSIONS = [
  { id: 1, name: 'dashboard.read', category: 'SYSTEM', description: 'View SOC Dashboard and overview metrics' },
  { id: 2, name: 'assets.read', category: 'ASSETS', description: 'View asset inventory and discovery' },
  { id: 3, name: 'assets.create', category: 'ASSETS', description: 'Register new industrial assets' },
  { id: 4, name: 'assets.update', category: 'ASSETS', description: 'Update asset properties and baselines' },
  { id: 5, name: 'assets.delete', category: 'ASSETS', description: 'Remove assets from inventory' },
  { id: 6, name: 'telemetry.read', category: 'TELEMETRY', description: 'View real-time telemetry stream' },
  { id: 7, name: 'network.read', category: 'NETWORK', description: 'View network sessions and protocol monitors' },
  { id: 8, name: 'detections.read', category: 'DETECTION', description: 'View rule and behavioral detections' },
  { id: 9, name: 'detections.manage', category: 'DETECTION', description: 'Configure detection rules and thresholds' },
  { id: 10, name: 'ml.read', category: 'ML', description: 'View ML anomaly models and predictions' },
  { id: 11, name: 'ml.manage', category: 'ML', description: 'Activate, retrain, or configure ML models' },
  { id: 12, name: 'alerts.read', category: 'ALERTS', description: 'View and search SOC alert queue' },
  { id: 13, name: 'alerts.manage', category: 'ALERTS', description: 'Acknowledge, suppress, or assign alerts' },
  { id: 14, name: 'incidents.read', category: 'INCIDENTS', description: 'View investigation cases' },
  { id: 15, name: 'incidents.manage', category: 'INCIDENTS', description: 'Create, assign, or resolve incident cases' },
  { id: 16, name: 'mitre.read', category: 'MITRE', description: 'Browse MITRE ATT&CK for ICS matrices' },
  { id: 17, name: 'mitre.manage', category: 'MITRE', description: 'Manage MITRE dataset mappings and versions' },
  { id: 18, name: 'response.read', category: 'RESPONSE', description: 'View response recommendations and playbooks' },
  { id: 19, name: 'response.manage', category: 'RESPONSE', description: 'Create response plans and playbooks' },
  { id: 20, name: 'response.approve', category: 'RESPONSE', description: 'Approve pending response plans' },
  { id: 21, name: 'response.execute', category: 'RESPONSE', description: 'Execute response actions in lab simulator' },
  { id: 22, name: 'simulation.read', category: 'SIMULATION', description: 'View attack simulation scenarios and runs' },
  { id: 23, name: 'simulation.manage', category: 'SIMULATION', description: 'Create and edit lab simulation scenarios' },
  { id: 24, name: 'simulation.approve', category: 'SIMULATION', description: 'Approve simulation scenarios for execution' },
  { id: 25, name: 'simulation.execute', category: 'SIMULATION', description: 'Start, pause, stop, or reset lab simulations' },
  { id: 26, name: 'reports.read', category: 'REPORTS', description: 'View generated reports library' },
  { id: 27, name: 'reports.create', category: 'REPORTS', description: 'Generate new custom security reports' },
  { id: 28, name: 'reports.export', category: 'REPORTS', description: 'Download PDF/CSV/JSON report exports' },
  { id: 29, name: 'reports.schedule', category: 'REPORTS', description: 'Configure automated report schedules' },
  { id: 30, name: 'users.manage', category: 'ADMIN', description: 'Manage user accounts, passwords, and sessions' },
  { id: 31, name: 'roles.manage', category: 'ADMIN', description: 'Manage RBAC roles and permission mappings' },
  { id: 32, name: 'settings.manage', category: 'ADMIN', description: 'Configure system-wide settings and policies' },
  { id: 33, name: 'audit.read', category: 'ADMIN', description: 'View administrative system audit logs' }
];

export async function getPermissions() {
  return ALL_PERMISSIONS;
}
