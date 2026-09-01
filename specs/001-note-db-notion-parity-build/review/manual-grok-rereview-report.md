# Manual Grok 4.6 xhigh Re-Review — Remediation Verification (cli-cursor, read-only)

- Date: 2026-08-27  ·  Executor: cursor-grok-4.6-xhigh via cli-cursor --mode ask
- Scope: verify the 5 remediated CONDITIONAL findings + fresh scan.

## Prior findings — remediations hold

**P1-001 — resolved.** The three named proof leaves now leave the un-run manual P0s unchecked, with explicit deferral text:

- `012-files-column/005-files-column-proof/checklist.md:83-86,98-99` — CHK-020 / CHK-021 / CHK-024 `[ ]`
- `014-record-detail-panel/005-peek-display-proof/checklist.md:82-85,97-98` — same three `[ ]`
- `003-reports-computed-fields/003-reports-display-proof/checklist.md:83-86,98-99` — same three `[ ]`, and CHK-020 is reworded so it no longer claims all ACs

The honest control is unchanged: `009-view-filter-tree/005-filter-tree-proof/checklist.md:83-99` still has CHK-020 / CHK-021 / CHK-024 `[ ]`. Parent phase-maps now mark those proof children **Deferred** (`012-files-column/spec.md:280`, `014-record-detail-panel/spec.md:285`, `003-reports-computed-fields/spec.md:251`), matching `009-view-filter-tree/spec.md:272`.

**P1-002 — resolved.** `attachTitleOpenAffordance` stamps the host cell (`src/views/TableRecordPeek.ts:43`). CSS gives that cell a containing block:

```16271:16277:styles.css
.note-database-container td.db-title-cell {
  position: relative;
}

.note-database-container td.db-record-open-host {
  position: relative;
}
```

The selector is scoped under `.note-database-container`, which is stricter than the unscoped `td.db-record-open-host` form and still establishes the containing block for the absolutely positioned OPEN button (`styles.css:16279-16281`). Title-hidden wiring is still `visible[0]` when `file.name` is hidden (`src/views/DatabaseView.ts:7946-7952`). A title-hidden host test exists at `src/views/TableRecordPeek.test.ts:383-394` (`db-record-open-host` + single button). Fill-handle cells were already `position: relative` (`styles.css:4970-4972`); the new rule does not steal that containing block.

**P1-003 — resolved.** Parent `003-reports-computed-fields/checklist.md:89-90,104-105` scopes CHK-020 to Remaining-with-Saved-deferred (unchecked) and CHK-024 to Remaining-only (checked against `ReportsComputedConfig.ts:61-68,79-89`). The proof child matches: CHK-020 / CHK-024 `[ ]` Remaining-only / manuals not executed (`003-reports-display-proof/checklist.md:83-99`). That matches the skip path: Saved is upserted only when `lock.saved !== null` (`src/data/ReportsComputedConfig.ts:69-75`).

**P2-001 — resolved as specified.** Root `spec.md:50` Status is In Progress; the phase-map (`spec.md:124-136`) lists 002–014 as **In Progress**, not Complete. `002-rollup-aggregation-pack/implementation-summary.md:69` cites `src/data/ChartAggregation.ts` (file exists). `014-record-detail-panel/implementation-summary.md:70,96` cites `src/views/TableRecordPeek.ts`.

**P2-002 — resolved.** `003-reports-computed-fields/tasks.md:100` T010 is still `[x]`, but the evidence note is now “Structural display-only proof: `computedSyncMode: display-only` is explicit in the config payload; not a byte-hash of note contents.” Completion criteria still leave desktop byte-hash unchecked (`tasks.md:112`).

## Fresh scan (remediation side-effects)

Un-checking those proof P0s did not create a new correctness hole: parent maps, parent checklists, and T007–T009 stay aligned on “manuals never ran.” The CSS host class is additive and does not fight fill-handle positioning.

**Roadmap** (`roadmap.md:40-51,106-110`) is consistent with the parent spec: Status In Progress; wave 0 / phase 001 pending; 015–017 deferred or out of scope. Documented deferrals stay legitimate.

Non-blocking residue (not P0/P1): proof-leaf YAML still says `completion_pct: 100` / “parent phase complete” while those P0s are `[ ]` (`012-files-column/005-files-column-proof/checklist.md:17-29`); some child summaries still use `next_safe_action: "None — phase complete"`; `011-table-multi-group/005-multigroup-display-proof` still `[x]`s a “2-field nest manual test” (pre-existing, outside the named remediations). None of that reopens the five named findings.

VERDICT: PASS
no blocking findings
