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
    cls: "obnotion-view-config-section-title obnotion-view-config-section-view",
    text: t("viewConfig.cardProperties"),
    attr: { "data-scope": "view" },
  });
  renderFixedSlot(panel, t("viewConfig.cover"), coverLabel(config), actions.asSheet);
  renderFixedSlot(panel, t("viewConfig.titleField"), titleLabel(config), actions.asSheet, () => openTitleFieldPicker(panel));

  const entries = listBoardCardFields(config, getColumnsInOrder(config), context);
  let draggedKey: string | null = null;

  entries.forEach((entry, index) => {
    const handle = buildCheckboxPropertyRow({
      parent: panel,
      rowClass: "obnotion-column-manager-row",
      dataColumnKey: entry.column.key,
      draggable: !actions.readOnly,
      dragHandleClass: "obnotion-column-drag",
      dragHandleTitle: t("panel.dragToSort"),
      moveControlsClass: "obnotion-mobile-reorder-controls",
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
          panel.querySelectorAll(".obnotion-column-manager-row").forEach((el) => el.removeClass("is-drop-target"));
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
      stateControlDisabled: Boolean(actions.readOnly),
      onToggle: actions.readOnly ? undefined : (next) => {
        entry.visible = next;
        persist(config, entries, actions);
      },
      typeClass: "obnotion-column-type",
      typeTitle: entry.column.type,
      renderTypeIcon: (iconParent) => renderPropertyTypeIcon(iconParent, entry.column, "obnotion-column-type-icon"),
      nameWrapClass: "obnotion-column-name-wrap",
      nameClass: "obnotion-column-name",
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

function renderFixedSlot(panel: HTMLElement, label: string, value: string, asSheet?: boolean, onOpen?: () => void): void {
  const baseCls = asSheet ? "obnotion-panel-row" : "obnotion-view-config-row";
  const row = panel.createDiv({
    cls: onOpen ? `${baseCls} obnotion-view-config-row-clickable` : baseCls,
    attr: onOpen ? { role: "button", tabindex: "0" } : undefined,
  });
  row.createDiv({ cls: "obnotion-view-config-label", text: label });
  row.createDiv({ cls: "obnotion-view-config-field" }).createDiv({
    cls: "obnotion-view-config-readonly-value",
    text: value,
  });
  if (!onOpen) return;
  row.onclick = () => onOpen();
  row.onkeydown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };
}

/** Jumps to the one canonical `titleField` picker (the general section's dropdown, rendered
 *  earlier into this same scrolling panel) rather than building a second picker here — the
 *  Title row's fixed slot only needed a way to reach the control that already exists. */
function openTitleFieldPicker(panel: HTMLElement): void {
  const row = panel.querySelector<HTMLElement>('[data-config-row="title-field"]');
  if (!row) return;
  row.scrollIntoView?.({ behavior: "smooth", block: "center" });
  // The dropdown field's own onclick (dropdown-field.ts) ignores its event argument, so this
  // reaches the same open-popover path a real click would without constructing a synthetic
  // pointer event the test environment has no DOM to build.
  row.querySelector<HTMLButtonElement>(".obnotion-dropdown-field")?.onclick?.(undefined as unknown as PointerEvent);
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
