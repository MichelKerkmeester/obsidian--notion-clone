---
title: "Acceptance Criteria: iOS view data regression"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "070 acceptance criteria"
  - "ios property read closure gate"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "070-ios-view-data-regression"
    last_updated_at: "2026-09-08T08:44:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the acceptance criteria for this packet"
    next_safe_action: "Meet AC-001 through AC-004 before closing; AC-005 is the operator's own"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "070-ios-view-data-regression-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: iOS View Data Regression

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 070-ios-view-data-regression
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a fixture mirroring the operator's Finance and Testbed shapes, When the harness renders the view with the metadata cache cold, Then 0 of N properties render — a declared red before any fix | `node tools/live/database-cold-cache-property-read.mjs` with `COLD_CACHE_EXPECT=pre-fix-red`, observed red: 0/18 table cells, 0/8 board cells | Met | - |
| AC-002 | REQ-001 | Given the same fixture with the metadata cache warm, When the harness renders the view, Then the result is recorded as its own case (may already be green, may share AC-001's red — record whichever is observed) | Same harness, `table-warm-from-start` scenario: 18/18 populated, green from the start | Met | - |
| AC-003 | REQ-002 | Given the reproduction from AC-001, When the read path is traced through `data-source.ts`, `title-field-display.ts`, and `legacy-plugin-data-migration.ts`, Then exactly one is confirmed as the root cause with file:line evidence | `data-source.ts` confirmed (`getViewDefFiles()`'s eager record-cache seed at `:513-526`, `getCachedRecords()`'s build-once guard at `:1794`, no `"resolved"` catch-all in `startListening()`); `title-field-display.ts` and `legacy-plugin-data-migration.ts` traced and excluded with evidence — see `tasks.md` T005-T007 and `implementation-summary.md` | Met | - |
| AC-004 | REQ-003 | Given the confirmed root cause, When the fix lands, Then a test proven to fail against the pre-fix code (mutation-proven) passes after, and AC-001/AC-002's harness scenarios both read N of N | `src/data/data-source.test.ts` new test, confirmed red via `git stash`/green after; harness rerun `RESULT: PASSED`, 18/18 and 8/8 | Met | - |
| AC-005 | REQ-004 | Given the fix, When the Finance Reports table and Database Testbed board are recaptured, Then both screenshots show populated properties matching the fixture's expected values | Partially met via the harness's own fixture-driven Finance/Testbed-shaped scenarios (not the operator's literal vault, which this environment does not have) | Unmet | - |
| AC-006 | REQ-005 | Given the fix and recapture, the operator confirms on their own iPhone that Finance Reports and Database Testbed both show populated properties | Operator device check — **operator-owned, never ticked by an agent** | Unmet | - |

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

AC-001 through AC-004 are Met, with file:line root-cause evidence and mutation-proven test/harness
coverage. AC-005 is only partially met (fixture-driven recapture, not the operator's own vault
surfaces) and AC-006 remains open pending the operator's own device recheck — both require the
operator's own iPhone, which this environment does not have.
<!-- /ANCHOR:closure -->
