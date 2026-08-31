---
title: "Verification Checklist: Overlay Placement and Menu Language"
description: "Verification items for 001-overlay-placement-and-menu-language, each carrying an evidence column that records the failing number as well as the passing one."
trigger_phrases:
  - "001 overlay placement checklist"
  - "placement verification"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/001-overlay-placement-and-menu-language"
    last_updated_at: "2026-08-29T14:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Checklist cut alongside the spec; nothing verified yet"
    next_safe_action: "Complete the trigger census before ticking any item"
    blockers:
      - "000-surface-contract-and-truthful-harness must land first"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-001"
      parent_session_id: null
    completion_pct: 38
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Overlay Placement and Menu Language

<!-- SPECKIT_LEVEL: 3 -->
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
failing value from before the change and the passing value after.** One number is not evidence that
the check can distinguish; it is evidence that a number was printed.

Every item below is unticked. Nothing in this phase has been run.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-001 | P0 | `../architecture-findings.md` §7 and §9 read before any source file was opened | |
| [ ] | CHK-002 | P0 | `000-surface-contract-and-truthful-harness` has landed; the factory stamps `data-db-surface` | |
| [ ] | CHK-003 | P0 | The serialized CSS lane is free — no other spec is editing `styles.css` | |
| [ ] | CHK-004 | P0 | Baseline captured: gates run and recorded before any edit, so "no regressions" has real starting numbers | |

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:census -->
## Census

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-010 | P0 | Census enumerated by user-reachable trigger, not by module | |
| [ ] | CHK-011 | P0 | Every row records trigger, role, anchor, mount and options | |
| [ ] | CHK-012 | P0 | Desktop and phone both walked; context menus and submenus inside them included | |
| [ ] | CHK-013 | P0 | Reconciled forward: all 33 `positionToolbarPopover` call sites appear as a reachable trigger | |
| [ ] | CHK-014 | P0 | Reconciled backward: every trigger reached by hand maps to a call site | |
| [ ] | CHK-015 | P0 | Orphans recorded as findings in both directions, not silently dropped | |
| [ ] | CHK-016 | P1 | The 11 production owned menus and the `column-menu.ts` subpopover all appear | |

<!-- /ANCHOR:census -->
---

<!-- ANCHOR:criteria -->
## Acceptance Criteria

Each row closes on two numbers. The failing value is written into `spec.md` §6 before the fix.

