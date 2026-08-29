// ───────────────────────────────────────────────────────────────────
// MODULE:    owned-menu
// COMPONENT: a plugin-owned menu container, replacing Obsidian's Menu
// ───────────────────────────────────────────────────────────────────
//
// Obsidian's `Menu` renders its own markup, so styling it means reaching into
// `MenuItem.dom` — a field that is not in the published typings at all. There
// are 26 such accesses in this plugin. Any Obsidian release that renames it
// breaks menus at runtime with no type error to warn anyone, which is a poor
// trade for markup we could simply own.
//
// This is the container half; `menu-row` is the row half. Together they cover
// what the native menu gave us: rows with checked and disabled states,
// separators, section headings, submenu affordances, keyboard traversal,
// dismissal, and focus returned to whatever opened the menu.
//
// Deliberately not a drop-in clone. Consumers migrate one at a time, and each
// only once its own lifecycle has an equivalent here — a half-migrated menu
// that silently drops "checked" is worse than a native one that looks wrong.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { createMenuRow, createMenuSection, createMenuSeparator, MenuRowOptions } from "./menu-row";
import { clamp, getVisiblePopoverBounds, setPosition } from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface OwnedMenuHandle {
  el: HTMLElement;
  addRow(options: MenuRowOptions): HTMLElement;
  addSection(label: string): void;
  addSeparator(): void;
  /** Open at a point — the equivalent of showAtMouseEvent / showAtPosition. */
  showAt(point: { x: number; y: number }): void;
  close(): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. MENU
// ───────────────────────────────────────────────────────────────────

/**
 * Create a menu that the plugin owns end to end.
 *
 * `returnFocus` is not optional in practice: dismissing a menu without restoring focus strands
 * keyboard users on `document.body`, and the native menu did this for us.
 */
export function createOwnedMenu(
  doc: Document,
  options: { returnFocus?: HTMLElement | null; onClose?: () => void } = {},
): OwnedMenuHandle {
  const el = doc.body.createDiv({ cls: "db-menu db-owned-menu" });
  el.setAttr("role", "menu");
  el.setAttr("tabindex", "-1");

  let open = true;

  const rows = (): HTMLElement[] =>
    Array.from(el.querySelectorAll<HTMLElement>(".db-menu-item:not([disabled])"));

  const close = () => {
    if (!open) return;
    open = false;
    doc.removeEventListener("pointerdown", onOutside, true);
    doc.removeEventListener("keydown", onKeydown, true);
    el.remove();
    options.onClose?.();
    options.returnFocus?.focus({ preventScroll: true });
  };

  // Capture phase: a row's own click handler must run before dismissal removes the node it is on.
  const onOutside = (event: PointerEvent) => {
    if (event.target instanceof Node && el.contains(event.target)) return;
    close();
  };

  const onKeydown = (event: KeyboardEvent) => {
    const items = rows();
    if (items.length === 0) return;
    const active = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    const index = active ? items.indexOf(active) : -1;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      // Wrap, matching the native menu: from the last item, down returns to the first.
      const next = (index + step + items.length) % items.length;
      items[next].focus({ preventScroll: true });
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1].focus({ preventScroll: true });
    }
  };

  return {
    el,
    addRow(rowOptions) {
      const handle = createMenuRow(el, {
        ...rowOptions,
        onClick: (event) => {
          rowOptions.onClick?.(event);
          if (!rowOptions.submenu) close();
        },
      });
      return handle.row;
    },
    addSection(label) {
      createMenuSection(el, label);
    },
    addSeparator() {
      createMenuSeparator(el);
    },
    showAt(point) {
      // Measure before clamping: the menu's height is only known once its rows exist.
      const bounds = getVisiblePopoverBounds(null);
      const rect = el.getBoundingClientRect();
      const left = clamp(point.x, bounds.left + 4, Math.max(bounds.left + 4, bounds.right - rect.width - 4));
      const flipUp = point.y + rect.height > bounds.bottom - 4;
      const top = flipUp
        ? clamp(point.y - rect.height, bounds.top + 4, bounds.bottom - 4)
        : clamp(point.y, bounds.top + 4, Math.max(bounds.top + 4, bounds.bottom - rect.height - 4));

      el.setCssProps({ position: "fixed" });
      setPosition(el, left, top, undefined, 0, 0);
      rows()[0]?.focus({ preventScroll: true });

      doc.addEventListener("pointerdown", onOutside, true);
      doc.addEventListener("keydown", onKeydown, true);
    },
    close,
  };
}

/**
 * Open a menu from a pointer event.
 *
 * Derives the document from the event's own view rather than a global, which matters because
 * Obsidian can run this plugin inside a popped-out window where `document` is the wrong one.
 */
export function createOwnedMenuForEvent(
  event: MouseEvent,
  options: { returnFocus?: HTMLElement | null; onClose?: () => void } = {},
): OwnedMenuHandle {
  const fromView = event.view?.document ?? null;
  const fromTarget = event.target instanceof Node ? event.target.ownerDocument : null;
  // `activeDocument`, not `document`: Obsidian can host this plugin in a popped-out window, where
  // the global document belongs to the main window and the menu would mount into the wrong one.
  return createOwnedMenu(fromView ?? fromTarget ?? activeDocument, options);
}
