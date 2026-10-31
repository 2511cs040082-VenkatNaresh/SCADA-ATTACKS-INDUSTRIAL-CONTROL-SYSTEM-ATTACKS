// ICS-SHIELD Phase 20 Test Helpers & Evaluation Matrix Classifier

export function calculateTimingStats(latencies = []) {
  if (latencies.length === 0) return { mean: 0, min: 0, max: 0, p95: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p95Index = Math.floor(sorted.length * 0.95);
  const p95 = sorted[p95Index] || max;
  return { mean, min, max, p95 };
}

export function classifyEvaluationOutcome(expectedItems = [], observedItems = []) {
  const expectedSet = new Set(expectedItems);
  const observedSet = new Set(observedItems);

  const expectedObserved = expectedItems.filter(item => observedSet.has(item));
  const expectedMissing = expectedItems.filter(item => !observedSet.has(item));
  const unexpectedObserved = observedItems.filter(item => !expectedSet.has(item));

  const totalExpected = expectedItems.length;
  const successRate = totalExpected > 0 ? (expectedObserved.length / totalExpected) * 100 : 100;

  return {
    expectedObserved,
    expectedMissing,
    unexpectedObserved,
    counts: {
      EXPECTED_OBSERVED: expectedObserved.length,
      EXPECTED_MISSING: expectedMissing.length,
      UNEXPECTED_OBSERVED: unexpectedObserved.length,
      NOT_APPLICABLE: 0
    },
    successRate: parseFloat(successRate.toFixed(2))
  };
}
