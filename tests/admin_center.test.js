import { adminService } from '../backend/src/services/adminService/index.js';
import { createAdminUser, updateUser, setUserStatus, resetUserPassword } from '../backend/src/services/adminService/users.js';
import { createRole, deleteRole, updateRolePermissions } from '../backend/src/services/adminService/roles.js';
import { revokeSession, revokeUserSessions } from '../backend/src/services/adminService/sessions.js';
import { updateSetting, getSettingsByCategory, updateCategorySettings } from '../backend/src/services/adminService/settings.js';
import { rollbackSetting, getConfigHistory } from '../backend/src/services/adminService/versioning.js';
import { updateRetentionPolicy } from '../backend/src/services/adminService/retention.js';
import { updateScenarioStatus } from '../backend/src/services/adminService/scenarios.js';
import { searchAuditLogs } from '../backend/src/services/adminService/audit.js';

async function runAdminCenterTests() {
  console.log('==================================================');
  console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 18 Administration Center Tests');
  console.log('==================================================\n');

  try {
    // 1. User Creation, Validation & Status Toggling
    console.log('[TEST 1] Testing User Account Creation & Status Toggling...');
    const newUser = await createAdminUser({
      username: 'test_operator',
      email: 'test_op@icsshield.internal',
      password: 'SecurePassword123!',
      fullName: 'Test Operator',
      roles: ['SOC_OPERATOR'],
      status: 'ACTIVE'
    }, 1);

    if (!newUser || newUser.username !== 'test_operator') {
      throw new Error('Failed to create user account.');
    }

    const disabledUser = await setUserStatus(newUser.id, 'DISABLED', 1);
    if (disabledUser.status !== 'DISABLED') {
      throw new Error('User status disable failed.');
    }
    console.log(`✅ Test 1 Passed: Created user ID=${newUser.id}, status toggled to DISABLED.`);

    // 2. Password Reset
    console.log('\n[TEST 2] Testing Password Reset...');
    const resetRes = await resetUserPassword(newUser.id, 'NewStrongPassword890!', 1);
    if (!resetRes || !resetRes.message) {
      throw new Error('Password reset failed.');
    }
    console.log('✅ Test 2 Passed: Password reset executed cleanly.');

    // 3. Role Management & System Role Deletion Block
    console.log('\n[TEST 3] Testing Role Management & System Role Protection...');
    const customRole = await createRole({
      name: 'FIELD_SPECIALIST',
      description: 'Field inspection specialist role',
      permissions: ['assets.read', 'telemetry.read']
    }, 1);

    if (!customRole || customRole.name !== 'FIELD_SPECIALIST') {
      throw new Error('Custom role creation failed.');
    }

    // Verify system role deletion protection
    try {
      await deleteRole('ADMIN');
      throw new Error('System role ADMIN should NOT be deletable!');
    } catch (err) {
      if (!err.message.includes('strictly prohibited')) {
        throw err;
      }
    }
    console.log('✅ Test 3 Passed: Custom role created, system role deletion correctly prohibited.');

    // 4. Permission Matrix Update
    console.log('\n[TEST 4] Testing Permission Matrix Assignment...');
    const updatedRole = await updateRolePermissions('FIELD_SPECIALIST', ['assets.read', 'assets.update', 'telemetry.read'], 1);
    if (!updatedRole || updatedRole.permissions.length !== 3) {
      throw new Error('Role permission update failed.');
    }
    console.log('✅ Test 4 Passed: Permission matrix updated successfully.');

    // 5. Session Revocation
    console.log('\n[TEST 5] Testing Session Management & Revocation...');
    const revRes = await revokeSession('ses-001', 1);
    if (!revRes || !revRes.message) {
      throw new Error('Session revocation failed.');
    }
    console.log('✅ Test 5 Passed: Session ses-001 revoked.');

    // 6. System Configuration & Bounds Validation
    console.log('\n[TEST 6] Testing Configuration Management across 16 Categories...');
    const updatedSetting = await updateSetting('session_timeout_minutes', '45', 'Security policy update', 1);
    if (updatedSetting.value !== '45' || updatedSetting.version !== 2) {
      throw new Error('Setting update failed.');
    }

    // Min/Max bounds validation check
    try {
      await updateSetting('session_timeout_minutes', '2', 'Invalid min bound test', 1);
      throw new Error('Setting should have failed minimum bound check!');
    } catch (err) {
      if (!err.message.includes('below minimum allowed bound')) throw err;
    }
    console.log('✅ Test 6 Passed: Setting updated to version 2, min/max bounds enforced.');

    // 7. Configuration Versioning & Rollback
    console.log('\n[TEST 7] Testing Configuration History & Rollback...');
    const rollbackRes = await rollbackSetting('session_timeout_minutes', 1, 1);
    if (!rollbackRes || rollbackRes.setting.value !== '60') {
      throw new Error('Configuration rollback failed.');
    }
    console.log('✅ Test 7 Passed: Setting rolled back to version 1 value (60 mins).');

    // 8. Retention Policies Management & Active Evidence Preservation
    console.log('\n[TEST 8] Testing Retention Policies & Active Evidence Preservation...');
    const updatedRetention = await updateRetentionPolicy('telemetry', { retentionDays: 45 }, 1);
    if (updatedRetention.retentionDays !== 45) {
      throw new Error('Retention update failed.');
    }

    // Check evidence preservation safety check
    try {
      await updateRetentionPolicy('incidents', { preserveEvidenceOverride: false }, 1);
      throw new Error('Active incident evidence preservation override disable should fail!');
    } catch (err) {
      if (!err.message.includes('cannot be disabled')) throw err;
    }
    console.log('✅ Test 8 Passed: Retention updated, evidence preservation override protected.');

    // 9. Simulation Scenario Lifecycle & Approval
    console.log('\n[TEST 9] Testing Simulation Scenario Lifecycle Status & Approval...');
    const updatedScenario = await updateScenarioStatus('SIM-MODBUS-WRITE-001', { status: 'ENABLED', notes: 'Approved for SOC drill' }, 1);
    if (updatedScenario.status !== 'ENABLED' || !updatedScenario.isApproved) {
      throw new Error('Scenario status update failed.');
    }
    console.log('✅ Test 9 Passed: Scenario SIM-MODBUS-WRITE-001 status set to ENABLED with approval.');

    // 10. Append-Only System Audit Logs
    console.log('\n[TEST 10] Testing Administrative System Audit Logs Search...');
    const auditLogs = await searchAuditLogs({ limit: 20 });
    if (!auditLogs || auditLogs.length === 0) {
      throw new Error('Audit log retrieval failed.');
    }
    console.log(`✅ Test 10 Passed: Retrieved ${auditLogs.length} audit log entries.`);

    // 11. System Health Breakdown
    console.log('\n[TEST 11] Testing Real-Time Subsystem Health Breakdown...');
    const health = await adminService.getSubsystemHealth();
    if (!health || health.overallStatus !== 'HEALTHY' || health.subsystems.length < 10) {
      throw new Error('Subsystem health retrieval failed.');
    }
    console.log(`✅ Test 11 Passed: ${health.subsystems.length} subsystems health verified.`);

    // 12. Full E2E Admin Demonstration Sequence
    console.log('\n[TEST 12] Testing Full End-to-End Administrative Demonstration Sequence...');
    const e2eUser = await createAdminUser({
      username: 'e2e_analyst',
      email: 'e2e@icsshield.internal',
      password: 'ComplexPassword99!',
      fullName: 'E2E Analyst',
      roles: ['SECURITY_ANALYST']
    }, 1);

    await updateSetting('alert_deduplication_window_sec', '180', 'E2E Test Edit', 1);
    await updateRetentionPolicy('anomalies', { retentionDays: 120 }, 1);
    const finalAudit = await searchAuditLogs({ search: 'e2e_analyst' });
    console.log('✅ Test 12 Passed: End-to-End demonstration sequence completed cleanly.');

    console.log('\n==================================================');
    console.log(' 🎉 ALL PHASE 18 ADMINISTRATION CENTER TESTS PASSED!');
    console.log('==================================================\n');

  } catch (err) {
    console.error('\n❌ [TEST FAILURE]', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

runAdminCenterTests();
