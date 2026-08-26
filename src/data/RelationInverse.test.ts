import { describe, expect, it } from "vitest";
import type { App } from "obsidian";
import {
  buildRelationInverse,
  mergeRelationInverseMembership,
  SYNC_WRITES_DEFAULT,
  type RelationInverseContext,
} from "./RelationInverse";
import type { NoteRecord } from "./DataSource";
import type { ColumnDef, DatabaseConfig } from "./types";

const relationColumn = (key: string, targetDatabaseId: string): ColumnDef => ({
  key,
  label: key,
  type: "relation",
  relationConfig: { targetDatabaseId },
});

const textColumn = (key: string): ColumnDef => ({ key, label: key, type: "text" });

const database = (id: string, columns: ColumnDef[]): DatabaseConfig => ({
  id,
  name: id,
  sourceFolder: "",
  schema: { columns, computedFields: [] },
  views: [],
});

const record = (path: string, frontmatter: Record<string, unknown> = {}): NoteRecord => ({
  file: { path } as NoteRecord["file"],
  frontmatter,
});

function contextFor(
  databases: DatabaseConfig[],
  recordsByDatabase: Map<string, NoteRecord[]>,
  destinations: Map<string, string | null>,
): RelationInverseContext {
  return {
    app: {
      metadataCache: {
        getFirstLinkpathDest: (target: string) => {
          const path = destinations.get(target);
          return path ? ({ path } as NoteRecord["file"]) : null;
        },
      },
    } as unknown as App,
    databases,
    getRecordsForDatabase: (sourceDatabase) => recordsByDatabase.get(sourceDatabase.id) || [],
  };
}

function inboundPaths(
  context: RelationInverseContext,
  targetPath: string,
): string[] {
  return (buildRelationInverse(context).inboundByPath.get(targetPath) || [])
    .map((edge) => edge.sourceRecord.file.path);
}

