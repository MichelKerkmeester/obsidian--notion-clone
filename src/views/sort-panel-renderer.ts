// ───────────────────────────────────────────────────────────────────
// MODULE:    sort-panel-renderer
// COMPONENT: Toolbar sort-rules popover — list, add, drag-reorder, remove
// ───────────────────────────────────────────────────────────────────
//
// Every rule mutation clears the legacy singular sortColumn/sortDirection
// fields so old single-sort reads never see a stale value once a rule list
// exists. Drag reordering tracks the dragged index itself rather than
// reading DOM order, since rows are rebuilt on every render.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isSheetTraceEnabled, traceSheet } from "./sheet-trace";
import { setIcon } from "obsidian";
import { SortRule, ViewConfig, ColumnDef } from "../data/types";
import { t } from "../i18n";
import { DatabaseViewState } from "./view-state-store";
import { PANEL_POPOVER, positionToolbarPopover } from "./popover-position";
import { buildShellHeader } from "./surface-shell";
import { createDropdownField } from "./dropdown-field";
import { isHTMLElement } from "./dom-guards";
import { trapFocus } from "./interaction-scope";
import { renderDropdownPropertyTypeIcon, toPropertyDropdownOption } from "./property-type-icon";
import { getViewRuleColumns, removeSortRuleAt } from "./view-rule-operations";
import { createConditionRow } from "./toolbar-primitives";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface SortPanelActions {
  save(): void;
  refresh(): void;
  close(): void;
}

// One rule's render context: everything its rows redraw, shared by the arrows and the pickers
// rather than copied into each of their closures.
interface SortRuleRenderContext {
  panel: HTMLElement;
  config: ViewConfig;
  state: DatabaseViewState;
  actions: SortPanelActions;
  rule: SortRule;
  columns: Array<ColumnDef>;
  index: number;
}

// ───────────────────────────────────────────────────────────────────
// 3. SORT PANEL RENDERER
// ───────────────────────────────────────────────────────────────────

export class SortPanelRenderer {
  private panelEl: HTMLElement | null = null;
  private anchorEl: HTMLElement | null = null;
  private draggedRuleIndex: number | null = null;
  private removeFocusTrap: (() => void) | null = null;

  /** The live panel, wherever it currently is. On a phone it is portalled out of the container. */
  getPanel(): HTMLElement | null {
    return this.panelEl?.isConnected ? this.panelEl : null;
  }

