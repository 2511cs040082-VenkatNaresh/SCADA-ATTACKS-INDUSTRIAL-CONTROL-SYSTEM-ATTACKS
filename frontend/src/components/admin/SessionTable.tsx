import React from 'react';
import { Laptop, LogOut, Clock, Globe } from 'lucide-react';
import { apiService } from '../../services/api';

interface SessionTableProps {
  sessions: any[];
  onRefresh: () => void;
}

export const SessionTable: React.FC<SessionTableProps> = ({ sessions, onRefresh }) => {
  const handleRevoke = async (sessionId: string | number) => {
    if (confirm(`Revoke session ${sessionId}?`)) {
      try {
        await apiService.revokeAdminSession(sessionId);
        onRefresh();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
        <div>
          <span className="text-soc-textPrimary font-bold text-sm">Active Session Monitor</span>
          <span className="text-soc-textMuted text-[11px] ml-3">({sessions.length} Active Authenticated JWT Sessions)</span>
        </div>
      </div>

      <div className="bg-soc-cardBg rounded border border-soc-panelBorder overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-soc-panelBg border-b border-soc-panelBorder text-soc-textMuted text-[11px] uppercase">
            <tr>
              <th className="p-3">Session UUID</th>
              <th className="p-3">User</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">User Agent</th>
              <th className="p-3">Login Time</th>
              <th className="p-3">Expiration</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-panelBorder">
            {sessions.map((s) => (
              <tr key={s.sessionUuid || s.id} className="hover:bg-soc-panelBg/50 transition-colors">
                <td className="p-3 font-bold text-soc-accent">{s.sessionUuid || s.id}</td>
                <td className="p-3">
                  <div className="text-soc-textPrimary font-bold">{s.username}</div>
                  <div className="text-[10px] text-soc-textMuted">User ID: #{s.userId}</div>
                </td>
                <td className="p-3 text-soc-textSecondary flex items-center gap-1">
                  <Globe className="w-3 h-3 text-soc-textMuted" />
                  <span>{s.ipAddress || '127.0.0.1'}</span>
                </td>
                <td className="p-3 text-soc-textMuted max-w-xs truncate" title={s.userAgent}>
                  {s.userAgent || 'Web Client'}
                </td>
                <td className="p-3 text-soc-textMuted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(s.loginTime).toLocaleString()}</span>
                </td>
                <td className="p-3 text-soc-textMuted">
                  {new Date(s.expiresAt).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleRevoke(s.sessionUuid || s.id)}
                    className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded font-bold flex items-center gap-1 ml-auto"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Revoke</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
