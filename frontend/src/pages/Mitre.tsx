import React, { useState, useEffect } from 'react';
import {
  Shield,
  Grid,
  Layers,
  CheckCircle,
  AlertTriangle,
  FileCode,
  Database,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Plus,
  ArrowRight,
  Info,
  Lock,
  GitBranch
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { apiService } from '../services/api';

export const Mitre: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'workbench' | 'coverage' | 'versions'>('matrix');
  const [loading, setLoading] = useState<boolean>(true);
  const [coverageData, setCoverageData] = useState<any>(null);
  const [mappings, setMappings] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);
  const [targetMapping, setTargetMapping] = useState<any | null>(null);
  const [evidencePayload, setEvidencePayload] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [covRes, mapRes, verRes] = await Promise.all([
        apiService.getMitreCoverage().catch(() => null),
        apiService.getMitreMappings().catch(() => null),
        apiService.getMitreVersions().catch(() => null)
      ]);

      if (covRes && covRes.data) setCoverageData(covRes.data);
      if (mapRes && mapRes.data) setMappings(mapRes.data);
      if (verRes && verRes.data) setVersions(verRes.data);
    } catch (err) {
      console.warn('Failed to load MITRE data from API, using default views:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (uuid: string, newStatus: string) => {
    try {
      await apiService.updateMitreMappingStatus(uuid, newStatus, 'HIGH', 'Analyst updated mapping in workbench');
      await loadData();
    } catch (err) {
      console.error('Failed to update mapping status:', err);
    }
  };

  const handleAddEvidence = async () => {
    if (!targetMapping || !evidencePayload) return;
    try {
      await apiService.addMitreEvidence(targetMapping.source_type, targetMapping.source_id, {
        evidence_type: 'TELEMETRY_PACKET',
        description: 'Analyst manual SHA-256 evidence attachment',
        raw_payload: evidencePayload
      });
      setShowEvidenceModal(false);
      setEvidencePayload('');
      setTargetMapping(null);
      await loadData();
    } catch (err) {
      console.error('Failed to attach evidence:', err);
    }
  };

  const handleActivateVersion = async (versionId: number) => {
    try {
      await apiService.activateMitreVersion(versionId);
      await loadData();
    } catch (err) {
      console.error('Failed to activate version:', err);
    }
  };

  const tacticBreakdown = coverageData?.tactic_breakdown || [
    {
      tactic_id: 'TA0108',
      name: 'Initial Access',
      mapped_techniques: 1,
      total_techniques: 2,
      coverage_percent: 50,
      techniques: [{ external_id: 'T0815', name: 'Exploitation of Remote Services', status: 'SUGGESTED', sources: ['ALERT'] }]
    },
    {
      tactic_id: 'TA0104',
      name: 'Execution',
      mapped_techniques: 2,
      total_techniques: 3,
      coverage_percent: 67,
      techniques: [
        { external_id: 'T0855', name: 'Unauthorized Command Message', status: 'CONFIRMED', sources: ['RULE_DETECTION', 'ALERT'] },
        { external_id: 'T0807', name: 'Command-Line Interface', status: 'SUGGESTED', sources: ['BEHAVIORAL_ANOMALY'] }
      ]
    },
    {
      tactic_id: 'TA0110',
      name: 'Lateral Movement',
      mapped_techniques: 2,
      total_techniques: 3,
      coverage_percent: 67,
      techniques: [
        { external_id: 'T0886', name: 'Remote Services (Protocol Abuse)', status: 'CONFIRMED', sources: ['ML_ANOMALY'] },
        { external_id: 'T0812', name: 'Dual Use Network Interface', status: 'UNMAPPED', sources: [] }
      ]
    },
    {
      tactic_id: 'TA0102',
      name: 'Impair Process Control',
      mapped_techniques: 3,
      total_techniques: 3,
      coverage_percent: 100,
      techniques: [
        { external_id: 'T0831', name: 'Manipulate Control Logic', status: 'CONFIRMED', sources: ['INCIDENT'] },
        { external_id: 'T0836', name: 'Modify Parameter', status: 'CONFIRMED', sources: ['BEHAVIORAL_ANOMALY'] },
        { external_id: 'T0843', name: 'Program Download', status: 'CONFIRMED', sources: ['RULE_DETECTION'] }
      ]
    },
    {
      tactic_id: 'TA0101',
      name: 'Impact',
      mapped_techniques: 2,
      total_techniques: 3,
      coverage_percent: 67,
      techniques: [
        { external_id: 'T0814', name: 'Denial of Service', status: 'CONFIRMED', sources: ['ALERT'] },
        { external_id: 'T0826', name: 'Loss of Availability', status: 'SUGGESTED', sources: ['ALERT'] }
      ]
    }
  ];

  const tacticSummary = coverageData?.tactic_summary || { total_tactics: 11, covered_tactics: 8, coverage_percent: 73 };
  const techniqueSummary = coverageData?.technique_summary || { total_techniques: 21, confirmed: 8, suggested: 5, unmapped: 8 };
  const sourceDist = coverageData?.source_distribution || { RULE_DETECTION: 12, BEHAVIORAL_ANOMALY: 6, ML_ANOMALY: 4, ALERT: 9, INCIDENT: 3 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="MITRE ATT&CK for ICS Matrix & Mapping Workbench"
        description="Versioned Threat Tactics, Multi-Source Technique Association & Analyst Mapping Workflow"
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="flex items-center space-x-1 px-3 py-1.5 bg-soc-bg font-mono text-xs text-soc-textMuted border border-soc-panelBorder rounded hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Matrix</span>
            </button>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Tactics Coverage"
          value={`${tacticSummary.covered_tactics} / ${tacticSummary.total_tactics}`}
          subtitle={`${tacticSummary.coverage_percent}% Tactics Associated`}
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Confirmed Techniques"
          value={techniqueSummary.confirmed}
          subtitle="Analyst Validated"
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Suggested Mappings"
          value={techniqueSummary.suggested}
          subtitle="Pending Review"
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        />
        <MetricCard
          title="Active Framework"
          value="v14.1 ICS"
          subtitle="Official MITRE ATT&CK"
          icon={<GitBranch className="w-5 h-5 text-sky-400" />}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-soc-panelBorder space-x-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>ATT&CK Matrix Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('workbench')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'workbench'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mapping Workbench ({mappings.length || 5})</span>
        </button>

        <button
          onClick={() => setActiveTab('coverage')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'coverage'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Coverage Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'versions'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Dataset Versions</span>
        </button>
      </div>

      {/* TAB 1: ATT&CK MATRIX GRID */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-soc-textMuted">Search Technique:</span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-soc-textMuted" />
                <input
                  type="text"
                  placeholder="e.g. T0855 or Modbus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-soc-bg border border-soc-panelBorder rounded pl-8 pr-3 py-1 text-xs text-white placeholder-soc-textMuted focus:outline-none focus:border-soc-accent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 text-[11px] font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-soc-textMuted">Confirmed ({techniqueSummary.confirmed})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-soc-textMuted">Suggested ({techniqueSummary.suggested})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                <span className="text-soc-textMuted">Unmapped ({techniqueSummary.unmapped})</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 font-mono text-xs">
            {tacticBreakdown.map((tactic: any) => (
              <div key={tactic.tactic_id} className="bg-soc-panelBg border border-soc-panelBorder rounded p-3 flex flex-col space-y-3">
                <div className="border-b border-soc-panelBorder pb-2">
                  <div className="text-soc-accent font-bold text-[11px]">{tactic.tactic_id}</div>
                  <div className="text-white font-semibold text-xs truncate">{tactic.name}</div>
                  <div className="flex justify-between items-center text-[10px] text-soc-textMuted mt-1">
                    <span>Coverage</span>
                    <span className="text-emerald-400 font-bold">{tactic.coverage_percent}%</span>
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  {tactic.techniques
                    .filter((tech: any) =>
                      !searchQuery ||
                      tech.external_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      tech.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((tech: any) => (
                      <div
                        key={tech.external_id}
                        onClick={() => setSelectedTechnique(tech)}
                        className={`p-2 rounded border cursor-pointer transition-all ${
                          tech.status === 'CONFIRMED'
                            ? 'bg-emerald-950/40 border-emerald-800/80 hover:border-emerald-500'
                            : tech.status === 'SUGGESTED'
                            ? 'bg-amber-950/40 border-amber-800/80 hover:border-amber-500'
                            : 'bg-soc-bg border-soc-panelBorder/60 text-soc-textMuted hover:border-slate-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className={`font-bold text-[11px] ${tech.status !== 'UNMAPPED' ? 'text-white' : 'text-slate-500'}`}>
                            {tech.external_id}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                              tech.status === 'CONFIRMED'
                                ? 'bg-emerald-900 text-emerald-300'
                                : tech.status === 'SUGGESTED'
                                ? 'bg-amber-900 text-amber-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {tech.status}
                          </span>
                        </div>
                        <div className={`text-[10px] line-clamp-2 mt-1 ${tech.status !== 'UNMAPPED' ? 'text-slate-300' : 'text-slate-600'}`}>
                          {tech.name}
                        </div>
                        {tech.sources && tech.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tech.sources.map((src: string) => (
                              <span key={src} className="text-[8px] bg-slate-900 px-1 rounded text-sky-400 border border-sky-900">
                                {src}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MAPPING WORKBENCH */}
      {activeTab === 'workbench' && (
        <Panel title="Multi-Source Technique Mapping Workbench" subtitle="Analyst Control & Validation Pipeline" icon={<Layers className="w-4 h-4 text-soc-accent" />}>
          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center bg-soc-bg p-3 rounded border border-soc-panelBorder">
              <div className="flex items-center space-x-3">
                <span className="text-soc-textMuted">Filter Source:</span>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="bg-soc-panelBg border border-soc-panelBorder rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Sources</option>
                  <option value="RULE_DETECTION">Rule Detection</option>
                  <option value="BEHAVIORAL_ANOMALY">Behavioral Anomaly</option>
                  <option value="ML_ANOMALY">ML Anomaly</option>
                  <option value="ALERT">Alert</option>
                  <option value="INCIDENT">Incident</option>
                </select>
              </div>

              <div className="text-soc-textMuted text-[11px]">
                Showing {mappings.length || 5} active mappings
              </div>
            </div>

            <div className="overflow-x-auto border border-soc-panelBorder rounded">
              <table className="w-full text-left">
                <thead className="bg-soc-bg text-soc-textMuted border-b border-soc-panelBorder uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Source & ID</th>
                    <th className="p-3">ATT&CK Technique</th>
                    <th className="p-3">Tactic</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Reason / Context</th>
                    <th className="p-3 text-right">Analyst Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soc-panelBorder">
                  {(mappings.length > 0 ? mappings : [
                    {
                      mapping_uuid: 'map-alert-001',
                      source_type: 'ALERT',
                      source_id: 101,
                      technique_external_id: 'T0855',
                      technique_name: 'Unauthorized Command Message',
                      tactic_name: 'Execution',
                      mapping_status: 'AUTO_SUGGESTED',
                      confidence: 'HIGH',
                      reason: 'Modbus write coil 0x0004 override attempt detected on PLC-01'
                    },
                    {
                      mapping_uuid: 'map-anom-001',
                      source_type: 'BEHAVIORAL_ANOMALY',
                      source_id: 201,
                      technique_external_id: 'T0836',
                      technique_name: 'Modify Parameter',
                      tactic_name: 'Impair Process Control',
                      mapping_status: 'AUTO_SUGGESTED',
                      confidence: 'MEDIUM',
                      reason: 'Statistical z-score anomaly (>3.8 sigma) in flow setpoint'
                    },
                    {
                      mapping_uuid: 'map-ml-001',
                      source_type: 'ML_ANOMALY',
                      source_id: 301,
                      technique_external_id: 'T0886',
                      technique_name: 'Remote Services (Protocol Abuse)',
                      tactic_name: 'Lateral Movement',
                      mapping_status: 'AUTO_SUGGESTED',
                      confidence: 'HIGH',
                      reason: 'Random Forest model classified high anomaly score (0.94)'
                    },
                    {
                      mapping_uuid: 'map-inc-001',
                      source_type: 'INCIDENT',
                      source_id: 1,
                      technique_external_id: 'T0843',
                      technique_name: 'Program Download',
                      tactic_name: 'Impair Process Control',
                      mapping_status: 'ANALYST_CONFIRMED',
                      confidence: 'HIGH',
                      reason: 'Confirmed unauthorized PLC logic overwrite during Incident INC-2026-000001'
                    }
                  ]).map((m: any) => (
                    <tr key={m.mapping_uuid} className="hover:bg-soc-panelBg/60 transition-colors">
                      <td className="p-3 font-semibold text-sky-400">
                        <span className="text-[10px] text-soc-textMuted block">{m.source_type}</span>
                        #{m.source_id}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-emerald-400">{m.technique_external_id}</span>
                        <span className="text-white block text-[11px]">{m.technique_name}</span>
                      </td>
                      <td className="p-3 text-soc-textMuted">{m.tactic_name || 'Execution'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.mapping_status === 'ANALYST_CONFIRMED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          m.mapping_status === 'ANALYST_REJECTED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {m.mapping_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold ${m.confidence === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {m.confidence}
                        </span>
                      </td>
                      <td className="p-3 text-soc-textMuted text-[11px] max-w-xs truncate">{m.reason}</td>
                      <td className="p-3 text-right space-x-2">
                        {m.mapping_status !== 'ANALYST_CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(m.mapping_uuid, 'ANALYST_CONFIRMED')}
                            className="px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded text-[10px]"
                          >
                            Confirm
                          </button>
                        )}
                        {m.mapping_status !== 'ANALYST_REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(m.mapping_uuid, 'ANALYST_REJECTED')}
                            className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-300 rounded text-[10px]"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          onClick={() => { setTargetMapping(m); setShowEvidenceModal(true); }}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
                        >
                          Attach Evidence
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 3: COVERAGE ANALYTICS */}
      {activeTab === 'coverage' && (
        <div className="space-y-6">
          <Panel title="Descriptive ATT&CK for ICS Coverage Matrix" subtitle="Strictly Evidence-Based Technique Breakdown" icon={<Shield className="w-4 h-4 text-emerald-400" />}>
            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-soc-bg border border-soc-panelBorder rounded flex items-center space-x-3 text-soc-textMuted text-[11px]">
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>
                  Note: Technique coverage indicates associated detection rules and telemetry mappings in the lab environment. It provides descriptive operational visibility and does not represent an artificial security guarantee score.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-soc-bg rounded border border-soc-panelBorder space-y-3">
                  <div className="text-soc-accent font-bold">Detection Source Breakdown</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Rule-Based Detections (Phase 8)</span>
                      <span className="font-bold text-emerald-400">{sourceDist.RULE_DETECTION} mappings</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Behavioral Statistics (Phase 9)</span>
                      <span className="font-bold text-emerald-400">{sourceDist.BEHAVIORAL_ANOMALY} mappings</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Machine Learning Anomaly (Phase 10)</span>
                      <span className="font-bold text-emerald-400">{sourceDist.ML_ANOMALY} mappings</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Active Alerts (Phase 11)</span>
                      <span className="font-bold text-amber-400">{sourceDist.ALERT} mappings</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Active Incidents (Phase 12)</span>
                      <span className="font-bold text-purple-400">{sourceDist.INCIDENT} mappings</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-soc-bg rounded border border-soc-panelBorder space-y-3">
                  <div className="text-soc-accent font-bold">Technique Validation Summary</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Confirmed by SOC Analyst</span>
                      <span className="font-bold text-emerald-400">{techniqueSummary.confirmed} techniques</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Auto-Suggested (Pending Review)</span>
                      <span className="font-bold text-amber-400">{techniqueSummary.suggested} techniques</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-soc-textMuted">Unmapped Techniques</span>
                      <span className="font-bold text-slate-500">{techniqueSummary.unmapped} techniques</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 4: DATASET VERSION MANAGER */}
      {activeTab === 'versions' && (
        <Panel title="ATT&CK Dataset Version Manager" subtitle="Official STIX & Custom Knowledge Base Versions" icon={<Database className="w-4 h-4 text-sky-400" />}>
          <div className="space-y-4 font-mono text-xs">
            <div className="overflow-x-auto border border-soc-panelBorder rounded">
              <table className="w-full text-left">
                <thead className="bg-soc-bg text-soc-textMuted border-b border-soc-panelBorder uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Version</th>
                    <th className="p-3">Dataset Name</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Tactics / Techniques</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soc-panelBorder">
                  {(versions.length > 0 ? versions : [
                    { id: 1, version: 'v14.1', name: 'MITRE ATT&CK for ICS v14.1', source: 'Official MITRE STIX v2.1', tactic_count: 11, technique_count: 21, status: 'ACTIVE' }
                  ]).map((v: any) => (
                    <tr key={v.id} className="hover:bg-soc-panelBg/60 transition-colors">
                      <td className="p-3 font-bold text-sky-400">{v.version}</td>
                      <td className="p-3 text-white font-semibold">{v.name}</td>
                      <td className="p-3 text-soc-textMuted">{v.source}</td>
                      <td className="p-3 text-soc-textMuted">{v.tactic_count} Tactics / {v.technique_count} Techniques</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {v.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleActivateVersion(v.id)}
                            className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded text-[10px]"
                          >
                            Activate Version
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      )}

      {/* TECHNIQUE DETAIL MODAL */}
      {selectedTechnique && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-soc-panelBg border border-soc-panelBorder rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex justify-between items-start border-b border-soc-panelBorder pb-3">
              <div>
                <span className="text-soc-accent font-bold text-sm">{selectedTechnique.external_id}</span>
                <h3 className="text-white font-bold text-base mt-0.5">{selectedTechnique.name}</h3>
              </div>
              <button onClick={() => setSelectedTechnique(null)} className="text-soc-textMuted hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-soc-textMuted text-[10px] block">ASSOCIATED SOURCES</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTechnique.sources?.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 bg-sky-950 text-sky-400 border border-sky-800 rounded text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-soc-textMuted text-[10px] block">FRAMEWORK STATUS</span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded font-bold text-[11px] ${
                  selectedTechnique.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  selectedTechnique.status === 'SUGGESTED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {selectedTechnique.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-soc-panelBorder flex justify-end">
              <button onClick={() => setSelectedTechnique(null)} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded">
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVIDENCE SHA-256 ATTACHMENT MODAL */}
      {showEvidenceModal && targetMapping && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-soc-panelBg border border-soc-panelBorder rounded-lg max-w-md w-full p-5 space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex justify-between items-center border-b border-soc-panelBorder pb-3">
              <h3 className="text-white font-bold text-sm">Attach SHA-256 Telemetry Evidence</h3>
              <button onClick={() => setShowEvidenceModal(false)} className="text-soc-textMuted hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-soc-textMuted block text-[10px]">TARGET MAPPING</span>
                <span className="text-sky-400 font-bold">{targetMapping.technique_external_id} - {targetMapping.technique_name}</span>
              </div>

              <div>
                <span className="text-soc-textMuted block text-[10px] mb-1">RAW PACKET / TELEMETRY PAYLOAD</span>
                <textarea
                  rows={4}
                  value={evidencePayload}
                  onChange={(e) => setEvidencePayload(e.target.value)}
                  placeholder="Paste Modbus/DNP3 raw hex packet or telemetry JSON string to compute SHA-256 evidence hash..."
                  className="w-full bg-soc-bg border border-soc-panelBorder rounded p-2 text-xs text-white placeholder-soc-textMuted focus:outline-none focus:border-soc-accent"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-soc-panelBorder flex justify-end space-x-2">
              <button onClick={() => setShowEvidenceModal(false)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded">
                Cancel
              </button>
              <button onClick={handleAddEvidence} className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded">
                Compute SHA-256 & Attach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
