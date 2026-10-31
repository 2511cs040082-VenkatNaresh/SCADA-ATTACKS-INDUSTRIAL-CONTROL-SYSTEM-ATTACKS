import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { securityConfig } from '../config/security.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// All Admin API endpoints require authentication
router.use(authenticate);

// 1. Overview & System Health
router.get('/', authorize(securityConfig.roles.ADMIN), adminController.getAdminOverview);
router.get('/system', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getSystemHealth);

// 2. User Management
router.get('/users', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getUsers);
router.post('/users', authorize(securityConfig.roles.ADMIN), adminController.createUser);
router.get('/users/:id', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getUserById);
router.patch('/users/:id', authorize(securityConfig.roles.ADMIN), adminController.updateUser);
router.post('/users/:id/enable', authorize(securityConfig.roles.ADMIN), adminController.enableUser);
router.post('/users/:id/disable', authorize(securityConfig.roles.ADMIN), adminController.disableUser);
router.post('/users/:id/reset-password', authorize(securityConfig.roles.ADMIN), adminController.resetPassword);
router.get('/users/:id/sessions', authorize(securityConfig.roles.ADMIN), adminController.getUserSessions);
router.post('/users/:id/revoke-sessions', authorize(securityConfig.roles.ADMIN), adminController.revokeUserSessions);

// 3. Role Management
router.get('/roles', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getRoles);
router.post('/roles', authorize(securityConfig.roles.ADMIN), adminController.createRole);
router.patch('/roles/:id', authorize(securityConfig.roles.ADMIN), adminController.updateRole);
router.delete('/roles/:id', authorize(securityConfig.roles.ADMIN), adminController.deleteRole);

// 4. Permission Management
router.get('/permissions', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getPermissions);

// 5. Session Management
router.get('/sessions', authorize(securityConfig.roles.ADMIN), adminController.getSessions);
router.post('/sessions/:id/revoke', authorize(securityConfig.roles.ADMIN), adminController.revokeSession);

// 6. Settings & System Configuration Categories
router.get('/settings', authorize(securityConfig.roles.ADMIN), adminController.getSettings);
router.get('/settings/security', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Security'));
router.get('/settings/telemetry', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Telemetry'));
router.get('/settings/detection', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Detection'));
router.get('/settings/behavior', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Behavior'));
router.get('/settings/ml', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('ML'));
router.get('/settings/alerts', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Alerts'));
router.get('/settings/incidents', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Incidents'));
router.get('/settings/mitre', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('MITRE'));
router.get('/settings/response', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Response'));
router.get('/settings/simulation', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Simulation'));
router.get('/settings/reports', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Reports'));
router.get('/settings/retention', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Retention'));
router.get('/settings/logging', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Logging'));
router.get('/settings/websocket', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('WebSocket'));
router.get('/settings/performance', authorize(securityConfig.roles.ADMIN), adminController.getCategoryDomainConfig('Performance'));

router.get('/settings/:category', authorize(securityConfig.roles.ADMIN), adminController.getSettingsByCategory);
router.patch('/settings/:category', authorize(securityConfig.roles.ADMIN), adminController.updateCategorySettings);
router.post('/settings/rollback', authorize(securityConfig.roles.ADMIN), adminController.rollbackSetting);

// 7. Domain Specific Administration Routes
router.get('/detection', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('Detection'));
router.get('/behavior', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('Behavior'));
router.get('/ml', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('ML'));
router.get('/alerts', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('Alerts'));
router.get('/incidents', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('Incidents'));
router.get('/mitre', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('MITRE'));
router.get('/response', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('Response'));

// 8. Simulation Administration & Scenario Management
router.get('/simulation', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('Simulation'));
router.get('/simulation/scenarios', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getAdminScenarios);
router.post('/simulation/scenarios/:id/status', authorize(securityConfig.roles.ADMIN), adminController.updateScenarioStatus);

// 9. Report Administration
router.get('/reports', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getCategoryDomainConfig('Reports'));

// 10. Retention Management
router.get('/retention', authorize(securityConfig.roles.ADMIN), adminController.getRetentionPolicies);
router.patch('/retention/:category', authorize(securityConfig.roles.ADMIN), adminController.updateRetentionPolicy);

// 11. Audit Logs
router.get('/audit', authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), adminController.getAuditLogs);

export default router;
