---
title: "Acceptance Criteria: Remove the Gallery Renderer and Its Harness"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "007 phase 3 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/003-remove-renderer-and-harness"
    last_updated_at: "2026-09-05T07:10:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the closure gate for the removal phase"
    next_safe_action: "Blocked: 002 must ship in a release before this phase starts"
    blockers:
      - "002 must be SHIPPED in a release, not merely merged (parent D8)"
    key_files:
      - "spec.md"
      - "src/views/gallery-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-003-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Remove the Gallery Renderer and Its Harness

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 007-gallery-view-deprecation/003-remove-renderer-and-harness
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the tree after this phase, **When** `src/views/gallery-renderer.ts` is looked for, **Then** it is absent. **Failing value today: 787 lines present** | `git log --diff-filter=D --name-only` names it; `rg -l GalleryRenderer` returns nothing outside spec documents | Unmet | - |
| AC-002 | REQ-002 | **Given** the same change, **When** the diff is read, **Then** the bench, the driver, both coverage pins, the constructed scenario, the gallery-only capture entries, the placement checks and the gallery-only unit specs are deleted in it — not in a follow-up. **Failing value today: all present** | One commit, one diff, containing all of them | Unmet | - |
| AC-003 | REQ-003 | **Given** the finished removal, **When** `npm run gate` runs, **Then** it exits 0 read from `$?`, and the lane list differs from the baseline BY NAME by exactly the gallery's lanes. **A count comparison does not satisfy this row** — `006`'s equivalent saw its count land back at 25 by coincidence | The before/after lane lists and the exit status | Unmet | - |
| AC-004 | REQ-004 | **Given** the four board-shared capture ids, **When** the full capture runs after the change, **Then** every board capture's `pixelHash` and `layoutHash` are identical to the pre-change baseline. **Failing value today: no baseline is recorded** — T003 records it | The hash comparison, plus two captures read by hand at both themes | Unmet | - |
| AC-005 | REQ-005 | **Given** `renderer-coverage.json` after the change, **When** it is read, **Then** the new `constructed`/`total` carries the reason beside the number, in the idiom `"was 7/22; list renderer retired"`. **Failing value today: `constructed: 6, total: 21`, note names only the list retirement** | The JSON diff | Unmet | - |
| AC-006 | REQ-006 | **Given** `styles.css` after the change, **When** `rg -c 'db-gallery' styles.css` runs, **Then** it returns 0, and no comma-joined selector list lost a non-gallery member. **Failing value today: 81** | The grep count, plus a read of `styles.css:1188` and `:1411` where gallery shares a list | Unmet | - |
| AC-007 | REQ-007 | **Given** the union question, **When** ADR-001 is taken, **Then** it names its decision, its consequence for an unmigrated vault, and its rejected alternative — rather than inheriting `006`'s answer silently | ADR-001 in `plan.md`, and a test for whatever it decides | Unmet | - |
| AC-008 | REQ-002 | **Given** `card-field-renderer.ts` and `gallery-migration.ts`, **When** the change lands, **Then** both are untouched. The first is the board's (parent D5); the second is what an old vault still needs | `git diff --name-only` does not name either | Unmet | - |

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

Nothing has run, and this phase must not start on a merge. Every row is `Unmet` with its failing
value named. AC-003 and AC-004 are the two that decide whether the gate stays honest: a lane
compared by count instead of by name, or a board capture rebaselined instead of matched, would both
produce a green that means nothing. AC-008 exists because the two files most likely to be deleted by
momentum are the two that must survive.
<!-- /ANCHOR:closure -->
