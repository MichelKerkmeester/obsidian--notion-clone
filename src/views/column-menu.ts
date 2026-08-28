// ───────────────────────────────────────────────────────────────────
// MODULE:    column-menu
// COMPONENT: Builds the column header's context menu (edit/type/format/
//            sort/delete) and its custom richer submenus.
// ───────────────────────────────────────────────────────────────────
//
// Obsidian's `Menu`/`MenuItem` API has no submenu support beyond a flat
// item, so type-change, number-display-style and text-render-mode need
// their own absolutely-positioned popovers (`createColumnMenuSubpopover`)
// wired onto the item's raw DOM node via the `MenuItemWithDom` cast.
// Those popovers render to `document.body` outside the menu instance,
// so `activeSubmenuCleanup` is a single shared handle — without it,
// opening a second submenu (or a new column menu) would leave the
// previous popover orphaned in the DOM.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { Menu, MenuItem, setIcon } from "obsidian";
import { COLUMN_TYPE_LABELS, isOptionColumnType, OPTION_COLORS } from "../data/column-types";
import { isFileFieldKey } from "../data/file-fields";
import { ColumnDef, ComputedFieldDef, NumberDisplayStyle, NumberDisplayConfig, StatusColor } from "../data/types";
import { isNumberDisplayColumn } from "../data/column-display";
import { t } from "../i18n";
import { renderPropertyTypeIcon } from "./property-type-icon";
import { createDropdownField, DropdownOption } from "./dropdown-field";
import { installPopoverAutoClose } from "./popover-auto-close";
import { positionToolbarPopover } from "./popover-position";
import { getTextLinkSchemeChoice, TEXT_LINK_SCHEME_MENU_OPTIONS, TextLinkSchemeChoice } from "../data/text-link-scheme-menu";
import { isTouchDevice } from "../data/touch-environment";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ColumnMenuActions {
  editColumn(col: ColumnDef): void;
  editFormula(col: ColumnDef): void;
  editRelationRollup?(col: ColumnDef): void;
  editStatusOptions(col: ColumnDef): void;
  showOptionsEditor(col: ColumnDef): void;
  changeColumnType(col: ColumnDef, type: ColumnDef["type"]): void;
  insertColumn(col: ColumnDef, side: "left" | "right"): void;
  duplicateColumn(col: ColumnDef): void;
  moveColumn(key: string, offset: -1 | 1): void;
  hideColumn(col: ColumnDef): void;
  toggleColumnWrap(col: ColumnDef): void;
  setTextRenderMode(col: ColumnDef, mode: "plain" | "link" | "markdown"): void;
  setTextLinkScheme(col: ColumnDef, scheme: TextLinkSchemeChoice): void;
  setNumberDisplayStyle(col: ColumnDef, style: NumberDisplayStyle): void;
  updateNumberDisplayConfig(col: ColumnDef, partial: Partial<NumberDisplayConfig>): void;
  sortByColumn(col: ColumnDef): void;
  sortColumnDirection?(col: ColumnDef, direction: "asc" | "desc"): void;
  filterByColumn?(col: ColumnDef): void;
  getColumnSortDirection?(col: ColumnDef): "asc" | "desc" | null;
  clearColumnSort?(col: ColumnDef): void;
  openColumnWidthPanel?(col: ColumnDef): void;
  autoFitColumn?(col: ColumnDef): void;
  autoFitAllColumns?(): void;
  deleteColumn(col: ColumnDef): void;
}

export interface ColumnMenuOptions {
  readonly?: boolean;
  includeLayoutActions?: boolean;
  includeWidthActions?: boolean;
  /** Needed to resolve computed→number columns for the number display-style selector. */
  computedFields?: ComputedFieldDef[];
  onClose?: () => void;
}

type MenuItemWithDom = { dom?: HTMLElement };

// ───────────────────────────────────────────────────────────────────
// 3. MAIN CONTEXT MENU
// ───────────────────────────────────────────────────────────────────

export class ColumnMenu {
  private activeSubmenuCleanup?: () => void;

  constructor(private actions: ColumnMenuActions) {}

  showOptionsEditor(col: ColumnDef): void {
    if (isOptionColumnType(col.type) && !isFileFieldKey(col.key)) {
      this.actions.editStatusOptions(col);
    }
  }

