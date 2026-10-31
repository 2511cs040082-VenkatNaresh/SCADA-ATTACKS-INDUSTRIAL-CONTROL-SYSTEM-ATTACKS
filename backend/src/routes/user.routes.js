import { Router } from 'express';
import { z } from 'zod';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { securityConfig } from '../config/security.js';

const router = Router();

const createUserSchema = {
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fullName: z.string().min(1, 'Full name is required'),
    roles: z.array(z.string()).optional(),
  }),
};

router.get('/', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), userController.getUsers);
router.post('/', authenticate, authorize(securityConfig.roles.ADMIN), validate(createUserSchema), userController.createUser);
router.get('/:id', authenticate, authorize(securityConfig.roles.ADMIN, securityConfig.roles.SECURITY_ANALYST), userController.getUser);

export default router;
