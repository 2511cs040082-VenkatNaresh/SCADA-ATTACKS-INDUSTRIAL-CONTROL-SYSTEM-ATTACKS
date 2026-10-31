import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { apiService, fetchHealthStatus } from '../services/api';

export interface EventEnvelope {
  event_id: string;
  event_type: string;
  type?: string;
  timestamp: string;
  environment?: 'LAB' | 'PRODUCTION' | string;
  simulation?: boolean;
  simulation_run_id?: string | number | null;
  scenario_id?: string | null;
  scenario_version?: string | null;
  asset_id?: string | null;
  asset_ids?: string[];
  source_asset_id?: string | null;
  destination_asset_id?: string | null;
  zone_id?: string | null;
  protocol?: string | null;
  session_id?: string | null;
  event_source?: string | null;
  severity?: string | null;
  priority?: string | null;
  entity_type?: string | null;
  entity_id?: string | number | null;
  correlation_id?: string | null;
  parent_event_id?: string | null;
  payload?: any;
  data?: any;
  metadata?: any;

  // Legacy field compatibility
  source?: { asset_id?: string; asset_type?: string };
  metric?: string;
  value?: any;
  unit?: string;
  quality?: string;
  description?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  type: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface RealTimeMetrics {
  criticalAlertsCount: number;
  activeAlertsCount: number;
  activeIncidentsCount: number;
  totalAssetsCount: number;
  healthyAssetsCount: number;
  ruleDetectionsCount: number;
  behavioralAnomaliesCount: number;
  mlPredictionsCount: number;
  networkFlowsCount: number;
  mitreCoveragePercent: number;
  pendingApprovalsCount: number;
  activeSimulationsCount: number;
  pps: number;
  eps: number;
}

export interface SimulationState {
  activeRun: any | null;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'STOPPED';
  storyEvents: EventEnvelope[];
  currentStep: number;
}

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'DEGRADED' | 'ERROR';

interface WebSocketContextType {
  status: ConnectionStatus;
  events: EventEnvelope[];
  notifications: AppNotification[];
  latestTelemetry: Record<string, EventEnvelope>;
  latestProcess: Record<string, any>;
  liveAssets: Record<string, any>;
  networkFlows: any[];
  protocolTransactions: any[];
  ruleDetections: any[];
  behavioralAnomalies: any[];
  mlPredictions: any[];
  alerts: any[];
  incidents: any[];
  mitreMappings: any[];
  responsePlans: any[];
  simulationState: SimulationState;
  pipelineStats: { pps: number; eps: number };
  metrics: RealTimeMetrics;

