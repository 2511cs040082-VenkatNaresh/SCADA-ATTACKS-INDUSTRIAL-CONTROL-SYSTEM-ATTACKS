import { calculateTimingStats } from '../utilities/testHelpers.js';
import { sanitizeString } from '../../backend/src/middleware/sanitizer.js';

export async function runUnitTestSuite() {
  console.log('[UNIT TESTS] Starting Business Logic Unit Tests...');

  // 1. Timing Calculator Unit Test
  const stats = calculateTimingStats([10, 20, 30, 40, 50]);
  if (stats.mean !== 30 || stats.min !== 10 || stats.max !== 50) {
    throw new Error('Timing calculator unit test failed.');
  }

  // 2. Sanitizer Unit Test
  const sanitized = sanitizeString('<script>alert(1)</script>hello');
  if (sanitized !== 'hello') {
    throw new Error('Sanitizer unit test failed.');
  }

  console.log('  └─ Unit Tests Passed (2/2 Component Units Verified).');
  return true;
}
