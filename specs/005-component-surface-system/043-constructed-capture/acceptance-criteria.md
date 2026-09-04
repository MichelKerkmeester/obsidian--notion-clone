---
title: "Acceptance Criteria: Constructed Capture"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "043 acceptance criteria"
  - "constructed capture closure gate"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T00:45:07Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria for this packet"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Constructed Capture

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/043-constructed-capture
**Level:** 3
**Status:** Draft
**Date:** 2026-09-04
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given `capture.mjs` accepts only a scenario whose `html(device)` returns a synchronous markup string (`capture.mjs:108-133`), When a constructed scenario type is added that mounts through `buildRenderAssertionBundle()`/`runRenderAssertions()`, Then a constructed capture exists whose bundle input list (`built.metafile.inputs`) includes the real `src/views/*` renderer source, not a second implementation. | `node tools/screenshots/capture.mjs --constructed` (or equivalent); direct inspection of the bundle's `metafile.inputs` for the renderer path | Unmet | - |
| AC-002 | REQ-002 | Given `calendar-renderer.ts` and `calendar-timeline-renderer.ts` schedule a post-render layout correction via `window.requestAnimationFrame` (workday scroll, popover reposition, timeline group-width), When a constructed capture of one of these views is taken with the readiness wait removed and again with it present, Then the two captures differ (`pixelHash` or `layoutHash`), proving the wait changes what is photographed rather than being decorative. | The negative-control pair's manifest entries, `pixelHash`/`layoutHash` compared directly | Unmet | - |
| AC-003 | REQ-003 | Given `ScenarioSpec.scale` is typed `"month" \| "week" \| "day"` (calendar-only, `render-assertion-harness.ts`), When the type and the timeline construction branch are extended to accept all five shipped scales, Then a scenario naming each of `day`, `week`, `month`, `quarter`, `year` constructs `CalendarTimelineRenderer` at that scale, and `node tools/live/render-assertions.mjs` continues to exit 0 for every previously-registered scenario, unchanged. | `node tools/live/render-assertions.mjs`, `$?`; before/after diff of its per-scenario output for existing entries | Unmet | - |
| AC-004 | REQ-004 | Given the constructed mount path's row/column counts are hardcoded to the perf-bench shape (1600-2000 rows, `render-assertion-harness.ts:106-160`), When an opt-in capture-sized data option is added, Then a constructed capture using the option shows a row count comparable to the fixture it declares (`scenarios/shared.mjs`'s curated ~12-20 rows), and `render-assertions.mjs`/`touch-targets.mjs`/`unstyled-links.mjs` produce byte-identical output to today when the option is omitted. | Row count in the captured DOM (`layoutHash` element count) for the option-enabled path; before/after run of the three existing checks with the option unused | Unmet | - |
| AC-005 | REQ-005 | Given no capture has ever photographed a constructed `ChartRenderer` or a constructed calendar `day` scale (both real, confirmed coverage gaps — `grep` across `scenarios/*.mjs` returns no chart-view fixture, no `calendar-day` fixture), When the 13-scenario registry (list, table, board, gallery, calendar×3, timeline×5, chart) is captured desktop + phone, both themes, Then `screenshots/constructed-manifest.json` carries 52 entries and every one of the 13 renderer/scale combinations is represented at least once. | `screenshots/constructed-manifest.json` entry count and distinct renderer/scale coverage, read directly | Unmet | - |
| AC-006 | REQ-006 | Given the fixture manifest (`screenshots/manifest.json`) is rewritten wholesale by `capture.mjs`'s existing main loop, When constructed captures are recorded in a separate `screenshots/constructed-manifest.json`, Then a full fixture-only `npm run screenshots` run leaves `constructed-manifest.json` untouched and vice versa. | Two runs (fixture-only, then constructed-only), diffing the manifest each did not touch | Unmet | - |
| AC-007 | REQ-007 | Given eleven `scenarios.mjs` fixtures depict a state a constructed capture also photographs (per the mapping audited in `plan.md`'s Architecture table), When `declared-fixtures.mjs` is written, Then every one of the eleven is named with its constructed authority, and the thirteen fixtures that do NOT map to a constructed state are named as staying fixture-only rather than silently omitted. | `declared-fixtures.mjs` contents, diffed against the mapping table in `plan.md` | Unmet | - |
| AC-008 | REQ-008 | Given `check-lane.mjs`'s `contentChangedCaptures()` reads only `screenshots/manifest.json`, When it is widened to also read `screenshots/constructed-manifest.json`, Then a deliberately mutated constructed capture's `pixelHash`, left unnamed in a release entry, reds the lane the same way an unnamed fixture change already does. | `node tools/lane/check-lane.mjs` before/after the mutation, `$?` and printed reason | Unmet | - |
| AC-009 | REQ-009 | Given `verify.mjs` judges a DECLARED scenario's staleness only against the fixture's hand-maintained `sources` array, When it is wired to also check the constructed capture's `sourceHashes` for a DECLARED scenario, Then a change to a `src/views/*` file a DECLARED scenario's constructed capture depends on is flagged stale even if the fixture's own `sources` array happened to omit it. | `node tools/screenshots/verify.mjs` before/after a scratch edit to a depended-on renderer source (reverted after the check) | Unmet | - |
| AC-010 | REQ-010 | Given `capture-device-parity.mjs`'s directory scan is naming-convention-driven, not scenario-list-driven (`capture-device-parity.mjs:47-61`), When a full constructed capture lands under `screenshots/constructed/`, Then the check either already reports the new mobile/desktop pairs with zero code change, or is extended minimally to do so — one of the two is true and recorded, not assumed. | `node tools/live/capture-device-parity.mjs` output after the first real constructed capture run, read directly | Unmet | - |
| AC-011 | REQ-011 | Given the fixture and constructed pipelines use different mock-data shapes (curated ~12-20 rows vs. perf-bench 1600-2000 rows) until AC-004 lands, When `fixture-constructed-parity.test.mjs` is written, Then it states explicitly which comparison basis it uses (data-aligned pixel equality, contingent on AC-004; or a named structural check otherwise) for every DECLARED scenario where both a fixture and a constructed manifest entry exist. | `tools/screenshots/fixture-constructed-parity.test.mjs` via `vitest`, plus a read of which basis it documents | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Not yet started. Every criterion above is `Unmet`. Write this section when the packet closes, not
before — it should name which criteria carried the packet and what was consciously left out (for
example, whether AC-011's parity basis ended up being pixel-equal or structural, and why).
<!-- /ANCHOR:closure -->
