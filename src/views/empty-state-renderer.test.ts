// ───────────────────────────────────────────────────────────────────
// MODULE:    empty-state-renderer.test
// COMPONENT: unit tests for EmptyStateRenderer, starter presets, and the
//            search/filter/limit reason-diagnosis logic
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import {
  createStarterViewConfig,
  EMPTY_STATE_COPY,
  EmptyStateRenderer,
  formatEmptyStateDiagnostics,
  getEmptyStateReason,
  isBoardGroupFieldMissing,
  STARTER_PRESETS,
} from "./empty-state-renderer";
import { getRowPipelineDiagnostics, RowPipeline } from "../data/row-pipeline";
import type { RowPipelineDiagnostics } from "../data/row-pipeline";
import type { NoteRecord } from "../data/data-source";
import type { ViewConfig } from "../data/types";
import type { DatabaseViewState } from "./view-state-store";
import type { TFile } from "obsidian";

// ───────────────────────────────────────────────────────────────────
// 2. MOCKS
// ───────────────────────────────────────────────────────────────────

type IconTarget = { icon?: string };

vi.mock("obsidian", () => ({
  setIcon: vi.fn((element: IconTarget, icon: string) => {
    element.icon = icon;
  }),
  TFile: class {},
}));

vi.mock("../i18n", () => ({
  t: (key: string, vars?: Record<string, string | number>) => {
    const messages: Record<string, string> = {
      "emptyState.searchDiagnostics": "{visible} of {total} records match search",
      "emptyState.filterDiagnostics": "{visible} of {total} records match filters",
      "emptyState.limitDiagnostics": "{visible} of {total} records shown due to limit",
      "emptyState.sourceDiagnostics": "{total} records in source",
      "emptyState.presetTasksTitle": "Tasks",
      "emptyState.presetTasksDesc": "Track work with status, priority, and due dates.",
      "emptyState.presetProjectsTitle": "Projects",
      "emptyState.presetProjectsDesc": "Keep projects, owners, statuses, and target dates together.",
      "emptyState.presetReadingListTitle": "Reading List",
      "emptyState.presetReadingListDesc": "Organize books by author, progress, rating, and category.",
      "emptyState.presetNotesTitle": "Notes",
      "emptyState.presetNotesDesc": "Create a simple vault index with tags and timestamps.",
    };
    const message = messages[key] || key;
    if (!vars) return message;
    return message.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ""));
  },
}));

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURES
// ───────────────────────────────────────────────────────────────────

class FakeElement {
  readonly children: FakeElement[] = [];
  readonly attributes = new Map<string, string>();
  readonly classes = new Set<string>();
  icon?: string;
  textContent = "";
  onclick?: () => void;

  constructor(readonly tagName: string) {}

  createDiv(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    return this.createEl("span", options);
  }

  createEl(tagName: string, options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): FakeElement {
    const child = new FakeElement(tagName);
    for (const className of options.cls?.split(/\s+/).filter(Boolean) || []) child.classes.add(className);
    child.textContent = options.text || "";
    for (const [name, value] of Object.entries(options.attr || {})) child.attributes.set(name, value);
    this.children.push(child);
    return child;
  }

  addClass(className: string): void {
    this.classes.add(className);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }
}

function elementWithClass(root: FakeElement, className: string): FakeElement | undefined {
  if (root.classes.has(className)) return root;
  for (const child of root.children) {
    const match = elementWithClass(child, className);
    if (match) return match;
  }
  return undefined;
}

