// ───────────────────────────────────────────────────────────────────
// MODULE:    create-property-modal
// COMPONENT: shared "create column" dialog covering label, frontmatter key, and type
// ───────────────────────────────────────────────────────────────────
//
// One dialog backs every property-creation entry point (toolbar, record-icon
// field, etc.) via `lockType`/`initialType`, so the key-collision and
// file-field-name checks in `confirm()` only need to exist once.
//
// The sheet presents the way its references do: the name field stays pinned at
// the top and the format list scrolls beneath it inside the sheet's own
// keyboard-aware ceiling, instead of the whole form trading places with a
// second replaced-in-place surface. The DOM for that shape lives in
// `renderCreatePropertyBody` so the harnesses measure the same builder the
// modal mounts — they cannot construct a `DbModal` (the obsidian stub only
// throws), so the builder, not the class, is the thing they share.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Notice } from "obsidian";
import { t } from "../../i18n";
import { ColumnDef, ViewConfig } from "../../data/types";
import { isColumnType } from "../../data/column-types";
import { isFileFieldKey } from "../../data/file-fields";
import { createUniqueColumnKey } from "../../data/column-config";
import { renderDropdownPropertyTypeIcon } from "../property-type-icon";
import { buildTypePickerOptions, rollupNeedsRelationGate } from "../record-surface/type-picker";
import { DbModal } from "./obnotion-modal";
import type { SurfaceShellRole } from "../surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface CreatePropertyResult {
  key: string;
  label: string;
  type: ColumnDef["type"];
}

export interface CreatePropertyModalOptions {
  initialLabel?: string;
  initialKey?: string;
  initialType?: ColumnDef["type"];
  /** Lock the type selector (e.g. record-icon field entry always needs text). */
  lockType?: boolean;
  /** Modal title; defaults to "Create property". */
  title?: string;
}

export interface CreatePropertyBodyState {
  label: string;
  key: string;
  keyTouched: boolean;
  type: ColumnDef["type"];
}

export interface CreatePropertyBody {
  /** Read (never reassigned) by the owner's confirm step; mutated by the body's own inputs. */
  readonly state: CreatePropertyBodyState;
  focusLabel(): void;
}

