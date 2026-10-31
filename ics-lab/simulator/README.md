# ICS-SHIELD Laboratory Simulator

## Safety & Defensive Research Boundary
> [!IMPORTANT]
> **SAFETY GUARANTEE**: This simulator operates strictly in an isolated simulation environment using laboratory IP addresses (`10.10.x.x`). It does not contact external networks, scan physical targets, or control real industrial hardware equipment.

## Quick Start
```bash
python3 -m ics-lab.simulator.main
```
Health Endpoint: `http://localhost:8085/health`
Simulator Status: `http://localhost:8085/api/simulator/status`
