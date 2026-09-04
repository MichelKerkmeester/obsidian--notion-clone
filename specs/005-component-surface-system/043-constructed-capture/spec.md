---
title: "Feature Specification: Constructed Capture"
description: "The css-lane, screenshots-fresh and device-parity lanes still read only hand-written scenario fixtures. This phase photographs the constructed production renderers instead, through 042's own bundle and mount seam."
trigger_phrases:
  - "constructed capture spec"
  - "043 spec"
  - "photograph the constructed renderer"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T00:45:07Z"
    last_updated_by: "phase-author"
    recent_action: "Opened phase against 042's seam"
    next_safe_action: "Review seam contract (tasks.md T001)"
    blockers: []
    key_files:
      - "tools/screenshots/capture.mjs"
      - "tools/live/render-assertion-bundle.mjs"
      - "tools/live/render-assertion-harness.ts"
      - "tools/lane/check-lane.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Fixture rows (scenarios/shared.mjs, ~12-20 curated rows) and the constructed bench (render-assertion-harness.ts, 1600-2000 rows at 30% fill) are different shapes. Does parity mean pixel-equal on aligned data, or structural-equal on the harness's own shape?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Constructed Capture

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

Three gate lanes — css-lane, screenshots-fresh and device-parity — and the fixture pass of two more
still prove nothing about the renderer the plugin ships: every PNG they read comes from
`tools/screenshots/scenarios.mjs`'s hand-written markup. `042` already built the shared
esbuild-plus-obsidian-stub bundle and mount path three other checks use to construct real renderers
inside headless Chrome. This phase gives `capture.mjs` an async-mount scenario type that reuses that
same seam, photographs at least one state per registered view, and declares which existing fixtures
the constructed captures now supersede.

**Key Decisions**: Reuse `render-assertion-bundle.mjs`'s shared bundle/scenario list rather than a
second copy; the readiness wait lives in capture code, not in `src/views/*`.

**Critical Dependencies**: `042`'s `buildRenderAssertionBundle` / `runRenderAssertions` seam
(`tools/live/render-assertion-bundle.mjs`, `tools/live/render-assertion-harness.ts`) must keep
working unchanged for its three existing consumers.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-04 |
| **Branch** | `main` |
| **Parent Spec** | ../spec.md |
| **Phase** | 43 of 43 |
| **Predecessor** | 042-harness-fidelity-and-replay |
| **Successor** | None |
| **Handoff Criteria** | `042`'s bundle/mount seam stays green (`node tools/live/render-assertions.mjs`, `node tools/live/touch-targets.mjs`, `node tools/live/unstyled-links.mjs` all exit 0) before and after this phase touches it |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 43** of the Component Surface System. It closes the fixture-pass half of the
parent's DONE-table row 6 dependency `042` narrowed but left open: "the fixture passes of
[css-lane, screenshots-fresh, device-parity and the two constructed-pass-supplemented checks]" —
five gate lanes whose green depends on hand-authored markup rather than the shipped renderer.

