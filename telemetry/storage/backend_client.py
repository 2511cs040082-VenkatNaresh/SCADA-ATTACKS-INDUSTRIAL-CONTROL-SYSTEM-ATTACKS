import logging
import asyncio
import requests
from typing import List, Dict, Any, Optional
from telemetry.schemas.event_schema import EventEnvelope
from telemetry.pipeline.retry import execute_with_retry

logger = logging.getLogger(__name__)

class BackendClient:
    """HTTP client communicating with the Express Backend Internal Ingestion API."""

    def __init__(self, backend_url: str = "http://localhost:5050", service_token: str = "ics_shield_internal_telemetry_secret_token_2026"):
        self.backend_url = backend_url.rstrip("/")
        self.service_token = service_token
        self.single_endpoint = f"{self.backend_url}/api/v1/internal/events"
        self.batch_endpoint = f"{self.backend_url}/api/v1/internal/events/batch"
        self.health_endpoint = f"{self.backend_url}/api/v1/system/telemetry/health"
        self.headers = {
            "Content-Type": "application/json",
            "X-Internal-Service-Key": self.service_token,
            "Authorization": f"Bearer {self.service_token}"
        }

    def send_event_sync(self, event: EventEnvelope) -> Dict[str, Any]:
        """Sends a single event synchronously to the backend ingestion endpoint."""
        payload = event.model_dump()
        resp = requests.post(self.single_endpoint, json=payload, headers=self.headers, timeout=5.0)
        resp.raise_for_status()
        return resp.json()

    def send_batch_sync(self, events: List[EventEnvelope]) -> Dict[str, Any]:
        """Sends a batch of events synchronously to backend batch ingestion endpoint."""
        payload = {"events": [e.model_dump() for e in events]}
        resp = requests.post(self.batch_endpoint, json=payload, headers=self.headers, timeout=5.0)
        resp.raise_for_status()
        return resp.json()

    async def send_event_async(self, event: EventEnvelope) -> Dict[str, Any]:
        """Sends a single event asynchronously with retry."""
        return await execute_with_retry(lambda: asyncio.to_thread(self.send_event_sync, event))

    async def send_batch_async(self, events: List[EventEnvelope]) -> Dict[str, Any]:
        """Sends a batch of events asynchronously with retry."""
        if not events:
            return {"status": "success", "processed": 0}
        return await execute_with_retry(lambda: asyncio.to_thread(self.send_batch_sync, events))
