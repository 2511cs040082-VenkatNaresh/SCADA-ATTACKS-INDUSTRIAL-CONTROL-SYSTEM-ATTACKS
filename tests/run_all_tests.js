import { runUnitTestSuite } from './unit/unit.test.js';
import { runMasterSimulationE2ETest } from './e2e/master_simulation_e2e.test.js';
import { runPerformanceTestSuite } from './performance/performance.test.js';
import { runFailureRecoveryTestSuite } from './recovery/failure_recovery.test.js';
import { execSync } from 'child_process';

async function runCompletePhase20Validation() {
  console.log('==================================================');
  console.log(' 🛡️ [ICS-SHIELD] PHASE 20 MASTER QUALITY GATE & PLATFORM TEST SUITE');
  console.log('==================================================\n');

  const startTime = Date.now();
  const summary = {
    totalSuitesExecuted: 0,
    passedSuites: 0,
    failedSuites: 0,
    suiteDetails: []
  };

  const testFiles = [
    { name: 'Unit Tests', path: 'tests/unit/unit.test.js', runner: runUnitTestSuite },
    { name: 'Database Tests', file: 'tests/database.test.js' },
    { name: 'API Endpoints Tests', file: 'tests/api.test.js' },
    { name: 'Asset Intelligence Tests', file: 'tests/asset_intelligence.test.js' },
    { name: 'Network Monitoring Tests', file: 'tests/network_monitoring.test.js' },
    { name: 'Rule Detection Engine Tests', file: 'tests/detection_engine.test.js' },
    { name: 'Behavioral Engine Tests', file: 'tests/behavioral_engine.test.js' },
    { name: 'Machine Learning Engine Tests', file: 'tests/ml_engine.test.js' },
    { name: 'Alert Management Tests', file: 'tests/alert_management.test.js' },
    { name: 'Incident Case Workspace Tests', file: 'tests/incident_management.test.js' },
    { name: 'MITRE ATT&CK for ICS Tests', file: 'tests/mitre_integration.test.js' },
    { name: 'Defense & Response Engine Tests', file: 'tests/response_engine.test.js' },
    { name: 'Attack Simulation Lab Tests', file: 'tests/simulation_engine.test.js' },
    { name: 'Reports & Analytics Tests', file: 'tests/reports_analytics.test.js' },
    { name: 'Administration Center Tests', file: 'tests/admin_center.test.js' },
    { name: 'Security Hardening Tests', file: 'tests/security_hardening.test.js' },
    { name: 'Performance Benchmarks', path: 'tests/performance/performance.test.js', runner: runPerformanceTestSuite },
    { name: 'Reliability & Fault Recovery Tests', path: 'tests/recovery/failure_recovery.test.js', runner: runFailureRecoveryTestSuite },
    { name: 'Master 18-Stage Simulation E2E Test', path: 'tests/e2e/master_simulation_e2e.test.js', runner: runMasterSimulationE2ETest }
  ];

  for (const t of testFiles) {
    summary.totalSuitesExecuted++;
    console.log(`\n--------------------------------------------------`);
    console.log(` ▶ RUNNING TEST SUITE: ${t.name}`);
    console.log(`--------------------------------------------------`);
    try {
      if (t.runner) {
        await t.runner();
      } else if (t.file) {
        execSync(`node ${t.file}`, { stdio: 'inherit', cwd: process.cwd() });
      }
      summary.passedSuites++;
      summary.suiteDetails.push({ name: t.name, status: 'PASSED' });
    } catch (err) {
      summary.failedSuites++;
      summary.suiteDetails.push({ name: t.name, status: 'FAILED', error: err.message });
      console.error(`❌ SUITE FAILED: ${t.name} - ${err.message}`);
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n==================================================');
  console.log(' 🏁 PHASE 20 COMPREHENSIVE TEST SUITE SUMMARY');
  console.log('==================================================');
  console.log(`  • TOTAL TEST SUITES RUN: ${summary.totalSuitesExecuted}`);
  console.log(`  • PASSED SUITES:         ${summary.passedSuites}`);
  console.log(`  • FAILED SUITES:         ${summary.failedSuites}`);
  console.log(`  • TOTAL EXECUTION TIME:  ${durationSec} seconds`);
  console.log('==================================================');

  summary.suiteDetails.forEach(s => {
    console.log(`  [${s.status === 'PASSED' ? '✓ PASSED' : '❌ FAILED'}] ${s.name}`);
  });
  console.log('==================================================\n');

  if (summary.failedSuites > 0) {
    process.exit(1);
  }
}

runCompletePhase20Validation();
