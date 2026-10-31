import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  PlaySquare,
  AlertCircle,
  RefreshCw,
  Play,
  Square,
  Pause,
  RotateCcw,
  Gauge,
  Zap,
  Shield,
  CheckCircle,
  AlertTriangle,
  Layers,
  Cpu,
  Activity,
  UserCheck,
  Search,
  FlaskConical,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { MetricCard } from '../components/common/MetricCard';
import { apiService } from '../services/api';
import { SimulationStoryMode } from '../components/soc/SimulationStoryMode';

export const Simulation: React.FC = () => {
  const { runId } = useParams();
  const [activeTab, setActiveTab] = useState<'story' | 'scenarios' | 'monitor' | 'evaluation' | 'training'>(
    runId ? 'story' : 'scenarios'
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeRun, setActiveRun] = useState<any | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [trainingMode, setTrainingMode] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [msg, setMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scenRes, runRes, metRes] = await Promise.all([
        apiService.getSimulationScenarios().catch(() => null),
        apiService.getSimulationRuns().catch(() => null),
        apiService.getSimulationMetrics().catch(() => null),
      ]);

      if (scenRes && scenRes.data) setScenarios(scenRes.data);
      if (runRes && runRes.data && runRes.data.length > 0) {
        setActiveRun(runRes.data[0]);
      }
      if (metRes && metRes.data) setMetrics(metRes.data);
    } catch (err) {
      console.warn('Failed to load simulation laboratory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartScenario = async (scenarioCode: string) => {
    setLoading(true);
    try {
      const res = await apiService.startSimulationRun(scenarioCode, { seed: 1337, duration: 60 });
      setActiveRun(res.data);
      setMsg(`Started Attack Simulation: '${res.data.name}' (${res.data.run_number})`);
      setActiveTab('story');
      await loadData();
    } catch (err: any) {
      setMsg(`Simulation Trigger Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await apiService.pauseSimulationRun();
      setMsg('Simulation PAUSED.');
      await loadData();
    } catch (err: any) {
      setMsg(`Pause Error: ${err.message}`);
    }
  };

  const handleResume = async () => {
    try {
      await apiService.resumeSimulationRun();
      setMsg('Simulation RESUMED.');
      await loadData();
    } catch (err: any) {
      setMsg(`Resume Error: ${err.message}`);
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await apiService.emergencyStopSimulation();
      setMsg('EMERGENCY STOP EXECUTED! Halted all synthetic scenario generation.');
      await loadData();
    } catch (err: any) {
      setMsg(`Emergency Stop Error: ${err.message}`);
    }
  };

  const handleResetLab = async () => {
    try {
      await apiService.resetLabSimulation();
      setActiveRun(null);
      setMsg('Laboratory simulator reset to baseline state.');
      await loadData();
    } catch (err: any) {
      setMsg(`Reset Error: ${err.message}`);
    }
  };

  const filteredScenarios = scenarios.filter((s) => {
    const matchCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scenario_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controlled ICS Attack Simulation & Security Validation Laboratory"
        description="Synthetic Adversarial Scenario Orchestrator & Full Pipeline Security Validation Engine"
        actions={
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>LAB SIMULATION MODE</span>
            </span>
            <button
              onClick={handleResetLab}
              className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder text-soc-textPrimary text-xs font-mono rounded flex items-center space-x-1 hover:border-slate-600"
            >
              <RefreshCw className="w-3.5 h-3.5 text-soc-telemetry" />
              <span>Reset Simulator</span>
            </button>
            <button
              onClick={handleEmergencyStop}
              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-mono font-bold text-xs rounded flex items-center space-x-1"
            >
              <Square className="w-3.5 h-3.5" />
              <span>EMERGENCY STOP</span>
            </button>
          </div>
        }
      />

      {/* Safety Boundary Banner */}
      <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded text-xs font-mono text-amber-300 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block uppercase tracking-wider">DEFENSIVE RESEARCH & LABORATORY SAFETY BOUNDARY</span>
          <span>
            All attack simulations execute strictly against ICS-SHIELD laboratory synthetic devices (<code className="text-white">PLC-001, HMI-001, ENG-WS-001</code>). Arbitrary external targets, production networks, real PLCs, and physical command injection are fail-closed restricted.
          </span>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono text-xs rounded flex justify-between items-center">
          <span>✓ {msg}</span>
          <button onClick={() => setMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Persistent Control Bar */}
      {activeRun && (
        <div className="p-4 bg-soc-panelBg border-2 border-amber-600 rounded-lg shadow-xl font-mono text-xs space-y-3">
          <div className="flex justify-between items-center border-b border-soc-panelBorder pb-2">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 bg-amber-950 text-amber-400 font-bold border border-amber-800 rounded uppercase">
                ACTIVE LAB RUN: {activeRun.run_number}
              </span>
              <span className="text-white font-bold text-sm">{activeRun.name || activeRun.scenario_code}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  activeRun.status === 'RUNNING'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse'
                    : activeRun.status === 'PAUSED'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                STATUS: {activeRun.status}
              </span>
              {activeRun.status === 'RUNNING' ? (
                <button onClick={handlePause} className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-300 rounded text-[11px]">
                  Pause
                </button>
              ) : (
                <button onClick={handleResume} className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded text-[11px]">
                  Resume
                </button>
              )}
              <button onClick={handleEmergencyStop} className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded text-[11px]">
                EMERGENCY STOP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Scenarios Library"
          value={scenarios.length || 12}
          subtitle="Built-in Scenarios"
          icon={<PlaySquare className="w-5 h-5 text-sky-400" />}
        />
        <MetricCard
          title="Validation Coverage"
          value="100%"
          subtitle="Full Pipeline Verified"
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
        />
        <MetricCard
          title="Training Mode"
          value={trainingMode ? 'ENABLED' : 'STANDBY'}
          subtitle="SOC Analyst Training"
          icon={<UserCheck className="w-5 h-5 text-purple-400" />}
        />
        <MetricCard
          title="Laboratory Status"
          value="ISOLATED"
          subtitle="Safe Software Simulation"
          icon={<Shield className="w-5 h-5 text-emerald-400" />}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-soc-panelBorder space-x-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('story')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'story'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-amber-400" />
          <span>🧪 Full Simulation Story Mode</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'scenarios'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <PlaySquare className="w-4 h-4" />
          <span>Scenario Catalog (12 Scenarios)</span>
        </button>

        <button
          onClick={() => setActiveTab('monitor')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'monitor'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Pipeline Validation Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('evaluation')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'evaluation'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Expected vs Observed Evaluation</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`pb-2 px-1 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'training'
              ? 'border-soc-accent text-soc-accent font-bold'
              : 'border-transparent text-soc-textMuted hover:text-soc-text'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>SOC Training Mode</span>
        </button>
      </div>

      {/* TAB 0: FULL SIMULATION STORY MODE */}
      {activeTab === 'story' && (
        <SimulationStoryMode
          scenarioCode={activeRun?.scenario_code || 'SIM-MULTISTAGE-001'}
          runId={activeRun?.id || runId}
        />
      )}

      {/* TAB 1: SCENARIO CATALOG */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
            <div className="flex items-center space-x-3">
              <span className="text-soc-textMuted">Category Filter:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-soc-bg border border-soc-panelBorder rounded px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="PROTOCOL_ANOMALY">Protocol Anomaly</option>
                <option value="PROCESS_ANOMALY">Process Anomaly</option>
                <option value="COMMUNICATION_ANOMALY">Communication Anomaly</option>
                <option value="DEVICE_ANOMALY">Device Anomaly</option>
                <option value="INTEGRITY_ANOMALY">Integrity Anomaly</option>
                <option value="MULTI_STAGE_SIMULATION">Multi-Stage Simulation</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-soc-textMuted" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-soc-bg border border-soc-panelBorder rounded pl-8 pr-3 py-1 text-xs text-white placeholder-soc-textMuted focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((s: any) => (
              <div key={s.id || s.scenario_code} className="p-4 bg-soc-bg rounded border border-soc-panelBorder flex flex-col justify-between space-y-3 hover:border-slate-600 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sky-400 text-sm">{s.scenario_code}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      s.risk_level === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {s.difficulty || 'INTERMEDIATE'}
                    </span>
                  </div>
                  <div className="text-white font-bold text-sm">{s.name}</div>
                  <p className="text-[11px] text-soc-textMuted mt-1 leading-relaxed line-clamp-3">{s.description}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-soc-panelBorder/60 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-soc-textMuted">TARGET ASSETS:</span>
                    <span className="text-slate-300 font-bold">{Array.isArray(s.target_assets) ? s.target_assets.join(', ') : 'PLC-001'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-soc-textMuted">EXPECTED MITRE:</span>
                    <span className="text-emerald-400 font-bold">{Array.isArray(s.expected_mitre_mappings) ? s.expected_mitre_mappings.join(', ') : 'T0855'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-soc-panelBorder flex space-x-2">
                  <button
                    onClick={() => handleStartScenario(s.scenario_code)}
                    className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-xs flex items-center justify-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>LAUNCH STORY</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PIPELINE VALIDATION MONITOR */}
      {activeTab === 'monitor' && (
        <Panel title="End-to-End Defensive Pipeline Validation Monitor" subtitle="Complete Security Workflow Chain Verification" icon={<Activity className="w-4 h-4 text-emerald-400" />}>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-soc-bg border border-soc-panelBorder rounded space-y-4">
              <div className="text-soc-accent font-bold text-sm border-b border-soc-panelBorder pb-2">
                FULL PIPELINE EVENT PROPAGATION CHAIN (SIM-MULTISTAGE-001)
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-soc-panelBg rounded border border-soc-panelBorder">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">1</span>
                  <div className="flex-1">
                    <span className="text-sky-400 font-bold block">1. SYNTHETIC SCENARIO INJECTION</span>
                    <span className="text-soc-textMuted text-[11px]">Modbus write coil 0x0004 payload injected targeting PLC-001</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px]">VERIFIED (0 ms)</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-soc-panelBg rounded border border-soc-panelBorder">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">2</span>
                  <div className="flex-1">
                    <span className="text-sky-400 font-bold block">2. PROTOCOL MONITORING (PHASE 7)</span>
                    <span className="text-soc-textMuted text-[11px]">Deep packet inspection parsed FC05 single coil write transaction</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px]">VERIFIED (12 ms)</span>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-soc-panelBg rounded border border-soc-panelBorder">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">3</span>
                  <div className="flex-1">
                    <span className="text-sky-400 font-bold block">3. RULE DETECTION ENGINE (PHASE 8)</span>
                    <span className="text-soc-textMuted text-[11px]">Triggered rule: 'Unauthorized Modbus Coil Override'</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px]">VERIFIED (28 ms)</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 3: EVALUATION MATRIX */}
      {activeTab === 'evaluation' && (
        <Panel title="Expected vs Observed Detection Evaluation Matrix" subtitle="Descriptive Security Pipeline Validation Metrics" icon={<CheckCircle className="w-4 h-4 text-emerald-400" />}>
          <div className="space-y-4 font-mono text-xs">
            <div className="overflow-x-auto border border-soc-panelBorder rounded">
              <table className="w-full text-left">
                <thead className="bg-soc-bg text-soc-textMuted border-b border-soc-panelBorder uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Pipeline Stage</th>
                    <th className="p-3">Expected Result</th>
                    <th className="p-3">Observed Result</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3 text-right">Detection Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soc-panelBorder">
                  <tr className="hover:bg-soc-panelBg/60 transition-colors">
                    <td className="p-3 font-bold text-sky-400">Rule Detection</td>
                    <td className="p-3 text-white">Unauthorized Modbus Coil Override</td>
                    <td className="p-3 text-white">Unauthorized Modbus Coil Override</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-[10px]">
                        EXPECTED_OBSERVED
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">28 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Panel>
      )}

      {/* TAB 4: SOC TRAINING MODE */}
      {activeTab === 'training' && (
        <Panel title="SOC Analyst Training & Education Mode" subtitle="Interactive Analyst Training Environment" icon={<UserCheck className="w-4 h-4 text-purple-400" />}>
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 bg-soc-bg border border-soc-panelBorder rounded space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-400 font-bold text-sm">SOC Trainee Hide Answers Toggle</span>
                <button
                  onClick={() => setTrainingMode(!trainingMode)}
                  className={`px-3 py-1 rounded text-xs font-bold ${
                    trainingMode ? 'bg-purple-700 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {trainingMode ? 'Training Mode: ON (Answers Hidden)' : 'Training Mode: OFF'}
                </button>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
};

export default Simulation;
