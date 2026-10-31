from typing import Dict, Any

class CollectorHealth:
    def __init__(self):
        self.total_polls = 0
        self.successful_polls = 0
        self.failed_polls = 0

    def record_poll(self, success: bool):
        self.total_polls += 1
        if success:
            self.successful_polls += 1
        else:
            self.failed_polls += 1

    def get_status(self) -> Dict[str, Any]:
        return {
            "total_polls": self.total_polls,
            "successful_polls": self.successful_polls,
            "failed_polls": self.failed_polls,
            "success_rate_pct": round(
                (self.successful_polls / max(self.total_polls, 1)) * 100, 2
            )
        }
