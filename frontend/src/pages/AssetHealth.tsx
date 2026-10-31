import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export const AssetHealth: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5050/api/v1/assets?limit=100')
      .then((res) => res.json())
      .then((res) => setAssets(res.data?.data || []))
      .catch(() => {});
  }, []);

  const healthyCount = assets.filter((a) => a.health_state === 'HEALTHY').length;
  const warningCount = assets.filter((a) => a.health_state === 'WARNING' || a.health_state === 'DEGRADED').length;
  const offlineCount = assets.filter((a) => a.health_state === 'OFFLINE' || a.status === 'OFFLINE').length;

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-soc-panelBorder pb-4">
        <h1 className="text-xl font-mono font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
          <Activity className="w-5 h-5 text-emerald-400" />
          ASSET HEALTH & TELEMETRY FRESHNESS MONITOR
        </h1>
        <p className="text-xs font-mono text-soc-textMuted mt-1">
          Operational Availability • Telemetry Freshness • Device Error Frequencies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded flex items-center justify-between">
          <div>
            <div className="text-xs text-soc-textMuted">HEALTHY ASSETS</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{healthyCount}</div>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded flex items-center justify-between">
          <div>
            <div className="text-xs text-soc-textMuted">WARNING / DEGRADED</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{warningCount}</div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded flex items-center justify-between">
          <div>
            <div className="text-xs text-soc-textMuted">OFFLINE / UNRESPONSIVE</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{offlineCount}</div>
          </div>
          <XCircle className="w-8 h-8 text-rose-500/40" />
        </div>
      </div>

      <div className="bg-soc-panel border border-soc-panelBorder rounded p-4 font-mono text-xs space-y-4">
        <div className="font-bold text-soc-textPrimary text-sm border-b border-soc-panelBorder pb-2">
          HEALTH FORMULATION EXPLANATION
        </div>
        <p className="text-soc-textSecondary">
          Asset Health is calculated transparently based on <strong>telemetry freshness (&lt;15s threshold)</strong>, <strong>device status (ONLINE/WARNING/OFFLINE)</strong>, and <strong>communication stability</strong>. Health is distinct from cybersecurity risk level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-slate-900 border border-soc-panelBorder p-3 rounded space-y-2">
              <div className="flex items-center justify-between font-bold text-soc-textPrimary">
                <span>{asset.asset_name}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded text-[10px]',
                  asset.health_state === 'HEALTHY' ? 'bg-emerald-950 text-emerald-400' :
                  asset.health_state === 'WARNING' ? 'bg-amber-950 text-amber-400' :
                  'bg-rose-950 text-rose-400'
                )}>
                  {asset.health_state} ({asset.health_score}%)
                </span>
              </div>
              <div className="text-[11px] text-soc-textMuted space-y-1">
                <div>IP: {asset.ip_address}</div>
                <div>Status: {asset.status}</div>
                <div>Last Telemetry: {asset.last_seen ? new Date(asset.last_seen).toLocaleTimeString() : 'N/A'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetHealth;
