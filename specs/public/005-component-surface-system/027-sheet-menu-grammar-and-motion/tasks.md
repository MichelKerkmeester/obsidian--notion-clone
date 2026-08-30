---
title: "Task Breakdown: Sheet Menu Grammar and Motion"
description: "Every task closed on a number that was read or a command whose exit status was read, except the one the folder itself leaves open."
trigger_phrases:
  - "027 sheet menu grammar tasks"
  - "sheet row grammar task breakdown"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Sheet Menu Grammar and Motion

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**This phase has shipped in the working tree, verified, not committed, not operator-confirmed**
(`implementation-summary.md`). Every task below is closed on the evidence `spec.md`,
`acceptance-criteria.md` and `implementation-summary.md` already record, except the one the folder
itself leaves open.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

- [x] **T1** Acquire the css lane — `tools/lane/css-lane.json`.
      *Closed on:* acquired `2026-08-30T15:21:50.568Z` at hash `e92c9f98803f`.
- [x] **T2** Establish why the shared row did not reach this surface.
      *Closed on:* `verify-placement.mjs` loaded `styles.css` alone, so an undeclared
      `justify-content` computed to `flex-start` in the harness and to `center` on a device
      (`spec.md` §1).

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

- [x] **T3** Load Obsidian's `button` rule verbatim in the harness, on all 17 pages — the harness
      repair `spec.md` §4 calls the permanent change.
- [x] **T4** State `justify-content: flex-start` on `.db-menu-item.db-menu-item` — AC-1, AC-2, AC-3.
      *Closed on:* column menu **14 → 1** across 18 rows; Add-view **6 → 1** across 8 rows.
- [x] **T5** Add the divider hairline, gated on `:has(+ .db-menu-item)`, inset to the label column
      via `--db-menu-divider-inset` — AC-5, AC-6.
      *Closed on:* **12/12** between neighbours, **0/5** trailing; divider x matches label x.
- [x] **T6** Give the sheet presentation a doubled-class `z-index` rule so a submenu outranks its
      sheet and backdrop on specificity, not source position — AC-8.
      *Closed on:* submenu **110 → 1000** against a 999 backdrop; the document paints the submenu's
      own content instead of the parent row beneath it.
- [x] **T7** Pin `overflow-x: hidden !important` on `.db-mobile-bottom-sheet` — AC-9.
      *Closed on:* `auto` → `hidden`; a 390px label truncates inside a 389px box instead of
      scrolling sideways.
- [x] **T8** Wire drag-to-dismiss in the positioner through the overlay stack, last-wins per panel —
      AC-11.
      *Closed on:* transform `none`, sheet still open → `matrix(1, 0, 0, 1, 0, 40)`, dismissed.
- [x] **T9** Land `playSheetEntrance`: commit the start state by reading a layout property, then
      flip synchronously; move the transition onto `.is-visible` — AC-12, AC-13, AC-14.
      *Closed on:* zero animation objects ever existed → 477px → 313px at 60ms → 0 at 460ms.
- [x] **T10** Keep the entrance a transition, never an animation, so an inline drag transform
      outranks it mid-flight — AC-15.
      *Closed on:* a 30px drag begun mid-entrance puts the sheet at exactly 30px, the finger's own
      offset.
- [x] **T11** Give reduced motion a rest state on the sheet and the backdrop — AC-16.
      *Closed on:* two harness pages were missing `reducedMotion: "reduce"`; both fixed.
- [x] **T12** Add the row-grammar and entrance checks to `verify-placement.mjs` (16 checks across
      two new pages) and export `ColumnMenu` from the bundle.
- [x] **T13** Add the `chrome-owned-menu-sheet` screenshot scenario, with its own note on what it
      proves and does not.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T14** Prove the fix with a negative control: revert it and re-run.
      *Closed on:* all 16 new checks went red, and the same revert turned **5 checks written by
      earlier phases** red too — 011's own alignment checks and both Add-view left-edge checks
      (`spec.md` §1, `acceptance-criteria.md` §4).
- [x] **T15** Run the whole gate from the final state, exit codes read without a pipe.
      *Closed on:* `tsc` exit 0; vitest **444 passed**; placement **202/206**, 4 declared reds
      (baseline 186/190); screenshots **228 current**, none blank or theme-identical (baseline 224);
      evidence **8/8**; gate **13 of 14 green** — the one red is `comments`, owned by another
      agent's untracked files.
- [x] **T16** Release the css lane with its note.
      *Closed on:* released `2026-08-30T15:47:23.920Z` at hash `0fe11f17f45a`, recapture and gate
      numbers recorded in `tools/lane/css-lane.json`.
- [ ] **T17** Operator opens the column menu on their phone, tracks one left edge down it, taps
      `Change type…` and gets a submenu.
      *Not closed.* `goal.md`'s own completion criteria leave this item unchecked; `spec.md` and
      `implementation-summary.md` both state the phase is shipped and verified but not
      operator-confirmed and not committed.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

13 of 14 measurable criteria in `goal.md` are met; the 14th — operator confirmation on a phone — is
open. Traced in `acceptance-criteria.md` (AC-1 through AC-16) and `implementation-summary.md`.

- Row grammar: column menu and Add-view sheet both hold exactly 1 distinct label x-position.
- Dividers: adjacent rows carry a hairline; a row ending a group carries none.
- A row that opens a submenu carries a chevron and `aria-haspopup`; a row that acts carries neither.
- A submenu paints in front of its sheet and backdrop.
- A sheet scrolls on one axis only, and stops at 90% of the screen.
- The Add-view sheet follows a drag on its grab bar and dismisses past the threshold.
- The sheet entrance runs — 477px to 0 over the shared duration — and a thumb can take it over
  mid-flight.
- Reduced motion lands the sheet at rest, backdrop included.
- **Not met:** operator confirmation on a phone.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`implementation-summary.md`](implementation-summary.md) · [`acceptance-criteria.md`](acceptance-criteria.md) · [`goal.md`](goal.md)
- [`../spec.md`](../spec.md)
- [`../011-mobile-menu-presentation/spec.md`](../011-mobile-menu-presentation/spec.md)
- [`../013-add-view-sheet/spec.md`](../013-add-view-sheet/spec.md)

<!-- /ANCHOR:cross-refs -->
