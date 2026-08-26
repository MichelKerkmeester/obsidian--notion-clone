import { describe, expect, it, vi } from "vitest";
import type { TFile } from "obsidian";
import { getLocalDateKey } from "./CalendarDateTime";
import { getEffectiveFilterRules } from "./FilterRules";
import { applyConditionalFormat, getConditionalFormatMatch } from "./ConditionalFormatting";
import type {
  ColumnDef,
  ConditionalFormatRule,
  FilterRule,
  RowData,
  SourceRuleNode,
  ViewConfig,
} from "./types";

vi.mock("obsidian", () => ({
  App: class {},
  CachedMetadata: class {},
  TFile: class {},
  getAllTags: vi.fn(() => []),
  getIconIds: vi.fn(() => ["check", "file-text", "star"]),
  normalizePath: (path: string) => path,
  setIcon: vi.fn(),
  setTooltip: vi.fn(),
}));

type FakeStyle = {
  values: Map<string, string>;
  setProperty: (name: string, value: string) => void;
  removeProperty: (name: string) => void;
};

class FakeElement {
  readonly children: FakeElement[] = [];
  readonly classes = new Set<string>();
  readonly attributes = new Map<string, string>();
  readonly style: FakeStyle = {
    values: new Map<string, string>(),
    setProperty: (name, value) => this.style.values.set(name, value),
    removeProperty: (name) => this.style.values.delete(name),
  };
  readonly tagName: string;
  parent: FakeElement | undefined;

  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase();
  }

  addClass(value: string): void {
    this.classes.add(value);
  }

  removeClass(value: string): void {
    this.classes.delete(value);
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  append(child: FakeElement): void {
    child.parent = this;
    this.children.push(child);
  }

  createSpan(options: { cls?: string; text?: string } = {}): FakeElement {
    const child = new FakeElement("span");
    for (const className of options.cls?.split(/\s+/).filter(Boolean) || []) child.addClass(className);
    this.append(child);
    return child;
  }

  querySelector<T extends FakeElement>(selector: string): T | null {
    if (selector !== "td:not(.db-select-col)") return null;
    return (this.children.find((child) => child.tagName === "TD" && !child.classes.has("db-select-col")) as T | undefined) ?? null;
  }

  remove(): void {
    if (!this.parent) return;
    const index = this.parent.children.indexOf(this);
    if (index >= 0) this.parent.children.splice(index, 1);
    this.parent = undefined;
  }
}

const columns: ColumnDef[] = [
  { key: "status", label: "Status", type: "text" },
  { key: "priority", label: "Priority", type: "text" },
  { key: "due", label: "Due", type: "date" },
];

function row(frontmatter: Record<string, unknown>, computed: Record<string, unknown> = {}): RowData {
  return {
    file: {} as TFile,
    frontmatter,
    computed,
  };
}

function config(conditionalFormats: ConditionalFormatRule[], schemaColumns = columns): ViewConfig {
  return {
    name: "Proof",
    sourceFolder: "",
    schema: { columns: schemaColumns, computedFields: [] },
    conditionalFormats,
  };
}

function condition(field: string, value: string, op: FilterRule["op"] = "eq"): FilterRule {
  return { field, op, value };
}

function treeGroup(logic: "and" | "or", rules: SourceRuleNode[]): SourceRuleNode {
  return { type: "group", logic, rules };
}

function recordRule(
  id: string,
  filter: FilterRule,
  options: Omit<ConditionalFormatRule, "id" | "condition" | "target"> = {},
): ConditionalFormatRule {
  return { id, condition: filter, target: "record", ...options };
}

