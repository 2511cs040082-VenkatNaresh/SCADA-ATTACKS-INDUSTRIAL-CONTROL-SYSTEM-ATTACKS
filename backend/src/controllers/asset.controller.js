import * as assetService from '../services/asset.service.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export async function getAssets(req, res, next) {
  try {
    const assets = await assetService.getAssets(req.query);
    return successResponse(res, assets, 'Fetched asset inventory');
  } catch (err) {
    next(err);
  }
}

export async function getAsset(req, res, next) {
  try {
    const asset = await assetService.getAssetById(req.params.id);
    if (!asset) return errorResponse(res, 'Asset not found', 404);
    return successResponse(res, asset, 'Fetched asset details');
  } catch (err) {
    next(err);
  }
}

export async function createAsset(req, res, next) {
  try {
    const asset = await assetService.createAsset(req.body);
    return successResponse(res, asset, 'Asset created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message, 400);
  }
}
