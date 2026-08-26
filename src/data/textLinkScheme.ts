export type TextLinkScheme = "https" | "mailto" | "tel";

export const TEXT_LINK_SCHEMES = ["https", "mailto", "tel"] as const;

const URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const TEL_SEPARATOR_RE = /[\s()-]/g;

export function isTextLinkScheme(value: unknown): value is TextLinkScheme {
  return typeof value === "string" && (TEXT_LINK_SCHEMES as readonly string[]).includes(value);
}

export function assembleSchemeLinkTarget(scheme: unknown, value: unknown): string | null {
  if (!isTextLinkScheme(scheme) || typeof value !== "string") return null;

  const text = value.trim();
  if (!text || text.length > 2048 || /[\r\n\t]/.test(text)) return null;

  const existingScheme = text.match(URL_SCHEME_RE)?.[0].slice(0, -1).toLowerCase();
  if (existingScheme) {
    const inFamily = scheme === "https"
      ? existingScheme === "http" || existingScheme === "https"
      : existingScheme === scheme;
    if (!inFamily) return null;
  }

  const target = existingScheme
    ? text
    : scheme === "https"
      ? `https://${text}`
      : `${scheme}:${text}`;
  return scheme === "tel" ? target.replace(TEL_SEPARATOR_RE, "") : target;
}
