// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-option
// COMPONENT: the status/select/multi-select inline editor, extracted behind CellRenderer.startEdit
// ───────────────────────────────────────────────────────────────────
//
// Body moved unchanged from `CellRenderer.editOptionPopover`: the Escape funnels, the
// IME guards, the option drag-reorder, the colour-picker nesting and the option-set commit queue
// are the same code that shipped before this extraction, now reachable without constructing the
// 3,152-line class it used to live inside. `CellRenderer.editOptionPopover` is a one-line wrapper
// over `openOptionEditor` below.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Notice, setIcon } from "obsidian";
import {
  getColumnOptions,
  getInvalidObsidianTagValues,
  normalizeOptionValueForKey,
  normalizeValidObsidianTagValue,
  toMultiSelectValuesForKey,
  toValidObsidianTagValues,
} from "../../data/column-types";
import { isImeComposing } from "../../data/keyboard-utils";
import { ColumnDef, RowData, StatusOptionDef } from "../../data/types";
import { t } from "../../i18n";
import { confirmWithModal } from "../modals/confirm-modal";
import { createMenuRow } from "../menu-row";
import { isHTMLElement } from "../dom-guards";
import { claimBottomDock } from "../mobile-bottom-sheet";
import { closeActiveOptionColorPicker, openOptionColorPicker } from "../option-color-picker";
import { installPopoverAutoClose } from "../popover-auto-close";
import { clamp, getVisiblePopoverBounds, resolvePopoverHorizontalLeft, setPosition } from "../popover-position";
import { OPTION_REGISTRATION_COLORS as OPTION_COLORS } from "../../data/option-registration";
import type { TableCellNavigationIntent } from "../../data/table-keyboard-navigation";
import { bulkAnchorRect, normalizeCellValueForSave, type CellEditorContext, type CellEditSession, type CellOptionTransaction } from "./cell-editor-shared";

// ───────────────────────────────────────────────────────────────────
// 2. LOCAL TYPES AND STATE
// ───────────────────────────────────────────────────────────────────

interface OptionDragPreview {
  preview: HTMLElement;
  offsetX: number;
  offsetY: number;
}

interface MetadataCacheWithTags {
  getTags?(): Record<string, number>;
}

// ───────────────────────────────────────────────────────────────────
// 3. LOCAL HELPERS (stateless except for the `App` passed in explicitly)
// ───────────────────────────────────────────────────────────────────

function getVaultTagOptionValues(app: App | undefined): string[] {
  const metadataCache = app?.metadataCache as unknown as MetadataCacheWithTags | undefined;
  const tags = metadataCache?.getTags?.();
  if (!tags) return [];
  return Object.keys(tags)
    .map((tag) => normalizeValidObsidianTagValue(tag))
    .filter((tag): tag is string => Boolean(tag))
    .sort((a, b) => a.localeCompare(b));
}

