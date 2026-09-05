---
title: "Implementation Plan: Remove the List Renderer and Its Harness"
description: "Remove the renderer and every measurement of it in one change, ordered so the gate is never green against a view that is half gone: measurements first, then source, then the ratchet and the manifest."
trigger_phrases:
  - "list removal plan"
  - "gate lane removal order"
  - "ratchet floor lowering"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Remove the List Renderer and Its Harness

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, plus the Node harness under `tools/` |
| **Framework** | None |
| **Storage** | None written. `DatabaseViewType` is read and possibly narrowed |
| **Testing** | `npm run gate`, `$?` read directly; captures for the board and gallery cards |

### Overview

One change, ordered internally so the tree is never in a state where the gate is green against a
half-removed view. Measurements come out first — the lane, the claims, the fixtures, the specs —
then the source, then the ratchet floor and the capture manifest. Doing it the other way round means
a window where `list-window.mjs` runs against a deleted renderer, and the failure it produces would
be indistinguishable from a real one.

`005` did the enumeration. This phase executes it, and a surface that turns up here which the audit
did not name is recorded against `005` rather than quietly fixed — a missed surface is evidence
about the audit method, and losing it costs more than the minute it saves.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented
- [ ] Success criteria measurable
- [ ] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing (if applicable)
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Remove-together, from `030-gallery-view-deprecation` REQ-003. Its companion REQ-004 — lowering the
coverage ratchet deliberately with the reason beside the number — is carried over as REQ-003 here,
because the trap it exists for is the same one.

### Key Components
- **The measurement surface**: `tools/gate.mjs:89`'s lane entry, `tools/live/list-window.mjs`,
  `tools/live/list-window.json`, `src/views/list-window-harness.ts`, the list claims in
  `tools/live/replay.mjs`, `list` and `list-sparse` in `constructed-scenarios.mjs`, the list
  fixtures in `scenarios.mjs`, and `list-reservation.test.ts` / `list-row-contracts.test.ts`.
- **The source**: `src/views/list-renderer.ts` (1,173 lines), the list branch in
  `database-view.ts`'s renderer switch, and the list's use of `card-field-renderer.ts` — separated,
  not deleted, because the board and gallery cards share it.
- **The ratchet**: `tools/live/renderer-coverage.json`'s pinned inputs and its floor.
- **The manifest**: `screenshots/manifest.json`'s list captures, pruned rather than orphaned.

### Data Flow

Nothing at runtime. The only flow that matters is the order of removal within the change, and it is
measurements → source → ratchet → manifest.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Use this section when `research_intent=fix_bug`, when planning from a deep-review FAIL/CONDITIONAL verdict, or when any finding touches security, path handling, env precedence, schema boundaries, persistence, public responses, or shared policy.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `src/views/list-renderer.ts` | Producer: the view itself | Delete | `rg -n 'list-renderer' src tools` returns nothing |
| `src/views/card-field-renderer.ts` | Producer shared by list, board and gallery cards | Update — the list's use removed, the module kept | Board and gallery captures identical before and after |
| `src/views/database-view.ts` renderer switch | Consumer: routes `viewType` to a renderer | Update — the list branch removed | `tsc --noEmit` plus the union decision |
| `src/data/types.ts:317` `DatabaseViewType` | Policy: the persisted union | Update **only if** REQ-005's decision says so | The decision recorded with its reasoning |
| `tools/gate.mjs:89` | Consumer: the lane list | Update — entry removed, not skipped | The lane list read after the change |
| `tools/live/list-window.mjs`, `list-window.json`, `list-window-harness.ts` | The lane, its ratchet, its harness | Delete together | Files gone; gate exits 0 |
| `tools/live/renderer-coverage.json` | Policy: the ratchet, fails closed on a decrease | Update — pin removed, floor lowered, reason recorded beside the number | The diff shows the number and the reason in one commit |
| `tools/live/replay.mjs` | Consumer: recorded claims | Update — list claims removed | Claim count stated before and after |
| `tools/screenshots/scenarios.mjs`, `constructed-scenarios.mjs` | Producers of photographed states | Update — list fixtures and `list`/`list-sparse` removed | Scenario counts stated before and after |
| `screenshots/manifest.json` | Consumer: `screenshots-fresh` reads it | Update — list captures pruned, not orphaned | `screenshots-fresh` green |
| `styles.css` | Policy: the serialized lane | Update under a held lane | Recapture and a human PNG read on release |

Required inventories:
- Same-class producers: `rg -n '<field|string|helper|literal|error-pattern>' <module-or-files>`.
- Consumers of changed symbols: `rg -n '<changedSymbol>|<changedConstant>|<changedPublicField>' . --glob '*.ts' --glob '*.js' --glob '*.md'`.
- Matrix axes: list every independent input axis and the required rows before implementation.
- Algorithm invariant: for path/redaction/parser/resolver/security fixes, state the invariant and adversarial cases.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | The remaining specs still pass with the list specs gone; `tsc --noEmit` is clean | Vitest, tsc |
| Integration | `npm run gate` from the final state with the lane removed | `npm run gate`, `$?` read directly |
| Manual | The board and gallery cards compared on captures before and after | Captured PNGs read by hand |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `006-hide-and-migrate` shipped in a release | Internal | Red until it ships | Blocks — this is the irreversible step and it does not go first |
| `005-usage-and-migration-audit` enumeration | Internal | Red until it runs | Blocks — removal without it is a discovery process run against a red gate |
| `styles.css` serialized lane | Internal | Yellow — contended | Take once, release once |
| `030-gallery-view-deprecation` | Internal | Green — precedent in the tree | None |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the board or gallery cards change, `npm run gate` will not reach 0, or a vault that
  did not migrate cannot open.
