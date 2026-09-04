// ───────────────────────────────────────────────────────────────────
// MODULE:    settings.test
// COMPONENT: unit tests for the SettingsTab's reconciled view vocabulary
// ───────────────────────────────────────────────────────────────────
//
// The settings tab is the one place the plugin's global view vocabulary is
// discoverable: which view type a new database opens with, where a record
// opens, and the defaults every surface shares. This suite drives display()
// against recorded fake controls and asserts the rows the vocabulary
// promises, so a rename that orphans a label or a key fails here first.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsTab, createDefaultSettings, DEFAULT_VIEW_TYPES, normalizeDefaultViewType } from "./settings";
import type NoteDatabasePlugin from "./main";
import type { App } from "obsidian";
import type { PluginSettings } from "./data/types";
import type { DatabaseFileEntry } from "./data/database-file-order";
import { t } from "./i18n";

// ───────────────────────────────────────────────────────────────────
// 2. FAKE DOM AND OBSIDIAN
// ───────────────────────────────────────────────────────────────────

const dom = vi.hoisted(() => {
  class FakeElement {
    readonly children: FakeElement[] = [];
    readonly attributes = new Map<string, string>();
    readonly classes = new Set<string>();
    textContent = "";
    parentElement: FakeElement | null = null;

    constructor(readonly tagName: string) {}

    createDiv(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): FakeElement {
      return this.createEl("div", options);
    }

    createSpan(options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): FakeElement {
      return this.createEl("span", options);
    }

    createEl(tagName: string, options: { cls?: string; text?: string; attr?: Record<string, string> } = {}): FakeElement {
      const child = new FakeElement(tagName);
      child.parentElement = this;
      for (const className of options.cls?.split(/\s+/).filter(Boolean) || []) child.classes.add(className);
      child.textContent = options.text || "";
      for (const [name, value] of Object.entries(options.attr || {})) child.attributes.set(name, value);
      this.children.push(child);
      return child;
    }

    addClass(...names: string[]): void {
      for (const name of names) this.classes.add(name);
    }

    setAttr(name: string, value: string): void {
      this.attributes.set(name, value);
    }

    setAttribute(name: string, value: string): void {
      this.attributes.set(name, value);
    }

    getAttribute(name: string): string | null {
      return this.attributes.get(name) ?? null;
    }

    toggleClass(name: string, on: boolean): void {
      if (on) this.classes.add(name);
      else this.classes.delete(name);
    }

    empty(): void {
      this.children.length = 0;
    }

    setText(text: string): void {
      this.textContent = text;
    }
  }

  class FakeDropdown {
    readonly options: Array<{ value: string; text: string }> = [];
    private changeHandler: ((value: string) => unknown) | undefined;

    addOption(value: string, text: string): this {
      this.options.push({ value, text });
      return this;
    }

    setValue(value: string): this {
      return this;
    }

    onChange(handler: (value: string) => unknown): this {
      this.changeHandler = handler;
      return this;
    }

    // Arrow property so a detached reference to `select` keeps its receiver.
    select = (value: string): void => {
      void this.changeHandler?.(value);
    };
  }

  class FakeToggle {
    private changeHandler: ((value: boolean) => unknown) | undefined;

    setValue(_value: boolean): this {
      return this;
    }

    onChange(handler: (value: boolean) => unknown): this {
      this.changeHandler = handler;
      return this;
    }

    toggle(value: boolean): void {
      void this.changeHandler?.(value);
    }
  }

  class FakeText {
    private changeHandler: ((value: string) => unknown) | undefined;

    setPlaceholder(_placeholder: string): this {
      return this;
    }

    setValue(_value: string): this {
      return this;
    }

    onChange(handler: (value: string) => unknown): this {
      this.changeHandler = handler;
      return this;
    }
  }

  class FakeButton {
    private clickHandler: (() => unknown) | undefined;

    setButtonText(_text: string): this {
      return this;
    }

    onClick(handler: () => unknown): this {
      this.clickHandler = handler;
      return this;
    }

    click(): void {
      void this.clickHandler?.();
    }
  }

  const instances: FakeSetting[] = [];

  class FakeSetting {
    readonly controlEl = new FakeElement("div");
    readonly settingEl = { addClass: vi.fn() };
    name = "";
    desc = "";
    dropdown: FakeDropdown | undefined;
    toggles: FakeToggle[] = [];
    texts: FakeText[] = [];
    buttons: FakeButton[] = [];

    constructor(_containerEl: unknown) {
      instances.push(this);
    }

    setName(name: string): this {
      this.name = name;
      return this;
    }

    setDesc(desc: string): this {
      this.desc = desc;
      return this;
    }

    setHeading(): this {
      return this;
    }

    addDropdown(render: (dropdown: FakeDropdown) => unknown): this {
      const dropdown = new FakeDropdown();
      render(dropdown);
      this.dropdown = dropdown;
      return this;
    }

    addToggle(render: (toggle: FakeToggle) => unknown): this {
      const toggle = new FakeToggle();
      render(toggle);
      this.toggles.push(toggle);
      return this;
    }

    addText(render: (text: FakeText) => unknown): this {
      const text = new FakeText();
      render(text);
      this.texts.push(text);
      return this;
    }

    addButton(render: (button: FakeButton) => unknown): this {
      const button = new FakeButton();
      render(button);
      this.buttons.push(button);
      return this;
    }
  }

  class FakePluginSettingTab {
    containerEl = new FakeElement("div");

    constructor(
      public app: unknown,
      public plugin: unknown,
    ) {}
  }

  return { FakeElement, FakeSetting, FakePluginSettingTab, instances };
});

