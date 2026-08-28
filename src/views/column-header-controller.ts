// ───────────────────────────────────────────────────────────────────
// MODULE:    column-header-controller
// COMPONENT: Wires table column header interactions — click-to-sort,
//            menu trigger, resize handle, drag-to-reorder.
// ───────────────────────────────────────────────────────────────────
//
// Sort-on-click, the resize handle and drag-to-reorder all live on the
// same header cell, so every resize/drag/menu interaction bumps
// `suppressSortUntil` to swallow the click-to-sort handler that would
// otherwise fire when the pointer is released over the header.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ColumnDef, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { isHTMLElement } from "./dom-guards";
import { syncTableColumnLayouts } from "./table-column-layout-sync";
import { setIcon } from "obsidian";
import { isTouchDevice } from "../data/touch-environment";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ColumnHeaderActions {
  getConfig(): ViewConfig | undefined;
  ensureColumnOrder(config: ViewConfig): void;
  showContextMenu(event: MouseEvent, col: ColumnDef, anchorEl?: HTMLElement): void;
  sortByColumn(col: ColumnDef, append?: boolean): void;
  autoFitColumn?(col: ColumnDef): void;
  saveConfig(): void;
  setUndoLabel(label: string): void;
  refresh(): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. HEADER SETUP
// ───────────────────────────────────────────────────────────────────

export class ColumnHeaderController {
  private suppressSortUntil = 0;

  constructor(private actions: ColumnHeaderActions) {}

  setup(th: HTMLElement, col: ColumnDef): void {
    th.setAttr("role", "columnheader");
    th.setAttr("aria-colindex", String(Array.from(th.parentElement?.children || []).indexOf(th) + 1));
    const config = this.actions.getConfig();
    const sortRules = (config?.sortRules || []).filter((rule) => rule.field && rule.direction);
    const sort = sortRules.find((rule) => rule.field === col.key)
      || (sortRules.length === 0 && config?.sortColumn === col.key ? { direction: config.sortDirection || "asc" } : undefined);
    th.setAttr("aria-sort", sort ? sort.direction === "asc" ? "ascending" : "descending" : "none");
    th.addEventListener("click", (event) => {
      if (Date.now() < this.suppressSortUntil) return;
      const target = event.target;
      if (isHTMLElement(target) && target.closest("button, .db-resize-handle")) return;
      this.actions.sortByColumn(col, event.shiftKey);
    });
    th.addEventListener("contextmenu", (e) => this.actions.showContextMenu(e, col, th));
    this.setupMenuTrigger(th, col);
    if (!isTouchDevice(th.closest<HTMLElement>(".note-database-container") || th)) {
      this.setupResizeHandle(th, col);
      this.setupDragToReorder(th, col);
    }
  }

  private setupMenuTrigger(th: HTMLElement, col: ColumnDef): void {
    // Mounted inside the header's flex row rather than on the cell, so the button is a
    // sibling of the label instead of a block that wraps onto its own line beneath it.
    const row = th.querySelector<HTMLElement>(".db-th-content") || th;
    const button = row.createEl("button", {
      cls: "db-column-menu-trigger",
      attr: { type: "button", "aria-label": t("column.openMenu", { label: col.label }) },
    });
    setIcon(button, "more-vertical");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.actions.showContextMenu(event, col, button);
    });
  }

  // ───────────────────────────────────────────────────────────────────
  // 4. RESIZE HANDLE
  // ───────────────────────────────────────────────────────────────────

  private setupResizeHandle(th: HTMLElement, col: ColumnDef): void {
    const handle = th.createEl("div", { cls: "db-resize-handle" });
    let startX = 0;
    let startWidth = 0;

    handle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.suppressSortUntil = Date.now() + 300;
      startX = e.clientX;
      const config = this.actions.getConfig();
      startWidth = Math.max(28, config?.columnWidths?.[col.key] || col.width || config?.defaultColumnWidth || 150);
      const onMouseMove = (ev: MouseEvent) => {
        this.suppressSortUntil = Date.now() + 300;
        const newWidth = Math.max(28, startWidth + (ev.clientX - startX));
        const currentConfig = this.actions.getConfig();
        if (currentConfig) {
          currentConfig.columnWidths = { ...(currentConfig.columnWidths || {}), [col.key]: newWidth };
        } else {
          col.width = newWidth;
        }
        this.syncTableColumnLayouts(th);
      };
      const onMouseUp = () => {
        window.activeDocument.removeEventListener("mousemove", onMouseMove);
        window.activeDocument.removeEventListener("mouseup", onMouseUp);
        this.suppressSortUntil = Date.now() + 300;
        this.actions.setUndoLabel(t("undo.columnWidthConfig"));
        this.actions.saveConfig();
      };
      window.activeDocument.addEventListener("mousemove", onMouseMove);
      window.activeDocument.addEventListener("mouseup", onMouseUp);
    });
    handle.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.suppressSortUntil = Date.now() + 300;
    });
    handle.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.suppressSortUntil = Date.now() + 300;
      this.actions.autoFitColumn?.(col);
    });
  }

  private syncTableColumnLayouts(th: HTMLElement): void {
    const root = th.closest(".note-database-container");
    const config = this.actions.getConfig();
    if (!root || !config) return;
    syncTableColumnLayouts(root, config);
  }

  // ───────────────────────────────────────────────────────────────────
  // 5. DRAG TO REORDER
  // ───────────────────────────────────────────────────────────────────

  private setupDragToReorder(th: HTMLElement, col: ColumnDef): void {
    th.draggable = true;
    th.addEventListener("dragstart", (e) => {
      if (th.closest(".note-database-container.is-row-dragging")) {
        e.preventDefault();
        return;
      }
      e.dataTransfer?.setData("text/plain", col.key);
      th.addClass("db-dragging");
    });
    th.addEventListener("dragover", (e) => {
      if (th.closest(".note-database-container.is-row-dragging")) return;
      e.preventDefault();
      th.addClass("db-drop-target");
    });
    th.addEventListener("dragleave", () => {
      th.removeClass("db-drop-target");
    });
    th.addEventListener("drop", (e) => {
      if (th.closest(".note-database-container.is-row-dragging")) return;
      e.preventDefault();
      th.removeClass("db-drop-target");
      const draggedKey = e.dataTransfer?.getData("text/plain");
      if (!draggedKey || draggedKey === col.key) return;
      const config = this.actions.getConfig();
      if (!config) return;
      this.actions.ensureColumnOrder(config);
      const fromIdx = config.columnOrder!.indexOf(draggedKey);
      const toIdx = config.columnOrder!.indexOf(col.key);
      if (fromIdx < 0 || toIdx < 0) return;
      const [removed] = config.columnOrder!.splice(fromIdx, 1);
      const adjustedTo = fromIdx < toIdx ? toIdx - 1 : toIdx;
      config.columnOrder!.splice(adjustedTo, 0, removed);
      this.actions.setUndoLabel(t("undo.columnOrderConfig"));
      this.actions.saveConfig();
      this.actions.refresh();
    });
    th.addEventListener("dragend", () => {
      th.removeClass("db-dragging");
      window.activeDocument.querySelectorAll(".db-drop-target").forEach((el) => el.classList.remove("db-drop-target"));
    });
  }

}
