import { SystemHealthData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api/v1';

export async function fetchHealthStatus(): Promise<SystemHealthData> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn('Backend connection failed, returning fallback state:', error);
    return {
      service: 'ICS-SHIELD Backend API',
      status: 'OFFLINE_FALLBACK',
      phase: 'PHASE_11_REAL_TIME_ALERT_MANAGEMENT_AND_CORRELATION',
      environment: 'development',
      version: '1.0.0-phase11',
      uptimeSeconds: 0,
      timestamp: new Date().toISOString(),
      components: {
        api: { status: 'DISCONNECTED' },
        database: { status: 'UNKNOWN', type: 'MySQL' },
        websocket: { status: 'OFFLINE' },
        detectionEngine: { status: 'ONLINE', url: 'http://localhost:8080' },
      },
    };
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorJson.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const apiService = {
  // Alert API endpoints
  getAlerts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/alerts?${query.toString()}`);
  },

  getAlertById: (id: string | number) => request(`/alerts/${id}`),

  updateAlertStatus: (id: string | number, status: string, reason?: string) =>
    request(`/alerts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    }),

  acknowledgeAlert: (id: string | number) =>
    request(`/alerts/${id}/acknowledge`, { method: 'POST' }),

  assignAlert: (id: string | number, assigned_to: number) =>
    request(`/alerts/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigned_to })
    }),

  escalateAlert: (id: string | number, priority: string, reason?: string) =>
    request(`/alerts/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ priority, reason })
    }),

  suppressAlert: (id: string | number, reason?: string) =>
    request(`/alerts/${id}/suppress`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  addAlertNote: (id: string | number, note: string) =>
    request(`/alerts/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note })
    }),

  getAlertTimeline: (id: string | number) => request(`/alerts/${id}/timeline`),
  getAlertEvidence: (id: string | number) => request(`/alerts/${id}/evidence`),
  getAlertHistory: (id: string | number) => request(`/alerts/${id}/history`),

  getAlertGroups: () => request('/alerts/groups'),
  getSuppressions: () => request('/alerts/suppressions'),
  createSuppression: (data: Record<string, any>) =>
    request('/alerts/suppressions', { method: 'POST', body: JSON.stringify(data) }),

  getAlertMetrics: () => request('/alerts/metrics'),
  getAlertHealth: () => request('/system/alerts/health'),

  getNotifications: (unread_only?: boolean) =>
    request(`/alerts/notifications${unread_only ? '?unread_only=true' : ''}`),
  markNotificationsRead: (ids?: number[]) =>
    request('/alerts/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Incident API endpoints
  getIncidents: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/incidents?${query.toString()}`);
  },

  getIncidentById: (id: string | number) => request(`/incidents/${id}`),

  createIncident: (data: Record<string, any>) =>
    request('/incidents', { method: 'POST', body: JSON.stringify(data) }),

  createIncidentFromAlert: (alertId: string | number, notes?: string) =>
    request(`/incidents/from-alert/${alertId}`, { method: 'POST', body: JSON.stringify({ notes }) }),

  createIncidentFromAlertGroup: (groupId: string | number, notes?: string) =>
    request(`/incidents/from-alert-group/${groupId}`, { method: 'POST', body: JSON.stringify({ notes }) }),

  updateIncidentStatus: (id: string | number, status: string, reason?: string) =>
    request(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, reason }) }),

  triageIncident: (id: string | number) =>
    request(`/incidents/${id}/triage`, { method: 'POST' }),

  assignIncident: (id: string | number, assigned_to: number, role = 'LEAD') =>
    request(`/incidents/${id}/assign`, { method: 'POST', body: JSON.stringify({ assigned_to, role }) }),

  recommendContainment: (id: string | number, recommendation?: string) =>
    request(`/incidents/${id}/recommend-containment`, { method: 'POST', body: JSON.stringify({ recommendation }) }),

  resolveIncident: (id: string | number, reason?: string) =>
    request(`/incidents/${id}/resolve`, { method: 'POST', body: JSON.stringify({ reason }) }),

  closeIncident: (id: string | number) =>
    request(`/incidents/${id}/close`, { method: 'POST' }),

  reopenIncident: (id: string | number, reason?: string) =>
    request(`/incidents/${id}/reopen`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getIncidentTimeline: (id: string | number) => request(`/incidents/${id}/timeline`),
  getIncidentEvidence: (id: string | number) => request(`/incidents/${id}/evidence`),
  addIncidentEvidence: (id: string | number, data: Record<string, any>) =>
    request(`/incidents/${id}/evidence`, { method: 'POST', body: JSON.stringify(data) }),

  getIncidentNotes: (id: string | number) => request(`/incidents/${id}/notes`),
  addIncidentNote: (id: string | number, data: Record<string, any>) =>
    request(`/incidents/${id}/notes`, { method: 'POST', body: JSON.stringify(data) }),

  getIncidentTasks: (id: string | number) => request(`/incidents/${id}/tasks`),
  createIncidentTask: (id: string | number, data: Record<string, any>) =>
    request(`/incidents/${id}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateIncidentTask: (id: string | number, taskId: string | number, data: Record<string, any>) =>
    request(`/incidents/${id}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getIncidentFindings: (id: string | number) => request(`/incidents/${id}/findings`),
  addIncidentFinding: (id: string | number, data: Record<string, any>) =>
    request(`/incidents/${id}/findings`, { method: 'POST', body: JSON.stringify(data) }),

  getIncidentHypotheses: (id: string | number) => request(`/incidents/${id}/hypotheses`),
  addIncidentHypothesis: (id: string | number, data: Record<string, any>) =>
    request(`/incidents/${id}/hypotheses`, { method: 'POST', body: JSON.stringify(data) }),

  getIncidentMetrics: () => request('/incidents/metrics'),
  getIncidentHealth: () => request('/system/incidents/health'),

  // MITRE ATT&CK for ICS API endpoints
  getMitreTactics: () => request('/mitre/tactics'),
  getMitreTechniques: (tacticId?: string) => request(`/mitre/techniques${tacticId ? `?tactic_id=${tacticId}` : ''}`),
  getMitreTechniqueById: (id: string) => request(`/mitre/techniques/${id}`),
  getMitreCoverage: () => request('/mitre/coverage'),
  getMitreMappings: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/mitre/mappings?${query.toString()}`);
  },
  createOrUpdateMitreMapping: (data: Record<string, any>) =>
    request('/mitre/mappings', { method: 'POST', body: JSON.stringify(data) }),
  updateMitreMappingStatus: (uuid: string, status: string, confidence?: string, reason?: string) =>
    request(`/mitre/mappings/${uuid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, confidence, reason })
    }),
  addMitreEvidence: (mappingType: string, mappingId: string | number, data: Record<string, any>) =>
    request(`/mitre/mappings/${mappingType}/${mappingId}/evidence`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getMitreVersions: () => request('/mitre/versions'),
  importMitreVersion: (data: Record<string, any>) =>
    request('/mitre/versions/import', { method: 'POST', body: JSON.stringify(data) }),
  activateMitreVersion: (id: string | number) =>
    request(`/mitre/versions/${id}/activate`, { method: 'POST' }),
  rollbackMitreVersion: (id: string | number) =>
    request(`/mitre/versions/${id}/rollback`, { method: 'POST' }),
  getMitreHealth: () => request('/system/mitre/health'),

  // Phase 14 Defense & Response Engine API endpoints
  getResponseRecommendations: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/response/recommendations?${query.toString()}`);
  },
  getRecommendationById: (id: string | number) => request(`/response/recommendations/${id}`),
  acceptRecommendation: (id: string | number) =>
    request(`/response/recommendations/${id}/accept`, { method: 'POST' }),
  rejectRecommendation: (id: string | number, reason?: string) =>
    request(`/response/recommendations/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),

  getResponsePlans: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/response/plans?${query.toString()}`);
  },
  getResponsePlanById: (id: string | number) => request(`/response/plans/${id}`),
  createResponsePlan: (data: Record<string, any>) =>
    request('/response/plans', { method: 'POST', body: JSON.stringify(data) }),
  approveResponsePlan: (id: string | number, reason?: string) =>
    request(`/response/plans/${id}/approve`, { method: 'POST', body: JSON.stringify({ reason }) }),
  rejectResponsePlan: (id: string | number, reason?: string) =>
    request(`/response/plans/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  executeResponsePlan: (id: string | number, dryRun: boolean = false) =>
    request(`/response/plans/${id}/execute`, { method: 'POST', body: JSON.stringify({ dry_run: dryRun }) }),
  rollbackResponsePlan: (id: string | number) =>
    request(`/response/plans/${id}/rollback`, { method: 'POST' }),

  getResponsePlaybooks: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/response/playbooks?${query.toString()}`);
  },
  getResponsePlaybookById: (id: string | number) => request(`/response/playbooks/${id}`),
  getResponseApprovals: () => request('/response/approvals'),
  getResponseMetrics: () => request('/response/metrics'),
  getResponseHealth: () => request('/system/response/health'),

  // Phase 15 Controlled ICS Attack Simulation Laboratory API endpoints
  getSimulationScenarios: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/simulation/scenarios?${query.toString()}`);
  },
  getSimulationScenarioById: (id: string | number) => request(`/simulation/scenarios/${id}`),
  validateSimulationScenario: (id: string | number) =>
    request(`/simulation/scenarios/${id}/validate`, { method: 'POST' }),

  getSimulationRuns: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/simulation/runs?${query.toString()}`);
  },
  getSimulationRunById: (id: string | number) => request(`/simulation/runs/${id}`),
  startSimulationRun: (scenarioId: string | number, data: Record<string, any> = {}) =>
    request(`/simulation/scenarios/${scenarioId}/start`, { method: 'POST', body: JSON.stringify(data) }),
  pauseSimulationRun: () => request('/simulation/pause', { method: 'POST' }),
  resumeSimulationRun: () => request('/simulation/resume', { method: 'POST' }),
  stopSimulationRun: () => request('/simulation/stop', { method: 'POST' }),
  emergencyStopSimulation: () => request('/simulation/emergency-stop', { method: 'POST' }),
  resetLabSimulation: () => request('/simulation/reset', { method: 'POST' }),

  getSimulationMetrics: () => request('/simulation/metrics'),
  getSimulationHealth: () => request('/system/simulation/health'),

  // Phase 6 Asset Intelligence APIs
  getAssets: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/assets?${query.toString()}`);
  },
  getAssetById: (id: string | number) => request(`/assets/${id}`),
  createAsset: (data: Record<string, any>) =>
    request('/assets', { method: 'POST', body: JSON.stringify(data) }),
  getTopology: () => request('/assets/topology'),
  addAssetNote: (id: string | number, note: string) =>
    request(`/assets/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) }),
  addAssetTag: (id: string | number, tag: string) =>
    request(`/assets/${id}/tags`, { method: 'POST', body: JSON.stringify({ tag }) }),

  // Phase 7 Network & Industrial Protocol Monitoring APIs
  getNetworkFlows: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/network/flows?${query.toString()}`);
  },
  getNetworkSessions: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/network/sessions?${query.toString()}`);
  },
  getNetworkMetrics: () => request('/network/metrics'),
  getProtocolMetrics: () => request('/protocols/metrics'),
  getModbusTransactions: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/protocols/modbus/transactions?${query.toString()}`);
  },

  // Phase 4 Simulator APIs
  getSimulatorStatus: () => request('/simulator/status'),
  getSimulatorProcess: () => request('/simulator/process'),
  getSimulatorScenarios: () => request('/simulator/scenarios'),
  startSimulatorScenario: (id: string) =>
    request(`/simulator/scenarios/${id}/start`, { method: 'POST' }),
  resetSimulator: () => request('/simulator/reset', { method: 'POST' }),

  // Phase 8 Rule Detection APIs
  getDetections: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/detections?${query.toString()}`);
  },
  getDetectionById: (id: string | number) => request(`/detections/${id}`),
  getDetectionMetrics: () => request('/detections/metrics'),
  getDetectionTimeline: () => request('/detections/timeline'),
  submitDetectionFeedback: (id: string | number, data: Record<string, any>) =>
    request(`/detections/${id}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
  getDetectionRules: () => request('/detection-rules'),
  createDetectionRule: (data: Record<string, any>) =>
    request('/detection-rules', { method: 'POST', body: JSON.stringify(data) }),
  getDetectionStatus: () => request('/detection/status'),

  // Phase 9 Behavioral Engine APIs
  getBehavioralAnomalies: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/behavioral/anomalies?${query.toString()}`);
  },
  getBehavioralAnomalyById: (id: string | number) => request(`/behavioral/anomalies/${id}`),
  getBehavioralBaselines: () => request('/behavioral/baselines'),
  getBehavioralMetrics: () => request('/behavioral/metrics'),

  // Phase 10 Machine Learning Engine APIs
  getMLPredictions: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/ml/predictions?${query.toString()}`);
  },
  getMLPredictionById: (id: string | number) => request(`/ml/predictions/${id}`),
  getMLModels: () => request('/ml/models'),
  getMLMetrics: () => request('/ml/metrics'),
  getMLDrift: () => request('/ml/drift'),

  // System & Discovery APIs
  getPipelineHealth: () => request('/system/telemetry/health'),
  getDiscoveredAssets: () => request('/discovery/assets'),
  startDiscoveryScan: () => request('/discovery/scan', { method: 'POST' }),

  // Unified Global Search across multiple domain collections
  globalSearch: async (q: string) => {
    if (!q || !q.trim()) return [];
    const queryStr = q.trim().toLowerCase();
    const results: Array<{
      category: 'ASSET' | 'ALERT' | 'INCIDENT' | 'DETECTION' | 'SIMULATION' | 'MITRE' | 'REPORT';
      id: string;
      title: string;
      subtitle: string;
      url: string;
      badge?: string;
    }> = [];

    try {
      const [assetsRes, alertsRes, incidentsRes, simScenariosRes, mitreTechsRes] = await Promise.allSettled([
        apiService.getAssets({ search: queryStr }),
        apiService.getAlerts({ search: queryStr }),
        apiService.getIncidents({ search: queryStr }),
        apiService.getSimulationScenarios(),
        apiService.getMitreTechniques(),
      ]);

      if (assetsRes.status === 'fulfilled' && assetsRes.value?.data) {
        const list = Array.isArray(assetsRes.value.data) ? assetsRes.value.data : assetsRes.value.data.data || [];
        list.forEach((item: any) => {
          if (
            (item.asset_name && item.asset_name.toLowerCase().includes(queryStr)) ||
            (item.ip_address && item.ip_address.includes(queryStr)) ||
            (item.asset_type && item.asset_type.toLowerCase().includes(queryStr))
          ) {
            results.push({
              category: 'ASSET',
              id: item.asset_uuid || String(item.id),
              title: item.asset_name || item.name || 'Asset',
              subtitle: `${item.asset_type || 'DEVICE'} • ${item.ip_address || 'No IP'}`,
              url: `/assets/${item.asset_uuid || item.id}`,
              badge: item.status || 'ONLINE',
            });
          }
        });
      }

      if (alertsRes.status === 'fulfilled' && alertsRes.value?.data) {
        const list = Array.isArray(alertsRes.value.data) ? alertsRes.value.data : alertsRes.value.data.data || [];
        list.forEach((item: any) => {
          if (
            (item.title && item.title.toLowerCase().includes(queryStr)) ||
            (item.alert_number && item.alert_number.toLowerCase().includes(queryStr)) ||
            (item.description && item.description.toLowerCase().includes(queryStr))
          ) {
            results.push({
              category: 'ALERT',
              id: item.alert_number || String(item.id),
              title: `${item.alert_number || 'ALT'} — ${item.title || 'Alert'}`,
              subtitle: `${item.severity || 'HIGH'} • Status: ${item.status || 'NEW'}`,
              url: `/alerts/${item.id}`,
              badge: item.severity || 'HIGH',
            });
          }
        });
      }

      if (incidentsRes.status === 'fulfilled' && incidentsRes.value?.data) {
        const list = Array.isArray(incidentsRes.value.data) ? incidentsRes.value.data : incidentsRes.value.data.data || [];
        list.forEach((item: any) => {
          if (
            (item.title && item.title.toLowerCase().includes(queryStr)) ||
            (item.incident_number && item.incident_number.toLowerCase().includes(queryStr)) ||
            (item.description && item.description.toLowerCase().includes(queryStr))
          ) {
            results.push({
              category: 'INCIDENT',
              id: item.incident_number || String(item.id),
              title: `${item.incident_number || 'INC'} — ${item.title || 'Incident'}`,
              subtitle: `Severity: ${item.severity || 'HIGH'} • State: ${item.status || 'NEW'}`,
              url: `/incidents/${item.id}`,
              badge: item.severity || 'CRITICAL',
            });
          }
        });
      }

      if (simScenariosRes.status === 'fulfilled' && simScenariosRes.value?.data) {
        const list = Array.isArray(simScenariosRes.value.data) ? simScenariosRes.value.data : simScenariosRes.value.data.data || [];
        list.forEach((item: any) => {
          if (
            (item.scenario_code && item.scenario_code.toLowerCase().includes(queryStr)) ||
            (item.scenario_name && item.scenario_name.toLowerCase().includes(queryStr))
          ) {
            results.push({
              category: 'SIMULATION',
              id: item.scenario_code || String(item.id),
              title: `${item.scenario_code}: ${item.scenario_name}`,
              subtitle: `Category: ${item.category || 'LAB'} • Level: ${item.difficulty || 'MEDIUM'}`,
              url: `/simulation`,
              badge: 'SCENARIO',
            });
          }
        });
      }

      if (mitreTechsRes.status === 'fulfilled' && mitreTechsRes.value?.data) {
        const list = Array.isArray(mitreTechsRes.value.data) ? mitreTechsRes.value.data : [];
        list.forEach((item: any) => {
          if (
            (item.technique_id && item.technique_id.toLowerCase().includes(queryStr)) ||
            (item.name && item.name.toLowerCase().includes(queryStr))
          ) {
            results.push({
              category: 'MITRE',
              id: item.technique_id,
              title: `${item.technique_id}: ${item.name}`,
              subtitle: `Tactic: ${item.tactic_name || 'ICS Tactic'}`,
              url: `/mitre`,
              badge: 'ATT&CK',
            });
          }
        });
      }
    } catch (err) {
      console.error('Global search error:', err);
    }

    return results;
  },

  // Phase 17 Reports & Analytics Subsystem APIs
  getReports: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/reports?${query.toString()}`);
  },
  getReportById: (id: string | number) => request(`/reports/${id}`),
  createReport: (data: Record<string, any>) =>
    request('/reports', { method: 'POST', body: JSON.stringify(data) }),
  generateReport: (id: string | number, data: Record<string, any> = {}) =>
    request(`/reports/${id}/generate`, { method: 'POST', body: JSON.stringify(data) }),
  exportReport: (id: string | number, exportType: string = 'PDF') =>
    request(`/reports/${id}/export`, { method: 'POST', body: JSON.stringify({ export_type: exportType }) }),
  getReportSchedules: () => request('/reports/schedules'),
  createReportSchedule: (data: Record<string, any>) =>
    request('/reports/schedules', { method: 'POST', body: JSON.stringify(data) }),
  getReportHealth: () => request('/system/reports/health'),

  // Analytics APIs
  getAnalyticsOverview: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/analytics/overview?${query.toString()}`);
  },
  getAnalyticsAlerts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/analytics/alerts?${query.toString()}`);
  },
  getAnalyticsIncidents: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/analytics/incidents?${query.toString()}`);
  },
  getAnalyticsDetections: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/analytics/detection?${query.toString()}`);
  },
  getAnalyticsAssets: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'ALL') query.append(k, String(v));
    });
    return request(`/analytics/assets?${query.toString()}`);
  },
  getAnalyticsSimulation: (runId?: string) =>
    request(`/analytics/simulation${runId ? `/${runId}` : ''}`),

  // Phase 18 Administration & Configuration Center APIs
  getAdminOverview: () => request('/admin'),
  getAdminUsers: () => request('/admin/users'),
  getAdminUserById: (id: string | number) => request(`/admin/users/${id}`),
  createAdminUser: (data: Record<string, any>) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminUser: (id: string | number, data: Record<string, any>) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  enableAdminUser: (id: string | number) => request(`/admin/users/${id}/enable`, { method: 'POST' }),
  disableAdminUser: (id: string | number) => request(`/admin/users/${id}/disable`, { method: 'POST' }),
  resetUserPassword: (id: string | number, password: string) => request(`/admin/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ password }) }),
  getUserSessions: (id: string | number) => request(`/admin/users/${id}/sessions`),
  revokeUserSessions: (id: string | number) => request(`/admin/users/${id}/revoke-sessions`, { method: 'POST' }),

  getAdminRoles: () => request('/admin/roles'),
  createAdminRole: (data: Record<string, any>) => request('/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminRole: (id: string, permissions: string[]) => request(`/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify({ permissions }) }),
  deleteAdminRole: (id: string) => request(`/admin/roles/${id}`, { method: 'DELETE' }),

  getAdminPermissions: () => request('/admin/permissions'),
  getAdminSessions: () => request('/admin/sessions'),
  revokeAdminSession: (id: string | number) => request(`/admin/sessions/${id}/revoke`, { method: 'POST' }),

  getAdminSettings: () => request('/admin/settings'),
  getAdminSettingsByCategory: (category: string) => request(`/admin/settings/${category}`),
  updateCategorySettings: (category: string, settings: Record<string, any>, changeReason?: string) =>
    request(`/admin/settings/${category}`, { method: 'PATCH', body: JSON.stringify({ settings, changeReason }) }),
  rollbackAdminSetting: (settingKey: string, targetVersion: number) =>
    request('/admin/settings/rollback', { method: 'POST', body: JSON.stringify({ settingKey, targetVersion }) }),

  getAdminRetention: () => request('/admin/retention'),
  updateAdminRetention: (category: string, data: Record<string, any>) =>
    request(`/admin/retention/${category}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getAdminAudit: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request(`/admin/audit?${query.toString()}`);
  },
  getAdminSystemHealth: () => request('/admin/system'),
  getAdminScenarios: () => request('/admin/simulation/scenarios'),
  updateScenarioStatus: (id: string, data: Record<string, any>) =>
    request(`/admin/simulation/scenarios/${id}/status`, { method: 'POST', body: JSON.stringify(data) }),
};


