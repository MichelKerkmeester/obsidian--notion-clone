import { FilterPanelActions, FilterPanelRenderer } from "./FilterPanelRenderer";
import { installPopoverAutoClose } from "./PopoverAutoClose";
import { positionToolbarPopover } from "./PopoverPosition";
import { SortPanelActions, SortPanelRenderer } from "./SortPanelRenderer";
import { DatabaseViewState } from "./ViewStateStore";
import { ViewConfig } from "../data/types";
import { t } from "../i18n";

type ActiveRuleKind = "filter" | "sort";

export class ActiveRulePopoverRenderer {
  private panelEl?: HTMLElement;
  private cleanup?: () => void;
  private activeKey?: string;
  private onClosed?: () => void;

  toggleFilter(options: {
    containerEl: HTMLElement;
    anchorEl: HTMLElement;
    index: number;
    state: DatabaseViewState;
    config: ViewConfig;
    renderer: FilterPanelRenderer;
    actions: FilterPanelActions;
    onClose: () => void;
  }): void {
    const key = `filter:${options.index}`;
    if (this.activeKey === key && this.panelEl?.isConnected) {
      this.close();
      return;
    }
    this.open("filter", key, options.containerEl, options.anchorEl, options.onClose, (panel) => {
      options.renderer.renderSingleRuleEditor(
        panel,
        options.containerEl,
        options.index,
        options.state,
        options.config,
        options.actions
      );
    });
  }

  toggleSort(options: {
    containerEl: HTMLElement;
    anchorEl: HTMLElement;
    index: number;
    state: DatabaseViewState;
    config: ViewConfig;
    renderer: SortPanelRenderer;
    actions: SortPanelActions;
    onClose: () => void;
  }): void {
    const key = `sort:${options.index}`;
    if (this.activeKey === key && this.panelEl?.isConnected) {
      this.close();
      return;
    }
    this.open("sort", key, options.containerEl, options.anchorEl, options.onClose, (panel) => {
      options.renderer.renderSingleRuleEditor(
        panel,
        options.index,
        options.config,
        options.state,
        options.actions
      );
    });
  }

  close(): void {
    this.finishClose(true);
  }

  private finishClose(notify: boolean): void {
    const onClosed = this.onClosed;
    const activeElement = this.panelEl?.ownerDocument.activeElement;
    if (activeElement instanceof HTMLElement && this.panelEl?.contains(activeElement)) activeElement.blur();
    this.cleanup?.();
    this.cleanup = undefined;
    this.panelEl?.remove();
    this.panelEl = undefined;
    this.activeKey = undefined;
    this.onClosed = undefined;
    if (notify) onClosed?.();
  }

  private open(
    kind: ActiveRuleKind,
    key: string,
    containerEl: HTMLElement,
    anchorEl: HTMLElement,
    onClose: () => void,
    renderEditor: (panel: HTMLElement) => void
  ): void {
    this.close();
    const resolvedAnchor = anchorEl.isConnected
      ? anchorEl
      : containerEl.querySelector<HTMLElement>(`[data-active-rule-key="${key}"]`) || anchorEl;
    const panel = containerEl.createDiv({
      cls: `db-active-rule-popover db-filter-panel${kind === "sort" ? " db-sort-panel" : ""} is-${kind}`,
      attr: {
        role: "dialog",
        "aria-label": kind === "filter" ? t("toolbar.filter") : t("toolbar.sort"),
      },
    });
    renderEditor(panel);
    this.panelEl = panel;
    this.activeKey = key;
    this.onClosed = onClose;
    positionToolbarPopover(panel, resolvedAnchor, {
      align: "left",
      minWidth: kind === "filter" ? 280 : 240,
      preferredWidth: kind === "filter" ? 560 : 420,
      maxWidth: kind === "filter" ? 620 : 480,
    });
    this.cleanup = installPopoverAutoClose({
      panel,
      anchorEl: resolvedAnchor,
      close: () => this.close(),
      closeOnOutsidePointerDown: true,
      closeOnEscape: true,
      isActiveTarget: (target) => target instanceof HTMLElement &&
        Boolean(target.closest(
          ".db-active-control-chip, .db-dropdown-popover, .db-color-picker-popup, .db-date-value-popover"
        )),
    });
  }
}