vi.mock("obsidian", () => {
  // The settings module graph imports nearly every obsidian export, and the
  // graph must load even though display() touches only the fakes above. The
  // list mirrors the storybook stub, which verify-coverage keeps in lockstep
  // with the source: components are classes, helpers are functions, Platform
  // is the object the touch gates read.
  const klass = () => class {};
  return {
    App: klass(),
    CachedMetadata: klass(),
    Component: klass(),
    EventRef: klass(),
    FileSystemAdapter: klass(),
    FileView: klass(),
    FuzzySuggestModal: klass(),
    HoverParent: klass(),
    HoverPopover: klass(),
    MarkdownRenderChild: klass(),
    MarkdownRenderer: klass(),
    MarkdownSectionInformation: klass(),
    MarkdownView: klass(),
    Menu: klass(),
    MenuItem: klass(),
    MetadataCache: klass(),
    Modal: klass(),
    Notice: klass(),
    Plugin: klass(),
    PluginSettingTab: dom.FakePluginSettingTab,
    Scope: klass(),
    Setting: dom.FakeSetting,
    TFile: klass(),
    TFolder: klass(),
    Vault: klass(),
    ViewStateResult: klass(),
    WorkspaceLeaf: klass(),
    setIcon: vi.fn(),
    setTooltip: vi.fn(),
    normalizePath: (path: string) => path,
    finishRenderMath: vi.fn(),
    getAllTags: vi.fn(),
    getIconIds: vi.fn(),
    loadMathJax: vi.fn(),
    parseYaml: () => ({}),
    renderMath: vi.fn(),
    stringifyYaml: () => "",
    Platform: { isMobile: false, isPhone: false, isTablet: false, isDesktop: true },
  };
});

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURES
// ───────────────────────────────────────────────────────────────────

/** The slice of the plugin display() actually reads, typed with function members so
 *  a detached reference to them stays bound (the full plugin type declares methods). */
interface SettingsTabStub {
  settings: PluginSettings;
  saveSettings: () => Promise<void>;
  dataSource: { getViewDefFiles: () => DatabaseFileEntry[] };
}

function createStubPlugin(): SettingsTabStub {
  return {
    settings: createDefaultSettings(),
    saveSettings: vi.fn(async () => {}),
    dataSource: { getViewDefFiles: () => [] },
  };
}

function openTab(): void {
  const tab = new SettingsTab({} as App, createStubPlugin() as unknown as NoteDatabasePlugin);
  tab.display();
}

// ───────────────────────────────────────────────────────────────────
// 4. SETTINGS VOCABULARY TESTS
// ───────────────────────────────────────────────────────────────────

describe("SettingsTab reconciled view vocabulary", () => {
  beforeEach(() => {
    dom.instances.length = 0;
  });

  it("exposes a localized default-view control for new databases", () => {
    openTab();

    const row = dom.instances.find((setting) => setting.name === t("settings.defaultView.name"));
    expect(row).toBeDefined();
    expect(row?.desc).toBe(t("settings.defaultView.desc"));
    expect(row?.dropdown?.options.map((option) => option.value)).toEqual([
      "table", "board", "chart", "calendar", "timeline",
    ]);
    expect(row?.dropdown?.options.map((option) => option.text)).toEqual([
      t("common.tableView"),
      t("common.boardView"),
      t("common.chartView"),
      t("common.calendarView"),
      t("common.timelineView"),
    ]);
  });

  it("persists the chosen default view through the plugin settings field", () => {
    const plugin = createStubPlugin();
    new SettingsTab({} as App, plugin as unknown as NoteDatabasePlugin).display();

    const row = dom.instances.find((setting) => setting.name === t("settings.defaultView.name"));
    expect(row).toBeDefined();
    row?.dropdown?.select("calendar");

    expect(plugin.settings.defaultViewType).toBe("calendar");
    expect(plugin.saveSettings).toHaveBeenCalled();
  });

  it("keeps the gallery type out of the offered default views", () => {
    openTab();

    const row = dom.instances.find((setting) => setting.name === t("settings.defaultView.name"));
    expect(row?.dropdown?.options.some((option) => option.value === "gallery")).toBe(false);
  });

  it("keeps the list type out of the offered default views", () => {
    // Withdrawn from every picker, the same way the gallery already is: a database can no
    // longer be minted as a list, so the default-view dropdown must not offer one either.
    openTab();

    const row = dom.instances.find((setting) => setting.name === t("settings.defaultView.name"));
    expect(row?.dropdown?.options.some((option) => option.value === "list")).toBe(false);
  });

  it("normalises the stored default view to a known type", () => {
    expect(DEFAULT_VIEW_TYPES).toEqual(["table", "board", "chart", "calendar", "timeline"]);
    expect(normalizeDefaultViewType("timeline")).toBe("timeline");
    expect(normalizeDefaultViewType("table")).toBe("table");
    expect(normalizeDefaultViewType(undefined)).toBe("table");
    expect(normalizeDefaultViewType("gallery")).toBe("table");
    expect(normalizeDefaultViewType("list")).toBe("table");
    expect(normalizeDefaultViewType("bogus")).toBe("table");
  });
});
