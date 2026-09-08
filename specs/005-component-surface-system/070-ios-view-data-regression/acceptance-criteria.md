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
| AC-001 | REQ-001 | Given a fixture mirroring the operator's Finance and Testbed shapes, When the harness renders the view with the metadata cache cold, Then 0 of N properties render — a declared red before any fix | `tools/live/` new cold-cache scenario, observed red | Unmet | - |
| AC-002 | REQ-001 | Given the same fixture with the metadata cache warm, When the harness renders the view, Then the result is recorded as its own case (may already be green, may share AC-001's red — record whichever is observed) | Same harness scenario, warm-cache variant | Unmet | - |
| AC-003 | REQ-002 | Given the reproduction from AC-001, When the read path is traced through `data-source.ts`, `title-field-display.ts`, and `legacy-plugin-data-migration.ts`, Then exactly one is confirmed as the root cause with file:line evidence | Trace notes in `plan.md` FIX ADDENDUM, updated with the confirmed file:line | Unmet | - |
| AC-004 | REQ-003 | Given the confirmed root cause, When the fix lands, Then a test proven to fail against the pre-fix code (mutation-proven) passes after, and AC-001/AC-002's harness scenarios both read N of N | New test in the nearest existing suite; harness rerun | Unmet | - |
| AC-005 | REQ-004 | Given the fix, When the Finance Reports table and Database Testbed board are recaptured, Then both screenshots show populated properties matching the fixture's expected values | `screenshots/manifest.json` entries for both surfaces | Unmet | - |
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

Not yet started. AC-001 through AC-005 must be Met before this packet may claim completion; AC-006 remains open pending the operator's own device recheck regardless of the other five.
<!-- /ANCHOR:closure -->
