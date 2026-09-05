// ───────────────────────────────────────────────────────────────────
// MODULE:    toolbar-primitives
// COMPONENT: shared building blocks for toolbar controls and surfaces
// ───────────────────────────────────────────────────────────────────

import { setIcon, setTooltip } from "obsidian";
import { createSheetHeader } from "./mobile-bottom-sheet";
import { installPopoverAutoClose } from "./popover-auto-close";
import {
  COMPACT_MENU_POPOVER,
  PANEL_POPOVER,
  ToolbarPopoverPositionOptions,
  positionToolbarPopover,
  releasePopoverPosition,
} from "./popover-position";
import { overlayStack } from "./overlay-stack";

export const SETTINGS_FALLBACK_CLASSES = [
  "db-view-config-btn",
  "db-chart-options-toolbar-btn",
  "db-calendar-timeline-options-toolbar-btn",
] as const;

const CONDITION_FIELD_FLOOR_PX = 140;
const CONDITION_VALUE_FLOOR_PX = 120;

// ───────────────────────────────────────────────────────────────────
// 1. POPOVER SHELL
// ───────────────────────────────────────────────────────────────────

export type ToolbarSurfaceRole = "menu" | "panel" | "condition-panel";

export interface PopoverShellOptions {
  title: string;
  role: ToolbarSurfaceRole;
  width?: number | ToolbarPopoverPositionOptions;
  className?: string;
  id?: string;
  /** Surfaces that rebuild their own caption (the group popover) skip the shared header. */
  omitHeader?: boolean;
  /** Insert extra header chrome before the close control, the same hook the sheet header already offers. */
  beforeClose?(header: HTMLElement): void;
  onClose?(): void;
}

export interface PopoverShellHandle {
  panel: HTMLElement;
  header: HTMLElement;
  close(): void;
  destroy(): void;
}

function getToolbarRoot(anchor: HTMLElement): HTMLElement {
  return anchor.closest<HTMLElement>(".note-database-container")
    || anchor.parentElement
    || anchor.ownerDocument.body;
}

function getPopoverPosition(role: ToolbarSurfaceRole, width?: number | ToolbarPopoverPositionOptions): ToolbarPopoverPositionOptions {
  if (typeof width === "number") return { preferredWidth: width, maxWidth: width };
  if (width) return width;
  return role === "condition-panel" ? PANEL_POPOVER : COMPACT_MENU_POPOVER;
}

function closeToolbarSibling(anchor: HTMLElement): void {
  const toolbar = anchor.closest<HTMLElement>(".db-toolbar")
    || anchor.closest<HTMLElement>(".note-database-container");
  if (!toolbar) return;
  let guard = 0;
  while (guard++ < 8) {
    const top = overlayStack.getTopSurfaceForDocument(anchor.ownerDocument);
    if (!top || top.anchor === anchor) return;
    const topToolbar = top.anchor?.closest<HTMLElement>(".db-toolbar")
      || top.anchor?.closest<HTMLElement>(".note-database-container");
    if (topToolbar !== toolbar) return;
    overlayStack.dismissTop("programmatic");
  }
}

/** Close every other toolbar surface that is currently on top of this one. */
export function dismissToolbarSurfaces(anchor: HTMLElement): void {
  closeToolbarSibling(anchor);
}

/** Build one anchored surface with the shared header, placement and dismissal lifecycle. */
export function createPopoverShell(anchor: HTMLElement, options: PopoverShellOptions): PopoverShellHandle {
  closeToolbarSibling(anchor);
  const panel = getToolbarRoot(anchor).createDiv({
    cls: ["db-toolbar-popover", options.className].filter(Boolean).join(" "),
    attr: {
      ...(options.id ? { id: options.id } : {}),
      role: options.role === "menu" ? "menu" : "dialog",
      "data-surface-role": options.role,
      "aria-label": options.title,
    },
  });
  panel.tabIndex = -1;

  let closed = false;
  let removeAutoClose: (() => void) | undefined;
  const close = (): void => {
    if (closed) return;
    closed = true;
    removeAutoClose?.();
    removeAutoClose = undefined;
    releasePopoverPosition(panel);
    panel.remove();
    options.onClose?.();
  };

  const header = options.omitHeader
    ? panel
    : createSheetHeader(panel, { title: options.title, onClose: close, beforeClose: options.beforeClose }).header;
  positionToolbarPopover(panel, anchor, getPopoverPosition(options.role, options.width));
  removeAutoClose = installPopoverAutoClose({ panel, anchorEl: anchor, close });

  return { panel, header, close, destroy: close };
}

// ───────────────────────────────────────────────────────────────────
// 2. CONDITION ROW
// ───────────────────────────────────────────────────────────────────

export type ConditionPart = HTMLElement | ((parent: HTMLElement) => HTMLElement | void);

