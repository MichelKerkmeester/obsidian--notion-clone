// ───────────────────────────────────────────────────────────────────
// MODULE:    active-view-controls-renderer
// COMPONENT: chip row summarizing the view's active filters and sorts
// ───────────────────────────────────────────────────────────────────
//
// A filter/sort rule only earns a chip once it is "effective" (its field
// still exists and, for sorts, has a direction) — rules left over from a
// deleted column would otherwise render a chip with nothing to edit. The
// status message is delayed via a timer so a fast re-render does not
// flash a stale status before the real one lands.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { setIcon } from "obsidian";
import { getEffectiveFilterRules } from "../data/filter-rules";
import { ColumnDef, FilterRule, SourceRuleNode, ViewConfig } from "../data/types";
import { getViewRuleColumns } from "./view-rule-operations";
import { t } from "../i18n";
import { getFilterOperatorsForColumn } from "./filter-panel-renderer";
import { DatabaseViewState } from "./view-state-store";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ActiveViewControlsActions {
  editFilter(index: number, anchorEl: HTMLElement): void;
  editSort(index: number, anchorEl: HTMLElement): void;
  removeFilter(index: number): void;
  removeSort(index: number): void;
  toggleFilterLogic(): void;
  clearAll(): void;
  getStatusMessage?(): string;
}

interface EffectiveFilterEntry {
  rule: FilterRule;
  index: number;
}

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function isNestedFilterTree(tree: SourceRuleNode | undefined): boolean {
  if (!tree || !("type" in tree)) return false;
  if (tree.type !== "group") return true;
  return tree.rules.some((rule) => "type" in rule);
}

// ───────────────────────────────────────────────────────────────────
// 4. RENDERER
// ───────────────────────────────────────────────────────────────────

export class ActiveViewControlsRenderer {
  private statusUpdateTimer: number | null = null;

