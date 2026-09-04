// ───────────────────────────────────────────────────────────────────
// MODULE:    filter-panel-renderer
// COMPONENT: filter panel UI — flat rule rows plus nested AND/OR/NOT group trees
// ───────────────────────────────────────────────────────────────────
//
// MAX_FILTER_GROUP_DEPTH caps nesting because a deeper tree stops being
// editable in the popover's fixed width; canWrapFilterNode checks the target
// depth plus the node's own existing nested depth together, so wrapping a
// subtree that is already near the limit is blocked before the combined tree
// silently exceeds it.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { isSheetTraceEnabled, traceSheet } from "./sheet-trace";
import { setIcon, setTooltip } from "obsidian";
import { getColumnOptions, isObsidianTagsKey } from "../data/column-types";
import { isImeComposing } from "../data/keyboard-utils";
import { isDateLikeColumnType } from "../data/date-time-format";
import type { ColumnDef, FilterRule, SourceRuleNode, ViewConfig } from "../data/types";
import { appendLeaf, buildViewFilterTree, flattenLeaves, removeLeafAt } from "../data/view-filter-tree";
import { t } from "../i18n";
import { createDropdownField } from "./dropdown-field";
import { PANEL_POPOVER, positionToolbarPopover } from "./popover-position";
import { renderDropdownPropertyTypeIcon, toPropertyDropdownOption } from "./property-type-icon";
import { DatabaseViewState } from "./view-state-store";
import { getViewRuleColumns, removeFilterRuleAt } from "./view-rule-operations";
import { closeActiveDateValuePicker, renderDateValuePicker } from "./date-value-picker";
import { trapFocus } from "./interaction-scope";

// ───────────────────────────────────────────────────────────────────
// 2. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const MAX_FILTER_GROUP_DEPTH = 3;

// ───────────────────────────────────────────────────────────────────
// 3. FILTER TREE HELPERS
// ───────────────────────────────────────────────────────────────────

type FilterGroupNode = Extract<SourceRuleNode, { type: "group" }>;
type FilterNotNode = Extract<SourceRuleNode, { type: "not" }>;
type FilterLeafNode = Extract<SourceRuleNode, { field: string }>;

function isFilterGroup(node: SourceRuleNode): node is FilterGroupNode {
  return "type" in node && node.type === "group";
}

function isFilterNot(node: SourceRuleNode): node is FilterNotNode {
  return "type" in node && node.type === "not";
}

function isFilterLeaf(node: SourceRuleNode): node is FilterLeafNode {
  return !("type" in node);
}

function nestedFilterGroupDepth(node: SourceRuleNode): number {
  if (isFilterGroup(node)) {
    return 1 + Math.max(0, ...node.rules.map((child) => nestedFilterGroupDepth(child)));
  }
  if (isFilterNot(node)) return nestedFilterGroupDepth(node.rule);
  return 0;
}

function collapseEmptyFilterGroups(node: SourceRuleNode): SourceRuleNode | undefined {
  if (isFilterGroup(node)) {
    const rules = node.rules
      .map((child) => collapseEmptyFilterGroups(child))
      .filter((child): child is SourceRuleNode => child !== undefined);
    if (rules.length === 0) return undefined;
    if (rules.length === node.rules.length && rules.every((child, index) => child === node.rules[index])) return node;
    return { ...node, rules };
  }
  if (isFilterNot(node)) {
    const rule = collapseEmptyFilterGroups(node.rule);
    if (!rule) return undefined;
    return rule === node.rule ? node : { ...node, rule };
  }
  return node;
}

function canWrapFilterNode(node: SourceRuleNode, depth: number): boolean {
  if (depth >= MAX_FILTER_GROUP_DEPTH) return false;
  return depth + nestedFilterGroupDepth(node) <= MAX_FILTER_GROUP_DEPTH;
}

function createDefaultFilterRule(config: ViewConfig): FilterRule {
  const first = getViewRuleColumns(config)[0]?.key || "file.name";
  return { field: first, op: "contains", value: "" };
}

