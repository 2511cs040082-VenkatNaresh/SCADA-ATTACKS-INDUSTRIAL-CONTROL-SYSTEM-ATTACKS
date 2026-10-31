import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Telemetry Data Available',
  description = 'There are currently no security events or active anomalies matching your view filter.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-soc-panel/40 rounded border border-soc-panelBorder my-4">
      <div className="p-3 bg-soc-bg rounded-full border border-soc-panelBorder mb-3 text-soc-textMuted">
        <ShieldAlert className="w-6 h-6 text-soc-telemetry" />
      </div>
      <h4 className="text-sm font-semibold text-soc-textPrimary">{title}</h4>
      <p className="text-xs text-soc-textMuted font-mono max-w-md mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
