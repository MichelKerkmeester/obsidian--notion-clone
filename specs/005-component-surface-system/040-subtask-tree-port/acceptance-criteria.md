---
title: "Acceptance Criteria: Subtask Tree Port"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases: ["040 acceptance criteria", "subtask tree port ac"]
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-02T23:59:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Acceptance criteria authored, all Unmet"
    next_safe_action: "Meet AC-001 first, per plan.md step 1"
    blockers: []
    key_files: ["acceptance-criteria.md", "spec.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-040-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Subtask Tree Port

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 040-subtask-tree-port
**Level:** 3
**Status:** Draft
**Date:** 2026-09-02
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|---------------|--------|--------|
| AC-001 | REQ-001 | Given `RowData[]` with no relation field, When the relation module derives over it, Then `RowData`'s own shape is unchanged and the relation exists only as a derived structure | `rg -n "subtasks:" src/data/types.ts` returns nothing; relation unit test | Unmet | - |
| AC-002 | REQ-002 | Given a note with frontmatter `parentId` and an ordered child-id list, When hydrate runs, Then the relation reflects the same parent/children, and serialize writes the same fields back with no loss | `src/data/subtask-hydrate.test.ts` round-trip diff | Unmet | - |
| AC-003 | REQ-003 | Given a 3-level tree, When a node is moved to a different parent, Then both old and new parents' `subtaskIds`, the child's `parentId`, and sibling ranks update atomically in one transaction | `src/data/subtask-serialize.test.ts` (SC-002) before/after diff | Unmet | - |
| AC-004 | REQ-003 | Given a node, When it is moved under its own descendant, Then the move is rejected and the relation is byte-for-byte unchanged | `src/data/subtask-serialize.test.ts` (SC-003) re-read after rejected call | Unmet | - |
| AC-005 | REQ-004 | Given a row with both an explicit progress value and children implying a different derived value, When progress is displayed, Then both values are distinct and the explicit value is shown/kept, never overwritten by the derived one | Progress-distinction unit test (SC-004) | Unmet | - |
| AC-006 | REQ-005 | Given the subtask relation's expand/collapse state and the timeline's own group-collapse state, When either toggles, Then the other is unaffected | Timeline fixture test asserting independent collapse state | Unmet | - |
| AC-007 | REQ-006 | Given a parent row in edit mode, When Enter is pressed, Then a child row is created with the correct `parentId`/path context | Inline-add unit test | Unmet | - |
| AC-008 | REQ-007 | Given the full diff for this phase, When scanned for `computed-evaluator.ts`, aggregate/rollup pipeline, i18n strings, selection state, or `mobile-bottom-sheet.ts` lifecycle changes, Then none are found | `git diff` scoped review against the files-to-change list in `spec.md` §3 | Unmet | - |
| AC-009 | REQ-008 | Given every code comment added this phase, When scanned, Then none contains a spec path, phase number, task id, or requirement id | `rg -n "specs/005|REQ-|AC-|040-subtask" src/` returns nothing inside product comments | Unmet | - |
| AC-010 | REQ-009 | Given the board and timeline renderers, When they read depth/visibility/progress, Then they do so only through the named seams and neither owns the graph | Code review against `spec.md` §3 seam list; no direct `parentId`/`subtaskIds` writes outside `subtask-serialize.ts` | Unmet | - |
| AC-011 | REQ-010 | Given the final state, When `npm run gate` runs and the `styles.css` lane recapture is read, Then `gate: PASS` exits 0 and the lane is released with a `reviewed` array | `npm run gate` output; `tools/lane/css-lane.json` history entry | Unmet | - |

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
`decision-record.md`.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No.

Not yet attempted. Write this section when the packet is closed, naming which criteria carried the
packet and what was consciously left out.
<!-- /ANCHOR:closure -->
