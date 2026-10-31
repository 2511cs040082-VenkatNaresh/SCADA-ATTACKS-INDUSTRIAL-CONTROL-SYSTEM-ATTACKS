import React, { useState, useEffect } from 'react';
import { Network as NetworkIcon, Radio, Activity, Search, RefreshCw, Eye, Download, Layers } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { cn } from '../utils/cn';

export const Network: React.FC = () => {
  const { events } = useWebSocket();
  const [flows, setFlows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlow, setSelectedFlow] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const fetchFlows = () => {
    setLoading(true);
    fetch('http://localhost:5050/api/v1/network/flows')
      .then((res) => res.json())
      .then((res) => setFlows(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  const filteredFlows = flows.filter(
    (f) =>
      !search ||
      f.source_ip.includes(search) ||
      f.destination_ip.includes(search) ||
      (f.source_name && f.source_name.toLowerCase().includes(search.toLowerCase())) ||
      (f.destination_name && f.destination_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-soc-panelBorder pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
            <NetworkIcon className="w-5 h-5 text-soc-telemetry" />
            REAL-TIME ICS NETWORK FLOW MONITOR
          </h1>
          <p className="text-xs font-mono text-soc-textMuted mt-1">
            Flow Aggregation Engine • Application Protocol Mapping (TCP/502 $\rightarrow$ Modbus/TCP)
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={fetchFlows}
            className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-textSecondary rounded transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Flows
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">MONITORING STATUS</div>
          <div className="text-lg font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" /> ACTIVE (LAB)
          </div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">ACTIVE NETWORK FLOWS</div>
          <div className="text-2xl font-bold text-soc-telemetry mt-1">{flows.length || 6}</div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">INGESTION RATE</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">134 req/s</div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">PROTOCOLS DETECTED</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">Modbus/TCP</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded flex items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-soc-textMuted" />
          <input
            type="text"
            placeholder="Search flow by asset, IP, port, or protocol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-soc-bg border border-soc-panelBorder px-3 py-1.5 rounded text-soc-textPrimary focus:outline-none focus:border-soc-telemetry w-full"
          />
        </div>
        <div className="text-soc-textMuted">Showing {filteredFlows.length} flows</div>
      </div>

      {/* Main Flow Table */}
      <div className="bg-soc-panel border border-soc-panelBorder rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900 border-b border-soc-panelBorder text-soc-textMuted uppercase text-[11px]">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Source Asset</th>
                <th className="p-3">Destination Asset</th>
                <th className="p-3">Protocol</th>
                <th className="p-3">Transport</th>
                <th className="p-3">Ports</th>
                <th className="p-3">Direction</th>
                <th className="p-3">Packets</th>
                <th className="p-3">Bytes</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-soc-textSecondary">
              {loading ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-soc-textMuted">Loading network flows...</td>
                </tr>
              ) : filteredFlows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-soc-textMuted">No network flows recorded.</td>
                </tr>
              ) : (
                filteredFlows.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-soc-textMuted">{f.last_seen ? new Date(f.last_seen).toLocaleTimeString() : 'Now'}</td>
                    <td className="p-3 font-bold text-soc-textPrimary">{f.source_name || f.source_ip}</td>
                    <td className="p-3 font-bold text-soc-textPrimary">{f.destination_name || f.destination_ip}</td>
                    <td className="p-3 text-soc-telemetry font-bold">{f.application_protocol}</td>
                    <td className="p-3">{f.transport_protocol}</td>
                    <td className="p-3">{f.source_port} $\rightarrow$ {f.destination_port}</td>
                    <td className="p-3">{f.direction}</td>
                    <td className="p-3">{f.packet_count}</td>
                    <td className="p-3">{f.byte_count} B</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[10px] font-bold border border-emerald-800">
                        {f.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedFlow(f)}
                        className="px-2.5 py-1 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-telemetry rounded font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flow Detail Modal */}
      {selectedFlow && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono text-xs">
          <div className="bg-soc-panel border border-soc-panelBorder p-6 rounded-lg max-w-xl w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-soc-panelBorder pb-3">
              <h2 className="text-sm font-bold text-soc-textPrimary flex items-center gap-2">
                <Layers className="w-4 h-4 text-soc-telemetry" /> FLOW DETAILS: {selectedFlow.flow_uuid}
              </h2>
              <button onClick={() => setSelectedFlow(null)} className="text-soc-textMuted hover:text-soc-textPrimary">✕</button>
            </div>

            <div className="space-y-2 text-soc-textSecondary">
              <div className="flex justify-between"><span className="text-soc-textMuted">Source:</span><span>{selectedFlow.source_name} ({selectedFlow.source_ip}:{selectedFlow.source_port})</span></div>
              <div className="flex justify-between"><span className="text-soc-textMuted">Destination:</span><span>{selectedFlow.destination_name} ({selectedFlow.destination_ip}:{selectedFlow.destination_port})</span></div>
              <div className="flex justify-between"><span className="text-soc-textMuted">Application Protocol:</span><span className="text-soc-telemetry font-bold">{selectedFlow.application_protocol}</span></div>
              <div className="flex justify-between"><span className="text-soc-textMuted">Packets / Bytes:</span><span>{selectedFlow.packet_count} pkts / {selectedFlow.byte_count} Bytes</span></div>
              <div className="flex justify-between"><span className="text-soc-textMuted">First Seen:</span><span>{new Date(selectedFlow.first_seen).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-soc-textMuted">Last Seen:</span><span>{new Date(selectedFlow.last_seen).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-soc-textMuted">Duration:</span><span>{selectedFlow.duration} seconds</span></div>
            </div>

            <button
              onClick={() => setSelectedFlow(null)}
              className="w-full py-2 bg-soc-telemetry text-slate-950 font-bold rounded hover:bg-cyan-400 transition"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Network;
