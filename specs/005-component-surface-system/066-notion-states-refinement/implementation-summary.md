---
title: "Implementation Summary: Notion States Refinement"
description: "The dwell split, the owned-failure toast routing, the inline stale-reference chip, the fast-band census, the phone-centred placement and the 055 reconciliation, each with its red-first proof."
trigger_phrases:
  - "066 implementation summary"
  - "notion states refinement summary"
  - "what shipped"
  - "validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/066-notion-states-refinement"
    last_updated_at: "2026-09-08T17:50:00Z"
    last_updated_by: "toast-dwell-and-close-target-session"
    recent_action: "Landed Phase 5: Undo toast dwell (ADR-005) and close hit area (ADR-006)"
    next_safe_action: "Verifier runs the full gate and lands; AC-008 and T012's lane-row extension stay open"
    blockers:
      - "AC-008 (the operator device pass) and the tools/live lane-row extension (T012) are not this session's to close"
    key_files:
      - "src/views/toast.ts"
      - "src/views/database-view.ts"
      - "src/views/empty-state-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-066-impl"
      parent_session_id: null
    completion_pct: 78
    open_questions:
      - "Whether the centred placement reads correctly on a handset — device-only, AC-008"
      - "Whether the tools/live lane-row extension (T012) is worth its own follow-on packet given the plumbing it needs"
    answered_questions:
      - "ADR-004 is decided: option 1, a dedicated ease-out token, so the fast-band migration changes no surface's curve"
      - "The dwell split, the failure routing and the fast-band census are all Vitest/grep-provable without a live Obsidian or a browser harness"
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
| **Spec Folder** | 066-notion-states-refinement |
| **Completed** | Partial — six code legs, the reconciliation and a landing-verification capture-pipeline fix (T018) landed 2026-09-07; Phase 5's toast dwell (T021) and close hit-area (T022) legs landed 2026-09-08; AC-008 (operator device pass) and the tools/live lane-row extension (T012) remain open |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**The toast's dismissal budget split (T004).** `ACTION_DISMISS_MS = 5000` joins
`AUTO_DISMISS_MS = 2200` in `src/views/toast.ts`; the single `setTimeout` now selects on
`options.action`. The `error` branch is untouched, asserted so by a source-text negative match.

**Three owned operation failures now route through the toast, not a bare notice (T005, T006).**
`deleteRow`'s catch, `duplicateRow`'s catch, and the whole-database-delete catch in
`src/views/database-view.ts` each raise `showToast({ severity: "error" })` behind the same
`containerEl_` guard the success paths already use. The owned-operation bare-notice census
(`rg -n "new Notice\(" src --glob '!*.test.ts' | wc -l`) fell from 242 to 239.

**A permanent, additive inline-chip shape for a stale reference (T007, T008).**
`EmptyStateRenderer.renderInlineChip` renders a warning icon, a label and a chevron action, with
`role="status"`/`aria-live="polite"` and no dismiss control. `.db-inline-chip` sits beside
`.db-empty-card` in `styles.css`: background `color-mix(in srgb, var(--text-error) 10%,
var(--background-primary))`, zero hex literals, a 30px action tap target matching `.db-menu-item`'s
established floor. **Not wired into any call site** — additive, per its own frozen file scope; no
board, table or embed view renders it yet.

**The fast motion band reads zero raw literals (T009, ADR-004).** ADR-004 was decided as option 1:
`--db-motion-fast-out: 120ms ease-out` joins the token block, the four surfaces that always rendered
that curve now read the token instead of a hand-typed literal, and the five residual
`var(--db-transition-fast)` call sites move to `var(--db-motion-fast)`. A pre-existing permanent
guard, `motion-tokens.test.ts`, pinned the old counts (4 declarations, 5 call sites) and was updated
in the same pass to assert the new ones (0 and 0, with the migrated counts asserted by token instead).

**The shared toast/rail placement centres on phone, per ADR-002's ruling (T017).** Inside
`@media (pointer: coarse), (max-width: 760px)`, `.db-toast-stack` and
`.note-database-container .db-operation-result-rail` both now carry `left`/`right:
var(--db-space-6)` with `width: auto`, and `.db-toast.is-inline` fills its parent at `width: 100%`.
Outside the band, both anchors (`styles.css:2724-2736`, `:2714-2719`) are untouched.

**`055`'s tracking documents reconciled against the tree (T010).** Five stale rows in
`../055-states-feedback-and-motion/goal.md` restated with same-day `file:line` evidence; `T019`'s
amendment and `T020` ticked in its `tasks.md`. `T003` was deliberately left `[ ]` — its own
documented gap (a `nothingToUndo` branch needing a live `App`/vault/metadata cache) is untouched by
anything in this packet's scope.

