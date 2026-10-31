import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileSearch,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  XCircle,
  UserPlus,
  ArrowUpRight,
  Shield,
  Clock,
  Activity,
  GitCommit,
  FileText,
  MessageSquare,
  Server,
  Layers,
  Send,
  HelpCircle,
  ListTodo,
  CheckSquare,
  Plus,
  Lock
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { StatusBadge } from '../components/common/StatusBadge';
import { apiService } from '../services/api';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [evidenceStore, setEvidenceStore] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [findings, setFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence' | 'tasks' | 'hypotheses' | 'notes'>('overview');

  // Input Modals / Forms
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>('');
  const [newNoteType, setNewNoteType] = useState<string>('OBSERVATION');

  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');

  const [showHypoModal, setShowHypoModal] = useState<boolean>(false);
  const [newHypoText, setNewHypoText] = useState<string>('');
  const [newHypoFor, setNewHypoFor] = useState<string>('');

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [incRes, timelineRes, evRes, notesRes, tasksRes, hypoRes, findRes] = await Promise.all([
        apiService.getIncidentById(id),
        apiService.getIncidentTimeline(id),
        apiService.getIncidentEvidence(id),
        apiService.getIncidentNotes(id),
        apiService.getIncidentTasks(id),
        apiService.getIncidentHypotheses(id),
        apiService.getIncidentFindings(id)
      ]);

      setIncident(incRes.data || null);
      setTimeline(timelineRes.data || []);
      setEvidenceStore(evRes.data || []);
      setNotes(notesRes.data || []);
      setTasks(tasksRes.data || []);
      setHypotheses(hypoRes.data || []);
      setFindings(findRes.data || []);
    } catch (err) {
      console.error('Failed to fetch incident details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusChange = async (targetStatus: string, reason?: string) => {
    if (!id) return;
    try {
      await apiService.updateIncidentStatus(id, targetStatus, reason || `Analyst transitioned status to ${targetStatus}`);
      fetchDetail();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    try {
      await apiService.addIncidentNote(id, { note: newNote, note_type: newNoteType });
      setNewNote('');
      setShowNoteModal(false);
      fetchDetail();
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newTaskTitle.trim()) return;
    try {
      await apiService.createIncidentTask(id, { title: newTaskTitle, description: newTaskDesc });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setShowTaskModal(false);
      fetchDetail();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleAddHypothesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newHypoText.trim()) return;
    try {
      await apiService.addIncidentHypothesis(id, { hypothesis: newHypoText, evidence_for: newHypoFor });
      setNewHypoText('');
      setNewHypoFor('');
      setShowHypoModal(false);
      fetchDetail();
    } catch (err) {
      console.error('Failed to add hypothesis:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
        <span>Loading Incident Investigation Workspace...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <div className="text-slate-200 text-lg font-bold">Incident Case Not Found</div>
        <button onClick={() => navigate('/incidents')} className="px-4 py-2 bg-slate-800 text-slate-200 rounded">
          Back to Incidents Portfolio
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
        onClick={() => navigate('/incidents')}
        className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Incidents Console</span>
      </button>

      {/* Conceptual Pipeline Progression Banner */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xs text-slate-300">
        <span className="text-slate-500 uppercase tracking-widest font-semibold">Incident Progression Pipeline:</span>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded">1. EVENT</span>
          <span className="text-slate-600">➔</span>
          <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-400 rounded">2. DETECTION</span>
          <span className="text-slate-600">➔</span>
          <span className="px-2 py-0.5 bg-rose-950 border border-rose-800 text-rose-400 rounded">3. ALERT</span>
          <span className="text-slate-600">➔</span>
          <span className="px-2.5 py-0.5 bg-purple-950 border border-purple-600 text-purple-300 rounded font-bold shadow-[0_0_8px_rgba(168,85,247,0.3)]">4. INCIDENT ({incident.incident_number})</span>
        </div>
      </div>

      {/* Incident Case Header Summary Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center space-x-3">
              <span className="font-mono font-bold text-cyan-400 text-base">{incident.incident_number}</span>
              <span className={`px-2.5 py-0.5 border text-xs font-mono rounded ${getPriorityBadgeClass(incident.priority)}`}>
                {incident.priority}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${getSeverityBadgeClass(incident.severity)}`}>
                {incident.severity}
              </span>
              <StatusBadge status={incident.status} />
            </div>
            <h1 className="text-xl font-bold text-slate-100">{incident.title}</h1>
            <p className="text-sm text-slate-400">{incident.description}</p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {incident.status === 'NEW' && (
              <button
                onClick={() => handleStatusChange('TRIAGED')}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-slate-900 font-bold rounded text-xs transition"
              >
                Triage Incident
              </button>
            )}
            {incident.status !== 'CONTAINMENT_RECOMMENDED' && incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
              <button
                onClick={() => handleStatusChange('CONTAINMENT_RECOMMENDED', 'Analyst issued formal containment recommendation')}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded text-xs transition"
              >
                Recommend Containment
              </button>
            )}
            {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
              <button
                onClick={() => handleStatusChange('RESOLVED', 'Incident case investigation completed and resolved')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs flex items-center space-x-1 transition"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Resolve Case</span>
              </button>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">CATEGORY</span>
            <span className="font-mono text-cyan-400">{incident.category}</span>
          </div>
          <div>
            <span className="text-slate-500 block">SOURCE</span>
            <span className="font-mono text-slate-200">{incident.source}</span>
          </div>
          <div>
            <span className="text-slate-500 block">CONFIDENCE</span>
            <span className="font-mono text-emerald-400">{Math.round((incident.confidence || 0.85) * 100)}%</span>
          </div>
          <div>
            <span className="text-slate-500 block">LEAD INVESTIGATOR</span>
            <span className="font-mono text-slate-200">{incident.assignee || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">FIRST SEEN</span>
            <span className="font-mono text-slate-300">{new Date(incident.first_seen || incident.created_at).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'overview' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Case Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'timeline' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Investigation Timeline ({timeline.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'evidence' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>SHA-256 Evidence Store ({evidenceStore.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'tasks' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>Action Tasks ({tasks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('hypotheses')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'hypotheses' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Hypotheses & Findings ({hypotheses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'notes' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Notes & Audit ({notes.length})</span>
        </button>
      </div>

      {/* TAB 1: CASE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Panel title="Root Cause & Impact Assessment" subtitle="Formal investigation summary" icon={<Shield className="w-4 h-4 text-cyan-400" />}>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Root Cause Assessment</span>
                <p className="text-slate-300">{incident.root_cause || 'Investigation active: Root cause assessment in progress by SOC analyst.'}</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
                <span className="text-xs font-mono text-yellow-400 uppercase font-bold">Operational Impact Summary</span>
                <p className="text-slate-300">{incident.impact_summary || 'No direct physical safety or operational downtime observed in laboratory environment.'}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Primary Affected Asset" subtitle="Target device identity" icon={<Server className="w-4 h-4 text-purple-400" />}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Primary PLC</span>
                <span className="font-semibold text-slate-100">PLC-001 (Water Substation)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">IP Address</span>
                <span className="font-mono text-cyan-400">192.168.1.20</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Zone</span>
                <span className="font-mono text-slate-200">FIELD_BUS_ZONE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Process Role</span>
                <span className="font-bold text-red-400">Water Tank Level Actuation</span>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 2: INVESTIGATION TIMELINE */}
      {activeTab === 'timeline' && (
        <Panel title="Chronological Investigation Timeline" subtitle="Correlated Network, Protocol, Telemetry, Alert and Analyst Action Events" icon={<Clock className="w-4 h-4 text-cyan-400" />}>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative flex items-start space-x-4 pl-8">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-500 ring-4 ring-slate-900" />
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-cyan-400">{item.event_type}</span>
                    <span className="text-xs text-slate-500 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* TAB 3: SHA-256 EVIDENCE STORE */}
      {activeTab === 'evidence' && (
        <Panel title="Forensic Evidence Store" subtitle="Cryptographically hashed evidence records" icon={<FileText className="w-4 h-4 text-emerald-400" />}>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-mono">
                    <th className="py-2.5 px-3">Evidence UUID</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">SHA-256 Integrity Hash</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {evidenceStore.map(ev => (
                    <tr key={ev.id}>
                      <td className="py-2.5 px-3 font-mono text-xs text-cyan-400">{ev.evidence_uuid}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-100">{ev.title}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-300">{ev.evidence_type}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-emerald-400 truncate max-w-[200px]">{ev.hash}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={ev.integrity_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 4: TASKS BOARD */}
      {activeTab === 'tasks' && (
        <Panel title="Investigation Action Tasks" subtitle="Action items assigned to investigators" icon={<ListTodo className="w-4 h-4 text-yellow-400" />}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowTaskModal(true)} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Create Investigation Task</span>
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-100 text-sm">{t.title}</span>
                    <p className="text-xs text-slate-400">{t.description}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 5: HYPOTHESES & FINDINGS */}
      {activeTab === 'hypotheses' && (
        <Panel title="Formal Hypotheses & Facts Log" subtitle="Analyst hypotheses and supporting evidence" icon={<HelpCircle className="w-4 h-4 text-purple-400" />}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowHypoModal(true)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Hypothesis</span>
              </button>
            </div>
            <div className="space-y-3">
              {hypotheses.map(h => (
                <div key={h.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100">{h.hypothesis}</span>
                    <StatusBadge status={h.status} />
                  </div>
                  <div className="text-xs text-slate-400">Supporting Evidence: {h.evidence_for || 'None documented yet'}</div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 6: NOTES & AUDIT */}
      {activeTab === 'notes' && (
        <Panel title="Analyst Investigation Notes" subtitle="Append-only notes log" icon={<MessageSquare className="w-4 h-4 text-cyan-400" />}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowNoteModal(true)} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>
            <div className="space-y-2">
              {notes.map(n => (
                <div key={n.id} className="p-3 bg-slate-900 border border-slate-800 rounded text-sm space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="font-bold text-cyan-400">{n.author_username || 'soc_analyst'}</span>
                    <span className="font-mono">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-200">{n.note_text || n.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {/* Create Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-100 text-lg">Add Analyst Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-3 text-sm">
              <textarea
                rows={3}
                required
                placeholder="Enter investigation observation or finding..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-100"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-cyan-600 text-white rounded font-medium">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-100 text-lg">Create Investigation Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-3 text-sm">
              <input
                type="text"
                required
                placeholder="e.g. Inspect Modbus Function Codes"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
              />
              <textarea
                rows={2}
                placeholder="Task description..."
                value={newTaskDesc}
                onChange={e => setNewTaskDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-cyan-600 text-white rounded font-medium">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hypothesis Modal */}
      {showHypoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-100 text-lg">Add Analyst Hypothesis</h3>
              <button onClick={() => setShowHypoModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddHypothesis} className="space-y-3 text-sm">
              <textarea
                rows={3}
                required
                placeholder="e.g. Threat actor injected unauthorized Modbus coil write from compromised workstation"
                value={newHypoText}
                onChange={e => setNewHypoText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-slate-100"
              />
              <input
                type="text"
                placeholder="Supporting evidence (optional)..."
                value={newHypoFor}
                onChange={e => setNewHypoFor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 text-xs"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowHypoModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-purple-600 text-white rounded font-medium">Add Hypothesis</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
