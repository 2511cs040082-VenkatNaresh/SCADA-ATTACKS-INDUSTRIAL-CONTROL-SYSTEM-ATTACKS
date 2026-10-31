import logging
import asyncio
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SimulatorConnection:
    """Manages connection, polling, timeout, and reconnect logic with Phase 4 Simulator."""

    def __init__(self, simulator_url: str = "http://localhost:8085"):
        self.simulator_url = simulator_url.rstrip("/")
        self.is_connected = False
        self.reconnect_interval = 2.0
        self.max_attempts = 10

    def check_connection_sync(self) -> bool:
        try:
            resp = requests.get(f"{self.simulator_url}/api/simulator/status", timeout=2.0)
            if resp.status_code == 200:
                self.is_connected = True
                return True
        except Exception as e:
            logger.debug(f"Simulator connection check failed: {e}")
        self.is_connected = False
        return False

    async def fetch_process_state(self) -> Optional[Dict[str, Any]]:
        """Fetches current process values from simulator REST endpoint."""
        try:
            resp = await asyncio.to_thread(
                requests.get, f"{self.simulator_url}/api/simulator/process", timeout=3.0
            )
            if resp.status_code == 200:
                self.is_connected = True
                return resp.json()
        except Exception as e:
            self.is_connected = False
            logger.debug(f"Failed to fetch simulator process state: {e}")
        return None

    async def fetch_devices_state(self) -> Optional[Dict[str, Any]]:
        """Fetches current device inventory states from simulator REST endpoint."""
        try:
            resp = await asyncio.to_thread(
                requests.get, f"{self.simulator_url}/api/simulator/devices", timeout=3.0
            )
            if resp.status_code == 200:
                self.is_connected = True
                return resp.json()
        except Exception as e:
            self.is_connected = False
            logger.debug(f"Failed to fetch simulator devices state: {e}")
        return None
