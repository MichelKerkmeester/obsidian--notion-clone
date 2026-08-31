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
import { applySheetChrome, attachSheetDragToDismiss, playSheetEntrance } from "./mobile-bottom-sheet";
import {
  clamp,
  getVisiblePopoverBounds,
  isMobileBottomSheet,
  keepSheetPlaced,
  placeSheet,
  setPosition,
} from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

/**
 * Where a menu should open.
 *
 * A cursor and a trigger button are not the same request, and collapsing them into a point is what
 * made three call sites write the same four lines: measure the anchor, add the downward gap, throw
 * the anchor away. Flipping then had nothing left to flip against — it subtracted the menu's height
 * from a y that already sat below the trigger, so an upward flip landed the menu's bottom edge
 * below the trigger's bottom edge and covered the control the menu belongs to.
 *
 * Passing the anchor keeps the information the flip needs. A point stays a point: for a context
 * menu the cursor really is the whole request, and a menu whose bottom edge meets the cursor on an
 * upward flip is correct there.
 */
export type OwnedMenuTarget =
  | { x: number; y: number }
  | { anchor: HTMLElement };

export interface OwnedMenuHandle {
  el: HTMLElement;
  addRow(options: MenuRowOptions): HTMLElement;
  addSection(label: string): void;
  addSeparator(): void;
  /** Open at a cursor point, or anchored under a trigger element. */
  showAt(target: OwnedMenuTarget): void;
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
  // `db-surface` is what carries the design tokens to a surface mounted outside the plugin's
  // container. Without it a menu on the body inherits none of the scale and silently falls back to
  // whatever the browser and the host theme supply — measured across every overlay class, seventy
  // of seventy-three lose their tokens at the place they actually mount, and a menu ships
  // square-cornered a size too large.
  const el = doc.body.createDiv({ cls: "db-surface db-menu db-owned-menu" });
  el.setAttr("role", "menu");
  el.setAttr("tabindex", "-1");

  let open = true;
  let releaseDrag: (() => void) | undefined;
  let releasePlacement: (() => void) | undefined;

  const rows = (): HTMLElement[] =>
    Array.from(el.querySelectorAll<HTMLElement>(".db-menu-item:not([disabled])"));

  const close = () => {
    if (!open) return;
    open = false;
    doc.removeEventListener("pointerdown", onOutside, true);
    doc.removeEventListener("keydown", onKeydown, true);
    releaseDrag?.();
    releaseDrag = undefined;
    releasePlacement?.();
    releasePlacement = undefined;
    // Take the sheet chrome down before the node goes, not after: the backdrop is a sibling on the
    // body rather than a child, so removing the menu alone would leave the whole app dimmed behind
    // a surface that is no longer there.
    if (el.hasClass("db-mobile-bottom-sheet")) applySheetChrome(el, false);
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
    showAt(target) {
      // A phone gets the sheet, and the target is discarded.
      //
      // Every caller names a cursor or a trigger, and on a phone neither answer is usable: a menu
      // placed at a touch point covers the row it belongs to and runs off whichever edge is
      // nearest. Discarding the target here rather than at the fourteen call sites is what lets
      // both shapes reach the sheet from one change — and a design that served only one of them
      // would have left half the menus wrong.
      if (isMobileBottomSheet(doc)) {
        // The backdrop takes the tap on this surface. A menu dismisses on an outside press, so an
        // inert backdrop means the press that closes the menu also lands on the table underneath
        // and starts editing a cell on the way out.
        applySheetChrome(el, true, { scrimCapturesPointer: true });
        placeSheet(el);
        // And keep it placed. A single call fixes the sheet at whatever the keyboard inset was when
        // it opened, so a menu opened over an open keyboard stays lifted after it closes, and one
        // opened before a keyboard never moves for it — while the panel sheet beside it does both.
        releasePlacement = keepSheetPlaced(el);
        playSheetEntrance(el);
        releaseDrag = attachSheetDragToDismiss(el, close);
      } else {
        const bounds = getVisiblePopoverBounds(null);
        const margin = 4;

        // Cap before measuring, not after.
        //
        // A menu with no height cap grows to fit every row it holds, so its measured height is the
        // height of its content and the clamp below is handed a number larger than the screen. A
        // sixty-row menu measured 1808px against a 900px editing area and ran 912px past the
        // bottom edge, with its last rows off screen and unreachable by pointer or keyboard.
        // Capping first is also what makes the vertical clamp well-formed: once the height cannot
        // exceed the available space, `bounds.bottom - height - margin` is always at or above
        // `bounds.top + margin`, so there is no case where the clamp has to invert.
        //
        // The panel path has written maxHeight and overflowY on every placement since it was
        // written. This is the same policy, and the menus not having it is the whole reason the
        // two families disagreed about what happens to a long list.
        el.setCssProps({
          position: "fixed",
          "max-height": `${Math.max(120, bounds.height - margin * 2)}px`,
          "overflow-y": "auto",
          "overscroll-behavior": "contain",
        });

        const rect = el.getBoundingClientRect();
        const height = rect.height;
        const anchorRect = "anchor" in target && target.anchor.isConnected
          ? target.anchor.getBoundingClientRect()
          : undefined;

        let originX: number;
        let top: number;
        if (anchorRect) {
          // Anchored: the menu sits under its trigger, and flips to sit above it — clearing the
          // trigger on both sides rather than covering it.
          originX = anchorRect.left;
          const below = anchorRect.bottom + margin;
          top = below + height > bounds.bottom - margin ? anchorRect.top - margin - height : below;
        } else {
          const point = target as { x: number; y: number };
          originX = point.x;
          top = point.y + height > bounds.bottom - margin ? point.y - height : point.y;
        }

        const left = clamp(originX, bounds.left + margin, Math.max(bounds.left + margin, bounds.right - rect.width - margin));
        setPosition(el, left, clamp(top, bounds.top + margin, Math.max(bounds.top + margin, bounds.bottom - height - margin)), undefined, 0, 0);
      }
      rows()[0]?.focus({ preventScroll: true });

      // One owner for dismissal, on both presentations. The sheet's backdrop is a rectangle, not a
      // handler: a press on it is an outside press like any other and arrives here, so there is no
      // second path that could close the menu twice or leave it half-closed.
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
