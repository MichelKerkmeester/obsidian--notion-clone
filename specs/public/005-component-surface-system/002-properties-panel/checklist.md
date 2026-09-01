---
title: "Verification Checklist: Properties Panel"
description: "Verification items for 002-properties-panel, each carrying an evidence column that records the failing number as well as the passing one."
trigger_phrases:
  - "002 properties panel checklist"
  - "property row grid verification"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/002-properties-panel"
    last_updated_at: "2026-08-29T14:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Checklist cut alongside the spec; nothing verified yet"
    next_safe_action: "Complete the row-grid audit matrix before ticking any item"
    blockers:
      - "001-overlay-placement-and-menu-language must land first"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-002"
      parent_session_id: null
    completion_pct: 43
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Properties Panel

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

An item is ticked only when it was verified by reading the tree or by reading a command's output
and exit status directly. **An item carrying a criterion needs two numbers in its evidence: the
failing value from before the change and the passing value after.**

Every item below is unticked. Nothing in this phase has been run.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-001 | P0 | `../architecture-findings.md` §4 and §9 read before any source file was opened | |
| [ ] | CHK-002 | P0 | `001-overlay-placement-and-menu-language` has landed; the panel has a role and a settled width | |
| [ ] | CHK-003 | P0 | The serialized CSS lane is free — no other spec is editing `styles.css` | |
| [ ] | CHK-004 | P0 | Baseline captured: gates run and recorded before any edit | |

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:audit -->
## Row-Grid Audit

The matrix is the phase's first deliverable. Each cell carries four numbers.

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-010 | P0 | Every emitted child of `.db-column-manager-row` enumerated in source order | |
| [ ] | CHK-011 | P0 | Matrix covers read-only, required, file field, computed — at both breakpoints | |
| [ ] | CHK-012 | P0 | Each cell records emitted count, **laid-out** count, declared track count, and every child's resolved grid row | |
| [ ] | CHK-013 | P0 | The emitted-versus-laid-out gap is recorded wherever a child is `display: none` | |
| [ ] | CHK-014 | P0 | Desktop diff recorded: 7 declared tracks vs 8 laid-out children | |
| [ ] | CHK-015 | P0 | Phone diff recorded: 8 declared tracks vs 7 laid-out children | |

<!-- /ANCHOR:audit -->
---

<!-- ANCHOR:criteria -->
## Acceptance Criteria

Each row closes on two numbers. The failing value is written into `spec.md` §6 before the fix.

| | ID | Pri | Criterion | Failing value (before) | Passing value (after) |
|---|---|---|---|---|---|
| [ ] | CHK-020 | P0 | **B1** every laid-out child resolves to grid row 1; row height `<= 36px` both viewports | desktop 8 children into 7 tracks; height 52px against declared `min-height: 30px`; trash on an implicit second row | |
| [ ] | CHK-021 | P0 | **B2** declared track count equals laid-out child count, every breakpoint and condition | desktop 7 vs 8; phone 8 vs 7 | |
| [ ] | CHK-022 | P0 | **B3** name content width `>= 120px` desktop / `>= 96px` phone, right edge inside the panel content box | the phone name track measures 22px | |
| [ ] | CHK-023 | P0 | **B4** panel height `<= min(560px, 0.7 * visibleBounds.height)` at 40 properties | the positioner's inline `maxHeight` takes the full available bounds | |
| [ ] | CHK-024 | P0 | **B5** delete is not a bare one-click target in the primary line | `db-column-delete-btn` deletes on one click from the row itself | |
| [ ] | CHK-025 | P0 | **B6** removing a condition's child changes the declared areas, not the ordinal meaning of the others | hiding the drag handle on phone shifts every subsequent child one track left | |
| [ ] | CHK-026 | P0 | **AC-007** (rewritten under review finding F8) primary line measured at 402px and 1440px: 0 controls past the panel content box, 0 needing horizontal scroll, name at its width floor, overflow reachable in `<= 1` interaction | the *before* primary-line measurement of today's emitted row | |
| [ ] | CHK-027 | P0 | **Blank-cell block (review finding F16).** AC-007 to AC-012 each have their failing number recorded from the named producer before the stage that owes it is reported complete. No number invented | provenance table in `acceptance-criteria.md` | |
| [ ] | CHK-028 | P0 | **No desktop number predates `000`'s desktop-page repair (review finding F3).** The desktop defect is a cascade defect and cannot appear on a page with no stylesheet | `000` handoff evidence | |

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:harness -->
## Harness Honesty

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-030 | P0 | Every check demonstrated to fail on the current tree before it is trusted | |
| [ ] | CHK-031 | P0 | Deleting the thing under test from the harness DOM changes an asserted number — for every check | |
| [ ] | CHK-032 | P0 | The panel is rendered by the real `column-manager-renderer` at its production mount point, not from fixture markup | |
| [ ] | CHK-033 | P0 | No criterion closed on a `styles.css` string match — a string match cannot say which of two identical selectors won | |
| [ ] | CHK-034 | P0 | No DOM assertion added to a vitest suite — the runner is `environment: "node"` with no jsdom | |
| [ ] | CHK-035 | P0 | Both viewports driven, including the `is-phone` body class the phone rules key off | |
| [ ] | CHK-036 | P0 | Every condition in the matrix drivable from the harness, read-only included | |
| [ ] | CHK-037 | P0 | Per-child readout of resolved `grid-area` and `grid-row-start` available | |
| [ ] | CHK-038 | P0 | The 40-property case measured, not approximated — B4 is unreachable at 12 properties | |
| [ ] | CHK-039 | P0 | Both duplicate selector pairs re-resolved with `rg -n` and read **in order** before being relied on; moved line numbers recorded old to new (review finding F11) | |
| [ ] | CHK-040 | P0 | No criterion closed on a class being present, a rule pair being collapsed, a decision document existing, or a population being classified (review finding F8) | |

