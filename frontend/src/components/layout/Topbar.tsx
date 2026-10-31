import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Bell, User, Wifi, Check, ExternalLink, Search, FlaskConical, ChevronDown } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth, UserRole } from '../../context/AuthContext';
import { apiService } from '../../services/api';

interface TopbarProps {
  systemStatus?: string;
  onOpenSearch?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ systemStatus = 'HEALTHY', onOpenSearch }) => {
  const navigate = useNavigate();
  const { status, events, notifications: realTimeNotifications, markNotificationRead, clearNotifications, simulationState } = useWebSocket();
  const { user, role, setRole } = useAuth();
  const isConnected = status === 'CONNECTED';

  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);

  const rolesList: { role: UserRole; label: string; color: string }[] = [
    { role: 'ADMIN', label: 'Administrator (Full Access)', color: 'text-rose-400' },
    { role: 'SECURITY_ANALYST', label: 'Security Analyst', color: 'text-cyan-400' },
    { role: 'SOC_OPERATOR', label: 'SOC Operator', color: 'text-emerald-400' },
    { role: 'OT_OPERATOR', label: 'OT Plant Operator', color: 'text-amber-400' },
    { role: 'VIEWER', label: 'ReadOnly Viewer', color: 'text-slate-400' },
  ];

  const simulationActive = simulationState.status === 'RUNNING';
  const unreadCount = realTimeNotifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 bg-soc-header border-b border-soc-panelBorder px-4 flex items-center justify-between shrink-0 relative z-40 font-mono">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="p-1.5 bg-soc-panel rounded border border-soc-telemetry/30 text-soc-telemetry shadow-[0_0_10px_rgba(56,189,248,0.15)] cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-wider text-sm text-soc-textPrimary">ICS-SHIELD</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-800">
              PHASE 16 SOC
            </span>
          </div>
          <span className="text-[10px] text-soc-textMuted block -mt-0.5">
            SCADA & Industrial Control System Security Operations Center
          </span>
        </div>
      </div>

      {/* Persistent Environment Indicator Banner */}
      <div className="flex items-center space-x-3">
        {simulationActive ? (
          <div className="flex items-center space-x-2 px-3 py-1 bg-amber-950/80 border border-amber-600/80 text-amber-300 rounded font-bold text-xs shadow-lg animate-pulse">
            <FlaskConical className="w-4 h-4 text-amber-400" />
            <span>🧪 SIMULATION ACTIVE</span>
            <span className="text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded text-amber-200 border border-amber-700">LAB ONLY</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 bg-soc-panel rounded border border-soc-panelBorder text-xs">
            <span className="text-soc-textMuted">ENVIRONMENT:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span>🟡 LAB</span>
            </span>
          </div>
        )}

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 transition"
          title="Search Command Palette (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Search...</span>
          <kbd className="px-1.5 py-0.5 text-[9px] bg-slate-950 text-slate-400 border border-slate-800 rounded font-bold">⌘K</kbd>
        </button>

        {/* System Health Badge */}
        <div className="hidden md:flex items-center space-x-2">
          <StatusBadge status={systemStatus} size="sm" />
        </div>

        {/* WebSocket Real-time Status */}
        <div className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] border border-soc-panelBorder bg-soc-bg">
          <Wifi className={`w-3 h-3 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className={isConnected ? 'text-emerald-400' : 'text-slate-400'}>
            {isConnected ? 'LIVE WS' : 'WS RECONNECTING'}
          </span>
        </div>
      </div>

      {/* Right Controls: Notifications & Role Switcher */}
      <div className="flex items-center space-x-3">
        {/* Notifications Icon & Drawer */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
            className="relative p-2 text-soc-textSecondary hover:text-soc-textPrimary hover:bg-soc-panel rounded border border-transparent hover:border-soc-panelBorder transition-colors"
            title="Security Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </>
            )}
          </button>

          {showNotificationDrawer && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 text-xs">
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">Real-Time Security Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-cyan-400 hover:underline flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Clear notifications</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {realTimeNotifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">No active notifications</div>
                ) : (
                  realTimeNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setShowNotificationDrawer(false);
                        if (n.link) navigate(n.link);
                      }}
                      className={`p-3 hover:bg-slate-800/80 cursor-pointer transition ${
                        !n.read ? 'bg-slate-900/90 border-l-2 border-cyan-500' : 'opacity-75'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 bg-slate-950 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setShowNotificationDrawer(false);
                    navigate('/alerts');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-medium text-[11px] flex items-center justify-center space-x-1 mx-auto"
                >
                  <span>View All Alerts Console</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-soc-panelBorder" />

        {/* User Profile & Role Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 px-2 py-1 bg-soc-panel rounded border border-soc-panelBorder hover:border-slate-600 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-soc-textPrimary font-medium text-[11px] leading-tight">{user.username}</div>
              <div className="text-cyan-400 font-bold text-[9px] uppercase tracking-wider flex items-center space-x-1">
                <span>{role}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </div>
            </div>
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="p-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-semibold">
                Switch Security Role (RBAC Testing)
              </div>
              <div className="space-y-1 mt-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setRole(r.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left ${
                      role === r.role ? 'bg-cyan-950 border border-cyan-800 font-bold text-cyan-300' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className={r.color}>{r.label}</span>
                    {role === r.role && <Check className="w-3 h-3 text-cyan-400" />}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center">
                Backend RBAC remains authoritative.
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