// ───────────────────────────────────────────────────────────────────
// 4. PUBLIC API
// ───────────────────────────────────────────────────────────────────

export interface FilterPanelActions {
  saveState(): void;
  refresh(): void;
  close(): void;
}

export function getFilterOperatorsForColumn(col?: ColumnDef): [FilterRule["op"], string][] {
  const base: [FilterRule["op"], string][] = [
    ["eq", t("filter.eq")],
    ["neq", t("filter.neq")],
  ];
  const emptyOps: [FilterRule["op"], string][] = [
    ["empty", t("filter.empty")],
    ["notempty", t("filter.notempty")],
  ];
  if (!col) return [...base, ["contains", t("filter.contains")], ...emptyOps];
  if (col.type === "number" || col.type === "currency" || isDateLikeColumnType(col.type)) {
    return [...base, ["gt", t("filter.gt")], ["gte", t("filter.gte")], ["lt", t("filter.lt")], ["lte", t("filter.lte")], ...emptyOps];
  }
  if (col.type === "select" || col.type === "status") {
    return [...base, ["gt", t("filter.gt")], ["gte", t("filter.gte")], ["lt", t("filter.lt")], ["lte", t("filter.lte")], ...emptyOps];
  }
  if (col.type === "multi-select") {
    if (col.key === "file.tags" || isObsidianTagsKey(col.key)) return [...base, ["hasTag", t("filter.hasTag")], ["contains", t("filter.contains")], ...emptyOps];
    return [...base, ["contains", t("filter.contains")], ...emptyOps];
  }
  if (col.type === "checkbox") {
    return [["notempty", t("filter.checkboxChecked")], ["empty", t("filter.checkboxUnchecked")]];
  }
  return [...base, ["contains", t("filter.contains")], ...emptyOps];
}

// ───────────────────────────────────────────────────────────────────
// 5. FILTER PANEL RENDERER
// ───────────────────────────────────────────────────────────────────

export class FilterPanelRenderer {
  private panelEl: HTMLElement | null = null;
  private anchorEl: HTMLElement | null = null;
  private refreshTimer: number | null = null;
  private removeFocusTrap: (() => void) | null = null;

  /** The live panel, wherever it currently is. On a phone it is portalled out of the container. */
  getPanel(): HTMLElement | null {
    return this.panelEl?.isConnected ? this.panelEl : null;
  }

  render(
    containerEl: HTMLElement,
    visible: boolean,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    anchorEl?: HTMLElement
  ): void {
    // A rebuild refills the panel it already has; only an opening creates one. The sort panel
    // carries the same shape and the same reason for it.
    const retained = this.panelEl?.isConnected ? this.panelEl : null;
    const savedScroll = retained?.scrollTop ?? 0;
    closeActiveDateValuePicker(containerEl.ownerDocument);
    this.removeFocusTrap?.();
    this.removeFocusTrap = null;
    if (!visible) {
      this.panelEl?.remove();
      this.panelEl = null;
      this.anchorEl = null;
      this.flushPendingRefresh(actions);
      return;
    }
    if (anchorEl?.isConnected) this.anchorEl = anchorEl;

    let panel: HTMLElement;
    if (retained) {
      panel = retained;
      if (isSheetTraceEnabled()) traceSheet("panel-refill", "filter");
      panel.empty();
    } else {
      panel = containerEl.createDiv({
        cls: "db-filter-panel",
        attr: { id: "db-filter-panel", role: "dialog", "aria-label": t("toolbar.filter") },
      });
      panel.tabIndex = -1;
      const header = containerEl.querySelector(".db-header") || containerEl.querySelector(".db-toolbar");
      if (header?.parentElement) {
        header.parentElement.insertBefore(panel, header.nextSibling);
      }
    }
    this.panelEl = panel;
    this.removeFocusTrap = trapFocus(panel, {
      onEscape: () => {
        actions.close();
        this.anchorEl?.focus({ preventScroll: true });
      },
    });
    panel.focus?.({ preventScroll: true });

    const tree = this.ensureFilterTree(state);
    this.renderHeader(panel, containerEl, state, config, actions, tree);
    if (!tree || flattenLeaves(tree).length === 0) {
      panel.createDiv({
        cls: "db-panel-empty",
        text: t("panel.emptyFilters"),
      });
    } else {
      const leafCursor = { value: 0 };
      const rootDepth = isFilterLeaf(tree) ? 0 : 1;
      this.renderFilterTreeNode(
        panel,
        tree,
        rootDepth,
        leafCursor,
        containerEl,
        state,
        config,
        actions,
        (next) => this.replaceFilterTree(containerEl, state, config, actions, next)
      );
    }

    const addBtn = panel.createEl("button", {
      cls: "db-panel-button",
      text: `+ ${t("panel.addCondition")}`,
    });
    addBtn.onclick = () => {
      const next = appendLeaf(state.filterTree, createDefaultFilterRule(config), state.filterLogic);
      this.commitFilterTree(state, next);
      actions.saveState();
      this.render(containerEl, true, state, config, actions, this.anchorEl || undefined);
      actions.refresh();
    };
    positionToolbarPopover(panel, this.anchorEl || undefined, PANEL_POPOVER);
    if (savedScroll) panel.scrollTop = savedScroll;
  }

