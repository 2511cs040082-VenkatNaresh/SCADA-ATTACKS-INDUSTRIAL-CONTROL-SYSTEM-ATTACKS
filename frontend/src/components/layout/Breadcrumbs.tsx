import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNameMap: Record<string, string> = {
  dashboard: 'Dashboard',
  assets: 'Asset Inventory',
  discovery: 'Discovery',
  health: 'Health',
  risk: 'Risk',
  telemetry: 'Telemetry Pipeline',
  network: 'Network Center',
  sessions: 'Sessions',
  protocols: 'Protocols',
  modbus: 'Modbus/TCP',
  topology: 'Topology',
  process: 'Process Monitor',
  alerts: 'Alert Center',
  incidents: 'Incident Center',
  detection: 'Detection Engine',
  behavioral: 'Behavioral Anomaly',
  ml: 'Machine Learning',
  mitre: 'MITRE ATT&CK for ICS',
  response: 'Defense & Response',
  simulation: 'Simulation Laboratory',
  story: 'Simulation Story Mode',
  reports: 'Reports',
  admin: 'Administration',
  settings: 'Settings',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs font-mono text-soc-textMuted mb-4">
      <Link to="/dashboard" className="flex items-center space-x-1 hover:text-cyan-400 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[value] || (value.length > 20 ? `${value.substring(0, 8)}...` : value);

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            {isLast ? (
              <span className="text-cyan-400 font-semibold uppercase tracking-wide">{displayName}</span>
            ) : (
              <Link to={to} className="hover:text-cyan-400 transition-colors uppercase">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
