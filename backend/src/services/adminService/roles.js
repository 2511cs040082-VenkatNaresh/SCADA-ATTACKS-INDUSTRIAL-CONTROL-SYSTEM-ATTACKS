import { query } from '../../config/database.js';
import { createAuditLog } from '../audit.service.js';
import { broadcastMessage } from '../websocket.service.js';
import { getUsers } from './users.js';

const SYSTEM_CRITICAL_ROLES = ['ADMIN', 'SECURITY_ANALYST', 'SOC_OPERATOR', 'OT_OPERATOR', 'VIEWER'];

const defaultRolePermissions = {
  ADMIN: [
    'dashboard.read', 'assets.read', 'assets.create', 'assets.update', 'assets.delete',
    'telemetry.read', 'network.read', 'detections.read', 'detections.manage',
    'ml.read', 'ml.manage', 'alerts.read', 'alerts.manage', 'incidents.read', 'incidents.manage',
    'mitre.read', 'mitre.manage', 'response.read', 'response.manage', 'response.approve', 'response.execute',
    'simulation.read', 'simulation.manage', 'simulation.approve', 'simulation.execute',
    'reports.read', 'reports.create', 'reports.export', 'reports.schedule',
    'users.manage', 'roles.manage', 'settings.manage', 'audit.read'
  ],
  SECURITY_ANALYST: [
    'dashboard.read', 'assets.read', 'telemetry.read', 'network.read',
    'detections.read', 'detections.manage', 'ml.read', 'alerts.read', 'alerts.manage',
    'incidents.read', 'incidents.manage', 'mitre.read', 'mitre.manage',
    'response.read', 'response.manage', 'simulation.read', 'reports.read', 'reports.create', 'reports.export'
  ],
  SOC_OPERATOR: [
    'dashboard.read', 'assets.read', 'telemetry.read', 'network.read',
    'detections.read', 'alerts.read', 'alerts.manage', 'incidents.read',
    'mitre.read', 'response.read', 'simulation.read', 'reports.read'
  ],
  OT_OPERATOR: [
    'dashboard.read', 'assets.read', 'assets.create', 'assets.update',
    'telemetry.read', 'network.read', 'detections.read', 'alerts.read',
    'reports.read'
  ],
  VIEWER: [
    'dashboard.read', 'assets.read', 'telemetry.read', 'network.read',
    'detections.read', 'alerts.read', 'incidents.read', 'mitre.read', 'reports.read'
  ]
};

let customRolesMap = new Map();

export async function getRoles() {
  const users = await getUsers();

  let roles = SYSTEM_CRITICAL_ROLES.map((name, index) => {
    const userCount = users.filter(u => u.roles && u.roles.includes(name)).length;
    return {
      id: index + 1,
      name,
      description: getRoleDescription(name),
      isSystemCritical: true,
      permissions: defaultRolePermissions[name] || [],
      assignedUsersCount: userCount
    };
  });

  customRolesMap.forEach(customRole => {
    const userCount = users.filter(u => u.roles && u.roles.includes(customRole.name)).length;
    roles.push({
      ...customRole,
      assignedUsersCount: userCount
    });
  });

  return roles;
}

export async function getRoleByName(roleName) {
  const roles = await getRoles();
  return roles.find(r => r.name.toUpperCase() === roleName.toUpperCase()) || null;
}

export async function createRole({ name, description, permissions = [] }, actorId = null) {
  const upperName = name.trim().toUpperCase();
  if (SYSTEM_CRITICAL_ROLES.includes(upperName) || customRolesMap.has(upperName)) {
    throw new Error(`Role name '${upperName}' already exists.`);
  }

  const newRole = {
    id: 100 + customRolesMap.size + 1,
    name: upperName,
    description: description || `Custom role ${upperName}`,
    isSystemCritical: false,
    permissions,
    assignedUsersCount: 0
  };

  customRolesMap.set(upperName, newRole);

  await createAuditLog({
    userId: actorId,
    action: 'ROLE_CREATED',
    resourceType: 'ROLE',
    resourceId: upperName,
    result: 'SUCCESS',
    details: { name: upperName, permissions }
  });

  broadcastMessage('admin.role_updated', { role: newRole });

  return newRole;
}

export async function updateRolePermissions(roleName, permissions, actorId = null) {
  const upperName = roleName.trim().toUpperCase();
  const role = await getRoleByName(upperName);
  if (!role) throw new Error(`Role '${upperName}' not found.`);

  if (SYSTEM_CRITICAL_ROLES.includes(upperName)) {
    defaultRolePermissions[upperName] = permissions;
  } else if (customRolesMap.has(upperName)) {
    const customRole = customRolesMap.get(upperName);
    customRole.permissions = permissions;
    customRolesMap.set(upperName, customRole);
  }

  await createAuditLog({
    userId: actorId,
    action: 'PERMISSION_CHANGED',
    resourceType: 'ROLE',
    resourceId: upperName,
    result: 'SUCCESS',
    details: { permissions }
  });

  broadcastMessage('admin.permission_updated', { roleName: upperName, permissions });

  return await getRoleByName(upperName);
}

export async function deleteRole(roleName, actorId = null) {
  const upperName = roleName.trim().toUpperCase();
  if (SYSTEM_CRITICAL_ROLES.includes(upperName)) {
    throw new Error(`Deletion of system-critical role '${upperName}' is strictly prohibited.`);
  }

  if (!customRolesMap.has(upperName)) {
    throw new Error(`Role '${upperName}' not found.`);
  }

  customRolesMap.delete(upperName);

  await createAuditLog({
    userId: actorId,
    action: 'ROLE_DELETED',
    resourceType: 'ROLE',
    resourceId: upperName,
    result: 'SUCCESS'
  });

  return { message: `Role ${upperName} deleted successfully.` };
}

function getRoleDescription(name) {
  switch (name) {
    case 'ADMIN': return 'Full administrative access to configure policies, manage users, and oversee system health.';
    case 'SECURITY_ANALYST': return 'Lead security analyst with detection management, incident response creation, and investigation rights.';
    case 'SOC_OPERATOR': return 'Real-time monitoring operator handling alert triage, event tracking, and incident escalation.';
    case 'OT_OPERATOR': return 'Industrial Control System operator with asset inventory and process telemetry access.';
    case 'VIEWER': return 'Read-only access to dashboards, reports, and high-level metrics.';
    default: return 'Custom user role.';
  }
}
