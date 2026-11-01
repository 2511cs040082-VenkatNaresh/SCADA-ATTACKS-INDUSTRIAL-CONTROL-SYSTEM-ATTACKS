import React, { useState } from 'react';
import {
  Server,
  Activity,
  AlertTriangle,
  ShieldAlert,
  HardDrive,
  CheckCircle2,
  Cpu,
  Radio,
  Zap,
  Grid,
  FlaskConical,
  Lock,
  ArrowRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';

export const SocPreview: React.FC = () => {
  const [simMode, setSimMode] = useState<'NORMAL' | 'ATTACK'>('NORMAL');

  const normalMetrics = {
    tankLevel: 58.4,
    pressure: 4.8,
    temperature: 71.2,
    flowRate: 120.4,
    criticalAlerts: 0,
    activeIncidents: 0,
    status: 'ONLINE',
    statusColor: 'text-emerald-400',
    statusBg: 'bg-emerald-950/80 border-emerald-800/80',
    ruleDetections: 0,
    behavioralAnomalies: 0,
    mlPredictions: 0,
    lastEvent: 'Normal polling cycle: PLC-001 (Modbus FC03 Read Holding Registers)',
    eventSeverity: 'INFO',
  };

  const attackMetrics = {
    tankLevel: 89.2,
    pressure: 9.4,
    temperature: 84.7,
    flowRate: 184.2,
    criticalAlerts: 2,
    activeIncidents: 1,
    status: 'COMPROMISED (LAB)',
    statusColor: 'text-rose-400',
    statusBg: 'bg-rose-950/80 border-rose-800/80',
    ruleDetections: 3,
    behavioralAnomalies: 2,
    mlPredictions: 1,
    lastEvent: 'T0855 Unauthorized Modbus Coil Override: ENG-WS-001 ➔ PLC-001 (FC05 Coil 0x0004 = 1)',
    eventSeverity: 'CRITICAL',
  };

  const current = simMode === 'NORMAL' ? normalMetrics : attackMetrics;

  return (
    <div className="w-full bg-navy-900 border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      {/* OS / Window Header Bar */}
      <div className="bg-navy-950 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-400 text-[11px] ml-2">
            ICS-SHIELD Unified SOC Command Center — Local Engine (v1.0.0)
          </span>
        </div>

        {/* Live Simulation Mode Toggle */}
        <div className="flex items-center space-x-1 bg-navy-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSimMode('NORMAL')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              simMode === 'NORMAL'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Normal Baseline
          </button>
          <button
            onClick={() => setSimMode('ATTACK')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
              simMode === 'ATTACK'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulate Attack (T0855)
          </button>
        </div>
      </div>

      {/* Subheader Status Strip */}
      <div className="bg-navy-850 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-slate-400">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>INGEST: 134 pps</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">PROTOCOLS: Modbus TCP, DNP3, S7comm</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">PURDUE MODEL: L0–L3</span>
        </div>
        <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${current.statusBg} ${current.statusColor}`}>
          SYSTEM STATE: {current.status}
        </div>
      </div>

      {/* Main SOC Dashboard Grid Preview */}
      <div className="p-4 space-y-4 bg-navy-900/60">
        {/* KPI Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <div className="p-2.5 bg-navy-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">CRITICAL ALERTS</div>
            <div className={`text-lg font-bold ${current.criticalAlerts > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
              {current.criticalAlerts}
            </div>
            <div className="text-[9px] text-slate-500 truncate">Immediate Action</div>
          </div>

          <div className="p-2.5 bg-navy-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">ACTIVE CASES</div>
            <div className={`text-lg font-bold ${current.activeIncidents > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
              {current.activeIncidents}
            </div>
            <div className="text-[9px] text-slate-500 truncate">Incident Cases</div>
          </div>

          <div className="p-2.5 bg-navy-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">OT ASSETS</div>
            <div className="text-lg font-bold text-cyan-400">4 / 4</div>
            <div className="text-[9px] text-slate-500 truncate">PLCs & HMIs Online</div>
          </div>

          <div className="p-2.5 bg-navy-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">RULE DETECTIONS</div>
            <div className={`text-lg font-bold ${current.ruleDetections > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
              {current.ruleDetections}
            </div>
            <div className="text-[9px] text-slate-500 truncate">Deterministic Rules</div>
          </div>

          <div className="p-2.5 bg-navy-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">BEHAVIORAL (Z)</div>
            <div className={`text-lg font-bold ${current.behavioralAnomalies > 0 ? 'text-purple-400' : 'text-slate-100'}`}>
              {current.behavioralAnomalies}
            </div>
            <div className="text-[9px] text-slate-500 truncate">Z-Score Deviations</div>
          </div>

          <div className="p-2.5 bg-navy-950/80 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 truncate">MITRE COVERAGE</div>
            <div className="text-lg font-bold text-emerald-400">88%</div>
            <div className="text-[9px] text-slate-500 truncate">ICS v14 Matrix</div>
          </div>
        </div>

        {/* Process Physical Telemetry & Alert Stream Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Physical SCADA Water Loop Sensors */}
          <div className="p-3 bg-navy-950/90 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="font-bold text-slate-200 flex items-center space-x-1.5 text-[11px]">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Physical Process Loop Telemetry</span>
              </span>
              <span className="text-[10px] text-slate-500">Purdue Level 0/1</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-navy-900 rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Storage Tank</span>
                <span className={`font-bold ${current.tankLevel > 80 ? 'text-rose-400' : 'text-cyan-400'}`}>
                  {current.tankLevel}%
                </span>
              </div>
              <div className="p-2 bg-navy-900 rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Header Pressure</span>
                <span className={`font-bold ${current.pressure > 8.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {current.pressure} bar
                </span>
              </div>
              <div className="p-2 bg-navy-900 rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Temperature</span>
                <span className="font-bold text-sky-400">{current.temperature}°C</span>
              </div>
              <div className="p-2 bg-navy-900 rounded border border-slate-800/80 flex justify-between items-center">
                <span className="text-slate-400">Flow Rate</span>
                <span className="font-bold text-amber-400">{current.flowRate} L/m</span>
              </div>
            </div>
          </div>

          {/* Active Security Event Feed */}
          <div className="p-3 bg-navy-950/90 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="font-bold text-slate-200 flex items-center space-x-1.5 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Event Stream & Correlation</span>
              </span>
              <span className="text-[10px] text-slate-500">WebSocket Bus</span>
            </div>

            <div className="p-2.5 bg-navy-900 rounded border border-slate-800 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                  current.eventSeverity === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  {current.eventSeverity}
                </span>
                <span className="text-[10px] text-slate-500">Just now</span>
              </div>
              <div className="text-slate-200 font-medium leading-relaxed">
                {current.lastEvent}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Terminal Output */}
        <div className="px-3 py-2 bg-navy-950 rounded border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-2 truncate">
            <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              {simMode === 'NORMAL'
                ? 'engine@icsshield:~$ [DAEMON] Ingestion active on 127.0.0.1:5050. Zero anomalies detected.'
                : 'engine@icsshield:~$ [ALERT] Rule R-MOD-005 triggered. Case INC-2026-000001 dispatched to analyst.'}
            </span>
          </div>
          <span className="text-emerald-400 shrink-0 text-[10px] font-bold">100% AIR-GAPPED LAB</span>
        </div>
      </div>
    </div>
  );
};
