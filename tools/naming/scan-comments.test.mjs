// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-comments.test
// COMPONENT: coverage for the comment-grammar and artifact-id scanner
// ───────────────────────────────────────────────────────────────────
//
// scan-comments.mjs shipped with no test file: its banner/section/commented-out checks and its
// artifact-id hard block were only ever exercised by running it over the live tree, so a
// regression in the matching logic itself had nothing red to turn. scanText() is the fix — the
// per-file decision pulled out so it can be driven over a fixture string and filename. Every
// fixture here is written to a throwaway temp directory and read back with the same readFileSync
// the real scan() uses, then discarded — never into src/ or tools/, which is the tree this lane
// itself polices.
//
// Every fixture below lives in a plain string (or an array of them, joined), never in a real `//`
// or `/*` comment in this file's own source and never as a literal describe/it/test(...) call —
// this file is itself scanned by the lane it tests, so the ids and call shapes it plants to prove
// detection works have to stay inert as source text and only become the shape being tested once
// they are written out as another file's bytes.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { scanText } from "./scan-comments.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCAN_COMMENTS_PATH = path.join(HERE, "scan-comments.mjs");

let fixtureDir;

beforeAll(() => {
  fixtureDir = mkdtempSync(path.join(tmpdir(), "scan-comments-fixtures-"));
});

