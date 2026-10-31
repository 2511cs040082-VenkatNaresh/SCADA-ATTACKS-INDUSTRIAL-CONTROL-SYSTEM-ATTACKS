import asyncio
import logging
from typing import Tuple, Optional
from telemetry.schemas.event_schema import EventEnvelope, EventPriority

logger = logging.getLogger(__name__)

PRIORITY_WEIGHTS = {
    EventPriority.CRITICAL: 1,
    EventPriority.HIGH: 2,
    EventPriority.NORMAL: 3,
    EventPriority.LOW: 4
}

class TelemetryQueue:
    """Bounded async priority queue with backpressure handling."""

    def __init__(self, maxsize: int = 5000):
        self.maxsize = maxsize
        self._queue = asyncio.PriorityQueue(maxsize=maxsize)
        self.dropped_telemetry_count = 0
        self.dropped_critical_count = 0
        self.sequence_counter = 0

    async def put(self, event: EventEnvelope) -> bool:
        """
        Enqueues event according to priority.
        If queue is full, applies backpressure/dropping strategy.
        - Security / CRITICAL events are NEVER silently dropped.
        - Normal telemetry events are dropped with logging if queue is saturated.
        """
        priority_weight = PRIORITY_WEIGHTS.get(event.priority, 3)
        self.sequence_counter += 1

        if self._queue.full():
            if event.priority in [EventPriority.CRITICAL, EventPriority.HIGH]:
                logger.warning(f"Queue full! Forcing delivery for priority event {event.event_id}")
                try:
                    await asyncio.wait_for(self._queue.put((priority_weight, self.sequence_counter, event)), timeout=2.0)
                    return True
                except asyncio.TimeoutError:
                    self.dropped_critical_count += 1
                    logger.error(f"Failed to deliver critical event {event.event_id} due to queue saturation")
                    return False
            else:
                self.dropped_telemetry_count += 1
                logger.debug(f"Queue full! Dropped low priority event {event.event_id}")
                return False

        try:
            self._queue.put_nowait((priority_weight, self.sequence_counter, event))
            return True
        except asyncio.QueueFull:
            self.dropped_telemetry_count += 1
            return False

    async def get(self) -> EventEnvelope:
        """Retrieves highest priority event from queue."""
        _, _, event = await self._queue.get()
        return event

    def task_done(self):
        self._queue.task_done()

    def qsize(self) -> int:
        return self._queue.qsize()

    def is_empty(self) -> bool:
        return self._queue.empty()

    def is_full(self) -> bool:
        return self._queue.full()