export interface CreatePropertyBodyHandlers {
  onConfirm(): void;
  onCancel(): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. THE SHARED BODY
// ───────────────────────────────────────────────────────────────────

/**
 * The dialog's whole form: heading, name field, frontmatter key, the format
 * list, and the button row. Every choice the dialog later confirms is written
 * into the returned `state` — the confirm step stays with the modal, which is
 * the only party that owns the collision checks and the result.
 *
 * Two readers: `CreatePropertyModal` mounts it into its own content element,
 * and the sheet-grammar harness mounts it into its faithful host-modal stand-in
 * (which cannot run the class — see the module note). Neither is a copy.
 */
export function renderCreatePropertyBody(
  parent: HTMLElement,
  config: ViewConfig,
  options: CreatePropertyModalOptions,
  handlers: CreatePropertyBodyHandlers,
): CreatePropertyBody {
  parent.addClass("obnotion-create-property-modal");

  const state: CreatePropertyBodyState = {
    label: options.initialLabel ?? "",
    key: options.initialKey ?? "",
    keyTouched: Boolean(options.initialKey),
    type: options.initialType ?? "text",
  };

  parent.createEl("h3", { text: options.title ?? t("modal.createProperty") });

  // The name field, first and pinned: its row sits before the format list and
  // outside the scrolling element, so whatever the list does, what the user has
  // already typed stays exactly where they typed it.
  const labelRow = parent.createDiv({ cls: "obnotion-modal-row" });
  labelRow.createEl("label", { cls: "obnotion-modal-label", text: t("modal.displayName") });
  const labelInput = labelRow.createEl("input", {
    cls: "obnotion-modal-input",
    attr: { type: "text", value: state.label, placeholder: t("modal.displayName") },
  });

  const keyRow = parent.createDiv({ cls: "obnotion-modal-row obnotion-modal-row-with-help" });
  keyRow.createEl("label", { cls: "obnotion-modal-label", text: t("modal.frontmatterKey") });
  const keyControl = keyRow.createDiv({ cls: "obnotion-modal-control-stack" });
  const keyInput = keyControl.createEl("input", {
    cls: "obnotion-modal-input",
    attr: { type: "text", value: state.key, placeholder: t("modal.frontmatterKey") },
  });
  keyControl.createDiv({ cls: "obnotion-modal-help", text: t("modal.propertyKeyHint") });

  // Mirror label → key until the user manually edits the key.
  labelInput.oninput = () => {
    state.label = labelInput.value;
    if (!state.keyTouched) {
      state.key = state.label;
      keyInput.value = state.key;
    }
  };
  keyInput.oninput = () => {
    state.key = keyInput.value;
    state.keyTouched = true;
  };

  // The format list: one flat, scrolling list — the same 21 formats the type-picker
  // module owns, icon + label on every row. A format the site cannot offer right
  // now stays in the list carrying its reason, never silently absent.
  const hasRelation = config.schema.columns.some((col) => col.type === "relation");
  const formatOptions = buildTypePickerOptions(
    rollupNeedsRelationGate(hasRelation, t("modal.rollupNeedsRelation")),
  );

  const list = parent.createDiv({
    cls: "obnotion-create-property-type-list",
    attr: { role: "listbox", "aria-label": t("modal.propertyType") },
  });

  const markSelected = (): void => {
    for (const [type, row] of selectionRows) {
      row.toggleClass("is-selected", type === state.type);
    }
  };

  const selectionRows = new Map<ColumnDef["type"], HTMLElement>();

  const buildOptionRow = (option: (typeof formatOptions)[number], interactive: boolean): HTMLElement => {
    const disabled = Boolean(option.disabled);
    const row = list.createEl("button", {
      cls: "obnotion-create-property-type-option"
        + (disabled ? " is-disabled" : "")
        + (interactive ? "" : " is-readonly"),
      attr: {
        type: "button",
        role: "option",
        "aria-selected": String(option.value === state.type && interactive),
        ...(disabled && option.disabledReason ? { title: option.disabledReason } : {}),
        ...(disabled ? { disabled: "disabled" } : {}),
      },
    });
    if (option.value === state.type && interactive) row.addClass("is-selected");

    const icon = row.createSpan({ cls: "obnotion-create-property-type-option-icon" });
    if (option.icon) renderDropdownPropertyTypeIcon(icon, option.icon);

    const text = row.createSpan({ cls: "obnotion-create-property-type-option-text" });
    text.createSpan({ cls: "obnotion-create-property-type-option-label", text: option.text });
    if (disabled && option.disabledReason) {
      text.createSpan({ cls: "obnotion-create-property-type-option-reason", text: option.disabledReason });
    }

    const nextType = option.value;
    if (interactive && !disabled && isColumnType(nextType)) {
      row.onclick = () => {
        state.type = nextType;
        markSelected();
      };
      selectionRows.set(nextType, row);
    }
    return row;
  };

  if (options.lockType) {
    // A locked entry point fixes the format, so the picker would be 21 rows answering
    // one question; the one permitted format shows as a read-only row instead.
    const locked = formatOptions.find((option) => option.value === state.type);
    if (locked) buildOptionRow(locked, false);
  } else {
    for (const option of formatOptions) buildOptionRow(option, true);
  }

  const btnRow = parent.createDiv({ cls: "obnotion-modal-button-row" });
  btnRow.createEl("button", { text: t("common.cancel") }).onclick = () => handlers.onCancel();
  btnRow.createEl("button", { cls: "mod-cta", text: t("common.create") }).onclick = () => handlers.onConfirm();

  // Enter submits the form.
  for (const input of [labelInput, keyInput]) {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handlers.onConfirm();
      }
    });
  }

  return {
    state,
    focusLabel: () => labelInput.focus(),
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. MODAL
// ───────────────────────────────────────────────────────────────────

/**
 * Unified "create property" dialog. Collects a display label, a frontmatter key,
 * and a property type, then resolves the result (or null on cancel). Uses the
 * compact `.obnotion-modal` / `obnotion-modal-*` styles like other editor modals,
 * NOT the wide settings-popover layout. Escape cancels (Modal default → onClose).
 */
export class CreatePropertyModal extends DbModal {
  private resolve?: (result: CreatePropertyResult | null) => void;
  private readonly config: ViewConfig;
  private readonly options: CreatePropertyModalOptions;
  private body?: CreatePropertyBody;

  constructor(app: App, config: ViewConfig, options: CreatePropertyModalOptions = {}) {
    super(app, "sheet");
    this.config = config;
    this.options = options;
  }

  protected getDeclaredTitle(): string {
    return this.options.title ?? t("modal.createProperty");
  }

  protected getShellRole(): SurfaceShellRole {
    return "panel";
  }

  openAndWait(): Promise<CreatePropertyResult | null> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      super.open();
    });
  }

  onOpen(): void {
    super.onOpen();
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("obnotion-modal");

    this.body = renderCreatePropertyBody(contentEl, this.config, this.options, {
      onConfirm: () => this.confirm(),
      onCancel: () => {
        this.resolve?.(null);
        this.close();
      },
    });

    this.body.focusLabel();
  }

  private confirm(): void {
    if (!this.body) return;
    const { state } = this.body;
    const label = state.label.trim();
    const rawKey = (state.key || state.label).trim();
    if (!rawKey) {
      new Notice(t("modal.propertyKeyRequired"));
      return;
    }
    if (isFileFieldKey(rawKey)) {
      new Notice(t("recordIcon.fileKeyInvalid"));
      return;
    }
    if (this.config.schema.columns.some((col) => col.key === rawKey)) {
      new Notice(t("modal.propertyKeyExists", { key: rawKey }));
      return;
    }
    const key = createUniqueColumnKey(this.config, rawKey);
    this.resolve?.({ key, label: label || key, type: state.type });
    this.close();
  }

  onClose(): void {
    super.onClose();
    this.resolve?.(null);
    this.contentEl.empty();
  }
}
