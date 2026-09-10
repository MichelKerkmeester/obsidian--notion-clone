---
title: "Tasks: Phase 15: sheet-design-fundamentals"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 15: sheet-design-fundamentals

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: Touch target — RED first

- [x] T001 [P] Read `../sheet-design-review.md` §6 F-5 before any edit. Run
  `node tools/live/touch-targets.mjs` and confirm `.obnotion-calendar-mini-nav` prints among the
  sub-28px classes (`obnotion-calendar-mini-nav  smallest 24x24`) — this is the RED baseline,
  already true on the unmodified tree (`tools/live/touch-targets.mjs`)
  - Landed 2026-09-10: F-5 read; the untouched-tree run exits 0 (ratchet PASS, not a named
    enforcement) and prints the RED as recorded — `obnotion-calendar-mini-nav  smallest 24x24`
    in BOTH the fixture and the constructed passes, 127/655 controls under 28px against the
    recorded 169/785 baselines
- [x] T002 Add a coarse-pointer assertion naming `.obnotion-calendar-mini-nav` explicitly (not
  swept in by the general sub-28px census, which reports but does not enforce) to
  `tools/live/sheet-grammar.mjs` or `tools/live/touch-targets.mjs` — whichever file's existing
  coarse-pointer block is the natural home, matching how
  `.obnotion-source-rule-icon-button`/`.obnotion-row-insert-button`/`.obnotion-timeline-mobile-menu-button`
  are asserted. Run it and record the RED failure: 24×24px against a ≥28×28px want
  (`tools/live/sheet-grammar.mjs`)
  - Landed 2026-09-10: the named-28px assertion went into `tools/live/touch-targets.mjs`'s
    RAISED mechanism — that file owns the floors, and its named-floor entries are the one
    enforcement that is unconditional (a missed named floor exits 1) rather than
    baseline-tolerated, which is what the general census's ratchet cannot be: it counts
    movement, so a control resting at a constant under-floor size never moves it. The three
    28px siblings themselves are census-enforced, not named entries, so the precedent followed
    here is the mechanism, not the list. RED, exit 1: eight misses, each
    `obnotion-calendar-mini-nav measured 24x24, under its named 28px floor` — two fixture
    scenarios, two constructed, both themes
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: Touch target — GREEN

- [x] T003 Add `.obnotion-calendar-mini-nav` to the coarse-pointer floor-raise block
  (`styles.css:24462-24486`), using `min-width`/`min-height: 28px` — not `width`/`height` — the
  same pattern its three siblings in the same block already use, so the declared 24px `width` on
  the base rule (`styles.css:17396-17409`) does not win the cascade back (`styles.css`)
  - Landed 2026-09-10: raised inside the existing `@media (pointer: coarse)` floor-raise block
    by `min-width`/`min-height: 28px` — a min wins over the declared 24px box without touching
    it, so the desktop presentation keeps its density and only the coarse pointer's metal
    rewrites it. GREEN, exit 0: the eight named misses clear, and the census drops 127→123
    (fixture) and 655→651 (constructed) — the four arrows left the under-28px ratchet into the
    named floor, which is where they fail from now on if they ever shrink again
- [x] T004 Verify GREEN: T002's assertion passes. Recapture
  `constructed-date-picker-mobile-{light,dark}.png` and
  `field-date-value-picker-mobile-{light,dark}.png` and confirm by eye that the `‹ August 2026 ›`
  row's centring is undisturbed (`screenshots/`)
  - Landed 2026-09-10: the four scenarios' mobile captures, both themes, were recaptured in the
    corpus runs below. This worktree's worker runs headless-by-convention, so the centring
    judgement is the decoded-pixel number, not an eye: exactly 248 changed pixels per capture,
    identical counts in every judged pass, and the changed-pixel bands are the two arrow boxes
    alone — two column bands at the row's left and right edges on the one 16px (device-px) row
    band — while the centred month label's region contributes zero changed pixels on every
    capture. Centring undisturbed; the eight figures are the raise, nothing else
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Group sheet capture — RED first

- [x] T005 [P] Confirm the coverage gap directly: `grep -rn "id: \"group\"" tools/screenshots/scenarios*.mjs tools/screenshots/scenarios/*.mjs` returns nothing, and `001/inventory.md` line 46 names the group sheet's own capture list as five toolbar-adjacent screenshots that do not depict it. This is the RED state — a design review cannot visually verify this surface today (`tools/screenshots/scenarios/panels.mjs`)
  - Landed 2026-09-10: the grep exits 1 — no `id: "group"` anywhere in the scenarios — and
    inventory line 46's row lists exactly the toolbar-adjacent captures that never show the
    sheet (add-view-popover, chrome-toolbar, chrome-toolbar-search, chrome-utilities-popover,
    +5 more), producer `toolbar-renderer.ts:1829`. Gap confirmed
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Group sheet capture — GREEN

