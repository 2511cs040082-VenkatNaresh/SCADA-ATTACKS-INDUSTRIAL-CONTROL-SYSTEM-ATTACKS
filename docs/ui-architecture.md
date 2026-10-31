# ICS-SHIELD Phase 16 — Unified SOC UI Architecture

## 1. Overview
This document describes the frontend architecture for **ICS-SHIELD Phase 16: Advanced SOC Dashboard & Unified ICS Security Operations Center Interface**.

The interface is built using:
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS (Dark Industrial Cybersecurity SOC Theme)
- **State Management**: React Context (`WebSocketContext`, `AuthContext`) + Local React state
- **Routing**: React Router v6

---

## 2. Layout & Shell Component Hierarchy

```
App Providers (AuthProvider -> WebSocketProvider)
└── BrowserRouter
    └── MainLayout Shell
        ├── Topbar (System Status, Environment Indicator 🧪, Quick Search ⌘K, Notifications, Role Switcher)
        ├── Sidebar (14 Role-Aware Directory Links: Dashboard, Assets, Network, Topology, Process, Detections, Alerts, Incidents, MITRE, Response, Simulation, Reports, Admin, Settings)
        ├── Breadcrumbs (Dynamic route navigation tree)
        ├── Content Area (Outlet rendering active workspace)
        ├── CommandPalette (Cmd+K Global Search & Shortcut Modal)
        └── Footer (Node Status, DB Status, MITRE ATT&CK Version)
```

---

## 3. Dark Industrial SOC Color Palette
- **Background**: `#0b0f17` / `slate-950`
- **Panels**: `#111827` / `slate-900` border `#1e293b`
- **Telemetry Accents**: Cyan `#38bdf8` / `#06b6d4`
- **Status Indicators**:
  - `HEALTHY / ONLINE`: `#34d399` (Emerald)
  - `WARNING / DEGRADED`: `#fbbf24` (Amber)
  - `CRITICAL / HIGH`: `#f87171` (Rose/Red)
  - `INFORMATIONAL`: `#94a3b8` (Neutral Gray)
- **Typography**:
  - `Inter` for general UI text
  - `JetBrains Mono` for technical values, IP addresses, ports, IDs, timestamps, and system logs.

---

## 4. Role-Based Access Control (RBAC) System
Supports 5 security operator roles:
1. `ADMIN`: Full system administration, policy modification, response approval.
2. `SECURITY_ANALYST`: Incident investigation, response plan approval, hypothesis testing.
3. `SOC_OPERATOR`: Real-time monitoring, alert acknowledgment, simulation execution.
4. `OT_OPERATOR`: Physical process monitoring, asset tag editing.
5. `VIEWER`: Read-only access across all consoles.

Backend authorization remains authoritative for all API state mutations.
