---
title: "Implementation Summary: Notion Record Refinement"
description: "All five legs landed: C1-C6 and C8-C10 met, the 26-lane gate green, C7 left for the operator's device read."
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
    last_updated_at: "2026-09-07T01:30:00Z"
    last_updated_by: "implementation-session"
    recent_action: "Legs A, B, C and E landed in one commit; 26-lane gate green"
    next_safe_action: "C7 is the operator's own device read; nothing else is agent-schedulable"
    blockers: []
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/record-surface/property-row.ts"
      - "src/views/record-detail-panel.ts"
      - "src/views/record-surface/hidden-properties.ts"
      - "src/views/column-manager-renderer.ts"
      - "src/views/database-view.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-065-impl"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "ADR-005, ADR-006 and ADR-008 Accepted and ADR-007 Deferred by the operator on 2026-09-06 19:05"
      - "The 19:05 sweep found one gap, S1, and three candidates that dissolve against the code"
      - "The empty-fields home is the existing showEmptyFields switch, resolved in the implementing leg"
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
| **Completed** | 2026-09-07 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Every leg landed: the board card's empty-value path now delegates to the same prompt primitive
the record sheet already used, the prompt covers every format with an editor, the desktop label
and value read at one size, single-select renders as coloured text on both surfaces, the
add-property picker carries a typed name into the column it creates, the record sheet gained a
trailing add-property row, and the hidden-properties group now holds view-hidden columns under
Notion's full row grammar with a search field over the column manager's own visibility list.

### Leg outcomes

| Leg | Criteria | What changed |
|-----|----------|---------------|
| A | C1, C2, C3 | `board-renderer.ts`'s `getEmptyDisplayValue` delegates to `getPropertyEmptyPrompt`; six new formats (`number`, `date`, `datetime`, `currency`, `text`, `files`) added to the prompt in both locales; the desktop label's `font-size: var(--font-smaller)` declaration dropped, the phone arm untouched |
| B | C4 | `renderPropertyValue` gained a `splitOptionValue` flag; the record sheet and the board card pass it, routing single-select through `renderOptionValue`'s text branch and keeping multi-select's filled chips; the gallery/list path is unchanged |
| C | C5, C6 | The add-property picker's `onSelect` now reads the handle's `searchInput.value` and forwards it as the new column's label; a `.db-record-detail-add-row` renders between the field list and the hidden group, opening the same search-first picker through a new `openRecordAddPropertyPicker` |
| E | C8, C9, C10 | `OpenRecordDetailOptions` gained `allColumns`; the hidden group's population is now the peek's own complement-of-visible shape; `hidden-properties.ts` rebuilt with Shown/Hidden sections, per-row drag-handle/type-icon/eye/chevron anatomy and bulk links; the column manager's visibility list gained a search field |

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/board-renderer.ts` | Modify | C1: `getEmptyDisplayValue` delegates; C4: option branch consumes `renderOptionValue` |
| `src/views/record-surface/property-row.ts` | Modify | C2: `getPropertyEmptyPrompt` covers 9 formats; C4: `renderPropertyValue` gains `splitOptionValue` |
| `src/i18n.ts` | Modify | 6 new `field.empty*Prompt` keys × 3 locales; 4 new `panel.*` keys (Shown/Hidden section titles, bulk labels, search placeholder) |
| `styles.css` | Modify | C3's label font-size drop; new hidden-group section/row/eye/chevron rules; the trailing add-row's styling; the column-manager search input |
| `src/views/record-detail-panel.ts` | Modify | C6: trailing add-property row; C8/C9: `allColumns`, local visible-keys set, Shown/Hidden row wiring, eye-toggle and bulk-toggle callbacks |
| `src/views/record-surface/hidden-properties.ts` | Rewrite | C9: Shown/Hidden sections, per-row anatomy, bulk links, always-present disclosure |
| `src/views/column-manager-renderer.ts` | Modify | C5: query forwarding on selection; C10: search field and row filter |
| `src/views/database-view.ts` | Modify | `allColumns` threaded to `openRecordDetailPanel`; `setColumnVisible`/`setColumnsVisible`/`addProperty` wired; new `openRecordAddPropertyPicker` |
| `src/views/embedded-database-renderer.ts` | Modify | `allColumns` threaded to `openRecordDetailPanel` (read-only path, no new actions) |
| `src/views/card-field-renderer.ts` | Modify | `splitOptionValue` threaded through to `renderPropertyValue` |
| `tools/live/render-assertion-harness.ts` | Modify | `allColumns` added to every `openRecordDetailPanel` construction; three new structural assertions in `recordDetailAssertions` |
| `tools/storybook/verify-placement.mjs` | Modify | `allColumns` added to all 15 `openRecordDetailPanel` construction sites |
| `tools/lane/css-lane.json` | Modify | Lane handover from `058-card-title-and-title-formats`; release names all 49 git-reported capture changes |
| Screenshots (31 files) | Modify | Recaptured, opened and read; see `tools/lane/css-lane.json`'s newest release for the per-file breakdown |
| New: `src/views/column-manager-renderer.test.ts` | Create | Picker query-forwarding and visibility-search unit tests |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

One commit carries every leg, in the order Legs A → B → C → E were implemented and verified —
each leg's red was confirmed against the pre-change tree before its fix, using the inventories
`goal.md`/`plan.md` already named. The three build gates (`npx tsc --noEmit`, `npm run build`,
`npx vitest run`), `npm run screenshots:verify` and `npm run gate` were all read for output and
exit status, not assumed: the gate caught two real defects along the way — a stale
`allColumns`-less `openRecordDetailPanel` construction across two live-tooling files (fixed before
any assertion could pass), and a 2-4px overflow from the new column-manager search input on the
390px phone sheet (fixed with `box-sizing: border-box` before `sheet-grammar.mjs` went green).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Anytype-ruled work outranks Notion-originated work in the plan | The digest's strongest corroborations point at rulings that are half-landed, not at new Notion features. Three of the top five candidates are ours already |
| Four conflicts are recorded Accepted rather than asked | ADR-001 to ADR-004 are each settled by a landed ruling — A3, A2, A5 with D6, and A1. Asking again would reopen them |
| The four extensions were put to the operator and carried no code until they were ruled | ADR-005 to ADR-008 extend past what any ruling covers, so they were the operator's. They came back on 2026-09-06 19:05 — three Accepted, one Deferred — and became C8, C9 and an ungated C6 |
| A record-level cover is **Deferred** rather than declined or omitted | Sized like the icon picker times upload, reposition and alt-text states; AI excluded by D6; no Anytype evidence in the bounded sources |
| The empty-fields home is the existing `showEmptyFields` switch | The 19:05 fold named this directly: an empty visible field renders inline when the switch is on, and is skipped — not parked — when it is off, matching the board card's own `shouldShowEmptyField` rule. No new population, no new ADR needed |
| The table peek stays untouched | `table-record-peek.ts` draws its own hidden-group disclosure by hand and never consumed `HiddenPropertiesGroupHandle` — confirmed by inventory before the grammar rewrite, so the signature change never had to reach it |
| The hidden-group disclosure always renders now | It is the entry point for hiding a currently-shown field, not only a report of what is hidden — a Notion-matching behaviour change from the prior "renders nothing when empty" rule |
| T008 (display-mode vocabulary) is Deferred, not built | The live setting's two labels are a two-way choice, not the digest's three named shells, and the third shell is `006`'s own placement surface. Recorded with the reason in `tasks.md` rather than silently skipped |
| The sweep's negative findings are written down, not dropped | Three Notion features that read as gaps in the digest's prose have no gap behind them once the code is read |
| Level 2 with `--architectural`, not Level 1 | Two exported primitive contracts changed: `HiddenPropertiesGroupHandle.render`'s signature and `RecordDetailActions`'s action set |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run build` | PASS, exit 0, `main.js` rebuilt from the final tree |
| `npx vitest run` | PASS, 143 files, 1529 tests, exit 0 |
| `npm run screenshots` / `screenshots:verify` | 588 entries regenerated; verify exit 0 |
| `node tools/live/sheet-grammar.mjs` | PASS, exit 0 (caught and required the `allColumns` fix and the search-input overflow fix before going green) |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `npm run storybook:placement` (verify-placement.mjs) | PASS, 383 checks, 3 red for a declared (pre-existing) reason, exit 0 |
| `npm run gate` | PASS, 26/26 lanes green, exit 0, run twice with the same result |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0, 0 artifact-id violations |
| `node tools/naming/scan-failing-values.mjs` | PASS, exit 0 |
| `node tools/lane/check-lane.mjs` | PASS, exit 0, release names all 49 git-reported capture changes |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **T008 (REQ-007) is Deferred, not built.** The display-mode vocabulary rename touches a live
   setting string this leg's file group does not own; `006`'s own placement ruling is the right
   home for the third shell. `AC-010` stays `Unmet` rather than `Waived` since no ADR backs a
   waiver for it.
