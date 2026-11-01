import React from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, Info, Lock } from 'lucide-react';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      title: 'Real-Time Visibility into SCADA Fieldbuses',
      desc: 'Centralizes continuous telemetry from Purdue Levels 0 through 3, granting immediate insight into Modbus TCP registers, DNP3 points, and Siemens S7 operating modes.'
    },
    {
      title: 'Zero Risk of Industrial Equipment Damage',
      desc: 'Conduct aggressive cyberattack simulations and evaluate response playbooks inside an isolated virtual laboratory digital twin with strict air-gapped safety guards.'
    },
    {
      title: 'Multi-Engine Threat Detection without Drift',
      desc: 'Combines deterministic rules for sub-millisecond known signature triggers, statistical Z-score baseline modeling, and machine learning Isolation Forest anomaly detection.'
    },
    {
      title: 'Formal MITRE ATT&CK for ICS Grounding',
      desc: 'Grounds every detection and alert into the industry-standard MITRE ATT&CK for ICS v14 taxonomy, helping security teams understand attacker tactics and countermeasures.'
    },
    {
      title: 'Defensive Playbooks with Human Authorization',
      desc: 'Enforces strict Separation of Duties by requiring explicit security analyst approval before simulated response actions (like port isolation or device resets) can execute.'
    },
    {
      title: 'Forensic Audit Trails & Cryptographic Reports',
      desc: 'Maintains an immutable chain-of-custody ledger with SHA-256 evidence hashing and exports compliance-ready executive and technical post-mortem reports.'
    },
    {
      title: 'Accessible Learning Testbed for Students & Researchers',
      desc: 'Removes the high cost barrier of physical PLCs and RTUs, enabling students and university labs to explore SCADA cybersecurity through hands-on practice.'
    },
    {
      title: 'Lightweight Standalone Desktop & Docker Support',
      desc: 'Runs out-of-the-box as an independent Windows desktop application with an embedded server, or scales to a full multi-container Docker environment.'
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            Real-World Impact
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            Platform Benefits & Defensive Grounding
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Engineered to empower security analysts, educators, and researchers with genuine industrial visibility and zero physical operational hazard.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {benefits.map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-navy-900 rounded-xl border border-slate-800 space-y-2 flex items-start space-x-4 shadow-sm"
            >
              <div className="p-2 bg-navy-950 border border-cyan-500/30 rounded-lg text-cyan-400 shrink-0 mt-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base mb-1">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Responsible Cybersecurity Scope Box */}
        <div className="p-6 bg-navy-900/60 border border-slate-800 rounded-xl max-w-4xl mx-auto space-y-3 font-sans">
          <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold text-xs uppercase">
            <Info className="w-4 h-4 shrink-0" />
            <span>Scope & Defensive Principles Disclaimer</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ICS-SHIELD is strictly a <strong>defensive cybersecurity research, educational, and simulation platform</strong>. It does not connect to live operational utility grids, nuclear facilities, or production industrial machinery by default. All attack simulation features are strictly isolated within the air-gapped laboratory digital twin. No software can guarantee 100% prevention of cyber incidents; ICS-SHIELD is designed to optimize visibility, accelerate detection, and facilitate disciplined incident response.
          </p>
        </div>
      </div>
    </section>
  );
};
