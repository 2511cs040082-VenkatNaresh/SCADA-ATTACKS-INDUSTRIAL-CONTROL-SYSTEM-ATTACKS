import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { UserTable } from '../components/admin/UserTable';
import { RoleTable } from '../components/admin/RoleTable';
import { PermissionMatrix } from '../components/admin/PermissionMatrix';
import { SessionTable } from '../components/admin/SessionTable';
import { ConfigurationPanel } from '../components/admin/ConfigurationPanel';
import { RetentionEditor } from '../components/admin/RetentionEditor';
import { AuditTable } from '../components/admin/AuditTable';
import { SimulationPolicyEditor } from '../components/admin/SimulationPolicyEditor';
import { SystemHealthPanel } from '../components/admin/SystemHealthPanel';
import { apiService } from '../services/api';
import { Shield, Users, Laptop, Settings, Database, Activity, History, FlaskConical, Lock } from 'lucide-react';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overviewData, setOverviewData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [retention, setRetention] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<any>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ovRes, uRes, rRes, pRes, sRes, setRes, retRes, audRes, scRes, hRes] = await Promise.allSettled([
        apiService.getAdminOverview(),
        apiService.getAdminUsers(),
        apiService.getAdminRoles(),
        apiService.getAdminPermissions(),
        apiService.getAdminSessions(),
        apiService.getAdminSettings(),
        apiService.getAdminRetention(),
        apiService.getAdminAudit(),
        apiService.getAdminScenarios(),
        apiService.getAdminSystemHealth()
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value?.data) setOverviewData(ovRes.value.data);
      if (uRes.status === 'fulfilled' && uRes.value?.data) setUsers(uRes.value.data);
      if (rRes.status === 'fulfilled' && rRes.value?.data) setRoles(rRes.value.data);
      if (pRes.status === 'fulfilled' && pRes.value?.data) setPermissions(pRes.value.data);
      if (sRes.status === 'fulfilled' && sRes.value?.data) setSessions(sRes.value.data);
      if (setRes.status === 'fulfilled' && setRes.value?.data) setSettings(setRes.value.data);
      if (retRes.status === 'fulfilled' && retRes.value?.data) setRetention(retRes.value.data);
      if (audRes.status === 'fulfilled' && audRes.value?.data) setAuditLogs(audRes.value.data);
      if (scRes.status === 'fulfilled' && scRes.value?.data) setScenarios(scRes.value.data);
      if (hRes.status === 'fulfilled' && hRes.value?.data) setHealthData(hRes.value.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration & Configuration Center"
        description="Unified Policy Management, RBAC, User Administration, Subsystem Settings, Audit Logs, and System Health"
      />

      <div className="flex bg-soc-cardBg border border-soc-panelBorder rounded-lg overflow-hidden min-h-[700px]">
        {/* Admin Sidebar Navigation */}
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content Workspace */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6 font-mono text-xs">
              {/* Overview Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-soc-panelBg border border-soc-panelBorder rounded">
                  <div className="flex justify-between items-center text-soc-textMuted">
                    <span>Active Users</span>
                    <Users className="w-4 h-4 text-soc-accent" />
                  </div>
                  <div className="text-2xl font-bold text-soc-textPrimary mt-2">
                    {overviewData?.overview?.activeUsersCount || users.length || 4}
                  </div>
                  <div className="text-[10px] text-soc-textMuted mt-1">Registered Operators</div>
                </div>

                <div className="p-4 bg-soc-panelBg border border-soc-panelBorder rounded">
                  <div className="flex justify-between items-center text-soc-textMuted">
                    <span>Active JWT Sessions</span>
                    <Laptop className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-soc-textPrimary mt-2">
                    {overviewData?.overview?.activeSessionsCount || sessions.length || 2}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1">Authenticated Clients</div>
                </div>

                <div className="p-4 bg-soc-panelBg border border-soc-panelBorder rounded">
                  <div className="flex justify-between items-center text-soc-textMuted">
                    <span>Config Parameters</span>
                    <Settings className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-soc-textPrimary mt-2">
                    {overviewData?.overview?.totalSettingsCount || settings.length || 52}
                  </div>
                  <div className="text-[10px] text-soc-textMuted mt-1">Across 16 Categories</div>
                </div>

                <div className="p-4 bg-soc-panelBg border border-soc-panelBorder rounded">
                  <div className="flex justify-between items-center text-soc-textMuted">
                    <span>Lab Environment</span>
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-amber-400 mt-2">
                    LAB_SIMULATION
                  </div>
                  <div className="text-[10px] text-amber-300/80 mt-1">Fail-Closed Safety</div>
                </div>
              </div>

              {/* Subsystem Health Snapshot */}
              <SystemHealthPanel healthData={healthData || overviewData} onRefresh={fetchAllData} />

              {/* Recent Audit Log Feed */}
              <AuditTable logs={auditLogs} onRefresh={fetchAllData} />
            </div>
          )}

          {activeTab === 'users' && (
            <UserTable users={users} onRefresh={fetchAllData} />
          )}

          {activeTab === 'roles' && (
            <RoleTable
              roles={roles}
              onRefresh={fetchAllData}
              onSelectRole={(role) => {
                setSelectedRoleForPerms(role);
                setActiveTab('permissions');
              }}
            />
          )}

          {activeTab === 'permissions' && (
            <PermissionMatrix
              roles={roles}
              permissions={permissions}
              selectedRole={selectedRoleForPerms}
              onRefresh={fetchAllData}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionTable sessions={sessions} onRefresh={fetchAllData} />
          )}

          {activeTab === 'settings' && (
            <ConfigurationPanel settings={settings} onRefresh={fetchAllData} />
          )}

          {activeTab === 'retention' && (
            <RetentionEditor policies={retention} onRefresh={fetchAllData} />
          )}

          {activeTab === 'simulation' && (
            <SimulationPolicyEditor scenarios={scenarios} onRefresh={fetchAllData} />
          )}

          {activeTab === 'audit' && (
            <AuditTable logs={auditLogs} onRefresh={fetchAllData} />
          )}

          {activeTab === 'system' && (
            <SystemHealthPanel healthData={healthData || overviewData} onRefresh={fetchAllData} />
          )}
        </div>
      </div>
    </div>
  );
};
