---
title: "Goal: Board / Kanban Port"
description: "Port obsidian-pm-main's Kanban column/card hierarchy and hover/drag/drop visual language into board-renderer.ts, near one-to-one, without narrowing the local action contract."
trigger_phrases: ["038 goal", "board kanban port goal"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-03T21:00:00Z"
    last_updated_by: "board-empty-drop-language-captured"
    recent_action: "Captured empty-column/drop-language; ticked hover/drag/drop-target row"
    next_safe_action: "Record a T1 pre-rewrite baseline, then close the remaining criteria"
    blockers: []
    key_files: ["spec.md", "plan.md", "implementation-summary.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038-goal"
      parent_session_id: null
    completion_pct: 43
    open_questions: []
    answered_questions: []
---
# Goal: Board / Kanban Port

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Adopt `obsidian-pm-main`'s Kanban status-column information hierarchy and
hover/drag/drop visual language into `src/views/board-renderer.ts` near one-to-one, rewritten
through this repo's `RowData`/`ViewConfig`/action contracts, while every local extension the
reference has no equivalent for — WIP/visible counts, swimlanes, summaries, conditional
formatting, multi-select, roving keyboard, edge auto-scroll, touch, cover-target scheme safety
(report 032) — is proven unchanged, not assumed unchanged.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Rewrite, not copy. Every catalog row's disposition is `rewrite`; no reference code or CSS block is copied verbatim, so no MIT notice is owed by this phase (`../036-obsidian-pm-ui-harvest/research/research.md` "License and copy boundary"). |
| D2 | Card identity stays `RowData.file.path`. The reference's `task.id` identity is never adopted; every drag/drop payload and the batch/order transaction stays path-keyed. |
| D3 | A local extension with no reference equivalent is a requirement to preserve, not a gap to fill from the reference. Checked before and after the rewrite, per `plan.md`'s first step. |
| D4 | Shipped, verified and operator-confirmed differ. Only the third closes a row (parent `goal.md` D3). |
| D5 | A fresh reviewer verifies; the delegate order and in-runtime verification follow the parent's D14. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] The card information hierarchy (title, priority strip, chips, preview, time/tags/progress/
      people/due) matches the reference's shape on a read of paired before/after screenshots.
      **Met.** Observed red in `b9e2321`: 4 of 10 hierarchy assertions failed against the
      pre-rewrite renderer (missing topbar, priority strip/body/parent chip, meta-grid field
      probe, select/status chip dedup); green 10/10 after the rewrite. Paired screenshot read in
      `a6fcd31`'s `9eb4b141471e` lane release (`board-view`/`board-mobile`, desktop+mobile,
      light+dark, 8 captures) confirms topbar, priority strip, parent chip, title-row chips and
      field grid render correctly; `board-view-desktop-light.png` opened directly this session
      and reads clean.
- [x] Hover/drag/drop visual language (raised card, hover lift, drop-target tint, column drop
      highlight) matches the reference's language, rewritten under `--db-*` tokens in `styles.css`
      §17 BOARD VIEW. **Met for the classes the drag handlers apply.** Red to record: neither
      landed leg's fixture depicted `.db-board-empty-slot`, `.db-board-column.is-drop-target`,
      `.db-board-card.is-dragging`/`.is-drop-target`, or `.db-board-drop-indicator` — the
      screenshot corpus had zero captures of any of the four, and `board-renderer-hierarchy.test.ts`
      /`shared.test.mjs` asserted none of them either, so the styling landed with no fixture able to
      catch a class rename or a dropped rule. Closed: two new component scenarios,
      `board-empty-column` and `board-drop-language`, mirror `renderColumn`'s empty-group branch
      (`board-renderer.ts:621-630`, `EmptyStateRenderer.renderCard` under the "empty-group" reason)
      and the drag handlers' own dragstart/dragover classes (`:848` `is-dragging`, `:869-870`
      `.db-board-card`/`.db-board-column` `is-drop-target`, `:1580-1584`
      `db-board-drop-indicator`) class-for-class. `shared.test.mjs` proved this red first: the
      empty slot's icon/content order swapped, and the drop-indicator moved inside the card body
      instead of after it — both pass a naive string-position check and both failed the new
      `expectDirectChildOrder` DOM-walk assertions (`db-empty-card-content follows the preceding
      node under the empty slot: expected 0 to be greater than 1`;
      `db-board-drop-indicator is a direct child of the drop-target card: expected -1 to be
      greater than -1`); reverting the mutation returned both to green. All 8 new captures
      (`board-empty-column`/`board-drop-language`, desktop+mobile, light+dark) opened and read
      this session: the empty column shows the dashed `db-board-empty-slot` card (folder-open
      icon, "No records in this group" / "This is a valid destination for new or moved records.")
      beside a populated lane with its own count badge; the drop-language capture shows one
      column carrying its own dragover tint with a raised (`is-dragging`, reduced opacity) card
      and a tinted drop-target card carrying its before-insertion line, in every device/theme
      combination. Named in `tools/lane/css-lane.json`'s `038-board-kanban-port` release
      (styles.css untouched — no edit, only two new fixtures). The `:hover` pointer-lift rule
      (`styles.css:9257-9262`, `@media (hover: hover)`) is a real CSS pseudo-class rather than a
      class the renderer applies, so it stays outside what a static fixture can depict; that gap
      is unchanged by this pass and is not what "Not started" above was recording.
- [ ] Every local extension named in REQ-005 (WIP/visible counts, swimlanes, summaries,
      conditional formatting, multi-select, roving keyboard, edge auto-scroll, blank-space drop,
      touch long-press, cover-target scheme safety) passes the same check before and after the
      rewrite. **Not started.** Red to record: today's passing state of each, captured by `plan.md`
      step 1, before any rewrite line lands.
