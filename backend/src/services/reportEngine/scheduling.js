import { getDbPool } from '../../config/db.js';
import logger from '../../logging/logger.js';

export function calculateNextRunTime(frequency = 'WEEKLY') {
  const now = new Date();
  if (frequency === 'DAILY') {
    now.setDate(now.getDate() + 1);
  } else if (frequency === 'MONTHLY') {
    now.setMonth(now.getMonth() + 1);
  } else {
    // WEEKLY default
    now.setDate(now.getDate() + 7);
  }
  return now.toISOString().slice(0, 19).replace('T', ' ');
}

export async function processScheduledReportJobs() {
  try {
    const pool = getDbPool();
    const [schedules] = await pool.query(`
      SELECT * FROM report_schedules 
      WHERE enabled = TRUE AND (next_run_at IS NULL OR next_run_at <= NOW())
    `);

    for (const sched of schedules) {
      logger.info(`[REPORT SCHEDULER] Triggering scheduled report generation for '${sched.title}' (${sched.schedule_uuid})`);
      const nextRun = calculateNextRunTime(sched.frequency);
      await pool.query('UPDATE report_schedules SET last_run_at = NOW(), next_run_at = ? WHERE id = ?', [nextRun, sched.id]);
    }
    return schedules.length;
  } catch (err) {
    logger.warn(`[REPORT SCHEDULER] Process schedules skipped: ${err.message}`);
    return 0;
  }
}
