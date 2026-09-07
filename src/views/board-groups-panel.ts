// ───────────────────────────────────────────────────────────────────
// MODULE:    board-groups-panel
// COMPONENT: the board's Groups panel — per-group visibility, bulk hide/show,
//            drag reorder and the "hide empty groups" setting, on one surface
// ───────────────────────────────────────────────────────────────────
//
// One panel per document at a time: opening it from a second column's menu closes whichever
// instance is already open rather than stacking a second copy, and re-opening it from the same
// button toggles it closed — the same idiom `date-value-picker.ts`'s active-picker registry uses.
// The panel owns no persistence of its own; every commit goes through the callbacks its caller
// already has, the same shape `board-renderer.ts` uses for every other board action.
//
// The row list (`resolveBoardGroupsPanelKeys`/`renderBoardGroupsRows`) is split from the floating
// shell (`openBoardGroupsPanel`) so the list — every option, an orphan hidden key, the toggle and
// reorder wiring — is testable against a plain DOM double, the same way `board-card-properties-
// panel.ts`'s row builder is; the shell's positioning, focus trap and dismissal need a live
// document and are exercised by `tools/live/render-assertions.mjs` instead.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { formatGroupKeyDisplay, isUncategorizedGroupKey } from "../data/group-display";
import { getColumnDisplayType } from "../data/column-display";
import { resolveOptionDisplay } from "../data/column-types";
import { getEffectiveGroupOrder } from "../data/group-order";
import { STATUS_COLORS } from "../data/status-colors";
import { StatusColor, ViewConfig } from "../data/types";
import { t } from "../i18n";
import { createCheckbox } from "./checkbox";
import { trapFocus } from "./interaction-scope";
import { installPopoverAutoClose } from "./popover-auto-close";
import { positionToolbarPopover, releasePopoverPosition } from "./popover-position";
import { buildCheckboxPropertyRow, shouldIgnorePropertyRowDrag } from "./record-surface/property-row";
import { getSurfaceRoleDefaults } from "./surface-contract";
import { buildShellHeader } from "./surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface BoardGroupsRowActions {
  hideGroup(field: string, key: string): void;
  showGroup(field: string, key: string): void;
}

export interface BoardGroupsPanelActions extends BoardGroupsRowActions {
  updateGroupOrder(field: string, order: string[]): void;
  setBoardHideEmptyGroups(value: boolean): void;
}

export interface BoardGroupsPanelOptions {
  /** The column-menu button that opened the panel; also where the panel anchors and where
   *  keyboard focus returns once it closes. */
  anchorEl: HTMLElement;
  /** The board's own scrolling container — the panel mounts here, matching `filter-panel` and
   *  `record-detail-panel`'s `local` mount (`surface-contract.ts`). */
  containerEl: HTMLElement;
  config: ViewConfig;
  groupField: string;
  /** Every group key the board's own groups array carried before the hidden/empty filters ran. */
  groupKeys: string[];
  actions: BoardGroupsPanelActions;
}

// ───────────────────────────────────────────────────────────────────
// 3. ROW LIST — pure enough to test against a DOM double
// ───────────────────────────────────────────────────────────────────

/** Every key the panel lists: the field's effective display order plus any key
 *  `boardHiddenGroups` still carries that order no longer produces — a hidden option the schema
 *  dropped, listed as unknown and restorable (NFR-R02) rather than silently gone. */
export function resolveBoardGroupsPanelKeys(config: ViewConfig, groupField: string, groupKeys: string[]): string[] {
  const hiddenKeys = config.boardHiddenGroups?.[groupField] || [];
  let keys = getEffectiveGroupOrder(config, groupField, groupKeys);
  for (const key of hiddenKeys) if (!keys.includes(key)) keys = [...keys, key];
  return keys;
}

/** Build one row per key into `body`, wiring the visibility toggle and the drag/move-arrow
 *  reorder onto the caller's own state (`keys`/`hiddenKeys`) and callbacks — no persistence, no
 *  positioning, nothing that needs a live document. */
