import { isTextLinkScheme, TextLinkScheme } from "./textLinkScheme";

export type TextLinkSchemeChoice = TextLinkScheme | undefined;

export interface TextLinkSchemeMenuOption {
  readonly value: TextLinkSchemeChoice;
  readonly labelKey: string;
  readonly icon: string;
}

export const TEXT_LINK_SCHEME_MENU_OPTIONS: readonly TextLinkSchemeMenuOption[] = [
  { value: "https", labelKey: "menu.textLinkSchemeHttps", icon: "globe" },
  { value: "mailto", labelKey: "menu.textLinkSchemeEmail", icon: "mail" },
  { value: "tel", labelKey: "menu.textLinkSchemePhone", icon: "phone" },
  { value: undefined, labelKey: "menu.textLinkSchemeNone", icon: "minus" },
];

export function getTextLinkSchemeChoice(value: unknown): TextLinkSchemeChoice {
  return isTextLinkScheme(value) ? value : undefined;
}
