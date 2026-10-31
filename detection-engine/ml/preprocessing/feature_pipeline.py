"""
ICS-SHIELD ML Feature Vector Preprocessing Pipeline (v1.0)
Extracts, validates, imputes, and scales feature vectors for ML model inference.
"""

from typing import Any, Dict, List, Tuple

FEATURE_SCHEMA_V1 = [
    "request_rate",
    "response_rate",
    "byte_rate",
    "packet_rate",
    "write_frequency",
    "read_frequency",
    "exception_rate",
    "timeout_rate",
    "average_latency",
    "p95_latency",
    "process_mean",
    "process_stddev",
    "process_range",
    "rate_of_change"
]

class FeaturePipelineV1:
    def __init__(self, feature_version: str = "v1.0"):
        self.feature_version = feature_version
        self.feature_names = list(FEATURE_SCHEMA_V1)

    def extract_vector(self, raw_observation: Dict[str, Any]) -> Tuple[List[float], Dict[str, float]]:
        """
        Extracts ordered numerical feature vector from raw observation payload with validation and imputation.
        """
        extracted = {}
        for feature in self.feature_names:
            val = raw_observation.get(feature)
            if val is None:
                # Fallback to key mappings or default 0.0
                if feature == "request_rate":
                    val = raw_observation.get("request_rate_per_sec", 2.0)
                elif feature == "average_latency":
                    val = raw_observation.get("latency", raw_observation.get("latency_ms", 12.0))
                elif feature == "process_mean":
                    val = raw_observation.get("value", raw_observation.get("process_value", 50.0))
                elif feature == "write_frequency":
                    is_write = raw_observation.get("is_write_function", False)
                    val = 1.0 if is_write else 0.1
                else:
                    val = 0.0
            
            try:
                extracted[feature] = float(val)
            except (ValueError, TypeError):
                extracted[feature] = 0.0

        vector = [extracted[f] for f in self.feature_names]
        return vector, extracted

    def normalize_vector(self, vector: List[float], reference_means: Dict[str, float] = None, reference_stds: Dict[str, float] = None) -> List[float]:
        """
        Standardizes feature vector (Z-score scaling) using reference baseline means and stddevs.
        """
        scaled = []
        for idx, feat in enumerate(self.feature_names):
            val = vector[idx]
            mean = reference_means.get(feat, 0.0) if reference_means else 0.0
            std = reference_stds.get(feat, 1.0) if reference_stds else 1.0
            if std <= 1e-6:
                std = 1e-6
            scaled.append((val - mean) / std)
        return scaled
