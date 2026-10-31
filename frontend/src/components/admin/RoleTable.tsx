import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Key } from 'lucide-react';
import { apiService } from '../../services/api';

interface RoleTableProps {
  roles: any[];
  onRefresh: () => void;
  onSelectRole: (role: any) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({ roles, onRefresh, onSelectRole }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createAdminRole({ name, description, permissions: ['dashboard.read'] });
      setName('');
      setDescription('');
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRole = async (roleName: string) => {
    if (confirm(`Delete custom role '${roleName}'?`)) {
      try {
        await apiService.deleteAdminRole(roleName);
        onRefresh();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
        <div>
          <span className="text-soc-textPrimary font-bold text-sm">Role-Based Access Control (RBAC) Roles</span>
          <span className="text-soc-textMuted text-[11px] ml-3">({roles.length} Configured System Roles)</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-soc-accent text-slate-950 font-bold rounded flex items-center gap-1.5 hover:bg-soc-accent/90"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Custom Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div key={r.name} className="p-4 bg-soc-cardBg rounded border border-soc-panelBorder space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-soc-accent" />
                  <span className="text-sm font-bold text-soc-textPrimary">{r.name}</span>
                  {r.isSystemCritical ? (
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px]">
                      SYSTEM ROLE
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded text-[10px]">
                      CUSTOM
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-soc-textMuted mt-1">{r.description}</p>
              </div>

              {!r.isSystemCritical && (
                <button
                  onClick={() => handleDeleteRole(r.name)}
                  className="p-1 text-rose-400 hover:text-rose-300"
                  title="Delete Custom Role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-soc-panelBorder flex justify-between items-center text-[11px]">
              <span className="text-soc-textSecondary font-bold">
                Assigned Users: <span className="text-soc-accent">{r.assignedUsersCount || 0}</span>
              </span>
              <button
                onClick={() => onSelectRole(r)}
                className="px-2.5 py-1 bg-soc-bg hover:bg-slate-800 border border-soc-panelBorder text-soc-textPrimary rounded flex items-center gap-1 font-bold"
              >
                <Key className="w-3 h-3 text-soc-accent" />
                Edit Permissions ({r.permissions ? r.permissions.length : 0})
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-soc-cardBg border border-soc-panelBorder rounded-lg p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-soc-textPrimary">Create Custom Role</h3>
            <form onSubmit={handleCreateRole} className="space-y-3">
              <div>
                <label className="text-[11px] text-soc-textMuted block mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AUDITOR_SPECIALIST"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                />
              </div>
              <div>
                <label className="text-[11px] text-soc-textMuted block mb-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary h-20 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-soc-bg border border-soc-panelBorder text-soc-textSecondary rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-soc-accent text-slate-950 font-bold rounded">
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
