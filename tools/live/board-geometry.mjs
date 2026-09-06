#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    board-geometry
// COMPONENT: locks the board's measured Anytype-parity values against the built DOM
// ───────────────────────────────────────────────────────────────────
//
// `screenshots:verify` only proves a capture's declared sources have not changed since it was
// taken, and `pixelHash` buckets a capture into a coarse 16x16 grid — a radius change, a border
// width, or a two-pixel-taller chip does not necessarily move either one. A negative control
// proved this directly: reverting the card radius from 8px to 2px and recapturing left
// `pixelHash` identical. Nothing else in the gate reads the board's own geometry, so this does:
// it mounts the shipped renderer through the same bundle the render-assertion lanes use and
// reads its computed styles, never a fixture's hand-written approximation.
//
// Usage: node tools/live/board-geometry.mjs
// Exit:  0 when every pinned value matches; 1 naming the mismatch.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildRenderAssertionBundle, SCENARIOS } from "./render-assertion-bundle.mjs";
import { stamp } from "./evidence.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. THE PINNED VALUES
// ───────────────────────────────────────────────────────────────────

// One row per measured Anytype value the board's kanban CSS targets. Each reads the property a
// device-pixel diff actually found wrong, not a proxy for it — `.db-kanban-col-chip`'s painted
// height rather than its declared one, since the declared `height: 24px` alone does not tell you
// whether a border sits inside or outside it.
const PINS = [
  { label: "card radius", selector: ".db-kanban-card", prop: "borderRadius", expected: "8px" },
  { label: "column width", selector: ".db-kanban-col", prop: "width", expected: "246px" },
  { label: "column gap", selector: ".db-kanban-board", prop: "gap", expected: "24px" },
  { label: "checkbox size", selector: ".db-kanban-card-meta .db-checkbox-field", prop: "boxWidth", expected: 14 },
];

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("board-geometry: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// ───────────────────────────────────────────────────────────────────
// 3. MOUNT AND MEASURE
// ───────────────────────────────────────────────────────────────────

const scenario = SCENARIOS.find((s) => s.renderer === "board" && s.bag === "file-view");
if (!scenario) {
  console.error("board-geometry: FAIL — no board/file-view scenario in the shared scenario list");
  process.exit(1);
}

const { work, missingSources } = await buildRenderAssertionBundle(`
window.__mountBoardGeometry = (spec) => {
  // The harness removes the container immediately after this hook returns (the same contract
  // touch-targets.mjs's measurement hook relies on), so every read has to happen inside it —
  // reading afterward measures a node already detached from the document, whose boxes are 0.
  let measurement = null;
  let provenance = false;
  runRenderAssertions(document.body, spec, "", (container, results) => {
    provenance = results.length > 0 && results[0].pass;
    if (!provenance) return;

    const read = (selector, prop) => {
      const el = container.querySelector(selector);
      if (!el) return { found: false };
      if (prop === "boxWidth") {
        const box = el.getBoundingClientRect();
        return { found: true, value: Math.round(box.width) };
      }
      return { found: true, value: getComputedStyle(el)[prop] };
    };

    // The chip's painted height, not its declared one — box-sizing decides whether the border
    // sits inside or outside it, which "height: 24px" alone cannot tell you.
    const chip = container.querySelector(".db-kanban-col-chip");
    const chipHeight = chip ? Math.round(chip.getBoundingClientRect().height) : null;

    // Row pitch, uniform across every property row on the first card: read every row's painted
    // height rather than one, since a shared rule regressing on only one row type (a checkbox
    // row beside a text row, say) is exactly what "uniform" means to check.
    const firstCard = container.querySelector(".db-kanban-card");
    const rows = firstCard
      ? Array.from(firstCard.querySelectorAll(".db-kanban-card-meta .db-board-card-field"))
        .map((row) => Math.round(row.getBoundingClientRect().height))
      : [];

    const checkbox = container.querySelector(".db-kanban-card-meta .db-checkbox-field");
    const checkboxRadius = checkbox ? getComputedStyle(checkbox).borderRadius : null;

    measurement = {
      pins: ${JSON.stringify(PINS)}.map((pin) => ({ ...pin, ...read(pin.selector, pin.prop) })),
      chipHeight,
      rowHeights: rows,
      checkboxRadius,
    };
  });
  return { provenance, ...measurement };
};
`);

if (missingSources.length > 0) {
  console.error(`board-geometry: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  rmSync(work, { recursive: true, force: true });
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body><script src="render-bundle.js"></script></body></html>`);

const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

const styles = readFileSync(join(REPO, "styles.css"), "utf8");
const theme = readFileSync(join(REPO, "tools/screenshots/theme.css"), "utf8");
const runtime = readFileSync(join(REPO, "tools/screenshots/runtime-vars.css"), "utf8");

await page.goto(`file://${join(work, "index.html")}`);
for (const content of [styles, theme, runtime]) await page.addStyleTag({ content });

const result = await page.evaluate((spec) => window.__mountBoardGeometry(spec), { ...scenario, captureData: true });

rmSync(work, { recursive: true, force: true });
await browser.close();

if (!result || !result.provenance) {
  console.error("board-geometry: FAIL — the board scenario did not carry the production-render marker");
  console.error("  measuring DOM without the marker would prove nothing about the shipped renderer");
  process.exit(1);
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

const failures = [];

for (const pin of result.pins) {
  if (!pin.found) {
    failures.push(`${pin.label}: selector "${pin.selector}" matched nothing`);
    continue;
  }
  if (pin.value !== pin.expected) {
    failures.push(`${pin.label}: ${pin.selector} read ${JSON.stringify(pin.value)}, expected ${JSON.stringify(pin.expected)}`);
  }
}

if (result.chipHeight !== 24) {
  failures.push(`header chip painted height: ${result.chipHeight}px, expected 24px (device pixel: divide by DPR before comparing on a real capture)`);
}

if (result.rowHeights.length === 0) {
  failures.push("property row pitch: no .db-board-card-field row found on the first card");
} else if (!result.rowHeights.every((h) => h === result.rowHeights[0])) {
  failures.push(`property row pitch: not uniform — ${result.rowHeights.join(", ")}`);
} else if (result.rowHeights[0] !== 25) {
  failures.push(`property row pitch: ${result.rowHeights[0]}px, expected 25px`);
}

if (result.checkboxRadius !== "50%") {
  failures.push(`checkbox shape: border-radius computed to ${JSON.stringify(result.checkboxRadius)}, expected "50%" (a circle, not the app-wide rounded square)`);
}

console.log(`board-geometry: chip painted height ${result.chipHeight}px, row heights [${result.rowHeights.join(", ")}], checkbox radius ${result.checkboxRadius}`);
for (const pin of result.pins) {
  console.log(`  ${pin.label.padEnd(16)} ${pin.selector.padEnd(40)} ${JSON.stringify(pin.value)}`);
}

if (failures.length > 0) {
  console.error(`\nboard-geometry: FAIL — ${failures.length} pinned value(s) do not match`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

stamp("tools/live/board-geometry.json", {
  chipHeight: result.chipHeight,
  rowHeights: result.rowHeights,
  checkboxRadius: result.checkboxRadius,
  pins: result.pins.map((pin) => ({ label: pin.label, value: pin.value })),
}, [
  "tools/live/board-geometry.mjs",
  "tools/live/render-assertion-bundle.mjs",
  "tools/live/render-assertion-harness.ts",
  "src/views/board-renderer.ts",
  "styles.css",
]);

console.log("\nboard-geometry: PASS — card radius, column width, column gap, chip height, property pitch and checkbox shape all match the measured Anytype capture");
process.exit(0);
