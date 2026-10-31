# Telemetry Pipeline Processing & Backpressure

## Bounded Priority Queue
The Python pipeline features a bounded `asyncio.PriorityQueue` (maxsize: 5000).

- **CRITICAL / HIGH Priority**: Security events, emergency trips, device offline transitions. High-priority events are guaranteed delivery with forced queue placement.
- **NORMAL / LOW Priority**: Periodic process metric ticks. Standard backpressure applies when queue reaches max size.

## Idempotency & Deduplication
Every incoming event is validated for a unique UUID `event_id`. Duplicate `event_id` submissions within the sliding history window are recognized and dropped to prevent double database insertion.