describe("conditional formatting display", () => {
  it("matches a legacy color-only condition", () => {
    const match = getConditionalFormatMatch(
      row({ status: "ready" }),
      config([recordRule("legacy", condition("status", "ready"), { color: "green" })]),
      undefined,
    );

    expect(match).toEqual({ color: "green", ruleId: "legacy" });
  });

  it("requires every leaf in an AND tree", () => {
    const rule = recordRule("and", condition("status", "ready"), {
      color: "blue",
      conditionTree: treeGroup("and", [condition("status", "ready"), condition("priority", "high")]),
    });

    expect(getConditionalFormatMatch(row({ status: "ready", priority: "low" }), config([rule]), undefined)).toBeNull();
    expect(getConditionalFormatMatch(row({ status: "ready", priority: "high" }), config([rule]), undefined)).toEqual({
      color: "blue",
      ruleId: "and",
    });
  });

  it("matches either branch in an OR tree", () => {
    const rule = recordRule("or", condition("status", "ready"), {
      color: "purple",
      conditionTree: treeGroup("or", [condition("status", "ready"), condition("priority", "high")]),
    });

    expect(getConditionalFormatMatch(row({ status: "waiting", priority: "high" }), config([rule]), undefined)).toEqual({
      color: "purple",
      ruleId: "or",
    });
    expect(getConditionalFormatMatch(row({ status: "waiting", priority: "low" }), config([rule]), undefined)).toBeNull();
  });

  it("keeps the first matching rule without merging later attributes", () => {
    const first = recordRule("first", condition("status", "ready"), {
      color: "red",
      icon: "lucide:star@red",
      bold: false,
    });
    const second = recordRule("second", condition("status", "ready"), {
      color: "blue",
      icon: "lucide:check@blue",
      bold: true,
    });

    expect(getConditionalFormatMatch(row({ status: "ready" }), config([first, second]), undefined)).toEqual({
      color: "red",
      icon: "lucide:star@red",
      bold: false,
      ruleId: "first",
    });
  });

  it("does not match null or empty condition trees", () => {
    const nullTree = recordRule("null-tree", condition("status", "ready"), {
      conditionTree: null as unknown as SourceRuleNode,
    });
    const emptyTree = recordRule("empty-tree", condition("status", "ready"), {
      conditionTree: treeGroup("and", []),
    });

    expect(getConditionalFormatMatch(row({ status: "ready" }), config([nullTree]), undefined)).toBeNull();
    expect(getConditionalFormatMatch(row({ status: "ready" }), config([emptyTree]), undefined)).toBeNull();
  });

  it("maps a nested empty group to a non-match through Kleene evaluation", () => {
    const rule = recordRule("nested-empty", condition("status", "ready"), {
      conditionTree: treeGroup("or", [treeGroup("and", []), condition("status", "ready")]),
    });

    expect(getConditionalFormatMatch(row({ status: "waiting" }), config([rule]), undefined)).toBeNull();
  });

  it("resolves today onto empty date leaves without mutating the tree", () => {
    const conditionTree = condition("due", "");
    const rule = recordRule("today", condition("due", ""), {
      conditionTree,
      valueSource: "today",
      color: "green",
    });
    const today = getLocalDateKey(new Date());

    expect(getConditionalFormatMatch(row({ due: today }), config([rule]), undefined)).toEqual({
      color: "green",
      ruleId: "today",
    });
    expect(rule.conditionTree).toEqual(conditionTree);
  });

  it("fails closed for a missing tree column but preserves the legacy fallback", () => {
    const treeRule = recordRule("tree-missing", condition("archived", "yes"), {
      conditionTree: condition("archived", "yes"),
      color: "orange",
    });
    const legacyRule = recordRule("legacy-missing", condition("archived", "yes"), { color: "orange" });
    const note = row({ archived: "yes" });

    expect(getConditionalFormatMatch(note, config([treeRule]), undefined)).toBeNull();
    expect(getConditionalFormatMatch(note, config([legacyRule]), undefined)).toEqual({
      color: "orange",
      ruleId: "legacy-missing",
    });
  });

  it("renders no icon for an invalid icon token", () => {
    const element = new FakeElement();
    const rule = recordRule("invalid-icon", condition("status", "ready"), {
      icon: "lucide:not-a-real-icon@red",
    });

    applyConditionalFormat(element as unknown as HTMLElement, row({ status: "ready" }), config([rule]), undefined);

    expect(element.getAttribute("data-note-database-conditional-icon")).toBe("lucide:not-a-real-icon@red");
    expect(element.children).toHaveLength(0);
  });

  it("paints icon and bold without creating a background color", () => {
    const element = new FakeElement();
    const rule = recordRule("icon-bold", condition("status", "ready"), {
      icon: "lucide:star@blue",
      bold: true,
    });

    applyConditionalFormat(element as unknown as HTMLElement, row({ status: "ready" }), config([rule]), undefined);

    expect(element.classes).toContain("db-conditional-format");
    expect(element.classes).toContain("db-conditional-format-bold");
    expect(element.style.values.has("--db-conditional-format-bg")).toBe(false);
    expect(element.getAttribute("data-note-database-conditional-icon")).toBe("lucide:star@blue");
    expect(element.children).toHaveLength(1);
  });

  it("places a record icon in the first non-select table cell", () => {
    const tr = new FakeElement("tr");
    const selectCell = new FakeElement("td");
    selectCell.addClass("db-select-col");
    const valueCell = new FakeElement("td");
    tr.append(selectCell);
    tr.append(valueCell);
    const rule = recordRule("table-icon", condition("status", "ready"), { icon: "lucide:check@green" });

    applyConditionalFormat(tr as unknown as HTMLElement, row({ status: "ready" }), config([rule]), undefined);

    expect(tr.children).toEqual([selectCell, valueCell]);
    expect(selectCell.children).toHaveLength(0);
    expect(valueCell.children).toHaveLength(1);
    expect(valueCell.children[0].tagName).toBe("SPAN");
  });

  it("keeps a legacy equality with an empty effective value on the raw path", () => {
    const filter = condition("status", " ");
    const rule = recordRule("legacy-empty-eq", filter, { color: "yellow" });

    expect(getEffectiveFilterRules([filter])).toEqual([]);
    expect(getConditionalFormatMatch(row({ status: " " }), config([rule]), undefined)).toEqual({
      color: "yellow",
      ruleId: "legacy-empty-eq",
    });
  });
});