  show(event: MouseEvent, col: ColumnDef, anchorEl?: HTMLElement, options: ColumnMenuOptions = {}): void {
    event.preventDefault();
    event.stopPropagation();
    this.closeActiveColumnSubmenu();
    const readonly = options.readonly === true;
    const includeLayoutActions = options.includeLayoutActions !== false;
    const includeWidthActions = options.includeWidthActions !== false;
    const menu = new Menu().setUseNativeMenu(false);
    if (options.onClose || anchorEl) {
      menu.onHide(() => {
        options.onClose?.();
        anchorEl?.focus({ preventScroll: true });
      });
    }

    if (!readonly) {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.editProperty", { name: col.label }))
        .setIcon("edit")
        .onClick(() => this.actions.editColumn(col))
      );

      if (isOptionColumnType(col.type) && !isFileFieldKey(col.key)) {
        this.addMenuItem(menu, (item) => item
          .setTitle(t("menu.editOptions"))
          .setIcon("palette")
          .onClick(() => this.actions.editStatusOptions(col))
        );
      }

      if (col.type === "computed") {
        this.addMenuItem(menu, (item) => item
          .setTitle(t("menu.openFormula"))
          .setIcon("sigma")
          .onClick(() => this.actions.editFormula(col))
        );
      }
      if ((col.type === "relation" || col.type === "rollup") && this.actions.editRelationRollup) {
        this.addMenuItem(menu, (item) => item
          .setTitle(col.type === "relation" ? t("relation.configure") : t("rollup.configure"))
          .setIcon(col.type === "relation" ? "link" : "sigma")
          .onClick(() => this.actions.editRelationRollup?.(col))
        );
      }

      this.addMenuItem(menu, (item) => {
        const isFileField = isFileFieldKey(col.key);
        item.setTitle(t("menu.changeType")).setIcon("layers");
        item.setDisabled(isFileField);
        if (isFileField) return item;
        const menuItem = item as unknown as MenuItemWithDom;
        this.decorateMenuItem(menuItem.dom);
        menuItem.dom?.setAttr("aria-haspopup", "listbox");
        menuItem.dom?.setAttr("aria-expanded", "false");
        const open = (evt: MouseEvent | KeyboardEvent) => {
          if (evt instanceof KeyboardEvent && !["ArrowRight", "Enter", " "].includes(evt.key)) return;
          evt.preventDefault();
          evt.stopPropagation();
          evt.stopImmediatePropagation();
          menuItem.dom?.setAttr("aria-expanded", "true");
          this.showColumnTypePopover(evt, col, menu, menuItem.dom);
        };
        menuItem.dom?.addEventListener("click", open, true);
        menuItem.dom?.addEventListener("keydown", open);
        return item;
      });

      if (isNumberDisplayColumn(col, options.computedFields)) {
        this.addMenuItem(menu, (item) => {
          item.setTitle(t("menu.numberDisplayStyle")).setIcon("paintbrush");
          const menuItem = item as unknown as MenuItemWithDom;
          this.decorateMenuItem(menuItem.dom);
          menuItem.dom?.setAttr("aria-haspopup", "listbox");
          menuItem.dom?.setAttr("aria-expanded", "false");
          const open = (evt: MouseEvent | KeyboardEvent) => {
            if (evt instanceof KeyboardEvent && !["ArrowRight", "Enter", " "].includes(evt.key)) return;
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            menuItem.dom?.setAttr("aria-expanded", "true");
            this.showNumberDisplayStylePopover(evt, col, menu, menuItem.dom);
          };
          menuItem.dom?.addEventListener("click", open, true);
          menuItem.dom?.addEventListener("keydown", open);
          const numberStyleKey = col.numberDisplayStyle === "rating" ? "menu.numberStyleRating"
            : col.numberDisplayStyle === "progress" ? "menu.numberStyleProgress"
            : col.numberDisplayStyle === "ring" ? "menu.numberStyleRing"
            : "menu.numberStylePlain";
          this.appendItemHint(menuItem.dom, t(numberStyleKey));
          return item;
        });
      }
      if (col.type === "text" && !isFileFieldKey(col.key)) {
        this.addMenuItem(menu, (item) => {
          item.setTitle(t("menu.numberDisplayStyle")).setIcon("paintbrush");
          const menuItem = item as unknown as MenuItemWithDom;
          this.decorateMenuItem(menuItem.dom);
          menuItem.dom?.setAttr("aria-haspopup", "listbox");
          menuItem.dom?.setAttr("aria-expanded", "false");
          const open = (evt: MouseEvent | KeyboardEvent) => {
            if (evt instanceof KeyboardEvent && !["ArrowRight", "Enter", " "].includes(evt.key)) return;
            evt.preventDefault();
            evt.stopPropagation();
            evt.stopImmediatePropagation();
            menuItem.dom?.setAttr("aria-expanded", "true");
            this.showTextRenderModePopover(evt, col, menu, menuItem.dom);
          };
          menuItem.dom?.addEventListener("click", open, true);
          menuItem.dom?.addEventListener("keydown", open);
          const textMode = col.textRenderMode ?? "plain";
          this.appendItemHint(menuItem.dom, t(
            textMode === "link" ? "menu.textRenderLink"
            : textMode === "markdown" ? "menu.textRenderMarkdown"
            : "menu.textRenderPlain",
          ));
          return item;
        });
      }
    }

