from typing import Dict, Any
from telemetry.monitoring.metrics import metrics_tracker

class PipelineHealthService:
    @staticmethod
    def get_health(queue_depth: int = 0) -> Dict[str, Any]:
        summary = metrics_tracker.get_summary(current_queue_depth=queue_depth)
        status = "HEALTHY"
        if summary["error_rate_pct"] > 10.0 or queue_depth > 4000:
            status = "DEGRADED"
        if summary["error_rate_pct"] > 50.0:
            status = "ERROR"

        return {
            "status": status,
            "pipeline_name": "ICS-SHIELD Real-Time Telemetry Pipeline",
            "version": "1.0.0",
            "metrics": summary
        }
