import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { env } from '../config/environment.js';
import { cryptoUUID } from '../utils/uuid.js';
import { createAuditLog } from './audit.service.js';

export async function loginUser({ username, password, ipAddress, userAgent }) {
  // 1. Fetch user by username or email
  const users = await query(`
    SELECT u.id, u.user_uuid, u.username, u.email, u.password_hash, u.full_name, u.status
    FROM users u
    WHERE u.username = ? OR u.email = ?
  `, [username, username]);

  if (users.length === 0) {
    await createAuditLog({ action: 'LOGIN_FAILED', resourceType: 'USER', resourceId: username, ipAddress, userAgent, result: 'FAILED', details: { reason: 'User not found' } });
    throw new Error('Invalid username or password.');
  }

  const user = users[0];

  if (user.status !== 'ACTIVE') {
    await createAuditLog({ userId: user.id, action: 'LOGIN_FAILED', resourceType: 'USER', resourceId: user.username, ipAddress, userAgent, result: 'FAILED', details: { reason: 'Account disabled' } });
    throw new Error('Account is deactivated.');
  }

  // 2. Verify password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    await createAuditLog({ userId: user.id, action: 'LOGIN_FAILED', resourceType: 'USER', resourceId: user.username, ipAddress, userAgent, result: 'FAILED', details: { reason: 'Password mismatch' } });
    throw new Error('Invalid username or password.');
  }

  // 3. Fetch user roles
  const rolesRows = await query(`
    SELECT r.name
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = ?
  `, [user.id]);

  const roles = rolesRows.map(r => r.name);

  // 4. Generate JWT payload & sign token
  const payload = {
    id: user.id,
    userUuid: user.user_uuid,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    roles,
  };

  const accessToken = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

  // 5. Record session & last_login
  const sessionUuid = cryptoUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await query('INSERT INTO sessions (session_uuid, user_id, token_hash, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
    [sessionUuid, user.id, accessToken.substring(0, 32), ipAddress, userAgent, expiresAt]
  );

  await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

  await createAuditLog({ userId: user.id, action: 'LOGIN', resourceType: 'USER', resourceId: user.username, ipAddress, userAgent, result: 'SUCCESS' });

  return {
    user: {
      id: user.id,
      userUuid: user.user_uuid,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      roles,
    },
    accessToken,
    expiresIn: env.jwtExpiresIn,
  };
}

export async function logoutUser(userId, token, ipAddress, userAgent) {
  if (userId) {
    await createAuditLog({ userId, action: 'LOGOUT', resourceType: 'USER', resourceId: String(userId), ipAddress, userAgent, result: 'SUCCESS' });
  }
  return { message: 'Logged out successfully.' };
}
