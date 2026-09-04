---
title: "Roadmap: List View Deprecation"
description: "The four live children of the list-view retirement and the five superseded ClickUp children, with what each one owns, the order that is not negotiable, and where the packet reaches into the surface-system program."
trigger_phrases:
  - "list deprecation roadmap"
  - "006 roadmap"
  - "list view retirement order"
  - "superseded clickup children"
importance_tier: "high"
contextType: "planning"
---
# Roadmap: List View Deprecation

<!-- SPECKIT_TEMPLATE_SOURCE: roadmap | v2.2 -->

> Read `spec.md` for the measured facts that fix the size of this retirement and `goal.md` for the
> decisions that bind it. This file answers three questions: **which child owns each move, what is
> actually true of each child today, and where this packet touches the surface-system program.**

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Subject:** Note Database plugin, `specs/006-list-view-deprecation/`
**Status:** Planned. Direction converted 2026-09-04; no code written.
**Horizon:** Open. The packet closes when the operator opens a vault that had a list view and
reports it migrated rather than broken.
**Owner:** Operator. No child is held by a live agent.
**Precedent:** [`../005-component-surface-system/030-gallery-view-deprecation/`](../005-component-surface-system/030-gallery-view-deprecation/)
**Last updated:** 2026-09-04

**Why this file exists.** The packet has nine children and only four of them are work. Without one
place that says which is which, a reader arriving at `002-clickup-chrome` has no way to tell it is
history rather than a phase waiting to start — the folder looks exactly like a live one, because it
was one until 2026-09-04.

**What this file does not do.** It does not restate `spec.md`'s requirements or `goal.md`'s
decisions. Where a child's own documents disagree with a row here, the child is authoritative and
the disagreement is a defect in this file.
<!-- /ANCHOR:metadata -->

---

## 2. THE ONE-LINE REASON THIS EXISTS

The operator retired the list view outright on 2026-09-04 — *"Also deprecate list view completely"* —
and a retirement has to be **done** rather than declared: `viewType` is a persisted union written
into vault files, so deleting the value strands every database already configured with it.

---

<!-- ANCHOR:now-next-later -->
## 3. THE FOUR LIVE CHILDREN

Order is `005` -> `006` -> `007` -> `008` and it is **not negotiable**. Removing a renderer before
knowing what uses it, or before existing views have somewhere to go, is how a deprecation becomes a
data loss.

| # | Child | Level | Owns | State | Derived |
|---|---|---|---|---|---|
| 1 | [`005-usage-and-migration-audit/`](005-usage-and-migration-audit/) | 1 | Which surfaces offer list, which lanes measure it, and which affordances the table does not have | **Planned — runs first, read-only.** Changes no source file | 0/5 |
| 2 | [`006-hide-and-migrate/`](006-hide-and-migrate/) | 1 | Withdraw list from every picker while keeping it renderable; migrate an existing list view to a table with the same columns, once, with a notice in three locales | **Planned — blocked on `005`.** Reversible: one filter and one module | 0/6 |
| 3 | [`007-remove-renderer-and-harness/`](007-remove-renderer-and-harness/) | 3 | Delete `list-renderer.ts` and, in the same change, the `list-window` lane, the ratchet, the fixtures, the constructed scenarios, the bench entry, the replay claims and the unit specs | **Planned — blocked on `006` having SHIPPED, not merely merged.** The irreversible step | 0/6 |
| 4 | [`008-docs-and-release/`](008-docs-and-release/) | 1 | README, changelog with the rollback sentence, and the release that carries the removal | **Planned — blocked on `007`** | 0/5 |

**Every child now carries its own `goal.md`**, written 2026-09-04. The parent's binding table points
at all four, and each one's completion criteria are checkable without opening another file.

### 3.1 Handoffs, and what each one actually requires

| From | To | The gate |
|---|---|---|
| — | `005` | Nothing. It runs first and it is read-only |
| `005` | `006` | The migration target is decided **and the data-loss check has run**, so the migration knows what it preserves and what it drops |
| `006` | `007` | Existing list views migrate and no surface offers list **on a released build**, plus one operator report. `006` may ship on its own; `007` should not ride the same release, because a rollback would then have to undo both |
| `007` | `008` | The renderer and every measurement of it are gone **together**, and `npm run gate` exits 0 with `list-window` absent from the lane list rather than present and skipped, read from `$?` |

<!-- /ANCHOR:now-next-later -->

---

## 4. THE FIVE SUPERSEDED CHILDREN

These belong to the ClickUp direction — the list rebuilt as a ClickUp-style grid — which the
operator replaced rather than amended. They are **marked, not deleted**: the ClickUp interaction
study and the ADRs inside them are the record of why the direction changed, and that is real work.

| Child | Was going to | State |
|---|---|---|
| [`000-grid-contract-and-list-harness/`](000-grid-contract-and-list-harness/) | Declare a grid contract and build a harness that could see the list | **Superseded 2026-09-04.** Cited by path from `../005-component-surface-system/007-architecture-research/harvest.md`, which is why the live children start at `005` |
| [`001-list-grid-structure/`](001-list-grid-structure/) | Rebuild the list on the grid's DOM | **Superseded 2026-09-04** |
| [`002-clickup-chrome/`](002-clickup-chrome/) | Give the rebuilt list ClickUp's own chrome | **Superseded 2026-09-04** |
| [`003-group-affordances-and-selection/`](003-group-affordances-and-selection/) | Per-group create affordance and selection semantics | **Superseded 2026-09-04** |
| [`004-mobile-and-live-verification/`](004-mobile-and-live-verification/) | Verify the converted list on a phone and against the running app | **Superseded 2026-09-04** |