  render(
    containerEl: HTMLElement,
    visible: boolean,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: SortPanelActions,
    anchorEl?: HTMLElement
  ): void {
    // A rebuild refills the panel it already has; only an opening creates one.
    //
    // Every rebuild used to destroy the node and build a replacement, on every add, remove, toggle
    // and background refresh. The node is the surface's identity to everything outside this class:
    // the overlay stack's idea of "inside", the sheet module's memory of where the panel came from,
    // the entrance's record that it has already played, and — on a touch device — the element a
    // tap's delayed click is delivered to. Replacing it invalidated all four at once, and each was
    // then patched back one at a time: a resolver so the stack could re-find the panel, a flag so
    // the entrance would not replay. Refilling the node it already has removes the cause those
    // patches were treating, and the press that began inside the sheet still has a sheet to land in.
    const retained = this.panelEl?.isConnected ? this.panelEl : null;
    const savedScroll = retained?.scrollTop ?? 0;
    this.removeFocusTrap?.();
    this.removeFocusTrap = null;
    if (!visible) {
      this.panelEl?.remove();
      this.panelEl = null;
      this.anchorEl = null;
      return;
    }
    if (anchorEl?.isConnected) this.anchorEl = anchorEl;

    // The same dialog contract the filter panel already had.
    //
    // These two sit behind adjacent toolbar buttons and share a stylesheet class, which is exactly
    // the shape where a difference survives: they look identical, so nobody checks that they behave
    // identically. Compared against each other rather than read, five of six dimensions diverged —
    // no role, no accessible name, focus left outside the panel, Escape did nothing, and Tab walked
    // straight out of it. A reader who opened Sort with a keyboard could not close it.
    let panel: HTMLElement;
    if (retained) {
      panel = retained;
      if (isSheetTraceEnabled()) traceSheet("panel-refill", "sort");
      panel.empty();
    } else {
      panel = containerEl.createDiv({
        cls: "obnotion-sort-panel",
        attr: { id: "obnotion-sort-panel", role: "dialog", "aria-label": t("toolbar.sort") },
      });
      panel.tabIndex = -1;
      const header = containerEl.querySelector(".obnotion-header") || containerEl.querySelector(".obnotion-toolbar");
      if (header?.parentElement) header.parentElement.insertBefore(panel, header.nextSibling);
    }
    this.panelEl = panel;
    this.removeFocusTrap = trapFocus(panel, {
      onEscape: () => {
        actions.close();
        this.anchorEl?.focus({ preventScroll: true });
      },
    });
    panel.focus?.({ preventScroll: true });

    buildShellHeader(panel, {
      title: t("toolbar.sort"),
      onClose: () => {
        actions.close();
        this.anchorEl?.focus({ preventScroll: true });
      },
    });
    // Calendar layouts reserve lanes/columns for spanning, all-day, and
    // overlapping timed events before applying user sort as a layout tiebreak.
    if (config.viewType === "calendar") {
      panel.createDiv({ cls: "obnotion-panel-hint", text: t("sortPanel.calendarHint") });
    }

    const rules = state.sortRules || [];
    if (rules.length === 0) {
      panel.createDiv({ cls: "obnotion-panel-empty", text: t("panel.emptySorts") });
    } else {
      rules.forEach((rule, index) => this.renderRule(panel, config, state, rule, index, actions));
    }

    panel.createEl("button", { cls: "obnotion-panel-button", text: `+ ${t("panel.addSort")}` }).onclick = () => {
      const first = getViewRuleColumns(config)[0]?.key || "file.name";
      state.sortColumn = undefined;
      state.sortDirection = "asc";
      state.sortRules = [...rules, { field: first, direction: "asc" }];
      actions.save();
      this.render(containerEl, true, config, state, actions, this.anchorEl || undefined);
      actions.refresh();
    };
    positionToolbarPopover(panel, this.anchorEl || undefined, {
      ...PANEL_POPOVER,
      // The sheet presents flush: full width, bottom edge on the viewport. Its short body used to
      // fall to the mounted classifier's floating card — insets on both sides and a gap underneath
      // — while the taller panels it sits beside on the same toolbar span the viewport, and a
      // short panel is exactly the case that guess answers differently. Declared, it keeps the
      // wide frame however few sort rules it renders.
      heightRole: "flush",
    });
    if (savedScroll) panel.scrollTop = savedScroll;
  }

  renderSingleRuleEditor(
    parent: HTMLElement,
    index: number,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: SortPanelActions
  ): void {
    parent.empty();
    const rule = state.sortRules[index];
    if (!rule) return;
    this.renderRule(parent, config, state, rule, index, actions, true);
  }

