---
title: "Goal: Constructed Capture"
description: "What would make phase 043 worth having done, and the criteria that decide it."
trigger_phrases:
  - "043 goal"
  - "constructed capture goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T00:45:07Z"
    last_updated_by: "phase-author"
    recent_action: "Opened the phase against the parent's DONE-row-6 audit and 042's seam"
    next_safe_action: "tasks.md T001 — confirm the seam contract before writing any code"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "tools/screenshots/capture.mjs"
      - "tools/live/render-assertion-bundle.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Is fixture-vs-constructed parity pixel-equal on aligned data, or structural-equal on the harness's own shape (spec.md §12, resolved by tasks.md T003)"
    answered_questions: []
---
# Goal: Constructed Capture

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Give css-lane, screenshots-fresh and device-parity a real, constructed-renderer
photograph for every registered view, reusing `042`'s bundle-and-mount seam rather than a second
copy, so the parent's DONE-row-6 fixture-only dependency is closed or reduced to a bounded, named
list.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | The constructed capture reuses `042`'s `buildRenderAssertionBundle()`/`runRenderAssertions()` seam. No second bundle step, no second mount implementation (parent D12: prefer parity between independent producers, never a second producer that can drift). |
| D2 | The readiness signal lives in capture code (`tools/`), never in `src/views/*`. This phase does not cross into renderer edits (parent D1, D10). |
| D3 | The harness extension (timeline scale, capture-sized data) is additive only. Every commit that touches `render-assertion-harness.ts` or `render-assertion-bundle.mjs` is proven against all three existing consumers before it is proven against this phase's own new use. |
| D4 | A `scenarios.mjs` fixture is DECLARED superseded only when the constructed capture's default bench data actually reproduces the same state. A fixture depicting a state no default-bench constructed capture shows (subtask tree, sparse fields, mobile auto-fit, empty state, a settings popover) stays fixture-authority, named rather than silently dropped. |
| D5 | This phase reaches Verified by construction, per `026`'s D5 and `042`'s D4. No operator-facing criterion — nothing built here is a device-facing surface; every check is a headless-Chrome capture or a manifest/lane comparison. |
| D6 | No `styles.css` edit is in this phase's scope. A real defect found while scoping is recorded and deferred to a phase that holds the CSS lane, not fixed inline (parent D7, D11). |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] `capture.mjs` supports a constructed scenario type whose bundle input list includes the real
      `src/views/*` renderer source. **Today: 0.** `grep -c "buildRenderAssertionBundle" tools/screenshots/capture.mjs`
      reads 0 — `capture.mjs` imports only `scenarios.mjs`'s hand-written `SCENARIOS`
      (`capture.mjs:27`) and has no constructed-mount code path at all.
- [ ] A readiness signal gates every constructed capture, proven to matter by a negative control
      (capture with the wait removed differs from capture with it present, for at least one of the
      calendar week/day or timeline views). **Today: N/A — no constructed capture exists to gate.**
      The two production files that need it are real and unmodified so far:
      `calendar-renderer.ts:605`/`:1482` and `calendar-timeline-renderer.ts:906` all schedule a
      post-render correction on the next `requestAnimationFrame`.
- [ ] `render-assertion-harness.ts` can construct the timeline at all five shipped scales.
      **Today: 1 (implicit default only).** `ScenarioSpec.scale` is typed
      `"month" | "week" | "day"` — no `timeline` entry can ever request `quarter` or `year`, and
      `render-assertion-bundle.mjs`'s `SCENARIOS` carries exactly 2 timeline entries
      (`timeline/file-view`, `timeline/embed`), neither naming a scale.
- [ ] The constructed mount path has an opt-in capture-sized data option, and the three existing
      consumers are unchanged when it is not used. **Today: 0 — no such option exists**; every
      constructed render uses the fixed perf-bench shape (`LIST_ROWS = 1600`, `TABLE_ROWS = 2000`,
      `CALENDAR_ROWS`/`TIMELINE_ROWS`/`BOARD_ROWS`/`GALLERY_ROWS` = 1600, all at 30% fill,
      `render-assertion-harness.ts:106-160`), unconditionally.
- [ ] `screenshots/constructed-manifest.json` carries 52 entries (13 scenarios × 2 devices × 2
      themes) covering every registered view. **Today: the file does not exist.**
      `test -f screenshots/constructed-manifest.json` fails.
- [ ] `declared-fixtures.mjs` names every fixture a constructed capture supersedes, and every
      fixture that stays fixture-only. **Today: the file does not exist**, and the mapping is
      currently only prose in `plan.md` §3 — 11 DECLARED entries, 2 net-new (chart, calendar-day),
      13 named fixture-only.
- [ ] css-lane (`check-lane.mjs`) reds an unnamed change to a constructed capture the same way it
      already reds an unnamed fixture change. **Today: N/A** — `check-lane.mjs`'s
      `contentChangedCaptures()` reads only `screenshots/manifest.json`
      (`tools/lane/check-lane.mjs`); it has no path to a constructed capture at all yet.
