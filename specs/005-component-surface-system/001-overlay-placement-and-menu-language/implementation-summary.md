---
title: "Implementation Summary: Overlay Placement and Menu Language"
description: "Four deliverables landed against a phase whose census never ran: the surface factory deleted, the portal chrome made self-owned, the 520px default retired, and the surface marker given a focus ring. None of the thirteen acceptance criteria is Met, and the reason is recorded rather than worked around."
trigger_phrases:
  - "001 implementation summary"
  - "overlay placement shipped"
  - "surface factory deleted"
  - "portal chrome self-owned"
importance_tier: "critical"
contextType: "verification"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/001-overlay-placement-and-menu-language"
    last_updated_at: "2026-08-30T20:30:00Z"
    last_updated_by: "phase-reconciliation"
    recent_action: "Factory deleted; portal chrome self-owned; 292px default. Census and 33 call sites not run"
    next_safe_action: "Run the overlay trigger census; it gates AC-008 to AC-013 and every remaining task"
    blockers:
      - "The overlay trigger census has never run, so AC-008 to AC-013 stay Blocked with no failing number"
      - "AC-008's premise no longer holds — the block it planned to delete now carries this phase's own portal arms"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "styles.css"
      - "src/views/popover-position.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-001-summary"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Does AC-008 survive its own phase editing the block it was written to delete"
      - "Which of the two names — the folder or the lane's 001-overlay-width-and-chrome — is authoritative"
    answered_questions:
      - "Wire openSurface or delete it? Deleted at e1d9df9 on nine measurements; the contract was kept"
---
# Implementation Summary: Overlay Placement and Menu Language

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 001-overlay-placement-and-menu-language |
| **Completed** | Not complete — In Progress |
| **Level** | 3 |
| **Status** | **Shipped + verified, awaiting device — 7 of 8 criteria.** 0 of 67 tasks checked; 0 of 13 `acceptance-criteria.md` rows Met. *Moved from **In Progress** 2026-09-02 to match `spec.md`, which §3.1 and the cross-doc status rule both require; the fraction is `goal.md`'s checklist, which is what §3.2 derives from, and the two zeros beside it are unchanged.* |
| **State** | Four deliverables landed and two of them re-assert green today. The census the phase is built on has never run |

**This document exists because the phase's continuity block said `completion_pct: 0` and "not
started" while the tree contained its work.** It replaces that claim with what the evidence supports,
which is neither 0 nor complete.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Four things landed. Each is traced below to a commit, a lane-journal entry, or a command run today —
never to a plan that said it would happen.

| # | Deliverable | Evidence |
|---|---|---|
| 1 | `src/views/surface.ts` deleted (319 lines); `surface-contract.ts` kept and extended | `e1d9df9`, `git show --name-status` reports `D src/views/surface.ts` |
| 2 | Portal chrome named twice, so a body-mounted surface keeps its own border and radius | `c31acf5`; 32 `.db-x.db-surface` arms in `styles.css`, 8 of them at `10332-10339` |
| 3 | The 520px default retired; Filter, Sort and Column Manager declare a width | `885a8dc`; `src/views/popover-position.ts:98` |
| 4 | `db-surface` added to both focus-indicator lists | `c31acf5`; `styles.css:19836` and `:19854` |

### The factory decision

`openSurface()` had zero importers, so the bundler dropped it — it had never run on a device in any
release. `e1d9df9` deletes it and keeps the contract, which holds every role, dismissal set, focus
mode and width policy and is read by the census. The commit also gives the conformance tool a
reachability count, taking unreachable source modules from three to two.

The decision is written up in `spec.md` §13 and is the phase's one `answered_question`. The parent
`roadmap.md` §7.2 flagged the contradiction this created — a phase at 0% does not delete a module —
and this document resolves it in the direction §7.2 predicted: the work is real, the percentage was
wrong.

### The portal chrome

