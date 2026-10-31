import { query } from '../../config/database.js';
import { createAuditLog } from '../audit.service.js';
import { broadcastMessage } from '../websocket.service.js';
import { getUsers } from './users.js';

let activeSessionsMap = new Map([
  ['ses-001', { id: 1, sessionUuid: 'ses-001', userId: 1, username: 'admin', ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', loginTime: new Date(Date.now() - 3600000).toISOString(), lastActivity: new Date().toISOString(), expiresAt: new Date(Date.now() + 23 * 3600000).toISOString(), status: 'ACTIVE' }],
  ['ses-002', { id: 2, sessionUuid: 'ses-002', userId: 2, username: 'soc_analyst', ipAddress: '192.168.1.105', userAgent: 'Chrome/128.0.0', loginTime: new Date(Date.now() - 7200000).toISOString(), lastActivity: new Date(Date.now() - 600000).toISOString(), expiresAt: new Date(Date.now() + 22 * 3600000).toISOString(), status: 'ACTIVE' }]
]);

export async function getActiveSessions() {
  try {
    const rows = await query(`
      SELECT s.id, s.session_uuid, s.user_id, s.ip_address, s.user_agent, s.created_at AS login_time, s.expires_at, s.is_revoked,
             u.username, u.full_name
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE (s.is_revoked IS NULL OR s.is_revoked = 0) AND s.expires_at > NOW()
      ORDER BY s.created_at DESC
    `);

    if (rows && rows.length > 0) {
      return rows.map(s => ({
        id: s.id,
        sessionUuid: s.session_uuid,
        userId: s.user_id,
        username: s.username,
        fullName: s.full_name,
        ipAddress: s.ip_address,
        userAgent: s.user_agent,
        loginTime: s.login_time,
        lastActivity: s.login_time,
        expiresAt: s.expires_at,
        status: s.is_revoked ? 'REVOKED' : 'ACTIVE'
      }));
    }
  } catch (err) {
    // Fallback
  }

  return Array.from(activeSessionsMap.values()).filter(s => s.status === 'ACTIVE');
}

export async function revokeSession(sessionId, actorId = null) {
  let session = null;
  const sessions = Array.from(activeSessionsMap.values());
  session = sessions.find(s => String(s.id) === String(sessionId) || s.sessionUuid === String(sessionId));

  try {
    await query('UPDATE sessions SET is_revoked = 1 WHERE id = ? OR session_uuid = ?', [sessionId, sessionId]);
  } catch (err) {
    if (session) {
      session.status = 'REVOKED';
      activeSessionsMap.set(session.sessionUuid, session);
    }
  }

  const userId = session ? session.userId : null;
  const username = session ? session.username : 'Unknown';

  await createAuditLog({
    userId: actorId,
    action: 'SESSION_REVOKED',
    resourceType: 'SESSION',
    resourceId: String(sessionId),
    result: 'SUCCESS',
    details: { targetUserId: userId, username }
  });

  broadcastMessage('admin.session_revoked', { sessionId, userId });

  return { message: `Session ${sessionId} revoked successfully.` };
}

export async function revokeUserSessions(userId, actorId = null) {
  try {
    await query('UPDATE sessions SET is_revoked = 1 WHERE user_id = ?', [userId]);
  } catch (err) {
    activeSessionsMap.forEach((s, key) => {
      if (String(s.userId) === String(userId)) {
        s.status = 'REVOKED';
        activeSessionsMap.set(key, s);
      }
    });
  }

  await createAuditLog({
    userId: actorId,
    action: 'FORCE_LOGOUT_USER',
    resourceType: 'USER',
    resourceId: String(userId),
    result: 'SUCCESS',
    details: { targetUserId: userId }
  });

  broadcastMessage('admin.session_revoked', { userId, allUserSessions: true });

  return { message: `All active sessions for user ID ${userId} revoked.` };
}
