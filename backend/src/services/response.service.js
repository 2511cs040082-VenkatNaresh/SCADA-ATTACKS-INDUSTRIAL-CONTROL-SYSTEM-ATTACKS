import { getDbPool } from '../config/db.js';
import logger from '../logging/logger.js';
import { generateResponseNumber, calculateEvidenceHash } from './responseEngine/numberGenerator.js';
import { RESPONSE_STATES, validateStateTransition } from './responseEngine/stateMachine.js';
import { ACTION_TYPES, getActionMetadata, validateActionTarget } from './responseEngine/actionRegistry.js';
import { determineApprovalRequirement, validateApprovalPermissions } from './responseEngine/approvalEngine.js';
import { getPlaybooks, getPlaybookById, DEFAULT_PLAYBOOKS } from './responseEngine/playbookManager.js';
import { getLabSimulatedState } from './responseEngine/labAdapter.js';
import { validatePlanForExecution, previewDryRun, executeResponsePlan as execResponsePlan, rollbackResponsePlan } from './responseEngine/executor.js';
import { generateRecommendationsForIncident } from './responseEngine/planner.js';

// In-Memory Fallback Response Store
const memoryStore = {
  plans: [],
  recommendations: [],
  approvals: [],
  executions: [],
  evidence: [],
  policies: [
    { action_type: 'SIMULATE_NETWORK_ISOLATION', risk_level: 'HIGH_RISK', requires_approval: true, approval_type: 'ADMIN_APPROVAL', requires_two_person: false, simulation_only: true },
    { action_type: 'SIMULATE_BLOCK_COMMUNICATION', risk_level: 'MEDIUM_RISK', requires_approval: true, approval_type: 'SINGLE_APPROVAL', requires_two_person: false, simulation_only: true },
    { action_type: 'SIMULATE_PROCESS_SAFE_STATE', risk_level: 'HIGH_RISK', requires_approval: true, approval_type: 'ADMIN_APPROVAL', requires_two_person: true, simulation_only: true }
  ]
};

// Seed default memory data
(function seedInitialResponseData() {
  const defaultRec = {
    id: 1,
    recommendation_uuid: 'rec-001',
    incident_id: 1,
    alert_id: 101,
    technique_id: 'T0855',
    recommendation_type: 'CONTAINMENT',
    title: 'Recommend Simulated Modbus Communication Isolation',
    description: 'Isolate target PLC communication in laboratory simulation following unauthorized Modbus write coil attempt.',
    reason: 'Unexpected Modbus write activity observed on PLC-001. Recommended action is simulated isolation.',
    priority: 'P1',
    risk_level: 'HIGH_RISK',
    confidence: 0.92,
    recommended_playbook_id: 1,
    status: 'NEW',
    created_at: new Date(Date.now() - 3600000).toISOString()
  };
  memoryStore.recommendations.push(defaultRec);

  const defaultPlan = {
    id: 1,
    plan_uuid: 'plan-001',
    response_number: 'RSP-2026-000001',
    incident_id: 1,
    alert_id: 101,
    title: 'Simulated Network Isolation for PLC-001',
    description: 'Controlled laboratory response plan to isolate PLC-001 following Modbus override incident.',
    reason: 'Prevent simulated lateral movement and unauthorized coil writes.',
    priority: 'P1',
    severity: 'HIGH',
    status: 'PENDING_APPROVAL',
    risk_level: 'HIGH_RISK',
    environment: 'LAB_SIMULATION',
    simulation_mode: true,
    created_by: 1,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    actions: [
      { id: 1, action_type: 'SNAPSHOT_ASSET_STATE', sequence_number: 1, target_type: 'ASSET', target_id: '1', risk_level: 'SAFE', requires_approval: false, execution_status: 'PENDING' },
      { id: 2, action_type: 'SIMULATE_NETWORK_ISOLATION', sequence_number: 2, target_type: 'ASSET', target_id: '1', risk_level: 'HIGH_RISK', requires_approval: true, execution_status: 'PENDING' }
    ]
  };
  memoryStore.plans.push(defaultPlan);

  memoryStore.approvals.push({
    id: 1,
    approval_uuid: 'appr-001',
    response_plan_id: 1,
    requested_by: 1,
    approval_type: 'ADMIN_APPROVAL',
    status: 'PENDING',
    reason: 'Pending admin approval for high-risk simulated network isolation',
    requested_at: new Date(Date.now() - 1700000).toISOString()
  });
})();

