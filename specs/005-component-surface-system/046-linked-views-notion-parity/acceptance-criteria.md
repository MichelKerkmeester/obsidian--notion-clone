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
    last_updated_at: "2026-09-05T06:45:00Z"
    last_updated_by: "implementation-verifier"
    recent_action: "Measured the linked surface against a red control and read every changed capture"
    next_safe_action: "Operator reads the released build on device for AC-002, AC-005 and AC-007"
    blockers:
      - "AC-002's not-clipped half cannot be shown by the constructed host, which never reproduces the clip"
      - "AC-005 needs a device pass; AC-007 is operator-only"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-ac"
      parent_session_id: null
    completion_pct: 85
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
| AC-001 | REQ-001, US-001 | **Given** a page with an embedded database view, **When** it renders, **Then** it carries no card border, no database title duplicating the page's own heading, and no expand/collapse chevron. **Threshold:** 0 furniture. **Red:** the same fixture with the linked rule neutralised measures border 1px, radius 8px, padding 12px per side — 34 units combined — and draws a visible card. **Green:** border 0, radius 0, padding 0, 34 → 0, with the duplicate title and chevron withdrawn by the renderer. | Measured in the constructed reading host at both device widths and both themes, and all four PNGs opened and read beside a red control taken with the rule neutralised (`tools/screenshots/constructed-scenarios.mjs`, `screenshots/notion-clone/views/constructed-linked-view-host-*.png`) | Met | - |
| AC-002 | REQ-002, US-001 | **Given** an embed whose table is wider than the code-block host, **When** it renders, **Then** no column is clipped at the right edge and the embed spans the reading view's content width. **Threshold:** `|embedContentWidth - proseContentWidth| ≤ 1px`. **Red:** 874 against 900 on desktop and 376 against 402 on the phone — a 26px deficit, being the 1px border plus 12px padding on each side. **Green:** 900/900 and 402/402, delta 0px on both. The table overflows its host on both devices (1392 into 892, 659 into 394) and scrolls inside the embed rather than past it, with page `scrollWidth` equal to `clientWidth` (1440 and 402). | The width half is measured and green. The not-clipped half is NOT closed here: the red control also reports the columns reachable, because the constructed fixture gives the embed its own `overflow-x: auto` and so never reproduces the code-block-host clipping the operator reported. That half needs the device | Unmet | - |
| AC-003 | REQ-003, REQ-004 | **Given** ADR-001 is Accepted, **When** an embed renders, **Then** exactly the affordance set that decision names is present, and every one it excludes is excluded by that decision rather than by a `persistMode` check nobody revisited. **Failing value today: 4 independent gates** — `rg -n 'persistMode === "codeblock"' src/views/embedded-database-renderer.ts` returns the `createEntry` trio plus `isReadOnly`, `showChartOptions` and `syncComputedFields`. | ADR-001 status `Accepted`, plus the grep count before and after stated in `implementation-summary.md`: `rg -c 'persistMode === "codeblock"' src/views/embedded-database-renderer.ts` returns 3 where it returned 10, and all three survivors are presentation. Capability is one `isViewReadOnly()` seam read from 24 sites | Met | - |
| AC-004 | REQ-005, US-002 | **Given** a linked view on page A, **When** it is moved to page B, **Then** page B's block resolves the same database, the same view and the same options, page A no longer carries it, and exactly one block exists across the two files. **Measured green values:** database path preserved as `Databases/Tasks:2026.md`, view id preserved as `board-view`, `hideHeader` preserved as `true`, and total block count is exactly `1` after re-reading both files. | The two-file test writes vault-shaped pages through the move adapter, re-reads both files, parses the destination fence, and checks the source/destination headings plus the one-block total. The interruption test still proves destination-first recovery | Met | - |
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

Three criteria remain open. Four closed: AC-001, because the card furniture measures 0 against 34
in a red control and all four captures were opened and read; AC-003, because ADR-001 was decided
before any gate moved and the ten `persistMode` reads collapsed to one capability seam; AC-004,
because both vault-shaped files are re-read with one preserved block; and AC-006, because the round
trip and its adversarial rows are green against the parser the rendering path actually uses.

What is left divides cleanly, and AC-002 is the one worth stating precisely. Its width half is
measured green — delta 26px to 0px on both devices — but its not-clipped half is not closed, because
the constructed host gives the embed its own `overflow-x: auto` and so reports the columns reachable
even in the red control. A fixture that cannot show the failure cannot show the fix. AC-005 needs its
device pass, and AC-007 is the operator's, as it always was.

AC-002 may still end up `Waived` against an ADR if Obsidian's reading view will not give up the
width; that remains a legitimate outcome needing a recorded reason rather than a quietly narrowed
criterion.
<!-- /ANCHOR:closure -->
