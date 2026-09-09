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
**Status:** Implemented
**Date:** 2026-09-08 (criteriaMet 2026-09-09)
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the three renderer source files, When the removal lands, Then they exist only under `archive/deprecated-views/<view>/`, excluded from the build | Ten `git mv`-renamed sources (renderer, tests, benches) staged as renames; `npm run build` exit 0; `grep -c -iE 'gantt\|calendar-renderer\|chart-renderer' main.js` = 0, down from 5 | Met | - |
| AC-002 | REQ-002 | Given the harness lanes for the three renderers, When removed, Then `npm run gate` still exits 0 | The registries trimmed (13+8 rows), the retired captures retired (616→480), the retired replay/assertion claims retired or narrowed; `npm run gate` exit 0 — 27 green, 0 red for a declared reason (27→27; the dormant-keep recorded in the decision record). The red-first record: the moved-but-rewiring-then tree failed tsc (exit 2, 4× TS2307) and vitest (11 failed / 13 files) before the surgery, recorded in `tasks.md` T004 | Met | - |
| AC-003 | REQ-003 | Given `archive/deprecated-views/<view>/README.md`, When read, Then it names the last-live SHA and the exact restore procedure | All four READMEs (root + calendar + timeline + chart) name `e75a979c9a21f6f93967a40e24b2a58f474fa9d5` (the commit 0.0.34 was cut from) and the `git checkout <sha> -- <paths>` procedure with the deps a restore needs; all ten restored paths proven reachable at that SHA by `git show` (byte counts > 0) | Met | - |
| AC-004 | REQ-004 | Given the archival decision, When recorded, Then it exists as an ADR in this phase's `decision-record.md` | `decision-record.md` ADR-001 (archive-then-exclude) + ADR-002 (dormant harness machinery) + ADR-003 (retired tokens recorded, not stood in), all Accepted, each with rejected alternatives | Met | - |

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

All four criteria are `Met` with observed evidence: the bundle grep 0 (5 before), the
gate 27/27, the READMEs' proven-restore premise, and the ADR set. The closure's
verification date is 2026-09-09; the numbers it cites are the leg's own read exit codes
and counted outputs, recorded in `tasks.md` and the implementation summary.
<!-- /ANCHOR:closure -->
