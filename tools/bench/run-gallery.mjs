// ───────────────────────────────────────────────────────────────────
// MODULE:    run-gallery
// COMPONENT: drives the gallery render bench in real Chrome, at both widths
// ───────────────────────────────────────────────────────────────────
//
// Bundling, surfaces, sample table, exponent fit and verdict all live in
// card-bench-driver, which the board bench shares. This file is the gallery's
// half: which module to measure, and what to call it in the output.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { parseArgs, runCardBench } from "./card-bench-driver.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. RUN
// ───────────────────────────────────────────────────────────────────

const { options, controlMode, throttle } = parseArgs(process.argv.slice(2), "run-gallery");

await runCardBench({
  name: "gallery",
  benchModule: "gallery-render-bench",
  benchExport: "runGalleryBench",
  label: "real GalleryRenderer",
  options,
  controlMode,
  throttle,
});
