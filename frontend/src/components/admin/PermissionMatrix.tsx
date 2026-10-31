import React, { useState, useEffect } from 'react';
import { Key, Save, CheckSquare, Square } from 'lucide-react';
import { apiService } from '../../services/api';

interface PermissionMatrixProps {
  roles: any[];
  permissions: any[];
  selectedRole?: any;
  onRefresh: () => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ roles, permissions, selectedRole, onRefresh }) => {
  const [activeRole, setActiveRole] = useState<string>(selectedRole ? selectedRole.name : (roles[0]?.name || 'ADMIN'));
  const [assignedPerms, setAssignedPerms] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const roleObj = roles.find(r => r.name === activeRole);
    if (roleObj && roleObj.permissions) {
      setAssignedPerms(new Set(roleObj.permissions));
    }
  }, [activeRole, roles]);

  const togglePermission = (permName: string) => {
    const updated = new Set(assignedPerms);
    if (updated.has(permName)) {
      updated.delete(permName);
    } else {
      updated.add(permName);
    }
    setAssignedPerms(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMsg('');
    try {
      await apiService.updateAdminRole(activeRole, Array.from(assignedPerms));
      setMsg(`Permissions for role '${activeRole}' saved successfully.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Group permissions by category
  const categoriesMap: Record<string, any[]> = {};
  permissions.forEach(p => {
    const cat = p.category || 'SYSTEM';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(p);
  });

  return (
    <div className="space-y-4 font-mono text-xs">
      {msg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-emerald-500 font-bold">✕</button>
        </div>
      )}

      <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
        <div className="flex items-center gap-3">
          <Key className="w-4 h-4 text-soc-accent" />
          <span className="text-soc-textPrimary font-bold text-sm">Permission Matrix & Role Authorization</span>
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            className="bg-soc-cardBg border border-soc-panelBorder px-3 py-1 rounded text-soc-accent font-bold"
          >
            {roles.map(r => (
              <option key={r.name} value={r.name}>{r.name} ({r.permissions ? r.permissions.length : 0} Perms)</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-soc-accent text-slate-950 font-bold rounded flex items-center gap-1.5 hover:bg-soc-accent/90"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Role Permissions'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(categoriesMap).map(([category, perms]) => (
          <div key={category} className="bg-soc-cardBg rounded border border-soc-panelBorder overflow-hidden">
            <div className="bg-soc-panelBg px-4 py-2 border-b border-soc-panelBorder text-soc-accent font-bold text-[11px] uppercase tracking-wider">
              {category} PERMISSIONS ({perms.length})
            </div>
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {perms.map(p => {
                const isChecked = assignedPerms.has(p.name);
                return (
                  <div
                    key={p.name}
                    onClick={() => togglePermission(p.name)}
                    className={`p-2.5 rounded border cursor-pointer flex items-start gap-2.5 transition-colors ${
                      isChecked
                        ? 'bg-soc-accent/10 border-soc-accent/40 text-soc-textPrimary'
                        : 'bg-soc-bg border-soc-panelBorder text-soc-textMuted hover:border-slate-700'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-soc-accent mt-0.5 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-soc-textMuted mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-xs font-mono">{p.name}</div>
                      <div className="text-[10px] text-soc-textMuted mt-0.5">{p.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
