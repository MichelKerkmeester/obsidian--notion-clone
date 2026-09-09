---
title: "Implementation Summary"
description: "The Properties sheet row now carries three interactive controls, a key-free name and a Shown / Hidden partition; wrap and delete live on the edit-property surface the name tap opens."
trigger_phrases:
  - "implementation summary"
  - "009-properties-sheet-row-model implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/009-properties-sheet-row-model"
    last_updated_at: "2026-09-10T00:05:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Implemented T001-T011; gate 28/28; device read outstanding"
    next_safe_action: "Operator device read (D3) closes the packet; C-2 capture would ground the Notion column"
    blockers:
      - "The operator's own device read (D3) is the only closing row that waits on a human"
    key_files:
      - "src/views/column-manager-renderer.ts"
      - "src/views/modals/column-rename-modal.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "009-properties-sheet-row-model-implementation"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Can the operator supply a full-resolution Notion Property-visibility capture (audit C-2)?"
    answered_questions:
      - "Wrap and delete belong in the edit-property sheet, as the audit read Notion — implemented there, the D3 device read confirms it"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 009-properties-sheet-row-model |
| **Completed** | 2026-09-10 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The Properties (column manager) phone sheet's row is rebuilt on the audit's §3.1/§3.2 reading. A
row today shows a drag handle, two reorder buttons, a visibility checkbox, a type icon and the
property's name — three interactive controls, down from six — and the name no longer carries the
internal storage key that printed on every row. The flat list is partitioned under `Shown` and
`Hidden` section headers, each carrying its own bulk action on its own line (`Hide all` / `Show
all`): the four strings the record detail sheet already consumed, reused rather than invented, with
the shell header's All master checkbox dissolved into them. Wrap and delete moved off the row into
the edit-property surface: the rename modal gains an optional delete argument and renders a
full-width `is-warning` Delete property row that closes the modal into the already-confirmed
`deleteColumn` pipeline, and the row's name tap opens that surface in one tap. Wrap itself was
already carried by the modal; nothing about the wrap path changed.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/column-manager-renderer.ts` | Modified | The row cut to its three controls: name renders `col.label` alone, the wrap/edit/delete button block removed, name click reaches `editColumn`, the shown/hidden partition renders with per-section bulk actions replacing the header All-toggle |
| `src/views/modals/column-rename-modal.ts` | Modified | Optional 5th constructor argument; a full-width `is-warning` Delete property row that closes the modal then invokes it (absent callers render no delete row) |
| `src/views/database-view.ts` | Modified | The one call site hands the modal a delete callback into `columnOperations.deleteColumn` |
| `styles.css` | Modified | The shared row grid 8 → 5 tracks (the board Properties list's override rides along), the add-row hairline follows a section as well as a row, the partition headers styled in the record sheet's section-header vocabulary, the edit-property delete row, and the phone sheet's own scrollbar at 0px |
| `tools/live/sheet-grammar.mjs` | Modified | The packet's three clauses (controls-per-row, key-free label, section partition) plus two measured fixes: the centring negative control now injects the historic 88px trailing width itself |
| `tools/storybook/verify-placement.mjs` | Modified | The property-row section rewritten to the shipped contract: no click reaches a delete, the name tap opens the edit surface with the row's own column, three non-destructive actions |
| `src/views/column-manager-renderer.test.ts` | Modified | The row-contract unit suite: key-free name, three controls, the name-tap routing |
| `tools/screenshots/scenarios/panels.mjs` | Modified | The `panel-column-manager` fixture rewritten to the shipped row (declared scope deviation, below) |
| `tools/lane/css-lane.json` | Modified | The lane acquired, edited and released for the stylesheet change; 20 captures named reviewed |
| `screenshots/**` (20 content-changed PNGs + manifest + README) | Recaptured | The redesigned surface, its dependent stacks and the rewritten panel fixtures |
| `tools/live/*.json` (11 censuses restamped) | Re-measured | Each by its own writer after the inputs moved |
| Packet docs | Modified | Tasks ticked, AC statuses, goal log and continuity, spec §13 landed note |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first: the three lane clauses were written and run against the untouched renderer — 16/16 rows
at 6 interactive controls, 0/16 labels key-free, 0 section headers, the rest of the lane green. The
unit suite's key-free clause was also proven red-then-green (1 failed | 6 passed against the
bracketed-label renderer, 7/7 after). Then the renderer, modal, stylesheet and fixtures changed,
and the same clauses ran green: 16/16 rows at 3 controls, 16/16 labels key-free, 2 section headers
whose titles and bulk labels are compared against the four i18n keys rather than literals, so copy
ownership by `010` cannot silently break the clause.

The stylesheet change went through the css lane: acquired before the first styles.css edit, the
edit recorded against the stylesheet hash, the captures regenerated twice and judged by decoded
pixel delta, and the lane released with every content-changed capture named. Five capture runs in
total established the mover set as deterministic — every mover reproduced identically across runs,
none fell under the 12-delta one-run-only jitter rule, and the two byte-only movers (chrome view
switcher, board desktop) are pixelHash-identical and so not billed to the release, as the lane's
own comparator reads them.

Two measured surprises were fixed at the root rather than around. The partition's two extra header
lines tip a sheet of long, wrapping property names past the 90svh cap, and the desktop-WebKit lane
then draws the classic 8px scrollbar, eating 8px of the sheet root's width and tripping the
horizontal-overflow clause (extent 397 > 393, five failures) — the phone sheet's own scrollbar now
declares `scrollbar-width: none`, the overlay kind a phone actually draws, matching the shipped
portalled-sheet ruling; the title-centring negative control, which reproduced the old two-slot
header's asymmetry through the All toggle's 44px, now injects that 88px trailing width itself,
because the shipped header's trailing slot is the close alone.

**Declared scope deviation:** the storybook `panel-column-manager` fixture sits outside the
packet's five-file scope but had to be rewritten to the shipped row — its 8-child hand-HTML wrapped
onto a second line under the new 5-track grid, four panel captures changed size, and
`tools/live/replay.mjs` went BROKE (`002-properties-panel` "the properties row stays on one line":
recorded 1, now 2). The replay gate is a recorded-value ratchet, so re-recording was not an option;
the fixture now describes the row that ships. The deviation is recorded in `goal.md`'s deviations
table.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Three controls, not the specified maximum of four | The audit's Notion column is structural (drag handle, type icon, label, eye); matching it needs no fourth control, and the lane asserts what ships, not the ceiling |
| The partition renders both sections only when at least one property is hidden | The record sheet's own precedent; a database with nothing hidden renders one section, per spec §8 |
| The delete row closes the modal first, then deletes | One gesture, and the existing `deleteColumn` confirmation pipeline stays the second step — no new confirm surface, its ordering suite untouched |
| The `All` toggle is removed from the shell and desktop headers | Its job moved to the section headers, where it governs exactly its own members; the desktop header keeps the close alone |
| Notion's un-red destructive row is still not copied | The audit's own finding: our `is-warning` is the more consistent of the two treatments |
| The centring negative control injects 88px rather than weakening the assertion | The control exists to prove the grid rule load-bearing against a genuinely asymmetric header; the shipped header is no longer asymmetric, so the control manufactures the asymmetry it exists to catch |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Lane RED (packet's 3 clauses, untouched tree) | exit 1 — exactly the 3 new clauses red, everything else green |
| Lane GREEN | exit 0 — controls [3×16], 16/16 key-free, 2 partition headers, 0 native selects, 3/3 hairlines, 0.49px centring, WebKit 401 ≤ 401 |
| Unit red-then-green (`column-manager-renderer.test.ts`) | 1 failed | 6 passed → 7/7 |
| `npx vitest run` | exit 0 — 1591/1591 |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 |
| `node tools/live/render-assertions.mjs` | exit 0 |
| `node tools/storybook/verify-placement.mjs` | exit 0 — 418/420, 2 red for a declared reason |
| `node tools/live/touch-targets.mjs` | exit 0 |
| `node tools/live/sheet-grammar.mjs` (regression rerun) | exit 0 |
| `npm run screenshots` | exit 0 ×5 runs, 480 entries each |
| Decoded-pixel judgment | 22 deterministic movers (the redesigned surface 321990-361711px at maxDelta 196-225 and its dependents); 0 jitter cases; 2 byte-only movers pixelHash-identical |
| `node tools/live/evidence.mjs --check-all` | exit 0 — 16/16 fresh after re-running the 11 stale census writers (design-conformance 4/5 enforced with named gaps; replay 28/28 after the fixture fix) |
| `node tools/lane/check-lane.mjs` | exit 0 — release names all 20 changed captures |
| `npm run gate` | exit 0 — **28 green, 0 red** |
| `node tools/naming/scan-comments.mjs`, `scan-failing-values.mjs` | exit 0 / exit 0 |
| Validation orchestrator `--strict` | 009: RESULT: PASSED · 071: RESULT: PASSED · 005: RESULT: PASSED |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The operator's device read (D3) is the closing row and no agent ticks it.** Every AC through
   AC-007 is Met on measured numbers; AC-008 waits for the operator's own iPhone read.
2. **The audit's C-2 capture is still outstanding**, so §13's Notion column stays structural and
   every numeric target remains ours, internal-consistency-derived.
3. **The row heights stay 34px**, below the 44px floor the panel-row grammar applies elsewhere —
   recorded, not changed: the density is the reader's own preference (the lane's standing ruling).
4. **`010` owns the copy this packet left alone**: the name tooltip still reads "Double-click to
   edit", a pointer-gesture string a phone cannot perform, until that packet lands.

---
<!-- /ANCHOR:limitations -->
