import React from 'react';
import { cn } from '../../utils/cn';

interface PanelProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  className,
}) => {
  return (
    <div className={cn('bg-soc-panel border border-soc-panelBorder rounded-lg flex flex-col overflow-hidden min-w-0', className)}>
      <div className="px-4 py-3 border-b border-soc-panelBorder bg-soc-header/60 flex items-center justify-between gap-2 min-w-0">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {icon && <span className="text-soc-telemetry flex-shrink-0">{icon}</span>}
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-semibold text-soc-textPrimary uppercase tracking-wider truncate" title={title}>{title}</h3>
            {subtitle && <p className="text-[11px] text-soc-textMuted font-mono truncate" title={subtitle}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center space-x-2 flex-shrink-0">{actions}</div>}
      </div>
      <div className="p-4 flex-1 overflow-x-auto min-w-0">{children}</div>
    </div>
  );
};
