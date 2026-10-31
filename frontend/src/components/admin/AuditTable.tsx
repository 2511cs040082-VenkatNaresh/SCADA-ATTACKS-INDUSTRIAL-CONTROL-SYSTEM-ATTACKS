import React, { useState } from 'react';
import { History, Search, Filter, Shield } from 'lucide-react';
import { apiService } from '../../services/api';

interface AuditTableProps {
  logs: any[];
  onRefresh: () => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');

  const filteredLogs = logs.filter((l) => {
    if (actionFilter && l.action !== actionFilter) return false;
    if (resultFilter && l.result !== resultFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        l.action.toLowerCase().includes(s) ||
        l.resourceType.toLowerCase().includes(s) ||
        (l.username && l.username.toLowerCase().includes(s)) ||
        (l.resourceId && l.resourceId.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-soc-accent" />
          <span className="text-soc-textPrimary font-bold text-sm">Administrative System Audit Log</span>
          <span className="text-soc-textMuted text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            APPEND-ONLY IMMUTABLE
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-soc-textMuted" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-soc-bg border border-soc-panelBorder pl-8 pr-3 py-1 rounded text-soc-textPrimary text-xs"
            />
          </div>
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="bg-soc-bg border border-soc-panelBorder px-2.5 py-1 rounded text-soc-textPrimary text-xs"
          >
            <option value="">All Results</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      <div className="bg-soc-cardBg rounded border border-soc-panelBorder overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-soc-panelBg border-b border-soc-panelBorder text-soc-textMuted text-[11px] uppercase">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Action</th>
              <th className="p-3">Resource Type</th>
              <th className="p-3">Resource ID</th>
              <th className="p-3">Result</th>
              <th className="p-3">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-panelBorder">
            {filteredLogs.map((l) => (
              <tr key={l.logUuid || l.id} className="hover:bg-soc-panelBg/50 transition-colors">
                <td className="p-3 text-soc-textMuted font-bold">
                  {new Date(l.timestamp).toLocaleString()}
                </td>
                <td className="p-3 text-soc-textPrimary font-bold">{l.username || 'system'}</td>
                <td className="p-3 font-bold text-soc-accent">{l.action}</td>
                <td className="p-3 text-soc-textSecondary">{l.resourceType}</td>
                <td className="p-3 text-soc-textMuted font-mono">{l.resourceId || 'N/A'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    l.result === 'SUCCESS'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}>
                    {l.result}
                  </span>
                </td>
                <td className="p-3 text-soc-textMuted">{l.ipAddress || '127.0.0.1'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
