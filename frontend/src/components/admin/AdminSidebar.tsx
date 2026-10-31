import React from 'react';
import { LayoutDashboard, Users, ShieldCheck, Key, Laptop, Settings, Database, History, FlaskConical, Activity } from 'lucide-react';

export type AdminTab = 'overview' | 'users' | 'roles' | 'permissions' | 'sessions' | 'settings' | 'retention' | 'audit' | 'simulation' | 'system';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Admin Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'roles', label: 'Roles & RBAC', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'permissions', label: 'Permission Matrix', icon: <Key className="w-4 h-4" /> },
    { id: 'sessions', label: 'Active Sessions', icon: <Laptop className="w-4 h-4" /> },
    { id: 'settings', label: 'System Configuration', icon: <Settings className="w-4 h-4" />, badge: '16 Categories' },
    { id: 'retention', label: 'Retention Policies', icon: <Database className="w-4 h-4" /> },
    { id: 'simulation', label: 'Lab Scenarios', icon: <FlaskConical className="w-4 h-4" />, badge: 'LAB ONLY' },
    { id: 'audit', label: 'Audit Logs', icon: <History className="w-4 h-4" /> },
    { id: 'system', label: 'System Health', icon: <Activity className="w-4 h-4" /> },
  ];

  return (
    <div className="w-64 bg-soc-panelBg border-r border-soc-panelBorder p-4 space-y-1">
      <div className="text-[11px] font-mono uppercase tracking-wider text-soc-textMuted px-3 py-2">
        Admin Center Directory
      </div>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-mono transition-colors ${
            activeTab === tab.id
              ? 'bg-soc-accent/15 text-soc-accent border border-soc-accent/30 font-bold'
              : 'text-soc-textSecondary hover:bg-soc-cardBg hover:text-soc-textPrimary'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {tab.icon}
            <span>{tab.label}</span>
          </div>
          {tab.badge && (
            <span className={`px-1.5 py-0.5 text-[10px] rounded border ${
              tab.badge === 'LAB ONLY'
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
