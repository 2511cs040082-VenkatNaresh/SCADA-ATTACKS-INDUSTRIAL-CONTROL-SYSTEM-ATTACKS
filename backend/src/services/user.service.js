import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { cryptoUUID } from '../utils/uuid.js';
import { securityConfig } from '../config/security.js';

export async function getAllUsers() {
  const users = await query(`
    SELECT u.id, u.user_uuid, u.username, u.email, u.full_name, u.status, u.last_login, u.created_at,
           GROUP_CONCAT(r.name) AS roles_list
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  return users.map(u => ({
    ...u,
    roles: u.roles_list ? u.roles_list.split(',') : []
  }));
}

export async function getUserById(id) {
  const users = await query(`
    SELECT u.id, u.user_uuid, u.username, u.email, u.full_name, u.status, u.last_login, u.created_at
    FROM users u
    WHERE u.id = ? OR u.user_uuid = ?
  `, [id, id]);

  if (users.length === 0) return null;

  const user = users[0];
  const roles = await query(`
    SELECT r.name FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?
  `, [user.id]);

  user.roles = roles.map(r => r.name);
  return user;
}

export async function createUser({ username, email, password, fullName, roles = ['VIEWER'] }) {
  const userUuid = cryptoUUID();
  const passwordHash = await bcrypt.hash(password, securityConfig.saltRounds);

  const result = await query(`
    INSERT INTO users (user_uuid, username, email, password_hash, full_name, status)
    VALUES (?, ?, ?, ?, ?, 'ACTIVE')
  `, [userUuid, username, email, passwordHash, fullName]);

  const userId = result.insertId;

  for (const roleName of roles) {
    const roleRows = await query('SELECT id FROM roles WHERE name = ?', [roleName]);
    if (roleRows.length > 0) {
      await query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleRows[0].id]);
    }
  }

  return await getUserById(userId);
}