  render(
    containerEl: HTMLElement,
    config: ViewConfig,
    state: DatabaseViewState,
    actions: ActiveViewControlsActions
  ): void {
    const existing = containerEl.querySelector<HTMLElement>(":scope > .db-header > .db-active-view-controls");
    const previousScrollLeft = existing?.querySelector<HTMLElement>(".db-active-view-controls-scroll")?.scrollLeft || 0;
    existing?.remove();
    const header = containerEl.querySelector<HTMLElement>(":scope > .db-header");
    if (!header) return;
    header.querySelector<HTMLElement>(":scope > .db-sr-status")?.remove();
    if (this.statusUpdateTimer !== null) window.clearTimeout(this.statusUpdateTimer);
    this.statusUpdateTimer = null;
    const status = header.createDiv({
      cls: "db-sr-status",
      attr: { role: "status", "aria-live": "polite", "aria-atomic": "true" },
    });
    const statusMessage = actions.getStatusMessage?.();
    if (statusMessage) {
      this.statusUpdateTimer = window.setTimeout(() => {
        this.statusUpdateTimer = null;
        if (status.isConnected) status.textContent = statusMessage;
      }, 300);
    }

    const columns = getViewRuleColumns(config);
    const validFields = new Set(columns.map((column) => column.key));
    const effectiveRules = new Set(getEffectiveFilterRules(state.filters, validFields));
    const filters: EffectiveFilterEntry[] = state.filters
      .map((rule, index) => ({ rule, index }))
      .filter(({ rule }) => effectiveRules.has(rule));
    const sorts = config.viewType === "chart"
      ? []
      : state.sortRules
        .map((rule, index) => ({ rule, index }))
        .filter(({ rule }) => Boolean(rule.field && rule.direction && validFields.has(rule.field)));
    if (filters.length === 0 && sorts.length === 0) return;

    const rail = header.createDiv({
      cls: "db-active-view-controls",
      attr: { "aria-label": `${t("toolbar.filter")} / ${t("toolbar.sort")}` },
    });
    const scroller = rail.createDiv({ cls: "db-active-view-controls-scroll" });

    if (sorts.length > 0) {
      const sortGroup = scroller.createDiv({
        cls: "db-active-control-group is-sort",
        attr: { "aria-label": t("toolbar.sort") },
      });
      for (const [visibleIndex, { rule, index }] of sorts.entries()) {
        const column = columns.find((candidate) => candidate.key === rule.field);
        const chip = this.createChip(sortGroup, "sort");
        chip.dataset.activeRuleKey = `sort:${index}`;
        this.setEditHandler(chip, () => actions.editSort(index, chip));
        const icon = chip.querySelector<HTMLElement>(".db-active-control-icon");
        if (icon) {
          setIcon(icon, rule.direction === "desc" ? "arrow-down" : "arrow-up");
          icon.createSpan({ cls: "db-active-control-order", text: String(visibleIndex + 1) });
        }
        chip.querySelector<HTMLElement>(".db-active-control-field")?.setText(column?.label || rule.field);
        const detail = createDirectionWord(rule.direction);
        const detailEl = chip.querySelector<HTMLElement>(".db-active-control-detail");
        detailEl?.addClass("db-active-control-direction");
        detailEl?.setText(detail);
        this.setEditLabel(chip, `${column?.label || rule.field} · ${detail}`);
        this.appendRemoveButton(chip, t("toolbar.sort"), () => actions.removeSort(index));
      }
    }

    if (filters.length > 0) {
      const filterGroup = scroller.createDiv({
        cls: "db-active-control-group is-filter",
        attr: { "aria-label": t("toolbar.filter") },
      });
      if (filters.length > 1 && !isNestedFilterTree(state.filterTree)) {
        const logicLabel = state.filterLogic === "and" ? t("panel.and") : t("panel.or");
        const logic = filterGroup.createEl("button", {
          cls: "db-active-control-logic",
          text: state.filterLogic.toUpperCase(),
          attr: { type: "button", title: logicLabel, "aria-label": logicLabel },
        });
        logic.onclick = () => actions.toggleFilterLogic();
      }
      for (const { rule, index } of filters) {
        this.renderFilterChip(filterGroup, rule, index, columns, actions);
      }
    }
    scroller.scrollLeft = previousScrollLeft;
    const clear = rail.createEl("button", {
      cls: "db-active-view-controls-clear",
      text: t("toolbar.clearAll"),
      attr: { type: "button", "aria-label": t("toolbar.clearAll") },
    });
    clear.onclick = () => actions.clearAll();
    const updateOverflow = () => scroller.toggleClass("is-overflowing", scroller.scrollWidth > scroller.clientWidth + 1);
    scroller.addEventListener("scroll", updateOverflow, { passive: true });
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        if (scroller.isConnected) updateOverflow();
        else observer.disconnect();
      });
      observer.observe(scroller);
    }
    window.requestAnimationFrame(updateOverflow);
  }

  private renderFilterChip(
    parent: HTMLElement,
    rule: FilterRule,
    index: number,
    columns: ColumnDef[],
    actions: ActiveViewControlsActions
  ): void {
    const column = columns.find((candidate) => candidate.key === rule.field);
    const chip = this.createChip(parent, "filter");
    chip.dataset.activeRuleKey = `filter:${index}`;
    this.setEditHandler(chip, () => actions.editFilter(index, chip));
    const icon = chip.querySelector<HTMLElement>(".db-active-control-icon");
    if (icon) setIcon(icon, "list-filter");
    const operator = getFilterOperatorsForColumn(column).find(([value]) => value === rule.op)?.[1] || rule.op;
    const phrase = formatFilterPhrase(column?.label || rule.field, operator, rule);
    chip.querySelector<HTMLElement>(".db-active-control-field")?.setText(phrase);
    chip.querySelector<HTMLElement>(".db-active-control-detail")?.setText("");
    this.setEditLabel(chip, phrase);
    this.appendRemoveButton(chip, t("toolbar.filter"), () => actions.removeFilter(index));
  }

  private createChip(parent: HTMLElement, kind: "filter" | "sort"): HTMLElement {
    const chip = parent.createDiv({ cls: `db-active-control-chip is-${kind}` });
    const edit = chip.createEl("button", {
      cls: "db-active-control-edit",
      attr: { type: "button" },
    });
    edit.createSpan({ cls: "db-active-control-icon" });
    edit.createSpan({ cls: "db-active-control-field" });
    edit.createSpan({ cls: "db-active-control-detail" });
    return chip;
  }

  private setEditHandler(chip: HTMLElement, onEdit: () => void): void {
    const edit = chip.querySelector<HTMLElement>(".db-active-control-edit");
    if (edit) edit.onclick = onEdit;
  }

  private setEditLabel(chip: HTMLElement, label: string): void {
    const edit = chip.querySelector<HTMLElement>(".db-active-control-edit");
    if (!edit) return;
    edit.setAttribute("title", label);
    edit.setAttribute("aria-label", label);
  }

  private appendRemoveButton(chip: HTMLElement, label: string, onRemove: () => void): void {
    const remove = chip.createEl("button", {
      cls: "db-active-control-remove",
      text: "×",
      attr: {
        type: "button",
        title: `${t("common.delete")} ${label}`,
        "aria-label": `${t("common.delete")} ${label}`,
      },
    });
    remove.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      onRemove();
    };
  }
}

function createDirectionWord(direction: "asc" | "desc"): string {
  return direction === "desc" ? t("common.desc") : t("common.asc");
}

function formatFilterPhrase(field: string, operator: string, rule: FilterRule): string {
  if (rule.op === "empty" || rule.op === "notempty") return `${field} ${operator}`;
  const value = String(rule.value ?? "").trim();
  return value ? `${field} ${operator} ${value}` : `${field} ${operator}`;
}
