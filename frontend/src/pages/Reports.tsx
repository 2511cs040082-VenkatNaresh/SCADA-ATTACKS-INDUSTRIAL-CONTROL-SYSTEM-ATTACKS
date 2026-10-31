import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  FlaskConical,
  Filter,
  RefreshCw,
  Eye,
  FileCheck,
  Send,
  Lock,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { StatusBadge } from '../components/common/StatusBadge';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const REPORT_TYPE_LABELS: Record<string, string> = {
  EXECUTIVE_SECURITY_SUMMARY: 'Executive Security Summary',
  SOC_OPERATIONS_REPORT: 'SOC Operations Report',
  INCIDENT_REPORT: 'Incident Investigation Report',
  ALERT_ANALYTICS_REPORT: 'Alert Analytics & SLA Report',
  DETECTION_EFFECTIVENESS_REPORT: 'Detection Engine Effectiveness',
  ASSET_HEALTH_REPORT: 'Asset Inventory & Health Report',
  ASSET_RISK_REPORT: 'Asset Security Risk Report',
  NETWORK_ACTIVITY_REPORT: 'Network Activity & Session Report',
  PROTOCOL_ACTIVITY_REPORT: 'Industrial Protocol Transaction Report',
  PROCESS_HEALTH_REPORT: 'SCADA Process Telemetry Report',
  MITRE_COVERAGE_REPORT: 'MITRE ATT&CK for ICS Coverage Report',
  RESPONSE_EFFECTIVENESS_REPORT: 'Response Playbook Effectiveness',
  SIMULATION_VALIDATION_REPORT: 'Attack Simulation Validation Report',
  ML_ANALYTICS_REPORT: 'Machine Learning Model Analytics',
  SYSTEM_HEALTH_REPORT: 'System Health & Pipeline Audit',
  CUSTOM_SECURITY_REPORT: 'Custom Security Report',
};

