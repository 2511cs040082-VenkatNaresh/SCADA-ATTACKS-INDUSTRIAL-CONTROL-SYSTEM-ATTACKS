import React, { useState, useEffect } from 'react';
import { Layers, Activity, RefreshCw, Eye } from 'lucide-react';
import { cn } from '../utils/cn';

export const NetworkSessions: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = () => {
    setLoading(true);
    fetch('http://localhost:5050/api/v1/network/sessions')
      .then((res) => res.json())
      .then((res) => setSessions(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-soc-panelBorder pb-4 font-mono">
        <div>
          <h1 className="text-xl font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
            <Layers className="w-5 h-5 text-soc-telemetry" />
            LOGICAL PROTOCOL SESSION MANAGER
          </h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Real-Time State Tracking • Session Lifecycle (ACTIVE / IDLE / CLOSED)
          </p>
        </div>

        <button
          onClick={fetchSessions}
          className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-textSecondary rounded transition text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Sessions
        </button>
      </div>

      <div className="bg-soc-panel border border-soc-panelBorder rounded overflow-hidden font-mono text-xs">
        <div className="p-4 bg-slate-900 border-b border-soc-panelBorder font-bold text-soc-textPrimary">
          ACTIVE PROTOCOL SESSIONS
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-soc-panelBorder text-soc-textMuted uppercase text-[11px]">
              <tr>
                <th className="p-3">Session ID</th>
                <th className="p-3">Source Asset</th>
                <th className="p-3">Destination Asset</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">State</th>
                <th className="p-3">Requests</th>
                <th className="p-3">Responses</th>
                <th className="p-3">Exceptions</th>
                <th className="p-3">Avg Latency</th>
                <th className="p-3">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-soc-textSecondary">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-soc-textMuted">Loading sessions...</td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-soc-textMuted">No active protocol sessions.</td>
                </tr>
              ) : (
                sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-soc-telemetry">{sess.session_uuid}</td>
                    <td className="p-3 font-bold text-soc-textPrimary">{sess.source_name || sess.source_ip}</td>
                    <td className="p-3 font-bold text-soc-textPrimary">{sess.destination_name || sess.destination_ip}</td>
                    <td className="p-3 text-soc-telemetry font-bold">{sess.protocol}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[10px] font-bold border border-emerald-800">
                        {sess.status}
                      </span>
                    </td>
                    <td className="p-3">{sess.request_count}</td>
                    <td className="p-3">{sess.response_count}</td>
                    <td className="p-3 text-amber-400">{sess.exception_count}</td>
                    <td className="p-3 text-sky-400 font-bold">{sess.average_latency} ms</td>
                    <td className="p-3 text-soc-textMuted">{new Date(sess.last_activity).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NetworkSessions;
