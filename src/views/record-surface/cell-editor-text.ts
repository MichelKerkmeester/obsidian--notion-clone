// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-text
// COMPONENT: the text/files inline editor, extracted behind CellRenderer.startEdit
// ───────────────────────────────────────────────────────────────────
//
// Body moved unchanged from `CellRenderer.editText`/`editTextPopover`: the plain-input
// path, the popover/textarea path with its markdown toolbar and paste-URL-as-link behaviour, and
// the mobile inline-overlay branch are the same code that shipped before this extraction.
// `CellRenderer.editText` is a one-line wrapper over `openTextEditor` below.
//
// `openSingleLineEditor` (was `CellRenderer.editSingleLinePopover`) is exported from here rather
// than kept private: it is a shared single-line-popover primitive the number editor and the
// file-name rename affordance both reuse, and this module is its natural home among the inline
// text-shaped editors.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon, setTooltip } from "obsidian";
import { isFileFieldKey } from "../../data/file-fields";
import { isImeComposing } from "../../data/keyboard-utils";
import { safeString } from "../../data/safe-string";
import { normalizeExternalUrlTarget } from "../../data/text-link";
import { isTouchDevice } from "../../data/touch-environment";
import { ColumnDef, RowData } from "../../data/types";
import { t } from "../../i18n";
import { claimBottomDock } from "../mobile-bottom-sheet";
import { isHTMLElement } from "../dom-guards";
import { clamp, getVisiblePopoverBounds, resolveAnchoredPopoverTop, setPosition } from "../popover-position";
import type { TableCellNavigationIntent } from "../../data/table-keyboard-navigation";
import { bulkAnchorRect, renderDraftFailure, showValidationError, type CellEditorContext, type CellEditSession } from "./cell-editor-shared";

export type EditorSaveResult = void | boolean | "validation" | { validationMessage: string };

// ───────────────────────────────────────────────────────────────────
// 2. LOCAL HELPERS
// ───────────────────────────────────────────────────────────────────

function restoreTextDisplay(td: HTMLElement, currentValue: unknown, origText: string): void {
  td.textContent = origText || safeString(currentValue);
}

function shouldUsePopoverEditor(_target: HTMLElement, col: ColumnDef, _value: string): boolean {
  return col.type === "text" || col.type === "files";
}

function mountInput(td: HTMLElement, input: HTMLInputElement): void {
  td.addClass("db-cell-editing");
  input.setCssProps({ width: "100%" });
  td.textContent = "";
  td.appendChild(input);
  input.focus();
  input.select();
}

function autoGrowTextarea(textarea: HTMLTextAreaElement, maxHeight: number): void {
  textarea.setCssProps({ height: "auto" });
  const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
  textarea.setCssProps({ height: `${nextHeight}px`, "overflow-y": textarea.scrollHeight > maxHeight ? "auto" : "hidden" });
}

function positionTextEditPopover(popover: HTMLElement, td: HTMLElement, container: HTMLElement | null, isMobile = false, session?: CellEditSession): void {
  if (isMobile) {
    popover.setCssProps({ left: "10px", right: "10px", bottom: "calc(10px + env(safe-area-inset-bottom, 0px))", top: "", width: "auto" });
    return;
  }
  const margin = 8;
  const a = bulkAnchorRect(session);
  const rect = a ?? td.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const bounds = getVisiblePopoverBounds(container);
  const width = Math.min(Math.max(rect.width, popoverRect.width || 0, 220), Math.min(520, bounds.width - margin * 2));
  const left = clamp(rect.left, bounds.left + margin, bounds.right - width - margin);
  const height = Math.min(popover.scrollHeight || popoverRect.height || 0, bounds.height - margin * 2);
  let top: number;
  if (a) {
    top = resolveAnchoredPopoverTop(a, bounds, height, 4, margin).top;
  } else {
    const below = bounds.bottom - rect.top - margin;
    const above = rect.bottom - bounds.top - margin;
    const useAbove = above > below && below < height;
    top = useAbove ? rect.bottom - height : rect.top;
    top = clamp(top, bounds.top + margin, bounds.bottom - height - margin);
  }

  popover.setCssProps({ width: `${width}px` });
  setPosition(
    popover,
    left,
    top,
    container?.getBoundingClientRect(),
    container?.scrollLeft || 0,
    container?.scrollTop || 0
  );
}

