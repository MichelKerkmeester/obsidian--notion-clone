---
title: "Implementation Summary: Notion Dropdown, Menu and Picker Refinement"
description: "What landed: the trailing check across the family, the desktop sheet escalation, resolved date presets, and the option colour picker rebuilt as a labelled list."
trigger_phrases:
  - "063 implementation summary"
  - "notion dropdown refinement summary"
  - "what shipped"
  - "validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/063-notion-dropdown-refinement"
    last_updated_at: "2026-09-07T08:10:00Z"
    last_updated_by: "landing-evidence-closure-session"
    recent_action: "Closed T018-T021 (3 landing-verification evidence gaps); gate 26 green"
    next_safe_action: "Operator closes T013/AC-011"
    blockers:
      - "T008/AC-007 blocked on 052's open T008 and T009 (caller files owned there)"
      - "T013/AC-011 is the operator's and is never ticked by an agent"
    key_files:
      - "src/views/dropdown-field.ts"
      - "src/views/option-color-picker.ts"
      - "src/views/date-value-picker.ts"
      - "tools/live/render-assertion-harness.ts"
      - "tools/live/render-assertions.mjs"
      - "tools/screenshots/constructed-scenarios.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-063-summary"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Which surfaces the escalation's estimate-based cramped condition selects, against the operator's own judgement (AC-011)"
    answered_questions:
      - "The cramped condition is decided upfront from the family's own row/search/section tokens, not a full pre-render — avoids unwinding createDropdownField's trigger-to-input conversion"
      - "The colour picker's leading dot is a dedicated 16px class, not the existing 12px chip dot"
      - "date-value-picker.ts's todayKey read the real clock instead of the shared renderNow() seam"
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
| **Spec Folder** | 063-notion-dropdown-refinement |
| **Completed** | 14 of 16 acceptance criteria Met; T008/AC-007 blocked on `052`; T013/AC-011 is the operator's |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Four independent changes to the dropdown/menu/picker family, each closing a criterion `goal.md` §3
recorded red on the rebased tree:

1. **The selection check now trails.** `dropdown-field.ts`'s row builder creates the check last —
   icon, label, swatches, check — instead of first, and the `.db-dropdown-option` grid tracks
   (container scope plus three body-mounted duplicates found while inventorying the blast radius:
   `.db-column-menu-subpopover`, `.db-dropdown-popover-context-settings`/`-context-modal`,
   `.db-displayopt-dropdown-popover`) moved the check's 16px track from leading to trailing. Four
   `column-menu.ts` rows that build the identical class by hand (Change type, Number display
   style x2, text-render/link-scheme) were reordered alongside the primitive, since leaving them
   would have broken the moment the shared grid changed under them.
2. **A cramped desktop dropdown escalates to a sheet.** `positionToolbarPopover` gained a
   `forceSheet` option that reuses the phone sheet's own chrome, placement and overlay-stack
   registration verbatim. The cramped decision itself is a new pure helper
   (`resolveDesktopDropdownFit`, unit-tested) fed a natural-height estimate from the family's own
   row/search/section tokens — computed upfront, before `createDropdownField` decides whether to
   turn its trigger into the query field, so the primitive never has to build the anchored shape
   and unwind it. Desktop search stays unconditional through the escalation for free, because the
   escalated surface is exactly the shape that already builds an in-panel search row.
3. **Each relative date preset carries its resolved date.** `date-value-picker.ts`'s three presets
   gained a `.db-date-preset-subline` under each label, built with the repository's own
   `formatDateValueDisplay` — not a new formatter. `.db-date-preset` stacks the two lines and grew
   a 44px phone floor it did not have before.
4. **The option colour picker is a one-column labelled list.** `option-color-picker.ts` no longer
   builds `db-color-picker-swatch` buttons; it builds `.db-dropdown-option` rows — a 16px leading
   dot, the colour's name through `t()`, a trailing check on the current colour — with list
   (not grid) keyboard navigation. `SWATCH_PICKER_POPOVER` moved from 124 to 224, and the grid's
   own stylesheet block (including its phone-specific 44px swatch rules) was deleted rather than
   left inert. Sixteen colour-name keys were added to `src/i18n.ts` (en/zh-CN/zh-TW).
