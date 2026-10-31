import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from '../components/layout/Topbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { CommandPalette } from '../components/common/CommandPalette';
import { fetchHealthStatus } from '../services/api';
import { SystemHealthData } from '../types';

export const MainLayout: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchHealthStatus().then(setHealth);
    const interval = setInterval(() => {
      fetchHealthStatus().then(setHealth);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const systemStatus = health?.status === 'ONLINE' ? 'HEALTHY' : 'WARNING';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-soc-bg text-soc-textPrimary font-sans">
      {/* Top Header Shell */}
      <Topbar systemStatus={systemStatus} onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Body with Sidebar and Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Directory */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-soc-bg p-6">
          <div className="max-w-7xl w-full mx-auto flex-1">
            <Breadcrumbs />
            <Outlet />
          </div>

          {/* Persistent Footer */}
          <footer className="mt-8 pt-3 border-t border-soc-panelBorder flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-soc-textMuted gap-2">
            <div className="flex items-center space-x-4">
              <span className="text-cyan-400 font-semibold">ICS-SHIELD UNIFIED SOC</span>
              <span>•</span>
              <span>BACKEND: {health?.status || 'CONNECTING...'}</span>
              <span>•</span>
              <span>DB: {health?.components?.database?.status || 'CONNECTED'}</span>
            </div>
            <div>
              <span>MITRE ATT&CK for ICS v14 Matrix Integrated</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Global Command Palette & Search Modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
