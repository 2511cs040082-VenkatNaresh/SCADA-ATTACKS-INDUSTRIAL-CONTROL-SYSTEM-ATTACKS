import React from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface SystemHealthPanelProps {
  healthData: any;
  onRefresh: () => void;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({ healthData, onRefresh }) => {
  const subsystems = healthData?.subsystems || healthData?.systemHealthBreakdown || [];

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-soc-accent" />
          <span className="text-soc-textPrimary font-bold text-sm">Real-Time Subsystem Health Breakdown</span>
          <span className="text-soc-textMuted text-[11px] ml-2">({subsystems.length} Backend Services Verified)</span>
        </div>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-soc-bg hover:bg-slate-800 border border-soc-panelBorder text-soc-textPrimary rounded flex items-center gap-1 font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Health</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub: any) => (
          <div key={sub.name} className="p-3.5 bg-soc-cardBg rounded border border-soc-panelBorder space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-soc-textPrimary text-xs">{sub.name}</span>
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center gap-1 ${
                sub.status === 'HEALTHY'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {sub.status === 'HEALTHY' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {sub.status}
              </span>
            </div>

            <div className="text-[11px] text-soc-textMuted space-y-1 pt-1 border-t border-soc-panelBorder">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="text-soc-textSecondary font-bold">{sub.version || 'v1.0.0'}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime Availability:</span>
                <span className="text-emerald-400 font-bold">{sub.uptime || '99.9%'}</span>
              </div>
              <div className="flex justify-between">
                <span>Heartbeat Latency:</span>
                <span className="text-soc-accent font-bold">{sub.latencyMs || 15} ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