- [ ] screenshots-fresh (`verify.mjs`) judges a DECLARED scenario's staleness against the
      constructed capture's `sourceHashes`. **Today: N/A** — `verify.mjs` iterates only
      `scenarios.mjs`'s `SCENARIOS` (`tools/screenshots/verify.mjs:41`); no DECLARED concept exists
      yet for it to read.
- [ ] device-parity (`capture-device-parity.mjs`) covers the constructed captures' mobile/desktop
      pairs. **Today: N/A** — its directory scan already reaches every group under `screenshots/`
      with zero scenario-list coupling (`capture-device-parity.mjs:47-61`), so this criterion may
      resolve with no code change; confirmed only once a real constructed capture exists to scan.
- [ ] A parity check compares fixture and constructed `pixelHash` for every DECLARED scenario where
      both exist, stating its comparison basis explicitly. **Today: 0** — no such test file exists,
      and the basis itself is an open question (data-aligned pixel equality vs. structural) pending
      the capture-sized data option above.
- [ ] `SURFACE_PHASE=043-constructed-capture npm run gate` exits 0. **Today: not yet run against
      this phase's own changes** — no code has landed. The bare gate (`npm run gate`) currently
      reads 25 green per the parent's most recent audit (`goal.md` DONE row 4, 2026-09-04T06:40:00Z
      re-verification); this phase's own commits must not move that number down.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow. Progress, evidence, deviations
and findings belong here.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase folder opened | Done | `specs/005-component-surface-system/043-constructed-capture/` scaffolded via `create.sh --phase --parent`, Level 3 |
| Seam investigation (capture.mjs, render-assertion-bundle.mjs, render-assertion-harness.ts) | Done | `spec.md` §2, `plan.md` §3 — read in full, not summarised; confirmed `capture.mjs` has zero constructed-mount code, confirmed the timeline-scale gap in `ScenarioSpec`, confirmed the row/column shape mismatch between the fixture and bench pipelines |
| Fixture-vs-constructed scenario audit | Done | `plan.md`'s Architecture table — 70 total fixtures in `scenarios.mjs` (`node -e` count), 21 in the `views` group, 11 mappable to a constructed scenario, 13 staying fixture-only, 2 genuine coverage gaps (chart, calendar-day) with no prior fixture at all |
| Constructed scenario type in `capture.mjs` | Pending | tasks.md T007 |
| Readiness signal | Pending | tasks.md T008 |
| Timeline scale + capture-sized data harness extension | Pending | tasks.md T004-T006 |
| 13-scenario constructed manifest | Pending | tasks.md T009 |
| `declared-fixtures.mjs` | Pending | tasks.md T010 |
| css-lane / screenshots-fresh / device-parity wiring | Pending | tasks.md T011-T014 |
| Fixture-vs-constructed parity test | Pending | tasks.md T016 |

### Deviations and findings

| Item | Note |
|------|------|
| Level raised over `recommend-level.sh`'s literal answer | A conservative estimate (`--loc 700 --files 12 --architectural`) scores 64/100 and a moderately higher one (`--loc 900 --files 16`) scores 69/100 — both short of the 70-point Level 3 floor. A fuller estimate matching the actual file/LOC footprint (`--loc 1000 --files 18 --architectural`) scores 71/100. Raised to Level 3 per the operator's explicit "go higher if in doubt" and parity with `042` — the direct predecessor and closest prior art for this exact class of harness-truthfulness work, itself Level 3. |
| "~230 scenarios" from the dispatch brief does not match anything in the repository | Neither `042`'s docs (read in full — `implementation-summary.md`, `tasks.md`, `goal.md`, `spec.md`, `plan.md`, `acceptance-criteria.md`) nor a repo-wide grep for a number near 230 in `tools/live/` or `tools/screenshots/` produced that figure. The real, verified numbers used throughout this packet instead: `scenarios.mjs` registers 70 hand-written scenarios producing 276 capture-manifest entries (scenario × device × theme, some device-restricted); `render-assertion-bundle.mjs`'s shared `SCENARIOS` list — the seam this phase actually reuses — carries 17 entries shared by 3 checks, growing to 21 with this phase's four new timeline-scale additions. |
| The fixture and constructed-bench mock data are different shapes | Not invented for this doc — read directly: `scenarios/shared.mjs`'s `ROWS` is ~12-20 hand-curated rows meant to "photograph as populated"; `render-assertion-harness.ts`'s bench constants are 1600-2000 rows at 30% fill, the exact shape the freeze-regression checks were built to measure. Reusing the mount seam verbatim (as `plan.md` §6's blast-radius note requires) means constructed captures would show the perf-bench shape unless an opt-in capture-sized option is added — recorded as REQ-004/AC-004, not silently assumed away. |
<!-- /ANCHOR:log -->
