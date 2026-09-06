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
    last_updated_at: "2026-09-06T22:15:00Z"
    last_updated_by: "verification-leaf"
    recent_action: "landed R6/R7, closed two of T013's three residuals, audited the db-board-* family per-rule"
    next_safe_action: "Nothing owed here; AC-010 is the operator's own device confirmation"
    blockers:
      - "AC-010 is operator-owned and open by design"
      - "boardExtensionsEnabled and its now-fully-unreachable-from-default-board render branch (renderSwimlaneBoard and the rest) are a named, deferred code deletion — not claimed done here, pinned by AC-006's zero-lines-changed guard on board-card-properties-panel.test.ts"
    key_files:
      - "src/views/board-renderer.ts"
      - "styles.css"
      - "tools/live/replay.mjs"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-impl"
      parent_session_id: null
    completion_pct: 100
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
| **Completed** | T001 through T011 done and re-verified on the rebased tree. T012 (ten unmatched measured values) and T013 (the dead extensions branch) are open; AC-010 is the operator's |
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
- **Header**: a fully-rounded, unfilled option chip 8px in from the column's left edge — authored
  at `height: 24px` but painting **26px**, because the element is content-box and its 1px border
  sits outside that height (`tasks.md` T012 R1) — text
  coloured through the same `status-color-*` class every option value already uses, retinted for
  this view (a ten-colour bucket, tint plus a same-hue darkened/lightened text pair, derived by the
  same WCAG-clearing rule design-trueup.md only pixel-measured for amber). A hover-revealed
  "···"/"+" pair sits at the chip's right; on touch both are permanent, and a plain-text record
  count appears beside the chip — the phone's own anatomy, not the desktop's.
- **Card**: 8px radius, 1px border, no shadow at rest (a shadow on hover is kept as design
  inferred — no capture holds a pointer), 16px padding, an 18px title icon slot that renders only
  when the view opts into record icons (T012 R3), and — where the
  row has one — a type-name slot that keeps the schema's nearest content, a subtask's parent title,
  since no Objects/Types model exists to fill it literally (goal D8).
- **Property rows**: every one of 045's configured fields renders as a value-only row through the
  unchanged `card-field-renderer.ts` primitive, authored at a 25px `min-height` but measuring a
  **~28.3px pitch** for the same content-box reason as the chip (T012 R2), its label hidden by CSS except on
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
5. **Ten measured values did not reach the rendered surface**, found on a read-back after the
   rebase and tracked as `tasks.md` T012 R1-R10 and `acceptance-criteria.md` AC-011. All ten are now
   fixed — see "R6/R7 Landing and the CSS Audit" below for the last two, and `tasks.md` T012's own
   red/green tables for the full set. `render-assertions.mjs`'s board geometry pass now locks card
   radius, column width, column gap, chip height, property pitch and checkbox shape against computed
   styles, proven non-vacuous by a negative control on the card radius.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:reverification -->
## Re-Verification After the Rebase

Rebased from `772bf57a` onto `origin/main` at `793ab9b4`, which had landed `050`'s table load-more,
`052`, `054`, `055` and `057`'s calendar month-grid retarget. `board-renderer.ts` was untouched by
main; `styles.css` and `i18n.ts` auto-merged and both sides' rules survive. Generated evidence,
`screenshots/manifest.json`, the captures, `tools/live/*.json` and `tools/lane/css-lane.json` were
resolved to main's side and re-derived from the rebased tree rather than replayed.

| Check | Result on the rebased tree |
|-------|----------------------------|
| `npx tsc --noEmit` | Exit 0 |
| `npm run gate` (isolated log, `$?` read directly) | Exit 0 — **26 green, 0 red** |
| `node tools/screenshots/verify.mjs` | Exit 0 — **558 entries** current |
| Full `npm run screenshots` | **32** moved pixelHash, all board scenarios; every `screenshots/project-manager/*` capture pixelHash-identical; 5 byte-only re-encodes restored and the manifest byte counts re-synced |
| `node tools/live/sheet-grammar.mjs` | Exit 0 — 12 surfaces, 31 stacked pairs |
| Card-property suites | 19 of 19; `board-card-fields.ts` and `board-card-properties-panel.ts` **0 lines changed against `origin/main`** |
| `pm-*` in `board-renderer.ts` / `pm-kanban-*` in `styles.css` / `pm-gantt-*` | **0 / 0 / 119** |
| `git diff --stat origin/main -- src/views/calendar-timeline-*` | Empty; gantt guard suites 34 of 34 |
| `node tools/lane/check-lane.mjs` | Green — main's 297 history entries preserved, this phase's acquire and release appended |