Most of this stylesheet is written `.note-database-container .db-thing`. A descendant combinator
cannot match the element holding the class, so a panel moved to the body keeps every rule aimed at
its children and loses every rule aimed at itself — its whole chrome. Naming each surface twice, once
scoped and once as `.db-x.db-surface`, restores it at identical specificity, so nothing about
in-container rendering moves.

The lane journal records the unrecoverable count falling 537 → 29 → 0 across three edits
(entries at 23:27, 23:32 on 2026-08-29). `tools/live/portal-safety.mjs` confirms the zero today.

### Files changed

| File | Action | Purpose |
|---|---|---|
| `src/views/surface.ts` | Deleted | The unreached factory; 319 lines |
| `src/views/surface-contract.ts` | Modified | The contract kept and extended |
| `src/views/popover-position.ts` | Modified | 520px default replaced by the 292px compact preset |
| `src/views/menu-row.ts` | Modified | `cls` option added, so a caller keeps its own row class without hand-building the row |
| `src/views/filter-panel-renderer.ts`, `sort-panel-renderer.ts`, `column-manager-renderer.ts` | Modified | Each declares a panel width |
| `styles.css` | Modified | Self-owned chrome arms, owned-menu disabled state and icon slot, both focus-indicator lists |
| `tools/live/design-conformance.mjs`, `.json` | Modified | Reachability count added |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**Opportunistically, and that is the honest description.** The phase declares a five-stage order —
census, contract, row grammar, source landing, verification — and none of the four deliverables came
out of it. `tasks.md` carries 67 unchecked boxes and the census that gates every one of them
(T-002, T-003) has not run. What landed instead was the work that was reachable without it.

Two of the four are consequences of other phases' pressure rather than this phase's plan. The portal
arms were written because `002`'s sheet needed to leave the container; the focus-ring entry was
written because the surface marker was the one marker the focus list did not name.

**Attribution is worse than the work.** Three of the four stylesheet deliverables — the portal arms,
the focus lists, and the owned-menu disabled state and icon slot — all landed inside `c31acf5`,
*"fix(ui): let controls own their appearance and fit their column"*, a 665-line stylesheet commit
whose message describes checkbox appearance, toggle switches, the select column, list-row grids and
card number formatting, and **mentions none of them**. Each was confirmed with a separate
`git log -S` against `styles.css`; the commit message alone would not find any of them.

**The lane journal records two holds under a different name.** `tools/lane/css-lane.json` files
these edits under `001-overlay-width-and-chrome`: acquire→edit→release at 21:35-21:45 on 2026-08-29,
then acquire→four edits at 23:24-23:38 **with no release event**. `roadmap.md` §7.3 records the
name conflict and it remains unresolved; the missing release is recorded here for the first time.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Delete the factory rather than wire it | Anchor-only placement is wrong for 12 of 14 menu openings that begin at a cursor coordinate, and 10 of 34 placement call sites pass axes its role declaration has no field to carry. Wiring was not available, not merely unfinished |
| Keep the contract | It holds every role, dismissal set, focus mode and width policy and has its own tests. Deleting it would have destroyed the design to remove a guess at its implementation |
| Name each surface twice rather than guard the container | The `:not()` guard was tried on the container box and reverted: it raises specificity from (0,1,0) to (0,2,0), winning fights `.is-phone .note-database-container` used to win on order alone, and it moved 34 captures. Recorded at lane entry 23:38 |
| Report **no** criterion Met | All 13 read Unmet; six of them are `Blocked` for want of a failing number. The phase's own `goal.md` says **"Do not invent one."** Two commands pass today and neither closes a criterion's threshold — that gap is reported below, not rounded away |
| ~~Set `completion_pct` to 25, not 0 and not 100~~ | **Superseded 2026-09-02.** The judgment was sound and the figure is no longer judged: `roadmap.md` §3.2 derives it from `goal.md`'s checklist, **7 of 8 rows ticked = 88**, and every continuity block in this folder carries that. Kept because the reasoning it records is why the number was ever anything but 0: 0 is refuted by four landed deliverables; 100 is forbidden by D3 while nothing is operator-confirmed, and would be absurd against 0 of 67 tasks |
| Leave `tasks.md` untouched | T-011 and T-012 are substantively satisfied by `885a8dc` but ticking boxes is outside this reconciliation's scope. The drift is recorded under Limitations instead |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Two commands were run from the final state. **Exit status read directly into `echo $?`, never
through a pipe.** Both read `styles.css`, which was **clean in the working tree at `0ab9a35`** — so
each measures committed state rather than another session's edit in flight. Concurrent sessions moved
`HEAD` to `ff3d241` while this was being written; `git diff 0ab9a35..ff3d241 -- styles.css` is
**empty**, so both numbers still describe the current stylesheet.

