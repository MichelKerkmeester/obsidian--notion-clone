---
title: "Feature Specification: Live Reports Roll-ups"
description: "Make Reports Income, Expenses, and Sales figures live via existing relation rollups and vault db_view configuration, with no plugin code changes."
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
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored from synthesis and final-plan"
    next_safe_action: "Build 001-reports-relation-wiring per its plan.md and tasks.md"
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
# Feature Specification: Live Reports Roll-ups

> Predecessor: none (first phase). Successor: `002-rollup-aggregation-pack`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-24 |
| **Branch** | `001-live-reports-rollups` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The four Reports figures (Income, Expenses, Sales, Saved) are static numbers typed into Report notes to match Notion screenshots during the earlier Bases migration. Child Expenses, Sales, and Income rows therefore do not drive Report totals: editing an amount leaves the Report figures unchanged. Research confirmed the fork already implements exactly the four rollup kinds Reports need — `count | sum | avg | list` — as display-only derived values (`Obsidian Plugin/src/data/RelationRollup.ts`, kinds enumerated at `types.ts:44`; compute tail `RelationRollup.ts:99-128`). Two structural facts shape this phase. First, rollups resolve only **forward** from the Reports row's own relation column (`sourceRecord.frontmatter[relation.key]`, `RelationRollup.ts:70-78`) — the fork has no backlink/inverse resolver, so child-side Month links alone will not fill Report figures. Second, the single biggest failure mode is a **silent empty SUM**: a wrong amount-property key or an empty/mis-targeted relation is indistinguishable in the UI from "no children" (`emptyRollupValue` yields COUNT `0`, SUM `null`, `RelationRollup.ts:159-160`). The gap is vault configuration, not missing plugin code. Full ranked findings: `research/synthesis.md` (decision-ready) and `research/research.md` (evidence trail).

### Purpose
Populate Reports-side relation columns (and the child Month links they pair with), then bind Reports `db_view` rollup columns that SUM related Expenses/Sales/Income amounts and COUNT related children using only existing rollup kinds, pinned to `computedSyncMode=display-only` so Report note files are never rewritten when a child row is edited (iCloud-safe: `DataSource.writeQueues` is per-path, `DataSource.ts:88-120`). Optionally keep `Snapshot*` static copies of the old typed totals beside the live rollups for audit. Saved stays a static or snapshot figure until a later Remaining/Saved computed-fields phase. This phase touches vault `database:` YAML only — no new `src/` module, no fork TypeScript — and unblocks later Remaining/Saved computed fields and derived inverse relations. Wave 0, effort S, value 5. Nested children own the ordered slices: Reports-side relation wiring, display-only plus amount types, COUNT plus diagnostic list, gated SUM, Snapshot audit columns, then go-live no-write proof.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Populate both halves of each relation pairing: Reports-side relation columns targeting the Expenses, Sales, and Income databases (reusing Notion names such as Expenses (R)), and each child row's Month link pointing at its Report note. Notion exposes both directions; the fork rolls up only forward (`RelationRollup.ts:70-78`). If Setup inventory shows empty Reports-side links and many children, bulk-fill via a one-shot vault script / Templater pass writing `[[wikilink]]` arrays onto each Report note — still vault data, not fork `src/`.
- Add Reports `db_view` rollup columns using only existing kinds: COUNT of related children (unblocked once relations exist), then SUM over related Expenses cost, Sales gross, and Income net (ops-confirmed YAML keys, gated after the COUNT + `list`/`file.name` resolution proof). Do not put median/min/max or other chart/footer kinds into rollup YAML — an unknown id silently falls through to sum (`RelationRollup.ts:123-128`).
- Set Reports `computedSyncMode=display-only` (the fork default, `ComputedSync.ts:3`; load-time coerce at `DataSource.ts:787`; real write-back early-returns at `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834`) so rollup results render in the view and never write back into Report note files. Pin the YAML so the view-config UI cannot be left on `automatic`.
- Temporarily add a `list` rollup beside each SUM/COUNT to inventory resolved children, then remove it after SC-001 + no-write proof pass — the only in-product check against the silent-empty-SUM failure mode (no Notice exists on unresolved targets, `RelationRollup.ts:64-66,159-160`). The `list` `targetField` MUST be `file.name` (or another unique identity field), not the amount key: `list` dedupes via `stringifyValue` (`RelationRollup.ts:110-119`), so reusing the SUM amount field would collapse two children with the same amount into one entry — a false inventory.
- Optionally add `Snapshot*` columns keeping the previously typed static Income/Expenses/Sales/Saved totals beside the live rollups for audit.
- Confirm with ops the live vault currency/amount property keys before binding any rollup `property` field; record UNKNOWN rather than guessing.
- Touch only Reports and children `db_view` markdown `database:` config (relation `targetDatabaseId` and rollup column defs) plus per-row relation wikilinks.

