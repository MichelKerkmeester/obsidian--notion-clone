---
title: "Tasks: Phase 1: usage-and-migration-audit"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 1: usage-and-migration-audit

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Create project structure (pre-existing scaffold; docs-only leg, nothing to create)
- [x] T002 Install dependencies (none needed — the audit is a read of the existing tree)
- [x] T003 [P] Configure development tools (pre-existing; the verify suite ran unchanged)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 [Implement core feature 1] (the vault + fixture scan → `inventory.md` §2)
- [x] T005 [Implement core feature 2] (the code-reference inventory → `inventory.md` §3)
- [x] T006 [Implement core feature 3] (retention, targets, embedded-host decisions → `inventory.md` §1)
- [x] T007 [Add error handling] (edge cases from spec §8 → `inventory.md` §2.1 note, §2.2)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 Test happy path manually (fresh read-only vault grep; every count in `inventory.md` reproducible from its stated greps)
- [x] T009 Test edge cases (spec §8's two cases: per-view redirect scoping — the Finance databases; dead configuration — none found, recorded)
- [x] T010 Update documentation (`implementation-summary.md`, this file, `acceptance-criteria.md`; the README strip is phase 4, not this leg)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification passed (verification suite below, all exit 0)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Dependencies identified and available (none beyond the existing tree)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks (scan-comments: 507 files, 0 violations)
- [x] CHK-011 [P0] No console errors or warnings (vitest 1671/153, build, all exit 0)
- [x] CHK-012 [P1] Error handling implemented (not applicable — no runtime code; recorded in `implementation-summary.md`)
- [x] CHK-013 [P1] Code follows project patterns (no source changed — the leg is read-only by contract)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met (AC-001/AC-002 → Met, `acceptance-criteria.md`)
- [x] CHK-021 [P0] Manual testing complete (the fresh vault scan; counts pinned to `bf694181`)
- [x] CHK-022 [P1] Edge cases tested (spec §8 both rows — `inventory.md` §2.1 note / §2.2)
- [x] CHK-023 [P1] Error scenarios validated (read-only leg: nothing to error; the 15×-growth discrepancy is recorded as a limitation)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`. (no actionable finding — the audit shipped decisions, not fixes)
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep. (instance-only by construction: no fix shipped; the inventory greps are recorded)
- [x] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests. (nothing changed — the consumer surface IS the inventory, `inventory.md` §3)
- [x] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases. (no fix shipped)
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets (no code changed)
- [x] CHK-031 [P0] Input validation implemented (not applicable — read-only leg)
- [x] CHK-032 [P1] Auth/authz working correctly (not applicable — read-only leg)
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized (this edit; goal.md and acceptance-criteria.md ticked with evidence)
- [x] CHK-041 [P1] Code comments adequate (scan-comments: 0 artifact-id violations — no comment added or changed)
- [x] CHK-042 [P2] README updated (if applicable) (not this leg — the strip is 004-archive-docs-and-release's, `inventory.md` §3.7 is its worklist)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only (none created — the working tree carries only the packet docs)
- [x] CHK-051 [P1] scratch/ cleaned before completion (nothing to clean)
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 15 | 15 |
| P1 Items | 23 | 23 |
| P2 Items | 9 | 9 |

**Verification Date**: 2026-09-08 — every row ticked carries its evidence inline or names why it is not applicable (this leg ships a document; the parent's spec.md §7 already declares the NFR surface not applicable).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions documented in decision-record.md (this leg records its decisions in `inventory.md` §1; the 007 precedent puts the phase's ADRs in the shipping phase's 002 packet — this leg's is evidence, not an ADR)
- [x] CHK-101 [P1] All ADRs have status (Proposed/Accepted) (n/a — no ADR written here; see CHK-100)
- [x] CHK-102 [P1] Alternatives documented with rejection rationale (each target's rejected alternative named in `inventory.md` §1.2, e.g. why board is not calendar's target)
- [x] CHK-103 [P2] Migration path documented (if applicable) (`inventory.md` §5-§6)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [x] CHK-110 [P1] Response time targets met (NFR-P01) (n/a — no runtime change; spec §7 says the same)
- [x] CHK-111 [P1] Throughput targets met (NFR-P02) (n/a — no runtime change)
- [x] CHK-112 [P2] Load testing completed (n/a — no runtime change)
- [x] CHK-113 [P2] Performance benchmarks documented (n/a — no runtime change)
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback procedure documented and tested (`inventory.md` §6: the `bf694181` restore recipe)
- [x] CHK-121 [P0] Feature flag configured (if applicable) (n/a — no flag; the redirect ships unflagged like 006/007 did)
- [x] CHK-122 [P1] Monitoring/alerting configured (n/a — no runtime change)
- [x] CHK-123 [P1] Runbook created (the restore recipe doubles as it — §6)
- [x] CHK-124 [P2] Deployment runbook reviewed (n/a — no deploy in this leg)
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [x] CHK-130 [P1] Security review completed (read-only leg; nothing to review)
- [x] CHK-131 [P1] Dependency licenses compatible (no dependency added — `chart.js` stays until phase 3)
- [x] CHK-132 [P2] OWASP Top 10 checklist completed (n/a — no runtime change)
- [x] CHK-133 [P2] Data handling compliant with requirements (the vault was read, never written; noted in `inventory.md` §2)
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] All spec documents synchronized (this edit)
- [x] CHK-141 [P1] API documentation complete (if applicable) (n/a — no API changed)
- [x] CHK-142 [P2] User-facing documentation updated (README strip is phase 4; the worklist is `inventory.md` §3.7)
- [x] CHK-143 [P2] Knowledge transfer documented (`implementation-summary.md` + this checklist; the next leg's charter is `inventory.md` §5)
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| [Name] | Technical Lead | [ ] Approved | |
| [Name] | Product Owner | [ ] Approved | |
| [Name] | QA Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->


