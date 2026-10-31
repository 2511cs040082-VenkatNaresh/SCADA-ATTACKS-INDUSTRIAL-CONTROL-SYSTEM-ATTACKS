export const VALID_INCIDENT_STATUSES = [
  'NEW',
  'TRIAGED',
  'INVESTIGATING',
  'CONTAINMENT_RECOMMENDED',
  'CONTAINMENT_IN_PROGRESS',
  'RECOVERY_RECOMMENDED',
  'RECOVERY_IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'FALSE_POSITIVE',
  'BENIGN',
  'DUPLICATE',
  'CANCELLED'
];

export const ALLOWED_INCIDENT_TRANSITIONS = {
  NEW: ['TRIAGED', 'INVESTIGATING', 'FALSE_POSITIVE', 'BENIGN', 'CANCELLED', 'CLOSED'],
  TRIAGED: ['INVESTIGATING', 'CONTAINMENT_RECOMMENDED', 'RESOLVED', 'FALSE_POSITIVE', 'BENIGN', 'CANCELLED', 'CLOSED'],
  INVESTIGATING: ['CONTAINMENT_RECOMMENDED', 'CONTAINMENT_IN_PROGRESS', 'RECOVERY_RECOMMENDED', 'RESOLVED', 'FALSE_POSITIVE', 'BENIGN', 'CANCELLED', 'CLOSED'],
  CONTAINMENT_RECOMMENDED: ['CONTAINMENT_IN_PROGRESS', 'RECOVERY_RECOMMENDED', 'RESOLVED', 'INVESTIGATING'],
  CONTAINMENT_IN_PROGRESS: ['RECOVERY_RECOMMENDED', 'RECOVERY_IN_PROGRESS', 'RESOLVED', 'INVESTIGATING'],
  RECOVERY_RECOMMENDED: ['RECOVERY_IN_PROGRESS', 'RESOLVED', 'INVESTIGATING'],
  RECOVERY_IN_PROGRESS: ['RESOLVED', 'INVESTIGATING'],
  RESOLVED: ['CLOSED', 'INVESTIGATING'], // INVESTIGATING represents reopening
  CLOSED: ['INVESTIGATING'],             // INVESTIGATING represents reopening
  FALSE_POSITIVE: ['TRIAGED', 'INVESTIGATING'],
  BENIGN: ['TRIAGED', 'INVESTIGATING'],
  DUPLICATE: ['TRIAGED', 'INVESTIGATING'],
  CANCELLED: ['TRIAGED', 'INVESTIGATING']
};

export function validateIncidentStateTransition(currentStatus, targetStatus) {
  if (!VALID_INCIDENT_STATUSES.includes(targetStatus)) {
    return { valid: false, reason: `Invalid incident status: '${targetStatus}'` };
  }

  if (currentStatus === targetStatus) {
    return { valid: true, reason: 'Status unchanged' };
  }

  const allowed = ALLOWED_INCIDENT_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      reason: `Invalid incident transition from '${currentStatus}' to '${targetStatus}'. Allowed target states: [${allowed.join(', ')}]`
    };
  }

  return { valid: true };
}