function handleEditKey(
  event: KeyboardEvent,
  save: (intent?: TableCellNavigationIntent) => Promise<void>,
  cancel: (intent?: TableCellNavigationIntent) => void
): void {
  if (isImeComposing(event)) return;
  let intent: TableCellNavigationIntent | undefined;
  if (event.key === "Enter") intent = event.shiftKey ? "up" : "down";
  else if (event.key === "Tab") intent = event.shiftKey ? "previous" : "next";
  else if (event.key === "Escape") intent = "stay";
  if (!intent) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.key === "Escape") cancel(intent);
  else void save(intent);
}

/** Wrap the textarea's current selection with prefix/suffix. When nothing is
 *  selected, insert `placeholder` between the markers and select it. */
function wrapSelection(textarea: HTMLTextAreaElement, prefix: string, suffix: string, placeholder: string): void {
  const value = textarea.value;
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const selected = value.slice(start, end);
  const inner = selected || placeholder;
  textarea.value = value.slice(0, start) + prefix + inner + suffix + value.slice(end);
  // Select the inner text so the user can keep typing / re-wrap.
  const innerStart = start + prefix.length;
  textarea.focus();
  textarea.setSelectionRange(innerStart, innerStart + inner.length);
  textarea.dispatchEvent(new Event("input"));
}

/** Build a format toolbar above the textarea for markdown-mode text columns.
 *  Each button wraps/inserts the matching marker around the current selection,
 *  then keeps focus in the textarea. */
function buildMarkdownToolbar(popover: HTMLElement, textarea: HTMLTextAreaElement): void {
  const bar = createDiv({ cls: "db-md-toolbar" });
  // Insert before the textarea so the toolbar sits on top.
  textarea.parentElement?.insertBefore(bar, textarea);

  const buttons: { icon: string; title: string; run: () => void }[] = [
    { icon: "bold", title: t("mdToolbar.bold"), run: () => wrapSelection(textarea, "**", "**", t("mdToolbar.bold")) },
    { icon: "italic", title: t("mdToolbar.italic"), run: () => wrapSelection(textarea, "*", "*", t("mdToolbar.italic")) },
    { icon: "strikethrough", title: t("mdToolbar.strike"), run: () => wrapSelection(textarea, "~~", "~~", t("mdToolbar.strike")) },
    { icon: "highlighter", title: t("mdToolbar.highlight"), run: () => wrapSelection(textarea, "==", "==", t("mdToolbar.highlight")) },
    { icon: "code", title: t("mdToolbar.code"), run: () => wrapSelection(textarea, "`", "`", t("mdToolbar.code")) },
    { icon: "sigma", title: t("mdToolbar.math"), run: () => wrapSelection(textarea, "$", "$", "x^2") },
    { icon: "link", title: t("mdToolbar.link"), run: () => wrapSelection(textarea, "[", "](url)", t("mdToolbar.linkText")) },
    { icon: "file-symlink", title: t("mdToolbar.wikilink"), run: () => wrapSelection(textarea, "[[", "]]", t("mdToolbar.wikilinkText")) },
  ];

  for (const def of buttons) {
    const btn = bar.createEl("button", { cls: "db-md-toolbar-btn", attr: { type: "button" } });
    setIcon(btn, def.icon);
    setTooltip(btn, def.title, { delay: 100 });
    // mousedown would blur the textarea and lose the selection; prevent it.
    btn.addEventListener("mousedown", (event) => event.preventDefault());
    btn.addEventListener("click", (event) => { event.preventDefault(); def.run(); });
  }
}

/** When text is selected and a web URL is pasted, wrap the selection into
 *  a normalized `[selection](url)` markdown link (Notion/editor-like behavior).
 *  Plain pastes, or pastes without a selection, fall through to default handling. */
