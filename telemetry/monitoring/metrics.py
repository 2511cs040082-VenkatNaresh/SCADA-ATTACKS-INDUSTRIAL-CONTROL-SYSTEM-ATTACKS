import time
from typing import Dict, Any

class TelemetryMetrics:
    """Tracks pipeline metrics: rates, latencies, queue depth, error rates."""

    def __init__(self):
        self.start_time = time.time()
        self.events_received = 0
        self.events_processed = 0
        self.events_failed = 0
        self.events_duplicate = 0
        self.events_rejected = 0
        self.total_processing_time_ms = 0.0
        self.max_processing_time_ms = 0.0
        self.db_write_count = 0
        self.websocket_broadcast_count = 0

    def record_received(self, count: int = 1):
        self.events_received += count

    def record_processed(self, count: int = 1, latency_ms: float = 0.0):
        self.events_processed += count
        self.total_processing_time_ms += latency_ms
        if latency_ms > self.max_processing_time_ms:
            self.max_processing_time_ms = latency_ms

    def record_failed(self, count: int = 1):
        self.events_failed += count

    def record_duplicate(self, count: int = 1):
        self.events_duplicate += count

    def record_rejected(self, count: int = 1):
        self.events_rejected += count

    def get_summary(self, current_queue_depth: int = 0) -> Dict[str, Any]:
        elapsed = max(time.time() - self.start_time, 1.0)
        avg_latency = (
            self.total_processing_time_ms / self.events_processed
            if self.events_processed > 0 else 0.0
        )

        return {
            "uptime_seconds": round(elapsed, 2),
            "events_received": self.events_received,
            "events_processed": self.events_processed,
            "events_failed": self.events_failed,
            "events_duplicate": self.events_duplicate,
            "events_rejected": self.events_rejected,
            "events_per_second": round(self.events_processed / elapsed, 2),
            "average_latency_ms": round(avg_latency, 2),
            "max_latency_ms": round(self.max_processing_time_ms, 2),
            "queue_depth": current_queue_depth,
            "error_rate_pct": round((self.events_failed / max(self.events_received, 1)) * 100, 2)
        }

metrics_tracker = TelemetryMetrics()
