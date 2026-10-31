import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Network as NetworkIcon,
  GitMerge,
  Activity,
  BrainCircuit,
  AlertTriangle,
  ShieldAlert,
  Grid,
  Zap,
  PlaySquare,
  FileText,
  Users,
  Settings as SettingsIcon,
  Lock,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth, UserRole } from '../../context/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 text-cyan-400" /> },
  { name: 'Assets', path: '/assets', icon: <Server className="w-4 h-4 text-blue-400" /> },
  { name: 'Network', path: '/network', icon: <NetworkIcon className="w-4 h-4 text-emerald-400" /> },
  { name: 'Topology', path: '/topology', icon: <GitMerge className="w-4 h-4 text-purple-400" /> },
  { name: 'Process', path: '/process', icon: <Activity className="w-4 h-4 text-amber-400" /> },
  { name: 'Detections', path: '/detection', icon: <BrainCircuit className="w-4 h-4 text-sky-400" /> },
  { name: 'Alerts', path: '/alerts', icon: <AlertTriangle className="w-4 h-4 text-rose-400" /> },
  { name: 'Incidents', path: '/incidents', icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
  { name: 'MITRE ATT&CK', path: '/mitre', icon: <Grid className="w-4 h-4 text-indigo-400" /> },
  { name: 'Response', path: '/response', icon: <Zap className="w-4 h-4 text-yellow-400" />, allowedRoles: ['ADMIN', 'SECURITY_ANALYST'] },
  { name: 'Simulation', path: '/simulation', icon: <PlaySquare className="w-4 h-4 text-emerald-400" />, badge: 'STORY MODE' },
  { name: 'Reports', path: '/reports', icon: <FileText className="w-4 h-4 text-slate-400" /> },
  { name: 'Administration', path: '/admin', icon: <Users className="w-4 h-4 text-pink-400" />, allowedRoles: ['ADMIN'] },
  { name: 'Settings', path: '/settings', icon: <SettingsIcon className="w-4 h-4 text-slate-400" /> },
];

export const Sidebar: React.FC = () => {
  const { role, hasRole } = useAuth();

  return (
    <aside className="w-60 bg-soc-sidebar border-r border-soc-panelBorder flex flex-col h-full shrink-0 font-mono">
      <div className="p-3.5 border-b border-soc-panelBorder bg-slate-950/60 flex items-center justify-between">
        <div className="text-[10px] font-semibold text-soc-textMuted uppercase tracking-widest">
          SOC Directory
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-cyan-400 border border-slate-700 uppercase">
          {role}
        </span>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isRestricted = item.allowedRoles && !hasRole(item.allowedRoles);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-soc-panel text-cyan-400 font-semibold border-l-2 border-cyan-400 shadow-sm'
                    : 'text-soc-textSecondary hover:bg-slate-800/60 hover:text-soc-textPrimary',
                  isRestricted && 'opacity-60'
                )
              }
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.name}</span>
              </div>
              {item.badge ? (
                <span className="text-[8px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.2 rounded border border-emerald-800">
                  {item.badge}
                </span>
              ) : isRestricted ? (
                <Lock className="w-3 h-3 text-slate-500" />
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-soc-panelBorder bg-soc-bg/80 text-[10px] text-soc-textMuted flex items-center justify-between">
        <span>ICS-SHIELD SOC</span>
        <span className="text-emerald-400 font-bold">PHASE 16</span>
      </div>
    </aside>
  );
};
