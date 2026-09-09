---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "scaffold/006-record-and-menu-sheets"
    last_updated_at: "2026-09-08T06:24:07Z"
    last_updated_by: "template-author"
    recent_action: "Initialized Level 3 template"
    next_safe_action: "Replace continuity placeholders"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "scaffold-006-record-and-menu-sheets"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 006-record-and-menu-sheets |
| **Completed** | 2026-09-08 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The record sheet on a phone now reads as one surface with one inset: every property row sits
at exactly 44px, its label 16px from the edge, a hairline under every row but the last, and the
disclosure's sections open behind their own hairline — where before, the same rows silently
measured 61px in one context and 44px in another because the 44px touch floor never said which
box it counted, the labels sat 25px deep behind two competing insets, and the section headings
had no divider at all. All of it was landed red-first through the sheet-grammar lane, which now
asserts the record sheet against the reference row grammar the settings leg, the row pitch, the
inset and the dividers, and measures the 44px floor on the record family's own option and menu
rows where they actually mount.

### Phase 6: record-and-menu-sheets

The 21 property rows of the phone record sheet went from 61.0px (one at 60.0) to 44.0px exactly:
the pitch's box is now named (border-box, on the five row shapes the grammar measures) instead of
inherited, the row's second 12px inset collapsed into the surface's one 16px inset, and the
disclosure's section headings moved from 13px-with-no-divider to 16px-behind-a-1px-hairline. The
record family's menu-card children, whose rulings 061/067 already landed, are proven on the
record sheet's own stacks: 4 of the 6 record pairs mount option rows (3–16 rows each), every row
44.0px, zero native selects anywhere on the sheet. The 30-mover recapture is judged by decoded
pixel delta, the 9 one-run jitters restored to committed bytes with their manifest hashes.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `tools/live/sheet-grammar.mjs` | Modified | The record sheet's reference row grammar: 21/21 one-line at 44–52px, the shared 16px inset read from the content edge, hairline-per-row, section headings 16px/1px, 0 native selects, extent-minus-border fit at 402px, the inset-and-floor negative control, and the 44px floor read on the family's own option/menu rows in the stacked-pair reports (23 of 34 pairs) |
| `styles.css` | Modified | The phone record sheet: the surface's shared 16px inset, the field row's 8px/0 padding, the five row shapes' border-box, the disclosure's headings (2px/0, 6px margin, 1px divider) and its rows' and disclosure controls' inset ownership |
| `src/views/sheet-grammar.ts` | Modified | `hasPaddedRows`: the record field row joins the Add-view precedent as the second documented zero-horizontal-padding exception |
| `src/views/record-sheet-row-grammar.test.ts` | Created | Unit proof the lane bit: reads `styles.css` the way the browser resolves it; fails when the shared inset line is reverted (verified 1 failed / 4 passed) |
| `tools/lane/css-lane.json` | Modified | The lane taken, the edit recorded, the release signed: holder, baselineHash `eba321e38ac0`, 21 reviewed captures, 9 jitter restores, 9 byte-only |
| `screenshots/manifest.json` + 30 captures | Modified | 616/616 recaptured twice; 21 content movers, 9 jitter restores, 9 byte-only (see the verification table) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red-first: the lane was extended with the record sheet's row grammar and ran red (21/21 one-line
but all 21 rows at 61.0px, labels 25.0px, headings 13.0px/0px, 4 failures, exit 1), then
`styles.css` was changed until the same assertions ran green (21/21 at 44.0px, inset 16.0px,
heading 16.0px/1px, extent 401 ≤ 401, exit 0, 2166 PASS / 0 FAIL). The pitch's negative control
(reverting the inset and the floor) measured red and then restored. The unit test was
revert-line-checked: 5/5 → 1 failed / 4 passed on the inset line → 5/5. All verification ran
foreground with exit codes read: full typecheck, 1738/1738 tests (161 files), the production
build, render-assertions, touch-targets, verify-placement (413/415, 2 declared), screenshots ×2
with the decoded pixel-delta judgement and the jitter policy, the evidence loop (11 stale
artefacts re-run; 15/15 fresh; engine-parity exits 1 INFORMATIONAL by design: 43→67 disagreeing
elements, +6 selector-pairs, all three panel-modal checkbox-tint notes, 0 record-family
fixtures — the 002 precedent), the 27-lane gate (exit 0, 27/27, 0 declared), and both naming
scans. Nothing is pushed; the worktree holds the commits for the verifier.

