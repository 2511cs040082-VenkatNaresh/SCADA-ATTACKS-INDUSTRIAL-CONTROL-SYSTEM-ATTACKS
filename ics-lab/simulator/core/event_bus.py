"""
In-Memory Async Event Bus for Lab Simulator Events & Telemetry.
"""

import asyncio
from typing import Callable, Dict, List, Any
import logging

logger = logging.getLogger("simulator.event_bus")

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, handler: Callable):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)

    async def publish(self, event_type: str, data: Any):
        handlers = self._subscribers.get(event_type, [])
        handlers_all = self._subscribers.get("*", [])

        for handler in handlers + handlers_all:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event_type, data)
                else:
                    handler(event_type, data)
            except Exception as e:
                logger.error(f"Error handling event '{event_type}' in handler {handler}: {e}")
