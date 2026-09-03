---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "template"
  - "impl summary core"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/041-shared-ui-ux-port"
    last_updated_at: "2026-09-03T21:04:00Z"
    last_updated_by: "reduced-motion-descendant-fix"
    recent_action: "Closed known limitation 4: owned-menu reduced motion, .db-surface added"
    next_safe_action: "Verify timeline trigger, link dots and owned-menu motion on a device"
    blockers:
      - "Not operator-confirmed: no capture was read on a real device, only in the harness"
      - "The empty-state p margin is fixed in styles.css but the hand-typed empty-state fixture still does not reach the changed element, so no capture proves it"
      - "T012's cross-surface polish is limited to the timeline; the board is 038's and the calendar was left alone"
      - "npm run gate carries one pre-existing red (placement: a CM6 Live Preview widget paint-containment case), reproduced identically against unmodified styles.css and unrelated to this fix; it predates this session and needs its own body-portal fix elsewhere"
    key_files:
      - "styles.css"
      - "src/views/calendar-timeline-renderer.ts"
      - "tools/screenshots/scenarios/temporal.mjs"
      - "tools/screenshots/scenarios/temporal-tick-parity.test.mjs"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "041-shared-ui-ux-port-leg-a"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "The settings reconciliation adds a first-class PluginSettings.defaultViewType field now, rather than deferring to 037/038: no board/timeline display consumer exists in-tree yet, so the field ships with a normaliser and no dependent behaviour"
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
| **Spec Folder** | 041-shared-ui-ux-port |
| **Completed** | 2026-09-03 (leg a and leg b) |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Leg a reconciles three pieces of the shared accessibility/settings vocabulary named in `spec.md`
and `tasks.md` T005, T008 and T009: the empty-state body element, the display-width toggle's
announced state, and a default-view setting. All three were verified red-first by a fresh
in-runtime reviewer, then green, without touching the local bottom sheet, table, calculation
layer, board seam, or the roving-tabindex controller.

### Empty-State Body Element

`EmptyStateRenderer` rendered its message in a `div`; the reference shape (`EmptyState.ts:10-37`)
uses a paragraph. `content.createDiv` became `content.createEl("p", ...)`, and the copy catalog's
`message` field was renamed to `body` to match the reference term. The caller-facing option
(`options.message`) and the i18n keys keep their historical names, since other surfaces read them
directly and renaming those was out of this leg's scope.

### Toggle State Language

The display-width toggle button styled its active state with an `is-active`/`is-inactive` class
but never announced it to assistive tech. `toolbar-renderer.ts:1557-1558` now sets
`aria-pressed` from the same `current === "wide"` condition already driving the class, leaving the
disclosure-trigger helper (`setPopoverTriggerState`, `:2111-2114`) on its separate
`aria-expanded`/`is-open` language, unchanged.

### Default View Setting

`settings.ts` gained `DEFAULT_VIEW_TYPES` (table, board, list, chart, calendar, timeline — gallery
excluded as legacy-only) and `normalizeDefaultViewType`, which falls back to `table` for any
unrecognised stored value. `SettingsTab.display()` renders a new dropdown row bound to
`PluginSettings.defaultViewType` (`types.ts:666-667`), localized through three new i18n keys
(`settings.defaultView.name`/`.desc`) in `en`, `zh-CN` and `zh-TW`. No creator path consumes the
field yet; it ships as data with no dependent behaviour, matching the open question `goal.md`
recorded for this leg.

### Leg B: Shared Tokens, Focus, Motion and the Timeline's Nested Control

Leg B lands the stylesheet half of the same vocabulary plus one real accessibility defect. The
timeline event bar was a `button` that contained two `span[role="button"]` link dots: interactive
content nested inside a button, which no assistive technology is required to expose and which the
HTML parser is entitled to reshape. The bar is now a `div[role="group"]` holding a native
`button.db-timeline-event-trigger` that fills it, with the two link dots as native sibling buttons.
Enter and Space work because the elements are buttons, so the hand-rolled `keydown` handler that
simulated them is gone, and the trigger's click guard against presses on the dots and the resize
handles went with it: those are siblings of the trigger now, so a press on one never reaches it. Tab order follows the DOM: trigger, left dot, right dot.

