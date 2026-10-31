"""
Unit Tests for ICS-SHIELD Phase 10 ML Engine & Feature Pipeline
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ml.preprocessing.feature_pipeline import FeaturePipelineV1
from ml.models.ml_models import IsolationForestModel, OneClassSVMModel, LocalOutlierFactorModel
from ml.registry.model_registry import ModelRegistry

class TestMLEngine(unittest.TestCase):

    def setUp(self):
        self.pipeline = FeaturePipelineV1("v1.0")
        self.sample_obs = {
            "request_rate_per_sec": 25.0,
            "latency_ms": 150.0,
            "process_value": 82.0,
            "is_write_function": True
        }

    def test_feature_pipeline_extraction(self):
        vector, extracted = self.pipeline.extract_vector(self.sample_obs)
        self.assertEqual(len(vector), len(self.pipeline.feature_names))
        self.assertEqual(extracted["request_rate"], 25.0)
        self.assertEqual(extracted["average_latency"], 150.0)

    def test_isolation_forest_prediction(self):
        if_model = IsolationForestModel()
        
        # Train on normal samples
        normal_vectors = [[2.0, 2.0, 250.0, 10.0, 0.1, 1.9, 0.0, 0.0, 12.0, 15.0, 50.0, 2.0, 10.0, 0.1] for _ in range(50)]
        if_model.train(normal_vectors, self.pipeline.feature_names)

        # Predict normal -> NORMAL
        norm_obs = {
            "request_rate": 2.0, "response_rate": 2.0, "byte_rate": 250.0, "packet_rate": 10.0,
            "write_frequency": 0.1, "read_frequency": 1.9, "exception_rate": 0.0, "timeout_rate": 0.0,
            "average_latency": 12.0, "p95_latency": 15.0, "process_mean": 50.0, "process_stddev": 2.0,
            "process_range": 10.0, "rate_of_change": 0.1
        }
        norm_vec, _ = self.pipeline.extract_vector(norm_obs)
        res_norm = if_model.predict(norm_vec, self.pipeline.feature_names)
        self.assertEqual(res_norm["prediction"], "NORMAL")

        # Predict anomaly -> ANOMALOUS
        anom_obs = {
            "request_rate": 25.0, "response_rate": 2.0, "byte_rate": 250.0, "packet_rate": 10.0,
            "write_frequency": 0.1, "read_frequency": 1.9, "exception_rate": 0.0, "timeout_rate": 0.0,
            "average_latency": 150.0, "p95_latency": 15.0, "process_mean": 82.0, "process_stddev": 2.0,
            "process_range": 10.0, "rate_of_change": 0.1
        }
        anom_vec, _ = self.pipeline.extract_vector(anom_obs)
        res_anom = if_model.predict(anom_vec, self.pipeline.feature_names)
        self.assertEqual(res_anom["prediction"], "ANOMALOUS")
        self.assertGreaterThan(res_anom["normalized_score"], 60.0)

    def test_one_class_svm(self):
        svm_model = OneClassSVMModel()
        vector, _ = self.pipeline.extract_vector(self.sample_obs)
        res = svm_model.predict(vector, self.pipeline.feature_names)
        self.assertIn("prediction", res)
        self.assertIn("normalized_score", res)

    def test_local_outlier_factor(self):
        lof_model = LocalOutlierFactorModel()
        vector, _ = self.pipeline.extract_vector(self.sample_obs)
        res = lof_model.predict(vector, self.pipeline.feature_names)
        self.assertIn("prediction", res)

    def test_model_registry_checksum_verification(self):
        registry = ModelRegistry()
        record = registry.register_model({
            "model_id": "MDL-TEST-001",
            "version": "1.0.0",
            "algorithm": "ISOLATION_FOREST",
            "config": {"n_estimators": 50}
        })

        self.assertEqual(record["status"], "READY")
        valid, msg = registry.validate_artifact_checksum("MDL-TEST-001:1.0.0")
        self.assertTrue(valid)
        self.assertEqual(msg, "CHECKSUM_VALID")

    def assertGreaterThan(self, a, b):
        self.assertTrue(a > b, f"{a} is not greater than {b}")

if __name__ == '__main__':
    unittest.main()