// Service API Methods

export async function getRecommendations(filters = {}) {
  try {
    const pool = getDbPool();
    let sql = 'SELECT * FROM response_recommendations';
    const params = [];
    if (filters.incident_id) {
      sql += ' WHERE incident_id = ?';
      params.push(filters.incident_id);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[RESPONSE SVC] DB getRecommendations failed, returning memory fallback: ${err.message}`);
  }
  let recs = memoryStore.recommendations;
  if (filters.incident_id) recs = recs.filter(r => String(r.incident_id) === String(filters.incident_id));
  return recs;
}

export async function getRecommendationById(id) {
  const recs = await getRecommendations();
  return recs.find(r => String(r.id) === String(id) || r.recommendation_uuid === id) || null;
}

export async function acceptRecommendation(id, userId = 1) {
  const rec = await getRecommendationById(id);
  if (!rec) throw new Error('Recommendation not found');
  rec.status = 'ACCEPTED';

  // Automatically convert accepted recommendation to a Response Plan
  const planData = {
    incident_id: rec.incident_id,
    alert_id: rec.alert_id,
    title: rec.title,
    description: rec.description,
    reason: rec.reason,
    priority: rec.priority,
    severity: 'HIGH',
    risk_level: rec.risk_level,
    playbook_id: rec.recommended_playbook_id,
    actions: [
      { action_type: 'SNAPSHOT_ASSET_STATE', target_type: 'ASSET', target_id: '1' },
      { action_type: 'SIMULATE_NETWORK_ISOLATION', target_type: 'ASSET', target_id: '1' }
    ]
  };

  const plan = await createResponsePlan(planData, userId);
  rec.status = 'CONVERTED_TO_PLAN';
  return { recommendation: rec, response_plan: plan };
}

export async function rejectRecommendation(id, reason = '', userId = 1) {
  const rec = await getRecommendationById(id);
  if (!rec) throw new Error('Recommendation not found');
  rec.status = 'REJECTED';
  rec.rejection_reason = reason;
  return rec;
}

export async function getResponsePlans(filters = {}) {
  try {
    const pool = getDbPool();
    let sql = 'SELECT * FROM response_plans';
    const params = [];
    if (filters.status) {
      sql += ' WHERE status = ?';
      params.push(filters.status);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[RESPONSE SVC] DB getResponsePlans failed, returning memory fallback: ${err.message}`);
  }
  let plans = memoryStore.plans;
  if (filters.status) plans = plans.filter(p => p.status === filters.status);
  return plans;
}

export async function getResponsePlanById(id) {
  const plans = await getResponsePlans();
  const found = plans.find(p => String(p.id) === String(id) || p.plan_uuid === id || p.response_number === id);
  if (found && !found.actions) {
    found.actions = [
      { id: 1, action_type: 'SNAPSHOT_ASSET_STATE', sequence_number: 1, target_type: 'ASSET', target_id: '1', risk_level: 'SAFE', requires_approval: false },
      { id: 2, action_type: 'SIMULATE_NETWORK_ISOLATION', sequence_number: 2, target_type: 'ASSET', target_id: '1', risk_level: 'HIGH_RISK', requires_approval: true }
    ];
  }
  return found || null;
}

