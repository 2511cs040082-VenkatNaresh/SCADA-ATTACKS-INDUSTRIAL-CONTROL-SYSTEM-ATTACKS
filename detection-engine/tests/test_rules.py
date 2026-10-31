"""
Unit Tests for ICS-SHIELD Phase 8 Python Detection Engine & Condition Evaluator
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.condition_evaluator import evaluate_condition
from rules.rule_library import INITIAL_RULES

class TestDetectionEngineRules(unittest.TestCase):
    
    def test_single_condition_equality(self):
        cond = {"field": "is_in_baseline", "operator": "==", "value": False}
        self.assertTrue(evaluate_condition(cond, {"is_in_baseline": False}))
        self.assertFalse(evaluate_condition(cond, {"is_in_baseline": True}))

    def test_not_in_operator(self):
        cond = {"field": "function_code", "operator": "NOT_IN", "value": [1, 2, 3, 4, 5, 6, 15, 16]}
        self.assertTrue(evaluate_condition(cond, {"function_code": 99}))
        self.assertFalse(evaluate_condition(cond, {"function_code": 3}))

    def test_logical_and_condition(self):
        cond = {
            "logical": "AND",
            "conditions": [
                {"field": "is_write_function", "operator": "==", "value": True},
                {"field": "source_role", "operator": "!=", "value": "HMI"}
            ]
        }
        self.assertTrue(evaluate_condition(cond, {"is_write_function": True, "source_role": "ATTACKER_HOST"}))
        self.assertFalse(evaluate_condition(cond, {"is_write_function": True, "source_role": "HMI"}))

    def test_numeric_comparison(self):
        cond = {"field": "request_rate_per_sec", "operator": ">", "value": 50}
        self.assertTrue(evaluate_condition(cond, {"request_rate_per_sec": 75}))
        self.assertFalse(evaluate_condition(cond, {"request_rate_per_sec": 30}))

    def test_in_operator(self):
        cond = {"field": "asset_health_status", "operator": "IN", "value": ["CRITICAL", "OFFLINE_UNEXPECTED", "DEGRADED"]}
        self.assertTrue(evaluate_condition(cond, {"asset_health_status": "CRITICAL"}))
        self.assertFalse(evaluate_condition(cond, {"asset_health_status": "HEALTHY"}))

    def test_logical_or_condition(self):
        cond = {
            "logical": "OR",
            "conditions": [
                {
                    "logical": "AND",
                    "conditions": [
                        {"field": "detected_protocol", "operator": "==", "value": "MODBUS_TCP"},
                        {"field": "destination_port", "operator": "!=", "value": 502}
                    ]
                },
                {
                    "logical": "AND",
                    "conditions": [
                        {"field": "destination_port", "operator": "==", "value": 502},
                        {"field": "detected_protocol", "operator": "!=", "value": "MODBUS_TCP"}
                    ]
                }
            ]
        }
        # Modbus on port 8080 -> Match
        self.assertTrue(evaluate_condition(cond, {"detected_protocol": "MODBUS_TCP", "destination_port": 8080}))
        # HTTP on port 502 -> Match
        self.assertTrue(evaluate_condition(cond, {"detected_protocol": "HTTP", "destination_port": 502}))
        # Modbus on port 502 -> No Match
        self.assertFalse(evaluate_condition(cond, {"detected_protocol": "MODBUS_TCP", "destination_port": 502}))

    def test_rule_library_count(self):
        self.assertEqual(len(INITIAL_RULES), 13)

if __name__ == '__main__':
    unittest.main()