  renderSingleRuleEditor(
    parent: HTMLElement,
    containerEl: HTMLElement,
    index: number,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions
  ): void {
    closeActiveDateValuePicker(containerEl.ownerDocument);
    this.ensureFilterTree(state);
    parent.empty();
    if (!state.filters[index]) return;
    this.renderFilterRow(parent, index, containerEl, state, config, actions, {
      compact: true,
      showRemove: false,
      rerender: () => this.renderSingleRuleEditor(parent, containerEl, index, state, config, actions),
    });
  }

  private renderHeader(
    panel: HTMLElement,
    containerEl: HTMLElement,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    tree: SourceRuleNode | undefined
  ): void {
    const header = panel.createDiv({ cls: "db-panel-header" });
    header.createSpan({ cls: "db-panel-title", text: t("toolbar.filter") });
    if (tree && !isFilterLeaf(tree)) return;
    const right = header.createDiv({ cls: "db-panel-header-actions" });
    const logicBtn = header.createEl("button", {
      cls: "db-panel-button",
      text: state.filterLogic === "and" ? t("panel.and") : t("panel.or"),
    });
    right.appendChild(logicBtn);
    logicBtn.onclick = () => {
      state.filterLogic = state.filterLogic === "and" ? "or" : "and";
      actions.saveState();
      actions.refresh();
      this.render(containerEl, true, state, config, actions, this.anchorEl || undefined);
    };
  }

  private ensureFilterTree(state: DatabaseViewState): SourceRuleNode | undefined {
    const candidate = state.filterTree ?? buildViewFilterTree(state.filters, state.filterLogic);
    const tree = candidate ? collapseEmptyFilterGroups(candidate) : undefined;
    this.commitFilterTree(state, tree);
    return tree;
  }

  private commitFilterTree(state: DatabaseViewState, tree: SourceRuleNode | undefined): void {
    state.filterTree = tree;
    state.filters = tree ? flattenLeaves(tree) : [];
    if (tree && isFilterGroup(tree)) state.filterLogic = tree.logic;
  }

  private replaceFilterTree(
    containerEl: HTMLElement,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    next: SourceRuleNode | undefined
  ): void {
    this.commitFilterTree(state, next ? collapseEmptyFilterGroups(next) : undefined);
    actions.saveState();
    this.render(containerEl, true, state, config, actions, this.anchorEl || undefined);
    actions.refresh();
  }