export function renderBoardGroupsRows(
  body: HTMLElement,
  config: ViewConfig,
  groupField: string,
  keys: string[],
  hiddenKeys: ReadonlySet<string>,
  actions: BoardGroupsRowActions,
  onReorder: (fromIndex: number, toIndex: number) => void,
): void {
  body.empty();
  const column = config.schema.columns.find((candidate) => candidate.key === groupField);
  const displayType = column ? getColumnDisplayType(column, config.schema.computedFields) : undefined;
  const canColor = displayType === "status" || displayType === "select" || displayType === "multi-select";
  let draggedKey: string | null = null;

  keys.forEach((key, index) => {
    const hidden = hiddenKeys.has(key);
    const optionColor = canColor && column && !isUncategorizedGroupKey(key)
      ? resolveOptionDisplay(column, key).option?.color
      : undefined;

    // The row shell, its drag handle, its type slot and its name column are the same classes
    // `board-card-properties-panel.ts` reuses for the same reason: one grid definition in
    // `styles.css` already lays all four out, and a second class name would mean a second copy of
    // that layout to keep in step.
    buildCheckboxPropertyRow({
      parent: body,
      rowClass: "obnotion-column-manager-row",
      dataColumnKey: key,
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
          draggedKey = key;
          event.dataTransfer?.setData("text/plain", key);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
        },
        onDragOver: (event) => {
          if (!draggedKey || draggedKey === key) return;
          event.preventDefault();
        },
        onDragLeave: () => undefined,
        onDrop: (event) => {
          if (!draggedKey || draggedKey === key) return;
          event.preventDefault();
          const from = keys.indexOf(draggedKey);
          const to = keys.indexOf(key);
          draggedKey = null;
          onReorder(from, to);
        },
        onDragEnd: () => { draggedKey = null; },
      },
      move: {
        canMoveUp: index !== 0,
        canMoveDown: index < keys.length - 1,
        moveUpLabel: t("menu.moveUp"),
        moveDownLabel: t("menu.moveDown"),
        onMoveUp: () => onReorder(index, index - 1),
        onMoveDown: () => onReorder(index, index + 1),
      },
      checked: !hidden,
      onCheckboxChange: (checked) => {
        if (checked) actions.showGroup(groupField, key);
        else actions.hideGroup(groupField, key);
      },
      typeClass: "obnotion-column-type",
      renderTypeIcon: (iconParent) => {
        const dot = iconParent.createSpan({ cls: "obnotion-board-groups-dot" });
        if (!optionColor) return;
        if (STATUS_COLORS.includes(optionColor as StatusColor)) dot.addClass(`status-color-${optionColor}`);
        else dot.style.backgroundColor = optionColor;
      },
      nameWrapClass: "obnotion-column-name-wrap",
      nameClass: "obnotion-column-name",
      nameText: formatGroupKeyDisplay(config, groupField, key, { uncategorizedLabel: t("board.noValue") }),
    });
  });
}

// ───────────────────────────────────────────────────────────────────
// 4. ACTIVE-PANEL REGISTRY
// ───────────────────────────────────────────────────────────────────

let activePanel: { anchorEl: HTMLElement; close: () => void } | undefined;

/** Close whichever Groups panel is open, if any — a column menu re-opening elsewhere closes it
 *  the same way any other outside interaction would. */
export function closeActiveBoardGroupsPanel(): void {
  activePanel?.close();
}

// ───────────────────────────────────────────────────────────────────
// 5. SHELL — positioning, focus trap and dismissal; needs a live document
// ───────────────────────────────────────────────────────────────────

