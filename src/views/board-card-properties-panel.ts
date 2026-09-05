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
import { renderPropertyTypeIcon } from "./property-type-icon";
import { buildCheckboxPropertyRow, shouldIgnorePropertyRowDrag } from "./record-surface/property-row";
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
    const handle = buildCheckboxPropertyRow({
      parent: panel,
      rowClass: "db-column-manager-row",
      dataColumnKey: entry.column.key,
      draggable: !actions.readOnly,
      dragHandleClass: "db-column-drag",
      dragHandleTitle: t("panel.dragToSort"),
      moveControlsClass: "db-mobile-reorder-controls",
      drag: {
        onDragStart: (event) => {
          if (shouldIgnorePropertyRowDrag(event)) {
            event.preventDefault();
            return;
          }
          draggedKey = entry.column.key;
          event.dataTransfer?.setData("text/plain", entry.column.key);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          handle.row.addClass("is-dragging");
        },
        onDragOver: (event) => {
          if (!draggedKey || draggedKey === entry.column.key) return;
          event.preventDefault();
          handle.row.addClass("is-drop-target");
        },
        onDragLeave: () => handle.row.removeClass("is-drop-target"),
        onDrop: (event) => {
          if (!draggedKey || draggedKey === entry.column.key) return;
          event.preventDefault();
          handle.row.removeClass("is-drop-target");
          const from = entries.findIndex((candidate) => candidate.column.key === draggedKey);
          if (from < 0) return;
          const [moved] = entries.splice(from, 1);
          const target = entries.findIndex((candidate) => candidate.column.key === entry.column.key);
          const rect = handle.row.getBoundingClientRect();
          const after = event.clientY > rect.top + rect.height / 2;
          const insertAt = Math.max(0, Math.min(entries.length, (target < 0 ? entries.length : target) + (after ? 1 : 0)));
          entries.splice(insertAt, 0, moved);
          persist(config, entries, actions);
          draggedKey = null;
        },
        onDragEnd: () => {
          draggedKey = null;
          handle.row.removeClass("is-dragging");
          panel.querySelectorAll(".db-column-manager-row").forEach((el) => el.removeClass("is-drop-target"));
        },
      },
      move: {
        canMoveUp: index !== 0,
        canMoveDown: index < entries.length - 1,
        moveUpLabel: t("menu.moveUp"),
        moveDownLabel: t("menu.moveDown"),
        onMoveUp: () => {
          if (index === 0) return;
          const [moved] = entries.splice(index, 1);
          entries.splice(index - 1, 0, moved);
          persist(config, entries, actions);
        },
        onMoveDown: () => {
          if (index >= entries.length - 1) return;
          const [moved] = entries.splice(index, 1);
          entries.splice(index + 1, 0, moved);
          persist(config, entries, actions);
        },
      },
      checked: entry.visible,
      checkboxDisabled: Boolean(actions.readOnly),
      onCheckboxChange: actions.readOnly ? undefined : (checked) => {
        entry.visible = checked;
        persist(config, entries, actions);
      },
      typeClass: "db-column-type",
      typeTitle: entry.column.type,
      renderTypeIcon: (iconParent) => renderPropertyTypeIcon(iconParent, entry.column, "db-column-type-icon"),
      nameWrapClass: "db-column-name-wrap",
      nameClass: "db-column-name",
      nameText: entry.column.label || entry.column.key,
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

export function boardCardPropertiesContext(config: ViewConfig): BoardCardFieldContext {
  const groupField = config.boardGroupField || config.groupByField || "";
  const subgroupField = config.boardSubgroupEnabled !== false && config.boardSubgroupField && config.boardSubgroupField !== groupField
    ? config.boardSubgroupField
    : undefined;
  return { groupField, subgroupField };
}
