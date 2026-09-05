---
title: "Goal: Dropdown, Menu and Picker Componentization"
description: "The durable directive for the menu/picker family phase, and the criteria that decide when it is done."
trigger_phrases:
  - "052 goal"
  - "menu componentization goal"
  - "dropdown picker phase goal"
  - "menu primitive goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/052-dropdown-menu-and-picker-componentization"
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the phase from a source census of the menu, dropdown and picker files"
    next_safe_action: "Execute T001, the Anytype menu-grammar read"
    blockers:
      - "No phases after 051 exist yet in the parent spec's Phase Documentation Map; the parent is not edited here"
      - "Anytype menu captures are top-level files in screenshots/anytype/, not a menus/ subfolder"
    key_files:
      - "src/views/owned-menu.ts"
      - "src/views/dropdown-field.ts"
      - "src/views/menu-row.ts"
      - "src/views/column-menu.ts"
      - "screenshots/anytype/README.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-052-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Which picker widths become roles versus stay content-driven numbers"
      - "Does the create-option row belong in the dropdown primitive or in the cell option editor only"
    answered_questions:
      - "The operator's 2026-09-05 intent: take the best from Anytype across every modal, sheet and menu, and componentize as much as possible"
      - "Kept ours by program ruling: the table view, formulas/rollups/calculations, the Project Manager 1:1 board and gantt"
      - "044 header-everywhere, 048 stacking, 001 role vocabulary and design-system sizing already bind every menu surface; this phase composes them, not re-litigates them"
---
# Goal: Dropdown, Menu and Picker Componentization

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Reduce every dropdown, menu, popover and picker in `src/views/` to one menu primitive
and one picker primitive family, and align their grammar with Anytype's menus where the captures
show Anytype's is better — while keeping the surfaces the program keeps ours: the table view, the
formulas/rollups/calculations, and the Project Manager 1:1 board and gantt.

**Why.** The operator's intent (2026-09-05, verbatim): *"research recommendations and how to tackle
/ update / improve every modal, sheet and general ui ux to take the best from AnyType and
componentize stuff as much as possible."* The sheet half of that ask is owned by `044` and `048`,
which landed. The menu half is not owned by any phase. Today the family has one good container
(`owned-menu.ts`), one good listbox (`dropdown-field.ts`), one good row builder (`menu-row.ts`) —
and around them a drifted periphery: hand-built rows in `toolbar-renderer.ts` and `column-menu.ts`,
hand-built submenus, a cell option editor with its own markup, and three pickers that each invent
their own header/grid/search wiring.

### Decisions

