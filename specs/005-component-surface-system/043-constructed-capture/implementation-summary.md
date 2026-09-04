---
title: "Implementation Summary: Constructed Capture"
description: "The capture pipeline now photographs the shipped renderers, not only hand-written fixture markup: nine constructed views across two devices and two themes, mounted through the same bundle the assertion lanes use."
trigger_phrases:
  - "043 implementation summary"
  - "constructed capture summary"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T02:10:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "T026: landing doc written; gate PASS 25 green"
    next_safe_action: "Rule on AC-002, then tasks.md T004-T006"
    blockers:
      - "AC-002 as written cannot be satisfied through the capture path — needs a phase ruling (see Known Limitations 1)"
    key_files:
      - "tools/screenshots/capture.mjs"
      - "tools/screenshots/constructed-scenarios.mjs"
      - "tools/screenshots/manifest-schema.mjs"
      - "screenshots/manifest.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-impl-summary"
      parent_session_id: null
    completion_pct: 45
    open_questions:
      - "Is the readiness wait's criterion pixel difference (unmeetable, measured) or inside-mount layout determinism (measured, 0 -> 376 across one frame)?"
      - "Does the shared manifest stand, or is the separate screenshots/constructed-manifest.json of AC-006 still required?"
    answered_questions:
      - "Can a fixture and its constructed counterpart be pixel-equal at the bench shape? No — all 7 declared pairs differ, and the data shapes make equality impossible until the capture-sized option lands."
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 043-constructed-capture |
| **Completed** | Partial — 2026-09-04 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Until now every screenshot in this repository was a photograph of hand-written markup. A fixture
proves what the stylesheet does to the class structure the renderers are believed to emit; it never
runs a renderer, so a regression in shipped code that the fixture mirrors loosely stays green and
photogenic. The capture pipeline now also mounts the real `src/views/*` renderers — through the same
esbuild bundle and the same mount path the assertion, touch-target and unstyled-links lanes already
drive — and photographs what comes out. Nine views, two devices, two themes: 36 new captures whose
subject is the renderer itself.

### The constructed scenario type

A scenario that carries an async `mount(page, device, theme)` instead of an `html()` string is a
constructed scenario. `capture.mjs` refuses it before the browser launches if the mount is not async,
because a synchronous mount gives the capture nothing to wait on and would photograph an empty box
while every check stayed green. The mount navigates to a host document that loads the bundle, calls
`runRenderAssertions`, and resolves only when the harness's `onMounted` hook fired AND its
provenance marker passed — the same two-part signal `touch-targets.mjs` checks before it measures
anything, not a sleep and not a fresh invention. The bundle is built once per run and disposed when
the run ends, so a fixture-only run never pays for it and a constructed run never repeats it.

The nine registered scenarios are `constructed-list`, `-table`, `-board`, `-gallery`,
`-calendar-month`, `-calendar-week`, `-calendar-day`, `-timeline` and `-chart`. Two of them —
the chart and the calendar's day scale — are net-new coverage: no fixture ever depicted either.

### What the pictures show

All 36 were opened and read. The table draws its sixteen-column bench grid; the board draws five
status columns at 320 cards each; the gallery's responsive grid collapses to a single column on the
phone; the calendar month grid covers February 2026 with its unscheduled backlog and per-day
overflow counts; the week and day time grids arrive already scrolled to the workday by the
renderer's own post-render correction; the timeline draws its week window with a month boundary
tick, weekend fills, dependency dots and two milestone diamonds; the chart draws a five-bar count
aggregation that agrees with the board's five columns.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `tools/screenshots/constructed-scenarios.mjs` | Created | The constructed registry, its mount driver, the readiness refusal, and the one bundle build shared with the assertion lanes |
| `tools/screenshots/manifest-schema.mjs` | Created | The manifest entry contract — a constructed entry must name the renderer and bag it photographed, or the run fails rather than publishing a record that cannot be read |
| `tools/screenshots/constructed-capture.test.mjs` | Created | Pins the manifest marking, the readiness refusal, the nine-scenario registry and the fixture declarations |
| `tools/screenshots/capture.mjs` | Modified | Constructed branch in the device/theme loop, the readiness frame wait, one bundle build before the loop, manifest marking, schema check before write |
| `tools/screenshots/scenarios.mjs` | Modified | Header now states the two scenario kinds and the `fixtureOf` declaration |
| `tools/screenshots/scenarios/core.mjs` | Modified | `fixtureOf` on the list, table, board and gallery fixtures |
| `tools/screenshots/scenarios/temporal.mjs` | Modified | `fixtureOf` on the calendar month, calendar week and week-scale timeline fixtures |
| `screenshots/views/constructed-*.png` | Created | The 36 constructed captures |
| `screenshots/manifest.json`, `screenshots/README.md` | Modified | 312 entries (276 fixture + 36 constructed); `fixtureOf` recorded on the 28 declared fixture entries |
| `tools/lane/css-lane.json` | Modified | Release entry for this phase naming all 36 reviewed captures |
| `tools/live/*.json` | Modified | Re-stamped evidence after `scenarios.mjs` moved |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The implementation pass ran as a dispatched external leg with no browser evidence rights; every
number below was measured in-runtime afterwards, on this worktree, with exit codes read directly
rather than through a pipe.

