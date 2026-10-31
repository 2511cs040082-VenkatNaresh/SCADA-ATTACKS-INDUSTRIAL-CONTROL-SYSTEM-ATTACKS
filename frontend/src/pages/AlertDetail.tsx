import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  UserPlus,
  ArrowUpRight,
  VolumeX,
  Clock,
  Activity,
  GitCommit,
  FileText,
  MessageSquare,
  Server,
  Layers,
  Send,
  HelpCircle
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { StatusBadge } from '../components/common/StatusBadge';
import { apiService } from '../services/api';

export const AlertDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [alert, setAlert] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [newNote, setNewNote] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'evidence' | 'correlations' | 'notes'>('summary');

  const fetchAlertDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [alertRes, timelineRes, evidenceRes, historyRes] = await Promise.all([
        apiService.getAlertById(id),
        apiService.getAlertTimeline(id),
        apiService.getAlertEvidence(id),
        apiService.getAlertHistory(id)
      ]);

      setAlert(alertRes.data || null);
      setTimeline(timelineRes.data || []);
      setEvidence(evidenceRes.data || null);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Failed to fetch alert detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertDetail();
  }, [id]);

  const handleStatusChange = async (targetStatus: string, reason?: string) => {
    if (!id) return;
    try {
      await apiService.updateAlertStatus(id, targetStatus, reason || `Analyst status change to ${targetStatus}`);
      fetchAlertDetail();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleEscalate = async () => {
    if (!id) return;
    const targetPriority = alert.priority === 'P3' ? 'P2' : 'P1';
    try {
      await apiService.escalateAlert(id, targetPriority, `Escalated alert priority to ${targetPriority}`);
      fetchAlertDetail();
    } catch (err) {
      console.error('Failed to escalate priority:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    try {
      await apiService.addAlertNote(id, newNote);
      setNewNote('');
      fetchAlertDetail();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
        <span>Loading Alert Details...</span>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <div className="text-slate-200 text-lg font-bold">Alert Not Found</div>
        <button onClick={() => navigate('/alerts')} className="px-4 py-2 bg-slate-800 text-slate-200 rounded">
          Back to Alerts Console
        </button>
      </div>
    );
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500/20 text-red-400 border-red-500/40 font-bold';
      case 'P2': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'P3': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
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

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/alerts')}
        className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Alert Operations</span>
      </button>

      {/* Alert Header Summary Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-0.5 border text-xs font-mono rounded ${getPriorityBadgeClass(alert.priority)}`}>
                {alert.priority}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${getSeverityBadgeClass(alert.severity)}`}>
                {alert.severity}
              </span>
              <StatusBadge status={alert.status} />
              <span className="text-xs font-mono text-slate-500">ID #{alert.id}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100">{alert.title}</h1>
            <p className="text-sm text-slate-400">{alert.description}</p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {alert.status === 'NEW' && (
              <button
                onClick={() => handleStatusChange('ACKNOWLEDGED')}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold rounded text-xs transition"
              >
                Acknowledge Alert
              </button>
            )}
            {alert.status !== 'RESOLVED' && alert.status !== 'CLOSED' && (
              <>
                <button
                  onClick={handleEscalate}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded text-xs flex items-center space-x-1 transition"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Escalate Priority</span>
                </button>
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs flex items-center space-x-1 transition"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
                <button
                  onClick={() => handleStatusChange('FALSE_POSITIVE')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs transition"
                >
                  False Positive
                </button>
              </>
            )}
          </div>
        </div>

        {/* Metadata Details Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">SOURCE TYPE</span>
            <span className="font-mono text-cyan-400">{alert.source_type}</span>
          </div>
          <div>
            <span className="text-slate-500 block">PROTOCOL</span>
            <span className="font-mono text-slate-200">{alert.protocol || 'MODBUS_TCP'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">CONFIDENCE</span>
            <span className="font-mono text-emerald-400">{Math.round((alert.confidence || 0.85) * 100)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">OCCURRENCES</span>
            <span className="font-mono text-slate-200">{alert.occurrence_count || 1}</span>
          </div>
          <div>
            <span className="text-slate-500 block">FIRST SEEN</span>
            <span className="font-mono text-slate-300">{new Date(alert.first_seen || alert.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Detail Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'summary' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Asset & Context</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'timeline' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chronological Timeline ({timeline.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'evidence' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Evidence Collection</span>
        </button>
        <button
          onClick={() => setActiveTab('correlations')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'correlations' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Correlations</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'notes' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Analyst Notes & Audit</span>
        </button>
      </div>

      {/* TAB 1: ASSET & CONTEXT */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Panel title="Source Asset Context" subtitle="Originating device details" icon={<Server className="w-4 h-4 text-cyan-400" />}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Asset Name</span>
                <span className="font-semibold text-slate-100">{alert.source_asset_name || `Asset #${alert.source_asset_id || 1}`}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">IP Address</span>
                <span className="font-mono text-cyan-400">{alert.source_ip || '192.168.1.10'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Zone</span>
                <span className="font-mono text-slate-200">{alert.source_zone || 'CONTROL_ZONE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Criticality</span>
                <span className="font-bold text-red-400">{alert.source_criticality || 'HIGH'}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Destination Asset Context" subtitle="Target device details" icon={<Server className="w-4 h-4 text-purple-400" />}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Asset Name</span>
                <span className="font-semibold text-slate-100">{alert.destination_asset_name || `Asset #${alert.destination_asset_id || 2}`}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">IP Address</span>
                <span className="font-mono text-cyan-400">{alert.destination_ip || '192.168.1.20'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Zone</span>
                <span className="font-mono text-slate-200">{alert.destination_zone || 'FIELD_BUS_ZONE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Criticality</span>
                <span className="font-bold text-orange-400">{alert.destination_criticality || 'HIGH'}</span>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: CHRONOLOGICAL TIMELINE */}
      {activeTab === 'timeline' && (
        <Panel title="Chronological Event Timeline" subtitle="Detection, Alert creation and Analyst workflow history" icon={<Clock className="w-4 h-4 text-cyan-400" />}>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative flex items-start space-x-4 pl-8">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-cyan-400">{item.stage}</span>
                    <span className="text-xs text-slate-500 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-slate-200">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* TAB 3: EVIDENCE COLLECTION */}
      {activeTab === 'evidence' && (
        <Panel title="Evidence Collection & Payload Inspector" subtitle="Originating telemetry, rule match parameters and ML feature inputs" icon={<FileText className="w-4 h-4 text-emerald-400" />}>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto">
            <pre>{JSON.stringify(evidence || alert.evidence_json, null, 2)}</pre>
          </div>
        </Panel>
      )}

      {/* TAB 4: CORRELATIONS */}
      {activeTab === 'correlations' && (
        <Panel title="Multi-Layer Alert Correlations" subtitle="Shared asset, protocol, and time-window correlation links" icon={<GitCommit className="w-4 h-4 text-purple-400" />}>
          <div className="space-y-3">
            {evidence?.correlations?.length > 0 ? (
              evidence.correlations.map((corr: any) => (
                <div key={corr.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-cyan-400 font-bold">{corr.correlation_type}</span>
                    <span className="text-purple-400">Strength: {Math.round(corr.strength * 100)}%</span>
                  </div>
                  <div className="text-sm text-slate-300">{corr.explanation}</div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-500 text-sm">No secondary correlations linked to this single alert.</div>
            )}
          </div>
        </Panel>
      )}

      {/* TAB 5: ANALYST NOTES & AUDIT */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Append-only note submitter */}
          <Panel title="Add Analyst Note" subtitle="Append investigation notes to alert audit record" icon={<MessageSquare className="w-4 h-4 text-cyan-400" />}>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                required
                placeholder="Enter investigation observation, PLC register check result, or triage decision..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end">
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg flex items-center space-x-2 transition">
                  <Send className="w-4 h-4" />
                  <span>Submit Note</span>
                </button>
              </div>
            </form>
          </Panel>

          {/* Audit Log History */}
          <Panel title="Alert History Audit Log" subtitle="Complete state machine change history" icon={<Activity className="w-4 h-4 text-yellow-400" />}>
            <div className="space-y-2 font-mono text-xs">
              {history.map((h, i) => (
                <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center">
                  <div>
                    <span className="text-slate-400">{new Date(h.created_at).toLocaleString()}</span> —{' '}
                    <span className="text-yellow-400 font-bold">{h.old_status || 'INITIAL'} ➔ {h.new_status}</span> by {h.changed_by_username || 'SOC Analyst'}
                  </div>
                  <div className="text-slate-500">{h.change_reason}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
};