<!-- /ANCHOR:harness -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-040 | P0 | `npx tsc --noEmit` exit 0, no output, read without a pipe | |
| [ ] | CHK-041 | P0 | `npm run build` exit 0 | |
| [ ] | CHK-042 | P0 | `npm test` all passing from the final state | |
| [ ] | CHK-043 | P1 | No `element.style.*` assignment with a string literal; `setCssProps` used | |
| [ ] | CHK-044 | P1 | No spec path, requirement id, task id or phase number in any code comment | |
| [ ] | CHK-045 | P1 | Lint at the existing baseline, not above | |

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-046 | P0 | `npm test` green from the final state | |
| [ ] | CHK-047 | P0 | No DOM assertion added to a vitest suite — the runner has no jsdom | |
| [ ] | CHK-048 | P0 | Mock elements in new tests implement `setCssProps` | |
| [ ] | CHK-049 | P0 | No criterion closed on a `styles.css` string match — a string match cannot say which of two identical selectors won | |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-050 | P0 | Positional track list replaced by named grid areas, in one change | |
| [ ] | CHK-051 | P0 | `styles.css:2036` and `styles.css:18776` resolved to one declaration | |
| [ ] | CHK-052 | P0 | `styles.css:16879` and `styles.css:16995` resolved to one declaration | |
| [ ] | CHK-053 | P0 | Each pair resolved **by deletion**, never by appending a third rule that wins | |
| [ ] | CHK-054 | P0 | Every condition in the matrix has a declared area set | |
| [ ] | CHK-055 | P0 | The panel's height cap is its own, independent of the positioner's inline `maxHeight` | |
| [ ] | CHK-056 | P0 | The information-architecture decision stayed inside its bound — what the row shows and what hides; editing flows untouched | |
| [ ] | CHK-057 | P0 | No adjacent defect "improved" outside the declared scope | |

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:visual -->
## Visual Verification

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-060 | P0 | Full screenshot recapture — partial recapture cannot satisfy the manifest | |
| [ ] | CHK-061 | P0 | `npm run screenshots:verify` exit 0 | |
| [ ] | CHK-062 | P0 | **A human opened every changed PNG**, at 3, 12 and 40 properties, both viewports | |
| [ ] | CHK-063 | P0 | Storybook shows one row state per condition in the matrix | |
| [ ] | CHK-064 | P0 | Operator confirmed on device that labels are no longer clipped, the trash icon is not on its own row, and the panel is no longer full height | |
| [ ] | CHK-065 | P0 | Operator confirmed on device that delete is no longer a one-tap hazard. R6 is behavioural; a capture cannot close it | |
| [ ] | CHK-066 | P0 | **`styles.css` lane taken at Phase 3 and released at Phase 5**, with all four release conditions met in order | |
| [ ] | CHK-067 | P0 | **Human capture review signed off by name** — not by `screenshots:verify`, which never opens an image | |
| [ ] | CHK-068 | P0 | **`008`'s early replay re-asserted `000`, `004`, `005` and `001`** against the tree this packet released, and all four re-closed | |
| [ ] | CHK-069 | P0 | Cascade re-confirmation: both collapsed duplicate pairs have their computed winner recorded before and after, and a changed winner carries a written disposition | |

<!-- /ANCHOR:visual -->
---

<!-- ANCHOR:research-gate -->
## Research Gate

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-070 | P1 | Gate fired only on the rule — a criterion failing twice without a new hypothesis | |
| [ ] | CHK-071 | P0 | Notion treated as the visual target, not as a source; values derived from our own token scale | |
| [ ] | CHK-072 | P0 | `external/` read for behaviour only; no code, CSS value or token scale copied | |

<!-- /ANCHOR:research-gate -->
---

<!-- ANCHOR:security -->
## Security

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-080 | P0 | No network call, telemetry or remote dependency added | |
| [ ] | CHK-081 | P0 | No secret, token or absolute personal path in any artifact | |
| [ ] | CHK-082 | P0 | No write to the operator's vault beyond the declared testbed | |

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-083 | P1 | `implementation-summary.md` written once work starts | |
| [ ] | CHK-084 | P1 | Failing and passing numbers recorded against every requirement | |
| [ ] | CHK-085 | P1 | The information-architecture decision recorded with its reasoning, not only its outcome | |

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-086 | P1 | `styles.css` not split; edits made in the serialized CSS lane | |
| [ ] | CHK-087 | P1 | Screenshot scenarios added in the same change as any new row condition | |

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:final -->
## Final State

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-090 | P0 | Whole gate set rerun from the final state, output and exit status read | |
| [ ] | CHK-091 | P0 | Scoped diff contains no task-created residue | |
| [ ] | CHK-092 | P0 | Every criterion carries both its failing and its passing number | |
| [ ] | CHK-093 | P0 | `implementation-summary.md` written and reconciled against `spec.md` status | |
| [ ] | CHK-094 | P0 | Captures match the final `styles.css`; a revert would require re-capturing too | |

<!-- /ANCHOR:final -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | not run |
| `npm run build` | not run |
| `npm test` | not run |
| `npm run storybook:placement` | not run |
| `npm run storybook:coverage` | not run |
| `npm run screenshots:verify` | not run |
| human PNG review | not run |
| device confirmation | not run |

<!-- /ANCHOR:summary -->