One decision was recorded for the later 071 legs: the 44px touch floor answers to the row's
whole box, so a row that ships padding beside the floor must either name its box-sizing or
re-derive the window — the same kind of arithmetic note as 002's border asymmetry.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The surface owns the one shared 16px inset; the rows carry none | One reading line for labels, hairlines and section dividers; a second inset was the exact dent the settings leg's doctrine warns about (decision-record D-001) |
| The five measured row shapes name border-box | The 44px floor counted a content-box assumption: the same row measured 61.0px and 44.0px in different contexts, and nothing in the stylesheet said which was right (D-002) |
| The disclosure's section headings open behind their own 1px hairline on the shared inset | They sat 13px in with no divider; the shown/hidden groups read as one unbroken run (D-003) |
| The record field row joins `hasPaddedRows` as the second zero-horizontal-padding exception | Its 4-side padding would double-count the inset; the record grammar measures what the exemption trusts, beside the Add-view precedent (D-004) |
| The menu-card half ships no new stylesheet | Its 061/067 rulings hold; this leg measures them on the record sheet's own stacks, 4 of 6 pairs, 3–16 option rows each, all 44.0px (D-005) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 1738/1738, 161 files, 0 |
| `npm run build` | 0 |
| `node tools/live/sheet-grammar.mjs` | 0 — record sheet: 21/21 one-line @ 44.0px, inset 16.0px, heading 16.0px/1px, 0 native selects, extent 401 ≤ 401 @ 402px; negative control red (inset 6.0px, 21/21 under the floor) then restored; 4/4 record pairs' option rows 44.0px |
| RED (before the edit) | 21/21 at 61.0px (last 60.0), inset 25.0px, heading 13.0px/0px, restore-check failed, 4 failures, exit 1 |
| `node tools/live/render-assertions.mjs` | 0 |
| `node tools/live/touch-targets.mjs` | 0 |
| `node tools/storybook/verify-placement.mjs` | 0 — 413/415, 2 red for a declared reason |
| `npm run screenshots` ×2 | 616/616, exit 0 both |
| pixel-delta + jitter policy | 39 movers in run 2 (27 in both runs): 21 content (all this packet's record-detail family, 96–62,773 changed pixels @ channel deltas 127–221) judged kept and named in the release; 9 jitter (≤12, one run) restored + manifest hashes; 9 byte-only (6 recurring one-bit @1 both runs, 3 one-run variances @15–32 above the 12 floor, kept — 002's precedent); `check-lane` 0, "release names all 21" |
| `node tools/live/evidence.mjs --check-all` | 15/15 fresh after 11 writers re-run (engine-parity 1 INFORMATIONAL: 43→67 elements, +6 selector-pairs, all panel-modal checkbox-tint, 0 record-family fixtures) |
| `npm run gate` | PASS — 27/27 lanes, 0 red for a declared reason, exit 0 |
| `node tools/naming/scan-comments.mjs` | 0 — 524 files, no artifact ids |
| `node tools/naming/scan-failing-values.mjs` | 0 — 443 ticked criteria, none newly bare |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The reference columns of `spec.md` §13 stay `TBD`.** The third-party Notion/Anytype captures carry filenames only; the Targets are the operator's Notion-shape directives, measured by the lane. A numbers-printing pass over the reference captures would close it, exactly as 002 recorded (D-005 there).
2. **The disclosure's section grammar applies to the shown/hidden headings only.** The property rows themselves carry no Notion-side section to mirror; their grouping is the disclosure, and that is what the divider now grounds.
3. **The desktop (`.obnotion-container`) presentation is deliberately unchanged.** Every declaration this leg added is scoped to the phone sheet; the anchored panel keeps its 12px-and-own-priority presentation, and its captures moved only through the mobile-profile rules.
4. **The continuity frontmatter in this packet's docs is authored, not regenerated.** The graph metadata pair is regenerated by the tooling; the continuity blocks follow the settings leg's precedent, updated by hand, and the operator's own device recheck remains the program's closing condition, as it does for every phase.
<!-- /ANCHOR:limitations -->

---


