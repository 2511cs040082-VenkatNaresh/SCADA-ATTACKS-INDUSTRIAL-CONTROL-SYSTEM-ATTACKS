import { successResponse, errorResponse } from '../utils/responseHandler.js';
import * as assetInventoryService from '../services/assetInventory.service.js';
import * as assetDiscoveryService from '../services/assetDiscovery.service.js';
import * as assetBaselineService from '../services/assetBaseline.service.js';
import { query } from '../config/database.js';

export async function getAssets(req, res, next) {
  try {
    const result = await assetInventoryService.getAssets(req.query);
    return successResponse(res, result, 'Fetched assets inventory');
  } catch (err) {
    next(err);
  }
}

export async function getAssetById(req, res, next) {
  try {
    const asset = await assetInventoryService.getAssetById(req.params.id);
    if (!asset) {
      return errorResponse(res, 'Asset not found', 404);
    }
    return successResponse(res, asset, 'Fetched asset profile');
  } catch (err) {
    next(err);
  }
}

export async function getDiscoveries(req, res, next) {
  try {
    const status = req.query.status || null;
    const discoveries = await assetDiscoveryService.getDiscoveries(status);
    return successResponse(res, discoveries, 'Fetched asset discoveries');
  } catch (err) {
    next(err);
  }
}

export async function resolveDiscovery(req, res, next) {
  try {
    const { action, asset_name, asset_type_id, zone_id, criticality } = req.body;
    const result = await assetDiscoveryService.identifyOrApproveDiscovery(
      req.params.id,
      action,
      { asset_name, asset_type_id, zone_id, criticality }
    );
    return successResponse(res, result, `Discovery record ${action.toLowerCase()}d`);
  } catch (err) {
    next(err);
  }
}

export async function getTopology(_req, res, next) {
  try {
    const graph = await assetBaselineService.getAssetCommunicationGraph();
    return successResponse(res, graph, 'Fetched asset communication topology graph');
  } catch (err) {
    next(err);
  }
}

export async function addNote(req, res, next) {
  try {
    const { content } = req.body;
    const assetId = req.params.id;
    const author = req.user?.username || 'Security Analyst';

    if (!content) {
      return errorResponse(res, 'Note content is required', 400);
    }

    const ins = await query(
      'INSERT INTO asset_notes (asset_id, author_name, content) VALUES (?, ?, ?)',
      [assetId, author, content]
    );

    return successResponse(res, { id: ins.insertId, asset_id: assetId, author_name: author, content }, 'Note added successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function addTag(req, res, next) {
  try {
    const { tag_name } = req.body;
    const assetId = req.params.id;

    if (!tag_name) {
      return errorResponse(res, 'Tag name is required', 400);
    }

    await query(
      'INSERT INTO asset_tags (asset_id, tag_name, created_by) VALUES (?, ?, ?)',
      [assetId, tag_name.toUpperCase(), req.user?.username || 'SYSTEM']
    );

    return successResponse(res, { asset_id: assetId, tag_name: tag_name.toUpperCase() }, 'Tag added', 201);
  } catch (err) {
    next(err);
  }
}
