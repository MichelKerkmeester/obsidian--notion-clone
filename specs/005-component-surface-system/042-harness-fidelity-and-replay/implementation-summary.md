---
title: "Implementation Summary: Harness Fidelity and Replay"
description: "What phase 042 landed across the render-assertion, replay and capture lanes, and what it deliberately left open."
trigger_phrases:
  - "042 implementation summary"
  - "harness fidelity and replay summary"
  - "replay backfill"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/042-harness-fidelity-and-replay"
    last_updated_at: "2026-09-04T01:41:43Z"
    last_updated_by: "verifier"
    recent_action: "Reconciled 042 docs during rebase: manifest-compare fix + 6 open-row replay claims merged"
    next_safe_action: "External lane per D14, then in-runtime gate verification with Chrome (tasks.md T019-T023)"
    blockers: []
    key_files:
      - "tools/live/replay.mjs"
      - "tools/live/render-assertion-harness.ts"
      - "tools/lane/check-lane.mjs"
      - "tools/screenshots/pixel-hash.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-042-impl-summary"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "Does the manifest compare belong in check-lane.mjs or a shared comparator — check-lane.mjs, reading tools/screenshots/pixel-hash.mjs"
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
| **Spec Folder** | 042-harness-fidelity-and-replay |
| **Completed** | Phase 2 complete — all of T001-T018 landed, including the manifest-compare fix (T017/T018). Phase 3 verification (T019-T023) is tracked separately in `tasks.md`. |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Three gate lanes stopped covering what their own wording claimed, and this phase made each of them
say something true again. The chart view — live and user-selectable — had no render-assertion
scenario at all, and the calendar lane only ever built `scale: "month"`. `npm run replay` still
re-asserted the eight results it shipped with in phase `005` and nothing since, so thirteen landed
fixes across five phases and three reports had no standing claim. And the capture harness pinned a
calendar variable to a viewport formula that production never uses, while never declaring
Obsidian's own primary-button rule at all — so every CTA in the corpus photographed in the neutral
button style.

### Constructed-renderer coverage: chart, calendar week, calendar day

`render-assertion-harness.ts` now constructs `ChartRenderer` and builds `CalendarRenderer` at all
three scales it ships. Coverage moved from 6 distinct renderers to 7 of 22 renderer files, and the
lane wording changed with it — "7 distinct renderers of 22 renderer files" rather than the earlier
count, because several scenarios exercise one renderer and the old phrasing let that read as more
coverage than it was.

Each new scenario owns a negative control that was observed red before green. The week scenario
arms the shared per-item bag seam. The chart and the day-scale calendar cannot: the chart draws one
canvas and a day column caps its all-day lanes at six, so neither reaches the bound through that
seam. Both arm a per-row read at the render entry instead, which is the shape the bound exists to
catch.

### Replay: thirteen new claims, three of them delegated

`replay.mjs` carries 21 claims where it carried 8. Ten are measured statically against today's
fixtures. The three `031` sheet-lifecycle claims cannot be: a teardown and a rebuild are runtime
lifecycle events, and no static fixture reproduces them. Those three delegate — `replay.mjs` reads
`sheet-teardown.json` and `sheet-rebuild.json`, requires the named case to be present and passing,
and requires its recorded pre-fix failure text to still be the one the lane prints. A missing
artefact, a missing case, or altered failure text returns 1 and reds the lane.

### Replay, second pass: six more claims for the open-row fixes shipped after this phase landed

