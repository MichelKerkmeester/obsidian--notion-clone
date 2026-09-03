// ───────────────────────────────────────────────────────────────────
// MODULE:    render-scenario-utils
// COMPONENT: pure helpers for the render-assertions runner's printed labels and coverage count
// ───────────────────────────────────────────────────────────────────

// The calendar runs several scales against the same renderer, so the printed label carries the
// scale — two scenarios of one renderer must be tellable apart in the lane output — while the
// coverage ratchet remains a count of distinct renderer implementations.

// ───────────────────────────────────────────────────────────────────
// 1. SCENARIO LABELS
// ───────────────────────────────────────────────────────────────────

export function scenarioLabel(scenario) {
  return scenario.scale
    ? `${scenario.renderer}:${scenario.scale}/${scenario.bag}`
    : `${scenario.renderer}/${scenario.bag}`;
}

// ───────────────────────────────────────────────────────────────────
// 2. COVERAGE COUNT
// ───────────────────────────────────────────────────────────────────

// Several bags or scales can exercise one renderer. Counting its name once keeps the denominator
// comparable with the renderer-file census while the labels above preserve scenario detail.
export function countConstructed(scenarios) {
  return new Set(scenarios.map((scenario) => scenario.renderer)).size;
}
