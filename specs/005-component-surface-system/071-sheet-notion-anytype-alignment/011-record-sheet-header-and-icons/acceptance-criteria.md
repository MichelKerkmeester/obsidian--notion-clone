---
title: "Acceptance Criteria: Record Sheet Header and Property Icons"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "011-record-sheet-header-and-icons acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Record Sheet Header and Property Icons

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/011-record-sheet-header-and-icons
**Level:** 3
**Status:** Implemented 2026-09-10 — the record family joined the shared phone header and the row type icons landed, on lane-measured numbers; the operator's device read (AC-008) stays open
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any assertion is written, Then every numeric target is traceable to our own measurement and none to a 299x678 Notion asset | `spec.md` §13's Target column; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given the title-centring clause, When its surface list is read, Then record-detail and record-peek are members | Lane source diff: `TITLE_CENTERED_SURFACES` no longer excludes them; the clause's report names which selector answered (`via shell` / `via record-family`) | Met | - |
| AC-003 | REQ-003 | Given record-detail and record-peek, When their titles are measured, Then each centre sits within 0.50px of the frame centre | Lane RED→GREEN measured: RED 47.50px / 47.50px off centre (`via record-family`, the pre-change producers, lane exit 1); GREEN 0.49px / 0.49px, `via shell` (the shared header), lane exit 0 | Met | - |
| AC-004 | REQ-004 | Given a record property row, When rendered, Then it carries its property's type icon | Lane RED→GREEN: 0 of 21 → 21 of 21 rows carry `.obnotion-record-detail-field-type-icon`, inside the label's 96px box; row pitch measured 44.0px before and after | Met | - |
| AC-005 | REQ-005 | Given the header change, When `006`'s record clauses rerun unchanged, Then 21/21 rows at 44.0px, 20/20 hairlines, the 16.0px inset and 0 native selects all still pass | Regression check, command output: 21/21 rows 44.0px, 20/20 hairlines (last 0px), 16.0px inset, 1/1 section headings 16.0px/1px, 0 native selects, scrollWidth 390 ≤ 389+1 at 402px — identical numbers, both engines, lane exit 0 | Met | - |
| AC-006 | REQ-006 | Given the record's open target, When this phase closes, Then it is unchanged and still owned by `006-record-open-target` | `git diff`: the desktop-anchored header branch is untouched and the sheet's open affordance keeps calling the same `actions.openRow` (now the shell header's trailing expand control); the record grammar's close-target clause (44.0×44.0) and 006's ownership statement in `spec.md` §13 unchanged | Met | - |
| AC-007 | REQ-007 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | `npm run screenshots </dev/null` ×2, 480/480, exit 0 both; 15 content movers judged by decoded pixel delta, every one at identical counts across both runs (record-detail family 8, record-peek family 4, the submenu fixture mounting the record detail 2, the time-relative field-file-fields read 1); 1 jitter (2px@Δ1, one run) restored; the before/after and its judgement are the 011 acquire/edit/release triplet in `tools/lane/css-lane.json` | Met | - |
| AC-008 | SC-004 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report the record sheet aligned | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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

**Closeable:** No — implementation landed 2026-09-10. Every agent-verifiable criterion (AC-002 through AC-007) is Met with lane, command-output or capture-diff evidence recorded in the rows above and in
`tools/lane/css-lane.json`'s 011 release entry; the unit contract in
`src/views/record-detail-panel.test.ts` proved red at the pre-change producer (1 of 3 tests) and
green after it (3/3). AC-008 — the operator's own device read (D3) — stays open, and no agent may
tick it.
<!-- /ANCHOR:closure -->
