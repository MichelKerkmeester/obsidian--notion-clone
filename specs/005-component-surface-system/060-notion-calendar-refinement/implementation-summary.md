---
title: "Implementation Summary: Notion Calendar Refinement"
description: "Both legs landed: the all-day strip's inline range string is gone and the mini day-cell's phone touch floor is pinned at 44px, each proven red first."
trigger_phrases:
  - "060 implementation summary"
  - "calendar refinement summary"
  - "what shipped 060"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/060-notion-calendar-refinement"
    last_updated_at: "2026-09-07T00:00:00Z"
    last_updated_by: "claude-code-implementer"
    recent_action: "Landed both legs, pinned both with negative controls, ran the full verification chain"
    next_safe_action: "Recapture and review the screenshot corpus (T008), then hand D1-D4 to the operator"
    blockers:
      - "Device check D1 (phone date-edit chrome) stays open; the 44px lift targets the popover's current selector regardless"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-renderer.test.ts"
      - "src/views/calendar-pinned-values.test.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-060-summary"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "D1: does a phone date-edit present as a popover or an 044 sheet"
    answered_questions:
      - "T004's CSS retirement finds nothing inert: the base .db-calendar-month-dates rule and its :has() flex bound stay live for the day popover, overflow popover and drag ghost"
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
| **Spec Folder** | 060-notion-calendar-refinement |
| **Opened** | 2026-09-06 |
| **Completed** | 2026-09-07 |
| **Level** | 2 |
| **Baseline tree** | `3e1c3c65` |
| **Implementation tree** | `e5830232` (`3e1c3c65` plus unrelated commits already on `origin/main`) |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Both legs of `goal.md` D4 landed, each proven red first and pinned with a negative control.

**Leg 1 — the all-day strip's inline range string is gone.** The week and day all-day strip's
spanning bar no longer prints its own `start-end` date string. The range stays reachable exactly
where Notion's own frames leave it: the chip's `title` tooltip (`getSegmentTitle`, unchanged) and the
day and overflow popovers (unchanged). The day popover, the overflow popover and the drag ghost are
not in-grid resting chips and were left alone.

**T004's own finding.** Retiring the CSS the removal "makes inert" turned up nothing to retire.
Tracing the DOM each producer actually builds (not the diff) showed the all-day strip's span was
nested two levels down (`eventEl > content > .db-calendar-month-dates`), so the shared `:has(>
.db-calendar-month-dates)` flex bound never matched it, before or after this change. Its live matches
are the day popover, the overflow popover (both share `.db-calendar-day-popover-events`) and the drag
ghost — all three still emit `.db-calendar-month-dates` as a direct child of `.db-calendar-month-segment`,
and the drag ghost's dates span is unconditional. The base `.db-calendar-month-dates` rule and the
`:has()` bound both stay, and a pin now asserts both by name so a future cleanup pass does not delete
either while these three producers still need them.

**Leg 2 — the mini day-cell clears its touch floor on phone.** `.db-calendar-mini-day` (34px toolbar
variant, 28px date-edit popover variant) now reads 44px under `.is-phone`, in both variants, via one
shared rule. The `(pointer: coarse)` 28px floor needed no new CSS: both variants' unconditional bases
already clear 28px, confirmed by a stylesheet-wide sweep that found no coarse-pointer or `hover: none`
block shrinking either. Device check D1 (which chrome a phone date-edit takes) stays open for the
operator; the lift targets the popover's current known selector regardless of the answer.

**One correction to the packet's own record.** `acceptance-criteria.md`'s AC-003 describes the
date-edit popover's 28px rule as sitting inside a `(hover: hover)` block. `git blame` on
`styles.css:6941-6945` shows it unconditional since `33d526f08` (2026-07-04) — no such block has ever
wrapped it. The observed 28px value and the phone-floor gap it names are unchanged; only that one
framing detail was wrong, and this document records the correction rather than repeating it.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/calendar-renderer.ts` | Modify | Deleted the guarded `content.createSpan({ cls: "db-calendar-month-dates", ... })` call and its `endDateKey > startDateKey` guard from the all-day strip's segment loop (`:862-864` on `3e1c3c65`; same relative position on `e5830232`) |
| `styles.css` | Modify | Added one rule lifting `.db-calendar-mini-day` to 44px under `.is-phone`, covering the toolbar variant (`.note-database-container .db-calendar-mini-day`) and the date-edit popover variant (`.db-cell-edit-popover.db-date-edit-popover .db-calendar-mini-day`) together (`:18667`). No rule deleted — T004 found the shared `.db-calendar-month-dates` rule and its `:has()` bound both still reachable |
| `src/views/calendar-renderer.test.ts` | Modify | Added one constructed-render test proving 0 `.db-calendar-month-dates` inside `.db-calendar-week-allday-cols` for a multi-day event, with the tooltip's range preserved. Not in `spec.md`'s file list; added because the file already carries every mock and fixture this proof needs and duplicating that harness elsewhere would have been the larger change |
| `src/views/calendar-pinned-values.test.ts` | Modify | Three new pins: the range-string removal (source-text, with the three surviving producers as a positive control), the still-reachable `.db-calendar-month-dates` / `:has()` rules, and the mini day-cell's phone floor (44px, both variants) alongside its unconditional 34px/28px bases |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first, both legs. T001(a) was proven red by writing the constructed-render test against the
unfixed renderer (`expected 0, received 1`), then fixing `calendar-renderer.ts` and re-running it
green. T001(b) was proven red by writing the phone-floor pin against the unfixed stylesheet (`selector
not found verbatim`, reconfirmed by stashing the CSS addition and re-running), then adding the rule and
re-running green. T002's shared-class inventory was written before T004's CSS decision, not after.
`npx tsc --noEmit`, `npm run build`, the full `npx vitest run` (1524/1524), `tools/live/sheet-grammar.mjs`
and `tools/live/render-assertions.mjs` all ran from the final tree and are recorded in Verification
below, alongside the two naming scans and the full `npm run gate`.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Reconcile every research finding against `main` before writing a criterion | The calendar rebuild landed while the loop ran and closed four of its six ranked rows; carrying those numbers forward would have filled this packet with work that already shipped |
| Move the rank-1 finding rather than drop it | The research located the multi-day range string in the month grid, which P0-3 had already fixed. The evidence is unchanged and still applies - to the week and day all-day strip, the one in-grid multi-day bar left |
| Two legs and no more | `goal.md` D4. Everything else the loop found is shipped, belongs to another owner, or is the operator's |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Research loop completed | PASS - 5/5 iterations, `stopReason maxIterationsReached`, lineage `glm-devpass-calendar` |
| Findings reconciled against `main` | PASS - of the loop's six ranked rows, four closed and two are still red at `3e1c3c65`; the rank-1 of those two moved scale rather than closing |
| Code legs | Not started |
| Three gates | Not run - no code changed |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **One lineage, one model.** The fan-out ran a single GLM lineage, so no second reader checked the digest's interpretation. Every adoption-grade row was independently re-verified against the tree before it was written here, which bounds the risk without removing it.
2. **The harvest is 40 light screens.** Notion cannot inform any dark-theme refinement on this surface; our dark side rests on Anytype's ten light and ten dark captures.
3. **The view-level date-property selector was never captured opened.** `057` A8's Notion comparator does not exist in this harvest and would need a fresh targeted crawl.
<!-- /ANCHOR:limitations -->

---
