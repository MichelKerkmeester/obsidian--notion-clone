#!/usr/bin/env node
/**
 * Reports screenshots whose source files have changed since they were captured.
 *
 * This is the mechanism behind "screenshots stay current": a promise to remember is not
 * enforceable, a failing check is. Each manifest entry records a fingerprint of every file
 * the screenshot depicts, so a change to a renderer or to the stylesheet marks exactly the
 * screenshots it invalidates and nothing else.
 *
 * Compares fingerprints rather than image bytes deliberately. Re-rendering on a different
 * Chrome build shifts antialiasing by a pixel, so a byte comparison would report drift on
 * every machine while missing a real change captured on the same one.
 *
 * Exit 0 when every screenshot matches its sources, 1 when any is stale or missing, so it
 * can gate a commit. Add --json for machine-readable output.
 */

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS } from "./scenarios.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const MANIFEST = join(REPO, "screenshots", "manifest.json");

const hash = (rel) => {
  const abs = join(REPO, rel);
  if (!existsSync(abs)) return null;
  return createHash("sha256").update(readFileSync(abs)).digest("hex").slice(0, 12);
};

function main() {
  const json = process.argv.includes("--json");

  if (!existsSync(MANIFEST)) {
    console.error("No screenshots/manifest.json. Run: npm run screenshots");
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

  const stale = [];
  const missingFile = [];
  const missingSource = [];

  for (const entry of manifest.scenarios) {
    if (!existsSync(join(REPO, entry.file))) {
      missingFile.push(entry.file);
      continue;
    }
    for (const [src, recorded] of Object.entries(entry.sourceHashes || {})) {
      const current = hash(src);
      if (current === null) {
        missingSource.push(`${entry.file} <- ${src} (source no longer exists)`);
      } else if (current !== recorded) {
        stale.push(`${entry.file} <- ${src}`);
      }
    }
  }

  // A scenario added to the registry but never captured is just as stale as a changed one,
  // and is the easier mistake to make: the registry edit and the capture run are separate steps.
  const captured = new Set(manifest.scenarios.map((s) => s.id));
  const uncaptured = SCENARIOS.filter((s) => !captured.has(s.id)).map((s) => s.id);

  const problems = stale.length + missingFile.length + missingSource.length + uncaptured.length;

  if (json) {
    console.log(JSON.stringify({ stale, missingFile, missingSource, uncaptured, ok: problems === 0 }, null, 2));
  } else if (problems === 0) {
    console.log(`  screenshots current: ${manifest.scenarios.length} entries match their sources`);
  } else {
    if (stale.length) {
      console.log(`  STALE (${stale.length}) - source changed since capture:`);
      for (const s of stale) console.log(`    ${s}`);
    }
    if (missingFile.length) {
      console.log(`  MISSING FILE (${missingFile.length}):`);
      for (const s of missingFile) console.log(`    ${s}`);
    }
    if (missingSource.length) {
      console.log(`  MISSING SOURCE (${missingSource.length}):`);
      for (const s of missingSource) console.log(`    ${s}`);
    }
    if (uncaptured.length) {
      console.log(`  NEVER CAPTURED (${uncaptured.length}):`);
      for (const s of uncaptured) console.log(`    ${s}`);
    }
    console.log("\n  Refresh with: npm run screenshots");
  }

  process.exit(problems === 0 ? 0 : 1);
}

main();
