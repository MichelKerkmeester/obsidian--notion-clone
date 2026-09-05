---
title: "Implementation Plan: Gallery Settings Redirect and Migration"
description: "Close the minting surfaces first, then make the migration symmetric across both hosts, each change observed red before green and released before anything is deleted."
trigger_phrases:
  - "implementation plan"
  - "gallery redirect plan"
  - "007 phase 2 plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Gallery Settings Redirect and Migration

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None — esbuild bundle |
| **Storage** | Vault markdown frontmatter and plugin settings JSON; `viewType` is persisted |
| **Testing** | Vitest units, `npm run gate` (25 lanes) |

### Overview

One small edit closes the remaining minting surface: the sanitizer stops exempting `gallery`. The
`.base` importer was the other candidate and already lands a `cards` view on `board`
(`main.ts:1577`), so this phase pins it with a regression test rather than changing it. One larger
question decides the rest — whether the embedded codeblock host gains the migration call it has
never had. The migration function itself
already exists and already targets board; it changes only if `001`'s declared-loss list says it drops
something it should carry.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] `001`'s surface list has landed, and this phase's REQ set is written from it
- [ ] `001`'s declared-loss list has landed, so the migration knows what it must carry
- [ ] `030`'s existing migration and its single call site are read, not assumed

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Every closed surface has a test observed red before green
- [ ] `npm run gate` exits 0 read from `$?`, never through a pipe
- [ ] The build is **released**, which is what unblocks `003`
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Withdraw-then-migrate, `030`'s own pattern, completed. The withdrawal half already shipped; this is
the part that closes the remaining doors and makes the migration reach both hosts.

### Key Components

- **`main.ts` sanitizer** (`:146`, `:182`): today `if (v.viewType !== "board" && v.viewType !== "gallery" && v.viewType !== "chart") v.viewType = "table"`. Removing the gallery clause makes a loaded
  gallery coerce, which is a second safety net under the migration rather than a replacement for it.
- **`main.ts` `.base` importer** (`:1571-1641`): **already lands `cards` on `board`** at `:1577`,
  carrying an image field through a schema guard at `:1580` onto `view.boardImageField` at `:1641`.
  Verified and pinned here, not changed. Its locals are still gallery-named, which is legibility
  rather than behaviour.
- **`gallery-migration.ts`**: pure, takes a view and returns what to write. Unchanged unless `001`
  says it drops something.
- **`database-view.ts:2718`/`:11669`**: the one existing call site.
- **`embedded-database-renderer.ts`**: the host with no call site. REQ-004's subject.

### Data Flow

Settings load → sanitizer → parsed `ViewConfig` → host opens → migration runs once → write → render.
The `.base` import path enters the same flow one step earlier, at creation.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `main.ts:146`, `:182` | Re-blesses `gallery` on settings load | update | A unit asserting a loaded gallery coerces |
| `main.ts:1571-1641` | **Already lands a `cards` view on `board`** (`:1577`) | unchanged — verified and pinned | A regression unit importing a `.base` `cards` view and asserting `board`, so a later edit cannot silently reintroduce the gallery landing |
| `gallery-migration.ts` | Decides what a gallery becomes | update only if `001` says so | Its existing spec plus any new loss case |
| `database-view.ts:11678` | The one migration call site | unchanged | `rg -n applyGalleryMigration src` still finds it |
| `embedded-database-renderer.ts` | Renders a gallery, never migrates it | update, or a recorded decision against | REQ-004's ADR |
| `toolbar-renderer.ts:97`, `view-config-panel-renderer.ts:515` | Already filter gallery from the pickers | unchanged | Verified, not re-implemented |
| `i18n.ts:1456`, `:392` | `notice.galleryMigrated`, `undo.galleryMigration` in three locales | unchanged | Reused rather than rewritten |

Required inventories:
- Same-class producers: `rg -n 'viewType.*=.*"gallery"|viewType !== "gallery"' src`.
- Consumers of changed symbols: `rg -n 'applyGalleryMigration|planGalleryMigration' . --glob '*.ts'`.
- Matrix axes: host (standalone, codeblock) × entry (sanitizer, importer, existing view) × cover
  (present, absent). Twelve rows; the ones that matter are the four with an existing view.