### Out of Scope
- Any edit to plugin TypeScript under the fork's `src/` — no new module, no new rollup kinds, no formula-engine work. Adding ~20 missing Notion calculate functions (median/min/max/range/percent_*/count_values/show_unique/date-range/checkbox variants) belongs to successor `002-rollup-aggregation-pack`.
- Saved as a live computed field (Remaining/Saved formulas land in a later phase).
- Derived inverse relations (a later phase). Native Excel-style computed-field formulas and Bases method-chaining on Report notes.
- Binding footer `SummaryRenderer.ts` kinds (`SUM`…`LATEST`, `SummaryRenderer.ts:19-22`) or chart `median|min|max|range|percent-*` as if they were relation rollups — a footer SUM totals all months' rows, which answers the wrong question for a per-month Report note (`GroupDisplay.ts` has no per-group aggregation).
- Record templates, conditional formatting, new view types, filters, telemetry, secrets, or desktop-only APIs.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Live finance vault Reports `db_view` note `database:` YAML (exact path UNKNOWN) | Modify | Add SUM/COUNT rollup column defs bound to ops-confirmed keys; set `computedSyncMode=display-only`; optionally add `Snapshot*` static total columns beside live rollups |
| Live finance vault Expenses `db_view` note `database:` YAML (exact path UNKNOWN) | Modify | Ensure Month relation `targetDatabaseId` points at Reports; each Expenses row links to its Report note |
| Live finance vault Sales `db_view` note `database:` YAML (exact path UNKNOWN) | Modify | Same Month relation target and per-row Report link as Expenses |
| Live finance vault Income `db_view` note `database:` YAML (exact path UNKNOWN) | Modify | Same Month relation target and per-row Report link as Expenses |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Reports-side relations populated, child Month links paired | Every in-scope Expenses, Sales, and Income row's Month relation points at the matching Report note, and the Reports database carries relation columns targeting those three child databases (Notion bidirectional names such as Expenses (R) reused). Forward-only resolution makes both sides required: the fork reads `sourceRecord.frontmatter[relation.key]` on the Reports row (`RelationRollup.ts:70-78`) and has no inverse resolver. |
| REQ-002 | Reports live SUM and COUNT rollups | Reports `db_view` defines rollup columns that SUM related Expenses/Sales/Income amounts and COUNT related children. Column defs use only existing kinds `count`, `sum`, `avg`, `list` (`types.ts:44`); amount `property` fields use the live vault keys confirmed by ops, not invented names. COUNT short-circuits before field lookup and SUM aggregates through strict `toChartNumber` (`RelationRollup.ts:99-128`). SUM is bound only after COUNT + a `list`/`file.name` resolution proof confirms the relation resolves; if COUNT > 0 and SUM is empty, the amount key is wrong (fix YAML, do not patch the fork). |
| REQ-003 | Display-only sync (iCloud-safe) | Reports `computedSyncMode=display-only`. Editing a related child amount updates the on-screen Report rollup and does not rewrite the Report note file (`DataSource.writeQueues` remains per-path, `DataSource.ts:88-120`; the Report path is never enqueued by rollup recomputation — the only enqueue sites are frontmatter mutations and view-config saves, `DataSource.ts:989-992`). |
| REQ-004 | Configuration only; no plugin code | No fork `src/` file changes. Only vault `db_view` markdown `database:` YAML and per-row relation wikilinks are edited. EuroFormat is already the isolated display seam live cells use (`EuroFormat.ts:1-42`; rollup `count|sum|avg` map to `"number"` display type in `ColumnDisplay.ts:18-23`), so no display-code work exists here either. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Optional Snapshot audit copies | If kept (operator decision; default yes), `Snapshot*` columns on Reports retain the previously typed static Income/Expenses/Sales/Saved totals beside the live rollups so screenshot-era numbers remain auditable when live figures diverge. |
| REQ-006 | Saved remains non-live this phase | The Saved figure stays a static typed value or a `Snapshot*` copy. No Saved rollup and no Remaining/Saved formula is introduced here. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Opening a Reports table/board/list view shows Income, Expenses, and Sales figures equal to the SUM of related child amounts (using the live vault property keys) plus a COUNT of related children. A temporary `list` rollup with `targetField: file.name` has visually confirmed the resolved-child set for each figure before this is declared; the `list` columns are removed only after SC-001 + SC-002 both pass.
- **SC-002**: Changing one related child's amount updates the matching Report rollup in the UI while the Report note file's bytes remain identical (byte-equality check after the child save). Benign Report-file writes outside this contract — one-time startup migrations and user-initiated view-config saves (`DataSource.ts:989-992`) — are documented in the runbook, not treated as violations.
- **SC-003**: No fork `src/` file differs from its pre-phase state because of this phase's work.
- **SC-004**: Saved is still the static or `Snapshot*` value; Remaining/Saved computed fields are not implemented.
- **SC-005**: Mobile-safe, MIT-forkable, no telemetry, no secrets; this phase adds no desktop-only APIs because it adds no plugin code (the sole `require("electron")` in the fork is export-only, outside the rollup path).

