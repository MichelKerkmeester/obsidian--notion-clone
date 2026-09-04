---
title: "Implementation Plan: Constructed Capture"
description: "Reuse 042's bundle and mount seam inside capture.mjs, red first, D14 lane order, one CSS-lane-free phase."
trigger_phrases:
  - "constructed capture plan"
  - "043 plan"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T00:45:07Z"
    last_updated_by: "phase-author"
    recent_action: "Drafted the architecture and D14 dispatch order"
    next_safe_action: "Start tasks.md T001"
    blockers: []
    key_files:
      - "tools/screenshots/capture.mjs"
      - "tools/live/render-assertion-bundle.mjs"
      - "tools/live/render-assertion-harness.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-plan"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Constructed Capture

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (`render-assertion-harness.ts`), Node ESM (`tools/screenshots/*.mjs`, `tools/live/*.mjs`), Playwright-core (`chromium`), esbuild |
| **Framework** | None — this is tooling, not application code |
| **Storage** | JSON manifests on disk (`screenshots/constructed-manifest.json`), PNGs on disk |
| **Testing** | `vitest` for pure-logic modules; the checks themselves are their own integration tests (red/green against a real headless Chrome) |

### Overview

Extend `tools/screenshots/capture.mjs` with a second scenario type — constructed, not
hand-written — that reuses `042`'s `buildRenderAssertionBundle()` / `runRenderAssertions()` seam to
mount a real `src/views/*` renderer inside the same headless-Chrome page the fixture pipeline
already drives, wait for a harness-owned readiness signal, then screenshot it exactly like a
fixture capture. Declare which existing fixtures the new captures supersede, and widen three
fixture-only gate lanes to read the constructed capture where one is declared.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md`)
- [x] The seam this phase reuses is read in full, not assumed (`render-assertion-bundle.mjs`,
      the `onMounted` hook in `render-assertion-harness.ts`, `touch-targets.mjs`'s constructed pass
      as the working precedent for driving that seam from inside a Playwright page)
- [ ] Parity-basis spike resolved (tasks.md T001-T003) before the parity check is written

### Definition of Done
- [ ] All acceptance criteria in `acceptance-criteria.md` are `Met`, `Waived` or `Superseded`
- [ ] `render-assertions.mjs` / `touch-targets.mjs` / `unstyled-links.mjs` still exit 0
- [ ] `SURFACE_PHASE=043-constructed-capture npm run gate` exits 0
- [ ] `goal.md`'s completion criteria carry their red-then-green numbers, not just a green claim
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Extend-in-place: the constructed capture is a new mode inside the existing capture pipeline, not a
parallel tool. It shares the fixture pipeline's device/theme loop, failure bounding, and
manifest-and-README-generation discipline; it does not share the fixture pipeline's markup source.

### Key Components

- **`buildRenderAssertionBundle()` (unchanged)** — the one esbuild step. Capture becomes its
  fourth consumer, after `render-assertions.mjs`, `touch-targets.mjs`, `unstyled-links.mjs`. The
  bundle plugin and preamble are not touched; only the caller-supplied `entryBody` differs per
  consumer, exactly as the three existing ones already differ from each other.
- **`runRenderAssertions()` (extended)** — gains (a) the ability to read a timeline `scale` the
  same way it already reads a calendar `scale`, and (b) an opt-in capture-sized data parameter.
  Both are additive: called with today's arguments, it must produce today's output, proven by
  running the three existing consumers before and after.
- **Capture-side mount driver (new, in `capture.mjs`)** — for a constructed scenario, capture.mjs
  navigates a page to a static host HTML that loads the bundle (`<script src="render-bundle.js">`,
  the same pattern `touch-targets.mjs` already uses), applies the device's body class and the
  theme's `<html>` class via `page.evaluate` before mount (mirroring `buildPage()`'s existing
  theme/device handling for fixtures), calls the exposed mount function, awaits the readiness
  signal, then measures layout and screenshots — the same two capture modes (`viewport` /
  `element`) the fixture path already supports.
- **Readiness signal (new, capture-owned)** — a fixed, documented number of
  `requestAnimationFrame` waits after mount returns, run inside the page via `page.evaluate`,
  before the existing `document.fonts.ready` wait `capture.mjs` already performs. Not a `src/`-side
  completion callback: `calendar-renderer.ts` and `calendar-timeline-renderer.ts` schedule their
  post-render correction via `window.requestAnimationFrame` today (workday scroll, popover
  reposition, timeline group-width), and the capture side can wait that out without asking
  production code to report "done" — a boundary this phase does not cross.
- **`screenshots/constructed-manifest.json` (new)** — parallel to `screenshots/manifest.json`,
  same field shape (id, group, theme, device, file, layoutHash, pixelHash, sourceHashes) plus
  `renderer`/`scale`/`bag`. Kept separate so the fixture manifest rewrite in `capture.mjs`'s main
  loop (which only ever writes what a full, unfiltered run captured) is untouched by the
  constructed pass existing at all.
- **`declared-fixtures.mjs` (new)** — a flat map, constructed scenario id → array of
  `scenarios.mjs` fixture ids it supersedes. Read by `verify.mjs` (freshness authority),
  `check-lane.mjs` (changed-capture detection) and the parity test. Not a heuristic: every entry is
  a scenario this phase's own audit confirmed depicts the same state (see the table below).

### Declared mapping (from the scenario audit in `spec.md` §2)

| Constructed scenario | Supersedes fixture id(s) | Note |
|---|---|---|
| `list/file-view` | `list-view` | |
| `table/file-view` | `table-view` | |
| `board/file-view` | `board-view` | |
| `gallery/file-view` | `gallery-view` | |
| `calendar/file-view` (month) | `calendar-month-view` | |
| `calendar-week/file-view` | `calendar-week-time-grid` | |
| `calendar-day/file-view` | — | No prior fixture existed; net-new coverage |
| `timeline/file-view` (week, default) | `timeline-view` | |
| `timeline-day/file-view` (new) | `timeline-view-day` | |
| `timeline-month/file-view` (new) | `timeline-view-month` | |
| `timeline-quarter/file-view` (new) | `timeline-view-quarter` | |
| `timeline-year/file-view` (new) | `timeline-view-year` | |
| `chart/file-view` | — | No prior fixture existed; net-new coverage |

**Stays fixture-only, bounded and named (not silently dropped):** `board-subtask-tree`,
`table-mobile`, `list-mobile`, `board-mobile`, `list-sparse-fields`, `calendar-mini-calendar`,
`calendar-empty-state`, `calendar-toolbar-options`, `timeline-subtask-tree`,
`timeline-toolbar-options`, `chrome-chart-options-popover`, `chrome-chart-number`,
`chrome-chart-empty` — none depicts a state the default-bench constructed capture reproduces
(a subtask hierarchy, sparse fields, an empty-state, a settings popover, or a chart-view fragment
rather than the full view).

### Data Flow

1. `capture.mjs --constructed` (or the constructed pass folded into the default run — decided in
   tasks.md Phase 2, not pre-committed here) builds the bundle once via `buildRenderAssertionBundle`.
2. For each of the 13 scenarios × 2 devices × 2 themes: navigate a page, set viewport/device
   emulation (matching the existing `DEVICES` table), apply theme/body classes, mount via the
   exposed function, wait the readiness signal, measure `layoutHash`, screenshot, compute
   `pixelHash`, append to the constructed manifest.
3. `declared-fixtures.mjs` is read by `verify.mjs` / `check-lane.mjs` / the parity test to decide,
   per DECLARED scenario, which manifest is authoritative.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — this phase is new capability, not a bug fix, and touches no security, path,
schema, persistence or public-response surface.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state. Summary of the ordering principle: **red first**. A constructed capture
that does not exist yet must fail the manifest-presence check before the constructed scenario type
is written; the harness extension (REQ-003/REQ-004) must be proven regression-safe on the three
existing consumers before capture.mjs is wired to it; the readiness signal must be proven to matter
(a capture taken without it differs from one taken with it, for at least one view) before it is
accepted as done.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `declared-fixtures.mjs` lookup, any new pure helper (e.g. readiness-wait frame count as a named constant, not inlined) | `vitest` |
| Integration | The constructed capture run itself (headless Chrome, real bundle, real mount) | `capture.mjs`, Playwright-core, system Chrome |
| Regression | `render-assertions.mjs`, `touch-targets.mjs`, `unstyled-links.mjs` before/after every harness edit | `node tools/live/*.mjs` |
| Gate | Full lane run | `SURFACE_PHASE=043-constructed-capture npm run gate` |
| Manual | Open the 13 constructed captures and confirm each depicts the intended view/scale, not a blank or degenerate render | Reviewing the PNGs directly, same discipline as `042`'s manifest-compare A/B |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|--------------------|
| `042`'s `render-assertion-bundle.mjs` / `render-assertion-harness.ts` seam | Internal | Green (landed `main`) | This phase has no seam to reuse; would have to build one, which the scope explicitly forbids |
| Playwright-core / system Chrome | External (already installed) | Green | Capture pipeline already depends on it; no new install |
| `styles.css` lane (`tools/lane/css-lane.json`) | Internal, contended | Not held by this phase | This phase does not need to hold it — no `styles.css` edits are in scope. If a real defect surfaces mid-phase, it is recorded and deferred to a phase that holds the lane |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `render-assertions.mjs`, `touch-targets.mjs` or `unstyled-links.mjs` regresses after
  a harness edit, or `npm run gate` reds for a reason this phase introduced and cannot fix inside
  its own scope.
- **Procedure**: revert the harness edit first (REQ-003/REQ-004 are additive; reverting them
  restores the three existing consumers immediately). The constructed-manifest and
  `declared-fixtures.mjs` additions are pure-additive new files with no existing reader until this
  phase wires the three lanes — reverting the lane-wiring commits alone returns css-lane,
  screenshots-fresh and device-parity to fixture-only behaviour with zero data loss (the fixture
  manifest and `scenarios.mjs` are untouched throughout this phase).
<!-- /ANCHOR:rollback -->

---

### Dispatch order (D14) and worktree discipline

Per the parent's D14 (revised 2026-09-02): (a) an initial pass through `cli-devin` on
`deepseek-v4-flash-max` under `--permission-mode dangerous`; (b) then `gpt-5.6-luna` at
`model_reasoning_effort=xhigh` or `max`, `service_tier=fast`, through `cli-codex` or `cli-opencode`;
(c) in-runtime verification is unchanged — a fresh in-runtime agent runs the browser-driven gate
and `validate.sh` itself, because neither sandboxed nor cloud lanes can reach Chrome. No browser
number from (a) or (b) is evidence; only (c)'s own run is.

**One worktree per lane**, per this program's own trap log (a sibling lane can wipe uncommitted
work in the main checkout; verify and commit promptly). Each dispatch works its own worktree;
external results are pulled and verified in-runtime before being trusted, per D4.

**No `styles.css` edit is expected in this phase's scope**, so the CSS-lane-hold protocol
(`tools/lane/css-lane.json`, acquire → edit → recapture → read the captures → release naming every
changed capture) should not need invoking. If a genuine styling defect surfaces during scoping (for
example, a constructed capture revealing a real rendering bug no fixture ever showed), it is
recorded in `goal.md`'s log and handed to a phase that holds the lane — not fixed inline here,
per Law 2 (SCOPE LOCK) and this program's existing precedent (`042` reverted a verified CSS fix for
the same reason).

### Blast-radius note

`render-assertion-bundle.mjs`'s shared build step currently serves three checks
(`render-assertions.mjs`, `touch-targets.mjs`, `unstyled-links.mjs`) across 17 registered
scenario/bag pairs. This phase adds capture as a fourth consumer and four new timeline-scale
entries to the shared list (21 total). Every one of the three existing consumers must keep passing,
unchanged, after every commit in this phase — not only at the end. A change to the bundle plugin,
the obsidian stub, or the shared preamble is out of scope; only additive entries and an additive,
opt-in parameter are in scope.
