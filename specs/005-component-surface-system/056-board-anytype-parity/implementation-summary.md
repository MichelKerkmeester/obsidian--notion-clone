---
title: "Implementation Summary: Board Anytype Parity"
description: "The board rebuilt to Anytype's kanban: the pm-kanban-*/pm-avatar*/pm-progress* vocabulary retired, the seven local extensions dispositioned, and every AC-002 through AC-009 criterion Met. AC-010 stays the operator's."
trigger_phrases:
  - "056 implementation summary"
  - "board anytype parity status"
  - "kanban rebuild progress"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-06T03:45:00Z"
    last_updated_by: "code-leaf"
    recent_action: "rebuilt the board onto db-kanban-*, dispositioned the extensions, gates green"
    next_safe_action: "Await the operator's device confirmation for AC-010"
    blockers:
      - "AC-010 is operator-owned and open by design"
      - "boardExtensionsEnabled and its now-fully-unreachable-from-default-board render branch (renderSwimlaneBoard and the rest) are a named, deferred code deletion — not claimed done here"
    key_files:
      - "src/views/board-renderer.ts"
      - "styles.css"
      - "tools/live/replay.mjs"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-impl"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions:
      - "045's card-property mechanism needed zero code changes; the values-only row shape is CSS-scoped under .db-kanban-card-meta"
      - "The CSS lane's recorded holder (046-linked-views-notion-parity) had already released per its own history entry; taken over rather than left blocking"
      - "The kanban page limit (10) is applied through a local boardConfig at the board's own call sites, not a change to group-visibility.ts's shared default"
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
| **Spec Folder** | 056-board-anytype-parity |
| **Completed** | T001 through T011 done. AC-010 (operator confirmation) is the one row nothing here closes |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**The board's element vocabulary moved from a Project Manager 1:1 copy to Anytype's kanban.**
`board-renderer.ts` no longer constructs any `pm-*` class (was 39); `styles.css` no longer carries
any `pm-kanban-*` rule (was 23) — both counts are **0**, confirmed by the same `grep` commands
`checklist.md` C3 recorded red against. The rebuilt default board reads:

- **Column**: 246px wide, 24px gap (270px pitch), no background panel — the page shows through
  between cards, matching all twenty captures.
- **Header**: a 24px, fully-rounded, unfilled option chip 8px in from the column's left edge, text
  coloured through the same `status-color-*` class every option value already uses, retinted for
  this view (a ten-colour bucket, tint plus a same-hue darkened/lightened text pair, derived by the
  same WCAG-clearing rule design-trueup.md only pixel-measured for amber). A hover-revealed
  "···"/"+" pair sits at the chip's right; on touch both are permanent, and a plain-text record
  count appears beside the chip — the phone's own anatomy, not the desktop's.
- **Card**: 8px radius, 1px border, no shadow at rest (a shadow on hover is kept as design
  inferred — no capture holds a pointer), 16px padding, a 16×16px title icon slot, and — where the
  row has one — a type-name slot that keeps the schema's nearest content, a subtask's parent title,
  since no Objects/Types model exists to fill it literally (goal D8).
- **Property rows**: every one of 045's configured fields renders as a value-only row on a 25px
  pitch through the unchanged `card-field-renderer.ts` primitive, its label hidden by CSS except on
  a checkbox row. Select/multi-select values render as 20px, 6px-radius tint-fill chips through the
  same retinted palette. The checkbox glyph is 14px.
- **New-record control**: a 246×42px bordered box below the last card on desktop (a bare "+"), a
  labelled "+ New" row with no box on touch.
- **Sticky scrollbar**: 10px tall, 8px above the true bottom, coloured from this plugin's own
  `--db-scrollbar-thumb` tokens rather than Anytype's fixed light-theme hex (`decision-record.md`
  ADR-002).
- **Ungrouped column**: labelled "No value" on both platforms, per the operator's resolution of the
  desktop/phone copy divergence design-trueup.md C3 recorded.

