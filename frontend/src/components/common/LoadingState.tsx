import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Initializing SOC Telemetry Stream...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 min-h-[160px]">
      <div className="w-8 h-8 border-2 border-soc-telemetry border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono text-soc-textSecondary tracking-wider uppercase">{message}</span>
    </div>
  );
};
