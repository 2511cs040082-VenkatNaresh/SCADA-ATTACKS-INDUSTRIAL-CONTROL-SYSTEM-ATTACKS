import * as userService from '../services/user.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getUsers(_req, res, next) {
  try {
    const users = await userService.getAllUsers();
    return successResponse(res, users, 'Fetched user list');
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user, 'Fetched user details');
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    return successResponse(res, user, 'Created user successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}
