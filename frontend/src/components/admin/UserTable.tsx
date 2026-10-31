import React, { useState } from 'react';
import { UserPlus, Lock, CheckCircle, XCircle, Shield, KeyRound, LogOut } from 'lucide-react';
import { apiService } from '../../services/api';

interface UserTableProps {
  users: any[];
  onRefresh: () => void;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onRefresh }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetModalUserId, setResetModalUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'VIEWER',
    status: 'ACTIVE'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    try {
      await apiService.createAdminUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        roles: [formData.role],
        status: formData.status
      });
      setSuccessMsg(`User '${formData.username}' created successfully.`);
      setShowCreateModal(false);
      setFormData({ username: '', email: '', password: '', confirmPassword: '', fullName: '', role: 'VIEWER', status: 'ACTIVE' });
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create user.');
    }
  };

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    try {
      if (currentStatus === 'ACTIVE') {
        await apiService.disableAdminUser(id);
      } else {
        await apiService.enableAdminUser(id);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUserId) return;
    try {
      await apiService.resetUserPassword(resetModalUserId, newPassword);
      setSuccessMsg('Password reset successfully.');
      setResetModalUserId(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleForceLogout = async (id: number) => {
    if (confirm('Force logout all active sessions for this user?')) {
      try {
        await apiService.revokeUserSessions(id);
        alert('All active sessions revoked.');
        onRefresh();
      } catch (err: any) {
        alert(err.message);
      }
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

      <div className="flex justify-between items-center bg-soc-panelBg p-3 rounded border border-soc-panelBorder">
        <div>
          <span className="text-soc-textPrimary font-bold text-sm">User Accounts Roster</span>
          <span className="text-soc-textMuted text-[11px] ml-3">({users.length} Total Registered Users)</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 bg-soc-accent text-slate-950 font-bold rounded flex items-center gap-1.5 hover:bg-soc-accent/90"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Create New User</span>
        </button>
      </div>

      <div className="bg-soc-cardBg rounded border border-soc-panelBorder overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-soc-panelBg border-b border-soc-panelBorder text-soc-textMuted text-[11px] uppercase">
            <tr>
              <th className="p-3">User ID</th>
              <th className="p-3">Username & Email</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Assigned Roles</th>
              <th className="p-3">Status</th>
              <th className="p-3">Active Sessions</th>
              <th className="p-3">Last Login</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-panelBorder">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-soc-panelBg/50 transition-colors">
                <td className="p-3 text-soc-textMuted font-bold">#{u.id}</td>
                <td className="p-3">
                  <div className="text-soc-textPrimary font-bold">{u.username}</div>
                  <div className="text-[11px] text-soc-textMuted">{u.email}</div>
                </td>
                <td className="p-3 text-soc-textSecondary">{u.fullName}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles && u.roles.map((r: string) => (
                      <span key={r} className="px-2 py-0.5 bg-soc-bg border border-soc-panelBorder text-soc-accent rounded text-[10px] font-bold">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                    u.status === 'ACTIVE'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-soc-textPrimary">{u.sessionCount || 0}</td>
                <td className="p-3 text-soc-textMuted">
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => handleStatusToggle(u.id, u.status)}
                      title={u.status === 'ACTIVE' ? 'Disable User' : 'Enable User'}
                      className="p-1.5 bg-soc-bg hover:bg-slate-800 rounded border border-soc-panelBorder text-soc-textSecondary"
                    >
                      {u.status === 'ACTIVE' ? <XCircle className="w-3.5 h-3.5 text-rose-400" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() => setResetModalUserId(u.id)}
                      title="Reset Password"
                      className="p-1.5 bg-soc-bg hover:bg-slate-800 rounded border border-soc-panelBorder text-amber-400"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleForceLogout(u.id)}
                      title="Revoke Sessions / Force Logout"
                      className="p-1.5 bg-soc-bg hover:bg-slate-800 rounded border border-soc-panelBorder text-rose-400"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-soc-cardBg border border-soc-panelBorder rounded-lg p-5 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-soc-panelBorder pb-3">
              <h3 className="text-sm font-bold text-soc-textPrimary flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-soc-accent" />
                Create New Operator Account
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-soc-textMuted">✕</button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-300 text-[11px] rounded">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] text-soc-textMuted block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-soc-textMuted block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-soc-textMuted block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-soc-textMuted block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-soc-textMuted block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-soc-textMuted block mb-1">Assign Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                >
                  <option value="ADMIN">ADMIN (Full Access)</option>
                  <option value="SECURITY_ANALYST">SECURITY_ANALYST (SecOps Level 3)</option>
                  <option value="SOC_OPERATOR">SOC_OPERATOR (Monitoring & Triage)</option>
                  <option value="OT_OPERATOR">OT_OPERATOR (Industrial Control)</option>
                  <option value="VIEWER">VIEWER (Read-Only Audit)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-soc-panelBorder">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-soc-bg border border-soc-panelBorder text-soc-textSecondary rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-soc-accent text-slate-950 font-bold rounded"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalUserId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-soc-cardBg border border-soc-panelBorder rounded-lg p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-soc-textPrimary flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Reset Account Password
            </h3>
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <div>
                <label className="text-[11px] text-soc-textMuted block mb-1">New Password (Min 8 Chars)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-soc-bg border border-soc-panelBorder p-2 rounded text-soc-textPrimary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUserId(null)}
                  className="px-3 py-1.5 bg-soc-bg border border-soc-panelBorder text-soc-textSecondary rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
