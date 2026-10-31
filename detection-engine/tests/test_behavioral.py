"""
Unit Tests for ICS-SHIELD Phase 9 Statistical Detectors & Baseline Manager
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from behavioral.detectors.statistical_detectors import (
    ZScoreDetector,
    ModifiedZScoreDetector,
    IQRDetector,
    PercentileDetector,
    MultivariateDetector
)
from behavioral.baselines.baseline_manager import BaselineManager

class TestBehavioralEngine(unittest.TestCase):

    def setUp(self):
        self.baseline_normal = {
            "mean": 2.3,
            "median": 2.2,
            "stddev": 0.5,
            "mad": 0.3,
            "iqr": 0.6,
            "min_val": 1.0,
            "max_val": 4.0,
            "p50": 2.2,
            "p95": 3.2,
            "sample_count": 50,
            "state": "STABLE"
        }

    def test_z_score_normal_variation(self):
        z_det = ZScoreDetector(threshold=3.0)
        res = z_det.score(2.5, self.baseline_normal)
        self.assertFalse(res["is_anomalous"])
        self.assertLess(res["score"], 30.0)

    def test_z_score_strong_anomaly(self):
        z_det = ZScoreDetector(threshold=3.0)
        # 18 requests/sec when mean=2.3, stddev=0.5 -> ~31 stddevs
        res = z_det.score(18.0, self.baseline_normal)
        self.assertTrue(res["is_anomalous"])
        self.assertGreaterThan(res["score"], 80.0)
        self.assertIn("18.00", res["explanation"])

    def test_z_score_zero_variance_protection(self):
        zero_var_baseline = {"mean": 5.0, "stddev": 0.0, "sample_count": 20, "state": "STABLE"}
        z_det = ZScoreDetector(threshold=3.0)
        # Should evaluate safely without ZeroDivisionError
        res = z_det.score(5.0, zero_var_baseline)
        self.assertFalse(res["is_anomalous"])

    def test_modified_z_score(self):
        mod_z = ModifiedZScoreDetector(threshold=3.5)
        res = mod_z.score(15.0, self.baseline_normal)
        self.assertTrue(res["is_anomalous"])
        self.assertIn("Modified Z-Score", res["explanation"])

    def test_iqr_detector(self):
        iqr_det = IQRDetector(multiplier=1.5)
        res_normal = iqr_det.score(2.2, self.baseline_normal)
        self.assertFalse(res_normal["is_anomalous"])

        res_anom = iqr_det.score(25.0, self.baseline_normal)
        self.assertTrue(res_anom["is_anomalous"])

    def test_baseline_manager_min_samples(self):
        bm = BaselineManager(min_samples=10)

        # 1. Under minimum samples -> BASELINE_NOT_READY
        bm.register_baseline({
            "entity_type": "ASSET",
            "entity_id": "PLC-001",
            "feature": "request_rate",
            "sample_count": 5
        })
        ready, b, reason = bm.check_baseline_ready("ASSET", "PLC-001", "request_rate")
        self.assertFalse(ready)
        self.assertEqual(reason, "BASELINE_NOT_READY")

        # 2. Over minimum samples -> READY
        bm.register_baseline({
            "entity_type": "ASSET",
            "entity_id": "PLC-001",
            "feature": "request_rate",
            "sample_count": 15
        })
        ready, b, reason = bm.check_baseline_ready("ASSET", "PLC-001", "request_rate")
        self.assertTrue(ready)
        self.assertEqual(reason, "READY")

    def test_baseline_contamination_protection(self):
        bm = BaselineManager(min_samples=10)
        bm.register_baseline({
            "entity_type": "ASSET", "entity_id": "PLC-001", "feature": "request_rate",
            "mean": 2.0, "sample_count": 20, "state": "STABLE"
        })

        # Suspicious event from Phase 8 should NOT update baseline
        res = bm.update_baseline_with_sample("ASSET", "PLC-001", "request_rate", 99.0, is_phase8_suspicious=True)
        self.assertIsNone(res)

        b = bm.baselines_store["ASSET:PLC-001:request_rate:NORMAL"]
        self.assertEqual(b["sample_count"], 20)
        self.assertEqual(b["mean"], 2.0)

    def test_multivariate_detector(self):
        multi = MultivariateDetector()
        obs = {"request_rate": 18.0, "average_latency": 150.0}
        baselines = {
            "request_rate": self.baseline_normal,
            "average_latency": {"mean": 12.0, "stddev": 2.0, "sample_count": 50, "state": "STABLE"}
        }
        res = multi.score_multivariate(obs, baselines)
        self.assertTrue(res["is_anomalous"])
        self.assertGreaterThan(res["score"], 60.0)

    def assertGreaterThan(self, a, b):
        self.assertTrue(a > b, f"{a} is not greater than {b}")

if __name__ == '__main__':
    unittest.main()
