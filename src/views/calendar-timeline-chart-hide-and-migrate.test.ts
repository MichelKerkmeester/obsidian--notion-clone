// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-timeline-chart-hide-and-migrate.test
// COMPONENT: the retirement's host wiring — what no longer offers calendar, timeline or chart,
//            what no longer re-blesses one on settings load, and where an existing one is
//            redirected on open in both render hosts
// ───────────────────────────────────────────────────────────────────
//
// The three renderers need a live Obsidian App, so the surfaces that host them are asserted on
// the source they ship, the same way the gallery and list retirement suites keep the picker and
// its fixture in step. Two things stay open on purpose, pinned here as negatives: the frontmatter
// parser must keep accepting all three so the on-open migration ever gets a view to convert, and
// the renderers themselves are untouched in this phase — 003 removes them, not 002.

/* eslint-disable import/no-nodejs-modules, no-undef --
   Reading the shipped source from disk needs the node builtins the plugin runtime rule forbids.
   Scoped to this suite, which never ships. */

// ───────────────────────────────────────────────────────────────────
// 1. SOURCE COLLECTION
// ───────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const read = (relative: string): string => readFileSync(resolve(__dirname, relative), "utf-8");

const mainSource = read("../main.ts");
const toolbarSource = read("./toolbar-renderer.ts");
const viewConfigPanelSource = read("./view-config-panel-renderer.ts");
const settingsSource = read("../settings.ts");
const dataSourceSource = read("../data/data-source.ts");
const databaseViewSource = read("./database-view.ts");
const embeddedSource = read("./embedded-database-renderer.ts");

// ───────────────────────────────────────────────────────────────────
// 2. THE PICKERS
// ───────────────────────────────────────────────────────────────────

