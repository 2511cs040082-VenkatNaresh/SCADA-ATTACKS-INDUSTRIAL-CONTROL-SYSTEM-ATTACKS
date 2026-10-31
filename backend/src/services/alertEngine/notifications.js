import { query } from '../../config/database.js';
import logger from '../../logging/logger.js';
import { broadcastMessage } from '../websocket.service.js';
import { ALERT_CONFIG } from './config.js';

let inMemoryNotifications = [];
const notificationCooldownMap = new Map(); // key: alertId:channel -> timestamp

export async function sendAlertNotifications(alert) {
  const channels = ['IN_APP'];
  if (alert.severity === 'CRITICAL' || alert.priority === 'P1') {
    channels.push('EMAIL');
  }

  const results = [];
  const now = Date.now();
  const cooldownMs = ALERT_CONFIG.notification_cooldown_seconds * 1000;

  for (const channel of channels) {
    const cooldownKey = `${alert.id || alert.alert_uuid}:${channel}`;
    const lastSent = notificationCooldownMap.get(cooldownKey) || 0;

    if (now - lastSent < cooldownMs) {
      logger.debug(`Notification suppressed by cooldown for key ${cooldownKey}`);
      continue;
    }

    notificationCooldownMap.set(cooldownKey, now);

    const notificationUuid = `NOTIF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const notifRecord = {
      id: inMemoryNotifications.length + 1,
      notification_uuid: notificationUuid,
      alert_id: alert.id || 1,
      channel,
      notification_type: 'NEW_ALERT',
      recipient: channel === 'EMAIL' ? process.env.SOC_ALERT_EMAIL || 'soc-team@icsshield.local' : 'SOC Analyst',
      title: `[${alert.priority}] ${alert.title}`,
      message: `Alert (${alert.severity}) generated for ${alert.asset_name || 'ICS Asset'}. Protocol: ${alert.protocol}. Status: ${alert.status}.`,
      status: 'SENT',
      read_status: false,
      sent_at: new Date().toISOString()
    };

    try {
      await query(`
        INSERT INTO alert_notifications
        (notification_uuid, alert_id, channel, notification_type, recipient, title, message, status, read_status, sent_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        notifRecord.notification_uuid, notifRecord.alert_id, notifRecord.channel,
        notifRecord.notification_type, notifRecord.recipient, notifRecord.title,
        notifRecord.message, notifRecord.status, notifRecord.read_status
      ]);
    } catch (err) {
      logger.debug(`Notification DB insert fallback: ${err.message}`);
    }

    inMemoryNotifications.unshift(notifRecord);
    results.push(notifRecord);

    if (channel === 'IN_APP') {
      broadcastMessage('alert.notification_created', notifRecord);
    }
  }

  return results;
}

export async function getNotifications(filters = {}) {
  const { unread_only, limit = 50 } = filters;
  try {
    let sql = `SELECT * FROM alert_notifications WHERE 1=1`;
    const params = [];
    if (unread_only) {
      sql += ` AND read_status = FALSE`;
    }
    sql += ` ORDER BY id DESC LIMIT ?`;
    params.push(Number(limit));

    const rows = await query(sql, params);
    if (rows && rows.length > 0) return rows;
  } catch (err) {
    logger.debug(`Get notifications DB fallback: ${err.message}`);
  }

  let list = [...inMemoryNotifications];
  if (unread_only) list = list.filter(n => !n.read_status);
  return list.slice(0, Number(limit));
}

export async function markNotificationsAsRead(ids) {
  try {
    if (ids && ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      await query(`UPDATE alert_notifications SET read_status = TRUE WHERE id IN (${placeholders})`, ids);
    } else {
      await query(`UPDATE alert_notifications SET read_status = TRUE WHERE read_status = FALSE`);
    }
  } catch (err) {
    logger.debug(`Mark notifications read DB fallback: ${err.message}`);
  }

  inMemoryNotifications.forEach(n => {
    if (!ids || ids.length === 0 || ids.includes(n.id)) {
      n.read_status = true;
    }
  });

  return { success: true };
}
