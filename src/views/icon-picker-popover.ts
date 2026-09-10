// ───────────────────────────────────────────────────────────────────
// MODULE:    icon-picker-popover
// COMPONENT: emoji/Lucide icon picker popover with search, recents, and
//            arrow-key grid navigation
// ───────────────────────────────────────────────────────────────────
//
// The active-picker registry, the phone sheet header and the arrow-key grid navigator are the
// picker host's, shared with the colour and date pickers — opening this one auto-closes whichever
// of the three was open, since only one is ever meant to be. Only the emoji/Lucide catalogue and
// its tab/category chrome are this file's own.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { Notice, setIcon, setTooltip } from "obsidian";
import { EMOJI_CATEGORIES, getLucideCategoryIds, LUCIDE_CATEGORY_DEFINITIONS } from "../data/icon-picker-catalog";
import { RECORD_ICON_COLORS, RecordIconColor, serializeLucideIconToken } from "../data/record-icon";
import { t } from "../i18n";
import { installPopoverAutoClose } from "./popover-auto-close";
import { positionToolbarPopover } from "./popover-position";
import {
  clearActivePickerIfCurrent,
  closeActivePicker,
  getGridNavigationTarget,
  GRID_PICKER_POPOVER,
  mountPickerSheetHeader,
  setActivePicker,
  type ActivePicker,
} from "./popover-host";
import { getValidRecordIconIds } from "./record-icon-renderer";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface IconPickerOptions {
  anchor: HTMLElement;
  current?: string;
  recent?: string[];
  /** Sheet-header title on a phone — the field this icon belongs to. Falls back to a generic label. */
  label?: string;
  onRecentChange?(recent: string[]): void | Promise<void>;
  onConfigureField?(): void;
  onSelect(value: string | null): void | Promise<void>;
}

// ───────────────────────────────────────────────────────────────────
// 3. CONSTANTS
// ───────────────────────────────────────────────────────────────────

const EMOJI_CATEGORY_ICONS: Record<string, string> = {
  people: "smile", nature: "leaf", food: "carrot", activities: "trophy",
  travel: "plane", objects: "lightbulb", symbols: "badge-check", flags: "flag",
};

// ───────────────────────────────────────────────────────────────────
// 4. ICON PICKER POPOVER
// ───────────────────────────────────────────────────────────────────

