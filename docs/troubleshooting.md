# ICS-SHIELD — Troubleshooting Guide

## Common Issues
- **Database Connection Offline**: Service fallbacks to in-memory fixtures. Ensure MySQL container is running or check credentials in `.env`.
- **WebSocket Disconnection**: Auto-reconnection logic attempts reconnection every 5s. Check network status.
- **Simulation Target Violation**: Verify target asset is on allowlist (`PLC-001`, `RTU-001`, `HMI-001`).
