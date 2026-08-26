import { t } from "../i18n";
import type { DatabaseConfig } from "./types";

type ConfirmResult = boolean | string | undefined;

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

export async function executeNewFromTemplate(options: {
  config: DatabaseConfig | undefined;
  confirmEnabled: boolean;
  confirm: () => Promise<ConfirmResult>;
  createEntry: () => void;
}): Promise<void> {
  if (options.confirmEnabled && hasRecordTemplate(options.config)) {
    const confirmed = await options.confirm();
    if (confirmed !== true) return;
  }
  options.createEntry();
}
