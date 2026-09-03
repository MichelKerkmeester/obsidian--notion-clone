---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "template"
  - "impl summary core"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-03T10:40:00Z"
    last_updated_by: "board-legs-landed"
    recent_action: "Verified legs b9e2321/a6fcd31; ticked T5-T7 and 3 goal criteria"
    next_safe_action: "Record a T1 pre-rewrite baseline, then close T1-T4 and remaining criteria"
    blockers:
      - "Not operator-confirmed: release 1.4.5 has not been cut yet"
      - "Hover, drag, drop-target and the empty-column slot are coded but depicted by no fixture"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/board-renderer-hierarchy.test.ts"
      - "styles.css"
      - "tools/screenshots/scenarios/shared.mjs"
      - "tools/screenshots/scenarios/shared.test.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "038-board-kanban-port"
      parent_session_id: null
    completion_pct: 33
    open_questions: []
    answered_questions:
      - "Card identity stays RowData.file.path throughout: no hunk in either landed commit touches drag/drop, WIP/visible-count, swimlane, summary, conditional-formatting or touch-mode identifiers (confirmed by re-reading both diffs' added lines)."
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 038-board-kanban-port |
| **Completed** | 2026-09-03 (both legs landed on `main`; not operator-confirmed) |
| **Level** | 2 |
| **Completion** | 33% — average of `tasks.md`'s 3/8 rows closed (T5-T7, 37.5%) and `goal.md`'s 2/7 non-operator criteria met (card-hierarchy match, negative control, each with a recorded red value, 28.6%). Gate and `validate.sh --strict` are true today (see Verification) but stay unticked in `goal.md` — neither has a pre-existing red on record for this packet, and this program's `scan-failing-values` check requires one for every newly ticked `goal.md` row; they are ticked in `tasks.md` (T7), which carries no such requirement. T1-T4 and the two remaining `goal.md` criteria (local extensions, drag-drop matrix) stay open because no pre-rewrite baseline was ever captured for them. |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The board's Kanban surface now carries `obsidian-pm-main`'s column and card information
hierarchy, delivered in code across two committed legs and given its `--db-*` token visual
language in the second. Card identity, drag/drop payloads, and every local extension the
reference has no equivalent for stay untouched by hunk-range inspection; hover, drag,
drop-target, and the empty-column slot are styled but not yet proven by any fixture.

### Board / Kanban Port

`b9e2321` (column and card hierarchy): rewrote `renderColumn`/`renderCard` to a status-colored
column topbar, a per-card priority strip, a parent-folder chip above the title, and select/status
fields promoted from duplicate meta rows into title-row chips, all sourced through the existing
`RowData`/`ViewConfig`/`renderCardFieldContent` pipeline — no reference field list is hardcoded.
Red-first: `board-renderer-hierarchy.test.ts` ran against the stashed, pre-rewrite renderer first
and failed 4 of 10 assertions (missing topbar, missing priority-strip/body/parent-chip, the
meta-grid field probe, and select/status chip dedup); the stash was popped and the same run went
10/10 green. Re-reading this commit's added lines confirms none of them touch drag/drop, the
path/batch-order transaction, WIP/visible counts, swimlanes, summaries, conditional formatting,
or touch-mode identifiers.