**The seven local extensions are dispositioned, none default-off.** Covers, group controls, touch
menus and the phone record count are `fold` — each is now unconditional in the rebuilt default
board rather than gated behind `boardExtensionsEnabled`. Swimlanes, summaries and batch order are
`retire` — none is called from the default board's render path. The flag itself, and the
`renderSwimlaneBoard`/`renderColumn`/`renderSubgroup` branch it gates, are **not deleted**: confirmed
before relying on it, `rg -n "boardExtensionsEnabled" --type ts` outside `tools/live/`'s own test
scaffolding matches only the field's declaration (`src/data/types.ts`) and its one read
(`board-renderer.ts`) — no settings surface in the shipped app ever sets it. Deleting that dead
branch outright would touch `BoardRendererActions` and its two implementers
(`database-view.ts`, `embedded-database-renderer.ts`), outside this packet's file list; it is named
here as a deferred cleanup rather than folded into this leg silently.

**045's card-property mechanism needed no code change.** `board-card-fields.ts` and
`board-card-properties-panel.ts` are byte-for-byte unchanged — `git diff --stat` on either reads
nothing — and both card-property test suites are green, 19 of 19. The values-only row shape came
entirely from CSS scoped under the new `.db-kanban-card-meta` wrapper, since the shared
`card-field-renderer.ts` primitive already parameterizes its label/value classes per caller.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/board-renderer.ts` | Modified | The reference-board family rebuilt onto `db-kanban-*`; the seven extensions' fold targets folded into it; dead pm-* helpers and their module-level functions removed |
| `styles.css` | Modified | `pm-kanban-*`/`pm-avatar*`/`pm-progress*`/board-only `pm-chip` variants retired; the `db-kanban-*` block, the ten-bucket palette and the sticky scrollbar added |
| `src/i18n.ts` | Modified | `board.noValue`, `board.addCard` added in all three locales |
| `src/views/rendered-view-roots.ts` | Modified | Teardown class list follows the renamed board root/view classes |
| `src/views/board-renderer-parity.test.ts` | Modified | Rewritten onto the `db-kanban-*` anatomy; the retired-feature fidelity-pass block removed rather than renamed |
| `src/views/board-renderer-hierarchy.test.ts` | Modified | The default-board card-property assertions follow the renamed wrapper class and the retired time-chip slot |
| `src/views/column-header-menu-affordance.test.ts` | Modified | The vertical-ellipsis regression lock updated for the now-parameterized icon |
| `tools/screenshots/scenarios/shared.mjs`, `shared.test.mjs`, `core.mjs`, `chrome.mjs` | Modified | Board fixture helpers and scenarios retargeted onto `db-kanban-*`; not in the packet's named file list, required for the same tests and the screenshot gate |
| `tools/live/render-assertion-harness.ts` | Modified | Board selectors renamed; the "every row becomes a card" assertion accounts for the new 10-per-column kanban page limit |
| `tools/live/replay.mjs` | Modified | Four `038`/`040`-phase board claims rewritten for the superseded anatomy, each naming decision-record.md ADR-001 as the reason the old measure no longer holds |
| `tools/live/constructed-state-assertions.mjs` | Modified | Board selectors renamed; the retired priority-tier count case removed |
| `tools/live/checkbox-appearance.mjs` | Modified | The isolated-checkbox contrast fixture's wrapper class renamed |
| `tools/live/touch-targets-constructed-baseline.json` | Modified | Raised 1213 → 1228 for the new title-icon slot's `db-record-icon` instances, with the same per-class verification the file's own prior raises carry |
| `tools/lane/css-lane.json` | Modified | Taken over (holder was `046-linked-views-notion-parity`, itself already released per its own history) and released again at this leg's final hash, naming all 32 moved captures |
| `screenshots/manifest.json`, `screenshots/README.md`, 32 `screenshots/notion-clone/**/*.png` | Regenerated | Full `npm run screenshots` run; 32 board captures moved pixelHash, everything else — including every `screenshots/project-manager/*` reference — came back pixelHash-identical |
| `specs/005-component-surface-system/056-board-anytype-parity/spec.md` | Modified | The seven-extension disposition table added |
| `specs/005-component-surface-system/056-board-anytype-parity/acceptance-criteria.md`, `checklist.md`, `tasks.md` | Modified | AC-002 through AC-009 moved Unmet → Met; C2-C9 ticked with the green figure beside the red one; T003-T011 ticked |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Implemented directly in worktree `132-impl-056-board` against `772bf57a`. The CSS lane
(`tools/lane/css-lane.json`) recorded `046-linked-views-notion-parity` as holder with no release
entry pointed anywhere else; its own last history entry was itself a "release" with a full
recapture and a passing gate recorded, so the lane was taken over per its own documented procedure
— recorded as a reconstruction from the evidence on disk, not a handover either phase performed
live, and named for the operator to reconcile against their own record.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Consolidate the seven extensions into dispositions on the default board rather than deleting the extensions render path outright | The path is already unreachable from any shipped UI; deleting it touches two files' worth of `BoardRendererActions` wiring outside this packet's file list for a benefit (fewer dead lines) this leg's own scope does not require |
| Retarget property-row presentation with zero changes to `board-card-fields.ts`/`board-card-properties-panel.ts` | `card-field-renderer.ts` already parameterizes the classes those files' output is styled through; a CSS-only retarget is the smallest change that satisfies ADR-003's "mechanism kept, presentation retargeted" |
| Derive nine of the ten option-colour text pairs by a same-hue WCAG-clearing rule rather than leaving them unmeasured | design-trueup.md A9 pixel-measured only amber's card-chip pair; shipping the header/chip retint for every option colour needed the other nine, and a rule that reproduces amber's own measured ratio is a documented derivation, not an invented palette |
| Rewrite the four affected `replay.mjs` claims for the new anatomy instead of leaving them red | The reversal is deliberate and documented (decision-record.md ADR-001); the ledger's own stated purpose is naming a reversal as the specific claim it broke, which these four now do explicitly rather than failing silently |
| Retire the seven-extension code from the default board only, not the whole `boardExtensionsEnabled` path | Same reasoning as the first row: the path is dead already, and removing it is a separable, larger change this leg names rather than absorbs |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0 |
| `npx vitest run` | Exit 0 — 1323 tests, 127 files |
| `npm run build` | Exit 0 |
| `npm run gate` (isolated log, `$?` read directly) | Exit 0 — 26 green, 0 red |
| `node tools/screenshots/verify.mjs` | Exit 0 — 550 entries current |
| `node tools/live/sheet-grammar.mjs` | Exit 0 — 12 surfaces, 31 stacked pairs |
| `grep -o "pm-[a-z-]*" src/views/board-renderer.ts \| sort -u \| wc -l` | **0** (was 39) |
| `grep -o "pm-kanban[a-z-]*" styles.css \| sort -u \| wc -l` | **0** (was 23) |
| `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css \| sort -u \| wc -l` | **119** (unchanged from T002's baseline) |
| Acceptance criteria | 9 of 10 Met; AC-010 is the operator's and stays Unmet |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **`boardExtensionsEnabled` and its render branch are not deleted.** Confirmed unreachable from
   any shipped UI surface, and none of the seven extensions is reachable only through it any more —
   but the dead code itself (`renderSwimlaneBoard`, the extensions-mode `renderColumn`/
   `renderSubgroup`/`renderCard`, and the rest) remains in `board-renderer.ts`. Deleting it touches
   `BoardRendererActions` and its two implementers, outside this leg's file list.
2. **Touch menu content is not pixel-reproduced.** The phone's permanent "···" opens the same
   sort/hide/delete menu the desktop hover reveals; the captured sheet's own chrome — a grab
   handle, a `Column color` disc row, a full-width `Apply` pill — is not built. The affordance and
   its visibility split (hover-only desktop, permanent touch) are faithful; the sheet's own content
   is a named gap, not a silent substitution.
3. **The multi-select tag overflow ("+3" desktop, a filled "+1" chip on phone) is not reproduced.**
   The shared `renderPropertyValue` primitive renders every tag value; clamping to three plus an
   overflow indicator would change that primitive for every card view (board, gallery, list), which
   is outside this packet's scope.
4. **AC-010 is the operator's.** The rebuilt board has not yet been read by the operator on iOS and
   desktop beside Anytype. Nothing in this repository can close that row.
<!-- /ANCHOR:limitations -->

---
