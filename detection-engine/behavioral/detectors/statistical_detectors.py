"""
ICS-SHIELD Statistical Anomaly Detectors
Implements Z-Score, Modified Z-Score (MAD), IQR, Percentile Deviation, and Weighted Multivariate Score.
No Machine Learning algorithms. Explainable statistical inference with zero-variance protection.
"""

import math
from typing import Any, Dict, List, Optional, Tuple

class BaseStatisticalDetector:
    def __init__(self, name: str, threshold: float = 3.0):
        self.name = name
        self.threshold = threshold

    def score(self, observed: float, baseline: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError

    def explain(self, observed: float, baseline: Dict[str, Any], raw_score: float, anomaly_score: float) -> str:
        mean = baseline.get("mean", 0.0)
        stddev = baseline.get("stddev", 0.0)
        return (
            f"Observed: {observed:.2f}, Expected: {mean:.2f} (±{stddev:.2f}). "
            f"Detector '{self.name}' calculated raw score {raw_score:.2f}, resulting in normalized anomaly score {anomaly_score:.1f}."
        )

class ZScoreDetector(BaseStatisticalDetector):
    def __init__(self, threshold: float = 3.0):
        super().__init__("Z_SCORE", threshold)

    def score(self, observed: float, baseline: Dict[str, Any]) -> Dict[str, Any]:
        mean = float(baseline.get("mean", 0.0))
        stddev = float(baseline.get("stddev", 0.0))
        
        # Zero variance / minimal stddev protection
        eps = 1e-6
        if stddev < eps:
            stddev = eps

        z = (observed - mean) / stddev
        abs_z = abs(z)

        # Map Z-Score to 0-100 anomaly score:
        # z <= 1.0 -> score 0-25
        # z == 2.0 -> score ~50
        # z == 3.0 -> score ~75
        # z >= 4.0 -> score 95-100
        normalized_score = min(100.0, max(0.0, (abs_z / 4.0) * 100.0))

        is_anomalous = abs_z >= self.threshold

        return {
            "detector": self.name,
            "observed_value": observed,
            "expected_value": mean,
            "raw_score": z,
            "abs_raw_score": abs_z,
            "score": round(normalized_score, 1),
            "threshold": self.threshold,
            "is_anomalous": is_anomalous,
            "explanation": self.explain(observed, baseline, z, normalized_score)
        }

class ModifiedZScoreDetector(BaseStatisticalDetector):
    def __init__(self, threshold: float = 3.5):
        super().__init__("MODIFIED_Z_SCORE", threshold)

    def score(self, observed: float, baseline: Dict[str, Any]) -> Dict[str, Any]:
        median = float(baseline.get("median", baseline.get("mean", 0.0)))
        mad = float(baseline.get("mad", baseline.get("stddev", 0.0)))

        eps = 1e-6
        if mad < eps:
            mad = eps

        # Modified Z-score = 0.6745 * (x - median) / MAD
        mod_z = 0.6745 * (observed - median) / mad
        abs_mod_z = abs(mod_z)

        normalized_score = min(100.0, max(0.0, (abs_mod_z / 5.0) * 100.0))
        is_anomalous = abs_mod_z >= self.threshold

        return {
            "detector": self.name,
            "observed_value": observed,
            "expected_value": median,
            "raw_score": mod_z,
            "abs_raw_score": abs_mod_z,
            "score": round(normalized_score, 1),
            "threshold": self.threshold,
            "is_anomalous": is_anomalous,
            "explanation": f"Observed: {observed:.2f}, Median: {median:.2f} (MAD: {mad:.2f}). Modified Z-Score: {mod_z:.2f}."
        }

class IQRDetector(BaseStatisticalDetector):
    def __init__(self, multiplier: float = 1.5):
        super().__init__("IQR", multiplier)

    def score(self, observed: float, baseline: Dict[str, Any]) -> Dict[str, Any]:
        p50 = float(baseline.get("median", baseline.get("p50", 0.0)))
        iqr = float(baseline.get("iqr", 0.0))
        
        if iqr <= 0:
            stddev = float(baseline.get("stddev", 1.0))
            iqr = 1.35 * stddev if stddev > 0 else 1.0

        q1 = p50 - (iqr / 2.0)
        q3 = p50 + (iqr / 2.0)
        lower_bound = q1 - (self.threshold * iqr)
        upper_bound = q3 + (self.threshold * iqr)

        is_anomalous = observed < lower_bound or observed > upper_bound

        # Deviation distance beyond bounds
        if observed > upper_bound:
            dev = (observed - upper_bound) / (iqr if iqr > 0 else 1.0)
            score = min(100.0, 60.0 + dev * 15.0)
        elif observed < lower_bound:
            dev = (lower_bound - observed) / (iqr if iqr > 0 else 1.0)
            score = min(100.0, 60.0 + dev * 15.0)
        else:
            score = max(0.0, 50.0 * (abs(observed - p50) / (iqr if iqr > 0 else 1.0)))

        return {
            "detector": self.name,
            "observed_value": observed,
            "expected_value": p50,
            "q1": q1,
            "q3": q3,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "raw_score": score / 20.0,
            "score": round(score, 1),
            "threshold": self.threshold,
            "is_anomalous": is_anomalous,
            "explanation": f"Observed: {observed:.2f} outside IQR bounds [{lower_bound:.2f}, {upper_bound:.2f}] (IQR: {iqr:.2f})."
        }

class PercentileDetector(BaseStatisticalDetector):
    def __init__(self, low_pct: float = 5.0, high_pct: float = 95.0):
        super().__init__("PERCENTILE", 95.0)
        self.low_pct = low_pct
        self.high_pct = high_pct

    def score(self, observed: float, baseline: Dict[str, Any]) -> Dict[str, Any]:
        p50 = float(baseline.get("p50", baseline.get("median", 0.0)))
        p05 = float(baseline.get("min_val", p50 * 0.5))
        p95 = float(baseline.get("p95", p50 * 1.5))

        is_anomalous = observed < p05 or observed > p95

        if observed > p95:
            diff = observed - p95
            score = min(100.0, 60.0 + (diff / (p95 if p95 > 0 else 1.0)) * 40.0)
        elif observed < p05:
            diff = p05 - observed
            score = min(100.0, 60.0 + (diff / (p05 if p05 > 0 else 1.0)) * 40.0)
        else:
            score = 15.0

        return {
            "detector": self.name,
            "observed_value": observed,
            "expected_value": p50,
            "p05": p05,
            "p95": p95,
            "raw_score": score / 25.0,
            "score": round(score, 1),
            "threshold": 95.0,
            "is_anomalous": is_anomalous,
            "explanation": f"Observed: {observed:.2f} breached {self.high_pct}th percentile ({p95:.2f})."
        }

class MultivariateDetector(BaseStatisticalDetector):
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        super().__init__("WEIGHTED_MULTIVARIATE", 60.0)
        self.weights = weights or {
            "request_rate": 0.30,
            "write_frequency": 0.25,
            "average_latency": 0.20,
            "byte_rate": 0.15,
            "process_value": 0.10
        }

    def score_multivariate(self, feature_observations: Dict[str, float], baselines: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        z_detector = ZScoreDetector()
        weighted_sum = 0.0
        total_weight = 0.0
        feature_breakdown = {}

        for feature_name, val in feature_observations.items():
            b = baselines.get(feature_name)
            if not b:
                continue
            res = z_detector.score(val, b)
            w = self.weights.get(feature_name, 0.15)
            weighted_sum += res["score"] * w
            total_weight += w
            feature_breakdown[feature_name] = {
                "observed": val,
                "score": res["score"],
                "z_score": res["raw_score"]
            }

        overall_score = (weighted_sum / total_weight) if total_weight > 0 else 0.0
        is_anomalous = overall_score >= self.threshold

        return {
            "detector": self.name,
            "score": round(overall_score, 1),
            "threshold": self.threshold,
            "is_anomalous": is_anomalous,
            "feature_breakdown": feature_breakdown,
            "explanation": f"Multivariate weighted anomaly score: {overall_score:.1f}/100 across {len(feature_breakdown)} features."
        }