### Acceptance Scenarios

- **Scenario 1**: **Given** Expenses/Sales/Income rows carry Month relations pointing at a Report note and Reports holds matching relation columns, **when** the Reports `db_view` loads, **then** SUM rollups match the related children's amounts and COUNT matches the related row count.
- **Scenario 2**: **Given** `computedSyncMode=display-only`, **when** a related child amount (live key UNKNOWN until ops confirms) is edited, **then** the Report rollup updates on screen and the Report note file is not rewritten.
- **Scenario 3**: **Given** a child row with an empty Month relation, **when** Reports rollups compute, **then** that row is omitted from SUM and COUNT rather than crashing the view; COUNT shows `0` while SUM shows an empty placeholder, not `0` (`emptyRollupValue`, `RelationRollup.ts:159-160`).
- **Scenario 4**: **Given** `Snapshot*` columns are present, **when** live rollups diverge from screenshot-era totals, **then** both the live figure and the snapshot figure remain visible for audit.
- **Scenario 5**: **Given** this phase is implemented, **when** the fork tree is inspected, **then** no `src/` files have changed.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Existing rollup kinds `count\|sum\|avg\|list` (`types.ts:44`) | Phase cannot invent new kinds; wrong kind silently falls through to sum (`RelationRollup.ts:123-128`) | Bind only `sum` and `count` (+ temporary `list` diagnostics); never name median/min/max/range in rollup YAML |
| Dependency | Forward-only relation resolution | Child-side Month links alone will not fill Report figures; the fork has no backlink/inverse resolver (`RelationRollup.ts:70-78`) | Populate Reports-side relation columns as part of this phase; do not wait for derived-inverse plugin work |
| Dependency | Live vault amount property keys (ops) | A wrong key degrades silently to empty SUM — plausible-looking zeros, no error surface | Halt and ask ops; write UNKNOWN rather than guess; do not copy Notion screenshot labels as keys |
| Risk | Silent empty SUM / mis-targeted relation | Wrong `targetDatabaseId` or empty relation is UI-indistinguishable from "no children" (`getTarget` returns null → empty value, `RelationRollup.ts:64-66`) | Temporary `list` rollup beside each SUM/COUNT to inventory resolved children before declaring SC-001 |
| Risk | Omitting `computedSyncMode=display-only` | `automatic` would write computed keys back and enqueue Report/child paths (write-back early-returns under display-only at `DatabaseView.ts:10244`, `EmbeddedDatabaseRenderer.ts:2834`; default `ComputedSync.ts:3`), causing iCloud churn | Treat display-only as a P0 acceptance check; pin it in the first YAML edit, independent of SUM; verify Report file byte-equality after a child edit |
| Risk | Non-numeric text in amount cells | SUM silently drops non-parseable values; AVG divides by the numeric-count denominator only (`ChartAggregation.ts:191-198`) — correct-looking under-counts | Keep child amount columns typed `number`/currency so free text cannot enter via normal editing |
| Risk | Bidirectional drift after go-live | The fork has no inverse resolver; a new child added with only a Month link will not fill the Report rollup, so live SUMs silently rot if pairing is treated as a one-shot Setup task (`RelationRollup.ts:70-78`) | Record an ongoing-maintenance runbook rule: every new child gets both the child Month `[[wikilink]]` and the matching Report relation entry, until later inverse-relations plugin work |
| Risk | Wikilink syntax mismatch | `parseRelationLink` accepts only a full-string `[[...]]`; bare titles, paths, or Markdown links are dropped with the same empty UI as "no children" (`RelationLinks.ts:9-25`) | Setup inventories actual frontmatter shapes, not just "is the Month field filled"; correct malformed links to `[[...]]` |
| Risk | Accidental fork source edits | Breaks the rebase-friendly EuroFormat isolated-diff model and this phase's zero-code contract | Scope lock: vault `database:` YAML only |
| Dependency | Successor `002-rollup-aggregation-pack` | Later pack may add rollup kinds the plugin does not have yet (~20 Notion calculate functions) | This phase must not pre-build them in config; use only existing kinds here |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Rollups compute at read time in the view without rewriting Report notes, so iCloud does not sync a Report file on child amount edits.
- **NFR-P02**: Refresh after a child save coalesces vault/metadata events on an 80ms debounce timer (`DataSource.ts:1938-1998`); no new plugin loops, formula evaluation, or chart aggregation work is added.

