# Real-Time ICS Network & Industrial Protocol Monitoring Architecture

## Overview
The **Network & Industrial Protocol Monitoring Layer** (`network_monitor/`) provides passive, real-time observation, parsing, normalization, session tracking, request/response correlation, and flow aggregation for industrial control protocols.

```
  [ ICS Laboratory Simulator ]
               │
               ▼
  [ Telemetry/Event Ingestion Pipeline ]
               │
               ▼
  [ Network Monitoring Layer ] (Port 8087)
               │
     ┌─────────┴─────────┐
     ▼                   ▼
[ Protocol Adapter ] [ Flow Aggregator ]
     │                   │
  (Modbus/TCP)           ▼
     │            [ Network Flows ]
     ▼
[ Parser & Normalizer ]
     │
     ▼
[ Request/Response Correlator ] ---> (Latency Calculation)
     │
     ▼
[ Session Manager ] ---> (ACTIVE / IDLE / CLOSED States)
     │
     ▼
[ Express Backend & Database ]
     │
     ▼
[ WebSocket Broadcast ] ---> [ SOC Dashboard UI ]
```

## Key Capabilities
- **Modbus/TCP Inspection**: Function codes 01, 02, 03, 04, 05, 06, 15, 16 with safe `UNKNOWN_FUNCTION` fallback handling.
- **Request/Response Transaction Correlation**: Matches requests and responses, calculates transaction latency.
- **Protocol Session Management**: Tracks logical communication session lifecycle (`ACTIVE`, `IDLE`, `CLOSED`).
- **Network Flow Aggregation**: Aggregates packets into persistent logical network flows.
- **Extensible Registry**: Adapter interface for DNP3, OPC UA, Siemens S7, EtherNet/IP.