The red was reproduced before the green was accepted: moving `manifest-schema.mjs` aside makes
`constructed-capture.test.mjs` fail with `Cannot find module './manifest-schema.mjs'` — 1 failed
suite, no tests — and restoring it returns a byte-identical file (sha256 `95af8897fba2`).

Two full detached capture runs were taken, each of all 312 entries. The static path was checked by
comparison rather than by reading the diff: against the committed manifest, all 276 fixture entries
came back with identical `pixelHash` and identical `layoutHash`, and eight fixture PNGs that moved
bytes only (encoder noise, which is why this pipeline hashes decoded pixels) were restored to their
committed bytes rather than recommitted. Between the two runs, all 312 entries — the 36 constructed
included — reproduced the same `pixelHash` and `layoutHash`.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Reuse `buildRenderAssertionBundle()` rather than build a second bundle | D1. A second bundler can drift from the first, and then the capture proves something about a copy. The bundle is imported, not reproduced, and the run fails outright if `missingSources` is non-empty. |
| Readiness is the harness's `onMounted` plus its provenance result, not a timeout | A sleep photographs whatever happens to be on screen when it expires. This is the identical signal the touch-target lane waits on before it measures, so the capture and the measurement agree about when a renderer is up. |
| The frame wait lives in `capture.mjs`, never in `src/views/*` | D2. The renderers already schedule their corrections through `requestAnimationFrame`; the capture side can wait that out without asking production code to report "done". |
| Constructed entries share `screenshots/manifest.json` rather than a separate file | Deviates from AC-006 and `plan.md`. It was not chosen on the merits — the dispatched leg was scoped to the shared manifest, and the landing pass kept it because the shared file is what `check-lane`, `verify.mjs` and `capture-device-parity` already read, which is why three of them picked the constructed captures up with no code change at all. Recorded as a deviation, not as a resolution: AC-006 is still open. |
| Nine scenarios, not thirteen | The four extra timeline scales need `ScenarioSpec` to carry a timeline scale, which the harness does not yet do (T004). `makeTimelineConfig(columns, "week")` is hardcoded, so `constructed-timeline` is the week scale and says so. |
| `fixtureOf` on the fixture, rather than a `declared-fixtures.mjs` map | Deviates from AC-007. The declaration sits next to the markup it describes, so a fixture and its claim cannot drift apart in separate files. Seven of the eleven planned pairs are declared; the four timeline-scale pairs are not, because D4 forbids declaring a supersession the constructed capture does not actually reproduce. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Every exit code below was read from `$?` directly.

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 97 files, 961 tests (HEAD baseline 96 / 953) |
| `npm run lint:tools` | PASS, exit 0 |
| `npm run lint` | exit 1, 172 problems — identical to the HEAD baseline; `src/` is untouched by this phase |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 |
| Red-first control | `Cannot find module './manifest-schema.mjs'` observed with the module moved aside; restored byte-identical |
| Full capture run x2 (detached) | 312 entries each; constructed `pixelHash`/`layoutHash` 0 of 36 changed between runs; fixture 0 of 276 changed |
| Static-path regression | 0 of 276 fixture entries changed `pixelHash` or `layoutHash` against the committed manifest |
| `node tools/screenshots/verify.mjs` | PASS, exit 0 — 312 entries match their sources, none blank or theme-identical |
| `node tools/lane/check-lane.mjs` | Observed red first: FAIL, exit 1, "36 changed capture(s) this release does not name". After the release entry named all 36: PASS, exit 0 |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 — 70 fixture scenarios, 17 constructed, baselines 279 / 335 unchanged |
| `node tools/live/unstyled-links.mjs` | PASS, exit 0 — 112 fixture links, constructed pass an honest empty sample |
| `node tools/live/capture-device-parity.mjs` | PASS, exit 0 — pairs 68 -> 77 with zero code change (`capture-device-parity.mjs` input hash `ff0cac47e594` on both sides); identical 0 against a baseline of 4 |
| `node tools/live/evidence.mjs --check-all` | Observed red first: exit 1, 4 of 16 artefacts stale after `scenarios.mjs` moved. After re-running their writers: PASS, exit 0, 16 of 16 |
| `SURFACE_PHASE=043-constructed-capture npm run gate` | PASS, exit 0 — 25 green, 0 red |
| 36 constructed PNGs opened and read | Done. Nine views x 2 devices x 2 themes; every theme pair differs by `pixelHash`; two weak pictures named in Known Limitations |
| Readiness negative control | Inside the mount, `.note-database-container` `scrollTop` reads 0 synchronously after mount returns and 376 after one frame. Through a separate CDP evaluate it already reads 376. Captures taken with the wait set to 0 frames are `pixelHash`-identical to the two-frame captures on all four calendar-week entries. |
| `git diff --stat src/ styles.css` | Empty — no renderer or stylesheet change in this phase |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-002's criterion cannot be met through the capture path, and this is measured rather than
   argued.** The criterion asks for a capture taken with the readiness wait removed to differ from
   one taken with it present. It does not: `constructed-calendar-week` at 0 frames produced
   `265f58faa024` / `f46ff021c4b2` / `2ea63aecd959` / `afcbb4870a24`, the same four hashes the
   two-frame run recorded. The reason is that the screenshot command itself flushes pending
   animation frames before rasterising, so a one-frame correction can never be photographed
   pre-application. The correction is real: inside the mount, `scrollTop` moves 0 -> 376 across one
   frame. The wait's demonstrated effect is that the layout measured before the screenshot describes
   the same frame the pixels do. The criterion needs an operator ruling — amend it to the
   inside-mount measurement, or accept determinism as the basis. It is left `Unmet` rather than
   quietly reinterpreted.
