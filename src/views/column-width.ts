// ───────────────────────────────────────────────────────────────────
// MODULE:    column-width
// COMPONENT: Estimates on-screen pixel widths for column headers and
//            cell content, used by manual width resolution and auto-fit,
//            plus the width-adjuster sheet that resizes a table column.
// ───────────────────────────────────────────────────────────────────
//
// Two measurement paths exist because canvas `measureText` needs a real
// DOM (`window.activeDocument`); `estimateTextFallback`'s per-character
// heuristic keeps auto-fit working in tests and other canvas-less
// environments. Markdown/link cells are measured on their rendered
// text, not the raw source, so `**bold**` or `[label](url)` syntax
// doesn't inflate the estimated width.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ColumnDef, RowData, ViewConfig } from "../data/types";
import { toMultiSelectValuesForKey } from "../data/column-types";
import { InlineMarkdownNode, parseInlineMarkdown, inlineMarkdownToPlainText } from "../data/inline-markdown";
import { parseTextLink } from "../data/text-link";
import { isTextLinkScheme } from "../data/text-link-scheme";
import { getRelationDisplayLabel, parseRelationValues } from "../data/relation-links";
import { setIcon } from "obsidian";
import { t } from "../i18n";
import { applySheetChrome, attachSheetDragToDismiss, playSheetEntrance } from "./mobile-bottom-sheet";
import { installPopoverAutoClose } from "./popover-auto-close";
import { isMobileBottomSheet, keepSheetPlaced, placeSheet } from "./popover-position";
import { syncTableColumnLayouts } from "./table-column-layout-sync";

// ───────────────────────────────────────────────────────────────────
// 2. PUBLIC WIDTH HELPERS
// ───────────────────────────────────────────────────────────────────

/** Resolved width (px) for a column: explicit columnWidths > col.width > defaultColumnWidth > fallback. */
export function getFieldWidth(config: ViewConfig, col: ColumnDef, fallback = 150): number {
  return config.columnWidths?.[col.key] || col.width || config.defaultColumnWidth || fallback;
}

/** Clamp a card field width so it stays strictly below the card width (value column must not fill the card). */
export function clampCardFieldWidth(fieldWidth: number, cardWidth: number): number {
  return Math.min(fieldWidth, Math.max(0, cardWidth - 1));
}

/** For auto-fit width: return the text a text column actually displays after
 *  `textRenderMode` rendering. `link` shows only the label, `markdown` strips
 *  markers — both shorter than the raw value, so measuring the raw value
 *  (`[label](url)`, `**bold**`) over-estimates the column width. Plain text and
 *  non-text columns return the input unchanged. */
export function resolveRenderedDisplayText(text: string, col: ColumnDef): string {
  if (isTextLinkScheme(col.textLinkScheme)) return text;
  if (col.textRenderMode === "link") {
    const link = parseTextLink(text);
    if (link) return link.label;
  }
  if (col.textRenderMode === "markdown") {
    const nodes = parseInlineMarkdown(text);
    if (nodes) return inlineMarkdownToPlainText(nodes);
  }
  return text;
}

// ───────────────────────────────────────────────────────────────────
// 3. AUTO-FIT ESTIMATION
// ───────────────────────────────────────────────────────────────────

let measureContext: CanvasRenderingContext2D | null | undefined;
let cachedFontFamily = "";

export function estimateAutoColumnWidth(
  col: ColumnDef,
  rows: RowData[],
  getDisplayText: (row: RowData, col: ColumnDef) => string,
  createRenderedTextMeasurer?: () => RenderedTextWidthMeasurer | null,
): number {
  const label = col.label || col.key;
  // Chrome the header name has to share the cell with: 8px padding either side, the 16px
  // type icon and its 6px margin, and the 22px menu button with its 2px margin. The button
  // sits in flow beside the name, so an auto-fit that ignored it would ellipsise the name.
  const headerWidth = Math.ceil(measureHeaderText(label) + 70);
  if (col.type === "checkbox") return Math.max(42, Math.min(headerWidth, 220));
  if (col.wrap) return Math.max(36, Math.min(headerWidth, 360));

  const renderedTextMeasurer = col.textRenderMode === "markdown" || col.textRenderMode === "link" || isTextLinkScheme(col.textLinkScheme)
    ? createRenderedTextMeasurer?.() ?? null
    : null;
  try {
    const valueWidth = rows.reduce((max, row) => {
      return Math.max(max, estimateCellContentWidth(col, row, getDisplayText, renderedTextMeasurer));
    }, 0);
    return Math.max(36, Math.min(Math.max(headerWidth, valueWidth), 800));
  } finally {
    renderedTextMeasurer?.dispose();
  }
}