| ID | Decision |
|----|----------|
| D1 | **One menu primitive, one picker family.** The menu primitive is the composition of `owned-menu.ts` + `menu-row.ts` extended once (real submenus, sections it already has); the picker family is `dropdown-field.ts` (select/multi-select), `date-value-picker.ts`, `option-color-picker.ts`, `icon-picker-popover.ts` and the relation editor in `cell-renderer.ts` reduced to shared hosts. A surface that needs something the primitive cannot express gets the primitive extended once — never a fifteenth row vocabulary. |
| D2 | **Red first, per surface.** Every migration row in `componentization-plan.md` names a threshold and the red value observed on today's tree before its leg runs (parent D2). |
| D3 | **Anytype's menu grammar is a design source, read from the captures — and `050`'s `design-trueup.md` is the read of record.** Where a capture and `047`'s research disagree, the capture is the fact and the research is a source reading (`050` ADR-003, Accepted 2026-09-05). Where a pattern is adopted, the migration table names the capture file it was designed against; where the captures do not reach a pattern, the design says so and is **code-derived** with the gap named — and absence of a capture is not evidence of absence. Anytype is not a data model — `050`'s D6 applies here unchanged, and so do the two values `050` **refused**: the `#232323` row highlight at 1.14:1, and colour-only active-state signalling. |
| D4 | **Existing contracts are constraints, not deliverables.** `044`'s sheet grammar (header everywhere, 44px close, 16px row inset, 16px title), `048`'s stacking model and its 31 registered pairs, `001`'s role vocabulary and the design-system's 292px menu width and named-role sizing are consumed unchanged. This phase may not regress any of them. |
| D5 | **Kept ours, per the operator's ruling.** The table view's surface, formulas/rollups/calculations and the Project Manager 1:1 board and gantt are out of adoption scope. `038`/`037`'s `screenshots/project-manager/` reference parity is not moved by a menu change without a recapture and a read. |
| D6 | **One leg touches one file group.** The implementation order groups migrations by the file they land in, so `toolbar-renderer.ts` is opened once, not once per surface. |
| D7 | **Desktop and phone, both, per surface.** The primitive's single definition produces the desktop popover and the phone sheet (`dropdown-field.ts:198-335` already does this; the primitive generalises it). A surface whose phone expression changes registers or updates its `sheet-grammar` pair. |
| D8 | **One owner per surface, across the five family phases.** The **confirm primitive is `051`'s** and this phase consumes it. The **condition row is `053`'s** — the filter and sort panels' shared row is not built here. **Cell inline editors are `054`'s**, one per column type; this phase migrates only the option popover's *row construction*, never the editor. **`048`'s stacking model is a constraint, not re-specified** by anyone. A surface this phase would build that another phase owns is referenced, never duplicated. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **`componentization-plan.md` exists: one row per family surface — surface → primitive →
      changes → Anytype pattern with capture filename → stays ours.** **Today: no such table
      exists.** The census it is built from is real and cited in each doc: 12 `createOwnedMenu`/
      `createOwnedMenuForEvent` call sites outside `owned-menu.ts` itself, 11 `openDropdownMenu`
      call sites, 29 `createDropdownField` call sites, 34 `positionToolbarPopover` call sites of
      which 9 carry bespoke widths (five distinct values counted twice or more), and **71** hand-built
      `db-menu-item` row constructions outside `menu-row.ts` (**45** in `toolbar-renderer.ts`, 19 in
      `column-menu.ts`, 4 in `dropdown-field.ts`'s own options, 3 in `cell-renderer.ts` —
      **recounted at landing 2026-09-05**; the draft's 44/70 was one short in the toolbar).
- [ ] **The menu primitive can open a real submenu through the factory that produced its parent.**
      **Today it cannot**: `owned-menu.ts:170-178` closes the menu on any non-submenu row and has no
      nested-menu handle; `column-menu.ts` builds its three submenus as separate body-mounted
      popovers with their own lifecycle (`activeSubmenuCleanup`, `createColumnMenuSubpopover` at
      `column-menu.ts:568-633`), and `menu-row.ts:112-122` draws a chevron that promises a nested
      menu `OwnedMenuHandle` cannot open — the design-system's "affordance without a mechanism"
      anti-pattern, still live.
- [ ] **Every menu row in the family is built by one row builder.** **Today: 71 hand-built row
      sites** across four files build `db-menu-item` markup by hand beside `createMenuRow`'s 76
      legitimate call sites.
- [ ] **The picker family shares one host: search, grid, header, phone-sheet branch, placement
      widths and the one-per-document active-picker registry.** **Today the four pickers each wire
      their own**: `activePickers` WeakMaps are declared three times (`date-value-picker.ts:71`,
      `icon-picker-popover.ts:50`, `option-color-picker.ts:29`), the phone header dance is repeated
      per picker, and widths are four bespoke numbers (252, 318, 124, plus the dropdown's
      280/360/180).
- [ ] **The Anytype menu grammar worth taking is written down with, per pattern, the capture that
      shows it or the named gap.** **Today: no menu-grammar document exists.** The inputs exist —
      `anytype-object-more-menu-dark.png` (a full sectioned context menu), the filter and property
      pickers (`anytype-filter-property-picker-dark.png`,
      `anytype-filter-tag-value-picker-dark.png`), the type picker, and `research.md` §9's
      capability-gating findings — but no phase owns extracting them for menus specifically.
      **Updated at landing 2026-09-05:** `050`'s `design-trueup.md` has since read the pixels of all
      three menu captures with a per-pixel scan and is now the read of record (`050` ADR-003, where
      a capture and the research disagree the capture is the fact). `anytype-menu-grammar.md` §4
      lists the five rows that changed when it did — four sections became **five**, the selection
      caps became a **non-adoption**, the never-empty gap narrowed to **one file**
      (`bulk-edit-field-menu.ts:31-45`), a judged density became **measured geometry**, and the
      property picker's "typed groups" became a **per-format icon vocabulary**. Note that
      `screenshots/anytype/` has no `menus/` subfolder; the captures are top-level files.
- [ ] **`npm run gate` exits 0 with one permanent lane row per migrated surface family, each
      observed red before green**, and `044`'s `sheet-grammar` pairs and `048`'s stacking model
      still pass. **Today: not run for this phase; the family's lane rows do not exist.**
- [ ] **The operator opens menus, dropdowns and pickers on iOS and desktop and reads them as
      componentized and improved.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

- **2026-09-05, landed in-runtime.** Reviewed against the parent's D1-D14, `050`'s `design-trueup.md`
  and the current tree, then copied from `worktrees/081-phase-menu-componentization` into
  `worktrees/086-land-phases-051-055`. **Corrected:** five grammar rows against the true-up
  (`anytype-menu-grammar.md` §4); the `050` item 1, 4 and 8 overlap rows in `spec.md` §7; the
  hand-built row census from 70/44 to **71/45**; and thirteen `file:line` citations that had drifted
  — `menu-row.ts`'s chevron block (`:102-111` → `:112-122`), `createColumnMenuSubpopover`
  (`:555-639` → `:568-633`), the column type submenu (`:147-183` → `:224-255`), two `activePickers`
  declarations (`date-value-picker.ts:75` → `:71`, `option-color-picker.ts:25` → `:29`) and six
  bespoke widths. D8 was added to record the one-owner split against the sibling phases.
- **2026-09-05, authored.** Phase opened from the operator's componentization ask. The census above
  was counted from source with `grep -c`/`-n` reads, not estimated. `recommend-level.sh --loc 1400
  --files 15` → Level 2, 51/100, confidence 90%, phase score 10/50; raised to **Level 3** on
  judgment — the phase touches every renderer and every modal-adjacent surface in the plugin, which
  is the same judgment call `050` made at identical numbers. `create.sh --phase` failed in this
  worktree (it parsed the slug's words as three phase names, created 051/052/053 placeholders and
  injected a Phase Documentation Map into the parent `spec.md`); the parent edit was reverted and
  the structure copied from `050` per the packet brief's documented fallback.
<!-- /ANCHOR:log -->
