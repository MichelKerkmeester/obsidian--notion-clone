---
title: "Implementation Summary: Record Open Target"
description: "Two of this phase's five acceptance items shipped inside another phase's lane hold and were never journaled here; the setting, the resolver and every measurement remain unstarted."
trigger_phrases:
  - "006 record open summary"
  - "open opens the note"
  - "peek z-index 998 retired"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/006-record-open-target"
    last_updated_at: "2026-08-30T18:40:00Z"
    last_updated_by: "summary-author"
    recent_action: "Found shipped: desktop Open opens the note and the peek left z-index 998"
    next_safe_action: "Take the target-policy decision with the operator; no further code before it"
    blockers:
      - "Depends on 003-mobile-sheet-presentation for the phone answer"
      - "T5, the target-policy decision, is unmade and gates every remaining task"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-006"
      parent_session_id: null
    completion_pct: 43
    open_questions:
      - "Side panel, full-page modal, or both behind the setting"
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 006-record-open-target |
| **Shipped** | 2026-08-29 |
| **Level** | 3 |
| **Status** | In Progress |
| **State** | Two mechanisms are in the tree, both landed under another phase's lane hold. Nothing has been measured, no setting exists, and the decision that gates the phase is unmade |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

**This phase was recorded as not started, and that is wrong.** `roadmap.md` §5 calls it "genuinely
not started" and §5.1 grades it `Planned — accurate` on the evidence "No lane activity". The lane
evidence is right and the conclusion drawn from it is not: commit `2babab2`, *"make Open open the
note"*, shipped two of this phase's five acceptance items on 2026-08-29, and its message names this
phase's reasoning almost line for line.

| # | Change | The acceptance item it answers |
|---|---|---|
| 1 | The table's desktop Open calls `this.dataSource.openNote(row.file)` instead of `openTableRecordPeek` (`src/views/database-view.ts:8494-8496`) | *"Activating Open produces a surface containing the note's rendered body, not a property list."* Answered on desktop, by opening the real note |
| 2 | The peek panel's hand-picked `z-index: 998` became `z-index: var(--db-layer-panel, 50)` (`styles.css:18964`, in the rule opening at `:18954`) | *"The peek's layer sits inside the token scale; a dropdown opened inside it paints above it."* The literal that beat `--db-layer-popover: 100` and `--db-layer-submenu: 110` is gone |

The peek module was not retired. It stays on the keyboard path it already had —
`openTableRecordPeek` is still called from the `Mod+Enter` branch at
`src/views/database-view.ts:1740-1758` — as its own affordance rather than as an impostor wearing
Open's label.

### What did not ship, and none of it is incidental