export interface RenderedTextWidthMeasurer {
  measure(raw: string, mode: "markdown" | "link"): number | null;
  dispose(): void;
}

function estimateCellContentWidth(
  col: ColumnDef,
  row: RowData,
  getDisplayText: (row: RowData, col: ColumnDef) => string,
  renderedTextMeasurer: RenderedTextWidthMeasurer | null,
): number {
  if (col.type === "select" || col.type === "status") {
    const text = normalizeInlineText(getDisplayText(row, col));
    return text ? Math.ceil(measureBadgeText(text) + 34) : 0;
  }
  if (col.type === "multi-select") {
    const values = toMultiSelectValuesForKey(col.key, row.frontmatter[col.key]);
    if (values.length === 0) return 0;
    const badges = values.reduce((total, value) => total + measureBadgeText(value) + 14, 0);
    const gaps = Math.max(0, values.length - 1) * 4;
    return Math.ceil(Math.min(badges + gaps + 20, 560));
  }
  if (col.type === "relation") {
    const links = parseRelationValues(row.frontmatter[col.key]);
    if (links.length === 0) return 0;
    // Match RelationValueRenderer: each item shows an icon plus the alias or
    // basename, never the full wikilink syntax or folder path.
    const linksWidth = links.reduce((total, link) => {
      return total + measureBodyText(getRelationDisplayLabel(link)) + 27;
    }, 0);
    const gaps = Math.max(0, links.length - 1) * 4;
    return Math.ceil(Math.min(linksWidth + gaps + 20, 560));
  }
  const raw = getDisplayText(row, col);
  if (isTextLinkScheme(col.textLinkScheme)) {
    const text = normalizeInlineText(raw);
    if (!text) return 0;
    const link = parseTextLink(raw);
    if (link && normalizeInlineText(link.label) === text) {
      const domWidth = renderedTextMeasurer?.measure(raw, "link") ?? null;
      if (domWidth !== null) return domWidth;
    }
    return Math.ceil(measureBodyText(text) + 24 + 16);
  }
  if (col.textRenderMode === "markdown") {
    const domWidth = renderedTextMeasurer?.measure(raw, "markdown") ?? null;
    if (domWidth !== null) return domWidth;
    const nodes = parseInlineMarkdown(raw);
    if (nodes) return Math.ceil(measureMarkdownNodes(nodes) + 24);
  }
  if (col.textRenderMode === "link") {
    const domWidth = renderedTextMeasurer?.measure(raw, "link") ?? null;
    if (domWidth !== null) return domWidth;
    const link = parseTextLink(raw);
    if (link) return Math.ceil(measureBodyText(normalizeInlineText(link.label)) + 24 + (link.external ? 16 : 0));
  }
  const display = resolveRenderedDisplayText(raw, col);
  const text = normalizeInlineText(display);
  if (!text) return 0;
  return Math.ceil(measureBodyText(text) + 24);
}

// ───────────────────────────────────────────────────────────────────
// 4. MARKDOWN WIDTH ESTIMATION
// ───────────────────────────────────────────────────────────────────

interface MarkdownTextStyle {
  fontWeight: number;
  italic: boolean;
}

function measureMarkdownNodes(
  nodes: InlineMarkdownNode[],
  style: MarkdownTextStyle = { fontWeight: 400, italic: false },
): number {
  return nodes.reduce((total, node) => total + measureMarkdownNode(node, style), 0);
}

/** Canvas/fallback estimator for tests and the rare case where DOM layout is unavailable. */
function measureMarkdownNode(node: InlineMarkdownNode, style: MarkdownTextStyle): number {
  switch (node.type) {
    case "text":
      return measureStyledText(normalizeInlineText(node.text), 13, style.fontWeight, style.italic);
    case "bold":
      return measureMarkdownNodes(node.children, { ...style, fontWeight: 700 });
    case "italic":
      return measureMarkdownNodes(node.children, { ...style, italic: true });
    case "strike":
      return measureMarkdownNodes(node.children, style);
    case "highlight":
      return 2 + measureMarkdownNodes(node.children, style);
    case "code":
      return measureStyledText(node.text, 13 * 0.88, 400, false, getMonospaceFontFamily()) + 13 * 0.7;
    case "math":
      return estimateMathWidth(node.text);
    case "link":
      return measureMarkdownNodes(node.label, style) + (node.external ? 16 : 0);
    case "wikilink":
      return measureStyledText(node.label, 13, style.fontWeight, style.italic);
    case "image":
      return 20;
    case "br":
      return 0;
  }
}

