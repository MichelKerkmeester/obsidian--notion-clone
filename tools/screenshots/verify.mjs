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
 *
 * A `sources` entry can name a file this repository deliberately does not track — the
 * reference-capture group depends on a vendored comparison plugin under specs/context/,
 * gitignored on purpose (see .gitignore's `specs/**\/context/`) so it never ships in this
 * repo. On a machine that has it vendored in, staleness is checked exactly as strictly as
 * any other source. On one that does not — every fresh checkout, CI included, since the
 * directory is never committed — the file's absence is not a broken repo, it is the
 * documented shape of that checkout, and reporting it as MISSING SOURCE would fail a gate
 * no push could ever satisfy. classifySource() tells the two apart by asking git, the one
 * authority that already knows which paths were never meant to be here, and only a path git
 * itself disowns is downgraded to VENDOR UNAVAILABLE rather than treated as a real break.
 */

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readFileSync, existsSync, lstatSync, mkdtempSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
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
 * Walks `rel`'s path segments from the top, looking for the first one that exists on disk as a
 * symlink (relative to `repoRoot`). Returns its path (relative to `repoRoot`), or null when
 * nothing along the chain is a symlink — including when the chain stops existing altogether,
 * since there is nothing left for git to trip over from that point down.
 */
function firstSymlinkAncestor(rel, repoRoot) {
  const segments = rel.split("/").filter(Boolean);
  let acc = "";
  for (const segment of segments) {
    acc = acc ? `${acc}/${segment}` : segment;
    let stats;
    try {
      stats = lstatSync(join(repoRoot, acc));
    } catch {
      return null;
    }
    if (stats.isSymbolicLink()) return acc;
  }
  return null;
}

// Keyed by `${repoRoot}::${ancestorRel}` so a run touching many files behind the same
// symlinked vendor tree pays the scratch-repo cost in isAncestorIgnoredAcrossSymlink() once,
// not once per source.
const symlinkIgnoreCache = new Map();

/**
 * git refuses to answer whether a directory-only .gitignore rule (a pattern ending in "/",
 * like this repo's `specs/**\/context/`) covers a path that crosses an existing symlink — and
 * it refuses in two different ways depending on how you ask. Naming anything *beyond* the link
 * is a hard "fatal: pathspec ... is beyond a symbolic link". Naming the link itself doesn't
 * crash, but doesn't tell the truth either: git classifies a path's directory-ness from its own
 * lstat type, and a symlink's type is "symlink", never "directory", so a rule written to match
 * directories silently never matches it — regardless of what it points at, and regardless of
 * whether that target is itself a plain directory sitting inside this very repository (which,
 * for every worktree this program creates, it is: `specs/context` here is a symlink back to
 * the main checkout's own `specs/context`, an ordinary gitignored directory there).
 *
 * The question that actually needs answering — would this rule match `ancestorRel` if it were
 * a plain directory, wherever its target really lives — is answered by asking git that exact
 * question from a place where nothing needs crossing: a throwaway repo that mirrors only the
 * .gitignore files that could apply to `ancestorRel` (root-to-parent, the same cascade git
 * itself would consult) and a real, non-symlink directory at the identical relative path. That
 * reuses git's own pattern matcher — including `**`, negation, and per-directory overrides —
 * rather than reimplementing gitignore's glob syntax by hand, and it works whether the real
 * symlink's target sits inside this repository, inside some other repository, or nowhere a
 * repository has ever been.
 */
function isAncestorIgnoredAcrossSymlink(ancestorRel, repoRoot) {
  const cacheKey = `${repoRoot}::${ancestorRel}`;
  if (symlinkIgnoreCache.has(cacheKey)) return symlinkIgnoreCache.get(cacheKey);

  let result = false;
  let scratch;
  try {
    scratch = mkdtempSync(join(tmpdir(), "verify-ignore-"));
    execFileSync("git", ["-c", "core.excludesFile=/dev/null", "init", "-q"], {
      cwd: scratch,
      stdio: "ignore",
    });

    // Mirror every .gitignore from the repo root down to ancestorRel's own directory — the
    // same cascade git consults when deciding whether a directory is ignored.
    const segments = ancestorRel.split("/");
    let prefix = "";
    for (const segment of segments) {
      const gitignoreRel = prefix ? join(prefix, ".gitignore") : ".gitignore";
      const sourceGitignore = join(repoRoot, gitignoreRel);
      if (existsSync(sourceGitignore)) {
        const destDir = prefix ? join(scratch, prefix) : scratch;
        mkdirSync(destDir, { recursive: true });
        cpSync(sourceGitignore, join(scratch, gitignoreRel));
      }
      prefix = prefix ? `${prefix}/${segment}` : segment;
    }

    // The ancestor itself, as the plain directory it would need to be for a mustbedir rule to
    // ever match — not the symlink it actually is in the real worktree.
    mkdirSync(join(scratch, ancestorRel), { recursive: true });

    execFileSync(
      "git",
      ["-c", "core.excludesFile=/dev/null", "check-ignore", "-q", "--", ancestorRel],
      { cwd: scratch, stdio: "ignore" },
    );
    result = true;
  } catch {
    result = false;
  } finally {
    if (scratch) {
      try {
        rmSync(scratch, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup only; a leftover temp directory is not a correctness problem.
      }
    }
  }

  symlinkIgnoreCache.set(cacheKey, result);
  return result;
}

/**
 * Does an ignore rule in this repo's own .gitignore disown `rel`? For an ordinary path this is
 * exactly `git check-ignore`, unchanged, and it works the same whether the vendored tree is
 * checked out beside this repo or missing entirely: the pattern alone decides, and git never
 * requires the path to exist on disk to answer.
 *
 * The one case plain `git check-ignore` cannot answer honestly is a path that crosses a
 * symlink (see isAncestorIgnoredAcrossSymlink for why git itself refuses this one). That case
 * is detected — not guessed at from git's error text — by walking `rel`'s own ancestors on
 * disk, and only takes the slower scratch-repo path when one of them genuinely is a symlink.
 *
 * A tracked file is never "ignored" even behind a symlinked ancestor — `git ls-files` doesn't
 * share check-ignore's symlink restriction, so that stays a plain, direct question.
 *
 * Any failure to ask (git absent, not a repo, an unreadable path) answers "no" rather than
 * "yes": without a confirmed ignore rule behind it, an absent source stays a real MISSING
 * SOURCE. That is the fail-closed default this check already had, kept for every path this
 * function cannot positively clear.
 */
export function isGitIgnored(rel, { repoRoot = REPO } = {}) {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", rel], { cwd: repoRoot, stdio: "ignore" });
    return true;
  } catch {
    // Falls through: either genuinely not ignored, or ignored in a way git refuses to confirm
    // directly because the path crosses a symlink — checked next.
  }

  const symlinkAncestor = firstSymlinkAncestor(rel, repoRoot);
  if (symlinkAncestor === null) return false;

  try {
    const tracked = execFileSync("git", ["ls-files", "--", rel], { cwd: repoRoot, encoding: "utf8" });
    if (tracked.trim().length > 0) return false;
  } catch {
    // An unexpected ls-files failure is treated as "could not confirm tracked", not as a
    // reason to trust an unverified path — fall through to the symlink-ancestor check.
  }

  return isAncestorIgnoredAcrossSymlink(symlinkAncestor, repoRoot);
}

/**
 * Classifies one sourceHashes entry against the file the manifest recorded a fingerprint
 * for. "present" carries the current hash for the caller to compare; "missing" is a real
 * break (a tracked source disappeared); "vendor-unavailable" is a git-ignored source this
 * checkout was never going to have, which the caller must not fail the gate over.
 *
 * Takes readHash/checkIgnored as parameters (defaulting to the real implementations) so the
 * three-way branch is testable without touching the filesystem or spawning git.
 */
export function classifySource(rel, { readHash = hash, checkIgnored = isGitIgnored } = {}) {
  const current = readHash(rel);
  if (current !== null) return { status: "present", hash: current };
  return { status: checkIgnored(rel) ? "vendor-unavailable" : "missing" };
}

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
  const vendorUnavailable = [];
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
      const classified = classifySource(src);
      if (classified.status === "vendor-unavailable") {
        vendorUnavailable.push(`${entry.file} <- ${src}`);
      } else if (classified.status === "missing") {
        missingSource.push(`${entry.file} <- ${src} (source no longer exists)`);
      } else if (classified.hash !== recorded) {
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
      stale, missingFile, missingSource, vendorUnavailable, uncaptured, blank, unreadable, themeBlind,
      ok: problems === 0,
    }, null, 2));
  } else {
    if (problems === 0) {
      console.log(`  screenshots current: ${manifest.scenarios.length} entries match their sources,`
        + " and none is blank or identical across themes");
    }
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
    if (vendorUnavailable.length) {
      console.log(`  VENDOR UNAVAILABLE (${vendorUnavailable.length}) - git-ignored reference `
        + "sources not present in this checkout, staleness unverified here:");
      for (const s of vendorUnavailable) console.log(`    ${s}`);
    }
    if (problems > 0) console.log("\n  Refresh with: npm run screenshots");
  }

  process.exit(problems === 0 ? 0 : 1);
}

// Guarded so verify.mjs stays importable — classifySource() and isGitIgnored() are tested
// directly from verify.test.mjs, which must not trigger the CLI's own process.exit().
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) main();
