import { t } from "../i18n";
import type { CreateEntryPosition, DatabaseConfig, NewRecordTemplateConfig } from "./types";

type ConfirmResult = boolean | string | undefined;

export interface TemplateToolbarOption extends NewRecordTemplateConfig {
  label: string;
}

export type NewRecordPlacement = "top" | "bottom";

export function hasRecordTemplate(config: DatabaseConfig | undefined): boolean {
  return !!config?.newRecordTemplate?.path;
}

export function getNewFromTemplateLabel(): string {
  return t("toolbar.newFromTemplate");
}

export function getNewFromTemplateTooltip(config: DatabaseConfig | undefined): string {
  return t("toolbar.newFromTemplateTooltip", {
    path: config?.newRecordTemplate?.path || "",
  });
}

/** Build a deterministic, duplicate-free list of vault template candidates. */
export function getRegisteredRecordTemplates(
  paths: readonly string[],
  configured?: NewRecordTemplateConfig,
): TemplateToolbarOption[] {
  const candidates = new Map<string, TemplateToolbarOption>();
  for (const path of paths) {
    const normalized = path.trim();
    if (!normalized || !normalized.toLowerCase().endsWith(".md")) continue;
    candidates.set(normalized, {
      path: normalized,
      engine: normalized === configured?.path ? configured.engine : "markdown",
      label: normalized.split("/").pop()?.replace(/\.md$/i, "") || normalized,
    });
  }
  if (configured?.path && !candidates.has(configured.path)) {
    candidates.set(configured.path, {
      ...configured,
      label: configured.path.split("/").pop()?.replace(/\.md$/i, "") || configured.path,
    });
  }
  return Array.from(candidates.values()).sort((a, b) => a.label.localeCompare(b.label) || a.path.localeCompare(b.path));
}

export function resolveTemplateOption(
  options: readonly TemplateToolbarOption[],
  path: string | undefined,
): TemplateToolbarOption | undefined {
  return path ? options.find((option) => option.path === path) : undefined;
}

export function getCreateEntryPosition(
  placement: NewRecordPlacement,
  firstPath?: string,
  lastPath?: string,
): CreateEntryPosition | undefined {
  if (placement === "top") return firstPath ? { beforePath: firstPath } : undefined;
  return lastPath ? { afterPath: lastPath } : undefined;
}

export async function executeNewFromTemplate(options: {
  config: DatabaseConfig | undefined;
  confirmEnabled: boolean;
  confirm: () => Promise<ConfirmResult>;
  createEntry: (position?: CreateEntryPosition) => void;
  position?: CreateEntryPosition;
}): Promise<void> {
  if (options.confirmEnabled && hasRecordTemplate(options.config)) {
    const confirmed = await options.confirm();
    if (confirmed !== true) return;
  }
  options.createEntry(options.position);
}
