// ───────────────────────────────────────────────────────────────────
// MODULE:    title-field-display
// COMPONENT: resolve a view's configured title field into display text for card/list titles
// ───────────────────────────────────────────────────────────────────
//
// titleField may point at a real column, a synthetic file.* pseudo-field
// (name/basename/path/tags/...), or NO_TITLE_FIELD to hide the title
// entirely — this is the one place that reconciles those three cases so
// renderers don't each re-implement the file.* lookup table.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { getColumnDisplayType, isEmptyValue } from "./column-display";
import { formatDateTimeValueDisplay, formatDateValueDisplay } from "./date-time-format";
import { formatEuroCurrency, formatEuroNumber } from "./euro-format";
import { stringifyValue } from "./stringify";
import { ColumnDef, NO_TITLE_FIELD, RowData, ViewConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export const EMPTY_TITLE_PLACEHOLDER = "—";

export interface TitleFieldDisplay {
  field: string | undefined;
  text: string;
  isEmpty: boolean;
  isFileTitle: boolean;
  isHidden: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. RESOLVE TITLE FIELD DISPLAY
// ───────────────────────────────────────────────────────────────────

export function resolveTitleFieldDisplay(row: RowData, config: ViewConfig, titleField: string | undefined): TitleFieldDisplay {
  if (titleField === NO_TITLE_FIELD) {
    return { field: titleField, text: "", isEmpty: false, isFileTitle: false, isHidden: true };
  }

  const field = titleField || "file.name";
  if (field === "file.name" || field === "file.basename") {
    return {
      field,
      text: getFileTitleText(row),
      isEmpty: false,
      isFileTitle: true,
      isHidden: false,
    };
  }

  const value = getTitleFieldValue(row, config, field);
  const text = formatTitleFieldText(config, field, value);
  return {
    field,
    text: text || EMPTY_TITLE_PLACEHOLDER,
    isEmpty: !text,
    isFileTitle: false,
    isHidden: false,
  };
}

/** A title carries no format of its own — it reads whichever column it points at, so a
 *  currency- or date-titled card always agrees with what that same column shows as an
 *  ordinary field. A field with no matching column (an unmapped file.* pseudo-field, or a
 *  deleted column reference) keeps the prior plain-stringified behavior unchanged. */
function formatTitleFieldText(config: ViewConfig, field: string, value: unknown): string {
  const col = config.schema.columns.find((candidate) => candidate.key === field);
  if (!col) return stringifyValue(value).trim();
  const displayType = getColumnDisplayType(col, config.schema.computedFields);
  if (displayType === "currency" || displayType === "number") {
    const num = toTitleDisplayNumber(value);
    if (Number.isNaN(num)) return nonNumericTitleText(value);
    return displayType === "currency" ? formatEuroCurrency(num) : formatEuroNumber(num);
  }
  if (displayType === "date") return formatDateValueDisplay(value).trim();
  if (displayType === "datetime") return formatDateTimeValueDisplay(value, { showTimeWhenMissing: true }).trim();
  return stringifyValue(value).trim();
}

/** Mirrors the cell renderer's own numeric-cell reading: a real number stays a number, and
 *  anything with genuinely nothing to print becomes NaN rather than the misleading 0 that
 *  Number(undefined) or Number("") would otherwise produce. */
function toTitleDisplayNumber(value: unknown): number {
  if (typeof value === "number") return value;
  return hasNothingToPrint(value) ? Number.NaN : Number(value);
}

/** What a numeric title prints when its value is not a number: the value itself, matching
 *  the cell renderer's own fallback, so a currency/number title never renders "NaN". */
function nonNumericTitleText(value: unknown): string {
  if (hasNothingToPrint(value)) return "";
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function hasNothingToPrint(value: unknown): boolean {
  return isEmptyValue(value) || String(value).trim() === "";
}

function getFileTitleText(row: RowData): string {
  return row.file.basename || row.file.name.replace(/\.md$/i, "");
}

function getTitleFieldValue(row: RowData, config: ViewConfig, field: string): unknown {
  if (isTitleFileFieldKey(field)) return getTitleFileFieldValue(row, field);
  const col = config.schema.columns.find((candidate) => candidate.key === field);
  if (!col) return undefined;
  return getColumnValue(row, col);
}

function getColumnValue(row: RowData, col: ColumnDef): unknown {
  if (isTitleFileFieldKey(col.key)) return getTitleFileFieldValue(row, col.key);
  if (col.type === "computed" || col.type === "rollup") {
    return row.computed[col.type === "computed" ? col.computedKey || col.key : col.key];
  }
  return row.frontmatter[col.key];
}

function isTitleFileFieldKey(key: string): boolean {
  return key.startsWith("file.");
}

// ───────────────────────────────────────────────────────────────────
// 4. FILE PSEUDO-FIELD LOOKUP
// ───────────────────────────────────────────────────────────────────

function getTitleFileFieldValue(row: RowData, key: string): unknown {
  if (key === "file.name") return row.file.name;
  if (key === "file.file") return row.file.path;
  if (key === "file.basename") return row.file.basename || row.file.name.replace(/\.md$/i, "");
  if (key === "file.path") return row.file.path;
  if (key === "file.folder") return row.file.parent?.path || "";
  if (key === "file.ext" || key === "file.extension") return row.file.extension;
  if (key === "file.ctime" || key === "file.created") return row.file.stat.ctime;
  if (key === "file.mtime" || key === "file.modified") return row.file.stat.mtime;
  if (key === "file.size") return row.file.stat.size;
  if (key === "file.tags") return row.frontmatter.tags;
  if (key === "file.links") return row.cache?.links?.map((link) => link.link) || [];
  if (key === "file.embeds") return row.cache?.embeds?.map((link) => link.link) || [];
  if (key === "file.properties") return row.frontmatter;
  return undefined;
}
