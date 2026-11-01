import React, { useState } from 'react';
import { OFFICIAL_RELEASE } from '../data/releaseData';
import { Github, Code, BookOpen, Bug, Download, Copy, Check, ExternalLink, Star, GitFork } from 'lucide-react';

export const GitHubSection: React.FC = () => {
  const [copiedClone, setCopiedClone] = useState(false);

  const cloneCommand = `git clone ${OFFICIAL_RELEASE.repoUrl}.git`;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <section id="github" className="py-20 bg-navy-950 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-4xl mx-auto bg-navy-900 border border-slate-700/80 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-navy-950 rounded-xl border border-slate-800 text-white shrink-0">
                <Github className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Open Source Defensive Platform
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-mono">
                  GitHub Repository & Community
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  2511cs040082-VenkatNaresh / SCADA-ATTACKS-INDUSTRIAL-CONTROL-SYSTEM-ATTACKS
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <a
                href={OFFICIAL_RELEASE.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-navy-950 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>Star on GitHub</span>
              </a>
            </div>
          </div>

          {/* Quick Clone Snippet */}
          <div className="p-4 bg-navy-950 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5 uppercase font-semibold">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>Clone via HTTPS:</span>
              </span>
              <button
                onClick={handleCopyClone}
                className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                {copiedClone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedClone ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-navy-900 rounded border border-slate-800/80 text-cyan-300 overflow-x-auto">
              {cloneCommand}
            </pre>
          </div>

          {/* Navigation Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
            <a
              href={OFFICIAL_RELEASE.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-navy-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors flex items-center justify-center space-x-2 text-center"
            >
              <Code className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>View Source Code</span>
            </a>

            <a
              href={`${OFFICIAL_RELEASE.repoUrl}/tree/main/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-navy-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors flex items-center justify-center space-x-2 text-center"
            >
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Explore Docs</span>
            </a>

            <a
              href={`${OFFICIAL_RELEASE.repoUrl}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-navy-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors flex items-center justify-center space-x-2 text-center"
            >
              <Bug className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Report an Issue</span>
            </a>

            <a
              href={OFFICIAL_RELEASE.allReleasesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 transition-colors flex items-center justify-center space-x-2 text-center font-bold"
            >
              <Download className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Latest Releases</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
