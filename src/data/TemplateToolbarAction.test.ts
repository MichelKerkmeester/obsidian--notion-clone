import { beforeEach, describe, expect, it, vi } from "vitest";
import { setLocale } from "../i18n";
import {
  executeNewFromTemplate,
  getNewFromTemplateLabel,
  getNewFromTemplateTooltip,
  hasRecordTemplate,
} from "./TemplateToolbarAction";
import type { DatabaseConfig } from "./types";

const templateConfig = {
  newRecordTemplate: {
    path: "Templates/Meeting.md",
    engine: "markdown",
  },
} as DatabaseConfig;

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
});
