# Build Synthesis — Notion-Parity Note Database (phases 002–014)

- Date: 2026-08-26
- Branch: `impl` (57 commits ahead of `main`); not merged to `main`/`v4` (operator ff-merge gate)
- Authoritative gate at synthesis time: `npx tsc --noEmit` exit 0 · `npm run build` exit 0 · `npx vitest run` **232 passed / 24 files**
- Verification: one fresh Claude Sonnet 5 read-only review per phase (`<phase>/research/sonnet-verification.md`), plus a DeepSeek V4 in-loop review per sub-phase during the build.

## 1. Executive summary

13 feature phases (002–014) of the Notion-parity fork were implemented into `src/` following the isolated-module EuroFormat pattern (new module + a few rebase-safe call sites; display-only, mobile/iCloud-safe). Every sub-phase passed a hard gate (tsc 0 + esbuild build 0 + vitest green) and was committed with `--no-verify`. Each phase then received an independent Sonnet 5 verification: **5 PASS, 8 CONCERNS**. All CONCERNS that were genuine code/functional defects have been **fixed and re-gated** in a dedicated fix stage; the residue (documentation reconciliation, deferred sub-features, un-run manual proofs) is enumerated in the remediation plan (`remediation-plan.md`) and is not auto-implemented.

## 2. What shipped, per phase

| Phase | Feature | Primary module(s) | Key call sites | Tests | Sonnet verdict |
|---|---|---|---|---|---|
| 002 rollup-aggregation | min/max/median/range, date earliest/latest, percent-empty/filled rollups | `data/Aggregate.ts` | RelationRollup, ColumnDisplay, RowPipeline, SummaryRenderer, ChartAggregation | `Aggregate.test.ts` | **PASS** |
| 003 reports-computed | Reports Remaining/Saved computed fields | `data/ReportsInspector.ts`, `ReportsComputedConfig.ts`, `ReportsDisplay.ts` | DataSource, CellRenderer, DatabaseView, main.ts (command) | `ReportsDisplay/ReportsComputedConfig/ColumnDisplay.test.ts` | CONCERNS (P0) → **fixed** |
| 004 formula-ifs-switch-math | IFS/SWITCH + math aliases (LOG base-10) | `data/FormulaIfsSwitchMath.ts` | ComputedField, FormulaModal, i18n | `computed-formulas.test.ts` | **PASS** |
| 005 formula-let | nested LET/LETS variable bindings | `data/LetVariables.ts` | ComputedField, FormulaModal | `LetVariables.test.ts`, `ComputedField.let.test.ts` | **PASS** |
| 006 link-scheme | clickable URL/email/phone text cells | `data/textLinkScheme.ts` | CellRenderer, Board/Gallery/List/RecordDetail, ColumnMenu, ColumnWidth | `textLinkScheme.test.ts` | CONCERNS (P1 i18n) → **fixed** |
| 007 unique-id | create-time unique-ID stamp | `data/UniqueIdStamp.ts` | CreateEntryPlan, DataSource, DatabaseView | `UniqueIdStamp.test.ts` | **PASS** |
| 008 inverse-relations | derived read-only inverse relations | `data/RelationInverse.ts` | RelationRollup, DatabaseView, EmbeddedDatabaseRenderer | `RelationInverse.test.ts` | CONCERNS (docs) |
| 009 filter-tree | nested AND/OR/NOT filters (Kleene 3-valued) | `data/ViewFilterTree.ts` | QueryEngine, RowPipeline, DataSource, ViewStateStore, FilterPanelRenderer, non-panel sites | `ViewFilterTree/ViewStateStore/DataSource/ColumnConfig/ViewRuleOperations.test.ts` | CONCERNS (P1 tests) → **fixed** |
| 010 conditional-format | color/icon/bold conditional formatting | `data/ConditionalFormatting.ts`, `ConditionalFormatParser/ColumnOps/Editor.ts` | renderers, styles.css | `ConditionalFormatting.test.ts`, `ConditionalFormatColumnOps.test.ts` | CONCERNS (P1×2) → **fixed** |
| 011 table-multi-group | group table by 2+ fields, nested headers | `data/MultiFieldGrouping.ts`, `MultiGroupDisplay.ts`, `TableSubgroupPicker.ts` | TableRenderer, DataSource, DatabaseView, Embedded, ToolbarRenderer, styles.css | `MultiFieldGrouping/MultiGroupDisplay/TableSubgroupPicker.test.ts` | CONCERNS (P0 CSS) → **fixed** |
| 012 files-column | Files/Attachments column, vault-local + cover images | `data/FilesColumn.ts`, `CoverWiring.ts` | type registry, CellRenderer, Gallery/Board, CoverImage | `FilesColumn.test.ts`, `CoverImage.test.ts` | **PASS** |
| 013 template-toolbar | adaptive New-from-template toolbar + row-menu | `data/TemplateToolbarAction.ts` | ToolbarRenderer, RowMenu, DatabaseView | `TemplateToolbarAction.test.ts` | CONCERNS (docs/proof) |
| 014 record-peek | table row peek detail panel | `views/TableRecordPeek.ts` | DatabaseView, styles.css, i18n | `TableRecordPeek.test.ts` (added `86eee77`) | CONCERNS (P1 CSS) → **fixed** |

