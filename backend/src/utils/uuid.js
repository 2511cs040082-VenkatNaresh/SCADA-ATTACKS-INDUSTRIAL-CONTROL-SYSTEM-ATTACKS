import crypto from 'crypto';

export function cryptoUUID() {
  return crypto.randomUUID();
}
