---
title: "Implementation Plan: Live Reports Roll-ups"
description: "Configuration-only plan to replace static Reports Income, Expenses, and Sales totals with display-only relation rollups in vault db_view YAML."
trigger_phrases:
  - "live reports rollups"
  - "reports db_view configuration"
  - "relation rollup sum"
  - "computed sync display-only"
  - "month relation report note"
  - "snapshot audit totals"
  - "icloud-safe rollups"
  - "expenses sales income rollup"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review to plan.md; status Planned"
    next_safe_action: "Build phase 001 per plan.md Phase 2 order"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Live Reports Roll-ups

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian vault markdown `database:` YAML; existing note-database plugin (no source edits) |
| **Framework** | Fork's relation-rollup engine — `count\|sum\|avg\|list`, display-only, forward-only from the row's own relation column (`Obsidian Plugin/src/data/RelationRollup.ts:70-78,99-128`; kind union at `types.ts:44`) |
| **Storage** | Personal finance vault Report / Expenses / Sales / Income `db_view` notes (exact paths UNKNOWN) |
| **Testing** | Manual vault verification: live SUM/COUNT vs temporary `list` inventory, Report file byte-equality after child edits, fork tree unmodified |

### Overview
Build this phase as **vault `database:` YAML only** — the highest-value Notion-parity win (Wave 0, effort S, value 5). The fork already implements the exact four rollup kinds Reports need as display-only derived values; Notion computes page rollups as a 4-tuple (relation + target property + calculate + format) at read time and never stores them in pages — the fork matches that model (`types.ts:69`: rollups are never written to frontmatter). The plan: (1) populate both halves of each relation pairing — Reports-side relation columns plus child Month links, because the fork resolves only forward from the Reports row's relation column and has no inverse resolver; (2) add Reports SUM/COUNT rollup columns bound to ops-confirmed keys; (3) pin `computedSyncMode=display-only` so Report notes are never rewritten on child edits (`DataSource.writeQueues` is per-path); (4) use a temporary `list` rollup beside each figure to inventory resolved children before trusting SUM/COUNT; (5) optionally keep `Snapshot*` copies of the old totals for audit. Saved stays static until a later Remaining/Saved computed-fields phase. Successor pack `002-rollup-aggregation-pack` owns the ~20 missing Notion calculate functions. Ranked source of truth: `research/synthesis.md`.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Live finance vault Reports, Expenses, Sales, and Income `db_view` notes located (paths currently UNKNOWN; halt if not found).
- [ ] Amount property keys confirmed by ops (currently UNKNOWN; do not guess — a wrong key silently yields an empty SUM). Gates SUM only; COUNT and the `list`/`file.name` proof may proceed without it.
- [ ] Rollup capability confirmed: kinds are exactly `count|sum|avg|list` (`types.ts:44`); no plugin work in scope.
- [ ] Operator decision recorded on keeping `Snapshot*` static copies beside live rollups (default yes).
- [ ] Reports-side relation wikilinks inventoried: present already, or to be bulk-filled this phase (vault script / Templater if many children). Child rows with empty Month vs malformed non-`[[...]]` values counted (`RelationLinks.ts:9-25`).

### Definition of Done
- [ ] Both halves of each relation pairing exist: Reports relation columns targeting Expenses/Sales/Income, and each child row's Month link pointing at its Report note.
- [ ] `computedSyncMode=display-only` is pinned in the YAML (first edit, independent of SUM); a child amount edit leaves Report note bytes unchanged.
- [ ] Reports `db_view` exposes COUNT of children and SUM rollups over related amounts, using ops-confirmed keys and existing rollup kinds only. SUM was bound only after COUNT + `list`/`file.name` proved resolution.
- [ ] A temporary `list` rollup (targetField `file.name`, not the amount key) visually confirmed the resolved-child set per figure, then was removed after SC-001 + no-write proof passed.
- [ ] No fork `src/` file differs because of this phase.
- [ ] Saved remains static or `Snapshot*`; no Remaining/Saved formula shipped.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Vault-configuration-only use of the fork's existing read-time rollup engine — configure it, do not reimplement it. No new isolated plugin module this phase (the `EuroFormat.ts` nl-NL leaf remains the isolated-diff model for later code phases; live cells already hit it with zero new call sites).

### Key Components

