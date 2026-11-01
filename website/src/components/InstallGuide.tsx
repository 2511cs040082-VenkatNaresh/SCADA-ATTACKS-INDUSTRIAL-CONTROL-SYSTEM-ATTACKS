import React, { useState } from 'react';
import {
  Download,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const InstallGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INSTALLER' | 'PYTHON' | 'DOCKER'>('INSTALLER');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const installerSteps = [
    {
      step: 1,
      title: 'Download the Verified Windows Installer',
      desc: 'Download the official ICS-SHIELD-Setup-1.0.0.exe installer package directly from the Download Center or GitHub Releases.',
      code: 'curl -LO https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS/releases/download/v1.0.0/ICS-SHIELD-Setup-1.0.0.exe',
      id: 'step1'
    },
    {
      step: 2,
      title: 'Verify Cryptographic Integrity (SHA-256)',
      desc: 'Verify that the downloaded executable matches the official release hash before running.',
      code: 'Get-FileHash -Algorithm SHA256 .\\ICS-SHIELD-Setup-1.0.0.exe\n# Match: 9f83a48e658bb23b827e8a93ef07a6e1f0e4b85c141029c9a295841e264c9103',
      id: 'step2'
    },
    {
      step: 3,
      title: 'Run the Setup Wizard',
      desc: 'Launch ICS-SHIELD-Setup-1.0.0.exe. The NSIS installer will guide you through directory selection and create desktop shortcuts.',
      id: 'step3'
    },
    {
      step: 4,
      title: 'Automated Dependency & System Diagnostics',
      desc: 'Upon initial launch, the application checks port availability (ports 5050 & 3050) and detects whether Docker Desktop is installed for container mode.',
      id: 'step4'
    },
    {
      step: 5,
      title: 'Launch SOC Command Center & Sign In',
      desc: 'The desktop app automatically starts the backend API and opens the SOC Dashboard. Log in with the pre-seeded credentials:',
      code: '# Analyst Credentials:\nUsername: soc_analyst\nPassword: password123\n\n# Administrator Credentials:\nUsername: admin\nPassword: admin123',
      id: 'step5'
    },
    {
      step: 6,
      title: 'Run First Controlled Cyberattack Simulation',
      desc: 'Navigate to Simulation Laboratory (/simulation), select Master Story Mode or Scenario SIM-MODBUS-WRITE-001, and observe real-time detection.',
      id: 'step6'
    }
  ];

  return (
    <section id="install" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40">
            Setup & Deployment
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-mono">
            Installation & Getting Started Guide
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Choose your preferred deployment method: Standalone Windows Installer, Python Source Launcher, or Production Docker Compose.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab('INSTALLER')}
            className={`px-4 py-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
              activeTab === 'INSTALLER'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow-lg shadow-cyan-950/30'
                : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4 text-cyan-400" />
            <span>Method 1: Windows Installer (.exe)</span>
          </button>

          <button
            onClick={() => setActiveTab('PYTHON')}
            className={`px-4 py-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
              activeTab === 'PYTHON'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow-lg shadow-cyan-950/30'
                : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Method 2: One-Click Python Launcher (`run.py`)</span>
          </button>

          <button
            onClick={() => setActiveTab('DOCKER')}
            className={`px-4 py-2.5 rounded-xl border flex items-center space-x-2 transition-all ${
              activeTab === 'DOCKER'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold shadow-lg shadow-cyan-950/30'
                : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Method 3: Docker Compose (Air-Gapped Lab)</span>
          </button>
        </div>

        {/* Tab 1: Windows Installer (.exe) Walkthrough */}
        {activeTab === 'INSTALLER' && (
          <div className="max-w-4xl mx-auto space-y-6 font-sans">
            <div className="grid grid-cols-1 gap-4">
              {installerSteps.map((st) => (
                <div
                  key={st.step}
                  className="p-5 bg-navy-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-4">
                    <span className="w-8 h-8 rounded-lg bg-navy-950 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-sm flex items-center justify-center shrink-0">
                      {st.step}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-100 text-sm font-sans">{st.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{st.desc}</p>
                    </div>
                  </div>

                  {st.code && (
                    <div className="w-full sm:w-80 shrink-0 bg-navy-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 text-[11px] font-mono relative group">
                      <button
                        onClick={() => copyCode(st.code!, st.id)}
                        className="absolute top-2 right-2 p-1 rounded bg-slate-900 text-slate-400 hover:text-white"
                        title="Copy command"
                      >
                        {copiedSnippet === st.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <pre className="overflow-x-auto whitespace-pre-wrap pr-6">{st.code}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Python Source Code Launcher */}
        {activeTab === 'PYTHON' && (
          <div className="max-w-4xl mx-auto bg-navy-900 rounded-xl border border-slate-800 p-6 sm:p-8 space-y-6 font-sans">
            <div>
              <h3 className="text-lg font-bold text-white font-mono mb-1">
                Run Directly From Source Code with `python run.py`
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Ideal for developers, academic researchers, and SOC analysts running on Windows, macOS, or Linux.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-navy-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Step 1: Clone Repository and Navigate to Folder</span>
                  <button
                    onClick={() => copyCode('git clone https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS.git\ncd SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS', 'py1')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copiedSnippet === 'py1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-cyan-300 p-2 bg-navy-900 rounded overflow-x-auto">
git clone https://github.com/2511cs040082-VenkatNaresh/SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS.git
cd SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS
                </pre>
              </div>

              <div className="p-4 bg-navy-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Step 2: Execute One-Click Launcher</span>
                  <button
                    onClick={() => copyCode('python run.py', 'py2')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copiedSnippet === 'py2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-emerald-400 p-2 bg-navy-900 rounded overflow-x-auto">
python run.py
                </pre>
                <p className="text-[11px] font-sans text-slate-400">
                  Automatically clears stale background ports, validates Node.js/NPM, starts Backend (5050) & Frontend (3050), and opens your default browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Docker Compose Air-Gapped Lab */}
        {activeTab === 'DOCKER' && (
          <div className="max-w-4xl mx-auto bg-navy-900 rounded-xl border border-slate-800 p-6 sm:p-8 space-y-6 font-sans">
            <div>
              <h3 className="text-lg font-bold text-white font-mono mb-1">
                Deploy with Docker Compose (Multi-Stage Containers)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Deploy full enterprise containers with internal bridge networks, healthcheck probes, and MySQL persistence.
              </p>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-navy-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Step 1: Prepare Environment File</span>
                  <button
                    onClick={() => copyCode('cp .env.example .env', 'dk1')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copiedSnippet === 'dk1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-cyan-300 p-2 bg-navy-900 rounded overflow-x-auto">
cp .env.example .env
                </pre>
              </div>

              <div className="p-4 bg-navy-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Step 2: Launch Air-Gapped Laboratory Profile</span>
                  <button
                    onClick={() => copyCode('docker-compose -f docker-compose.lab.yml up -d --build', 'dk2')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copiedSnippet === 'dk2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-emerald-400 p-2 bg-navy-900 rounded overflow-x-auto">
docker-compose -f docker-compose.lab.yml up -d --build
                </pre>
              </div>

              <div className="p-4 bg-navy-950 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>Step 3: Run Full Validation Test Suite</span>
                  <button
                    onClick={() => copyCode('node tests/run_all_tests.js', 'dk3')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copiedSnippet === 'dk3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="text-cyan-300 p-2 bg-navy-900 rounded overflow-x-auto">
node tests/run_all_tests.js
# Expected: 19/19 Test Suites Passed (100% Pass Rate)
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
