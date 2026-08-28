---
title: "Task Breakdown: Mobile Name Column and New-Button Reach"
description: "Task breakdown for the three phone defects left by 011: the title-cell intrinsic-width fix so the auto-layout name column stops collapsing, the touch icon form of the open affordance with its clearance padding, the floating New button's measured nav-bar reserve, the enriched reproduction scenario and the touch-path unit test."
trigger_phrases:
  - "mobile name column and fab tasks"
  - "title column fab task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/012-mobile-name-column-and-fab"
    last_updated_at: "2026-08-29T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored task breakdown and verification checklist"
    next_safe_action: "None; gates green"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-012"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Mobile Name Column and New-Button Reach

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Notation | Meaning |
|---|---|
| `[S]` | Small task (< 30 min) |
| `[M]` | Medium task (30–90 min) |
| `- [ ]` | Incomplete |
| `- [x]` | Completed |

**Task Format**: `T### [S/M/L] Description (evidence)`

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [M] Read the 011 phone auto-fit CSS (`.is-phone .db-table { table-layout: auto }`, `styles.css:4508`) and the title-cell/affordance/FAB code to establish why the name column is special (REQ-001..REQ-003)
- [x] T002 [S] Confirm the title link is `width: 100%` inside `.db-file-title-inline { overflow: hidden }` (`styles.css:5380`, `5395`), which contributes no intrinsic width under auto layout (REQ-001)
- [x] T003 [S] Confirm the sibling open control already uses `setIcon(openBtn, "maximize-2")` (`record-detail-panel.ts:225`) and that the affordance is always visible on touch (`styles.css:18115`) (REQ-002)
- [x] T004 [S] Confirm `popover-position.ts:272` already measures `.mobile-navbar` height + `--safe-area-inset-bottom`, and that the FAB offset reserves only the safe area (`styles.css:18985` pre-fix) (REQ-003)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T005 [S] Phone title-cell sizing: `td.db-title-cell a { width: max-content; min-width: 128px; max-width: 60vw }` (`styles.css:18153`) (REQ-001)
- [x] T006 [S] Phone affordance clearance: `td.db-record-open-host { padding-right: 32px }` (`styles.css:18161`) (REQ-002)
- [x] T007 [M] Touch open affordance as an icon: `isTouchDevice` branch → `db-record-open-btn-icon` + `setIcon(button, "maximize-2")`, desktop keeps the text label, `aria-label` unconditional (`table-record-peek.ts:83`) (REQ-002)
- [x] T008 [S] Icon-button sizing: `.db-record-open-btn.db-record-open-btn-icon { width: 24px; padding: 0 }` + 16px `.svg-icon` (`styles.css:18137`) (REQ-002)
- [x] T009 [M] FAB nav-bar reserve: `reserveMobileFabInset` measures `.mobile-navbar` and publishes `--db-mobile-navbar-height` via `setCssProps` (`toolbar-renderer.ts:2239`) (REQ-003)
- [x] T010 [S] FAB offset adds `var(--db-mobile-navbar-height, 0px)` (`styles.css:18988`) (REQ-003)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 [S] Enrich `table-mobile` with the real title cell (`db-title-cell` → link → `db-file-title-inline` → `db-file-title-name`) + icon affordance; extend its `sources` (`core.mjs`) (REQ-005)
- [x] T012 [M] Complete the obsidian mock (`Platform`, `setIcon`) and add the touch icon-path test in `table-record-peek.test.ts` (REQ-005)
- [x] T013 [S] Recapture; eyeball `table-mobile-mobile-light.png` — long names full, overlong name capped, affordance an icon (REQ-001, REQ-002)
- [x] T014 [S] Whole gate from the final state (tsc, build, vitest, screenshots, verify, lint, source-gates)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No blocked tasks remaining
- [x] Whole gate green from the final state

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:cross-refs -->
---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in `spec.md` (5 requirements, 3 P0 / 2 P1)
- [x] CHK-002 [P0] Technical approach defined in `plan.md` (three is-phone/touch corrections on top of 011)
- [x] CHK-003 [P1] Root cause confirmed against source before any edit (title link `width:100%` inside `overflow:hidden` under `table-layout:auto`)

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` exit 0 from the final state
- [x] CHK-011 [P0] `npm run build` exit 0 from the final state (`main.js` rebuilt)
- [x] CHK-012 [P1] Every layout rule is `is-phone`-scoped and the icon path is `isTouchDevice`-gated; desktop untouched (verified in `table-mobile-desktop-*.png` and by selector inspection)
- [x] CHK-013 [P1] Comments carry the durable WHY only; no spec/requirement/task ids in code (title-cell block, affordance branch, `reserveMobileFabInset` doc, FAB calc comment)
- [x] CHK-014 [P1] Dynamic style write goes through `setCssProps`, not `element.style.*`; `npm run lint` unchanged at 115 problems (100 errors, 15 warnings)
- [x] CHK-015 [P1] `run-source-gates.sh` all PASS from the final state (no new source files; folder-docs unchanged)

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] `table-record-peek.test.ts` — touch icon-path test passes (`maximize-2` set, aria-label kept, no text label)
- [x] CHK-021 [P0] Whole suite green: 50 files, 397 tests (was 50/396; +1 test)
- [x] CHK-022 [P0] `table-mobile-mobile-light.png` eyeballed: name column hugs content, "Adobe Creative Cloud" / "Google Workspace" full, overlong name capped, affordance a maximize icon
- [x] CHK-023 [P1] Desktop capture re-eyeballed for no regression (`table-mobile-desktop-*.png`: title cell and hover open label unchanged)
- [x] CHK-024 [P1] `npm run screenshots:verify` clean at 196 entries (no scenario added; `table-mobile` enriched)
- [x] CHK-025 [P1] `screenshot-fixtures.test.ts` class guard passes: no invented `.db-*` class in the enriched fixture

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class recorded: three independent `instance` defects (name-column collapse, text-label affordance, FAB under nav bar), each a facet of the phone diverging from desktop assumptions 011 began correcting
- [x] CHK-FIX-002 [P0] Same-class producer inventory: the title cell is the only column whose content declares its own width; every value column is already intrinsically sized, so only the title cell needed the intrinsic-width fix
- [x] CHK-FIX-003 [P0] Consumer inventory: the icon branch keeps the same `db-record-open-btn` class, `aria-label` and click wiring; the FAB reserve inherits a custom property without touching the FAB's other rules
- [x] CHK-FIX-004 [P0] Not a security/path/parser fix — the name bound (`max-content` + floor + 60vw cap) is stated and verified against the long-name fixture
- [x] CHK-FIX-005 [P1] Reproduction: the `table-mobile` mobile capture reproduces the collapse and confirms the fix; the FAB clearance is verified at the CSS+JS layer (static harness gap recorded)
- [x] CHK-FIX-006 [P1] Not process/global-state dependent
- [x] CHK-FIX-007 [P1] Evidence pinned to the shipped tree (stylesheet + source line refs and the regenerated 196-entry manifest)

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets; no network, telemetry or remote dependency
- [x] CHK-031 [P0] No input parsing added; `reserveMobileFabInset` reads only an element's measured height
- [x] CHK-032 [P1] Display-only: zero writes to note frontmatter or bodies; iCloud-safe

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] `spec.md` / `plan.md` / `tasks.md` / `implementation-summary.md` synchronized; parent phase-map row added as Complete
- [x] CHK-041 [P1] Code comments explain the WHY (why the title cell collapses under auto layout, why the icon on touch, why the nav-bar reserve)
- [x] CHK-042 [P2] `screenshots/README.md` regenerated by the full capture

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] No temp files created; `git status` shows only source, fixture, test, regenerated screenshots and these docs
- [x] CHK-051 [P1] No new source files added, so no folder-docs obligation triggered

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|---|---|---|
| P0 Items | 11 | 11/11 |
| P1 Items | 13 | 13/13 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-29

<!-- /ANCHOR:summary -->
