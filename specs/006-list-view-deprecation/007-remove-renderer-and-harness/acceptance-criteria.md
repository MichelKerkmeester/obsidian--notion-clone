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
    last_updated_at: "2026-09-05T02:45:00Z"
    last_updated_by: "phase-007-landing"
    recent_action: "All seven criteria verified Met against the landed tree (ba2acf7d)"
    next_safe_action: "Closeable; T010 and the 006 operator-report gap are recorded caveats"
    blockers: []
    key_files:
      - "src/views/database-view.ts"
      - "tools/gate.mjs"
      - "tools/live/renderer-coverage.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-007-ac"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "All seven AC rows: Met"
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
| AC-001 | REQ-001, US-001 | **Given** the change is complete, **When** the tree is searched, **Then** no lane, ratchet, harness, bench entry, fixture, constructed scenario, replay claim or unit spec names the list, and none was removed in a different commit from the renderer. **Met**: all 9 surfaces named at opening (`tools/gate.mjs:89`, `tools/live/list-window.{mjs,json}`, `src/views/list-window-harness.ts`, the `renderer-coverage.json` pins, `list`/`list-sparse` in `constructed-scenarios.mjs`, the `scenarios.mjs` fixtures, the `replay.mjs` claims, two unit specs) left in the one landing commit, alongside the source and 20 orphaned captures. The `replay.mjs` claims are kept and marked `retired: true` rather than deleted — the file's own convention for a measured result whose fixture is gone, not a surface still naming the list in the sense this row means. | `rg -n 'list-renderer\|list-window\|list-sparse' src tools` returns nothing live; `git show --stat` on `ba2acf7d` carries all 9 plus the source | Met | - |
| AC-002 | REQ-002 | **Given** the change is complete, **When** `tools/gate.mjs`'s lane list is read, **Then** `list-window` is **absent**, not present-and-skipped. A skipped lane reads green in perpetuity and nobody looks at it again. | The lane list read directly, plus `npm run gate` output naming the lane count | Met | - |
| AC-003 | REQ-003 | **Given** the renderer is removed, **When** `renderer-coverage.json` is read, **Then** the floor is at its new value and the reason is recorded beside the number in the same commit. **Met**: `"constructed": 6, "total": 21, "note": "was 7/22; list renderer retired"`, in the same commit as the renderer's removal. | The diff, showing number and reason together | Met | - |
| AC-004 | REQ-004, US-002 | **Given** `card-field-renderer.ts` survives, **When** the board and gallery cards are captured after the change, **Then** they are identical to the captures taken before it. The before-captures must be taken in T002; once the change starts they are unrecoverable. **Met**: the before is the base commit `f49eda4c`'s own committed corpus (`tasks.md` T002); `check-lane.mjs`'s pixel/layout compare against it found 0 board/gallery-only captures content-changed. | Capture pair, `pixelHash` and `layoutHash` unchanged | Met | - |
| AC-005 | REQ-005 | **Given** ADR-001 is decided, **When** a vault carrying an un-migrated `viewType: "list"` is opened, **Then** the behaviour is the one the decision names, reached by an explicit fallback rather than by whichever branch happens to run first. **Met**: ADR-001 Accepted (`list` stays, `migrateListViewOnOpen` permanent); the render dispatch's own `if`-chain has no `"list"` branch, so an un-migrated config falls to the same `else` (table) branch any unrecognised viewType would, deterministically rather than by which branch happens to run first. | ADR-001 status in `plan.md` plus the fallback asserted | Met | - |
| AC-006 | REQ-006 | **Given** the list captures are pruned, **When** `screenshots-fresh` runs, **Then** it is green — no entry points at a source file that no longer exists. **Met**: `npm run screenshots:verify` reports 534 entries matching their sources, 0 stale, 0 missing. | `npm run gate`'s `screenshots-fresh` lane | Met | - |
| AC-007 | REQ-001, REQ-002 | **Given** the final state, **When** `npm run gate` is run and `$?` is read directly rather than through a pipe, **Then** it is 0. A pipe makes `$?` the pipe's status, which is how a red gate reads as green. **Met**: `npm run gate` printed `24 green, 0 red for a declared reason` on this phase's own pre-reconciliation branch; `$?` read directly is `0`, confirmed on repeated runs. After landing on main (which had independently added a `sheet-grammar` lane), the reconciled tree prints `25 green, 0 red`, `$?` still `0`. | The command and the exit status, both recorded | Met | - |

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

**Closeable:** Yes, with one recorded caveat.

All seven criteria are `Met`, landed in the single commit AC-001 requires (`ba2acf7d`). The caveat is
outside this document's own seven rows: `tasks.md` T010 (removing `styles.css`'s now-dead `db-list-*`
rules) is deliberately deferred to a follow-up pass, and the `006` parent's own precondition — one
operator report against a released build — was not confirmed before this phase ran (`tasks.md` T001).
Neither blocks these seven criteria; both are recorded so closing this packet does not read as
closing either question.
<!-- /ANCHOR:closure -->
