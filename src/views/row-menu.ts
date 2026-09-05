// ───────────────────────────────────────────────────────────────────
// MODULE:    row-menu
// COMPONENT: right-click / long-press context menu for a table or list
//            row, offering open/insert/duplicate/delete actions
// ───────────────────────────────────────────────────────────────────
//
// Insert-above/below is disabled (not hidden) whenever the view is
// explicitly sorted, since inserting at a specific position would be
// silently undone by the sort on the next render — showing the item
// disabled documents that the action exists but doesn't apply here,
// rather than making it look unsupported.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App } from "obsidian";
import { CreateEntryPosition, DatabaseConfig, RowCreateContext, RowData, ViewConfig } from "../data/types";
import { isExplicitlySorted } from "../data/manual-order";
import {
  executeNewFromTemplate,
  getNewFromTemplateLabel,
  getNewFromTemplateTooltip,
  hasRecordTemplate,
} from "../data/template-toolbar-action";
import { t } from "../i18n";
import { isHTMLElement } from "./dom-guards";
import { confirmWithModal } from "./modals/confirm-modal";
import { createOwnedMenu } from "./owned-menu";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface RowMenuActions {
  app: App;
  openRow(row: RowData): void;
  deleteRow(row: RowData): Promise<void>;
  duplicateRow?(row: RowData): Promise<void>;
  /** Open the note-name editor for a row. Absent on hosts that cannot rename, such as the
   *  embedded renderer, where the entry then does not appear rather than appearing dead. */
  renameRow?(row: RowData, anchorEl?: HTMLElement): void;
  isRecordIconShown?(): boolean;
  canToggleRecordIcon?(): boolean;
  toggleRecordIcon?(anchor: HTMLElement, row: RowData): void;
  createEntry?(defaults?: Record<string, unknown>, position?: CreateEntryPosition): void;
  getConfig?(): ViewConfig | undefined;
  getDatabaseConfig?: () => DatabaseConfig | undefined;
  getVisibleRows?(): RowData[];
  getCreateDefaults?(row: RowData, context?: RowCreateContext): Record<string, unknown>;
  readonly isReadOnly?: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. ROW MENU
// ───────────────────────────────────────────────────────────────────

export class RowMenu {
  constructor(private actions: RowMenuActions) {}

  attachToRow(tr: HTMLElement, row: RowData, context?: RowCreateContext): void {
    tr.addEventListener("contextmenu", (event) => {
      const target = event.target;
      if (isHTMLElement(target) && target.closest("input, select, textarea, button")) {
        return;
      }
      this.show(event, row, context);
    });
  }

  show(
    event: MouseEvent,
    row: RowData,
    context?: RowCreateContext,
    anchorEl?: HTMLElement,
    onClose?: () => void,
  ): void {
    event.preventDefault();
    const displayName = row.file.name.replace(/\.md$/, "");
    const menu = createOwnedMenu(this.actions.app.workspace.containerEl.ownerDocument, {
      returnFocus: anchorEl ?? null,
      onClose,
      title: displayName,
    });

    menu.addRow({
      icon: "file-text",
      label: t("menu.openNote"),
      onClick: () => this.actions.openRow(row),
    });

    if (!this.actions.isReadOnly) {
      const config = this.actions.getConfig?.();
      const visibleRows = context?.visibleRows || this.actions.getVisibleRows?.();
      const viewType = config?.viewType;
      if (this.actions.createEntry && config && visibleRows && viewType !== "calendar" && viewType !== "timeline") {
        const defaults = this.actions.getCreateDefaults?.(row, context) ?? {};
        const paths = visibleRows.map((r) => r.file.path);
        const index = paths.indexOf(row.file.path);
        const sorted = isExplicitlySorted(config);
        menu.addRow({
          icon: "chevron-up",
          label: t("menu.insertAbove"),
          disabled: sorted,
          onClick: () => this.actions.createEntry?.(defaults, { afterPath: index > 0 ? paths[index - 1] : undefined, beforePath: row.file.path }),
        });
        menu.addRow({
          icon: "chevron-down",
          label: t("menu.insertBelow"),
          disabled: sorted,
          onClick: () => this.actions.createEntry?.(defaults, { afterPath: row.file.path, beforePath: index < paths.length - 1 ? paths[index + 1] : undefined }),
        });
        menu.addSeparator();
        const databaseConfig = this.actions.getDatabaseConfig?.();
        if (hasRecordTemplate(databaseConfig)) {
          menu.addRow({
            icon: "file-plus-2",
            label: getNewFromTemplateLabel(),
            tooltip: getNewFromTemplateTooltip(databaseConfig),
            onClick: () => {
              void executeNewFromTemplate({
                config: databaseConfig,
                confirmEnabled: false,
                confirm: async () => true,
                createEntry: () => this.actions.createEntry?.(),
              });
            },
          });
        }
      }
      if (this.actions.toggleRecordIcon && this.actions.canToggleRecordIcon?.() === true) {
        menu.addRow({
          icon: "smile-plus",
          label: t("recordIcon.show"),
          selected: this.actions.isRecordIconShown?.() === true,
          onClick: (clickEvent) => {
            const anchor = isHTMLElement(clickEvent.currentTarget) ? clickEvent.currentTarget : isHTMLElement(clickEvent.target) ? clickEvent.target : null;
            if (anchor) this.actions.toggleRecordIcon?.(anchor, row);
          },
        });
        menu.addSeparator();
      }
      // The only rename affordance a thumb can find. Every other entry point in the plugin — the
      // table cell, the list, board and gallery titles, the record sheet's own title — opens on a
      // double-click, and the tooltip that says so is a hover surface a phone never shows. The
      // gesture does exist on touch, but naming the action in a menu the user opened on purpose is
      // what makes it findable rather than guessable.
      if (this.actions.renameRow) {
        menu.addRow({
          icon: "pencil",
          label: t("menu.renameNote"),
          onClick: () => this.actions.renameRow?.(row, anchorEl),
        });
      }

      menu.addRow({
        icon: "copy",
        label: t("menu.duplicateRecord"),
        onClick: () => { void this.actions.duplicateRow?.(row); },
      });

      menu.addSeparator();

      menu.addRow({
        icon: "trash",
        label: t("menu.deleteRow", { name: displayName }),
        warning: true,
        onClick: () => { void (async () => {
          const ok = await confirmWithModal(this.actions.app, {
            title: t("common.delete"),
            message: t("menu.confirmDeleteRow", { name: displayName }),
            confirmText: t("common.delete"),
            danger: true,
          });
          if (!ok) return;
          void this.actions.deleteRow(row);
        })(); },
      });
    }

    if (anchorEl?.isConnected) {
      menu.showAt({ anchor: anchorEl });
    } else {
      menu.showAt({ x: event.clientX, y: event.clientY });
    }
  }
}
