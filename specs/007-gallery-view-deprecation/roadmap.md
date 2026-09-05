---
title: "Roadmap: Gallery View Deprecation"
description: "The four children of the gallery-view retirement, what each one owns, the order that is not negotiable, and where the packet reaches into the surface-system program and into its list-view sibling."
trigger_phrases:
  - "gallery deprecation roadmap"
  - "007 roadmap"
  - "gallery view retirement order"
  - "gallery removal plan"
importance_tier: "high"
contextType: "planning"
---
# Roadmap: Gallery View Deprecation

<!-- SPECKIT_TEMPLATE_SOURCE: roadmap | v2.2 -->

> Read `spec.md` for the measured inventory that fixes the size of this retirement and `goal.md` for
> the decisions that bind it. This file answers three questions: **which child owns each move, what
> is actually true of each child today, and where this packet touches its neighbours.**

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Subject:** Note Database plugin, `specs/007-gallery-view-deprecation/`
**Status:** Opened 2026-09-05. Nothing started.
**Horizon:** Open. The packet closes on operator confirmation, not on a date.
**Owner:** Operator, with one agent per child.
**Last updated:** 2026-09-05

**Why it is a phased packet, stated with the numbers.** `recommend-level.sh --loc 1800 --files 55
--api --db --architectural` returns **Level 3, 90/100, confidence 95%** and a phase score of
**50/50**. `phase-definitions.md` §2 requires both a phase score at or above 25 **and** a level at
or above 3, scored independently; both hold, and a 45+ phase score suggests four children. That is
where the four came from — not from mirroring `006`'s count.

**What this file does not do.** It does not restate the inventory. `spec.md` §4 holds it, counted
against the tree rather than estimated, and a second copy here would drift from the first.
<!-- /ANCHOR:metadata -->

---

## 2. THE ONE-LINE REASON THIS EXISTS

`030-gallery-view-deprecation` withdrew the gallery from every picker in August and stopped there,
by design. Six months of releases have since re-proved, on every gate run, that a view nobody can
create still renders correctly.

**The operator closed the question on 2026-09-05:** *"should have been deprecated"* — retire it
completely, the way the list view is being retired in `../006-list-view-deprecation/`.

---

<!-- ANCHOR:now-next-later -->
## 3. THE FOUR CHILDREN

| # | Child | Owns | State |
|---|---|---|---|
| 1 | `001-usage-and-migration-audit` | What a live vault actually holds; every surface that accepts or mints `viewType: "gallery"`; what a board migration loses, named loss by loss; and what measures the gallery today, entry by entry | Not started |
| 2 | `002-settings-redirect-and-migrate` | The settings-load sanitizer and the `.base` importer stop accepting `gallery`; the migration runs on open in **both** hosts, once, with a notice | Not started |
| 3 | `003-remove-renderer-and-harness` | `gallery-renderer.ts` and its whole measurement surface deleted together — bench, driver, coverage pins, constructed scenario, capture entries, placement checks, unit specs and 81 `db-gallery-*` selectors | Not started |
| 4 | `004-docs-and-release` | README, CHANGELOG, closing `030`'s open rows against this retirement, and the release that carries the removal | Not started |

### 3.1 Handoffs, and what each one actually requires

**`001` → `002`: an enumeration, not an impression.** `006`'s equivalent audit found two
list-minting surfaces its own parent spec had not named. The handoff is met when every accepting or
minting surface is listed and every declared loss is named individually.

**`002` → `003`: shipped, not merged.** This is D8 and it is the one handoff that is not a
formality. A released build must carry the migration before the renderer is deleted, because an
unmigrated gallery in a vault file becomes whatever unknown-type coercion does the moment its
renderer is gone. `006` wrote the same precondition and its `007` ran while the precondition was
still unconfirmed — recorded honestly in that packet's `007/tasks.md` T001 as a gap behind the work.
This packet has that precedent in front of it.

**`003` → `004`: the gate exits 0 with lanes removed, not skipped.** A skipped lane is a gate that
passes while measuring nothing, which is the failure this whole program was rewritten around.

**`004` → done: the operator opens a migrated vault.** Nothing in this repository closes that row.