- **Procedure**: revert the single removal commit. The lane, bench, fixtures and specs come back with
  the renderer because they were removed together — which is REQ-001's practical payoff, and the
  reason for insisting on one change rather than a sequence of tidy ones.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Setup) ──────┐
                      ├──► Phase 2 (Core) ──► Phase 3 (Verify)
Phase 1.5 (Config) ───┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core, Config |
| Config | Setup | Core |
| Core | Setup, Config | Verify |
| Verify | Core | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1 hour — read the audit, take the lane |
| Core Implementation | High | 6-9 hours, most of it the measurement surface rather than the renderer |
| Verification | Med | 3-4 hours: gate, captures, ratchet reasoning |
| **Total** | | **10-14 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] `006` is in a released build and observed migrating a real vault
- [ ] Feature flag — N/A. A deletion behind a flag is not a deletion; the reversibility here is the
      revert commit, and `006` is the flag-shaped step
- [ ] The renderer-coverage ratchet's new floor and its reason are written in the same commit that
      lowers it

### Rollback Procedure
1. Revert the single removal commit. Everything comes back together because it went out together.
2. Re-run `npm run gate` and read `$?` directly; the `list-window` lane should be present and green
   again rather than absent.
3. Recapture and read the changed PNGs before releasing the `styles.css` lane.
4. Tell the operator, because a reverted deprecation means a view they asked to retire is back.

### Data Reversal
- **Has data migrations?** No. `006` owns the only write; this phase deletes code.
- **Reversal procedure**: N/A for data. Views migrated by `006` stay tables regardless of what
  happens here, which is worth saying plainly rather than leaving a reader to assume the revert
  reaches them.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Phase 1   │────►│   Phase 2   │────►│   Phase 3   │
│   Setup     │     │    Core     │     │   Verify    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │  Phase 2b │
                    │  Parallel │
                    └───────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Measurement removal | `005` enumeration | A tree with no lane, claims, fixtures or specs naming the list | Source removal |
| Source removal | Measurement removal | No `list-renderer.ts`, no list branch | Ratchet, manifest |
| Ratchet floor | Source removal | A recorded floor with its reason | Verification |
| Manifest prune | Source removal | `screenshots-fresh` green | Verification |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **Measurement removal** - 3-4 hours - CRITICAL. It goes first so the gate is never green against a
   half-removed view.
2. **Source removal** - 3-4 hours - CRITICAL, including separating the list's use of
   `card-field-renderer.ts` without deleting the module.
3. **Ratchet and manifest** - 2-3 hours - CRITICAL. A lowered floor without its reason is the failure
   `030` already had once.

**Total Critical Path**: 8-11 hours.

**Parallel Opportunities**:
- The `DatabaseViewType` decision (REQ-005) can be written while measurement removal runs.
- The board and gallery baseline captures can be taken before anything is removed.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Measurements gone | No lane, claim, fixture or spec names the list; the gate is red only for the missing renderer | Early |
| M2 | Source gone | `rg -n 'list-renderer' src tools` returns nothing; `tsc --noEmit` clean | Mid |
| M3 | Gate green and honest | `npm run gate` exits 0 with the lane absent, the ratchet at its recorded floor, the manifest pruned | End |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: Does `list` leave `DatabaseViewType`?

**Status**: Accepted.

**Context**: `viewType` is persisted into vault files. `006` migrates on open, but a vault that never
opens keeps the value indefinitely. The gallery faced this and chose to keep the value accepted
while withdrawing it from every picker.

**Decision**: `list` **stays** on `DatabaseViewType`, as an accepted-but-redirected value, the same
shape the gallery already uses. `src/data/list-migration.ts` and `database-view.ts`'s /
`embedded-database-renderer.ts`'s `migrateListViewOnOpen` stay as the permanent coercion — not a
transitional shim to be removed later — so a vault that opens with `viewType: "list"` at any point
in the future still migrates cleanly rather than hitting an unhandled value. The render dispatch's
own fallback is explicit in effect: `migrateListViewOnOpen` runs before every render and flips an
un-migrated config's `viewType` to `"table"` before the table/board/gallery/chart/calendar/timeline
`if`-chain in `database-view.ts`'s `render()` is reached, so `"list"` never reaches that chain in the
normal path; a config that somehow still reads `"list"` at that point (a migration that threw and
rolled itself back, per the `catch` blocks in both `migrateListViewOnOpen` implementations) falls
through to the same `else` branch every other unrecognised/removed `viewType` would, which renders it
as a table — the same outcome the accepted decision names, reached deterministically rather than by
coincidence.

**Consequences**:
- Removing the value would have narrowed the type and let the compiler enforce the deprecation, at
  the cost of a hard break for any un-migrated vault (rejected below).
- Keeping it means `DatabaseViewType`, the CSS view-toggle class list, and a few label/lookup
  switches still name `"list"` indefinitely, exactly as they already do for `"gallery"`.

**Alternatives Rejected**:
- *Decide it in `006`*: rejected, because `006` must stay reversible and a union narrowing is not.
- *Remove `"list"` from `DatabaseViewType` now that `007` is the irreversible phase*: rejected. `006`
  ships a locale-complete migration and coercion path; narrowing the type here would strand any vault
  that has not yet opened since `006` shipped, and this phase's own precondition (a released `006`
  build actually observed migrating a real vault) was not confirmed before this phase ran — see T001.
  Removing the value now would compound an unconfirmed precondition with an irreversible one.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
