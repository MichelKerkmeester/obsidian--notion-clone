// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-inventory test
// COMPONENT: keeps the coverage inventory honest
// ───────────────────────────────────────────────────────────────────
//
// The inventory is the sheet-coverage gate: a later phase claims a surface is
// covered only when a row here names it. A table nobody re-derives goes stale
// in one sprint, so these tests re-derive it and pin it from directions the
// generator does not control:
//
//   - the modal producer classes are counted again by grep, not by the
//     generator's own scanner, so a scanner that stops seeing a class fails;
//   - every producer `file:line` is opened and read, so a moved declaration
//     fails the row, not quietly;
//   - every reference directory a row cites is stated to exist on disk, and
//     every capture id is checked against the manifest itself;
//   - the committed document must equal what the registries produce now, so
//     editing a registry without regenerating the inventory is a red test.
//
// Usage: npx vitest run tools/storybook/sheet-inventory.test.mjs

// ───────────────────────────────────────────────────────────────────
// 1. THE PINNED DERIVATION
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildInventory, regenerate, spliceAnchors } from "./sheet-inventory.mjs";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const INVENTORY = "specs/005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit/inventory.md";

describe("sheet-inventory", () => {
  const { primaryRows, stackedRows, counts } = buildInventory();
  const allRows = [...primaryRows, ...stackedRows];
  const byKey = (key) => primaryRows.find((r) => r.key === key);

  it("carries every grammar registry row", () => {
    expect(counts.registered).toBe(17);
    expect(counts.stackedPairs).toBe(32);
    expect(counts.overflowOnly).toBe(11);
  });

  it("re-counts the modal producer classes by grep, independently of the generator's own scanner", () => {
    const grep = (pattern) =>
      execFileSync("grep", ["-rEn", "--include=*.ts", pattern, "src"], { cwd: REPO, encoding: "utf8" })
        .split("\n").filter((l) => l.trim()).length;
    // 19 DbModal subclasses + 3 FuzzySuggestModal = 22 named; the anonymous
    // trash-restore modal in settings.ts adds one unnamed producer.
    expect(grep("class \\w+ extends DbModal")).toBe(19);
    expect(grep("class \\w+ extends FuzzySuggestModal")).toBe(3);
    // 22 named, of which 5 wear a registry row (confirm, the three suggest
    // rows, the create-property row) — 17 unfolded + 1 unnamed = 18 rows.
    const unfoldedModalKeys = [
      "InvalidTimeEventsModal", "CsvMarkdownExportModal", "StatusPresetManagerModal",
      "StatusOptionsModal", "CreateRecordIconFieldModal", "RelationRollupConfigModal",
      "FormulaModal", "BaseImportConfirmModal", "PropertyTypeConflictModal",
      "ColumnRenameModal", "AddDatabaseModal", "DeleteDatabaseModal",
      "CreateLinkedViewModal", "ComputedFrontmatterCleanupModal", "csv-markdown-import",
      "TrashManagerModal", "chart-drilldown", "trash-restore",
    ];
    const modalRowKeys = unfoldedModalKeys.filter((key) => byKey(key));
    expect(modalRowKeys).toHaveLength(18);
    for (const key of unfoldedModalKeys) expect(byKey(key), `${key} has no row`).toBeTruthy();
    expect(byKey("trash-restore")).toBeTruthy();
    // And the 5 folded producers really are wearing registry rows.
    for (const key of ["confirm", "base-file-suggest", "image-file-suggest", "markdown-file-suggest", "add-property"]) {
      expect(byKey(key), `${key} folded row missing`).toBeTruthy();
    }
  });

  it("resolves every producer to a line that still exists in that file", () => {
    for (const row of primaryRows) {
      expect(row.producer, row.title).toMatch(/\.[t]s:\d+$/);
      const [file, lineStr] = row.producer.split(":");
      const lines = readFileSync(join(REPO, file), "utf8").split("\n");
      expect(lines.length, `${file} shorter than its cited line`).toBeGreaterThanOrEqual(Number(lineStr));
      expect(lines[Number(lineStr) - 1].trim(), `${file}:${lineStr} resolves to a blank line`).not.toBe("");
    }
  });

  it("pins the story-coverage census the inventory is written against", () => {
    expect(counts.coverageStories).toBe(19);
    expect(counts.coverageExempt).toBe(21);
    expect(counts.coverageRenderable).toBe(40);
  });

  it("gates the two rows the alignment work starts from", () => {
    expect(primaryRows[0].key).toBe("settings");
    expect(primaryRows[1].key).toBe("add-property");
    expect(byKey("add-property").captures).toEqual(
      expect.arrayContaining([expect.stringMatching(/property-type/)]),
    );
  });

  it("leaves no row without a stated coverage state, captures column and reference mapping", () => {
    for (const row of primaryRows) {
      for (const cell of [row.title, row.producer, row.presentation, row.story]) {
        expect(cell, `${row.title}: blank cell`).toBeTruthy();
      }
      expect(row.captures, `${row.title}: captures undecided`).not.toBeUndefined();
      expect(row.refs, `${row.title}: references undecided`).not.toBeUndefined();
      expect(row.gap, `${row.title}: no gap note`).toBeTruthy();
    }
  });

  it("checks every capture id against the screenshot manifest itself", () => {
    const manifest = JSON.parse(readFileSync(join(REPO, "screenshots/manifest.json"), "utf8"));
    const ids = new Set(manifest.scenarios.map((s) => s.id));
    const cited = [];
    for (const row of primaryRows) cited.push(...row.captures);
    for (const id of cited) expect(ids.has(id), `${id} cited but not in the manifest`).toBe(true);
    // The surfaces the alignment work reads first must carry captures.
    for (const key of ["settings", "add-property", "sort-panel", "filter-panel", "record-detail", "owned-menu", "toast"]) {
      expect(byKey(key).captures.length, `${key} has no capture`).toBeGreaterThan(0);
    }
    expect(counts.withCaptures).toBe(allRows.filter((r) => Array.isArray(r.captures) && r.captures.length > 0).length);
  });

  it("checks every cited reference directory against the reference trees", () => {
    for (const row of primaryRows) {
      for (const side of ["notion", "anytype"]) {
        for (const entry of (row.refs && row.refs[side]) || []) {
          const dir = join(REPO, "screenshots", entry.root, entry.dir);
          expect(statSync(dir).isDirectory(), `${dir} cited but missing`).toBe(true);
          const files = readdirSync(dir).filter((f) => /\.(png|webp|jpg|jpeg)$/.test(f) && entry.re.test(f));
          expect(files.length, `${dir}: row cites a family the directory does not carry`).toBeGreaterThan(0);
        }
      }
    }
    // A recorded absence must be spelled "none", not a quietly empty cell.
    const noneNotion = allRows.filter((r) => !r.refs || r.refs.notion.length === 0);
    const noneBoth = allRows.filter(
      (r) => (!r.refs || (r.refs.notion.length === 0 && r.refs.anytype.length === 0)),
    );
    expect(noneBoth.length).toBeGreaterThan(0);
    expect(counts.withoutReference).toBe(noneBoth.length);
    expect(counts.withNotion).toBe(allRows.filter((r) => r.refs && r.refs.notion.length > 0).length);
    expect(counts.withAnytype).toBe(allRows.filter((r) => r.refs && r.refs.anytype.length > 0).length);
    expect(noneNotion.length).toBeGreaterThanOrEqual(noneBoth.length);
  });

  it("keeps the committed document identical to what the registries produce now", () => {
    const { rowsMarkdown, summaryMarkdown } = regenerate();
    const doc = readFileSync(join(REPO, INVENTORY), "utf8");
    expect(spliceAnchors(spliceAnchors(doc, "rows", rowsMarkdown), "summary", summaryMarkdown)).toBe(doc);
  });
});
