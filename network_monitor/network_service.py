import logging
import asyncio
from typing import Dict, Any, List, Optional
from network_monitor.protocols.base.registry import protocol_registry
from network_monitor.protocols.modbus.modbus_adapter import ModbusProtocolAdapter
from network_monitor.protocols.dnp3.dnp3_stub import DNP3ProtocolStub
from network_monitor.correlation.transaction_correlator import TransactionCorrelator
from network_monitor.sessions.session_manager import SessionManager
from network_monitor.flows.flow_aggregator import FlowAggregator
from network_monitor.metrics.network_metrics import metrics_tracker
from network_monitor.storage.backend_network_client import BackendNetworkClient

logger = logging.getLogger(__name__)

class NetworkMonitoringService:
    """Master Network & Protocol Monitoring Coordinator."""

    def __init__(self, backend_url: str = "http://localhost:5050"):
        self.modbus_adapter = ModbusProtocolAdapter()
        self.dnp3_adapter = DNP3ProtocolStub()

        protocol_registry.register(self.modbus_adapter)
        protocol_registry.register(self.dnp3_adapter)

        self.correlator = TransactionCorrelator(timeout_seconds=5.0)
        self.session_manager = SessionManager(timeout_seconds=300)
        self.flow_aggregator = FlowAggregator()
        self.backend_client = BackendNetworkClient(backend_url=backend_url)

    def process_raw_event(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        proto_name = str(raw_data.get("protocol", "MODBUS_TCP")).upper()
        adapter = protocol_registry.get_adapter(proto_name) or self.modbus_adapter

        norm_event = adapter.normalize(raw_data)
        flow = self.flow_aggregator.process_event(norm_event)
        session = self.session_manager.update_session(norm_event)
        transaction = self.correlator.process_event(norm_event)

        fc_name = norm_event.metadata.get("function_name", "UNKNOWN_FUNCTION")
        metrics_tracker.record_event(
            fc_name=fc_name,
            is_exception=(norm_event.status == "EXCEPTION"),
            is_error=(norm_event.status in ["ERROR", "TIMEOUT"])
        )

        result = {
            "protocol_event": norm_event.model_dump(),
            "flow": flow.model_dump(),
            "session": session.to_dict(),
            "transaction": transaction
        }

        asyncio.create_task(self.backend_client.send_network_update(result))

        return result

    def get_metrics(self) -> Dict[str, Any]:
        return metrics_tracker.get_summary(
            active_flows_cnt=len(self.flow_aggregator.active_flows),
            active_sessions_cnt=len(self.session_manager.sessions)
        )