### Security
- **NFR-S01**: No secrets, credentials, account numbers, or telemetry in `database:` YAML or in these docs.
- **NFR-S02**: MIT-forkable: configuration-only change; no copyleft or proprietary plugin code introduced.
- **NFR-S03**: No desktop-only Electron APIs; this phase ships no plugin code, so mobile Obsidian remains the target (all rollup/computed/data-write modules use cross-platform Obsidian APIs; `Platform.isMobile` gates UI chrome only).

### Reliability
- **NFR-R01**: iCloud-safe: `computedSyncMode=display-only` keeps the Report path off the writer; per-path `writeQueues` serialize concurrent child edits (`DataSource.ts:88-120`).
- **NFR-R02**: Missing relations, unresolved wikilinks, or wrong `targetDatabaseId` degrade to empty rollup values (COUNT `0`, SUM/AVG `null`) without corrupting notes or throwing errors (`RelationRollup.ts:64-66,159-160`).
- **NFR-R03**: Rebase-friendly by absence of fork diffs; later plugin phases still follow the `EuroFormat.ts` isolated-module model, but this phase does not add a module.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Child row with empty Month relation or unresolved wikilink: link skipped; that row is omitted — COUNT `0`, SUM/AVG `null` (empty placeholder, not a crash; `RelationLinks.ts:23-25`, `RelationRollup.ts:72-74,99,126-128`). A bare title, path, or Markdown link is also dropped — `parseRelationLink` accepts only a full-string `[[...]]` (`RelationLinks.ts:9-25`) — so Setup must inventory actual frontmatter shapes, not just "is the Month field filled."
- Report note with no resolvable children: same empty-value semantics; the note is not deleted or rewritten. Do not read SUM-empty as `0` unless the UI literally renders `0` (count does; sum does not).
- Amount property key mismatch: no fallback currency field is invented; the operator must correct the key (silent empty result otherwise).
- Non-numeric amount text in a related cell: dropped from SUM; AVG uses a numeric-only denominator (`ChartAggregation.ts:191-198`).
- Duplicate wikilinks to the same file within one relation column: counted once per source row (`seenPaths`, `RelationRollup.ts:69-75`).
- Two different relation columns on the same Report pointing at the same children: each rollup counts independently, by design.
- Nested rollup as rollup target: rejected — empty value returned, matching Notion's "cannot roll up a rollup" (`RelationRollup.ts:88-89`).
- Saved and Remaining: not derived; Income − Expenses math is out of scope.

### Error Scenarios
- `targetDatabaseId` pointing at the wrong database: `getTarget` returns null → empty rollup, no error (`RelationRollup.ts:43-49,64-66`) — treat as YAML bug, fix config; no plugin fallback.
- `computedSyncMode` left at `automatic`: computed keys written back and paths enqueued on child edits — treat as P0 failure, revert YAML to display-only.
- Accidental edit to fork source: out of scope; revert the fork file.

