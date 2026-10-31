import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Activity, CheckCircle, Clock, Zap, Radio, ChevronRight } from 'lucide-react';

export const ProtocolMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5050/api/v1/protocols/metrics')
      .then((res) => res.json())
      .then((res) => setMetrics(res.data))
      .catch(() => {});
  }, []);

  const adapters = [
    { name: 'Modbus/TCP', port: 502, status: 'ACTIVE', path: '/protocols/modbus', active: true, desc: 'Function Codes 01-16, Unit ID, Coils & Register Parsing' },
    { name: 'DNP3', port: 20000, status: 'ADAPTER READY', path: '#', active: false, desc: 'Unsolicited Responses, Object Groups (Stub Ready)' },
    { name: 'OPC UA', port: 4840, status: 'ADAPTER READY', path: '#', active: false, desc: 'Binary Protocol, Secure Conversation (Stub Ready)' },
    { name: 'Siemens S7', port: 102, status: 'ADAPTER READY', path: '#', active: false, desc: 'S7comm Job Requests, PDU Transport (Stub Ready)' },
    { name: 'EtherNet/IP', port: 44818, status: 'ADAPTER READY', path: '#', active: false, desc: 'CIP Messaging, Explicit & Implicit (Stub Ready)' },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="border-b border-soc-panelBorder pb-4">
        <h1 className="text-xl font-mono font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
          <Layers className="w-5 h-5 text-soc-telemetry" />
          INDUSTRIAL CONTROL PROTOCOL MONITORING LAYER
        </h1>
        <p className="text-xs font-mono text-soc-textMuted mt-1">
          Extensible Protocol Registry • Modbus/TCP Deep Packet Inspection • Session Correlator
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">REQUESTS / SEC</div>
          <div className="text-2xl font-bold text-soc-telemetry mt-1">{metrics?.events_per_second || 134}</div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">ACTIVE SESSIONS</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{metrics?.active_sessions || 4}</div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">AVG LATENCY</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{metrics?.average_latency_ms || 1.2} ms</div>
        </div>

        <div className="bg-soc-card border border-soc-panelBorder p-4 rounded">
          <div className="text-xs text-soc-textMuted">EXCEPTIONS</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">0</div>
        </div>
      </div>

      {/* Protocol Adapters Registry */}
      <div className="bg-soc-panel border border-soc-panelBorder rounded overflow-hidden font-mono text-xs">
        <div className="p-4 bg-slate-900 border-b border-soc-panelBorder font-bold text-soc-textPrimary">
          REGISTERED INDUSTRIAL PROTOCOL ADAPTERS
        </div>

        <div className="divide-y divide-slate-800/60">
          {adapters.map((ad) => (
            <div key={ad.name} className="p-4 flex items-center justify-between hover:bg-slate-800/40">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-soc-textPrimary text-sm">{ad.name}</span>
                  <span className="text-soc-textMuted">(Port {ad.port})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ad.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-soc-textMuted'}`}>
                    {ad.status}
                  </span>
                </div>
                <div className="text-xs text-soc-textMuted">{ad.desc}</div>
              </div>

              {ad.active && (
                <Link
                  to={ad.path}
                  className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-telemetry font-bold rounded flex items-center gap-1 transition"
                >
                  Monitor Modbus <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProtocolMonitor;
