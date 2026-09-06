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
// It also enforces comment hygiene's hard block: an ephemeral artifact label
// (a task id, an ADR/REQ/CHK/AC id, a packet number used as a label, or a
// spec-folder path) planted in a comment or a test name reads fine the day
// it is written and rots the day the id it points at is renamed, closed, or
// renumbered. The rule says keep the durable WHY instead, and until this
// lane existed nothing checked that comments actually did — the MODULE/
// section checks above scan grammar, not content, so a criterion id sitting
// in a comment left them green. A hard block with no enforcement is a
// suggestion, so this has no baseline: every hit is a violation and the
// count target is zero.
//
// Usage: node tools/naming/scan-comments.mjs [--json]
// Exit:  0 when every scanned file has a banner, paired numbered
//        sections, no commented-out code and no artifact-id violation;
//        1 otherwise.

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

// Comment hygiene's artifact-id block: each pattern is one shape an ephemeral
// pointer takes in this repo's own comments, drawn from the violations found
// authoring this check (a task id, an ADR/REQ/CHK/AC id, a packet number
// used as a label two different ways, and a numbered spec-folder path).
// `specs/context` is deliberately unmatched — it is a durable, non-packet
// path (a symlinked vendored-reference fixture, not a spec doc that rots),
// so the spec-path pattern requires the digit a real packet path starts with.
//
// The packet-id pattern refuses a preceding digit or comma because a
// comma-grouped measurement ends in the same three characters a packet id
// starts with: "a 2,000-row table" and "a 19,000-line stylesheet" both carry
// a literal `000-` followed by a lowercase word, and this repo's prose
// already writes both. Without the guard the lane would demand an author
// reword a legitimate number, which trains people to route around the check
// rather than to drop the ephemeral id it exists to catch.
const ARTIFACT_ID_PATTERNS = [
  { kind: "task id", re: /\bT\d{3}\b/ },
  { kind: "ADR id", re: /\bADR-\d+\b/ },
  { kind: "REQ id", re: /\bREQ-\d+\b/ },
  { kind: "CHK id", re: /\bCHK-\d+\b/ },
  { kind: "AC id", re: /\bAC-\d+\b/ },
  { kind: "packet id", re: /(?<![\d,])\b0\d{2}-[a-z][a-z0-9-]*\b/ },
  { kind: "packet number used as a label", re: /\b0\d{2}'s\b/ },
  { kind: "packet number used as a label", re: /\bper\s+0\d{2}\b/i },
  { kind: "spec path", re: /\bspecs\/\d{3}[a-z0-9-]*\b/i },
];

// A describe/it/test string literal is a name, and this repo's own harness
// has planted the same ids there that the rule forbids in a comment — a
// name rots exactly the way a comment does, and "test file headers" in the
// rule this check enforces means this call, not only the block comment atop
// the file.
const TEST_CALL_NAME =
  /\b(?:describe|it|test)(?:\.(?:only|skip|each|todo|concurrent))?\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*)\1/;

const STYLES_CSS_PATH = path.join(REPO_ROOT, "styles.css");

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

// The index of `needle` on `line`, skipping any occurrence inside a quoted
// string — a `//` inside a URL string or a `/*` inside a regex literal is
// not a comment opener, and treating it as one would corrupt every line
// after it for the rest of the file.
function findUnquotedIndex(line, needle) {
  let inStr = false;
  let quote = "";
  let escaping = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inStr) {
      if (escaping) escaping = false;
      else if (ch === "\\") escaping = true;
      else if (ch === quote) inStr = false;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") {
      inStr = true;
      quote = ch;
      continue;
    }
    if (line.startsWith(needle, i)) return i;
  }
  return -1;
}

// One line's worth of `//` or `/* */` text, tracked across lines so a block
// comment's second and later lines are still checked — the artifact-id
// violations found authoring this check included prose that reads across
// several `//` lines, so a single-line-only extractor would have missed
// the ones that only appear mid-paragraph.
function extractJsCommentSpans(lines) {
  const spans = [];
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (inBlock) {
      const end = line.indexOf("*/");
      if (end === -1) {
        spans.push({ line: i + 1, text: line });
        continue;
      }
      spans.push({ line: i + 1, text: line.slice(0, end) });
      inBlock = false;
      continue;
    }
    const slashSlash = findUnquotedIndex(line, "//");
    const slashStar = findUnquotedIndex(line, "/*");
    if (slashSlash !== -1 && (slashStar === -1 || slashSlash < slashStar)) {
      spans.push({ line: i + 1, text: line.slice(slashSlash) });
      continue;
    }
    if (slashStar !== -1) {
      const end = line.indexOf("*/", slashStar + 2);
      if (end === -1) {
        spans.push({ line: i + 1, text: line.slice(slashStar) });
        inBlock = true;
        continue;
      }
      spans.push({ line: i + 1, text: line.slice(slashStar, end) });
    }
  }
  return spans;
}

// CSS carries only the block form, and a rule's comment can span many
// lines, so this walks the raw text once rather than re-deciding per line
// whether an unterminated block is still open.
function extractCssCommentSpans(text) {
  const spans = [];
  let i = 0;
  let line = 1;
  while (i < text.length) {
    if (text[i] === "\n") {
      line += 1;
      i += 1;
      continue;
    }
    if (text.startsWith("/*", i)) {
      const startLine = line;
      const end = text.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? text.length : end + 2;
      const commentText = text.slice(i, commentEnd);
      spans.push({ line: startLine, text: commentText });
      for (const ch of commentText) if (ch === "\n") line += 1;
      i = commentEnd;
      continue;
    }
    i += 1;
  }
  return spans;
}