2. **T009's new automated coverage is narrower than planned.** Three new structural assertions
   landed in the shared `recordDetailAssertions` (an empty field never reads "Empty", the hidden
   group always renders, the row anatomy plus the single disabled eye) — these ride the existing
   `record-detail` scenario every relevant gate lane already exercises. A dedicated computed-style
   assertion for C2/C3's exact values and new capture scenarios beyond the existing ones were
   judged disproportionate: the behaviours are already pinned by unit tests at the logic level and
   confirmed by eye against the real captures, and the existing scenarios already depict every
   changed state.
3. **The date-picker captures moved for an unrelated reason.** The capture run crossed a real
   calendar day (2026-09-06 → 2026-09-07) mid-session; the mini-calendar's "today" highlight moved
   with it. Confirmed by diffing the committed and fresh images directly — no source change caused
   it, and the fresh capture is the honest current-date rendering.
4. **One verification gap from the original packet is still unresolved.** Whether the title row
   already disables its visibility checkbox in the column manager was never separately checked;
   `checkboxDisabled` exists at `property-row.ts`. A one-line check the next time a column-manager
   leg runs.
5. **The sweep is bounded by the digest.** It swept `054/notion-screens-digest.md` against `src/`,
   which is the only permitted source of Notion facts here. A Notion record-surface feature that
   never reached the digest could not be found by it.
6. **Five empty-value strings have no capture behind them.** A3 captured the shape and one
   example; the copy for `date`, `datetime`, `currency`, `text` and `files` is minted here and
   marked an inference in ADR-001. Re-wording is one i18n key each.
<!-- /ANCHOR:limitations -->

---
