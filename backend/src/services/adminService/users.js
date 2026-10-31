import bcrypt from 'bcryptjs';
import { query } from '../../config/database.js';
import { cryptoUUID } from '../../utils/uuid.js';
import { securityConfig } from '../../config/security.js';
import { createAuditLog } from '../audit.service.js';
import { broadcastMessage } from '../websocket.service.js';

// In-memory fallback user store for test/offline environments
const inMemoryUsers = new Map([
  [1, { id: 1, user_uuid: 'usr-admin-001', username: 'admin', email: 'admin@icsshield.internal', full_name: 'System Administrator', status: 'ACTIVE', roles: ['ADMIN'], created_at: new Date().toISOString(), last_login: new Date().toISOString(), last_activity: new Date().toISOString() }],
  [2, { id: 2, user_uuid: 'usr-analyst-002', username: 'soc_analyst', email: 'analyst@icsshield.internal', full_name: 'Lead SOC Analyst', status: 'ACTIVE', roles: ['SECURITY_ANALYST'], created_at: new Date().toISOString(), last_login: new Date().toISOString(), last_activity: new Date().toISOString() }],
  [3, { id: 3, user_uuid: 'usr-operator-003', username: 'ot_operator', email: 'operator@icsshield.internal', full_name: 'OT Control Engineer', status: 'ACTIVE', roles: ['OT_OPERATOR'], created_at: new Date().toISOString(), last_login: new Date().toISOString(), last_activity: new Date().toISOString() }],
  [4, { id: 4, user_uuid: 'usr-viewer-004', username: 'auditor', email: 'auditor@icsshield.internal', full_name: 'Auditor Viewer', status: 'ACTIVE', roles: ['VIEWER'], created_at: new Date().toISOString(), last_login: new Date().toISOString(), last_activity: new Date().toISOString() }]
]);

let nextUserId = 5;

