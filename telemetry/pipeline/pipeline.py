import logging
import asyncio
from typing import Optional
from telemetry.collector.collector import TelemetryCollector
from telemetry.pipeline.queue import TelemetryQueue
from telemetry.pipeline.processor import EventProcessor
from telemetry.pipeline.dispatcher import EventDispatcher
from telemetry.storage.backend_client import BackendClient
from telemetry.monitoring.metrics import metrics_tracker
from telemetry.monitoring.health import PipelineHealthService

logger = logging.getLogger(__name__)

class TelemetryPipeline:
    """Master pipeline runner connecting Collector -> Queue -> Processor -> Dispatcher -> Backend."""

    def __init__(self, backend_url: str = "http://localhost:5050", simulator_url: str = "http://localhost:8085", queue_size: int = 5000):
        self.collector = TelemetryCollector(simulator_url=simulator_url, poll_interval=1.0)
        self.queue = TelemetryQueue(maxsize=queue_size)
        self.processor = EventProcessor()
        self.client = BackendClient(backend_url=backend_url)
        self.dispatcher = EventDispatcher(backend_client=self.client, batch_size=20, batch_timeout=0.5)
        self._running = False
        self._collector_task: Optional[asyncio.Task] = None
        self._worker_task: Optional[asyncio.Task] = None

    async def start(self):
        self._running = True
        logger.info("Starting ICS-SHIELD Real-Time Telemetry Pipeline...")
        self._collector_task = asyncio.create_task(self._collector_loop())
        self._worker_task = asyncio.create_task(self._worker_loop())

    async def stop(self):
        self._running = False
        if self._collector_task:
            self._collector_task.cancel()
        if self._worker_task:
            self._worker_task.cancel()
        logger.info("Telemetry Pipeline stopped.")

    async def _collector_loop(self):
        while self._running:
            try:
                events = await self.collector.poll_once()
                metrics_tracker.record_received(len(events))
                for ev in events:
                    await self.queue.put(ev)
            except Exception as e:
                logger.error(f"Error in collector loop: {e}")
            await asyncio.sleep(self.collector.poll_interval)

    async def _worker_loop(self):
        batch = []
        while self._running:
            try:
                if not self.queue.is_empty():
                    event = await self.queue.get()
                    processed = self.processor.process(event)
                    if processed:
                        batch.append(processed)
                    self.queue.task_done()

                if len(batch) >= 20 or (batch and self.queue.is_empty()):
                    await self.dispatcher.dispatch_batch(batch)
                    batch.clear()

            except Exception as e:
                logger.error(f"Error in pipeline worker loop: {e}")
            await asyncio.sleep(0.1)

    def get_health(self):
        return PipelineHealthService.get_health(queue_depth=self.queue.qsize())