  private renderFilterTreeNode(
    parent: HTMLElement,
    node: SourceRuleNode,
    depth: number,
    leafCursor: { value: number },
    containerEl: HTMLElement,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    onReplace: (node: SourceRuleNode | undefined) => void
  ): void {
    if (isFilterGroup(node)) {
      this.renderFilterTreeGroup(parent, node, depth, leafCursor, containerEl, state, config, actions, onReplace);
      return;
    }
    if (isFilterNot(node)) {
      this.renderFilterTreeNot(parent, node, depth, leafCursor, containerEl, state, config, actions, onReplace);
      return;
    }
    if (!isFilterLeaf(node)) return;

    const index = leafCursor.value;
    leafCursor.value += 1;
    this.renderFilterRow(parent, index, containerEl, state, config, actions, {
      onWrap: canWrapFilterNode(node, depth)
        ? () => onReplace({ type: "group", logic: "and", rules: [node] })
        : undefined,
      onNot: () => onReplace({ type: "not", rule: node }),
      onRemove: () => {
        const next = removeLeafAt(state.filterTree, index);
        this.replaceFilterTree(containerEl, state, config, actions, next);
      },
    });
  }

  private renderFilterTreeGroup(
    parent: HTMLElement,
    group: FilterGroupNode,
    depth: number,
    leafCursor: { value: number },
    containerEl: HTMLElement,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    onReplace: (node: SourceRuleNode | undefined) => void
  ): void {
    const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-group" });
    const header = wrap.createDiv({ cls: "db-source-rule-header" });
    createDropdownField({
      parent: header,
      label: t("viewConfig.sourceRules.logic"),
      options: [
        { value: "and", text: t("panel.and") },
        { value: "or", text: t("panel.or") },
      ],
      value: group.logic,
      className: "db-source-rule-dropdown db-source-rule-logic",
      hideLabel: true,
      onChange: (value) => onReplace({ ...group, logic: value === "or" ? "or" : "and" }),
    });
    const groupActions = header.createDiv({ cls: "db-source-rule-actions" });
    this.createFilterTreeIconButton(groupActions, "plus", t("viewConfig.sourceRules.addRule"), () => {
      onReplace(appendLeaf(group, createDefaultFilterRule(config), group.logic));
    });
    if (canWrapFilterNode(group, depth)) {
      this.createFilterTreeIconButton(groupActions, "folder-plus", t("viewConfig.sourceRules.addGroup"), () => {
        onReplace({ type: "group", logic: "and", rules: [group] });
      });
    }
    this.createFilterTreeIconButton(groupActions, "circle-slash-2", t("viewConfig.sourceRules.addNot"), () => {
      onReplace({ type: "not", rule: group });
    });
    this.createFilterTreeIconButton(groupActions, "trash-2", t("viewConfig.sourceRules.remove"), () => onReplace(undefined));

    const children = wrap.createDiv({ cls: "db-source-rule-children" });
    if (group.rules.length === 0) {
      children.createDiv({ cls: "db-source-rules-empty", text: t("viewConfig.sourceRules.emptyGroup") });
    }
    for (let index = 0; index < group.rules.length; index += 1) {
      this.renderFilterTreeNode(
        children,
        group.rules[index],
        depth + 1,
        leafCursor,
        containerEl,
        state,
        config,
        actions,
        (next) => {
          const rules = [...group.rules];
          if (next) rules[index] = next;
          else rules.splice(index, 1);
          onReplace(rules.length > 0 ? { ...group, rules } : undefined);
        }
      );
    }
  }

  private renderFilterTreeNot(
    parent: HTMLElement,
    node: FilterNotNode,
    depth: number,
    leafCursor: { value: number },
    containerEl: HTMLElement,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    onReplace: (node: SourceRuleNode | undefined) => void
  ): void {
    const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-not" });
    const header = wrap.createDiv({ cls: "db-source-rule-header" });
    header.createSpan({ cls: "db-source-rule-not-label", text: t("viewConfig.sourceRules.not") });
    const nodeActions = header.createDiv({ cls: "db-source-rule-actions" });
    this.createFilterTreeIconButton(nodeActions, "undo-2", t("viewConfig.sourceRules.removeNot"), () => onReplace(node.rule));
    this.createFilterTreeIconButton(nodeActions, "trash-2", t("viewConfig.sourceRules.remove"), () => onReplace(undefined));
    const content = wrap.createDiv({ cls: "db-source-rule-children" });
    this.renderFilterTreeNode(
      content,
      node.rule,
      depth,
      leafCursor,
      containerEl,
      state,
      config,
      actions,
      (next) => next ? onReplace({ ...node, rule: next }) : onReplace(undefined)
    );
  }

