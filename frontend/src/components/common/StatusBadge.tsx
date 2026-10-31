import React from 'react';
import { StatusType } from '../../types';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', pulse = true }) => {
  const normStatus = (status || 'UNKNOWN').toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
  let dotColor = 'bg-slate-500';

  if (normStatus === 'HEALTHY' || normStatus === 'ONLINE' || normStatus === 'OPERATIONAL') {
    colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
    dotColor = 'bg-emerald-500';
  } else if (normStatus === 'WARNING' || normStatus === 'STANDBY') {
    colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
    dotColor = 'bg-amber-500';
  } else if (normStatus === 'CRITICAL' || normStatus === 'ERROR' || normStatus === 'DISCONNECTED') {
    colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-800/60';
    dotColor = 'bg-rose-500';
  } else if (normStatus === 'OFFLINE') {
    colorClasses = 'bg-slate-900 text-slate-400 border-slate-700';
    dotColor = 'bg-slate-500';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono font-medium tracking-wide uppercase rounded border px-2 py-0.5',
        size === 'sm' ? 'text-[11px]' : 'text-xs px-2.5 py-1',
        colorClasses
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', dotColor, pulse && 'animate-pulse')} />
      {normStatus}
    </span>
  );
};
