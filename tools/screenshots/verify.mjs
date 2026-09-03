#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    verify
// COMPONENT: screenshot staleness gate — compares recorded source fingerprints to current ones
// ───────────────────────────────────────────────────────────────────

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
 * It also asks whether each capture is a picture of anything. Freshness and content are
 * different questions, and only the first was ever asked: a fixture whose subject is
 * `position: fixed` contributes nothing to the captured element's box, so it photographed an
 * empty 80x64 rectangle — four times, identically, in both themes — and every check stayed
 * green because the fingerprints were current and the files existed. A capture set exists to
 * be looked at, and nothing here could tell a component from a blank.
 *
 * Two questions catch it, and the second is the one that generalises: a single-coloured image
 * is a picture of nothing, and an image identical in light and dark is a picture taken before
 * the theme could reach it. Neither can be true of a component that renders.
 *
 * Exit 0 when every screenshot matches its sources, 1 when any is stale or missing, so it
 * can gate a commit. Add --json for machine-readable output.
 */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENARIOS } from "./scenarios.mjs";
import { decodePng } from "./pixel-hash.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
const MANIFEST = join(REPO, "screenshots", "manifest.json");

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

const hash = (rel) => {
  const abs = join(REPO, rel);
  if (!existsSync(abs)) return null;
  return createHash("sha256").update(readFileSync(abs)).digest("hex").slice(0, 12);
};

/**
 * Is this PNG a single flat colour?
 *
 * Decoding goes through pixel-hash.mjs's decodePng() — the same un-filter pass capture.mjs's
 * pixelHash uses to ask what a picture contains, asked here about whether it contains anything at
 * all. An indexed or 16-bit PNG (decodePng() returns null) is reported unreadable rather than
 * silently treated as fine, because "I could not read it" and "it is a picture of something" must
 * not share an answer.
 *
 * Stops at the first pixel that differs from the first, so a normal capture costs a few rows and
 * only a genuinely blank one is scanned whole.
 */
function flatColour(rel) {
  const buf = readFileSync(join(REPO, rel));
  const image = decodePng(buf);
  if (!image) {
    const depth = buf.length >= 8 && buf.readUInt32BE(0) === 0x89504e47 ? "unsupported" : "not a PNG";
    return { readable: false, why: depth === "not a PNG" ? "not a PNG" : "unsupported PNG encoding" };
  }
  const { width, height, channels, pixels } = image;
  let first = null;
  for (let at = 0; at < pixels.length; at += channels) {
    const px = pixels.subarray(at, at + channels);
    if (first === null) first = Buffer.from(px);
    else if (!px.equals(first)) return { readable: true, flat: false, width, height };
  }
  return {
    readable: true,
    flat: true,
    width,
    height,
    colour: first ? [...first].join(",") : "none",
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN
// ───────────────────────────────────────────────────────────────────

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
  const blank = [];
  const unreadable = [];
  const themeBlind = [];
  const byThemePair = new Map();

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

    const stats = flatColour(entry.file);
    if (!stats.readable) {
      unreadable.push(`${entry.file} — ${stats.why}`);
    } else if (stats.flat) {
      blank.push(`${entry.file} (${stats.width}x${stats.height}, every pixel ${stats.colour})`);
    }

    // One capture per theme is the whole point of capturing twice. Pixel-identical means the
    // theme never reached the subject, which for these fixtures means the subject was never in
    // the shot. Compared by pixelHash rather than file bytes: a byte hash would also flag two
    // captures the encoder happened to re-render identically in content but not in bytes as
    // *not* theme-blind, hiding a real miss — see pixel-hash.mjs.
    const pair = `${entry.id}|${entry.device}`;
    if (!byThemePair.has(pair)) byThemePair.set(pair, new Map());
    byThemePair.get(pair).set(entry.theme, { file: entry.file, hash: entry.pixelHash ?? null });
  }

  for (const [pair, themes] of byThemePair) {
    if (themes.size < 2) continue;
    const hashes = [...themes.values()].map((t) => t.hash);
    if (hashes.every((h) => h !== null) && new Set(hashes).size === 1) {
      themeBlind.push(`${pair.replace("|", " on ")} — ${[...themes.values()].map((t) => t.file).join(" == ")}`);
    }
  }

  // A scenario added to the registry but never captured is just as stale as a changed one,
  // and is the easier mistake to make: the registry edit and the capture run are separate steps.
  const captured = new Set(manifest.scenarios.map((s) => s.id));
  const uncaptured = SCENARIOS.filter((s) => !captured.has(s.id)).map((s) => s.id);

  const problems = stale.length + missingFile.length + missingSource.length + uncaptured.length
    + blank.length + unreadable.length + themeBlind.length;

  if (json) {
    console.log(JSON.stringify({
      stale, missingFile, missingSource, uncaptured, blank, unreadable, themeBlind,
      ok: problems === 0,
    }, null, 2));
  } else if (problems === 0) {
    console.log(`  screenshots current: ${manifest.scenarios.length} entries match their sources,`
      + " and none is blank or identical across themes");
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
    if (blank.length) {
      console.log(`  BLANK (${blank.length}) - one flat colour, so a picture of nothing:`);
      for (const s of blank) console.log(`    ${s}`);
      console.log("    A fixture whose subject is fixed or absolutely positioned contributes no");
      console.log("    height to the captured element. Give the scenario a captureCss block that");
      console.log("    restores flow without restyling what is being photographed.");
    }
    if (themeBlind.length) {
      console.log(`  IDENTICAL ACROSS THEMES (${themeBlind.length}) - the theme never reached the subject:`);
      for (const s of themeBlind) console.log(`    ${s}`);
    }
    if (unreadable.length) {
      console.log(`  UNREADABLE (${unreadable.length}):`);
      for (const s of unreadable) console.log(`    ${s}`);
    }
    console.log("\n  Refresh with: npm run screenshots");
  }

  process.exit(problems === 0 ? 0 : 1);
}

main();
