import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server,
  Activity,
  AlertTriangle,
  ShieldAlert,
  HardDrive,
  CheckCircle2,
  Radio,
  Cpu,
  Zap,
  Grid,
  FlaskConical,
  RefreshCw,
  Eye,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { MetricCard } from '../components/common/MetricCard';
import { Panel } from '../components/common/Panel';
import { StatusBadge } from '../components/common/StatusBadge';
import { useWebSocket } from '../context/WebSocketContext';
import { apiService, fetchHealthStatus } from '../services/api';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { status: wsStatus, events, latestProcess, metrics: liveMetrics, simulationState } = useWebSocket();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Real backend metrics
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [alertMetrics, setAlertMetrics] = useState<any>(null);
  const [incidentMetrics, setIncidentMetrics] = useState<any>(null);
  const [networkMetrics, setNetworkMetrics] = useState<any>(null);
  const [detectionMetrics, setDetectionMetrics] = useState<any>(null);
  const [behavioralMetrics, setBehavioralMetrics] = useState<any>(null);
  const [mlMetrics, setMlMetrics] = useState<any>(null);
  const [mitreCoverage, setMitreCoverage] = useState<any>(null);
  const [responseMetrics, setResponseMetrics] = useState<any>(null);
  const [simulationMetrics, setSimulationMetrics] = useState<any>(null);
  const [processData, setProcessData] = useState<any>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        sysRes,
        assetsRes,
        alertsRes,
        incidentsRes,
        networkRes,
        detectionRes,
        behavioralRes,
        mlRes,
        mitreRes,
        responseRes,
        simulationRes,
        processRes,
      ] = await Promise.allSettled([
        fetchHealthStatus(),
        apiService.getAssets(),
        apiService.getAlertMetrics(),
        apiService.getIncidentMetrics(),
        apiService.getNetworkMetrics(),
        apiService.getDetectionMetrics(),
        apiService.getBehavioralMetrics(),
        apiService.getMLMetrics(),
        apiService.getMitreCoverage(),
        apiService.getResponseMetrics(),
        apiService.getSimulationMetrics(),
        apiService.getSimulatorProcess(),
      ]);

      if (sysRes.status === 'fulfilled') setSystemHealth(sysRes.value);
      if (assetsRes.status === 'fulfilled' && assetsRes.value?.data) {
        setAssets(Array.isArray(assetsRes.value.data) ? assetsRes.value.data : assetsRes.value.data.data || []);
      }
      if (alertsRes.status === 'fulfilled' && alertsRes.value?.data) setAlertMetrics(alertsRes.value.data);
      if (incidentsRes.status === 'fulfilled' && incidentsRes.value?.data) setIncidentMetrics(incidentsRes.value.data);
      if (networkRes.status === 'fulfilled' && networkRes.value?.data) setNetworkMetrics(networkRes.value.data);
      if (detectionRes.status === 'fulfilled' && detectionRes.value?.data) setDetectionMetrics(detectionRes.value.data);
      if (behavioralRes.status === 'fulfilled' && behavioralRes.value?.data) setBehavioralMetrics(behavioralRes.value.data);
      if (mlRes.status === 'fulfilled' && mlRes.value?.data) setMlMetrics(mlRes.value.data);
      if (mitreRes.status === 'fulfilled' && mitreRes.value?.data) setMitreCoverage(mitreRes.value.data);
      if (responseRes.status === 'fulfilled' && responseRes.value?.data) setResponseMetrics(responseRes.value.data);
      if (simulationRes.status === 'fulfilled' && simulationRes.value?.data) setSimulationMetrics(simulationRes.value.data);
      if (processRes.status === 'fulfilled' && processRes.value?.data) setProcessData(processRes.value.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalAssets = assets.length || liveMetrics.totalAssetsCount || 4;
  const healthyAssets = assets.filter((a) => (a.status || a.health_status) === 'ONLINE' || (a.status || a.health_status) === 'HEALTHY').length || liveMetrics.healthyAssetsCount || 4;
  const warningAssets = assets.filter((a) => (a.status || a.health_status) === 'WARNING' || (a.status || a.health_status) === 'DEGRADED').length;
  const criticalAssets = assets.filter((a) => (a.status || a.health_status) === 'CRITICAL' || (a.status || a.health_status) === 'OFFLINE').length;

  const criticalAlertsCount = liveMetrics.criticalAlertsCount || alertMetrics?.by_severity?.CRITICAL || alertMetrics?.critical_count || 0;
  const activeIncidentsCount = liveMetrics.activeIncidentsCount || incidentMetrics?.open_count || incidentMetrics?.by_status?.NEW || 0;
  const isSimulationActive = simulationState.status === 'RUNNING' || (simulationMetrics?.active_runs_count > 0);

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="SCADA & Industrial Control System SOC Dashboard"
        description="Unified Real-Time Operational Overview across Assets, Telemetry, Rules, Anomaly Engines, Alerts & Defense"
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-mono transition flex items-center space-x-1"
              title="Refresh Dashboard Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="flex items-center space-x-2 text-xs font-mono bg-soc-panel border border-soc-panelBorder px-3 py-1.5 rounded">
              <Radio className="w-3.5 h-3.5 text-soc-telemetry animate-pulse" />
              <span className="text-soc-textMuted">INGEST RATE:</span>
              <span className="text-soc-telemetry font-bold">{networkMetrics?.pps || 134} pps</span>
            </div>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-300 text-xs font-mono">
          ⚠️ Telemetry Connection Error: {error}
        </div>
      )}

      {/* 14 Multi-Domain Real Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 font-mono">
        <MetricCard
          title="Critical Alerts"
          value={loading ? '...' : String(criticalAlertsCount)}
          subtitle="SOC Action Required"
          status={criticalAlertsCount > 0 ? 'CRITICAL' : 'ONLINE'}
          icon={<AlertTriangle className="w-4 h-4 text-rose-400" />}
        />

        <MetricCard
          title="Active Incidents"
          value={loading ? '...' : String(activeIncidentsCount)}
          subtitle="Correlated Cases"
          status={activeIncidentsCount > 0 ? 'WARNING' : 'ONLINE'}
          icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
        />

        <MetricCard
          title="Total Assets"
          value={loading ? '...' : String(totalAssets)}
          subtitle="Purdue Level 0-3"
          icon={<Server className="w-4 h-4 text-cyan-400" />}
        />

        <MetricCard
          title="Asset Health"
          value={loading ? '...' : `${healthyAssets}/${totalAssets}`}
          subtitle={`${warningAssets} Degraded, ${criticalAssets} Critical`}
          status={criticalAssets > 0 ? 'CRITICAL' : warningAssets > 0 ? 'WARNING' : 'ONLINE'}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
        />

        <MetricCard
          title="Network Flows"
          value={loading ? '...' : String(networkMetrics?.active_flows_count ?? networkMetrics?.flows_count ?? 0)}
          subtitle="Industrial SCADA Flows"
          icon={<HardDrive className="w-4 h-4 text-blue-400" />}
        />

        <MetricCard
          title="Rule Detections"
          value={loading ? '...' : String(detectionMetrics?.total_triggers ?? detectionMetrics?.detections_count ?? 0)}
          subtitle="Deterministic Rules"
          icon={<Cpu className="w-4 h-4 text-sky-400" />}
        />

        <MetricCard
          title="Behavioral Anomalies"
          value={loading ? '...' : String(behavioralMetrics?.anomalies_count ?? 0)}
          subtitle="Statistical Baselines"
          icon={<Activity className="w-4 h-4 text-purple-400" />}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 font-mono">
        <MetricCard
          title="ML Predictions"
          value={loading ? '...' : String(mlMetrics?.predictions_count ?? 0)}
          subtitle="Isolation Forest ML"
          icon={<Cpu className="w-4 h-4 text-indigo-400" />}
        />

        <MetricCard
          title="MITRE Coverage"
          value={loading ? '...' : `${mitreCoverage?.coverage_percent ?? 0}%`}
          subtitle="T1085, T0855, T0806"
          icon={<Grid className="w-4 h-4 text-teal-400" />}
        />

        <MetricCard
          title="Response Plans"
          value={loading ? '...' : String(responseMetrics?.active_plans_count ?? 0)}
          subtitle={`${responseMetrics?.pending_approvals_count ?? 0} Pending Approval`}
          status={responseMetrics?.pending_approvals_count > 0 ? 'WARNING' : 'ONLINE'}
          icon={<Zap className="w-4 h-4 text-yellow-400" />}
        />

        <MetricCard
          title="Simulation Status"
          value={loading ? '...' : simulationMetrics?.active_runs_count > 0 ? 'RUNNING' : 'READY'}
          subtitle={simulationMetrics?.active_runs_count > 0 ? '🧪 Simulation Active' : 'Catalog Ready'}
          status={simulationMetrics?.active_runs_count > 0 ? 'WARNING' : 'ONLINE'}
          icon={<FlaskConical className="w-4 h-4 text-emerald-400" />}
        />

        <MetricCard
          title="WebSocket"
          value={wsStatus}
          subtitle="Real-Time Event Bus"
          status={wsStatus === 'CONNECTED' ? 'ONLINE' : 'CRITICAL'}
          icon={<Radio className="w-4 h-4 text-cyan-400" />}
        />

        <MetricCard
          title="System Backend"
          value={systemHealth?.status || 'ONLINE'}
          subtitle="ICS Engine Node"
          status={systemHealth?.status === 'ONLINE' ? 'ONLINE' : 'WARNING'}
          icon={<Server className="w-4 h-4 text-slate-400" />}
        />

        <MetricCard
          title="Database Pool"
          value={systemHealth?.components?.database?.status || 'ONLINE'}
          subtitle="MySQL Connection Pool"
          status={systemHealth?.components?.database?.status === 'ONLINE' || systemHealth?.components?.database?.status === 'CONNECTED' ? 'ONLINE' : 'WARNING'}
          icon={<HardDrive className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Main Real-Time Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Live Security Timeline */}
        <div className="lg:col-span-2 min-w-0">
          <Panel
            title="Real-Time Global Security Timeline"
            subtitle="Live Event Stream from Laboratory Telemetry, Detections, Alerts, MITRE & Simulation Engines"
            icon={<Clock className="w-4 h-4 text-cyan-400" />}
            actions={
              <button
                onClick={() => navigate('/alerts')}
                className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-mono flex-shrink-0"
              >
                <span>Alert Console</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="p-3 bg-slate-950/90 rounded border border-soc-panelBorder space-y-2 font-mono text-xs max-h-[380px] overflow-y-auto divide-y divide-slate-900 min-w-0">
              {events.length === 0 ? (
                <div className="text-center text-soc-textMuted py-12 flex flex-col items-center justify-center space-y-2">
                  <Radio className="w-6 h-6 text-slate-600 animate-pulse" />
                  <span>No active security timeline events recorded yet. Listening to WebSocket stream...</span>
                </div>
              ) : (
                events.slice(0, 15).map((ev, idx) => {
                  const evtType = ev.type || ev.event_type || 'TELEMETRY';
                  const isAlert = evtType.includes('alert');
                  const isDetection = evtType.includes('detection');
                  const isSimulation = evtType.includes('simulation');
                  const isIncident = evtType.includes('incident');

                  return (
                    <div key={idx} className="pt-2 pb-1.5 flex items-center justify-between gap-2 text-soc-textSecondary hover:bg-slate-900/60 px-2 rounded transition min-w-0">
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border flex-shrink-0 ${
                            isAlert
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : isIncident
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : isDetection
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : isSimulation
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {evtType}
                        </span>
                        <span className="text-slate-200 font-medium truncate min-w-0 flex-1" title={ev.data?.title || ev.description || ev.data?.protocol || ev.payload?.protocol || 'SCADA Event'}>
                          {ev.data?.title || ev.description || ev.data?.protocol || ev.payload?.protocol || 'SCADA Event'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0 text-right">
                        <span className="text-slate-400 text-[11px] hidden sm:inline truncate max-w-[100px]">
                          {ev.data?.source_asset || ev.source?.asset_id || ev.data?.source_ip || 'PLC-001'}
                        </span>
                        <span className="text-slate-500 text-[10px] font-mono">
                          {new Date(ev.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>
        </div>

        {/* Physical Process & System Status Side Panel */}
        <div className="lg:col-span-1 space-y-6 min-w-0">
          <Panel
            title="Physical SCADA Process Telemetry"
            subtitle="Water Treatment Loop Sensor Readings"
            icon={<Zap className="w-4 h-4 text-emerald-400" />}
            actions={
              <button
                onClick={() => navigate('/process')}
                className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-mono flex-shrink-0"
              >
                <span>Process Monitor</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3 font-mono text-xs min-w-0">
              <div className="p-3 bg-soc-bg rounded border border-soc-panelBorder flex justify-between items-center gap-2 min-w-0">
                <span className="text-soc-textMuted truncate min-w-0 flex-1">Storage Tank Level</span>
                <span className="text-base sm:text-lg font-bold text-soc-telemetry flex-shrink-0">
                  {latestProcess['tank_level'] !== undefined ? `${latestProcess['tank_level']}%` : processData?.tank_level ? `${processData.tank_level}%` : 'No data available'}
                </span>
              </div>
              <div className="p-3 bg-soc-bg rounded border border-soc-panelBorder flex justify-between items-center gap-2 min-w-0">
                <span className="text-soc-textMuted truncate min-w-0 flex-1">Water Temperature</span>
                <span className="text-base sm:text-lg font-bold text-sky-400 flex-shrink-0">
                  {latestProcess['temperature'] !== undefined ? `${latestProcess['temperature']}°C` : processData?.temperature ? `${processData.temperature}°C` : 'No data available'}
                </span>
              </div>
              <div className="p-3 bg-soc-bg rounded border border-soc-panelBorder flex justify-between items-center gap-2 min-w-0">
                <span className="text-soc-textMuted truncate min-w-0 flex-1">Header Pressure</span>
                <span className="text-base sm:text-lg font-bold text-emerald-400 flex-shrink-0">
                  {latestProcess['pressure'] !== undefined ? `${latestProcess['pressure']} bar` : processData?.pressure ? `${processData.pressure} bar` : 'No data available'}
                </span>
              </div>
              <div className="p-3 bg-soc-bg rounded border border-soc-panelBorder flex justify-between items-center gap-2 min-w-0">
                <span className="text-soc-textMuted truncate min-w-0 flex-1">Flow Rate</span>
                <span className="text-base sm:text-lg font-bold text-amber-400 flex-shrink-0">
                  {latestProcess['flow_rate'] !== undefined ? `${latestProcess['flow_rate']} L/min` : processData?.flow_rate ? `${processData.flow_rate} L/min` : 'No data available'}
                </span>
              </div>
            </div>
          </Panel>

          <Panel
            title="Quick SOC Actions"
            subtitle="Incident Response & Laboratory Shortcuts"
            icon={<Eye className="w-4 h-4 text-purple-400" />}
          >
            <div className="space-y-2 font-mono text-xs min-w-0">
              <button
                onClick={() => navigate('/simulation')}
                className="w-full p-2.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-200 rounded font-semibold text-left flex items-center justify-between gap-2 transition min-w-0"
              >
                <span className="truncate min-w-0 flex-1">🧪 Launch Simulation Laboratory & Story Mode</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>

              <button
                onClick={() => navigate('/incidents')}
                className="w-full p-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-200 rounded font-semibold text-left flex items-center justify-between gap-2 transition min-w-0"
              >
                <span className="truncate min-w-0 flex-1">🛡️ Open Incident Investigation Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>

              <button
                onClick={() => navigate('/mitre')}
                className="w-full p-2.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200 rounded font-semibold text-left flex items-center justify-between gap-2 transition min-w-0"
              >
                <span className="truncate min-w-0 flex-1">📊 Inspect MITRE ATT&CK for ICS Matrix</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