  private createFilterTreeIconButton(parent: HTMLElement, icon: string, title: string, onClick: () => void): void {
    const button = parent.createEl("button", {
      cls: "db-source-rule-icon-button",
      attr: { type: "button", "aria-label": title },
    });
    setIcon(button, icon);
    setTooltip(button, title, { delay: 100 });
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
    };
  }

  private renderFilterRow(
    panel: HTMLElement,
    index: number,
    containerEl: HTMLElement,
    state: DatabaseViewState,
    config: ViewConfig,
    actions: FilterPanelActions,
    options?: {
      compact?: boolean;
      showRemove?: boolean;
      rerender?: () => void;
      onWrap?: () => void;
      onNot?: () => void;
      onRemove?: () => void;
    }
  ): void {
    const rule = state.filters[index];
    if (!rule) return;
    const row = panel.createDiv({ cls: "db-panel-row" });
    if (options?.compact) row.addClass("db-active-rule-editor-row");
    const rerender = options?.rerender || (() => {
      this.render(containerEl, true, state, config, actions, this.anchorEl || undefined);
    });

    const allCols = getViewRuleColumns(config);
    const firstKey = allCols[0]?.key || "status";
    const currentField = rule.field || firstKey;
    const currentCol = allCols.find((col) => col.key === currentField) || allCols[0];
    createDropdownField({
      parent: row,
      label: t("panel.field"),
      options: allCols.map((col) => toPropertyDropdownOption(col)),
      value: currentField,
      className: "db-panel-dropdown db-filter-field-dropdown",
      hideLabel: true,
      renderIcon: renderDropdownPropertyTypeIcon,
      onChange: (value) => {
        rule.field = value;
        const nextCol = allCols.find((col) => col.key === rule.field);
        const nextOps = getFilterOperatorsForColumn(nextCol);
        if (!nextOps.some(([op]) => op === rule.op)) rule.op = nextOps[0]?.[0] || "eq";
        rule.value = "";
        actions.saveState();
        rerender();
        actions.refresh();
      },
    });

    // Migrate legacy checkbox eq/neq filters to empty/notempty, preserving intent
    // (eq "true" → checked/notempty, eq "false" → unchecked/empty; neq inverts). Idempotent:
    // once the op is empty/notempty this no longer triggers; it persists on the next save.
    if (currentCol?.type === "checkbox" && (rule.op === "eq" || rule.op === "neq")) {
      const wantChecked = rule.op === "eq" ? rule.value === "true" : rule.value !== "true";
      rule.op = wantChecked ? "notempty" : "empty";
      rule.value = "";
    }
    const ops = getFilterOperatorsForColumn(currentCol);
    if (!ops.some(([op]) => op === rule.op)) rule.op = ops[0]?.[0] || "eq";
    createDropdownField({
      parent: row,
      label: t("panel.operator"),
      options: ops.map(([value, label]) => ({ value, text: label })),
      value: rule.op,
      className: "db-panel-dropdown db-filter-operator-dropdown",
      hideLabel: true,
      onChange: (value) => {
        rule.op = value as FilterRule["op"];
        actions.saveState();
        rerender();
        actions.refresh();
      },
    });

    if (rule.op !== "empty" && rule.op !== "notempty") {
      this.renderValueInput(row, rule, currentCol, actions);
    } else {
      row.createSpan({ text: "—", cls: "db-panel-empty-value" });
    }

    if (options?.showRemove !== false) {
      if (options?.onWrap) {
        this.createFilterTreeIconButton(row, "folder-plus", t("viewConfig.sourceRules.addGroup"), options.onWrap);
      }
      if (options?.onNot) {
        this.createFilterTreeIconButton(row, "circle-slash-2", t("viewConfig.sourceRules.addNot"), options.onNot);
      }
      const rmBtn = row.createEl("button", { cls: "db-panel-button", text: "×" });
      rmBtn.onclick = () => {
        if (options?.onRemove) {
          options.onRemove();
          return;
        }
        removeFilterRuleAt(state, index);
        actions.saveState();
        rerender();
        actions.refresh();
      };
    }
  }

  private renderValueInput(row: HTMLElement, rule: FilterRule, col: ColumnDef | undefined, actions: FilterPanelActions): void {
    if (isDateLikeColumnType(col?.type)) {
      renderDateValuePicker({
        parent: row,
        value: rule.value || "",
        placeholder: t("panel.value"),
        includeTime: col?.type === "datetime",
        className: "db-panel-date-value db-filter-value-control",
        onChange: (value) => {
          rule.value = value;
          actions.saveState();
          actions.refresh();
        },
      });
      return;
    }
    if (col?.type === "select" || col?.type === "status") {
      createDropdownField({
        parent: row,
        label: t("panel.value"),
        options: [
          { value: "", text: t("panel.value") },
          ...getColumnOptions(col).map((option) => ({ value: option.value, text: option.value })),
        ],
        value: rule.value || "",
        className: "db-panel-dropdown db-filter-value-dropdown",
        hideLabel: true,
        onChange: (value) => {
          rule.value = value;
          actions.saveState();
          actions.refresh();
        },
      });
      return;
    }
    if (col?.type === "checkbox") {
      const value = rule.value === "false" ? "false" : "true";
      if (!rule.value) rule.value = value;
      createDropdownField({
        parent: row,
        label: t("panel.value"),
        options: [
          { value: "true", text: t("common.true") },
          { value: "false", text: t("common.false") },
        ],
        value,
        className: "db-panel-dropdown db-filter-value-dropdown",
        hideLabel: true,
        onChange: (nextValue) => {
          rule.value = nextValue;
          actions.saveState();
          actions.refresh();
        },
      });
      return;
    }
    const inp = row.createEl("input", {
      attr: {
        type: col?.type === "number" || col?.type === "currency" ? "number" : "text",
        placeholder: t("panel.value"),
      },
    });
    let committedValue = rule.value || "";
    inp.value = committedValue;
    inp.oninput = () => {
      rule.value = inp.value;
      this.scheduleRefresh(actions);
    };
    inp.onkeydown = (event) => {
      if (isImeComposing(event)) return;
      if (event.key === "Enter") {
        event.preventDefault();
        this.commitDraftValue(rule, inp.value, committedValue, actions, (value) => {
          committedValue = value;
        });
        inp.blur();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        rule.value = committedValue;
        inp.value = committedValue;
        this.clearPendingRefresh();
        actions.refresh();
        inp.blur();
      }
    };
    inp.onblur = () => {
      this.commitDraftValue(rule, inp.value, committedValue, actions, (value) => {
        committedValue = value;
      });
    };
  }

  private commitDraftValue(
    rule: FilterRule,
    nextValue: string,
    committedValue: string,
    actions: FilterPanelActions,
    onCommitted: (value: string) => void
  ): void {
    this.clearPendingRefresh();
    rule.value = nextValue;
    if (nextValue !== committedValue) {
      actions.saveState();
      onCommitted(nextValue);
    }
    actions.refresh();
  }

  private scheduleRefresh(actions: FilterPanelActions): void {
    this.clearPendingRefresh();
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      actions.refresh();
    }, 220);
  }

  /**
   * Run a refresh the panel still owes, instead of losing it when the panel goes.
   *
   * A keystroke schedules its refresh 220ms out so typing does not rebuild the
   * view once per character. Hiding the panel cancels that timer, which means a
   * value typed and then dismissed inside the window would never reach the view.
   * The timer is cleared before the refresh runs so a re-entrant render cannot
   * find it still pending and fire it twice.
   */
  private flushPendingRefresh(actions: FilterPanelActions): void {
    if (this.refreshTimer === null) return;
    this.clearPendingRefresh();
    actions.refresh();
  }

  private clearPendingRefresh(): void {
    if (this.refreshTimer === null) return;
    window.clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
  }
}
