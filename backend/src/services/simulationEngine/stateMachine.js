export const SIMULATION_STATES = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  VALIDATING: 'VALIDATING',
  SCHEDULED: 'SCHEDULED',
  INITIALIZING: 'INITIALIZING',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  STOPPED: 'STOPPED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  RESETTING: 'RESETTING'
};

const ALLOWED_TRANSITIONS = {
  DRAFT: ['READY', 'VALIDATING', 'CANCELLED'],
  READY: ['VALIDATING', 'INITIALIZING', 'SCHEDULED', 'CANCELLED'],
  VALIDATING: ['INITIALIZING', 'READY', 'FAILED', 'CANCELLED'],
  SCHEDULED: ['INITIALIZING', 'CANCELLED'],
  INITIALIZING: ['RUNNING', 'FAILED', 'CANCELLED'],
  RUNNING: ['PAUSED', 'COMPLETED', 'STOPPED', 'FAILED', 'CANCELLED', 'RESETTING'],
  PAUSED: ['RUNNING', 'STOPPED', 'CANCELLED'],
  COMPLETED: ['RESETTING'],
  STOPPED: ['RESETTING'],
  FAILED: ['RESETTING', 'DRAFT'],
  CANCELLED: ['RESETTING'],
  RESETTING: ['READY', 'DRAFT']
};

export function isValidStateTransition(currentState, targetState) {
  if (currentState === targetState) return true;
  const allowed = ALLOWED_TRANSITIONS[currentState] || [];
  return allowed.includes(targetState);
}

export function validateStateTransition(currentState, targetState) {
  if (!isValidStateTransition(currentState, targetState)) {
    throw new Error(`Invalid Simulation state transition from '${currentState}' to '${targetState}'. Required path: DRAFT -> READY -> VALIDATING -> INITIALIZING -> RUNNING.`);
  }
  return true;
}
