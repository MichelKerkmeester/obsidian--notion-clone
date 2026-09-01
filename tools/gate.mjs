// ───────────────────────────────────────────────────────────────────
// MODULE:    gate
// COMPONENT: runs every check and returns one verdict
// ───────────────────────────────────────────────────────────────────
//
// There are twenty-one scripts and four scanners that are not scripts at all.
// Running them meant a shell loop and reading twenty-five exit codes by eye,
// and in this session alone that went wrong four times — three where a pipe made
// `$?` the pipe's status rather than the command's, and one where a check was
// simply run, its red exit unread, and the work committed on top.
//
// A gate you have to read carefully is not a gate. This one reads them.
//
// It also knows about deliberate red. One assertion is inverted on purpose and
// will fail until the phase that fixes it lands, and a suite that is red for a
// known reason is indistinguishable from one that is red for an unknown reason
// unless somebody writes the reason down. So expected failures are declared,
// with the phase that owns them — and an expected failure that starts PASSING is
// reported too, because that means either the fix arrived or the inversion was
// quietly reverted, and those need telling apart.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. THE CHECKS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("..", import.meta.url));

/**
 * `expectFail` is a claim that needs a reason and an owner, never a way to quiet a check.
 * Anything listed here is reported whichever way it goes.
 */
const CHECKS = [
  { name: "types", cmd: ["npx", "tsc", "--noEmit"] },
  { name: "tests", cmd: ["npm", "test"] },
  { name: "lint:tools", cmd: ["npm", "run", "lint:tools"] },
  { name: "comments", cmd: ["node", "tools/naming/scan-comments.mjs"] },
  { name: "folder-docs", cmd: ["node", "tools/naming/scan-folder-docs.mjs"] },
  { name: "operator-list", cmd: ["node", "tools/naming/build-operator-checklist.mjs", "--check"] },
  { name: "naming", cmd: ["node", "tools/naming/scan-naming.mjs"] },
  { name: "failing-values", cmd: ["node", "tools/naming/scan-failing-values.mjs"] },
  { name: "pinned-values", cmd: ["node", "tools/screenshots/scan-pinned-values.mjs"] },
  { name: "css-lane", cmd: ["node", "tools/lane/check-lane.mjs"] },
  // Runs here, not only at release. Every phase edits the same stylesheet in turn, so a result
  // measured green three phases ago describes a tree that no longer exists unless something checks.
  { name: "replay", cmd: ["node", "tools/live/replay.mjs"] },
  { name: "inverted-assertions", cmd: ["node", "tools/live/guard-inverted-assertions.mjs"] },
  { name: "screenshots-fresh", cmd: ["npm", "run", "screenshots:verify"] },
  { name: "shim-coverage", cmd: ["npm", "run", "shim:coverage"] },
  { name: "story-coverage", cmd: ["npm", "run", "story:coverage"] },
  // This has carried an expectFail twice — for the widthless-caller default, and for a sheet that
  // could not reach the screen bottom. Both are discharged, and the declaration is removed rather
  // than updated each time, so a red here means a regression and not a known defect.
  { name: "placement", cmd: ["npm", "run", "storybook:placement"] },
  // The gate never built a renderer the plugin ships, and a row loop that forced a layout per row
  // froze the app through every other check. This one bundles the shipped renderers and asserts
  // structural facts about what they build, so a renderer change moves a number in a gate.
  { name: "render-assertions", cmd: ["node", "tools/live/render-assertions.mjs"] },
  // Closing a sheet left its backdrop on the body — a full-screen element at inset 0 with
  // pointer-events auto, over the whole app, which the operator reported as a freeze. The
  // placement check does assert a backdrop leaves with its menu, but only against the one
  // producer that cleaned up, and it removed leaked backdrops by hand so later checks could run.
  // This compares every producer against that reference in one run.
  { name: "sheet-teardown", cmd: ["node", "tools/live/sheet-teardown.mjs"] },
  // The grab bar is a child of the sheet panel, so a surface that refreshes by emptying that
  // panel throws its own bar away — and for the group sheet, changing the group IS the refresh,
  // so using the surface for its one purpose left it with no visible way out. Unlike every other
  // renderer check here, this one constructs the real renderer instead of grepping its source: a
  // grep cannot tell a call that runs from a call behind a condition that is never true.
  { name: "sheet-rebuild", cmd: ["node", "tools/live/sheet-rebuild.mjs"] },
  // The list renders only the rows near the viewport, so most rows have no DOM element at all.
  // Range selection used to order itself by querying the DOM and fell back to the full row list
  // only when that query returned NOTHING — a windowed list is never empty, only incomplete, so a
  // shift-click collapsed to the two rows at its ends and said nothing. This runs both orderings
  // against the same real window: the DOM one must still fall short, or the check is not
  // exercising the difference it exists to catch.
  { name: "list-window", cmd: ["node", "tools/live/list-window.mjs"] },
  // Reading captures catches what a person notices; it does not catch a control four pixels short
  // of a thumb, because four pixels is invisible in a picture and decisive under a finger. This
  // measures every interactive element at phone width with a COARSE pointer — the mode that
  // actually applies the stylesheet touch rules, and the one a sibling tool was missing when it
  // reported 53 checkboxes at a size no phone paints. It ratchets rather than cliffs: 286 controls
  // sit below this project own 28px floor today, and the count may not grow while they are triaged.
  { name: "touch-targets", cmd: ["node", "tools/live/touch-targets.mjs"] },
  { name: "unstyled-links", cmd: ["node", "tools/live/unstyled-links.mjs"] },
  { name: "device-parity", cmd: ["node", "tools/live/capture-device-parity.mjs"] },
  // The censuses date themselves against the files they measured, and until this line existed
  // nothing asked. Seven of the eight were stale, one of them holding a checkbox count the roadmap
  // quoted as evidence for work that had already changed it. The stamping mechanism was built, the
  // artefacts carried their fingerprints, and the gate simply never read them.
  //
  // LAST on purpose. Four lanes above re-stamp their own artefacts as they run, so checking
  // freshness before them meant the first run after any source change went red and the second went
  // green with nobody doing anything. The re-stamps are real measurements, so nothing was being
  // hidden — but a gate that passes on the second try teaches "just run it again", which is the
  // habit this whole lane exists to prevent. Reading the stamps after the lanes that write them
  // makes one run the answer.
  { name: "evidence", cmd: ["node", "tools/live/evidence.mjs", "--check-all"] },
];

