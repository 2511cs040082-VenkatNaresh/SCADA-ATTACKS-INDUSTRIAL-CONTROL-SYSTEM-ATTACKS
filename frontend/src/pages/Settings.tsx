import React from 'react';
import { Settings as SettingsIcon, Sliders, Database, Wifi } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Panel } from '../components/common/Panel';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings & System Parameters"
        description="Backend API Endpoints, Database Connection Strings, and Telemetry Service Configuration"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
        <Panel title="Network & API Integration" subtitle="Service URLs" icon={<Wifi className="w-4 h-4" />}>
          <div className="space-y-3">
            <div>
              <label className="block text-soc-textMuted mb-1">REST API Base URL</label>
              <input
                type="text"
                defaultValue="http://localhost:5000/api"
                disabled
                className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-soc-telemetry"
              />
            </div>
            <div>
              <label className="block text-soc-textMuted mb-1">WebSocket Telemetry Feed</label>
              <input
                type="text"
                defaultValue="ws://localhost:5001"
                disabled
                className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-soc-telemetry"
              />
            </div>
            <div>
              <label className="block text-soc-textMuted mb-1">Python Detection Engine Endpoint</label>
              <input
                type="text"
                defaultValue="http://localhost:8000"
                disabled
                className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-soc-telemetry"
              />
            </div>
          </div>
        </Panel>

        <Panel title="Database Engine Settings" subtitle="MySQL Pool Manager" icon={<Database className="w-4 h-4" />}>
          <div className="space-y-3">
            <div>
              <label className="block text-soc-textMuted mb-1">Database Target Host</label>
              <input
                type="text"
                defaultValue="localhost:3306 (icsshield_db)"
                disabled
                className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-soc-textPrimary"
              />
            </div>
            <div>
              <label className="block text-soc-textMuted mb-1">Active Database User</label>
              <input
                type="text"
                defaultValue="icsshield_user"
                disabled
                className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-soc-textPrimary"
              />
            </div>
            <div>
              <label className="block text-soc-textMuted mb-1">Connection Pool Limit</label>
              <input
                type="text"
                defaultValue="10 Max Active Connections"
                disabled
                className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-soc-textPrimary"
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};