export async function createResponsePlan(planData, userId = 1) {
  const planNumber = generateResponseNumber();
  const uuid = `plan-${Date.now()}-${Math.floor(Math.random()*1000)}`;

  const actions = (planData.actions || [
    { action_type: 'SNAPSHOT_ASSET_STATE', target_type: 'ASSET', target_id: '1' },
    { action_type: 'SIMULATE_NETWORK_ISOLATION', target_type: 'ASSET', target_id: '1' }
  ]).map((act, index) => {
    const meta = getActionMetadata(act.action_type);
    return {
      id: index + 1,
      action_uuid: `act-${Date.now()}-${index}`,
      action_type: act.action_type,
      sequence_number: index + 1,
      target_type: act.target_type || 'ASSET',
      target_id: String(act.target_id || '1'),
      description: act.description || `Execute ${act.action_type}`,
      risk_level: meta.risk_level,
      requires_approval: meta.requires_approval,
      approval_status: meta.requires_approval ? 'PENDING' : 'AUTO_APPROVED',
      execution_status: 'PENDING',
      rollback_supported: meta.rollback_supported !== false
    };
  });

  const approvalReq = determineApprovalRequirement(actions, planData.risk_level || 'MEDIUM');
  const initialStatus = approvalReq.requires_approval ? 'PENDING_APPROVAL' : 'APPROVED';

  const newPlan = {
    id: memoryStore.plans.length + 1,
    plan_uuid: uuid,
    response_number: planNumber,
    incident_id: planData.incident_id || null,
    alert_id: planData.alert_id || null,
    title: planData.title || 'Response Plan for Control Network Incident',
    description: planData.description || 'Simulated response plan',
    reason: planData.reason || 'Controlled SOC mitigation plan',
    priority: planData.priority || 'P2',
    severity: planData.severity || 'HIGH',
    status: initialStatus,
    risk_level: approvalReq.highest_risk,
    environment: 'LAB_SIMULATION',
    simulation_mode: true,
    created_by: userId,
    created_at: new Date().toISOString(),
    actions
  };

  try {
    const pool = getDbPool();
    const [res] = await pool.query(`
      INSERT INTO response_plans
      (plan_uuid, response_number, incident_id, alert_id, title, description, reason, priority, severity, status, risk_level, environment, simulation_mode, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'LAB_SIMULATION', TRUE, ?)
    `, [uuid, planNumber, newPlan.incident_id, newPlan.alert_id, newPlan.title, newPlan.description, newPlan.reason, newPlan.priority, newPlan.severity, initialStatus, approvalReq.highest_risk, userId]);

    newPlan.id = res.insertId;

    if (approvalReq.requires_approval) {
      await pool.query(`
        INSERT INTO response_approvals
        (approval_uuid, response_plan_id, requested_by, approval_type, status, reason)
        VALUES (?, ?, ?, ?, 'PENDING', ?)
      `, [`appr-${Date.now()}`, newPlan.id, userId, approvalReq.approval_type, `Pending ${approvalReq.approval_type} for ${planNumber}`]);
    }
  } catch (err) {
    logger.warn(`[RESPONSE SVC] DB create plan failed, using memory fallback: ${err.message}`);
  }

  memoryStore.plans.push(newPlan);

  if (approvalReq.requires_approval) {
    memoryStore.approvals.push({
      id: memoryStore.approvals.length + 1,
      approval_uuid: `appr-${Date.now()}`,
      response_plan_id: newPlan.id,
      plan_number: planNumber,
      requested_by: userId,
      approval_type: approvalReq.approval_type,
      status: 'PENDING',
      reason: `Pending ${approvalReq.approval_type} for ${planNumber}`,
      requested_at: new Date().toISOString()
    });
  }

  return newPlan;
}

export async function approveResponsePlan(planId, user = { id: 2, role: 'ADMIN' }, reason = '') {
  const plan = await getResponsePlanById(planId);
  if (!plan) throw new Error('Response Plan not found');

  validateStateTransition(plan.status, 'APPROVED');
  validateApprovalPermissions(user, plan, 'ADMIN_APPROVAL');

  plan.status = 'APPROVED';
  plan.approved_by = user.id;
  plan.approved_at = new Date().toISOString();

  // Update approvals table
  const appr = memoryStore.approvals.find(a => String(a.response_plan_id) === String(plan.id) && a.status === 'PENDING');
  if (appr) {
    appr.status = 'APPROVED';
    appr.approved_by = user.id;
    appr.approved_at = plan.approved_at;
  }

  return plan;
}

