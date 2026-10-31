import logging
import asyncio
import requests
from typing import Dict, Any

logger = logging.getLogger(__name__)

class BackendNetworkClient:
    def __init__(self, backend_url: str = "http://localhost:5050"):
        self.backend_url = backend_url.rstrip("/")
        self.endpoint = f"{self.backend_url}/api/v1/internal/network-update"
        self.headers = {
            "Content-Type": "application/json",
            "X-Internal-Service-Key": "ics_shield_internal_telemetry_secret_token_2026"
        }

    async def send_network_update(self, payload: Dict[str, Any]):
        try:
            await asyncio.to_thread(
                requests.post, self.endpoint, json=payload, headers=self.headers, timeout=3.0
            )
        except Exception as e:
            logger.debug(f"Failed to post network update to backend: {e}")
