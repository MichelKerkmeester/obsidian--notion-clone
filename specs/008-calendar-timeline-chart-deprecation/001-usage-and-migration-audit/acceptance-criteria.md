---
title: "Acceptance Criteria: Usage and Migration Audit"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "001-usage-and-migration-audit acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Usage and Migration Audit

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit
**Level:** 3
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the operator vault and every fixture/test vault, When scanned for `database:` frontmatter configuring calendar, timeline or chart, Then every match is listed with a decided redirect target | Inventory table | Met — `inventory.md` §2.1: all 33 vault views named with file:line and target; §2.2: 0 shipped fixture-vault views, programmatic harness fixtures named; §1.2 holds the per-type reasons | - |
| AC-002 | REQ-002 | Given the inventory, When the DatabaseViewType retention decision is made, Then it is recorded with a reason, matching 006's rigor | `spec.md` or `decision-record.md` entry | Met — `inventory.md` §1.1: the union keeps the three ids (accepted-but-redirected), reason grounded in 007-001's fallback-equality mechanism finding and 006's precedent, same rigor | - |

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

Closed 2026-09-08 by the 234-calendar-timeline-chart-audit leg: both criteria Met (see §2), REQ-003's decision recorded in `inventory.md` §1.3, the audit's only artifact. Read-only against `src/`/`tools/` per goal D1; verification suite (tsc, vitest 1671/153, build, the three naming scans) all exit 0 in `implementation-summary.md`.
<!-- /ANCHOR:closure -->
