---
title: "Tasks: Live Reports Roll-ups"
description: "Ranked backlog as ordered tasks: wire both relation sides, add SUM/COUNT rollups with display-only pin, verify iCloud-safe no-write behavior."
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
    packet_pointer: "001-note-db-notion-parity-build/001-live-reports-rollups"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review to tasks.md; status Planned"
    next_safe_action: "Build phase 001 per tasks.md order"
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
# Tasks: Live Reports Roll-ups

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] [B?] Description (target — fork file:line or vault config) [effort tier]`

Effort tiers: S = small, M = medium, L = large. Fork file:line targets cite the read-only capability surface from `research/synthesis.md`; tasks marked "(fork files: none)" mutate only vault `database:` YAML and wikilinks.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Locate Reports, Expenses, Sales, and Income `db_view` notes (paths UNKNOWN — do not invent; halt if not found) and inventory each `database:` YAML: database ids, relation column keys, existing `targetDatabaseId`, static Income/Expenses/Sales/Saved values, and whether Report frontmatter already holds `[[wikilink]]` arrays for Expenses (R) / Sales (R) / Income (R). Also count child rows with empty Month vs malformed non-`[[...]]` values — `parseRelationLink` accepts only a full-string `[[...]]`, so bare titles, paths, or Markdown links are dropped with the same empty UI as "no children" (`Obsidian Plugin/src/data/RelationLinks.ts:9-25`). Effort **S** (inventory) / **M** if hundreds of rows need transcription — size is UNKNOWN until this task counts rows (live finance vault) [S/M]
- [ ] T002 [P] Confirm live currency/amount property keys with ops before binding SUM; halt and record UNKNOWN if unconfirmed — a guessed key yields a plausible empty SUM. This gates **SUM only**; COUNT and the `list`/`file.name` resolution proof can proceed without it (vault property schema — fork files: none) [S]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Reordered to the final build plan (`research/final-plan.md`): display-only is pinned first (independent iCloud P0), then the COUNT + `list`/`file.name` resolution proof runs unblocked, and only then is SUM bound to ops-confirmed keys.

- [ ] T003 Populate both halves of each relation pairing: add Reports relation columns targeting Expenses/Sales/Income (reuse Notion names such as Expenses (R)) and point each child row's Month link at its Report note. The fork rolls up only forward from `sourceRecord.frontmatter[relation.key]` with no inverse resolver (`Obsidian Plugin/src/data/RelationRollup.ts:70-78`) — gates every rollup. If T001 shows empty Reports-side links and more than a handful of children, bulk-fill via a one-shot vault script / Templater pass that writes `[[wikilink]]` arrays onto each Report note — still vault data, not fork `src/`. Effort **S** if already populated; **M** if bulk-fill needed (Reports + child `db_view` markdown `database:` config and per-row wikilinks — fork files: none) [S/M]
- [ ] T004 [P] Verify child amount columns are typed `number`/currency so free text cannot enter SUM inputs — non-numeric values are silently dropped and AVG divides by numeric-count only (`Obsidian Plugin/src/data/ChartAggregation.ts:191-198`) (child `db_view` schema — fork files: none) [S]
- [ ] T005 Pin Reports `computedSyncMode=display-only` in the **first** YAML edit — independent of the SUM change-set because it is the iCloud P0. The fork default is display-only (`ComputedSync.ts:3`; load-time coerce at `DataSource.ts:787`); the real early-returns that block write-back under display-only are `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834` (`!this.isAutomaticComputedSync()`). Pin the YAML anyway so the view-config UI cannot be left on `automatic` (Reports `db_view` markdown `database:` config — fork files: none) [S]
- [ ] T006 Add Reports COUNT rollups of related children plus a temporary diagnostic `list` rollup beside each of the three relations, with `targetField: file.name` (NOT the amount key). COUNT short-circuits to record count before any field lookup (`RelationRollup.ts:99`), so this resolution proof is unblocked after T003 and is NOT blocked on ops keys. The `list` MUST target `file.name` (or another unique identity field): `list` dedupes via `stringifyValue` (`RelationRollup.ts:110-119`), so reusing the SUM amount field would collapse two children with the same amount into one entry — a false inventory. Do not name `median|min|max|range` in YAML (unknown id → sum at `RelationRollup.ts:126-128`). Accept: COUNT equals the unique resolved children in the `list`; an empty Report shows COUNT `0` and a SUM-to-come empty placeholder, not a crash (`RelationRollup.ts:159-160`). Modal `file.name` path at `RelationRollupConfigModal.ts:146-147` (Reports `db_view` markdown `database:` config — fork files: none) [S]
- [ ] T007 [B→T002 ops keys + T006 resolution proof] Bind Reports SUM rollups to ops-confirmed amount keys for Expenses / Sales / Income (`RelationRollup.ts:123-128`). SUM aggregates through strict `toChartNumber`; unknown kind ids fall through to sum. If COUNT > 0 and SUM is empty, the amount key is wrong — fix the YAML, do not patch the fork. This is the cheap silent-SUM detector the synthesis wanted (Reports `db_view` markdown `database:` config — fork files: none) [S]
- [ ] T008 [P] Optionally add `Snapshot*` columns holding captured screenshot-era Income/Expenses/Sales/Saved totals beside live rollups for audit (operator decision, default yes; Saved stays non-live per REQ-006). Run in parallel with T006–T007 after Setup has captured the static totals (Reports `db_view` markdown `database:` config — fork files: none) [S]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Go-Live Proof
- [ ] T009 No-write proof and benign-write runbook (deps: T005 display-only + T007 SUM): snapshot the Report note's bytes/mtime, edit one related child amount, confirm the rollup updates on screen (≤80ms coalesce, `DataSource.ts:1938-1998`) and Report bytes are unchanged; document that residual Report-file writes are one-time startup migrations and user-initiated view-config saves only (`Obsidian Plugin/src/data/types.ts:69`, `DataSource.ts:989-992`) (live vault + runbook entry — fork files: none) [S]

### Manual Verification
- [ ] T010 SC-001 accuracy: compare on-screen Report Income/Expenses/Sales rollups to a manual SUM of related children and cross-check against T006's temporary `list`/`file.name` inventories of resolved children (`CellRenderer.ts:656` reads `row.computed[col.key]`; consumers `DatabaseView.ts:3388-3399`, `EmbeddedDatabaseRenderer.ts:3198-3209`). Three figures must match; a zero-child Report is not deleted (Reports view) [S]
- [ ] T011 Confirm edge behavior (CHK-022): empty Month link omitted from SUM/COUNT (SUM empty placeholder, COUNT `0` — do not read SUM-empty as `0`), duplicate `[[wikilink]]` counted once via `seenPaths` (`RelationRollup.ts:69-75`), two relation columns over the same children counted independently, nested rollup target stays empty (`RelationRollup.ts:101`), Saved still static or `Snapshot*` (Reports view) [S]

### Cleanup & Scope Lock
- [ ] T012 Remove the diagnostic `list` columns (after T010–T011 pass — do not remove them at the same moment SUM is added) and confirm the fork working tree has no this-phase source diffs. SUM/COUNT must remain after the lists are gone. Successor handoff (one line, not an executable checkbox): successor `002-rollup-aggregation-pack` locked `src/data/Aggregate.ts` — not `RollupAggPack.ts`; this phase must not pre-create that file (Reports `db_view` + fork tree — fork files: none) [S]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All executable tasks marked `[x]`.
- [ ] No executable successor-pack task remains in this phase — the `RollupAggPack`/`Aggregate.ts` handoff is a one-line note in T012, not a checkbox (REQ-004).
- [ ] Strict validation passed.
- [ ] Checklist.md fully verified.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md` · `research/research.md`

<!-- /ANCHOR:cross-refs -->