function attachPasteUrlAsLink(textarea: HTMLTextAreaElement): void {
  textarea.addEventListener("paste", (event: ClipboardEvent) => {
    const pasted = event.clipboardData?.getData("text/plain")?.trim();
    const normalizedUrl = pasted ? normalizeExternalUrlTarget(pasted) : null;
    if (!normalizedUrl) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    if (start === end) return; // no selection → let the URL paste normally
    event.preventDefault();
    const value = textarea.value;
    const label = value.slice(start, end);
    textarea.value = `${value.slice(0, start)}[${label}](${normalizedUrl})${value.slice(end)}`;
    const caret = start + `[${label}](${normalizedUrl})`.length;
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
    textarea.dispatchEvent(new Event("input"));
  });
}

// ───────────────────────────────────────────────────────────────────
// 3. THE SHARED SINGLE-LINE POPOVER PRIMITIVE
// ───────────────────────────────────────────────────────────────────

/** The shared single-line-popover editor: an `<input>` in a floating popover with its own
 *  save/cancel/validation contract. Moved unchanged from `CellRenderer.editSingleLinePopover`.
 *  Reused by the number editor and by `CellRenderer.editFileName` (the title rename affordance,
 *  host-owned per the cell-editor dispatch contract), not only by text. */
export function openSingleLineEditor(
  ctx: CellEditorContext,
  td: HTMLElement,
  row: RowData,
  col: ColumnDef,
  currentValue: string,
  inputType: "text" | "number",
  saveValue: (value: string) => Promise<EditorSaveResult>,
  restore: () => void,
  session?: CellEditSession,
  placeholder?: string,
  selectInitial = true,
): void {
  const rawContainer = td.closest(".note-database-container");
  const container = isHTMLElement(rawContainer) ? rawContainer : null;
  const host = container || window.activeDocument.body;
  ctx.getActiveTextEditClose()?.();
  td.addClass("db-cell-popover-editing");
  // The editor is the active task, so it takes the bottom edge from the selection status bar for
  // as long as it is open. Without this the bar stays docked in the band the editor is placed in
  // and the two land on each other — the editor on top, with the bar's count chip clipped behind
  // it and two rows of actions stacked over the keyboard.
  claimBottomDock(td.ownerDocument, "cell-editor", true);

  const popover = host.createDiv({ cls: "db-cell-edit-popover db-cell-line-edit-popover" });
  popover.dataset.noteDatabaseRowPath = row.file.path;
  popover.dataset.noteDatabaseColumnKey = col.key;
  popover.dataset.noteDatabaseEditorKind = inputType === "number" ? "number" : "text";
  const input = popover.createEl("input", {
    cls: "db-cell-line-input",
    attr: { type: inputType },
  });
  if (inputType === "number") input.setAttr("step", "any");
  input.value = currentValue;
  if (placeholder) input.setAttr("placeholder", placeholder);

  let committed = false;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    popover.remove();
    td.removeClass("db-cell-popover-editing");
    claimBottomDock(td.ownerDocument, "cell-editor", false);
    window.activeDocument.removeEventListener("mousedown", onOutside, true);
    window.activeDocument.removeEventListener("keydown", onDocumentKeydown, true);
    if (ctx.getActiveTextEditClose() === close) ctx.setActiveTextEditClose(undefined);
    if (ctx.getActiveInlineEditorCancel() === cancel) ctx.setActiveInlineEditorCancel(undefined);
    session?.onClose?.();
  };
  ctx.setActiveTextEditClose(close);

  const save = async (intent?: TableCellNavigationIntent) => {
    if (committed) return;
    committed = true;
    popover.addClass("db-editor-saving");
    const result = await saveValue(input.value);
    popover.removeClass("db-editor-saving");
    if (result === "validation") {
      committed = false;
      showValidationError(input, inputType === "number" ? t("validation.invalidNumber") : t("editor.saveFailed"));
      input.focus();
      return;
    }
    if (result && typeof result === "object") {
      committed = false;
      showValidationError(input, result.validationMessage);
      renderDraftFailure(popover, input, () => { void save(intent); }, () => cancel(intent));
      input.focus();
      return;
    }
    if (result === false) {
      committed = false;
      showValidationError(input, t("editor.saveFailed"));
      renderDraftFailure(popover, input, () => { void save(intent); }, () => cancel(intent));
      input.focus();
      return;
    }
    close();
    if (intent) ctx.finishInlineEdit(row, col, session, intent);
  };
  const cancel = (intent: TableCellNavigationIntent = "stay") => {
    if (committed) return;
    committed = true;
    restore();
    close();
    ctx.finishInlineEdit(row, col, session, intent);
  };
  ctx.setActiveInlineEditorCancel(cancel);
  const onOutside = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (target && (popover.contains(target) || td.contains(target))) return;
    void save();
  };
  const onDocumentKeydown = (event: KeyboardEvent) => {
    if (isImeComposing(event)) return;
    if (event.key !== "Escape") return;
    event.preventDefault();
    cancel();
  };

  input.onkeydown = (event) => {
    if (isImeComposing(event)) return;
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      void save(event.shiftKey ? "up" : "down");
    }
    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      void save(event.shiftKey ? "previous" : "next");
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel("stay");
    }
  };
  positionTextEditPopover(popover, td, container, false, session);
  window.requestAnimationFrame(() => {
    positionTextEditPopover(popover, td, container, false, session);
    input.focus();
    if (selectInitial) input.select();
    else input.setSelectionRange(input.value.length, input.value.length);
  });
  window.setTimeout(() => {
    window.activeDocument.addEventListener("mousedown", onOutside, true);
    window.activeDocument.addEventListener("keydown", onDocumentKeydown, true);
  }, 0);
}

