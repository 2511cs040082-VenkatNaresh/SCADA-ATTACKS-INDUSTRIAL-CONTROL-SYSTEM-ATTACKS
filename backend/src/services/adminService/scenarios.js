import { query } from '../../config/database.js';
import { createAuditLog } from '../audit.service.js';
import { broadcastMessage } from '../websocket.service.js';
import { getBuiltinScenarios } from '../simulationEngine/scenariosRegistry.js';

let scenarioLifecycleMap = new Map();

// Initialize all scenarios from catalog to APPROVED/ENABLED lifecycle state by default
const catalog = getBuiltinScenarios();
catalog.forEach(s => {
  scenarioLifecycleMap.set(s.id, {
    scenarioId: s.id,
    name: s.name,
    status: 'ENABLED',
    version: '1.0.0',
    isApproved: true,
    approvedBy: 1,
    approvedAt: new Date().toISOString(),
    notes: 'Default safe lab scenario approved for execution'
  });
});

export async function getAdminScenarios() {
  try {
    const rows = await query(`
      SELECT scenario_id AS scenarioId, status, version, is_approved AS isApproved,
             approved_by AS approvedBy, approved_at AS approvedAt, notes, updated_at AS updatedAt
      FROM simulation_scenario_lifecycle
    `);

    if (rows && rows.length > 0) {
      rows.forEach(r => {
        const existing = scenarioLifecycleMap.get(r.scenarioId) || {};
        scenarioLifecycleMap.set(r.scenarioId, {
          ...existing,
          scenarioId: r.scenarioId,
          status: r.status,
          version: r.version,
          isApproved: Boolean(r.isApproved),
          approvedBy: r.approvedBy,
          approvedAt: r.approvedAt,
          notes: r.notes,
          updatedAt: r.updatedAt
        });
      });
    }
  } catch (err) {
    // Fallback
  }

  const catalogScenarios = getBuiltinScenarios();
  return catalogScenarios.map(sc => {
    const lifecycle = scenarioLifecycleMap.get(sc.id) || {
      scenarioId: sc.id,
      status: 'ENABLED',
      version: '1.0.0',
      isApproved: true,
      notes: 'Safe lab scenario'
    };

    return {
      ...sc,
      lifecycleStatus: lifecycle.status,
      version: lifecycle.version,
      isApproved: lifecycle.isApproved,
      approvedBy: lifecycle.approvedBy,
      approvedAt: lifecycle.approvedAt,
      notes: lifecycle.notes
    };
  });
}

export async function updateScenarioStatus(scenarioId, { status, version, notes }, actorId = null) {
  const allowedStatuses = ['DRAFT', 'READY', 'VALIDATING', 'APPROVED', 'ENABLED', 'DISABLED', 'RETIRED'];
  if (status && !allowedStatuses.includes(status)) {
    throw new Error(`Invalid scenario status. Allowed: [${allowedStatuses.join(', ')}]`);
  }

  const scenarios = await getAdminScenarios();
  const target = scenarios.find(s => String(s.id) === String(scenarioId) || s.scenario_code === scenarioId || s.scenarioId === scenarioId);
  if (!target) {
    throw new Error(`Scenario '${scenarioId}' not found.`);
  }

  const newStatus = status || target.lifecycleStatus;
  const newVersion = version || target.version || '1.0.0';
  const isApproved = ['APPROVED', 'ENABLED'].includes(newStatus);
  const targetId = target.scenario_code || target.scenarioId || String(target.id);

  try {
    await query(`
      INSERT INTO simulation_scenario_lifecycle (scenario_id, status, version, is_approved, approved_by, approved_at, notes)
      VALUES (?, ?, ?, ?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        version = VALUES(version),
        is_approved = VALUES(is_approved),
        approved_by = VALUES(approved_by),
        approved_at = NOW(),
        notes = VALUES(notes)
    `, [scenarioId, newStatus, newVersion, isApproved ? 1 : 0, actorId, notes || null]);
  } catch (err) {
    // Fallback
  }

  const updatedLifecycle = {
    scenarioId,
    name: target.name,
    status: newStatus,
    version: newVersion,
    isApproved,
    approvedBy: actorId,
    approvedAt: new Date().toISOString(),
    notes: notes || target.notes
  };

  scenarioLifecycleMap.set(scenarioId, updatedLifecycle);
  scenarioLifecycleMap.set(targetId, updatedLifecycle);
  if (target.id) scenarioLifecycleMap.set(target.id, updatedLifecycle);

  await createAuditLog({
    userId: actorId,
    action: 'SIMULATION_POLICY_CHANGED',
    resourceType: 'SIMULATION_SCENARIO',
    resourceId: scenarioId,
    result: 'SUCCESS',
    details: { status: newStatus, version: newVersion, isApproved }
  });

  broadcastMessage('admin.simulation_configuration_changed', { scenarioId, status: newStatus, version: newVersion });

  return updatedLifecycle;
}
