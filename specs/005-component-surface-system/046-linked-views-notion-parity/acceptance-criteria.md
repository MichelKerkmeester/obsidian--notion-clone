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
    last_updated_at: "2026-09-05T04:20:00Z"
    last_updated_by: "implementation-verifier"
    recent_action: "Recorded the verified status of every row after the implementation pass landed"
    next_safe_action: "Answer T002 against real Obsidian, then take the styles.css lane for AC-001 and AC-002"
    blockers:
      - "AC-001 and AC-002 need the styles.css leg, which needs T002's host-layout answer and a free lane"
      - "AC-004 and AC-005 need a device pass; AC-007 is operator-only"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-ac"
      parent_session_id: null
    completion_pct: 60
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
**Status:** In progress
**Date:** 2026-09-04
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001, US-001 | **Given** a page with an embedded database view, **When** it renders, **Then** it carries no card border, no database title duplicating the page's own heading, and no expand/collapse chevron. **Failing value today: all three present** — the operator's `report-42-embedded-view-clipped.png` shows a bordered block, a second "Reports" title under the page's own "📊 Reports" heading, an expand icon and a chevron. | A constructed embed capture at both device widths and both themes, read by hand beside the standalone capture. **Two of three cleared in code**: the duplicate title and the chevron are gone (`embedded-database-renderer.test.ts:487`). The card border and its corner radius are not — they are `styles.css:15652` on `.note-database-embed`, and no stylesheet edit was made | Unmet | - |
| AC-002 | REQ-002, US-001 | **Given** an embed whose table is wider than the code-block host, **When** it renders, **Then** no column is clipped at the right edge and the embed spans the reading view's content width. **Failing value today: clipped** — the same capture cuts the third column mid-cell. The mechanism is the up-to-eight-ancestor `note-database-embed-codeblock-host` walk (`embedded-database-renderer.ts:600-611`). | Captured PNG read by hand plus a measured content-width comparison against the standalone view. The eight-ancestor walk is gone and the width now releases to the reading-view sizer in percentages (`embedded-database-renderer.test.ts:515`), but nothing has measured it against a real preview, and the embed keeps a 12px horizontal padding from the same untouched stylesheet rule | Unmet | - |
| AC-003 | REQ-003, REQ-004 | **Given** ADR-001 is Accepted, **When** an embed renders, **Then** exactly the affordance set that decision names is present, and every one it excludes is excluded by that decision rather than by a `persistMode` check nobody revisited. **Failing value today: 4 independent gates** — `rg -n 'persistMode === "codeblock"' src/views/embedded-database-renderer.ts` returns the `createEntry` trio plus `isReadOnly`, `showChartOptions` and `syncComputedFields`. | ADR-001 status `Accepted`, plus the grep count before and after stated in `implementation-summary.md`: `rg -c 'persistMode === "codeblock"' src/views/embedded-database-renderer.ts` returns 3 where it returned 10, and all three survivors are presentation. Capability is one `isViewReadOnly()` seam read from 24 sites | Met | - |
| AC-004 | REQ-005, US-002 | **Given** a linked view on page A, **When** it is moved to page B, **Then** page B's block resolves the same database, the same view and the same options, page A no longer carries it, and exactly one block exists across the two files. | Both files re-read after the move; a unit test over the two-file sequence including an interruption between the writes. The unit half is green — write order, one surviving block and an undo at `embedded-database-renderer.test.ts:559`, and an interruption leaving the destination written with the source intact at `:592`. Re-reading two real vault files after a real move is T012 | Unmet | - |
| AC-005 | REQ-006, US-002 | **Given** the create-linked-view flow, **When** the operator picks a source database, a view type and a name, **Then** a valid block is inserted at the cursor with no clipboard step. **Failing value today: clipboard is the only path** — `copyCurrentViewCode` (`database-view.ts:3912`) and `copyEmbeddedViewCode` (`:3561`) both write the fence to the clipboard and stop. | The flow driven end to end, and the resulting block parsed by the current parser. The second half is green: a fence built by the create flow is read back by `parseEmbeddedReference`, the parser the rendering path uses (`embedded-database-renderer.test.ts:630`). Driving the modal itself needs a device | Unmet | - |
| AC-006 | REQ-007 | **Given** the sixteen block shapes the current writers can produce — {`dbId`, `dbPath`} × {`viewId` present, absent} × {`hideHeader` true, absent} × {`note-database`, `database-view`} — **When** each is parsed and re-serialised, **Then** the result is byte-identical, including the adversarial rows: a `dbPath` containing a colon, the empty `viewId:` value written when a view has no id, and trailing whitespace. | A table test with sixteen rows plus the three adversarial ones — all green at `embedded-database-renderer.test.ts:653`. Trailing whitespace normalises rather than surviving, which is the round trip's documented behaviour and is asserted as such | Met | - |
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

Five criteria remain open. Two closed: AC-003, because ADR-001 was decided before any gate moved and
the ten `persistMode` reads collapsed to one capability seam, and AC-006, because the round trip and
its adversarial rows are green against the parser the rendering path actually uses.

What is left divides cleanly. AC-001 and AC-002 are half-done in a way worth naming precisely: the
DOM furniture is gone and the stylesheet furniture is not, because the card border, the radius and
the horizontal padding are `styles.css` rules on `.note-database-embed` and this packet has not held
the serialized lane. That leg also waits on T002 — nobody has measured a released embed against a
real reading view, and writing CSS before that measurement is the mistake the plan opened by naming.
AC-004 and AC-005 have their unit halves green and need a device for the rest. AC-007 is the
operator's, as it always was.

AC-002 may still end up `Waived` against an ADR if Obsidian's reading view will not give up the
width; that remains a legitimate outcome needing a recorded reason rather than a quietly narrowed
criterion.
<!-- /ANCHOR:closure -->
