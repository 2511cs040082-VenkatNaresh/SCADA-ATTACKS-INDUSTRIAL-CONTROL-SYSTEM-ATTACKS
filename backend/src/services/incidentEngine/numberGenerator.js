import crypto from 'crypto';

let incidentCounter = 1;

export function generateIncidentNumber() {
  const year = new Date().getFullYear();
  const sequenceStr = String(incidentCounter++).padStart(6, '0');
  return `INC-${year}-${sequenceStr}`;
}

export function calculateEvidenceHash(payload) {
  const content = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return crypto.createHash('sha256').update(content).digest('hex');
}
