// ───────────────────────────────────────────────────────────────────
// MODULE:    check-lane
// COMPONENT: refuses a stylesheet edit by a phase that does not hold the lane
// ───────────────────────────────────────────────────────────────────
//
// `styles.css` is nineteen thousand lines, deliberately never split, and every
// screenshot in this repository fingerprints it. Two phases editing it at once
// produce a stylesheet neither of them measured and a capture set matching
// neither.
//
// The phase order permits exactly that. Two phases unblock on the same edge, so
// nothing but convention keeps them apart — and the program these phases belong
// to exists because convention already failed once, shipping a release that
// passed every gate and changed nothing on screen.
//
// So the lane is a check rather than an agreement. It compares the stylesheet
// against the hash recorded when the lane was taken and asks who holds it.
//
// It cannot know which phase is running, and pretending otherwise would be
// theatre. What it can do is refuse to let a change pass unnoticed: an edit with
// no matching handover is reported, with the holder named, so the question
// "should you be editing this?" is asked at the moment it matters rather than at
// review. Set SURFACE_PHASE to answer it.
//
// Exit 0 when the stylesheet is unchanged or the holder is editing it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const LANE = join(REPO, "tools/lane/css-lane.json");
const SHEET = join(REPO, "styles.css");

// ───────────────────────────────────────────────────────────────────
// 3. MAIN
// ───────────────────────────────────────────────────────────────────

if (!existsSync(LANE) || !existsSync(SHEET)) {
  console.error("check-lane: no lane file or no stylesheet — nothing can be checked.");
  process.exit(2);
}

const lane = JSON.parse(readFileSync(LANE, "utf8"));
const current = createHash("sha256").update(readFileSync(SHEET)).digest("hex").slice(0, 12);
const claimed = process.env.SURFACE_PHASE || null;

if (current === lane.baselineHash) {
  console.log(`check-lane: stylesheet unchanged since the lane was taken (${current})`);
  console.log(`check-lane: held by ${lane.holder}`);
  process.exit(0);
}

console.log(`check-lane: stylesheet has moved — ${lane.baselineHash} -> ${current}`);
console.log(`check-lane: lane held by ${lane.holder}, acquired ${lane.acquiredAt}`);

if (claimed && claimed === lane.holder) {
  console.log(`check-lane: SURFACE_PHASE=${claimed} holds the lane. Edit allowed.`);
  console.log("check-lane: update baselineHash and append to history when handing over.");
  process.exit(0);
}

console.error("");
if (claimed) {
  console.error(`check-lane: FAIL — SURFACE_PHASE=${claimed} does not hold the lane.`);
} else {
  console.error("check-lane: FAIL — the stylesheet changed and no phase claimed the edit.");
  console.error("  Set SURFACE_PHASE to the phase you are working as.");
}
console.error(`  The lane is held by ${lane.holder}.`);
console.error("");
console.error("  Take it over properly rather than around: re-capture and sign off the screenshots");
console.error("  the current holder's edits moved, then set holder and baselineHash and append to");
console.error("  history in one commit of its own. A handover buried in an unrelated diff is not one.");
process.exit(1);
