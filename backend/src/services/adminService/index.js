import * as users from './users.js';
import * as roles from './roles.js';
import * as permissions from './permissions.js';
import * as sessions from './sessions.js';
import * as settings from './settings.js';
import * as retention from './retention.js';
import * as audit from './audit.js';
import * as versioning from './versioning.js';
import * as scenarios from './scenarios.js';
import * as system from './system.js';

export const adminService = {
  ...users,
  ...roles,
  ...permissions,
  ...sessions,
  ...settings,
  ...retention,
  ...audit,
  ...versioning,
  ...scenarios,
  ...system
};

export default adminService;