| Command | Result | Exit |
|---|---|---|
| `npm run replay` | **PASS — all 8 results still hold** | **0** |
| `node tools/live/portal-safety.mjs` | **1296 computed properties would change, 0 of them beyond what the marker classes can recover** | **0** |

### What each one actually proves

**`replay`** re-asserts one result belonging to this phase, filed under its lane name:

> `held   001-overlay-width-and-chrome`
> `       every surface marker grants a focus ring to a control mounted outside the container`
> `       recorded 0, now 0`

Its recorded pre-fix number is `was: 1` (`tools/live/replay.mjs:106`) — `db-surface` was the one
marker of six with no focus ring. So this is a genuine red-before-green, satisfying D2. It is
**mechanism, not outcome**: the check walks the CSSOM for a rule whose `selectorText` names the
marker and `:focus-visible` and which sets `boxShadow`. It proves the rule exists. It does not prove
a keyboard user sees a ring.

**`portal-safety`** confirms the 537 → 0 claim holds. Read the two numbers correctly: **1296 is the
total** of properties that move when a surface is portalled, and **0 is the unrecoverable subset**.
1296 is not comparable to 537; 537 was itself an unrecoverable count.

### Static reads, verified by command, that close nothing

Each was re-resolved by selector rather than by the stale line number `spec.md` carries, as the
phase's own log instructs:

- **The 520px default is unreachable.** `src/views/popover-position.ts:98` reads
  `options.preferredWidth ?? COMPACT_MENU_POPOVER.preferredWidth ?? 292`. `COMPACT_MENU_POPOVER.preferredWidth`
  is 292 (`:48`), `PANEL_POPOVER` is 360 (`:68`). This is T-012's substance. It is **not** AC-007,
  which requires a measured `rect.width <= 320` for every menu-role surface *the census reaches* —
  and the census does not exist.
- **`db-anchored-popover` is still a dead marker.** `rg -c db-anchored-popover styles.css` → **0
  matches**, while it is still applied at `src/views/popover-position.ts:105` and
  `src/views/chart-toolbar-renderer.ts:346`.
- **AC-008's target block moved.** The `max-width: min(760px, calc(100vw - 72px))` block that
  `spec.md` cites at `styles.css:9829-9852` now begins at **`styles.css:10340`**. Recorded old → new
  as T-041 requires, never silently corrected.

### Acceptance criteria

**0 of 13 Met.** AC-001 to AC-007 are `Unmet`; AC-008 to AC-013 are `Blocked` for want of a failing
number. No cell was changed. Nothing run today measures a rectangle against the visible bounds, a
role's computed-value parity, a row's layout across two parents, a submenu, a focus trap, a
class-deletion sweep, or a censused width — which is what those thirteen rows ask for.

### Not run, and why

