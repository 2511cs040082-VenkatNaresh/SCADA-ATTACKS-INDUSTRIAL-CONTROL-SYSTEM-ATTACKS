import assert from 'assert';
import { generateReportDefinition, REPORT_TYPES } from '../backend/src/services/reportEngine/generators.js';
import { exportReportContent, renderReportHTML, renderReportCSV } from '../backend/src/services/reportEngine/exporters.js';
import { calculateNextRunTime } from '../backend/src/services/reportEngine/scheduling.js';
import {
  querySecurityOverviewAnalytics,
  queryAlertAnalytics,
  queryIncidentAnalytics,
  querySimulationRunAnalytics,
} from '../backend/src/services/reportEngine/aggregations.js';
import { getReportsHealth, createReport, getReports, exportReport } from '../backend/src/services/report.service.js';

console.log('==================================================');
console.log(' [ICS-SHIELD TEST SUITE] Starting Phase 17 Reports & Analytics Tests');
console.log('==================================================\n');

async function runTests() {
  try {
    // TEST 1: 16 Report Types Generation
    console.log('[TEST 1] Testing 16 Built-in Report Types Definition Generation...');
    assert.strictEqual(REPORT_TYPES.length, 16, 'Must support 16 report types');
    const execReport = await generateReportDefinition('EXECUTIVE_SECURITY_SUMMARY', 'Executive Summary Test', { environment: 'LAB' });
    assert.strictEqual(execReport.report_type, 'EXECUTIVE_SECURITY_SUMMARY');
    assert.strictEqual(execReport.environment, 'LAB');
    assert(execReport.integrity_hash.startsWith('sha256-'), 'Must generate SHA-256 integrity hash');
    console.log(`✅ Test 1 Passed: 16 Report types validated. Report Number='${execReport.report_number}'.`);

    // TEST 2: Simulation Data Tagging & Isolation
    console.log('\n[TEST 2] Testing Simulation Data Tagging & Environment Isolation...');
    const simReport = await generateReportDefinition('SIMULATION_VALIDATION_REPORT', 'Sim Report Test', { run_id: 'SIM-MULTISTAGE-001' });
    assert.strictEqual(simReport.is_simulation, true, 'Simulation report must be tagged is_simulation=true');
    assert.strictEqual(simReport.environment, 'SIMULATION');
    console.log(`✅ Test 2 Passed: Simulation report correctly tagged environment='${simReport.environment}', is_simulation=true.`);

    // TEST 3: Report Exporters (PDF, CSV, JSON)
    console.log('\n[TEST 3] Testing Report Exporters & Content Integrity...');
    const pdfExport = exportReportContent(execReport, 'PDF');
    const csvExport = exportReportContent(execReport, 'CSV');
    const jsonExport = exportReportContent(execReport, 'JSON');

    assert.strictEqual(pdfExport.export_type, 'PDF');
    assert.strictEqual(csvExport.export_type, 'CSV');
    assert.strictEqual(jsonExport.export_type, 'JSON');
    assert(pdfExport.content.includes('ICS-SHIELD Security Operations Subsystem'), 'PDF HTML must include branding');
    assert(csvExport.content.includes('"Report Number"'), 'CSV export must include header');
    assert(pdfExport.sha256_hash.length === 64, 'SHA-256 hash length must be 64 chars');
    console.log(`✅ Test 3 Passed: PDF, CSV, and JSON exports generated with SHA-256 hashes (${pdfExport.sha256_hash.substring(0, 16)}...).`);

    // TEST 4: Schedule Frequency Calculation
    console.log('\n[TEST 4] Testing Scheduled Report Frequency Calculation...');
    const nextDaily = calculateNextRunTime('DAILY');
    const nextWeekly = calculateNextRunTime('WEEKLY');
    const nextMonthly = calculateNextRunTime('MONTHLY');
    assert(nextDaily, 'Next daily run time calculated');
    assert(nextWeekly, 'Next weekly run time calculated');
    assert(nextMonthly, 'Next monthly run time calculated');
    console.log(`✅ Test 4 Passed: Schedules calculated: Daily=${nextDaily}, Weekly=${nextWeekly}.`);

    // TEST 5: Security Overview Analytics Aggregation
    console.log('\n[TEST 5] Testing Security Overview Analytics Aggregation...');
    const overview = await querySecurityOverviewAnalytics({ period: '30_DAYS' });
    assert(overview.alerts, 'Must return alert breakdown');
    assert(overview.incidents, 'Must return incident breakdown');
    assert(overview.assets, 'Must return asset breakdown');
    console.log(`✅ Test 5 Passed: Security overview analytics aggregated successfully.`);

    // TEST 6: Alert & Incident SLA Latency Analytics (MTTD / MTTA / MTTR)
    console.log('\n[TEST 6] Testing Alert & Incident SLA Latency Analytics (MTTD/MTTA/MTTR)...');
    const alertAnalytics = await queryAlertAnalytics();
    const incAnalytics = await queryIncidentAnalytics();
    assert(typeof alertAnalytics.mtta_seconds === 'number', 'MTTA must be calculated');
    assert(typeof alertAnalytics.mttr_seconds === 'number', 'MTTR must be calculated');
    assert(typeof incAnalytics.mttd_seconds === 'number', 'MTTD must be calculated');
    console.log(`✅ Test 6 Passed: SLA Latencies calculated: MTTD=${incAnalytics.mttd_seconds}s, MTTA=${alertAnalytics.mtta_seconds}s, MTTR=${alertAnalytics.mttr_seconds}s.`);

    // TEST 7: Simulation Lifecycle Analytics (13 Steps)
    console.log('\n[TEST 7] Testing Simulation Lifecycle Analytics & 13-Stage Trace...');
    const simAnalytics = await querySimulationRunAnalytics('SIM-MULTISTAGE-001');
    assert.strictEqual(simAnalytics.lifecycle_timeline.length, 13, 'Simulation trace must have 13 steps');
    assert.strictEqual(simAnalytics.lifecycle_timeline[0].name, 'NORMAL OPERATION');
    assert.strictEqual(simAnalytics.lifecycle_timeline[12].name, 'FINAL RESULT');
    console.log(`✅ Test 7 Passed: 13-Stage Simulation trace validated from NORMAL OPERATION to FINAL RESULT.`);

    // TEST 8: Phase 15 Evaluation Matrix in Simulation Analytics
    console.log('\n[TEST 8] Testing Phase 15 Evaluation Matrix in Simulation Analytics...');
    assert.strictEqual(simAnalytics.evaluation_matrix.EXPECTED, 4);
    assert.strictEqual(simAnalytics.evaluation_matrix.OBSERVED, 4);
    assert.strictEqual(simAnalytics.evaluation_matrix.MISSING, 0);
    assert.strictEqual(simAnalytics.evaluation_matrix.UNEXPECTED, 0);
    assert(simAnalytics.evaluation_matrix.latencies.detection_latency_ms > 0);
    console.log(`✅ Test 8 Passed: Phase 15 Evaluation Matrix validated (Expected=4, Observed=4, Missing=0, Detection Latency=${simAnalytics.evaluation_matrix.latencies.detection_latency_ms}ms).`);

    // TEST 9: Report Service CRUD & Export Flow
    console.log('\n[TEST 9] Testing Report Service CRUD & Export Flow...');
    const newReport = await createReport({ report_type: 'SOC_OPERATIONS_REPORT', title: 'SOC Audit Test' }, 1, 'soc_analyst');
    assert(newReport.id, 'Report must be created with ID');
    const reportList = await getReports();
    assert(reportList.length > 0, 'Report list must contain created report');
    const exportedRecord = await exportReport(newReport.id, 'PDF', 1, 'soc_analyst');
    assert.strictEqual(exportedRecord.export_type, 'PDF');
    console.log(`✅ Test 9 Passed: Report Service CRUD & Export executed successfully.`);

    // TEST 10: Reports Subsystem Health & Operations Metrics
    console.log('\n[TEST 10] Testing Reports Subsystem Health & Operations Metrics...');
    const health = await getReportsHealth();
    assert.strictEqual(health.status, 'HEALTHY');
    assert.strictEqual(health.phase, 'PHASE_17_REPORTS_AND_ADVANCED_ANALYTICS');
    assert.strictEqual(health.exporter_formats_supported.length, 4);
    console.log(`✅ Test 10 Passed: Reports Health Status='${health.status}', Phase='${health.phase}'.`);

    console.log('\n==================================================');
    console.log(' 🎉 ALL PHASE 17 REPORTS & ANALYTICS TESTS PASSED!');
    console.log('==================================================\n');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  }
}

runTests();