// ───────────────────────────────────────────────────────────────────
// 4. THE TEXT/FILES EDITOR
// ───────────────────────────────────────────────────────────────────

/** The markdown-toolbar textarea popover `openTextEditor` dispatches to for `text`/`files`
 *  columns. Exported separately because `CellRenderer.startEdit`'s bulk-session branch also opens
 *  it directly for a markdown-mode column mid-session, the same way it did before this
 *  extraction — a session forces the popover form regardless of `shouldUsePopoverEditor`'s own
 *  per-type check. */
export function openTextPopoverEditor(
  ctx: CellEditorContext,
  td: HTMLElement,
  row: RowData,
  col: ColumnDef,
  currentValue: string,
  session?: CellEditSession,
  placeholder?: string,
  initialDraft?: string,
): void {
  const rawContainer = td.closest(".note-database-container");
  const container = isHTMLElement(rawContainer) ? rawContainer : null;
  const isMobile = isTouchDevice(container || td);
  const host = isMobile ? null : (container || window.activeDocument.body);

  ctx.getActiveTextEditClose()?.();
  td.addClass("db-cell-editing");
  // Claimed for the editor's whole life, matching `openSingleLineEditor`'s identical pair below:
  // without it a phone's selection chrome stays docked in the band this popover occupies, and the
  // two are drawn on top of each other.
  claimBottomDock(td.ownerDocument, "cell-editor", true);

  let popover: HTMLElement;
  let textarea: HTMLTextAreaElement;
  let closeBtn: HTMLButtonElement | undefined;
  let editScrollContainer: HTMLElement | null = null;
  let removeMobileViewportListeners = () => undefined;

  if (isMobile) {
    // Mobile: an inline overlay inserted into the cell's own scroll container rather than
    // detached from the document flow.
    editScrollContainer = td.closest(".note-database-container")
      || td.closest(".markdown-preview-view")
      || window.activeDocument.body;

    popover = editScrollContainer.createDiv({ cls: "db-cell-edit-popover is-mobile is-inline-overlay" });

    const containerRect = editScrollContainer.getBoundingClientRect();
    const tdRect = bulkAnchorRect(session) ?? td.getBoundingClientRect();
    const scrollTop = editScrollContainer.scrollTop || 0;

    const relativeTop = tdRect.top - containerRect.top + scrollTop;

    popover.setCssProps({ position: "absolute", left: "0", right: "0", top: `${relativeTop + tdRect.height + 2}px`, "z-index": "var(--db-layer-popover, 100)" });

    closeBtn = popover.createEl("button", {
      cls: "db-cell-edit-close",
      attr: { type: "button", title: t("common.cancel"), "aria-label": t("common.cancel") },
    });
    setIcon(closeBtn, "x");

    textarea = window.activeDocument.createElement("textarea");
    textarea.className = "db-cell-textarea db-mobile-textarea";
    textarea.value = initialDraft ?? currentValue;
    if (placeholder) textarea.setAttr("placeholder", placeholder);
    popover.appendChild(textarea);

  } else {
    // Desktop: the original fixed-popover approach.
    popover = (host as HTMLElement).createDiv({ cls: "db-cell-edit-popover" });

    textarea = window.activeDocument.createElement("textarea");
    textarea.className = "db-cell-textarea";
    textarea.value = initialDraft ?? currentValue;
    if (placeholder) textarea.setAttr("placeholder", placeholder);
    textarea.rows = 1;
    popover.appendChild(textarea);
  }
  popover.dataset.noteDatabaseRowPath = row.file.path;
  popover.dataset.noteDatabaseColumnKey = col.key;
  popover.dataset.noteDatabaseEditorKind = "text";

  let committed = false;
  // Markdown-mode columns get a format toolbar above the textarea, plus
  // paste-URL-over-selection (wraps the selection into a [text](url) link).
  if (col.textRenderMode === "markdown" && !isFileFieldKey(col.key)) {
    buildMarkdownToolbar(popover, textarea);
    attachPasteUrlAsLink(textarea);
  }

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    removeMobileViewportListeners();
    popover.remove();
    td.removeClass("db-cell-editing");
    claimBottomDock(td.ownerDocument, "cell-editor", false);
    window.activeDocument.removeEventListener("mousedown", onOutside, true);
    window.activeDocument.removeEventListener("keydown", onDocumentKeydown, true);
    if (ctx.getActiveTextEditClose() === close) ctx.setActiveTextEditClose(undefined);
    if (ctx.getActiveInlineEditorCancel() === cancel) ctx.setActiveInlineEditorCancel(undefined);
    session?.onClose?.();
  };
  ctx.setActiveTextEditClose(close);

  const save = async (intent?: TableCellNavigationIntent) => {
    if (committed) return;
    committed = true;
    const newVal = textarea.value;
    if (newVal !== currentValue || session?.mixed) {
      popover.addClass("db-editor-saving");
      const success = await ctx.commitEditedValue(row, col, newVal, session, newVal ? "replace" : "clear");
      popover.removeClass("db-editor-saving");
      if (!success) {
        committed = false;
        renderDraftFailure(popover, textarea, () => { void save(intent); }, () => cancel(intent));
        textarea.focus();
        return;
      }
    }
    close();
    if (intent) ctx.finishInlineEdit(row, col, session, intent);
  };

  const cancel = (intent: TableCellNavigationIntent = "stay") => {
    if (committed) return;
    committed = true;
    close();
    ctx.finishInlineEdit(row, col, session, intent);
  };
  ctx.setActiveInlineEditorCancel(cancel);

  if (isMobile) {
    const actions = popover.createDiv({ cls: "db-cell-edit-mobile-actions" });
    const done = actions.createEl("button", { cls: "db-cell-edit-mobile-done", text: t("common.save"), attr: { type: "button" } });
    const cancelButton = actions.createEl("button", { cls: "db-cell-edit-mobile-cancel", text: t("common.cancel"), attr: { type: "button" } });
    done.onmousedown = (event) => event.preventDefault();
    cancelButton.onmousedown = (event) => event.preventDefault();
    done.onclick = () => { void save(); };
    cancelButton.onclick = () => cancel("stay");
    popover.prepend(actions);
  }

  const onOutside = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (target && (popover.contains(target) || td.contains(target))) return;
    void save();
  };

  const onDocumentKeydown = (event: KeyboardEvent) => {
    if (isImeComposing(event)) return;
    if (event.key !== "Escape") return;
    event.preventDefault();
    cancel();
  };

  if (isMobile && editScrollContainer) {
    const view = editScrollContainer.ownerDocument.defaultView || window;
    const positionMobileEditor = () => {
      if (!popover.isConnected || !editScrollContainer) return;
      const viewport = view.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportBottom = viewportTop + (viewport?.height ?? view.innerHeight);
      const editorRect = popover.getBoundingClientRect();
      if (editorRect.bottom > viewportBottom - 20 || editorRect.top < viewportTop + 20) {
        td.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      const containerRect = editScrollContainer.getBoundingClientRect();
      const tdRect = bulkAnchorRect(session) ?? td.getBoundingClientRect();
      const top = tdRect.bottom - containerRect.top + (editScrollContainer.scrollTop || 0) + 2;
      popover.style.top = `${top}px`;
    };
    const onViewportChange = () => positionMobileEditor();
    view.visualViewport?.addEventListener("resize", onViewportChange);
    view.visualViewport?.addEventListener("scroll", onViewportChange);
    removeMobileViewportListeners = () => {
      view.visualViewport?.removeEventListener("resize", onViewportChange);
      view.visualViewport?.removeEventListener("scroll", onViewportChange);
    };
    positionMobileEditor();
  }

  const resize = () => {
    autoGrowTextarea(textarea, isMobile ? 320 : 260);
    if (!isMobile) {
      positionTextEditPopover(popover, td, container, false, session);
    }
  };

  if (closeBtn) {
    closeBtn.onmousedown = (event) => event.preventDefault();
    closeBtn.onclick = () => cancel("stay");
  }

  textarea.addEventListener("input", resize);
  textarea.addEventListener("keydown", (event) => {
    if (isImeComposing(event)) return;
    if (event.key === "Enter" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      void save("down");
    }
    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      void save(event.shiftKey ? "previous" : "next");
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancel("stay");
    }
  });

  if (isMobile) {
    autoGrowTextarea(textarea, 320);
    window.setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 50);
  } else {
    resize();
    window.requestAnimationFrame(resize);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
  }

  window.setTimeout(() => {
    window.activeDocument.addEventListener("mousedown", onOutside, true);
    window.activeDocument.addEventListener("keydown", onDocumentKeydown, true);
  }, 0);
}