**Two capture-pipeline defects closed at the root, landing-verification (T018).** The
`chrome-toast-*` captures' `layoutHash` flipped between two values across repeated capture runs at
a stable `pixelHash` — two prior landers (065, 063) had each observed and restored the flip rather
than fixed it. Root cause: `.db-toast`'s entrance keyframe races `capture.mjs`'s layout-hash read,
which happens before the screenshot call's own animation fast-forward. Fixed by disabling the
animation outright in both toast scenarios' `captureCss`, proven red on `chrome-toast-success`
(four backed-out runs, flipping, one of them disagreeing between its own dark and light pass of a
single layout) then green (three runs of each scenario, stable). `chrome-toast-error` did not
reproduce a live flip in ten backed-out runs; its race is evidenced by the committed manifest
carrying two different hashes for one device's dark and light captures, so its share of the fix is
prophylactic against the same latent keyframe and is recorded as such. Separately,
`render-assertion-harness.ts`'s `dropdownDesktopSheet` assertion (added by
`063-notion-dropdown-refinement`) queried `container` for a sheet portalled to `document.body`, and
had never been wired into any gate lane's scenario selection — so it had never once run. Fixed to
query `container.ownerDocument`, matching the icon- and colour-picker branches beside it, and wired
into `render-assertions.mjs`'s `rulesScenarios` selection; proven red (false-negative with the old
selector, then a genuine anchored-branch negative control at the fixed selector) then green. Both
edits sit in `CAPTURE_INPUTS`/`SHARED_CONSTRUCTED_SOURCES`, forcing the full 606-entry recapture
this leg's evidence is measured against; zero of the 606 moved a pixel.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/toast.ts` | Modify | Second dismissal constant, selected on `options.action` |
| `src/views/toast.test.ts` | Modify | Dwell matrix against the production `showToast`, fake timers |
| `src/views/database-view.ts` | Modify | Three owned `errors.*` catches route through `showToast` |
| `src/views/deletion-undo.test.ts` | Modify | Integration test forcing a delete failure; one stale assertion fixed |
| `src/views/empty-state-renderer.ts` | Modify | `renderInlineChip` beside `renderCard`; `STALE_REFERENCE_REASONS` beside the reason union |
| `src/views/board-renderer.ts` | Modify | **Landing.** `render`'s `emptyState` parameter, accepted and dropped since it was introduced, now renders the chip for a stale reference |
| `src/views/board-renderer-hierarchy.test.ts` | Modify | **Landing.** Four cases driving the real `BoardRenderer` down that path |
| `src/views/empty-state-renderer.test.ts` | Modify | Chip render, aria-live, chevron action, no-action case |
| `src/views/motion-tokens.test.ts` | Modify | Permanent census guard updated to the post-migration counts |
| `styles.css` | Modify | `.db-inline-chip` block; `--db-motion-fast-out` token; fast-band literals resolved; phone-band centring |
| `specs/.../055-states-feedback-and-motion/goal.md` | Modify | Five stale rows restated against the tree |
| `specs/.../055-states-feedback-and-motion/tasks.md` | Modify | T019 amendment and T020 ticked; T003 annotated, left open |
| `specs/.../066-notion-states-refinement/decision-record.md` | Modify | ADR-004 decided (option 1, Accepted) |
| `tools/screenshots/scenarios/chrome.mjs` | Modify | **T018.** `animation: none !important` on `.db-toast` in both toast scenarios' `captureCss` |
| `tools/live/render-assertion-harness.ts` | Modify | **T018.** `dropdownDesktopSheet` sheet query scoped to `container.ownerDocument` |
| `tools/live/render-assertion-bundle.mjs` | Modify | **T018.** `core-dropdown-desktop-sheet/file-view` added to `STATE_SCENARIOS` |
| `tools/live/render-assertions.mjs` | Modify | **T018.** `scenario.dropdownDesktopSheet === true` added to the `rulesScenarios` filter |
| `screenshots/manifest.json` | Modify | **T018.** Full recapture (three runs); three `chrome-toast-*` `layoutHash` corrected, and the jittered captures' `bytes`/`pixelHash` reconciled after a byte-only restore |
| `tools/lane/css-lane.json` | Modify | **T018.** Acquired from 064 at its released hash (`acd49f23b031`); released naming all eight `chrome-toast-*` captures |
| `specs/.../063-notion-dropdown-refinement/tasks.md` | Modify | **T018.** Addendum on T018 recording the assertion-query follow-up fix |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Each leg was proven red before it was fixed, using whichever check is strongest for the claim: a
`git stash` of the one changed source file, a rerun of its test file to observe the failure, then a
`stash pop` and a rerun to observe green. `toast.test.ts` (2 assertions), `empty-state-renderer.test.ts`
(4 new tests), `deletion-undo.test.ts` (1 new integration test) and `motion-tokens.test.ts` (2
assertions) were each taken through this cycle. The fast-band and phone-band CSS legs were proven by
direct `grep`/`rg` counts against the shipped `styles.css` rather than a rendered check, since no
browser-driven lane row exists yet for either (see Known Limitations).

