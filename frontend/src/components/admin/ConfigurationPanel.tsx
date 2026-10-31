import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, History, RotateCcw, ShieldAlert, Check } from 'lucide-react';
import { apiService } from '../../services/api';

interface ConfigurationPanelProps {
  settings: any[];
  onRefresh: () => void;
}

const CATEGORIES = [
  'General', 'Security', 'Telemetry', 'Detection', 'Behavior', 'ML',
  'Alerts', 'Incidents', 'MITRE', 'Response', 'Simulation', 'Reports',
  'Retention', 'Logging', 'WebSocket', 'Performance'
];

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ settings, onRefresh }) => {
  const [activeCategory, setActiveCategory] = useState('General');
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [changeReason, setChangeReason] = useState('Administrative configuration edit');
  const [dangerousSettingKey, setDangerousSettingKey] = useState<string | null>(null);
  const [rollbackKey, setRollbackKey] = useState<string | null>(null);
  const [rollbackVersion, setRollbackVersion] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categorySettings = settings.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());

  const handleValueChange = (key: string, val: string) => {
    setEditedValues({ ...editedValues, [key]: val });
  };

  const handleSaveCategory = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Check if any edited setting is dangerous
    const dangerousEdit = categorySettings.find(s => editedValues[s.key] !== undefined && s.isDangerous);
    if (dangerousEdit && !dangerousSettingKey) {
      setDangerousSettingKey(dangerousEdit.key);
      setIsSaving(false);
      return;
    }

    try {
      const payload: Record<string, string> = {};
      categorySettings.forEach(s => {
        if (editedValues[s.key] !== undefined) {
          payload[s.key] = editedValues[s.key];
        }
      });

      if (Object.keys(payload).length === 0) {
        setSuccessMsg('No configuration changes detected.');
        setIsSaving(false);
        return;
      }

      await apiService.updateCategorySettings(activeCategory, payload, changeReason);
      setSuccessMsg(`Configuration category '${activeCategory}' updated successfully.`);
      setEditedValues({});
      setDangerousSettingKey(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = async () => {
    if (!rollbackKey) return;
    try {
      await apiService.rollbackAdminSetting(rollbackKey, rollbackVersion);
      setSuccessMsg(`Setting '${rollbackKey}' rolled back to version ${rollbackVersion}.`);
      setRollbackKey(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {successMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded flex justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded flex justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 font-bold">✕</button>
        </div>
      )}

      {/* Category Tab Bar */}
      <div className="flex gap-1 overflow-x-auto bg-soc-panelBg p-1.5 rounded border border-soc-panelBorder">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setEditedValues({}); }}
            className={`px-3 py-1.5 rounded text-xs whitespace-nowrap font-bold transition-colors ${
              activeCategory === cat
                ? 'bg-soc-accent text-slate-950 font-bold'
                : 'text-soc-textSecondary hover:bg-soc-cardBg hover:text-soc-textPrimary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Settings Form for Active Category */}
      <div className="bg-soc-cardBg rounded border border-soc-panelBorder p-4 space-y-4">
        <div className="flex justify-between items-center border-b border-soc-panelBorder pb-3">
          <div>
            <h3 className="text-sm font-bold text-soc-textPrimary flex items-center gap-2">
              <Settings className="w-4 h-4 text-soc-accent" />
              {activeCategory} Configuration Parameters
            </h3>
            <p className="text-[11px] text-soc-textMuted mt-0.5">
              Configure bounds, defaults, and policies for category '{activeCategory}' without modifying source code.
            </p>
          </div>

          <button
            onClick={handleSaveCategory}
            disabled={isSaving}
            className="px-4 py-1.5 bg-soc-accent text-slate-950 font-bold rounded flex items-center gap-1.5 hover:bg-soc-accent/90"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="space-y-4 divide-y divide-soc-panelBorder">
          {categorySettings.map(s => {
            const currentVal = editedValues[s.key] !== undefined ? editedValues[s.key] : s.value;
            return (
              <div key={s.key} className="pt-3 first:pt-0 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-soc-textPrimary">{s.key}</span>
                    {s.isDangerous && (
                      <span className="px-1.5 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded text-[9px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        HIGH IMPACT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-soc-textMuted mt-1">{s.description}</p>
                </div>

                <div className="space-y-1">
                  {s.type === 'BOOLEAN' ? (
                    <select
                      value={currentVal}
                      onChange={(e) => handleValueChange(s.key, e.target.value)}
                      className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary font-bold"
                    >
                      <option value="true">true (Enabled)</option>
                      <option value="false">false (Disabled)</option>
                    </select>
                  ) : (
                    <input
                      type={s.type === 'NUMBER' ? 'number' : 'text'}
                      value={currentVal}
                      min={s.min}
                      max={s.max}
                      onChange={(e) => handleValueChange(s.key, e.target.value)}
                      className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary font-bold"
                    />
                  )}

                  <div className="text-[10px] text-soc-textMuted flex gap-3">
                    <span>Default: <strong className="text-soc-textSecondary">{s.defaultValue}</strong></span>
                    {s.min !== undefined && <span>Min: <strong className="text-soc-textSecondary">{s.min}</strong></span>}
                    {s.max !== undefined && <span>Max: <strong className="text-soc-textSecondary">{s.max}</strong></span>}
                    <span>Version: <strong className="text-soc-accent">v{s.version || 1}</strong></span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setRollbackKey(s.key); setRollbackVersion(Math.max(1, (s.version || 1) - 1)); }}
                    className="px-2.5 py-1 bg-soc-bg hover:bg-slate-800 border border-soc-panelBorder text-soc-textSecondary rounded flex items-center gap-1 text-[11px]"
                  >
                    <History className="w-3 h-3 text-soc-accent" />
                    <span>Version History</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-soc-panelBorder">
          <label className="text-[11px] text-soc-textMuted block mb-1">Reason for Change (Audit Record)</label>
          <input
            type="text"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary text-xs"
          />
        </div>
      </div>

      {/* Dangerous Action Confirmation Dialog */}
      {dangerousSettingKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-soc-cardBg border border-rose-800 rounded-lg p-5 w-full max-w-md space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              High-Impact Dangerous Action Warning
            </div>
            <p className="text-xs text-soc-textSecondary">
              You are about to modify a high-impact dangerous setting <strong className="text-rose-400">{dangerousSettingKey}</strong>.
              Disabling or altering this policy directly affects platform security boundaries or telemetry integrity.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDangerousSettingKey(null)}
                className="px-3 py-1.5 bg-soc-bg border border-soc-panelBorder text-soc-textSecondary rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded hover:bg-rose-700"
              >
                Confirm Dangerous Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback & History Dialog */}
      {rollbackKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-soc-cardBg border border-soc-panelBorder rounded-lg p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-soc-textPrimary flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-soc-accent" />
              Rollback Setting '{rollbackKey}'
            </h3>
            <div className="space-y-2">
              <label className="text-[11px] text-soc-textMuted block">Select Version to Restore</label>
              <input
                type="number"
                min="1"
                value={rollbackVersion}
                onChange={(e) => setRollbackVersion(parseInt(e.target.value, 10))}
                className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary font-bold"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRollbackKey(null)}
                className="px-3 py-1.5 bg-soc-bg border border-soc-panelBorder text-soc-textSecondary rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRollback}
                className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded"
              >
                Execute Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
