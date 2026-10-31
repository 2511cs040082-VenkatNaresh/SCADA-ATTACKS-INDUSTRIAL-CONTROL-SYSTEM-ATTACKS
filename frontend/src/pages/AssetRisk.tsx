import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export const AssetRisk: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5050/api/v1/assets?limit=100')
      .then((res) => res.json())
      .then((res) => setAssets(res.data?.data || []))
      .catch(() => {});
  }, []);

  const highRisk = assets.filter((a) => a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL');

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-soc-panelBorder pb-4">
        <h1 className="text-xl font-mono font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          EXPLAINABLE ASSET RISK POSTURE ESTIMATES
        </h1>
        <p className="text-xs font-mono text-soc-textMuted mt-1">
          Factual Risk Estimation • Asset Criticality Weights • Anomaly & Exposure Factors
        </p>
      </div>

      <div className="bg-amber-950/40 border border-amber-600/50 p-4 rounded text-xs font-mono text-amber-200 flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="text-amber-400">RISK ESTIMATE NOTICE:</strong> All scores presented are deterministic risk estimates derived from asset criticality, recent laboratory security anomalies, and health state stability. They represent posture estimates rather than absolute threat classifications.
        </div>
      </div>

      <div className="bg-soc-panel border border-soc-panelBorder rounded overflow-hidden font-mono text-xs">
        <div className="p-4 bg-slate-900 border-b border-soc-panelBorder font-bold text-soc-textPrimary">
          TOP RISK RANKED ASSETS
        </div>

        <div className="divide-y divide-slate-800/60">
          {assets.map((ast) => (
            <div key={ast.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-800/40">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-soc-textPrimary text-sm">{ast.asset_name}</span>
                  <span className="text-soc-textMuted">({ast.ip_address})</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold',
                    ast.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    ast.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                    ast.risk_level === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-slate-800 text-soc-textMuted'
                  )}>
                    {ast.risk_level} RISK SCORE: {ast.risk_score}/100
                  </span>
                </div>
                <div className="text-xs text-soc-textMuted flex items-center space-x-4">
                  <span>Criticality: {ast.criticality}</span>
                  <span>•</span>
                  <span>Purdue Zone: {ast.zone || 'CELL_ZONE'}</span>
                  <span>•</span>
                  <span>Health: {ast.health_state}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-soc-panelBorder p-2.5 rounded text-[11px] text-soc-textSecondary min-w-[240px]">
                <div className="font-bold text-soc-textMuted mb-1">RISK FACTORS</div>
                <div>• Asset Criticality: {ast.criticality}</div>
                <div>• Health State: {ast.health_state}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetRisk;