describe("buildRelationInverse", () => {
  it("returns empty inbound data when the stored relation is empty", () => {
    const reports = database("reports", [textColumn("Title")]);
    const expenses = database("expenses", [relationColumn("Month", reports.id)]);
    const report = record("Reports/January.md");
    const expense = record("Expenses/Coffee.md", { Month: undefined });
    const result = buildRelationInverse(contextFor(
      [expenses, reports],
      new Map([[expenses.id, [expense]], [reports.id, [report]]]),
      new Map(),
    ));

    expect(result.inboundByPath.size).toBe(0);
    expect(result.inboundByPath.get(report.file.path) || []).toEqual([]);
    expect(result.sourcePaths).toEqual(new Set());
    expect(result.sourceDatabaseIds).toEqual(new Set());
  });

  it("keeps a cardinality-one inverse as a list", () => {
    const reports = database("reports", [textColumn("Title")]);
    const expenses = database("expenses", [relationColumn("Month", reports.id)]);
    const report = record("Reports/January.md");
    const expense = record("Expenses/Coffee.md", { Month: "[[Reports/January]]" });
    const result = buildRelationInverse(contextFor(
      [expenses, reports],
      new Map([[expenses.id, [expense]], [reports.id, [report]]]),
      new Map([["Reports/January", report.file.path]]),
    ));
    const inbound = result.inboundByPath.get(report.file.path);

    expect(Array.isArray(inbound)).toBe(true);
    expect(inbound).toHaveLength(1);
    expect(inbound?.[0].sourceRecord.file.path).toBe(expense.file.path);
  });

  it("unions many source records targeting one record", () => {
    const reports = database("reports", [textColumn("Title")]);
    const expenses = database("expenses", [relationColumn("Month", reports.id)]);
    const report = record("Reports/January.md");
    const first = record("Expenses/Coffee.md", { Month: "[[Reports/January]]" });
    const second = record("Expenses/Train.md", { Month: ["[[Reports/January]]"] });
    const context = contextFor(
      [expenses, reports],
      new Map([[expenses.id, [first, second]], [reports.id, [report]]]),
      new Map([["Reports/January", report.file.path]]),
    );

    expect(inboundPaths(context, report.file.path)).toEqual([
      first.file.path,
      second.file.path,
    ]);
  });

  it("skips dangling and cross-database targets", () => {
    const reports = database("reports", [textColumn("Title")]);
    const otherDatabase = database("other", [textColumn("Title")]);
    const expenses = database("expenses", [relationColumn("Month", reports.id)]);
    const report = record("Reports/January.md");
    const expense = record("Expenses/Coffee.md", {
      Month: ["[[Missing Report]]", "[[Other/January]]"],
    });
    const otherRecord = record("Other/January.md");
    const result = buildRelationInverse(contextFor(
      [expenses, reports, otherDatabase],
      new Map([
        [expenses.id, [expense]],
        [reports.id, [report]],
        [otherDatabase.id, [otherRecord]],
      ]),
      new Map([
        ["Missing Report", null],
        ["Other/January", otherRecord.file.path],
      ]),
    ));

    expect(result.inboundByPath.size).toBe(0);
    expect(result.sourcePaths).toEqual(new Set());
    expect(result.sourceDatabaseIds).toEqual(new Set());
  });

  it("fans in valid edges from multiple source databases", () => {
    const reports = database("reports", [textColumn("Title")]);
    const expenses = database("expenses", [relationColumn("Month", reports.id)]);
    const reimbursements = database("reimbursements", [relationColumn("Month", reports.id)]);
    const report = record("Reports/January.md");
    const expense = record("Expenses/Coffee.md", { Month: "[[Reports/January]]" });
    const reimbursement = record("Reimbursements/Train.md", { Month: "[[Reports/January]]" });
    const result = buildRelationInverse(contextFor(
      [expenses, reimbursements, reports],
      new Map([
        [expenses.id, [expense]],
        [reimbursements.id, [reimbursement]],
        [reports.id, [report]],
      ]),
      new Map([["Reports/January", report.file.path]]),
    ));

    expect(result.inboundByPath.get(report.file.path)).toHaveLength(2);
    expect(result.sourceDatabaseIds).toEqual(new Set([expenses.id, reimbursements.id]));
    expect(result.sourcePaths).toEqual(new Set([expense.file.path, reimbursement.file.path]));
  });

  it("deduplicates a self-relation without recursively expanding it", () => {
    const pages = database("pages", [relationColumn("Related", "pages")]);
    const pageA = record("Pages/A.md", {
      Related: ["[[Pages/B]]", "[[Pages/B#section|B]]"],
    });
    const pageB = record("Pages/B.md");
    const result = buildRelationInverse(contextFor(
      [pages],
      new Map([[pages.id, [pageA, pageB]]]),
      new Map([["Pages/B", pageB.file.path]]),
    ));

    expect(result.inboundByPath.get(pageB.file.path)).toHaveLength(1);
    expect(result.inboundByPath.has(pageA.file.path)).toBe(false);
  });

  it("strips aliases and subpaths before resolving", () => {
    const reports = database("reports", [textColumn("Title")]);
    const expenses = database("expenses", [relationColumn("Month", reports.id)]);
    const report = record("Reports/January.md");
    const expense = record("Expenses/Coffee.md", {
      Month: "[[Reports/January#Q1|January]]",
    });
    const result = buildRelationInverse(contextFor(
      [expenses, reports],
      new Map([[expenses.id, [expense]], [reports.id, [report]]]),
      new Map([["Reports/January", report.file.path]]),
    ));

    expect(result.inboundByPath.get(report.file.path)).toHaveLength(1);
  });
});

describe("inverse membership", () => {
  it("merges source paths and database ids into existing sets", () => {
    const reports = database("reports", [textColumn("Title")]);
    const expenses = database("expenses", [relationColumn("Month", reports.id)]);
    const report = record("Reports/January.md");
    const expense = record("Expenses/Coffee.md", { Month: "[[Reports/January]]" });
    const result = buildRelationInverse(contextFor(
      [expenses, reports],
      new Map([[expenses.id, [expense]], [reports.id, [report]]]),
      new Map([["Reports/January", report.file.path]]),
    ));
    const targetPaths = new Set(["Existing.md"]);
    const targetDatabaseIds = new Set(["existing"]);

    mergeRelationInverseMembership(result, targetPaths, targetDatabaseIds);
    mergeRelationInverseMembership(result, targetPaths, targetDatabaseIds);

    expect(targetPaths).toEqual(new Set(["Existing.md", expense.file.path]));
    expect(targetDatabaseIds).toEqual(new Set(["existing", expenses.id]));
  });
});

it("keeps inverse writes disabled by default", () => {
  expect(SYNC_WRITES_DEFAULT).toBe(false);
});
