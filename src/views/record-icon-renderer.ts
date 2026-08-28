// ───────────────────────────────────────────────────────────────────
// MODULE:    record-icon-renderer
// COMPONENT: renders a row's or database's chosen icon (emoji or Lucide
//            glyph) and encodes/decodes it for dropdown menu options
// ───────────────────────────────────────────────────────────────────
//
// Valid Lucide icon ids are cached at module scope after the first
// `getIconIds()` call, since Obsidian's icon registry does not change
// during a session and re-querying it on every render would be wasted
// work; a token naming an icon no longer in the registry silently falls
// back to the default rather than rendering nothing.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { getIconIds, setIcon, setTooltip } from "obsidian";
import { parseRecordIconToken } from "../data/record-icon";
import type { DatabaseConfig } from "../data/types";

// ───────────────────────────────────────────────────────────────────
// 2. STATE & CONSTANTS
// ───────────────────────────────────────────────────────────────────

let validIconIds: Set<string> | undefined;
const DATABASE_DROPDOWN_ICON_PREFIX = "note-database-icon:";

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function getValidIconIdSet(): Set<string> {
  if (validIconIds) return validIconIds;
  try {
    validIconIds = new Set<string>(getIconIds());
  } catch {
    validIconIds = new Set<string>();
  }
  return validIconIds;
}

// ───────────────────────────────────────────────────────────────────
// 4. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export function renderRecordIcon(
  parent: HTMLElement,
  token: unknown,
  options: { compact?: boolean; editable?: boolean; tooltip?: string; defaultIcon?: string; onClick?: (anchor: HTMLElement) => void } = {},
): HTMLElement {
  const parsed = parseRecordIconToken(token, getValidIconIdSet());
  const button = parent.createSpan({
    cls: `db-record-icon${options.compact ? " is-compact" : ""}${parsed ? "" : " is-default"}${options.editable ? " is-editable" : ""}`,
    attr: options.editable ? { role: "button", tabindex: "0" } : {},
  });
  if (parsed?.kind === "emoji") {
    button.createSpan({ cls: "db-record-icon-emoji", text: parsed.emoji });
  } else {
    const icon = parsed?.kind === "lucide" ? parsed.icon : options.defaultIcon || "file-text";
    setIcon(button, icon);
    if (parsed?.kind === "lucide") button.addClass(`db-record-icon-color-${parsed.color}`);
  }
  if (options.tooltip) setTooltip(button, options.tooltip, { delay: 100 });
  if (options.editable && options.onClick) {
    button.onmousedown = (event) => event.stopPropagation();
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      options.onClick?.(button);
    };
    button.onkeydown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      options.onClick?.(button);
    };
  }
  return button;
}

export function getValidRecordIconIds(): string[] {
  return Array.from(getValidIconIdSet()).sort((a, b) => a.localeCompare(b));
}

export function getDatabaseDropdownIcon(database: DatabaseConfig, enabled = true): string | undefined {
  return enabled ? `${DATABASE_DROPDOWN_ICON_PREFIX}${database.icon || ""}` : undefined;
}

export function renderDatabaseDropdownIcon(parent: HTMLElement, icon: string): boolean {
  if (!icon.startsWith(DATABASE_DROPDOWN_ICON_PREFIX)) return false;
  const token = icon.slice(DATABASE_DROPDOWN_ICON_PREFIX.length);
  renderRecordIcon(parent, token, { compact: true, defaultIcon: "database" })
    .addClass("db-database-dropdown-icon");
  return true;
}
