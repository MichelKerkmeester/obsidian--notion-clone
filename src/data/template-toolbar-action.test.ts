// ───────────────────────────────────────────────────────────────────
// MODULE:    template-toolbar-action.test
// COMPONENT: tests for the "new from template" toolbar action
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { beforeEach, describe, expect, it, vi } from "vitest";
import { setLocale } from "../i18n";
import {
  executeNewFromTemplate,
  getCreateEntryPosition,
  getRegisteredRecordTemplates,
  getNewFromTemplateLabel,
  getNewFromTemplateTooltip,
  hasRecordTemplate,
} from "./template-toolbar-action";
import type { DatabaseConfig } from "./types";

const templateConfig = {
  newRecordTemplate: {
    path: "Templates/Meeting.md",
    engine: "markdown",
  },
} as DatabaseConfig;

// ───────────────────────────────────────────────────────────────────
// 2. TESTS
// ───────────────────────────────────────────────────────────────────

describe("TemplateToolbarAction", () => {
  beforeEach(() => {
    setLocale("en");
  });

  it("detects configured record templates and builds the display strings", () => {
    expect(hasRecordTemplate(undefined)).toBe(false);
    expect(hasRecordTemplate({
      ...templateConfig,
      newRecordTemplate: { path: "", engine: "markdown" },
    })).toBe(false);
    expect(hasRecordTemplate(templateConfig)).toBe(true);
    expect(getNewFromTemplateLabel()).toBe("New from template");
    expect(getNewFromTemplateTooltip(templateConfig)).toBe("New from template: Templates/Meeting.md");
  });

  it("creates once without confirmation when no template is configured", async () => {
    const confirm = vi.fn<() => Promise<boolean | string | undefined>>(async () => true);
    const createEntry = vi.fn();

    await executeNewFromTemplate({
      config: undefined,
      confirmEnabled: true,
      confirm,
      createEntry,
    });

    expect(confirm).not.toHaveBeenCalled();
    expect(createEntry).toHaveBeenCalledOnce();
  });

  it("passes the requested insertion position to the creator", async () => {
    const createEntry = vi.fn();
    await executeNewFromTemplate({
      config: undefined,
      confirmEnabled: false,
      confirm: async () => true,
      position: { beforePath: "first.md" },
      createEntry,
    });
    expect(createEntry).toHaveBeenCalledWith({ beforePath: "first.md" });
  });

  it("creates once only when enabled confirmation returns true", async () => {
    const confirm = vi.fn<() => Promise<boolean | string | undefined>>(async () => true);
    const createEntry = vi.fn();

    await executeNewFromTemplate({
      config: templateConfig,
      confirmEnabled: true,
      confirm,
      createEntry,
    });

    expect(confirm).toHaveBeenCalledOnce();
    expect(createEntry).toHaveBeenCalledOnce();
  });

  it.each([false, undefined])("does not create when confirmation returns %s", async (result) => {
    const confirm = vi.fn<() => Promise<boolean | string | undefined>>(async () => result);
    const createEntry = vi.fn();

    await executeNewFromTemplate({
      config: templateConfig,
      confirmEnabled: true,
      confirm,
      createEntry,
    });

    expect(confirm).toHaveBeenCalledOnce();
    expect(createEntry).not.toHaveBeenCalled();
  });

  it("returns sorted, duplicate-free vault templates and preserves the configured engine", () => {
    expect(getRegisteredRecordTemplates([
      "Templates/Z.md",
      "Templates/Meeting.md",
      "Templates/Z.md",
      "Assets/logo.png",
    ], { path: "Templates/Meeting.md", engine: "templater" })).toEqual([
      { path: "Templates/Meeting.md", engine: "templater", label: "Meeting" },
      { path: "Templates/Z.md", engine: "markdown", label: "Z" },
    ]);
  });

  it("resolves insertion positions from the selected placement", () => {
    expect(getCreateEntryPosition("top", "first.md", "last.md")).toEqual({ beforePath: "first.md" });
    expect(getCreateEntryPosition("bottom", "first.md", "last.md")).toEqual({ afterPath: "last.md" });
    expect(getCreateEntryPosition("bottom")).toBeUndefined();
  });
});
