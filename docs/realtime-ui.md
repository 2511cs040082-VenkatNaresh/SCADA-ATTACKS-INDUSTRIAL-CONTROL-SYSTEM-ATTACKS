# ICS-SHIELD Real-Time UI & WebSocket Integration

## 1. WebSocket Infrastructure
The UI connects to the existing authenticated backend WebSocket server running on port `5050` via `WebSocketProvider`.
No secondary or duplicate WebSocket connection is created.

---

## 2. Event Types & Handling
The WebSocket event bus streams real-time updates for:
- `telemetry.received`
- `process.updated`
- `asset.updated` / `asset.status_changed`
- `network.flow_observed`
- `protocol.request` / `protocol.response`
- `detection.created`
- `ml.prediction_created`
- `alert.created` / `alert.updated`
- `incident.created` / `incident.updated`
- `mitre.mapping_created`
- `response.recommendation_created` / `response.execution_started` / `response.execution_completed`
- `simulation.started` / `simulation.progress` / `simulation.event_generated` / `simulation.completed`

---

## 3. UI Reaction & Performance Optimization
- **Memory Buffer**: Recent events buffer capped at 500 items in memory to avoid DOM bloating.
- **Selective Subscriptions**: High-frequency telemetry updates use local React state throttling.
- **Automatic Reconnection**: Reconnects silently upon connection loss with status badge indicators (`LIVE WS` vs `WS RECONNECTING`).