export interface ConditionRowOptions {
  field: ConditionPart;
  operator: ConditionPart;
  value?: ConditionPart;
  leading?: ConditionPart;
  trailing?: ConditionPart;
  className?: string;
  compact?: boolean;
  onChange?(): void;
}

function appendConditionPart(row: HTMLElement, part: ConditionPart | undefined, minWidthPx?: number): void {
  if (!part) return;
  const before = row.childElementCount;
  if (typeof part === "function") part(row);
  else row.appendChild(part);
  if (!minWidthPx) return;
  for (let index = before; index < row.childElementCount; index += 1) {
    const child = row.children[index];
    if (child instanceof HTMLElement) child.style.minWidth = `${minWidthPx}px`;
  }
}

/** Build the shared property/operator/value row while leaving each control's behaviour to its owner. */
export function createConditionRow(parent: HTMLElement, options: ConditionRowOptions): HTMLElement {
  const row = parent.createDiv({
    cls: ["db-panel-row", options.className, options.compact ? "db-active-rule-editor-row" : ""].filter(Boolean).join(" "),
  });
  appendConditionPart(row, options.leading);
  appendConditionPart(row, options.field, options.compact ? undefined : CONDITION_FIELD_FLOOR_PX);
  appendConditionPart(row, options.operator, options.compact ? undefined : CONDITION_FIELD_FLOOR_PX);
  appendConditionPart(row, options.value, options.compact ? undefined : CONDITION_VALUE_FLOOR_PX);
  appendConditionPart(row, options.trailing);
  if (options.onChange) {
    row.addEventListener("change", () => options.onChange?.());
    row.addEventListener("input", () => options.onChange?.());
  }
  return row;
}

// ───────────────────────────────────────────────────────────────────
// 3. CONTROL CLUSTER BUTTON
// ───────────────────────────────────────────────────────────────────

export type ToolbarControlState = "add" | "active";

export interface ControlClusterButtonOptions {
  icon: string;
  label: string;
  state: ToolbarControlState;
  count?: number;
  neutralCount?: boolean;
  className?: string;
  ariaHaspopup?: "menu" | "dialog" | "listbox";
  ariaControls?: string;
  onClick?(): void;
}

/** Build a toolbar trigger whose visible and announced state cannot drift from its count. */
export function createControlClusterButton(parent: HTMLElement, options: ControlClusterButtonOptions): HTMLButtonElement {
  const button = parent.createEl("button", {
    cls: ["db-toolbar-icon-button", options.className].filter(Boolean).join(" "),
    attr: {
      type: "button",
      "aria-label": options.label,
      "data-control-state": options.state,
      ...(options.ariaHaspopup ? { "aria-haspopup": options.ariaHaspopup } : {}),
      ...(options.ariaControls ? { "aria-controls": options.ariaControls } : {}),
    },
  });
  setIcon(button, options.icon);
  setTooltip(button, options.label, { delay: 100 });
  button.toggleClass("is-active", options.state === "active");
  button.toggleClass("is-add", options.state === "add");
  if (options.count && options.count > 0) {
    button.createSpan({
      cls: `db-toolbar-badge${options.neutralCount ? " db-toolbar-badge-neutral" : ""}`,
      text: String(options.count),
    });
  }
  if (options.onClick) button.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    options.onClick?.();
  };
  return button;
}

// ───────────────────────────────────────────────────────────────────
// 4. SETTINGS ENTRY
// ───────────────────────────────────────────────────────────────────

export interface SettingsEntryActions {
  open?(anchor: HTMLElement): void;
  icon?: string;
  label?: string;
  /** The live utilities trigger opens a menu first; only a dedicated settings control is a dialog. */
  ariaHaspopup?: "menu" | "dialog";
}

/** Stamp the classes older hosts still query when they look for a settings trigger. */
export function stampSettingsFallbackClasses(el: HTMLElement): void {
  for (const cls of SETTINGS_FALLBACK_CLASSES) el.addClass(cls);
}

/** Wire one existing settings trigger to the host's resolved settings surface. */
export function createSettingsEntry(anchor: HTMLElement, actions: SettingsEntryActions): HTMLButtonElement {
  const button = anchor as HTMLButtonElement;
  const label = actions.label || "Settings";
  stampSettingsFallbackClasses(button);
  button.setAttribute("aria-haspopup", actions.ariaHaspopup || "dialog");
  button.setAttribute("aria-label", label);
  if (actions.icon) setIcon(button, actions.icon);
  setTooltip(button, label, { delay: 100 });
  if (actions.open) {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      actions.open?.(button);
    };
  }
  return button;
}

// ───────────────────────────────────────────────────────────────────
// 5. TAB STRIP
// ───────────────────────────────────────────────────────────────────

export interface ToolbarTabDefinition {
  id: string;
  label: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  attributes?: Record<string, string>;
}