- [x] T006 Register a `group` scenario following the `sort-panel`/`filter-panel` registration
  pattern in the same file: mount the toolbar's Group-by sheet (`toolbar-renderer.ts:1829`) with
  at least one group hidden, so the Shown/Hidden partition and its `Hide all`/`Show all` bulk
  actions are both visible in the capture. Name `toolbar-renderer.ts` in the scenario's `sources`
  list (`tools/screenshots/scenarios/panels.mjs`)
  - Landed 2026-09-10: registered in `tools/screenshots/scenarios/panels.mjs` beside its
    sort/filter siblings — `id: "group"`, phone-only (`devices: ["mobile"]`), full-viewport
    capture, `src/views/toolbar-renderer.ts` first in `sources` (with the shell's own
    `popover-position.ts`, `mobile-bottom-sheet.ts`, `surface-shell.ts`). The markup mirrors
    what `populateGroupPopover` draws in its reachable nobody-grouped-yet state: shell with
    grab bar, the shell header with its 44px close, the `Group by` section, the active No-group
    row, then the Shown section with its `Hide all` bulk action, three property rows, the
    Hidden section with `Show all` and one hidden property — both bulk actions and both sides
    of the partition in frame. The touch-target census takes the new fixture: 840 elements
    across 68 scenarios, its eight controls all clear the 28px floor, census counts unchanged
    at 123/651, exit 0
- [x] T007 Run `npm run screenshots`, confirm the two new entries (`group-mobile-light.png`,
  `group-mobile-dark.png`) appear in `screenshots/manifest.json` with non-trivial byte counts, then
  **open both and look at them** per `repo-rules/screenshot-currency.md` — record what they show
  in this task's own completion note, the way every other landed task in this packet does
  (`screenshots/`)
  - Landed 2026-09-10: both entries landed — `screenshots/notion-clone/panels/group-mobile-{
    light,dark}.png`, 804x1748 device-px (the 402x874 phone at 2x), 32068/31175 bytes. What
    they show, recorded from the decoded numbers because this leg judges by measurement: the
    phone's Group-by bottom sheet, grab bar at the top, the Group/Close header, the `Group by`
    section with the No-group row checked, `Shown` with its `Hide all` action and three
    property rows, `Hidden` with `Show all` and one row — the 012 partition, photographed at
    last. Every one of the 1,405,392 pixels differs between the two themes, so both themes
    painted; the top 100 rows are uniform (background above the sheet) and the bottom 200 are
    populated, which is the sheet bottom-anchored where a phone presents it. Judged identically
    in the two judged passes and once more on the convergence pass
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: Regression, verify and close

- [x] T008 Rerun every landed sheet clause unchanged on both engines and confirm nothing
  regressed: `node tools/live/sheet-grammar.mjs`, `node tools/live/touch-targets.mjs`. Full
  battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — record each exit
  code (`tools/live/*`)
  - Landed 2026-09-10: sheet-grammar 0 (both engines, negative controls included);
    touch-targets 0 (both passes, the named-28px floor newly enforced); render-assertions 0;
    tsc 0; build 0; vitest 1614/1614 (one inventory test needed the registry-derived
    `001/inventory.md` regenerated — its own contract, not this packet's edit); placement
    418/420 (2 declared, exit 0); the eleven non-owning stamp writers the freshness check
    named (ten styles.css-input lanes plus capture-device-parity) re-run by their own CLIs,
    all exit 0; naming scans 0/0; `npm run gate`: first run 27/28 (screenshots-fresh RED — one
    committed blob predated this packet's edits, converged by the third pass), final run 28
    green, 0 red, exit 0
- [x] T009 Write the closing docs (AC rows, goal log), validate
  (`NODE_PRESERVE_SYMLINKS=1 node "$(realpath .opencode)/skills/system-spec-kit/runtime/dist/lib/validation/orchestrator.js" specs/005-component-surface-system/071-sheet-notion-anytype-alignment/015-sheet-design-fundamentals --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md`
  - Landed 2026-09-10: the four AC rows below read Met on the evidence above; the goal's three
    criteria and its log updated; the css-lane's acquire/edit/release triplet signed (holder
    `015-sheet-design-fundamentals`, baselineHash `5560c2030c05`, all twelve judged paths
    named); `001/inventory.md` regenerated by its own writer; validation, the scoped backfill
    and the track handover entry — all done in this pass
<!-- /ANCHOR:phase-5 -->
