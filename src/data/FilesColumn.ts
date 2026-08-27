/**
 * Vault-local files column helpers.
 *
 * File values are kept as strings so they can be stored directly in
 * frontmatter.  The module deliberately has no dependency on a cell renderer:
 * callers can normalize/edit values without creating DOM, and can render a
 * value without adding a write or file-system probe to the display path.
 */

import type { App, TFile } from "obsidian";
import { isImageTarget as isCoverImageTarget } from "./CoverImage";
import { hasUrlScheme, getLinkLabel } from "./TextLink";
import { stringifyValue } from "./Stringify";
import type { RowData } from "./types";

/** Maximum number of file chips shown before an overflow chip is added. */
export const FILE_CHIP_CAP = 5;

/**
 * Broad display categories used by file-chip consumers.
 *
 * The value is intentionally derived from the target extension rather than
 * from a MIME lookup, which keeps the column usable for files that are not
 * currently downloaded to the device.
 */
export type FileType = "image" | "pdf" | "document" | "audio" | "video" | "archive" | "file";

interface ParsedFileValue {
  /** The target passed to Obsidian for resolution/opening. */
  target?: string;
  /** The human-readable chip label. */
  label: string;
  /** Canonical value stored by normalize, or the raw malformed text. */
  serialized: string;
  /** Malformed input remains visible but is not made into a link. */
  malformed: boolean;
}

/**
 * Normalize a files-column value into vault wikilink strings.
 *
 * Explicit wikilinks, markdown links, and bare paths are accepted.  Explicit
 * external URLs are discarded, while malformed link-like text is preserved so
 * a bad value remains visible as a harmless text chip.  The first occurrence
 * of each parsed target wins.
 */
export function normalize(value: unknown): string[] {
  const entries = Array.isArray(value) ? value : [value];
  const normalized: string[] = [];
  const seenTargets = new Set<string>();

  for (const entry of entries) {
    const parsed = parseFileValue(entry);
    if (!parsed) continue;

    const key = parsed.target === undefined
      ? `raw:${parsed.serialized}`
      : `target:${parsed.target}`;
    if (seenTargets.has(key)) continue;

    seenTargets.add(key);
    normalized.push(parsed.serialized);
  }

  return normalized;
}

/** Serialize a files value for the existing text editor. */
export function formatForEdit(value: unknown): string {
  return (Array.isArray(value) ? normalize(value) : parseEdit(value)).join("\n");
}

/**
 * Parse newline- or comma-separated editor text into normalized file values.
 *
 * Separators inside a wikilink or markdown link are retained, which avoids
 * splitting a valid vault path merely because its filename contains a comma.
 */
export function parseEdit(value: unknown): string[] {
  if (Array.isArray(value)) return normalize(value);
  if (value == null) return [];

  const text = stringifyValue(value);
  if (!text.trim()) return [];
  return normalize(splitEditEntries(text));
}

/**
 * Resolve one vault target through Obsidian's metadata cache.
 *
 * No vault scan or adapter check is performed.  A missing app, malformed
 * target, or resolver error is treated as an unresolved target.
 */
export function resolveFileTarget(app: App | undefined, row: RowData, target: string): TFile | null {
  const parsed = parseFileValue(target);
  if (!app || !parsed?.target) return null;

  try {
    return app.metadataCache.getFirstLinkpathDest(parsed.target, row.file.path);
  } catch {
    return null;
  }
}

/** Delegate image eligibility to the existing conservative cover matcher. */
export function isImageTarget(target: string): boolean {
  return isCoverImageTarget(target);
}

/** Classify a target for an optional type icon or other display affordance. */
export function classifyFileType(target: string): FileType {
  if (isImageTarget(target)) return "image";

  const extension = getFileExtension(target);
  if (extension === "pdf") return "pdf";
  if (DOCUMENT_EXTENSIONS.has(extension)) return "document";
  if (AUDIO_EXTENSIONS.has(extension)) return "audio";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  if (ARCHIVE_EXTENSIONS.has(extension)) return "archive";
  return "file";
}

/**
 * Render vault file chips with a bounded visible count.
 *
 * Every normalized name is placed on the wrapper tooltip, while only the
 * first FILE_CHIP_CAP entries receive file chips.  Resolved chips open through
 * Obsidian; unresolved and malformed values remain non-opening display chips.
 */
export function renderChips(
  parent: HTMLElement,
  app: App | undefined,
  row: RowData,
  values: readonly string[],
): void {
  const normalized = normalize(values);
  if (normalized.length === 0) return;

  const links = normalized
    .map(parseFileValue)
    .filter((value): value is ParsedFileValue => value !== null);
  if (links.length === 0) return;

  const wrap = parent.createDiv({ cls: "db-file-link-list" });
  setTooltip(wrap, links.map((link) => link.label));

  for (const link of links.slice(0, FILE_CHIP_CAP)) {
    const type = link.target ? classifyFileType(link.target) : "file";
    const itemClass = `db-file-link-list-item db-file-link-type-${type}`;

    if (link.malformed || !link.target) {
      const item = wrap.createSpan({ cls: itemClass, text: link.label });
      item.title = link.label;
      continue;
    }

    const destination = resolveFileTarget(app, row, link.target);
    const anchor = wrap.createEl("a", {
      cls: `internal-link ${itemClass}${destination ? "" : " is-unresolved"}`,
      attr: { href: "#", title: link.target },
    });

    appendChipContent(anchor, app, link, destination);
    anchor.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!destination) return;
      void app?.workspace?.openLinkText(link.target!, row.file.path, false);
    };
  }

  const overflow = links.length - FILE_CHIP_CAP;
  if (overflow > 0) {
    const overflowChip = wrap.createSpan({
      cls: "db-file-link-list-item db-file-link-list-overflow",
      text: `+${overflow}`,
    });
    overflowChip.title = links.slice(FILE_CHIP_CAP).map((link) => link.label).join(", ");
    overflowChip.setAttribute("aria-label", `${overflow} more files`);
  }
}