Phase 001 (config-only vault YAML) and 015–017 (don't-build decision specs) carry no code, by design.

## 3. Build process — and the executor incident

The build ran through a serial, resumable driver (`scratch/stage4-implement.cjs`): per sub-phase implement → gate → commit → in-loop review → one fix pass on concerns. Two facts worth recording:

- **Codex OpenAI quota exhaustion (recovered).** At 08:57 the implement executor (GPT-5.6-Luna via codex) hit its ChatGPT usage limit. The driver had a liveness blind spot: a dead executor printed an error, produced no code, the gate passed on *unchanged* sources, the commit was empty, and the sub-phase was falsely marked "DONE." Phases **012–014 (13 sub-phases) were silently no-op'd.** This was caught by the Sonnet verifiers (012/013 correctly returned "phase does not exist"). Recovery: the false done-markers were corrected, the driver was **hardened** (a code sub-phase producing no change is retried then failed, never falsely done; a fatal-error scan aborts the run; per-sub-phase logs are truncated so a prior run's stale error can't false-abort), and the implement executor was switched to **Luna Max via cli-cursor** (`gpt-5.6-luna-max`, smoke-tested). 012–014 rebuilt cleanly.
- **The `styles.css` commit-omission root cause.** The driver originally staged only `src/ main.js`, never `styles.css`/`package.json`, so several phases' CSS shipped uncommitted — 010's bold and 011's nested-indent (a P0) rendered nothing. Fixed by committing the accumulated CSS (`929769d`) and staging those paths thereafter.

## 4. Verification results

Every phase got a fresh Sonnet 5 read-only review with a hunter/skeptic/referee adversarial self-check. Highlights:
- **5 clean PASS:** 002, 004 (LOG correctly base-10), 005 (correct nested `__let`, SafeEval byte-identical), 007 (adversarially disproved a duplicate-ID risk), 012 (vault-local safety fully traced).
- **The in-loop DeepSeek review caught real defects mid-build** — e.g. 012's `004` first shipped a dead unwired cover-guard helper; the fix pass added the real guard before the phase was marked done.
- **A universal finding:** every phase's completion docs still read "Planned/0%" — the gate/in-loop review approved the code but nothing wrote completion state back. This is documentation reconciliation, tracked in remediation.

## 5. Fix stage — defects resolved

All genuine code defects the verifiers surfaced were fixed serially (each: Sonnet fix agent → independent re-gate → commit):

| Commit | Defect | Fix |
|---|---|---|
| `929769d` | 010 bold + 011 nested-indent CSS never committed (P0/P1) | committed the accumulated view CSS + test script |
| `c90aee6` | 014 hidden-properties group not collapsible (P1) | added the 9 missing peek-panel CSS classes + `.is-hidden` collapse rule |
| `29d7b14` | 006 scheme-picker labels hardcoded English (P1) | routed through `t()`, keys in all 3 locales |
| `e3600d2` | 010 column-delete orphans a conditional-format rule (P1) | derive surviving condition via the editor's first-leaf DFS; regression test (negative-control proven) |
| `bd8e467` | 012 cover-guard safety-critical conditional untested (P1) | extracted `isCoverImageBlocked()`, 7 tests |
| `e854681` | 009 non-panel dual-write coherence untested (P1) | +9 tests on the real coherence helpers |
| `c766117` | 003 vault-wide empty-cell regression + dead-code feature (P0) | rescoped the guard to Reports computed columns only; wired the feature behind a registered command; tests (negative-control proven) |
| `86eee77` | Second deep-review round: 012 FilesColumn treated only http/https as an external scheme, letting other URL schemes slip through as vault wikilinks; 009 ViewFilterTree left a fully-dead ROOT filter group uncollapsed | FilesColumn now discards any URL-scheme value (not just http/https); view-filter prune collapses a fully-dead ROOT group to no-filter while keeping nested empty groups (they still contribute Kleene skip to their parent); also added the 014 record-peek unit tests (`TableRecordPeek.test.ts`, 8 cases) |
| `0587cd3` | Second deep-review round: 012 CoverImage used the same http(s)-only scheme check as the FilesColumn defect above | switched CoverImage to the shared `hasUrlScheme` predicate so any URL scheme is treated as external; added `CoverImage.test.ts` |

## 6. Coverage vs original research recommendations

Each phase implemented its synthesis "Recommended build" backlog and explicitly deferred the out-of-scope items (recorded in each `sonnet-verification.md`). No research recommendation was silently dropped; deferrals are all documented per phase (e.g. 008 chips/badge, 011 nested drag-and-drop, 012 attachment-count badge/per-file menu, 013 optional-confirm/split-button; 014's deferred renderer tests were later added in the remediation fix stage, `86eee77`).

## 7. Current state of the plugin

All 13 feature phases are built, wired, and reachable; the suite is 232 tests across 24 files, tsc clean, esbuild production build clean. The plugin is functional on `impl`. It has **not** been merged to `main`/`v4` — that remains an operator gate.

## 8. Deferred / remaining (feeds the remediation plan)

- **Packet-wide completion-doc reconciliation** (P1, documentation) — **DONE**: 002–014 `implementation-summary.md`/`checklist.md`/`graph-metadata.json`/`spec.md` Status reconciled to the shipped state (`fc06153`, `35f1888`, `dccbf3d`; see remediation-plan.md R1).
- **003 Saved-field classification** (deferred by design): the wired command auto-detects Income/Expenses → Remaining; "Saved" needs an operator "Sales" classification UI that is unbuilt.
- **Un-run manual proof sub-phases** (013/003, 014/005, others): the Sonnet reviews substitute as the real proof, but the phases' own proof artifacts were never produced.
- **Test gaps by house convention** (DOM renderers): 014 peek module tests landed in the remediation fix stage (`86eee77`, `src/views/TableRecordPeek.test.ts`, 8 cases); other view-renderer DOM paths remain manually verified per house convention.
- Assorted P2s (cosmetic CSS hooks, style-alias nits) itemized in the per-phase verdicts.
