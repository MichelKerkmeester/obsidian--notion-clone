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
import { buildShellHeader } from "./surface-shell";
import {
  clamp,
  getVisiblePopoverBounds,
  isMobileBottomSheet,
  keepSheetPlaced,
  placeSheet,
  resolvePopoverHorizontalLeft,
  setPosition,
} from "./popover-position";
import { t } from "../i18n";

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
  | { anchor: HTMLElement }
  // A submenu is never centered under its row the way a dropdown sits under a trigger — it opens
  // flush beside it, so this needs the row's own rect rather than the generic anchor-below rules.
  | { submenuAnchor: HTMLElement };

export interface OwnedMenuRowOptions extends MenuRowOptions {
  /**
   * Populates the child menu a `submenu: true` row opens. Required for that row to open anything —
   * `submenu: true` alone only draws the chevron. The child comes from this same factory and opens
   * on pointer click, `ArrowRight`, `Enter`, hover on a hover-capable pointer, or a tap on the phone
   * sheet; closing it never takes the parent down too.
   */
  buildSubmenu?(child: OwnedMenuHandle): void;
}

export interface OwnedMenuHandle {
  el: HTMLElement;
  addRow(options: OwnedMenuRowOptions): HTMLElement;
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
 * Read the active leaf's tab title out of Obsidian's own workspace chrome.
 *
 * Every menu mounts on `doc.body`, in the same document the workspace tab bar renders into — so
 * this needs no `App` reference, only the document the menu already carries. A popout window with
 * no tab bar, or a harness with no Obsidian shell at all, simply finds nothing and the caller falls
 * back further; this never throws on a document that does not look like Obsidian's.
 */
function resolveActiveViewName(doc: Document): string | undefined {
  const title = doc
    .querySelector(".workspace-tab-header.is-active .workspace-tab-header-inner-title")
    ?.textContent?.trim();
  return title || undefined;
}

/**
 * Create a menu that the plugin owns end to end.
 *
 * `returnFocus` is not optional in practice: dismissing a menu without restoring focus strands
 * keyboard users on `document.body`, and the native menu did this for us.
 *
 * `title` is the sheet header's title once the menu presents as a phone sheet — every phone sheet
 * carries a header, this one included, rather than a title-less variant. It should name the row,
 * column or field the menu was opened for; a caller with nothing specific to say may omit it, and
 * `showAt` falls back to the active view's own name, then to a generic label rather than shipping a
 * sheet with an empty title slot.
 */
export function createOwnedMenu(
  doc: Document,
  options: { returnFocus?: HTMLElement | null; onClose?: () => void; title?: string } = {},
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
  let rowCount = 0;
  let fallbackRow: HTMLElement | undefined;

  // One level: a submenu row can itself open a child, so this closure holds at most one open
  // grandchild at a time, same as it holds at most one open child. Nothing today builds a second
  // level — the column menu's own submenus stay hand-built until a later change migrates them — but
  // the recursion falls out of reusing this same factory for the child rather than being a depth
  // limit anyone had to design.
  let childMenu: OwnedMenuHandle | null = null;
  let childRow: HTMLElement | null = null;

  const rows = (): HTMLElement[] =>
    Array.from(el.querySelectorAll<HTMLElement>(".db-menu-item:not([disabled])"));

  /** Closes the open child submenu, if any. A no-op when none is open. */
  const closeChildMenu = () => {
    childMenu?.close();
  };

  const close = () => {
    if (!open) return;
    open = false;
    // The child is a sibling surface on the body, not a descendant of `el` — removing the parent's
    // node would leave it floating with no visual relation to anything, anchored to a row that no
    // longer exists.
    closeChildMenu();
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

  /**
   * Opens (or re-opens) the child menu a submenu row owns.
   *
   * Every activation path — click, `ArrowRight`, `Enter`, hover, a phone tap — funnels through this
   * one function, which is the point: a hand-built submenu forks per input; the primitive answers
   * once. On the phone, `showAt`'s own `isMobileBottomSheet` branch takes over entirely and this
   * becomes a stacked child sheet through the existing sheet-chrome registration — nothing here
   * needs to special-case the phone.
   */
  const openChildMenu = (row: HTMLElement, build: (child: OwnedMenuHandle) => void) => {
    if (childRow === row) return;
    closeChildMenu();
    const child = createOwnedMenu(doc, {
      returnFocus: row,
      title: options.title,
      onClose: () => {
        if (childRow === row) {
          childRow = null;
          childMenu = null;
        }
        row.setAttr("aria-expanded", "false");
        row.removeClass("is-submenu-open");
      },
    });
    childMenu = child;
    childRow = row;
    row.setAttr("aria-expanded", "true");
    row.addClass("is-submenu-open");
    build(child);
    child.showAt({ submenuAnchor: row });
  };

  // Capture phase: a row's own click handler must run before dismissal removes the node it is on.
  const onOutside = (event: PointerEvent) => {
    if (!(event.target instanceof Node)) return;
    // LIFO, one level at a time: an outside press dismisses only the topmost surface, matching
    // `overlay-stack.ts`'s own rule for every sheet-registered surface. A press that lands back
    // inside this menu (to open a different submenu, say) reaches the row's own click handler
    // normally once the child is out of the way.
    if (childMenu) {
      if (childMenu.el.contains(event.target)) return;
      closeChildMenu();
      return;
    }
    if (el.contains(event.target)) return;
    close();
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      // Innermost only: one Escape closes the child and leaves the parent open, matching a native
      // OS submenu rather than dismissing the whole chain on a single keypress.
      if (childMenu) {
        closeChildMenu();
        return;
      }
      close();
      return;
    }
    // Roving focus belongs to whichever menu is actually showing rows right now. Falling through to
    // the parent's own arrow handling while a child is open would compute an index against the
    // child's focused row, find it absent from the parent's row list, and yank focus back to the
    // parent's first row out from under the open child.
    if (childMenu) return;

    const items = rows();
    if (items.length === 0) return;
    const active = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    const index = active ? items.indexOf(active) : -1;

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
      // A never-empty menu polices this at `showAt`, once the caller is done adding rows for this
      // open — not here, because a caller that gates rows behind eligibility checks may call
      // `addRow` zero times and still needs the fallback to appear.
      rowCount += 1;
      const handle = createMenuRow(el, {
        ...rowOptions,
        onClick: (event) => {
          rowOptions.onClick?.(event);
          if (rowOptions.submenu && rowOptions.buildSubmenu) {
            openChildMenu(handle.row, rowOptions.buildSubmenu);
            return;
          }
          if (!rowOptions.submenu) close();
        },
      });
      if (rowOptions.submenu && rowOptions.buildSubmenu) {
        const build = rowOptions.buildSubmenu;
        const openThisChild = () => openChildMenu(handle.row, build);
        handle.row.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight" || event.key === "Enter") {
            event.preventDefault();
            openThisChild();
          }
        });
        // Hover-open is desktop ergonomics only, gated on `(hover: hover)` so a coarse pointer never
        // opens a child menu on a stray touch that merely crossed the row on its way to a tap.
        if (doc.defaultView?.matchMedia("(hover: hover)").matches) {
          handle.row.addEventListener("pointerenter", (event) => {
            if (event.pointerType === "mouse") openThisChild();
          });
        }
      }
      return handle.row;
    },
    addSection(label) {
      createMenuSection(el, label);
    },
    addSeparator() {
      createMenuSeparator(el);
    },
    showAt(target) {
      // The instruction shape, not the absence: a menu whose caller added no rows at all — every
      // eligible row gated out upstream — would otherwise present a blank sheet with nothing to read
      // or click.
      if (rowCount === 0 && !fallbackRow) {
        fallbackRow = createMenuRow(el, { label: t("menu.noActions"), disabled: true }).row;
      }
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
        applySheetChrome(el, true, {
          scrimCapturesPointer: true,
          close: () => close(),
          // Every owned menu is `design-trueup.md` row 26's `menu` role: a handle-less card over
          // a dimmed parent, not a grab-handle bottom sheet. `role="menu"` above already earns it
          // the scrim's own Notion-measured band (`setScrim`, mobile-bottom-sheet.ts); this earns
          // the handle-less card and the classifier bail-out that go with the same class.
          menuCard: true,
        });
        placeSheet(el);
        // And keep it placed. A single call fixes the sheet at whatever the keyboard inset was when
        // it opened, so a menu opened over an open keyboard stays lifted after it closes, and one
        // opened before a keyboard never moves for it — while the panel sheet beside it does both.
        releasePlacement = keepSheetPlaced(el);
        playSheetEntrance(el);
        releaseDrag = attachSheetDragToDismiss(el, close);
        // Every phone sheet gets a title row, the owned menu included, rather than a title-less
        // menu variant. The rows were already appended by the caller's own `addRow`/`addSection`
        // calls above, so the header — built last, after the drag handle exists — is moved to sit
        // right under the handle rather than left where `createSheetHeader` appends it, which would
        // put it after every row instead of before all of them.
        const resolvedTitle = options.title
          || ("anchor" in target ? target.anchor.getAttribute("aria-label")?.trim() || undefined : undefined)
          || ("submenuAnchor" in target ? target.submenuAnchor.querySelector(".db-menu-item-label")?.textContent?.trim() || undefined : undefined)
          || resolveActiveViewName(doc)
          || t("menu.title");
        const header = buildShellHeader(el, { title: resolvedTitle, onClose: close });
        const handleEl = el.querySelector<HTMLElement>(".db-mobile-bottom-sheet-handle");
        el.insertBefore(header.header, handleEl ? handleEl.nextSibling : el.firstChild);
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

        if ("submenuAnchor" in target) {
          // Flush beside the parent row, a small gap, flipping to its left when the right edge has
          // no room. `resolvePopoverHorizontalLeft` already carries this exact
          // preferred-side-with-fallback arithmetic for another popover family's own horizontal
          // guard, so this reuses that one implementation rather than writing a second copy of it.
          const rowRect = target.submenuAnchor.getBoundingClientRect();
          const left = resolvePopoverHorizontalLeft(rowRect, bounds, rect.width, 2, margin, "left", "right");
          // The child's top aligns to the row that opened it, not to the parent menu's top.
          const top = clamp(rowRect.top, bounds.top + margin, Math.max(bounds.top + margin, bounds.bottom - height - margin));
          setPosition(el, left, top, undefined, 0, 0);
        } else {
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
  options: { returnFocus?: HTMLElement | null; onClose?: () => void; title?: string } = {},
): OwnedMenuHandle {
  const fromView = event.view?.document ?? null;
  const fromTarget = event.target instanceof Node ? event.target.ownerDocument : null;
  // `activeDocument`, not `document`: Obsidian can host this plugin in a popped-out window, where
  // the global document belongs to the main window and the menu would mount into the wrong one.
  return createOwnedMenu(fromView ?? fromTarget ?? activeDocument, options);
}