- **Core algorithm (already shipped)**: On each Reports view load, `buildRelationRollups` walks **Reports rows**, not children. Per rollup column it loads `rollupConfig.{relationField, targetField, aggregation}`, resolves the **Reports** relation's wikilinks via `parseRelationValues` → `metadataCache.getFirstLinkpathDest`, keeps paths present in `databaseById.get(targetDatabaseId).recordsByPath`, dedups via `seenPaths`, then `aggregateRollup`: `count` → record count; `list` → de-duped values; `sum`/`avg` → strict `toChartNumber` then sum or sum/numeric-count; empty numeric set → `null`; nested rollup targets → empty value (`RelationRollup.ts:43-49,64-66,69-75,99-128,159-160`). Output is `valuesByPath` only; consumers are `DatabaseView.calculateRelationRollups` (`DatabaseView.ts:3388-3399`) and `EmbeddedDatabaseRenderer`, with cells reading `row.computed[col.key]` (`CellRenderer.ts:656`). Forward-only resolution is why Reports-side relation columns are mandatory config here (`RelationRollup.ts:70-78`).

- **Child `db_view` notes (Expenses, Sales, Income)**: Month relation column with `targetDatabaseId` set to the Reports database id; each row wikilinks the Report note for that month. Notion names such as Reports.Expenses (R) describe the same pairing.

- **Reports `db_view` note**: Relation columns targeting the three child databases (reuse Notion names such as Expenses (R)); rollup columns `sum`/`count` against ops-confirmed amount keys; `computedSyncMode: display-only`; optional typed `Snapshot*` number/text columns holding screenshot-era totals.

- **`computedSyncMode=display-only`**: The fork default (`ComputedSync.ts:3`; load-time coerce at `DataSource.ts:787`; unknown modes coerce back to display-only). Under it the real early-returns that block write-back are `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834` (`!this.isAutomaticComputedSync()`) — `ComputedSync.ts:42-44` is `normalizeComputedSyncMode` only, not the early-return. Pin the YAML anyway so the view-config UI cannot be left on `automatic`. The only enqueue sites in the whole write topology are frontmatter mutations and view-config saves (`DataSource.ts:989-992`) — child amount edits queue the child path, never the Report path.

- **Do-not-bind surfaces**: footer `SummaryRenderer.ts` kinds `SUM`…`LATEST` (`SummaryRenderer.ts:19-22`) total the entire Reports view — the wrong question for a per-month Report note (`GroupDisplay.ts` has no per-group aggregation). Chart `median|min|max|range|percent-*` belong to chart aggregation, not relation rollups; naming them in rollup YAML silently falls through to sum (`RelationRollup.ts:123-128`).

- **EuroFormat seam (already live)**: `EuroFormat.ts:1-42` formats numbers/currency; rollup `count|sum|avg` map to `"number"` display type (`ColumnDisplay.ts:18-23`) and render through `formatEuroNumber` (`CellRenderer.ts:13,255-262,2575-2576`); footers use `formatEuroNumber2` (`SummaryRenderer.ts:7,551-556`). Euro-sign currency formatting does not apply to rollup cells (display type is hardcoded `"number"`), so accept nl-NL grouped numbers this phase. No patch to `ColumnDisplay.ts` (REQ-004).

- **Successor module (locked on paper, not built here)**: `src/data/Aggregate.ts` (successor `002-rollup-aggregation-pack` locked this path, not `RollupAggPack.ts`) — registry of `median|min|max|percent` reusing `toChartNumber`. Call sites for pack 002 only: widen `RollupConfig.aggregation` at `types.ts:44`; replace the sum/avg tail at `RelationRollup.ts:123-128` and delegate `emptyRollupValue` at `159-160`; append options and extend the numeric gate at `RelationRollupConfigModal.ts:137,168-176`. Follow Anytype's derive-at-render / no-persist pattern, not AppFlowy's recompute-and-store strings. This phase must not pre-create that file.

### Data Flow
Operator opens a Reports view. The engine reads each Report row's relation column frontmatter, resolves those wikilinks into target-database records, aggregates the configured target property, and renders results into `row.computed`. Because sync mode is display-only, nothing is written back: editing an Expenses note updates that note's file through its own path queue, the vault event coalesces within the 80ms debounce window (`DataSource.ts:1938-1998`), and the next Reports render shows a new SUM. Inverse relations are not derived in this phase.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Locate Reports, Expenses, Sales, and Income `db_view` notes in the live vault (paths UNKNOWN until found; halt if not found); inventory each note's `database:` YAML — database ids, relation column keys, current static totals, existing `targetDatabaseId` values.
- [ ] Inventory Reports frontmatter for populated Reports-side relation wikilinks (`[[...]]` arrays for Expenses (R) / Sales (R) / Income (R)); if absent, plan to bulk-fill them in Phase 2 (vault data, still in scope). Also count child rows with empty Month vs malformed non-`[[...]]` values — `parseRelationLink` accepts only a full-string `[[...]]`, so bare titles, paths, or Markdown links are dropped with the same empty UI as "no children" (`RelationLinks.ts:9-25`).
- [ ] Confirm amount property keys with ops; halt and record UNKNOWN rather than binding guesses. Note: this gates SUM only — COUNT and the `list`/`file.name` resolution proof can proceed without it.
- [ ] Capture current static totals (screenshot-era numbers) if `Snapshot*` columns will be kept (default yes).
- [ ] Confirm the fork still exposes only `count|sum|avg|list` and that this phase will not edit it.