| | ID | Pri | Criterion | Failing value (before) | Passing value (after) |
|---|---|---|---|---|---|
| [ ] | CHK-020 | P0 | **A1** every popover rect fully inside visible editing bounds at 1440/1024/768, sidebar open and closed | More tools clips — overflow px per axis per configuration | |
| [ ] | CHK-021 | P0 | **A2** same-role surfaces share padding, radius, shadow, row height, font-size — set equality | distinct-value count per property per role | |
| [ ] | CHK-022 | P0 | **A3** a menu row's computed layout is unchanged in a different container | `display` = `flex` inside `.db-owned-menu`, `block` outside; both label and value rects | |
| [ ] | CHK-023 | P0 | **A4** a submenu is produced by the same mechanism as its parent and lands inside bounds | opening a chevron row produces 0 new surface nodes | |
| [ ] | CHK-024 | P0 | **A5** Filter and Sort share role, focus behaviour and keyboard contract, asserted not inspected | Filter `role="dialog"` + trap; Sort neither; tab-cycle exit target for each | |
| [ ] | CHK-025 | P0 | **A6** removing any one class from a panel's class list moves a measured value | the four values that move when `db-filter-panel` leaves the Sort panel | |
| [ ] | CHK-026 | P0 | **A7** no reachable path produces a menu-role surface wider than its role permits | measured width of Filter, Sort and Column Manager today | |
| [ ] | CHK-027 | P0 | **AC-008** (rewritten under review finding F8) 8 panel selectors and every positioner surface report an identical computed geometry across the block-and-marker removal, and still pass A1 containment | the *before* computed-geometry table, 3 widths x 2 sidebar states | |
| [ ] | CHK-028 | P0 | **Blank-cell block (review finding F16).** AC-008 to AC-013 each have their failing number recorded from the named producer before the stage that owes it is reported complete. No number invented | provenance table in `acceptance-criteria.md` | |
| [ ] | CHK-029 | P0 | **No desktop number predates `000`'s desktop-page repair (review finding F3).** Every desktop failing and passing value was taken after `styles.css` loads on the desktop harness page | `000` handoff evidence | |

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:harness -->
## Harness Honesty

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-030 | P0 | Every check demonstrated to fail on the current tree before it is trusted | |
| [ ] | CHK-031 | P0 | Deleting the thing under test from the harness DOM changes an asserted number — for every check | |
| [ ] | CHK-032 | P0 | No criterion closed on a `styles.css` string match | |
| [ ] | CHK-033 | P0 | No DOM assertion added to a vitest suite — the runner is `environment: "node"` with no jsdom | |
| [ ] | CHK-034 | P0 | `verify-placement.mjs` still bundles the shipped positioner; nothing was reimplemented | |
| [ ] | CHK-035 | P0 | Harness extended with 1024 and 768 widths and a sidebar-closed state | |
| [ ] | CHK-036 | P1 | Popped-out-window layout added, exercising the `.app-container` / `.workspace` fallback branch | |
| [ ] | CHK-037 | P0 | Stories mount at the production mount point, not inside a convenience wrapper | |
| [ ] | CHK-038 | P0 | Every `styles.css` line number cited by this packet was re-resolved through its selector and `rg` command before being relied on; moved numbers recorded old to new (review finding F11) | |
| [ ] | CHK-039 | P0 | No criterion closed on a class being present, a call site being migrated, a block being deleted, or a population being classified (review finding F8) | |

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
| [ ] | CHK-045 | P1 | New modules carry the banner and numbered sections the comment scanner requires | |
| [ ] | CHK-046 | P1 | Lint at the existing baseline, not above | |

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-047 | P0 | `npm test` green from the final state | |
| [ ] | CHK-048 | P0 | No DOM assertion added to a vitest suite — the runner has no jsdom | |
| [ ] | CHK-049 | P0 | Mock elements in new tests implement `setCssProps` | |
| [ ] | CHK-049b | P0 | No test asserts a rule count that a media query would break | |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-050 | P0 | All 33 call sites addressed, not a subset | |
| [ ] | CHK-051 | P0 | All 14 row grammars in `toolbar-renderer.ts` retired, not the two duplicates only | |
| [ ] | CHK-052 | P0 | `submenu: true` opens a real submenu; the chevron and the mechanism are the same thing | |
| [ ] | CHK-053 | P0 | `column-menu.ts`'s body-mounted subpopover retired only after the factory-backed submenu passes A4 | |
| [ ] | CHK-054 | P0 | The 520px default is unreachable from any code path | |
| [ ] | CHK-055 | P0 | Dead panel layout block at `styles.css:9829-9852` deleted or made live | |
| [ ] | CHK-056 | P0 | `db-anchored-popover` deleted or given a rule | |
| [ ] | CHK-057 | P0 | Sort's dual-class dependency resolved — declared explicitly or eliminated | |
| [ ] | CHK-058 | P0 | No adjacent defect "improved" outside the declared scope | |

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:visual -->
## Visual Verification

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-060 | P0 | Full screenshot recapture — partial recapture cannot satisfy the manifest | |
| [ ] | CHK-061 | P0 | `npm run screenshots:verify` exit 0 | |
| [ ] | CHK-062 | P0 | **A human opened every changed PNG.** `screenshots:verify` never opens an image | |
| [ ] | CHK-063 | P0 | Captures taken at 4 widths x sidebar open and closed | |
| [ ] | CHK-064 | P0 | Storybook shows each role's members side by side | |
| [ ] | CHK-065 | P0 | Operator confirmed on device that misplaced and inconsistent dropdowns are resolved | |
| [ ] | CHK-066 | P0 | **`styles.css` lane taken at Phase 5 and released at Phase 7**, with all four release conditions met in order | |
| [ ] | CHK-067 | P0 | **Human capture review signed off by name** — not by `screenshots:verify`, which never opens an image | |
| [ ] | CHK-068 | P0 | **`008`'s early replay re-asserted `000`, `004` and `005`** against the tree this packet released, and all three re-closed | |
| [ ] | CHK-069 | P0 | Cascade re-confirmation: every duplicated selector this packet touched has its computed winner recorded, and a changed winner carries a written disposition | |