- Algorithm invariant: **migrating twice is a no-op.** After the first run the view is a board, so
  the second call has nothing to do. A notice that fires twice means the write did not land.
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
| Unit | The sanitizer coercion, the importer landing, migrate-twice-is-a-no-op, cover carry-over | Vitest |
| Integration | A view opened in each host, asserting the notice fires once | Vitest with the DOM shim |
| Manual | The operator opening a vault that had a gallery | Obsidian on device — and it is `004`'s row, not this phase's |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001`'s surface list | Internal | Red until `001` lands | This phase's REQ set is unwritable without it |
| `001`'s declared-loss list | Internal | Red until `001` lands | The migration cannot know what it must carry |
| A release cut | External | Yellow | `003` stays blocked; that is D8 working as intended |
| `046`'s ADR-001, as precedent for the embed-write question | Internal | Green | None — advisory reading for REQ-004 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a migrated view loses data, or the notice fires repeatedly.
- **Procedure**: revert the migration commit. The renderer is still present in this phase, so a
  reverted build renders galleries again rather than coercing them to a table. That property is the
  whole reason `003` waits for a release.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
001 Audit ──► 002 Redirect+Migrate ──► [release] ──► 003 Remove ──► 004 Docs+Release
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 001 Audit | None | 002, 003, 004 |
| 002 Redirect+Migrate | 001 | 003 |
| 003 Remove | 002 shipped in a release | 004 |
| 004 Docs+Release | 003 | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | Read `001`'s lists; under an hour |
| Core Implementation | Medium | The two surface closures are small; the embedded-host decision is most of the time. 3-6 hours |
| Verification | Medium | Red-before-green on each surface plus the gate. 1-2 hours |
| **Total** | | **5-9 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] A vault snapshot exists before the migration is exercised against real data
- [ ] No feature flag — the migration is unconditional by design, the way `030`'s already is
- [ ] `npm run gate` green, read from `$?`

### Rollback Procedure
1. Revert the migration commit.
2. Redeploy the previous build; galleries render again because the renderer is still present.
3. Confirm a previously migrated view still opens — as a board, since its `viewType` was written.
4. Tell the operator, because a migrated view does not un-migrate on rollback.

### Data Reversal
- **Has data migrations?** Yes — `viewType` and the cover field are rewritten.
- **Reversal procedure**: per view, the in-app undo (`undo.galleryMigration`, `i18n.ts:392`).
  There is no bulk reversal, and `004`'s CHANGELOG must say so.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Sanitizer   │────►│  Migration   │────►│   Release    │
│  + importer  │     │  both hosts  │     │   ships it   │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
 ┌─────▼──────────┐
 │  Red-before-   │
 │  green tests   │
 └────────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Sanitizer closure | `001` surface list | No gallery survives a settings load | The release |
| Importer closure | `001` surface list | No `.base` import mints one | The release |
| Migration symmetry | `001` loss list, REQ-004's ADR | Both hosts migrate, or one does knowingly | The release |
| Release | All three | The precondition D8 names | `003` |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **`001` lands** - blocking - CRITICAL
2. **Sanitizer and importer closed, red-before-green** - 2-3 hours - CRITICAL
3. **The embedded-host decision, taken and recorded** - 1-3 hours - CRITICAL
4. **Release cut** - orchestrator's - CRITICAL

**Total Critical Path**: 5-9 hours of work plus one release boundary

**Parallel Opportunities**:
- The sanitizer and the importer closures are independent of each other.
- The migration's own unit cases can be written while the embedded-host decision is open.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Nothing mints a gallery | Every surface `001` named refuses it, each proven red-first | Phase 2 |
| M2 | Nothing still is a gallery | A configured view opens as a board with its cover, once, with a notice | Phase 2 |
| M3 | It shipped | A released version number carries both | Phase 2, and it is what unblocks `003` |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: The embedded codeblock host

**Status**: Proposed

**Context**: `applyGalleryMigration` has one call site, in `database-view.ts`. A gallery-configured
codeblock embed renders unmigrated. `030` shipped this asymmetry; `006` inherited and recorded it.

**Decision**: to be taken in this phase. The options are to add the call, or to ship the same partial
state with the reason written down. `046-linked-views-notion-parity`'s ADR-001 — the operator allowed
an embed to write to its source database — is the nearest precedent and removes the strongest
argument against adding the call.

**Consequences**:
- Adding it: a reading-view render writes vault settings. The operator has already permitted that
  class of write for linked views.
- Not adding it: a codeblock gallery survives the deletion in `003` and coerces to a table, which is
  the exact outcome the whole withdraw-then-migrate order exists to prevent.

**Alternatives Rejected**:
- **Deciding it in `003`**: too late. By then the renderer is going and the window to migrate is
  closed.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