| Requirement | State on this tree |
|---|---|
| REQ-004, the setting | **Absent.** `PluginSettings` (`src/data/types.ts:636-658`) has no open-target field. The commit that shipped the two items above says so itself: *"Not done here: the phase asks for this to be a setting rather than a policy"* |
| REQ-001, the resolver | **Absent.** The surface is still decided by a hardcoded `isTouchDevice(td)` branch at `src/views/database-view.ts:8494`, which T11 exists to retire |
| REQ-007, surviving the view | **Unchanged.** `src/data/data-source.ts:425` is still `getLeaf(false)`, which reuses the active leaf and navigates the database view away. A target that replaces the view does not survive it |
| REQ-005, the phone answer | **Unchanged**, and blocked on `003` |
| REQ-006, retiring the peek | **Not done**, correctly — T15 is blocked until five criteria hold the peek's *before* numbers, and none has been taken |

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/database-view.ts` | Modified | Desktop Open opens the note; touch keeps the editable detail panel |
| `styles.css` | Modified | The peek takes the panel layer instead of a literal outside the scale |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

**It was delivered by someone else, under a lane hold that did not cover it.** `2babab2` is dated
2026-08-29 21:40:29 +0200, which is 19:40:29Z. At that instant `tools/lane/css-lane.json` records
the stylesheet lane held by **`002-properties-panel`**, acquired 19:34:47Z and released 21:25:37Z.
None of the nine lane notes in that hold — sheet portal, phone list, list card stacking,
reduced-motion, row-state cluster — mentions the peek, its layer, or the Open affordance.

This is the pattern `roadmap.md` §6 already named twice and decision **D7** states outright: *a lane
hold permits editing a file, it grants no scope*. Report 7 and report 16 both landed this way and
each needed a phase invented afterwards. This is the third instance, and unlike those two it landed
inside a phase that already existed and was actively recorded as untouched.

**Nothing was measured.** No harness renders this phase's subject. `verify-placement.mjs` was run
from the final state and **0 of its 223 checks** mention the peek, the Open path, or a layer
comparison. There is no before number for either shipped item and no negative control.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Desktop Open opens the note; touch keeps the detail panel | Four affordances shared one icon and one label and three already opened the page. A control that lies about its own label is worse than a missing feature. Touch keeps the panel because the peek's dismiss lifecycle assumes a pointer |
| Keep the peek on the keyboard path rather than deleting it | A side-by-side read is useful; it just is not what "Open" says. Retiring it is T15's job and T15 is blocked until the criteria hold its before numbers |
| Bind the peek to `--db-layer-panel`, the tier its sibling already uses | The sibling detail panel documents having fixed this exact defect. A second hand-picked number would repeat it |
| Do not add the setting in the same change | The target policy is a product surface and the choice is the operator's. T5 says no code before the decision closes, and the decision is still open |
| Record this phase as In Progress rather than writing the two items off as another phase's | The work answers this phase's acceptance items and cites this phase's reasoning. Leaving it uncredited is how `roadmap.md` came to grade a phase Planned over shipped code |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

Read from the final state on 2026-08-30. Exit statuses read from `$?` directly, never through a pipe.

| Check | Result |
|---|---|
| `npx vitest run` | **450 passed, 59 files, exit 0** — none of them asserts this phase's subject |
| `node tools/storybook/verify-placement.mjs` | **218/223, 5 red for a declared reason, exit 0**. **0 checks** measure the peek, the Open path, or a layer comparison |
| `node tools/live/evidence.mjs --check-all` | **9 of 9 artefacts still describe this tree, exit 0**. None of the nine measures this phase |

### Every criterion, and why none is Met

All 13 rows in `acceptance-criteria.md` remain `Unmet`, and **none is marked Met here.** Two of them
now describe a tree that no longer exists, which is a different problem from being unmet:

- **AC-006** reads *"returns the peek — `z-index: 998` (`styles.css:18324`)"*. That literal is gone;
  the rule now reads `z-index: var(--db-layer-panel, 50)` at `styles.css:18964`. The defect the cell
  describes is fixed and **the hit test the criterion actually specifies has never been run**, so the
  row is unmet for a new reason.
- **AC-001** reads *"the peek stringifies column values only"*. Still true of the peek, and no longer
  true of what desktop Open produces.

- **AC-007** was re-verified against the tree and **stands exactly as written**: `getLeaf(false)` at
  `src/data/data-source.ts:425`, confirmed by reading the line.
- **AC-004** and **AC-005** were re-verified and stand: `src/data/types.ts:636-658` contains no
  open-target setting, so no affordance can disagree with one.

### UNKNOWN

- **How many affordances resolve to how many surfaces today.** `spec.md` records 20 affordances
  resolving to 4 surfaces. `2babab2` moved at least one of them. The census that produced the
  original figure has never been re-run, and re-deriving it by reading call sites is the counting
  this packet's criteria banner forbids. **Settled by** driving all 20 affordances and recording the
  surface each produced — T1, which has not run.
- **Whether the layer fix works.** The literal is gone from the source. Whether a dropdown opened
  inside the peek now wins the hit test is unobserved. **Settled by** AC-006's `elementFromPoint`
  test on a harness page that has `styles.css` loaded.
- **Whether desktop Open reaches a body at all.** The note opens in a leaf, and no check reads a
  character of it. **Settled by** AC-001 — seed a body, drive Open, count the body characters
  present.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

**The decision that gates this phase is still unmade.** T5 — side panel, full page, or both behind
the setting — is an operator decision and `tasks.md` marks it *"No code before this closes"*. Code
closed before it. Two mechanisms now sit in the tree ahead of the policy that is supposed to decide
them, which constrains the decision without having been part of it.

**Zero of 22 tasks are checked**, including the two whose effects are in the tree. The checkbox
state and the working tree disagree, and the tree is the one that ships.

**The shipped half is a policy where the phase asked for a setting.** Desktop opens the note and
touch opens the panel because `isTouchDevice` says so. That is the same shape as the defect — the
surface decided by which affordance you touched — narrowed from four surfaces to two rather than
replaced by a resolver anyone can configure.

**Open still navigates the view away.** `getLeaf(false)` reuses the active leaf, so opening a record
from the table replaces the database view with the note. Acceptance asks for a target that *survives
the database view re-rendering*; this one removes the view instead. Whether that is acceptable is
part of T5's decision, not separate from it.

**`roadmap.md` §5 and §5.1 both need correcting**, and the reasoning as much as the verdict. "No
lane activity" was true and led to "not started", which was not. A phase whose work is TypeScript,
or whose stylesheet edit rides another phase's hold, leaves no trace in that journal — the same
blind spot §8 already records for `024`.

**`completion_pct: 15` is derived, not felt:** 2 of 5 acceptance bullets have a mechanism in the
tree, 0 of 13 criteria are Met, 0 of 22 tasks are closed with evidence, and the gating decision is
open. Nothing here is operator-confirmed, and per D3 only that closes anything.

<!-- /ANCHOR:limitations -->
