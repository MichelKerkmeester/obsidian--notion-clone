// ───────────────────────────────────────────────────────────────────
// MODULE:    scan-deprecated-views.test
// COMPONENT: coverage for the retired-view mention scanner
// ───────────────────────────────────────────────────────────────────
//
// The scanner's real proof is a red-then-green pair against the trees this
// work touched: the committed copy failed it before the docs strip and passes
// after. What that run cannot prove is the matching logic itself — the note
// exemption's section boundary, the manifest's noteless rule, or the pointer
// check behaving when the note is missing. Those live here, driven through
// scanText() over fixture strings, with the CLI's own exit contract exercised
// against this repository's tree the way its sibling scanner's suite does.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { noteLineIndexes, scanText } from "./scan-deprecated-views.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCANNER_PATH = path.join(HERE, "scan-deprecated-views.mjs");

// A four-line copy whose only mention sits under the note heading, and one
// whose mention sits in the prose above it — the two shapes the rule treats
// differently.
const NOTE_HEADING_LINE = "## Deprecated views";
const NOTE_SECTION = [
  NOTE_HEADING_LINE,
  "",
  "The retired calendar, timeline, chart, and gallery surfaces' code is archived; see",
  "archive/deprecated-views/README.md for the restore procedure.",
  "",
].join("\n");
const VIEW_BULLET = "- **Table** — editable cells, column resize and reorder.\n";
const TIMELINE_PROSE = "Timeline boards plot records against a date property.\n";

// ───────────────────────────────────────────────────────────────────
// 2. THE NOTE EXEMPTION AND ITS SECTION BOUNDARY
// ───────────────────────────────────────────────────────────────────

describe("noteLineIndexes", () => {
  it("exempts the note's lines and stops at the next heading", () => {
    const lines = [NOTE_HEADING_LINE, "archived mentions live here", "## Views", "a counted line".replace("a counted", "Timeline")];
    const exempt = noteLineIndexes(lines);
    expect(exempt.has(1)).toBe(true);
    expect(exempt.has(3)).toBe(false);
  });

  it("exempts nothing when the copy carries no note", () => {
    const exempt = noteLineIndexes(["plain prose", "more plain prose"]);
    expect(exempt.size).toBe(0);
  });
});

describe("scanText over a readme-shaped copy", () => {
  it("counts a mention outside the note as a violation, and spares the note's own", () => {
    const result = scanText(TIMELINE_PROSE + VIEW_BULLET + NOTE_SECTION, "README.md");
    expect(result.counts.enforced).toBe(1);
    expect(result.counts.exempted).toBe(4);
    expect(result.note).toEqual({ present: true, referencesArchive: true });
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain("1 retired-view mention(s) outside the note");
  });

  it("spares the note's own mentions when nothing else names them", () => {
    const result = scanText(VIEW_BULLET + NOTE_SECTION + "## Releases\n\nevery milestone ships.\n", "README.md");
    expect(result.counts.enforced).toBe(0);
    expect(result.counts.exempted).toBe(4);
    expect(result.note).toEqual({ present: true, referencesArchive: true });
    expect(result.violations).toHaveLength(0);
  });

  it("a mention after the note's section counts again", () => {
    const text = NOTE_SECTION + "## Releases\n\nThe old release notes name the retired timeline.\n";
    const result = scanText(text, "README.md");
    expect(result.counts.enforced).toBe(1);
    expect(result.counts.exempted).toBe(4);
  });

  it("a noteless copy violates twice: its mention counted and its missing note demanded", () => {
    const result = scanText(TIMELINE_PROSE + VIEW_BULLET, "README.md");
    expect(result.counts.enforced).toBe(1);
    expect(result.note).toEqual({ present: false, referencesArchive: false });
    expect(result.violations).toHaveLength(2);
    expect(result.violations[0]).toContain("mention(s) outside the note");
    expect(result.violations[1]).toContain("no \"## Deprecated views\" note");
  });

  it("a note that never points at the archive violates the pointer rule", () => {
    const orphanNote = NOTE_HEADING_LINE + "\n\nThe retired surfaces are gone.\n";
    const result = scanText(VIEW_BULLET + orphanNote, "README.md");
    expect(result.note).toEqual({ present: true, referencesArchive: false });
    expect(result.violations.some((v) => v.includes("does not point at"))).toBe(true);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE COMMUNITY-PLUGIN DESCRIPTION HAS NO NOTE TO HIDE BEHIND
// ───────────────────────────────────────────────────────────────────

describe("scanText over the manifest's description field", () => {
  it("counts every mention, note or no note", () => {
    const withMention = '{"description": "database views with table, board, timeline and formulas"}';
    const result = scanText(withMention, "manifest.json");
    expect(result.counts.enforced).toBe(1);
    expect(result.note).toBeNull();
    expect(result.violations).toHaveLength(1);
  });

  it("a description naming only shipped surfaces passes", () => {
    const clean = '{"description": "database views with table, board, formulas, and inline editing"}';
    const result = scanText(clean, "manifest.json");
    expect(result.counts.enforced).toBe(0);
    expect(result.violations).toHaveLength(0);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3b. THE NPM-LISTING DESCRIPTION: PROSE ONLY, IDENTIFIERS ARE NOT COPY
// ───────────────────────────────────────────────────────────────────

describe("scanText over the package's description field", () => {
  it("counts a retired-view mention inside the description", () => {
    const withMention = '{"description": "table, board, list, chart, calendar, timeline, inline markdown"}';
    const result = scanText(withMention, "package.json");
    expect(result.counts.enforced).toBe(3);
    expect(result.note).toBeNull();
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]).toContain("3 retired-view mention(s)");
  });

  it("judges the description field alone: shipped dependencies and keywords are identifiers, not copy", () => {
    const clean = JSON.stringify({
      description: "Database views for notes with table, board, inline markdown, formulas, and source rules.",
      keywords: ["obsidian", "plugin", "database", "table", "kanban", "list", "frontmatter"],
      dependencies: { "chart.js": "^4.5.1" },
    });
    const result = scanText(clean, "package.json");
    expect(result.counts.enforced).toBe(0);
    expect(result.violations).toHaveLength(0);
  });

  it("violates when no description field exists at all", () => {
    const result = scanText('{"name": "obsidian-obnotion"}', "package.json");
    expect(result.violations).toEqual(["package.json: no description field to scan"]);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE EXIT CODE CONTRACT
// ───────────────────────────────────────────────────────────────────

describe("the exit code contract", () => {
  it("the real CLI passes against this repository's own tree", () => {
    const result = execFileSync(process.execPath, [SCANNER_PATH], { encoding: "utf8" });
    expect(result).toContain("PASS");
  });
});
