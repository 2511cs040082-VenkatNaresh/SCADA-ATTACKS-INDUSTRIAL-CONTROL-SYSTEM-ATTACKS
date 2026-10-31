/**
 * ICS-SHIELD Structured Safe Condition Evaluator
 * Pure deterministic condition evaluation without eval() or exec()
 */

export function evaluateCondition(condition, observation) {
  if (!condition || typeof condition !== 'object') {
    return false;
  }

  // Handle Logical Groups: AND / OR / NOT
  if (condition.logical && Array.isArray(condition.conditions)) {
    const logicalOp = String(condition.logical).toUpperCase();
    if (logicalOp === 'AND') {
      return condition.conditions.every(cond => evaluateCondition(cond, observation));
    } else if (logicalOp === 'OR') {
      return condition.conditions.some(cond => evaluateCondition(cond, observation));
    } else if (logicalOp === 'NOT') {
      return !condition.conditions.some(cond => evaluateCondition(cond, observation));
    }
    return false;
  }

  // Single condition check
  const { field, operator, value } = condition;
  if (!field) return false;

  const actualValue = getNestedValue(observation, field);
  return compareValues(actualValue, operator, value);
}

export function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = String(path).split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

export function compareValues(actual, operator, expected) {
  const op = String(operator || '==').toUpperCase();

  switch (op) {
    case '==':
    case 'EQUALS':
    case 'EQ':
      if (typeof actual === 'boolean' || typeof expected === 'boolean') {
        return Boolean(actual) === Boolean(expected);
      }
      return actual === expected || String(actual) === String(expected);

    case '!=':
    case 'NOT_EQUALS':
    case 'NEQ':
      if (typeof actual === 'boolean' || typeof expected === 'boolean') {
        return Boolean(actual) !== Boolean(expected);
      }
      return actual !== expected && String(actual) !== String(expected);

    case '>':
    case 'GT':
      return Number(actual) > Number(expected);

    case '>=':
    case 'GTE':
      return Number(actual) >= Number(expected);

    case '<':
    case 'LT':
      return Number(actual) < Number(expected);

    case '<=':
    case 'LTE':
      return Number(actual) <= Number(expected);

    case 'IN':
      if (Array.isArray(expected)) {
        return expected.includes(actual) || expected.map(String).includes(String(actual));
      }
      return false;

    case 'NOT_IN':
      if (Array.isArray(expected)) {
        return !expected.includes(actual) && !expected.map(String).includes(String(actual));
      }
      return true;

    case 'CONTAINS':
      if (typeof actual === 'string') {
        return actual.toLowerCase().includes(String(expected).toLowerCase());
      } else if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      return false;

    case 'NOT_CONTAINS':
      if (typeof actual === 'string') {
        return !actual.toLowerCase().includes(String(expected).toLowerCase());
      } else if (Array.isArray(actual)) {
        return !actual.includes(expected);
      }
      return true;

    case 'EXISTS':
      return actual !== undefined && actual !== null;

    default:
      return false;
  }
}
