import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const Login: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-soc-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-soc-panel border border-soc-panelBorder rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-soc-bg rounded-lg border border-soc-telemetry/30 text-soc-telemetry mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold tracking-wider font-mono text-soc-textPrimary">ICS-SHIELD</h1>
          <p className="text-xs font-mono text-soc-textMuted mt-1">SCADA & Industrial Control System Defense Platform</p>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded text-xs font-mono text-amber-400 mb-6 text-center">
          PHASE 1 NOTICE: Authentication will be enabled in Phase 2.
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-mono text-soc-textSecondary uppercase mb-1">Operator Identifier</label>
            <input
              type="text"
              defaultValue="soc_analyst"
              disabled
              className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-xs font-mono text-soc-textPrimary focus:outline-none focus:border-soc-telemetry"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-soc-textSecondary uppercase mb-1">Access Token / Password</label>
            <input
              type="password"
              defaultValue="••••••••••••"
              disabled
              className="w-full bg-soc-bg border border-soc-panelBorder rounded px-3 py-2 text-xs font-mono text-soc-textPrimary focus:outline-none focus:border-soc-telemetry"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-soc-telemetry hover:bg-sky-400 text-soc-bg font-mono font-bold text-xs rounded transition-colors flex items-center justify-center space-x-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>AUTHENTICATE OPERATOR (PHASE 1 DEMO)</span>
          </button>
        </form>
      </div>
    </div>
  );
};
