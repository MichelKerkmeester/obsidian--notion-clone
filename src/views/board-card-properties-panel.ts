// ───────────────────────────────────────────────────────────────────
// MODULE:    board-card-properties-panel
// COMPONENT: Cover/Title fixed rows plus a reorderable visibility list
// ───────────────────────────────────────────────────────────────────

// ───────────────────────────────────────────────────────────────────
// 1. PANEL
// ───────────────────────────────────────────────────────────────────

import { setIcon, setTooltip } from "obsidian";
import { getColumnsInOrder } from "../data/column-config";
import { t } from "../i18n";
import { NO_TITLE_FIELD, type ViewConfig } from "../data/types";
import { createCheckbox } from "./checkbox";
import { isHTMLElement } from "./dom-guards";
import { renderPropertyTypeIcon } from "./property-type-icon";
import {
  listBoardCardFields,
  toBoardCardFieldList,
  type BoardCardFieldContext,
} from "./board-card-fields";

export interface BoardCardPropertiesActions {
  onChange(label?: string): void;
  readOnly?: boolean;
  /** Set by the settings sheet on phone so the fixed Cover/Title rows carry the shared row
   *  grammar instead of the desktop two-column row. Omitted callers (desktop, stories, existing
   *  tests) keep the desktop row untouched. */
  asSheet?: boolean;
}

export function renderBoardCardProperties(
  panel: HTMLElement,
  config: ViewConfig,
  actions: BoardCardPropertiesActions,
  context?: BoardCardFieldContext,
): void {
  panel.createDiv({
    cls: "db-view-config-section-title db-view-config-section-view",
    text: t("viewConfig.cardProperties"),
    attr: { "data-scope": "view" },
  });
  renderFixedSlot(panel, t("viewConfig.cover"), coverLabel(config), actions.asSheet);
  renderFixedSlot(panel, t("viewConfig.titleField"), titleLabel(config), actions.asSheet);

  const entries = listBoardCardFields(config, getColumnsInOrder(config), context);
  let draggedKey: string | null = null;

  entries.forEach((entry, index) => {
    const row = panel.createDiv({
      cls: "db-column-manager-row",
      attr: { "data-note-database-column-key": entry.column.key },
    });

    if (!actions.readOnly) {
      row.draggable = true;
      row.ondragstart = (event) => {
        if (shouldIgnoreDrag(event)) {
          event.preventDefault();
          return;
        }
        draggedKey = entry.column.key;
        event.dataTransfer?.setData("text/plain", entry.column.key);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        row.addClass("is-dragging");
      };
      row.ondragover = (event) => {
        if (!draggedKey || draggedKey === entry.column.key) return;
        event.preventDefault();
        row.addClass("is-drop-target");
      };
      row.ondragleave = () => row.removeClass("is-drop-target");
      row.ondrop = (event) => {
        if (!draggedKey || draggedKey === entry.column.key) return;
        event.preventDefault();
        row.removeClass("is-drop-target");
        const from = entries.findIndex((candidate) => candidate.column.key === draggedKey);
        if (from < 0) return;
        const [moved] = entries.splice(from, 1);
        const target = entries.findIndex((candidate) => candidate.column.key === entry.column.key);
        const after = event.clientY > row.getBoundingClientRect().top + row.getBoundingClientRect().height / 2;
        const insertAt = Math.max(0, Math.min(entries.length, (target < 0 ? entries.length : target) + (after ? 1 : 0)));
        entries.splice(insertAt, 0, moved);
        persist(config, entries, actions);
        draggedKey = null;
      };
      row.ondragend = () => {
        draggedKey = null;
        row.removeClass("is-dragging");
        panel.querySelectorAll(".db-column-manager-row").forEach((el) => el.removeClass("is-drop-target"));
      };

      const drag = row.createSpan({ cls: "db-column-drag", text: "⋮⋮" });
      drag.title = t("panel.dragToSort");

      const moveControls = row.createSpan({ cls: "db-mobile-reorder-controls" });
      const upBtn = moveControls.createEl("button", { attr: { type: "button" } });
      setIcon(upBtn, "arrow-up");
      setTooltip(upBtn, t("menu.moveUp"), { delay: 100 });
      upBtn.disabled = index === 0;
      upBtn.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (index === 0) return;
        const [moved] = entries.splice(index, 1);
        entries.splice(index - 1, 0, moved);
        persist(config, entries, actions);
      };
      const downBtn = moveControls.createEl("button", { attr: { type: "button" } });
      setIcon(downBtn, "arrow-down");
      setTooltip(downBtn, t("menu.moveDown"), { delay: 100 });
      downBtn.disabled = index >= entries.length - 1;
      downBtn.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (index >= entries.length - 1) return;
        const [moved] = entries.splice(index, 1);
        entries.splice(index + 1, 0, moved);
        persist(config, entries, actions);
      };
    }

    const checkbox = createCheckbox(row, { role: "field" });
    checkbox.checked = entry.visible;
    checkbox.disabled = Boolean(actions.readOnly);
    if (!actions.readOnly) {
      checkbox.onchange = () => {
        entry.visible = checkbox.checked;
        persist(config, entries, actions);
      };
    }

    const typeEl = row.createSpan({
      cls: "db-column-type",
      attr: { title: entry.column.type },
    });
    renderPropertyTypeIcon(typeEl, entry.column, "db-column-type-icon");
    const nameWrap = row.createDiv({ cls: "db-column-name-wrap" });
    nameWrap.createSpan({
      text: entry.column.label || entry.column.key,
      cls: "db-column-name",
    });
  });
}

function persist(
  config: ViewConfig,
  entries: ReturnType<typeof listBoardCardFields>,
  actions: BoardCardPropertiesActions,
): void {
  config.boardCardFields = toBoardCardFieldList(entries);
  actions.onChange(t("undo.boardCardFieldsConfig"));
}

function renderFixedSlot(panel: HTMLElement, label: string, value: string, asSheet?: boolean): void {
  const row = panel.createDiv({ cls: asSheet ? "db-panel-row" : "db-view-config-row" });
  row.createDiv({ cls: "db-view-config-label", text: label });
  row.createDiv({ cls: "db-view-config-field" }).createDiv({
    cls: "db-view-config-readonly-value",
    text: value,
  });
}

function coverLabel(config: ViewConfig): string {
  if (!config.boardImageField) return t("viewConfig.noCover");
  const column = config.schema.columns.find((candidate) => candidate.key === config.boardImageField);
  return column?.label || config.boardImageField;
}

function titleLabel(config: ViewConfig): string {
  if (!config.titleField || config.titleField === "file.name") return t("viewConfig.titleAuto");
  if (config.titleField === NO_TITLE_FIELD) return t("viewConfig.noTitle");
  const column = config.schema.columns.find((candidate) => candidate.key === config.titleField);
  return column?.label || config.titleField;
}

function shouldIgnoreDrag(event: DragEvent): boolean {
  return isHTMLElement(event.target)
    && event.target.closest("input, select, textarea, button, .db-dropdown-field, .db-mobile-reorder-controls") != null;
}

export function boardCardPropertiesContext(config: ViewConfig): BoardCardFieldContext {
  const groupField = config.boardGroupField || config.groupByField || "";
  const subgroupField = config.boardSubgroupEnabled !== false && config.boardSubgroupField && config.boardSubgroupField !== groupField
    ? config.boardSubgroupField
    : undefined;
  return { groupField, subgroupField };
}