`a6fcd31` (visual language): styled the ported markup entirely in `--db-*` tokens inside the
existing board section — the topbar and priority strip get their color, a card body wrapper and
parent chip, the title line with its chips ranged right, the field grid beneath, drop-target
tints, a line-clamped card value, and a reduced-motion block. The screenshot fixture was rewritten
to mirror `renderColumn`/`renderCard` class-for-class and is now backed by a containment parity
test that walks real tag structure instead of string position; proved red first by moving the
title-row chips out of the title line while leaving them later in the document, which a
string-index check cannot see but the DOM-walk assertion catches. The column-width contract is
kept: probing the rendered column at 220/250/280/400px reads 236/266/296/416, identical to
`b9e2321` at every point.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/board-renderer.ts` | Modified | Rewrote `renderColumn`/`renderCard` hierarchy (topbar, priority strip, parent chip, title-row chips) per catalog rows 1, 2, 5, 8 |
| `src/views/board-renderer-hierarchy.test.ts` | Created | Red-first hierarchy assertions (4/10 red against the pre-rewrite renderer, 10/10 green after) |
| `styles.css` (§17 BOARD VIEW) | Modified | `--db-*` token visual language for the ported column/card hierarchy; column-width fallback reverted from a hardcoded 280px back to the resize clamp's own 220px floor |
| `tools/screenshots/scenarios/shared.mjs` | Modified | Board/mobile fixture rewritten to mirror `renderColumn`/`renderCard` class-for-class |
| `tools/screenshots/scenarios/shared.test.mjs` | Created | Containment parity test for the rewritten fixture (direct-child/sibling-order assertions) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Both legs landed as external, committed history (`b9e2321`, `a6fcd31`) before this documentation
pass; this pass is a fresh in-runtime verification against that history, not new implementation.
Re-run today, 2026-09-03: `node tools/live/evidence.mjs --check-all` reports all 16 artefacts
fresh; `node tools/live/render-assertions.mjs` (disarmed default) passes `board/file-view` and
`board/embed` on "no forced layout inside the card loop", matching the standing bound of 8 the
control has never been observed failing against. Armed (`RENDER_READ_CONTROL=per-item`), the same
two scenarios go red at 1601 layout reads against that bound, confirming the control still catches
a regression rather than passing by default; the disarmed run was repeated afterward to restamp
`renderer-coverage.json` back to its normal state. `SURFACE_PHASE=038-board-kanban-port npm run
gate` and a second bare `npm run gate` both exited 0 with 25 green / 0 red, read directly rather
than through a pipe. `board-view-desktop-light.png` was opened directly this session: every
column carries its colored topbar, every card its matching priority strip, controls row,
`Subscriptions` parent chip, title line with select/status chips ranged right, and Cost/Renews
grid, with nothing clipped, overlapped, or unstyled. The `styles.css` edit ran under the CSS lane
(`tools/lane/css-lane.json`), released at `9eb4b141471e` naming all 20 changed captures with what
each shows. This will ride release 1.4.5, pending.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Reject a hardcoded 280px column-width floor mid-session, in favor of the resize clamp's own 220px fallback | An intermediate edit on the CSS lane had introduced `flex: 0 0 var(--db-board-column-width, 280px)`, silently overriding the clamp below 280px; reverted, then probed at 220/250/280/400px and confirmed 236/266/296/416, unchanged from `b9e2321` |
| Prove the rewritten screenshot fixture with a DOM containment/sibling-order test, not a string-position check | A string-index check cannot see chips moved out of the title line while remaining later in the document; the walk-the-tag-structure assertion catches exactly that and was proven red first on that mutation |
| Leave hover, drag, drop-target and the empty-column slot unclaimed as "visually confirmed" | No screenshot fixture depicts any of the four states; both landed commits name this explicitly as owed rather than assumed, so `tasks.md` T3/T4 and the matching `goal.md` criteria stay open |
| Tick only `tasks.md` T5-T7 and the `goal.md` criteria whose own stated evidence bar was actually met | T1's pre-rewrite baseline for the ten local extensions and the drag-drop matrix was never captured in either leg (`b9e2321`'s own message says so directly); T2-T4 and the matching criteria depend on that baseline and stay open even though hunk-range inspection shows their code paths untouched |
| Arm the board/gallery layout-read negative control (`RENDER_READ_CONTROL=per-item`) rather than citing only its disarmed pass | `node tools/naming/scan-failing-values.mjs` requires every newly ticked `goal.md` row to record a red value; the armed run genuinely reddens `board/file-view` and `board/embed` at 1601 reads against the bound of 8, giving that criterion a real "moved from" number instead of only a today-passes claim |
| Leave the `goal.md` gate and `validate.sh --strict` criteria unticked even though both are true today | Neither has a pre-existing red on record for this packet (gate was already green; `validate.sh --strict` already returned `RESULT: PASSED` before either leg landed, confirmed by stashing this session's edits and re-running); ticking them would fail `scan-failing-values.mjs`'s program-wide ratchet (baseline 145, 1 unit of slack). They are ticked in `tasks.md` T7 instead, which carries no red-value requirement |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Hierarchy red-first (`board-renderer-hierarchy.test.ts`) | Red: 4/10 against the pre-rewrite renderer; green 10/10 after `b9e2321` |
| Fixture containment parity red-first | Red on a chip-nesting mutation (chips outside the title line, later in the DOM); green after the fixture rewrite in `a6fcd31` |
| Column-width contract | 220/250/280/400px probe reads 236/266/296/416, identical `b9e2321` vs `a6fcd31` |
| `tools/live/engine-parity.json` fixture differences | 65 -> 49, confirmed in the `a6fcd31` diff against `styles.css` hash `9eb4b141471e` |
| `tools/live/touch-targets.json` under-floor count | 278 -> 277, classes 35 -> 34, confirmed in the `a6fcd31` diff |
| `node tools/live/evidence.mjs --check-all` | 16/16 fresh — re-run 2026-09-03 this session |
| `node tools/live/render-assertions.mjs` (disarmed) | PASS — `board/file-view` and `board/embed` both clear "no forced layout inside the card loop"; re-run 2026-09-03 this session |
| `node tools/live/render-assertions.mjs` (armed, `RENDER_READ_CONTROL=per-item`) | RED (expected) — `board/file-view` and `board/embed` both fail at 1601 layout reads vs the bound of 8, confirming the control is armed; re-run 2026-09-03 this session |
| `SURFACE_PHASE=038-board-kanban-port npm run gate` | PASS — 25 green / 0 red, exit 0 read directly; observed 2026-09-03 this session |
| `npm run gate` (bare) | PASS — 25 green / 0 red, exit 0 read directly; observed 2026-09-03 this session |
| Screenshot capture (20 changed images named in the `9eb4b141471e` lane release) | Read per the release note; `board-view-desktop-light.png` opened directly this session and matches |
| `validate.sh --strict` | `RESULT: PASSED`, `Errors: 0`, `Warnings: 1` (pre-existing `COMPLEXITY_MATCH` note, unrelated to this pass) — observed 2026-09-03 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Hover, drag, drop-target and the empty-column slot are unproven by any fixture.** `styles.css`
   adds `.db-board-empty-slot`, drop-target tints, and a hover lift, but no screenshot fixture
   depicts any of the four states; a device read is still owed (`tasks.md` T3/T4 stay open).
2. **The local-extension re-check and the drag-drop matrix re-run were never captured.** `tasks.md`
   T1's pre-rewrite baseline for WIP/visible counts, swimlanes, summaries, conditional formatting,
   multi-select, roving keyboard, edge auto-scroll, blank-space drop, touch long-press, and
   cover-target scheme safety was never recorded, so T1-T4 and the matching `goal.md` criteria
   stay open even though neither landed commit's added lines touch those code paths.
3. **Embedded database views were not separately captured or visually confirmed** in this pass;
   only the file-view board scenario was opened directly.
4. **Not operator-confirmed.** Release 1.4.5 has not shipped and the operator has not opened a
   board on device (`tasks.md` T8, `goal.md`/`acceptance-criteria.md` AC-8) — the only row that
   can close it.
<!-- /ANCHOR:limitations -->

---
