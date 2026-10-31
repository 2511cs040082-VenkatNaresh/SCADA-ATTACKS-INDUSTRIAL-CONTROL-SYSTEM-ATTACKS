import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WebSocketProvider } from './context/WebSocketContext';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Assets } from './pages/Assets';
import { AssetDetail } from './pages/AssetDetail';
import { AssetDiscovery } from './pages/AssetDiscovery';
import { AssetHealth } from './pages/AssetHealth';
import { AssetRisk } from './pages/AssetRisk';
import { Telemetry } from './pages/Telemetry';
import { Network } from './pages/Network';
import { NetworkSessions } from './pages/NetworkSessions';
import { ProtocolMonitor } from './pages/ProtocolMonitor';
import { ModbusMonitor } from './pages/ModbusMonitor';
import { Topology } from './pages/Topology';
import { Process } from './pages/Process';
import { Alerts } from './pages/Alerts';
import { AlertDetail } from './pages/AlertDetail';
import { Incidents } from './pages/Incidents';
import { IncidentDetail } from './pages/IncidentDetail';
import { Detection } from './pages/Detection';
import { Behavioral } from './pages/Behavioral';
import { MLDetection } from './pages/MLDetection';
import { Mitre } from './pages/Mitre';
import { Simulation } from './pages/Simulation';
import { Response } from './pages/Response';
import { Reports } from './pages/Reports';
import { Analytics } from './pages/Analytics';
import { Admin } from './pages/Admin';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            {/* Full-screen Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Main SOC Layout Shell Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="assets/discovery" element={<AssetDiscovery />} />
              <Route path="assets/health" element={<AssetHealth />} />
              <Route path="assets/risk" element={<AssetRisk />} />
              <Route path="assets/:id" element={<AssetDetail />} />
              <Route path="telemetry" element={<Telemetry />} />
              <Route path="network" element={<Network />} />
              <Route path="network/sessions" element={<NetworkSessions />} />
              <Route path="protocols" element={<ProtocolMonitor />} />
              <Route path="protocols/modbus" element={<ModbusMonitor />} />
              <Route path="topology" element={<Topology />} />
              <Route path="process" element={<Process />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="alerts/:id" element={<AlertDetail />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="incidents/:id" element={<IncidentDetail />} />
              <Route path="detection" element={<Detection />} />
              <Route path="behavioral" element={<Behavioral />} />
              <Route path="ml" element={<MLDetection />} />
              <Route path="mitre" element={<Mitre />} />
              <Route path="simulation" element={<Simulation />} />
              <Route path="simulation/story/:runId" element={<Simulation />} />
              <Route path="response" element={<Response />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/create" element={<Reports />} />
              <Route path="reports/schedules" element={<Reports />} />
              <Route path="reports/:id" element={<Reports />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="analytics/:tab" element={<Analytics />} />
              <Route path="analytics/simulation/:runId" element={<Analytics />} />
              <Route path="admin" element={<Admin />} />
              <Route path="admin/*" element={<Admin />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
};

export default App;
