---
title: "Acceptance Criteria: Notion Record Refinement"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "waiver adr"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/065-notion-record-refinement"
    last_updated_at: "2026-09-06T18:10:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Authored the acceptance criteria from the Notion record research synthesis"
    next_safe_action: "Record T001's red baselines, then land Leg A"
    blockers:
      - "AC-006 is blocked on ADR-008"
      - "AC-007 is the operator's device read and is never ticked by an agent"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/record-surface/property-row.ts"
      - "src/views/column-manager-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-065-acceptance"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "ADR-008 decides whether AC-006 is schedulable at all"
    answered_questions:
      - "ADR-001 to ADR-004 are settled by landed Anytype rulings and need no operator call"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Record Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/065-notion-record-refinement
**Level:** 2
**Status:** Draft
**Date:** 2026-09-06
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every Verification cell names the check **and** the value that check reads today, so the row records
what has to change rather than only what has to pass. The observed reds were re-derived against this
tree at `37207535` on 2026-09-06, after `3f4d40ac`, `9207e8e8` and `de67f816` landed.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a board card with an empty `select` field, When the card renders, Then the field reads "Select option" rather than "Empty" | `tools/live/render-assertions.mjs` over the board-card scenario. **Observed red:** `src/views/board-renderer.ts:754-757` returns `t("common.empty")` for every non-checkbox format. Digest screens `16ddd22c`, `bf2171ff` | Unmet | - |
| AC-002 | REQ-001 | Given a board card with an empty `multi-select` and an empty `checkbox`, When the delegation lands, Then the multi-select still receives a one-element array and the checkbox still receives `false` | Unit test mirroring `src/views/record-detail-panel.ts:514-519`. **Observed red:** the shapes are produced by a second, private path today | Unmet | - |
| AC-003 | REQ-002 | Given a `number`, `date`, `datetime`, `currency`, `text` or `files` field with no value, When it renders on the record sheet or a board card in either locale, Then it carries a verb+noun prompt and never the string "Empty" | `tools/live/constructed-state-assertions.mjs` plus the locale walk in `tasks.md` CHK-022. **Observed red:** `src/views/record-surface/property-row.ts:286-291` returns `null` for every format outside the three ruled ones | Unmet | - |
| AC-004 | REQ-003 | Given the `constructed-record-detail` scenario at desktop width, When a property row renders, Then the label's computed `font-size` equals the value's | `tools/live/constructed-state-assertions.mjs`, a computed-style read. **Observed red:** `styles.css:10300-10306` sets the label to `var(--font-smaller)` and the two computed sizes differ | Unmet | - |
| AC-005 | REQ-003 | Given the phone record sheet, When AC-004 lands, Then the phone label's computed `font-size` is unchanged from the value T001 recorded | The same lane run reads both arms. **Guard:** `styles.css:10459-10468` holds the iOS 16px input-zoom floor A2 does not reopen | Unmet | - |
| AC-006 | REQ-004 | Given a single-select value on the record sheet or a board card, When it renders, Then it carries a `status-color-text-*` class and no `.status-badge` fill, while multi-select keeps its chips | `tools/live/render-assertions.mjs` and the record-sheet assertions. **Observed red:** `src/views/record-surface/property-row.ts:76-101` fills both kinds, and `renderOptionValue` at `:255` has zero production consumers — only `property-row.test.ts` calls it | Unmet | - |
| AC-007 | REQ-004 | Given every stored option colour, When the split lands, Then each foreground/background pair measures at or above 4.5:1 | `tools/screenshots/scan-option-tones.mjs`, already in `npm run gate`. This is A2's C9 floor, not a new one | Unmet | - |
| AC-008 | REQ-005 | Given the add-property picker, When a user types "Due Date" and selects `date`, Then a `date` column labelled "Due Date" is created in one pass | Unit test over the picker wiring or `src/views/database-view.ts:5088`'s `initialLabel` path. **Observed red:** `src/views/column-manager-renderer.ts:200` calls `createProperty(type)` with no label; `:201` is the only path using the query and it forces `text`. Digest screen `1589e7c8` | Unmet | - |
| AC-009 | REQ-006 | Given the record sheet, When it renders, Then a muted "+ Add a property" row sits below the last field and above the hidden group, opens the search-first picker, and measures at or above 44px on the phone sheet | `tools/live/touch-targets.mjs` plus a constructed scenario. **Observed red:** zero add affordances on the record sheet; `src/views/record-detail-panel.ts` imports nothing from `add-property-row.ts`. **Blocked on ADR-008** — neither Notion's trailing row nor Anytype's section-header `+` is ruled for this surface | Unmet | - |
| AC-010 | REQ-007 | Given this program's docs and any user-facing label naming a record shell, When they are read, Then the three shells are Side peek, Center peek and Full page | A read of the changed files. Zero code; `006`'s placement ruling untouched. Digest screen `0cb59457` | Unmet | - |
| AC-011 | REQ-008 | Given ADR-005, ADR-006, ADR-007 and ADR-008, When the operator reads them, Then each carries a threshold and a red-first check, and none of its code has been written | A read of `decision-record.md` against `git diff` — no source file touched by a gated item | Unmet | - |
| AC-012 | — | Given a device build, When the operator opens a record on iOS and on desktop, Then they report the refinement as landed | The operator's own read. **Never ticked by an agent** | Unmet | - |

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

The packet was opened on 2026-09-06 and no source file has been touched. Twelve rows are `Unmet`,
one of which (AC-009) is blocked on an operator ruling and one of which (AC-012) is the operator's
own device read. This statement is rewritten when the packet closes, not before.
<!-- /ANCHOR:closure -->
