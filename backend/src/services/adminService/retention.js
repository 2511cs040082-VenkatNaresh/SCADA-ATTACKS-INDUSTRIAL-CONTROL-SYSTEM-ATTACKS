import { query } from '../../config/database.js';
import { createAuditLog } from '../audit.service.js';
import { broadcastMessage } from '../websocket.service.js';
import { cryptoUUID } from '../../utils/uuid.js';

const defaultPolicies = [
  { id: 1, policyUuid: 'ret-001', category: 'telemetry', retentionDays: 30, isEnabled: true, description: 'Raw SCADA sensor telemetry and process metrics', preserveEvidenceOverride: true },
  { id: 2, policyUuid: 'ret-002', category: 'events', retentionDays: 60, isEnabled: true, description: 'Security and operational system events', preserveEvidenceOverride: true },
  { id: 3, policyUuid: 'ret-003', category: 'network_flows', retentionDays: 30, isEnabled: true, description: 'Network packet headers and flow logs', preserveEvidenceOverride: true },
  { id: 4, policyUuid: 'ret-004', category: 'protocol_events', retentionDays: 60, isEnabled: true, description: 'Modbus, DNP3, Ethernet/IP protocol transactions', preserveEvidenceOverride: true },
  { id: 5, policyUuid: 'ret-005', category: 'detections', retentionDays: 90, isEnabled: true, description: 'Rule and behavioral detection triggers', preserveEvidenceOverride: true },
  { id: 6, policyUuid: 'ret-006', category: 'anomalies', retentionDays: 90, isEnabled: true, description: 'Statistical Z-score and EWMA anomalies', preserveEvidenceOverride: true },
  { id: 7, policyUuid: 'ret-007', category: 'ml_predictions', retentionDays: 90, isEnabled: true, description: 'Isolation Forest ML inference predictions', preserveEvidenceOverride: true },
  { id: 8, policyUuid: 'ret-008', category: 'alerts', retentionDays: 180, isEnabled: true, description: 'Correlated SOC Security Alerts', preserveEvidenceOverride: true },
  { id: 9, policyUuid: 'ret-009', category: 'incidents', retentionDays: 365, isEnabled: true, description: 'Investigation case files and evidence metadata', preserveEvidenceOverride: true },
  { id: 10, policyUuid: 'ret-010', category: 'evidence', retentionDays: 365, isEnabled: true, description: 'SHA-256 evidence files and artifacts', preserveEvidenceOverride: true },
  { id: 11, policyUuid: 'ret-011', category: 'simulation_runs', retentionDays: 60, isEnabled: true, description: 'Attack simulation laboratory execution traces', preserveEvidenceOverride: false },
  { id: 12, policyUuid: 'ret-012', category: 'reports', retentionDays: 180, isEnabled: true, description: 'Generated PDF/CSV/JSON security reports', preserveEvidenceOverride: false },
  { id: 13, policyUuid: 'ret-013', category: 'audit_logs', retentionDays: 365, isEnabled: true, description: 'Immutable application administrative audit records', preserveEvidenceOverride: true }
];

let retentionMap = new Map();
defaultPolicies.forEach(p => retentionMap.set(p.category, { ...p }));

export async function getRetentionPolicies() {
  try {
    const rows = await query(`
      SELECT id, policy_uuid AS policyUuid, category, retention_days AS retentionDays,
             is_enabled AS isEnabled, description, preserve_evidence_override AS preserveEvidenceOverride,
             updated_at AS updatedAt
      FROM retention_policies
    `);

    if (rows && rows.length > 0) {
      rows.forEach(r => {
        retentionMap.set(r.category, {
          id: r.id,
          policyUuid: r.policyUuid,
          category: r.category,
          retentionDays: r.retentionDays,
          isEnabled: Boolean(r.isEnabled),
          description: r.description,
          preserveEvidenceOverride: Boolean(r.preserveEvidenceOverride),
          updatedAt: r.updatedAt
        });
      });
    }
  } catch (err) {
    // Fallback
  }

  return Array.from(retentionMap.values());
}

export async function updateRetentionPolicy(category, { retentionDays, isEnabled, preserveEvidenceOverride }, actorId = null) {
  const policies = await getRetentionPolicies();
  const policy = policies.find(p => p.category.toLowerCase() === category.toLowerCase());

  if (!policy) {
    throw new Error(`Retention policy for category '${category}' not found.`);
  }

  if (retentionDays !== undefined && (retentionDays < 1 || retentionDays > 3650)) {
    throw new Error('Retention days must be between 1 and 3650 days.');
  }

  // Preservation safety check
  if (category === 'incidents' || category === 'evidence') {
    if (preserveEvidenceOverride === false) {
      throw new Error('Preservation override protection cannot be disabled for Active Incident Evidence categories.');
    }
  }

  const updatedDays = retentionDays !== undefined ? retentionDays : policy.retentionDays;
  const updatedEnabled = isEnabled !== undefined ? Boolean(isEnabled) : policy.isEnabled;
  const updatedPreserve = preserveEvidenceOverride !== undefined ? Boolean(preserveEvidenceOverride) : policy.preserveEvidenceOverride;

  try {
    await query(`
      UPDATE retention_policies
      SET retention_days = ?, is_enabled = ?, preserve_evidence_override = ?, updated_at = NOW()
      WHERE category = ?
    `, [updatedDays, updatedEnabled ? 1 : 0, updatedPreserve ? 1 : 0, policy.category]);
  } catch (err) {
    // Fallback
  }

  policy.retentionDays = updatedDays;
  policy.isEnabled = updatedEnabled;
  policy.preserveEvidenceOverride = updatedPreserve;
  policy.updatedAt = new Date().toISOString();
  retentionMap.set(policy.category, policy);

  await createAuditLog({
    userId: actorId,
    action: 'RETENTION_CHANGED',
    resourceType: 'RETENTION_POLICY',
    resourceId: policy.category,
    result: 'SUCCESS',
    details: { retentionDays: updatedDays, isEnabled: updatedEnabled, preserveEvidenceOverride: updatedPreserve }
  });

  broadcastMessage('admin.configuration_changed', { category: 'retention', retentionPolicy: policy });

  return policy;
}
