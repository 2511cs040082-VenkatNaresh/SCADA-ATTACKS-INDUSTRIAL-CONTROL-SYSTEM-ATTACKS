import logging
from typing import Dict, Optional, List, Any
from network_monitor.protocols.base.base_adapter import BaseProtocolAdapter

logger = logging.getLogger(__name__)

class ProtocolRegistry:
    """Central registry managing all active and stubbed protocol adapters."""

    def __init__(self):
        self._adapters: Dict[str, BaseProtocolAdapter] = {}
        self._port_mapping: Dict[int, str] = {}

    def register(self, adapter: BaseProtocolAdapter):
        self._adapters[adapter.protocol_name.upper()] = adapter
        self._port_mapping[adapter.default_port] = adapter.protocol_name.upper()
        logger.info(f"Registered Protocol Adapter: {adapter.protocol_name} on Port {adapter.default_port}")

    def get_adapter(self, protocol_name: str) -> Optional[BaseProtocolAdapter]:
        return self._adapters.get(protocol_name.upper())

    def identify_by_port(self, port: int) -> Optional[str]:
        return self._port_mapping.get(port)

    def list_protocols(self) -> List[Dict[str, Any]]:
        result = []
        for name, adapter in self._adapters.items():
            result.append({
                "protocol_name": name,
                "default_port": adapter.default_port,
                "enabled": True
            })
        return result

protocol_registry = ProtocolRegistry()