/** Opens the text/files editor. Moved unchanged from `CellRenderer.editText`. */
export function openTextEditor(
  ctx: CellEditorContext,
  td: HTMLElement,
  row: RowData,
  col: ColumnDef,
  currentValue: unknown,
  origText: string,
  session?: CellEditSession,
  initialDraft?: string,
): void {
  const valueText = safeString(currentValue);
  if (shouldUsePopoverEditor(td, col, valueText)) {
    openTextPopoverEditor(ctx, td, row, col, valueText, session, undefined, initialDraft);
    return;
  }
  const inp = window.activeDocument.createElement("input");
  inp.className = "db-cell-input";
  inp.type = "text";
  inp.value = initialDraft ?? valueText;
  mountInput(td, inp);

  let committed = false;

  const finish = (intent?: TableCellNavigationIntent) => {
    td.removeClass("db-cell-editing");
    if (ctx.getActiveInlineEditorCancel() === cancel) ctx.setActiveInlineEditorCancel(undefined);
    if (intent) ctx.finishInlineEdit(row, col, session, intent);
  };

  const save = async (intent?: TableCellNavigationIntent) => {
    if (committed) return;
    committed = true;
    const newVal = inp.value;
    if (newVal !== safeString(currentValue)) {
      td.addClass("db-editor-saving");
      const success = await ctx.commitEditedValue(row, col, newVal, session, newVal ? "replace" : "clear");
      td.removeClass("db-editor-saving");
      if (!success) {
        committed = false;
        renderDraftFailure(td, inp, () => { void save(intent); }, () => cancel(intent));
        inp.focus();
        return;
      }
    } else {
      restoreTextDisplay(td, currentValue, origText);
    }
    finish(intent);
  };

  const cancel = (intent: TableCellNavigationIntent = "stay") => {
    if (committed) return;
    committed = true;
    restoreTextDisplay(td, currentValue, origText);
    finish(intent);
  };
  ctx.setActiveInlineEditorCancel(cancel);
  inp.onblur = () => { void save(); };
  inp.onkeydown = (event) => handleEditKey(event, save, cancel);
}
