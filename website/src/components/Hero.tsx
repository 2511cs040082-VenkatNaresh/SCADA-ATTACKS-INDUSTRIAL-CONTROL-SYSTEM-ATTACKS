import React from 'react';
import { Download, Shield, Github, ArrowRight, CheckCircle2, Lock, Cpu, Radio, Sparkles } from 'lucide-react';
import { OFFICIAL_RELEASE } from '../data/releaseData';
import { SocPreview } from './SocPreview';

interface HeroProps {
  onExplore: () => void;
  onDownload: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onDownload }) => {
  return (
    <section id="hero" className="pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden relative">
      {/* Background Subtle Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-900 border border-cyan-500/30 text-cyan-400 font-mono text-xs shadow-sm shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold">{OFFICIAL_RELEASE.version} Official Release</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Windows Executable Ready</span>
          </div>

          {/* Main Headings */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-mono">
              ICS-SHIELD
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl font-semibold tracking-wide text-cyan-400 font-mono uppercase">
              SCADA ATTACKS & INDUSTRIAL CONTROL SYSTEM ATTACKS
            </p>
          </div>

          {/* Tagline */}
          <div className="text-xl sm:text-2xl font-bold text-slate-100 italic tracking-tight font-sans">
            &ldquo;Monitor. Detect. Investigate. Defend.&rdquo;
          </div>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-sans">
            A defensive cybersecurity platform engineered to monitor industrial control systems, detect suspicious activities, identify protocol anomalies across Modbus TCP, DNP3, and Siemens S7comm, and support incident response through intelligent detection engines and controlled air-gapped laboratory simulations.
          </p>

          {/* Author Byline */}
          <div className="text-xs font-mono text-slate-400">
            Platform Architect & Developer:{' '}
            <strong className="text-slate-200">Venkat Naresh</strong>
          </div>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-mono text-xs sm:text-sm">
            <button
              onClick={onDownload}
              className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-600/25 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows (.exe)</span>
            </button>

            <button
              onClick={onExplore}
              className="px-6 py-3 rounded-lg bg-navy-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold transition-colors flex items-center space-x-2"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>

            <a
              href={OFFICIAL_RELEASE.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-lg bg-navy-950 hover:bg-navy-900 border border-slate-800 text-slate-300 font-semibold transition-colors flex items-center space-x-2"
            >
              <Github className="w-4 h-4 text-slate-400" />
              <span>View GitHub</span>
            </a>
          </div>

          {/* Trust Guarantees Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Air-Gapped Lab Safety</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>MITRE ATT&CK for ICS v14</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>19/19 Tests Passed (100%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Windows 10/11 x64 Installer</span>
            </span>
          </div>
        </div>

        {/* Interactive Application Preview Section */}
        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
          <div className="text-center mb-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Interactive Dashboard Preview • Toggle Live Simulation Modes Below
            </span>
          </div>
          <SocPreview />
        </div>
      </div>
    </section>
  );
};
