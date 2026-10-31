# ICS Laboratory Simulator Architecture

## Overview
The **ICS-SHIELD Isolated ICS/SCADA Laboratory Simulator** is a dedicated Python 3 microservice designed to simulate an industrial control system environment. It provides realistic telemetry, protocol interactions, state management, and anomaly simulation for research and testing of detection algorithms within the ICS-SHIELD platform.

```
                     +----------------------------------+
                     |    ICS-SHIELD React Frontend     |
                     +----------------------------------+
                                      |
                                  HTTP / REST
                                      v
                     +----------------------------------+
                     |    Node.js / Express Backend     |
                     +----------------------------------+
                                      |
                            HTTP Proxy (/api/simulator)
                                      v
+-----------------------------------------------------------------------------------+
|                        ICS Laboratory Simulator Microservice                      |
|                                                                                   |
|  +---------------------+      +---------------------+      +-------------------+  |
|  |     FastAPI API     | <--> |  Simulation Engine  | <--> |   Process Model   |  |
|  +---------------------+      +---------------------+      +-------------------+  |
|                                          |                           |            |
|                                          v                           v            |
|                               +---------------------+      +-------------------+  |
|                               |    Device Models    |      |  Modbus Protocol  |  |
|                               +---------------------+      +-------------------+  |
|                                          |                                        |
|                                          v                                        |
|                               +---------------------+                             |
|                               | Telemetry Generator |                             |
|                               +---------------------+                             |
|                                          |                                        |
|                                          v                                        |
|                               +---------------------+                             |
|                               |  Telemetry Sender   |                             |
|                               +---------------------+                             |
+-----------------------------------------------------------------------------------+
                                           |
                                  HTTP POST / JSON
                                           v
                     +----------------------------------+
                     |  Python Detection Engine / API   |
                     +----------------------------------+
```

## Component Breakdown

### 1. Simulation Engine (`simulator/core/simulation_engine.py`)
- **Master Tick Loop**: Executes at a configurable interval (default: 1.0 second).
- **Clock**: Maintains simulation tick counter and elapsed time.
- **Event Bus**: Asynchronous pub/sub architecture for inter-component messaging.
- **State Manager**: Centralized in-memory data store holding active device states, process variables, and active scenarios.

### 2. Physical Process Model (`simulator/process/process_model.py`)
- Simulates a **Water Treatment & Storage Industrial Loop**.
- Mathematical modeling using ordinary differential equations for:
  - Tank Level ($0 - 100\%$)
  - Process Water Temperature ($10 - 90^\circ\text{C}$)
  - System Pressure ($0 - 10\text{ bar}$)
  - Flow Rate ($0 - 300\text{ L/min}$)
  - Pump Speed ($0 - 3000\text{ RPM}$)
  - Valve Position ($0 - 100\%$)
  - Water Quality Index ($0 - 100\%$)
- Includes closed-loop PID/bang-bang feedback control logic (`control_logic.py`).

### 3. Device Models (`simulator/devices/`)
- Simulates 16 realistic industrial assets across 4 Purdue Model levels (0 through 3).
- Maintains state machines (`ONLINE`, `WARNING`, `DEGRADED`, `OFFLINE`, `MAINTENANCE`).
- Implements device-specific telemetry generation and register mapping.

### 4. Protocol Simulation (`simulator/protocols/`)
- **Modbus/TCP**: Simulates Function Codes `01` (Read Coils), `03` (Read Holding Registers), `05` (Write Single Coil), `06` (Write Single Register), and `16` (Write Multiple Registers).
- Validates register boundaries and logs protocol request/response events.

### 5. Telemetry & Event Ingestion (`simulator/telemetry/`)
- Normalizes process variables and device metrics into standardized JSON schemas.
- Ingestion client forwards normalized JSON payloads to the detection backend via HTTP POST with automatic retry and error handling.

### 6. REST API Interface (`simulator/api/simulator_api.py`)
- Built with **FastAPI**.
- Exposes control endpoints for starting/stopping scenarios, inspecting physical process variables, querying topology, and resetting lab state.