The trigger reaches 4px above and below the 20px bar to make a 28px target. Rows are 24px on a
28px pitch, so the reach stops exactly at the midpoint between two bars and steals nothing from
the neighbour. `touch-targets` measured the effect: 277 controls under 28px before, 253 after,
against an unchanged baseline of 279, because a timeline bar is no longer itself a 20px button.

Alongside it: four semantic role tokens (`--db-text-primary`, `--db-text-secondary`,
`--db-surface-interactive`, `--db-surface-interactive-hover`), a `.db-surface` arm on the accent
focus ring so a menu portalled to the body gets a focus ring rather than the host's default, and
`margin: 0` on `.db-empty-card-message` — the CSS leg that leg a's own limitations list recorded as
outstanding once the body element became a `p`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/empty-state-renderer.ts` | Modified | `div` to `p` body element; copy catalog `message` to `body` |
| `src/views/toolbar-renderer.ts` | Modified | Display-width toggle announces state via `aria-pressed` |
| `src/settings.ts` | Modified | `DEFAULT_VIEW_TYPES`, `normalizeDefaultViewType`, default-view dropdown row |
| `src/data/types.ts` | Modified | `PluginSettings.defaultViewType?: DatabaseViewType` |
| `src/i18n.ts` | Modified | `settings.defaultView.name`/`.desc` in en, zh-CN, zh-TW |
| `src/views/empty-state-renderer.test.ts` | Modified | Pins the icon/title/body/action shape with a paragraph body |
| `src/views/toolbar-renderer.test.ts` | Created | Pins `aria-pressed` on the width toggle; keeps disclosure triggers off it |
| `src/settings.test.ts` | Created | Pins the default-view row, persistence, gallery exclusion, normaliser |
| `src/views/card-roving-tabindex.test.ts` | Modified | Pins 2D roving-tabindex coverage already present in the controller |
| `src/views/accessibility-defects.test.ts` | Modified | Regex re-anchored to the disclosure helper's signature |
| `styles.css` | Modified | Leg B: semantic role tokens, `.db-surface` focus arm, empty-state margin, timeline trigger and link-dot rules |
| `src/views/calendar-timeline-renderer.ts` | Modified | Leg B: event bar to `div[role=group]` with a native trigger and native sibling link dots |
| `tools/screenshots/scenarios/temporal.mjs` | Modified | Leg B: fixture mirrors the new markup and the renderer's clipped-start/end classes |
| `tools/screenshots/scenarios/temporal-tick-parity.test.mjs` | Modified | Leg B: parity test pinning fixture and renderer to the same classes and native controls |
| `tools/lane/css-lane.json` | Modified | Leg B: lane re-acquired against `038`'s release and released naming 19 reviewed captures |
| `screenshots/` (18 PNGs + manifest) | Modified | Leg B: recapture after the markup and stylesheet change |
| `tools/live/*.json` (16 artefacts) | Modified | Leg B: re-measured after the stylesheet and renderer edit |
| `styles.css` | Modified | Reduced-motion follow-up: `.db-surface` leads the container-wide reset's selector list so a body-portalled owned menu is covered |
| `src/views/owned-menu-reduced-motion.test.ts` | Created | Red-first source-string test pinning `.db-surface` in the container-wide reduced-motion block |
| `screenshots/manifest.json` | Modified | Reduced-motion follow-up: `sourceHashes.styles.css` refreshed for all 268 entries; `layoutHash`/`bytes` restored for the 10 entries whose PNG was reverted as harness noise |
| `tools/live/*.json` (16 artefacts) | Modified | Reduced-motion follow-up: re-measured after the stylesheet edit |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

A fresh in-runtime reviewer ran each change red-first: the empty-state body assertion failed with
`expected 'div' to be 'p'` before the element change; the new toolbar-renderer test's source-string
assertion for `aria-pressed` failed to match (a contain failure) before that line was added; and
`settings.test.ts` failed with `expected undefined to be defined` against the not-yet-existing
default-view row before `DEFAULT_VIEW_TYPES`, `normalizeDefaultViewType` and the dropdown landed.
All four went green after: `empty-state-renderer.test.ts` (25), `toolbar-renderer.test.ts` (3),
`settings.test.ts` (4) and `card-roving-tabindex.test.ts` (13) total 45/45. Roving tabindex needed
no controller change — `card-roving-tabindex.ts` carries no diff — only new tests confirming the
2D board-column navigation the reference's active/focus language calls for was already reconciled.

`accessibility-defects.test.ts`'s disclosure-trigger regex was re-anchored to
`setPopoverTriggerState`'s parameter signature instead of matching anywhere in the file, so it no
longer trips on the toggle's own legitimate `aria-pressed`; the assertion is tighter, not weaker,
and the helper still never sets `aria-pressed`. One comment-scan hit surfaced in the new
`toolbar-renderer.test.ts` and was reworded before landing.

Independently re-run by this review: `npx tsc --noEmit` exits 0; `npx vitest run` reports 787
tests passing across 83 files; `npm run lint` reports 169 problems (156 errors, 13 warnings),
matched exactly against a disposable `git worktree add --detach HEAD` checkout, confirming no new
lint debt; `node tools/naming/scan-comments.mjs` reports 0 hits; `node
tools/naming/scan-failing-values.mjs` exits 0 (PASS, no newly ticked criterion without its failing
value). `git diff --stat` confirms `mobile-bottom-sheet.ts`, `table-renderer.ts`, `calc*.ts` and
`board-renderer.ts` carry no changes in this worktree.

### Leg B, and the rebase that had to come first

Leg B arrived as an external leg written against a branch that predated `a6fcd31`. In the interval
`038` landed the board's stylesheet and rewrote `tools/screenshots/scenarios/shared.mjs` with a new
containment parity test, and the external leg had done the same board work independently. The
branch was checkpointed, rebased onto `origin/main`, and the collision resolved one hunk at a time:
`038`'s board section won whole, so the board region of `styles.css` is byte-identical to
`a6fcd31`, and `shared.mjs` merged to nothing because the two versions were byte-identical anyway.
`shared.test.mjs` differed from `038`'s only in comment prose and `038`'s was kept. Seven textual
conflicts in the board region were each read and resolved to `038`, and the board hunks that had
auto-merged were reverted, including one that would have left two competing `.db-board-card-chip`
rules in the cascade and turned a transparent card button opaque.

The generated artefacts conflicted the same way. `screenshots/manifest.json` was resolved per hash —
each renderer's hash from the leg that owns that file, `styles.css`'s from the rebased base — and
the `tools/live/*.json` measurements were taken from `main` and re-measured afterwards, since a
merged measurement would describe a tree that never existed.

Three things in the leg were dropped rather than shipped. `--db-text-tertiary` and
`--db-border-control` had 0 uses. An `animation: none` reset for `.db-overlay-enter` guarded an
animation that class never has; it carries a transition only. A `.db-mobile-bottom-sheet` arm on the
focus selector was redundant, because `mobile-bottom-sheet.ts:175` already adds
`note-database-container` to the portalled panel, so the existing arm reaches it in every state. One
was corrected rather than dropped: a phone card move button had gone from `transparent` to
`var(--db-surface-interactive, transparent)`, which resolves to `--background-primary` and is opaque;
the fallback had been mistaken for the effective value.

One change in the leg was kept after a closer look and is worth naming, because it moves what the
captures depict: the fixture now emits the renderer's `is-clipped-start` and `is-clipped-end`
classes, so a bar running past the window edge loses its accent cap and fades as the renderer draws
it. A third, `is-all-day` on every event unconditionally, was removed — the renderer sets it only
for a date column, and the parity test had pinned it, which would have washed out every gantt bar
the 1.4.4 landing gave its fill.

Independently re-run after the rebase: `npx tsc --noEmit` exits 0; `npm run build` exits 0 (`main.js`
is a release artefact here and was restored, not committed); `npx vitest run` reports 791 tests
across 84 files; `npm run lint` reports 169 problems, measured against the same 169 by putting
`HEAD`'s `calendar-timeline-renderer.ts` back in the tree and re-running; `scan-comments` and
`scan-failing-values` exit 0; `check-lane` exits 0 both held and released; `evidence --check-all`
reports all 16 artefacts fresh; `npm run gate` is 25 green with `SURFACE_PHASE` set and bare.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Copy catalog field renamed `message` to `body`, i18n keys and the caller option kept their names | Matches the reference's internal term without forcing a rename other surfaces would have to follow |
| `aria-pressed` set from the same condition already driving the `is-active` class | One source of truth for the toggle's state; no separate boolean to drift out of sync |
| `accessibility-defects.test.ts` regex scoped to the helper's parameter signature rather than dropped or loosened further | The toggle button legitimately carries `aria-pressed` now; a whole-file scan would wrongly fail on it, so the check narrows to the disclosure helper it was written to police |
| `defaultViewType` ships with no consumer | No board/timeline creator path reads it yet; adding one was out of this leg's named scope (T008), and the field's own tests (normaliser, gallery exclusion) stand on their own |
| Roving tabindex left uncoded | `card-roving-tabindex.ts` already matched the reconciled active/focus language; the leg only needed tests proving it, not a rewrite |
| The board keeps `038`'s stylesheet whole; the external leg's board restyle was dropped | Two independent attempts at the same section, and `038`'s is the one with read captures and a measured column-width contract behind it. Keeping both would have left duplicate `.db-board-card-chip` rules deciding by source order |
| The timeline bar becomes a `div[role=group]` rather than keeping the button and moving the dots out | A `button` cannot contain interactive content, and the dots have to sit on the bar. Moving them out of the bar would have cost their positioning; making the bar a group and adding a trigger keeps both |
| The trigger reaches 4px beyond the bar rather than growing the bar to 28px | Growing the bar changes every timeline capture's geometry and the row pitch the lanes are laid out on. 4px is exactly half the 8px between two bars, so the target grows and nothing overlaps |
| Two unused tokens, a no-op animation reset and a redundant focus arm were removed from the leg | Each would have read as live to the next person. The lane's own outstanding list already records three dead blocks nobody dares touch; adding four more is the cheapest kind of debt to refuse |
| `is-clipped-start`/`is-clipped-end` kept in the fixture, `is-all-day` removed | The first two are read off the fixture's own geometry and mirror what the renderer emits; the third asserts a column type the fixture never declares, and its parity assertion would have pinned the invention |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Empty-state body red-first | Red: `expected 'div' to be 'p'`; green after `empty-state-renderer.ts:275-281` |
| Toggle `aria-pressed` red-first | Red: source-string contain failure on `toolbar-renderer.test.ts`'s new assertion; green after `toolbar-renderer.ts:1557-1558` |
| Default-view setting red-first | Red: `expected undefined to be defined` in `settings.test.ts`; green after `settings.ts`, `types.ts:666-667`, `i18n.ts` |
| Four changed/new test files (`npx vitest run`) | PASS — 45/45 (empty-state-renderer.test.ts 25, toolbar-renderer.test.ts 3, settings.test.ts 4, card-roving-tabindex.test.ts 13) |
| `accessibility-defects.test.ts` | PASS — 9/9, regex re-anchored, tightened not weakened |
| Full unit suite (`npx vitest run`) | PASS — 787 tests / 83 files |
| Typecheck (`npx tsc --noEmit`) | PASS — 0 errors |
| Lint (`npm run lint`) | 169 problems (156 errors, 13 warnings), identical to a disposable `HEAD` worktree checkout — no new debt |
| Comment scan (`node tools/naming/scan-comments.mjs`) | PASS — 0 hits |
| Failing-value ratchet (`node tools/naming/scan-failing-values.mjs`) | PASS — exit 0 |
| Keep-local scope (`git diff --stat`) | Confirmed empty for `mobile-bottom-sheet.ts`, `table-renderer.ts`, `calc*.ts`, `board-renderer.ts`, `card-roving-tabindex.ts` |

### Leg B

| Check | Result |
|-------|--------|
| Typecheck (`npx tsc --noEmit`) | PASS — exit 0 |
| Build (`npm run build`) | PASS — exit 0; `main.js` restored, it is cut at release only |
| Full unit suite (`npx vitest run`) | PASS — 791 tests / 84 files |
| Lint (`npm run lint`) | 169 problems, exit 1 as always; HEAD re-measured at 169 by putting its `calendar-timeline-renderer.ts` back and re-running — 0 new |
| Comment scan (`node tools/naming/scan-comments.mjs`) | PASS — exit 0, 368 files |
| Failing-value ratchet (`node tools/naming/scan-failing-values.mjs`) | PASS — exit 0, 145 bare against a baseline of 145 |
| Lane, held (`SURFACE_PHASE=041-shared-ui-ux-port node tools/lane/check-lane.mjs`) | PASS — exit 0, edit allowed |
| Lane, released (`node tools/lane/check-lane.mjs`) | PASS — exit 0, "release names all 18 changed capture(s)" |
| Touch reach (`node tools/live/touch-targets.mjs`) | PASS — exit 0; was 277 under 28px, now 253, baseline unchanged at 279 |
| Screenshot freshness (`npm run screenshots:verify`) | PASS — exit 0, 256 entries match their sources |
| Evidence freshness (`node tools/live/evidence.mjs --check-all`) | PASS — exit 0, 16 artefacts fresh after re-running the 13 the edit staled |
| Gate (`SURFACE_PHASE=041-shared-ui-ux-port npm run gate`) | PASS — 25 green, 0 red, exit 0 |
| Gate (`npm run gate`, bare) | PASS — 25 green, 0 red, exit 0 |
| Captures read | 18 opened against their `cb9aedf4` copies; 16 timeline across all five scales on both devices and themes, plus 2 icon-picker |
| Icon-picker delta attributed | Negative control: with `038`'s stylesheet in the tree the harness reproduces the same 4906-pixel shift, so those two PNGs were stale before this change |
| Engine parity unchanged | `engine-parity.json` records the same 65 fixtures and 49 differences as `cb9aedf4`; only `measuredAt` and `inputs` moved |
| REQ-001 sheet untouched (`git diff -- src/views/mobile-bottom-sheet.ts`) | PASS — 0 lines |

### Reduced-motion follow-up

| Check | Result |
|-------|--------|
| Red-first (`owned-menu-reduced-motion.test.ts`) | Red: `expected '...' to contain '.db-surface'` against the container-wide block's selector list; green after `styles.css:883-886` |
| Computed-style probe (`.db-surface` fixture, Playwright, `reducedMotion: "reduce"`) | Before: host/descendants had no declared `animation-duration` (default, not a reset); after: `1e-05s` (0.01ms), matching the container-wide convention |
| Full unit suite (`npx vitest run`) | PASS — 865 tests / 88 files |
| Typecheck (`npx tsc --noEmit`) | PASS — 0 errors |
| Lint (`npm run lint`) | 172 problems (159 errors, 13 warnings), +3 vs the 169 baseline — all three from the new test file's `fs`/`path`/`__dirname` use, the same `import/no-nodejs-modules`/`no-undef` pattern already carried by 14 sibling `src/views/*.test.ts` files reading `styles.css` |
| Comment scan (`node tools/naming/scan-comments.mjs`) | PASS — exit 0 |
| Failing-value ratchet (`node tools/naming/scan-failing-values.mjs`) | PASS — exit 0 |
| Lane, held (`SURFACE_PHASE=041-shared-ui-ux-port node tools/lane/check-lane.mjs`) | PASS — exit 0, edit allowed |
| Lane, released (`node tools/lane/check-lane.mjs`) | PASS — exit 0, "release names all 0 changed capture(s)" |
| Recapture (`npm run screenshots`, detached) | 268/268 captured; only 2 scenarios render `.db-surface` (`chrome-owned-menu`, `chrome-owned-menu-sheet`) and both came back byte-identical |
| Captures read | The 6 `chrome-owned-menu*` PNGs (desktop/mobile x light/dark, plus the sheet pair), confirming the rendered rows and sheet chrome are unchanged |
| Harness noise identified and restored | 10 PNGs across `calendar-empty-state`, `calendar-mini-calendar`, `panel-record-detail-sheet-body-empty`, `timeline-view` and its `day`/`month`/`year` variants drifted differently across two same-tree reruns; none render `.db-surface`; reverted to committed bytes, `manifest.json` `layoutHash`/`bytes` restored to match, `sourceHashes.styles.css` left at the fresh hash |
| Screenshot freshness (`npm run screenshots:verify`) | PASS — exit 0, 268 entries match their sources |
| Evidence freshness (`node tools/live/evidence.mjs --check-all`) | PASS — exit 0, 16 artefacts fresh after re-running all 16 |
| Gate (`SURFACE_PHASE=041-shared-ui-ux-port npm run gate`) | FAIL — 24 green, 1 red: `placement`'s declared CM6 widget-containment case, reproduced identically against unmodified `styles.css` (see below), unrelated to this fix |
| Gate (`npm run gate`, bare) | Same: 24 green, 1 red, identical pre-existing cause |
| Placement red isolated | `git diff -- styles.css` stashed to a patch, `styles.css` reverted to HEAD, `verify-placement.mjs` rerun: the same "RED (declared) — a popover inside a paint-contained widget is not clipped by it" appears with `styles.css` unmodified, then the patch was reapplied and the hash re-checked against the lane's recorded release hash (`5657a71d290b`) to confirm the fix was restored intact |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The empty-state margin is fixed but still unphotographed.** Leg B adds `margin: 0` to
   `.db-empty-card-message`, closing the gap leg a recorded. The hand-typed empty-state fixture
   still does not reach the `p` element, so no capture proves it and the claim rests on reading the
   rule rather than an image.
2. **Not operator-confirmed.** Every capture was read in the harness, which renders fixture markup
   against the shipped stylesheet in headless Chrome. Nobody has held a phone and pressed the
   timeline bar's trigger or either link dot.
3. **The harness is not run-to-run deterministic for a set of scenarios.** Across three full
   capture runs against the same tree, `calendar-month-view`, `chrome-owned-menu-sheet`,
   `panel-record-detail-sheet-body-empty`, `calendar-week-time-grid`, `board-view`, `gallery-view`
   and `calendar-mini-calendar` each moved in one run and reproduced their committed bytes in
   another, sometimes on a different device or theme each time. All were restored rather than
   committed. `field-icon-picker` behaved differently and was kept: it is stable across repeated
   runs and reproduces the same 4826-pixel shift with `038`'s stylesheet in the tree, so those two
   committed PNGs were simply stale. **A capture that moved is not on its own evidence that
   something changed** — the cheap test is to rerun that one scenario and see whether it settles.
4. ~~Reduced motion still misses an owned menu's descendants.~~ **Closed.** `.db-surface` (and its
   `*`/`::before`/`::after` arms) now leads the container-wide reduced-motion block's selector list
   (`styles.css:883-886`), the same pattern the accent focus ring already uses. It did not move a
   capture: of the 268 scenarios, only `chrome-owned-menu` and `chrome-owned-menu-sheet` render
   `.db-surface` at all, and both came back byte-identical on recapture.
5. **Cross-surface polish (T012) reached the timeline only.** The board is `038`'s and was left
   whole; the calendar was not touched. The shared tokens are available to both and consumed by
   neither beyond what shipped here.
6. **`defaultViewType` still has no consumer.** Unchanged from leg a.
<!-- /ANCHOR:limitations -->

---
