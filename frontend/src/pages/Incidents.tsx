import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch,
  ShieldAlert,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  UserPlus,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  FileText,
  GitCommit
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useWebSocket } from '../context/WebSocketContext';
import { apiService } from '../services/api';

interface IncidentItem {
  id: number;
  incident_number: string;
  incident_uuid: string;
  title: string;
  description: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: string;
  confidence: number;
  source: string;
  creator?: string;
  assignee?: string;
  first_seen: string;
  last_seen: string;
  created_at: string;
}

export const Incidents: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useWebSocket();

  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('UNAUTHORIZED_ACTIVITY');
  const [newSeverity, setNewSeverity] = useState<string>('HIGH');
  const [newPriority, setNewPriority] = useState<string>('P2');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incRes, metricsRes, healthRes] = await Promise.all([
        apiService.getIncidents({
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          search: search || undefined,
          limit: 100
        }),
        apiService.getIncidentMetrics(),
        apiService.getIncidentHealth()
      ]);

      setIncidents(incRes.data || []);
      setMetrics(metricsRes.data || null);
      setHealth(healthRes.data || null);
    } catch (err) {
      console.error('Failed to fetch incident cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [severityFilter, priorityFilter, statusFilter, categoryFilter]);

  // Real-Time WebSocket Updates
  useEffect(() => {
    if (events.length > 0) {
      fetchData();
    }
  }, [events]);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    try {
      const res = await apiService.createIncident({
        title: newTitle,
        description: newDescription,
        category: newCategory,
        severity: newSeverity,
        priority: newPriority
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      fetchData();
      if (res && res.data && res.data.id) {
        navigate(`/incidents/${res.data.id}`);
      }
    } catch (err) {
      console.error('Create incident case failed:', err);
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

  const filteredIncidents = incidents.filter(i => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.incident_number.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="INCIDENT INVESTIGATION & CASE MANAGEMENT"
        description="Centralized Cyber-Physical Incident Case Workspace, Forensic Evidence Collection & Investigation Timeline"
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
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg text-sm flex items-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Incident Case</span>
            </button>
          </div>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3.5">
        <MetricCard
          title="TOTAL CASES"
          value={metrics?.total_incidents || 0}
          icon={<FileSearch className="w-5 h-5 text-cyan-400" />}
        />
        <MetricCard
          title="OPEN CASES"
          value={metrics?.open_incidents || 0}
          icon={<Activity className="w-5 h-5 text-yellow-400" />}
        />
        <MetricCard
          title="INVESTIGATING"
          value={metrics?.investigating_incidents || 0}
          icon={<Clock className="w-5 h-5 text-purple-400" />}
        />
        <MetricCard
          title="CRITICAL"
          value={metrics?.critical_incidents || 0}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        />
        <MetricCard
          title="P1 IMMEDIATE"
          value={metrics?.p1_incidents || 0}
          icon={<ArrowUpRight className="w-5 h-5 text-red-400" />}
        />
        <MetricCard
          title="UNASSIGNED"
          value={metrics?.unassigned_incidents || 0}
          icon={<UserPlus className="w-5 h-5 text-slate-400" />}
        />
        <MetricCard
          title="RESOLVED"
          value={metrics?.resolved_incidents || 0}
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Controls & Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search incident number (INC-2026-000001), title or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
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
            <option value="TRIAGED">Triaged</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="CONTAINMENT_RECOMMENDED">Containment Recommended</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Category: All</option>
            <option value="UNAUTHORIZED_ACTIVITY">Unauthorized Activity</option>
            <option value="PROTOCOL_ANOMALY">Protocol Anomaly</option>
            <option value="NETWORK_ANOMALY">Network Anomaly</option>
            <option value="PROCESS_ANOMALY">Process Anomaly</option>
          </select>
        </div>
      </div>

      {/* Incident Cases Table */}
      <Panel title="Active Incident Investigation Cases" subtitle="Escalated Cyber-Physical Case Portfolio" icon={<FileSearch className="w-4 h-4 text-cyan-400" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs uppercase font-mono">
                <th className="py-3 px-3">Incident #</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Case Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Lead Investigator</th>
                <th className="py-3 px-3">First Seen</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No active incident cases matching current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-cyan-400">{inc.incident_number}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 border text-xs font-mono rounded ${getPriorityBadgeClass(inc.priority)}`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[320px]">
                      <div className="font-semibold text-slate-100 truncate cursor-pointer hover:text-cyan-400 transition" onClick={() => navigate(`/incidents/${inc.id}`)}>
                        {inc.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{inc.description}</div>
                    </td>
                    <td className="py-3 px-3 text-xs font-mono text-slate-300">{inc.category}</td>
                    <td className="py-3 px-3"><StatusBadge status={inc.status} /></td>
                    <td className="py-3 px-3 text-xs text-slate-400">{inc.assignee || 'Unassigned'}</td>
                    <td className="py-3 px-3 text-xs font-mono text-slate-400">{new Date(inc.first_seen || inc.created_at).toLocaleTimeString()}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded text-xs font-medium flex items-center space-x-1 ml-auto transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Investigate Case</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-100 text-lg">Create New Incident Case</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateIncident} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unauthorized Coil Override on Primary PLC"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Enter initial investigation summary..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="UNAUTHORIZED_ACTIVITY">Unauthorized Activity</option>
                    <option value="PROTOCOL_ANOMALY">Protocol Anomaly</option>
                    <option value="NETWORK_ANOMALY">Network Anomaly</option>
                    <option value="PROCESS_ANOMALY">Process Anomaly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200"
                  >
                    <option value="P1">P1 Immediate</option>
                    <option value="P2">P2 High</option>
                    <option value="P3">P3 Standard</option>
                    <option value="P4">P4 Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-cyan-600 text-white rounded font-medium">Create Case</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
