import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';
import { getActionMetadata } from './actionRegistry.js';

// Default policies
export const DEFAULT_POLICIES = {
  SAFE: { requires_approval: false, approval_type: 'NONE', separation_of_duties: false },
  LOW_RISK: { requires_approval: false, approval_type: 'SINGLE_APPROVAL', separation_of_duties: false },
  MEDIUM_RISK: { requires_approval: true, approval_type: 'SINGLE_APPROVAL', separation_of_duties: true },
  HIGH_RISK: { requires_approval: true, approval_type: 'ADMIN_APPROVAL', separation_of_duties: true },
  SIMULATION_ONLY: { requires_approval: true, approval_type: 'SIMULATION_APPROVAL', separation_of_duties: true }
};

export function determineApprovalRequirement(actions = [], planRiskLevel = 'MEDIUM') {
  let highestRisk = planRiskLevel;
  let requiresApproval = false;
  let approvalType = 'SINGLE_APPROVAL';
  let separationRequired = false;

  for (const act of actions) {
    const meta = getActionMetadata(act.action_type || act);
    if (meta.requires_approval) {
      requiresApproval = true;
    }
    if (meta.risk_level === 'HIGH_RISK' || meta.risk_level === 'SIMULATION_ONLY') {
      highestRisk = meta.risk_level;
      approvalType = meta.risk_level === 'HIGH_RISK' ? 'ADMIN_APPROVAL' : 'SIMULATION_APPROVAL';
      separationRequired = true;
    } else if (meta.risk_level === 'MEDIUM_RISK' && highestRisk !== 'HIGH_RISK') {
      highestRisk = 'MEDIUM_RISK';
      separationRequired = true;
    }
  }

  return {
    requires_approval: requiresApproval,
    highest_risk: highestRisk,
    approval_type: approvalType,
    separation_required: separationRequired
  };
}

export function validateApprovalPermissions(user, plan, approvalType) {
  if (!user) throw new Error('User authentication context missing.');
  
  const userRole = user.role || 'SECURITY_ANALYST';

  if (approvalType === 'ADMIN_APPROVAL' && userRole !== 'ADMIN' && userRole !== 'SYSTEM_ADMIN') {
    throw new Error(`Admin authorization required for ${approvalType}. User has role '${userRole}'.`);
  }

  // Separation of Duties check: creator cannot self-approve if separation_required
  if (plan.created_by && String(plan.created_by) === String(user.id)) {
    const riskMeta = determineApprovalRequirement([], plan.risk_level);
    if (riskMeta.separation_required || plan.risk_level === 'HIGH_RISK' || plan.risk_level === 'MEDIUM_RISK') {
      throw new Error(`Separation of Duties Violation: Creator (User #${user.id}) cannot approve their own high/medium risk response plan.`);
    }
  }

  return true;
}
