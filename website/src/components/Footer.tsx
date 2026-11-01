import React from 'react';
import { Shield, Github, Heart, Lock, ExternalLink } from 'lucide-react';
import { OFFICIAL_RELEASE } from '../data/releaseData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800 text-slate-400 font-sans text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Attribution */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-navy-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-base text-slate-100 font-mono tracking-wider">ICS-SHIELD</span>
            </div>
            <p className="text-slate-300 text-xs font-mono uppercase tracking-wide">
              SCADA ATTACKS & INDUSTRIAL CONTROL SYSTEM ATTACKS
            </p>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A defensive cybersecurity software platform designed for real-time SCADA monitoring, protocol anomaly detection, MITRE ATT&CK for ICS classification, and air-gapped laboratory attack simulations.
            </p>
            <div className="pt-1 text-slate-300 font-mono text-xs">
              Platform Architect & Developer:{' '}
              <strong className="text-white">Venkat Naresh</strong>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3 font-mono">
            <span className="text-slate-200 uppercase font-bold text-[11px] block tracking-wider">
              Navigation
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('hero')} className="hover:text-cyan-400 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-cyan-400 transition-colors">
                  About the Project
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-cyan-400 transition-colors">
                  16 Verified Modules
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('architecture')} className="hover:text-cyan-400 transition-colors">
                  System Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('download')} className="hover:text-cyan-400 transition-colors">
                  Download Windows (.exe)
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Open Source */}
          <div className="space-y-3 font-mono">
            <span className="text-slate-200 uppercase font-bold text-[11px] block tracking-wider">
              Resources & Repository
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('install')} className="hover:text-cyan-400 transition-colors">
                  Installation Guide
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-cyan-400 transition-colors">
                  Documentation & FAQs
                </button>
              </li>
              <li>
                <a
                  href={OFFICIAL_RELEASE.allReleasesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <span>Releases ({OFFICIAL_RELEASE.version})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={OFFICIAL_RELEASE.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href={`${OFFICIAL_RELEASE.repoUrl}/blob/main/LICENSE`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center space-x-1"
                >
                  <span>License & Permissions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal, Disclaimer & Integrity Note */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 font-mono text-[11px]">
          <div>
            © {new Date().getFullYear()} ICS-SHIELD • Developed by <strong>Venkat Naresh</strong>. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400/90">
              <Lock className="w-3 h-3" />
              <span>Strict Air-Gapped Defensive Isolation</span>
            </span>
            <span className="text-slate-600">|</span>
            <span>MITRE ATT&CK for ICS v14</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
