import { App, TFile } from "obsidian";
import { ColumnDef, RowData } from "./types";
import { hasUrlScheme } from "./TextLink";

export interface ParsedImage {
  alt: string;
  label: string;
  target: string;
  src: string;
  external: boolean;
}

const IMAGE_TARGET_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp)(?:[?#].*)?$/i;

export function isImageTarget(target: string): boolean {
  return IMAGE_TARGET_RE.test(target);
}

/** Resolve an internal/external image target to a displayable src.
 *  External targets are returned as-is; internal targets resolve via the vault
 *  (metadataCache.getFirstLinkpathDest + getResourcePath). Returns null if unresolved. */
function resolveImageSrc(app: App, row: RowData, target: string, external: boolean): string | null {
  if (external) return target;
  const file = app.metadataCache.getFirstLinkpathDest(target, row.file.path);
  return file instanceof TFile ? app.vault.getResourcePath(file) : null;
}

/** Parse a raw cover value into a displayable image, or null.
 *  Accepts web URLs, markdown `![alt](target)`, wikilinks `![[target|alt]]` / `[[target]]`,
 *  and bare vault paths. Non-image extensions and unresolvable internal targets return null. */
export function parseCoverImage(value: unknown, row: RowData, app: App): ParsedImage | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  let target = text;
  let alt = text;
  const mdImg = text.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  const wikiImg = text.match(/^!?\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/);
  if (mdImg) { target = mdImg[2]; alt = mdImg[1] || mdImg[2]; }
  else if (wikiImg) { target = wikiImg[1]; alt = wikiImg[2] || wikiImg[1]; }
  if (!isImageTarget(target)) return null;
  // Any explicit URI scheme (not just http/https) must be treated as external so a
  // non-http(s) scheme (javascript:, file:, data:, ...) can never be mistaken for a
  // vault-internal target and routed through vault resolution.
  const external = hasUrlScheme(target);
  const src = resolveImageSrc(app, row, target, external);
  if (!src) return null;
  return { alt, label: alt, target, src, external };
}

/** Read a cover field from a row's frontmatter and return the first parseable image.
 *  Supports array values (e.g. multi-select / tags) by taking the first valid image. */
export function resolveCoverImage(field: string | undefined, row: RowData, app: App): ParsedImage | null {
  if (!field) return null;
  const value = row.frontmatter[field];
  const values = Array.isArray(value) ? value : [value];
  for (const entry of values) {
    const image = parseCoverImage(entry, row, app);
    if (image) return image;
  }
  return null;
}

/** Whether a resolved (non-null) cover image must be treated as empty for its source
 *  column. Files/Attachments columns only ever store vault-relative links written
 *  through the app; a raw http(s) URL sitting there can only arrive via a hand-edited
 *  frontmatter value that bypassed the app's write-time URL strip, so it must never
 *  render as a live network image. Callers still need their own null check on `image`. */
export function isCoverImageBlocked(image: ParsedImage, columnType: ColumnDef["type"] | undefined): boolean {
  return columnType === "files" && image.external;
}
