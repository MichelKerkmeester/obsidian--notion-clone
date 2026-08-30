// ───────────────────────────────────────────────────────────────────
// MODULE:    run-board
// COMPONENT: drives the board render bench in real Chrome, at both widths
// ───────────────────────────────────────────────────────────────────
//
// Bundling, surfaces, sample table, exponent fit and verdict all live in
// card-bench-driver, which the gallery bench shares. This file is the board's
// half: which module to measure, and what to call it in the output.
//
// The default row ladder starts at 400 and ends at 6,400 for a reason. A
// quadratic term is invisible while the linear term dominates, so a run that
// stops at 400 rows measures entirely below the crossover and reports a
// straight line — which is how a per-card forced layout survived every earlier
// reading of this view.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { parseArgs, runCardBench } from "./card-bench-driver.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. RUN
// ───────────────────────────────────────────────────────────────────

const { options, controlMode, throttle } = parseArgs(process.argv.slice(2), "run-board");

await runCardBench({
  name: "board",
  benchModule: "board-render-bench",
  benchExport: "runBoardBench",
  label: "real BoardRenderer",
  options,
  controlMode,
  throttle,
});
