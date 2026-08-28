// ───────────────────────────────────────────────────────────────────
// MODULE:    text-link-scheme-menu
// COMPONENT: fixed https/mailto/tel/none options for the column text-link-scheme picker
// ───────────────────────────────────────────────────────────────────
//
// getTextLinkSchemeChoice runs any persisted value back through
// isTextLinkScheme so a menu built from stale or hand-edited config data
// falls back to "none" instead of selecting a scheme that no longer exists.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isTextLinkScheme, TextLinkScheme } from "./text-link-scheme";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export type TextLinkSchemeChoice = TextLinkScheme | undefined;

export interface TextLinkSchemeMenuOption {
  readonly value: TextLinkSchemeChoice;
  readonly labelKey: string;
  readonly icon: string;
}

// ───────────────────────────────────────────────────────────────────
// 3. MENU OPTIONS
// ───────────────────────────────────────────────────────────────────

export const TEXT_LINK_SCHEME_MENU_OPTIONS: readonly TextLinkSchemeMenuOption[] = [
  { value: "https", labelKey: "menu.textLinkSchemeHttps", icon: "globe" },
  { value: "mailto", labelKey: "menu.textLinkSchemeEmail", icon: "mail" },
  { value: "tel", labelKey: "menu.textLinkSchemePhone", icon: "phone" },
  { value: undefined, labelKey: "menu.textLinkSchemeNone", icon: "minus" },
];

export function getTextLinkSchemeChoice(value: unknown): TextLinkSchemeChoice {
  return isTextLinkScheme(value) ? value : undefined;
}