5. **A landing-verification pass closed three evidence gaps in the four rows above, rather than
   changing any of them.** A re-read of the landed tree found: no capture existed of the desktop
   sheet escalation actually firing (every dropdown capture on file was the ordinary popover or the
   phone sheet); the colour picker's own 16-row/0-swatch assertion in
   `render-assertion-harness.ts` was written but never selected into any gate lane's executed set,
   so a regression to the old swatch grid would have passed silently; and the three
   `constructed-date-picker-*` captures baked in the real day they were taken because
   `date-value-picker.ts` read the system clock directly instead of the shared frozen-clock seam
   the rest of the constructed bundle already uses. `tasks.md` T018-T021 record each gap red before
   its fix.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/dropdown-field.ts` | Modified | Trailing check; the desktop-sheet escalation branch and its estimate helper |
| `src/views/column-menu.ts` | Modified | Four check-first rows reordered alongside the shared grid they share with the primitive |
| `src/views/popover-position.ts` | Modified | `forceSheet` option; `resolveDesktopDropdownFit` pure helper |
| `src/views/date-value-picker.ts` | Modified | Resolved-date subline per preset |
| `src/views/option-color-picker.ts` | Modified | Rebuilt as a labelled list; list navigation replaces grid navigation |
| `src/views/popover-host.ts` | Modified | `SWATCH_PICKER_POPOVER` 124 → 224 |
| `src/i18n.ts` | Modified | 16 `optionColor.*` keys, three locales |
| `styles.css` | Modified | Trailing-check grid tracks (4 scopes); desktop-sheet escalation reuses existing sheet rules; date-preset stacking + phone floor; colour-picker swatch grid deleted, list rules added |
| `src/views/dropdown-field.test.ts` | Modified | Desktop-sheet escalation describe block |
| `src/views/popover-position.test.ts` | Modified | `resolveDesktopDropdownFit` cases |
| `src/views/option-color-picker.test.ts` | Created | Row count, dot/label/check shape, i18n, keyboard, phone sheet |
| `tools/live/constructed-state-assertions.mjs` | Modified | `dropdownPopover`/`colorPicker` markers assert the new shapes |
| `tools/live/render-assertion-harness.ts` | Modified | `color-picker` scenario assertion rewritten for rows, not swatches |
| `tools/screenshots/scenarios/core.mjs` | Modified | Dropdown fixture DOM order + comment |
| `tools/screenshots/scenarios/fields.mjs` | Modified | Date-preset subline markup; colour-picker fixture rebuilt, phone variant now branches on device to show the real sheet |
| `tools/storybook/verify-placement.mjs` | Modified | Retired the swatch-grid-specific measurement the rebuild made moot; the unrelated chip-distinctness check stays |
| `specs/.../052-.../goal.md` | Modified | Two stale "Today:" criterion texts refreshed against the landed tree (T010; ticks nothing) |
| `tools/lane/css-lane.json` | Modified | Acquired from `058`, released at `07578ed6d5e4` naming 42 reviewed captures; taken over again from `059` at `fc00d8134c97` (unmoved — no stylesheet edit) for the evidence-closure pass, releasing naming 18 more |
| 42 `screenshots/**/*.png` | Re-captured | Real content moved by this leg's own sources |
| `tools/live/render-assertion-harness.ts` | Modified again | Added the `dropdownDesktopSheet` `ScenarioSpec` option and its dispatch branch |
| `tools/live/render-assertions.mjs` | Modified | Wired `field-option-color-picker`'s scenario into the selected-assertion filter |
| `tools/screenshots/constructed-scenarios.mjs` | Modified | Registered the desktop-only `constructed-dropdown-desktop-sheet` scenario; added `devices` passthrough |
| `tools/screenshots/constructed-capture.test.mjs` | Modified | Registered-scenario-id list updated for the new entry |
| `tools/screenshots/scenarios/fields.mjs` | Modified again | Fixed the "Aug 21"-style abbreviated presets to the product's own "August 21" format |
| `src/views/date-value-picker.ts` | Modified again | `todayKey` now reads `renderNow()` instead of the real system clock |
| 18 `screenshots/**/*.png` | Re-captured | 8 `constructed-date-picker(-datetime)-*` (frozen clock), 8 `field-date-value-picker(-datetime)-*` (fixture text), 2 `constructed-dropdown-desktop-sheet-*` (new scenario) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Followed `tasks.md` T001 through T017 in dependency order: the red-first assertion and inventories
(T001-T003) before the check flip (T004-T005); the CSS lane hold before any stylesheet edit; the
escalation (T006-T007) after the flip landed; the date presets (T009) and the `052` text refresh
(T010) independently; the colour-picker inventory (T014) before its rebuild (T015-T017). T008 (the
four submenu rows riding `052`'s open T008/T009) was re-checked against the rebased `origin/main`
and stays `[B]` — those legs are still open there, so the caller files stay theirs per D4. T013 is
the operator's alone.

Verification ran in the order the packet specifies: `npx tsc --noEmit`, `npx vitest run`,
`npm run build`, the two named `tools/live/*.mjs` checks, then `npm run gate` once in the
foreground. The gate's first run surfaced two red lanes this leg's own edits caused
(`operator-list`, stale after `tasks.md`/`052/goal.md` rows changed; `evidence`, eight artefacts
recorded against the pre-edit `styles.css`/`popover-position.ts` hashes) — both closed by
re-running their own generators, not by editing recorded numbers. The second run: 26 green, 0 red.

A later landing-verification pass (T018-T021) found the recorded evidence for three of the rows
above did not hold up to a second read and closed each gap without touching `goal.md`,
`decision-record.md`, or any already-`[x]` criterion: added the `dropdownDesktopSheet` scenario and
captured it (T018); wired the colour picker's own assertion into `render-assertions.mjs`'s
selection, proving it red with a temporarily-reintroduced swatch and green with it removed (T019);
pointed `date-value-picker.ts` at the shared `renderNow()` seam and recaptured the eight captures
that had been reading the real clock, plus a one-line fixture-text fix the same review surfaced
(T020). Verification (T021) reran the full stack; the gate's first pass went red on `css-lane`
because this pass moved eighteen captures with no stylesheet edit, closed by taking the lane over
from its current holder at its own released hash and releasing again naming all eighteen. Second
run: 26 green, 0 red.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The cramped condition is an upfront estimate, not a full-panel measurement | The decision has to be made before `createDropdownField` decides whether to convert its trigger into the query field; measuring the fully-built anchored panel would mean building that conversion and unwinding it on escalation. The estimate reuses the exact same box math (`resolveAnchoredPopoverBox`) the real anchored placement uses, fed the family's own row/search/section-height tokens instead of a rendered height |
| `forceSheet` reuses `applySheetChrome`/`placeSheet` rather than a second sheet host | The escalation gets the same chrome, drag-to-dismiss and overlay-stack registration a phone sheet gets for free, and `044`/`048`'s lanes cover it without a second implementation to keep green |
| Four `column-menu.ts` rows were fixed alongside the shared grid, not left for a later leg | They build the identical `.db-dropdown-option`/`.has-icon` class by hand; leaving them check-first while the shared CSS moved to a trailing track would have broken them the moment this leg's own edit landed — a blast-radius fix, not scope creep |
| The colour picker's leading dot is its own 16px class, not the existing 12px chip dot | `.db-option-color-dot` is sized for a cell's own row height, not this list; ADR-004's Constraints record the deviation from Anytype's 28px row in favour of the family's own 30px, for the same reason |
| T008 stays `[B]` rather than opening `column-menu.ts`/`toolbar-renderer.ts` alone | `052`'s D6 and this packet's D4: one leg, one file group. Re-checked against the rebase rather than assumed from the packet's own prior text |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0, no output |
| `npm run build` | Exit 0, `main.js` rewritten |
| `npx vitest run` | Exit 0 — 143 files, 1534 tests |
| `node tools/live/sheet-grammar.mjs` | Exit 0 — every registered surface green, both engines |
| `node tools/live/render-assertions.mjs` | Exit 0 |
| `node tools/live/constructed-state-assertions.mjs` | Exit 0 — `dropdownPopover: true`, `colorPicker: true` |
| `node tools/naming/scan-comments.mjs` | Exit 0 — 0 artifact-id violations |
| `node tools/naming/scan-failing-values.mjs` | Exit 0 |
| `npm run screenshots:verify` | Exit 0 — 588 entries current |
| `node tools/lane/check-lane.mjs` | Exit 0 — release names all 42 changed captures |
| `SURFACE_PHASE=063-notion-dropdown-refinement npm run gate` | Exit 0 — **26 green, 0 red** |

**T018-T021 (landing-verification evidence closure):**

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0, no output |
| `npx vitest run` | Exit 0 — 145 files, 1576 tests (`constructed-capture.test.mjs`'s id list updated) |
| `npm run build` | Exit 0, `main.js` rewritten |
| `node tools/live/render-assertions.mjs`, colour-picker assertion unwired | Exit 0 with one swatch reintroduced — the gap, reproduced |
| `node tools/live/render-assertions.mjs`, wired, one swatch reintroduced | Exit 1 — `field-option-color-picker/file-view: … — 16 row(s)` |
| `node tools/live/render-assertions.mjs`, wired, swatch reverted | Exit 0 — same assertion `PASS` |
| `npm run screenshots` | 598 entries (up from 588) |
| `node tools/screenshots/verify.mjs` | Exit 0 — 598 entries current |
| `node tools/lane/check-lane.mjs`, before the takeover | Exit 1 — 18 changed capture(s) `059`'s release does not name |
| `node tools/lane/check-lane.mjs`, after the takeover/release | Exit 0 — release names all 18 changed capture(s) |
| `npm run gate` (foreground, `</dev/null`) | Exit 0 — **26 green, 0 red** |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-007 (submenu current values) is unmet.** `052`'s T008/T009, which own `column-menu.ts` and
   `toolbar-renderer.ts`, are still open on `origin/main`. This packet's own scope rule (D4) keeps
   the four rows waiting rather than opening those files alone.
2. **AC-011 (the operator's own read) is open by design.** Only the operator can close it, on iOS
   and on desktop, under their own theme.
3. **The escalation's no-room fallback is not independently exercised.** A full-width,
   `90svh`-capped sheet has no reachable "no room either" case under the current placement math, so
   no fabricated failure path was written to prove it; recorded rather than silently claimed.
4. **The cramped-condition estimate is a natural-height estimate, not a measurement of the fully
   built panel.** It is fed the family's own row/search/section tokens (30/44/28px) rather than a
   pre-rendered height, a deliberate tradeoff (see Key Decisions) that trades a small amount of
   precision for avoiding a DOM-surgery path through `createDropdownField`'s trigger-to-input
   conversion.
5. **`051` ADR-005 (E3's structure-removal carve-out) is closed, not open.** The operator **Declined**
   the carve-out on 2026-09-06 19:08 — `051` E3 stands whole, "keep red plus icon everywhere". It
   gates no P0 row this packet closes either way.
<!-- /ANCHOR:limitations -->

---
