import { query } from '../../config/database.js';
import { createAuditLog } from '../audit.service.js';
import { broadcastMessage } from '../websocket.service.js';
import { recordConfigHistory } from './versioning.js';

// In-memory fallback configuration settings catalog
const settingsCatalogMap = new Map();

// Initialize default settings across 16 categories
const defaultSettingsList = [
  // General
  { key: 'system_name', category: 'General', value: 'ICS-SHIELD Defensive Platform', type: 'STRING', defaultValue: 'ICS-SHIELD Defensive Platform', description: 'Name of the SCADA/ICS Defense Platform', isDangerous: false, version: 1 },
  { key: 'organization_name', category: 'General', value: 'Industrial Defense Corp', type: 'STRING', defaultValue: 'Industrial Defense Corp', description: 'Organization or Facility Name', isDangerous: false, version: 1 },
  { key: 'environment_mode', category: 'General', value: 'LAB_SIMULATION', type: 'STRING', defaultValue: 'LAB_SIMULATION', description: 'Operating environment (LAB_SIMULATION or LIVE)', isDangerous: true, version: 1 },
  { key: 'maintenance_mode', category: 'General', value: 'false', type: 'BOOLEAN', defaultValue: 'false', description: 'Enable system-wide maintenance mode', isDangerous: true, version: 1 },

  // Security
  { key: 'session_timeout_minutes', category: 'Security', value: '60', type: 'NUMBER', defaultValue: '60', min: 5, max: 1440, description: 'User session inactivity timeout in minutes', isDangerous: false, version: 1 },
  { key: 'refresh_token_lifetime_days', category: 'Security', value: '7', type: 'NUMBER', defaultValue: '7', min: 1, max: 30, description: 'JWT Refresh Token lifetime in days', isDangerous: false, version: 1 },
  { key: 'password_min_length', category: 'Security', value: '8', type: 'NUMBER', defaultValue: '8', min: 6, max: 32, description: 'Minimum password character length', isDangerous: false, version: 1 },
  { key: 'failed_login_threshold', category: 'Security', value: '5', type: 'NUMBER', defaultValue: '5', min: 3, max: 10, description: 'Max failed logins before account lock', isDangerous: false, version: 1 },
  { key: 'account_lock_duration_minutes', category: 'Security', value: '15', type: 'NUMBER', defaultValue: '15', min: 1, max: 1440, description: 'Account lock duration after consecutive failed logins', isDangerous: false, version: 1 },
  { key: 'api_rate_limit_per_min', category: 'Security', value: '300', type: 'NUMBER', defaultValue: '300', min: 50, max: 10000, description: 'API endpoint rate limit per minute', isDangerous: false, version: 1 },
  { key: 'websocket_max_connections', category: 'Security', value: '100', type: 'NUMBER', defaultValue: '100', min: 10, max: 1000, description: 'Max concurrent WebSocket client connections', isDangerous: false, version: 1 },

  // Telemetry
  { key: 'telemetry_collection_enabled', category: 'Telemetry', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Master toggle for real-time telemetry ingestion', isDangerous: true, version: 1 },
  { key: 'telemetry_event_batch_size', category: 'Telemetry', value: '100', type: 'NUMBER', defaultValue: '100', min: 10, max: 1000, description: 'Telemetry batch processing size', isDangerous: false, version: 1 },
  { key: 'telemetry_queue_limit', category: 'Telemetry', value: '5000', type: 'NUMBER', defaultValue: '5000', min: 500, max: 50000, description: 'Max in-memory telemetry queue size', isDangerous: false, version: 1 },
  { key: 'telemetry_ws_broadcast_rate', category: 'Telemetry', value: '10', type: 'NUMBER', defaultValue: '10', min: 1, max: 100, description: 'Max telemetry broadcasts per second', isDangerous: false, version: 1 },

  // Detection
  { key: 'detection_engine_enabled', category: 'Detection', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Master toggle for rule-based detection engine', isDangerous: true, version: 1 },
  { key: 'detection_max_active_rules', category: 'Detection', value: '500', type: 'NUMBER', defaultValue: '500', min: 10, max: 2000, description: 'Maximum active detection rules limit', isDangerous: false, version: 1 },
  { key: 'detection_cooldown_sec', category: 'Detection', value: '30', type: 'NUMBER', defaultValue: '30', min: 0, max: 3600, description: 'Rule trigger cooldown period in seconds', isDangerous: false, version: 1 },
  { key: 'detection_suppression_window_sec', category: 'Detection', value: '300', type: 'NUMBER', defaultValue: '300', min: 10, max: 86400, description: 'Rule suppression window', isDangerous: false, version: 1 },

  // Behavior
  { key: 'behavior_baseline_window_hours', category: 'Behavior', value: '168', type: 'NUMBER', defaultValue: '168', min: 24, max: 720, description: 'Behavioral baseline training window in hours', isDangerous: false, version: 1 },
  { key: 'behavior_min_sample_size', category: 'Behavior', value: '100', type: 'NUMBER', defaultValue: '100', min: 20, max: 10000, description: 'Minimum telemetry samples required for valid baseline', isDangerous: false, version: 1 },
  { key: 'behavior_ewma_alpha', category: 'Behavior', value: '0.15', type: 'NUMBER', defaultValue: '0.15', min: 0.01, max: 0.99, description: 'EWMA alpha smoothing parameter', isDangerous: false, version: 1 },
  { key: 'behavior_zscore_threshold', category: 'Behavior', value: '3.0', type: 'NUMBER', defaultValue: '3.0', min: 1.5, max: 6.0, description: 'Z-score threshold for statistical anomaly detection', isDangerous: false, version: 1 },
  { key: 'behavior_exclude_simulation', category: 'Behavior', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Strictly exclude simulation data from production baselines', isDangerous: true, version: 1 },

  // ML
  { key: 'ml_inference_enabled', category: 'ML', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Master toggle for Machine Learning anomaly inference', isDangerous: true, version: 1 },
  { key: 'ml_drift_threshold', category: 'ML', value: '0.15', type: 'NUMBER', defaultValue: '0.15', min: 0.01, max: 0.5, description: 'Drift score threshold requiring model validation', isDangerous: false, version: 1 },
  { key: 'ml_confidence_cutoff', category: 'ML', value: '0.70', type: 'NUMBER', defaultValue: '0.70', min: 0.5, max: 0.99, description: 'Minimum ML prediction confidence score', isDangerous: false, version: 1 },
  { key: 'ml_auto_activate_validated', category: 'ML', value: 'false', type: 'BOOLEAN', defaultValue: 'false', description: 'Allow automatic activation of newly trained ML models', isDangerous: true, version: 1 },

  // Alerts
  { key: 'alert_deduplication_window_sec', category: 'Alerts', value: '120', type: 'NUMBER', defaultValue: '120', min: 10, max: 3600, description: 'Deduplication window in seconds', isDangerous: false, version: 1 },
  { key: 'alert_correlation_window_sec', category: 'Alerts', value: '600', type: 'NUMBER', defaultValue: '600', min: 60, max: 7200, description: 'Alert correlation window in seconds', isDangerous: false, version: 1 },
  { key: 'alert_sla_high_minutes', category: 'Alerts', value: '30', type: 'NUMBER', defaultValue: '30', min: 5, max: 240, description: 'SLA target for High severity alerts in minutes', isDangerous: false, version: 1 },

  // Incidents
  { key: 'incident_auto_creation_enabled', category: 'Incidents', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Auto-create incidents from correlated high-severity alerts', isDangerous: false, version: 1 },
  { key: 'incident_escalation_timeout_min', category: 'Incidents', value: '60', type: 'NUMBER', defaultValue: '60', min: 15, max: 1440, description: 'Unassigned incident escalation timeout in minutes', isDangerous: false, version: 1 },

  // MITRE
  { key: 'mitre_active_version', category: 'MITRE', value: 'v14.1', type: 'STRING', defaultValue: 'v14.1', description: 'Active MITRE ATT&CK for ICS matrix version', isDangerous: false, version: 1 },
  { key: 'mitre_auto_mapping_enabled', category: 'MITRE', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Automatically map detections to MITRE techniques', isDangerous: false, version: 1 },

  // Response
  { key: 'response_engine_enabled', category: 'Response', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Master toggle for Defense & Response Engine', isDangerous: true, version: 1 },
  { key: 'response_default_approval_policy', category: 'Response', value: 'ADMIN_APPROVAL', type: 'STRING', defaultValue: 'ADMIN_APPROVAL', description: 'Default policy for response execution approval', isDangerous: true, version: 1 },
  { key: 'response_disallow_self_approval', category: 'Response', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Enforce Separation of Duties (plan creator cannot approve)', isDangerous: true, version: 1 },
  { key: 'response_simulation_only', category: 'Response', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Enforce laboratory simulation execution only (Fail-Closed)', isDangerous: true, version: 1 },

  // Simulation
  { key: 'simulation_enabled', category: 'Simulation', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Master toggle for ICS Attack Simulation Laboratory', isDangerous: true, version: 1 },
  { key: 'simulation_training_mode', category: 'Simulation', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Allow SOC Operator Training Mode with interactive hints', isDangerous: false, version: 1 },
  { key: 'simulation_max_duration_min', category: 'Simulation', value: '60', type: 'NUMBER', defaultValue: '60', min: 5, max: 360, description: 'Maximum allowed simulation run duration in minutes', isDangerous: false, version: 1 },
  { key: 'simulation_max_event_rate', category: 'Simulation', value: '50', type: 'NUMBER', defaultValue: '50', min: 1, max: 500, description: 'Max synthetic events per second limit', isDangerous: false, version: 1 },
  { key: 'simulation_require_scenario_approval', category: 'Simulation', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Require scenario approval before execution', isDangerous: true, version: 1 },
  { key: 'simulation_baseline_exclusion', category: 'Simulation', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Strictly exclude simulation events from production baselines', isDangerous: true, version: 1 },

  // Reports
  { key: 'report_daily_generation_limit', category: 'Reports', value: '50', type: 'NUMBER', defaultValue: '50', min: 5, max: 500, description: 'Max report generations per day', isDangerous: false, version: 1 },
  { key: 'report_auto_scheduler_enabled', category: 'Reports', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Enable recurring report schedule processor', isDangerous: false, version: 1 },

  // Retention
  { key: 'retention_default_days', category: 'Retention', value: '30', type: 'NUMBER', defaultValue: '30', min: 7, max: 365, description: 'Default global data retention period in days', isDangerous: false, version: 1 },
  { key: 'retention_preserve_evidence', category: 'Retention', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Preserve evidence linked to active incidents regardless of age', isDangerous: true, version: 1 },

  // Logging
  { key: 'logging_level', category: 'Logging', value: 'INFO', type: 'STRING', defaultValue: 'INFO', description: 'System log verbosity level (DEBUG, INFO, WARN, ERROR)', isDangerous: false, version: 1 },
  { key: 'logging_audit_all_edits', category: 'Logging', value: 'true', type: 'BOOLEAN', defaultValue: 'true', description: 'Record comprehensive audit logs for all setting mutations', isDangerous: false, version: 1 },

  // WebSocket
  { key: 'ws_heartbeat_interval_sec', category: 'WebSocket', value: '15', type: 'NUMBER', defaultValue: '15', min: 5, max: 60, description: 'WebSocket client heartbeat ping interval', isDangerous: false, version: 1 },

  // Performance
  { key: 'db_pool_max_connections', category: 'Performance', value: '20', type: 'NUMBER', defaultValue: '20', min: 5, max: 100, description: 'Database connection pool max size', isDangerous: false, version: 1 }
];

// Initialize in-memory map
defaultSettingsList.forEach(s => settingsCatalogMap.set(s.key, { ...s }));

export async function getAllSettings() {
  try {
    const rows = await query(`
      SELECT setting_key AS \`key\`, category, setting_value AS \`value\`, setting_type AS \`type\`,
             default_value AS defaultValue, description, min_value AS min, max_value AS max,
             is_dangerous AS isDangerous, version, updated_at AS updatedAt
      FROM system_settings
    `);

    if (rows && rows.length > 0) {
      rows.forEach(r => {
        const existing = settingsCatalogMap.get(r.key) || {};
        settingsCatalogMap.set(r.key, {
          ...existing,
          key: r.key,
          category: r.category || existing.category || 'General',
          value: r.value,
          type: r.type || existing.type || 'STRING',
          defaultValue: r.defaultValue || existing.defaultValue,
          description: r.description || existing.description,
          min: r.min !== null ? r.min : existing.min,
          max: r.max !== null ? r.max : existing.max,
          isDangerous: Boolean(r.isDangerous),
          version: r.version || 1,
          updatedAt: r.updatedAt
        });
      });
    }
  } catch (err) {
    // Fallback
  }

  return Array.from(settingsCatalogMap.values());
}

export async function getSettingsByCategory(category) {
  const all = await getAllSettings();
  if (!category) return all;
  return all.filter(s => s.category.toLowerCase() === category.toLowerCase());
}

export async function updateSetting(key, newValue, changeReason = 'Administrative configuration edit', actorId = null) {
  const all = await getAllSettings();
  const setting = all.find(s => s.key === key);
  if (!setting) {
    throw new Error(`Setting key '${key}' not found in configuration catalog.`);
  }

  // Value Validation
  let validatedValue = String(newValue).trim();

  if (setting.type === 'NUMBER') {
    const num = Number(validatedValue);
    if (isNaN(num)) {
      throw new Error(`Setting '${key}' expects a valid numeric value.`);
    }
    if (setting.min !== undefined && setting.min !== null && num < setting.min) {
      throw new Error(`Setting '${key}' value ${num} is below minimum allowed bound of ${setting.min}.`);
    }
    if (setting.max !== undefined && setting.max !== null && num > setting.max) {
      throw new Error(`Setting '${key}' value ${num} exceeds maximum allowed bound of ${setting.max}.`);
    }
  } else if (setting.type === 'BOOLEAN') {
    if (!['true', 'false', '1', '0'].includes(validatedValue.toLowerCase())) {
      throw new Error(`Setting '${key}' expects a boolean string ('true' or 'false').`);
    }
    validatedValue = validatedValue.toLowerCase() === 'true' || validatedValue === '1' ? 'true' : 'false';
  }

  const previousValue = setting.value;
  const newVersion = (setting.version || 1) + 1;

  try {
    await query(`
      UPDATE system_settings
      SET setting_value = ?, version = ?, updated_at = NOW()
      WHERE setting_key = ?
    `, [validatedValue, newVersion, key]);
  } catch (err) {
    // Fallback
  }

  // Update in-memory catalog
  setting.value = validatedValue;
  setting.version = newVersion;
  setting.updatedAt = new Date().toISOString();
  settingsCatalogMap.set(key, setting);

  // Record Configuration History & Versioning
  await recordConfigHistory({
    category: setting.category,
    settingKey: key,
    previousValue,
    newValue: validatedValue,
    version: newVersion,
    changeReason,
    changedBy: actorId
  });

  // Create Audit Log
  const actionName = setting.category.toUpperCase() + '_CONFIG_CHANGED';
  await createAuditLog({
    userId: actorId,
    action: 'CONFIGURATION_CHANGED',
    resourceType: 'SETTING',
    resourceId: key,
    result: 'SUCCESS',
    details: { category: setting.category, key, previousValue, newValue: validatedValue, version: newVersion, reason: changeReason }
  });

  // Broadcast Real-time Admin Event over WebSocket
  broadcastMessage('admin.configuration_changed', {
    category: setting.category,
    settingKey: key,
    previousValue,
    newValue: validatedValue,
    version: newVersion
  });

  return setting;
}

export async function updateCategorySettings(category, settingsMap, changeReason, actorId = null) {
  const updatedResults = [];
  for (const [key, value] of Object.entries(settingsMap)) {
    const res = await updateSetting(key, value, changeReason, actorId);
    updatedResults.push(res);
  }
  return updatedResults;
}
