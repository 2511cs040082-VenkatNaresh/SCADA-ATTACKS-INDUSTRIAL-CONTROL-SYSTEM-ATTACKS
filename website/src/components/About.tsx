import React from 'react';
import { Shield, Cpu, Activity, AlertTriangle, Users, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  const audiences = [
    {
      title: 'Cybersecurity Students & Learners',
      desc: 'Gain hands-on experience with industrial protocols, packet captures, and attack simulations without needing expensive physical hardware.',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
    },
    {
      title: 'Academic Researchers',
      desc: 'Test novel anomaly detection models and evaluate MITRE ATT&CK for ICS mappings using reproducible, deterministic scenario baselines.',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
    },
    {
      title: 'SOC & Incident Response Analysts',
      desc: 'Understand how physical industrial process indicators (pressure, flow, levels) correlate with fieldbus network anomalies and security alerts.',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: 'Industrial Cybersecurity Professionals',
      desc: 'Demonstrate incident response workflows, evaluate playbook approval boundaries, and assess OT security posture in a zero-risk lab digital twin.',
      icon: <Shield className="w-4 h-4 text-amber-400" />,
    },
    {
      title: 'Educational Institutions & Universities',
      desc: 'Deploy an air-gapped, ready-to-use SCADA cybersecurity testbed for lab courses, research projects, and student competitions.',
      icon: <Users className="w-4 h-4 text-sky-400" />,
    },
    {
      title: 'Security Testing & Evaluation Labs',
      desc: 'Benchmark detection latency, false-positive ratios, and response playbooks against controlled multi-stage cyber incidents.',
      icon: <Layers className="w-4 h-4 text-rose-400" />,
    },
  ];

  return (
    <section id="about" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            About the Project
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            Understanding Industrial Control Systems & OT Defense
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Protecting modern critical infrastructure requires fundamentally different approaches than conventional IT enterprise cybersecurity.
          </p>
        </div>

        {/* 3 Core Conceptual Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {/* Card 1: What is SCADA & ICS */}
          <div className="p-6 bg-navy-900/90 rounded-xl border border-slate-800 space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-navy-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-lg font-bold text-white font-mono">
              What Are SCADA & Industrial Control Systems?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>SCADA</strong> (Supervisory Control and Data Acquisition) and <strong>ICS</strong> (Industrial Control Systems) encompass the programmable logic controllers (PLCs), remote terminal units (RTUs), and human-machine interfaces (HMIs) that physically actuate valves, pumps, motors, and electrical switches. They translate digital commands into kinetic, real-world physical changes.
            </p>
          </div>

          {/* Card 2: Why Industrial Security Matters */}
          <div className="p-6 bg-navy-900/90 rounded-xl border border-slate-800 space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-navy-950 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-lg font-bold text-white font-mono">
              Why Does Industrial Cybersecurity Matter?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Industrial protocols like Modbus TCP, DNP3, and S7comm were designed decades ago without authentication or encryption. If an unauthorized attacker sends a single rogue coil write or parameter perturbation, the physical consequences can be severe: overpressurized boilers, contaminated water supply, equipment breakdown, or environmental contamination.
            </p>
          </div>

          {/* Card 3: The Problem ICS-SHIELD Solves */}
          <div className="p-6 bg-navy-900/90 rounded-xl border border-slate-800 space-y-3 shadow-md">
            <div className="w-9 h-9 rounded-lg bg-navy-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-lg font-bold text-white font-mono">
              How Does ICS-SHIELD Bridge the Gap?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Security analysts cannot safely test attacks or defensive responses on live operational plants. ICS-SHIELD delivers an air-gapped, zero-risk digital twin laboratory combined with non-intrusive protocol parsing, multi-engine detection (rules, statistical baselines, and ML), and human-authorized response playbooks.
            </p>
          </div>
        </div>

        {/* Purdue Model Level Alignment */}
        <div className="p-6 bg-navy-900 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Architecture Standard</span>
              <h3 className="text-base font-bold text-white font-mono">Purdue Model (ISA-95) OT Boundary Coverage</h3>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800">
              Levels 0 through 3 Monitored
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-navy-950 rounded border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block">Level 0: Physical Process</span>
              <p className="text-slate-400 text-[11px] font-sans">Sensors, valves, actuators, tank level sensors, pressure transducers, flow meters.</p>
            </div>
            <div className="p-3 bg-navy-950 rounded border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block">Level 1: Basic Control</span>
              <p className="text-slate-400 text-[11px] font-sans">Programmable Logic Controllers (PLC-001, PLC-002) and Remote Terminal Units (RTU-001).</p>
            </div>
            <div className="p-3 bg-navy-950 rounded border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block">Level 2: Supervisory Control</span>
              <p className="text-slate-400 text-[11px] font-sans">Human Machine Interface (HMI-001), SCADA server nodes, and engineering workstations.</p>
            </div>
            <div className="p-3 bg-navy-950 rounded border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-bold block">Level 3: Operations & SOC</span>
              <p className="text-slate-400 text-[11px] font-sans">ICS-SHIELD SOC Dashboard, MITRE ATT&CK for ICS mapping, forensic evidence ledgers.</p>
            </div>
          </div>
        </div>

        {/* Target Audience Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
              Who Benefits From ICS-SHIELD?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Tailored for learners, researchers, and professional security analysts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {audiences.map((aud, idx) => (
              <div
                key={idx}
                className="p-5 bg-navy-900/70 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2.5"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded bg-navy-950 border border-slate-800 shrink-0">
                    {aud.icon}
                  </div>
                  <h4 className="font-bold text-sm text-slate-100 font-sans">{aud.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{aud.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
