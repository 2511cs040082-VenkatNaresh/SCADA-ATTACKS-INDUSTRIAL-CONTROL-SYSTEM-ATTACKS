import React, { useState } from 'react';
import { FlaskConical, AlertTriangle, ShieldCheck, Check, XCircle } from 'lucide-react';
import { apiService } from '../../services/api';

interface SimulationPolicyEditorProps {
  scenarios: any[];
  onRefresh: () => void;
}

export const SimulationPolicyEditor: React.FC<SimulationPolicyEditorProps> = ({ scenarios, onRefresh }) => {
  const [msg, setMsg] = useState('');

  const handleStatusChange = async (scenarioId: string, newStatus: string) => {
    try {
      await apiService.updateScenarioStatus(scenarioId, { status: newStatus });
      setMsg(`Scenario '${scenarioId}' status updated to ${newStatus}.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {msg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-emerald-500 font-bold">✕</button>
        </div>
      )}

      {/* Prominent Fail-Closed Lab Only Warning Banner */}
      <div className="p-3.5 bg-amber-950/40 border border-amber-800 rounded flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-amber-300 font-bold text-sm">🧪 LAB SIMULATION & SECURITY VALIDATION LABORATORY</div>
            <div className="text-[11px] text-amber-200/80">
              Target execution is strictly limited to authorized laboratory assets (PLC-001, RTU-001, HMI-001). External targets are blocked.
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-amber-900 text-amber-200 border border-amber-700 rounded font-bold text-xs">
          FAIL-CLOSED BOUNDARY
        </span>
      </div>

      <div className="bg-soc-cardBg rounded border border-soc-panelBorder overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-soc-panelBg border-b border-soc-panelBorder text-soc-textMuted text-[11px] uppercase">
            <tr>
              <th className="p-3">Scenario ID</th>
              <th className="p-3">Scenario Name</th>
              <th className="p-3">Target Device</th>
              <th className="p-3">MITRE Technique</th>
              <th className="p-3">Lifecycle Status</th>
              <th className="p-3">Approval</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-panelBorder">
            {scenarios.map((sc) => (
              <tr key={sc.id} className="hover:bg-soc-panelBg/50 transition-colors">
                <td className="p-3 font-bold text-soc-accent">{sc.id}</td>
                <td className="p-3 text-soc-textPrimary font-bold">{sc.name || sc.scenario_name}</td>
                <td className="p-3 text-soc-textSecondary">{sc.target_device || sc.target || 'PLC-001'}</td>
                <td className="p-3 text-soc-textMuted">{sc.mitre_technique || 'T0855'}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    sc.lifecycleStatus === 'ENABLED' || sc.lifecycleStatus === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}>
                    {sc.lifecycleStatus || 'ENABLED'}
                  </span>
                </td>
                <td className="p-3">
                  {sc.isApproved ? (
                    <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      APPROVED
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold text-[10px] flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      UNAPPROVED
                    </span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <select
                    value={sc.lifecycleStatus || 'ENABLED'}
                    onChange={(e) => handleStatusChange(sc.id, e.target.value)}
                    className="bg-soc-bg border border-soc-panelBorder p-1 rounded text-soc-textPrimary text-xs font-bold"
                  >
                    <option value="ENABLED">ENABLED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="DISABLED">DISABLED</option>
                    <option value="RETIRED">RETIRED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