`037`-`041` closed six more open rows on `main` after the section above shipped, none with a
replay claim: `038`'s hover/drag/drop-target/empty-column row (`7e36671`), `040`'s
same-parent-reorder row (`535373a`), `041`'s reduced-motion row in two commits (`a251a43` then
`3f143df`), and two of `037`'s remaining rows (`fa58c7f`, `b29bf7f`). `replay.mjs` now carries 27
claims. All six new entries are static, measured against today's fixture/source and re-measured on
their own fix commit's parent tree (extracted with `git archive <sha>^ | tar -x`, never `git
checkout` against a borrowed work-tree, which mutates whichever repository's index runs it):
`7e36671: 0 -> 2` (the `board-empty-column`/`board-drop-language` scenarios did not exist),
`535373a: 0 -> 2` (neither host binding's board `moveRowToPosition` callback forwarded a
`subtaskMove` argument), `a251a43: 0 -> 1` (`.db-surface` was in no reduced-motion rule),
`3f143df: 0 -> 1` (`.db-surface` was still joined into the container's rule rather than owning its
own), `fa58c7f: 0 -> 4` (none of the title-window third parameter, the first-tick transform
branch, the milestone placement helper, or the 32px phone day-column branch existed), `b29bf7f: 0
-> 2` (no `.is-label-above` rule, and the lane's `row-gap` still read the flat 4px). `tasks.md`
T024 carries the full per-entry evidence and one correction: the dispatch that requested this pass
had `3f143df` and `a251a43`'s descriptions swapped in its prose; the claims here are written
against the two commits' actual diffs, verified with `git show` against the parent `goal.md` log.

### Row-6 harness dependencies

`runtime-vars.css` pinned `--db-calendar-day-min-height` and `--db-calendar-month-week-min-height`
to `calc((100vh - 150px) / 5)`. Production's `getCellMinHeight()` returns `config.calendarCellMinHeight ?? 112`
clamped to 72-400 and never measures the pane, so both are now `112px`. `theme.css` gained
`button.mod-cta`, transcribed from the installed Obsidian 1.13.4 `app.css`. `touch-targets.mjs` and
`unstyled-links.mjs` were not rerouted; what each can and cannot prove is recorded in `tasks.md` as
a bounded, named list.

### Manifest compare: content, not bytes

`check-lane.mjs`'s `changedCaptures()` read `git status --porcelain`, a byte diff, against a
capture harness the parent's own Traps log had already found is not byte-deterministic — an
identical rerun moves a different set of PNG bytes each time. `capture.mjs` now decodes each
capture's pixels and records a coarse, jitter-tolerant `pixelHash` beside the existing
`layoutHash` (`tools/screenshots/pixel-hash.mjs`); `check-lane.mjs` compares the working-tree
manifest against `git show HEAD:screenshots/manifest.json` and drops a git-reported move from the
changed set only when both sides' `pixelHash` (or, for an entry that predates it, `layoutHash`)
agree. `verify.mjs`'s theme-blind check moved to the same field, since two theme captures are
expected to share geometry and only paint should tell them apart.

Two full detached recaptures on this worktree moved a different 15-file and 11-file set of PNG
bytes against the committed tree — the same non-determinism reproduced live — while `pixelHash`
and `layoutHash` moved on 0 of 276 entries between the two runs. `check-lane.mjs` went from FAIL
(12 changed captures the release did not name) to PASS (0 changed) over the same tree. Every
byte-mover was decoded and confirmed pixel-identical to its committed version before being
restored rather than committed.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `tools/screenshots/pixel-hash.mjs` | Created | `decodePng`/`pixelHash` — decodes an 8-bit PNG and hashes its pixels on a coarse, jitter-tolerant grid |
| `tools/screenshots/pixel-hash.test.mjs` | Created | Same picture two byte-different ways hashes equal; a mutated block hashes differently; unreadable input returns null |
| `tools/screenshots/capture.mjs` | Modified | Records `pixelHash` per manifest entry beside `layoutHash`; `bytes` kept for information |
| `tools/screenshots/verify.mjs` | Modified | `flatColour()` reuses `decodePng()`; the theme-blind check compares `pixelHash`, not file bytes |
| `tools/lane/check-lane.mjs` | Modified | Adds `isContentChange`/`contentChangedCaptures`; the changed-capture set is filtered by content before `reviewVerdict()` |
| `tools/lane/check-lane.test.mjs` | Modified | Eight new cases for the content filter, including the pixelHash-introducing-commit bootstrap case |
| `tools/live/render-assertion-harness.ts` | Modified | Constructs `ChartRenderer`; builds `CalendarRenderer` at week and day; adds the render-entry per-row control both need |
| `tools/live/render-assertions.mjs` | Modified | Registers the five new scenarios and the chart bag census; prints scale-aware labels |
| `tools/live/render-scenario-utils.mjs` | Created | The two pure helpers the runner uses for labels and the coverage count |
| `tools/live/render-scenario-utils.test.mjs` | Created | Covers both helpers, including the scale label and the one-renderer-many-scenarios count |
| `tools/live/renderer-coverage.json` | Modified | Coverage stamp, 6 → 7 distinct renderers of 22 |
| `tools/live/replay.mjs` | Modified | Thirteen new claims, the runtime-artefact reader, and the claim-set ratchet; second pass added six more for the open-row fixes shipped after `037`-`041` landed |
| `tools/live/replay.json` | Modified | Stamp of the 21-claim run; second pass re-stamped at 27 claims |
| `tools/live/sheet-rebuild.mjs` | Modified | Records per-case `checks` with the pre-fix failure text replay reads |
| `tools/live/sheet-teardown.mjs` | Modified | The same, for the teardown lane |
| `tools/live/unstyled-links.json` | Modified | Re-stamped after `theme.css` moved |
| `tools/screenshots/runtime-vars.css` | Modified | Calendar cell min-height pinned to the product default `112px` |
| `tools/screenshots/theme.css` | Modified | Declares `button.mod-cta` from the installed Obsidian bundle |
| `tools/lane/css-lane.json` | Modified | Release entry naming the eight captures this phase moved |
| `screenshots/` (8 PNGs, manifest) | Modified | The primary actions now photograph in the accent fill |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Every new check was observed red before it was allowed to be green. The five new render-assertion
scenarios were run under `RENDER_READ_CONTROL=per-item` and each failed by name against its own
bound. The replay lane was reduced by one entry and reported the shrink; each delegated entry's
artefact was moved aside and the lane went red naming `031`.

The thirteen replay entries were then audited against the one thing that makes a replay entry worth
having: each fix commit's parent tree was extracted and this repository's own measure — the exact
function now living in `replay.mjs`, compared block-for-block against it rather than retyped — was
run there. All ten static entries returned a value different from the number they record. Two
entries arrived carrying pre-fix numbers that did not reproduce (`0262386` recorded `was: 20` and
measured 5; `25ae3a9` recorded `was: 42` and measured 10) and were corrected to what the parent tree
actually returns, because `replay.mjs`'s own contract says `was` is "the number the defect stood at
before the fix".

Captures were recaptured detached against the moved harness stylesheets. Fifteen PNGs moved; all
fifteen were opened. Eight are the real change and are named in the lane release. Seven were
paint-only — no manifest entry moved `layoutHash`, and a targeted re-capture returned four of them
to their committed bytes while moving two different ones — and were restored rather than committed.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The three `031` claims delegate to their runtime lanes rather than to a static fixture | A teardown and a rebuild are lifecycle events. A fixture that reproduced their markup would assert the shape of a fix without ever running it, which is the failure this program exists to stop. The delegation still reds: the named case must exist, pass, and carry its recorded failure text |
| `was` is the number this measure returns on the fix commit's parent tree | `replay.mjs` already said so in its own comment. Two inherited numbers did not reproduce and were corrected rather than kept, because an unreproducible pre-fix number is the same defect as a vacuous entry wearing better clothes |
| The chart and day-scale controls wrap the render entry, not the bag | Neither surface reaches the bound through the per-item bag seam — one canvas, and a six-lane cap. A control that cannot fail is not one, so both arm a per-row read where the data crosses the boundary |
| `touch-targets` and `unstyled-links` are declared, not rerouted | Rerouting them to a constructed renderer is a pipeline rewrite, and this phase's scope boundary is instrument truthfulness. A bounded, named list of what each cannot prove is the honest interim, and it is recorded rather than implied |
| The seven paint-only captures were restored, not committed | Zero of 276 manifest entries moved `layoutHash`, and the mover set varied between identical runs. Committing them would record a review of noise as a review of a change |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `node tools/live/replay.mjs` | PASS — exit 0, 21 claims, `reversed: 0`; was 8 claims before this phase |
| Replay pre-fix audit (`<sha>^` re-measure, all 10 static entries) | PASS — 10 of 10 return a value differing from their recorded number; `VACUOUS_COUNT=0`. Observed red first: the leg as received measured 6 entries the same pre- and post-fix |
| Replay negative control — `sheet-rebuild.json` moved aside | PASS — exit 1, 2 claims BROKE, both `031` |
| Replay negative control — `sheet-teardown.json` moved aside | PASS — exit 1, 1 claim BROKE, `031` |
| Replay negative control — one claim removed | PASS — exit 1, "1 required claim(s) are missing: 21 published, this run carries 20" |
| `node tools/live/replay.mjs` (second pass, six open-row-fix claims added) | PASS — exit 0, 27 claims, `reversed: 0`; was 21 claims before this pass |
| Replay pre-fix audit, second pass (`<sha>^` re-measure, all 6 new entries) | PASS — 6 of 6 return a value differing from their recorded number: `7e36671: 0 -> 2`, `535373a: 0 -> 2`, `a251a43: 0 -> 1`, `3f143df: 0 -> 1`, `fa58c7f: 0 -> 4`, `b29bf7f: 0 -> 2` |
| Replay negative control, second pass — `535373a`'s `recorded` moved by one | PASS — exit 1, "replay: FAIL — 1 result(s) reversed since the phase that measured them"; restored and re-verified green |
| `node tools/naming/scan-comments.mjs`, second pass | PASS — exit 0, 381 files, 0 missing banners, 0 commented-out lines |
| `npx tsc --noEmit`, second pass | PASS — exit 0 |
| `npx vitest run`, second pass | PASS — exit 0, 93 files, 925 tests |
| `npm run lint:tools`, second pass | PASS — exit 0 |
| `npm run lint`, second pass | Exit 1 (eslint's own convention for any error present), 172 problems (159 errors, 13 warnings) — unchanged from the pre-existing baseline; no `src/` file touched this pass |
| `npm run gate`, second pass (bare, no `SURFACE_PHASE`) | PASS — exit 0, 25 green / 0 red, `pgrep` for stray Chrome empty before the run. No capture drift: the touched `tools/live/*.json` freshness stamps moved only their `measuredAt` field, `git diff` confirms every `inputs` hash unchanged |
| `node tools/live/render-assertions.mjs` | PASS — exit 0; coverage 7 distinct renderers of 22 renderer files, published 6 → 7 |
| `RENDER_READ_CONTROL=per-item node tools/live/render-assertions.mjs` | PASS as a control — exit 1, 11 failures. New surfaces observed red: `calendar:week` 14 reads against bound 8 (both bags), `calendar:day` 1600 against 8 (both bags), `chart/file-view` 1630 against bound 48 |
| `node tools/live/sheet-teardown.mjs` | PASS — exit 0, 11 producers, `leaking: 0`; the named case carries its recorded pre-fix text |
| `node tools/live/sheet-rebuild.mjs` | PASS — exit 0, 15 checks; all four named cases present and passing |
| `node tools/naming/scan-comments.mjs` | PASS — exit 0, 383 files (381 plus `pixel-hash.mjs`/`pixel-hash.test.mjs`), 0 missing banners, 0 commented-out lines |
| `npx vitest run` | PASS — exit 0, 94 files, 938 tests, including the 5 `render-scenario-utils` cases, 4 `pixel-hash` cases and 8 new `check-lane` content-filter cases |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npm run lint:tools` | PASS — exit 0 |
| `npm run lint` | Exit 1, 172 problems (159 errors, 13 warnings) — the pre-existing `src/` number, unchanged; no `src/` file is touched by this phase |
| `node tools/live/evidence.mjs --check-all` | PASS — exit 0, 16 of 16 artefacts fresh. Observed stale first: `unstyled-links.json` against the moved `theme.css`, re-run rather than edited; later, `capture-device-parity.json` against the re-stamped `screenshots/manifest.json`, re-run rather than edited |
| `npm run screenshots` (detached), round 1 | 276 captured; 15 PNGs moved against the committed tree; `pixelHash`/`layoutHash` populated for all 276 |
| `npm run screenshots` (detached), round 2 | 276 captured; 11 PNGs moved against the committed tree — a different set than round 1, the harness's non-determinism reproduced live |
| Round 1 vs round 2, the new measure | 0 of 276 `pixelHash` changed, 0 of 276 `layoutHash` changed; 9 of 276 recorded `bytes` changed (deltas -435..+365), all 11 round-2 movers decoded pixel-identical to the committed `HEAD` bytes, then restored |
| `node tools/screenshots/pixel-hash.test.mjs` (via vitest) | PASS — 4/4. Observed red first against a naive `sha256(bytes)` stand-in: 3/4 failed (two byte-different encodings of the same pixels hashed apart; a non-PNG buffer returned a hash instead of null) |
| `node tools/lane/check-lane.mjs` | PASS — exit 0, "release names all 0 changed capture(s)", 15/11 byte-only movers excluded across the two rounds. Observed red first (byte-only comparator, round 1 state): "FAIL — 12 changed capture(s) this release does not name", exit 1 |
| `node tools/lane/check-lane.mjs` steady-state mutation control | PASS — one entry's `pixelHash` deliberately overwritten; `contentChangedCaptures()` reported exactly that one path and no others |
| `SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate` | PASS — exit 0, 25 green, 0 red |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The manifest compare's bootstrap commit has no `pixelHash` to fall back from.** `isContentChange`
   compares `pixelHash` to `pixelHash` and only falls back to `layoutHash`-to-`layoutHash` when
   either side lacks `pixelHash` entirely — which is true of every manifest entry committed before
   this landing. A pure repaint (unchanged geometry) between the last pre-`pixelHash` commit and the
   first post-`pixelHash` one is invisible to the fallback, the same limitation `layoutHash` alone
   always had. This is a one-commit boundary: every commit after this one carries `pixelHash` on
   both sides of every future comparison, where the steady-state control in `tasks.md` T018 already
   demonstrates full sensitivity.

2. **Three replay entries prove less than the other ten.** The `031` claims record `0 → 0` as their
   static measure and delegate the real assertion to `sheet-teardown.json` and `sheet-rebuild.json`.
   If a future edit changes a lane's case name or its failure wording without changing behaviour,
   the replay entry reds for a reason that is not a regression — a false red, which is the cheaper
   failure, but a real cost. One of the three (`0c92f4d`, "one finger runs one action") couples to
   the lane's own failure message rather than to a number cited in `031`'s report; the other two
   trace to `031`'s `goal.md` verbatim.

3. **`touch-targets.mjs` and `unstyled-links.mjs` still read hand-written fixtures.** Neither
   constructs a renderer, so neither can see a control the renderer builds that no fixture mirrors,
   and neither proves the real renderers' output. The bounded list of what each can and cannot prove
   is in `tasks.md`; the dependency is declared, not removed.

4. **The chart bound is a headroom number, not a measured ceiling.** `MAX_CHART_LAYOUT_READS` is 48
   against a measured 30, with the armed control at 1630. It catches the shape that matters — reads
   scaling with rows — but a regression that added ten fixed reads would pass.

5. **The `runtime-vars.css` correction changed no picture.** Both calendar fixtures already pin
   `112px` inline (`temporal.mjs:280`, `:1169`), mirroring `applyMonthSizingVars()`, so the root
   value they shadowed was never what the month grid drew. The fix removes a wrong number from the
   harness root; it does not repair a capture that was wrong.

6. **Verified by construction only.** Per `026`'s D5 and this phase's D4, no device is involved and
   none is owed.
<!-- /ANCHOR:limitations -->

---