export function openIconPickerPopover(options: IconPickerOptions): () => void {
  const doc = options.anchor.ownerDocument;
  const view = doc.defaultView || window;
  closeActivePicker(doc);
  const panel = doc.body.createDiv({ cls: "obnotion-icon-picker-popover" });
  panel.setAttr("role", "dialog");
  panel.setAttr("aria-label", t("recordIcon.configureField"));
  panel.style.setProperty("color-scheme", "light dark");
  let tab: "emoji" | "lucide" = options.current?.startsWith("lucide:") ? "lucide" : "emoji";
  let category = tab === "emoji" ? "people" : "common";
  let color: RecordIconColor = (options.current?.match(/^lucide:[^@]+@([a-z]+)$/)?.[1] as RecordIconColor) || "gray";
  let current = options.current ?? null;
  let recent = [...(options.recent || [])];
  let searchQuery = "";
  let closed = false;

  let removeAutoClose: (() => void) | undefined;
  let entry: ActivePicker;
  const close = () => {
    if (closed) return;
    closed = true;
    removeAutoClose?.();
    panel.remove();
    doc.removeEventListener("keydown", onKeydown, true);
    clearActivePickerIfCurrent(doc, entry);
  };
  entry = { anchor: options.anchor, close };
  const commit = async (value: string | null) => {
    try {
      await options.onSelect(value);
      current = value;
      if (value) {
        recent = [value, ...recent.filter((item) => item !== value)].slice(0, 16);
        await options.onRecentChange?.(recent);
      }
      render(true);
    } catch (error) {
      new Notice(t("errors.updateFailed", { error: String(error) }));
    }
  };

  // The sheet header (title + 44px close) is built once, ahead of every re-render: its title never
  // changes while the picker is open, and rebuilding it on each keystroke in the search field would
  // tear down and refocus a control the operator is not touching. Every phone sheet, this dropdown
  // included, carries the same header — the desktop popover stays exactly as small and title-less
  // as before.
  const content = mountPickerSheetHeader(panel, doc, {
    title: options.label || t("recordIcon.icons"),
    onClose: close,
    bodyCls: "obnotion-icon-picker-body obnotion-panel-row",
  });

  const render = (preserveScroll = false, restoreFocus = true) => {
    const previousScrollTop = preserveScroll
      ? content.querySelector<HTMLElement>(".obnotion-icon-picker-scroll")?.scrollTop || 0
      : 0;
    const previousIcon = restoreFocus && doc.activeElement instanceof HTMLElement
      ? doc.activeElement.getAttribute("data-icon-value")
      : null;
    const searchWasFocused = restoreFocus && doc.activeElement?.classList.contains("obnotion-icon-picker-search");
    content.empty();
    const header = content.createDiv({ cls: "obnotion-icon-picker-header" });
    const tabs = header.createDiv({ cls: "obnotion-icon-picker-tabs" });
    tabs.setAttr("role", "tablist");
    tabs.setAttr("aria-label", t("recordIcon.configureField"));
    const createTab = (kind: "emoji" | "lucide", label: string) => {
      const button = tabs.createEl("button", { text: label, cls: tab === kind ? "is-active" : "", attr: { type: "button", role: "tab", "aria-selected": tab === kind ? "true" : "false" } });
      button.onclick = () => { tab = kind; category = kind === "emoji" ? "people" : "common"; render(); };
    };
    createTab("emoji", t("recordIcon.emoji"));
    createTab("lucide", t("recordIcon.icons"));
    const search = header.createEl("input", {
      cls: "obnotion-icon-picker-search",
      attr: { type: "search", placeholder: t("iconPicker.search"), "aria-label": t("iconPicker.search"), value: searchQuery },
    });
    search.oninput = () => {
      searchQuery = search.value.trim().toLocaleLowerCase();
      render(true, false);
      view.requestAnimationFrame(() => panel.querySelector<HTMLInputElement>(".obnotion-icon-picker-search")?.focus());
    };
    // These three sat crowded beside the search field; they read on their own 44px row now, so
    // the field stands alone in the header and each control keeps a thumb-sized touch box.
    // The shared sheet header exposes no leading slot, so the picker carries Remove in its own
    // body instead of in the header, the way the picker's cousins already do.
    const actions = content.createDiv({ cls: "obnotion-icon-picker-actions" });
    const remove = actions.createEl("button", { text: t("recordIcon.remove"), cls: "obnotion-icon-picker-remove", attr: { type: "button" } });
    remove.onclick = () => { void commit(null); };
    const random = actions.createEl("button", { cls: "obnotion-icon-picker-random", attr: { type: "button", title: t("recordIcon.random"), "aria-label": t("recordIcon.random") } });
    setIcon(random, "shuffle");
    if (options.onConfigureField) {
      const settings = actions.createEl("button", {
        cls: "obnotion-icon-picker-settings",
        attr: { type: "button", title: t("recordIcon.configureField"), "aria-label": t("recordIcon.configureField") },
      });
      setIcon(settings, "settings-2");
      setTooltip(settings, t("recordIcon.configureField"), { delay: 150 });
      settings.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        close();
        options.onConfigureField?.();
      };
    }

    if (tab === "lucide") {
      const colors = panel.createDiv({ cls: "obnotion-icon-picker-colors" });
      for (const candidate of RECORD_ICON_COLORS) {
        const dot = colors.createEl("button", {
          cls: `obnotion-icon-color obnotion-icon-color-${candidate}${candidate === color ? " is-active" : ""}`,
          attr: { type: "button", title: candidate, "aria-label": candidate },
        });
        dot.onclick = () => { color = candidate; render(true); };
      }
    }

    const computeValues = () => {
      const recentValues = recent.filter((value) => tab === "lucide" ? value.startsWith("lucide:") : !value.startsWith("lucide:"));
      const allLucide = getValidRecordIconIds();
      let values: string[];
      let sectionLabel: string;
      if (tab === "emoji") {
        const selectedCategory = EMOJI_CATEGORIES.find((item) => item.id === category) || EMOJI_CATEGORIES[0];
        values = category === "recent" ? recentValues : selectedCategory.items.map((item) => item.value);
        sectionLabel = category === "recent" ? t("recordIcon.recent") : t(selectedCategory.labelKey);
        if (searchQuery) {
          values = EMOJI_CATEGORIES.flatMap((item) => item.items
            .filter((candidate) => `${candidate.value} ${candidate.keywords}`.toLocaleLowerCase().includes(searchQuery))
            .map((candidate) => candidate.value));
          sectionLabel = t("iconPicker.searchResults");
        }
      } else {
        const known = new Set(LUCIDE_CATEGORY_DEFINITIONS.flatMap((item) => getLucideCategoryIds(item.id, allLucide)));
        const source = category === "other" ? allLucide.filter((id) => !known.has(id)) : getLucideCategoryIds(category, allLucide);
        values = category === "recent" ? recentValues : source;
        const definition = LUCIDE_CATEGORY_DEFINITIONS.find((item) => item.id === category);
        sectionLabel = category === "recent" ? t("recordIcon.recent") : definition ? t(definition.labelKey) : t("recordIcon.category.other");
        if (searchQuery) {
          values = allLucide.filter((id) => id.toLocaleLowerCase().includes(searchQuery));
          sectionLabel = t("iconPicker.searchResults");
        }
      }
      return { recentValues, values, sectionLabel };
    };
    const renderGrid = (scroller: HTMLElement) => {
      const { recentValues, values, sectionLabel } = computeValues();
      const renderToken = (target: HTMLElement, value: string) => {
        const selected = value === current || (value.startsWith("lucide:") && value.replace(/@[^@]+$/, "") === current?.replace(/@[^@]+$/, ""));
        const button = target.createEl("button", { cls: `obnotion-icon-picker-item${selected ? " is-selected" : ""}`, attr: { type: "button", title: value, "data-icon-value": value, "aria-label": value, "aria-pressed": selected ? "true" : "false", tabindex: "-1" } });
        if (value.startsWith("lucide:")) {
          const match = value.match(/^lucide:([^@]+)(?:@(.+))?$/);
          if (match) { setIcon(button, match[1]); button.addClass(`obnotion-record-icon-color-${match[2] || "gray"}`); }
        } else button.createSpan({ text: value });
        button.onclick = () => { void commit(value); };
      };
      if (!searchQuery && category !== "recent" && recentValues.length) {
        const recent = scroller.createDiv({ cls: "obnotion-icon-picker-section" });
        recent.createDiv({ cls: "obnotion-icon-picker-label", text: t("recordIcon.recent") });
        const grid = recent.createDiv({ cls: "obnotion-icon-picker-grid" });
        recentValues.forEach((value) => {
          const lucideId = value.startsWith("lucide:") ? value.match(/^lucide:([^@]+)/)?.[1] : null;
          renderToken(grid, tab === "lucide" && lucideId ? serializeLucideIconToken(lucideId, color) : value);
        });
      }
      const section = scroller.createDiv({ cls: "obnotion-icon-picker-section" });
      section.createDiv({ cls: "obnotion-icon-picker-label", text: sectionLabel });
      const grid = section.createDiv({ cls: "obnotion-icon-picker-grid" });
      values.forEach((value) => {
        if (tab === "emoji") { renderToken(grid, value); return; }
        const lucideId = value.startsWith("lucide:") ? value.match(/^lucide:([^@]+)/)?.[1] : value;
        renderToken(grid, lucideId ? serializeLucideIconToken(lucideId, color) : value);
      });
      if (!values.length) grid.createDiv({ cls: "obnotion-icon-picker-empty", text: t("common.noResults") });
    };
    const scroller = panel.createDiv({ cls: "obnotion-icon-picker-scroll" });
    renderGrid(scroller);

    const nav = panel.createDiv({ cls: "obnotion-icon-picker-nav" });
    const navItems = tab === "emoji"
      ? [{ id: "recent", label: t("recordIcon.recent"), icon: "clock-3" }, ...EMOJI_CATEGORIES.map((item) => ({ id: item.id, label: t(item.labelKey), icon: EMOJI_CATEGORY_ICONS[item.id] || "circle" }))]
      : [{ id: "recent", label: t("recordIcon.recent"), icon: "clock-3" }, ...LUCIDE_CATEGORY_DEFINITIONS.map((item) => ({ id: item.id, label: t(item.labelKey), icon: item.icon })), { id: "other", label: t("recordIcon.category.other"), icon: "ellipsis" }];
    nav.setAttr("role", "tablist");
    nav.setAttr("aria-label", t("recordIcon.configureField"));
    for (const item of navItems) {
      const button = nav.createEl("button", { cls: category === item.id ? "is-active" : "", attr: { type: "button", role: "tab", title: item.label, "aria-label": item.label, "aria-selected": category === item.id ? "true" : "false" } });
      setIcon(button, item.icon);
      setTooltip(button, item.label, { delay: 150 });
      button.onclick = () => { category = item.id; render(); panel.querySelector<HTMLElement>(".obnotion-icon-picker-scroll")?.scrollTo(0, 0); };
    }

    random.onclick = () => {
      const { values } = computeValues();
      const value = values[Math.floor(Math.random() * values.length)];
      if (value) void commit(tab === "emoji" || category === "recent" ? value : serializeLucideIconToken(value, color));
    };
    positionToolbarPopover(panel, options.anchor, { ...GRID_PICKER_POPOVER, gap: 8 });
    if (preserveScroll) scroller.scrollTop = previousScrollTop;
    if (restoreFocus) {
      view.requestAnimationFrame(() => {
        if (searchWasFocused) {
          panel.querySelector<HTMLInputElement>(".obnotion-icon-picker-search")?.focus();
          return;
        }
        if (previousIcon) {
          Array.from(panel.querySelectorAll<HTMLButtonElement>("[data-icon-value]"))
            .find((item) => item.getAttribute("data-icon-value") === previousIcon)
            ?.focus();
          return;
        }
        panel.querySelector<HTMLButtonElement>(".obnotion-icon-picker-item.is-selected")?.focus({ preventScroll: true });
      });
    }
  };
  const onKeydown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement && event.target.closest("[role=tab]")) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const items = Array.from(panel.querySelectorAll<HTMLButtonElement>(".obnotion-icon-picker-item"));
    if (!items.length) return;
    const current = doc.activeElement instanceof HTMLButtonElement ? items.indexOf(doc.activeElement) : -1;
    const next = getGridNavigationTarget(items, current < 0 ? 0 : current, event.key);
    if (next == null) return;
    event.preventDefault();
    items[next]?.focus();
  };
  render();
  doc.addEventListener("keydown", onKeydown, true);
  removeAutoClose = installPopoverAutoClose({ panel, anchorEl: options.anchor, close });
  setActivePicker(doc, entry);
  return close;
}

// ───────────────────────────────────────────────────────────────────
// 5. KEYBOARD NAVIGATION
// ───────────────────────────────────────────────────────────────────
//
// Geometric nearest-neighbour navigation (`getGridNavigationTarget`) is the picker host's — this
// grid's row length changes with the panel and viewport width, which is exactly the case an
// index-based navigator gets wrong and the host's measurement-based one does not.
