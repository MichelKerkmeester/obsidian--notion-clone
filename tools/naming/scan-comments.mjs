#!/usr/bin/env node
// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-comments
// COMPONENT: sk-code-obsidian source-gate — comment grammar scanner
// ───────────────────────────────────────────────────────────────────
//
// Reports every file under src/ and tools/ missing a `MODULE:` banner or
// numbered upper-case box-drawing section rules, plus any commented-out
// code found along the way. When this scanner was written 0 of 249 files
// carried a MODULE banner and only a handful carried a box-drawing rule at
// all — it exists so that count stops being a hand audit and starts being a
// re-runnable gate.
//
// Usage: node tools/naming/scan-comments.mjs [--json]
// Exit:  0 when every scanned file has a banner, paired numbered
//        sections and no commented-out code; 1 otherwise.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ───────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ───────────────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCAN_ROOTS = ["src", "tools"];
const SOURCE_EXTENSIONS = new Set([".ts", ".mjs", ".js"]);
// `dist` holds generated build output. The comment grammar is a source-authoring standard, so
// scanning emitted bundles reports violations nobody can fix in the file that has them.
const SKIP_DIR_NAMES = new Set(["node_modules", ".git", "dist"]);

// A MODULE banner is a `//` line comment naming the module, checked in the
// first BANNER_WINDOW lines so it reads as the file's opening, not a
// mid-file coincidence.
const BANNER_WINDOW = 15;
const MODULE_BANNER = /^\/\/\s*MODULE:\s*\S+/;

// A numbered section rule pairs a box-drawing divider (either the unicode
// box-drawing horizontal glyph or a long run of ASCII dashes inside a line
// comment) with an adjacent numbered, upper-case section title.
const BOX_DRAWING_LINE = /^\/\/\s*([─-╿]{8,}|-{8,})\s*$/;
const SECTION_TITLE = /^\/\/\s*\d+[.)]\s+[A-Z0-9][A-Z0-9 /&'-]*$/;

// Commented-out code: a `//` line whose content reads as code rather than
// prose — a statement keyword, an assignment/call ending in punctuation, or
// an arrow function. Natural-language purpose comments do not take this
// shape, so this heuristic reports the same signal a human skim would.
// A keyword alone is not enough — "type icon" and "return/typeof/else 是..."
// are prose, not code. Require the line also carry code punctuation
// (`(){};=`) so an English or CJK sentence that merely opens with a
// keyword-shaped word does not trip the heuristic.
const CODE_KEYWORD_START =
  /^(const|let|var|function|class|interface|type|enum|import|export|return|if|else|for|while|switch|case|catch|try|throw|await|async|new|super|break|continue)\b.*[(){};=]/;
const CODE_TAIL = /[;{}]\s*$/;
const CODE_OPERATOR = /=>|[^=!<>]=[^=]|\+\+|--/;

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function hasModuleBanner(lines) {
  return lines.slice(0, BANNER_WINDOW).some((line) => MODULE_BANNER.test(line.trim()));
}

function hasPairedSection(lines) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!SECTION_TITLE.test(line)) continue;
    const above = (lines[i - 1] ?? "").trim();
    const below = (lines[i + 1] ?? "").trim();
    if (BOX_DRAWING_LINE.test(above) || BOX_DRAWING_LINE.test(below)) return true;
  }
  return false;
}

function looksLikeCode(commentText) {
  const t = commentText.trim();
  if (!t) return false;
  if (CODE_KEYWORD_START.test(t)) return true;
  if (CODE_TAIL.test(t) && CODE_OPERATOR.test(t)) return true;
  if (CODE_OPERATOR.test(t) && CODE_TAIL.test(t)) return true;
  return false;
}

function findCommentedOutCode(lines) {
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("//")) continue;
    if (MODULE_BANNER.test(line) || SECTION_TITLE.test(line) || BOX_DRAWING_LINE.test(line)) continue;
    const content = line.replace(/^\/\/+/, "");
    if (looksLikeCode(content)) hits.push(i + 1);
  }
  return hits;
}

// ───────────────────────────────────────────────────────────────────
// 4. SCAN
// ───────────────────────────────────────────────────────────────────

function scan() {
  const files = [];
  for (const root of SCAN_ROOTS) {
    const abs = path.join(REPO_ROOT, root);
    try {
      statSync(abs);
    } catch {
      continue;
    }
    walk(abs, files);
  }

  let missingBanner = 0;
  let missingSections = 0;
  let commentedOutCodeLines = 0;
  const violations = [];

  for (const file of files) {
    const lines = readFileSync(file, "utf8").split("\n");
    const rel = path.relative(REPO_ROOT, file);

    const bannerOk = hasModuleBanner(lines);
    const sectionsOk = hasPairedSection(lines);
    const codeHits = findCommentedOutCode(lines);

    if (!bannerOk) missingBanner++;
    if (!sectionsOk) missingSections++;
    commentedOutCodeLines += codeHits.length;

    if (!bannerOk || !sectionsOk || codeHits.length > 0) {
      violations.push({
        file: rel,
        missingBanner: !bannerOk,
        missingSections: !sectionsOk,
        commentedOutCodeLines: codeHits,
      });
    }
  }

  return { scanned: files.length, missingBanner, missingSections, commentedOutCodeLines, violations };
}

// ───────────────────────────────────────────────────────────────────
// 5. REPORT
// ───────────────────────────────────────────────────────────────────

function main() {
  const asJson = process.argv.includes("--json");
  const result = scan();

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`scan-comments: ${result.scanned} files scanned under ${SCAN_ROOTS.join(", ")}`);
    console.log(`scan-comments: missing MODULE banner: ${result.missingBanner}`);
    console.log(`scan-comments: missing numbered box-drawing sections: ${result.missingSections}`);
    console.log(`scan-comments: commented-out code lines: ${result.commentedOutCodeLines}`);
    if (result.violations.length === 0) {
      console.log("scan-comments: PASS — every file carries the comment grammar");
    } else {
      console.log(`scan-comments: ${result.violations.length} file(s) with a violation`);
    }
  }

  process.exit(result.violations.length === 0 ? 0 : 1);
}

main();
