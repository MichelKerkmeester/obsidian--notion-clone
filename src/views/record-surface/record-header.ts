// ───────────────────────────────────────────────────────────────────
// MODULE:    record-header
// COMPONENT: the record/object header block — icon, title, open, close
// ───────────────────────────────────────────────────────────────────
//
// Two shapes exist today, built by hand in three different files. The desktop shape
// (icon + title + open + close in one row) is `record-detail-panel.ts`'s own DOM; the
// sheet shape (title centred, a persistent close button) is `createSheetHeader`, already
// shared by every other phone panel. Neither is redesigned here — the desktop builder
// reproduces the existing DOM byte for byte, and the phone builder is a thin pass-through
// to the sheet header that already exists — so a consumer can switch onto this module
// without its capture moving.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon, setTooltip } from "obsidian";
import { t } from "../../i18n";
import { setFieldTooltip } from "../field-tooltip";
import { createSheetHeader, type SheetHeaderHandle, type SheetHeaderOptions } from "../mobile-bottom-sheet";

// ───────────────────────────────────────────────────────────────────
// 2. DESKTOP VARIANT
// ───────────────────────────────────────────────────────────────────

export interface DesktopRecordHeaderOptions {
  parent: HTMLElement;
  /** The resolved title text (already run through the record's own title-field logic). */
  title: string;
  titleIsEmpty: boolean;
  /** Draws the record's icon into the header, if the caller has one. */
  renderIcon?: (parent: HTMLElement) => void;
  /** Hover-link preview, conditional formatting, and any other title decoration the caller owns. */
  decorateTitle?: (titleEl: HTMLElement) => void;
  /** Present only when the title field may be renamed in place (today: `file.name` titles only). */
  rename?: { onRename: (titleEl: HTMLElement) => void };
  /** Opens the underlying note. Absent on a display-only rail, which draws no open button. */
  onOpen?: () => void;
  /** Absent on a rail that closes some other way (the peek dismisses on outside click/Escape). */
  onClose?: () => void;
  /** Defaults to the record sheet's own classes; a rail supplies its own to keep its CSS untouched. */
  headerClass?: string;
  titleClass?: string;
  /** A caller-owned control appended after the title — the properties panel's select-all toggle,
   *  which is not part of any record's own header and has nowhere else in this contract to live. */
  renderTrailing?: (header: HTMLElement) => void;
}

export interface DesktopRecordHeaderHandle {
  header: HTMLElement;
  titleEl: HTMLElement;
  openButton: HTMLElement | null;
  closeButton: HTMLElement | null;
}

export function buildDesktopRecordHeader(options: DesktopRecordHeaderOptions): DesktopRecordHeaderHandle {
  const header = options.parent.createDiv({ cls: options.headerClass || "db-record-detail-header" });
  options.renderIcon?.(header);

  const titleEl = header.createDiv({ cls: options.titleClass || "db-record-detail-title", text: options.title });
  options.decorateTitle?.(titleEl);
  if (options.titleIsEmpty) titleEl.addClass("is-empty-title");

  if (options.rename) {
    const rename = options.rename;
    titleEl.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      rename.onRename(titleEl);
    });
    setFieldTooltip(titleEl, options.title, t("cell.doubleClickRename"));
  } else {
    setFieldTooltip(titleEl, options.titleIsEmpty ? "" : options.title);
  }

  options.renderTrailing?.(header);

  let openButton: HTMLElement | null = null;
  if (options.onOpen) {
    const onOpen = options.onOpen;
    openButton = header.createEl("button", {
      cls: "db-board-card-open",
      attr: { type: "button", "aria-label": t("menu.openNote") },
    });
    setIcon(openButton, "maximize-2");
    setTooltip(openButton, t("menu.openNote"), { delay: 100 });
    openButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onOpen();
    });
  }

  let closeButton: HTMLElement | null = null;
  if (options.onClose) {
    const onClose = options.onClose;
    closeButton = header.createEl("button", {
      cls: "db-cell-edit-close",
      attr: { type: "button", "aria-label": t("common.close") },
    });
    setIcon(closeButton, "x");
    setTooltip(closeButton, t("common.close"), { delay: 100 });
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      onClose();
    });
  }

  return { header, titleEl, openButton, closeButton };
}

// ───────────────────────────────────────────────────────────────────
// 3. PHONE VARIANT
// ───────────────────────────────────────────────────────────────────

export interface PhoneRecordHeaderOptions extends Pick<SheetHeaderOptions, "beforeClose"> {
  parent: HTMLElement;
  title: string;
  onClose: () => void;
}

/** The sheet header every other phone panel already shares. Nothing new — a named entry point. */
export function buildPhoneRecordHeader(options: PhoneRecordHeaderOptions): SheetHeaderHandle {
  return createSheetHeader(options.parent, {
    title: options.title,
    onClose: options.onClose,
    beforeClose: options.beforeClose,
  });
}