<!-- /ANCHOR:visual -->
---

<!-- ANCHOR:research-gate -->
## Research Gate

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-070 | P1 | Gate fired only on the rule — a criterion failing twice without a new hypothesis | |
| [ ] | CHK-071 | P0 | `external/` read for behaviour only; no code, CSS value or token scale copied | |
| [ ] | CHK-072 | P0 | Notion treated as the visual target, not as a source | |

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
| [ ] | CHK-085 | P1 | Any deviation from the placement contract recorded with its reason | |

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-086 | P1 | `styles.css` not split; edits made in the serialized CSS lane | |
| [ ] | CHK-087 | P1 | Screenshot scenarios added in the same change as any new surface | |
| [ ] | CHK-088 | P1 | Each row grammar retired in its own commit, so a regression bisects to a grammar | |

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:arch-verify -->
## Architecture Verification

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-100 | P0 | Every placement and appearance rule keys off `[data-db-surface]`, never off ancestry | |
| [ ] | CHK-101 | P0 | Sizing is a property of the role; no call site passes a bespoke width that a role does not name | |
| [ ] | CHK-102 | P0 | The phase did not end with fifteen roles — that would be the present state renamed | |
| [ ] | CHK-103 | P0 | A submenu joins the overlay stack by the decision recorded in `spec.md` OPEN QUESTIONS, not by an invented rule | |

<!-- /ANCHOR:arch-verify -->
---

<!-- ANCHOR:perf-verify -->
## Performance Verification

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-110 | P0 | The placement contract adds no reposition listener the positioner did not already own | |
| [ ] | CHK-111 | P0 | The submenu mechanism attaches its listeners on open and removes them on close; no leak across open/close cycles | |
| [ ] | CHK-112 | P1 | Row-grammar substitution did not increase the node count of any menu | |

<!-- /ANCHOR:perf-verify -->
---

<!-- ANCHOR:compliance-verify -->
## Compliance Verification

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-120 | P0 | `external/` was read for behaviour only. AnyType and AppFlowy are AGPL or source-available; this plugin is MIT | |
| [ ] | CHK-121 | P0 | No code, CSS value or token scale copied from `external/`; every value derives from our own scale | |
| [ ] | CHK-122 | P0 | Notion informed the visual target by description only, never as a source | |
| [ ] | CHK-123 | P0 | The plugin remains MIT-forkable: no network call, no telemetry, no remote dependency | |

<!-- /ANCHOR:compliance-verify -->
---

<!-- ANCHOR:docs-verify -->
## Documentation Verification

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-130 | P0 | Every criterion in `spec.md` §6 carries its recorded failing number, not only the passing one | |
| [ ] | CHK-131 | P0 | `implementation-summary.md` reconciles with `spec.md` status — no conflicting completion claims | |
| [ ] | CHK-132 | P1 | The census is preserved as an artifact, not discarded once the work is done | |
| [ ] | CHK-133 | P1 | Every deviation from the placement contract is recorded with its reason | |

<!-- /ANCHOR:docs-verify -->
---

<!-- ANCHOR:deploy-ready -->
## Release Readiness

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-140 | P0 | `npm run build` produces a bundle from the final state | |
| [ ] | CHK-141 | P0 | All 196 captures fingerprint the final `styles.css` | |
| [ ] | CHK-142 | P0 | The serialized CSS lane is released — the next spec may take `styles.css` | |
| [ ] | CHK-143 | P0 | The rollback path is confirmed: reverting requires re-capturing, and that is written down | |

<!-- /ANCHOR:deploy-ready -->
---

<!-- ANCHOR:sign-off -->
## Sign-Off

| | ID | Pri | Item | Evidence |
|---|---|---|---|---|
| [ ] | CHK-150 | P0 | Every P0 item above is ticked with checkable evidence | |
| [ ] | CHK-151 | P0 | **Operator confirms on device that misplaced and inconsistent dropdowns are resolved.** Gate passage alone has already been shown to be insufficient evidence in this program | |
| [ ] | CHK-152 | P0 | Successor `002-properties-panel` is unblocked: the panel now goes through the factory and only its row grid remains | |

<!-- /ANCHOR:sign-off -->
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