<!-- /ANCHOR:now-next-later -->

---

## 4. THE TRAPS THAT OUTRANK THE REST

**Four of the six gallery capture scenarios are shared with the board.** `card-cover-states`,
`constructed-card-covers`, `chrome-group-selection-controls` and
`constructed-group-selection-controls` mount the gallery *and* the board. Only `gallery-view` and
`constructed-gallery` are gallery-only. Deleting all 24 manifest entries would silently remove board
coverage — this is the single most likely way this packet breaks something, and `001` measures each
scenario's board contribution before `003` touches any of them.

**`card-field-renderer.ts` is shared and is not the gallery's to delete.** D5. The board uses it and
`045-board-card-properties` builds its card field list on it.

**The migration is asymmetric and always has been.** `applyGalleryMigration` is called from
`database-view.ts:11663` and from nowhere else. `embedded-database-renderer.ts` renders the gallery
with no equivalent call, so a gallery-configured codeblock renders unmigrated today. `002` either
closes it or ships the same partial state **knowingly**. Shipping it unknowingly is what `030` did.

**The union and the six `gallery*` config fields are persisted vault data.** `006`'s `007` decided
the parallel question for the list: `list` stays on `DatabaseViewType` and is migrated permanently,
rather than being removed. The same reasoning almost certainly applies, and it is still `003`'s ADR
to take rather than this file's to assume.

**`030` is a predecessor, not a parent.** D7. It is not reopened, renumbered, or grown into.

---

## 5. WHERE THIS PACKET REACHES INTO ITS NEIGHBOURS

| Neighbour | The reach |
|---|---|
| `005-component-surface-system/030-gallery-view-deprecation` | Predecessor. It performed the withdrawal; this packet performs the removal. Its open rows close against this retirement (REQ-008), the way `006`'s REQ-007 closed `033` and `024` |
| `005-component-surface-system/045-board-card-properties` | Its ADR-001 cites this packet as the reason the gallery does not share the card-properties mechanism. Nothing flows the other way: `045` is board-only and shipped |
| `005-component-surface-system` parent | `roadmap.md` §5.A and §6A record the ruling; `goal.md`'s DONE table references this packet's `goal.md` as a sibling subgoal |
| `006-list-view-deprecation` | Not a dependency — a **precedent**. Its four-child shape, its withdraw-then-migrate-then-remove order, its "removed not skipped" gate rule and its coverage-floor idiom are all borrowed deliberately. Its one open deferral, the `db-list-*` CSS sweep (its `007` T010), is the thing D6 refuses to repeat |
| The gate | `npm run gate` is 25 lanes today. This packet removes gallery measurement from several of them and must leave `$?` at 0 with the lanes gone rather than disabled |

---

<!-- ANCHOR:milestones-targets -->
## 6. MILESTONES

| Milestone | What proves it | State |
|---|---|---|
| The audit is real | `001/implementation-summary.md` names every accepting and minting surface and every declared loss individually | Not started |
| Nothing can be a gallery | A test asserting the sanitizer and the importer both refuse `gallery` | Not started |
| Nothing still is a gallery | The migration runs in both hosts, once, with a notice, and is **shipped in a release** | Not started |
| The renderer is gone | `git log --diff-filter=D` names `src/views/gallery-renderer.ts`; the gate exits 0 read from `$?` | Not started |
| The gate got smaller honestly | `renderer-coverage.json`'s new floor carries its reason beside the number | Not started |
| The user is told | README and CHANGELOG name every loss individually | Not started |
| The operator confirms | A migrated vault opens as boards and the operator says so | Not started |

<!-- /ANCHOR:milestones-targets -->

---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

- **Inbound:** none. `030`'s withdrawal already shipped, so `001` can start today.
- **Internal:** strictly serial, `001` → `002` → `003` → `004`. The `002` → `003` edge is a release
  boundary, not a merge boundary.
- **Outbound:** the release cut is the orchestrator's. `006`'s `008` already owes one (0.0.23), and
  this packet's removal is a candidate for a later one rather than a claim on that cut.
<!-- /ANCHOR:dependencies -->
