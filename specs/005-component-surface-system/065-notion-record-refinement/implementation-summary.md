---
title: "Implementation Summary: Notion Record Refinement"
description: "Placeholder. The packet was opened on 2026-09-06 from the Notion record research loop and no source file has been touched; this document is written when the legs land."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/065-notion-record-refinement"
    last_updated_at: "2026-09-06T17:05:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 19:05 rulings; still no implementation has started"
    next_safe_action: "Record T001's red baselines, then land Leg A"
    blockers:
      - "The empty-fields home is owed an ADR before T012 lands"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/record-surface/property-row.ts"
      - "src/views/column-manager-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-065-impl"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Where the sheet's empty-fields reveal lives once the group holds view-hidden columns"
    answered_questions:
      - "ADR-005, ADR-006 and ADR-008 Accepted and ADR-007 Deferred by the operator on 2026-09-06 19:05"
      - "The 19:05 sweep found one gap, S1, and three candidates that dissolve against the code"
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
| **Spec Folder** | 065-notion-record-refinement |
| **Completed** | Not started |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This packet was opened on 2026-09-06 from the synthesis of the record surface's
five-iteration Notion research loop, and no source file has been touched. This section is written
when the legs land, and until then it says so rather than describing intentions in the past tense.

### Planned, in leg order

| Leg | Criteria | What it changes |
|-----|----------|-----------------|
| A | C1, C2, C3 | The board card's empty-value path delegates to the prompt primitive; the prompt covers every format with an editor; the desktop record-sheet label and value reach one size |
| B | C4 | Both option branches consume `renderOptionValue`, so single-select renders as coloured text |
| C | C5, C6 | The add-property picker forwards the typed name on selection; a trailing add row on the record sheet, ungated since 2026-09-06 19:05 |
| E | C8, C9, C10 | The hidden group's population moves to view-hidden columns, then takes Notion's full row grammar; the property-visibility list gains a search field. Opened by the 19:05 rulings and their sweep |
| D | — | What stays operator-gated after 19:05: the featured line waits on ADR-004's landing, and the cover/icon/description strip is **Deferred** by ruling. No task row for either |

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| — | — | None. The packet is open, not started |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. When it is, each leg lands as one commit with its red-first evidence recorded, and
the three build gates plus `npm run screenshots:verify` and `npm run gate` are read for output and
exit status rather than assumed.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Anytype-ruled work outranks Notion-originated work in the plan | The digest's strongest corroborations point at rulings that are half-landed, not at new Notion features. Three of the top five candidates are ours already |
| Four conflicts are recorded Accepted rather than asked | ADR-001 to ADR-004 are each settled by a landed ruling — A3, A2, A5 with D6, and A1. Asking again would reopen them |
| The four extensions were put to the operator and carried no code until they were ruled | ADR-005 to ADR-008 extend past what any ruling covers, so they were the operator's. They came back on 2026-09-06 19:05 — three Accepted, one Deferred — and became C8, C9 and an ungated C6. Writing the code first and asking afterwards is what D4 exists to prevent, and it did not happen here |
| A record-level cover is **Deferred** rather than declined or omitted | Sized like the icon picker times upload, reposition and alt-text states; AI excluded by D6; no Anytype evidence in the bounded sources. The operator deferred it on 2026-09-06 19:05, so it is unowned by decision rather than by oversight — a different state to record |
| The sweep's negative findings are written down, not dropped | Three Notion features that read as gaps in the digest's prose have no gap behind them once the code is read. Recording only the one real gap would leave the other three to be re-found and built by the next reader |
| Level 2 with `--architectural`, not Level 1 | Two exported primitive contracts change if the gated ADRs land. Without the flag the same inputs read Level 1, which understates a packet editing two renderers and a shared primitive |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh <this folder> --strict` | To be run at each landing |
| `npx tsc --noEmit` / `npm run build` / `npx vitest run` | Not run — no source change yet |
| `npm run screenshots:verify` | Not run — no capture affected yet |
| `npm run gate` | Not run |
| Red baselines re-derived against `37207535` | **Done.** Every criterion's red was confirmed against this tree on 2026-09-06; three line ranges from the loop's report had moved and are corrected in `goal.md` §4 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **One question is outstanding, and the 19:05 sitting created it.** Moving the hidden group's
   population to view-hidden columns (C8) leaves the sheet's *empty-fields* reveal without a home.
   It is owed an ADR before T012 lands. Everything else the packet was gated on was ruled on
   2026-09-06 19:05, and Leg D now holds two unscheduled items rather than four.
2. **The sweep is bounded by the digest.** It swept
   `054/notion-screens-digest.md` against `src/`, which is the only permitted source of Notion facts
   here. A Notion record-surface feature that never reached the digest could not be found by it.
3. **Five empty-value strings have no capture behind them.** A3 captured the shape and one example;
   the copy for `date`, `datetime`, `currency`, `text` and `files` is minted here and marked an
   inference in ADR-001. Re-wording is one i18n key each.
4. **One verification gap is unresolved.** Whether the title row already disables its visibility
   checkbox was never checked; `checkboxDisabled` exists at `property-row.ts:355`. A one-line check
   the next time a column-manager leg runs.
5. **The Notion evidence is a digest, not the screens.** The loop could not open images and took
   `notion-screens-digest.md` at its word, as dispatched. Where the digest marks a reading as
   eyeballed or low-confidence, that mark is carried rather than smoothed away.
<!-- /ANCHOR:limitations -->

---
