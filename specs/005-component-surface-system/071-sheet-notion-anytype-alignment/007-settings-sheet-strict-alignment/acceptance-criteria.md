---
title: "Acceptance Criteria: Settings Sheet Strict Notion Alignment"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "007-settings-sheet-strict-alignment acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Settings Sheet Strict Notion Alignment

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/007-settings-sheet-strict-alignment
**Level:** 3
**Status:** Draft — scaffolded, not implemented
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the reference inventory this scaffold built, When implementation starts, Then it cites the exact reference captures and their resolution limits before writing any lane assertion | `spec.md` §13, `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given the redesigned sheet, When measured by the sheet-grammar lane, Then rows render inside ≥2 rounded card groups on a canvas background distinct from the card background, with a visible inter-card gap | Lane RED-then-GREEN count (`tools/live/sheet-grammar.mjs`) | Unmet | - |
| AC-003 | REQ-003 | Given the card wrapper, When `002`'s row-grammar and overflow assertions rerun unchanged, Then they still pass | Regression check, command output | Unmet | - |
| AC-004 | REQ-004 | Given the redesigned sheet, When a section has rows, Then its label renders above its own card rather than as an inline hairline-prefixed label inside a continuous list | Lane assertion + visual capture | Unmet | - |
| AC-005 | REQ-005 | Given the sheet's current row set, When checked for sheet-level action rows, Then either they render in their own trailing card or the requirement is recorded N/A because no such rows exist | `tasks.md` T004's vacuous-pass record | Unmet | - |
| AC-006 | REQ-007 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Capture diff, `implementation-summary.md` | Unmet | - |
| AC-007 | SC-003 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report it aligned with Notion's own settings sheet | Operator's own device read (D3) — no agent ticks this row | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No — scaffold only. AC-001 is Met (the reference inventory and gap table are
complete, `spec.md` §13); AC-002 through AC-006 require implementation, which this scaffold
explicitly defers to a GLM 5.3 flash implementation leg executing `tasks.md`; AC-007 requires the
operator's own device read (D3) and no agent may tick it.
<!-- /ANCHOR:closure -->
