import { setIcon } from "obsidian";
import { getEffectiveFilterRules } from "../data/FilterRules";
import { ColumnDef, FilterRule, SourceRuleNode, ViewConfig } from "../data/types";
import { getViewRuleColumns } from "./ViewRuleOperations";
import { t } from "../i18n";
import { getFilterOperatorsForColumn } from "./FilterPanelRenderer";
import { DatabaseViewState } from "./ViewStateStore";

export interface ActiveViewControlsActions {
  editFilter(index: number, anchorEl: HTMLElement): void;
  editSort(index: number, anchorEl: HTMLElement): void;
  removeFilter(index: number): void;
  removeSort(index: number): void;
  toggleFilterLogic(): void;
  clearAll(): void;
}

interface EffectiveFilterEntry {
  rule: FilterRule;
  index: number;
}

function isNestedFilterTree(tree: SourceRuleNode | undefined): boolean {
  if (!tree || !("type" in tree)) return false;
  if (tree.type !== "group") return true;
  return tree.rules.some((rule) => "type" in rule);
}

export class ActiveViewControlsRenderer {
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
        const detail = rule.direction === "desc" ? t("common.desc") : t("common.asc");
        chip.querySelector<HTMLElement>(".db-active-control-detail")?.setText(detail);
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
    chip.querySelector<HTMLElement>(".db-active-control-field")?.setText(column?.label || rule.field);
    const operator = getFilterOperatorsForColumn(column).find(([value]) => value === rule.op)?.[1] || rule.op;
    const detail = rule.op === "empty" || rule.op === "notempty"
      ? operator
      : `${operator} · ${String(rule.value ?? "")}`;
    chip.querySelector<HTMLElement>(".db-active-control-detail")?.setText(detail);
    this.setEditLabel(chip, `${column?.label || rule.field} · ${detail}`);
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