  clearEvents: () => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  resyncState: () => Promise<void>;
}

const defaultMetrics: RealTimeMetrics = {
  criticalAlertsCount: 0,
  activeAlertsCount: 0,
  activeIncidentsCount: 0,
  totalAssetsCount: 4,
  healthyAssetsCount: 4,
  ruleDetectionsCount: 0,
  behavioralAnomaliesCount: 0,
  mlPredictionsCount: 0,
  networkFlowsCount: 120,
  mitreCoveragePercent: 88,
  pendingApprovalsCount: 0,
  activeSimulationsCount: 0,
  pps: 134,
  eps: 12,
};

const defaultSimulationState: SimulationState = {
  activeRun: null,
  status: 'IDLE',
  storyEvents: [],
  currentStep: 0,
};

const WebSocketContext = createContext<WebSocketContextType>({
  status: 'DISCONNECTED',
  events: [],
  notifications: [],
  latestTelemetry: {},
  latestProcess: {},
  liveAssets: {},
  networkFlows: [],
  protocolTransactions: [],
  ruleDetections: [],
  behavioralAnomalies: [],
  mlPredictions: [],
  alerts: [],
  incidents: [],
  mitreMappings: [],
  responsePlans: [],
  simulationState: defaultSimulationState,
  pipelineStats: { pps: 134, eps: 12 },
  metrics: defaultMetrics,

  clearEvents: () => {},
  markNotificationRead: () => {},
  clearNotifications: () => {},
  resyncState: async () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');
  const [events, setEvents] = useState<EventEnvelope[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [latestTelemetry, setLatestTelemetry] = useState<Record<string, EventEnvelope>>({});
  const [latestProcess, setLatestProcess] = useState<Record<string, any>>({});
  const [liveAssets, setLiveAssets] = useState<Record<string, any>>({});

  const [networkFlows, setNetworkFlows] = useState<any[]>([]);
  const [protocolTransactions, setProtocolTransactions] = useState<any[]>([]);
  const [ruleDetections, setRuleDetections] = useState<any[]>([]);
  const [behavioralAnomalies, setBehavioralAnomalies] = useState<any[]>([]);
  const [mlPredictions, setMlPredictions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [mitreMappings, setMitreMappings] = useState<any[]>([]);
  const [responsePlans, setResponsePlans] = useState<any[]>([]);
  const [simulationState, setSimulationState] = useState<SimulationState>(defaultSimulationState);
  const [metrics, setMetrics] = useState<RealTimeMetrics>(defaultMetrics);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seenEventIds = useRef<Set<string>>(new Set());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Reconnection Resync: Fetch fresh backend metrics & state snapshots
  const resyncState = useCallback(async () => {
    try {
      const [sysHealth, alertMet, incMet, simMet] = await Promise.allSettled([
        fetchHealthStatus(),
        apiService.getAlertMetrics(),
        apiService.getIncidentMetrics(),
        apiService.getSimulationMetrics(),
      ]);

      setMetrics((prev) => ({
        ...prev,
        criticalAlertsCount:
          alertMet.status === 'fulfilled' && alertMet.value?.data
            ? alertMet.value.data.critical_count || alertMet.value.data.by_severity?.CRITICAL || 0
            : prev.criticalAlertsCount,
        activeAlertsCount:
          alertMet.status === 'fulfilled' && alertMet.value?.data
            ? alertMet.value.data.active_count || alertMet.value.data.by_status?.NEW || 0
            : prev.activeAlertsCount,
        activeIncidentsCount:
          incMet.status === 'fulfilled' && incMet.value?.data
            ? incMet.value.data.open_count || incMet.value.data.by_status?.NEW || 0
            : prev.activeIncidentsCount,
        activeSimulationsCount:
          simMet.status === 'fulfilled' && simMet.value?.data
            ? simMet.value.data.active_runs_count || 0
            : prev.activeSimulationsCount,
      }));
    } catch (e) {
      // Ignore resync errors
    }
  }, []);

  // Multi-Tab Synchronization Channel
  useEffect(() => {
    try {
      const channel = new BroadcastChannel('icsshield_realtime_bus');
      broadcastChannelRef.current = channel;
      channel.onmessage = (msgEvent) => {
        if (msgEvent.data && msgEvent.data.type === 'SYNC_EVENT') {
          processIncomingEnvelope(msgEvent.data.envelope, false);
        }
      };
    } catch (e) {
      // BroadcastChannel not available in legacy environments
    }
    return () => {
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
    };
  }, []);

  // Deterministic Event Relevance Router & Store Modifier
  const processIncomingEnvelope = useCallback((parsed: EventEnvelope, shouldBroadcast = true) => {
    const evtId = parsed.event_id || `evt-${Date.now()}-${Math.random()}`;
    if (seenEventIds.current.has(evtId)) return; // Bounded Deduplication Check

    seenEventIds.current.add(evtId);
    if (seenEventIds.current.size > 1000) {
      const firstId = seenEventIds.current.values().next().value;
      if (firstId) seenEventIds.current.delete(firstId);
    }

    const evtType = parsed.event_type || parsed.type || 'TELEMETRY';

    // Broadcast to other tabs
    if (shouldBroadcast && broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type: 'SYNC_EVENT', envelope: parsed });
      } catch (e) {}
    }

    // 1. Update Global Timeline Stream (Limit 500 items)
    setEvents((prev) => [parsed, ...prev.slice(0, 499)]);

    // 2. Telemetry & Process Routing
    if (evtType === 'telemetry.received' || evtType === 'TELEMETRY' || evtType === 'TELEMETRY_READING') {
      const assetId = parsed.asset_id || parsed.data?.asset_id || parsed.source?.asset_id || 'PLC-001';
      setLatestTelemetry((prev) => ({ ...prev, [assetId]: parsed }));
      setMetrics((m) => ({ ...m, pps: Math.floor(130 + Math.random() * 20) }));
    }

    if (evtType === 'process.updated' || evtType === 'PROCESS') {
      const param = parsed.payload?.parameter || parsed.data?.parameter || parsed.metadata?.parameter;
      const val = parsed.payload?.value ?? parsed.data?.value ?? parsed.metadata?.value;
      if (param !== undefined) {
        setLatestProcess((prev) => ({ ...prev, [param]: val }));
      }
    }

    // 3. Network & Protocol Routing
    if (evtType.startsWith('network.')) {
      setNetworkFlows((prev) => [parsed.data || parsed.payload || parsed, ...prev.slice(0, 99)]);
      setMetrics((m) => ({ ...m, networkFlowsCount: m.networkFlowsCount + 1 }));
    }

    if (evtType.startsWith('protocol.')) {
      setProtocolTransactions((prev) => [parsed.data || parsed.payload || parsed, ...prev.slice(0, 99)]);
    }

    // 4. Detection Routing
    if (evtType === 'DETECTION_ALERT' || evtType === 'detection.created') {
      setRuleDetections((prev) => [parsed.data || parsed.payload || parsed, ...prev.slice(0, 99)]);
      setMetrics((m) => ({ ...m, ruleDetectionsCount: m.ruleDetectionsCount + 1 }));

      addNotification({
        id: `notif-det-${Date.now()}`,
        title: 'Rule Detection Triggered',
        message: parsed.data?.title || parsed.payload?.title || `Rule triggered on ${parsed.asset_id || 'PLC-001'}`,
        severity: 'WARNING',
        type: evtType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        read: false,
        link: '/detection',
      });
    }

    // 5. Behavioral Anomaly Routing
    if (evtType === 'behavioral.anomaly_created') {
      setBehavioralAnomalies((prev) => [parsed.data || parsed.payload || parsed, ...prev.slice(0, 99)]);
      setMetrics((m) => ({ ...m, behavioralAnomaliesCount: m.behavioralAnomaliesCount + 1 }));

      addNotification({
        id: `notif-beh-${Date.now()}`,
        title: 'Behavioral Anomaly Detected',
        message: parsed.data?.title || parsed.payload?.title || `Statistical Z-Score deviation on ${parsed.asset_id || 'PLC-001'}`,
        severity: 'WARNING',
        type: evtType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        read: false,
        link: '/behavioral',
      });
    }

    // 6. ML Prediction Routing
    if (evtType === 'ml.prediction_created') {
      setMlPredictions((prev) => [parsed.data || parsed.payload || parsed, ...prev.slice(0, 99)]);
      setMetrics((m) => ({ ...m, mlPredictionsCount: m.mlPredictionsCount + 1 }));
    }

    // 7. Alert Routing
    if (evtType === 'alert.created' || evtType === 'NEW_ALERT') {
      const alertObj = parsed.data || parsed.payload || parsed;
      setAlerts((prev) => [alertObj, ...prev.slice(0, 199)]);

      const isCritical = parsed.severity === 'CRITICAL' || alertObj.severity === 'CRITICAL';
      setMetrics((m) => ({
        ...m,
        activeAlertsCount: m.activeAlertsCount + 1,
        criticalAlertsCount: isCritical ? m.criticalAlertsCount + 1 : m.criticalAlertsCount,
      }));

      addNotification({
        id: `notif-alt-${Date.now()}`,
        title: isCritical ? '🔴 Critical Alert Created' : '🟠 Security Alert Created',
        message: alertObj.title || `Alert triggered on ${parsed.asset_id || 'PLC-001'}`,
        severity: isCritical ? 'CRITICAL' : 'WARNING',
        type: evtType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        read: false,
        link: '/alerts',
      });
    }

    if (evtType === 'alert.updated' || evtType === 'alert.status_changed') {
      const updatedAlert = parsed.data || parsed.payload || parsed;
      setAlerts((prev) =>
        prev.map((a) => (String(a.id || a.alert_id) === String(updatedAlert.id || updatedAlert.alert_id) ? { ...a, ...updatedAlert } : a))
      );
    }

    // 8. Incident Routing
    if (evtType === 'incident.created') {
      const incObj = parsed.data || parsed.payload || parsed;
      setIncidents((prev) => [incObj, ...prev.slice(0, 99)]);
      setMetrics((m) => ({ ...m, activeIncidentsCount: m.activeIncidentsCount + 1 }));

      addNotification({
        id: `notif-inc-${Date.now()}`,
        title: '🛡️ Correlated Incident Created',
        message: incObj.title || `Security Incident created for ${parsed.asset_id || 'PLC-001'}`,
        severity: 'CRITICAL',
        type: evtType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        read: false,
        link: `/incidents/${incObj.id || incObj.incident_id}`,
      });
    }

    if (evtType === 'incident.status_changed') {
      const updatedInc = parsed.data || parsed.payload || parsed;
      setIncidents((prev) =>
        prev.map((inc) => (String(inc.id || inc.incident_id) === String(updatedInc.id || updatedInc.incident_id) ? { ...inc, ...updatedInc } : inc))
      );
      if (updatedInc.new_status === 'RESOLVED' || updatedInc.new_status === 'CLOSED') {
        setMetrics((m) => ({ ...m, activeIncidentsCount: Math.max(0, m.activeIncidentsCount - 1) }));
      }
    }

    // 9. MITRE Routing
    if (evtType === 'mitre.mapping_created') {
      setMitreMappings((prev) => [parsed.data || parsed.payload || parsed, ...prev]);
    }

    // 10. Response Routing
    if (evtType === 'response.approval_requested' || evtType === 'response.recommendation_created') {
      const planObj = parsed.data || parsed.payload || parsed;
      setResponsePlans((prev) => [planObj, ...prev.slice(0, 99)]);
      setMetrics((m) => ({ ...m, pendingApprovalsCount: m.pendingApprovalsCount + 1 }));

      addNotification({
        id: `notif-rsp-${Date.now()}`,
        title: '⚡ Response Approval Required',
        message: planObj.title || `Playbook approval required for ${parsed.asset_id || 'PLC-001'}`,
        severity: 'WARNING',
        type: evtType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        read: false,
        link: '/response',
      });
    }

    if (evtType === 'response.approved' || evtType === 'response.execution_completed') {
      const planObj = parsed.data || parsed.payload || parsed;
      setResponsePlans((prev) =>
        prev.map((p) => (String(p.id || p.plan_id) === String(planObj.id || planObj.plan_id) ? { ...p, status: 'COMPLETED' } : p))
      );
      setMetrics((m) => ({ ...m, pendingApprovalsCount: Math.max(0, m.pendingApprovalsCount - 1) }));

      addNotification({
        id: `notif-rsp-done-${Date.now()}`,
        title: '🟢 Simulated Response Executed',
        message: `Defense playbook executed successfully on ${parsed.asset_id || 'PLC-001'}`,
        severity: 'SUCCESS',
        type: evtType,
        timestamp: parsed.timestamp || new Date().toISOString(),
        read: false,
        link: '/response',
      });
    }

    // 11. Asset Routing
    if (evtType === 'asset.status_changed' || evtType === 'asset.health_changed' || evtType === 'asset.updated') {
      const assetObj = parsed.data || parsed.payload || parsed;
      if (assetObj.asset_id || assetObj.id) {
        const id = assetObj.asset_id || assetObj.id;
        setLiveAssets((prev) => ({ ...prev, [id]: { ...prev[id], ...assetObj } }));
      }
    }

    // 12. Simulation Routing
    if (evtType.startsWith('simulation.')) {
      setSimulationState((prev) => {
        const isStarted = evtType === 'simulation.started';
        const isCompleted = evtType === 'simulation.completed' || evtType === 'simulation.stopped';

        return {
          ...prev,
          status: isStarted ? 'RUNNING' : isCompleted ? 'COMPLETED' : prev.status,
          activeRun: parsed.data || parsed.payload || prev.activeRun,
          storyEvents: [parsed, ...prev.storyEvents.slice(0, 199)],
          currentStep: evtType === 'simulation.step_started' ? (parsed.payload?.sequence || prev.currentStep + 1) : prev.currentStep,
        };
      });

      setMetrics((m) => ({
        ...m,
        activeSimulationsCount: evtType === 'simulation.started' ? 1 : evtType === 'simulation.completed' ? 0 : m.activeSimulationsCount,
      }));
    }
  }, []);

  const addNotification = (notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => setNotifications([]);
  const clearEvents = () => setEvents([]);

  // Connection Lifecycle
  const connect = useCallback(() => {
    try {
      setStatus('CONNECTING');
      const wsUrl = `ws://${window.location.hostname}:5050`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('CONNECTED');
        resyncState(); // Reconnection Resync
      };

      ws.onmessage = (event) => {
        try {
          const parsed: EventEnvelope = JSON.parse(event.data);
          processIncomingEnvelope(parsed, true);
        } catch (e) {
          // Ignore non-JSON frames
        }
      };

      ws.onerror = () => {
        setStatus('DEGRADED');
      };

      ws.onclose = () => {
        setStatus('DISCONNECTED');
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    } catch (err) {
      setStatus('ERROR');
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [processIncomingEnvelope, resyncState]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider
      value={{
        status,
        events,
        notifications,
        latestTelemetry,
        latestProcess,
        liveAssets,
        networkFlows,
        protocolTransactions,
        ruleDetections,
        behavioralAnomalies,
        mlPredictions,
        alerts,
        incidents,
        mitreMappings,
        responsePlans,
        simulationState,
        pipelineStats: { pps: metrics.pps, eps: metrics.eps },
        metrics,

        clearEvents,
        markNotificationRead,
        clearNotifications,
        resyncState,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

