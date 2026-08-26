import { isTextLinkScheme, TextLinkScheme } from "./textLinkScheme";

export type TextLinkSchemeChoice = TextLinkScheme | undefined;

export interface TextLinkSchemeMenuOption {
  readonly value: TextLinkSchemeChoice;
  readonly label: string;
  readonly icon: string;
}

export const TEXT_LINK_SCHEME_MENU_OPTIONS: readonly TextLinkSchemeMenuOption[] = [
  { value: "https", label: "HTTPS", icon: "globe" },
  { value: "mailto", label: "Email", icon: "mail" },
  { value: "tel", label: "Phone", icon: "phone" },
  { value: undefined, label: "None", icon: "minus" },
];

export function getTextLinkSchemeChoice(value: unknown): TextLinkSchemeChoice {
  return isTextLinkScheme(value) ? value : undefined;
}
