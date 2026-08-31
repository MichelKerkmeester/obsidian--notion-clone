// ───────────────────────────────────────────────────────────────────
// MODULE:    run-timeline
// COMPONENT: drives the timeline render bench in real Chrome, at both widths
// ───────────────────────────────────────────────────────────────────
//
// Bundling, surfaces, sample table, exponent fit and verdict all live in
// card-bench-driver, which the board and gallery benches share. This file is
// the timeline's half: which module to measure, and what to call it in the
// output.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { parseArgs, runCardBench } from "./card-bench-driver.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. RUN
// ───────────────────────────────────────────────────────────────────

const { options, controlMode, throttle } = parseArgs(process.argv.slice(2), "run-timeline");

await runCardBench({
  name: "timeline",
  benchModule: "timeline-render-bench",
  benchExport: "runTimelineBench",
  label: "real CalendarTimelineRenderer",
  options,
  controlMode,
  throttle,
});
