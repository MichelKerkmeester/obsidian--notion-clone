---
title: "Goal: Notion Calendar Refinement"
description: "The durable directive for refining the Anytype-parity calendar against the Notion screen harvest, and the criteria that decide when it is done."
trigger_phrases:
  - "060 goal"
  - "notion calendar refinement goal"
  - "all-day strip range string"
  - "notion vs anytype calendar goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/060-notion-calendar-refinement"
    last_updated_at: "2026-09-06T16:45:00Z"
    last_updated_by: "opus-synthesis"
    recent_action: "Opened the packet from the calendar Notion loop, reconciled against the landed rebuild"
    next_safe_action: "Prove C1 and C2 red on today's tree, then land T002 and T003"
    blockers:
      - "ADR-006 and ADR-007 are Proposed and belong to surfaces this packet does not own"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-mini-calendar-renderer.ts"
      - "styles.css"
      - "specs/005-component-surface-system/057-calendar-anytype-parity/notion-screens-digest.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-060-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Which chrome does a phone date-edit popover take, a popover or the 044 sheet"
      - "Which of Notion's three mutually contradictory range presentations should a range picker adopt, if any"
    answered_questions:
      - "Week start is settled: the operator ruled Monday and it landed; Notion's Sunday is declined on the record"
      - "Four of the research loop's six ranked rows closed on main while the loop ran and are verification rows here, not tasks"
---
# Goal: Notion Calendar Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Carry the two calendar refinements the Notion harvest still leaves standing on today's tree — the week and day all-day strip's inline start-end date string, and the date picker's unpinned day-cell touch floors — and record every Notion-versus-Anytype conflict the harvest named without overturning one landed ruling.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Notion is additive.** Anytype parity stays the default for this surface (`005` D15, `057` ADR-004, `roadmap.md` §7.12). A Notion finding may add a criterion, a task or an ADR; it may not un-tick a measured row or rewrite a ruling. |
| D2 | **The digest is the only Notion source.** `057/notion-screens-digest.md` carries all 40 screens; the research loop that produced this packet ran on GLM 5.3 flash, which cannot open an image, so no capture was read directly and none may be cited here as if it were. |
| D3 | **Every red-first value in this packet was re-measured against `main` at `3e1c3c65`, re-derived after the rebase moved the first read's anchors, not carried from the loop.** The calendar rebuild (`b00de6d2`, `093751d8`, `dcf025fc`) landed while the loop ran and closed four of its six ranked rows. A research value the rebuild closed becomes a verification row here, never a task. |
| D4 | **Two legs, and no more.** The all-day strip's range string (REQ-001) and the mini-calendar day-cell touch floors (REQ-002) are the whole code scope. Everything else the loop found is already shipped, belongs to another surface's owner, or is a decision for the operator. |
| D5 | **A conflict is recorded, not resolved.** Where Notion contradicts a landed Anytype ruling, `decision-record.md` names both readings and the ruling stands. Where a surface this packet does not own is implicated, the ADR is Proposed and routed by name. |

### Operator copy

