import logging
import asyncio
from typing import List
from telemetry.schemas.event_schema import EventEnvelope
from telemetry.storage.backend_client import BackendClient
from telemetry.monitoring.metrics import metrics_tracker

logger = logging.getLogger(__name__)

class EventDispatcher:
    """Dispatches processed events to Express Backend Ingestion API in batches."""

    def __init__(self, backend_client: BackendClient, batch_size: int = 50, batch_timeout: float = 0.5):
        self.client = backend_client
        self.batch_size = batch_size
        self.batch_timeout = batch_timeout

    async def dispatch_batch(self, events: List[EventEnvelope]):
        if not events:
            return
        try:
            res = await self.client.send_batch_async(events)
            metrics_tracker.db_write_count += len(events)
            logger.debug(f"Dispatched batch of {len(events)} events to backend API")
        except Exception as e:
            metrics_tracker.record_failed(len(events))
            logger.error(f"Failed to dispatch batch of {len(events)} events: {e}")
