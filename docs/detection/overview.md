# ICS-SHIELD Detection Engine Documentation

## Microservice Architecture
Standalone Python service built with FastAPI listening on port `8000`.

## Detection Strategy
1. Protocol anomaly inspection (Modbus coil function code validation).
2. Rate-based volumetric anomaly detection (DNP3 response bursts).
3. Industrial payload heuristic matching.
