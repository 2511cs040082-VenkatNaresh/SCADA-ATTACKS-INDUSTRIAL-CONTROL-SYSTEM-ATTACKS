import React, { useState, useEffect } from 'react';
import { Layers, Activity, RefreshCw, Eye, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { cn } from '../utils/cn';

export const ModbusMonitor: React.FC = () => {
  const { events } = useWebSocket();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const fetchTransactions = () => {
    setLoading(true);
    fetch('http://localhost:5050/api/v1/protocols/modbus/transactions')
      .then((res) => res.json())
      .then((res) => setTransactions(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fcCounts = [
    { code: '01', name: 'Read Coils', count: 420 },
    { code: '03', name: 'Read Holding Registers', count: 1840 },
    { code: '05', name: 'Write Single Coil', count: 45 },
    { code: '06', name: 'Write Single Register', count: 18 },
    { code: '16', name: 'Write Multiple Registers', count: 12 },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-soc-panelBorder pb-4 font-mono">
        <div>
          <h1 className="text-xl font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
            <Layers className="w-5 h-5 text-soc-telemetry" />
            MODBUS/TCP INDUSTRIAL PROTOCOL MONITOR
          </h1>
          <p className="text-xs text-soc-textMuted mt-1">
            Function Codes 01-16 Inspection • Unit ID • Request/Response Transaction Correlator
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-textSecondary rounded transition text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Transactions
        </button>
      </div>

      {/* Function Code Distribution Cards */}
      <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded space-y-3 font-mono text-xs">
        <div className="font-bold text-soc-textPrimary text-sm border-b border-soc-panelBorder pb-2">
          FUNCTION CODE DISTRIBUTION (ACTIVE LABORATORY LOOP)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {fcCounts.map((fc) => (
            <div key={fc.code} className="bg-slate-900 border border-soc-panelBorder p-3 rounded space-y-1">
              <div className="text-soc-telemetry font-bold">FC {fc.code} - {fc.name}</div>
              <div className="text-xl font-bold text-soc-textPrimary">{fc.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Transaction Table */}
      <div className="bg-soc-panel border border-soc-panelBorder rounded overflow-hidden font-mono text-xs">
        <div className="p-4 bg-slate-900 border-b border-soc-panelBorder font-bold text-soc-textPrimary flex justify-between items-center">
          <span>RECENT MODBUS/TCP TRANSACTIONS</span>
          <span className="text-emerald-400 font-normal text-[11px]">Sub-millisecond Latency Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-soc-panelBorder text-soc-textMuted uppercase text-[11px]">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">TID</th>
                <th className="p-3">Source</th>
                <th className="p-3">Destination</th>
                <th className="p-3">Function Code</th>
                <th className="p-3">Operation</th>
                <th className="p-3">Status</th>
                <th className="p-3">Latency</th>
                <th className="p-3 text-right">Diagram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-soc-textSecondary">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-soc-textMuted">Loading Modbus transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-soc-textMuted">No transactions logged yet.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-soc-textMuted">{new Date(tx.request_time).toLocaleTimeString()}</td>
                    <td className="p-3 font-bold text-soc-telemetry">#{tx.transaction_id}</td>
                    <td className="p-3 font-semibold text-soc-textPrimary">{tx.source_name || 'HMI-001'}</td>
                    <td className="p-3 font-semibold text-soc-textPrimary">{tx.destination_name || 'PLC-001'}</td>
                    <td className="p-3">FC {tx.function_code || 3}</td>
                    <td className="p-3 font-semibold">{tx.function_name || tx.operation}</td>
                    <td className="p-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-bold',
                        tx.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 text-sky-400 font-bold">{tx.latency} ms</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="px-2.5 py-1 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-telemetry rounded font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Diagram
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Diagram Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-mono text-xs">
          <div className="bg-soc-panel border border-soc-panelBorder p-6 rounded-lg max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-soc-panelBorder pb-3">
              <h2 className="text-sm font-bold text-soc-textPrimary flex items-center gap-2">
                <Layers className="w-4 h-4 text-soc-telemetry" /> TRANSACTION #{selectedTx.transaction_id} SEQUENCE DIAGRAM
              </h2>
              <button onClick={() => setSelectedTx(null)} className="text-soc-textMuted hover:text-soc-textPrimary">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded border border-soc-panelBorder space-y-4">
              <div className="flex items-center justify-between text-soc-textPrimary font-bold">
                <span>{selectedTx.source_name || 'HMI-001'}</span>
                <ArrowRight className="w-5 h-5 text-soc-telemetry animate-pulse" />
                <span>{selectedTx.destination_name || 'PLC-001'}</span>
              </div>

              <div className="bg-slate-900 p-3 rounded space-y-1.5 border border-slate-800">
                <div className="text-soc-telemetry font-bold">REQUEST MODBUS TCP PDU</div>
                <div>Function: {selectedTx.function_name || 'FC03 Read Holding Registers'}</div>
                <div>Transaction ID: {selectedTx.transaction_id}</div>
                <div>Unit ID: 1</div>
              </div>

              <div className="bg-slate-900 p-3 rounded space-y-1.5 border border-slate-800">
                <div className="text-emerald-400 font-bold">RESPONSE MODBUS TCP PDU</div>
                <div>Status: {selectedTx.status}</div>
                <div>Roundtrip Latency: {selectedTx.latency} ms</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2 bg-soc-telemetry text-slate-950 font-bold rounded hover:bg-cyan-400 transition"
            >
              Close Diagram
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModbusMonitor;