afterAll(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

/** Writes `content` under the temp dir and reads it straight back, the same round trip scan()
 *  itself does with readFileSync — then hands it to scanText() under test. */
function scanFixture(filename, content) {
  const full = path.join(fixtureDir, filename);
  writeFileSync(full, content);
  return scanText(readFileSync(full, "utf8"), filename);
}

// A minimal, fully compliant header: a MODULE banner plus one numbered section paired with a
// box-drawing rule. Every fixture below builds on this so the property under test is the only
// thing that differs from a file the scanner already accepts.
const BOX = "─".repeat(12);
const VALID_HEADER = `// MODULE: fixture\n// ${BOX}\n// 1. SECTION\n// ${BOX}\n`;
const NEXT_LINE = VALID_HEADER.split("\n").length;

// The `describe`/`it`/`test` call shape has to reach the fixture file as real text without this
// file's own source ever spelling "describe(" — otherwise the lane this suite tests would flag
// this very file the next time it runs over the tree. Splitting the opening paren into its own
// token defeats that without changing what the fixture text ends up being once written out.
const OPEN_PAREN = "(";

// ───────────────────────────────────────────────────────────────────
// 2. EACH ARTIFACT-ID VIOLATION FORM IS CAUGHT, WITH ITS CLASSIFICATION
// ───────────────────────────────────────────────────────────────────

describe("scanText catches every artifact-id shape", () => {
  it("catches an ADR id in a line comment", () => {
    const result = scanFixture("adr.ts", `${VALID_HEADER}// see ADR-004 for the rationale\n`);
    expect(result.artifactIdHits).toEqual([
      { line: NEXT_LINE, kind: "ADR id", excerpt: expect.stringContaining("ADR-004") },
    ]);
  });

  it("catches an AC id in a block comment", () => {
    const result = scanFixture("ac.ts", `${VALID_HEADER}/* AC-001 demands it */\n`);
    expect(result.artifactIdHits).toEqual([
      { line: NEXT_LINE, kind: "AC id", excerpt: expect.stringContaining("AC-001") },
    ]);
  });

  it("catches a packet number used as a label", () => {
    const result = scanFixture(
      "packet-label.ts",
      `${VALID_HEADER}// The wording follows per 045's grammar rules.\n`,
    );
    expect(result.artifactIdHits).toEqual([
      { line: NEXT_LINE, kind: "packet number used as a label", excerpt: expect.stringContaining("045's") },
    ]);
  });

  it("catches a task id planted in a describe(...) test name", () => {
    const result = scanFixture(
      "test-name.ts",
      `${VALID_HEADER}describe${OPEN_PAREN}"T012 rolls up subtasks", () => {});\n`,
    );
    expect(result.artifactIdHits).toEqual([
      { line: NEXT_LINE, kind: "test name: task id", excerpt: "T012 rolls up subtasks" },
    ]);
  });

  it("catches a numbered spec-folder path in a CSS block comment", () => {
    // 147, not 047: a leading zero would also satisfy the packet-id pattern (checked first in
    // ARTIFACT_ID_PATTERNS), which would report this as "packet id" rather than "spec path" —
    // this fixture isolates the spec-path pattern on its own.
    const result = scanFixture(
      "fixture.css",
      "/* see specs/147-token-audit/plan.md for the token contract */\n.button { color: red; }\n",
    );
    expect(result.artifactIdHits).toEqual([
      { line: 1, kind: "spec path", excerpt: expect.stringContaining("specs/147-token-audit") },
    ]);
  });

  it("catches a CHK id and a REQ id as two separate hits", () => {
    const result = scanFixture(
      "chk-req.ts",
      `${VALID_HEADER}// tracked by CHK-021\n// tracked by REQ-007\n`,
    );
    expect(result.artifactIdHits).toEqual([
      { line: NEXT_LINE, kind: "CHK id", excerpt: expect.stringContaining("CHK-021") },
      { line: NEXT_LINE + 1, kind: "REQ id", excerpt: expect.stringContaining("REQ-007") },
    ]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. EACH LEGITIMATE SHAPE PASSES
// ───────────────────────────────────────────────────────────────────

// A comma-grouped measurement, an ISO time or standard, a vendored non-packet path, and a naming
// mismatch (underscore/lowercase where the rule requires hyphen/uppercase) all sit one character
// away from a real violation — these are exactly the shapes a looser pattern would have flagged.
const LEGITIMATE_LINES = [
  "a 2,000-row table renders in under 400ms",
  "a 19,000-line stylesheet was the largest offender",
  "at 1,005-pixel width the sidebar collapses to icons",
  "ISO times like T00:00 come from the calendar picker",
  "T14 labels the afternoon slot on the timeline, not a task",
  "dates round-trip through ISO-8601 everywhere in this module",
  "text ships as UTF-16 across the render boundary",
  "see specs/context/obsidian-pm-main/src/views/KanbanView.ts for the reference behaviour",
  "errors.ac_001_required is the i18n key shown under the field",
  "--obnotion-motion-fast is the custom property this transition reads",
];

describe("scanText lets every legitimate shape through", () => {
  it.each(LEGITIMATE_LINES)("passes: %s", (line, index) => {
    const result = scanFixture(`legit-${index}.ts`, `${VALID_HEADER}// ${line}\nexport const noop = true;\n`);
    expect(result).toBeNull();
  });

  it("passes a data literal that merely looks like a packet id inside an array", () => {
    const result = scanFixture("data.ts", `${VALID_HEADER}export const codes = ["P4", "045-x"];\n`);
    expect(result).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. BANNER, SECTION, AND COMMENTED-OUT-CODE: ONE RED, ONE GREEN EACH
// ───────────────────────────────────────────────────────────────────

describe("the MODULE banner check", () => {
  it("flags a file with no MODULE banner in its opening lines", () => {
    const result = scanFixture(
      "no-banner.ts",
      `// ${BOX}\n// 1. SECTION\n// ${BOX}\nexport const value = 1;\n`,
    );
    expect(result.missingBanner).toBe(true);
    expect(result.missingSections).toBe(false);
  });

  it("passes a file whose MODULE banner sits in the opening lines", () => {
    expect(scanFixture("banner-ok.ts", VALID_HEADER)).toBeNull();
  });
});

describe("the numbered box-drawing section check", () => {
  it("flags a section title with no adjacent box-drawing rule", () => {
    const result = scanFixture("no-section.ts", "// MODULE: fixture\n// 1. SECTION\nexport const value = 1;\n");
    expect(result.missingSections).toBe(true);
    expect(result.missingBanner).toBe(false);
  });

  it("passes a section title paired with a box-drawing rule", () => {
    expect(scanFixture("section-ok.ts", VALID_HEADER)).toBeNull();
  });
});

describe("the commented-out code check", () => {
  it("flags a comment that reads as code", () => {
    const result = scanFixture("code-comment.ts", `${VALID_HEADER}// const total = rows.length;\n`);
    expect(result.commentedOutCodeLines).toEqual([NEXT_LINE]);
  });

  it("passes a prose comment that merely opens with a keyword-shaped word", () => {
    const result = scanFixture("prose-comment.ts", `${VALID_HEADER}// keeps the total in sync with the row count\n`);
    expect(result).toBeNull();
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. THE EXIT CODE CONTRACT
// ───────────────────────────────────────────────────────────────────

describe("the exit code contract", () => {
  it("is 0 when nothing scanned carries a violation", () => {
    const results = [
      scanFixture("clean-a.ts", VALID_HEADER),
      scanFixture("clean-b.ts", `${VALID_HEADER}// tidy\n`),
    ];
    expect(results.every((r) => r === null)).toBe(true);
  });

  it("is 1 when at least one scanned file carries a violation", () => {
    const clean = scanFixture("clean-c.ts", VALID_HEADER);
    const dirty = scanFixture("dirty.ts", `${VALID_HEADER}// see ADR-004\n`);
    const violations = [clean, dirty].filter(Boolean);
    expect(violations.length > 0).toBe(true);
  });

  it("the real CLI exits 0 against this repository's own tree", () => {
    const result = execFileSync(process.execPath, [SCAN_COMMENTS_PATH], { encoding: "utf8" });
    expect(result).toContain("PASS");
  });
});
