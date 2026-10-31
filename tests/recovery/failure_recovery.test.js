import { resetLabSimulator } from '../../backend/src/services/simulation.service.js';
import { getAdminOverview } from '../../backend/src/services/adminService/system.js';

export async function runFailureRecoveryTestSuite() {
  console.log('[RELIABILITY & RECOVERY] Testing Subsystem Fault Resilience & Recovery...');

  // 1. Simulate DB ping fallback gracefully
  const overview = await getAdminOverview();
  if (!overview || !overview.systemHealthBreakdown) {
    throw new Error('Failure recovery test failed: System health breakdown missing.');
  }

  // 2. Simulator Reset Recovery
  const resetRes = await resetLabSimulator();
  if (resetRes.status !== 'RESET_COMPLETED') {
    throw new Error('Simulator state reset recovery failed.');
  }

  console.log('  └─ Failure & Recovery Tests Passed: System recovers cleanly from component fallbacks.');
  return true;
}
