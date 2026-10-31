"""
ICS-SHIELD Baseline Management Engine
Handles baseline construction, state transitions, versioning, minimum sample checks, and contamination protection.
"""

import math
import time
from typing import Any, Dict, List, Optional, Tuple

class BaselineManager:
    def __init__(self, min_samples: int = 10):
        self.min_samples = min_samples
        self.baselines_store: Dict[str, Dict[str, Any]] = {}

    def get_baseline_key(self, entity_type: str, entity_id: str, feature: str, context: str = "NORMAL") -> str:
        return f"{entity_type}:{entity_id}:{feature}:{context}"

    def register_baseline(self, baseline_data: Dict[str, Any]) -> Dict[str, Any]:
        entity_type = baseline_data.get("entity_type", "ASSET")
        entity_id = baseline_data.get("entity_id", "UNKNOWN")
        feature = baseline_data.get("feature", "request_rate")
        context = baseline_data.get("context", "NORMAL")

        key = self.get_baseline_key(entity_type, entity_id, feature, context)
        
        # Determine state based on sample count
        samples = baseline_data.get("sample_count", 0)
        state = baseline_data.get("state", "LEARNING")
        if samples < self.min_samples:
            state = "INSUFFICIENT_DATA"
        elif state == "INSUFFICIENT_DATA" and samples >= self.min_samples:
            state = "STABLE"

        record = {
            "baseline_uuid": baseline_data.get("baseline_uuid", f"BASE-{int(time.time()*1000)}"),
            "entity_type": entity_type,
            "entity_id": entity_id,
            "feature": feature,
            "context": context,
            "time_window": baseline_data.get("time_window", "1m"),
            "mean": float(baseline_data.get("mean", 0.0)),
            "median": float(baseline_data.get("median", 0.0)),
            "stddev": float(baseline_data.get("stddev", 0.0)),
            "mad": float(baseline_data.get("mad", 0.0)),
            "iqr": float(baseline_data.get("iqr", 0.0)),
            "min_val": float(baseline_data.get("min_val", 0.0)),
            "max_val": float(baseline_data.get("max_val", 0.0)),
            "p50": float(baseline_data.get("p50", 0.0)),
            "p90": float(baseline_data.get("p90", 0.0)),
            "p95": float(baseline_data.get("p95", 0.0)),
            "p99": float(baseline_data.get("p99", 0.0)),
            "sample_count": samples,
            "quality": baseline_data.get("quality", "HIGH" if samples > 100 else "MEDIUM"),
            "state": state,
            "version": baseline_data.get("version", "1.0.0"),
            "created_at": baseline_data.get("created_at", time.strftime("%Y-%m-%dT%H:%M:%SZ")),
            "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }

        self.baselines_store[key] = record
        return record

    def check_baseline_ready(self, entity_type: str, entity_id: str, feature: str, context: str = "NORMAL") -> Tuple[bool, Optional[Dict[str, Any]], str]:
        key = self.get_baseline_key(entity_type, entity_id, feature, context)
        baseline = self.baselines_store.get(key)

        if not baseline:
            return False, None, "BASELINE_NOT_FOUND"

        if baseline.get("state") == "INVALID":
            return False, baseline, "BASELINE_INVALID"

        if baseline.get("sample_count", 0) < self.min_samples:
            return False, baseline, "BASELINE_NOT_READY"

        return True, baseline, "READY"

    def update_baseline_with_sample(self, entity_type: str, entity_id: str, feature: str, sample_val: float, is_phase8_suspicious: bool = False, context: str = "NORMAL") -> Optional[Dict[str, Any]]:
        # Contamination protection: Do NOT use Phase 8 suspicious events in baseline training
        if is_phase8_suspicious:
            return None

        key = self.get_baseline_key(entity_type, entity_id, feature, context)
        baseline = self.baselines_store.get(key)

        if not baseline:
            # Initialize learning baseline
            baseline = self.register_baseline({
                "entity_type": entity_type,
                "entity_id": entity_id,
                "feature": feature,
                "context": context,
                "mean": sample_val,
                "median": sample_val,
                "sample_count": 1,
                "state": "INSUFFICIENT_DATA"
            })

        if baseline.get("state") == "FROZEN":
            return baseline

        # Incremental statistics update (Welford's algorithm)
        n = baseline["sample_count"] + 1
        old_mean = baseline["mean"]
        new_mean = old_mean + (sample_val - old_mean) / n

        # Estimate stddev update
        old_std = baseline["stddev"]
        new_var = ((old_std ** 2) * (n - 2) + (sample_val - old_mean) * (sample_val - new_mean)) / (n - 1) if n > 1 else 0.0
        new_std = math.sqrt(max(0.0, new_var))

        baseline["sample_count"] = n
        baseline["mean"] = new_mean
        baseline["stddev"] = new_std
        baseline["median"] = new_mean
        baseline["p50"] = new_mean
        baseline["p95"] = new_mean + (1.645 * new_std)
        baseline["min_val"] = min(baseline.get("min_val", sample_val), sample_val)
        baseline["max_val"] = max(baseline.get("max_val", sample_val), sample_val)

        if n >= self.min_samples and baseline["state"] == "INSUFFICIENT_DATA":
            baseline["state"] = "STABLE"

        baseline["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        return baseline

    def freeze_baseline(self, entity_type: str, entity_id: str, feature: str, context: str = "NORMAL") -> Optional[Dict[str, Any]]:
        key = self.get_baseline_key(entity_type, entity_id, feature, context)
        baseline = self.baselines_store.get(key)
        if baseline:
            baseline["state"] = "FROZEN"
            baseline["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        return baseline

    def rebuild_baseline(self, entity_type: str, entity_id: str, feature: str, samples: List[float], context: str = "NORMAL") -> Dict[str, Any]:
        key = self.get_baseline_key(entity_type, entity_id, feature, context)
        if not samples:
            return self.register_baseline({"entity_type": entity_type, "entity_id": entity_id, "feature": feature, "context": context})

        n = len(samples)
        mean_val = sum(samples) / n
        sorted_s = sorted(samples)
        median_val = sorted_s[n // 2]
        var_val = sum((x - mean_val) ** 2 for x in samples) / n
        std_val = math.sqrt(var_val)

        mads = [abs(x - median_val) for x in samples]
        mad_val = sorted(mads)[n // 2]

        q1 = sorted_s[int(n * 0.25)]
        q3 = sorted_s[int(n * 0.75)]
        iqr_val = q3 - q1

        # Increment version
        old = self.baselines_store.get(key)
        v_parts = (old.get("version", "1.0.0")).split(".") if old else ["1", "0", "0"]
        new_v = f"{v_parts[0]}.{int(v_parts[1]) + 1}.0"

        return self.register_baseline({
            "entity_type": entity_type,
            "entity_id": entity_id,
            "feature": feature,
            "context": context,
            "mean": mean_val,
            "median": median_val,
            "stddev": std_val,
            "mad": mad_val,
            "iqr": iqr_val,
            "min_val": sorted_s[0],
            "max_val": sorted_s[-1],
            "p50": median_val,
            "p90": sorted_s[int(n * 0.90)],
            "p95": sorted_s[int(n * 0.95)],
            "p99": sorted_s[min(n - 1, int(n * 0.99))],
            "sample_count": n,
            "quality": "HIGH" if n >= 50 else "MEDIUM",
            "state": "STABLE" if n >= self.min_samples else "INSUFFICIENT_DATA",
            "version": new_v
        })
