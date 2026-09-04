---
title: "Verification Checklist: Linked Views Notion Parity"
description: "Acceptance criteria with the failing number recorded first, so a pass means an embed actually stopped being a block."
trigger_phrases:
  - "046 linked views checklist"
  - "embed parity verification"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Linked Views Notion Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Each row records the failing measurement from the current tree **before** work starts. A criterion
with an empty "today" cell is not accepted. Chrome measurements are taken on a rendered embed inside
a real reading view, not on a harness mount, because the ancestor chain is the mechanism.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Block-furniture elements on an embed | 3: card border, duplicate database title, expand/collapse chevron | 0 | [ ] |
| C2 | Table columns clipped at an embed's right edge | at least 1 — the operator's capture cuts the third column mid-cell | 0 | [ ] |
| C3 | Independent read-only gates keyed on `persistMode === "codeblock"` | 6 reads across 4 decisions (`:421`, `:433`, `:463`, `:1575`, `:1592`, `:1593`), none with a recorded intent | 1 resolved capability value | [ ] |
| C4 | Clipboard steps to place a linked view | 1, and it is the only path | 0 | [ ] |
| C5 | Ways to move a placed linked view | 0 (cut and paste in the editor is not one of ours) | 2: desktop drag, phone action | [ ] |
| C6 | Block shapes covered by a round-trip test | 0 — no such test exists | 16 plus 3 adversarial | [ ] |
| C7 | Embeds with a photographed constructed scenario | 0 | at least 1 at both widths and themes | [ ] |

**C1 and C2 are the operator's complaint. C3 is why the fix cannot be incremental. C7 is what stops
the parity claim resting on one screenshot.**

### Blank Failing Numbers

C1's count is from reading the operator's capture, not from a script; a chrome census does not exist
yet and T001 is where it gets written. That is recorded rather than dressed up as a measurement,
because the difference between "three things I can see in a PNG" and "three elements a check found"
is exactly the difference this program keeps being caught by.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [ ] CHK-001 [P0] The three mechanisms are cited by file:line, not paraphrased
- [ ] CHK-002 [P0] The host-layout question is answered against real Obsidian before any CSS rule
- [ ] CHK-003 [P0] ADR-001 has a status other than `Proposed` before any capability gate is touched
- [ ] CHK-004 [P1] The `styles.css` lane holder is named before the first stylesheet edit
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## CODE QUALITY

- [ ] CHK-010 [P0] `npm run lint` and `tsc --noEmit` exit 0
- [ ] CHK-011 [P0] No console errors while rendering, moving and creating an embed
- [ ] CHK-012 [P1] An unresolvable block still shows the read-failed card with its retry action
      rather than a blank region
- [ ] CHK-013 [P1] The ADR-002 refactor lands as its own commit with no behaviour change, proven by
      an identical rendered DOM before and after
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## TESTING

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row that is not operator-only is `Met` with
      observed evidence
- [ ] CHK-021 [P0] `npm run gate` exits 0, read without a pipe
- [ ] CHK-022 [P0] The 16-row round trip plus the three adversarial rows is green
- [ ] CHK-023 [P1] An interrupted move leaves the destination written and the source intact, never
      the reverse
- [ ] CHK-024 [P1] A page with several embeds still renders them lazily after the width change
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## FIX COMPLETENESS

- [ ] CHK-FIX-001 [P0] Finding class recorded. Report 42 is `algorithmic` for the width (the
      ancestor walk is the mechanism) and `class-of-bug` for the chrome.
- [ ] CHK-FIX-002 [P0] Producer inventory run — `rg -n 'persistMode' src/views/embedded-database-renderer.ts`,
      count stated before and after
- [ ] CHK-FIX-003 [P0] Consumer inventory run for `note-database-embed-codeblock-host`,
      `note-database-embed-headerless` and `db-embed-header-toggle` across `src/`, `styles.css` and
      `tools/`
- [ ] CHK-FIX-004 [P0] The move writes two files. Adversarial rows required: a `dbPath` containing a
      colon, an empty `viewId:` value, trailing whitespace, and an interruption between the writes
- [ ] CHK-FIX-005 [P1] Matrix axes listed: 16 block shapes plus 3 adversarial rows
- [ ] CHK-FIX-006 [P1] Applies — the reading view's DOM is host-owned global state, and the ancestor
      walk reads it
- [ ] CHK-FIX-007 [P1] Evidence pinned to a fix SHA
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## SECURITY

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Neither the move nor the create flow constructs a vault path from unvalidated
      block content
- [ ] CHK-032 [P1] N/A — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## DOCUMENTATION

- [ ] CHK-040 [P1] Spec/plan/tasks/decision-record agree on requirement numbering and ADR ids
- [ ] CHK-041 [P1] The comment above the capability resolver states the ADR-001 outcome as intent,
      without naming the ADR id in code
- [ ] CHK-042 [P1] `../roadmap.md` §4 row 42 carries the measured result
- [ ] CHK-043 [P2] The release note says plainly that notes created from an embed survive a revert
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## FILE ORGANIZATION

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## VERIFICATION SUMMARY

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 0/14 |
| P1 Items | 16 | 0/16 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented — N/A, no stored shape changes
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] The lazy-render gate still fires after the width change (NFR-P01)
- [ ] CHK-111 [P1] No new layout thrash on the embed's render path (NFR-P02)
- [ ] CHK-112 [P2] A page with many embeds measured, not assumed
- [ ] CHK-113 [P2] Numbers recorded in `implementation-summary.md`
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested
- [ ] CHK-121 [P0] Feature flag configured if ADR-001 permits writes
- [ ] CHK-122 [P1] A constructed embed scenario is in the capture manifest, so a chrome regression
      shows in `screenshots-fresh` rather than on the operator's page
- [ ] CHK-123 [P1] The release note states what a revert does and does not undo
- [ ] CHK-124 [P2] Deployment steps reviewed
<!-- /ANCHOR:deploy-ready -->
