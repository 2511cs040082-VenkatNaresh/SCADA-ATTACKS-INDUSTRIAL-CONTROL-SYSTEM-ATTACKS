# Phase 20 — Known Issues & System Limitations

## 1. Current System Limitations
1. **Isolated Laboratory Sandboxing**:
   - *Impact*: Response actions (`SIMULATE_NETWORK_ISOLATION`, `SIMULATE_PROCESS_SAFE_STATE`) execute exclusively against simulated device state adapters in `LAB_SIMULATION` mode.
   - *Mitigation*: Fail-closed safety guard prevents any accidental binding to live external operational network interfaces.
2. **Offline MySQL Fallback Warning Logs**:
   - *Impact*: When running tests without a live local MySQL daemon, service layers emit `logger.warn()` fallback notices while utilizing in-memory fixture stores.
   - *Mitigation*: Fallback stores maintain 100% feature parity and data structures for isolated testing without live database dependencies.
