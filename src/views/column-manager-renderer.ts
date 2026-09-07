// ───────────────────────────────────────────────────────────────────
// MODULE:    column-manager-renderer
// COMPONENT: Renders the column manager panel (visibility, ordering,
//            wrap) as a toolbar popover, rebuilt wholesale on render.
// ───────────────────────────────────────────────────────────────────
//
// The panel is fully removed and rebuilt on each render (no diffing),
// so scrollTop is captured before removal and restored after, and the
// shift-click range-selection anchor is tracked in
// `lastSelectedColumnVisibilityKey` across renders. Columns forced
// visible (e.g. the board title field) are excluded from the
// selectable range so a shift-click can't try to toggle a disabled
// checkbox.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon, setTooltip } from "obsidian";
import { applyRangeSelection } from "../data/range-selection";
import { ColumnDef, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { getFileFieldFixedType, QUICK_ADD_FILE_FIELDS } from "../data/file-fields";
import { isMobileBottomSheet, PANEL_POPOVER, positionToolbarPopover, releasePopoverPosition } from "./popover-position";
import { carrySheetEntrance } from "./mobile-bottom-sheet";
import { buildShellHeader } from "./surface-shell";
import { getPropertyDropdownIcon, renderPropertyTypeIcon } from "./property-type-icon";
import { DatabaseViewState } from "./view-state-store";
import { openDropdownMenu } from "./dropdown-field";
import { installPopoverAutoClose } from "./popover-auto-close";
import { createCheckbox } from "./checkbox";
import { buildCheckboxPropertyRow, shouldIgnorePropertyRowDrag } from "./record-surface/property-row";
import { buildAddPropertyRow } from "./record-surface/add-property-row";
import { buildDesktopRecordHeader } from "./record-surface/record-header";
import { buildTypePickerOptions } from "./record-surface/type-picker";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ColumnManagerActions {
  close(): void;
  setColumnVisible(col: ColumnDef, visible: boolean): void;
  setColumnsVisible?(changes: Array<{ col: ColumnDef; visible: boolean }>): void;
  setAllColumnsVisible(visible: boolean): void;
  moveColumn(key: string, offset: -1 | 1): void;
  moveColumnTo(key: string, targetKey: string, placement: "before" | "after"): void;
  toggleColumnWrap(col: ColumnDef): void;
  editColumn(col: ColumnDef): void;
  addColumn(): void;
  /** Present when the host can pre-set the new property's format and label; absent callers fall
   *  back to `addColumn()`, the blank-modal behaviour every consumer had before the picker. */
  createPropertyOfType?(type: ColumnDef["type"], initialLabel?: string): void;
  addFileFieldColumn?(key: string): void;
  deleteColumn(col: ColumnDef): void;
  /** When true, edit/delete/add buttons are hidden (used by embedded/read-only views) */
  isReadOnly?: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. PANEL RENDERING
// ───────────────────────────────────────────────────────────────────

export class ColumnManagerRenderer {
  private draggedKey: string | null = null;
  private lastSelectedColumnVisibilityKey: string | null = null;
  // Hold the panel, because on a phone it does not stay where it was built. It is created inside
  // the view container and then portalled onto the body, so a container-scoped `querySelector` —
  // which is how this used to find its own panel — matches nothing once it becomes a sheet, and
  // the panel it failed to find is never removed.
  private panelEl: HTMLElement | null = null;

  /** The live panel, wherever it currently is. Callers must not go looking for it by selector. */
  getPanel(): HTMLElement | null {
    return this.panelEl?.isConnected ? this.panelEl : null;
  }

  render(
    containerEl: HTMLElement,
    visible: boolean,
    config: ViewConfig,
    state: DatabaseViewState,
    columns: ColumnDef[],
    actions: ColumnManagerActions,
    anchorEl?: HTMLElement
  ): void {
    const savedScroll = this.panelEl?.scrollTop ?? 0;
    const wasOpen = Boolean(this.panelEl?.isConnected);
    // Removing it is enough to take the backdrop with it: the sheet module drops the backdrop once
    // the last live sheet leaves the document, so this does not have to remember to say so.
    this.panelEl?.remove();
    this.panelEl = null;
    if (!visible) return;

    const panel = containerEl.createDiv({
      cls: "obnotion-column-manager",
      attr: { id: "obnotion-column-manager" },
    });
    this.panelEl = panel;
    // A replacement node for a surface that is already open is a rebuild, not an opening. Saying so
    // is what keeps the sheet from replaying its rise and moving out from under the thumb.
    if (wasOpen) carrySheetEntrance(panel);
    const header = containerEl.querySelector(".obnotion-header") || containerEl.querySelector(".obnotion-toolbar");
    if (header?.parentElement) {
      header.parentElement.insertBefore(panel, header.nextSibling);
    }

    this.renderHeader(panel, columns, config, state, actions);
    const searchInput = this.renderSearchRow(panel);
    const rowsByKey = new Map<string, HTMLElement>();
    columns.forEach((col, index) => {
      rowsByKey.set(col.key, this.renderColumnRow(panel, col, config, state, actions, columns, index, columns.length));
    });
    this.wireVisibilitySearch(searchInput, columns, rowsByKey);

    if (!actions.isReadOnly) {
      const addRow = panel.createDiv({ cls: "obnotion-column-manager-add-row" });
      const addColumnBtn = addRow.createEl("button", {
        cls: "obnotion-panel-button obnotion-column-manager-add-button",
        attr: { type: "button" },
      });
      addColumnBtn.createSpan({ cls: "obnotion-panel-button-label", text: `+ ${t("panel.addColumn")}` });
      addColumnBtn.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openAddPropertyPicker(addColumnBtn, actions);
      };

      if (actions.addFileFieldColumn) {
        const existingKeys = new Set(columns.map((col) => col.key));
        const available = QUICK_ADD_FILE_FIELDS.filter((f) => !existingKeys.has(f.key));
        if (available.length > 0) {
          const addFileBtn = addRow.createEl("button", {
            cls: "obnotion-panel-button obnotion-column-manager-add-button",
            attr: { type: "button" },
          });
          addFileBtn.createSpan({ cls: "obnotion-panel-button-label", text: `+ ${t("fileField.addFileProperty")}` });
          addFileBtn.onclick = (event) => {
            event.preventDefault();
            event.stopPropagation();
            openDropdownMenu({
              anchor: addFileBtn,
              label: t("fileField.addFileProperty"),
              options: available.map((f) => {
                const type = f.key === "aliases" ? "multi-select" : getFileFieldFixedType(f.key);
                return {
                  value: f.key,
                  text: f.key,
                  icon: getPropertyDropdownIcon(type),
                };
              }),
              value: "",
              onChange: (value: string) => {
                actions.addFileFieldColumn?.(value);
              },
              closeOnSelect: true,
              popoverClassName: "obnotion-column-manager-file-property-dropdown",
              renderIcon: (parent, icon) => {
                const type = icon.startsWith("property:") ? icon.slice("property:".length) : icon;
                parent.addClass("obnotion-column-type-option-icon");
                renderPropertyTypeIcon(parent, { type } as ColumnDef);
              },
            });
          };
        }
      }
    }
    positionToolbarPopover(panel, anchorEl, PANEL_POPOVER);
    if (savedScroll) panel.scrollTop = savedScroll;
    this.updateToolbarButton(containerEl, state, columns);
  }

  // ───────────────────────────────────────────────────────────────────
  // 3B. ADD-PROPERTY PICKER
  // ───────────────────────────────────────────────────────────────────

  /**
   * The search-first add-property picker, in a popover off the "+ Add property" button rather
   * than inline in the panel — a permanently open 13-row format list would grow this panel's own
   * footprint every time it is open, and its geometry is asserted unchanged elsewhere.
   */
  private openAddPropertyPicker(anchorEl: HTMLElement, actions: ColumnManagerActions): void {
    const createProperty = (type: ColumnDef["type"], initialLabel?: string): void => {
      if (actions.createPropertyOfType) actions.createPropertyOfType(type, initialLabel);
      else actions.addColumn();
    };
    const host = anchorEl.ownerDocument.body;
    const popover = host.createDiv({ cls: "obnotion-dropdown-popover obnotion-add-property-picker" });
    let close: () => void = () => undefined;
    // Typing a name that matches no format is the create path — seeded as a text property, the
    // way `create-property-modal.ts`'s own default does. Picking a format is the other one: the
    // handle is read back inside `onSelect` rather than at construction time, since the row's
    // click only fires once the picker (and so the handle) already exists.
    let picker: ReturnType<typeof buildAddPropertyRow<ColumnDef["type"]>>;
    picker = buildAddPropertyRow({
      parent: popover,
      rootClass: "obnotion-add-property-row",
      searchClass: "obnotion-add-property-search",
      optionListClass: "obnotion-add-property-options",
      optionClass: "obnotion-add-property-option",
      createRowClass: "obnotion-add-property-create",
      options: buildTypePickerOptions().map((option) => ({ value: option.value as ColumnDef["type"], label: option.text })),
      searchPlaceholder: t("panel.addPropertySearchPlaceholder"),
      createLabel: (query) => t("panel.createPropertyNamed", { name: query }),
      renderIcon: (iconParent, value) => renderPropertyTypeIcon(iconParent, { key: "", label: "", type: value } as ColumnDef, "obnotion-column-type-option-icon"),
      onSelect: (type) => {
        const query = picker.searchInput.value;
        close();
        createProperty(type, query);
      },
      onCreateNew: (query) => { close(); createProperty("text", query); },
    });
    picker.searchInput.focus();
    positionToolbarPopover(popover, anchorEl, { minWidth: 220, preferredWidth: 260, maxWidth: 320 });
    const removeAutoClose = installPopoverAutoClose({
      panel: popover,
      anchorEl,
      close: () => close(),
    });
    close = () => {
      removeAutoClose();
      releasePopoverPosition(popover);
      popover.remove();
    };
  }

  private renderHeader(
    panel: HTMLElement,
    columns: ColumnDef[],
    config: ViewConfig,
    state: DatabaseViewState,
    actions: ColumnManagerActions
  ): void {
    const addToggle = (header: HTMLElement): void => {
      const right = header.createDiv({ cls: "obnotion-panel-header-actions" });
      const toggleLabel = right.createEl("label", { cls: "obnotion-column-manager-toggle-all" });
      const toggleAll = createCheckbox(toggleLabel, { role: "field" });
      const visibleCount = columns.filter((col) => !state.hiddenColumns.has(col.key)).length;
      toggleAll.checked = visibleCount === columns.length;
      toggleAll.indeterminate = visibleCount > 0 && visibleCount < columns.length;
      toggleAll.onchange = () => {
        actions.setAllColumnsVisible(toggleAll.checked);
        const selectableKeys = this.getColumnVisibilityKeys(columns, config, state);
        this.lastSelectedColumnVisibilityKey = toggleAll.checked ? selectableKeys[selectableKeys.length - 1] || null : null;
      };
      toggleLabel.createSpan({ text: t("panel.all") });
    };
    if (isMobileBottomSheet(panel.ownerDocument)) {
      buildShellHeader(panel, {
        title: t("toolbar.properties"),
        onClose: () => actions.close(),
        beforeClose: addToggle,
      });
    } else {
      // The shared desktop header, title-only (no icon, no open/close — this panel closes through its
      // own toolbar toggle, not a header button) with the select-all toggle as trailing content.
      buildDesktopRecordHeader({
        parent: panel,
        title: t("toolbar.properties"),
        titleIsEmpty: false,
        headerClass: "obnotion-panel-header",
        titleClass: "obnotion-panel-title",
        renderTrailing: addToggle,
      });
    }
  }

  /** The list's own search field, above the rows it filters — Notion's own placement for the same
   *  affordance. Reuses no state across renders: the panel is rebuilt wholesale on every change
   *  (see `render()`'s own comment), so a query typed before one commit does not survive the next
   *  redraw, the same way the drag and range-selection state here never has either. */
  private renderSearchRow(panel: HTMLElement): HTMLInputElement {
    const row = panel.createDiv({ cls: "obnotion-column-manager-search-row" });
    return row.createEl("input", {
      cls: "obnotion-column-manager-search",
      attr: { type: "text", placeholder: t("panel.searchProperties") },
    }) as unknown as HTMLInputElement;
  }

  /** Filters by hiding a row's DOM node rather than by removing and re-adding it, so a row's own
   *  checkbox — and the shift-range anchor it may be mid-selection with — is never touched by a
   *  query that only narrows what is visible. */
  private wireVisibilitySearch(searchInput: HTMLInputElement, columns: ColumnDef[], rowsByKey: Map<string, HTMLElement>): void {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      for (const col of columns) {
        const rowEl = rowsByKey.get(col.key);
        if (!rowEl) continue;
        const matches = !query || col.label.toLowerCase().includes(query) || col.key.toLowerCase().includes(query);
        rowEl.classList.toggle("obnotion-column-manager-row-search-hidden", !matches);
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────
  // 4. COLUMN ROW RENDERING
  // ───────────────────────────────────────────────────────────────────

  private renderColumnRow(
    panel: HTMLElement,
    col: ColumnDef,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: ColumnManagerActions,
    columns: ColumnDef[],
    index: number,
    total: number
  ): HTMLElement {
    const requiredReason = this.getRequiredColumnReason(config, state, col);
    const checked = requiredReason ? true : !state.hiddenColumns.has(col.key);

    const handle = buildCheckboxPropertyRow({
      parent: panel,
      rowClass: "obnotion-column-manager-row",
      dataColumnKey: col.key,
      draggable: true,
      dragHandleClass: "obnotion-column-drag",
      dragHandleTitle: t("panel.dragToSort"),
      moveControlsClass: "obnotion-mobile-reorder-controls",
      drag: {
        onDragStart: (event) => {
          if (shouldIgnorePropertyRowDrag(event)) {
            event.preventDefault();
            return;
          }
          this.draggedKey = col.key;
          event.dataTransfer?.setData("text/plain", col.key);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          handle.row.addClass("is-dragging");
        },
        onDragOver: (event) => {
          if (!this.draggedKey || this.draggedKey === col.key) return;
          event.preventDefault();
          handle.row.addClass("is-drop-target");
        },
        onDragLeave: () => handle.row.removeClass("is-drop-target"),
        onDrop: (event) => {
          if (!this.draggedKey || this.draggedKey === col.key) return;
          event.preventDefault();
          handle.row.removeClass("is-drop-target");
          const rect = handle.row.getBoundingClientRect();
          const placement = event.clientY > rect.top + rect.height / 2 ? "after" : "before";
          actions.moveColumnTo(this.draggedKey, col.key, placement);
          this.draggedKey = null;
        },
        onDragEnd: () => {
          this.draggedKey = null;
          handle.row.removeClass("is-dragging");
          panel.querySelectorAll(".obnotion-column-manager-row").forEach((el) => el.removeClass("is-drop-target"));
        },
      },
      move: {
        canMoveUp: index !== 0,
        canMoveDown: index < total - 1,
        moveUpLabel: t("menu.moveUp"),
        moveDownLabel: t("menu.moveDown"),
        onMoveUp: () => actions.moveColumn(col.key, -1),
        onMoveDown: () => actions.moveColumn(col.key, 1),
      },
      checked,
      checkboxDisabled: Boolean(requiredReason),
      onCheckboxClick: (event) => {
        const selectedKeys = new Set(columns.filter((candidate) => !state.hiddenColumns.has(candidate.key)).map((candidate) => candidate.key));
        if (requiredReason) selectedKeys.add(col.key);
        this.lastSelectedColumnVisibilityKey = applyRangeSelection({
          orderedIds: this.getColumnVisibilityKeys(columns, config, state),
          selectedIds: selectedKeys,
          anchorId: this.lastSelectedColumnVisibilityKey,
          targetId: col.key,
          selected: handle.checkbox.checked,
          range: event.shiftKey,
        });
        this.syncColumnVisibility(columns, config, state, actions, selectedKeys);
      },
      typeClass: "obnotion-column-type",
      typeTitle: col.type,
      renderTypeIcon: (iconParent) => renderPropertyTypeIcon(iconParent, col, "obnotion-column-type-icon"),
      nameWrapClass: "obnotion-column-name-wrap",
      nameClass: "obnotion-column-name",
      nameText: `${col.label} [${col.key}]`,
    });

    handle.nameEl.title = t("panel.doubleClickEdit");
    handle.nameEl.addEventListener("dblclick", () => actions.editColumn(col));
    if (requiredReason) {
      handle.nameWrap.createDiv({
        cls: "obnotion-column-group-hint",
        text: requiredReason,
        attr: { title: requiredReason },
      });
    }
    const wrapBtn = handle.row.createEl("button", {
      cls: `clickable-icon obnotion-column-wrap-toggle${col.wrap ? " is-active" : ""}`,
      attr: {},
    });
    setIcon(wrapBtn, "wrap-text");
    setTooltip(wrapBtn, t("panel.wrap"), { delay: 100 });
    wrapBtn.onclick = () => actions.toggleColumnWrap(col);

    if (!actions.isReadOnly) {
      const editBtn = handle.row.createEl("button", { cls: "clickable-icon" });
      setIcon(editBtn, "edit");
      editBtn.onclick = () => actions.editColumn(col);

      const deleteBtn = handle.row.createEl("button", {
        cls: "clickable-icon obnotion-column-delete-btn",
        attr: {},
      });
      setIcon(deleteBtn, "trash");
      setTooltip(deleteBtn, t("common.delete"), { delay: 100 });
      deleteBtn.onclick = () => actions.deleteColumn(col);
    }
    return handle.row;
  }

  // ───────────────────────────────────────────────────────────────────
  // 5. VISIBILITY & DRAG HELPERS
  // ───────────────────────────────────────────────────────────────────

  /** Returns the reason a column must stay visible, or null if it can be freely hidden. */
  private getRequiredColumnReason(config: ViewConfig, state: DatabaseViewState, col: ColumnDef): string | null {
    if (config.viewType === "table") return null;
    // Title field
    if (config.titleField && col.key === config.titleField) {
      return t("panel.titleFieldHint");
    }
    return null;
  }

  private updateToolbarButton(containerEl: HTMLElement, state: DatabaseViewState, columns: ColumnDef[]): void {
    const colBtn = containerEl.querySelector(".obnotion-col-manager-btn");
    if (colBtn) {
      colBtn.querySelector(".obnotion-toolbar-badge")?.remove();
      if (colBtn.instanceOf(HTMLElement)) {
        const visibleCount = Math.max(0, columns.length - state.hiddenColumns.size);
        if (visibleCount > 0) colBtn.createSpan({ cls: "obnotion-toolbar-badge", text: String(visibleCount) });
      }
    }
  }

  private getColumnVisibilityKeys(columns: ColumnDef[], config: ViewConfig, state: DatabaseViewState): string[] {
    return columns
      .filter((candidate) => this.getRequiredColumnReason(config, state, candidate) == null)
      .map((candidate) => candidate.key);
  }

  private syncColumnVisibility(
    columns: ColumnDef[],
    config: ViewConfig,
    state: DatabaseViewState,
    actions: ColumnManagerActions,
    selectedKeys: Set<string>
  ): void {
    const changes: Array<{ col: ColumnDef; visible: boolean }> = [];
    for (const candidate of columns) {
      if (this.getRequiredColumnReason(config, state, candidate) != null) continue;
      const visible = selectedKeys.has(candidate.key);
      if (visible === !state.hiddenColumns.has(candidate.key)) continue;
      changes.push({ col: candidate, visible });
    }
    if (changes.length === 0) return;
    if (actions.setColumnsVisible) actions.setColumnsVisible(changes);
    else for (const change of changes) actions.setColumnVisible(change.col, change.visible);
  }
}
