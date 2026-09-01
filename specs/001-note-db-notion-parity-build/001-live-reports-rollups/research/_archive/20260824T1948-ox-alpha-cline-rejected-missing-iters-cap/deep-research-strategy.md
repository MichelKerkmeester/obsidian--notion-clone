# Deep Research Strategy — Live Reports Roll-ups (Notion Parity)

## Research Charter

### Goal
Produce a ranked, evidence-cited enrichment of the Live Reports Roll-ups feature so the phase can be perfected toward Notion parity: best UI/UX, core logic, fork integration options via the isolated-module EuroFormat pattern, edge cases, and mobile + iCloud safety.

### Non-Goals
- No implementation. Findings only; no edits to plugin source or vault notes.
- No new rollup-kind design for this phase's config-only contract (successor pack territory), but documenting what AppFlowy/Anytype/Notion offer is in scope as future-pack evidence.
- No ops questions answered (live-vault property keys remain UNKNOWN by charter).

### Stop Conditions
- newInfoRatio < 0.05 on two consecutive evaluations, OR
- max iterations reached, OR
- all strategy questions answered with cited evidence and remaining deltas judged non-material.

## Known Context

- Spec: `specs/obsidian/002-note-db-notion-parity-build/001-live-reports-rollups/spec.md` — config-only phase; REQ-001..006; display-only iCloud safety is P0.
- Plan: same folder `plan.md` — 3 phases (Setup/Core/Verify), rollback via YAML backups.
- Fork src (live tree): `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` — contains `data/RelationRollup.ts`, `data/ComputedSync.ts`, `data/DataSource.ts`, `data/EuroFormat.ts`, `views/SummaryRenderer.ts`, `data/ChartAggregation.ts` among ~80 modules.
- Reference repos: `specs/obsidian/002-note-db-notion-parity-build/context/appflowy` (Rust flowy-database2 + Flutter) and `.../context/anytype-ts`.
- Tension to resolve: spec says zero-code; operator topic asks how a code path *would* integrate via EuroFormat isolated-module pattern (new module + 1–3 call-site edits, rebase-safe). Both must be evidenced.

## Questions

1. Q1 Capability: What exactly do the fork's `RelationRollup.ts`, `ComputedSync.ts`, `DataSource.ts` implement today (kinds, sync modes, refresh triggers, empty-relation behavior)? [file:line citations]
2. Q2 UI/UX: How are rollups rendered (SummaryRenderer footer vs cell-level relation rollup)? What does the user see and edit?
3. Q3 Core logic gaps: Where does fork behavior differ from Notion rollups (e.g., per-row rollup on the parent row vs footer summary; grouping; filters applied before aggregation)?
4. Q4 AppFlowy evidence: How does flowy-database2 model rollups/aggregations (Rust types, calculation service) and how does Flutter render them? Cite real paths+lines.
5. Q5 Anytype evidence: How does anytype-ts implement relations/aggregations/views relevant to live totals? Cite real paths+lines.
6. Q6 Notion parity: What is canonical Notion rollup behavior (Original/Across databases, Show-as %, compute on groups, restrictions) per official docs?
7. Q7 Edge cases & safety: empty relations, non-numeric values, currency mixing, mobile rendering, iCloud write-churn avoidance under display-only.
8. Q8 Integration: If any code enrichment were ever needed, what is the minimal rebase-safe shape under the EuroFormat pattern (new module + ≤3 call-site edits)? Which call sites?

## Next Focus
None — loop stopped at iteration 5 (converged): all questions answered with citations; estimated next-iteration newInfoRatio ~0.03 < 0.05.

## What Worked
- Direct file:line citation discipline on the fork made capability claims falsifiable.
- Three-system comparison (fork/AppFlowy/Anytype) isolated which parity axis each repo actually implements, preventing wrong-model borrowing.
- Reading `computedSyncMode` consumers before trusting spec assumptions corrected the REQ-003 risk model.

## What Failed
- Assumed Anytype would have an aggregation service — it is fully client-side in one lib function.
- Assumed Notion help page documents "rollup across databases" and mobile restrictions — absent; recorded UNKNOWN.

## Exhausted Approaches
- Repo-wide rollup greps in both reference repos (no further rollup code exists to mine).
- Mobile-specific rollup branches in fork (none exist).
