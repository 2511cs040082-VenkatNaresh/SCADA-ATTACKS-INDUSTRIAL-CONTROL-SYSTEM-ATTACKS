import React from 'react';
import { StatusBadge } from './StatusBadge';
import { StatusType } from '../../types';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  status?: StatusType;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  status,
  icon,
}) => {
  return (
    <div className="bg-soc-panel border border-soc-panelBorder rounded-lg p-3.5 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between overflow-hidden min-w-0 h-full">
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <span
          className="text-[11px] font-semibold text-soc-textSecondary uppercase tracking-wider truncate min-w-0 flex-1"
          title={title}
        >
          {title}
        </span>
        {icon && (
          <div className="text-soc-telemetry p-1.5 bg-soc-bg/60 rounded border border-soc-panelBorder flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-1.5 min-w-0">
        <span
          className="text-base sm:text-lg md:text-xl font-bold font-mono text-soc-textPrimary tracking-tight truncate min-w-0 flex-1"
          title={String(value)}
        >
          {value}
        </span>
        {status && (
          <div className="flex-shrink-0">
            <StatusBadge status={status} size="sm" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-2 text-[10px] sm:text-[11px] font-mono text-soc-textMuted flex items-center justify-between gap-1 min-w-0">
          <span className="truncate min-w-0 flex-1" title={subtitle}>
            {subtitle}
          </span>
          {change && (
            <span
              className={cn(
                'flex-shrink-0 font-medium',
                change.startsWith('+') ? 'text-emerald-400' : 'text-slate-400'
              )}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
