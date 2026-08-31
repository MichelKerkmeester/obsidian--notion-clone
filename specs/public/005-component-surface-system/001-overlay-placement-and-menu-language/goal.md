**Phase 001 — Overlay placement and menu language**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **Runs fourth**, after `000`, `004`, `005`. Takes the `styles.css` lane at Phase 5, releases it at Phase 7.

**THE DEFECTS.** Dropdowns land in the wrong place and look unrelated to each other. "More tools" clips at the panel edge. Filter and Sort sit adjacent in the same toolbar and share no design language.

**BUILD.** Roles from `000` as `data-db-surface`. Sizing per role — **292px is the one menu width that reads correctly today**; the 520px default that makes a four-item menu absurd stops being reachable. Retire the hand-rolled builders. Make `submenu` actually open a submenu, through the same mechanism as its parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**LANE.** Take at Phase 5, release at Phase 7, and only after all four in order: (1) full recapture at 4 widths x sidebar states, `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — `screenshots:verify` never opens an image, so it can never be this step; (3) **`008`'s early replay re-asserting `000`, `004` and `005`** against the tree you released, because they closed against a snapshot you just edited and nothing obliges your edit to preserve their results; (4) cascade re-confirmation for every duplicated selector you touched. A phase that closed earlier and fails to re-close at this handoff blocks your release.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked that this
folder does not carry evidence for, and the harness-dependence audit below is why several rows that
have a number are still open.*

- [x] Every popover's rect fully inside the visible editing bounds at 1440/1024/768, sidebar open
      and closed. **Today: More tools clips.** **Measured green across the placement lane's width
      sweep**, and the two surfaces that used to escape are each asserted at two anchor positions —
      one position cannot tell a clamp from a coincidence.
- [ ] Any two surfaces of the same role: identical computed padding, radius, shadow, row height,
      font-size — set equality. **Compromised, and this packet holds the program's third
      false-green case.** `createMenuRow` builds a `<button>`, and `app.css` declares `display`,
      `align-items`, `padding`, `border-radius`, `height` and `font-size` on every bare button —
      none of which the harness loads outside `HOST_BARE_CONTROLS`.
- [x] A row's computed layout is unchanged when mounted in a different container. **Today
      `.db-menu-item` only lays out inside `.db-owned-menu`.** **Met** — *a menu row lays out
      identically in any sheet* reports the same `min-height`, padding and height in the owned-menu
      shell and in a panel sheet, which is the "outside the shell" half stated as a number.
- [ ] A submenu is produced by the same mechanism as its parent and lands inside bounds. **Half.**
      The anchorless submenu clears the right sidebar, but its arithmetic is still transcribed into
      both harnesses rather than called — the shape `015` repaired for the search-results clamp and
      named as still owed here.
- [ ] Filter and Sort expose the same role, focus behaviour and keyboard contract — asserted, not
      inspected. **No check.**
- [x] **Removing any one class from a panel changes a measured value** — no surface may depend on an
      undeclared piggyback. **Built 2026-09-01.** It was the strongest row in the packet and the one
      with nothing behind it, which is the usual fate of a criterion phrased as a universal: easy to
      write, and it needs an ablation per class to answer.
      → *removing any one class from a panel changes a measured value*: the owned menu carries
      `[db-surface, db-menu, db-owned-menu, db-mobile-bottom-sheet, db-overlay-enter, is-visible]`
      and the filter panel `[db-filter-panel, db-surface]`; each is removed on its own and the
      surface re-measured across sixteen properties at two mount points, then restored.
      **What it is really asking**, and why the sixteen properties matter: a class that changes
      nothing is either dead — and the next tidy-up takes a rule with it — or its work is being done
      by an ancestor, which is the piggyback: right here and wrong the moment the surface is
      portalled. This program has paid for that twice, in the checkbox that borrowed its appearance
      from an ancestor class and in the menu row that only laid out inside the owned menu's shell.
      **Two mount points, because a one-position ablation would have called the token marker dead.**
      Inside the container `db-surface` changes nothing — the tokens already resolve — and on the
      body it is the only thing making them resolve at all, which `replay` has recorded since `000`.
      A class earns its place by moving something at either.
      **Three declarations, each named with its reason rather than filtered out.** `db-menu` is
      Obsidian's own class, carried so `app.css` reaches the surface, and the harness does not load
      `app.css`. `db-overlay-enter` and `is-visible` are the entrance: their work is a transition,
      and this measures a surface already at rest under reduced motion — the correct state to ablate
      a layout class in and the wrong one for a transition class. Both are covered where their work
      happens, by the two sheet-entrance sections.
      **Watched failing** with a class added that declares nothing: `1 changed nothing:
      filter-panel .db-dead-class`.
- [ ] Plus the five stateful dimensions. **No mapping exists.**
- [ ] The operator opens three different dropdowns and they look like one family. **Only the
      operator closes this.**
**HARNESS DEPENDENCE, 2026-08-31 — 9 sound / 4 dependent / 0 unknown.** Two acceptance bullets are
compromised, and this packet holds the program's third false-green case. `createMenuRow` builds a
**`<button>`** (`menu-row.ts:92`), and Obsidian's `app.css` declares `display`, `align-items`,
`padding`, `border-radius`, `height` and `font-size` on every bare button — none of which the
harness loads outside `HOST_BARE_CONTROLS`. So *"a row's computed layout is unchanged when mounted in
a different container"* records `flex` versus `block` where a device gives `flex` versus
`inline-flex`, and `align-items` cannot differ on a device at all. *"Any two surfaces of the same
role: identical padding, radius, shadow, row height, font-size"* is worse: **on a device the host
supplies one identical value to every unstyled role-mate, so the set equality passes with the defect
present.** Widths, bounds containment and the submenu bullet are sound — the plugin declares those
outright. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**LINE NUMBERS ARE HINTS, NOT ADDRESSES.** `styles.css` is 19,261 lines and `000` deletes dead blocks before you start. Every `styles.css:NNNN` here was correct on 2026-08-29 and is kept as evidence about the tree on that date. `acceptance-criteria.md` carries the resolution table — selector plus the `rg` command. **When the command and the number disagree, the command is right.** Record moved numbers old to new; never silently correct one.

**NO DESKTOP NUMBER BEFORE `000` FIXES THE DESKTOP PAGE.** `verify-placement.mjs:220` loads `styles.css` on the **phone** page only, so every desktop geometry result today is measured in a document with no plugin cascade — structurally irrelevant. A1, A2, A4, A5, A6 and A7 are all desktop reads. A number recorded before that repair is discarded, not re-used. A harness number that disagrees with `009`'s live probe is a blocking failure.

**CHECK THIS BEFORE YOU START.** `tools/storybook/verify-placement.mjs` asserts a widthless caller renders **wider than 320px** and runs on every push. `000` should have inverted it. If it has not, **your first correct fix turns CI red** — confirm the inversion landed before touching the width policy.

**MEASURED.** 33 `positionToolbarPopover` call sites — **15 pass the compact preset, 3 pass nothing at all** (raw 520px: Filter, Sort, Column Manager), **15 pass bespoke numbers**. 11 production owned menus. Zero native `new Menu(` remain. `db-anchored-popover`, added by every positioner call, has **no CSS rule anywhere** — a dead marker. `styles.css:9829-9852` is a panel-layout block the positioner overwrites inline, still reading as authoritative.

**THE ROW GRAMMAR IS WORSE THAN IT LOOKS.** `createMenuRow` has **one direct caller**, but **76 `addRow()` calls** flow through it — against **24 hand-rolled roots in 14 distinct vocabularies** across four files. `toolbar-renderer.ts` alone has 8 named row builders, two near line-for-line duplicates. **`submenu: true` is decorative**: it draws a chevron and sets ARIA, and its only production caller opens real submenus through a separate hand-built body-mounted popover.

**THE PIGGYBACK.** `db-sort-panel` has zero standalone **layout** CSS — every dimension comes from being dual-classed with `db-filter-panel`, and the phone max-height clamp list (`17205`) omits it. Deleting the "redundant" class silently breaks Sort's mobile height with **no compiler warning**. Filter is `role="dialog"` with a focus trap; Sort is neither.

**INVENTORY BY USER-REACHABLE TRIGGER, NOT BY MODULE.** Every toolbar button, header affordance, cell affordance, context menu and submenu, desktop and phone. Record trigger, role, anchor, mount, options.

**AC-008 WAS REWRITTEN.** It used to close on the dead block and the dead marker being *deleted*. A deletion is not an outcome — the criterion would have passed whether or not the user saw anything different. It now closes on a measurement: all eight panel selectors and every positioner surface must report an **identical computed geometry across the removal** (0 moving values, 3 widths x 2 sidebar states) and still pass the containment test. A value that moves means the block was live, the removal is rejected, and that value is what the replacement rule must declare.

**SIX CRITERIA HAVE NO FAILING NUMBER YET.** AC-008 to AC-013 are `Blocked`, not `Unmet`: the doctrine makes a criterion invalid until it has failed on the current tree with the number written down, and these cells are empty. `acceptance-criteria.md` names, for each, exactly what produces the number and at which phase. **Do not invent one.** A stage that owes a number cannot be reported complete while its cell is blank.
<!-- /ANCHOR:log -->
