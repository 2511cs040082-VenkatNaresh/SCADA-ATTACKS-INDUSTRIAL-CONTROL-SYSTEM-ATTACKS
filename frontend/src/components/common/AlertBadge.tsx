import React from 'react';
import { SeverityType } from '../../types';
import { cn } from '../../utils/cn';

interface AlertBadgeProps {
  severity: SeverityType | string;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({ severity }) => {
  const normSev = (severity || 'LOW').toUpperCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (normSev === 'CRITICAL') {
    styles = 'bg-rose-950/90 text-rose-300 border-rose-700 font-semibold animate-pulse';
  } else if (normSev === 'HIGH') {
    styles = 'bg-orange-950/80 text-orange-400 border-orange-800';
  } else if (normSev === 'MEDIUM') {
    styles = 'bg-amber-950/80 text-amber-400 border-amber-800';
  } else if (normSev === 'LOW') {
    styles = 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
  }

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider', styles)}>
      {normSev}
    </span>
  );
};
