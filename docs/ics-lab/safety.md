# Safety & Isolation Architecture

## Absolute Safety Directives

> [!IMPORTANT]
> The ICS-SHIELD Laboratory Microservice is engineered strictly for **defensive cybersecurity research, training, and algorithmic detection validation**.
> It is designed to operate safely inside isolated environment boundaries with zero capability or intent to interact with physical infrastructure.

### Safety Guarantee Matrix

| Security Domain | Operational Rule | Architectural Mechanism |
|---|---|---|
| **External Network Scanning** | **PROHIBITED** | Loopback binding & internal synthetic IP ranges (`10.10.x.x` virtual memory space). |
| **Physical PLC Connectivity** | **PROHIBITED** | In-memory Python device emulation (`plc.py`, `rtu.py`). No physical serial/Ethernet hardware sockets. |
| **Destructive Command Execution**| **PROHIBITED** | All control logic is simulated in math equations. No OS shell execution capabilities exist within scenario classes. |
| **External Target IPs** | **PROHIBITED** | Telemetry and events are routed exclusively to local localhost/docker container APIs. |

## Network Isolation
1. **Virtual IP Subnet (`10.10.0.0/16`)**:
   - Device IP addresses (such as `10.10.3.10` for `PLC-001`) are purely string representations used in memory data structures.
   - The simulator does **not** create host network interfaces or bind real network sockets to `10.10.x.x` addresses.
2. **REST & Modbus API Binding**:
   - The simulator FastAPI interface binds to `0.0.0.0:8085` inside its Docker container (`ics-lab`).
   - Modbus TCP simulation is handled internally via Python async event streams.

## Audit & Compliance Log
Every scenario activation, status update, and parameter modification is logged to system audit logs with full context:
- Initiating user / process ID
- Timestamp (UTC)
- Scenario identifier
- Target simulated Purdue Level / Device ID
