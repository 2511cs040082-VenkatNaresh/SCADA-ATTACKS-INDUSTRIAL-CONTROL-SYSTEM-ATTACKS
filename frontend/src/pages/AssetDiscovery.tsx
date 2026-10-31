import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle, XCircle, AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export const AssetDiscovery: React.FC = () => {
  const [discoveries, setDiscoveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscoveries = () => {
    setLoading(true);
    fetch('http://localhost:5050/api/v1/discovery/assets')
      .then((res) => res.json())
      .then((res) => setDiscoveries(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiscoveries();
  }, []);

  const handleAction = (id: number, action: 'APPROVE' | 'IGNORE') => {
    fetch(`http://localhost:5050/api/v1/discovery/${id}/${action.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then((res) => res.json())
      .then(() => fetchDiscoveries())
      .catch(() => {});
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-soc-panelBorder pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
            <Cpu className="w-5 h-5 text-amber-400" />
            UNKNOWN ASSET DISCOVERY QUEUE
          </h1>
          <p className="text-xs font-mono text-soc-textMuted mt-1">
            Authorized Laboratory Asset Observations & Identification Workflow
          </p>
        </div>

        <button
          onClick={fetchDiscoveries}
          className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-textSecondary rounded transition font-mono text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs font-mono text-soc-textMuted">PENDING IDENTIFICATION</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {discoveries.filter((d) => d.identification_status === 'UNKNOWN').length}
          </div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs font-mono text-soc-textMuted">APPROVED ASSETS</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            {discoveries.filter((d) => d.identification_status === 'APPROVED').length}
          </div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs font-mono text-soc-textMuted">IGNORED DISCOVERIES</div>
          <div className="text-2xl font-mono font-bold text-soc-textMuted mt-1">
            {discoveries.filter((d) => d.identification_status === 'IGNORED').length}
          </div>
        </div>
      </div>

      <div className="bg-soc-panel border border-soc-panelBorder rounded overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-soc-panelBorder flex items-center justify-between font-mono text-xs font-bold text-soc-textPrimary">
          <span>OBSERVED UNKNOWN ASSET LOG (AUTHORIZATION REQUIRED)</span>
        </div>

        <div className="divide-y divide-slate-800/60 font-mono text-xs text-soc-textSecondary">
          {loading ? (
            <div className="p-8 text-center text-soc-textMuted">Loading discovery queue...</div>
          ) : discoveries.length === 0 ? (
            <div className="p-8 text-center text-soc-textMuted">No newly discovered assets. Laboratory environment is fully accounted for.</div>
          ) : (
            discoveries.map((disc) => (
              <div key={disc.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-800/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-soc-textPrimary text-sm">
                      {disc.hostname || `UNKNOWN-LAB-ASSET (${disc.ip_address})`}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      disc.identification_status === 'APPROVED' ? 'bg-emerald-950 text-emerald-400' :
                      disc.identification_status === 'IGNORED' ? 'bg-slate-800 text-soc-textMuted' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    )}>
                      {disc.identification_status}
                    </span>
                  </div>
                  <div className="text-xs text-soc-textMuted flex items-center space-x-4">
                    <span>IP: {disc.ip_address}</span>
                    <span>•</span>
                    <span>Protocol: {disc.protocol || 'MODBUS/TCP'}</span>
                    <span>•</span>
                    <span>Source: {disc.discovery_source}</span>
                  </div>
                </div>

                {disc.identification_status === 'UNKNOWN' && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleAction(disc.id, 'APPROVE')}
                      className="px-3 py-1.5 bg-emerald-950 border border-emerald-600 hover:bg-emerald-900 text-emerald-300 font-bold rounded flex items-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> APPROVE & REGISTER
                    </button>
                    <button
                      onClick={() => handleAction(disc.id, 'IGNORE')}
                      className="px-3 py-1.5 bg-slate-800 border border-soc-panelBorder hover:bg-slate-700 text-soc-textMuted rounded flex items-center gap-1.5 transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> IGNORE
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetDiscovery;
