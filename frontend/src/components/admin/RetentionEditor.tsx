import React, { useState } from 'react';
import { Database, ShieldCheck, Save, AlertOctagon } from 'lucide-react';
import { apiService } from '../../services/api';

interface RetentionEditorProps {
  policies: any[];
  onRefresh: () => void;
}

export const RetentionEditor: React.FC<RetentionEditorProps> = ({ policies, onRefresh }) => {
  const [editedDays, setEditedDays] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState('');

  const handleUpdate = async (category: string) => {
    const newDays = editedDays[category];
    if (!newDays) return;
    try {
      await apiService.updateAdminRetention(category, { retentionDays: newDays });
      setMsg(`Retention period for '${category}' updated to ${newDays} days.`);
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

      <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
        <div>
          <span className="text-soc-textPrimary font-bold text-sm">Data Retention & Active Evidence Preservation</span>
          <span className="text-soc-textMuted text-[11px] ml-3">({policies.length} Category Retention Policies)</span>
        </div>
      </div>

      <div className="bg-soc-cardBg rounded border border-soc-panelBorder overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-soc-panelBg border-b border-soc-panelBorder text-soc-textMuted text-[11px] uppercase">
            <tr>
              <th className="p-3">Data Category</th>
              <th className="p-3">Description</th>
              <th className="p-3">Retention Period (Days)</th>
              <th className="p-3">Evidence Protection</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-panelBorder">
            {policies.map((p) => {
              const currentDays = editedDays[p.category] !== undefined ? editedDays[p.category] : p.retentionDays;
              return (
                <tr key={p.category} className="hover:bg-soc-panelBg/50 transition-colors">
                  <td className="p-3 font-bold text-soc-accent">{p.category}</td>
                  <td className="p-3 text-soc-textSecondary">{p.description}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      value={currentDays}
                      onChange={(e) => setEditedDays({ ...editedDays, [p.category]: parseInt(e.target.value, 10) })}
                      className="w-24 bg-soc-bg border border-soc-panelBorder p-1.5 rounded text-soc-textPrimary font-bold text-xs"
                    />
                  </td>
                  <td className="p-3">
                    {p.preserveEvidenceOverride ? (
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold flex items-center gap-1 w-max">
                        <ShieldCheck className="w-3 h-3" />
                        PRESERVED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px]">
                        STANDARD
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleUpdate(p.category)}
                      className="px-3 py-1 bg-soc-accent text-slate-950 font-bold rounded flex items-center gap-1 ml-auto"
                    >
                      <Save className="w-3 h-3" />
                      <span>Update</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
