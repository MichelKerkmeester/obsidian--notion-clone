// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-relation
// COMPONENT: the relation inline editor, extracted behind CellRenderer.startEdit
// ───────────────────────────────────────────────────────────────────
//
// Body moved unchanged from `CellRenderer.editRelationPopover`: the phone header
// (`buildShellHeader`), the virtualized option list (`rowHeight 34`, `windowSize 80`) and the
// docked placement (`RELATION_PICKER_POPOVER`) are the same code that shipped before this
// extraction. `CellRenderer.editRelationPopover` is a one-line wrapper over `openRelationEditor`
// below.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { Notice, setIcon } from "obsidian";
import { isImeComposing } from "../../data/keyboard-utils";
import { parseRelationValues } from "../../data/relation-links";
import { ColumnDef, RowData } from "../../data/types";
import { t } from "../../i18n";
import { claimBottomDock } from "../mobile-bottom-sheet";
import { isMobileBottomSheet, positionToolbarPopover } from "../popover-position";
import { installPopoverAutoClose } from "../popover-auto-close";
import { RELATION_PICKER_POPOVER } from "../popover-host";
import { buildShellHeader } from "../surface-shell";
import { renderRecordIcon } from "../record-icon-renderer";
import type { CellEditorContext, CellEditSession } from "./cell-editor-shared";

// ───────────────────────────────────────────────────────────────────
// 2. LOCAL STATE
// ───────────────────────────────────────────────────────────────────

let nextRelationListId = 0;

// ───────────────────────────────────────────────────────────────────
// 3. THE EDITOR
// ───────────────────────────────────────────────────────────────────

