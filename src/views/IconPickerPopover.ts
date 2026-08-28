import { Notice, setIcon, setTooltip } from "obsidian";
import { EMOJI_CATEGORIES, getLucideCategoryIds, LUCIDE_CATEGORY_DEFINITIONS } from "../data/IconPickerCatalog";
import { RECORD_ICON_COLORS, RecordIconColor, serializeLucideIconToken } from "../data/RecordIcon";
import { t } from "../i18n";
import { installPopoverAutoClose } from "./PopoverAutoClose";
import { positionToolbarPopover } from "./PopoverPosition";
import { getValidRecordIconIds } from "./RecordIconRenderer";

export interface IconPickerOptions {
  anchor: HTMLElement;
  current?: string;
  recent?: string[];
  onRecentChange?(recent: string[]): void | Promise<void>;
  onConfigureField?(): void;
  onSelect(value: string | null): void | Promise<void>;
}

const EMOJI_CATEGORY_ICONS: Record<string, string> = {
  people: "smile", nature: "leaf", food: "carrot", activities: "trophy",
  travel: "plane", objects: "lightbulb", symbols: "badge-check", flags: "flag",
};

const activePickers = new WeakMap<Document, () => void>();

export function openIconPickerPopover(options: IconPickerOptions): () => void {
  const doc = options.anchor.ownerDocument;
  const view = doc.defaultView || window;
  activePickers.get(doc)?.();
  const panel = doc.body.createDiv({ cls: "db-icon-picker-popover" });
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
  const close = () => {
    if (closed) return;
    closed = true;
    removeAutoClose?.();
    panel.remove();
    doc.removeEventListener("keydown", onKeydown, true);
    if (activePickers.get(doc) === close) activePickers.delete(doc);
  };
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

  const render = (preserveScroll = false, restoreFocus = true) => {
    const previousScrollTop = preserveScroll
      ? panel.querySelector<HTMLElement>(".db-icon-picker-scroll")?.scrollTop || 0
      : 0;
    const previousIcon = restoreFocus && doc.activeElement instanceof HTMLElement
      ? doc.activeElement.getAttribute("data-icon-value")
      : null;
    const searchWasFocused = restoreFocus && doc.activeElement?.classList.contains("db-icon-picker-search");
    panel.empty();
    const header = panel.createDiv({ cls: "db-icon-picker-header" });
    const tabs = header.createDiv({ cls: "db-icon-picker-tabs" });
    tabs.setAttr("role", "tablist");
    tabs.setAttr("aria-label", t("recordIcon.configureField"));
    const createTab = (kind: "emoji" | "lucide", label: string) => {
      const button = tabs.createEl("button", { text: label, cls: tab === kind ? "is-active" : "", attr: { type: "button", role: "tab", "aria-selected": tab === kind ? "true" : "false" } });
      button.onclick = () => { tab = kind; category = kind === "emoji" ? "people" : "common"; render(); };
    };
    createTab("emoji", t("recordIcon.emoji"));
    createTab("lucide", t("recordIcon.icons"));
    const search = header.createEl("input", {
      cls: "db-icon-picker-search",
      attr: { type: "search", placeholder: t("iconPicker.search"), "aria-label": t("iconPicker.search"), value: searchQuery },
    });
    search.oninput = () => {
      searchQuery = search.value.trim().toLocaleLowerCase();
      render(true, false);
      view.requestAnimationFrame(() => panel.querySelector<HTMLInputElement>(".db-icon-picker-search")?.focus());
    };
    const remove = header.createEl("button", { text: t("recordIcon.remove"), cls: "db-icon-picker-remove", attr: { type: "button" } });
    remove.onclick = () => { void commit(null); };
    const random = header.createEl("button", { cls: "db-icon-picker-random", attr: { type: "button", title: t("recordIcon.random"), "aria-label": t("recordIcon.random") } });
    setIcon(random, "shuffle");
    if (options.onConfigureField) {
      const settings = header.createEl("button", {
        cls: "db-icon-picker-settings",
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
      const colors = panel.createDiv({ cls: "db-icon-picker-colors" });
      for (const candidate of RECORD_ICON_COLORS) {
        const dot = colors.createEl("button", {
          cls: `db-icon-color db-icon-color-${candidate}${candidate === color ? " is-active" : ""}`,
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
        const button = target.createEl("button", { cls: `db-icon-picker-item${selected ? " is-selected" : ""}`, attr: { type: "button", title: value, "data-icon-value": value, "aria-label": value, "aria-pressed": selected ? "true" : "false", tabindex: "-1" } });
        if (value.startsWith("lucide:")) {
          const match = value.match(/^lucide:([^@]+)(?:@(.+))?$/);
          if (match) { setIcon(button, match[1]); button.addClass(`db-record-icon-color-${match[2] || "gray"}`); }
        } else button.createSpan({ text: value });
        button.onclick = () => { void commit(value); };
      };
      if (!searchQuery && category !== "recent" && recentValues.length) {
        const recent = scroller.createDiv({ cls: "db-icon-picker-section" });
        recent.createDiv({ cls: "db-icon-picker-label", text: t("recordIcon.recent") });
        const grid = recent.createDiv({ cls: "db-icon-picker-grid" });
        recentValues.forEach((value) => {
          const lucideId = value.startsWith("lucide:") ? value.match(/^lucide:([^@]+)/)?.[1] : null;
          renderToken(grid, tab === "lucide" && lucideId ? serializeLucideIconToken(lucideId, color) : value);
        });
      }
      const section = scroller.createDiv({ cls: "db-icon-picker-section" });
      section.createDiv({ cls: "db-icon-picker-label", text: sectionLabel });
      const grid = section.createDiv({ cls: "db-icon-picker-grid" });
      values.forEach((value) => {
        if (tab === "emoji") { renderToken(grid, value); return; }
        const lucideId = value.startsWith("lucide:") ? value.match(/^lucide:([^@]+)/)?.[1] : value;
        renderToken(grid, lucideId ? serializeLucideIconToken(lucideId, color) : value);
      });
      if (!values.length) grid.createDiv({ cls: "db-icon-picker-empty", text: t("common.noResults") });
    };
    const scroller = panel.createDiv({ cls: "db-icon-picker-scroll" });
    renderGrid(scroller);

    const nav = panel.createDiv({ cls: "db-icon-picker-nav" });
    const navItems = tab === "emoji"
      ? [{ id: "recent", label: t("recordIcon.recent"), icon: "clock-3" }, ...EMOJI_CATEGORIES.map((item) => ({ id: item.id, label: t(item.labelKey), icon: EMOJI_CATEGORY_ICONS[item.id] || "circle" }))]
      : [{ id: "recent", label: t("recordIcon.recent"), icon: "clock-3" }, ...LUCIDE_CATEGORY_DEFINITIONS.map((item) => ({ id: item.id, label: t(item.labelKey), icon: item.icon })), { id: "other", label: t("recordIcon.category.other"), icon: "ellipsis" }];
    nav.setAttr("role", "tablist");
    nav.setAttr("aria-label", t("recordIcon.configureField"));
    for (const item of navItems) {
      const button = nav.createEl("button", { cls: category === item.id ? "is-active" : "", attr: { type: "button", role: "tab", title: item.label, "aria-label": item.label, "aria-selected": category === item.id ? "true" : "false" } });
      setIcon(button, item.icon);
      setTooltip(button, item.label, { delay: 150 });
      button.onclick = () => { category = item.id; render(); panel.querySelector<HTMLElement>(".db-icon-picker-scroll")?.scrollTo(0, 0); };
    }

    random.onclick = () => {
      const { values } = computeValues();
      const value = values[Math.floor(Math.random() * values.length)];
      if (value) void commit(tab === "emoji" || category === "recent" ? value : serializeLucideIconToken(value, color));
    };
    positionToolbarPopover(panel, options.anchor, { preferredWidth: 318, maxWidth: 318, minWidth: 318, gap: 8 });
    if (preserveScroll) scroller.scrollTop = previousScrollTop;
    if (restoreFocus) {
      view.requestAnimationFrame(() => {
        if (searchWasFocused) {
          panel.querySelector<HTMLInputElement>(".db-icon-picker-search")?.focus();
          return;
        }
        if (previousIcon) {
          Array.from(panel.querySelectorAll<HTMLButtonElement>("[data-icon-value]"))
            .find((item) => item.getAttribute("data-icon-value") === previousIcon)
            ?.focus();
          return;
        }
        panel.querySelector<HTMLButtonElement>(".db-icon-picker-item.is-selected")?.focus({ preventScroll: true });
      });
    }
  };
  const onKeydown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement && event.target.closest("[role=tab]")) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    const items = Array.from(panel.querySelectorAll<HTMLButtonElement>(".db-icon-picker-item"));
    if (!items.length) return;
    const current = doc.activeElement instanceof HTMLButtonElement ? items.indexOf(doc.activeElement) : -1;
    const next = getIconNavigationTarget(items, current < 0 ? 0 : current, event.key);
    if (next == null) return;
    event.preventDefault();
    items[next]?.focus();
  };
  render();
  doc.addEventListener("keydown", onKeydown, true);
  removeAutoClose = installPopoverAutoClose({ panel, anchorEl: options.anchor, close });
  activePickers.set(doc, close);
  return close;
}

function getIconNavigationTarget(items: HTMLButtonElement[], index: number, key: string): number | undefined {
  const current = items[index];
  if (!current) return undefined;
  const rect = current.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const positions = items.map((item) => {
    const itemRect = item.getBoundingClientRect();
    return { item, rect: itemRect, x: itemRect.left + itemRect.width / 2, y: itemRect.top + itemRect.height / 2 };
  });
  if (key === "ArrowLeft" || key === "ArrowRight") {
    const row = positions.filter((candidate) => Math.abs(candidate.y - centerY) <= Math.max(8, rect.height));
    row.sort((a, b) => a.x - b.x);
    const rowIndex = row.findIndex((candidate) => candidate.item === current);
    const next = row[rowIndex + (key === "ArrowLeft" ? -1 : 1)];
    return next ? items.indexOf(next.item) : undefined;
  }
  const direction = key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0;
  if (!direction) return undefined;
  const candidates = positions
    .filter((candidate) => direction < 0 ? candidate.y < centerY - 2 : candidate.y > centerY + 2)
    .sort((a, b) => Math.abs(a.y - centerY) - Math.abs(b.y - centerY) || Math.abs(a.x - centerX) - Math.abs(b.x - centerX));
  return candidates[0] ? items.indexOf(candidates[0].item) : undefined;
}