function getFileTagDraftOptions(app: App | undefined, col: ColumnDef, currentValues: string[]): StatusOptionDef[] {
  const colorsByValue = new Map<string, StatusOptionDef["color"]>();
  for (const option of col.statusOptions || []) {
    const value = normalizeValidObsidianTagValue(option.value);
    if (!value) continue;
    colorsByValue.set(value, option.color || "gray");
  }

  const options: StatusOptionDef[] = [];
  const seen = new Set<string>();
  const add = (value: string) => {
    const normalized = normalizeValidObsidianTagValue(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    options.push({ value: normalized, color: colorsByValue.get(normalized) || "gray" });
  };

  for (const value of getVaultTagOptionValues(app)) add(value);
  for (const value of currentValues) add(value);
  for (const value of colorsByValue.keys()) add(value);
  return options;
}

function persistFileTagColorOptions(options: StatusOptionDef[]): StatusOptionDef[] {
  const persisted: StatusOptionDef[] = [];
  const seen = new Set<string>();
  for (const option of options) {
    const value = normalizeValidObsidianTagValue(option.value);
    if (!value || seen.has(value)) continue;
    const color = option.color || "gray";
    if (color === "gray") continue;
    seen.add(value);
    persisted.push({ value, color });
  }
  return persisted;
}

function createOptionDragPreview(item: HTMLElement, event: MouseEvent): OptionDragPreview {
  const rect = item.getBoundingClientRect();
  const preview = item.cloneNode(true) as HTMLElement;
  preview.addClass("db-cell-option-drag-preview");
  preview.addClass("db-cell-option-item");
  preview.removeClass("is-dragging");
  preview.setAttribute("aria-hidden", "true");
  preview.querySelectorAll(".db-mobile-reorder-controls").forEach((el) => el.remove());
  preview.setCssProps({
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  window.activeDocument.body.appendChild(preview);
  const state: OptionDragPreview = {
    preview,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
  };
  updateOptionDragPreview(state, event);
  return state;
}

function updateOptionDragPreview(state: OptionDragPreview, event: MouseEvent): void {
  state.preview.setCssProps({
    transform: `translate3d(${Math.round(event.clientX - state.offsetX)}px, ${Math.round(event.clientY - state.offsetY)}px, 0)`,
  });
}

function removeOptionDragPreview(state: OptionDragPreview): void {
  state.preview.remove();
}

// Coordinates are container-relative, matching the CSS. The popover mounts inside
// `.note-database-container` (`position: relative`), and the stylesheet positions it `absolute`
// there, so the numbers written here must be measured from that container — which is what
// passing its rect and scroll offsets to `setPosition` does. This is the same convention the
// date and text edit popovers use for the same host.
function positionOptionPopover(
  popover: HTMLElement,
  td: HTMLElement,
  container: HTMLElement | null,
  anchorPoint: { x: number; y: number } | undefined,
  session: CellEditSession | undefined,
): void {
  const margin = 8;
  const gap = 4;
  const anchorRect = bulkAnchorRect(session);
  const rect = anchorRect ?? td.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const bounds = getVisiblePopoverBounds(container);

  const relationPopover = popover.hasClass("db-relation-popover");
  const minWidth = relationPopover ? 360 : 160;
  const maxWidth = relationPopover ? 520 : 260;
  const width = Math.min(
    Math.max(popoverRect.width || rect.width, rect.width, minWidth),
    maxWidth,
    Math.max(160, bounds.width - margin * 2)
  );
  const anchorX = anchorRect ? anchorRect.left : (anchorPoint?.x ?? rect.left);
  const anchorY = anchorRect ? anchorRect.bottom : (anchorPoint?.y ?? rect.bottom);
  const horizontalAnchor = {
    left: anchorX,
    right: anchorX + rect.width,
    width: rect.width,
  };
  const left = resolvePopoverHorizontalLeft(horizontalAnchor, bounds, width, gap, margin, "left");

  const below = bounds.bottom - anchorY - gap - margin;
  const above = anchorY - gap - margin;
  const useAbove = above > below && below < Math.min(popover.scrollHeight, 180);
  const availableHeight = Math.max(120, useAbove ? above : below);
  const maxHeight = Math.max(120, bounds.height - margin * 2);
  const height = Math.min(popover.scrollHeight || popoverRect.height || 0, availableHeight, maxHeight);

  const globalTop = useAbove ? anchorY - gap - height : anchorY + gap;
  const globalClampedTop = clamp(globalTop, bounds.top + margin, bounds.bottom - height - margin);

  // Without a container there is no positioned ancestor to measure from, so the viewport is the
  // only frame left and the coordinates below are already global.
  popover.setCssProps({
    width: `${width}px`,
    "max-height": `${Math.min(availableHeight, maxHeight)}px`,
    ...(container ? {} : { position: "fixed" as const }),
  });
  setPosition(
    popover,
    left,
    globalClampedTop,
    container?.getBoundingClientRect(),
    container?.scrollLeft || 0,
    container?.scrollTop || 0
  );
}

// ───────────────────────────────────────────────────────────────────
// 4. THE EDITOR
// ───────────────────────────────────────────────────────────────────

/** Opens the option editor for a status/select/multi-select column. Moved unchanged from
 *  `CellRenderer.editOptionPopover`. */
export function openOptionEditor(
  ctx: CellEditorContext,
  td: HTMLElement,
  row: RowData,
  col: ColumnDef,
  currentValue: unknown,
  multiple: boolean,
  anchorPoint?: { x: number; y: number },
  session?: CellEditSession,
  initialSearch?: string,
): void {
  ctx.closeActiveOptionPopover();
  const rawContainer = td.closest(".note-database-container");
  const container = isHTMLElement(rawContainer) ? rawContainer : null;
  const host = container || window.activeDocument.body;
  host.querySelectorAll(".db-cell-option-popover").forEach((el) => el.remove());
  const isFileTags = col.key === "file.tags";
  const optionKey = isFileTags ? "tags" : col.key;
  const originalValues = multiple
    ? (isFileTags ? toValidObsidianTagValues(currentValue) : toMultiSelectValuesForKey(optionKey, currentValue))
    : [normalizeOptionValueForKey(optionKey, currentValue)].filter(Boolean);
  const selected = new Set(originalValues);
  const popover = host.createDiv({ cls: "db-cell-option-popover" });
  // Claimed for the editor's whole life, matching `openSingleLineEditor`'s identical pair: without
  // it a phone's selection pill stays docked in the band this popover can occupy near the grid's
  // bottom edge, and the two are drawn on top of each other.
  claimBottomDock(td.ownerDocument, "cell-editor", true);
  let activeOptionIndex = 0;
  let closed = false;
  let sessionClose: (() => void) | undefined;
  let removeAutoClose: (() => void) | undefined;

  const close = (intent?: TableCellNavigationIntent) => {
    if (closed) return;
    // Esc ("stay"): if the option color picker is open, only close it (via the
    // shared closer that also cleans its listeners) and keep this option popover
    // open. This is the funnel point for BOTH Esc paths — the scope-registered
    // Esc (handleInlineEditorEscape → cancelActiveInlineEditor) and the document
    // keydown Esc — so guarding here covers both.
    if (intent === "stay" && closeActiveOptionColorPicker(window.activeDocument)) {
      return;
    }
    closed = true;
    if (ctx.getActiveOptionPopoverClose() === closeFromKeyboard) ctx.setActiveOptionPopoverClose(undefined);
    if (ctx.getActiveInlineEditorCancel() === closeFromKeyboard) ctx.setActiveInlineEditorCancel(undefined);
    if (sessionClose && ctx.getActiveTextEditClose() === sessionClose) ctx.setActiveTextEditClose(undefined);
    removeAutoClose?.();
    popover.remove();
    claimBottomDock(td.ownerDocument, "cell-editor", false);
    // Clean up any leaked color picker popups on window.activeDocument.body
    window.activeDocument.body.querySelectorAll(".db-color-picker-popup").forEach(el => el.remove());
    window.activeDocument.removeEventListener("keydown", onKeydown, true);
    session?.onClose?.();
    if (intent) ctx.finishInlineEdit(row, col, session, intent);
  };
  const closeFromKeyboard = () => close("stay");
  ctx.setActiveOptionPopoverClose(closeFromKeyboard);
  ctx.setActiveInlineEditorCancel(closeFromKeyboard);
  if (session) {
    sessionClose = () => close();
    ctx.setActiveTextEditClose(sessionClose);
  }
  const onKeydown = (event: KeyboardEvent) => {
    if (isImeComposing(event)) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      close("stay");
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      close(event.shiftKey ? "previous" : "next");
      return;
    }
    if (isHTMLElement(event.target) && event.target.closest("input, textarea, select")) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Enter") return;
    const items = Array.from(popover.querySelectorAll<HTMLButtonElement>(".db-cell-option-item"));
    if (!items.length) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (event.key === "ArrowDown") activeOptionIndex = Math.min(items.length - 1, activeOptionIndex + 1);
    if (event.key === "ArrowUp") activeOptionIndex = Math.max(0, activeOptionIndex - 1);
    const item = items[activeOptionIndex];
    if (event.key === "Enter") {
      item.click();
      if (!multiple) {
        void ctx.enqueueOptionCommit(async () => undefined)
          .then(() => close("down"));
      }
    }
    else item.focus();
  };
  // Build option objects from column config (mutable copies)
  const optionDefs: StatusOptionDef[] = [];
  const registeredOptionValues = new Set<string>();
  if (isFileTags) {
    optionDefs.push(...getFileTagDraftOptions(ctx.app, col, originalValues));
  } else {
    const seenOptions = new Set<string>();
    for (const option of getColumnOptions(col)) {
      const value = normalizeOptionValueForKey(optionKey, option.value);
      if (!value || seenOptions.has(value)) continue;
      seenOptions.add(value);
      registeredOptionValues.add(value);
      optionDefs.push({ ...option, value });
    }
    for (const v of originalValues) {
      if (v && !optionDefs.find(o => o.value === v)) {
        optionDefs.push({ value: v, color: "gray" });
      }
    }
  }

  const cloneOptions = (options: StatusOptionDef[]) => options.map((option) => ({ ...option }));
  const getCommittedOptions = () => cloneOptions(col.statusOptions || []);
  const getDraftOptions = () => isFileTags
    ? persistFileTagColorOptions(optionDefs)
    : cloneOptions(optionDefs.filter((option) => registeredOptionValues.has(option.value)));
  const commitOptionTransaction = async (transaction: CellOptionTransaction) => {
    try {
      if (session?.commitOptionTransaction) {
        await session.commitOptionTransaction(transaction);
        return;
      }
      if (ctx.commitCellOptionTransaction) {
        await ctx.commitCellOptionTransaction(row, col, transaction);
        return;
      }
      if (transaction.nextOptions) {
        col.statusOptions = cloneOptions(transaction.nextOptions);
        col.statusPresetId = undefined;
      }
      if (transaction.setValue) await ctx.commitEditedValue(row, col, transaction.value, session);
      else await ctx.refreshAfterSave();
    } catch (err) {
      console.error("Note Database: failed to commit option edit", err);
      new Notice(t("errors.updateFailed", { error: String(err) }));
    }
  };
  const commitValue = (value: unknown) => {
    void ctx.enqueueOptionCommit(() => commitOptionTransaction({
      setValue: true,
      value: normalizeCellValueForSave(col, value),
    }));
  };
  const commitOptions = (transaction: Omit<CellOptionTransaction, "previousOptions" | "nextOptions"> = {}) => {
    const nextOptions = getDraftOptions();
    void ctx.enqueueOptionCommit(() => commitOptionTransaction({
      previousOptions: getCommittedOptions(),
      nextOptions,
      ...transaction,
    }));
  };

  const renderOptionList = () => {
    // Rebuild transient option rows and empty state from the current local selection set.
    popover.querySelectorAll(".db-cell-option-item, .db-panel-empty, .db-option-drop-line").forEach(el => el.remove());
    activeOptionIndex = 0;
    if (optionDefs.length === 0) {
      const empty = popover.createDiv({ cls: "db-panel-empty", text: t("cell.noOptions") });
      popover.insertBefore(empty, popover.querySelector(".db-cell-option-add"));
    }
    optionDefs.forEach((opt, idx) => {
      const isTransient = !isFileTags && !registeredOptionValues.has(opt.value);
      if (selected.has(opt.value)) activeOptionIndex = idx;
      // The row shell, its label and its checkable semantics come from the shared row builder —
      // `role="menuitemcheckbox"`/`aria-checked` rather than a bare button, so the check this row
      // carries is the same accessible affordance every other menu-shaped row in the family uses.
      // The drag handle, reorder controls, colour dot and delete button have no home in that
      // builder's fixed slots and are spliced in around the label exactly where they sat before.
      const rowHandle = createMenuRow(popover, {
        cls: "db-cell-option-item",
        label: opt.value,
        selected: selected.has(opt.value),
      });
      const item = rowHandle.row;
      const label = rowHandle.labelEl;
      label.addClass("db-option-label");
      popover.insertBefore(item, popover.querySelector(".db-cell-option-add"));

      // Drag handle for reorder
      const handle = item.createSpan({ cls: "db-option-drag-handle", text: "⠿" });
      if (isFileTags || isTransient) handle.addClass("is-hidden");
      handle.onmousedown = (e) => {
        if (isFileTags || isTransient) return;
        e.stopPropagation();
        e.preventDefault();

        item.addClass("is-dragging");
        const dragPreview = createOptionDragPreview(item, e);
        let dropLine: HTMLElement | null = null;
        let lastTarget = idx;

        const removeDropLine = () => { dropLine?.remove(); dropLine = null; };

        const onMove = (ev: MouseEvent) => {
          updateOptionDragPreview(dragPreview, ev);
          // Find insert-before position in DOM
          const items = Array.from(popover.querySelectorAll<HTMLButtonElement>(".db-cell-option-item"));
          let insertBefore = items.length;
          for (let i = 0; i < items.length; i++) {
            const ir = items[i].getBoundingClientRect();
            if (ev.clientY < ir.top + ir.height / 2) {
              insertBefore = i;
              break;
            }
          }

          // Convert to target array index after removing dragged item
          const target = insertBefore <= idx ? insertBefore : insertBefore - 1;

          if (target !== idx) {
            removeDropLine();
            dropLine = popover.createDiv({ cls: "db-option-drop-line" });
            const ref = items[insertBefore];
            if (ref) popover.insertBefore(dropLine, ref);
            else popover.insertBefore(dropLine, popover.querySelector(".db-cell-option-add"));
            lastTarget = target;
          } else {
            removeDropLine();
            lastTarget = idx;
          }
        };

        const onUp = () => {
          removeDropLine();
          item.removeClass("is-dragging");
          removeOptionDragPreview(dragPreview);
          if (lastTarget !== idx && lastTarget >= 0 && lastTarget < optionDefs.length) {
            const [moved] = optionDefs.splice(idx, 1);
            optionDefs.splice(lastTarget, 0, moved);
            commitOptions();
            renderOptionList();
          }
          window.activeDocument.removeEventListener("mousemove", onMove);
          window.activeDocument.removeEventListener("mouseup", onUp);
        };

        window.activeDocument.addEventListener("mousemove", onMove);
        window.activeDocument.addEventListener("mouseup", onUp);
      };

      const moveControls = item.createSpan({ cls: "db-mobile-reorder-controls" });
      if (isFileTags || isTransient) moveControls.addClass("is-hidden");
      const upBtn = moveControls.createEl("button", {
        attr: { type: "button", title: t("menu.moveUp"), "aria-label": t("menu.moveUp") },
      });
      setIcon(upBtn, "arrow-up");
      upBtn.disabled = idx === 0;
      upBtn.onclick = (event) => {
        if (isFileTags) return;
        event.preventDefault();
        event.stopPropagation();
        const [moved] = optionDefs.splice(idx, 1);
        optionDefs.splice(idx - 1, 0, moved);
        commitOptions();
        renderOptionList();
      };
      const downBtn = moveControls.createEl("button", {
        attr: { type: "button", title: t("menu.moveDown"), "aria-label": t("menu.moveDown") },
      });
      setIcon(downBtn, "arrow-down");
      downBtn.disabled = idx >= optionDefs.length - 1;
      downBtn.onclick = (event) => {
        if (isFileTags) return;
        event.preventDefault();
        event.stopPropagation();
        const [moved] = optionDefs.splice(idx, 1);
        optionDefs.splice(idx + 1, 0, moved);
        commitOptions();
        renderOptionList();
      };

      // Color dot — opens color picker
      const dot = item.createSpan({ cls: "db-option-color-dot" });
      const updateDot = () => {
        dot.className = `db-option-color-dot db-option-color-${opt.color}`;
      };
      updateDot();
      dot.onclick = (e) => {
        if (isTransient) return;
        e.stopPropagation();
        e.preventDefault();
        showColorPicker(dot, opt, () => { commitOptions(); updateDot(); });
      };
      // Each was appended after the label the row builder already created; move the three leading
      // pieces back in front of it, in the same relative order they were built.
      label.before(handle, moveControls, dot);

      // Label — double-click to rename
      label.ondblclick = (e) => {
        if (isFileTags || isTransient) return;
        e.stopPropagation();
        e.preventDefault();
        const input = window.activeDocument.createElement("input");
        input.type = "text";
        input.value = opt.value;
        input.className = "db-option-rename-input";
        label.replaceWith(input);
        input.focus();
        input.select();
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          const name = input.value.trim();
          if (name && name !== opt.value && !optionDefs.some(o => o !== opt && o.value === name)) {
            const oldValue = opt.value;
            opt.value = name;
            registeredOptionValues.delete(oldValue);
            registeredOptionValues.add(name);
            if (selected.has(oldValue)) {
              selected.delete(oldValue);
              selected.add(name);
            }
            commitOptions({ renameValues: [{ from: oldValue, to: name }] });
          }
          input.replaceWith(label);
          label.textContent = opt.value;
        };
        input.onblur = finish;
        input.onkeydown = (ev) => {
          if (isImeComposing(ev)) return;
          if (ev.key === "Enter") finish();
          if (ev.key === "Escape") { finished = true; input.replaceWith(label); }
        };
      };

      // Check mark — an icon carrying the row's own `menuitemcheckbox` semantics rather than a
      // bare "✓" glyph, which a screen reader reads as a character, not a state.
      const mark = item.createSpan({ cls: "db-option-check" });
      const updateMark = () => {
        mark.empty();
        if (selected.has(opt.value)) setIcon(mark, "check");
      };
      updateMark();
      const deleteButton = item.createEl("button", {
        cls: "db-option-delete",
        attr: {
          title: isTransient ? t("cell.addOption") : t("common.delete"),
          "aria-label": isTransient ? t("cell.addOption") : t("common.delete"),
        },
      });
      if (isFileTags) deleteButton.addClass("is-hidden");
      setIcon(deleteButton, isTransient ? "plus" : "trash");
      deleteButton.onmousedown = (event) => event.preventDefault();
      deleteButton.onclick = async (event) => {
        if (isFileTags) return;
        event.preventDefault();
        event.stopPropagation();
        if (isTransient) {
          registeredOptionValues.add(opt.value);
          opt.color = OPTION_COLORS[(registeredOptionValues.size - 1) % OPTION_COLORS.length];
          commitOptions();
          renderOptionList();
          return;
        }
        if (!ctx.app || !await confirmWithModal(ctx.app, {
          title: t("common.delete"),
          message: t("modal.confirmDeleteOption", { name: opt.value }),
          confirmText: t("common.delete"),
          danger: true,
        })) return;
        const removed = opt.value;
        optionDefs.splice(idx, 1);
        registeredOptionValues.delete(removed);
        const wasSelected = selected.delete(removed);
        commitOptions({
          cleanupRemovedValues: [removed],
          setValue: wasSelected,
          value: multiple ? normalizeCellValueForSave(col, Array.from(selected)) : null,
        });
        renderOptionList();
      };
      deleteButton.onkeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        deleteButton.click();
      };

      item.onmousedown = (event) => event.preventDefault();
      item.onkeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.stopPropagation();
        event.preventDefault();
      };
      item.onclick = () => {
        if (!multiple) {
          selected.clear();
          selected.add(opt.value);
          commitValue(opt.value);
          // Clear every row's mark and checked state before setting this one.
          clearAllChecks();
          updateMark();
          rowHandle.setSelected(true);
          return;
        }
        if (selected.has(opt.value)) selected.delete(opt.value);
        else selected.add(opt.value);
        updateMark();
        rowHandle.setSelected(selected.has(opt.value));
        commitValue(Array.from(selected));
      };
    });
  };

  // Color picker popup — shared with board group creation and mounted on body.
  const showColorPicker = (anchor: HTMLElement, opt: StatusOptionDef, onUpdate: () => void) => {
    openOptionColorPicker(anchor, opt.color || "gray", (color) => {
      const oldColor = opt.color;
      opt.color = color;
      onUpdate();
      // Update visible cells in the table immediately
      if (container) {
        container.querySelectorAll(`.status-color-${oldColor}`).forEach((badge: Element) => {
          if (badge.textContent === opt.value) {
            badge.removeClass(`status-color-${oldColor}`);
            badge.addClass(`status-color-${color}`);
          }
        });
      }
    }, opt.value);
  };

  // New option input
  const addRow = popover.createDiv({ cls: "db-cell-option-add" });
  const addInput = addRow.createEl("input", {
    attr: { placeholder: t("cell.addOption"), type: "text" },
  });
  addInput.onkeydown = (e) => {
    if (isImeComposing(e)) return;
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (isFileTags) {
      const invalidTags = getInvalidObsidianTagValues([addInput.value]);
      if (invalidTags.length > 0) {
        new Notice(t("fileField.invalidTag", { tag: invalidTags[0] }));
        return;
      }
    }
    const name = isFileTags ? normalizeValidObsidianTagValue(addInput.value) : normalizeOptionValueForKey(optionKey, addInput.value);
    if (!name) return;
    const existing = optionDefs.find((option) => option.value === name);
    if (existing && !isFileTags && !registeredOptionValues.has(name)) {
      registeredOptionValues.add(name);
      existing.color = OPTION_COLORS[(registeredOptionValues.size - 1) % OPTION_COLORS.length];
      addInput.value = "";
      commitOptions({ setValue: true, value: multiple ? Array.from(selected.add(name)) : name });
      renderOptionList();
      return;
    }
    if (existing) {
      if (multiple) selected.add(name);
      else {
        selected.clear();
        selected.add(name);
      }
      commitValue(multiple ? Array.from(selected) : name);
      addInput.value = "";
      renderOptionList();
      if (!multiple) {
        void ctx.enqueueOptionCommit(async () => undefined)
          .then(() => close("down"));
      }
      return;
    }
    optionDefs.push({ value: name, color: isFileTags ? "gray" : OPTION_COLORS[optionDefs.length % OPTION_COLORS.length] });
    if (!isFileTags) registeredOptionValues.add(name);
    addInput.value = "";
    if (!multiple) {
      selected.clear();
      selected.add(name);
      popover.querySelectorAll<HTMLElement>(".db-option-check").forEach((el) => el.empty());
      if (isFileTags) commitValue(name);
      else commitOptions({ setValue: true, value: name });
    } else {
      selected.add(name);
      if (isFileTags) commitValue(Array.from(selected));
      else commitOptions({ setValue: true, value: Array.from(selected) });
    }
    renderOptionList();
  };

  // Clear button (at bottom)
  const actions = popover.createDiv({ cls: "db-panel-header-actions" });
  const clearBtn = actions.createEl("button", { cls: "db-panel-button", text: t("cell.clear") });
  clearBtn.onmousedown = (event) => event.preventDefault();
  const clearAllChecks = () => {
    popover.querySelectorAll<HTMLElement>(".db-option-check").forEach((el) => el.empty());
    popover.querySelectorAll<HTMLElement>(".db-cell-option-item").forEach((el) => {
      el.toggleClass("is-selected", false);
      el.setAttr("aria-checked", "false");
    });
  };
  clearBtn.onclick = () => {
    if (multiple) {
      selected.clear();
      commitValue([]);
      clearAllChecks();
    } else {
      selected.clear();
      commitValue(null);
      clearAllChecks();
    }
  };

  renderOptionList();
  positionOptionPopover(popover, td, container, anchorPoint, session);
  window.requestAnimationFrame(() => positionOptionPopover(popover, td, container, anchorPoint, session));
  if (initialSearch) {
    addInput.value = initialSearch;
    window.requestAnimationFrame(() => {
      addInput.focus();
      addInput.setSelectionRange(addInput.value.length, addInput.value.length);
    });
  }
  window.activeDocument.addEventListener("keydown", onKeydown, true);
  removeAutoClose = installPopoverAutoClose({ panel: popover, anchorEl: td, close: () => close(), closeOnEscape: false });
}
