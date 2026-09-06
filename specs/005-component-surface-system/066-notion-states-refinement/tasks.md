---
title: "Tasks: Notion States Refinement"
description: "Seventeen legs: two decisions, six builds, one reconciliation, the lane rows and the device read. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "066 tasks"
  - "notion states refinement tasks"
  - "toast dwell task"
  - "inline chip task"
  - "fast band census task"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion States Refinement

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

Every build leg carries a **red-first proof**: the exact check, and the value it reads on the tree at
`38bba1e3` before the fix exists. Every lane row extends an existing `tools/live/` lane; this packet
creates no new lane file and never ticks an operator device row.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup — record the decisions before the code reads them

- [ ] T001 [P0] **Record ADR-003, the action-toast dwell.** The 5000ms figure is an inference: no
      capture can show a Notion duration, and the 2200ms it splits from is an unmeasured inheritance
      from the operation-result rail (`../055-states-feedback-and-motion/design-trueup.md:350`;
      ADR-005's toast row at `decision-record.md:452-460` measures only the 0.2s Anytype transition).
      The ADR states the inference, names D-2 as the check that would move it, and fixes the
      matrix the tests assert. (`decision-record.md`)
- [ ] T002 [P] [P0] **Record ADR-004, the fast-band curve.** Either an explicit `--db-motion-fast-out:
      120ms ease-out` joins the token block (`styles.css:142-146`) and the four literals alias it, or
      they migrate to `var(--db-motion-fast)` and `ease` becomes the one fast-band curve. The ADR
      picks one and says why; absorbing the choice silently is what left four `ease-out` declarations
      outside a token that is `ease`. (`decision-record.md`)
- [x] T003 [P] [P1] **Record ADR-001 and ADR-002.** Both were ruled by the operator on
      **2026-09-06 18:50**: *"Keep one weight"* (ADR-001 — the single `danger` boolean holds, zero
      code) and *"Centre on phone, keep corner on desktop"* (ADR-002 — the phone half is T017, the
      desktop corner stays). Both quotes are verbatim in `decision-record.md`, each with its date and
      time. (`decision-record.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 [P0] **Split the toast's dismissal budget.** Add a second constant beside
      `AUTO_DISMISS_MS = 2200` (`src/views/toast.ts:62`) and select on `options.action` at the single
      `setTimeout` (`:137`). The `error` branch is untouched and must be asserted untouched.
      **Red-first proof:** a Vitest with fake timers mounts a `success` toast carrying an action and
      asserts it is still connected at 3000ms — **fails today**, because `:137` reads one constant
      for every success; and mounts a plain `success` and asserts it is gone by 2500ms — passes
      today and must keep passing, which makes it the negative control for the split.
      (`src/views/toast.ts`, `src/views/toast.test.ts`)
- [ ] T005 [P0] **Route `deleteRow`'s failure through the toast.** Replace the bare
      `new Notice(t("errors.deleteFailed", …))` at `src/views/database-view.ts:8378` with a
      `showToast` carrying `severity: "error"`, following `showOperationResult` (`:11316-11334`).
      **Red-first proof:** force a delete failure and assert `.db-toast.is-error` is in the container
      — **fails today**, the catch renders a host `Notice` with no severity, no action and no wait.
      (`src/views/database-view.ts`)
- [ ] T006 [P0] **Route the two remaining owned `errors.deleteFailed` catches.** `duplicateRow`'s
      catch (`src/views/database-view.ts:8468`) and the third site at `:3681` report owned operations
      through the same bare notice as T005's. **Red-first proof:** the owned-operation notice census
      reads **242** today (`rg -n "new Notice\(" src --glob '!*.test.ts' | wc -l`); the lane row
      records the new figure and requires it to fall, and asserts the toast renders rather than only
      that the count moved — a census met by deleting notices is a worse surface with a greener lane.
      (`src/views/database-view.ts`)
- [ ] T007 [P1] **Add `renderInlineChip` beside `renderCard`.** A warning icon, a label, a chevron
      action, `aria-live="polite"`, no dismiss control. It renders `source-missing` and
      `group-relation-deleted` — both already members of the fourteen-strong `EmptyStateReason` union
      (`src/views/empty-state-renderer.ts:25-39`) — in compact contexts, where `renderCard`
      (`:295-330`) is the only shape today. **Red-first proof:** a board group whose relation was
      deleted renders no chip today; `grep -c "db-inline-chip" styles.css` reads **0**.
      (`src/views/empty-state-renderer.ts`, `src/views/empty-state-renderer.test.ts`)
- [ ] T008 [P1] **Add the `.db-inline-chip` block.** Beside the `.db-empty-card` family: background
      composed from a host token with `color-mix`, icon on `var(--text-error)`, **zero hex literals**,
      tap target at the host's interactive floor. The §6A 44px ruling governs table rows, not chips;
      the chip matches the row-menu and empty-action floor instead. **Red-first proof:** the block
      does not exist, so every assertion about it fails. Serialized behind the parent's CSS lane.
      (`styles.css`)
- [ ] T009 [P1] **Take the fast band to zero literals, per ADR-004.** The four declarations are
      `styles.css:200`, `:473`, `:7431` and `:22745`; the definition at `:122` and the comment at
      `:430` are not targets. The five residual `var(--db-transition-fast)` uses (`:2037`, `:5461`,
      `:5678`, `:20214`, `:21854`) move to `--db-motion-fast` (`:142`) in the same pass.
      **Red-first proof:** the comment-excluded declaration census reads **4** today and must read
      **0**; the raw grep reads 7, which is why the lane row counts declarations. Serialized behind
      the parent's CSS lane. (`styles.css`)
- [ ] T017 [P1] **Centre the shared placement on phone; keep the desktop corner, per ADR-002.**
      The toast stack (`styles.css:2724-2736`) and the operation-result rail host (`:2714-2719`) are
      one placement; within the phone band (`@media (pointer: coarse), (max-width: 760px)`,
      `:20945`) the card centres horizontally with symmetric margins, and outside the band neither
      anchor moves. **Red-first proof:** at 390px the stack's computed left margin is **−6px**
      (384px wide, `right: 12px` — it overflows the left edge outright), and at 430px the rail reads
      left **30px** against right **16px**, its `calc(100vw - 32px)` clamp being symmetric at 390px
      only by accident. Serialized behind the parent's CSS lane. (`styles.css`)
- [ ] T010 [P1] **Reconcile `055`'s five stale rows and two lagging checkboxes.** In
      `../055-states-feedback-and-motion/goal.md`: the toast row (`:118-121`, *0 of 247* → the census
      is 242, and `notice.galleryMigrated` at `src/i18n.ts:1473` is delivered by `showToast` with an
      Undo at `database-view.ts:2718-2723`); the item-9 row (`:105-117`, *12 reasons at `:24-36`* →
      **14** at `empty-state-renderer.ts:25-39`, `group-relation-deleted` and `source-missing`
      included); the E4 row (`:172-179`, *RED, `row-menu.ts:166-176` calls `confirmWithModal` and
      `deleteRow`* → the confirm is gone and the landed comment sits at `src/views/row-menu.ts:163-171`);
      the motion row (`:157-165`, *42 declarations hand-type `120ms`*, token cited at `styles.css:113`
      → **4** declarations, token at `:122`). In `../055-states-feedback-and-motion/tasks.md`: T003
      (`:102`) and the T019 amendment (`:652`) tick with their landed evidence.
      **Red-first proof:** each old claim is reproduced as false against the tree before its
      replacement lands — the stale claim is its own negative control. Every restatement carries a
      same-day `file:line`; nothing is copied from this packet or the digest without re-checking.
      (`../055-states-feedback-and-motion/goal.md`, `../055-states-feedback-and-motion/tasks.md`)
- [ ] T011 [P2] **Record R6 and R7 as future and conditional, and do not build them.** The in-trash
      persistent banner (`screen:15f3126a`, `screen:4e2f2124`) belongs to a trash/restore phase and
      inherits a Bin-shaped design question from E4's own logic; two-tier loading
      (`screen:a483c1af`, `screen:a36c0cce`) is conditional on a multi-step async surface with ≥2
      named steps and >2s expected duration, which does not exist. Each keeps its threshold and its
      red-first check so the phase that opens it does not re-derive them. (`decision-record.md`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T012 [P0] **Extend the existing lanes with the computed rows.** Five assertions, each on an
      existing `tools/live/` lane, each reading a computed value and each with its own negative
      control watched red first: the two dwell budgets read apart; `.db-toast.is-error` rendering on
      a forced owned-operation failure, with the notice census figure recorded; the chip's background
      resolving from a host token with no hex literal; the comment-excluded fast-band declaration
      census; and the phone-band placement margins reading symmetric at 390px and 430px with the
      desktop anchors unchanged (AC-009, per ADR-002's 18:50 ruling). **No new lane file**, and no
      operator device row is ticked by this packet.
      (`tools/live/*.json`)
- [ ] T013 [P0] **Run the three gates and read each exit status.** `npx tsc --noEmit`,
      `npm run build`, `npx vitest run`. A green run that exercised nothing is recorded as such
      rather than quoted as coverage.
- [ ] T014 [P1] **Re-derive the captures for the chip.** The chip is a rendering change, so the
      screenshot gate applies: a current capture of a compact context carrying the chip, looked at
      rather than assumed. (`screenshots/`)
- [ ] T015 [B] [P1] **The operator device read, D-1, D-2 and the centred placement.** D-1: iOS
      `Reduce Motion` stops the skeleton shimmer and snaps entrances inside the plugin's WKWebView —
      unverifiable from source or captures, because media-query behaviour in a webview is exactly the
      class of fact the device pass owns. D-2: the Undo target is one-hand reachable at the rail's
      clamped phone width `min(384px, calc(100vw - 32px))` (`styles.css:2756-2767`), without which
      the 5000ms window is a number and not an affordance. A third read joins them, owed by ADR-002's
      18:50 ruling: the centred stack reads as placed for the thumb on the same handset (AC-008's
      third clause). All ride `055` `tasks.md` T017 rather than opening a new pass. Blocked on the
      operator.
- [x] T016 [P1] **The operator rules ADR-001 and ADR-002.** **Ruled 2026-09-06 18:50** — *"Keep one
      weight"* and *"Centre on phone, keep corner on desktop"*, both quoted verbatim in
      `decision-record.md`. This row records the operator's own completed act; the packet's device
      rows are the ones still waiting on them.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:ai-protocol -->
## AI Execution Protocol

### Pre-Task Checklist

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Read the task and every file it names before the first edit | [ ] | The `file:line` citations in the task's own row |
| 2 | Confirm the task's threshold was observed red, with the failing figure recorded | [ ] | The Verification cell in `acceptance-criteria.md` |
| 3 | Confirm the leg touches no file another leg owns (`styles.css` excepted, CSS lane serialized) | [ ] | `plan.md`'s affected-surfaces table |
| 4 | Confirm what may not change: `055`'s vocabulary, its motion token values, and both landed Anytype rulings | [ ] | `goal.md` D4, D7 |

### Execution Rules

| Rule | Detail |
|------|--------|
| One leg, one file group | A leg opens its files once; `styles.css` goes through the parent's serialized CSS lane |
| Red first | A task whose threshold has no recorded failing figure does not start |
| No Notion number | Shapes and behaviours only; every value comes from the tree or from an ADR that calls it an inference |
| Exit statuses from `$?` | `cmd >/tmp/out.log 2>&1; echo $?` — never through a pipe |
| Captures read by a person | A changed PNG is opened and read; a capture that succeeds is not a capture that is right |
| Scope lock | Nothing outside `spec.md`'s Files to Change table; adjacent findings are named, not fixed |

### Status Reporting Format

| Status | Meaning |
|--------|---------|
| `OK` | The task's threshold passed and its negative control was seen red before green |
| `OK (residual)` | Threshold passed; the named residual is recorded in the task row, not silent |
| `BLOCKED <reason>` | Forward progress stopped; the blocker and the needed decision are named |

### Blocked Task Protocol

1. Stop at the first failed check; do not retry the same command twice without new evidence.
2. Restate the problem one level up — the interface, the data flow, or the module boundary.
3. If the block is a landed ruling this packet holds (ADR-001, ADR-002), name the conflict in the
   task row and stop; parent `goal.md` D15 forbids resolving it silently. Both of this packet's
   conflicts were ruled on 2026-09-06 18:50 and the ruling path is the one this rule names.
4. Operator-owned rows (T015, AC-008) are never unblocked by an agent. T016 was closed by the
   operator's own ruling, recorded above; AC-007 closed with it.
<!-- /ANCHOR:ai-protocol -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, or `[B]` with the blocker named and owned
- [ ] No `[B]` blocked tasks remaining that are this packet's to unblock
- [ ] Every row in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Goal**: See `goal.md`
- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Research**: See `../055-states-feedback-and-motion/research/research.md`
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
| P0 Items | 8 | 0/8 |
| P1 Items | 12 | 0/12 |
| P2 Items | 5 | 0/5 |

**Verification Date**: 2026-09-06
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
| Operator | Technical Lead | [ ] Approved | |
| Operator | Product Owner | [ ] Approved | |
| Operator | QA Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