The research artefacts behind this packet live in `../055-states-feedback-and-motion/research/`, with
the lineage trail on disk and git-ignored.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| ADR-004: option 1, a dedicated `--db-motion-fast-out` token | Zero current requirement asks for the four surfaces' curve to change; a second small token buys zero visual change on four live surfaces, which is the smaller, safer move |
| ~~`renderInlineChip` ships unwired~~ — **reversed at landing** | The original reasoning was scope, and scope is a good reason to defer work but not to call a criterion met. AC-004's `When` is a board rendering; a producer nothing invokes proves the producer compiles. The wiring is four lines against a parameter both call sites already pass, and the parameter being dead was itself a defect: a board grouped by a deleted relation rendered a blank strip. `spec.md`'s Files to Change carries the amendment |
| `tools/live/` lane-row extension (T012) deferred | None of the fourteen `.mjs` scripts bundles `toast.ts` or measures a forced `database-view.ts` failure; building that scenario plumbing safely against a 26-lane gate, without a live Obsidian to rehearse against, is follow-on work rather than a same-session addition |
| `055` `tasks.md` T003 left unticked | Its own documented gap is unrelated to anything in this packet's scope; ticking it on the strength of sibling fixes would be the same kind of stale claim this packet exists to correct |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0, no output |
| `npm run build` | Exit 0 |
| `npx vitest run` | Exit 0, 1562/1562 across 144 files, from the final rebased tree (1530 before landing added the four production-path board cases; the rest arrived with `origin/main`) |
| `node tools/live/sheet-grammar.mjs` | Exit 0, every registered surface and control PASS |
| `node tools/live/render-assertions.mjs` | Exit 0, every scenario PASS |
| `node tools/naming/scan-comments.mjs` | Exit 0, 0 artifact-id violations |
| `node tools/naming/scan-failing-values.mjs` | Exit 0, 144 unmarked ≤ baseline 145 |
| Red-first proofs | Eight of nine acceptance criteria `Met`, each with an observed red value before its fix; every new test re-checked at landing by mutating the production file it guards and watching it go red. See `acceptance-criteria.md` |
| Phone-band placement, measured | Chrome against the shipped `styles.css`, mounting the DOM `showToast` builds, at 390px / 402px / 430px: stack and rail cards both left 16px / right 16px. Desktop 1280px unchanged. The measurement found a 32px overflow the arithmetic had missed |
| `npm run gate` (26 lanes) | Exit 0 — 26 green, 0 red, from the final rebased tree |
| T018 `chrome-toast-*` `layoutHash` flip, red then green | `capture.mjs --only chrome-toast-success`, four backed-out runs: flipping (`ec7335c12b6a`/`7425a6d0cd70` desktop, `ffd9d0f9aefb`/`5ac877430f1c` mobile). Three runs of each scenario with the fix: stable, `pixelHash` unchanged throughout. `--only chrome-toast-error` stayed stable across ten backed-out runs — its flip is evidenced by the committed manifest, not reproduced live |
| T018 recapture, judged by decoded pixel delta | Three full `npm run screenshots` runs, 606 entries, exit 0 each. Three `layoutHash` moves, identical on all three runs; zero reproducing `pixelHash` moves; every byte-moved PNG measured at max channel delta ≤ 12 (mean ≈1) against its committed copy and restored |
| T018 `dropdownDesktopSheet` assertion, red/negative-control/green | `render-assertions.mjs`: false-negative with the original `container`-scoped query; correctly fails at three options (anchored branch) with the fix applied; passes at thirty options (escalated) with the fix applied |
| `node tools/screenshots/verify.mjs` | Exit 0, 606 entries current |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The `tools/live/` lane-row extension (T012) was not built.** All five thresholds are proven at
   the Vitest/grep level instead of a permanent browser-measured lane row — real, sufficient proof
   for this landing, but not the regression guard the packet's own testing strategy called for.
   Building it means adding `toast.ts` and a forced-failure scenario to the render-assertion bundle's
   scenario list, which no existing lane currently does.
2. **`renderInlineChip` is wired on the board only.** Landing wired the board's stale-reference
   path, which is the one AC-004 names. The table renderer and the embed still render the card for
   every reason, and no capture exercises the chip yet: reaching it needs a schema whose group
   property has been deleted, which no fixture builds.