2. **The constructed list is a weak photograph, and the phone one is close to empty.** The renderer
   mounts and its provenance marker passes, but its virtual window lands below the fold in this
   host: 37 rows exist in the DOM on desktop with the first at y=675 in a 900px viewport, and 38 on
   the phone with the first at y=1964 in an 874px viewport. So the phone capture shows the total
   header over empty ground. This is the 1600-row bench shape meeting a host with no bounded scroll
   height, and it is the clearest argument for the capture-sized data option (T006/AC-004) being
   required rather than polish.
3. **The bench data is untyped, so the constructed captures prove structure and not type
   rendering.** Every bench column is `"text"`, so no select pill, date format, currency or
   completed-strikethrough appears — where the fixtures show all four. Every Obsidian icon also
   draws as the stub's placeholder diamond. The fixtures remain the authority for type rendering and
   icon fidelity, all 70 stay registered and captured, and the 13 named fixture-only entries were
   re-checked as present in both the registry and the manifest.
4. **Constructed entries live in the shared manifest, not `screenshots/constructed-manifest.json`.**
   AC-005 and AC-006 are unmet as written. The count is 36 rather than 52, and the separation the
   plan asked for does not exist.
5. **The timeline is captured at the week scale only.** `render-assertion-harness.ts` hardcodes
   `makeTimelineConfig(columns, "week")` and `ScenarioSpec.scale` is still calendar-only, so the
   quarter and year scales cannot be requested. T004-T006 are untouched; the three existing harness
   consumers are therefore also untouched, which is why their numbers are unchanged.
6. **The later wiring is not done.** `declared-fixtures.mjs` (T010), the `verify.mjs` DECLARED
   staleness inheritance (T011), the explicit `check-lane` widening (T012) and the
   fixture-constructed parity test (T016) remain open. Three of the four lanes read the constructed
   captures already because the entries share the fixture manifest, but that is a consequence of the
   shared-file deviation rather than the wiring the plan specified.
7. **One dispatch leg did not run.** T019 (the second external pass) was skipped; this landing went
   straight from the first dispatched leg to in-runtime verification.
<!-- /ANCHOR:limitations -->