// ───────────────────────────────────────────────────────────────────
// 3. RUN
// ───────────────────────────────────────────────────────────────────

const results = [];
for (const check of CHECKS) {
  const [command, ...args] = check.cmd;
  const run = spawnSync(command, args, { cwd: REPO, encoding: "utf8", shell: false });
  // A signal or a missing binary leaves status null, which is not a pass and must not read as one.
  const code = run.status === null ? 1 : run.status;
  const failed = code !== 0;
  results.push({
    ...check,
    code,
    failed,
    surprise: check.expectFail ? !failed : failed,
    tail: (run.stderr || run.stdout || "").trim().split("\n").slice(-2).join(" | ").slice(0, 120),
  });
}

// ───────────────────────────────────────────────────────────────────
// 4. VERDICT
// ───────────────────────────────────────────────────────────────────

const width = Math.max(...CHECKS.map((c) => c.name.length));
for (const r of results) {
  const mark = r.failed ? (r.expectFail ? "red (expected)" : "RED") : r.expectFail ? "GREEN (unexpected)" : "green";
  console.log(`  ${r.name.padEnd(width)}  ${mark}`);
  if (r.surprise && r.tail) console.log(`  ${" ".repeat(width)}  ${r.tail}`);
}

const unexpectedRed = results.filter((r) => r.failed && !r.expectFail);
const unexpectedGreen = results.filter((r) => !r.failed && r.expectFail);

console.log("");
for (const r of unexpectedGreen) {
  console.log(`${r.name} passed, and it was expected to fail.`);
  console.log(`  it was red because: ${r.expectFail.reason}`);
  console.log(`  either ${r.expectFail.owner} landed its fix, or the assertion was reverted.`);
  console.log("  those are opposite outcomes and this cannot tell them apart. Go and look.\n");
}

if (unexpectedRed.length === 0 && unexpectedGreen.length === 0) {
  const expected = results.filter((r) => r.expectFail);
  console.log(`gate: PASS — ${results.length - expected.length} green, ${expected.length} red for a declared reason`);
  for (const r of expected) console.log(`  ${r.name}: ${r.expectFail.reason} (${r.expectFail.owner})`);
  process.exit(0);
}

console.log(`gate: FAIL — ${unexpectedRed.length} unexpected failure(s), ${unexpectedGreen.length} unexpected pass(es)`);
process.exit(1);
