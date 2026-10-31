import React from 'react';
import { Activity, Gauge } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { StatusBadge } from '../components/common/StatusBadge';

export const Process: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Physical Process Telemetry & Control Loops"
        description="Real-Time Monitoring of Physical Process Variable Bounds (Pressure, Temperature, Flow, Level)"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded-lg font-mono">
          <div className="flex justify-between text-xs text-soc-textMuted">
            <span>LOOP #1: WATER FILTRATION</span>
            <StatusBadge status="HEALTHY" size="sm" />
          </div>
          <div className="text-sm font-sans font-bold text-soc-textPrimary mt-2">Primary Pump Pressure</div>
          <div className="text-3xl font-bold text-soc-telemetry mt-2">48.2 PSI</div>
          <div className="text-[11px] text-soc-textMuted mt-1">Normal Range: 30 - 60 PSI</div>
        </div>

        <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded-lg font-mono">
          <div className="flex justify-between text-xs text-soc-textMuted">
            <span>LOOP #2: CHEMICAL DOSING</span>
            <StatusBadge status="WARNING" size="sm" />
          </div>
          <div className="text-sm font-sans font-bold text-soc-textPrimary mt-2">Reactor Temperature</div>
          <div className="text-3xl font-bold text-amber-400 mt-2">84.6 °C</div>
          <div className="text-[11px] text-amber-500 mt-1">EXCEEDS WARNING THRESHOLD (80 °C)</div>
        </div>

        <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded-lg font-mono">
          <div className="flex justify-between text-xs text-soc-textMuted">
            <span>LOOP #3: SUBSTATION COOLING</span>
            <StatusBadge status="HEALTHY" size="sm" />
          </div>
          <div className="text-sm font-sans font-bold text-soc-textPrimary mt-2">Coolant Flow Rate</div>
          <div className="text-3xl font-bold text-soc-telemetry mt-2">120.4 L/m</div>
          <div className="text-[11px] text-soc-textMuted mt-1">Normal Range: 100 - 150 L/m</div>
        </div>

        <div className="bg-soc-panel border border-soc-panelBorder p-4 rounded-lg font-mono">
          <div className="flex justify-between text-xs text-soc-textMuted">
            <span>LOOP #4: RESERVOIR STORAGE</span>
            <StatusBadge status="HEALTHY" size="sm" />
          </div>
          <div className="text-sm font-sans font-bold text-soc-textPrimary mt-2">Water Level Tank #1</div>
          <div className="text-3xl font-bold text-soc-telemetry mt-2">92.1 %</div>
          <div className="text-[11px] text-soc-textMuted mt-1">Normal Range: 10 - 95 %</div>
        </div>
      </div>

      <Panel title="Process Control Telemetry Bounds" subtitle="Physical State Consistency Matrix" icon={<Gauge className="w-4 h-4" />}>
        <div className="p-4 bg-soc-bg/60 rounded border border-soc-panelBorder text-xs font-mono text-soc-textMuted">
          Phase 1 Foundation layout for physical process variable tracking. Real SCADA sensors will feed into this panel via WebSocket telemetry ticks in Phase 2.
        </div>
      </Panel>
    </div>
  );
};
