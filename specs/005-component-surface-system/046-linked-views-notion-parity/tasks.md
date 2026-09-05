---
title: "Tasks: Linked Views Notion Parity"
description: "Ordered tasks: answer the host-layout question and the write-model question first, then strip the block furniture, widen the embed, and add the move and create flows on the unchanged block format."
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Linked Views Notion Parity

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

- [x] T001 Read the three mechanisms that produce the reported shape and record them, so later work argues against the tree rather than the screenshot: the code-block host ancestor walk (`embedded-database-renderer.ts:600-611`), the header/toggle pair (`:1724-1745` plus the toolbar's `db-header`), and the four read-only gates (`:421`, `:433`, `:463`, `:1575`, `:1592`, `:1593`) — census recorded in `implementation-summary.md`; the mechanisms are now named by the tests that replaced them at `src/views/embedded-database-renderer.test.ts:486` (chrome), `:514` (width) and `:540` (capability)
- [ ] T002 Answer the host-layout question against real Obsidian, not against a harness: can an embed span the reading view's content width without breaking the layout of prose around it, and at what cost. This is the critical path; a guess here is a rewrite (`src/views/embedded-database-renderer.ts`, `styles.css`). Still unanswered — the width now releases through inline percentage widths up to the reading-view sizer, which no harness can measure against a real preview, and the stylesheet half of T004 and T005 waits on this answer
- [x] T003 [P] Write ADR-001 — may an embed write to the vault, and if so what is the undo story. Accepted or rejected, but recorded, before any capability gate is touched (`decision-record.md`) — ruling: Accepted 2026-09-05 ~05:30 CEST, operator verbatim "Allow db writing from linked views"; full parity, undo through the plugin's existing history stack, read-only only when the source is unresolved
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Strip the block furniture: no card border, no nested database title duplicating the page heading, no expand/collapse chevron. `hideHeader: true` stays honoured for existing blocks and stops being the answer to an unwanted header (`src/views/embedded-database-renderer.ts`, `styles.css`) — **two of three done**. The nested title and the chevron are gone: the embed asks the toolbar for `hideDatabaseTitle`, which withdraws the title row the duplicate title and the collapse button both hang off, and the chevron builder is deleted (`embedded-database-renderer.test.ts:487`). The card border is NOT: it lives at `styles.css:15652` on `.note-database-embed`, along with the corner radius and the 12px horizontal padding, and no stylesheet edit was made. `note-database-embed-linked` is on the container waiting for that rule
- [ ] T005 Widen the embed to the reading view's content width so no table column is clipped, using T002's answer. A fixed pixel width is not an acceptable fix (`src/views/embedded-database-renderer.ts`, `styles.css`) — **code half done, unmeasured**. The eight-ancestor host walk is gone; `releaseEmbedWidthToHost` now clears `max-width` and `overflow-x` up to the reading-view sizer using percentages, never a measured pixel (`embedded-database-renderer.test.ts:515`). Whether that actually reaches the content width, and what it does to prose around it, is T002 and needs the real host
- [x] T006 Apply ADR-001 to all four capability gates in one change. Relaxing them one at a time is how an embed ends up half-editable with nobody able to say which half (`src/views/embedded-database-renderer.ts`) — one `isViewReadOnly()` seam now answers all four, and 24 call sites read it. `rg -c 'persistMode === "codeblock"'` went 10 → 3, and all three survivors are presentation (`EMBED_LINKED_CLASS`, `hideDatabaseTitle`, `moveLinkedView`). Covered at `embedded-database-renderer.test.ts:541`
- [x] T007 Move a linked view to another page: a drag affordance on desktop, a **Move to page…** action in the embed's sheet on the phone. Destination written first, source removed second — a duplicate is recoverable and a loss is not (`src/views/embedded-database-renderer.ts`, `src/views/database-view.ts`) — `applyLinkedViewMove` proves the write order and the single surviving block (`embedded-database-renderer.test.ts:559`), and an interruption between the two writes leaves the destination written and the source intact (`:592`). The move is undoable through the embed's history
- [x] T008 Create linked view: pick source database, pick view type, name it, insert the block at the cursor. Desktop first; the phone flow uses `044`'s sheet and dropdown grammar. No clipboard step (`src/views/modals/`, `src/views/toolbar-renderer.ts`, `src/main.ts`) — the picker shares Add view's one option list rather than a second copy, and the fence it writes is read back by the embed's own option parser (`embedded-database-renderer.test.ts:610`, `:630`). Driving the modal end to end is T012's device pass
- [x] T009 [P] Labels in three locales (`src/i18n.ts`) — keys added in `en` / `zh-CN` / `zh-TW`: `command.createLinkedView`, `toolbar.createLinkedView`, `toolbar.moveToPage`, `linkedView.*`, `notice.linkedView*` including `notice.linkedViewNoDatabase`, and `undo.moveLinkedView`
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T010 The 16-row block round trip: {`dbId`, `dbPath`} × {`viewId` present, absent} × {`hideHeader` true, absent} × {`note-database`, `database-view`}, each parsed and re-serialised byte-identically. Adversarial rows included: a `dbPath` containing a colon, the empty `viewId:` value `copyCurrentViewCode` writes when a view has no id, and trailing whitespace (`src/views/embedded-database-renderer.test.ts:653`). The round trip alone only proves the new writer agrees with itself, so a second test feeds its fence to `parseEmbeddedReference`, the parser the rendering path actually uses (`:630`)
- [ ] T011 Capture pair proving SC-001 and SC-002: a constructed embed scenario beside the standalone view of the same data, both device widths, both themes. Read the PNGs by hand — a clipped column is not something an assertion notices (`tools/screenshots/constructed-scenarios.mjs`, `screenshots/`). No embed scenario exists, so nothing in the capture set moved when the chrome did
- [ ] T012 Prove SC-003 by re-reading both files after a move: same database, same view, same options, and exactly one block across the two pages
- [ ] T013 Prove the lazy-render gate survives the width change: a page with several embeds still renders them on intersection (`tools/live/`)
- [ ] T014 Recapture, read the changed PNGs, release the `styles.css` lane, and update `../roadmap.md` §4 row 42 with the measured result (`screenshots/`, `../roadmap.md`)
- [ ] T015 The stylesheet leg, once T002 has an answer and the lane is free: drop the card border, the corner radius and the horizontal padding for `.note-database-embed-linked` (`styles.css:15652`), and retire the rules left matching nothing — `.note-database-embed-codeblock-host` (`:15857`), whose class nothing adds any more, and the two header-toggle blocks (`:15879`, `:15908`) with the `toggleHeaderChrome` action and `renderHeaderChromeButton` that now have no reachable caller (`styles.css`, `src/views/toolbar-renderer.ts`, `src/views/embedded-database-renderer.ts`)
- [ ] T016 Decide whether the write capability ships behind a settings flag. `checklist.md` CHK-121 asks for one and ADR-001's rollback assumes it; a plugin ships as one bundle, so reverting the release may be the whole rollback. Operator call (`decision-record.md`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Operator row**: `../roadmap.md` §4 row 42
- **Row grammar**: `../044-phone-sheet-alignment/spec.md`
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

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented
- [ ] CHK-032 [P1] Auth/authz working correctly
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 0/14 |
| P1 Items | 21 | 0/21 |
| P2 Items | 6 | 0/6 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented (if applicable)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Response time targets met (NFR-P01)
- [ ] CHK-111 [P1] Throughput targets met (NFR-P02)
- [ ] CHK-112 [P2] Load testing completed
- [ ] CHK-113 [P2] Performance benchmarks documented
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested
- [ ] CHK-121 [P0] Feature flag configured (if applicable)
- [ ] CHK-122 [P1] Monitoring/alerting configured
- [ ] CHK-123 [P1] Runbook created
- [ ] CHK-124 [P2] Deployment runbook reviewed
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Security review completed
- [ ] CHK-131 [P1] Dependency licenses compatible
- [ ] CHK-132 [P2] OWASP Top 10 checklist completed
- [ ] CHK-133 [P2] Data handling compliant with requirements
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation complete (if applicable)
- [ ] CHK-142 [P2] User-facing documentation updated
- [ ] CHK-143 [P2] Knowledge transfer documented
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


