import {
  querySecurityOverviewAnalytics,
  queryAlertAnalytics,
  queryIncidentAnalytics,
  queryDetectionAnalytics,
  queryAssetAnalytics,
  querySimulationRunAnalytics,
} from './reportEngine/aggregations.js';

export async function getAnalyticsOverview(filters = {}) {
  return querySecurityOverviewAnalytics(filters);
}

export async function getAlertAnalyticsData(filters = {}) {
  return queryAlertAnalytics(filters);
}

export async function getIncidentAnalyticsData(filters = {}) {
  return queryIncidentAnalytics(filters);
}

export async function getDetectionAnalyticsData(filters = {}) {
  return queryDetectionAnalytics(filters);
}

export async function getAssetAnalyticsData(filters = {}) {
  return queryAssetAnalytics(filters);
}

export async function getSimulationAnalyticsData(runId, filters = {}) {
  return querySimulationRunAnalytics(runId);
}
