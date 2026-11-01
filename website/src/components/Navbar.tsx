import React, { useState, useEffect } from 'react';
import { Shield, Download, Github, Menu, X, Terminal, ExternalLink, Activity } from 'lucide-react';
import { OFFICIAL_RELEASE } from '../data/releaseData';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'features', label: 'Features' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'download', label: 'Download' },
    { id: 'install', label: 'Install Guide' },
    { id: 'docs', label: 'Docs' },
    { id: 'github', label: 'GitHub' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-navy-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/30 py-3'
          : 'bg-navy-950/80 backdrop-blur-sm border-b border-slate-800/40 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => handleLinkClick('hero')}
            className="flex items-center space-x-3 group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-navy-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-sm shadow-cyan-500/10">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-wider text-slate-100 font-mono">ICS-SHIELD</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-mono font-medium">
                  {OFFICIAL_RELEASE.version}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block -mt-0.5 font-sans">
                SCADA & OT Attack Detection Platform
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 font-mono text-xs">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeSection === link.id
                    ? 'text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-800/40'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-3 font-mono text-xs">
            <a
              href={OFFICIAL_RELEASE.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-navy-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors flex items-center space-x-1.5"
              title="View on GitHub"
            >
              <Github className="w-3.5 h-3.5 text-slate-300" />
              <span>GitHub</span>
            </a>

            <button
              onClick={() => handleLinkClick('download')}
              className="px-3.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-sm shadow-cyan-600/20 flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.exe)</span>
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-navy-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950 border-b border-slate-800 px-4 pt-3 pb-6 font-mono text-sm space-y-2 mt-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                activeSection === link.id
                  ? 'bg-cyan-950/60 text-cyan-400 font-bold border border-cyan-800/40'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            <a
              href={OFFICIAL_RELEASE.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-md bg-navy-900 border border-slate-700 text-slate-200 flex items-center justify-center space-x-2"
            >
              <Github className="w-4 h-4" />
              <span>View GitHub Repository</span>
            </a>
            <button
              onClick={() => handleLinkClick('download')}
              className="w-full py-2 px-3 rounded-md bg-cyan-600 text-white font-bold flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download for Windows (.exe)</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
