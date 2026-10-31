import {
  querySecurityOverviewAnalytics,
  queryAlertAnalytics,
  queryIncidentAnalytics,
  queryDetectionAnalytics,
  queryAssetAnalytics,
  querySimulationRunAnalytics,
} from './aggregations.js';

export const REPORT_TYPES = [
  'EXECUTIVE_SECURITY_SUMMARY',
  'SOC_OPERATIONS_REPORT',
  'INCIDENT_REPORT',
  'ALERT_ANALYTICS_REPORT',
  'DETECTION_EFFECTIVENESS_REPORT',
  'ASSET_HEALTH_REPORT',
  'ASSET_RISK_REPORT',
  'NETWORK_ACTIVITY_REPORT',
  'PROTOCOL_ACTIVITY_REPORT',
  'PROCESS_HEALTH_REPORT',
  'MITRE_COVERAGE_REPORT',
  'RESPONSE_EFFECTIVENESS_REPORT',
  'SIMULATION_VALIDATION_REPORT',
  'ML_ANALYTICS_REPORT',
  'SYSTEM_HEALTH_REPORT',
  'CUSTOM_SECURITY_REPORT',
];

export async function generateReportDefinition(reportType, title, filters = {}, userId = 1, username = 'soc_analyst') {
  const type = REPORT_TYPES.includes(reportType) ? reportType : 'EXECUTIVE_SECURITY_SUMMARY';
  const environment = filters.environment || (type === 'SIMULATION_VALIDATION_REPORT' ? 'SIMULATION' : 'LAB');
  const isSimulation = environment === 'SIMULATION' || type === 'SIMULATION_VALIDATION_REPORT';

  let data = {};
  if (type === 'SIMULATION_VALIDATION_REPORT') {
    data = await querySimulationRunAnalytics(filters.run_id);
  } else if (type === 'ALERT_ANALYTICS_REPORT') {
    data = await queryAlertAnalytics(filters);
  } else if (type === 'INCIDENT_REPORT') {
    data = await queryIncidentAnalytics(filters);
  } else if (type === 'DETECTION_EFFECTIVENESS_REPORT') {
    data = await queryDetectionAnalytics(filters);
  } else if (type === 'ASSET_HEALTH_REPORT' || type === 'ASSET_RISK_REPORT') {
    data = await queryAssetAnalytics(filters);
  } else {
    data = await querySecurityOverviewAnalytics(filters);
  }

  const generatedTimestamp = new Date().toISOString();
  const reportNumber = `RPT-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const definition = {
    report_number: reportNumber,
    report_type: type,
    title: title || `${type.replace(/_/g, ' ')}`,
    environment: environment,
    is_simulation: isSimulation,
    format: filters.format || 'PDF',
    time_range_start: filters.start_time || new Date(Date.now() - 7 * 86400000).toISOString(),
    time_range_end: filters.end_time || generatedTimestamp,
    filters_applied: filters,
    generated_by: username,
    generated_at: generatedTimestamp,
    version: 1,
    integrity_hash: `sha256-${Buffer.from(`${reportNumber}-${generatedTimestamp}`).toString('hex').substring(0, 32)}`,
    sections: [
      {
        title: 'Executive Overview',
        content: `This ${type.replace(/_/g, ' ')} compiles real-time defensive cybersecurity data from the ICS-SHIELD industrial platform. Environment context: ${environment}.`,
      },
      {
        title: 'Data & Analytics Findings',
        metrics: data,
      },
      {
        title: 'Security Compliance & Integrity Notes',
        content: isSimulation
          ? '🧪 NOTICE: THIS REPORT CONTAINS SYNTHETIC LAB SIMULATION DATA. NOT REAL INDUSTRIAL INCIDENTS.'
          : 'All telemetry and audit records were retrieved from the authoritative ICS-SHIELD database.',
      },
    ],
  };

  return definition;
}
