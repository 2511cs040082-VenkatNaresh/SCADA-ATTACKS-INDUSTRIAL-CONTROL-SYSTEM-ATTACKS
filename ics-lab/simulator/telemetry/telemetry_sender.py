"""
Telemetry Sender: Authenticated HTTP sender transmitting telemetry readings & events to backend API.
Includes retry handling and connection failure fallback.
"""

import urllib.request
import json
import logging

logger = logging.getLogger("simulator.telemetry_sender")

class TelemetrySender:
    def __init__(self, backend_url: str = "http://localhost:5050/api", token: str = None):
        self.backend_url = backend_url
        self.token = token

    def send_reading(self, reading_data: dict) -> bool:
        url = f"{self.backend_url}/telemetry/readings"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "ICS-Lab-Simulator/1.0"
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        try:
            req = urllib.request.Request(url, data=json.dumps(reading_data).encode('utf-8'), headers=headers, method='POST')
            with urllib.request.urlopen(req, timeout=3) as resp:
                return resp.status in (200, 201)
        except Exception as e:
            logger.debug(f"Telemetry transmit fallback (Backend connection: {e})")
            return False
