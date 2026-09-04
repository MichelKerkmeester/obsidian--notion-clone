#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    reference-state-assertions
// COMPONENT: gate check that the reference mounts of the vendored plugin render their own markers
// ───────────────────────────────────────────────────────────────────
//
// The reference captures photograph the vendored Project Manager plugin
// (specs/context/obsidian-pm-main) so a reviewer can read our constructed captures beside
// the plugin they copy. A capture that mounted nothing, or mounted the wrong view, would
// photograph an empty or mislabelled page while every check stayed green — the same
// failure this program's constructed assertions exist to catch on our own renderers. This
// check is the reference half of that: each reference scenario is mounted through the
// same bundle the capture pipeline will use, and every marker below is a class or
// attribute a production renderer of the reference writes.
//
// The marker set per view:
//   pm-kanban — the view class, one column per configured status, one card per visible
//               task, and the parent chip that only the subtask-tree variant draws.
//   pm-gantt  — the view class, one bar per dated non-milestone task, the milestone
//               polygon, one dependency arrow per wired dependency, the today diamond in
//               the sticky header, and one label row per visible task (with the deeper
//               padding that only a subtask row carries).
//
// Usage: node tools/live/reference-state-assertions.mjs

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { buildReferenceBundle } from "./reference-assertion-bundle.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));

// ───────────────────────────────────────────────────────────────────
// 2. BUNDLE
// ───────────────────────────────────────────────────────────────────

// Mounts the given spec and reads its markers off the DOM. Every marker is a real class a
// production renderer of the vendored plugin writes — the same selectors the capture's
// readiness and the in-runtime read use.
const { work, missingSources } = await buildReferenceBundle(`
window.__refMarkers = (spec) => {
  const root = mountReferenceView(document.getElementById("shot"), spec);
  if (!root) return { mounted: false };
  return {
    mounted: true,
    // The view class lands on the mount root itself, so the marker reads classList,
    // not a descendant query.
    kanban: root.classList.contains("pm-kanban-view"),
    kanbanCols: root.querySelectorAll(".pm-kanban-col").length,
    kanbanCards: root.querySelectorAll(".pm-kanban-card").length,
    kanbanParentChips: root.querySelectorAll(".pm-kanban-card-parent").length,
    gantt: root.classList.contains("pm-gantt-view"),
    ganttBars: root.querySelectorAll(".pm-gantt-bar").length,
    ganttBarProgress: root.querySelectorAll(".pm-gantt-bar-progress").length,
    ganttMilestones: root.querySelectorAll(".pm-gantt-milestone").length,
    ganttArrows: root.querySelectorAll(".pm-gantt-arrow").length,
    ganttTodayDiamond: !!root.querySelector(".pm-gantt-today-diamond"),
    ganttLabelRows: root.querySelectorAll(".pm-gantt-label-row").length,
    ganttIndentedRows: Array.from(root.querySelectorAll(".pm-gantt-label-row"))
      .filter((row) => parseInt(row.style.paddingLeft || "0", 10) > 8).length,
  };
};
`);

if (missingSources.length > 0) {
  console.error(`reference-state-assertions: FAIL — the bundle no longer imports ${missingSources.join(", ")}`);
  console.error("  a check that does not bundle the vendored renderer proves nothing about it");
  process.exit(1);
}

writeFileSync(join(work, "index.html"), `<!doctype html>
<html class="theme-dark"><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${join(REPO, "tools/screenshots/theme.css")}">
</head>
<body><div id="shot"></div><script src="render-bundle.js"></script></body></html>`);

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

function findChrome() {
  const explicit = process.env.SCREENSHOT_CHROME;
  if (explicit && existsSync(explicit)) return explicit;
  for (const candidate of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]) if (existsSync(candidate)) return candidate;
  throw new Error("reference-state-assertions: no Chrome/Chromium found. Set SCREENSHOT_CHROME.");
}

// The expected marker counts are the fixture's own arithmetic: 18 rows, five statuses
// cycled in row order, the milestone on row 1, dependencies on rows 5/10/15, the
// subtask tree nesting the first three rows (so 16 top-level plus the two nested
// children still total 18 visible tasks), and the gantt's always-present add-task row
// making its label count one more than its task count.
const CASES = [
  {
    id: "reference-kanban",
    spec: { view: "kanban" },
    want: {
      kanban: true,
      kanbanCols: 5,
      kanbanCards: 18,
      kanbanParentChips: 0,
      gantt: false,
    },
  },
  {
    id: "reference-gantt",
    spec: { view: "gantt" },
    want: {
      gantt: true,
      ganttBars: 17,
      ganttBarProgress: 5,
      ganttMilestones: 1,
      ganttArrows: 3,
      ganttTodayDiamond: true,
      ganttLabelRows: 19,
      ganttIndentedRows: 0,
      kanban: false,
    },
  },
  {
    id: "reference-kanban-subtask",
    spec: { view: "kanban", subtask: true },
    want: {
      kanban: true,
      kanbanCols: 5,
      kanbanCards: 18,
      // The board bench rows carry no milestone flag, so both children are subtasks
      // and both draw the parent chip. (The gantt's timeline rows do carry one, which
      // is why that variant's milestone count stays at one.)
      kanbanParentChips: 2,
      gantt: false,
    },
  },
  {
    id: "reference-gantt-subtask",
    spec: { view: "gantt", subtask: true },
    want: {
      gantt: true,
      ganttBars: 17,
      ganttBarProgress: 5,
      ganttMilestones: 1,
      ganttArrows: 3,
      ganttTodayDiamond: true,
      ganttLabelRows: 19,
      ganttIndentedRows: 2,
      kanban: false,
    },
  },
];

const failures = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(`file://${join(work, "index.html")}`);

  for (const { id, spec, want } of CASES) {
    const markers = await page.evaluate((mountSpec) => window.__refMarkers(mountSpec), spec);
    console.log(`reference-state-assertions: ${id} mounted once\n`);
    if (!markers.mounted) {
      failures.push(`${id}: did not mount`);
      console.log(`  FAIL  ${id} — did not mount`);
    } else {
      for (const [key, expected] of Object.entries(want)) {
        const ok = markers[key] === expected;
        if (!ok) failures.push(`${id}: ${key} was ${markers[key]}, wanted ${expected}`);
        console.log(`  ${ok ? "PASS" : "FAIL"}  ${id} — ${key}: ${markers[key]}`);
      }
    }
    console.log("");
  }

  await page.close();
  for (const error of pageErrors) failures.push(`page error: ${error}`);
} catch (error) {
  failures.push(`harness run failed: ${error.message}`);
} finally {
  if (browser) await browser.close();
  rmSync(work, { recursive: true, force: true });
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`\nreference-state-assertions: FAIL — ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nreference-state-assertions: PASS — every reference mount renders the vendored");
console.log("  view's own markers: the kanban's columns and cards, the gantt's bars, milestone,");
console.log("  dependency arrows and today line, and the subtask tree's parent chips and depth.");
process.exit(0);