describe("no picker offers calendar, timeline or chart", () => {
  it("withdraws all three from the add-view and view-type menus, with the escape hatch", () => {
    expect(toolbarSource).toContain('option.value !== "chart" || current === "chart"');
    expect(toolbarSource).toContain('option.value !== "calendar" || current === "calendar"');
    expect(toolbarSource).toContain('option.value !== "timeline" || current === "timeline"');
  });

  it("withdraws all three from the view-config panel's type picker, with the escape hatch", () => {
    expect(viewConfigPanelSource).toContain('option.value !== "chart" || config.viewType === "chart"');
    expect(viewConfigPanelSource).toContain('option.value !== "calendar" || config.viewType === "calendar"');
    expect(viewConfigPanelSource).toContain('option.value !== "timeline" || config.viewType === "timeline"');
  });

  it("withdraws all three from the plugin-settings default-view dropdown", () => {
    const defaultViewTypesLine = settingsSource.split("\n").find((line) => line.includes("DEFAULT_VIEW_TYPES: DatabaseViewType[]"));
    expect(defaultViewTypesLine).toBeDefined();
    expect(defaultViewTypesLine).not.toContain('"chart"');
    expect(defaultViewTypesLine).not.toContain('"calendar"');
    expect(defaultViewTypesLine).not.toContain('"timeline"');
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. THE SETTINGS-LOAD SANITIZER
// ───────────────────────────────────────────────────────────────────

describe("the settings-load sanitizer stops exempting chart and routes timeline through the real migration", () => {
  it("no longer exempts chart from the bare unknown-type fallback", () => {
    // Chart's target already equals the fallback (table), so it closes for free, the same way a
    // type whose target is the fallback needs no special case: the exemption is deleted rather
    // than routed through a dedicated migration.
    const boardOnlyLines = mainSource.split("\n").filter((line) => line.includes('viewType !== "board"'));
    expect(boardOnlyLines.length).toBeGreaterThanOrEqual(2);
    for (const line of boardOnlyLines) {
      expect(line).not.toContain('!== "chart"');
    }
  });

  it("converts a loaded timeline to a board through the real migration rather than the bare unknown-type fallback", () => {
    // Timeline's target (board) differs from the fallback (table), so a bare fallback would strand
    // the lane grouping before the on-open migration ever ran — the same reason gallery's sanitizer
    // routes through its own plan/apply pair instead of the generic coercion.
    expect(mainSource).toContain("planTimelineMigration");
    expect(mainSource).toContain("applyTimelineMigration");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE ACCEPTING SURFACE STAYS OPEN, ON PURPOSE
// ───────────────────────────────────────────────────────────────────

describe("the frontmatter parser keeps accepting persisted calendar, timeline and chart values", () => {
  it("still parses all three from a db_view file rather than coercing them at read time", () => {
    const parseViewTypeStart = dataSourceSource.indexOf("private parseViewType(");
    expect(parseViewTypeStart).toBeGreaterThanOrEqual(0);
    const parseViewTypeEnd = dataSourceSource.indexOf("\n  private ", parseViewTypeStart + 1);
    const body = parseViewTypeEnd === -1 ? dataSourceSource.slice(parseViewTypeStart) : dataSourceSource.slice(parseViewTypeStart, parseViewTypeEnd);
    expect(body).toContain('"chart"');
    expect(body).toContain('"calendar"');
    expect(body).toContain('"timeline"');
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. THE RENDERERS STAY — THIS PHASE REDIRECTS, IT DOES NOT REMOVE
// ───────────────────────────────────────────────────────────────────

describe("the three renderers are untouched by this phase", () => {
  it("still dispatches to the chart renderer in the file view", () => {
    expect(databaseViewSource).toContain('viewType === "chart"');
  });

  it("still imports the calendar and timeline renderers in the file view", () => {
    expect(databaseViewSource).toContain("CalendarTimelineRenderer");
    expect(databaseViewSource).toContain("CalendarRenderer");
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. THE MIGRATION HOOKS RUN IN BOTH HOSTS, ONCE, WITH A NOTICE
// ───────────────────────────────────────────────────────────────────

describe("the migrations run on open in both hosts, once, with a notice", () => {
  it("imports and runs the chart migration in the file view, keyed by database so the notice can persist", () => {
    expect(databaseViewSource).toContain("planChartMigration");
    expect(databaseViewSource).toContain("migrateChartViewOnOpen");
    expect(databaseViewSource).toContain("chartMigrationNotices");
  });

  it("imports and runs the calendar migration in the file view, keyed by database so the notice can persist", () => {
    expect(databaseViewSource).toContain("planCalendarMigration");
    expect(databaseViewSource).toContain("migrateCalendarViewOnOpen");
    expect(databaseViewSource).toContain("calendarMigrationNotices");
  });

  it("imports and runs the timeline migration in the file view, keyed by database so the notice can persist", () => {
    expect(databaseViewSource).toContain("planTimelineMigration");
    expect(databaseViewSource).toContain("migrateTimelineViewOnOpen");
    expect(databaseViewSource).toContain("timelineMigrationNotices");
  });

  it("imports and runs all three migrations on the embed path", () => {
    expect(embeddedSource).toContain("planChartMigration");
    expect(embeddedSource).toContain("migrateChartViewOnOpen");
    expect(embeddedSource).toContain("planCalendarMigration");
    expect(embeddedSource).toContain("migrateCalendarViewOnOpen");
    expect(embeddedSource).toContain("planTimelineMigration");
    expect(embeddedSource).toContain("migrateTimelineViewOnOpen");
  });

  it("calls all three on-open migrations from the file view's refresh head, beside gallery and list", () => {
    const refreshStart = databaseViewSource.indexOf("refresh(options: { viewport?: DatabaseViewportRequest } = {}): void {");
    expect(refreshStart).toBeGreaterThanOrEqual(0);
    const refreshHead = databaseViewSource.slice(refreshStart, refreshStart + 400);
    expect(refreshHead).toContain("this.migrateChartViewOnOpen();");
    expect(refreshHead).toContain("this.migrateCalendarViewOnOpen();");
    expect(refreshHead).toContain("this.migrateTimelineViewOnOpen();");
  });

  it("calls all three on-open migrations from the embed render head, beside gallery and list", () => {
    const renderStart = embeddedSource.indexOf("private render(scroll?: { top: number; left: number }): void {");
    expect(renderStart).toBeGreaterThanOrEqual(0);
    const renderHead = embeddedSource.slice(renderStart, renderStart + 1600);
    expect(renderHead).toContain("this.migrateChartViewOnOpen(config);");
    expect(renderHead).toContain("this.migrateCalendarViewOnOpen(config);");
    expect(renderHead).toContain("this.migrateTimelineViewOnOpen(config);");
  });
});

// ───────────────────────────────────────────────────────────────────
// 7. A MUTATION GUARD: RE-OFFERING ONE TYPE MUST FAIL THIS SUITE
// ───────────────────────────────────────────────────────────────────

describe("re-enabling any one type in a picker is caught", () => {
  it("would fail if the toolbar filter dropped the chart clause", () => {
    // Documents the mutation this suite exists to catch; no assertion beyond section 2's above,
    // which already fails the moment `option.value !== "chart" || current === "chart"` is removed.
    expect(toolbarSource.includes('option.value !== "chart" || current === "chart"')).toBe(true);
  });
});
