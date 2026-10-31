import { adminService } from '../services/adminService/index.js';
import logger from '../logging/logger.js';

export async function getAdminOverview(req, res, next) {
  try {
    const overview = await adminService.getAdminOverview();
    res.json({ status: 'success', data: overview, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await adminService.getUsers();
    res.json({ status: 'success', data: users, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const user = await adminService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found.' });
    }
    res.json({ status: 'success', data: user, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const newUser = await adminService.createAdminUser(req.body, actorId);
    res.status(201).json({ status: 'success', data: newUser, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function updateUser(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const updated = await adminService.updateUser(req.params.id, req.body, actorId);
    res.json({ status: 'success', data: updated, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function enableUser(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const result = await adminService.setUserStatus(req.params.id, 'ACTIVE', actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function disableUser(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const result = await adminService.setUserStatus(req.params.id, 'DISABLED', actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function resetPassword(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const result = await adminService.resetUserPassword(req.params.id, req.body.password, actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getUserSessions(req, res, next) {
  try {
    const sessions = await adminService.getActiveSessions();
    const userSessions = sessions.filter(s => String(s.userId) === String(req.params.id));
    res.json({ status: 'success', data: userSessions, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function revokeUserSessions(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const result = await adminService.revokeUserSessions(req.params.id, actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getRoles(req, res, next) {
  try {
    const roles = await adminService.getRoles();
    res.json({ status: 'success', data: roles, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function createRole(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const role = await adminService.createRole(req.body, actorId);
    res.status(201).json({ status: 'success', data: role, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function updateRole(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const role = await adminService.updateRolePermissions(req.params.id, req.body.permissions, actorId);
    res.json({ status: 'success', data: role, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function deleteRole(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const result = await adminService.deleteRole(req.params.id, actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getPermissions(req, res, next) {
  try {
    const permissions = await adminService.getPermissions();
    res.json({ status: 'success', data: permissions, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getSessions(req, res, next) {
  try {
    const sessions = await adminService.getActiveSessions();
    res.json({ status: 'success', data: sessions, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function revokeSession(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const result = await adminService.revokeSession(req.params.id, actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getSettings(req, res, next) {
  try {
    const category = req.query.category || null;
    const settings = await adminService.getSettingsByCategory(category);
    res.json({ status: 'success', data: settings, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getSettingsByCategory(req, res, next) {
  try {
    const settings = await adminService.getSettingsByCategory(req.params.category);
    res.json({ status: 'success', data: settings, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function updateCategorySettings(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const category = req.params.category;
    const reason = req.body.changeReason || `Configuration update for category '${category}'`;
    const settingsMap = req.body.settings || req.body;

    const updated = await adminService.updateCategorySettings(category, settingsMap, reason, actorId);
    res.json({ status: 'success', data: updated, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function rollbackSetting(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const { settingKey, targetVersion } = req.body;
    const result = await adminService.rollbackSetting(settingKey, targetVersion, actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export function getCategoryDomainConfig(categoryName) {
  return async (req, res, next) => {
    try {
      const settings = await adminService.getSettingsByCategory(categoryName);
      const history = await adminService.getConfigHistory(null, categoryName);
      res.json({
        status: 'success',
        data: {
          category: categoryName,
          settings,
          history
        },
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  };
}

export async function getRetentionPolicies(req, res, next) {
  try {
    const policies = await adminService.getRetentionPolicies();
    res.json({ status: 'success', data: policies, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function updateRetentionPolicy(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const updated = await adminService.updateRetentionPolicy(req.params.category, req.body, actorId);
    res.json({ status: 'success', data: updated, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}

export async function getAuditLogs(req, res, next) {
  try {
    const logs = await adminService.searchAuditLogs(req.query);
    res.json({ status: 'success', data: logs, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getSystemHealth(req, res, next) {
  try {
    const health = await adminService.getSubsystemHealth();
    res.json({ status: 'success', data: health, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function getAdminScenarios(req, res, next) {
  try {
    const scenarios = await adminService.getAdminScenarios();
    res.json({ status: 'success', data: scenarios, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}

export async function updateScenarioStatus(req, res, next) {
  try {
    const actorId = req.user ? req.user.id : null;
    const result = await adminService.updateScenarioStatus(req.params.id, req.body, actorId);
    res.json({ status: 'success', data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message, timestamp: new Date().toISOString() });
  }
}
