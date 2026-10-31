import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Server, Search, Filter, Eye, RefreshCw, CheckCircle, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { cn } from '../utils/cn';

export const Assets: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

  const fetchAssets = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (healthFilter) params.append('health', healthFilter);
    if (riskFilter) params.append('risk', riskFilter);
    params.append('page', page.toString());
    params.append('limit', '25');

    fetch(`http://localhost:5050/api/v1/assets?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setAssets(res.data.data || []);
          setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
  }, [search, statusFilter, healthFilter, riskFilter, page]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-soc-panelBorder pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
            <Server className="w-5 h-5 text-soc-telemetry" />
            ICS ASSET INVENTORY & DISCOVERY
          </h1>
          <p className="text-xs font-mono text-soc-textMuted mt-1">
            Purdue Level 0-3 Asset Inventory • Real-Time Health & Risk Assessment
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <Link
            to="/assets/discovery"
            className="px-3 py-1.5 bg-amber-950/80 border border-amber-600/50 hover:bg-amber-900 text-amber-300 rounded font-semibold transition flex items-center gap-1.5"
          >
            <Cpu className="w-4 h-4" />
            Discovery Queue
          </Link>
          <button
            onClick={fetchAssets}
            className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-textSecondary rounded transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-soc-textMuted" />
          <input
            type="text"
            placeholder="Search by asset name, IP, MAC, hostname, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-soc-bg border border-soc-panelBorder px-3 py-1.5 rounded text-soc-textPrimary focus:outline-none focus:border-soc-telemetry w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-soc-bg border border-soc-panelBorder px-2.5 py-1.5 rounded text-soc-textPrimary focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ONLINE">ONLINE</option>
            <option value="WARNING">WARNING</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>

          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="bg-soc-bg border border-soc-panelBorder px-2.5 py-1.5 rounded text-soc-textPrimary focus:outline-none"
          >
            <option value="">All Health</option>
            <option value="HEALTHY">HEALTHY</option>
            <option value="DEGRADED">DEGRADED</option>
            <option value="WARNING">WARNING</option>
            <option value="OFFLINE">OFFLINE</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-soc-bg border border-soc-panelBorder px-2.5 py-1.5 rounded text-soc-textPrimary focus:outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="LOW">LOW Risk</option>
            <option value="MEDIUM">MEDIUM Risk</option>
            <option value="HIGH">HIGH Risk</option>
            <option value="CRITICAL">CRITICAL Risk</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-soc-panel border border-soc-panelBorder rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900 border-b border-soc-panelBorder text-soc-textMuted uppercase text-[11px]">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Type</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Health</th>
                <th className="p-3">Criticality</th>
                <th className="p-3">Risk Estimate</th>
                <th className="p-3">Last Seen</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-soc-textSecondary">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-soc-textMuted">
                    Loading asset inventory...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-soc-textMuted">
                    No matching assets found.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const lastSeenStr = asset.last_seen ? new Date(asset.last_seen).toLocaleTimeString() : 'Never';

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-soc-textPrimary flex items-center gap-2">
                        <Server className="w-4 h-4 text-soc-telemetry shrink-0" />
                        <div>
                          <div>{asset.asset_name}</div>
                          <div className="text-[10px] text-soc-textMuted font-normal">{asset.vendor || 'Siemens / AB'}</div>
                        </div>
                      </td>
                      <td className="p-3">{asset.asset_type || 'PLC'}</td>
                      <td className="p-3 font-mono text-soc-textPrimary">{asset.ip_address}</td>
                      <td className="p-3">{asset.zone || 'CELL_ZONE'}</td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          asset.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          asset.status === 'WARNING' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        )}>
                          {asset.status}
                        </span>
                      </td>

                      {/* Health State */}
                      <td className="p-3">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          asset.health_state === 'HEALTHY' ? 'bg-emerald-950 text-emerald-400' :
                          asset.health_state === 'WARNING' ? 'bg-amber-950 text-amber-400' :
                          'bg-rose-950 text-rose-400'
                        )}>
                          {asset.health_state} ({asset.health_score}%)
                        </span>
                      </td>

                      {/* Criticality */}
                      <td className="p-3 font-semibold">{asset.criticality}</td>

                      {/* Risk */}
                      <td className="p-3">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          asset.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          asset.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                          asset.risk_level === 'MEDIUM' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-slate-800 text-soc-textMuted'
                        )}>
                          {asset.risk_level} ({asset.risk_score})
                        </span>
                      </td>

                      <td className="p-3 text-soc-textMuted">{lastSeenStr}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          className="px-2.5 py-1 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-telemetry rounded transition flex items-center gap-1 font-semibold ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-900 border-t border-soc-panelBorder flex items-center justify-between font-mono text-xs text-soc-textMuted">
          <div>
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total assets)
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 bg-soc-panel border border-soc-panelBorder rounded disabled:opacity-40 hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 bg-soc-panel border border-soc-panelBorder rounded disabled:opacity-40 hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assets;