/** Opens the relation editor. Moved unchanged from `CellRenderer.editRelationPopover`. */
export function openRelationEditor(
  ctx: CellEditorContext,
  target: HTMLElement,
  row: RowData,
  col: ColumnDef,
  currentValue: unknown,
  session?: CellEditSession,
  initialSearch = "",
): void {
  ctx.closeActiveOptionPopover();
  const targetDatabaseId = col.relationConfig?.targetDatabaseId;
  const database = ctx.dataSource.getViewDefFiles()
    .map((entry) => entry.config)
    .find((candidate) => candidate.id === targetDatabaseId);
  if (!database) {
    new Notice(t("relation.targetDatabaseRequired"));
    return;
  }
  const records = ctx.dataSource.getRecordsForDatabase(database);
  const recordIconField = database.recordIconField &&
    database.schema.columns.some((candidate) =>
      candidate.key === database.recordIconField && candidate.type === "text"
    )
    ? database.recordIconField
    : undefined;
  const selectedPaths = new Set<string>();
  const selectedOrder: string[] = [];
  const existingRawByPath = new Map<string, string>();
  const unresolved: string[] = [];
  for (const link of parseRelationValues(currentValue)) {
    const resolved = ctx.app?.metadataCache.getFirstLinkpathDest(link.target, row.file.path);
    if (resolved && records.some((record) => record.file.path === resolved.path)) {
      if (!selectedPaths.has(resolved.path)) selectedOrder.push(resolved.path);
      selectedPaths.add(resolved.path);
      existingRawByPath.set(resolved.path, link.raw);
    }
    else unresolved.push(link.raw);
  }

  const host = window.activeDocument.body;
  const popover = host.createDiv({ cls: "db-cell-option-popover db-relation-popover" });
  popover.setAttr("role", "dialog");
  popover.setAttr("aria-label", col.label || col.key);
  // Claimed for the editor's whole life, matching `openSingleLineEditor`'s identical pair: without
  // it a phone's selection pill stays docked in the band this popover can occupy near the grid's
  // bottom edge, and the two are drawn on top of each other.
  claimBottomDock(target.ownerDocument, "cell-editor", true);
  let closed = false;
  let removeAutoClose: (() => void) | undefined;
  const close = () => {
    if (closed) return;
    closed = true;
    removeAutoClose?.();
    popover.remove();
    claimBottomDock(target.ownerDocument, "cell-editor", false);
    if (ctx.getActiveOptionPopoverClose() === close) ctx.setActiveOptionPopoverClose(undefined);
    session?.onClose?.();
  };
  const phoneSheet = isMobileBottomSheet(host.ownerDocument);
  if (phoneSheet) buildShellHeader(popover, { title: col.label || col.key, onClose: close });
  const header = popover.createDiv({ cls: "db-relation-popover-header" });
  if (!phoneSheet) header.createDiv({ cls: "db-relation-popover-title", text: col.label || col.key });
  const search = header.createEl("input", {
    cls: "db-cell-option-search",
    attr: { type: "search", placeholder: t("relation.search"), "aria-label": t("relation.search"), "aria-autocomplete": "list" },
  });
  search.value = initialSearch;
  const list = popover.createDiv({ cls: "db-cell-option-list db-relation-option-list", attr: { role: "listbox", "aria-multiselectable": "true", "aria-label": col.label || col.key } });
  const listId = `db-relation-list-${++nextRelationListId}`;
  list.setAttr("id", listId);
  search.setAttr("aria-controls", listId);
  const footer = popover.createDiv({ cls: "db-relation-popover-footer" });
  const count = footer.createSpan({ cls: "db-relation-selected-count" });
  const clear = footer.createEl("button", { text: t("common.clear"), cls: "db-relation-clear", attr: { type: "button" } });
  const actions = footer.createDiv({ cls: "db-relation-footer-actions" });
  const apply = actions.createEl("button", { text: t("common.save"), cls: "mod-cta db-relation-footer-button", attr: { type: "button" } });
  let activeIndex = 0;
  const rowHeight = 34;
  const windowSize = 80;
  let scrollFrame: number | undefined;
  const getFilteredRecords = () => {
    const query = search.value.trim().toLowerCase();
    return records.filter((record) => {
      if (!query) return true;
      const title = record.file.basename || record.file.name.replace(/\.md$/i, "");
      return `${title} ${record.file.path}`.toLowerCase().includes(query);
    });
  };
  const renderList = (preserveScroll = true) => {
    const scrollTop = preserveScroll ? list.scrollTop : 0;
    const filtered = getFilteredRecords();
    if (activeIndex >= filtered.length) activeIndex = Math.max(0, filtered.length - 1);
    list.empty();
    const empty = list.createDiv({ cls: "db-dropdown-empty db-relation-empty", text: t("relation.noResults"), attr: { role: "status", hidden: filtered.length > 0 ? "true" : "false" } });
    if (!filtered.length) {
      empty.removeAttribute("hidden");
      count.textContent = t("relation.selectedCount", { count: selectedPaths.size });
      return;
    }
    const start = Math.max(0, Math.min(Math.max(0, filtered.length - windowSize), Math.floor(scrollTop / rowHeight) - 8));
    const end = Math.min(filtered.length, start + windowSize);
    if (start > 0) list.createDiv({ cls: "db-relation-list-spacer", attr: { "aria-hidden": "true", style: `height: ${start * rowHeight}px` } });
    // Built by hand rather than through the shared row builder: this list is a virtualised
    // `listbox`, and its rows carry `role="option"`/`aria-selected` — the semantics the keyboard
    // handler below selects on (`[role=option]`) — where the row builder's rows are
    // `menuitem`/`menuitemcheckbox` for a `menu`. The trailing check icon here needs no change:
    // it already sits after the label rather than before it.
    for (let filteredIndex = start; filteredIndex < end; filteredIndex++) {
      const record = filtered[filteredIndex];
      const title = record.file.basename || record.file.name.replace(/\.md$/i, "");
      const option = list.createEl("button", {
        cls: `db-cell-option-item db-menu-item db-relation-option-item${selectedPaths.has(record.file.path) ? " is-selected" : ""}`,
        attr: { type: "button", role: "option", "aria-selected": selectedPaths.has(record.file.path) ? "true" : "false", tabindex: filteredIndex === activeIndex ? "0" : "-1", "data-index": String(filteredIndex) },
      });
      renderRecordIcon(option, recordIconField ? record.frontmatter[recordIconField] : undefined, {
        compact: true,
        defaultIcon: "file-text",
      }).addClass("db-relation-option-icon");
      option.createSpan({ cls: "db-dropdown-option-label db-menu-item-label", text: title });
      const check = option.createSpan({ cls: "db-option-check db-menu-item-check db-relation-option-check" });
      if (selectedPaths.has(record.file.path)) setIcon(check, "check");
      option.onclick = () => {
        if (selectedPaths.has(record.file.path)) {
          selectedPaths.delete(record.file.path);
          const index = selectedOrder.indexOf(record.file.path);
          if (index >= 0) selectedOrder.splice(index, 1);
        } else {
          selectedPaths.add(record.file.path);
          selectedOrder.push(record.file.path);
        }
        activeIndex = filteredIndex;
        renderList();
      };
    }
    if (end < filtered.length) list.createDiv({ cls: "db-relation-list-spacer", attr: { "aria-hidden": "true", style: `height: ${(filtered.length - end) * rowHeight}px` } });
    if (preserveScroll) list.scrollTop = scrollTop;
    count.textContent = t("relation.selectedCount", { count: selectedPaths.size });
  };
  const focusActive = () => {
    const active = list.querySelector<HTMLButtonElement>(`[data-index="${activeIndex}"]`);
    active?.focus({ preventScroll: true });
  };
  const moveActive = (delta: number) => {
    const filtered = getFilteredRecords();
    if (!filtered.length) return;
    activeIndex = Math.max(0, Math.min(filtered.length - 1, activeIndex + delta));
    const currentScroll = list.scrollTop;
    const nextTop = activeIndex * rowHeight;
    if (nextTop < currentScroll) list.scrollTop = nextTop;
    else if (nextTop + rowHeight > currentScroll + list.clientHeight) list.scrollTop = nextTop - list.clientHeight + rowHeight;
    renderList();
    window.requestAnimationFrame(focusActive);
  };
  search.oninput = () => { activeIndex = 0; renderList(false); };
  search.onkeydown = (event) => {
    if (isImeComposing(event)) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      list.focus();
      moveActive(0);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      list.querySelector<HTMLButtonElement>("[data-index=\"0\"]")?.click();
      return;
    }
    if (event.key !== "Escape") return;
    event.preventDefault();
    close();
  };
  list.onkeydown = (event) => {
    if (isImeComposing(event)) return;
    const option = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>("[role=option]");
    if (!option) return;
    const index = Number(option.getAttribute("data-index"));
    if (Number.isFinite(index)) activeIndex = index;
    if (event.key === "ArrowDown") { event.preventDefault(); moveActive(1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); moveActive(-1); }
    else if (event.key === "Home") { event.preventDefault(); activeIndex = 0; renderList(false); window.requestAnimationFrame(focusActive); }
    else if (event.key === "End") { event.preventDefault(); activeIndex = Math.max(0, getFilteredRecords().length - 1); renderList(); window.requestAnimationFrame(focusActive); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); option.click(); }
  };
  list.onscroll = () => {
    if (getFilteredRecords().length <= windowSize || scrollFrame !== undefined) return;
    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = undefined;
      renderList();
    });
  };
  clear.onclick = () => {
    selectedPaths.clear();
    selectedOrder.splice(0, selectedOrder.length);
    unresolved.splice(0, unresolved.length);
    renderList();
  };
  apply.onclick = () => {
    const values = [
      ...unresolved,
      ...selectedOrder.map((path) => existingRawByPath.get(path) || `[[${path.replace(/\.md$/i, "")}]]`),
    ];
    void ctx.commitEditedValue(row, col, values, session, values.length ? "replace" : "clear")
      .then(() => {
        close();
        ctx.finishInlineEdit(row, col, session, "down");
      });
  };
  renderList(false);
  positionToolbarPopover(popover, target, { ...RELATION_PICKER_POPOVER, gap: 4 });
  ctx.setActiveOptionPopoverClose(close);
  removeAutoClose = installPopoverAutoClose({ panel: popover, anchorEl: target, close });
  window.setTimeout(() => search.focus(), 0);
}
