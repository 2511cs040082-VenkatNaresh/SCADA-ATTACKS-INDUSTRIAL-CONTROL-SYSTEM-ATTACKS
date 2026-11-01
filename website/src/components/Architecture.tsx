import React, { useState } from 'react';
import {
  Server,
  Radio,
  Search,
  Cpu,
  ShieldAlert,
  Bell,
  Layers,
  Zap,
  FileCheck2,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const Architecture: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      num: 1,
      title: 'Industrial Assets & Lab Simulator',
      layer: 'Purdue Level 0–2',
      icon: <Server className="w-5 h-5 text-cyan-400" />,
      desc: 'Physical sensors and actuators (tank level, pressure, temperature) interacting with simulated PLCs (PLC-001, PLC-002), RTUs, and operator HMIs.',
      detail: 'Operates as an isolated digital twin simulating real industrial water treatment processes and fieldbus communications without touching physical hardware.'
    },
    {
      num: 2,
      title: 'Network & Telemetry Collection',
      layer: 'Ingestion Pipeline',
      icon: <Radio className="w-5 h-5 text-sky-400" />,
      desc: 'Passive packet observation and telemetry sampling capturing industrial ethernet frames and process metrics at up to 150 packets/sec.',
      detail: 'Collects stream metrics without sending active probe packets that could crash sensitive industrial control devices.'
    },
    {
      num: 3,
      title: 'Deep Protocol Analysis',
      layer: 'DPI Decoders',
      icon: <Search className="w-5 h-5 text-indigo-400" />,
      desc: 'Multi-protocol parsing engine decoding Modbus TCP (Port 502), DNP3 (Port 20000), and Siemens S7comm over ISO-on-TCP (Port 102).',
      detail: 'Parses function codes, register boundaries, coil values, DNP3 variation flags, and S7comm PLC key-switch operating mode transitions.'
    },
    {
      num: 4,
      title: 'Multi-Engine Detection',
      layer: 'Analysis Engines',
      icon: <Cpu className="w-5 h-5 text-purple-400" />,
      desc: 'Simultaneous evaluation across Deterministic Rules, Statistical Z-Score Baselines, and Machine Learning Isolation Forest models.',
      detail: 'Deterministic rules check for explicit signature violations; behavioral baselines detect traffic spikes; ML models identify subtle multi-parameter drift.'
    },
    {
      num: 5,
      title: 'Threat Classification & MITRE Mapping',
      layer: 'Intelligence Mapping',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      desc: 'Maps detected anomalous behaviors to formal MITRE ATT&CK for ICS v14 techniques (e.g., T0855 Unauthorized Command, T0836 Modify Parameter).',
      detail: 'Provides tactics context (Impair Process Control, Collection, Initial Access) and confidence scoring for SOC operators.'
    },
    {
      num: 6,
      title: 'Real-Time Alert Correlation',
      layer: 'SOC Alert Bus',
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      desc: 'Correlates raw detections, eliminates duplicate alarms, applies flood suppression thresholds, and ranks severity (CRITICAL, HIGH, MEDIUM, LOW).',
      detail: 'Delivers real-time WebSocket alerts to connected dashboards with zero page refresh required.'
    },
    {
      num: 7,
      title: 'Incident Investigation Workspace',
      layer: 'Case Management',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      desc: 'Forensic case workspace linking affected assets, root-cause event chains, SHA-256 evidence hashes, and analyst investigation timelines.',
      detail: 'Allows analysts to collaborate, track hypotheses, record forensic notes, and document containment progress.'
    },
    {
      num: 8,
      title: 'Defensive Response Recommendations',
      layer: 'Automated Playbooks',
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      desc: 'Generates specific defensive mitigation actions (simulated port isolation, baseline resets) with mandatory human authorization.',
      detail: 'Enforces strict Separation of Duties: Playbooks cannot execute autonomously against OT nodes without explicit security analyst approval.'
    },
    {
      num: 9,
      title: 'Cryptographic Security Reports',
      layer: 'Forensic Ledger',
      icon: <FileCheck2 className="w-5 h-5 text-emerald-400" />,
      desc: 'Produces compliance-grade PDF and JSON executive audit summaries with SHA-256 digital signatures for legal chain of custody.',
      detail: 'Exports full timeline of events, expected vs. observed evaluation matrices, analyst notes, and post-incident recovery metrics.'
    }
  ];

  return (
    <section id="architecture" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            System Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            How ICS-SHIELD Processes Industrial Events
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            From raw PLC sensor readings to cryptographic incident reports, every event moves through a structured, zero-loss defensive pipeline.
          </p>
        </div>

        {/* Interactive Architecture Stepper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-mono">
          {/* Left Column: Stages Nav List */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs text-slate-400 uppercase font-semibold mb-2">
              Defensive Pipeline Sequence (Click to Inspect)
            </div>
            {stages.map((st, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStage(idx)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  activeStage === idx
                    ? 'bg-navy-900 border-cyan-500 text-white shadow-md'
                    : 'bg-navy-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-navy-900/60'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-1.5 rounded bg-navy-950 border ${activeStage === idx ? 'border-cyan-500 text-cyan-400' : 'border-slate-800 text-slate-400'}`}>
                    {st.icon}
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block uppercase">{st.layer}</span>
                    <span className="text-xs font-bold text-slate-100 font-sans truncate">{st.num}. {st.title}</span>
                  </div>
                </div>
                <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${activeStage === idx ? 'text-cyan-400' : 'text-slate-700'}`} />
              </button>
            ))}
          </div>

          {/* Right Column: Stage Deep Dive Display */}
          <div className="lg:col-span-7 bg-navy-900 border border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-navy-950 border border-cyan-500/30 text-cyan-400">
                  {stages[activeStage].icon}
                </div>
                <div>
                  <span className="text-xs text-cyan-400 font-bold block uppercase tracking-wider">
                    STAGE {stages[activeStage].num} OF {stages.length} • {stages[activeStage].layer}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-sans">
                    {stages[activeStage].title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-4 font-sans">
              <div>
                <span className="text-xs font-mono text-slate-400 block uppercase font-semibold mb-1">
                  Operational Function:
                </span>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {stages[activeStage].desc}
                </p>
              </div>

              <div>
                <span className="text-xs font-mono text-slate-400 block uppercase font-semibold mb-1">
                  Technical Architecture Detail:
                </span>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {stages[activeStage].detail}
                </p>
              </div>
            </div>

            {/* Pipeline Flow Stepper Controls */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <button
                disabled={activeStage === 0}
                onClick={() => setActiveStage((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 font-mono"
              >
                ← Previous Stage
              </button>
              <span className="text-slate-500 font-mono">
                {activeStage + 1} / {stages.length}
              </span>
              <button
                disabled={activeStage === stages.length - 1}
                onClick={() => setActiveStage((prev) => Math.min(stages.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-mono font-bold"
              >
                Next Stage →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