`npm run gate` and `npm run storybook:placement` were **not** run. The working tree is under
concurrent modification by other sessions: `tools/storybook/verify-placement.mjs` carries **175
uncommitted added lines** (a number-parity section belonging to `019`), alongside edits to
`src/views/card-field-renderer.ts` and `tools/live/renderer-coverage.json`. Running the shared
harness against a moving tree produces a number describing neither state — `roadmap.md` §7.1 declines
the same measurement for the same reason. The gate's reported 16-green/exit-0 is therefore **carried
from the parent roadmap, not re-observed here**, and is not cited as this phase's evidence.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The phase's central deliverable does not exist.** The overlay trigger census — every toolbar
   button, header affordance, cell affordance, context menu and submenu, desktop and phone, recorded
   as trigger/role/anchor/mount/options — has not run. It is T-002 and T-003, and six criteria name
   it as the thing that would produce their numbers. Everything below follows from this.

2. **AC-008 has been overtaken by this phase's own work, and nobody has noticed.** AC-008 closes by
   removing the panel-layout block and the `db-anchored-popover` marker and observing that **0 of 8
   panels move a computed value** — the test for whether the block is dead. But deliverable #2 wrote
   the eight `.db-x.db-surface` portal arms **into that same block**, now at `styles.css:10332-10339`.
   The block is no longer a candidate for deletion; deleting it would strip the portal chrome and move
   a great many values. AC-008 needs rewriting against a premise that still holds. **This is a
   contradiction, reported and not resolved** — resolving it is a scope decision, not a documentation one.

3. **Two commands pass and neither closes a criterion.** `replay`'s focus-ring entry is not one of
   the 13 criteria, and `portal-safety` is not either. A reader scanning for green should not read
   these as progress against the acceptance table.

4. **`tasks.md` is stale in the same direction the continuity block was.** T-011 (menu role sizes
   from 292px) and T-012 (the 520px default unreachable) are satisfied by `885a8dc` and verified above,
   yet both boxes are unchecked — as are all 67. The boxes were deliberately left alone: this pass
   reconciles the summary and the continuity block, and ticking implementation tasks is a wider claim
   than its evidence supports for the other 65.

5. **The lane hold was never released.** `tools/lane/css-lane.json` records `acquire` at
   2026-08-29T23:24:15Z and four edits ending 23:38:08, with **no `release` event** — unlike the first
   hold, which released cleanly. The lane's top-level `holder` is `null` today, so nothing is blocked,
   but this phase's second hold is unterminated in the journal.

6. **`roadmap.md` §7.3's unsigned drift now has a claimant, and it is not this phase.** The lane's
   `outstanding[1]` still reads *"001-overlay-width-and-chrome left the stylesheet at 22f82f54a72b
   without claiming the edit… still unsigned."* History entry 41 — added later, marked
   `RECORDED LATE` — claims that exact hash for **`003-mobile-sheet-presentation`**: *"sheet grab
   handle given touch-action none and a 160x44 hit band… This is the drift 010 found; the edit was
   real, the record was missing."* Entry 42 is `010`'s acquire naming the same drift, which ties the
   two together. A grab-handle edit is `003`'s subject matter, not this phase's. **The `outstanding`
   entry was never updated and is now wrong.** Correcting it means editing a shared lane file, which
   is outside this folder — reported for its owner.

7. **The two names are still two.** The folder is `001-overlay-placement-and-menu-language`; the lane
   journal and the `replay` output both say `001-overlay-width-and-chrome`. Anyone grepping the lane
   or the replay output for the folder name finds nothing.

8. **Nothing here is operator-confirmed.** Per D3, shipped, verified and operator-confirmed differ,
   and only the third closes. No deliverable in this phase has been seen on the operator's device.

9. **UNKNOWN — whether the menu language half of this phase moved at all.** The phase's second
   subject is the row grammar: 14 hand-rolled grammars in `toolbar-renderer.ts` against one
   `createMenuRow`, and a decorative `submenu: true`. `c31acf5` added a `cls` option to
   `MenuRowOptions` whose own comment names the drift it is meant to stop, which is an enabler for
   T-021 and T-022 — but no grammar was retired and no submenu opens. **What would settle it:** the
   AC-009 row-key census, which is Phase-1 work and blocked on the same missing trigger census.
<!-- /ANCHOR:limitations -->
