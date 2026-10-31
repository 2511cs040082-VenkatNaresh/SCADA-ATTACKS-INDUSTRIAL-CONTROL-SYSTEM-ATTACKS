import * as authService from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.loginUser({ username, password, ipAddress, userAgent });
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message, 401);
  }
}

export async function logout(req, res, next) {
  try {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.logoutUser(userId, token, ipAddress, userAgent);
    return successResponse(res, result, 'Logout successful');
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    return successResponse(res, { user: req.user }, 'Authenticated user profile');
  } catch (err) {
    next(err);
  }
}
