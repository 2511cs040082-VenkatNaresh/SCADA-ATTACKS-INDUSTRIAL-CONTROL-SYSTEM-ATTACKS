import logging
import time
from typing import Optional, Dict, Any
from telemetry.schemas.event_schema import EventEnvelope
from telemetry.normalization.normalizer import TelemetryNormalizer
from telemetry.monitoring.metrics import metrics_tracker

logger = logging.getLogger(__name__)

class EventProcessor:
    """Processes, validates, and prepares events for ingestion."""

    def __init__(self):
        self.processed_ids = set()
        self.max_history = 10000

    def process(self, event: EventEnvelope) -> Optional[EventEnvelope]:
        start_time = time.time()

        # Idempotency / Duplicate Check
        if event.event_id in self.processed_ids:
            metrics_tracker.record_duplicate(1)
            logger.debug(f"Duplicate event ignored: {event.event_id}")
            return None

        # Record ID
        self.processed_ids.add(event.event_id)
        if len(self.processed_ids) > self.max_history:
            self.processed_ids.clear()

        # Calculation & Latency
        latency_ms = (time.time() - start_time) * 1000.0
        metrics_tracker.record_processed(1, latency_ms)

        return event