    if (!readonly && includeLayoutActions) {
      menu.addSeparator();

      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.insertLeft"))
        .setIcon("arrow-left-to-line")
        .onClick(() => this.actions.insertColumn(col, "left"))
      );
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.insertRight"))
        .setIcon("arrow-right-to-line")
        .onClick(() => this.actions.insertColumn(col, "right"))
      );
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.duplicateColumn"))
        .setIcon("copy")
        .onClick(() => this.actions.duplicateColumn(col))
        .setDisabled(isFileFieldKey(col.key))
      );
    }

    if (!readonly && includeLayoutActions) {
      menu.addSeparator();

      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.moveUp"))
        .setIcon("arrow-up")
        .onClick(() => this.actions.moveColumn(col.key, -1))
      );
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.moveDown"))
        .setIcon("arrow-down")
        .onClick(() => this.actions.moveColumn(col.key, 1))
      );
    }

    menu.addSeparator();

    this.addMenuItem(menu, (item) => item
      .setTitle(t("menu.hideProperty", { name: col.label }))
      .setIcon("eye-off")
      .onClick(() => this.actions.hideColumn(col))
    );
    this.addMenuItem(menu, (item) => item
      .setTitle(col.wrap ? t("menu.disableWrap") : t("menu.enableWrap"))
      .setIcon("wrap-text")
      .onClick(() => this.actions.toggleColumnWrap(col))
    );
    if (this.actions.filterByColumn) {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.filterByValue", { name: col.label }))
        .setIcon("filter")
        .onClick(() => this.actions.filterByColumn?.(col))
      );
    }
    if (isTouchDevice(anchorEl) && includeWidthActions && !readonly && this.actions.openColumnWidthPanel) {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.adjustColumnWidth"))
        .setIcon("ruler-dimension-line")
        .onClick(() => this.actions.openColumnWidthPanel?.(col))
      );
    }
    if (includeWidthActions && this.actions.autoFitColumn) {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.autoFitColumn"))
        .setIcon("ruler-dimension-line")
        .onClick(() => this.actions.autoFitColumn?.(col))
      );
    }
    if (includeWidthActions && this.actions.autoFitAllColumns) {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.autoFitAllColumns"))
        .setIcon("scan-line")
        .onClick(() => this.actions.autoFitAllColumns?.())
      );
    }
    if (this.actions.sortColumnDirection) {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.sortAscending"))
        .setIcon("arrow-up")
        .onClick(() => this.actions.sortColumnDirection?.(col, "asc"))
      );
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.sortDescending"))
        .setIcon("arrow-down")
        .onClick(() => this.actions.sortColumnDirection?.(col, "desc"))
      );
    } else {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.sortBy", { name: col.label }))
        .setIcon("arrow-up-down")
        .onClick(() => this.actions.sortByColumn(col))
      );
    }
    if (this.actions.getColumnSortDirection?.(col)) {
      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.clearSort"))
        .setIcon("x")
        .onClick(() => this.actions.clearColumnSort?.(col))
      );
    }

    if (!readonly && includeLayoutActions) {
      menu.addSeparator();

      this.addMenuItem(menu, (item) => item
        .setTitle(t("menu.deleteColumn"))
        .setIcon("trash")
        .setDisabled(col.key === "file.name")
        .onClick(() => this.actions.deleteColumn(col))
      );
    }

    if (anchorEl?.isConnected) {
      const rect = anchorEl.getBoundingClientRect();
      menu.showAtPosition({ x: rect.left, y: rect.bottom + 4 });
    } else {
      menu.showAtMouseEvent(event);
    }
  }

  // ───────────────────────────────────────────────────────────────────
  // 4. TYPE-CHANGE & NUMBER-STYLE POPOVERS
  // ───────────────────────────────────────────────────────────────────

  private showColumnTypePopover(evt: MouseEvent | KeyboardEvent, col: ColumnDef, menu: Menu, anchorEl?: HTMLElement): void {
    const { panel, cleanup } = this.createColumnMenuSubpopover(evt, "db-column-type-popover", anchorEl);
    panel.setAttr("role", "listbox");
    const labels = COLUMN_TYPE_LABELS();
    const groups: Array<{ title: string; types: ColumnDef["type"][] }> = [
      { title: t("columnType.group.basic"), types: ["text", "number", "date", "datetime", "currency", "checkbox"] },
      { title: t("columnType.group.options"), types: ["select", "multi-select", "status"] },
      { title: t("columnType.group.advanced"), types: ["computed", "relation", "rollup", "files"] },
    ];
    groups.forEach((group) => {
      panel.createDiv({ cls: "db-dropdown-section-title", text: group.title });
      for (const type of group.types) {
        const row = panel.createEl("button", {
          cls: `db-dropdown-option db-menu-item has-icon${type === col.type ? " is-selected" : ""}`,
          attr: { type: "button", role: "option", "aria-selected": type === col.type ? "true" : "false" },
        });
        const check = row.createSpan({ cls: "db-dropdown-option-check db-menu-item-check" });
        if (type === col.type) setIcon(check, "check");
        renderPropertyTypeIcon(row.createSpan({ cls: "db-dropdown-option-icon db-menu-item-icon db-column-type-option-icon" }), {
          key: type,
          label: labels[type],
          type,
        });
        row.createSpan({ cls: "db-dropdown-option-label db-menu-item-label", text: labels[type] });
        row.onclick = () => {
          cleanup();
          menu.hide();
          if (type !== col.type) this.actions.changeColumnType(col, type);
        };
      }
    });
  }

  private showNumberDisplayStylePopover(evt: MouseEvent | KeyboardEvent, col: ColumnDef, _menu: Menu, anchorEl?: HTMLElement): void {
    const { panel, cleanup } = this.createColumnMenuSubpopover(evt, "db-column-display-style-popover db-column-number-style-popover", anchorEl);
    const RATING_ICONS = ["star", "flame", "heart", "thumbs-up", "gem"];
    const DIVISOR_PRESETS = ["100", "10"];
    const DEFAULT_CUSTOM_COLOR: StatusColor = "green";

    const setColor = (color: StatusColor | undefined) => {
      this.actions.updateNumberDisplayConfig(col, color == null ? { color: undefined } : { color });
      render();
    };

    const render = (): void => {
      panel.empty();
      this.addSubmenuBackButton(panel, cleanup, anchorEl);
      panel.setAttr("role", "listbox");
      const cfg = col.numberDisplayConfig ?? {};
      const currentStyle = col.numberDisplayStyle ?? "plain";

      // 样式 section
      const styleSection = this.createDisplayOptionSection(panel, t("menu.numberDisplayStyle"));
      const styles: { value: NumberDisplayStyle; key: string }[] = [
        { value: "plain", key: "menu.numberStylePlain" },
        { value: "rating", key: "menu.numberStyleRating" },
        { value: "progress", key: "menu.numberStyleProgress" },
        { value: "ring", key: "menu.numberStyleRing" },
      ];
      for (const { value, key } of styles) {
        const row = styleSection.createEl("button", {
          cls: `db-dropdown-option db-menu-item has-icon${value === currentStyle ? " is-selected" : ""}`,
          attr: { type: "button", role: "option", "aria-selected": value === currentStyle ? "true" : "false" },
        });
        const check = row.createSpan({ cls: "db-dropdown-option-check db-menu-item-check" });
        if (value === currentStyle) setIcon(check, "check");
        this.renderNumberStyleMenuIcon(row.createSpan({ cls: "db-dropdown-option-icon db-menu-item-icon db-number-style-menu-icon" }), value);
        row.createSpan({ cls: "db-dropdown-option-label db-menu-item-label", text: t(key) });
        row.onclick = () => { this.actions.setNumberDisplayStyle(col, value); render(); };
      }

      // 选项 section（当前样式有可调项时）
      if (currentStyle === "rating") {
        const optSection = this.createDisplayOptionSection(panel, t("menu.numberDisplayOptions"));
        const currentRatingSymbol = cfg.ratingSymbol ?? "star";
        this.renderSelect(optSection, t("menu.numberDisplayIcon"),
          [
            ...RATING_ICONS.map((ic) => ({ value: ic, text: ic, icon: ic })),
            { value: "emoji", text: t("menu.numberDisplayIconEmoji"), icon: "smile" },
          ],
          currentRatingSymbol,
          (v) => { this.actions.updateNumberDisplayConfig(col, { ratingSymbol: v }); render(); },
          "star");
        if (currentRatingSymbol === "emoji") {
          this.renderEmojiInput(optSection, cfg.ratingEmoji ?? "⭐",
            (emoji) => { this.actions.updateNumberDisplayConfig(col, { ratingEmoji: emoji }); render(); });
        } else {
          this.renderSelect(optSection, t("menu.numberDisplayIconStyle"),
            [
              { value: "filled", text: t("menu.numberDisplayIconFilled"), icon: "circle-dot" },
              { value: "outline", text: t("menu.numberDisplayIconOutline"), icon: "circle" },
            ],
            cfg.ratingVariant ?? "filled",
            (v) => { this.actions.updateNumberDisplayConfig(col, { ratingVariant: v === "outline" ? "outline" : "filled" }); render(); },
            "circle-dot");
        }
        this.renderSelect(optSection, t("menu.numberDisplayMax"),
          [{ value: "5", text: "5" }, { value: "10", text: "10" }],
          String(cfg.ratingMax ?? 5),
          (v) => { this.actions.updateNumberDisplayConfig(col, { ratingMax: Number(v) }); render(); },
          "hash");
        if (currentRatingSymbol !== "emoji") {
          this.renderColorControls(optSection, cfg.color, (color) => setColor(color ?? DEFAULT_CUSTOM_COLOR), setColor);
        }
      } else if (currentStyle === "progress" || currentStyle === "ring") {
        const optSection = this.createDisplayOptionSection(panel, t("menu.numberDisplayOptions"));
        const currentDivisor = String(cfg.progressDivisor ?? 100);
        const divisorIsPreset = DIVISOR_PRESETS.includes(currentDivisor);
        this.renderSelect(optSection, t("menu.numberDisplayDivisor"),
          [...DIVISOR_PRESETS.map((d) => ({ value: d, text: d })), { value: "custom", text: t("menu.numberStyleCustom") }],
          divisorIsPreset ? currentDivisor : "custom",
          (v) => {
            if (v !== "custom") { this.actions.updateNumberDisplayConfig(col, { progressDivisor: Number(v) }); render(); }
            else if (divisorIsPreset) {
              // preset → custom: seed a non-preset value so the custom divisor input appears.
              this.actions.updateNumberDisplayConfig(col, { progressDivisor: 1000 }); render();
            }
            // Already custom: keep the user's existing divisor (don't reset to a default).
          },
          "percent");
        if (!divisorIsPreset) {
          this.renderNumberInput(optSection, cfg.progressDivisor ?? 100,
            (n) => { this.actions.updateNumberDisplayConfig(col, { progressDivisor: n }); render(); });
        }
        this.renderSwitch(optSection, t("menu.numberDisplayShowValue"), cfg.progressShowValue !== false,
          (checked) => { this.actions.updateNumberDisplayConfig(col, { progressShowValue: checked }); render(); });
        this.renderColorControls(optSection, cfg.color, (color) => setColor(color ?? DEFAULT_CUSTOM_COLOR), setColor);
      }
      if (anchorEl?.isConnected) {
        positionToolbarPopover(panel, anchorEl, { preferredWidth: 292, minWidth: 292, maxWidth: 292, preferredSide: "right", gap: 6 });
      }
    };
    render();
  }

  // ───────────────────────────────────────────────────────────────────
  // 5. MENU ITEM UTILITIES
  // ───────────────────────────────────────────────────────────────────

  private appendItemHint(dom: HTMLElement | undefined, text: string): void {
    if (!dom) return;
    dom.createSpan({ cls: "db-menu-item-current", text });
  }

  private addMenuItem(menu: Menu, configure: (item: MenuItem) => unknown): void {
    menu.addItem((item) => {
      configure(item);
      this.decorateMenuItem((item as unknown as MenuItemWithDom).dom);
      return item;
    });
  }

  private decorateMenuItem(dom: HTMLElement | undefined): void {
    dom?.addClass("db-menu-item");
    dom?.querySelector<HTMLElement>(".menu-item-icon")?.addClass("db-menu-item-icon");
    dom?.querySelector<HTMLElement>(".menu-item-title")?.addClass("db-menu-item-label");
  }

  private addSubmenuBackButton(panel: HTMLElement, cleanup: () => void, anchorEl?: HTMLElement): void {
    const back = panel.createEl("button", {
      cls: "db-column-menu-back db-menu-item",
      attr: { type: "button", "aria-label": t("menu.back") },
    });
    back.createSpan({ cls: "db-menu-item-label", text: t("menu.back") });
    back.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      cleanup();
      anchorEl?.focus({ preventScroll: true });
    };
  }

  // ───────────────────────────────────────────────────────────────────
  // 6. TEXT-RENDER-MODE POPOVER
  // ───────────────────────────────────────────────────────────────────

  private showTextRenderModePopover(evt: MouseEvent | KeyboardEvent, col: ColumnDef, _menu: Menu, anchorEl?: HTMLElement): void {
    const { panel, cleanup } = this.createColumnMenuSubpopover(evt, "db-column-display-style-popover db-column-text-style-popover", anchorEl);
    const render = (): void => {
      panel.empty();
      this.addSubmenuBackButton(panel, cleanup, anchorEl);
      panel.setAttr("role", "listbox");
      const section = this.createDisplayOptionSection(panel, t("menu.numberDisplayStyle"));
      const options: { value: "plain" | "link" | "markdown"; key: string; icon: string }[] = [
        { value: "plain", key: "menu.textRenderPlain", icon: "type" },
        { value: "link", key: "menu.textRenderLink", icon: "link" },
        { value: "markdown", key: "menu.textRenderMarkdown", icon: "square-m" },
      ];
      const current: "plain" | "link" | "markdown" = col.textRenderMode ?? "plain";
      for (const { value, key, icon } of options) {
        const row = section.createEl("button", {
          cls: `db-dropdown-option db-menu-item has-icon${value === current ? " is-selected" : ""}`,
          attr: { type: "button", role: "option", "aria-selected": value === current ? "true" : "false" },
        });
        const check = row.createSpan({ cls: "db-dropdown-option-check db-menu-item-check" });
        if (value === current) setIcon(check, "check");
        setIcon(row.createSpan({ cls: "db-dropdown-option-icon db-menu-item-icon" }), icon);
        row.createSpan({ cls: "db-dropdown-option-label db-menu-item-label" , text: t(key) });
        row.onclick = () => { this.actions.setTextRenderMode(col, value); render(); };
      }

      const schemeSection = this.createDisplayOptionSection(panel, t("menu.textLinkSchemeTitle"));
      const currentScheme = getTextLinkSchemeChoice(col.textLinkScheme);
      for (const option of TEXT_LINK_SCHEME_MENU_OPTIONS) {
        const selected = option.value === currentScheme;
        const row = schemeSection.createEl("button", {
          cls: `db-dropdown-option db-menu-item has-icon${selected ? " is-selected" : ""}`,
          attr: { type: "button", role: "option", "aria-selected": selected ? "true" : "false" },
        });
        const check = row.createSpan({ cls: "db-dropdown-option-check db-menu-item-check" });
        if (selected) setIcon(check, "check");
        setIcon(row.createSpan({ cls: "db-dropdown-option-icon db-menu-item-icon" }), option.icon);
        row.createSpan({ cls: "db-dropdown-option-label db-menu-item-label" , text: t(option.labelKey) });
        row.onclick = () => { this.actions.setTextLinkScheme(col, option.value); render(); };
      }
      if (anchorEl?.isConnected) {
        positionToolbarPopover(panel, anchorEl, { preferredWidth: 292, minWidth: 292, maxWidth: 292, preferredSide: "right", gap: 6 });
      }
    };
    render();
  }

  // ───────────────────────────────────────────────────────────────────
  // 7. DISPLAY OPTION CONTROLS
  // ───────────────────────────────────────────────────────────────────

  private createDisplayOptionSection(parent: HTMLElement, title: string): HTMLElement {
    const section = parent.createDiv({ cls: "db-displayopt-section" });
    section.createDiv({ cls: "db-displayopt-section-title", text: title });
    return section;
  }

  private renderSelect(parent: HTMLElement, label: string, options: DropdownOption[], value: string, onChange: (value: string) => void, icon = "chevron-right"): void {
    createDropdownField({
      parent,
      label,
      options,
      value,
      onChange,
      icon,
      className: "db-displayopt-row db-displayopt-select",
      popoverClassName: "db-displayopt-dropdown-popover",
      closeOnSelect: true,
      renderIcon: (target, iconName) => setIcon(target, iconName),
    });
  }

  private renderSwitch(parent: HTMLElement, label: string, checked: boolean, onChange: (checked: boolean) => void): void {
    const row = parent.createDiv({ cls: "db-displayopt-row db-displayopt-switch" });
    setIcon(row.createSpan({ cls: "db-displayopt-row-icon" }), "eye");
    const text = row.createDiv({ cls: "db-displayopt-row-text" });
    text.createSpan({ cls: "db-displayopt-label", text: label });
    const checkbox = row.createEl("input", { cls: "db-toggle-switch", attr: { type: "checkbox", role: "switch", "aria-label": label } });
    checkbox.checked = checked;
    checkbox.onchange = () => onChange(checkbox.checked);
  }

  private renderNumberInput(parent: HTMLElement, value: number, onChange: (value: number) => void): void {
    const row = parent.createDiv({ cls: "db-displayopt-row db-displayopt-input-row" });
    setIcon(row.createSpan({ cls: "db-displayopt-row-icon" }), "hash");
    const text = row.createDiv({ cls: "db-displayopt-row-text" });
    text.createSpan({ cls: "db-displayopt-label", text: t("menu.numberStyleCustom") });
    const input = row.createEl("input", { cls: "db-displayopt-input", attr: { type: "number", "aria-label": t("menu.numberDisplayDivisor") } });
    input.value = String(value);
    input.onchange = () => {
      const n = parseFloat(input.value);
      if (Number.isFinite(n) && n > 0) onChange(n);
    };
  }

  private renderEmojiInput(parent: HTMLElement, value: string, onChange: (value: string | undefined) => void): void {
    const row = parent.createDiv({ cls: "db-displayopt-row db-displayopt-input-row" });
    setIcon(row.createSpan({ cls: "db-displayopt-row-icon" }), "smile");
    const text = row.createDiv({ cls: "db-displayopt-row-text" });
    text.createSpan({ cls: "db-displayopt-label", text: t("menu.numberDisplayEmoji") });
    const input = row.createEl("input", {
      cls: "db-displayopt-input db-displayopt-emoji-input",
      attr: { type: "text", "aria-label": t("menu.numberDisplayEmoji"), maxlength: "8" },
    });
    input.value = value;
    input.onchange = () => {
      const emoji = input.value.trim();
      onChange(emoji || undefined);
    };
  }

  private renderColorControls(
    parent: HTMLElement,
    current: StatusColor | undefined,
    onCustom: (color?: StatusColor) => void,
    onChange: (color: StatusColor | undefined) => void
  ): void {
    this.renderSelect(parent, t("menu.numberDisplayColor"), [
      { value: "theme", text: t("menu.numberDisplayColorTheme"), icon: "wand" },
      { value: "custom", text: t("menu.numberDisplayColorCustom"), icon: "palette" },
    ], current == null ? "theme" : "custom", (value) => {
      if (value === "theme") onChange(undefined);
      else onCustom(current);
    }, "palette");

    if (current != null) this.renderColorSwatches(parent, current, onChange);
  }

  private renderColorSwatches(parent: HTMLElement, current: StatusColor, onChange: (color: StatusColor | undefined) => void): void {
    const row = parent.createDiv({ cls: "db-displayopt-row db-displayopt-colors" });
    setIcon(row.createSpan({ cls: "db-displayopt-row-icon" }), "palette");
    const text = row.createDiv({ cls: "db-displayopt-row-text" });
    text.createSpan({ cls: "db-displayopt-label", text: t("menu.numberDisplayColorCustom") });
    const grid = row.createDiv({ cls: "db-displayopt-swatches" });
    for (const color of OPTION_COLORS) {
      const sw = grid.createEl("button", {
        cls: `db-displayopt-swatch db-option-color-${color}${current === color ? " is-selected" : ""}`,
        attr: { type: "button", title: color, "aria-label": color, "aria-pressed": current === color ? "true" : "false" },
      });
      sw.onclick = () => onChange(color);
    }
  }

  private renderNumberStyleMenuIcon(parent: HTMLElement, style: NumberDisplayStyle): void {
    if (style === "plain") {
      setIcon(parent, "hash");
      return;
    }
    if (style === "rating") {
      setIcon(parent, "star");
      return;
    }
    if (style === "progress") {
      const track = parent.createSpan({ cls: "db-number-style-menu-progress" });
      track.createSpan({ cls: "db-number-style-menu-progress-fill" });
      return;
    }

    const svg = parent.createSvg("svg", {
      attr: { viewBox: "0 0 16 16", width: 16, height: 16, "aria-hidden": "true" },
    });
    svg.createSvg("circle", {
      attr: { cx: 8, cy: 8, r: 5.5, fill: "none", "stroke-width": 3 },
    }).addClass("db-number-style-menu-ring-track");
    svg.createSvg("circle", {
      attr: {
        cx: 8,
        cy: 8,
        r: 5.5,
        fill: "none",
        "stroke-width": 3,
        "stroke-linecap": "round",
        "stroke-dasharray": "34.6",
        "stroke-dashoffset": "21",
        transform: "rotate(-90 8 8)",
      },
    }).addClass("db-number-style-menu-ring-arc");
  }

  // ───────────────────────────────────────────────────────────────────
  // 8. SUBPOPOVER LIFECYCLE
  // ───────────────────────────────────────────────────────────────────

  private createColumnMenuSubpopover(
    evt: MouseEvent | KeyboardEvent,
    className: string,
    anchorEl?: HTMLElement
  ): { panel: HTMLElement; cleanup: () => void } {
    this.closeActiveColumnSubmenu();
    const doc = window.activeDocument;
    doc.querySelectorAll(".db-column-menu-subpopover, .db-column-type-popover, .db-number-style-popover, .db-column-display-style-popover, .db-column-number-style-popover, .db-column-text-style-popover")
      .forEach((existing) => existing.remove());
    const panel = doc.body.createDiv({ cls: `db-dropdown-popover db-column-menu-subpopover ${className}` });
    const estimatedWidth = className.includes("db-column-display-style-popover") ? 292 : 220;
    let closed = false;
    let removeAutoClose: (() => void) | undefined;
    let cleanup: () => void = () => undefined;
    cleanup = () => {
      if (closed) return;
      closed = true;
      removeAutoClose?.();
      panel.remove();
      anchorEl?.setAttr("aria-expanded", "false");
      if (this.activeSubmenuCleanup === cleanup) this.activeSubmenuCleanup = undefined;
    };
    this.addSubmenuBackButton(panel, cleanup, anchorEl);
    panel.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft") return;
      event.preventDefault();
      cleanup();
      anchorEl?.focus({ preventScroll: true });
    });
    if (anchorEl?.isConnected) {
      positionToolbarPopover(panel, anchorEl, {
        preferredWidth: estimatedWidth,
        minWidth: estimatedWidth,
        maxWidth: estimatedWidth,
        preferredSide: "right",
        gap: 6,
      });
    } else {
      const point = "clientX" in evt ? { x: evt.clientX, y: evt.clientY } : undefined;
      const view = doc.defaultView || window;
      if (point) panel.setCssProps({ position: "fixed", left: `${Math.max(8, Math.min(point.x + 8, view.innerWidth - estimatedWidth - 8))}px`, top: `${Math.max(8, Math.min(point.y - 8, view.innerHeight - 320))}px` });
    }
    removeAutoClose = installPopoverAutoClose({ panel, anchorEl, close: cleanup });
    this.activeSubmenuCleanup = cleanup;
    return { panel, cleanup };
  }

  private closeActiveColumnSubmenu(): void {
    this.activeSubmenuCleanup?.();
    this.activeSubmenuCleanup = undefined;
  }

}
