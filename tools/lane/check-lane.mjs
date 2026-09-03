// ───────────────────────────────────────────────────────────────────
// MODULE:    check-lane
// COMPONENT: refuses a stylesheet edit by a phase that does not hold the lane,
//            and a lane release that leaves a changed capture unnamed
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
// THE SECOND REFUSAL: A RELEASE THAT NAMES NO CAPTURE IT MOVED.
//
// Every release note in this lane's history ended with the reviewing owed and
// the reviewing recorded in prose. Prose is not a gate. So when the newest
// history entry is a release sitting on the current stylesheet, the captures
// git reports as changed are compared against that entry's `reviewed` array,
// and one the release does not name is refused with the file listed.
//
// The changed set STARTS from git rather than from the capture manifest, because a manifest can
// be regenerated without anyone opening an image — it would report the review as done at the
// moment a script rewrote a fingerprint, which is the failure this refusal exists to catch rather
// than a proxy for it. Git reports what the release is about to commit, and nothing else.
//
// It is then narrowed by content, not widened: the capture harness is not byte-deterministic — an
// identical rerun of the same page can move a different set of PNGs each time, because Chrome's
// own rasteriser and PNG encoder are not guaranteed reproducible even when nothing on the page
// changed (see `pixel-hash.mjs`). So a git-reported move is compared against the manifest's
// `pixelHash`/`layoutHash` for that file, before and after, and a move that changed no pixel is
// dropped. A file can only leave
// the changed set this way if BOTH the old and the new manifest entries agree it is unchanged —
// regenerating the manifest alone, with the image itself untouched, cannot manufacture that
// agreement, because the "before" side is read from the last commit, not from the working tree.
//
// What it does not claim: naming a file asserts someone opened it, and no check
// can confirm that. This refuses the release that never looked at all. Only the
// newest entry is checked, so older releases are grandfathered deliberately —
// back-filling `reviewed` onto releases whose reviews nobody did would
// manufacture exactly the evidence this rule exists to require.
//
// Exit 0 when the stylesheet is unchanged or the holder is editing it, and the
// newest release names every capture whose content — not just its bytes — moved.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const LANE = join(REPO, "tools/lane/css-lane.json");
const SHEET = join(REPO, "styles.css");
const CAPTURES = "screenshots";
const MANIFEST = join(REPO, "screenshots", "manifest.json");

// ───────────────────────────────────────────────────────────────────
// 3. THE CHANGED CAPTURE SET
// ───────────────────────────────────────────────────────────────────

/**
 * Reads `git status --porcelain -- screenshots` output into a path -> status map for the
 * capture paths a release would be committing.
 *
 * Only images count. The manifest and the folder README move on every capture
 * run and there is nothing in either for a person to look at, so a release that
 * regenerated them has reviewed nothing by doing so.
 *
 * Modified and untracked both count: a capture rewritten in place and a capture
 * that did not exist before are the same event to a reviewer, and a new surface
 * arriving unlooked-at is the more likely of the two — but they are kept distinct
 * here (`"M"` vs `"??"`) because only a modified capture has a previous manifest
 * entry to compare content against.
 */
function parseChangedCaptures(porcelain) {
  const seen = new Map();
  for (const line of String(porcelain).split("\n")) {
    if (line.length < 4) continue;
    const code = line.slice(0, 2);
    const modified = code.includes("M");
    const untracked = code === "??";
    if (!modified && !untracked) continue;
    // A rename is reported as `old -> new`; the file that exists now is the one a
    // reviewer can open.
    const path = line.slice(3).split(" -> ").pop().trim().replace(/^"|"$/g, "");
    if (!path.startsWith(`${CAPTURES}/`) || !path.toLowerCase().endsWith(".png")) continue;
    seen.set(path, untracked ? "??" : "M");
  }
  return seen;
}

export function changedCaptures(porcelain) {
  return [...parseChangedCaptures(porcelain).keys()].sort();
}

/**
 * Decides whether a git-reported change to one capture is a real content change or a byte-only
 * move — the encoder and antialiasing jitter `pixel-hash.mjs`'s `pixelHash` exists to absorb.
 * `git status` reads bytes; this reads what the picture is of.
 *
 * An untracked capture, or one with no matching entry in the previous manifest, has nothing to
 * compare against and always counts as changed. A capture present in both manifests changes when
 * its `pixelHash` differs, comparing `pixelHash` to `pixelHash` only — never `pixelHash` against
 * `layoutHash`, which are different measures and would read as "different" on every capture
 * whichever side introduced `pixelHash` first. When either side predates `pixelHash` (this
 * phase's own landing commit is the boundary), both sides fall back to `layoutHash` together. If
 * neither measure is comparable on both sides, the conservative reading is "changed": a capture
 * this comparator cannot read is never silently waved through.
 */
export function isContentChange(status, currentEntry, previousEntry) {
  if (status === "??" || !currentEntry || !previousEntry) return true;
  if (currentEntry.pixelHash != null && previousEntry.pixelHash != null) {
    return currentEntry.pixelHash !== previousEntry.pixelHash;
  }
  if (currentEntry.layoutHash != null && previousEntry.layoutHash != null) {
    return currentEntry.layoutHash !== previousEntry.layoutHash;
  }
  return true;
}