export async function getUsers() {
  try {
    const rows = await query(`
      SELECT u.id, u.user_uuid, u.username, u.email, u.full_name, u.status, u.last_login, u.created_at,
             GROUP_CONCAT(r.name) AS roles_list,
             COUNT(DISTINCT s.id) AS session_count
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN sessions s ON u.id = s.user_id AND (s.is_revoked IS NULL OR s.is_revoked = 0)
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    
    if (rows && rows.length > 0) {
      return rows.map(u => ({
        id: u.id,
        userUuid: u.user_uuid,
        username: u.username,
        email: u.email,
        fullName: u.full_name,
        status: u.status,
        roles: u.roles_list ? u.roles_list.split(',') : [],
        lastLogin: u.last_login,
        createdAt: u.created_at,
        sessionCount: u.session_count || 0
      }));
    }
  } catch (err) {
    // Fallback to in-memory store
  }

  return Array.from(inMemoryUsers.values()).map(u => ({
    id: u.id,
    userUuid: u.user_uuid,
    username: u.username,
    email: u.email,
    fullName: u.full_name,
    status: u.status,
    roles: u.roles,
    lastLogin: u.last_login,
    createdAt: u.created_at,
    sessionCount: u.status === 'ACTIVE' ? 1 : 0
  }));
}

export async function getUserById(id) {
  const users = await getUsers();
  return users.find(u => String(u.id) === String(id) || u.userUuid === String(id)) || null;
}

export async function createAdminUser({ username, email, password, fullName, roles = ['VIEWER'], status = 'ACTIVE' }, actorId = null) {
  // 1. Password Strength Check
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  // 2. Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    throw new Error('Invalid email format.');
  }

  // 3. Allowed Roles check
  const allowedRoles = ['ADMIN', 'SECURITY_ANALYST', 'SOC_OPERATOR', 'OT_OPERATOR', 'VIEWER'];
  const invalidRoles = roles.filter(r => !allowedRoles.includes(r));
  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles specified: [${invalidRoles.join(', ')}]`);
  }

  const existingUsers = await getUsers();
  if (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error(`Username '${username}' already exists.`);
  }

  const userUuid = cryptoUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  let newUser;

  try {
    const result = await query(`
      INSERT INTO users (user_uuid, username, email, password_hash, full_name, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userUuid, username, email, passwordHash, fullName, status]);

    const userId = result.insertId;

    for (const roleName of roles) {
      const roleRows = await query('SELECT id FROM roles WHERE name = ?', [roleName]);
      if (roleRows.length > 0) {
        await query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleRows[0].id]);
      }
    }

    newUser = await getUserById(userId);
  } catch (err) {
    // Fallback to in-memory store
    const id = nextUserId++;
    newUser = {
      id,
      userUuid,
      username,
      email,
      fullName,
      status,
      roles,
      lastLogin: null,
      createdAt: new Date().toISOString(),
      sessionCount: 0
    };
    inMemoryUsers.set(id, { id, user_uuid: userUuid, username, email, full_name: fullName, status, roles, passwordHash });
  }

  await createAuditLog({
    userId: actorId,
    action: 'USER_CREATED',
    resourceType: 'USER',
    resourceId: String(newUser.id),
    result: 'SUCCESS',
    details: { username, email, roles, status }
  });

  broadcastMessage('admin.user_created', { user: newUser });

  return newUser;
}

export async function updateUser(id, { fullName, email, roles, status }, actorId = null) {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found.');

  if (status && !['ACTIVE', 'DISABLED'].includes(status)) {
    throw new Error('Status must be ACTIVE or DISABLED.');
  }

  let updatedUser;

  try {
    await query(`
      UPDATE users SET full_name = COALESCE(?, full_name), email = COALESCE(?, email), status = COALESCE(?, status)
      WHERE id = ?
    `, [fullName || null, email || null, status || null, user.id]);

    if (roles && Array.isArray(roles)) {
      await query('DELETE FROM user_roles WHERE user_id = ?', [user.id]);
      for (const roleName of roles) {
        const roleRows = await query('SELECT id FROM roles WHERE name = ?', [roleName]);
        if (roleRows.length > 0) {
          await query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [user.id, roleRows[0].id]);
        }
      }
    }

    updatedUser = await getUserById(user.id);
  } catch (err) {
    const memUser = inMemoryUsers.get(user.id) || user;
    if (fullName) memUser.fullName = fullName;
    if (email) memUser.email = email;
    if (status) memUser.status = status;
    if (roles) memUser.roles = roles;
    inMemoryUsers.set(user.id, memUser);
    updatedUser = await getUserById(user.id);
  }

  await createAuditLog({
    userId: actorId,
    action: 'USER_UPDATED',
    resourceType: 'USER',
    resourceId: String(user.id),
    result: 'SUCCESS',
    details: { fullName, email, roles, status }
  });

  broadcastMessage('admin.user_updated', { user: updatedUser });

  return updatedUser;
}

export async function setUserStatus(id, newStatus, actorId = null) {
  const user = await getUserById(id);
  if (!user) throw new Error('User not found.');

  const result = await updateUser(id, { status: newStatus }, actorId);

  const action = newStatus === 'ACTIVE' ? 'USER_ENABLED' : 'USER_DISABLED';
  await createAuditLog({
    userId: actorId,
    action,
    resourceType: 'USER',
    resourceId: String(id),
    result: 'SUCCESS',
    details: { username: user.username, status: newStatus }
  });

  broadcastMessage(newStatus === 'ACTIVE' ? 'admin.user_enabled' : 'admin.user_disabled', { userId: id, status: newStatus });

  return result;
}

export async function resetUserPassword(id, newPassword, actorId = null) {
  if (!newPassword || newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  const user = await getUserById(id);
  if (!user) throw new Error('User not found.');

  const passwordHash = await bcrypt.hash(newPassword, 10);

  try {
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);
  } catch (err) {
    const memUser = inMemoryUsers.get(user.id);
    if (memUser) memUser.passwordHash = passwordHash;
  }

  await createAuditLog({
    userId: actorId,
    action: 'PASSWORD_RESET',
    resourceType: 'USER',
    resourceId: String(user.id),
    result: 'SUCCESS',
    details: { username: user.username }
  });

  return { message: `Password for user ${user.username} reset successfully.` };
}
