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
| AC-001 | REQ-001 | Given the app's full source tree, When every sheet-opening call site is grepped, Then the inventory table lists one row per surface with no surface omitted | Inventory table row count cross-checked against an independent grep count | Unmet | - |
| AC-002 | REQ-001 | Given the inventory table, When each row is read, Then it names a story-coverage state, a screenshot-manifest state, and a reference mapping (or its explicit absence) | Inventory table, no blank cells | Unmet | - |
| AC-003 | REQ-002 | Given a coverage gap found in `story-coverage-allowlist.json` that should be a real story, When it is fixed, Then `story-coverage.mjs` reports it as covered rather than allowlisted | `node tools/storybook/story-coverage.mjs` output | Unmet | - |

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

Not yet started.
<!-- /ANCHOR:closure -->
