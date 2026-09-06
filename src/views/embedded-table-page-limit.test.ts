// ───────────────────────────────────────────────────────────────────
// MODULE:    embedded-table-page-limit.test
// COMPONENT: the pure paging arithmetic behind an embedded table's "Load more" row
// ───────────────────────────────────────────────────────────────────
//
// resolveEmbeddedTablePage is the seam embedded-database-renderer.ts's DOM-touching table branch
// calls into; this drives it directly with plain arrays, never a rendered table, and separately
// pins the source shape of the two things a browser test cannot easily reach here: that the
// render branch actually calls it before painting, and that the "Load more" row it builds reads
// its colspan off the real header rather than a duplicated column count.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef --
   The source-contract check below reads this module's own text, which needs the node builtins
   the plugin runtime rule forbids. Scoped to this suite, which never ships. */
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import { resolveEmbeddedTablePage } from "./embedded-database-renderer";

const source = readFileSync(resolve(__dirname, "./embedded-database-renderer.ts"), "utf-8");

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("resolveEmbeddedTablePage", () => {
  const rows = Array.from({ length: 90 }, (_, index) => ({ index }));

  it("shows every row and owes nothing when the set fits inside the reveal count", () => {
    const page = resolveEmbeddedTablePage(rows.slice(0, 60), 60);
    expect(page.visibleRows).toHaveLength(60);
    expect(page.hasMore).toBe(false);
    expect(page.remaining).toBe(0);
  });

  it("pages to exactly the reveal count and reports what is left, past the default 60", () => {
    const page = resolveEmbeddedTablePage(rows, 60);
    expect(page.visibleRows).toHaveLength(60);
    expect(page.hasMore).toBe(true);
    expect(page.remaining).toBe(30);
  });

  it("reveals everything once the count has been raised past the row total", () => {
    const page = resolveEmbeddedTablePage(rows, 120);
    expect(page.visibleRows).toHaveLength(90);
    expect(page.hasMore).toBe(false);
    expect(page.remaining).toBe(0);
  });

  it("never mutates the row array it was handed", () => {
    const original = rows.slice();
    resolveEmbeddedTablePage(rows, 60);
    expect(rows).toEqual(original);
  });
});

describe("the embedded table's page limit is 60, our own number", () => {
  it("declares EMBEDDED_TABLE_PAGE_LIMIT as 60", () => {
    expect(source).toContain("const EMBEDDED_TABLE_PAGE_LIMIT = 60;");
  });

  it("the table render branch pages before painting and offers Load more only when rows remain", () => {
    const branchStart = source.indexOf("if (fields.length === 0) {");
    expect(branchStart).toBeGreaterThan(-1);
    const branchEnd = source.indexOf("} else {", branchStart);
    const body = source.slice(branchStart, branchEnd);

    expect(body).toContain("resolveEmbeddedTablePage(this.rows, this.getTableRevealCount())");
    expect(body).toContain("page.visibleRows");
    expect(body).toContain("if (page.hasMore) this.renderTableLoadMoreRow(target, config, page.remaining);");
  });

  it("the Load more row reads its colspan off the real header rather than a second column count", () => {
    const start = source.indexOf("private renderTableLoadMoreRow(");
    expect(start).toBeGreaterThan(-1);
    const end = source.indexOf("\n  private getGroupRelationDeletedEmptyState(", start);
    expect(end).toBeGreaterThan(start);
    const body = source.slice(start, end);

    expect(body).toContain('".db-table-wrap table.db-table thead tr"');
    expect(body).toContain("headerRow.children.length");
    // No virtualization mount is introduced by this row — the regression guard the packet's own
    // premise (a virtualization path being entered) already asked for stays satisfied.
    expect(source.toLowerCase()).not.toContain("virtualis");
  });
});
