---
title: "Acceptance Criteria: Sheet Story Coverage Audit"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "001-sheet-story-coverage-audit acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Story Coverage Audit

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit
**Level:** 3
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the app's full source tree, When every sheet-opening call site is grepped, Then the inventory table lists one row per surface with no surface omitted | Met — 86 rows (54 primary + 32 stacked). The independent cross-check runs inside the count test: modal producers re-counted by grep (19 `extends DbModal` + 3 `extends FuzzySuggestModal` + 1 unnamed), every cited producer `file:line` opened and read, and the grammar registries pinned at 17/32/11 (`tools/storybook/sheet-inventory.test.mjs`, 9/9) | Met | - |
| AC-002 | REQ-001 | Given the inventory table, When each row is read, Then it names a story-coverage state, a screenshot-manifest state, and a reference mapping (or its explicit absence) | Met — the test walks every primary row's story, captures and references cells for blanks; absences are the literal "none": 18 primary rows without captures, 46 rows without any reference, every one named (inventory.md; the test also pins 68 rows with captures and 22/33 rows citing a Notion/Anytype reference) | Met | - |
| AC-003 | REQ-002 | Given a coverage gap found in `story-coverage-allowlist.json` that should be a real story, When it is fixed, Then `story-coverage.mjs` reports it as covered rather than allowlisted | Met — the census found no such gap: `node tools/storybook/story-coverage.mjs` → 19/40, 0 missing, 0 stale, 0 unreasoned, exit 0, so nothing needed fixing; the criterion's given/when never fired and the count test pins 40 = 19 + 21 against drift | Met | - |

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

**Closeable:** Yes

All three criteria verified 2026-09-08 in worktree 235: inventory.md (86 rows, no blank cells, recorded absences), `tools/storybook/sheet-inventory.mjs` + its 9-test count guard, full gate 26 green / 0 red. Residuals (18 primary rows without captures, 46 without references, the phase-close changelog entry) are recorded absences, not unverified claims.
<!-- /ANCHOR:closure -->
