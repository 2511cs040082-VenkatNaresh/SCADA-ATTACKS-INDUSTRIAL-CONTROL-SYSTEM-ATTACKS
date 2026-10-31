# ICS Network & Industrial Protocol Monitoring Layer

The **Network Monitor Microservice** provides passive real-time industrial protocol monitoring, flow aggregation, session management, transaction correlation, and baseline analysis for Modbus/TCP traffic.

## Key Capabilities
- **Modbus/TCP Monitoring**: Function codes 01, 02, 03, 04, 05, 06, 15, 16 parsing with safe `UNKNOWN_FUNCTION` fallback handling.
- **Request/Response Transaction Correlation**: Matches requests and responses, calculates transaction latency.
- **Protocol Session Management**: Maintains real-time logical protocol session states (`ACTIVE`, `IDLE`, `CLOSED`).
- **Flow Aggregation**: Aggregates packets into persistent network flows.
- **Extensible Registry**: Protocol adapters for Modbus/TCP, DNP3, OPC UA, S7, EtherNet/IP.
