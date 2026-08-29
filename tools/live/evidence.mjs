// ───────────────────────────────────────────────────────────────────
// MODULE:    evidence
// COMPONENT: ties a recorded measurement to the tree that produced it
// ───────────────────────────────────────────────────────────────────
//
// A measurement is only true of the tree it was taken from. This program has
// several phases editing one stylesheet in turn, so a number recorded by an
// early phase can be quietly falsified by a later one — and a gate satisfied by
// a stale artefact is worse than no gate, because it carries the authority of
// having been measured.
//
// The capture pipeline already does this for screenshots: it records a hash per
// source file and refuses to trust a capture whose sources have moved. This
// generalises that convention rather than inventing a new one, so an evidence
// file of any kind can say which tree it describes.
//
// `stamp()` writes the inputs alongside the payload. `check()` reports whether a
// recorded artefact still describes the current tree, and exits non-zero naming
// the input that moved.
//
// Usage: node tools/live/evidence.mjs --check <artefact.json>

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));

/** Truncated to twelve to match the capture pipeline, so the two are comparable by eye. */
const LENGTH = 12;

// ───────────────────────────────────────────────────────────────────
// 3. API
// ───────────────────────────────────────────────────────────────────

export function fingerprint(relPath) {
  const abs = join(REPO, relPath);
  if (!existsSync(abs)) return null;
  return createHash("sha256").update(readFileSync(abs)).digest("hex").slice(0, LENGTH);
}

/**
 * Write a payload with the fingerprints of the files it was measured from.
 *
 * The inputs are named by the caller rather than inferred. Inferring them would quietly omit the
 * one that matters — a harness file, say — which is exactly the gap that let a pinned capture
 * variable survive unnoticed.
 */
export function stamp(outPath, payload, inputs) {
  const record = {
    measuredAt: new Date().toISOString(),
    inputs: Object.fromEntries(inputs.map((rel) => [rel, fingerprint(rel)])),
    ...payload,
  };
  writeFileSync(join(REPO, outPath), `${JSON.stringify(record, null, 2)}\n`);
  return record;
}

/** Compare a recorded artefact's inputs against the tree as it stands now. */
export function check(artefactPath) {
  const abs = join(REPO, artefactPath);
  if (!existsSync(abs)) {
    return { ok: false, reason: `no artefact at ${artefactPath}`, moved: [] };
  }
  const record = JSON.parse(readFileSync(abs, "utf8"));
  if (!record.inputs) {
    return { ok: false, reason: "artefact records no inputs — it cannot be dated", moved: [] };
  }
  const moved = Object.entries(record.inputs)
    .map(([rel, was]) => ({ rel, was, now: fingerprint(rel) }))
    .filter((entry) => entry.was !== entry.now);
  return {
    ok: moved.length === 0,
    reason: moved.length ? "inputs moved since this was measured" : null,
    moved,
    measuredAt: record.measuredAt,
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN
// ───────────────────────────────────────────────────────────────────

if (process.argv.includes("--check")) {
  const target = process.argv[process.argv.indexOf("--check") + 1];
  const result = check(target);
  const label = relative(REPO, join(REPO, target));
  if (result.ok) {
    console.log(`evidence: ${label} still describes this tree (measured ${result.measuredAt})`);
    process.exit(0);
  }
  console.error(`evidence: ${label} is STALE — ${result.reason}`);
  for (const m of result.moved) {
    console.error(`  ${m.rel}\n    measured against ${m.was}\n    tree now has     ${m.now}`);
  }
  console.error("\nA gate satisfied by a stale artefact carries the authority of a measurement");
  console.error("without the fact of one. Re-measure before relying on it.");
  process.exit(1);
}
