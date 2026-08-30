---
title: "Goal: Component Surface System"
description: "The durable directive for the component surface program, and the criteria that decide when it is done."
trigger_phrases:
  - "surface system goal"
  - "005 goal"
  - "component surface directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system"
    last_updated_at: "2026-08-30T10:45:00Z"
    last_updated_by: "roadmap-reconciliation"
    recent_action: "Goal restructured to the template; volatile findings moved below the log boundary"
    next_safe_action: "Get the operator onto 1.3.3 and confirm the sheet drag after editing a field"
    blockers:
      - "004 state contested; gate red at 12/13 on stale captures; report 1 fixed but unconfirmed on device"
    key_files:
      - "roadmap.md"
      - "spec.md"
      - "design-system.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-parent"
      parent_session_id: null
    completion_pct: 55
    open_questions:
      - "Does report-driven scheduling replace the declared 009-first order"
    answered_questions:
      - "Reports 7 and 16 had no owning phase; 018 and 019 now own them"
---
# Goal: Component Surface System

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Give the plugin's floating surfaces, sheets, checkboxes and content rows one
architecture, and prove each operator-reported defect fixed **on the operator's device** rather than
in a harness.

### Decisions

| ID | Decision |
|----|----------|
| D1 | A check that does not drive the production path proves nothing. Hand-written fixture markup is not evidence. |
| D2 | A criterion needs a threshold and a recorded failing number, observed red before it went green. |
| D3 | Shipped, verified and operator-confirmed are three states. Only the third closes anything. |
| D4 | A fresh reviewer verifies. Never self-certify. |
| D5 | Read the rule before theorising. Measure the leaf away from the viewport origin. |
| D6 | Exactly one phase holds `styles.css`, and releases it only after a recapture a person has looked at. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the child goal before working a phase.** Each is authoritative for its phase and binds as if
written here.

| Phase | Goal document |
|---|---|
| `000` | `000-surface-contract-and-truthful-harness/goal.md` |
| `001` | `001-overlay-placement-and-menu-language/goal.md` |
| `002` | `002-properties-panel/goal.md` |
| `003` | `003-mobile-sheet-presentation/goal.md` |
| `004` | `004-checkbox-ownership/goal.md` |
| `005` | `005-content-row-rhythm/goal.md` |
| `006` | `006-record-open-target/goal.md` |
| `007` | `007-architecture-research/goal.md` |
| `008` | `008-integration-and-release-observability/goal.md` |
| `009` | `009-live-verification/goal.md` |

Phases `010` through `019` were cut from operator reports and keep their directive in their own
`spec.md`. `roadmap.md` §4 maps every report to its phase.

**Precedence.** Decisions above outrank child detail; child detail outranks any summary of it. Name a
conflict rather than resolving it silently — `roadmap.md` §7 carries the open ones.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] All 16 operator reports operator-confirmed on device. Today: 1 of 16, and that one is an
      accepted shortfall.
- [ ] Report 1, the sheet drag, moves on the first drag on the operator's phone — **including after
      editing a field**, the case that was broken.
- [ ] `SURFACE_PHASE=<phase> npm run gate` exits 0. Today it exits 1 at 12/13.
- [ ] `npm run replay` re-asserts every landed result against its recorded pre-fix number.
- [ ] Every phase's `acceptance-criteria.md` coverage table has no blank cell.
- [ ] `validate.sh specs/public/005-component-surface-system --strict` reports the parent at
      Errors: 0.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive and not copied into an objective.

### The big one, fixed

Paint containment makes the leaf the containing block for `position: fixed`, and
`positionToolbarPopover` computes viewport coordinates — so every container-mounted surface among its
34 call sites was displaced by the leaf's origin: filter, sort, column manager, view config, cell
editors, toolbar popovers, the date picker. `setPosition` always had the compensating parameter; the
positioner's three callers passed `undefined`. Now wired via `fixedContainingBlock()`, its property
list checked against the browser rather than the docs — no false positives, so a gap under-corrects
and can never overshoot. **Check this first on device.**

### The next one, measured

`app.css:3606` gives every CM6 widget `contain: paint !important` and the plugin registers two
code-block processors. In **Live Preview** an embedded database's popovers are placed correctly, then
clipped at the widget's edge and left unclickable. No coordinate escapes a paint-contained ancestor;
only the portal does. `verify-placement`: 18/19, 1 declared red.

### Portal unblocked

`portal-safety.mjs` splits what a surface loses on the body into rules no marker can recover and
styling the markers impose. Naming each surface's own chrome twice — scoped and `.db-x.db-surface`,
same specificity, nothing in-container moves — took the unrecoverable count **537 → 0** in six rules.
**Do next:** portal the in-view surfaces → `008` Part B → table.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Reports with an owning phase | Done | 16 of 16; `roadmap.md` §4 |
| Reports shipped | In Progress | 14 of 16 |
| Reports operator-confirmed | In Progress | 1 of 16 |
| Report 1, the sheet drag | Fixed, awaiting device | The panel's render destroyed the grab bar; a 60px drag now moves 60.0px after a re-render, was 0.0px |
| `004` state | Unknown | Three sources disagree; `roadmap.md` §7.1 |
| Gate | Red | 12/13, `screenshots-fresh` on stale captures |
| Version | Done | 1.3.3 built and installed; `HEAD` is 1.3.1 |

### Deviations and findings

| Item | Note |
|------|------|
| Declared order `009 → 000 → …` was not run | Phases 010-017 were cut in report order instead. `009` gated no handoff. `roadmap.md` §8 |
| Reports 7 and 16 shipped with no phase | Now `019` and `018`. A lane hold is not a scope grant |
| Report 7 crosses a written scope exclusion | `spec.md` §2 excludes output number format. Unresolved; `019/spec.md` §7 |
| `016` worked unspecced for hours | It owns the most-reported defect; its spec and criteria arrived before it finished |
| Eight continuity blocks read 0% after shipping | `roadmap.md` §7.6 |
| Grab band accepted at 35px against a 48px ask | Operator-confirmed shortfall. Do not reopen |

### Traps

Captures churn 12 files on an identical rerun — read any diff against that floor. Flex properties are
inert on grid items, so moving a container to grid kills every flex rule aimed at its children.
`:not()` raises a rule's specificity and wins fights it used to lose — tried on the container box,
moved 34 captures, reverted. A fixture built with a shared helper may not be where you think: a
clipping check passed while its panel was the contained element's sibling. A fixture containing none
of the thing under test measures nothing. A derived number written in a comment goes stale silently.

### Gate

`SURFACE_PHASE=<phase> npm run gate` runs 13 checks. `npm run replay` re-asserts 8 results against
their recorded pre-fix numbers. Lane: `tools/lane/css-lane.json`.
<!-- /ANCHOR:log -->
