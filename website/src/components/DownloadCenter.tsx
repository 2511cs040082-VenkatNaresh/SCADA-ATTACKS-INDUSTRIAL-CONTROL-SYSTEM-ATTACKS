import React, { useState } from 'react';
import { OFFICIAL_RELEASE } from '../data/releaseData';
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Cpu,
  HardDrive,
  Monitor,
  FileCode,
  AlertCircle,
  HelpCircle,
  Terminal,
} from 'lucide-react';

export const DownloadCenter: React.FC = () => {
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(OFFICIAL_RELEASE.sha256);
    setCopiedChecksum(true);
    setTimeout(() => setCopiedChecksum(false), 2500);
  };

  return (
    <section id="download" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            Software Distribution
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            Download ICS-SHIELD for Windows
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Download the official verified Windows executable installer. Engineered for Windows 10, 11, and Windows Server environments.
          </p>
        </div>

        {/* Primary Download Card */}
        <div className="max-w-4xl mx-auto bg-navy-900 border border-slate-700/80 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden font-sans">
          {/* Subtle Top Indicator Banner */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400" />

          <div className="space-y-8">
            {/* Top Product Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-bold text-white font-mono">
                    ICS-SHIELD for Windows
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {OFFICIAL_RELEASE.version} {OFFICIAL_RELEASE.channel}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  SCADA Attacks & Industrial Control System Defense Desktop Application
                </p>
              </div>

              {/* Version & Date Metadata */}
              <div className="text-left sm:text-right font-mono text-xs text-slate-400 space-y-0.5">
                <div>Release Date: <strong className="text-slate-200">{OFFICIAL_RELEASE.releaseDate}</strong></div>
                <div>Architecture: <strong className="text-slate-200">{OFFICIAL_RELEASE.architecture}</strong></div>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 bg-navy-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block uppercase text-[10px]">Package Format</span>
                <span className="font-bold text-slate-200 flex items-center space-x-1">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Windows (.exe)</span>
                </span>
              </div>

              <div className="p-3 bg-navy-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block uppercase text-[10px]">Installer Size</span>
                <span className="font-bold text-slate-200 flex items-center space-x-1">
                  <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                  <span>{OFFICIAL_RELEASE.installerSize}</span>
                </span>
              </div>

              <div className="p-3 bg-navy-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block uppercase text-[10px]">Supported OS</span>
                <span className="font-bold text-slate-200 flex items-center space-x-1">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Windows 10 / 11</span>
                </span>
              </div>

              <div className="p-3 bg-navy-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-500 block uppercase text-[10px]">Verification</span>
                <span className="font-bold text-emerald-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256 Validated</span>
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <a
                href={OFFICIAL_RELEASE.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-sm transition-all shadow-xl shadow-cyan-600/25 flex items-center justify-center space-x-2.5"
              >
                <Download className="w-5 h-5" />
                <span>DOWNLOAD FOR WINDOWS (.EXE)</span>
              </a>

              <a
                href={OFFICIAL_RELEASE.allReleasesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>View All GitHub Releases</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Cryptographic SHA-256 Checksum Display */}
            <div className="p-4 bg-navy-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SHA-256 Checksum Verification:</span>
                </span>
                <button
                  onClick={handleCopyChecksum}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
                  title="Copy SHA-256 hash"
                >
                  {copiedChecksum ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedChecksum ? 'Copied!' : 'Copy Hash'}</span>
                </button>
              </div>
              <div className="p-2.5 bg-navy-900 rounded border border-slate-800/80 font-mono text-[11px] text-slate-300 break-all select-all">
                {OFFICIAL_RELEASE.sha256}
              </div>
              <p className="text-[11px] font-sans text-slate-400">
                Verify integrity in PowerShell:{' '}
                <code className="text-cyan-300 font-mono text-[10px]">
                  Get-FileHash -Algorithm SHA256 .\ICS-SHIELD-Setup-1.0.0.exe
                </code>
              </p>
            </div>

            {/* Dual Execution Modes Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 font-sans">
              <div className="p-4 bg-navy-950/80 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400 block uppercase">
                  Mode 1: Standalone Desktop Mode
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Runs directly on your Windows PC with an embedded Node.js backend server and in-memory fallback baseline models. Perfect for standalone demonstrations, quick student labs, and zero-configuration review.
                </p>
              </div>

              <div className="p-4 bg-navy-950/80 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-400 block uppercase">
                  Mode 2: Full Multi-Container Lab Mode
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When Docker Desktop is installed, the desktop orchestrator seamlessly integrates with the multi-stage Docker environment, launching isolated bridge subnets, MySQL persistence, and Python ML services.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Requirements Comparison Table */}
        <div className="max-w-4xl mx-auto space-y-4 font-sans">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-mono">
              Hardware & System Requirements
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
              <thead className="bg-navy-900 text-slate-400 text-left">
                <tr>
                  <th className="p-3">Specification</th>
                  <th className="p-3">Minimum (Standalone Mode)</th>
                  <th className="p-3">Recommended (Full Lab Container Mode)</th>
                </tr>
              </thead>
              <tbody className="bg-navy-950 divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="p-3 font-semibold text-slate-200">Operating System</td>
                  <td className="p-3">{OFFICIAL_RELEASE.requirements.minimum.os}</td>
                  <td className="p-3 text-cyan-400">{OFFICIAL_RELEASE.requirements.recommended.os}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200">Processor (CPU)</td>
                  <td className="p-3">{OFFICIAL_RELEASE.requirements.minimum.cpu}</td>
                  <td className="p-3 text-cyan-400">{OFFICIAL_RELEASE.requirements.recommended.cpu}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200">System Memory (RAM)</td>
                  <td className="p-3">{OFFICIAL_RELEASE.requirements.minimum.ram}</td>
                  <td className="p-3 text-cyan-400">{OFFICIAL_RELEASE.requirements.recommended.ram}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200">Storage / Disk</td>
                  <td className="p-3">{OFFICIAL_RELEASE.requirements.minimum.disk}</td>
                  <td className="p-3 text-cyan-400">{OFFICIAL_RELEASE.requirements.recommended.disk}</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200">Runtime Dependencies</td>
                  <td className="p-3">{OFFICIAL_RELEASE.requirements.minimum.runtime}</td>
                  <td className="p-3 text-cyan-400">{OFFICIAL_RELEASE.requirements.recommended.runtime}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Release Highlights Accordion */}
        <div className="max-w-4xl mx-auto p-6 bg-navy-900 rounded-xl border border-slate-800 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-sm text-slate-100 font-mono">
              Release Notes & Verified Milestone Deliverables ({OFFICIAL_RELEASE.version})
            </span>
            <span className="text-xs text-emerald-400 font-mono">19 Test Suites Passed</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {OFFICIAL_RELEASE.highlights.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
