import time
from typing import Dict, Any

class NetworkMetricsTracker:
    def __init__(self):
        self.start_time = time.time()
        self.total_packets = 0
        self.total_bytes = 0
        self.modbus_requests = 0
        self.modbus_responses = 0
        self.modbus_exceptions = 0
        self.modbus_errors = 0
        self.modbus_timeouts = 0
        self.unknown_functions = 0
        self.fc_counts: Dict[str, int] = {}

    def record_event(self, fc_name: str, is_exception: bool = False, is_error: bool = False):
        self.total_packets += 1
        self.total_bytes += 128
        self.modbus_requests += 1

        self.fc_counts[fc_name] = self.fc_counts.get(fc_name, 0) + 1

        if is_exception:
            self.modbus_exceptions += 1
        if is_error:
            self.modbus_errors += 1
        if fc_name == "UNKNOWN_FUNCTION":
            self.unknown_functions += 1

    def get_summary(self, active_flows_cnt: int = 0, active_sessions_cnt: int = 0) -> Dict[str, Any]:
        elapsed = max(time.time() - self.start_time, 1.0)
        return {
            "uptime_seconds": round(elapsed, 2),
            "packets_per_second": round(self.total_packets / elapsed, 2),
            "bytes_per_second": round(self.total_bytes / elapsed, 2),
            "modbus_requests_per_sec": round(self.modbus_requests / elapsed, 2),
            "modbus_responses_per_sec": round(self.modbus_requests / elapsed, 2),
            "modbus_exceptions_total": self.modbus_exceptions,
            "modbus_errors_total": self.modbus_errors,
            "modbus_timeouts_total": self.modbus_timeouts,
            "unknown_functions_total": self.unknown_functions,
            "active_flows": active_flows_cnt,
            "active_sessions": active_sessions_cnt,
            "function_code_distribution": self.fc_counts
        }

metrics_tracker = NetworkMetricsTracker()