export function openBoardGroupsPanel(options: BoardGroupsPanelOptions): void {
  const { anchorEl, containerEl, config, groupField, actions } = options;
  if (activePanel?.anchorEl === anchorEl) {
    activePanel.close();
    return;
  }
  activePanel?.close();

  const hiddenKeys = new Set(config.boardHiddenGroups?.[groupField] || []);
  let keys = resolveBoardGroupsPanelKeys(config, groupField, options.groupKeys);

  const panel = containerEl.createDiv({
    cls: "obnotion-board-groups-panel",
    attr: { role: "dialog", "aria-label": t("board.manageGroups") },
  });
  panel.tabIndex = -1;

  const close = (): void => {
    if (activePanel?.close !== close) return;
    activePanel = undefined;
    removeFocusTrap();
    removeAutoClose();
    releasePopoverPosition(panel);
    panel.remove();
    if (anchorEl.isConnected) anchorEl.focus({ preventScroll: true });
  };

  buildShellHeader(panel, {
    title: t("board.manageGroups"),
    onClose: close,
  });

  const bulkActions = panel.createDiv({ cls: "obnotion-board-groups-actions" });
  const hideAllBtn = bulkActions.createEl("button", { cls: "obnotion-panel-button", text: t("board.hideAllGroups"), attr: { type: "button" } });
  hideAllBtn.onclick = () => {
    for (const key of keys) {
      if (!hiddenKeys.has(key)) {
        hiddenKeys.add(key);
        actions.hideGroup(groupField, key);
      }
    }
    renderRows();
  };
  const showAllBtn = bulkActions.createEl("button", { cls: "obnotion-panel-button", text: t("board.showAllGroups"), attr: { type: "button" } });
  showAllBtn.onclick = () => {
    for (const key of keys) {
      if (hiddenKeys.has(key)) {
        hiddenKeys.delete(key);
        actions.showGroup(groupField, key);
      }
    }
    renderRows();
  };

  const body = panel.createDiv({ cls: "obnotion-board-groups-body" });

  const reorder = (fromIndex: number, toIndex: number): void => {
    if (fromIndex < 0 || fromIndex === toIndex) return;
    const next = keys.slice();
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    keys = next;
    actions.updateGroupOrder(groupField, keys);
    renderRows();
  };

  const rowActions: BoardGroupsRowActions = {
    hideGroup: (field, key) => {
      hiddenKeys.add(key);
      actions.hideGroup(field, key);
    },
    showGroup: (field, key) => {
      hiddenKeys.delete(key);
      actions.showGroup(field, key);
    },
  };

  function renderRows(): void {
    renderBoardGroupsRows(body, config, groupField, keys, hiddenKeys, rowActions, reorder);
  }

  renderRows();

  const footer = panel.createDiv({ cls: "obnotion-board-groups-footer" });
  const emptyRow = footer.createDiv({ cls: "obnotion-board-groups-empty-row" });
  const emptyCheckbox = createCheckbox(emptyRow, { role: "field" });
  emptyCheckbox.checked = config.boardHideEmptyGroups !== false;
  emptyCheckbox.onchange = () => actions.setBoardHideEmptyGroups(emptyCheckbox.checked);
  emptyRow.createSpan({ cls: "obnotion-board-groups-empty-label", text: t("board.hideEmptyGroups") });

  const removeFocusTrap = trapFocus(panel, { onEscape: close });
  const removeAutoClose = installPopoverAutoClose({
    panel,
    anchorEl,
    close,
    closeOnOutsidePointerDown: true,
    // trapFocus above already owns Escape (and stops it from bubbling), so the stack does not
    // need a second listener racing the same key.
    closeOnEscape: false,
  });

  activePanel = { anchorEl, close };

  const widthPolicy = getSurfaceRoleDefaults("panel").width;
  const widthOptions = widthPolicy.kind === "bounded"
    ? { minWidth: widthPolicy.minWidth, preferredWidth: widthPolicy.preferredWidth, maxWidth: widthPolicy.maxWidth }
    : { minWidth: 292, preferredWidth: 360, maxWidth: 360 };
  positionToolbarPopover(panel, anchorEl, widthOptions);
  panel.focus({ preventScroll: true });
}
