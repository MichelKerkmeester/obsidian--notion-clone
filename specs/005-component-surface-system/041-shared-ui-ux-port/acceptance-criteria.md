---
title: "Acceptance Criteria: Shared UI/UX Port"
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
    packet_pointer: "005-component-surface-system/041-shared-ui-ux-port"
    last_updated_at: "2026-09-02T22:45:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Authored the acceptance criteria for the shared UI/UX port packet"
    next_safe_action: "Meet AC-001 through AC-008 in the plan.md step order"
    blockers: []
    key_files: ["spec.md", "plan.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "041-shared-ui-ux-port-open"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Shared UI/UX Port

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/041-shared-ui-ux-port
**Level:** 2
**Status:** Draft
**Date:** 2026-09-02
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the local bottom sheet at `mobile-bottom-sheet.ts`, When this packet lands, Then `git diff -- src/views/mobile-bottom-sheet.ts` is empty | `git diff --stat -- src/views/mobile-bottom-sheet.ts` | Unmet | - |
| AC-002 | REQ-002 | Given a reconciled `--db-*` token, When its citation is checked, Then it traces to a verified `specs/context/obsidian-pm-main` file:line or is marked a documented local-only extension | Manual citation audit against `036/research/research.md` §5, recorded in `implementation-summary.md` | Unmet | - |
| AC-003 | REQ-003 | Given this phase's changes landed, When `npm run gate` runs, Then it exits 0 | `SURFACE_PHASE=041-shared-ui-ux-port npm run gate`, `$?` read directly | Unmet | - |
| AC-004 | REQ-004 | Given `empty-state-renderer.ts`'s reason/action composition, When compared to `EmptyState.ts:10-37`, Then every verified icon/title/body/action/CTA shape is represented through local diagnostics-aware reasons | Read `src/views/empty-state-renderer.ts:25-57, :143-150` against the citation | Unmet | - |
| AC-005 | REQ-005 | Given `board-renderer.ts`'s card icon/tooltip/chip rendering, When compared to `IconButton.ts:3-31`/`Chip.ts:3-40`, Then density is reconciled through local field renderers and i18n with no copied DOM | Read `src/views/board-renderer.ts:750-789, :782-789` against the citation | Unmet | - |
| AC-006 | REQ-006 | Given the `prefers-reduced-motion` media rule, When compared to the reconciled `task-editor.css:1-20, :34-60` motion intent, Then every `db-overlay-enter`/`db-mobile-sheet-scrim` surface it implies is covered without a second sheet height cap | Read `styles.css:706-713`; confirm no new sheet-height variable was added | Unmet | - |
| AC-007 | REQ-007 | Given `SettingsTab.display()`, When compared to `settings.ts:54-86, :133-179`, Then the reconciled default-view/editor/save and board/timeline display vocabulary is present and localized | Read `src/settings.ts` `display()` against the citation; grep `src/i18n.ts` for the new/changed keys | Unmet | - |
| AC-008 | REQ-008 | Given toggle buttons and the board's roving keyboard, When compared to `chrome.css:124-170`, Then `aria-expanded`/`is-open` and roving focus coverage match the reconciled active-state language | Read `toolbar-renderer.ts:2111-2114` and `card-roving-tabindex.ts:68-99` against the citation | Unmet | - |

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

This packet is opened, not implemented. Every AC-ID is `Unmet` because no code has landed yet;
closure is written when implementation and verification actually complete.
<!-- /ANCHOR:closure -->
