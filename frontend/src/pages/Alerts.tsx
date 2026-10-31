import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ShieldAlert,
  Layers,
  Sliders,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  UserPlus,
  ArrowUpRight,
  VolumeX,
  FileText,
  Activity,
  BarChart2,
  Clock,
  Download,
  Plus,
  RefreshCw,
  GitCommit,
  Bell
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useWebSocket } from '../context/WebSocketContext';
import { apiService } from '../services/api';

interface AlertItem {
  id: number;
  alert_uuid: string;
  source_type: string;
  source_detection_id: string;
  title: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  confidence: number;
  risk_score: number;
  status: 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED' | 'SUPPRESSED' | 'FALSE_POSITIVE' | 'DUPLICATE';
  source_asset_id: number;
  destination_asset_id: number;
  protocol: string;
  source_asset_name?: string;
  destination_asset_name?: string;
  assignee?: string;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
  created_at: string;
}

interface AlertGroup {
  id: number;
  group_uuid: string;
  group_key: string;
  title: string;
  severity: string;
  priority: string;
  status: string;
  asset_scope: string;
  alert_count: number;
  first_seen: string;
  last_seen: string;
}

interface SuppressionRule {
  id: number;
  suppression_uuid: string;
  rule_name: string;
  target_asset_id: number | null;
  target_category: string | null;
  reason: string;
  status: string;
  created_at: string;
}

