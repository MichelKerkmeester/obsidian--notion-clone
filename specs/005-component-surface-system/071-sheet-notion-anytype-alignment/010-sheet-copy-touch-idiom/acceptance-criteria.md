---
title: "Acceptance Criteria: Sheet Copy: Touch Idiom"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "010-sheet-copy-touch-idiom acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Copy: Touch Idiom

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/010-sheet-copy-touch-idiom
**Level:** 3
**Status:** Draft — scaffolded, not implemented
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any target is written, Then every count is traceable to `src/i18n.ts` counted directly and none to a 299x678 Notion asset | `spec.md` §13's Target column | Met | - |
| AC-002 | REQ-002 | Given the four sheet-reachable strings, When the dictionary is swept, Then 0 strings reaching a phone sheet renderer name click, double-click or hover | Lane or unit clause RED→GREEN (RED: 4) | Unmet | - |
| AC-003 | REQ-003 | Given the seven cell and desktop-table pointer-gesture strings, When this phase closes, Then all seven are unchanged | `git diff` over `src/i18n.ts` | Unmet | - |
| AC-004 | REQ-004 | Given the EN dictionary, When its ellipsis characters are counted, Then one spelling is used throughout | Unit clause RED→GREEN (RED: 13 ASCII / 10 U+2026) | Unmet | - |
| AC-005 | REQ-005 | Given the filter and sort sheets, When their control labels are read, Then a property is called by one word | Capture + dictionary read | Unmet | - |
| AC-006 | REQ-006 | Given any key changed in EN, When zh-CN and zh-TW are read, Then neither retains a pointer gesture the EN string dropped | Dictionary read across all three locales | Unmet | - |
| AC-007 | REQ-007 | Given the two empty states that change, When recaptured phone-only light and dark, Then a before/after is recorded | Capture diff, `implementation-summary.md` | Unmet | - |
| AC-008 | SC-004 | Given the changed copy, When the operator re-reads the sheets on their own iPhone, Then they report the wording correct | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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

**Closeable:** No — scaffold only. AC-001 is Met (the audit completed the reference and
current-state reading, and every numeric target in `spec.md` §13 is traceable to our own
measurement rather than to a 299x678 Notion asset). The remaining criteria require implementation,
deferred to a GLM 5.3 flash leg executing `tasks.md`. The final row requires the operator's own
device read (D3) and no agent may tick it.
<!-- /ANCHOR:closure -->
