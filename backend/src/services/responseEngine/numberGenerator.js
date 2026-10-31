import crypto from 'crypto';

let sequenceCounter = 1;

export function generateResponseNumber() {
  const year = new Date().getFullYear();
  const sequenceStr = String(sequenceCounter++).padStart(6, '0');
  return `RSP-${year}-${sequenceStr}`;
}

export function calculateEvidenceHash(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}