Two things changed during the re-verification rather than being recorded as findings. A code comment
in `tools/live/render-assertion-harness.ts` carried a packet number and an acceptance-criterion id,
which this repository's comment-hygiene rule forbids; it was rewritten to keep the durable reason.
And the ten-record page limit put the shared group-expand control at the foot of every over-limit
column, twenty controls newly under the project's 28px coarse-pointer floor — given a board-scoped
`min-height` it clears the floor, so `touch-targets-constructed-baseline.json` stays at **1304**
rather than being raised. No capture moved for it.
<!-- /ANCHOR:reverification -->

---

<!-- ANCHOR:r6r7-and-css-audit -->
## R6/R7 Landing and the CSS Audit

The follow-up leg the operator's ruling opened. Two colour rows plus the CSS-lane's own outstanding
note on the `db-board-*` family, landed together in one stylesheet edit.

### The tint/text pairs, per colour, per theme

Every option colour the kanban view can render, `--db-status-bg` (tint) and `--db-status-fg` (text),
checked against WCAG 1.4.3's 4.5:1 both on the tint (what the chip actually shows) and on the page
background (`#FFFFFF` light / `#171717` dark), with a throwaway script
(`scratch/palette-contrast.mjs`, not part of the gate — the repo's own WCAG relative-luminance
formula, cross-checked against the figures already in `design-trueup.md` A9).

| Colour | Theme | Tint | Text | Text-on-tint | Text-on-page |
|---|---|---|---|---|---|
| Grey / slate / ungrouped | light | `#E3E3E3` | `#656565` | 4.54:1 | 5.83:1 |
| Grey / slate / ungrouped | dark | `#414141` | `#ADADAD` | 4.55:1 | 7.99:1 |
| Brown / orange (amber) | light | `#F9DEBA` | `#915608` | 4.57:1 | 5.93:1 |
| Brown / orange (amber) | dark | `#74390D` | `#F7A669` | 4.55:1 | 9.06:1 |
| Yellow | light | `#FCEFB4` | `#7E6807` | 4.69:1 | 5.43:1 |
| Yellow | dark | `#6C621A` | `#EBDF89` | 4.54:1 | 13.19:1 |
| Green / lime | light | `#DEF2C1` | `#49730D` | 4.70:1 | 5.61:1 |
| Green / lime | dark | `#3C5115` | `#A4DB3D` | 5.37:1 | 10.91:1 |
| Blue / indigo | light | `#DDE3FB` | `#0B35DA` | 6.49:1 | 8.28:1 |
| Blue / indigo | dark | `#20347C` | `#8FA3EA` | 4.66:1 | 7.34:1 |
| Purple / violet | light | `#E6D7FE` | `#5B0BDA` | 6.19:1 | 8.38:1 |
| Purple / violet | dark | `#512789` | `#BF9EEB` | 4.65:1 | 7.94:1 |
| Pink / rose | light | `#F6D2E7` | `#B51271` | 4.65:1 | 6.38:1 |
| Pink / rose | dark | `#7D2543` | `#EA9FB8` | 4.58:1 | 8.67:1 |
| Red | light | `#F8DFD2` | `#AD420B` | 4.63:1 | 5.90:1 |
| Red | dark | `#7A271C` | `#EE9C91` | 4.59:1 | 8.37:1 |
| Cyan | light | `#C9E6F9` | `#0967A5` | 4.63:1 | 6.01:1 |
| Cyan | dark | `#174A6F` | `#79BCEC` | 4.55:1 | 8.72:1 |
| Teal | light | `#CFEEED` | `#1B7471` | 4.52:1 | 5.55:1 |
| Teal | dark | `#204D4A` | `#51C7BF` | 4.62:1 | 8.77:1 |

All 20 rows (10 colours x 2 themes) clear 4.5:1 on both measures. Grey is the tightest pair at
4.54:1; every other colour carries more headroom. Only the grey/slate/ungrouped row changed in this
leg (R7); the header chip's fill (R6) is a structural change — `background: var(--db-status-bg,
transparent)` instead of `transparent` — that applies this same table to the header for the first
time rather than changing any of the values in it. **Neutral pair chosen for R7**: a true achromatic
grey (equal R/G/B, zero saturation) at `#656565`/`#E3E3E3` light and `#ADADAD`/`#414141` dark —
darker than the source's own `#888888`/`#A8A8A8` because this text sits on the tint rather than on
the page, which is the reconciliation `decision-record.md` ADR-007 named as the likely shape and
this leg confirms.

### The `db-board-*` CSS audit

