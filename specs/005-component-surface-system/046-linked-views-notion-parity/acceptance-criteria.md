---
title: "Acceptance Criteria: Linked Views Notion Parity"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "046 acceptance criteria"
  - "embed parity criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/046-linked-views-notion-parity"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria for this packet"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "AC-003 depends on ADR-001, which is not yet taken"
      - "AC-007 is operator-only"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Linked Views Notion Parity

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/046-linked-views-notion-parity
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
| AC-001 | REQ-001, US-001 | **Given** a page with an embedded database view, **When** it renders, **Then** it carries no card border, no database title duplicating the page's own heading, and no expand/collapse chevron. **Failing value today: all three present** — the operator's `report-42-embedded-view-clipped.png` shows a bordered block, a second "Reports" title under the page's own "📊 Reports" heading, an expand icon and a chevron. | A constructed embed capture at both device widths and both themes, read by hand beside the standalone capture | Unmet | - |
| AC-002 | REQ-002, US-001 | **Given** an embed whose table is wider than the code-block host, **When** it renders, **Then** no column is clipped at the right edge and the embed spans the reading view's content width. **Failing value today: clipped** — the same capture cuts the third column mid-cell. The mechanism is the up-to-eight-ancestor `note-database-embed-codeblock-host` walk (`embedded-database-renderer.ts:600-611`). | Captured PNG read by hand plus a measured content-width comparison against the standalone view | Unmet | - |
| AC-003 | REQ-003, REQ-004 | **Given** ADR-001 is Accepted, **When** an embed renders, **Then** exactly the affordance set that decision names is present, and every one it excludes is excluded by that decision rather than by a `persistMode` check nobody revisited. **Failing value today: 4 independent gates** — `rg -n 'persistMode === "codeblock"' src/views/embedded-database-renderer.ts` returns the `createEntry` trio plus `isReadOnly`, `showChartOptions` and `syncComputedFields`. | ADR-001 status `Accepted`, plus the grep count before and after stated in `implementation-summary.md` | Unmet | - |
| AC-004 | REQ-005, US-002 | **Given** a linked view on page A, **When** it is moved to page B, **Then** page B's block resolves the same database, the same view and the same options, page A no longer carries it, and exactly one block exists across the two files. | Both files re-read after the move; a unit test over the two-file sequence including an interruption between the writes | Unmet | - |
| AC-005 | REQ-006, US-002 | **Given** the create-linked-view flow, **When** the operator picks a source database, a view type and a name, **Then** a valid block is inserted at the cursor with no clipboard step. **Failing value today: clipboard is the only path** — `copyCurrentViewCode` (`database-view.ts:3912`) and `copyEmbeddedViewCode` (`:3561`) both write the fence to the clipboard and stop. | The flow driven end to end, and the resulting block parsed by the current parser | Unmet | - |
| AC-006 | REQ-007 | **Given** the sixteen block shapes the current writers can produce — {`dbId`, `dbPath`} × {`viewId` present, absent} × {`hideHeader` true, absent} × {`note-database`, `database-view`} — **When** each is parsed and re-serialised, **Then** the result is byte-identical, including the adversarial rows: a `dbPath` containing a colon, the empty `viewId:` value written when a view has no id, and trailing whitespace. | A table test with sixteen rows plus the three adversarial ones | Unmet | - |
| AC-007 | REQ-001, REQ-002 | **Given** a released build on the operator's device, **When** they open the Overview page, **Then** they report the nested views as reading like real databases rather than clipped blocks. Only the operator closes this row. | Operator report against a named release, recorded on `../roadmap.md` §4 row 42 | Unmet | - |

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

Written at opening. Seven criteria are open. AC-003 is deliberately shaped as a dependency on a
decision rather than on a code change, because the alternative — relaxing four read-only gates one
at a time until the embed feels right — produces a surface nobody can describe. AC-002 may end up
`Waived` against an ADR if Obsidian's reading view will not give up the width; that is a legitimate
outcome and it needs a recorded reason, not a quiet narrowing of the criterion.
<!-- /ANCHOR:closure -->