function diagnostics(overrides: Partial<RowPipelineDiagnostics> = {}): RowPipelineDiagnostics {
  return {
    sourceCount: 12,
    postSearchCount: 12,
    postFilterCount: 12,
    postLimitCount: 12,
    visibleCount: 0,
    hasActiveSearch: false,
    hasActiveFilters: false,
    hasActiveLimit: false,
    ...overrides,
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. RENDERER TESTS
// ───────────────────────────────────────────────────────────────────

describe("EmptyStateRenderer", () => {
  it.each([
    ["no-database", "database"],
    ["no-columns", "columns-3"],
    ["search-empty", "search-x"],
    ["filter-empty", "list-filter"],
    ["filter-and-search-empty", "list-filter"],
    ["limit-empty", "list-x"],
    ["no-date-field", "calendar-plus"],
    ["no-events", "calendar-off"],
    ["no-events-in-range", "calendar-search"],
    ["read-failed", "triangle-alert"],
    ["empty-group", "folder-open"],
  ] as const)("renders the %s reason with its icon", (reason, icon) => {
    const root = new FakeElement("div");
    const card = new EmptyStateRenderer().renderCard(root as unknown as HTMLElement, { reason }) as unknown as FakeElement;
    expect(card.getAttribute("data-empty-reason")).toBe(reason);
    expect((card.children[0] as FakeElement | undefined)?.icon).toBe(icon);
  });

  it("composes the verified icon/title/body/action shape with a paragraph body", () => {
    const root = new FakeElement("div");
    const card = new EmptyStateRenderer().renderCard(root as unknown as HTMLElement, {
      reason: "search-empty",
      actions: [{ label: "Clear search", primary: true, onClick: () => {} }],
    }) as unknown as FakeElement;

    const icon = elementWithClass(card, "obnotion-empty-card-icon");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
    const title = elementWithClass(card, "obnotion-empty-card-title");
    expect(title?.tagName).toBe("h3");
    const body = elementWithClass(card, "obnotion-empty-card-message");
    expect(body?.tagName).toBe("p");
    const action = elementWithClass(card, "obnotion-empty-action");
    expect(action?.classes.has("mod-cta")).toBe(true);
    expect(action?.getAttribute("aria-label")).toBe("Clear search");
  });

  it("fires action callbacks from keyboard-reachable buttons", () => {
    const root = new FakeElement("div");
    let calls = 0;
    const card = new EmptyStateRenderer().renderCard(root as unknown as HTMLElement, {
      reason: "search-empty",
      actions: [{ label: "Clear search", primary: true, onClick: () => { calls += 1; } }],
    }) as unknown as FakeElement;
    const button = elementWithClass(card, "obnotion-empty-action");
    expect(button?.getAttribute("type")).toBe("button");
    button?.onclick?.();
    expect(calls).toBe(1);
  });

  it("renders all four starter presets and keeps preset configs in memory", () => {
    const root = new FakeElement("div");
    const selected: string[] = [];
    new EmptyStateRenderer().renderHero(root as unknown as HTMLElement, {
      title: "Start",
      desc: "Choose a layout",
      onCreateDb: () => {},
      onSelectPreset: (preset) => { selected.push(preset.id); },
    });
    const presetGrid = elementWithClass(root, "obnotion-empty-preset-grid");
    expect(presetGrid?.children).toHaveLength(4);
    expect(presetGrid?.children[0]?.getAttribute("aria-label")).toBeNull();
    expect(STARTER_PRESETS[0].name).toBe("Tasks");
    presetGrid?.children[0]?.onclick?.();
    expect(selected).toEqual(["tasks"]);

    const config = createStarterViewConfig(STARTER_PRESETS[0]);
    expect(config.schema.columns.length).toBeGreaterThan(1);
    config.schema.columns[0].label = "Changed";
    expect(STARTER_PRESETS[0].columns[0].label).toBe("Title");
  });

  it("places a compact empty card inside a table row", () => {
    const tbody = new FakeElement("tbody");
    const row = new EmptyStateRenderer().renderTableRow(tbody as unknown as HTMLElement, 5, {
      reason: "filter-empty",
    });
    expect(row.tagName).toBe("tr");
    expect(row.children[0]?.getAttribute("colspan")).toBe("5");
    expect(elementWithClass(row as unknown as FakeElement, "obnotion-empty-card")?.classes.has("is-compact")).toBe(true);
  });

  it("renders compact card without action button when actions are undefined or stripped for deduplication", () => {
    const tbody = new FakeElement("tbody");
    const row = new EmptyStateRenderer().renderTableRow(tbody as unknown as HTMLElement, 3, {
      reason: "filter-empty",
      actions: undefined,
    });
    const actionButton = elementWithClass(row as unknown as FakeElement, "obnotion-empty-action");
    expect(actionButton).toBeUndefined();
  });

  it.each([
    ["source-missing"],
    ["group-relation-deleted"],
  ] as const)("renders the %s reason as a permanent inline chip with a warning icon", (reason) => {
    const root = new FakeElement("div");
    const chip = new EmptyStateRenderer().renderInlineChip(root as unknown as HTMLElement, {
      reason,
      actions: [{ label: "Open view settings", icon: "settings", onClick: () => {} }],
    }) as unknown as FakeElement;
    expect(chip.classes.has("obnotion-inline-chip")).toBe(true);
    expect(chip.getAttribute("data-empty-reason")).toBe(reason);
    expect(chip.getAttribute("aria-live")).toBe("polite");
    expect((chip.children[0] as FakeElement | undefined)?.icon).toBe("alert-triangle");
  });

  it("wires the chevron action and carries no dismiss control", () => {
    const root = new FakeElement("div");
    let calls = 0;
    const chip = new EmptyStateRenderer().renderInlineChip(root as unknown as HTMLElement, {
      reason: "group-relation-deleted",
      actions: [{ label: "Open view settings", onClick: () => { calls += 1; } }],
    }) as unknown as FakeElement;
    const buttons = chip.children.filter((child) => child.tagName === "button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].icon).toBe("chevron-right");
    buttons[0].onclick?.();
    expect(calls).toBe(1);
  });

  it("renders no action button and no dismiss control when the reason carries no action", () => {
    const root = new FakeElement("div");
    const chip = new EmptyStateRenderer().renderInlineChip(root as unknown as HTMLElement, {
      reason: "source-missing",
    }) as unknown as FakeElement;
    expect(chip.children.some((child) => child.tagName === "button")).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. DIAGNOSIS TESTS
// ───────────────────────────────────────────────────────────────────

describe("empty state diagnosis", () => {
  it.each([
    [diagnostics(), "no-matching-data"],
    [diagnostics({ hasActiveSearch: true, postSearchCount: 0 }), "search-empty"],
    [diagnostics({ hasActiveFilters: true, postFilterCount: 0 }), "filter-empty"],
    [diagnostics({ hasActiveSearch: true, hasActiveFilters: true }), "filter-and-search-empty"],
    [diagnostics({ hasActiveLimit: true, postLimitCount: 2 }), "limit-empty"],
    [diagnostics({ sourceCount: 0, hasActiveSearch: true }), "no-matching-data"],
  ] as const)("dispatches to %s", (input, expected) => {
    expect(getEmptyStateReason(input)).toBe(expected);
  });

  it("separates a source that is gone from one that is there and empty", () => {
    // The three zero-row cases the copy has to keep apart. Row count alone cannot: a deleted folder
    // and a folder holding no notes yet both count zero, so the caller supplies what it found in
    // the vault. `no-database` is a fourth condition unreachable from here — the hero decides it
    // before any diagnostics exist.
    const empty = diagnostics({ sourceCount: 0 });
    expect(getEmptyStateReason(empty, true)).toBe("source-missing");
    expect(getEmptyStateReason(empty, false)).toBe("no-matching-data");
    expect(getEmptyStateReason(diagnostics({ sourceCount: 12 }), false)).toBe("no-matching-data");
    expect(EMPTY_STATE_COPY["source-missing"].title).not.toBe(EMPTY_STATE_COPY["no-matching-data"].title);
    expect(EMPTY_STATE_COPY["source-missing"].title).not.toBe(EMPTY_STATE_COPY["no-database"].title);
  });

  it("names the source ahead of the query only when the source is the thing that is gone", () => {
    // A search over a vanished folder is not the user's problem to fix, so the missing source wins
    // the whole precedence chain. The same search over a source still in the vault keeps its own
    // former reason rather than being re-labelled by the new state.
    const searched = diagnostics({ sourceCount: 0, hasActiveSearch: true, hasActiveFilters: true });
    expect(getEmptyStateReason(searched, true)).toBe("source-missing");
    expect(getEmptyStateReason(searched, false)).toBe("no-matching-data");
  });

  it("formats a stage count without changing the diagnostics object", () => {
    const input = diagnostics({ hasActiveSearch: true, postSearchCount: 0 });
    expect(formatEmptyStateDiagnostics(input)).toBe("0 of 12 records match search");
    expect(input).toEqual(diagnostics({ hasActiveSearch: true, postSearchCount: 0 }));
  });

  it("returns a detached diagnostics snapshot", () => {
    const input = diagnostics({ postFilterCount: 0 });
    const output = getRowPipelineDiagnostics({ rows: [], diagnostics: input });
    output.visibleCount = 4;
    expect(input.visibleCount).toBe(0);
  });

  it("keeps a zero result limit in the presentation diagnostics contract", () => {
    const config = {
      viewType: "table",
      resultLimit: 0,
      schema: { columns: [{ key: "file.name", label: "Title", type: "text" }], computedFields: [] },
    } as unknown as ViewConfig;
    const state = {
      searchText: "",
      statusFilter: "",
      groupByField: "",
      filters: [],
      hiddenColumns: new Set<string>(),
      filterLogic: "and",
      sortDirection: "asc",
      sortRules: [],
    } as DatabaseViewState;
    const records = [{
      file: { name: "One", path: "One.md" } as TFile,
      frontmatter: {},
    }] satisfies NoteRecord[];
    const output = new RowPipeline().buildWithDiagnostics(records, config, state);
    expect(output.rows).toHaveLength(0);
    expect(output.diagnostics).toMatchObject({ sourceCount: 1, postLimitCount: 1, visibleCount: 0, hasActiveLimit: true });
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. FOURTEEN DISTINCT REASONS
// ───────────────────────────────────────────────────────────────────

describe("empty state reason catalog", () => {
  it("gives every reason its own title and body, including the deleted-group-relation state", () => {
    const entries = Object.entries(EMPTY_STATE_COPY);
    expect(entries).toHaveLength(14);
    const seen = new Set<string>();
    for (const [reason, copy] of entries) {
      const signature = `${copy.title}::${copy.body}`;
      expect(seen.has(signature), `${reason} shares its copy with an earlier reason`).toBe(false);
      seen.add(signature);
    }
    expect(EMPTY_STATE_COPY["group-relation-deleted"].title).toBe("emptyState.groupRelationDeletedTitle");
    expect(EMPTY_STATE_COPY["empty-group"].title).not.toBe(EMPTY_STATE_COPY["group-relation-deleted"].title);
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE BOARD'S GROUP FIELD OUTLIVING ITS PROPERTY
// ───────────────────────────────────────────────────────────────────

describe("isBoardGroupFieldMissing", () => {
  const columns = [
    { key: "file.name", label: "Name", type: "text" },
    { key: "status", label: "Status", type: "status" },
  ] as const;

  it("is false when the group field still names a column", () => {
    expect(isBoardGroupFieldMissing(columns, "status")).toBe(false);
  });

  it("is false when there is no group field to check", () => {
    expect(isBoardGroupFieldMissing(columns, undefined)).toBe(false);
    expect(isBoardGroupFieldMissing(columns, "")).toBe(false);
  });

  it("is true once the property the board grouped by is gone from the schema", () => {
    expect(isBoardGroupFieldMissing(columns, "priority")).toBe(true);
  });
});