The operator holds this directive as the session objective, and that copy is what
judges completion. Whenever anything above the log changes, resend the full text of
this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] **C1 — The inline start-end date string is gone from every in-grid calendar surface.** A constructed render of the week scale carrying one all-day event whose `endDateKey > startDateKey` yields **0** `.db-calendar-month-dates` elements inside `.db-calendar-week-allday-cols`, on the desktop and the phone profile alike. The dates survive where Notion also keeps them out of the grid: the chip's own `title` tooltip (`getSegmentTitle`) and the day and overflow popovers. Observed red on `3e1c3c65` (reconfirmed on the implementation tree `e5830232`): the string rendered, emitted at `calendar-renderer.ts:862-864`. **Met**: the emission is deleted; a constructed render in `calendar-renderer.test.ts` reads 0, and the tooltip still carries the range. The flex band-aid at (then) `:17381-17383` was NOT retired — it never bounded this producer (see `implementation-summary.md`'s T004 finding) and still bounds the day popover, the overflow popover and the drag ghost, all unchanged.
- [x] **C2 — Every date-picker day cell clears its touch floor.** `.db-calendar-mini-day` reads a hit target of at least **44 CSS px** in the phone profile and at least **28 px** under `(pointer: coarse)`, pinned in `calendar-pinned-values.test.ts` with a negative control that goes red when the floor is reverted. Observed red on `3e1c3c65` (reconfirmed on `e5830232`): `min-height: 34px` (styles.css toolbar variant) and `min-height: 28px` in the date-edit popover variant, with no `mini-*` selector carrying a touch floor anywhere in the stylesheet. **Met**: one shared `.is-phone` rule lifts both variants to 44px; the 28px coarse-pointer floor needed no new rule since both unconditional bases already clear it. **Correction**: this row and `acceptance-criteria.md` AC-003 describe the date-edit popover's 28px rule as sitting inside a `(hover: hover)` block — `git blame` shows it has been unconditional since `33d526f08` (2026-07-04); the observed value and the phone-floor gap are unaffected, only that framing was wrong. **Second correction, at landing**: the floor alone made the seven-column grid want 308px inside two 252px hosts, so the toolbar popover spilled its last column past its border and the date-edit popover clipped Sunday — observed on the recaptured phone images. A second rule widens both hosts to 332px; a fourth pin asserts that width, with deleting the rule and narrowing it to 300px as its two negative controls.
- [x] **C3 — Every Notion-versus-Anytype conflict the harvest named carries an ADR that leaves the landed ruling standing.** `decision-record.md` holds one ADR per conflict, each citing the Notion screen id and our `file:line` for both readings, and no ADR un-ticks a `Met` row in `057/acceptance-criteria.md`. Seven ADRs exist (`decision-record.md`, unchanged by this leg); `057/acceptance-criteria.md` still reads 13 `Met` of 15, reconfirmed on `e5830232`.
- [x] **C4 — The four research rows the rebuild closed are recorded as verification, not as work.** `+N more` band (`057` G5/G8), the toolbar's segmented control (`057` G13), the unscheduled chip's 44px floor and the Monday week start (`057` G7) each carry the `main`-side evidence that closed them. All four re-confirmed on `e5830232`: `.db-calendar-more-events`, `.db-calendar-scale-button`, `.db-calendar-unscheduled-chip` and `getLocaleWeekStartsOn`'s Monday default all still read as `acceptance-criteria.md` section 3 describes.
- [x] **C5 — Every criterion and ADR cites a Notion screen id and our `file:line`, and the loop that produced them stays in the packet.** `057/research/research.md`, `findings-registry.json`, `deep-research-state.jsonl` and `orchestration-summary.json` are committed beside this packet. The lineage tree under `057/research/lineages/` - ledgers, deltas and the five iteration narratives - stays on disk untracked under this repo's `specs/**/research/**/lineages/` ignore rule, the same convention `036/goal.md` records. All four files confirmed tracked (`git ls-files`); the ignore rule confirmed matching the lineages directory.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Research loop | Done | `057/research/research.md`, 5/5 iterations, `stopReason maxIterationsReached`, lineage `glm-devpass-calendar` |
| Reconciliation against `main` | Done | Re-read at `3e1c3c65` after the rebase: four of six ranked rows already closed, two still red |
| C1 red-first proof | Done | `calendar-renderer.test.ts`, reconfirmed on `e5830232` |
| C2 red-first proof | Done | `calendar-pinned-values.test.ts`, reconfirmed on `e5830232` |
| Code legs | Done | T003 (range-string removal), T005 (touch floors) |
| Device checks D1-D4 | Pending | Operator; never ticked here |

### Deviations and findings

| Item | Note |
|------|------|
| The loop's rank-1 row shrank between its writing and this packet | The research read the *month grid* as the offender. `main`'s P0-3 rebuild had already made every month chip one-chip-per-covered-day with no inline range (`calendar-renderer.ts:417-425`, comment: *"No date-range text renders in the grid"*), so the finding now lands on the one in-grid multi-day bar that survives — the week and day all-day strip. The evidence is unchanged; the target moved. |
| The loop's rank-6 row was decided before this packet opened | `getLocaleWeekStartsOn` returns Monday unconditionally for an unset config (`src/data/calendar-date-time.ts:172-180`), under `057` ADR-007. The loop's contribution — that the cost is symmetric, because we shipped Notion's Sunday before the flip — arrived after the ruling and is recorded in ADR-002 as evidence, not as a reopening. |
| One lineage, one model | The fan-out ran a single GLM lineage, so no cross-reader disagreement was available to adjudicate. Every adoption-grade row above was independently re-verified against the tree before it was written here. |
<!-- /ANCHOR:log -->
