from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseScenario(ABC):
    def __init__(self, name: str, description: str, severity: str = "MEDIUM"):
        self.name = name
        self.description = description
        self.severity = severity
        self.is_active = False

    @abstractmethod
    async def start(self, engine):
        self.is_active = True

    @abstractmethod
    async def stop(self, engine):
        self.is_active = False

    @abstractmethod
    def generate_events(self, engine) -> list:
        pass
