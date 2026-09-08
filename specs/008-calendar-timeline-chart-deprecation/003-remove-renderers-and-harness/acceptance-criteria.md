---
title: "Acceptance Criteria: Remove Renderers and Harness"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "003-remove-renderers-and-harness acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Remove Renderers and Harness

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 008-calendar-timeline-chart-deprecation/003-remove-renderers-and-harness
**Level:** 3
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the three renderer source files, When the removal lands, Then they exist only under `archive/deprecated-views/<view>/`, excluded from the build | `git status`, build output, bundle grep | Unmet | - |
| AC-002 | REQ-002 | Given the harness lanes for the three renderers, When removed, Then `npm run gate` still exits 0 | Command output | Unmet | - |
| AC-003 | REQ-003 | Given `archive/deprecated-views/<view>/README.md`, When read, Then it names the last-live SHA and the exact restore procedure | File content | Unmet | - |
| AC-004 | REQ-004 | Given the archival decision, When recorded, Then it exists as an ADR in this phase's `decision-record.md` | `decision-record.md` | Unmet | - |

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