3. **AC-008 is still open, and AC-009 has no permanent guard.** D-1, D-2 and the handset read of the
   centred placement all ride `055`'s operator device pass. AC-009's margins are now measured rather
   than argued, but the measurement was a one-off run at landing — T012's lane row, which would have
   caught the `box-sizing` overflow without a person going looking for it, still does not exist.
4. **ADR-003's 5000ms dwell was an inference.** A fresh operator report on 2026-09-08 moved it: see
   Phase 5 below and ADR-005. 3500ms is still an inference — a smaller one, and no longer the first
   guess made before any number shipped — and the device pass remains the check that could move it
   again.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:phase-5 -->
## Phase 5: Toast dwell and close-target reports (2026-09-08)

Two fresh operator reports on the shipped `0.0.32`/`0.0.33`: the Undo toast stays on screen too
long, and its close button needs a 56×56 click area (AC-010, AC-011).

**The dwell (T021, AC-010, ADR-005).** No timed reference capture exists for either platform's undo
toast — the digest is a still harvest, the same fact ADR-003 already recorded. `ACTION_DISMISS_MS`
was 5000ms, ADR-003's own inference, confirmed live and unbugged on the tree the operator tested. A
dated, direct report of the felt duration is stronger evidence than a desk inference made before any
number existed, so the budget is cut 30% to 3500ms. Red-first: `toast.test.ts`'s dwell matrix moved
its checkpoints (still connected at 3000ms; gone by 4000ms, which the 5000ms figure it replaced would
still show connected at) and was confirmed red against the reverted constant. A second, independent
proof was added to the toast lane in `tools/storybook/verify-placement.mjs`: two rows drive the real
production `showToast` call with real timers on the phone viewport, confirmed red against the pre-fix
constant (`1 card(s) present at 3900ms`) and green after.

**The close hit area (T022, AC-011, ADR-006).** Current size recorded before the fix:
`.obnotion-toast-close`'s own box is 18px wide by 29-30px tall (18px from its own padding around a
14px glyph; the height comes from the host's own bare-`<button>` rule, since nothing in the toast's
own rule overrides it) — not the 18×18 `touch-targets-baseline.json` had recorded on 2026-09-05,
which predates the host stylesheet model this file's own `hostStylesheetModelLowering` entry landed
two days later. `tools/live/touch-targets.mjs` measures `getBoundingClientRect()` and cannot see a
pseudo-element's inset, so it cannot prove 56×56 either way; ADR-006 gives `.obnotion-toast-close`
the checkbox's own idiom (`::before { position: absolute; inset: -19px; content: ""; pointer-events:
auto; }`), computing to at least 56×67 against the button's real box, and a matching DECLARED entry
documents why the bounding-box sweep still shows a shortfall. The toast lane proves the real number:
red before the fix (`box 18x30 plus a ::before inset of top NaN...`), green after (`... computes to
56x67`), the glyph confirmed unchanged at 14×14, and a paired `elementFromPoint` check confirming the
wider invisible area does not reach the Undo action button beside it.

**The CSS lane.** `styles.css` moved under a lane held by a different, unrelated phase
(`075-toolbar-labelled-buttons`). Taken over properly in `tools/lane/css-lane.json`: an acquire from
075's own released hash, an edit entry describing the `.obnotion-toast-close` change, and a release
naming zero reviewed captures — `npm run screenshots` ran five times against the fix and neither
toast fixture (`chrome-toast-success`, `chrome-toast-error`) moved a single pixel on any run, so
nothing in this lane's own render roots shows as changed in the committed diff. Five unrelated
single-run capture-pipeline transients surfaced and self-reverted across those runs (none touching
the toast surface, none reproducing) and were restored via `git checkout --`, matching this lane's
own established practice for encoder/antialiasing jitter.

**Verification.** `npx tsc --noEmit` exit 0; `npx vitest run` 1717/1717 across 158 files; `npm run
build` exit 0; `node tools/live/sheet-grammar.mjs`, `render-assertions.mjs`, `touch-targets.mjs`
(ratchet 171 → 169) all exit 0; `node tools/storybook/verify-placement.mjs` 418/420 (2 declared,
unrelated to this phase), exit 0; `node tools/live/evidence.mjs --check-all` all 15 artefacts fresh;
`npm run gate` — 27 green, 0 red, exit 0; `node tools/naming/scan-comments.mjs` and
`scan-failing-values.mjs` both exit 0.

No operator device row was ticked. AC-008 remains open, unchanged by this phase.
<!-- /ANCHOR:phase-5 -->