// ───────────────────────────────────────────────────────────────────
// 5. MATH WIDTH ESTIMATION
// ───────────────────────────────────────────────────────────────────

function estimateMathWidth(tex: string): number {
  const commandGlyphs: Record<string, string> = {
    sum: "∑", prod: "∏", int: "∫", sqrt: "√", times: "×", cdot: "·",
    le: "≤", leq: "≤", ge: "≥", geq: "≥", neq: "≠", infty: "∞",
    alpha: "α", beta: "β", gamma: "γ", delta: "δ", theta: "θ", lambda: "λ",
    mu: "μ", pi: "π", sigma: "σ", phi: "φ", omega: "ω",
  };
  const visible = tex
    .replace(/\\(left|right)\b/g, "")
    .replace(/\\([A-Za-z]+)/g, (_match, command: string) => commandGlyphs[command] ?? "")
    .replace(/[{}_^]/g, "")
    .replace(/\\([{}_^])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const text = visible || "x";
  return measureStyledText(text, 13, 400, false) * 1.08 + 4;
}

// ───────────────────────────────────────────────────────────────────
// 6. TEXT MEASUREMENT
// ───────────────────────────────────────────────────────────────────

function normalizeInlineText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function measureHeaderText(text: string): number {
  return measureText(text, 13, 500);
}

function measureBodyText(text: string): number {
  return measureStyledText(text, 13, 400, false);
}

function measureBadgeText(text: string): number {
  return measureStyledText(text, 12, 500, false);
}

function measureText(text: string, fontSize: number, fontWeight: number): number {
  return measureStyledText(text, fontSize, fontWeight, false);
}

function measureStyledText(
  text: string,
  fontSize: number,
  fontWeight: number,
  italic: boolean,
  fontFamily?: string,
): number {
  if (!text) return 0;
  const context = getMeasureContext();
  if (!context) return estimateTextFallback(text, fontSize, fontWeight, italic);
  context.font = `${italic ? "italic " : ""}${fontWeight} ${fontSize}px ${fontFamily || getFontFamily()}`;
  return context.measureText(text).width;
}

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (measureContext !== undefined) return measureContext;
  if (typeof window === "undefined" || !window.activeDocument) {
    measureContext = null;
    return measureContext;
  }
  measureContext = window.activeDocument.createElement("canvas").getContext("2d");
  return measureContext;
}

function getFontFamily(): string {
  if (cachedFontFamily) return cachedFontFamily;
  if (typeof window === "undefined" || !window.activeDocument) {
    cachedFontFamily = "system-ui, sans-serif";
    return cachedFontFamily;
  }
  cachedFontFamily = window.getComputedStyle(window.activeDocument.body).fontFamily || "system-ui, sans-serif";
  return cachedFontFamily;
}

function getMonospaceFontFamily(): string {
  if (typeof window === "undefined" || typeof window.getComputedStyle !== "function" || !window.activeDocument?.body) return "monospace";
  return window.getComputedStyle(window.activeDocument.body).getPropertyValue("--font-monospace").trim() || "monospace";
}