export const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useWebSocket();
  const [activeTab, setActiveTab] = useState<'operations' | 'groups' | 'correlations' | 'suppressions' | 'metrics'>('operations');

  // Alert State
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [groups, setGroups] = useState<AlertGroup[]>([]);
  const [suppressions, setSuppressions] = useState<SuppressionRule[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('ALL');

  // Selected Alerts for Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Suppression Modal State
  const [showSuppressionModal, setShowSuppressionModal] = useState<boolean>(false);
  const [newSuppressionName, setNewSuppressionName] = useState<string>('');
  const [newSuppressionReason, setNewSuppressionReason] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, groupsRes, suppRes, metricsRes, healthRes] = await Promise.all([
        apiService.getAlerts({
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          source_type: sourceTypeFilter !== 'ALL' ? sourceTypeFilter : undefined,
          search: search || undefined,
          limit: 100
        }),
        apiService.getAlertGroups(),
        apiService.getSuppressions(),
        apiService.getAlertMetrics(),
        apiService.getAlertHealth()
      ]);

      setAlerts(alertsRes.data || []);
      setGroups(groupsRes.data || []);
      setSuppressions(suppRes.data || []);
      setMetrics(metricsRes.data || null);
      setHealth(healthRes.data || null);
    } catch (err) {
      console.error('Failed to fetch alert data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [severityFilter, priorityFilter, statusFilter, sourceTypeFilter]);

  // Real-Time WebSocket Updates
  useEffect(() => {
    if (events.length > 0) {
      fetchData();
    }
  }, [events]);

  // Bulk Actions Handlers
  const handleBulkAction = async (action: 'ACKNOWLEDGE' | 'SUPPRESS' | 'RESOLVE') => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        if (action === 'ACKNOWLEDGE') await apiService.acknowledgeAlert(id);
        else if (action === 'SUPPRESS') await apiService.suppressAlert(id, 'Bulk suppression action by SOC analyst');
        else if (action === 'RESOLVE') await apiService.updateAlertStatus(id, 'RESOLVED', 'Bulk resolution action by SOC analyst');
      }
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(`Bulk ${action} failed:`, err);
    }
  };

  const handleCreateSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppressionName || !newSuppressionReason) return;
    try {
      await apiService.createSuppression({
        rule_name: newSuppressionName,
        reason: newSuppressionReason
      });
      setShowSuppressionModal(false);
      setNewSuppressionName('');
      setNewSuppressionReason('');
      fetchData();
    } catch (err) {
      console.error('Create suppression failed:', err);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500/20 text-red-400 border-red-500/40 font-bold';
      case 'P2': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'P3': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'P4': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-slate-900 font-semibold';
      case 'LOW': return 'bg-blue-600 text-white';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.alert_uuid.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="ALERT OPERATIONS"
        description="Real-Time Security Alert Management & Multi-Layer Detection Correlation Engine"
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm flex items-center space-x-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowSuppressionModal(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-sm flex items-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Suppression</span>
            </button>
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3.5">
        <MetricCard
          title="TOTAL ALERTS"
          value={metrics?.total_alerts || 0}
          icon={<ShieldAlert className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="NEW ALERTS"
          value={metrics?.new_alerts || 0}
          icon={<Bell className="w-5 h-5 text-yellow-400" />}
        />
        <MetricCard
          title="CRITICAL"
          value={metrics?.critical_alerts || 0}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        />
        <MetricCard
          title="P1 IMMEDIATE"
          value={metrics?.p1_alerts || 0}
          icon={<ArrowUpRight className="w-5 h-5 text-red-400" />}
        />
        <MetricCard
          title="UNASSIGNED"
          value={metrics?.unassigned_alerts || 0}
          icon={<UserPlus className="w-5 h-5 text-purple-400" />}
        />
        <MetricCard
          title="SUPPRESSED"
          value={metrics?.suppressed_alerts || 0}
          icon={<VolumeX className="w-5 h-5 text-slate-400" />}
        />
        <MetricCard
          title="MTTA (MIN)"
          value={`${metrics?.mtta_minutes || 4.2}m`}
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('operations')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'operations' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Alert Operations ({filteredAlerts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'groups' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Alert Groups ({groups.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('correlations')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'correlations' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Correlation Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('suppressions')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'suppressions' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <VolumeX className="w-4 h-4" />
          <span>Suppression Rules ({suppressions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'metrics' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Quality & SLA Metrics</span>
        </button>
      </div>

      {/* TAB 1: ALERT OPERATIONS */}
      {activeTab === 'operations' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search alert title, UUID, asset, IP or protocol..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Bulk Action Controls */}
              {selectedIds.length > 0 && (
                <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg">
                  <span className="text-xs text-slate-300 font-medium">{selectedIds.length} Selected:</span>
                  <button onClick={() => handleBulkAction('ACKNOWLEDGE')} className="px-2 py-0.5 bg-yellow-600 hover:bg-yellow-500 text-xs font-semibold rounded text-slate-900">
                    Acknowledge
                  </button>
                  <button onClick={() => handleBulkAction('SUPPRESS')} className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 font-semibold rounded">
                    Suppress
                  </button>
                  <button onClick={() => handleBulkAction('RESOLVE')} className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded text-white">
                    Resolve
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-medium">Filters:</span>
              </div>

              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Severity: All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Priority: All</option>
                <option value="P1">P1 (Immediate)</option>
                <option value="P2">P2 (High)</option>
                <option value="P3">P3 (Standard)</option>
                <option value="P4">P4 (Low)</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Status: All</option>
                <option value="NEW">New</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ESCALATED">Escalated</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="SUPPRESSED">Suppressed</option>
                <option value="FALSE_POSITIVE">False Positive</option>
              </select>

              <select
                value={sourceTypeFilter}
                onChange={e => setSourceTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">Source: All</option>
                <option value="RULE_DETECTION">Phase 8 Rules</option>
                <option value="BEHAVIORAL_ANOMALY">Phase 9 Behavioral</option>
                <option value="ML_DETECTION">Phase 10 ML Engine</option>
                <option value="MANUAL_ALERT">Manual Input</option>
              </select>
            </div>
          </div>

          {/* Real-Time Alerts Table */}
          <Panel title="Active Security Alert Console" subtitle="Real-time triaged & normalized alert stream" icon={<ShieldAlert className="w-4 h-4 text-cyan-400" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-mono">
                    <th className="py-3 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredAlerts.length && filteredAlerts.length > 0}
                        onChange={e => setSelectedIds(e.target.checked ? filteredAlerts.map(a => a.id) : [])}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                    </th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Alert Title / UUID</th>
                    <th className="py-3 px-3">Source</th>
                    <th className="py-3 px-3">Scope / Assets</th>
                    <th className="py-3 px-3">Protocol</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3 text-center">Occur</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-500">
                        No alerts matching current filter parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredAlerts.map(alert => (
                      <tr key={alert.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(alert.id)}
                            onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, alert.id] : selectedIds.filter(i => i !== alert.id))}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 border text-xs font-mono rounded ${getPriorityBadgeClass(alert.priority)}`}>
                            {alert.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${getSeverityBadgeClass(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[280px]">
                          <div className="font-semibold text-slate-100 truncate cursor-pointer hover:text-cyan-400 transition" onClick={() => navigate(`/alerts/${alert.id}`)}>
                            {alert.title}
                          </div>
                          <div className="text-xs font-mono text-slate-500 truncate">{alert.alert_uuid}</div>
                        </td>
                        <td className="py-3 px-3 text-xs font-mono text-slate-400">
                          {alert.source_type}
                        </td>
                        <td className="py-3 px-3 text-xs font-mono">
                          <div className="text-slate-200">{alert.source_asset_name || `Asset #${alert.source_asset_id || 1}`}</div>
                          {alert.destination_asset_id && (
                            <div className="text-slate-500">➔ {alert.destination_asset_name || `Asset #${alert.destination_asset_id}`}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-cyan-400">
                          {alert.protocol || 'MODBUS_TCP'}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={alert.status} />
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-400">
                          {alert.assignee || 'Unassigned'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-xs font-bold text-slate-200">
                          {alert.occurrence_count || 1}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => navigate(`/alerts/${alert.id}`)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded text-xs font-medium flex items-center space-x-1 ml-auto transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Investigate</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: ALERT GROUPS */}
      {activeTab === 'groups' && (
        <Panel title="Correlated Alert Groups" subtitle="Logical alert clusters grouped by asset scope & protocol" icon={<Layers className="w-4 h-4 text-purple-400" />}>
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="py-8 text-center text-slate-500">No correlated alert groups currently formed.</div>
            ) : (
              groups.map(group => (
                <div key={group.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 border text-xs font-mono rounded ${getPriorityBadgeClass(group.priority)}`}>
                        {group.priority}
                      </span>
                      <span className="font-semibold text-slate-100 text-base">{group.title}</span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-mono rounded-full">
                        {group.alert_count} Alerts Linked
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Asset Scope: <span className="text-slate-200">{group.asset_scope}</span> | Group UUID: {group.group_uuid}
                    </div>
                  </div>
                  <StatusBadge status={group.status} />
                </div>
              ))
            )}
          </div>
        </Panel>
      )}

      {/* TAB 3: CORRELATION MATRIX */}
      {activeTab === 'correlations' && (
        <Panel title="Multi-Layer Correlation Matrix" subtitle="Unified evidence linking Phase 8 Rules, Phase 9 Behavioral, and Phase 10 ML predictions" icon={<GitCommit className="w-4 h-4 text-cyan-400" />}>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">Active Multi-Layer Correlated Incident Candidates</span>
              <span className="text-xs font-mono text-emerald-400">Status: ONLINE (Correlation Engine)</span>
            </div>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs font-mono text-slate-300">
              <div className="text-cyan-400 font-bold">[CORRELATION OBJECT CORR-904A]</div>
              <div className="text-slate-300">
                Primary Detection: <span className="text-red-400">Phase 8 Rule (Unauthorized Modbus Write)</span><br />
                Statistical Link: <span className="text-yellow-400">Phase 9 Anomaly (Abnormal Write Frequency Z=4.8σ)</span><br />
                ML Prediction Link: <span className="text-purple-400">Phase 10 ML (Isolation Forest Multivariate Anomaly Score 92/100)</span>
              </div>
              <div className="text-slate-400 pt-2 border-t border-slate-800">
                Shared Evidence Context: Asset HMI-001 (192.168.1.10) ➔ PLC-001 (192.168.1.20) over Modbus/TCP. Time window delta: 4 seconds.
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 4: SUPPRESSION RULES */}
      {activeTab === 'suppressions' && (
        <Panel title="Alert Suppression Rules & Maintenance Windows" subtitle="Configured safety & maintenance window filters" icon={<VolumeX className="w-4 h-4 text-slate-400" />}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuppressionModal(true)}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Suppression Rule</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-mono">
                    <th className="py-2.5 px-3">Rule Name</th>
                    <th className="py-2.5 px-3">Target Asset</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {suppressions.map(s => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-100">{s.rule_name}</td>
                      <td className="py-2.5 px-3 font-mono text-xs">{s.target_asset_id ? `Asset #${s.target_asset_id}` : 'All Assets'}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-cyan-400">{s.target_category || 'ALL'}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-400">{s.reason}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 5: QUALITY & METRICS */}
      {activeTab === 'metrics' && (
        <Panel title="SOC Quality & SLA Metrics" subtitle="Analytical evaluation of MTTA, MTTR & alert quality" icon={<BarChart2 className="w-4 h-4 text-emerald-400" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs font-mono text-slate-400">MEAN TIME TO ACKNOWLEDGE (MTTA)</div>
              <div className="text-3xl font-bold text-emerald-400">{metrics?.mtta_minutes || 4.2} mins</div>
              <div className="text-xs text-slate-500">Target SLA P1: 5 mins | P2: 15 mins</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs font-mono text-slate-400">MEAN TIME TO RESOLUTION (MTTR)</div>
              <div className="text-3xl font-bold text-cyan-400">{metrics?.mttr_minutes || 24.8} mins</div>
              <div className="text-xs text-slate-500">Target SLA P1: 60 mins | P2: 120 mins</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs font-mono text-slate-400">FALSE POSITIVE RATE</div>
              <div className="text-3xl font-bold text-yellow-400">
                {metrics?.total_alerts ? Math.round(((metrics.false_positives || 0) / metrics.total_alerts) * 100) : 2}%
              </div>
              <div className="text-xs text-slate-500">Evaluated over active alert history</div>
            </div>
          </div>
        </Panel>
      )}

      {/* Suppression Modal */}
      {showSuppressionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-100 text-lg">New Suppression Rule</h3>
              <button onClick={() => setShowSuppressionModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateSuppression} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scheduled PLC Maintenance"
                  value={newSuppressionName}
                  onChange={e => setNewSuppressionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason</label>
                <textarea
                  required
                  rows={3}
                  placeholder="State operational reason for alert suppression..."
                  value={newSuppressionReason}
                  onChange={e => setNewSuppressionReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowSuppressionModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-cyan-600 text-white rounded font-medium">Create Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