- [ ] Card identity, drag/drop payloads, and the path/batch-order transaction are unchanged in
      contract (REQ-003). **Not started.** Red to record: today's drag-drop matrix (same-group,
      cross-group, blank-space) run once, before the rewrite, as the baseline the post-rewrite run
      must match.
- [x] The board/gallery layout-read negative control (`tools/live/renderer-coverage.json`, the
      bound `026`/`c5566db` wired) stays armed and passing after the rewrite. **Met.** Observed
      red 2026-09-03 with the control armed (`RENDER_READ_CONTROL=per-item node
      tools/live/render-assertions.mjs`): `board/file-view` and `board/embed` both go red at 1601
      layout reads against the bound of 8, confirming the control is armed and would catch a
      regression; disarmed (default) both pass at their normal count, same armed/disarmed shape
      as before the rewrite; `renderer-coverage.json` stamped fresh in the disarmed re-run
      (`evidence --check-all`: 16/16 fresh).
- [ ] `npm run gate` exits 0, `$?` read directly. **Not started as a goal-level criterion** — no
      pre-existing red is on record for this exact check against this packet, so it is not ticked
      here per this program's `scan-failing-values` discipline, even though it is true today
      (observed directly 2026-09-03: exit 0, 25 green / 0 red, both
      `SURFACE_PHASE=038-board-kanban-port npm run gate` and bare `npm run gate` — see `tasks.md`
      T7, which this evidence closes).
- [ ] `validate.sh specs/005-component-surface-system/038-board-kanban-port --strict` reports
      Errors: 0. **Not started as a goal-level criterion** — `validate.sh --strict` already
      returned `RESULT: PASSED` before either leg landed (confirmed 2026-09-03 by stashing this
      session's edits and re-running), so there is no red to record for this exact claim; it
      remains true today (`RESULT: PASSED`, `Errors: 0`, `Warnings: 1` — pre-existing
      `COMPLEXITY_MATCH` note, unrelated to this pass) but is left unticked here for the same
      reason as the gate row above.

### Operator-only rows

- [ ] **The operator opens a board on device and confirms the rewritten card/column visual
      language and drag/drop reads correctly on their own database.** Only the operator closes
      this row; nothing in this tree can close it. Not a report-driven row — no operator report
      (29-33) named the board surface directly, so this is a proactive confirmation ask, not a
      defect closure.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Opened 2026-09-02** from `036-obsidian-pm-ui-harvest`'s "Final adoption plan" row 2
(`research/research.md` lines 394-402), which orders the board second after
`037-timeline-gantt-port`. Nothing has started; every completion row above is unticked and names
the red it is waiting to record.

**2026-09-03** — Both legs landed on `main`: `b9e2321` ports the column/card hierarchy
(red-first, 4/10 then 10/10), `a6fcd31` styles it under `--db-*` tokens (fixture containment
parity test, red-first on a nesting mutation; column-width contract kept at 236/266/296/416).
This pass re-verified both legs in-runtime and closed the card-hierarchy and negative-control
criteria above (2 of 7 non-operator criteria — each with a genuine red value: 4/10 pre-rewrite
assertions, and 1601-vs-8 with the control armed), plus `tasks.md` T5-T7 (3 of 8 rows, which
carries no red-value requirement of its own). The gate and `validate.sh --strict` criteria are
true today but stay unticked here: neither has a pre-existing red on record for this packet (gate
was already green, and `validate.sh --strict` already returned `RESULT: PASSED` before either leg
landed, confirmed by stashing this session's edits and re-running), and this program's
`scan-failing-values` check requires a recorded red for every newly ticked `goal.md` row. Local
extensions, the drag-drop matrix and hover/drag/drop-target/empty-column visuals were never
captured against a pre-rewrite baseline, so those two criteria and `tasks.md` T1-T4 stay open too;
see `implementation-summary.md` for the full verification table. This document's completion_pct
(29%) is this file's own 2/7 non-operator ratio; the packet-level figure in
`implementation-summary.md`/`spec.md` averages it against `tasks.md`'s 3/8.

**2026-09-03 (later)** — Closed the hover/drag/drop-target/empty-column half of the criterion
above that the prior pass on this date left open: two new screenshot scenarios,
`board-empty-column` and `board-drop-language`, plus new `shared.test.mjs` parity assertions,
depict `.db-board-empty-slot`, `.db-board-column.is-drop-target`, `.db-board-card.is-dragging`/
`.is-drop-target`, and `.db-board-drop-indicator` for the first time in this program's screenshot
corpus. Red recorded by mutating the fixture (empty-slot icon/content order swapped, drop-indicator
moved inside the card body) and observing the new DOM-walk assertions fail, then reverting to
green. `styles.css` untouched — no CSS edit, only two additive fixture helpers
(`boardEmptySlot`, and `dragState`/`dropPlacement`/`columnClass`/`cardRenderer` options on the
existing `boardCard`/`boardColumn`) that leave every prior scenario's markup byte-identical.
8 new captures opened and read this session across both devices and themes; named in
`tools/lane/css-lane.json`'s `038-board-kanban-port` release alongside 11 pre-existing captures
this pass did not touch, whose `layoutHash` is unchanged from the pre-recapture manifest (byte-only
encoder noise). `npm run gate`: 25 green / 0 red. This still leaves the local-extension re-check,
the drag-drop matrix baseline, and the `:hover` pointer-lift rule (a real CSS pseudo-class, not a
class a fixture can apply) unproven; `tasks.md` T1-T4 and the two remaining `goal.md` criteria stay
open for that reason.
<!-- /ANCHOR:log -->
