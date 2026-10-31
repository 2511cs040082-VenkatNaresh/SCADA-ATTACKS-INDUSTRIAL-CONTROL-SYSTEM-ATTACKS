from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from network_monitor.schemas.protocol_schema import ProtocolEventModel

class BaseProtocolAdapter(ABC):
    """Abstract Base Class for all ICS Protocol Adapters."""

    def __init__(self, protocol_name: str, default_port: int):
        self.protocol_name = protocol_name
        self.default_port = default_port

    @abstractmethod
    def identify(self, raw_data: Dict[str, Any]) -> bool:
        """Determines if the raw event belongs to this protocol adapter."""
        pass

    @abstractmethod
    def parse(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Parses protocol-specific fields from raw payload."""
        pass

    @abstractmethod
    def normalize(self, parsed_data: Dict[str, Any]) -> ProtocolEventModel:
        """Normalizes parsed payload into standardized ProtocolEventModel."""
        pass

    @abstractmethod
    def extract_metrics(self, event: ProtocolEventModel) -> Dict[str, Any]:
        """Extracts protocol specific performance metrics."""
        pass
