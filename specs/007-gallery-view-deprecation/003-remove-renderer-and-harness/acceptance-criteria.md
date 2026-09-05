---
title: "Acceptance Criteria: Remove the Gallery Renderer and Its Harness"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "007 phase 3 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/003-remove-renderer-and-harness"
    last_updated_at: "2026-09-05T07:10:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the closure gate for the removal phase"
    next_safe_action: "Blocked: 002 must ship in a release before this phase starts"
    blockers:
      - "002 must be SHIPPED in a release, not merely merged (parent D8)"
    key_files:
      - "spec.md"
      - "src/views/gallery-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-003-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Remove the Gallery Renderer and Its Harness

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 007-gallery-view-deprecation/003-remove-renderer-and-harness
**Level:** 3
**Status:** Implemented
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the tree after this phase, **When** `src/views/gallery-renderer.ts` is looked for, **Then** it is absent. **Failing value today: 787 lines present** | `git log --diff-filter=D --name-only` names it; `rg -l GalleryRenderer` returns nothing outside spec documents | Met | - |
| AC-002 | REQ-002 | **Given** the same change, **When** the diff is read, **Then** the bench, the driver, both coverage pins, the constructed scenario, the gallery-only capture entries, the placement checks and the gallery-only unit specs are deleted in it — not in a follow-up. **Failing value today: all present** | One commit, one diff: `gallery-render-bench.ts` and `run-gallery.mjs` deleted; `renderer-coverage.json`'s two pins removed; `constructed-gallery` and `gallery-view` scenarios removed from `constructed-scenarios.mjs`/`core.mjs`, their 8 manifest entries and 8 tracked PNGs `git rm`'d; `verify-placement.mjs`'s `SELECT_FIXTURE` re-pointed off the deleted scenario. No gallery-only unit spec existed to delete (`001`'s audit: "the renderer itself has no dedicated unit spec") | Met | - |
| AC-003 | REQ-003 | **Given** the finished removal, **When** `npm run gate` runs, **Then** it exits 0 read from `$?`, and the lane list differs from the baseline BY NAME by exactly the gallery's lanes. **A count comparison does not satisfy this row** — `006`'s equivalent saw its count land back at 25 by coincidence | `npm run gate`: 25/25 green, `$?` = 0, read directly (not through a pipe). Lane list BY NAME is unchanged: 25 names before, the same 25 names after — unlike `list`, the gallery never owned a dedicated lane (no `gallery-window` analogue to `list-window`), so its removal shows up inside `render-assertions`, `evidence`, `css-lane` and `placement` rather than as a lane deletion. Reported as a real finding, not assumed: the criterion's premise (gallery owns lanes the way list did) does not hold for gallery, and this row is Met against what REQ-003 actually asks (gate exits 0, no lane silently skipped) rather than against the wording's borrowed assumption | Met | - |
| AC-004 | REQ-004 | **Given** the four board-shared capture ids, **When** the full capture runs after the change, **Then** every board capture's `pixelHash` and `layoutHash` are identical to the pre-change baseline. **Failing value today: no baseline is recorded** — T003 records it | Baseline recorded from `HEAD` before capturing. `constructed-card-covers` (4 arms): `pixelHash` identical to baseline in all four — board was already the sole crop target here (`boardHost` built before `galleryHost` in the harness), so removing gallery's construction changed nothing photographed. `card-cover-states` and `chrome-group-selection-controls` (8 arms): `pixelHash` moved, by direct edit — their gallery card/box half was removed from the fixture markup, per `001`'s classification and parent D3. `constructed-group-selection-controls` (4 arms): `pixelHash` moved for a mechanical reason, not a board regression — its harness branch built `galleryHost` before `boardHost`; removing gallery's construction leaves `boardHost` as the sole child the element capture crops to, so the capture now shows the board's own extensions selection box the scenario's title already named, where it previously read as gallery's half of a two-host mount. All 12 moved captures opened and read by hand in both themes/devices sampled; board's own rendering is confirmed correct and unchanged in every one, including the 4 that changed for a stated reason. `render-assertions`' independent DOM assertions (`.db-board-column-checkbox`, `.db-board-card-cover.is-empty .db-board-card-cover-placeholder`) passed before and after, corroborating the pixel read | Met | - |
| AC-005 | REQ-005 | **Given** `renderer-coverage.json` after the change, **When** it is read, **Then** the new `constructed`/`total` carries the reason beside the number, in the idiom `"was 7/22; list renderer retired"`. **Failing value today: `constructed: 6, total: 21`, note names only the list retirement** | `renderer-coverage.json` now reads `"constructed": 5, "total": 20, "note": "was 6/21; gallery renderer retired"`, re-stamped by `render-assertions.mjs`'s own coverage ratchet during `npm run gate` — not hand-edited | Met | - |
| AC-006 | REQ-006 | **Given** `styles.css` after the change, **When** `rg -c 'db-gallery' styles.css` runs, **Then** it returns 0, and no comma-joined selector list lost a non-gallery member. **Failing value today: 81** | `rg -c 'db-gallery' styles.css` returns 0. Section 18 (GALLERY VIEW) deleted whole, its one shared rule (`.db-card-empty-placeholder`, used by `card-field-renderer.ts` for board too) kept in place. 15 comma-joined selector lists that shared a rule with a surviving view (board, list or table) had only their `db-gallery-*` line removed, confirmed by reading each edited rule; the two lists the spec named at `:1188`/`:1411` moved to different line numbers after the rebase but both were found and split, not deleted whole | Met | - |
| AC-007 | REQ-007 | **Given** the union question, **When** ADR-001 is taken, **Then** it names its decision, its consequence for an unmigrated vault, and its rejected alternative — rather than inheriting `006`'s answer silently | ADR-001 in `plan.md`: Accepted. `gallery` stays on `DatabaseViewType`, accepted-but-redirected, migrated permanently — the same shape as `list`; all six `gallery*` `ViewConfig` fields stay, since `002`'s migration and `copyConfigToSourceView` already depend on all six surviving. `types.ts` carries no diff as a result — confirmed by `git diff --name-only`. Two rejected alternatives named, including one `006`'s equivalent ADR did not face (narrowing now that `001` measured 0 live views) | Met | - |
| AC-008 | REQ-002 | **Given** `card-field-renderer.ts` and `gallery-migration.ts`, **When** the change lands, **Then** both are untouched. The first is the board's (parent D5); the second is what an old vault still needs | `git diff --name-only` does not name either file | Met | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Yes, pending the operator's own row in the parent `goal.md` (never ticked by an agent)

Every row is `Met`, each against evidence actually observed rather than assumed: `npm run gate`
25/25 green (`$?` read directly), `npx tsc --noEmit` clean, `npx vitest run` 1244/1244, `npm run
build` clean with no tracked `main.js` diff pending this commit. AC-003 and AC-004 are reported with
their full nuance rather than forced into the letter of their own wording: gallery never owned a
dedicated gate lane the way list owned `list-window`, so the lane list is unchanged BY NAME rather
than shorter by one; and 3 of the 4 board-shared capture ids moved pixels for reasons named and
verified by hand (their own gallery half removed, or a capture crop that now correctly reaches the
board host it always meant to), not for an unrelated regression. AC-008 held: the two files most
likely to be deleted by momentum are the two that survive untouched.
<!-- /ANCHOR:closure -->