**They are not validated as part of the deprecation's progress and their criteria count into no
figure.** Each carries a `goal.md` that says so in its own directive rather than presenting itself
as work that has stalled.

**The live children are numbered from `005`, not `001`.** Reusing `000`-`004` would silently
repoint every inbound citation at a different document — including the one above, which names
`000-grid-contract-and-list-harness/plan.md` by path.

---

## 5. WHERE THIS PACKET REACHES INTO `005-component-surface-system`

Three points, and none of them is a merge of the two packets.

| Point | Direction | What it means |
|---|---|---|
| `033-list-virtualisation` | This packet closes it | REQ-007. It shipped real measured work — a windowed list at 48.4ms / 3,000 rows on the bench — against a view being removed. Closing it is right; deleting the measurements would lose the evidence that the freeze was real |
| `024-list-view-freeze` | This packet closes it | REQ-007. Its own AC-6 already reads **NOT MET** and its exit signal was reassigned to `028-remaining-freezes`. It is closed against this decision rather than left rotting |
| `044-phone-sheet-alignment` | It asserts, this packet performs | `044`'s D5: **List view** leaving the Add view picker is `006-hide-and-migrate`'s removal. `044` owns the picker's shape and the assertion that the row is gone. Neither blocks the other's start |

**`030-gallery-view-deprecation` is the precedent, not a dependency.** Its own deprecation is
unfinished by design — `renderer-coverage.json` still pins `gallery-renderer.ts`, and
`toolbar-renderer.ts` still renders gallery when a view already is one. That is withdrawal without
deletion working as intended, and it is the reminder that `007` is the only step here that actually
removes anything. The two deprecations must not ship in one release: bundling them makes one
rollback undo both.

---

## 6. THE TRAPS THAT OUTRANK THE REST

1. **A persisted union value is not a code symbol.** `src/data/types.ts:317` is written into vault
   files. `030` hit this exactly and answered it by withdrawing from the pickers while keeping the
   value renderable, then migrating on open. Deleting first is the one move that costs a user their
   database.
2. **A skipped lane reads green forever.** `list-window` is removed, not skipped, and the lane count
   in `tools/gate.mjs` is the evidence either way.
3. **`card-field-renderer.ts` is shared.** The board and gallery cards use it. Only the list's use
   is removed, and the two card families must render identically before and after, measured on
   captures.
4. **The coverage ratchet fails closed on a decrease.** That is what makes an accidental drop
   visible and a deliberate one a decision. Lower it with the reason beside the number, never as a
   side effect — `030`'s REQ-004, restated because the trap already caught that packet once.
5. **The rollback sentence is counter-intuitive and must be stated.** Reverting the removal brings
   back the renderer; it does **not** turn migrated views back into lists. Those are tables
   permanently.

---

<!-- ANCHOR:milestones-targets -->
## 7. MILESTONES

| Milestone | Closing condition | State |
|---|---|---|
| The audit is trustworthy | `006` can implement the migration without reading a source file the audit did not name, and `007` can remove the measurement surface without finding one it missed | Not started |
| Nobody new reaches the list | No picker offers list to a database that is not already one, on a released build | Not started |
| Nobody old loses a database | A vault carrying a list view opens it as a table with the same columns, once, with a notice | Not started |
| The gate stops measuring a ghost | `npm run gate` exits 0 with `list-window` absent rather than skipped, read from `$?` | Not started |
| The operator says so | The operator opens a vault that had a list view and reports it migrated rather than broken | **The only closing condition. Nothing in this repository can stand in for it** |
<!-- /ANCHOR:milestones-targets -->

---

<!-- ANCHOR:dependencies -->
## 8. DEPENDENCIES

| Type | Item | Impact | What it means here |
|---|---|---|---|
| Internal | `005` -> `006` -> `007` -> `008` | H | The order is the packet's only real dependency chain, and it is not negotiable |
| Internal | `006` shipped in a release | H | `007` is irreversible and does not start on a merge, only on a release that is migrating real vaults |
| Repo | `styles.css` serialized lane | M | One phase holds it. `007` takes it once and releases it once |
| Repo | `card-field-renderer.ts` | H | Shared with the board and gallery cards. Out of scope as a whole; only the list's use is removed |
| Repo | `renderer-coverage.json` ratchet | M | Fails closed on a decrease. Lowering it is a decision with the reason beside the number, never a side effect |
| Cross-packet | `../005-component-surface-system/044-phone-sheet-alignment` | L | `044` asserts List view has left the Add view picker; `006-hide-and-migrate` performs the removal. Neither blocks the other's start |
| Cross-packet | `../005-component-surface-system/033-list-virtualisation`, `../005-component-surface-system/024-list-view-freeze` | L | REQ-007 closes both against this decision |
| Cross-packet | `../005-component-surface-system/030-gallery-view-deprecation` | L | Precedent, not a dependency. The two deprecations must not ship in one release |
| External | The operator | H | The only closing condition. Nothing in this repository can stand in for a vault that had a list view opening as a table |
<!-- /ANCHOR:dependencies -->
