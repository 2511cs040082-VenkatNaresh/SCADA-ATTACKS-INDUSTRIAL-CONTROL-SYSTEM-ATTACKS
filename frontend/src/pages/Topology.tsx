import React, { useState, useEffect } from 'react';
import { GitMerge, Layers, ShieldCheck, RefreshCw, Server } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { cn } from '../utils/cn';

export const Topology: React.FC = () => {
  const [topologyData, setTopologyData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);

  const fetchTopology = () => {
    setLoading(true);
    fetch('http://localhost:5050/api/v1/assets/topology')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setTopologyData(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTopology();
  }, []);

  // Group nodes by Purdue level
  const level3Nodes = topologyData.nodes.filter((n) => n.asset_name.includes('SCADA') || n.asset_name.includes('HISTORIAN') || n.asset_name.includes('ENG'));
  const level2Nodes = topologyData.nodes.filter((n) => n.asset_name.includes('HMI'));
  const level1Nodes = topologyData.nodes.filter((n) => n.asset_name.includes('PLC') || n.asset_name.includes('RTU'));
  const level0Nodes = topologyData.nodes.filter((n) => n.asset_name.includes('SENSOR') || n.asset_name.includes('ACT'));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-soc-panelBorder pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-soc-textPrimary tracking-tight flex items-center gap-3">
            <GitMerge className="w-5 h-5 text-soc-telemetry" />
            ICS NETWORK TOPOLOGY & PURDUE COMMUNICATION GRAPH
          </h1>
          <p className="text-xs font-mono text-soc-textMuted mt-1">
            Observed Laboratory Communication Edges • Node Health Status Colors
          </p>
        </div>

        <button
          onClick={fetchTopology}
          className="px-3 py-1.5 bg-soc-panel border border-soc-panelBorder hover:bg-slate-800 text-soc-textSecondary rounded transition font-mono text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Graph
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Purdue Model Observed Communication Graph" subtitle="SCADA Network Segmentation & Live Baseline Edges" icon={<GitMerge className="w-4 h-4" />}>
            <div className="p-6 bg-soc-bg/90 rounded border border-soc-panelBorder space-y-6 font-mono text-xs">
              {/* Level 3 */}
              <div className="p-4 bg-slate-900/90 rounded border border-slate-700">
                <div className="flex justify-between items-center text-soc-telemetry font-bold mb-3">
                  <span>LEVEL 3: Site Operations & Supervisory Control</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Subnet: 10.10.1.0/24</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {level3Nodes.map((n) => (
                    <div key={n.id} className={cn(
                      'p-2.5 rounded border flex items-center gap-2 font-bold',
                      n.status === 'ONLINE' ? 'bg-soc-panel border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
                    )}>
                      <Server className="w-4 h-4" />
                      <div>
                        <div>{n.asset_name}</div>
                        <div className="text-[10px] text-soc-textMuted font-normal">{n.ip_address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Firewall Demarcation */}
              <div className="flex items-center justify-center text-rose-400 text-[11px] font-bold space-x-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>--- OT DEMARCATION BOUNDARY / INDUSTRIAL FIREWALL ---</span>
              </div>

              {/* Level 2 */}
              <div className="p-4 bg-slate-900/90 rounded border border-slate-700">
                <div className="flex justify-between items-center text-cyan-400 font-bold mb-3">
                  <span>LEVEL 2: Control Room & HMI Operator Consoles</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Subnet: 10.10.2.0/24</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {level2Nodes.map((n) => (
                    <div key={n.id} className="p-2.5 bg-soc-panel rounded border border-cyan-800 text-cyan-300 font-bold flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      <div>
                        <div>{n.asset_name}</div>
                        <div className="text-[10px] text-soc-textMuted font-normal">{n.ip_address}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Level 1 & 0 */}
              <div className="p-4 bg-slate-900/90 rounded border border-slate-700">
                <div className="flex justify-between items-center text-emerald-400 font-bold mb-3">
                  <span>LEVEL 1 & 0: Field Controllers, RTUs, Sensors & Actuators</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Subnet: 10.10.3.0/24 & 10.10.4.0/24</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {level1Nodes.concat(level0Nodes).map((n) => (
                    <div key={n.id} className={cn(
                      'p-2 bg-soc-panel rounded border text-xs font-bold',
                      n.status === 'ONLINE' ? 'border-emerald-800 text-emerald-300' : 'border-rose-800 text-rose-300'
                    )}>
                      <div>{n.asset_name}</div>
                      <div className="text-[10px] text-soc-textMuted font-normal">{n.ip_address}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        {/* Observed Communication Edges */}
        <div className="lg:col-span-1">
          <Panel title="Observed Communication Edges" subtitle="Active Modbus / Industrial Links" icon={<Layers className="w-4 h-4" />}>
            <div className="space-y-2 font-mono text-xs max-h-[600px] overflow-y-auto">
              {topologyData.edges.length === 0 ? (
                <div className="text-soc-textMuted p-4 text-center">No active baseline edges recorded.</div>
              ) : (
                topologyData.edges.map((e) => (
                  <div key={e.id} className="p-3 bg-soc-bg rounded border border-soc-panelBorder space-y-1">
                    <div className="flex justify-between font-bold text-soc-textPrimary">
                      <span>{e.source_name} → {e.destination_name}</span>
                      <span className="text-emerald-400">{e.protocol}</span>
                    </div>
                    <div className="text-[11px] text-soc-textMuted flex justify-between">
                      <span>Port {e.port}</span>
                      <span>Observed {e.count} times</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Topology;
