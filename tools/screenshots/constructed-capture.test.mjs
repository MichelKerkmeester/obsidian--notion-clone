// ───────────────────────────────────────────────────────────────────
// MODULE:    constructed-capture.test
// COMPONENT: the constructed scenario contract — manifest marking, readiness refusal, fixture declaration
// ───────────────────────────────────────────────────────────────────
//
// The capture pipeline photographs two kinds of scenario: hand-written fixtures and
// constructed renders of the shipped renderers. The facts this suite exists to pin:
// a constructed capture is marked in the manifest so it can be told from a fixture,
// a constructed scenario that cannot signal readiness is refused before it runs, and
// every fixture that a constructed capture supersedes declares that relationship so
// the manifest can mark it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { captureRootFor, validateManifestEntry } from "./manifest-schema.mjs";
import {
  CONSTRUCTED_SCENARIOS,
  validateConstructedScenario,
} from "./constructed-scenarios.mjs";

// ───────────────────────────────────────────────────────────────────
// 2. MANIFEST SCHEMA
// ───────────────────────────────────────────────────────────────────

describe("manifest schema", () => {
  it("accepts a constructed entry carrying a per-view scenario id", () => {
    const entry = {
      id: "constructed-table",
      source: "constructed",
      renderer: "table",
      bag: "file-view",
      theme: "dark",
      device: "desktop",
      file: "screenshots/notion-clone/views/constructed-table-desktop-dark.png",
      pixelHash: "0123456789ab",
      sourceHashes: { "src/views/table-renderer.ts": "0123456789ab" },
    };
    expect(validateManifestEntry(entry).ok).toBe(true);
  });

  it("rejects a constructed entry without the view it photographs", () => {
    const entry = {
      id: "constructed-table",
      source: "constructed",
      theme: "dark",
      device: "desktop",
      file: "screenshots/notion-clone/views/constructed-table-desktop-dark.png",
      pixelHash: "0123456789ab",
      sourceHashes: {},
    };
    expect(validateManifestEntry(entry).ok).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. READINESS REFUSAL
// ───────────────────────────────────────────────────────────────────

describe("constructed scenario readiness", () => {
  it("refuses a constructed scenario whose mount carries no readiness signal", () => {
    // A synchronous mount returns before the renderer has signalled ready, so
    // there is nothing for the capture to wait on and the screenshot would
    // photograph an unmounted view.
    expect(() =>
      validateConstructedScenario({
        id: "constructed-table",
        mount: () => {},
      }),
    ).toThrow(/readiness/);
  });

  it("accepts a constructed scenario whose mount awaits the ready signal", () => {
    expect(() =>
      validateConstructedScenario({
        id: "constructed-table",
        mount: async () => null,
      }),
    ).not.toThrow();
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. REGISTRY COVERAGE
// ───────────────────────────────────────────────────────────────────

describe("constructed scenario registry", () => {
  it("registers one scenario per view with a constructed-<view> id", () => {
    const ids = CONSTRUCTED_SCENARIOS.map((s) => s.id).sort();
    expect(ids).toEqual([
      "constructed-active-rule-filter",
      "constructed-active-rule-sort",
      "constructed-active-view-controls",
      "constructed-board",
      "constructed-board-card-properties",
      "constructed-board-card-properties-hidden",
      "constructed-board-empty-column",
      "constructed-board-extensions",
      "constructed-board-subtask",
      "constructed-calendar-day",
      "constructed-calendar-empty",
      "constructed-calendar-mini",
      "constructed-calendar-month",
      "constructed-calendar-toolbar-options",
      "constructed-calendar-week",
      "constructed-card-covers",
      "constructed-cell-editor-select",
      "constructed-cell-editor-text",
      "constructed-chart",
      "constructed-chart-empty",
      "constructed-chart-number",
      "constructed-chart-toolbar-options",
      "constructed-column-header",
      "constructed-column-manager",
      "constructed-column-width-adjuster",
      "constructed-date-picker",
      "constructed-date-picker-datetime",
      "constructed-dropdown",
      "constructed-empty-state",
      "constructed-file-fields",
      "constructed-filter-panel",
      "constructed-filter-panel-nested",
      "constructed-gallery",
      "constructed-group-selection-controls",
      "constructed-icon-picker",
      "constructed-linked-view-host",
      "constructed-list-migrated",
      "constructed-number-displays",
      "constructed-option-color-picker",
      "constructed-owned-menu",
      "constructed-record-detail",
      "constructed-record-detail-body-editing",
      "constructed-record-detail-body-empty",
      "constructed-record-detail-docked",
      "constructed-record-icon",
      "constructed-record-peek",
      "constructed-relation-values",
      "constructed-sort-panel",
      "constructed-sort-panel-calendar",
      "constructed-status-colors",
      "constructed-summary",
      "constructed-table",
      "constructed-table-footer",
      "constructed-table-grouped",
      "constructed-timeline",
      "constructed-timeline-day",
      "constructed-timeline-month",
      "constructed-timeline-quarter",
      "constructed-timeline-subtask",
      "constructed-timeline-toolbar-options",
      "constructed-timeline-year",
      "constructed-toolbar",
      "constructed-toolbar-add-view",
      "constructed-toolbar-search",
      "constructed-toolbar-utilities",
      "constructed-view-config",
    ]);
  });

  it("every registered constructed scenario passes the readiness check", () => {
    for (const scenario of CONSTRUCTED_SCENARIOS) {
      expect(() => validateConstructedScenario(scenario)).not.toThrow();
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. FIXTURE DECLARATIONS
// ───────────────────────────────────────────────────────────────────

describe("fixture declarations", () => {
  it("marks every hand-written fixture the constructed captures supersede", async () => {
    const { SCENARIOS } = await import("./scenarios.mjs");
    const declared = SCENARIOS
      .filter((s) => s.fixtureOf)
      .map((s) => `${s.id} -> ${s.fixtureOf}`)
      .sort();
    expect(declared).toEqual([
      "add-view-popover -> constructed-toolbar-add-view",
      "board-empty-column -> constructed-board-empty-column",
      "board-mobile -> constructed-board",
      "board-subtask-tree -> constructed-board-subtask",
      "board-view -> constructed-board",
      "calendar-empty-state -> constructed-calendar-empty",
      "calendar-mini-calendar -> constructed-calendar-mini",
      "calendar-month-view -> constructed-calendar-month",
      "calendar-toolbar-options -> constructed-calendar-toolbar-options",
      "calendar-week-time-grid -> constructed-calendar-week",
      "card-cover-states -> constructed-card-covers",
      "chrome-active-rule-popover-filter -> constructed-active-rule-filter",
      "chrome-active-rule-popover-sort -> constructed-active-rule-sort",
      "chrome-active-view-controls -> constructed-active-view-controls",
      "chrome-board-extensions-selection -> constructed-board-extensions",
      "chrome-chart-empty -> constructed-chart-empty",
      "chrome-chart-number -> constructed-chart-number",
      "chrome-chart-options-popover -> constructed-chart-toolbar-options",
      "chrome-group-header-row -> constructed-table-grouped",
      "chrome-group-selection-controls -> constructed-group-selection-controls",
      "chrome-owned-menu -> constructed-owned-menu",
      "chrome-owned-menu-sheet -> constructed-owned-menu",
      "chrome-summary-row -> constructed-summary",
      "chrome-table-footer -> constructed-table-footer",
      "chrome-toolbar -> constructed-toolbar",
      "chrome-toolbar-search -> constructed-toolbar-search",
      "chrome-utilities-popover -> constructed-toolbar-utilities",
      "chrome-view-switcher -> constructed-toolbar",
      "dropdown-field -> constructed-dropdown",
      "empty-state -> constructed-empty-state",
      "field-cell-edit-select -> constructed-cell-editor-select",
      "field-cell-edit-text -> constructed-cell-editor-text",
      "field-date-value-picker -> constructed-date-picker",
      "field-date-value-picker-datetime -> constructed-date-picker-datetime",
      "field-file-fields -> constructed-file-fields",
      "field-icon-picker -> constructed-icon-picker",
      "field-number-displays -> constructed-number-displays",
      "field-option-color-picker -> constructed-option-color-picker",
      "field-record-icon -> constructed-record-icon",
      "field-relation-values -> constructed-relation-values",
      "field-status-colors -> constructed-status-colors",
      "gallery-view -> constructed-gallery",
      "panel-board-card-properties -> constructed-board-card-properties",
      "panel-column-manager -> constructed-column-manager",
      "panel-column-width-sheet -> constructed-column-width-adjuster",
      "panel-filter-conditions -> constructed-filter-panel",
      "panel-filter-nested-group -> constructed-filter-panel-nested",
      "panel-record-detail -> constructed-record-detail",
      "panel-record-detail-sheet -> constructed-record-detail",
      "panel-record-detail-sheet-body-editing -> constructed-record-detail-body-editing",
      "panel-record-detail-sheet-body-empty -> constructed-record-detail-body-empty",
      "panel-record-peek -> constructed-record-peek",
      "panel-sort-calendar-empty -> constructed-sort-panel-calendar",
      "panel-sort-rules -> constructed-sort-panel",
      "panel-view-config -> constructed-view-config",
      "panel-view-config-sheet -> constructed-view-config",
      "table-column-header -> constructed-column-header",
      "table-mobile -> constructed-table",
      "table-view -> constructed-table",
      "timeline-subtask-tree -> constructed-timeline-subtask",
      "timeline-toolbar-options -> constructed-timeline-toolbar-options",
      "timeline-view -> constructed-timeline",
      "timeline-view-day -> constructed-timeline-day",
      "timeline-view-month -> constructed-timeline-month",
      "timeline-view-quarter -> constructed-timeline-quarter",
      "timeline-view-year -> constructed-timeline-year",
    ]);
  });

  it("every fixtureOf names a registered constructed scenario", async () => {
    const { SCENARIOS } = await import("./scenarios.mjs");
    const constructedIds = new Set(CONSTRUCTED_SCENARIOS.map((s) => s.id));
    for (const scenario of SCENARIOS) {
      if (!scenario.fixtureOf) continue;
      expect(constructedIds.has(scenario.fixtureOf)).toBe(true);
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. CAPTURE ROOT
// ───────────────────────────────────────────────────────────────────

describe("captureRootFor", () => {
  // A raw scenario definition (reference-scenarios.mjs) carries `kind: "reference"`; `source` is
  // a field capture.mjs only attaches to the finished manifest entry afterward. Checking `source`
  // here read undefined on every raw scenario — reference included — and nested all sixteen
  // project-manager captures under notion-clone/ until a full run's own manifest-schema
  // validation refused to write the wrong path (npm run screenshots: "entry reference-kanban has
  // file screenshots/notion-clone/project-manager/... want screenshots/project-manager/...").
  it("gives a reference scenario no root prefix", () => {
    expect(captureRootFor({ kind: "reference", group: "project-manager" })).toBe("");
  });

  it("gives a fixture or constructed scenario the notion-clone root", () => {
    expect(captureRootFor({ group: "views" })).toBe("notion-clone");
    expect(captureRootFor({ kind: "constructed", group: "panels" })).toBe("notion-clone");
  });
});