/**
 * Filters git's changed-capture set down to the ones whose content actually moved, reading the
 * working-tree manifest for "now" and the last commit's manifest for "before". A capture git
 * reports as modified but the manifest reads as pixel-identical to what was last committed is
 * not a review a release owes — it moved bytes, not a picture.
 */
export function contentChangedCaptures(porcelain, currentManifest, previousManifest) {
  const changes = parseChangedCaptures(porcelain);
  const currentByFile = new Map((currentManifest?.scenarios ?? []).map((e) => [e.file, e]));
  const previousByFile = new Map((previousManifest?.scenarios ?? []).map((e) => [e.file, e]));
  return [...changes.entries()]
    .filter(([path, status]) => isContentChange(status, currentByFile.get(path), previousByFile.get(path)))
    .map(([path]) => path)
    .sort();
}

/** Reads and parses a manifest.json from the working tree; null if missing or unparsable. */
function readManifestFile(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/** Reads and parses screenshots/manifest.json as it exists in the last commit — "before" for the
 * content compare, distinct from the working-tree copy `capture.mjs` just wrote. */
function readManifestAtHead() {
  const show = spawnSync("git", ["show", "HEAD:screenshots/manifest.json"], {
    cwd: REPO,
    encoding: "utf8",
    shell: false,
  });
  if (show.status !== 0) return null;
  try {
    return JSON.parse(show.stdout);
  } catch {
    return null;
  }
}

/**
 * Decides whether the newest lane entry is a release that accounts for every
 * changed capture.
 *
 * The trigger is narrow on purpose: a release entry whose `hash` is the current
 * `baselineHash` is a release sitting on the stylesheet in the tree right now,
 * which is the only entry whose review can still be owed. An acquire, an edit,
 * or a release recorded against an older stylesheet is somebody else's history.
 */
export function reviewVerdict(lane, changed) {
  const history = Array.isArray(lane.history) ? lane.history : [];
  const newest = history[history.length - 1] ?? null;
  const out = [];
  const err = [];

  if (!newest || newest.event !== "release" || newest.hash !== lane.baselineHash) {
    return { exit: 0, out, err };
  }

  const reviewed = Array.isArray(newest.reviewed) ? newest.reviewed : null;
  const unnamed = changed.filter((path) => !(reviewed ?? []).includes(path));

  if (unnamed.length === 0) {
    out.push(`check-lane: release names all ${changed.length} changed capture(s)`);
    return { exit: 0, out, err };
  }

  err.push("");
  err.push(`check-lane: FAIL — ${unnamed.length} changed capture(s) this release does not name.`);
  for (const path of unnamed) err.push(`  ${path}`);
  err.push("");
  err.push(reviewed
    ? `  The release by ${newest.phase} lists ${reviewed.length} reviewed capture(s), and not these.`
    : `  The release by ${newest.phase} carries no reviewed list at all.`);
  err.push("  A release must name every capture it moved. Open each image, then add its path to");
  err.push("  the `reviewed` array on that history entry — a review recorded in prose is not one.");
  return { exit: 1, out, err };
}

// ───────────────────────────────────────────────────────────────────
// 4. MAIN
// ───────────────────────────────────────────────────────────────────

function main() {
  if (!existsSync(LANE) || !existsSync(SHEET)) {
    console.error("check-lane: no lane file or no stylesheet — nothing can be checked.");
    return 2;
  }

  const lane = JSON.parse(readFileSync(LANE, "utf8"));
  const current = createHash("sha256").update(readFileSync(SHEET)).digest("hex").slice(0, 12);
  const claimed = process.env.SURFACE_PHASE || null;

  const status = spawnSync("git", ["status", "--porcelain", "--", CAPTURES], {
    cwd: REPO,
    encoding: "utf8",
    shell: false,
  });
  if (status.status !== 0) {
    console.error("check-lane: git could not report the capture set — the release review is blind.");
    console.error(`  ${(status.stderr || status.error?.message || "").trim()}`);
    return 2;
  }
  const byteChanged = changedCaptures(status.stdout);
  const changed = contentChangedCaptures(
    status.stdout,
    readManifestFile(MANIFEST),
    readManifestAtHead()
  );
  const byteOnly = byteChanged.length - changed.length;
  if (byteOnly > 0) {
    console.log(`check-lane: ${byteOnly} capture(s) moved bytes but not pixelHash/layoutHash — not a review a release owes`);
  }
  const review = reviewVerdict(lane, changed);
  const emit = () => {
    for (const line of review.out) console.log(line);
    for (const line of review.err) console.error(line);
  };

  if (current === lane.baselineHash) {
    console.log(`check-lane: stylesheet unchanged since the lane was taken (${current})`);
    console.log(`check-lane: held by ${lane.holder}`);
    emit();
    return review.exit;
  }

  console.log(`check-lane: stylesheet has moved — ${lane.baselineHash} -> ${current}`);
  console.log(`check-lane: lane held by ${lane.holder}, acquired ${lane.acquiredAt}`);

  if (claimed && claimed === lane.holder) {
    console.log(`check-lane: SURFACE_PHASE=${claimed} holds the lane. Edit allowed.`);
    console.log("check-lane: update baselineHash and append to history when handing over.");
    emit();
    return review.exit;
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
  return 1;
}

// ───────────────────────────────────────────────────────────────────
// 5. ENTRY
// ───────────────────────────────────────────────────────────────────

// Guarded so the two decisions above can be imported and driven by a test with
// no repository state, the way the live probe's exit codes already are.
const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked) process.exit(main());
