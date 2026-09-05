---
title: "Acceptance Criteria: Gallery Deprecation Docs and Release"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "007 phase 4 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/004-docs-and-release"
    last_updated_at: "2026-09-05T07:10:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the closure gate for the docs and release phase"
    next_safe_action: "Blocked: 003 must land before the docs can describe the removal"
    blockers:
      - "003 must land first"
      - "AC-007 is operator-only"
    key_files:
      - "spec.md"
      - "README.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-004-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Gallery Deprecation Docs and Release

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 007-gallery-view-deprecation/004-docs-and-release
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
| AC-001 | REQ-001 | **Given** `README.md` after this phase, **When** a reader looks for the views the plugin offers, **Then** the gallery is not among them. **Failing value today: 7 gallery references, including "Six database views" at `:22` and a screenshot row at `:43-45`** | `rg -n -i gallery README.md`, and a read of the rendered table | Unmet | - |
| AC-002 | REQ-002 | **Given** `001`'s declared-loss list, **When** `CHANGELOG.md` is written, **Then** every loss appears **individually**. A summary such as "some gallery settings" fails this row. **Failing value today: no entry exists** | Each loss found by name in the CHANGELOG entry | Unmet | - |
| AC-003 | REQ-003 | **Given** a user considering a rollback, **When** they read `CHANGELOG.md`, **Then** it says plainly that a migrated view stays a board and that the only reversal is the per-view in-app undo. **Failing value today: unstated** | The sentence, present and unambiguous | Unmet | - |
| AC-004 | REQ-004 | **Given** `030-gallery-view-deprecation`, **When** this retirement ships, **Then** its documents read as closed against it, keeping their own measurements. **Failing value today: `030` is 4/6 and open against a view that will not exist** | `030/spec.md`'s Status line, its measurements still present, and the §5.A row | Unmet | - |
| AC-005 | REQ-005 | **Given** `package.json`, **When** its plugin `description` is read, **Then** it does not name the gallery. **Failing value today: it does** | `rg -n gallery package.json` | Unmet | - |
| AC-006 | REQ-006 | **Given** the finished docs, **When** the release is considered, **Then** a version number carries the removal — or the cut is handed to the orchestrator **with the target version recorded**. `006`'s `008` prepared docs and left the cut owed; recording the target is what makes the handoff checkable | The release tag, or the recorded target version in `implementation-summary.md` | Unmet | - |
| AC-007 | REQ-001 | **Given** a released build, **When** the operator opens a vault that had a gallery view, **Then** they report it as migrated rather than broken. **Only the operator closes this row** | An operator report against a named release, recorded on `../../005-component-surface-system/roadmap.md` §4 | Unmet | - |

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

Nothing has run. AC-002 is the row this phase exists for: the difference between a declared loss and
a discovered one is whether it was named, and naming it individually is more work than summarising
it, which is exactly why the criterion says so. AC-006 is the row most likely to be quietly
satisfied by assumption — `006`'s equivalent phase wrote its docs and left the release owed, which
is honest and is also the reason this row accepts a handoff only when the target version is written
down. AC-007 is the operator's and an agent never ticks it.
<!-- /ANCHOR:closure -->