export interface TabStripOptions {
  tabs: ToolbarTabDefinition[];
  activeId: string;
  onActivate(id: string, tab: HTMLElement): void;
  onContext?(event: MouseEvent, id: string, tab: HTMLElement): void;
  onDoubleActivate?(id: string, tab: HTMLElement): void;
  onReorder?(fromId: string, toId: string): void;
  addButton?: {
    label: string;
    disabled?: boolean;
    onClick(event?: MouseEvent): void;
    attributes?: Record<string, string>;
  };
  ariaLabel?: string;
  measureOverflow?: boolean;
  onOverflow?(overflowingIds: string[]): void;
  renderIcon?(parent: HTMLElement, tab: ToolbarTabDefinition): void;
}

export interface TabStripHandle {
  root: HTMLElement;
  tabs: Map<string, HTMLElement>;
  addButton?: HTMLButtonElement;
  setActive(id: string): void;
}

function measureTabOverflow(root: HTMLElement, tabs: Map<string, HTMLElement>): string[] {
  const overflowing: string[] = [];
  const limit = root.getBoundingClientRect().right;
  for (const [id, tab] of tabs) {
    if (tab.getBoundingClientRect().right > limit + 1) overflowing.push(id);
  }
  return overflowing;
}

function installTabDrag(tab: HTMLElement, id: string, tabs: Map<string, HTMLElement>, onReorder: (fromId: string, toId: string) => void): void {
  tab.draggable = true;
  tab.ondragstart = (event) => {
    tab.addClass("is-dragging");
    event.dataTransfer?.setData("text/plain", id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  };
  tab.ondragover = (event) => {
    const fromId = event.dataTransfer?.getData("text/plain");
    if (!fromId || fromId === id) return;
    event.preventDefault();
    tab.addClass("is-drop-target");
  };
  tab.ondragleave = () => tab.removeClass("is-drop-target");
  tab.ondrop = (event) => {
    const fromId = event.dataTransfer?.getData("text/plain");
    tab.removeClass("is-dragging", "is-drop-target");
    if (!fromId || fromId === id) return;
    event.preventDefault();
    onReorder(fromId, id);
  };
  tab.ondragend = () => {
    tab.removeClass("is-dragging", "is-drop-target");
    for (const other of tabs.values()) other.removeClass("is-drop-target", "is-dragging");
  };
}

/** Build the accessible tablist; overflow and drag policy remain measurable host concerns. */
export function createTabStrip(parent: HTMLElement, options: TabStripOptions): TabStripHandle {
  const root = parent.createDiv({
    cls: "db-view-tabs",
    attr: { role: "tablist", "aria-label": options.ariaLabel || "Views" },
  });
  const tabs = new Map<string, HTMLElement>();
  const setActive = (id: string): void => {
    for (const [tabId, tab] of tabs) {
      const active = tabId === id;
      tab.toggleClass("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    }
  };
  for (const definition of options.tabs) {
    const tab = root.createEl("button", {
      cls: `db-view-tab${definition.active || definition.id === options.activeId ? " is-active" : ""}`,
      attr: {
        type: "button",
        role: "tab",
        "aria-selected": String(definition.active || definition.id === options.activeId),
        "data-tab-id": definition.id,
        tabindex: definition.active || definition.id === options.activeId ? "0" : "-1",
        ...definition.attributes,
      },
    });
    if (definition.disabled) tab.disabled = true;
    if (options.renderIcon) options.renderIcon(tab.createSpan({ cls: "db-view-tab-icon" }), definition);
    else if (definition.icon) setIcon(tab.createSpan({ cls: "db-view-tab-icon" }), definition.icon);
    tab.createSpan({ cls: "db-view-tab-name", text: definition.label });
    tab.onclick = () => options.onActivate(definition.id, tab);
    if (options.onContext) tab.oncontextmenu = (event) => options.onContext?.(event, definition.id, tab);
    if (options.onDoubleActivate) tab.ondblclick = () => options.onDoubleActivate?.(definition.id, tab);
    if (options.onReorder && !definition.disabled) installTabDrag(tab, definition.id, tabs, options.onReorder);
    tabs.set(definition.id, tab);
  }
  let addButton: HTMLButtonElement | undefined;
  if (options.addButton) {
    const add = root.createEl("button", {
      cls: "db-view-tab db-view-tab-add",
      attr: {
        type: "button",
        "aria-label": options.addButton.label,
        ...options.addButton.attributes,
      },
    });
    addButton = add;
    add.disabled = Boolean(options.addButton.disabled);
    setIcon(add, "plus");
    setTooltip(add, options.addButton.label, { delay: 100 });
    if (!add.disabled) add.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      options.addButton?.onClick(event);
    };
  }
  if (options.measureOverflow !== false) {
    const apply = (): void => {
      if (!root.isConnected) return;
      options.onOverflow?.(measureTabOverflow(root, tabs));
    };
    const ResizeObserverCtor = parent.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserverCtor) {
      const observer = new ResizeObserverCtor(apply);
      observer.observe(root);
    }
  }
  return { root, tabs, addButton, setActive };
}