**Scope Boundary**: capture-side wiring only (`tools/`). No `src/views/*` renderer edits, no
`styles.css` edits unless a CSS-lane-held fix from a prior phase's declared-but-reverted list is
picked up separately (out of scope here — see `042`'s `touch-targets-constructed-baseline.json`).

**Dependencies**:
- `042-harness-fidelity-and-replay` landed `tools/live/render-assertion-bundle.mjs` and the
  `onMounted` hook on `runRenderAssertions()` — the one build/mount seam this phase reuses.
- `026-production-render-assertions` established the "construct, don't grep" doctrine (D10) this
  phase extends to capture.

**Deliverables**:
- A constructed scenario type in `tools/screenshots/capture.mjs`.
- Thirteen constructed scenarios (one per registered view, all calendar scales, all timeline
  scales), captured desktop + phone, both themes, into their own manifest.
- A DECLARED registry naming which `scenarios.mjs` fixtures the constructed captures supersede.
- css-lane, screenshots-fresh and device-parity reading the constructed capture for a DECLARED
  scenario.
- A fixture-vs-constructed pixelHash parity check for every DECLARED scenario.

**Changelog**:
- When this phase closes, refresh the matching file in `../changelog/` using the parent packet
  number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

`tools/screenshots/capture.mjs` accepts only a scenario whose `html(device)` returns a synchronous
markup string (`buildPage()`, `capture.mjs:108-133`) — hand-authored HTML that mirrors a renderer's
class structure "against mock rows" (`scenarios.mjs`'s own header comment), never the renderer
itself. `042` built and proved a real construction seam — `buildRenderAssertionBundle()`
(`render-assertion-bundle.mjs`) bundles the shipped `src/views/*` renderers behind an obsidian stub,
and `runRenderAssertions()`'s `onMounted` hook lets a caller measure the mounted DOM before it is
torn down — and three checks already use it (`render-assertions.mjs`, `touch-targets.mjs`,
`unstyled-links.mjs`). No capture has ever used it. So css-lane, screenshots-fresh and
device-parity, plus the fixture pass of the two constructed-pass-supplemented checks, still certify
only that a hand-written picture looks right — the exact D10 risk ("a check can bundle shipped code
and still render a hand-written fixture") this program's own doctrine exists to police, and the one
`042`'s own audit left DECLARED rather than closed for these five lanes.

Two further gaps surfaced while scoping this phase, neither invented — both read directly from
source. **Chart has no full-view fixture at all** (only three "components"-group popover/empty/
number fragments; `grep` across every `scenarios/*.mjs` module confirms it) and **the calendar's
day scale has no fixture either** — both real coverage holes, not just fixture-vs-constructed gaps.
And `render-assertion-harness.ts`'s `ScenarioSpec.scale` field is typed `"month" | "week" | "day"`
— calendar-only — so today's harness cannot construct the timeline at anything but its implicit
default scale, even though `calendar-timeline-renderer.ts:859` ships five
(`["day", "week", "month", "quarter", "year"]`).

### Purpose

Give `capture.mjs` a second, constructed scenario type that mounts the real renderer through 042's
own seam, so every registered view has at least one photograph a device would actually produce, and
the three fixture-only lanes read that photograph wherever one exists.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A `mount(page, device, theme)`-style constructed scenario type in `capture.mjs`, alongside the
  existing `html(device)` type, both driving the same device/theme capture loop.
- A harness-owned readiness wait (animation frames, not a `src/`-side completion callback) before
  layout measurement and screenshot, because `calendar-renderer.ts` (week/day workday scroll,
  popover reposition) and `calendar-timeline-renderer.ts` (group-width `apply()`) both schedule a
  layout correction on the next `requestAnimationFrame` after `render()` returns.
- Extending `render-assertion-harness.ts`'s `ScenarioSpec` so the timeline can be constructed at
  all five scales, and `render-assertion-bundle.mjs`'s shared `SCENARIOS` list with the four new
  timeline-scale entries — the same list `render-assertions.mjs`, `touch-targets.mjs` and
  `unstyled-links.mjs` already iterate, so a fourth consumer (capture) sees the identical set
  rather than a forked one.
- An explicit, opt-in capture-sized row/column data option on the constructed mount path. The
  existing bench shape (1600-2000 rows at 30% fill, `render-assertion-harness.ts:106-160`) is
  correct for the checks that measure layout-read counts; it is the wrong shape to photograph
  against curated fixtures that show 12-20 rows. The three existing checks' output must be
  byte-identical when the option is not requested.
- Thirteen constructed scenarios — list, table, board, gallery, calendar (month, week, day),
  timeline (day, week, month, quarter, year), chart — each captured desktop + phone, both themes
  (52 PNGs), into a manifest separate from `screenshots/manifest.json` so the fixture rebuild in
  `capture.mjs`'s main loop stays untouched.
- A DECLARED registry (see table below) naming which existing `scenarios.mjs` fixtures a
  constructed capture now supersedes as the authority.
- Wiring css-lane (`check-lane.mjs`), screenshots-fresh (`verify.mjs`) and device-parity
  (`capture-device-parity.mjs`) to read the constructed capture for a DECLARED scenario.
- A parity check comparing fixture and constructed `pixelHash` for every DECLARED scenario where
  both exist.

### Out of Scope

- Any edit to `src/views/*.ts` — this is a harness/capture phase, not a renderer phase.
- The eleven `scenarios.mjs` fixtures this phase does NOT declare (subtask-tree variants, mobile
  auto-fit variants, sparse-fields, mini-calendar, empty-state, toolbar popovers, chart popover
  fragments) — none depicts a state the 13 constructed scenarios' default bench data reproduces,
  so they stay fixture-authority and the bounded list is recorded rather than silently dropped.
- Landing the CSS fix `042` built, verified and reverted for three touch-target classes
  (`touch-targets-constructed-baseline.json`'s `note`) — a different phase's CSS-lane hold.
- Redesigning `touch-targets.mjs` / `unstyled-links.mjs`'s already-built constructed pass — this
  phase's job is the capture path, not those two checks' measurement path.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `tools/screenshots/capture.mjs` | Modify | Constructed scenario type, readiness wait, constructed-manifest write |
| `tools/live/render-assertion-harness.ts` | Modify | `ScenarioSpec` accepts timeline scale; capture-sized data option, regression-guarded |
| `tools/live/render-assertion-bundle.mjs` | Modify | Four new timeline-scale `SCENARIOS` entries |
| `tools/screenshots/declared-fixtures.mjs` | Create | DECLARED registry: constructed scenario id → superseded fixture id(s) |
| `screenshots/constructed/` | Create | Constructed capture PNGs, same naming convention as the fixture pipeline |
| `screenshots/constructed-manifest.json` | Create | Constructed capture manifest (id, renderer, scale, bag, device, theme, file, layoutHash, pixelHash, sourceHashes) |
| `tools/lane/check-lane.mjs` | Modify | Treat a changed constructed capture the same as a changed fixture capture |
| `tools/screenshots/verify.mjs` | Modify | DECLARED scenario staleness reads the constructed capture's `sourceHashes` |
| `tools/live/capture-device-parity.mjs` | Modify (if needed) | Confirm the existing directory scan already covers `screenshots/constructed/`; extend only if it does not |
| `tools/screenshots/fixture-constructed-parity.test.mjs` | Create | pixelHash parity assertion per DECLARED scenario |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | `capture.mjs` supports a constructed scenario type that mounts a production renderer through `buildRenderAssertionBundle()` / `runRenderAssertions()`, not a second bundle or mount implementation. |
| REQ-002 | Every constructed capture waits on a harness-owned readiness signal (animation frames) before layout measurement and screenshot; the signal lives in capture code, never in `src/views/*`. |
| REQ-003 | `render-assertion-harness.ts`'s `ScenarioSpec` can construct the timeline at all five shipped scales (`day`, `week`, `month`, `quarter`, `year`), not only its implicit default. |
| REQ-004 | The constructed mount path accepts an opt-in capture-sized row/column data option; `render-assertions.mjs`, `touch-targets.mjs` and `unstyled-links.mjs` produce byte-identical output to today when the option is not requested. |
| REQ-005 | At least one constructed scenario exists per registered view — list, table, board, gallery, calendar (month, week, day), timeline (all five scales), chart — 13 scenarios, each captured desktop + phone, both themes. |
| REQ-006 | Every constructed capture is recorded in `screenshots/constructed-manifest.json` (id, renderer, scale, bag, device, theme, file, layoutHash, pixelHash, sourceHashes), separate from the fixture manifest. |
| REQ-007 | `tools/screenshots/declared-fixtures.mjs` names every `scenarios.mjs` fixture a constructed capture supersedes, with the constructed capture as authority. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-008 | `check-lane.mjs` reds a release that changes a constructed capture's content and does not name it, the same way it already treats a changed fixture capture. |
| REQ-009 | `verify.mjs` judges a DECLARED scenario's freshness against the constructed capture's `sourceHashes`. |
| REQ-010 | `capture-device-parity.mjs`'s mobile/desktop ratchet covers the constructed captures' pairs (directly, if the existing directory scan already reaches `screenshots/constructed/`; by extension otherwise). |
| REQ-011 | A parity check compares fixture and constructed `pixelHash` for every DECLARED scenario where both exist; the comparison basis (data-aligned pixel equality vs. structural equality) is resolved by an early red-first spike (tasks.md Phase 1) rather than assumed. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `node tools/live/render-assertions.mjs`, `node tools/live/touch-targets.mjs`, `node tools/live/unstyled-links.mjs` all exit 0 after every change here — the shared seam this phase reuses stays intact for its existing three consumers.
- **SC-002**: A capture run produces 52 constructed PNGs (13 scenarios × 2 devices × 2 themes) plus `screenshots/constructed-manifest.json`, and a second run captures the identical scenario set without a crash or a silently-dropped view.
- **SC-003**: `SURFACE_PHASE=043-constructed-capture npm run gate` exits 0.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `042`'s bundle/mount seam (`render-assertion-bundle.mjs`, `render-assertion-harness.ts`) | A regression here breaks three other checks silently | Every harness edit is proven with a before/after run of all three existing consumers, not just the new capture path (REQ-004) |
| Risk | Fixture rows and bench rows are different shapes — curated ~12-20 rows vs. perf-bench 1600-2000 rows | A naive constructed capture photographs a visually unrecognisable dense render, and a naive pixelHash "parity" check compares two pictures of different data and always reds | Capture-sized data option (REQ-004); the parity basis is a named open question resolved before the check is written, not assumed |
| Risk | `requestAnimationFrame`-scheduled layout (calendar workday scroll, timeline group-width) fires after `render()` returns | A screenshot taken immediately after mount misses the corrected layout, the same class of defect `042`'s row-6 audit exists to catch | Explicit readiness wait (REQ-002), proven with a negative control: a capture taken with the wait removed must differ from one taken with it present, for at least one of the two views |
| Risk | `styles.css` is lane-held; this phase should not need to touch it | Touching it without holding the lane breaks `check-lane.mjs` for whoever does hold it | Scope excludes `styles.css` edits (§3); if a real defect surfaces, it is recorded and deferred, not fixed inline |
| Dependency | Shared build stage (`buildRenderAssertionBundle`) currently serves three checks over 17 registered scenario/bag pairs | Capture becomes a fourth consumer of the same esbuild step; a change to the bundle plugin or entry preamble affects all four | The bundle/plugin/preamble stay unmodified; new capability is additive (new `SCENARIOS` entries, a new opt-in data parameter) |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: A full constructed-capture run (13 scenarios × 2 devices × 2 themes = 52 pages) must complete inside the same detached-run discipline already used for `npm run screenshots` (foreground execution is capped at 10 minutes; run detached, wait on the PID, `pgrep` for stray Chrome before the gate).

### Security
- N/A — local headless-Chrome tooling, no network surface.

### Reliability
- **NFR-R01**: A constructed scenario whose readiness wait never resolves must fail that one capture with a named error, the same bounded-failure discipline `capture.mjs`'s existing try/catch around each fixture capture already provides (`capture.mjs:234-322`), not take the whole run down.

---

## 8. EDGE CASES

### Data Boundaries
- A constructed scenario with zero visible items in its window (e.g. calendar day scale with no
  events at the capture-sized row count): the readiness wait must still resolve — it waits on
  animation frames, not on content existing.

### Error Scenarios
- Bundle build failure (`buildRenderAssertionBundle`'s `missingSources` non-empty): the capture run
  fails loudly and refuses to write a constructed manifest entry for the affected scenario, mirroring
  `touch-targets.mjs`'s existing hard-fail on the same signal (`touch-targets.mjs:270-275`).
- Readiness wait timeout: bounded the same way the existing fixture capture already bounds a
  scenario that never settles (`capture.mjs:234-322`) — one capture is recorded as failed, the run
  continues.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 18/25 | Files: ~10, LOC: ~900-1000 est., Systems: capture pipeline + render-assertion harness + 3 gate lanes |
| Risk | 15/25 | Auth: N, API: N, Breaking: shared seam used by 3 other checks |
| Research | 14/20 | Seam investigation (this doc), row-count/data-shape mismatch, timeline scale gap |
| Multi-Agent | 8/15 | D14 lane order: devin initial pass, codex second pass, in-runtime Chrome verification |
| Coordination | 9/15 | Depends on `042` staying intact; touches css-lane, screenshots-fresh, device-parity together |
| **Total** | **64/100 (raised to Level 3)** | `recommend-level.sh --loc 1000 --files 18 --architectural` scores 71/100; a lower, more literal file/LOC estimate scores 64-69, short of the 70-point floor. Raised to Level 3 per the operator's explicit "go higher if in doubt" and parity with `042` — the direct predecessor and closest prior art for this exact class of harness-truthfulness work, itself Level 3. |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | Harness extension (REQ-003, REQ-004) regresses `render-assertions.mjs` / `touch-targets.mjs` / `unstyled-links.mjs` | H | M | Before/after run of all three on every harness edit; new capability is additive-only |
| R-002 | pixelHash parity check is unimplementable as literal pixel equality given the row/column shape mismatch | M | H | Named open question, resolved by an early spike task before the check is written |
| R-003 | Readiness wait is a fixed frame count that happens to work today and silently stops proving anything if a renderer's async correction grows past it | M | L | Negative control proves the wait matters for at least one view (§6); document the frame count's basis rather than a magic number |

---

## 11. USER STORIES

### US-001: Close the fixture-only gap in three gate lanes (Priority: P0)

**As a** maintainer of the surface-system gate, **I want** css-lane, screenshots-fresh and
device-parity to certify against a real constructed renderer for every registered view, **so that**
a `styles.css` or renderer regression these lanes are supposed to catch cannot hide behind a
hand-written fixture that never runs the shipped code.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-001 through AC-007).

---

### US-002: Never lose fixture-vs-constructed agreement silently (Priority: P1)

**As a** reviewer of a capture-pipeline change, **I want** a parity check between the fixture and
the constructed capture of the same declared view, **so that** the two pipelines cannot drift apart
unnoticed once one is declared the authority.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-008 through AC-011).

---

## 12. OPEN QUESTIONS

- Is fixture-vs-constructed parity meant as pixel-equal on data-aligned bench rows, or
  structural-equal on the harness's own perf-bench shape? Resolved by tasks.md Phase 1's spike, not
  assumed here.
- Does the existing `capture-device-parity.mjs` directory scan already cover `screenshots/constructed/`
  with zero code change (its loop is directory-and-naming-convention driven, not scenario-list
  driven), or does the baseline ratchet need an explicit bump the first time constructed pairs
  appear? Confirmed by the first real capture run, not assumed.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Durable Directive & Criteria**: See `goal.md`
- **Prior Art**: `../026-production-render-assertions/`, `../042-harness-fidelity-and-replay/`