function estimateTextFallback(text: string, fontSize: number, fontWeight = 400, italic = false): number {
  const base = Array.from(text).reduce((total, char) => {
    const code = char.codePointAt(0) || 0;
    if (code >= 0x2e80) return total + fontSize;
    if (/[A-ZMW@#%&]/.test(char)) return total + fontSize * 0.72;
    if (/[il.,'`:;|!]/.test(char)) return total + fontSize * 0.32;
    return total + fontSize * 0.54;
  }, 0);
  const weightScale = fontWeight >= 600 ? 1.08 : 1;
  return base * weightScale * (italic ? 1.02 : 1);
}

// ───────────────────────────────────────────────────────────────────
// 7. THE WIDTH ADJUSTER
// ───────────────────────────────────────────────────────────────────

const COLUMN_WIDTH_MIN = 60;
const COLUMN_WIDTH_MAX = 360;
const COLUMN_WIDTH_PRESETS = [
  { key: "narrow", width: 100 },
  { key: "medium", width: 150 },
  { key: "wide", width: 240 },
] as const;

function clampColumnWidth(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.round(value), min), max);
}

export interface ColumnWidthAdjusterOptions {
  /** The container that owns the table being resized; the live re-layout target. */
  root: HTMLElement;
  /** The column whose width is being adjusted. */
  col: ColumnDef;
  /** The live view config; widths are written here and re-laid out immediately. */
  config: ViewConfig;
  /** Commit a dirty width change (schedule the save and name the undo step). */
  persist(): void;
}

/**
 * Open the column-width adjuster: a shared bottom sheet on a phone, the fixed bottom panel it has
 * always been on desktop, both built from the same body markup.
 *
 * The phone presentation goes through the shared sheet host exactly like the owned menus do —
 * sheet chrome and portal, docked placement that follows the keyboard, the entrance, and the
 * drag handle — with the overlay stack owning dismissal, so Escape and a tap on the scrim close
 * it the same way they close every other sheet. The desktop presentation keeps its fixed panel
 * and its own backdrop; the scrim would be wrong there, and the panel's own rules already draw
 * the backdrop.
 *
 * Returns the close function; the caller owns it and must run it when the view goes away.
 */
export function openColumnWidthAdjuster(options: ColumnWidthAdjusterOptions): () => void {
  const { root, col, config } = options;
  const doc = root.ownerDocument;
  const sheet = isMobileBottomSheet(doc);

  const backdrop = sheet ? null : doc.body.createDiv({ cls: "db-mobile-column-width-backdrop" });
  const panel = doc.body.createDiv({ cls: "db-mobile-column-width-panel" });
  // The body below is built from the shared panel-family classes (`db-panel-header`,
  // `db-panel-row`, `db-view-config-range`, `db-new-placement`...), and every one of those rules
  // is written `.note-database-container .db-thing`. Filter, Sort and the view-config panel keep
  // matching after their own portal because they are BUILT inside the container and
  // `setSheetMount`'s move branch re-adds the class on the way to the body; this panel is created
  // on `doc.body` directly and never takes that branch, on either presentation, so without this
  // the shared classes above render as unstyled blocks and buttons — the operator's "bare strip"
  // report, reproduced by a different cause. The container's own `height: 100%` is corrected in
  // the stylesheet, right beside the rule it corrects.
  panel.addClass("note-database-container");

  // The same header grammar every other sheet carries: a title row with the close control on the
  // right, so the adjuster reads as part of the family rather than as a bare strip.
  const header = panel.createDiv({ cls: "db-panel-header" });
  header.createDiv({ cls: "db-panel-title", text: t("columnWidth.adjustTitle", { name: col.label || col.key }) });
  const closeBtn = header.createEl("button", {
    cls: "db-cell-edit-close",
    attr: { type: "button", "aria-label": t("common.close") },
  });
  setIcon(closeBtn, "x");

  // The shared range control: slider and typed value side by side in one row. Dragging cannot
  // hit an exact number, and matching a column to a known width is the whole reason someone
  // opens this panel.
  const widthRow = panel.createDiv({ cls: "db-panel-row" });
  const control = widthRow.createDiv({ cls: "db-view-config-range" });
  const slider = control.createEl("input", {
    attr: {
      type: "range",
      min: String(COLUMN_WIDTH_MIN),
      max: String(COLUMN_WIDTH_MAX),
      step: "1",
      "aria-label": t("menu.adjustColumnWidth"),
    },
  });
  const valueEl = control.createEl("input", {
    cls: "db-view-config-number",
    attr: {
      type: "number",
      inputmode: "numeric",
      min: String(COLUMN_WIDTH_MIN),
      step: "1",
      "aria-label": t("menu.adjustColumnWidth"),
    },
  });

  // The presets are the same exclusive-choice group the new-record placement uses: equal options
  // with one selected, so the current mode is visible instead of four flat tiles.
  const presetsRow = panel.createDiv({ cls: "db-panel-row" });
  const group = presetsRow.createDiv({
    cls: "db-new-placement",
    attr: { role: "group", "aria-label": t("menu.adjustColumnWidth") },
  });
  const presetButtons: Array<{ button: HTMLButtonElement; mode: "auto" | "width"; width: number }> = [];
  const addPresetButton = (mode: "auto" | "width", width: number, label: string): void => {
    const button = group.createEl("button", {
      cls: "db-new-placement-option",
      text: label,
      attr: { type: "button", role: "radio", "aria-checked": "false" },
    });
    presetButtons.push({ button, mode, width });
  };
  const presetLabels: Record<(typeof COLUMN_WIDTH_PRESETS)[number]["key"], string> = {
    narrow: t("columnWidth.narrow"),
    medium: t("columnWidth.medium"),
    wide: t("columnWidth.wide"),
  };
  addPresetButton("auto", 0, t("columnWidth.auto"));
  for (const preset of COLUMN_WIDTH_PRESETS) {
    addPresetButton("width", preset.width, presetLabels[preset.key]);
  }

  let dirty = false;
  let closed = false;

  const explicitWidth = (): number | null => config.columnWidths?.[col.key] ?? null;
  const fallbackWidth = (): number => col.width ?? config.defaultColumnWidth ?? 150;

  const reflect = (width: number): void => {
    const max = Math.max(COLUMN_WIDTH_MAX, Math.ceil(width));
    slider.max = String(max);
    slider.value = String(clampColumnWidth(width, COLUMN_WIDTH_MIN, max));
    // Never rewrite the field the user is typing into. Half-entered values are below the minimum
    // by definition, so echoing the clamped result back would eat their keystrokes.
    if (doc.activeElement !== valueEl) valueEl.value = String(Math.round(width));
    const explicit = explicitWidth();
    const auto = explicit === null;
    for (const { button, mode, width: presetWidth } of presetButtons) {
      const selected = mode === "auto" ? auto : !auto && explicit === presetWidth;
      button.setAttribute("aria-checked", String(selected));
      button.toggleClass("is-active", selected);
    }
  };

  const applyWidth = (width: number): void => {
    if (!Number.isFinite(width)) return;
    const nextWidth = Math.round(Math.max(COLUMN_WIDTH_MIN, width));
    config.columnWidths = { ...(config.columnWidths || {}), [col.key]: nextWidth };
    dirty = true;
    reflect(nextWidth);
    syncTableColumnLayouts(root, config);
  };

  // Auto means "let the column size itself": remove the explicit width so the column's own width
  // or the view default applies, rather than pinning whatever was measured at open time.
  const clearWidth = (): void => {
    if (explicitWidth() === null) return;
    const next = { ...(config.columnWidths || {}) };
    delete next[col.key];
    config.columnWidths = next;
    dirty = true;
    reflect(fallbackWidth());
    syncTableColumnLayouts(root, config);
  };

  slider.oninput = () => applyWidth(Number(slider.value));
  slider.onchange = () => options.persist();
  valueEl.oninput = () => {
    const typed = Number(valueEl.value);
    // An empty or part-typed field is not a width yet; wait rather than snapping to the minimum.
    if (valueEl.value.trim() === "" || !Number.isFinite(typed)) return;
    applyWidth(typed);
  };
  valueEl.onchange = () => {
    applyWidth(Number(valueEl.value));
    // Commit echoes the clamped result back, which is the point at which the user should see
    // the value their input actually resolved to.
    valueEl.value = String(config.columnWidths?.[col.key] ?? COLUMN_WIDTH_MIN);
    options.persist();
  };
  for (const { button, mode, width: presetWidth } of presetButtons) {
    button.onclick = () => {
      if (mode === "auto") clearWidth();
      else applyWidth(presetWidth);
      options.persist();
    };
  }

  let releaseDrag: (() => void) | undefined;
  let releasePlacement: (() => void) | undefined;
  let removeAutoClose: (() => void) | undefined;

  const close = (): void => {
    if (closed) return;
    closed = true;
    if (dirty) options.persist();
    releaseDrag?.();
    releasePlacement?.();
    removeAutoClose?.();
    // Take the sheet chrome down before the node goes: the backdrop is a body sibling, so
    // removing the panel alone would leave the app dimmed behind a surface that is no longer there.
    if (panel.hasClass("db-mobile-bottom-sheet")) applySheetChrome(panel, false);
    panel.remove();
    backdrop?.remove();
  };

  if (sheet) {
    // The shared scrim is the backdrop here, and it takes the tap: dismissing the adjuster must
    // not also edit a cell underneath on the way out.
    applySheetChrome(panel, true, { scrimCapturesPointer: true });
    placeSheet(panel);
    releasePlacement = keepSheetPlaced(panel);
    playSheetEntrance(panel);
    releaseDrag = attachSheetDragToDismiss(panel, close);
  }
  // One owner for dismissal on both presentations: the overlay stack answers Escape and any
  // press outside the panel — the scrim on a phone, the backdrop on desktop.
  removeAutoClose = installPopoverAutoClose({ panel, close });

  closeBtn.onclick = (event) => {
    event.stopPropagation();
    close();
  };

  reflect(fallbackWidth());
  return close;
}