export const Reports: React.FC = () => {
  const { role, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'create' | 'schedules' | 'exports'>('library');

  const [loading, setLoading] = useState<boolean>(true);
  const [reports, setReports] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [previewModal, setPreviewModal] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Form State for Report Generation
  const [reportTitle, setReportTitle] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('EXECUTIVE_SECURITY_SUMMARY');
  const [selectedFormat, setSelectedFormat] = useState<string>('PDF');
  const [selectedEnv, setSelectedEnv] = useState<string>('LAB');

  // Filter State
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterEnv, setFilterEnv] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, schedRes] = await Promise.all([
        apiService.getReports().catch(() => null),
        apiService.getReportSchedules().catch(() => null),
      ]);

      if (reportsRes && reportsRes.data) setReports(reportsRes.data);
      if (schedRes && schedRes.data) setSchedules(schedRes.data);
    } catch (err) {
      console.error('Failed to load reporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiService.createReport({
        title: reportTitle || REPORT_TYPE_LABELS[selectedType],
        report_type: selectedType,
        format: selectedFormat,
        environment: selectedEnv,
      });

      setMsg(`Report '${res.data.report_number}' generated successfully.`);
      setSelectedReport(res.data);
      setActiveTab('library');
      await loadData();
    } catch (err: any) {
      setMsg(`Report Generation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportId: string | number, format: string) => {
    try {
      const res = await apiService.exportReport(reportId, format);
      setMsg(`Exported report in ${format} format. Hash: ${res.data.sha256_hash?.substring(0, 16)}...`);
    } catch (err: any) {
      setMsg(`Export failed: ${err.message}`);
    }
  };

  const filteredReports = reports.filter((r) => {
    const matchType = filterType === 'ALL' || r.report_type === filterType;
    const matchEnv = filterEnv === 'ALL' || r.environment === filterEnv;
    return matchType && matchEnv;
  });

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Security Audit & Compliance Reporting Subsystem"
        description="Automated SOC Executive Summaries, Incident Audits, MITRE Coverage Reports & Simulation Validation Artifacts"
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('create')}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Report</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-slate-900 border border-slate-700 text-slate-300 rounded hover:bg-slate-800 transition"
              title="Refresh Reports List"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        }
      />

      {msg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs rounded flex justify-between items-center">
          <span>✓ {msg}</span>
          <button onClick={() => setMsg(null)} className="text-emerald-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-soc-panelBorder space-x-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('library')}
          className={`pb-2.5 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'library'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Report Library ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`pb-2.5 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'create'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create / Generate Report</span>
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`pb-2.5 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'schedules'
              ? 'border-cyan-400 text-cyan-400 font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Reports ({schedules.length})</span>
        </button>
      </div>

      {/* TAB 1: REPORT LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-4 font-mono text-xs">
          {/* Filters Bar */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400 font-bold flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Filters:</span>
              </span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Report Types (16 Types)</option>
                {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <select
                value={filterEnv}
                onChange={(e) => setFilterEnv(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Environments</option>
                <option value="LIVE">LIVE</option>
                <option value="LAB">LAB</option>
                <option value="SIMULATION">SIMULATION</option>
              </select>
            </div>
            <span className="text-slate-500 text-[11px]">Showing {filteredReports.length} reports</span>
          </div>

          {/* Reports Portfolio List */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-900/60 border border-slate-800 rounded-lg">
                No generated security reports match current filters.
              </div>
            ) : (
              filteredReports.map((r) => {
                const isSim = r.environment === 'SIMULATION' || r.report_type === 'SIMULATION_VALIDATION_REPORT';

                return (
                  <div
                    key={r.id || r.report_uuid}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-cyan-400 text-sm">{r.report_number}</span>
                          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-300 font-bold rounded text-[10px] uppercase">
                            {r.format || 'PDF'}
                          </span>
                          {isSim ? (
                            <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 font-bold rounded text-[10px] flex items-center space-x-1">
                              <FlaskConical className="w-3 h-3 text-amber-400" />
                              <span>🧪 SIMULATION / LAB DATA</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold rounded text-[10px]">
                              🟢 LAB TELEMETRY
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-100 text-sm">{r.title}</h3>
                        <p className="text-slate-400 text-[11px]">
                          {REPORT_TYPE_LABELS[r.report_type] || r.report_type} — Generated by{' '}
                          <strong className="text-slate-200">{r.created_by_username || 'soc_analyst'}</strong> on{' '}
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setPreviewModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleExport(r.id, 'PDF')}
                          className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold rounded flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleExport(r.id, 'CSV')}
                          className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded font-bold"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => handleExport(r.id, 'JSON')}
                          className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded font-bold"
                        >
                          JSON
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE / GENERATE REPORT */}
      {activeTab === 'create' && (
        <Panel
          title="Security & Compliance Report Generator"
          subtitle="Generate verifiable audit artifacts from backend database telemetry"
          icon={<Plus className="w-4 h-4 text-cyan-400" />}
        >
          <form onSubmit={handleGenerateReport} className="space-y-5 font-mono text-xs max-w-3xl">
            <div>
              <label className="block text-slate-400 uppercase font-bold mb-1">Report Title</label>
              <input
                type="text"
                placeholder="e.g. Q3 SCADA Executive Threat Summary"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Report Category / Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Export Format</label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="PDF">PDF Document (.pdf / .html)</option>
                  <option value="CSV">Comma Separated Values (.csv)</option>
                  <option value="JSON">Raw JSON Artifact (.json)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 uppercase font-bold mb-1">Target Environment Scope</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEnv('LAB')}
                  className={`p-2.5 rounded border text-center font-bold ${
                    selectedEnv === 'LAB'
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🟡 LAB (DEFAULT)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEnv('SIMULATION')}
                  className={`p-2.5 rounded border text-center font-bold ${
                    selectedEnv === 'SIMULATION'
                      ? 'bg-amber-950 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🧪 SIMULATION
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEnv('LIVE')}
                  className={`p-2.5 rounded border text-center font-bold ${
                    selectedEnv === 'LIVE'
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  🟢 LIVE
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded flex items-center space-x-2 transition"
              >
                <FileCheck className="w-4 h-4" />
                <span>GENERATE REPORT ARTIFACT</span>
              </button>
            </div>
          </form>
        </Panel>
      )}

      {/* TAB 3: SCHEDULED REPORTS */}
      {activeTab === 'schedules' && (
        <Panel
          title="Automated Report Scheduling Manager"
          subtitle="Configure recurring automated PDF report generation (Daily, Weekly, Monthly)"
          icon={<Calendar className="w-4 h-4 text-purple-400" />}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-3">
              {schedules.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No active automated report schedules configured.</div>
              ) : (
                schedules.map((s) => (
                  <div key={s.id || s.schedule_uuid} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{s.title}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Frequency: <strong className="text-purple-400">{s.frequency}</strong> • Format: {s.export_format} • Next Run: {s.next_run_at || 'Scheduled'}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold rounded">
                      ACTIVE SCHEDULE
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Panel>
      )}

      {/* REPORT PREVIEW MODAL */}
      {previewModal && selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-cyan-400 text-sm">{selectedReport.report_number}</span>
                <h3 className="font-bold text-slate-100">{selectedReport.title}</h3>
              </div>
              <button onClick={() => setPreviewModal(false)} className="p-1 text-slate-400 hover:text-slate-100">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-slate-950 text-slate-300">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] flex justify-between">
                <div>Environment: <strong className="text-cyan-400">{selectedReport.environment}</strong></div>
                <div>Format: <strong>{selectedReport.format}</strong></div>
                <div>Hash: <strong className="text-emerald-400">{selectedReport.report_uuid?.substring(0, 16)}</strong></div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded space-y-2">
                <span className="text-cyan-400 font-bold block">Executive Summary & Definition JSON:</span>
                <pre className="p-3 bg-slate-950 rounded text-slate-300 text-[10px] overflow-x-auto">
                  {JSON.stringify(selectedReport.definition_json || selectedReport, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end space-x-2">
              <button onClick={() => handleExport(selectedReport.id, 'PDF')} className="px-3 py-1.5 bg-cyan-600 text-white rounded font-bold">
                Export PDF
              </button>
              <button onClick={() => setPreviewModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
