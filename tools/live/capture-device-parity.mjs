#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    capture-device-parity
// COMPONENT: which surfaces render the same on a phone as on a desktop
// ───────────────────────────────────────────────────────────────────
//
// A capture reviewer found four scenarios whose `-mobile-*` PNG is byte-identical to its
// `-desktop-*` twin and concluded "these components have no mobile adaptation at all ... the mobile
// shots prove nothing about mobile."
//
// Half right, and the half that is wrong matters. The capture pipeline DOES apply `is-mobile
// is-phone` and a 402px viewport on the mobile pass — 56 of 60 scenarios differ between the two
// devices, which is the evidence the switch is live. The four that match simply carry no rule keyed
// to the phone, and their content is narrower than either viewport. Their mobile capture is
// redundant, not false.
//
// SO THIS IS A RATCHET ON THE COUNT, AND THE DIRECTION IS THE POINT. A scenario LEAVING the list is
// fine — it gained a phone rule. A scenario JOINING it means a phone rule was lost, or a new surface
// shipped without one, and that is the regression worth a red. The four are named so nobody
// re-derives them from a diff.
//
// Exit 0 at or below the baseline, 1 above it, 2 when there were no pairs to compare.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { stamp } from "./evidence.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. COLLECT
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SHOTS = join(REPO, "screenshots");
const BASELINE_PATH = join(REPO, "tools/live/device-parity-baseline.json");

const digest = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

// Captures sit under a per-source root (screenshots/notion-clone/<group>/, eventually also
// screenshots/project-manager/<group>/) rather than directly under screenshots/<group>/, so this
// walks to whatever depth the PNGs actually live at instead of assuming one fixed level.
function collectPngs(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) collectPngs(abs, out);
    else if (entry.endsWith(".png")) out.push(abs);
  }
  return out;
}

const identical = [];
let pairs = 0;

for (const mobile of collectPngs(SHOTS)) {
  const name = mobile.split("/").pop();
  if (!name.endsWith("-mobile-dark.png")) continue;
  const twin = name.replace("-mobile-dark.png", "-desktop-dark.png");
  const desktop = join(dirname(mobile), twin);
  if (!existsSync(desktop)) continue;
  pairs += 1;
  if (digest(mobile) === digest(desktop)) {
    identical.push(name.replace("-mobile-dark.png", ""));
  }
}

// ───────────────────────────────────────────────────────────────────
// 3. VERDICT
// ───────────────────────────────────────────────────────────────────

if (pairs === 0) {
  console.error("capture-device-parity: no mobile/desktop pairs found, which is not the same as clean.");
  process.exit(2);
}

const baseline = existsSync(BASELINE_PATH) ? JSON.parse(readFileSync(BASELINE_PATH, "utf8")) : null;
const allowed = baseline ? baseline.identical : identical.length;
const known = new Set(baseline?.scenarios ?? []);

console.log(`capture-device-parity: ${pairs} scenario(s) captured on both devices`);
console.log(`  ${pairs - identical.length} render differently on a phone`);
console.log(`  ${identical.length} render identically, against a recorded baseline of ${allowed}`);
for (const name of identical) console.log(`    ${name}${known.has(name) ? "" : "   ← new"}`);

if (identical.length > allowed) {
  console.error(`\ncapture-device-parity: FAIL — ${identical.length - allowed} scenario(s) newly identical.`);
  for (const name of identical.filter((n) => !known.has(n))) console.error(`  ${name}`);
  console.error("\n  A surface that used to differ on a phone and no longer does has lost a rule,");
  console.error("  or shipped without one. The pipeline's device switch is not in question: the");
  console.error(`  ${pairs - identical.length} scenarios that still differ are the evidence it is live.`);
  process.exit(1);
}

stamp("tools/live/capture-device-parity.json", {
  pairs,
  identical: identical.length,
  differing: pairs - identical.length,
}, ["tools/live/capture-device-parity.mjs", "screenshots/manifest.json"]);
console.log("\ncapture-device-parity: PASS — no surface newly renders the same on both devices");
console.log("  what this does not prove: that the four are RIGHT to be identical. They carry no");
console.log("  phone rule and their content is narrower than either viewport, which is a design");
console.log("  question; their under-floor controls are already counted in the touch-targets baseline.");
process.exit(0);
