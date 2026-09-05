// ───────────────────────────────────────────────────────────────────
// MODULE:    toolbar-surface-contract.test
// COMPONENT: source contracts for the shared toolbar constructors and their consumers
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

/* eslint-disable import/no-nodejs-modules, no-undef -- source contracts need Node's file reader. */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const read = (name: string): string => readFileSync(resolve(__dirname, name), "utf-8");
const readIfPresent = (name: string): string => {
  const path = resolve(__dirname, name);
  return existsSync(path) ? readFileSync(path, "utf-8") : "";
};

// ───────────────────────────────────────────────────────────────────
// 2. CONSTRUCTORS
// ───────────────────────────────────────────────────────────────────

describe("toolbar surface constructors", () => {
  it("provides the shared surface primitives without importing the toolbar renderer", () => {
    const source = readIfPresent("toolbar-primitives.ts");
    expect(source).toContain("export function createPopoverShell");
    expect(source).toContain("export function createConditionRow");
    expect(source).toContain("export function createControlClusterButton");
    expect(source).toContain("export function createSettingsEntry");
    expect(source).toContain("export function createTabStrip");
    expect(source).toContain("export function dismissToolbarSurfaces");
    expect(source).toContain("SETTINGS_FALLBACK_CLASSES");
    expect(source).toContain("onReorder");
    expect(source).toContain("measureTabOverflow");
    expect(source).toContain("140");
    expect(source).toContain("120");
    expect(source).not.toContain("toolbar-renderer");
  });

  it("stamps the settings fallback classes on the live trigger constructor", () => {
    const source = read("toolbar-primitives.ts");
    expect(source).toContain("db-view-config-btn");
    expect(source).toContain("db-chart-options-toolbar-btn");
    expect(source).toContain("db-calendar-timeline-options-toolbar-btn");
  });
});

describe("toolbar surface migrations", () => {
  it("removes retired settings methods and the shared panel disguise", () => {
    const toolbar = read("toolbar-renderer.ts");
    const sort = read("sort-panel-renderer.ts");
    expect(toolbar).not.toMatch(/private render(?:ComputedSyncButton|DatabaseRefreshButton|CalendarTimelineOptionsButton|WidthSelect|ViewConfigButton|ChartOptionsButton|ExportButton)\(/);
    expect(sort).not.toContain('cls: "db-sort-panel db-filter-panel"');
  });

  it("collapses repeated sibling-close runs into one dismissal helper", () => {
    const toolbar = read("toolbar-renderer.ts");
    expect(toolbar).toContain("dismissToolbarSurfaces");
    expect(toolbar).toContain("dismissSiblingToolbarSurfaces");
    expect(toolbar).toContain("createPopoverShell");
    expect(toolbar).toContain("createTabStrip");
    expect(toolbar).toContain("createSettingsEntry");
    expect(toolbar).not.toContain("db-view-tab-popover-row db-menu-item");
    const teardownRuns = toolbar.match(/this\.closeDatabasePopover\(\);\s*this\.closeGroupPopover\(\);\s*this\.closeViewTabPopover\(\);/g) || [];
    expect(teardownRuns.length).toBeLessThanOrEqual(2);
  });

  it("declares control states and measured rail geometry", () => {
    const toolbar = read("toolbar-renderer.ts");
    const active = read("active-view-controls-renderer.ts");
    const styles = read("../../styles.css");
    expect(toolbar).toContain("createControlClusterButton");
    expect(read("toolbar-primitives.ts")).toContain("data-control-state");
    expect(active).toContain("createDirectionWord");
    expect(styles).toMatch(/\.db-active-control-chip[\s\S]{0,500}height:\s*28px/);
    expect(styles).toContain("margin: 0 12px 0 8px");
  });

  it("binds filter and sort rows onto the shared condition constructor", () => {
    const filter = read("filter-panel-renderer.ts");
    const sort = read("sort-panel-renderer.ts");
    expect(filter).toContain("createConditionRow");
    expect(sort).toContain("createConditionRow");
  });

  it("persists view presets and routes creation through them", () => {
    const types = read("../data/types.ts");
    const dataSource = read("../data/data-source.ts");
    const toolbar = read("toolbar-renderer.ts");
    expect(types).toContain("newRowPresets?: Record<string, string>");
    expect(dataSource).toContain("newRowPresets");
    expect(toolbar).toContain('createMenuSection(panel, t("toolbar.settings"))');
    expect(toolbar).toContain("applyViewRowPresets");
  });

  it("guards sorted record drops and measures embedded toolbar space", () => {
    const table = read("table-renderer.ts");
    const board = read("board-renderer.ts");
    const toolbar = read("toolbar-renderer.ts");
    expect(table).toContain("confirmSortConflict");
    expect(board).toContain("confirmSortConflict");
    expect(toolbar).toContain("ResizeObserver");
    expect(toolbar).toContain("naturalWidth");
  });

  it("lands in view settings after create or duplicate", () => {
    const database = read("database-view.ts");
    expect(database).toContain("openViewSettingsAfterMutation");
  });
});
