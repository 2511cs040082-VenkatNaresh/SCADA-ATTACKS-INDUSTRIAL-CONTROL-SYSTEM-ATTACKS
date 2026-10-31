import { getDbPool } from '../config/db.js';
import logger from '../logging/logger.js';
import { generateReportDefinition } from './reportEngine/generators.js';
import { exportReportContent } from './reportEngine/exporters.js';
import { calculateNextRunTime } from './reportEngine/scheduling.js';

const memoryReports = [];
const memorySchedules = [];
const memoryExports = [];

function generateUUID() {
  return 'rpt-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
}

export async function getReports(filters = {}) {
  try {
    const pool = getDbPool();
    let sql = 'SELECT * FROM reports';
    const params = [];
    if (filters.report_type) {
      sql += ' WHERE report_type = ?';
      params.push(filters.report_type);
    }
    sql += ' ORDER BY id DESC';
    const [rows] = await pool.query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[REPORT SVC] DB getReports fallback: ${err.message}`);
  }
  let list = memoryReports;
  if (filters.report_type) list = list.filter((r) => r.report_type === filters.report_type);
  return list;
}

export async function getReportById(id) {
  const list = await getReports();
  return list.find((r) => String(r.id) === String(id) || r.report_uuid === id || r.report_number === id) || memoryReports[0] || null;
}

export async function createReport(data, userId = 1, username = 'soc_analyst') {
  const definition = await generateReportDefinition(data.report_type, data.title, data.filters || {}, userId, username);
  const uuid = generateUUID();
  const reportObj = {
    id: memoryReports.length + 1,
    report_uuid: uuid,
    report_number: definition.report_number,
    title: definition.title,
    report_type: definition.report_type,
    description: data.description || `Report for ${definition.report_type}`,
    environment: definition.environment,
    format: definition.format,
    status: 'GENERATED',
    version: 1,
    definition_json: definition,
    created_by: userId,
    created_by_username: username,
    created_at: definition.generated_at,
  };

  memoryReports.unshift(reportObj);

  try {
    const pool = getDbPool();
    await pool.query(
      `
      INSERT INTO reports (report_uuid, report_number, title, report_type, description, environment, format, status, version, created_by, created_by_username)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'GENERATED', 1, ?, ?)
    `,
      [uuid, definition.report_number, definition.title, definition.report_type, reportObj.description, definition.environment, definition.format, userId, username]
    );
  } catch (err) {
    logger.warn(`[REPORT SVC] DB createReport skipped: ${err.message}`);
  }

  return reportObj;
}

export async function generateReport(id, userId = 1, username = 'soc_analyst') {
  const report = await getReportById(id);
  if (report) return report;
  return createReport({ reportType: 'EXECUTIVE_SECURITY_SUMMARY', title: 'Security Summary' }, userId, username);
}

export async function exportReport(id, exportFormat = 'PDF', userId = 1, username = 'soc_analyst') {
  const report = await getReportById(id);
  if (!report) throw new Error('Report not found');

  const definition = report.definition_json || (await generateReportDefinition(report.report_type, report.title, {}, userId, username));
  const exported = exportReportContent(definition, exportFormat);

  const exportRecord = {
    id: memoryExports.length + 1,
    export_uuid: generateUUID(),
    report_id: report.id,
    export_type: exported.export_type,
    file_name: exported.fileName,
    file_size_bytes: exported.file_size_bytes,
    sha256_hash: exported.sha256_hash,
    hash: exported.sha256_hash,
    content: exported.content,
    mime_type: exported.mimeType,
    generated_by_username: username,
    generated_at: new Date().toISOString(),
  };

  memoryExports.unshift(exportRecord);

  return exportRecord;
}

export async function getSchedules() {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM report_schedules ORDER BY id DESC');
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.warn(`[REPORT SVC] DB getSchedules fallback: ${err.message}`);
  }
  return memorySchedules;
}

export async function createSchedule(data, userId = 1, username = 'soc_analyst') {
  const uuid = generateUUID();
  const nextRun = calculateNextRunTime(data.frequency || 'WEEKLY');
  const sched = {
    id: memorySchedules.length + 1,
    schedule_uuid: uuid,
    title: data.title || `${data.report_type || 'EXECUTIVE_SECURITY_SUMMARY'} Schedule`,
    report_type: data.report_type || 'EXECUTIVE_SECURITY_SUMMARY',
    frequency: data.frequency || 'WEEKLY',
    cron_expression: data.cron_expression || '0 0 * * 0',
    export_format: data.export_format || 'PDF',
    environment: data.environment || 'LAB',
    enabled: true,
    next_run_at: nextRun,
    created_by_username: username,
    created_at: new Date().toISOString(),
  };

  memorySchedules.unshift(sched);

  try {
    const pool = getDbPool();
    await pool.query(
      `
      INSERT INTO report_schedules (schedule_uuid, title, report_type, frequency, cron_expression, export_format, environment, enabled, next_run_at, created_by, created_by_username)
      VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)
    `,
      [uuid, sched.title, sched.report_type, sched.frequency, sched.cron_expression, sched.export_format, sched.environment, nextRun, userId, username]
    );
  } catch (err) {
    logger.warn(`[REPORT SVC] DB createSchedule skipped: ${err.message}`);
  }

  return sched;
}

export async function getReportsHealth() {
  const reports = await getReports();
  const schedules = await getSchedules();

  return {
    status: 'HEALTHY',
    phase: 'PHASE_17_REPORTS_AND_ADVANCED_ANALYTICS',
    reporting_engine_status: 'ONLINE',
    analytics_engine_status: 'ACTIVE',
    exporter_formats_supported: ['PDF', 'CSV', 'JSON', 'XLSX'],
    total_reports_generated: reports.length,
    active_schedules: schedules.length,
    timestamp: new Date().toISOString(),
  };
}