  private renderRule(
    panel: HTMLElement,
    config: ViewConfig,
    state: DatabaseViewState,
    rule: SortRule,
    index: number,
    actions: SortPanelActions,
    compact = false
  ): void {
    const columns = getViewRuleColumns(config);
    // Everything a rule's rows redraw is the rule: one context, built once, so no picker or
    // arrow button holds a second copy of what the next rebuild replaces anyway.
    const ruleContext: SortRuleRenderContext = { panel, config, state, actions, rule, columns, index };
    if (compact) {
      // The chip rail's single-rule editor keeps its own compact grammar: one row, both pickers,
      // no leading or trailing furniture. The stacked rows below are the sheet's rule, not this
      // one's, and its space budget is the rail's, not the sheet's.
      createConditionRow(panel, {
        className: "obnotion-sort-rule-row",
        compact,
        field: (parent) => this.renderRulePropertyPicker(parent, ruleContext),
        operator: (parent) => this.renderRuleDirectionPicker(parent, ruleContext),
      });
      return;
    }
    // The rule reads the way it is spoken: what to sort by, then which way, then the way out. Two
    // picker rows and a labelled delete. The arrow pair is the one reorder affordance the sheet
    // offers, and it is the one that carries the keyboard: each direction is a real button, so
    // Tab and Enter reorder what the removed drag grip — a pointer-only affordance — did. The
    // row itself stays drag-usable where a pointer is present, but nothing on the sheet depends
    // on finding the grip.
    const propertyRow = createConditionRow(panel, {
      className: "obnotion-sort-rule-row",
      leading: (parent) => this.renderRuleMoveControls(parent, ruleContext),
      field: (parent) => this.renderRulePropertyPicker(parent, ruleContext),
    });
    createConditionRow(panel, {
      className: "obnotion-sort-rule-row obnotion-sort-direction-row",
      field: (parent) => this.renderRuleDirectionPicker(parent, ruleContext),
    });
    propertyRow.draggable = true;
    propertyRow.ondragstart = (event) => {
      if (this.shouldIgnoreRuleDrag(event)) {
        event.preventDefault();
        return;
      }
      this.startDrag(event, index, propertyRow);
    };
    propertyRow.ondragover = (event) => {
      event.preventDefault();
      propertyRow.addClass("is-drop-target");
      this.updateDropIndicator(propertyRow, event.clientY <= propertyRow.getBoundingClientRect().top + propertyRow.getBoundingClientRect().height / 2 ? "before" : "after");
    };
    propertyRow.ondragleave = () => this.clearDropIndicator(propertyRow);
    propertyRow.ondrop = (event) => this.dropRuleOn(event, index, propertyRow, panel, config, state, actions);
    propertyRow.ondragend = () => this.finishDrag();
    // The delete: a word where the glyph was, in the sheet's error colour, the row its own hit
    // area. The glyph's invisible grown inset did its work quietly; a phone reads labels, not
    // corners, so the affordance is the reading, and the target is the whole row.
    const deleteRow = panel.createEl("button", {
      cls: "obnotion-panel-row obnotion-sort-delete-row is-warning",
      attr: { type: "button" },
    });
    setIcon(deleteRow.createSpan({ cls: "obnotion-sort-delete-icon" }), "trash");
    deleteRow.createSpan({ cls: "obnotion-sort-delete-label", text: t("common.delete") });
    deleteRow.onclick = () => {
      removeSortRuleAt(state, index);
      actions.save();
      this.render(panel.parentElement as HTMLElement, true, config, state, actions, this.anchorEl || undefined);
      actions.refresh();
    };
  }

