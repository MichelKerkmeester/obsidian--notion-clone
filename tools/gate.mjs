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
  { name: "naming", cmd: ["node", "tools/naming/scan-naming.mjs"] },
  { name: "pinned-values", cmd: ["node", "tools/screenshots/scan-pinned-values.mjs"] },
  { name: "css-lane", cmd: ["node", "tools/lane/check-lane.mjs"] },
  // The censuses date themselves against the files they measured, and until this line existed
  // nothing asked. Seven of the eight were stale, one of them holding a checkbox count the roadmap
  // quoted as evidence for work that had already changed it. The stamping mechanism was built, the
  // artefacts carried their fingerprints, and the gate simply never read them.
  { name: "evidence", cmd: ["node", "tools/live/evidence.mjs", "--check-all"] },
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
