# Asset Intelligence Layer Architecture

## System Purpose
The **Asset Intelligence Layer** provides real-time visibility, asset inventory tracking, unknown asset discovery, explainable health metrics, risk posture estimation, communication baselining, and Purdue topology graphing across the 16 laboratory assets.

```
       [ Telemetry / Event Ingestion ]
                      │
                      ▼
              [ Asset Resolver ]
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    [ Known Asset ]        [ Unknown Asset ]
          │                       │
  Update last_seen        Record Discovery
          │                       │
          └───────────┬───────────┘
                      ▼
             [ Asset Inventory ]
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   [ Health ]    [ Baseline ]    [ Risk ]
        │             │             │
        └─────────────┼─────────────┘
                      ▼
            [ Topology & SOC UI ]
```

## Discovery Sources
1. `SIMULATOR_REGISTRATION`: Preset configuration definitions.
2. `TELEMETRY_OBSERVATION`: Observation of metrics from host IP.
3. `NETWORK_EVENT_OBSERVATION`: Flow events between IP pairs.
4. `PROTOCOL_EVENT_OBSERVATION`: Modbus/TCP request monitoring.
5. `ADMIN_MANUAL_ENTRY`: Manual operator asset registration.

> [!NOTE]
> Passive observation only. Zero active network scanning or external probing exists in this layer.
