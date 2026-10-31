import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Radio,
  Cpu,
  Zap,
  Grid,
  FlaskConical,
  ArrowRight,
  ShieldCheck,
  Server,
  Lock,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { apiService } from '../../services/api';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth } from '../../context/AuthContext';

interface SimulationStoryModeProps {
  scenarioCode?: string;
  runId?: string;
  onFinish?: () => void;
}

export const SimulationStoryMode: React.FC<SimulationStoryModeProps> = ({
  scenarioCode = 'SIM-MULTISTAGE-001',
  runId,
  onFinish,
}) => {
  const { events, latestProcess, simulationState } = useWebSocket();
  const { canApproveResponse, canExecuteSimulation } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeRun, setActiveRun] = useState<any | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'PENDING' | 'APPROVED' | 'EXECUTED'>('PENDING');
  const [evaluationData, setEvaluationData] = useState<any | null>(null);

  const stepsList = [
    { num: 1, title: 'NORMAL INDUSTRIAL OPERATION', desc: 'SCADA process telemetry & PLCs operating at healthy baseline' },
    { num: 2, title: 'SIMULATED PROBLEM', desc: 'Controlled synthetic anomaly introduced targeting PLC-001' },
    { num: 3, title: 'MONITORING', desc: 'Network & SCADA protocol telemetry observed by Phase 7 monitor' },
    { num: 4, title: 'DETECTION', desc: 'Rule, Behavioral & ML detection engines trigger with evidence' },
    { num: 5, title: 'ALERT', desc: 'SOC Alert ALT-2026-981240 generated and assigned' },
    { num: 6, title: 'INVESTIGATION', desc: 'Guided analyst investigation & timeline evidence correlation' },
    { num: 7, title: 'MITRE CONTEXT', desc: 'Mapped to MITRE ATT&CK for ICS Technique T0855' },
    { num: 8, title: 'RESPONSE RECOMMENDATION', desc: 'Phase 14 Defense Engine generates response plan RSP-2026-000001' },
    { num: 9, title: 'ANALYST APPROVAL', desc: 'Human authorization required for simulated response plan' },
    { num: 10, title: 'SIMULATED RESPONSE', desc: 'Safely executing simulated device isolation inside lab' },
    { num: 11, title: 'RECOVERY', desc: 'Simulator process parameters & asset state normalizing' },
    { num: 12, title: 'INCIDENT RESOLUTION', desc: 'Incident INC-2026-000001 closed & forensic evidence recorded' },
    { num: 13, title: 'FINAL RESULT', desc: 'Phase 15 Evaluation Engine Expected vs Observed matrix summary' },
  ];

  const handleStartRun = async () => {
    try {
      const res = await apiService.startSimulationRun(scenarioCode, { seed: 1337 });
      setActiveRun(res.data);
      setCurrentStep(1);
      setIsPlaying(true);
    } catch (e: any) {
      console.error('Failed to start story run:', e);
    }
  };

  // Synchronize step progression with real backend events
  useEffect(() => {
    if (simulationState.status === 'RUNNING') {
      setIsPlaying(true);
    }
    if (simulationState.currentStep > 0 && simulationState.currentStep <= 13) {
      setCurrentStep(simulationState.currentStep);
    }
    if (simulationState.status === 'COMPLETED') {
      setCurrentStep(13);
      setIsPlaying(false);
    }
  }, [simulationState.status, simulationState.currentStep]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentStep < 13 && simulationState.status !== 'RUNNING') {
      timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 4000);
    } else if (currentStep === 13) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, simulationState.status]);

  const handleApprove = async () => {
    setApprovalStatus('APPROVED');
    setTimeout(() => {
      setApprovalStatus('EXECUTED');
      if (currentStep < 10) setCurrentStep(10);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Control Header & Stepper Bar */}
      <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-amber-950 text-amber-400 border border-amber-800 rounded font-bold">
              🧪 STORY MODE
            </span>
            <div>
              <div className="text-sm font-bold text-slate-100">
                Full 13-Stage Simulation Story Walkthrough
              </div>
              <div className="text-[11px] text-slate-400">
                Scenario: <strong className="text-cyan-400">{scenarioCode}</strong> — Multi-Stage Lab Cyber Incident
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!activeRun ? (
              <button
                onClick={handleStartRun}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded flex items-center space-x-1.5 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>START SIMULATION STORY</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 font-bold rounded flex items-center space-x-1"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'PAUSE STORY' : 'RESUME STORY'}</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setIsPlaying(false);
                    setActiveRun(null);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>RESET STORY</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 13 Step Timeline Tracker Bar */}
        <div className="grid grid-cols-13 gap-1 overflow-x-auto pt-1">
          {stepsList.map((st) => {
            const isCurrent = currentStep === st.num;
            const isDone = currentStep > st.num;

            return (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num)}
                className={`p-1.5 text-center rounded border transition flex flex-col items-center justify-between h-14 ${
                  isCurrent
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : isDone
                    ? 'bg-slate-950 border-slate-700 text-emerald-400'
                    : 'bg-slate-950/60 border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
                title={`${st.num}. ${st.title}`}
              >
                <span className="text-[10px] font-bold">STEP {st.num}</span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isCurrent ? 'bg-cyan-400 animate-ping' : isDone ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC STEP CONTENT PANEL */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 shadow-2xl min-h-[420px]">
        {/* Step Banner */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-cyan-950 text-cyan-400 font-bold border border-cyan-800 rounded text-xs uppercase">
              STEP {currentStep} OF 13
            </span>
            <h2 className="text-base font-bold text-slate-100">
              {stepsList[currentStep - 1].title}
            </h2>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <span>Progress: {Math.round((currentStep / 13) * 100)}%</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${(currentStep / 13) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step 1: Normal Operation View */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-lg flex items-center justify-between text-emerald-300">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 1: NORMAL INDUSTRIAL SCADA OPERATION</span>
                  <span className="text-[11px]">All Purdue Level 0-3 laboratory assets operating within baseline engineering thresholds.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-900 text-emerald-200 border border-emerald-700 rounded font-bold">
                SYSTEM HEALTHY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-bold">PLC-001 (Main Controller)</span>
                  <span className="text-emerald-400 font-bold">RUNNING</span>
                </div>
                <div className="text-xl font-bold text-cyan-400">Tank Level: 68%</div>
                <div className="text-slate-400 text-[11px]">Modbus TCP Port 502 • IP: 192.168.1.10</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-bold">HMI-001 (Operator Panel)</span>
                  <span className="text-emerald-400 font-bold">CONNECTED</span>
                </div>
                <div className="text-xl font-bold text-sky-400">Flow: 61% (120 L/min)</div>
                <div className="text-slate-400 text-[11px]">Purdue Level 2 • IP: 192.168.1.20</div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="font-bold">RTU-001 (Remote Terminal)</span>
                  <span className="text-emerald-400 font-bold">ONLINE</span>
                </div>
                <div className="text-xl font-bold text-amber-400">Pressure: 70% (4.8 bar)</div>
                <div className="text-slate-400 text-[11px]">DNP3 Outstation • IP: 192.168.1.30</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Simulated Problem */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-lg flex items-center justify-between text-rose-300">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 2: CONTROLLED SYNTHETIC ANOMALY INJECTED</span>
                  <span className="text-[11px]">Unexpected synthetic Modbus write operation targeting PLC-001 coil 0x0004.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 rounded font-bold">
                🧪 SIMULATION EVENT
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-rose-900/60 rounded-lg space-y-3">
              <div className="font-bold text-rose-400">AFFECTED ASSET: PLC-001 (Main Controller)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Normal State</span>
                  <span className="text-emerald-400 font-bold">Coil 0x0004: OFF (0)</span>
                </div>
                <div className="p-2 bg-rose-950/80 rounded border border-rose-800">
                  <span className="text-rose-300 block text-[10px]">Simulation State</span>
                  <span className="text-rose-400 font-bold">Coil 0x0004: OVERRIDDEN (1)</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Source</span>
                  <span className="text-cyan-400 font-bold">ENG-WS-001 (192.168.1.50)</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Protocol</span>
                  <span className="text-amber-400 font-bold">Modbus FC05 (Write Coil)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Monitoring */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-950/60 border border-sky-800 rounded-lg flex items-center justify-between text-sky-300">
              <div className="flex items-center space-x-3">
                <Radio className="w-5 h-5 text-sky-400 shrink-0 animate-pulse" />
                <div>
                  <span className="font-bold block text-sm">STEP 3: NETWORK & PROTOCOL MONITORING</span>
                  <span className="text-[11px]">Phase 7 network flow observer ingested SCADA packet headers.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-sky-900 text-sky-200 border border-sky-700 rounded font-bold">
                INGESTED (12 ms)
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 font-mono text-xs">
              <div className="text-cyan-400 font-bold">Flow Payload Inspection Details:</div>
              <pre className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 text-[11px] overflow-x-auto">
{`{
  "timestamp": "${new Date().toISOString()}",
  "source_ip": "192.168.1.50",
  "destination_ip": "192.168.1.10",
  "protocol": "MODBUS_TCP",
  "function_code": 5,
  "function_name": "Write Single Coil",
  "coil_address": 4,
  "coil_value": 65280,
  "environment": "LAB",
  "simulation": true
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Step 4: Detection Display */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-950/60 border border-purple-800 rounded-lg flex items-center justify-between text-purple-300">
              <div className="flex items-center space-x-3">
                <Cpu className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 4: DETECTION ENGINES REACTION</span>
                  <span className="text-[11px]">Deterministic Rules, Statistical Baselines, and ML Isolation Forest triggered.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-purple-900 text-purple-200 border border-purple-700 rounded font-bold">
                3 DETECTIONS TRIGGERED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950 border border-amber-800 rounded-lg space-y-2">
                <span className="px-2 py-0.5 bg-amber-950 text-amber-400 font-bold rounded text-[10px]">RULE DETECTION</span>
                <div className="font-bold text-slate-100">Unauthorized Modbus Coil Override</div>
                <div className="text-slate-400 text-[11px]">Rule ID: R-MOD-005 • Severity: HIGH</div>
              </div>

              <div className="p-3 bg-slate-950 border border-purple-800 rounded-lg space-y-2">
                <span className="px-2 py-0.5 bg-purple-950 text-purple-400 font-bold rounded text-[10px]">BEHAVIORAL ANOMALY</span>
                <div className="font-bold text-slate-100">Command Rate Deviation (+3.9 σ)</div>
                <div className="text-slate-400 text-[11px]">Baseline: 0.1 req/s • Observed: 14 req/s</div>
              </div>

              <div className="p-3 bg-slate-950 border border-cyan-800 rounded-lg space-y-2">
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 font-bold rounded text-[10px]">ML PREDICTION</span>
                <div className="font-bold text-slate-100">Anomalous Modbus Function Code</div>
                <div className="text-slate-400 text-[11px]">Confidence Score: 0.94 (Calibrated)</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Alert Display */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-lg flex items-center justify-between text-rose-300">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 5: SOC ALERT GENERATED</span>
                  <span className="text-[11px]">Phase 11 Alert Engine correlated detections into SOC Alert ALT-2026-981240.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-rose-900 text-white font-bold rounded">
                🔴 HIGH SEVERITY
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-rose-900 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-bold text-slate-100 text-sm">ALT-2026-981240 — Unauthorized Modbus Command Message</span>
                <span className="text-rose-400 font-bold">Status: NEW</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                High-risk Modbus coil override detected from Engineering Workstation targeting PLC-001. Process variable perturbation risk identified.
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Guided Investigation */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-950/60 border border-blue-800 rounded-lg flex items-center justify-between text-blue-300">
              <div className="flex items-center space-x-3">
                <Layers className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 6: GUIDED ANALYST INVESTIGATION</span>
                  <span className="text-[11px]">Phase 12 Case Engine opened investigation INC-2026-000001.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-900 text-blue-200 border border-blue-700 rounded font-bold">
                INC-2026-000001
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">AFFECTED ASSET</span>
                <span className="font-bold text-cyan-400">PLC-001 (192.168.1.10)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SOURCE IP</span>
                <span className="font-bold text-amber-400">192.168.1.50 (ENG-WS)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PROTOCOL</span>
                <span className="font-bold text-purple-400">Modbus TCP (FC05)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">ANALYST ASSIGNED</span>
                <span className="font-bold text-emerald-400">soc_analyst</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: MITRE Context */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-950/60 border border-indigo-800 rounded-lg flex items-center justify-between text-indigo-300">
              <div className="flex items-center space-x-3">
                <Grid className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 7: MITRE ATT&CK FOR ICS CONTEXT</span>
                  <span className="text-[11px]">Phase 13 Engine mapped activity to MITRE Technique T0855.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-indigo-900 text-indigo-200 border border-indigo-700 rounded font-bold">
                T0855
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-indigo-900 rounded-lg space-y-2">
              <div className="font-bold text-indigo-300">Technique T0855: Unauthorized Command Message</div>
              <div className="text-slate-400 text-[11px]">
                Adversaries may send unauthorized command messages to control devices (PLCs/RTUs) to instruct them to alter physical process states or cause unsafe operating conditions.
              </div>
              <div className="flex space-x-3 pt-2 text-[10px]">
                <span className="text-cyan-400">Tactic: Impair Process Control</span>
                <span className="text-emerald-400">Confidence: HIGH</span>
                <span className="text-purple-400">Mapping: ANALYST_CONFIRMED</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Response Recommendation */}
        {currentStep === 8 && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-950/60 border border-yellow-800 rounded-lg flex items-center justify-between text-yellow-300">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 8: RESPONSE RECOMMENDATION GENERATED</span>
                  <span className="text-[11px]">Phase 14 Response Engine generated plan RSP-2026-000001.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-yellow-900 text-yellow-200 border border-yellow-700 rounded font-bold">
                PENDING APPROVAL
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-yellow-900 rounded-lg space-y-3">
              <div className="font-bold text-yellow-300">Plan RSP-2026-000001 — Simulated Modbus Isolation</div>
              <div className="text-slate-400 text-[11px]">
                <strong>Recommended Action:</strong> SIMULATE_NETWORK_ISOLATION targeting PLC-001.<br />
                <strong>Reasoning:</strong> Halts unauthorized Modbus coil write commands while protecting simulator process safety limits.<br />
                <strong>Risk Classification:</strong> LAB SIMULATION ONLY.
              </div>
            </div>
          </div>
        )}

        {/* Step 9: Analyst Approval */}
        {currentStep === 9 && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-950/60 border border-purple-800 rounded-lg flex items-center justify-between text-purple-300">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 9: HUMAN APPROVAL WORKFLOW</span>
                  <span className="text-[11px]">Human authorization mandatory for consequential response actions.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-purple-900 text-purple-200 border border-purple-700 rounded font-bold uppercase">
                {approvalStatus}
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-purple-900/80 rounded-lg space-y-4">
              <div className="text-slate-200 font-bold">Response Approval Decision Workspace</div>
              <div className="flex items-center space-x-4">
                <button
                  disabled={approvalStatus !== 'PENDING' || !canApproveResponse()}
                  onClick={handleApprove}
                  className={`px-4 py-2 rounded font-bold transition flex items-center space-x-2 ${
                    approvalStatus === 'APPROVED' || approvalStatus === 'EXECUTED'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{approvalStatus === 'PENDING' ? 'APPROVE RESPONSE PLAN' : 'APPROVED ✓'}</span>
                </button>
                {!canApproveResponse() && (
                  <span className="text-rose-400 text-[11px] flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Approval requires SECURITY_ANALYST or ADMIN role.</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Simulated Response Execution */}
        {currentStep === 10 && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center justify-between text-emerald-300">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 10: EXECUTING SIMULATED RESPONSE</span>
                  <span className="text-[11px]">Executing safe simulated isolation inside lab environment.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-900 text-emerald-200 border border-emerald-700 rounded font-bold">
                EXECUTED
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-emerald-900 rounded-lg space-y-2">
              <div className="font-bold text-emerald-300">Action Execution Summary:</div>
              <div className="text-slate-300 text-[11px]">
                Target: PLC-001 • State Transition: CONNECTED ➔ SIMULATED_ISOLATED.<br />
                SHA-256 Forensic Evidence Hash: <code className="text-cyan-400 font-bold">a7d616238bfe4c92...</code>
              </div>
            </div>
          </div>
        )}

        {/* Step 11: Recovery */}
        {currentStep === 11 && (
          <div className="space-y-4">
            <div className="p-4 bg-teal-950/60 border border-teal-800 rounded-lg flex items-center justify-between text-teal-300">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 11: SIMULATOR RECOVERY & VERIFICATION</span>
                  <span className="text-[11px]">Simulator process parameters and device communications normalized.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-teal-900 text-teal-200 border border-teal-700 rounded font-bold">
                RECOVERY VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-300">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Tank Level</span>
                <span className="font-bold text-emerald-400">68% (NORMAL)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Header Pressure</span>
                <span className="font-bold text-emerald-400">4.8 bar (NORMAL)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">PLC-001 State</span>
                <span className="font-bold text-emerald-400">NORMAL OPERATIONAL</span>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Telemetry Rate</span>
                <span className="font-bold text-cyan-400">134 pps</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 12: Incident Resolution */}
        {currentStep === 12 && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-700 rounded-lg flex items-center justify-between text-slate-200">
              <div className="flex items-center space-x-3">
                <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 12: INCIDENT CASE RESOLUTION</span>
                  <span className="text-[11px]">Incident INC-2026-000001 closed with full audit record.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">
                RESOLVED & CLOSED
              </span>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-slate-300">
              <div><strong>Lead Investigator:</strong> Alex Mercer (SECURITY_ANALYST)</div>
              <div><strong>Root Cause:</strong> Unauthorized Modbus Write Coil command from test workstation.</div>
              <div><strong>Containment Action:</strong> Simulated network isolation executed cleanly.</div>
            </div>
          </div>
        )}

        {/* Step 13: Final Result Matrix */}
        {currentStep === 13 && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-lg flex items-center justify-between text-emerald-300">
              <div className="flex items-center space-x-3">
                <FlaskConical className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block text-sm">STEP 13: FINAL EVALUATION SUMMARY MATRIX</span>
                  <span className="text-[11px]">Phase 15 Evaluation Engine Benchmark Results</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-900 text-white font-bold rounded">
                100% PIPELINE COVERAGE
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded-lg text-center">
                <span className="text-slate-400 block text-[10px] uppercase">EXPECTED</span>
                <span className="text-2xl font-bold text-emerald-400">4/4</span>
                <span className="text-slate-500 block text-[10px] mt-1">Matched Detections</span>
              </div>
              <div className="p-4 bg-cyan-950/40 border border-cyan-800 rounded-lg text-center">
                <span className="text-slate-400 block text-[10px] uppercase">OBSERVED</span>
                <span className="text-2xl font-bold text-cyan-400">4</span>
                <span className="text-slate-500 block text-[10px] mt-1">Real-Time Events</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center">
                <span className="text-slate-400 block text-[10px] uppercase">MISSING</span>
                <span className="text-2xl font-bold text-slate-400">0</span>
                <span className="text-slate-500 block text-[10px] mt-1">Undetected Anomaly</span>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center">
                <span className="text-slate-400 block text-[10px] uppercase">UNEXPECTED</span>
                <span className="text-2xl font-bold text-slate-400">0</span>
                <span className="text-slate-500 block text-[10px] mt-1">False Positives</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold rounded"
          >
            ← Previous Step
          </button>
          <button
            disabled={currentStep === 13}
            onClick={() => setCurrentStep((prev) => Math.min(13, prev + 1))}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold rounded flex items-center space-x-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