The CSS lane's own outstanding note called this family *"largely dead"* and asked for *"a per-rule
audit, not a section delete."* Every `db-board-*` selector in `styles.css` before this leg, checked
against a live construction site in `src/views/*.ts` (excluding tests):

| Selector | Built by | Disposition |
|---|---|---|
| `.db-board-card-field`, `.db-board-card-field-label` | `board-renderer.ts` (`renderReferenceBoard`'s field call) | **Kept** — live |
| `.db-board-card-field-wrap` | `card-field-renderer.ts` (`${fieldClass}-wrap`, appended when a field opts into wrap) | **Kept** — live, built dynamically |
| `.db-board-card-value` | `board-renderer.ts`; also `record-detail-panel.ts` (shared field renderer) | **Kept** — live |
| `.db-board-card-badges` | `board-renderer.ts`; also `record-detail-panel.ts` | **Kept** — live |
| `.db-board-card-link` | `board-renderer.ts`; also `record-detail-panel.ts` | **Kept** — live |
| `.db-board-card-cover`, `-cover-button`, `-cover-placeholder` | `board-renderer.ts` | **Kept** — live |
| `.db-board-card-open` | `record-surface/record-header.ts` (record detail panel's open-note button) | **Kept** — live, shared with the detail panel |
| `.db-board-column-options` | `board-renderer.ts` (kanban column's `···`/`+` controls, under `.db-kanban-col-controls`) | **Kept** — live |
| `.db-board-column`, `-column-header`, `-column-header::before`, `-column-topbar`, `-column-checkbox`, `-column-resize-handle(::after)`, `-column-title`, `-count`, `-header-text`, `-header-summaries` (+ children) | Only the retired extensions-mode `renderColumn` | **Deleted** — dead |
| `.db-board-cards`, `-drop-target`, `-drop-indicator(.is-before/.is-after)`, `-empty-slot` (both selector forms) | Only the retired extensions-mode board | **Deleted** — dead |
| `.db-board-subgroups`, `-subgroup(.is-drop-target)`, `-subgroup-header(::before)`, `-subgroup-checkbox`, `-subgroup-title`, `-subgroup-count`, `-subgroup-toggle` | Only the retired extensions-mode `renderSubgroup` | **Deleted** — dead |
| `.db-board-card` (base, `:hover`, `.is-dragging`, `.is-drop-target`, `.is-drop-before`, `.is-drop-after`, `[data-subtask-depth]`), `-card-priority-strip`, `-card-body`, `-card-parent`, `-card-title`, `-card-chips`, `-card-chip`, `-card-controls`, `-card-checkbox`, `-card-meta`, `-card-meta .db-cell-progress`, `-card-images`, `-card-image-button`, `-card-more` | Only the retired extensions-mode `renderCard` | **Deleted** — dead |
| `.db-board-new-card`, `-add-group-trigger`, `-add-column`, `-add-group-*` (confirm/cancel/color-preview) | Only the retired extensions-mode column footer | **Deleted** — dead |
| `.db-board-drag-group-preview` (+ children `-drag-count`, `-drag-stack`, `-drag-stack-card`) | Only the retired extensions-mode drag handler | **Deleted** — dead |
| `.db-board-header-text > .db-board-column-title`/`-subgroup-title`, `.db-board-column-title`/`-subgroup-title > .status-badge`, `.db-board-column-header .db-board-group-toggle`, `.db-board-subgroup-header .db-board-subgroup-toggle` | Only the retired extensions-mode header row | **Deleted** — dead |
| `.db-board-card-title .db-file-title-name`, `.db-board-card:hover .db-file-title-prefix` | Only the retired extensions-mode card title | **Deleted** — dead |
| `@media (hover: hover) { .db-board-column-header:hover … }`, `@media (hover: hover) { .db-board-card:hover … }`, `@media (hover: none) { .db-board-column-resize-handle … }`, `@media (prefers-reduced-motion: reduce) { .db-board … }` | Only the deleted rules above | **Deleted** — empty husks the cut left behind, removed rather than left as dead braces |

**Count.** 11 selector families kept (all cross-checked against a real construction site above), 24
selector families plus 4 now-empty media-query husks deleted. `--db-board-column-width` had exactly
one reader — `.db-board-column`'s own `flex-basis` fallback — and left with the rest of that rule
rather than being assigned a value nothing then reads; `grep -rn "db-board-column-width"
styles.css src/` now returns nothing. Verified: `grep -oP '\.db-board-[a-z-]+' styles.css | sort -u`
returns exactly the 11 kept selector roots, zero of which lack a live construction site.
<!-- /ANCHOR:r6r7-and-css-audit -->

---
