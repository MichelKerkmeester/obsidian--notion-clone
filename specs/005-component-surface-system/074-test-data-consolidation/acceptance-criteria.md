---
title: "Acceptance Criteria: Test Data Consolidation"
description: "The criteria this packet must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "074 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Test Data Consolidation

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 074-test-data-consolidation
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the project's fixture/test surfaces (`tools/screenshots/`, `tools/storybook/`, any smoke vault), When inventoried, Then every dataset is named with its current row/view/column coverage | Inventory table | Unmet | - |
| AC-002 | REQ-002 | Given the inventory, When the consolidated testbed database is built, Then it covers every surviving view type, column type, grouping, filter, sort, formula and relation the inventory found | Database definition + coverage checklist | Unmet | - |
| AC-003 | REQ-003 | Given the consolidated database, When each harness (capture, story, phone-smoke) is rerun against it, Then each passes its own pre-existing pass/fail criteria | Harness command output, before/after | Unmet | - |
| AC-004 | REQ-004 | Given `070`'s fix lands, When the Finance databases are opened, Then their properties render populated, and this is documented as the kept second dataset | Recapture + spec note | Unmet | - |

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

**Closeable:** No

Not yet started; blocked on 070 for AC-004.
<!-- /ANCHOR:closure -->