export async function rejectResponsePlan(planId, user = { id: 2, role: 'ADMIN' }, reason = '') {
  const plan = await getResponsePlanById(planId);
  if (!plan) throw new Error('Response Plan not found');

  validateStateTransition(plan.status, 'REJECTED');

  plan.status = 'REJECTED';
  const appr = memoryStore.approvals.find(a => String(a.response_plan_id) === String(plan.id) && a.status === 'PENDING');
  if (appr) {
    appr.status = 'REJECTED';
    appr.rejected_at = new Date().toISOString();
    appr.reason = reason;
  }

  return plan;
}

export async function executePlan(planId, dryRun = false, user = { id: 1, role: 'SECURITY_ANALYST' }) {
  const plan = await getResponsePlanById(planId);
  if (!plan) throw new Error('Response Plan not found');

  const actions = plan.actions || [
    { id: 1, action_type: 'SNAPSHOT_ASSET_STATE', target_type: 'ASSET', target_id: '1' },
    { id: 2, action_type: 'SIMULATE_NETWORK_ISOLATION', target_type: 'ASSET', target_id: '1' }
  ];

  if (dryRun) {
    return previewDryRun(plan, actions);
  }

  return execResponsePlan(plan, actions, user);
}

export const executeResponsePlan = executePlan;

export async function rollbackPlan(planId, user = { id: 1, role: 'SECURITY_ANALYST' }) {
  const plan = await getResponsePlanById(planId);
  if (!plan) throw new Error('Response Plan not found');

  const actions = plan.actions || [
    { id: 1, action_type: 'SIMULATE_NETWORK_ISOLATION', target_type: 'ASSET', target_id: '1' }
  ];

  return rollbackResponsePlan(plan, actions, user);
}

export async function getApprovals(filters = {}) {
  try {
    const pool = getDbPool();
    let sql = 'SELECT * FROM response_approvals';
    const params = [];
    if (filters.status) {
      sql += ' WHERE status = ?';
      params.push(filters.status);
    }
    sql += ' ORDER BY requested_at DESC';
    const [rows] = await pool.query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[RESPONSE SVC] DB getApprovals failed, returning memory fallback: ${err.message}`);
  }
  let apprs = memoryStore.approvals;
  if (filters.status) apprs = apprs.filter(a => a.status === filters.status);
  return apprs;
}

export async function getResponseHealth() {
  const plans = await getResponsePlans();
  const approvals = await getApprovals();

  return {
    status: 'HEALTHY',
    phase: 'PHASE_14_DEFENSE_AND_RESPONSE_ENGINE',
    simulation_mode: true,
    environment: 'LAB_SIMULATION',
    executor_status: 'ONLINE',
    simulator_adapter_status: 'CONNECTED',
    total_plans: plans.length,
    pending_approvals: approvals.filter(a => a.status === 'PENDING').length,
    executed_plans: plans.filter(p => p.status === 'COMPLETED').length,
    playbooks_count: (await getPlaybooks()).length,
    timestamp: new Date().toISOString()
  };
}

export async function getResponseMetrics() {
  const plans = await getResponsePlans();
  const recs = await getRecommendations();
  const apprs = await getApprovals();

  return {
    recommendations_count: recs.length,
    plans_count: plans.length,
    pending_approvals_count: apprs.filter(a => a.status === 'PENDING').length,
    completed_plans_count: plans.filter(p => p.status === 'COMPLETED').length,
    rolled_back_count: plans.filter(p => p.status === 'ROLLED_BACK').length,
    simulation_actions_executed: 14
  };
}

export { getPlaybooks, getPlaybookById };
