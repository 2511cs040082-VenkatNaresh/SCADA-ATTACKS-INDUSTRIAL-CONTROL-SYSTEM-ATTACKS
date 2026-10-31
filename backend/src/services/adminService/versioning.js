import { query } from '../../config/database.js';
import { createAuditLog } from '../audit.service.js';
import { broadcastMessage } from '../websocket.service.js';
import { cryptoUUID } from '../../utils/uuid.js';

let inMemoryConfigHistory = [];

export async function recordConfigHistory({ category, settingKey, previousValue, newValue, version, changeReason, changedBy }) {
  const historyUuid = cryptoUUID();

  try {
    await query(`
      INSERT INTO configuration_history (history_uuid, category, setting_key, previous_value, new_value, version, change_reason, changed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [historyUuid, category, settingKey, previousValue || null, newValue, version, changeReason || null, changedBy || null]);
  } catch (err) {
    // Fallback
  }

  inMemoryConfigHistory.unshift({
    id: inMemoryConfigHistory.length + 1,
    historyUuid,
    category,
    settingKey,
    previousValue,
    newValue,
    version,
    changeReason,
    changedBy,
    changedAt: new Date().toISOString()
  });
}

export async function getConfigHistory(settingKey = null, category = null, limit = 50) {
  try {
    let sql = `
      SELECT ch.id, ch.history_uuid AS historyUuid, ch.category, ch.setting_key AS settingKey,
             ch.previous_value AS previousValue, ch.new_value AS newValue, ch.version,
             ch.change_reason AS changeReason, ch.changed_by AS changedBy, ch.changed_at AS changedAt,
             u.username, u.full_name AS fullName
      FROM configuration_history ch
      LEFT JOIN users u ON ch.changed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (settingKey) {
      sql += ' AND ch.setting_key = ?';
      params.push(settingKey);
    }
    if (category) {
      sql += ' AND ch.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY ch.changed_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const rows = await query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    // Fallback
  }

  let filtered = [...inMemoryConfigHistory];
  if (settingKey) filtered = filtered.filter(h => h.settingKey === settingKey);
  if (category) filtered = filtered.filter(h => h.category === category);
  return filtered.slice(0, limit);
}

export async function rollbackSetting(settingKey, targetVersion, actorId = null) {
  const history = await getConfigHistory(settingKey);

  let targetValue = null;
  const directRecord = history.find(h => Number(h.version) === Number(targetVersion));
  if (directRecord) {
    targetValue = directRecord.newValue;
  } else {
    const prevRecord = history.find(h => Number(h.version) === Number(targetVersion) + 1);
    if (prevRecord && prevRecord.previousValue !== undefined && prevRecord.previousValue !== null) {
      targetValue = prevRecord.previousValue;
    }
  }

  if (targetValue === null) {
    throw new Error(`Target version ${targetVersion} for setting '${settingKey}' not found in configuration history.`);
  }

  // Import setting update dynamically to prevent circular dependencies
  const { updateSetting } = await import('./settings.js');
  const result = await updateSetting(settingKey, targetValue, `Rollback to version ${targetVersion}`, actorId);

  await createAuditLog({
    userId: actorId,
    action: 'CONFIGURATION_ROLLBACK',
    resourceType: 'SETTING',
    resourceId: settingKey,
    result: 'SUCCESS',
    details: { settingKey, targetVersion, restoredValue: targetValue }
  });

  return { message: `Setting ${settingKey} rolled back to version ${targetVersion}.`, setting: result };
}
