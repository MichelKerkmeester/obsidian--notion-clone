---
title: "Implementation Summary: Phase 12 — Board Card Fields Never Wrap Side by Side"
description: "The board card's property grid is a single always-on track, judged in the same change that corrected the lane clause that had been certifying the two-column shape; the judge (twice) and the operator's own read remain."
trigger_phrases:
  - "012 implementation summary"
  - "board card meta grid shipped"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/012-board-card-fields"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "board-card-fields-create"
    recent_action: "Single-column meta grid landed; lane, captures and 28-lane gate green"
    next_safe_action: "LAND, then the image judge; two passes on an unchanged tree close the child"
    blockers:
      - "The judge's two consecutive passes on an unchanged tree, then the operator's own device read — neither is closable by this leg"
    key_files:
      - "styles.css"
      - "tools/live/render-assertions.mjs"
      - "src/views/card-field-renderer.ts"
      - "src/views/board-renderer.ts"
      - "src/views/board-card-properties-panel.test.ts"
      - "tools/screenshots/constructed-scenarios.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "012-board-card-fields-create"
      parent_session_id: "012-board-card-fields-scaffold"
    completion_pct: 70
    open_questions:
      - "Every value in the Anytype reference is structural. No pixel size, no hex and no font size may be taken from a screenshot"
    answered_questions:
      - "The label stays visible (045's later argument — a value without its name does not say which property it belongs to; the operator's ruling names wrapping, not naming): the landed clause proves 0 of 306 painted property names clipped at the card's full width"
      - "045-board-card-properties's mechanism (which properties appear, and the panel that configures them) is unaffected; only the meta grid's column count and the label/value truncation rules moved (056 ADR-003's guard applied here too: `board-card-properties-panel.test.ts` stayed green, unmodified)"
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
| **Spec Folder** | 012-board-card-fields |
| **Completed** | Not complete — CREATE and SCREENSHOT landed: the lane, the capture set and the 28-lane gate are green with their receipts in `tasks.md`; the image judge's two consecutive passes on an unchanged tree (the parent's own gate) and the operator's device read remain |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A board card's property rows now read one field per line, at every viewport the board mounts at.
`.obnotion-kanban-card-meta` declares a single always-on `1fr` track and the 359.9px collapse is
gone as unreachable; a second field never sits beside a first, so an ordinary property name
(`Due date`, `Related tasks`, `Summary`) no longer clips to its first characters, and the value's
wrap-or-ellipsise alignment reads against the card's whole width — the ruling the landed
value-alignment decision originally made for exactly this shape. The label's ellipsis floor, the
value's 1-line clamp and its `tabular-nums` digits, the badge rows' full-width exemption, the
checkbox row's glyph-first shape and the 25px row pitch are all untouched, as is the mechanism that
decides which properties appear: the panel's own test file ran green, byte-unmodified.

Three clauses joined the board-geometry pass in the same change that corrected the lane's own
two-column assertion: label fit (every visible property name's painted `scrollWidth` stays within
its box), the row-pitch range (the 25px design, plus at most one wrapped 13px line — 25–44px), and
field-count parity (17 property rows per card — the capture fixture's own derivation — uniform
across every card at both 1440px and 340px, because a presentation change must not drop or
duplicate a row it only promised to re-wrap).
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Write-first, one leg: the clauses landed against the old producer and ran RED — the property grid
read `2 column(s) at 1440px, 1 at 340px` (the retired reading) and 72 of 306 painted names clipped,
worst `withdrawn` by 29px; lane exit 1 with exactly those two, 155 other assertions untouched. The
producer then moved: `styles.css`'s meta-grid rule lost its second track and its media query, the
lane flipped to `1 column(s)` at both widths, 0 of 306 clipped, pitch `[25 × 17]` — exit 0, and the
pitch range held without adjustment. The captures went through the production mount path
(constructed scenario → mount driver → the shipped board renderer), twice, judged by decoded pixel
delta: 57 movers, every one a board-card surface — 12 content-sized, 100px taller — and the
frozen-column shimmer's 36px at channel delta 1, identical in both runs and therefore kept rather
than restored. The shared-stylesheet lane was taken through its acquire → edit → release triplet,
the release naming every mover, its baseline stamped to the judged stylesheet. Evidence: 12 stale
artefact writers re-run by their own tools to 16/16 fresh, gate 28/0, and the comment-grammar and
failing-value scans clean.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

- **The label stays.** The reference shows names, the later field-names leg made that its own
  argument, and the operator's ruling names wrapping, not naming — so the landed shape keeps the
  muted 12px name and proves it unclipped, rather than returning to the values-only card the
  earlier alignment ruling shipped.
- **The 25px pitch became a range, not a second constant.** An exact-25 assertion is true only
  while no row can ever wrap; the clause now holds the 25px floor as the design and allows one more
  13px line, so a legitimately wrapped value grows its own row without red.

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

The receipts, clause by clause, live in `tasks.md`'s execution-receipts section and the packet
handover's landing entry; the acceptance rows' states live in `acceptance-criteria.md`. In brief:
`tsc --noEmit` 0; vitest 1614/1614 across 160 files with the mechanism guard unmodified; build 0;
sheet-grammar 0; storybook placement 0 (418/420, 2 declared); `render-assertions.mjs` 0; evidence
16/16; `npm run gate` 28 green, 0 red, exit 0; comment-grammar and failing-value scans 0; the
shared-stylesheet lane green with all 56 content-changed captures named (the 57th moved bytes but
not its 16×16-grid hash — the recorded sub-bucket lesson, 36px at channel delta 1, both runs
agreeing). `screenshots:verify` reads 480 current, 0 stale, across both runs.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Limitations & Continuation

Two of the three gates are still open, by design. The image judge has not yet scored the eight-row
rubric — the loop's judge node owns the first and second consecutive pass on an unchanged tree, and
`verification.md` still awaits its first iteration row. The operator's own iPhone read (the
programme's third gate, never agent-tickable) closes last. No pixel figure in the parity target
derives from the Anytype reference; every number this child shipped is our own, measured. If the
judge scores a rubric row below 2, the remediation loop runs its own clause-RED → fix → GREEN →
recapture → re-judge cycle; three failures on one row re-open DEFINE rather than patching CREATE.
<!-- /ANCHOR:limitations -->
