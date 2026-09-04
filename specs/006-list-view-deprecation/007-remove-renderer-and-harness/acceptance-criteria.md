---
title: "Acceptance Criteria: Remove the List Renderer and Its Harness"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "list removal criteria"
  - "006 phase 007 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/007-remove-renderer-and-harness"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria for this packet"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "Preconditions unmet: 005 has not run and 006 has not shipped"
    key_files:
      - "src/views/list-renderer.ts"
      - "tools/gate.mjs"
      - "tools/live/renderer-coverage.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-007-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Phase 1: remove-renderer-and-harness

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 006-list-view-deprecation/007-remove-renderer-and-harness
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
| AC-001 | REQ-001, US-001 | **Given** the change is complete, **When** the tree is searched, **Then** no lane, ratchet, harness, bench entry, fixture, constructed scenario, replay claim or unit spec names the list, and none was removed in a different commit from the renderer. **Failing value today: 9 surfaces** — `tools/gate.mjs:89`, `tools/live/list-window.mjs`, `tools/live/list-window.json`, `src/views/list-window-harness.ts`, the `list-render-bench` and `list-renderer.ts` pins in `renderer-coverage.json`, `list`/`list-sparse` in `constructed-scenarios.mjs`, the list fixtures in `scenarios.mjs`, the list claims in `replay.mjs`, and two unit specs. | `rg -n 'list-renderer\|list-window\|list-sparse' src tools` returns nothing; `git show --stat` on the removal commit carries all of them |
| AC-002 | REQ-002 | **Given** the change is complete, **When** `tools/gate.mjs`'s lane list is read, **Then** `list-window` is **absent**, not present-and-skipped. A skipped lane reads green in perpetuity and nobody looks at it again. | The lane list read directly, plus `npm run gate` output naming the lane count |
| AC-003 | REQ-003 | **Given** the renderer is removed, **When** `renderer-coverage.json` is read, **Then** the floor is at its new value and the reason is recorded beside the number in the same commit. **Failing value today: the file pins `src/views/list-renderer.ts` and `tools/bench/list-render-bench.ts` by content hash**, so the floor cannot move without the pins moving. | The diff, showing number and reason together |
| AC-004 | REQ-004, US-002 | **Given** `card-field-renderer.ts` survives, **When** the board and gallery cards are captured after the change, **Then** they are identical to the captures taken before it. The before-captures must be taken in T002; once the change starts they are unrecoverable. | Capture pair, `pixelHash` and `layoutHash` unchanged |
| AC-005 | REQ-005 | **Given** ADR-001 is decided, **When** a vault carrying an un-migrated `viewType: "list"` is opened, **Then** the behaviour is the one the decision names, reached by an explicit fallback rather than by whichever branch happens to run first. | ADR-001 status in `plan.md` plus the fallback asserted |
| AC-006 | REQ-006 | **Given** the list captures are pruned, **When** `screenshots-fresh` runs, **Then** it is green — no entry points at a source file that no longer exists. | `npm run gate`'s `screenshots-fresh` lane |
| AC-007 | REQ-001, REQ-002 | **Given** the final state, **When** `npm run gate` is run and `$?` is read directly rather than through a pipe, **Then** it is 0. A pipe makes `$?` the pipe's status, which is how a red gate reads as green. | The command and the exit status, both recorded |

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

Written at opening. Seven criteria are open and two preconditions are unmet: `005` has not run and
`006` has not shipped. AC-001 is the one that matters most and it is deliberately phrased over the
*commit*, not just the tree — removing the renderer and the lane in two commits satisfies a search
and still leaves a window where the gate was green against a half-removed view.
<!-- /ANCHOR:closure -->