  private renderRuleMoveControls(
    parent: HTMLElement,
    ruleContext: SortRuleRenderContext
  ): void {
    const { panel, config, state, actions, index } = ruleContext;
    const moveControls = parent.createSpan({ cls: "obnotion-mobile-reorder-controls" });
    const upBtn = moveControls.createEl("button", {
      attr: { type: "button", title: t("menu.moveUp"), "aria-label": t("menu.moveUp") },
    });
    setIcon(upBtn, "arrow-up");
    upBtn.disabled = index === 0;
    upBtn.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.moveRule(panel, config, state, actions, index, index - 1);
    };
    const downBtn = moveControls.createEl("button", {
      attr: { type: "button", title: t("menu.moveDown"), "aria-label": t("menu.moveDown") },
    });
    setIcon(downBtn, "arrow-down");
    downBtn.disabled = index >= (state.sortRules || []).length - 1;
    downBtn.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.moveRule(panel, config, state, actions, index, index + 1);
    };
  }

  private renderRulePropertyPicker(
    parent: HTMLElement,
    ruleContext: SortRuleRenderContext
  ): void {
    const { columns, rule, state, actions } = ruleContext;
    createDropdownField({
      parent,
      label: t("panel.field"),
      options: columns.map((col) => toPropertyDropdownOption(col)),
      value: rule.field,
      className: "obnotion-panel-dropdown obnotion-sort-field-dropdown",
      hideLabel: true,
      searchable: true,
      renderIcon: renderDropdownPropertyTypeIcon,
      onChange: (value) => {
        state.sortColumn = undefined;
        state.sortDirection = "asc";
        rule.field = value;
        actions.save();
        actions.refresh();
      },
    });
  }

  private renderRuleDirectionPicker(
    parent: HTMLElement,
    ruleContext: SortRuleRenderContext
  ): void {
    const { rule, state, actions } = ruleContext;
    createDropdownField({
      parent,
      label: t("panel.sortDirection"),
      options: [
        { value: "asc", text: t("common.asc") },
        { value: "desc", text: t("common.desc") },
      ],
      value: rule.direction,
      className: "obnotion-panel-dropdown obnotion-sort-direction-dropdown",
      hideLabel: true,
      onChange: (value) => {
        state.sortColumn = undefined;
        state.sortDirection = "asc";
        rule.direction = value as SortRule["direction"];
        actions.save();
        actions.refresh();
      },
    });
  }

  private startDrag(event: DragEvent, index: number, row: HTMLElement): void {
    this.draggedRuleIndex = index;
    row.addClass("is-dragging");
    event.dataTransfer?.setData("text/plain", String(index));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  private dropRuleOn(
    event: DragEvent,
    targetIndex: number,
    row: HTMLElement,
    panel: HTMLElement,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: SortPanelActions
  ): void {
    event.preventDefault();
    this.clearDropIndicator(row);
    const from = this.draggedRuleIndex;
    if (from === null || from === targetIndex) {
      this.finishDrag();
      return;
    }

    const rect = row.getBoundingClientRect();
    let insertIndex = event.clientY > rect.top + rect.height / 2 ? targetIndex + 1 : targetIndex;
    if (from < insertIndex) insertIndex -= 1;
    this.finishDrag();
    this.moveRule(panel, config, state, actions, from, insertIndex);
  }

  private moveRule(
    panel: HTMLElement,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: SortPanelActions,
    from: number,
    to: number
  ): void {
    if (from < 0 || from >= state.sortRules.length || to < 0 || to >= state.sortRules.length) return;
    state.sortColumn = undefined;
    state.sortDirection = "asc";
    const [rule] = state.sortRules.splice(from, 1);
    state.sortRules.splice(to, 0, rule);
    actions.save();
    this.render(panel.parentElement as HTMLElement, true, config, state, actions, this.anchorEl || undefined);
    actions.refresh();
  }

  private finishDrag(): void {
    this.draggedRuleIndex = null;
    this.panelEl?.querySelectorAll(".obnotion-sort-rule-row").forEach((row) => {
      row.removeClass("is-dragging", "is-drop-target", "is-drop-before", "is-drop-after");
      row.querySelector<HTMLElement>(".obnotion-sort-drop-indicator")?.remove();
    });
  }

  private updateDropIndicator(row: HTMLElement, placement: "before" | "after"): void {
    row.addClass(placement === "before" ? "is-drop-before" : "is-drop-after");
    row.removeClass(placement === "before" ? "is-drop-after" : "is-drop-before");
    const indicator = row.querySelector<HTMLElement>(".obnotion-sort-drop-indicator")
      || row.createSpan({ cls: "obnotion-sort-drop-indicator" });
    indicator.toggleClass("is-before", placement === "before");
    indicator.toggleClass("is-after", placement === "after");
  }

  private clearDropIndicator(row: HTMLElement): void {
    row.removeClass("is-drop-target", "is-drop-before", "is-drop-after");
    row.querySelector<HTMLElement>(".obnotion-sort-drop-indicator")?.remove();
  }

  private shouldIgnoreRuleDrag(event: DragEvent): boolean {
    return isHTMLElement(event.target)
      && event.target.closest("input, select, textarea, button, .obnotion-dropdown-field, .obnotion-mobile-reorder-controls") != null;
  }
}
