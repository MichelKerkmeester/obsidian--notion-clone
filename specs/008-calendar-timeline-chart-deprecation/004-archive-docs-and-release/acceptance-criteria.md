---
title: "Acceptance Criteria: Archive Docs and Release"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "004-archive-docs-and-release acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Archive Docs and Release

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 008-calendar-timeline-chart-deprecation/004-archive-docs-and-release
**Level:** 3
**Status:** Implemented
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given `README.md` and the community-plugin description, When grepped for calendar/timeline/gallery/chart, Then zero matches remain | `tools/naming/scan-deprecated-views.mjs` (this leg): README.md 13 mentions before → 0 outside the sanctioned note after (7 remain, all inside the mandated "Deprecated views" note — the pointer this phase's directive requires, counted, not enforced); the community-plugin description (`manifest.json`) 3 → 0; the lane's vitest coverage 10/10; the red-then-green record in `tasks.md` T006 | Met | - |
| AC-002 | REQ-002 | Given `037-timeline-gantt-port`'s docs or the parent `005` roadmap, When read, Then the landing is noted as superseded by this packet without deleted history | 037's own goal.md LOG, the 2026-09-09 note "Landing superseded by the 008 packet's archival": it names the removal, the archive path, the last-live SHA and the restore procedure, and records that every prior row stands — nothing deleted; 005's handover 008/003 entry already carried the supersession | Met | - |

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

Both criteria are `Met` with observed evidence: the mention counts (the root README 13 → 0 outside
the mandated note, the community-plugin description 3 → 0) read by the scanner lane this leg added,
and 037's own supersession note. REQ-003 (P1) is discharged by the drafted release notes at
`../changelog/008-004-archive-docs-and-release.md`, which describe the removal and the
archive/restore path; publishing them is the 0.0.35 cut's, a later leg's. The closure's
verification date is 2026-09-09; the numbers it cites are read exit codes and counted outputs,
recorded in `tasks.md` and the implementation summary.
<!-- /ANCHOR:closure -->
