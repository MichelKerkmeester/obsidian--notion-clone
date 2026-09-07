// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-toolbar-renderer.test
// COMPONENT: coverage for the date-field dropdowns' scoped submenu geometry class
// ───────────────────────────────────────────────────────────────────
//
// The measured 224px/28px date-property submenu geometry (styles.css's
// .obnotion-calendar-date-field-dropdown) is scoped to the start/end date-field rows
// only, not every dropdown this popover renders — a title-field or scale
// change that widened the shared className to the wrong rows would silently
// stretch or shrink a dropdown never captured. createDropdownField's actual
// popover DOM needs a real ownerDocument (getDropdownPopoverHost), which the
// MockElement shim below does not provide, so this pins the call arguments the
// renderer passes it rather than the open popover's own rendered DOM.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS & MOCKS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it, vi } from "vitest";
import type { ViewConfig } from "../data/types";

vi.mock("obsidian", () => ({
  setIcon: vi.fn(),
}));

const { createDropdownFieldSpy } = vi.hoisted(() => ({
  createDropdownFieldSpy: vi.fn((_options: { label: string; popoverClassName?: string }) => ({
    button: {}, valueEl: {}, close: () => undefined,
  })),
}));
vi.mock("./dropdown-field", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./dropdown-field")>();
  return { ...actual, createDropdownField: createDropdownFieldSpy };
});

import { CalendarToolbarRenderer, CalendarToolbarActions } from "./calendar-toolbar-renderer";
import { t } from "../i18n";

/** Minimal Obsidian-DOM-helper surface: just enough to drive renderSections
 *  without ever opening a dropdown's own popover. */
class MockElement {
  public tagName: string;
  public className: string;
  public text: string | null = null;
  public children: MockElement[] = [];

  constructor(tagName = "div", className = "") {
    this.tagName = tagName.toUpperCase();
    this.className = className;
  }

  createDiv(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("div", options);
  }

  createSpan(options: { cls?: string; text?: string } = {}): MockElement {
    return this.createEl("span", options);
  }

  createEl(tag: string, options: { cls?: string; text?: string } = {}): MockElement {
    const el = new MockElement(tag, options.cls || "");
    if (options.text != null) el.text = options.text;
    this.children.push(el);
    return el;
  }

  empty(): void {
    this.children = [];
  }

  setAttr(): void { /* not needed for this scenario */ }
  setAttribute(): void { /* not needed for this scenario */ }
  addClass(): void { /* not needed for this scenario */ }
  removeClass(): void { /* not needed for this scenario */ }
  toggleClass(): void { /* not needed for this scenario */ }
}

function baseConfig(overrides: Partial<ViewConfig> = {}): ViewConfig {
  return {
    name: "Calendar",
    viewType: "calendar",
    sourceFolder: "",
    schema: {
      columns: [
        { key: "file.name", label: "Name", type: "text" },
        { key: "due", label: "Due", type: "date" },
      ],
      computedFields: [],
    },
    calendarScale: "month",
    calendarStartDateField: "due",
    ...overrides,
  };
}

function baseActions(): CalendarToolbarActions {
  return { onChange: vi.fn() };
}

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("CalendarToolbarRenderer data section — date-field submenu scoping", () => {
  it("scopes the measured submenu geometry class to the start and end date-field rows only", () => {
    createDropdownFieldSpy.mockClear();
    const renderer = new CalendarToolbarRenderer();
    const data = new MockElement("div", "data-section");
    const config = baseConfig();

    (renderer as unknown as {
      renderDataSection(data: MockElement, config: ViewConfig, actions: CalendarToolbarActions): void;
    }).renderDataSection(data, config, baseActions());

    const byLabel = new Map(createDropdownFieldSpy.mock.calls.map(([call]) => [call.label, call.popoverClassName]));

    expect(byLabel.get(t("viewConfig.eventStartDateField"))).toBe("obnotion-calendar-options-dropdown obnotion-calendar-date-field-dropdown");
    expect(byLabel.get(t("viewConfig.eventEndDateField"))).toBe("obnotion-calendar-options-dropdown obnotion-calendar-date-field-dropdown");
    // The title field reuses the same generic dropdown but must not inherit the
    // date-field-only geometry class — it was never part of the measured row.
    expect(byLabel.get(t("viewConfig.eventTitleField"))).toBe("obnotion-calendar-options-dropdown");
  });
});