function matchArtifactId(text) {
  for (const pattern of ARTIFACT_ID_PATTERNS) {
    if (pattern.re.test(text)) return pattern.kind;
  }
  return null;
}

function findArtifactIdViolations(spans) {
  const hits = [];
  for (const span of spans) {
    const kind = matchArtifactId(span.text);
    if (kind) hits.push({ line: span.line, kind, excerpt: span.text.trim().slice(0, 160) });
  }
  return hits;
}

// A describe/it/test name is checked on the raw line, not the comment
// spans — it is a string literal, not a comment, and the two extractors
// disagree on purpose about what counts as text worth reading.
function findTestNameViolations(lines) {
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const match = TEST_CALL_NAME.exec(lines[i]);
    if (!match) continue;
    const name = match[2];
    const kind = matchArtifactId(name);
    if (kind) hits.push({ line: i + 1, kind: `test name: ${kind}`, excerpt: name.slice(0, 160) });
  }
  return hits;
}

// ───────────────────────────────────────────────────────────────────
// 4. SCAN
// ───────────────────────────────────────────────────────────────────

// The per-file decision, pulled out on its own so a test can drive it over a
// fixture string and filename without touching the real tree — everything
// above this point is pure text-in, verdict-out, and this is the one place
// that combines it into the shape scan() and the CLI report both consume.
// Returns null for a clean file so a caller can tell "nothing to report"
// apart from "reported, but every list happens to be empty".
export function scanText(text, filename) {
  const isCss = path.extname(filename) === ".css";
  const artifactHits = isCss
    ? findArtifactIdViolations(extractCssCommentSpans(text))
    : [
        ...findArtifactIdViolations(extractJsCommentSpans(text.split("\n"))),
        ...findTestNameViolations(text.split("\n")),
      ];

  if (isCss) {
    if (artifactHits.length === 0) return null;
    return { file: filename, missingBanner: false, missingSections: false, commentedOutCodeLines: [], artifactIdHits: artifactHits };
  }

  const lines = text.split("\n");
  const bannerOk = hasModuleBanner(lines);
  const sectionsOk = hasPairedSection(lines);
  const codeHits = findCommentedOutCode(lines);

  if (bannerOk && sectionsOk && codeHits.length === 0 && artifactHits.length === 0) return null;

  return {
    file: filename,
    missingBanner: !bannerOk,
    missingSections: !sectionsOk,
    commentedOutCodeLines: codeHits,
    artifactIdHits: artifactHits,
  };
}

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
  let artifactIdHits = 0;
  const violations = [];

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const rel = path.relative(REPO_ROOT, file);
    const result = scanText(text, rel);
    if (!result) continue;

    if (result.missingBanner) missingBanner++;
    if (result.missingSections) missingSections++;
    commentedOutCodeLines += result.commentedOutCodeLines.length;
    artifactIdHits += result.artifactIdHits.length;
    violations.push(result);
  }

  // styles.css is not under either SCAN_ROOT and carries no MODULE banner or
  // box-drawing sections — it is a stylesheet, not a script — so only the
  // artifact-id check applies to it, folded into the same violation list
  // rather than a second lane, per the rule this check enforces naming one
  // lane for comments.
  let scanned = files.length;
  try {
    const cssText = readFileSync(STYLES_CSS_PATH, "utf8");
    scanned += 1;
    const cssRel = path.relative(REPO_ROOT, STYLES_CSS_PATH);
    const cssResult = scanText(cssText, cssRel);
    if (cssResult) {
      artifactIdHits += cssResult.artifactIdHits.length;
      violations.push(cssResult);
    }
  } catch {
    // styles.css always exists in this repo; a missing file is a different
    // problem than this scanner reports on, so it is silently left unscanned
    // rather than failing this check for a reason unrelated to comments.
  }

  return { scanned, missingBanner, missingSections, commentedOutCodeLines, artifactIdHits, violations };
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
    console.log(`scan-comments: ${result.scanned} files scanned under ${SCAN_ROOTS.join(", ")}, styles.css`);
    console.log(`scan-comments: missing MODULE banner: ${result.missingBanner}`);
    console.log(`scan-comments: missing numbered box-drawing sections: ${result.missingSections}`);
    console.log(`scan-comments: commented-out code lines: ${result.commentedOutCodeLines}`);
    console.log(`scan-comments: artifact-id violations: ${result.artifactIdHits}`);
    for (const v of result.violations) {
      for (const hit of v.artifactIdHits ?? []) {
        console.log(`  ${v.file}:${hit.line}: [${hit.kind}] ${hit.excerpt}`);
      }
    }
    if (result.violations.length === 0) {
      console.log("scan-comments: PASS — every file carries the comment grammar and no artifact id");
    } else {
      console.log(`scan-comments: ${result.violations.length} file(s) with a violation`);
    }
  }

  process.exit(result.violations.length === 0 ? 0 : 1);
}

// Guarded so scanText() is importable for tests without triggering this CLI's own process.exit().
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main();