### Phase 2: Core Implementation (final build plan order, `research/final-plan.md`)
- [ ] Populate both halves of each relation pairing: Reports-side relation columns targeting the three child databases plus each child row's Month link at its Report note (backlog #1 — gates every rollup; forward-only resolution needs both sides). If Setup inventory shows empty Reports-side links and many children, bulk-fill via a one-shot vault script / Templater pass writing `[[wikilink]]` arrays onto each Report note — still vault data, not fork `src/`. Effort S if already populated, M if bulk-fill needed.
- [ ] Verify child amount columns are typed `number`/currency so free text cannot enter SUM inputs (backlog #6; non-numeric values are dropped silently). Parallel with the relation wiring.
- [ ] Pin Reports `computedSyncMode=display-only` in the **first** YAML edit — independent of the SUM change-set because it is the iCloud P0 (backlog #3, promoted ahead of SUM). Pin the YAML so the view-config UI cannot be left on `automatic`.
- [ ] Add Reports COUNT rollups of related children plus a temporary diagnostic `list` rollup beside each of the three relations, with `targetField: file.name` (NOT the amount key). COUNT short-circuits before field lookup, so this resolution proof is unblocked after the relation wiring and is NOT blocked on ops keys. The `list` must target `file.name` (or another unique identity field): `list` dedupes via `stringifyValue`, so reusing the SUM amount field would collapse two children with the same amount into one entry — a false inventory. Do not name `median|min|max|range` in YAML (unknown id → sum).
- [ ] Bind Reports SUM rollups to ops-confirmed amount keys for Expenses / Sales / Income (backlog #2, gated). If COUNT > 0 and SUM is empty, the amount key is wrong — fix YAML, do not patch the fork. This is the cheap silent-SUM detector.
- [ ] Optionally add `Snapshot*` columns populated with the captured static totals, including Saved (backlog #5). Parallel with the COUNT/list and SUM steps; default yes.
- [ ] Leave Saved live-computation, inverse relations, and all fork source untouched.

### Phase 3: Verification
- [ ] SC-001 accuracy: compare on-screen Report Income/Expenses/Sales rollups to a manual SUM of related children and cross-check against the temporary `list`/`file.name` inventories of resolved children. Three figures must match; a zero-child Report is not deleted.
- [ ] Edit one child amount; confirm the rollup updates (≤80ms coalesce) and the Report note file bytes are identical after the save (SC-002 byte-equality proof, deps: display-only pin + SUM bound).
- [ ] Confirm edge behavior (CHK-022): empty Month link omitted from SUM/COUNT (SUM empty placeholder, COUNT `0` — do not read SUM-empty as `0`), duplicate wikilinks counted once via `seenPaths`, two relation columns over the same children counted independently, nested rollup target empty, Saved still static or `Snapshot*`.
- [ ] Record the benign-write runbook entry: residual Report-file writes are one-time startup migrations and user-initiated view-config saves only — neither is a rollup recompute. Include the ≤80ms refresh coalescing expectation.
- [ ] Remove the diagnostic `list` columns (after SC-001 + no-write proof pass — do not remove them at the same moment SUM is added); SUM/COUNT must remain.
- [ ] Confirm the fork working tree has no this-phase diffs. Successor handoff (one line, not a checkbox): successor `002-rollup-aggregation-pack` locked `src/data/Aggregate.ts`, not `RollupAggPack.ts`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Live rollup accuracy | One Report note with known related rows | Obsidian view; manual SUM compared to on-screen rollups |
| Resolved-child inventory | Each new rollup column before trust | Temporary `list` rollup beside the figure (the fork raises no Notice on unresolved targets, so this is the only in-product check) |
| No-write proof (iCloud) | Report note bytes/mtime before and after a child amount edit | Read the Report file from disk after the child save; expect byte-equality under display-only |
| Negative relation | Child row with empty Month link | Reports view; row omitted from SUM/COUNT without errors |
| Wrong-target probe | Rollup column pointed at a wrong `targetDatabaseId` | Expect silent empty value (`getTarget` null) — confirms the failure mode documented in the runbook, then fix YAML |
| Mobile smoke | Same vault opened in Obsidian mobile | Rollups compute/render identically; no desktop-only APIs involved |
| Scope lock | Fork source tree | Diff must stay clean of this work |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Rollup kinds `count\|sum\|avg\|list` (`types.ts:44`) | Internal (fork, read-only) | Green (line-verified in research) | Cannot deliver live totals without new plugin work, which is out of scope |
| Forward-only relation resolution (`RelationRollup.ts:70-78`) | Internal constraint | Confirmed | Reports-side relation columns become mandatory; child links alone will not fill figures |
| Child Month links + Reports `targetDatabaseId` | Vault config | Not started | Rollups render empty/zero indistinguishably from "no children" |
| Live amount property keys (ops) | Operator input | UNKNOWN / open question | Binding the wrong key silently sums nothing plausible-looking |
| `computedSyncMode=display-only` | Vault config | Not started | `automatic` would enqueue computed write-backs; iCloud churn |
| Successor `002-rollup-aggregation-pack` | Later phase | Planned, not a blocker | Must not use rollup kinds the pack has not shipped |
| Remaining/Saved computed fields | Later phase | Planned, not in scope | Saved stays static here on purpose |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Live rollups show wrong figures, Report notes start rewriting on child edits, or vault views fail to load after `database:` YAML edits.
- **Procedure**: Restore the previous `database:` YAML on Reports and child `db_view` notes (backup copy taken in Setup). If `Snapshot*` columns were added, they already hold the screenshot-era totals; Reports figures can be read from those columns while live rollups are removed. Do not roll back by editing fork source — this phase must not have changed it. Distinguish benign writes during triage: one-time startup migrations and user-initiated view-config saves rewrite parent files legitimately and are not display-only violations.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup (ops keys gate SUM binding specifically; COUNT + `list`/`file.name` proof and the display-only pin do not wait on ops keys) | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 30 minutes (locate notes, confirm keys with ops, capture static totals, count malformed Month links) |
| Core Implementation | Low–Medium | 90 minutes if both relation sides already linked; **M (unknown)** if Reports-side links are empty and per-child `[[wikilink]]` transcription onto Report rows is needed — size is UNKNOWN until Setup counts rows. Bulk-fill via vault script / Templater, not fork `src/`. |
| Verification | Low | 30 minutes (manual SUM check, `list`/`file.name` cross-check, byte-equality no-write proof, remove diagnostic lists, fork-clean check) |
| **Total** | | **2.5 hours (effort S) only if both sides already linked; M if Reports-side must be bulk-filled. Do not treat 2.5h as a contract until Setup row counts exist.** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup copies of current Reports, Expenses, Sales, and Income `database:` YAML captured.
- [ ] Current static Income/Expenses/Sales/Saved values recorded for `Snapshot*` or restore.
- [ ] Amount property keys confirmed by ops or work halted as UNKNOWN.
- [ ] Fork tree confirmed clean before any vault edit (so a dirty fork is not blamed on this phase).

### Rollback Procedure
1. Replace edited `db_view` notes' `database:` blocks with the Setup backups.
2. Reload the Reports view; confirm static screenshot-era figures (or `Snapshot*` values) are visible again.
3. Confirm Report notes are not being rewritten on child edits after restore.
4. Confirm the fork tree is still unmodified.

### Data Reversal
- **Has data migrations?** No plugin schema migration. Vault YAML, per-row Month relation wikilinks, and optional `Snapshot*` columns are the only mutations.
- **Reversal procedure**: Restore YAML backups; remove Month wikilinks and Reports-side relation entries only where this phase created them (do not delete unrelated relations). `Snapshot*` columns can remain as inert audit fields or be deleted as part of the YAML restore.

### Ongoing Maintenance Runbook (bidirectional drift)
- Until later inverse-relations plugin work ships, every new child must be added on **both** the child Month field and the matching Report relation column — each as a `[[wikilink]]`. The fork has no inverse resolver, so a child Month link alone will not fill the Report rollup (`RelationRollup.ts:70-78`). Treating pairing as a one-shot Setup task lets live SUMs silently rot after go-live. Record this rule in the vault runbook alongside the benign-write note so audits catch a drifting Report figure as a data-entry gap, not a plugin bug.

<!-- /ANCHOR:enhanced-rollback -->
