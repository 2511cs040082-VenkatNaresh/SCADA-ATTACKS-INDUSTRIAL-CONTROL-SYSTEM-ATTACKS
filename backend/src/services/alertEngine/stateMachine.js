export const VALID_STATUSES = [
  'NEW',
  'ACKNOWLEDGED',
  'IN_PROGRESS',
  'ESCALATED',
  'RESOLVED',
  'CLOSED',
  'SUPPRESSED',
  'FALSE_POSITIVE',
  'DUPLICATE'
];

export const ALLOWED_TRANSITIONS = {
  NEW: ['ACKNOWLEDGED', 'IN_PROGRESS', 'SUPPRESSED', 'FALSE_POSITIVE', 'DUPLICATE', 'CLOSED'],
  ACKNOWLEDGED: ['IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'FALSE_POSITIVE', 'DUPLICATE', 'CLOSED'],
  IN_PROGRESS: ['ESCALATED', 'RESOLVED', 'FALSE_POSITIVE', 'DUPLICATE', 'CLOSED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'], // IN_PROGRESS represents reopening
  CLOSED: ['IN_PROGRESS'],             // IN_PROGRESS represents reopening
  SUPPRESSED: ['NEW', 'ACKNOWLEDGED'],
  FALSE_POSITIVE: ['ACKNOWLEDGED', 'IN_PROGRESS'],
  DUPLICATE: ['ACKNOWLEDGED', 'IN_PROGRESS']
};

export function validateStateTransition(currentStatus, targetStatus) {
  if (!VALID_STATUSES.includes(targetStatus)) {
    return { valid: false, reason: `Invalid alert status: '${targetStatus}'` };
  }
  
  if (currentStatus === targetStatus) {
    return { valid: true, reason: 'Status unchanged' };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      reason: `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed target states: [${allowed.join(', ')}]`
    };
  }

  return { valid: true };
}
