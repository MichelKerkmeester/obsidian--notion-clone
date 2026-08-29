**Phase 001 — Overlay placement and menu language**

Repo `~/MEGA/Development/Obsidian Plugin`. **Runs fourth**, after `000`, `004`, `005`. Takes the `styles.css` lane at Phase 5, releases it at Phase 7.

**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**LINE NUMBERS ARE HINTS, NOT ADDRESSES.** `styles.css` is 19,261 lines and `000` deletes dead blocks before you start. Every `styles.css:NNNN` here was correct on 2026-08-29 and is kept as evidence about the tree on that date. `acceptance-criteria.md` carries the resolution table — selector plus the `rg` command. **When the command and the number disagree, the command is right.** Record moved numbers old to new; never silently correct one.

**NO DESKTOP NUMBER BEFORE `000` FIXES THE DESKTOP PAGE.** `verify-placement.mjs:220` loads `styles.css` on the **phone** page only, so every desktop geometry result today is measured in a document with no plugin cascade — structurally irrelevant. A1, A2, A4, A5, A6 and A7 are all desktop reads. A number recorded before that repair is discarded, not re-used. A harness number that disagrees with `009`'s live probe is a blocking failure.

**CHECK THIS BEFORE YOU START.** `tools/storybook/verify-placement.mjs` asserts a widthless caller renders **wider than 320px** and runs on every push. `000` should have inverted it. If it has not, **your first correct fix turns CI red** — confirm the inversion landed before touching the width policy.

**THE DEFECTS.** Dropdowns land in the wrong place and look unrelated to each other. "More tools" clips at the panel edge. Filter and Sort sit adjacent in the same toolbar and share no design language.

**MEASURED.** 33 `positionToolbarPopover` call sites — **15 pass the compact preset, 3 pass nothing at all** (raw 520px: Filter, Sort, Column Manager), **15 pass bespoke numbers**. 11 production owned menus. Zero native `new Menu(` remain. `db-anchored-popover`, added by every positioner call, has **no CSS rule anywhere** — a dead marker. `styles.css:9829-9852` is a panel-layout block the positioner overwrites inline, still reading as authoritative.

**THE ROW GRAMMAR IS WORSE THAN IT LOOKS.** `createMenuRow` has **one direct caller**, but **76 `addRow()` calls** flow through it — against **24 hand-rolled roots in 14 distinct vocabularies** across four files. `toolbar-renderer.ts` alone has 8 named row builders, two near line-for-line duplicates. **`submenu: true` is decorative**: it draws a chevron and sets ARIA, and its only production caller opens real submenus through a separate hand-built body-mounted popover.

**THE PIGGYBACK.** `db-sort-panel` has zero standalone **layout** CSS — every dimension comes from being dual-classed with `db-filter-panel`, and the phone max-height clamp list (`17205`) omits it. Deleting the "redundant" class silently breaks Sort's mobile height with **no compiler warning**. Filter is `role="dialog"` with a focus trap; Sort is neither.

**BUILD.** Roles from `000` as `data-db-surface`. Sizing per role — **292px is the one menu width that reads correctly today**; the 520px default that makes a four-item menu absurd stops being reachable. Retire the hand-rolled builders. Make `submenu` actually open a submenu, through the same mechanism as its parent.

**INVENTORY BY USER-REACHABLE TRIGGER, NOT BY MODULE.** Every toolbar button, header affordance, cell affordance, context menu and submenu, desktop and phone. Record trigger, role, anchor, mount, options.

**AC-008 WAS REWRITTEN.** It used to close on the dead block and the dead marker being *deleted*. A deletion is not an outcome — the criterion would have passed whether or not the user saw anything different. It now closes on a measurement: all eight panel selectors and every positioner surface must report an **identical computed geometry across the removal** (0 moving values, 3 widths x 2 sidebar states) and still pass the containment test. A value that moves means the block was live, the removal is rejected, and that value is what the replacement rule must declare.

**SIX CRITERIA HAVE NO FAILING NUMBER YET.** AC-008 to AC-013 are `Blocked`, not `Unmet`: the doctrine makes a criterion invalid until it has failed on the current tree with the number written down, and these cells are empty. `acceptance-criteria.md` names, for each, exactly what produces the number and at which phase. **Do not invent one.** A stage that owes a number cannot be reported complete while its cell is blank.

**ACCEPTANCE.**
- Every popover's rect fully inside the visible editing bounds at 1440/1024/768, sidebar open and closed. **Today: More tools clips.**
- Any two surfaces of the same role: identical computed padding, radius, shadow, row height, font-size — set equality.
- A row's computed layout is unchanged when mounted in a different container. **Today `.db-menu-item` only lays out inside `.db-owned-menu`.**
- A submenu is produced by the same mechanism as its parent and lands inside bounds.
- Filter and Sort expose the same role, focus behaviour and keyboard contract — asserted, not inspected.
- **Removing any one class from a panel changes a measured value** — no surface may depend on an undeclared piggyback.
- Plus the five stateful dimensions.

**LANE.** Take at Phase 5, release at Phase 7, and only after all four in order: (1) full recapture at 4 widths x sidebar states, `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — `screenshots:verify` never opens an image, so it can never be this step; (3) **`008`'s early replay re-asserting `000`, `004` and `005`** against the tree you released, because they closed against a snapshot you just edited and nothing obliges your edit to preserve their results; (4) cascade re-confirmation for every duplicated selector you touched. A phase that closed earlier and fails to re-close at this handoff blocks your release.

**DONE MEANS** the operator opens three different dropdowns and they look like one family.