function parseFileValue(value: unknown): ParsedFileValue | null {
  const raw = getRawFileText(value);
  const text = raw.trim();
  if (!text) return null;
  if (hasUrlScheme(text)) return null;

  const wikilink = text.match(/^\[\[([\s\S]*?)\]\]$/);
  if (wikilink) {
    const inner = wikilink[1].trim();
    const separator = inner.indexOf("|");
    const target = (separator >= 0 ? inner.slice(0, separator) : inner).trim();
    const label = separator >= 0
      ? inner.slice(separator + 1).trim() || getLinkLabel(target)
      : getLinkLabel(target);

    if (!target) return malformedFileValue(text);
    if (hasUrlScheme(target)) return null;
    return {
      target,
      label,
      serialized: toWikilink(target, separator >= 0 ? label : undefined),
      malformed: false,
    };
  }

  const markdownLink = text.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (markdownLink) {
    const target = markdownLink[2].trim();
    const label = markdownLink[1].trim() || getLinkLabel(target);
    if (!target) return malformedFileValue(text);
    if (hasUrlScheme(target)) return null;
    return {
      target,
      label,
      serialized: toWikilink(target, label),
      malformed: false,
    };
  }

  // Link-shaped text that failed either grammar is deliberately not promoted
  // to a phantom vault link.
  if (text.startsWith("[") || text.startsWith("!")) return malformedFileValue(text);

  return {
    target: text,
    label: getLinkLabel(text),
    serialized: toWikilink(text),
    malformed: false,
  };
}

function malformedFileValue(text: string): ParsedFileValue {
  return {
    label: text,
    serialized: text,
    malformed: true,
  };
}

function getRawFileText(value: unknown): string {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const object = value as Record<string, unknown>;
    if (typeof object.path === "string") return object.path;
    if (typeof object.link === "string") return object.link;
    if (typeof object.name === "string") return object.name;
  }
  return stringifyValue(value);
}

function toWikilink(target: string, label?: string): string {
  return label && label !== getLinkLabel(target)
    ? `[[${target}|${label}]]`
    : `[[${target}]]`;
}

function splitEditEntries(text: string): string[] {
  const entries: string[] = [];
  let start = 0;
  let wikilinkDepth = 0;
  let markdownParentheses = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (text.startsWith("[[", index)) {
      wikilinkDepth += 1;
      index += 1;
      continue;
    }
    if (wikilinkDepth > 0 && text.startsWith("]]", index)) {
      wikilinkDepth -= 1;
      index += 1;
      continue;
    }

    if (wikilinkDepth === 0 && text[index] === "(") {
      markdownParentheses += 1;
      continue;
    }
    if (wikilinkDepth === 0 && markdownParentheses > 0 && text[index] === ")") {
      markdownParentheses -= 1;
      continue;
    }

    const isSeparator = (text[index] === "\n" && wikilinkDepth === 0 && markdownParentheses === 0) ||
      (text[index] === "," && wikilinkDepth === 0 && markdownParentheses === 0);
    if (isSeparator) {
      entries.push(text.slice(start, index));
      start = index + 1;
    }
  }

  entries.push(text.slice(start));
  return entries;
}

function getFileExtension(target: string): string {
  const path = target.split(/[?#]/, 1)[0] || "";
  const match = path.match(/\.([a-z0-9]+)$/i);
  return match?.[1].toLowerCase() || "";
}

function setTooltip(element: HTMLElement, names: string[]): void {
  const text = names.join(", ").trim();
  if (text) element.title = text;
}

function appendChipContent(
  anchor: HTMLAnchorElement,
  app: App | undefined,
  link: ParsedFileValue,
  destination: TFile | null,
): void {
  if (destination && app?.vault && isImageTarget(link.target || "")) {
    try {
      const resourcePath = app.vault.getResourcePath(destination);
      if (resourcePath) {
        const thumbnail = anchor.createEl("img", {
          cls: "db-file-link-list-item-thumbnail",
          attr: { src: resourcePath, alt: link.label, draggable: "false" },
        });
        thumbnail.setCssProps({
          width: "18px",
          height: "18px",
          objectFit: "cover",
          marginRight: "4px",
        });
      }
    } catch {
      // A resource path can be temporarily unavailable while a vault file is
      // materializing.  The filename chip remains useful in that state.
    }
  }

  anchor.createSpan({ cls: "db-file-link-list-item-label", text: link.label });
}

const DOCUMENT_EXTENSIONS = new Set([
  "doc", "docx", "odt", "rtf", "txt", "md", "markdown", "csv", "tsv",
  "xls", "xlsx", "ods", "ppt", "pptx", "odp", "json", "xml",
]);

const AUDIO_EXTENSIONS = new Set([
  "aac", "flac", "m4a", "mp3", "oga", "ogg", "opus", "wav", "weba", "wma",
]);

const VIDEO_EXTENSIONS = new Set([
  "avi", "m4v", "mkv", "mov", "mp4", "mpeg", "mpg", "ogv", "webm", "wmv",
]);

const ARCHIVE_EXTENSIONS = new Set([
  "7z", "bz2", "gz", "rar", "tar", "xz", "zip",
]);