### Concurrent Operations
- Rapid successive edits to one child note: serialized on that path's own write queue; the Report path must still never be queued (`DataSource.ts:88-120`).
- iCloud sync of child notes while a Report view is open: the view refreshes from related notes within the coalesced event window; Report file bytes stay stable under display-only.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Vault `database:` YAML on Reports plus three child `db_view`s and per-row relation links; no plugin source |
| Risk | 10/25 | Silent empty SUM on wrong keys/targets; iCloud churn if display-only is missed |
| Research | 8/20 | Ranked, decision-ready findings synthesized from 10 iterations in `research/synthesis.md`; rollup capability line-verified in `research/research.md` |
| **Total** | **26/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- Live currency/amount property KEYS for Expenses / Sales / Income (ops): Notion-facing labels used in prose (`cost`/`gross`/`net`) are not necessarily the YAML keys. A guessed key yields a plausible empty SUM. Default: halt and ask ops; write UNKNOWN; do not bind. This gates SUM only — COUNT and the `list`/`file.name` resolution proof may proceed without it.
- Exact filesystem paths of the Reports, Expenses, Sales, and Income `db_view` notes: UNKNOWN. Default: inventory the live vault during Setup; do not invent paths.
- Whether Report notes already hold populated Reports-side relation wikilinks (Expenses (R) and siblings), or only children hold Month links: UNKNOWN. Default: inventory Reports frontmatter; if empty, bulk-fill Reports-side wikilinks this phase via a one-shot vault script / Templater pass (still vault data, not fork `src/`). Do not wait for derived-inverse plugin work.
- Effort sizing: effort S / 2.5h holds only if both relation sides are already linked. If Reports-side links are empty, the work is per-child `[[wikilink]]` transcription onto Report rows — size UNKNOWN until Setup counts rows. Do not treat 2.5h as a contract.
- Keep `Snapshot*` columns? Default yes — capture screenshot-era totals in Setup and show them beside live rollups. Explicit deferral is allowed only as an operator call.
- Euro sign on rollup cells vs nl-NL number grouping? Rollup display type is hardcoded `"number"` (`ColumnDisplay.ts:18-23`), so `formatEuroCurrency` never runs on rollup cells. Default: accept `formatEuroNumber` nl-NL grouping this phase; do not patch `ColumnDisplay.ts` (REQ-004). Euro-sign needs a fork display-type change, which is out of scope.
- Use table-footer `SummaryRenderer` as the monthly figure? Default no — a footer SUM totals the entire Reports view (all months), the wrong question for a per-month Report note. Optional as a year-to-date sanity bar only, after SC-001 passes.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md` (ranked verdict) · `research/research.md` (evidence trail)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-reports-relation-wiring/ | Inventory the four `db_view` notes and populate both relation sides so Reports-side `[[wikilink]]` arrays exist | Planned |
| 2 | 002-display-only-amount-types/ | Pin Reports `computedSyncMode: display-only` and type child amount columns `number`/`currency` | Planned |
| 3 | 003-count-list-resolution/ | Bind COUNT plus a temporary `list` on `file.name` to prove relation resolution without amount keys | Planned |
| 4 | 004-sum-rollups/ | Bind SUM to ops-confirmed amount keys after the COUNT/`list` proof; halt if keys are UNKNOWN | Planned |
| 5 | 005-snapshot-audit-columns/ | Keep screenshot-era Income/Expenses/Sales/Saved as typed `Snapshot*` columns beside live figures | Planned |
| 6 | 006-nowrite-proof-runbook/ | Prove SC-001 accuracy and SC-002 byte-equality, cover edges, remove diagnostic lists, lock fork `src/` unchanged | Planned |

Future / out of this phase (not child folders): successor `002-rollup-aggregation-pack` (`src/data/Aggregate.ts`, not a file this phase pre-creates); Saved as a live computed field; derived inverse relations; footer `SummaryRenderer` as the monthly figure; extra Notion calculate functions in YAML; euro-sign display-type patch on `ColumnDisplay.ts`.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-reports-relation-wiring | 002-display-only-amount-types | Written inventory of the four `db_view` notes; one sample Report relation resolves to the expected child set via full-string `[[wikilink]]` values | Sample Report frontmatter matches expected children (`RelationRollup.ts:70-78`); malformed non-`[[...]]` values counted (`RelationLinks.ts:9-25`) |
| 002-display-only-amount-types | 003-count-list-resolution | Reports YAML literally contains `computedSyncMode: display-only`; Expenses/Sales/Income amount columns typed `number` or `currency` | YAML pin present (`ComputedSync.ts:3`; `DataSource.ts:787`); schema type check on the three amount columns (`ChartAggregation.ts:191-198`) |
| 003-count-list-resolution | 004-sum-rollups | COUNT equals unique resolved children in the `list`/`file.name` inventory; empty Report shows COUNT `0` | COUNT matches `list` (`RelationRollup.ts:99,110-119`); empty SUM-to-come is a placeholder not a crash (`RelationRollup.ts:159-160`) |
| 004-sum-rollups | 005-snapshot-audit-columns | SUM bound to ops-confirmed keys, or UNKNOWN recorded and SUM left unbound; Snapshot may already exist from parallel work after Setup | On-screen SUM equals a manual sum of the `list` children, or the UNKNOWN halt is written (`RelationRollup.ts:123-128`) |
| 005-snapshot-audit-columns | 006-nowrite-proof-runbook | `Snapshot*` columns visible beside live figures, or operator deferral recorded; Saved still static | Both live and snapshot visible when they diverge, or deferral note exists; Saved has no live rollup (parent REQ-006) |
<!-- /ANCHOR:phase-map -->
