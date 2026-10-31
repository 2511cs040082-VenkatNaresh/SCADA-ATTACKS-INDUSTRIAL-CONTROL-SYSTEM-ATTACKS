"""
ICS-SHIELD Structured Safe Condition Evaluator (Python)
Pure deterministic condition evaluation without eval() or exec()
"""

from typing import Any, Dict, List, Union

def evaluate_condition(condition: Dict[str, Any], observation: Dict[str, Any]) -> bool:
    if not condition or not isinstance(condition, dict):
        return False

    # Handle Logical Groups: AND / OR / NOT
    if "logical" in condition and isinstance(condition.get("conditions"), list):
        logical_op = str(condition["logical"]).upper()
        sub_conditions = condition["conditions"]
        if logical_op == "AND":
            return all(evaluate_condition(c, observation) for c in sub_conditions)
        elif logical_op == "OR":
            return any(evaluate_condition(c, observation) for c in sub_conditions)
        elif logical_op == "NOT":
            return not any(evaluate_condition(c, observation) for c in sub_conditions)
        return False

    # Single condition evaluation
    field = condition.get("field")
    if not field:
        return False

    operator = condition.get("operator", "==")
    expected_value = condition.get("value")
    actual_value = get_nested_value(observation, field)

    return compare_values(actual_value, operator, expected_value)

def get_nested_value(obj: Dict[str, Any], path: str) -> Any:
    if not obj or not isinstance(obj, dict):
        return None
    parts = str(path).split(".")
    curr = obj
    for part in parts:
        if not isinstance(curr, dict):
            return None
        curr = curr.get(part)
        if curr is None:
            return None
    return curr

def compare_values(actual: Any, operator: str, expected: Any) -> bool:
    op = str(operator).upper()

    if op in ["==", "EQUALS", "EQ"]:
        if isinstance(actual, bool) or isinstance(expected, bool):
            return bool(actual) == bool(expected)
        return actual == expected or str(actual) == str(expected)

    elif op in ["!=", "NOT_EQUALS", "NEQ"]:
        if isinstance(actual, bool) or isinstance(expected, bool):
            return bool(actual) != bool(expected)
        return actual != expected and str(actual) != str(expected)

    elif op in [">", "GT"]:
        try:
            return float(actual) > float(expected)
        except (ValueError, TypeError):
            return False

    elif op in [">=", "GTE"]:
        try:
            return float(actual) >= float(expected)
        except (ValueError, TypeError):
            return False

    elif op in ["<", "LT"]:
        try:
            return float(actual) < float(expected)
        except (ValueError, TypeError):
            return False

    elif op in ["<=", "LTE"]:
        try:
            return float(actual) <= float(expected)
        except (ValueError, TypeError):
            return False

    elif op == "IN":
        if isinstance(expected, list):
            return actual in expected or str(actual) in [str(x) for x in expected]
        return False

    elif op == "NOT_IN":
        if isinstance(expected, list):
            return actual not in expected and str(actual) not in [str(x) for x in expected]
        return True

    elif op == "CONTAINS":
        if isinstance(actual, str):
            return str(expected).lower() in actual.lower()
        elif isinstance(actual, list):
            return expected in actual
        return False

    elif op == "NOT_CONTAINS":
        if isinstance(actual, str):
            return str(expected).lower() not in actual.lower()
        elif isinstance(actual, list):
            return expected not in actual
        return True

    elif op == "EXISTS":
        return actual is not None

    return False
