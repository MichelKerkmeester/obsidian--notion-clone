# Manual Grok 4.6 xhigh Deep-Review (cli-cursor, read-only)

- Date: 2026-08-27  ·  Executor: cursor-grok-4.6-xhigh via cli-cursor --mode ask
- Note: run manually because the /deep:review opencode command hangs at startup.

The reconciliation is **not fully honest**. Parent-level `002`/`003`/`009`/`012`/`014` checklists mostly do the right thing (unchecked manual proofs, real `src/` citations). The **proof-leaf** checklists for `012/005`, `014/005`, and `003/003` still mark un-run P0 manual items `[x]` and treat a Sonnet code-trace as if the vault session happened. `009/005` shows what honest looks like: everything still `[ ]`.

Cited implementation for the five sampled phases is real and mostly matches `src/`. No P0 security hole turned up. One shipped UX/CSS gap remains on the 014 title-hidden OPEN path.

---

### P1-001 [P1] Proof-leaf checklists still mark un-run manual P0s as done

- **Finding class:** `matrix/evidence`
- **File:** `specs/001-note-db-notion-parity-build/012-files-column/005-files-column-proof/checklist.md:85-99`
- **Evidence:** Child `012/005` checks **CHK-021 Offline gallery cover** and **CHK-024 Table chips open vault files** as verified, with copy that a Sonnet review is “substituting for a separately-run manual matrix.” Those items are empirical (network off, `openLinkText`). The parent `012` checklist honestly leaves the same work unchecked (`012-files-column/checklist.md:89-90`). `014/005` does the same for **CHK-021 Desktop hover-open** (`014-record-detail-panel/005-peek-display-proof/checklist.md:84-85`). `003/003` checks **CHK-021 Known-pair manual test** while the evidence says it was “not a recorded manual click-through” (`003-reports-computed-fields/003-reports-display-proof/checklist.md:85-86`). Contrast `009/005`, where every item stays `[ ]` (`009-view-filter-tree/005-filter-tree-proof/checklist.md:55-104`).
- **Scope proof:** Parent checklists for 012/014 uncheck the same manuals; only 009’s proof child stays unchecked. Parent phase maps still list `005-files-column-proof`, `005-peek-display-proof`, and `003-reports-display-proof` as **Complete** (`012-files-column/spec.md:276-280`, `014-record-detail-panel/spec.md:281-285`, `003-reports-computed-fields/spec.md:249-251`) while those children’s **Status** is In Progress.
- **Recommendation:** Uncheck every proof item that is not a file:line, test count, or command. Mark those proof children **Deferred** in the parent maps (009 already did). Do not treat Sonnet substitution as a checked manual P0.

### P1-002 [P1] Title-hidden OPEN button has no cell containing block

- **Finding class:** `instance-only`
- **File:** `styles.css:16271-16275` and `src/views/DatabaseView.ts:7946-7952`
- **Evidence:** JS does attach OPEN to `visible[0]` when `file.name` is hidden (`DatabaseView.ts:7946-7952`). CSS only sets `position: relative` on `td.db-title-cell` (`styles.css:16271-16273`). The button is `position: absolute` (`styles.css:16275-16283`). Fallback cells never get `db-title-cell`. Table cells use `overflow: hidden` without `position` (`styles.css:4240-4247`). That is why the title-cell rule exists; the fallback path does not get it. CHK-060 is still checked as if Scenario 5 is done (`014-record-detail-panel/checklist.md:85`).
- **Scope proof:** Grep shows `db-title-cell` / `db-record-open-btn` positioning only in that peek CSS block. Tests never cover title-hidden DOM/CSS (`TableRecordPeek.test.ts` has no such case).
- **Recommendation:** Set `position: relative` on any `td` that receives the button (or add a class in `attachTitleOpenAffordance`), then prove it with a title-hidden row.

### P1-003 [P1] 003 still checks “Saved configured” / “all AC met” while Saved is deferred

- **Finding class:** `matrix/evidence`
- **File:** `003-reports-computed-fields/checklist.md:103-105` and `003-reports-computed-fields/003-reports-display-proof/checklist.md:83-84`
- **Evidence:** The command never classifies Sales; it skips Saved (`DatabaseView.ts:9402-9429`, `ReportsInspector.ts:185-187`). `applyReportsComputedConfig` only upserts Saved when `lock.saved !== null` (`ReportsComputedConfig.ts:69-75`). Parent **CHK-024** still says Remaining **and Saved** are configured. The proof child checks **CHK-020 All acceptance criteria met** while its own evidence admits REQ-004 is deferred.
- **Recommendation:** Uncheck or reword CHK-024/CHK-020 to Remaining-only; keep Saved as the documented deferral.

---

### P2-001 [P2] Leftover “Complete / phase complete” after Status → In Progress

- Parent **Status** is In Progress (`spec.md:50`) but the phase map still lists 002–014 as **Complete** (`spec.md:124-136`). Frontmatter still says “parent reconciled to Complete” (`spec.md:20`).
- `002` summary: `next_safe_action: "None — phase complete"` (`002-rollup-aggregation-pack/implementation-summary.md:18`) and a wrong path `src/views/ChartAggregation.ts` (`implementation-summary.md:69`; real file is `src/data/ChartAggregation.ts`).
- `009`/`014` summaries still talk about a parent **Complete** status (`009-view-filter-tree/implementation-summary.md:47-48`, `014-record-detail-panel/implementation-summary.md:18`).
- `014` decisions table still says the module lives under `src/data/` (`014-record-detail-panel/implementation-summary.md:96`); shipped path is `src/views/TableRecordPeek.ts`.

### P2-002 [P2] 003 T010 “persistence proof” cites the config write, not a note hash

- **File:** `003-reports-computed-fields/tasks.md:100`
- T010 is `[x]` with `DataSource.ts:saveReportsComputedConfig`. That method **writes** the view def (`DataSource.ts:527-542`). REQ-002 was a before/after hash of Report notes after open+scroll. Structural `computedSyncMode: "display-only"` (`ReportsComputedConfig.ts:97`) is real; it is not a byte-hash.

---

## Spot-check: cited `src/` vs shipped code

**002** — Citations hold. `Aggregate.ts:8-66` exports the kinds and `isNumericRollupKind`; `RelationRollup.ts:140-188` dispatches percent before flatten, dates before numbers, exhaustive switch then `aggregation === "sum"` only; `ColumnDisplay.ts:19-23` / `RowPipeline.ts:150-155` map earliest/latest → date; footers and charts consume Aggregate (`SummaryRenderer.ts:443-459`, `ChartAggregation.ts:778-786`); modal offers the kinds (`RelationRollupConfigModal.ts:138-186`). Manual three-surface / lint items are unchecked. Honest at parent level.

**003** — Deviation is documented in spec Out of Scope and `implementation-summary.md` Deviations. Modules and command exist (`ReportsInspector.ts:126-197`, `ReportsComputedConfig.ts:42-102`, `main.ts:356-360`). Saved skip is real. Parent CHK-013 is correctly unchecked. Proof-leaf CHK-021/CHK-020 are the honesty failure (P1-003).

**009** — `ViewFilterTree.ts` Kleene eval and dead-root prune (`:168-205`); `QueryEngine.ts:131-155`; `RowPipeline.ts:96-104`; dual-write sites match cited lines. Filter panel has `MAX_FILTER_GROUP_DEPTH = 3` and no `inFolder`/`hasProperty` leak. `005` is Deferred in the map and fully unchecked. Best-reconciled phase.

**012** — `FilesColumn.normalize` / `hasUrlScheme` drop any URI scheme (`FilesColumn.ts:47-66,187-199`); write gate `CellRenderer.ts:2507-2509`; cover guard at both renderers (`GalleryRenderer.ts:447`, `BoardRenderer.ts:666`); `CoverImage` uses the same predicate (`CoverImage.ts:44,68-69`). Parent manual items are unchecked. Child `005` checklist is not.

**014** — Module, i18n (en/zh-CN/zh-TW at `i18n.ts:406-408,1889-1891,3427-3429`), overlay lifecycle (`DatabaseView.ts:848,880,10647`), Mod+Enter before Enter (`DatabaseView.ts:1539-1562`), hidden-group `.is-hidden { display: none }` (`styles.css:16408-16411`) all exist. Title-hidden CSS is the remaining code gap (P1-002).

**001 / 015–017** — Status Planned / Deferred / Out of scope as claimed. Legitimate.

## Dimensions

| Dimension | Assessment |
|-----------|------------|
| **Correctness** | Core 002/009/012/014 modules match their implementation claims. Remaining/Saved command is wired and fail-closed on missing Income/Expenses. Title-hidden OPEN layout is not. |
| **Security** | No secrets/telemetry. Files/cover reject any URL scheme, not only http(s). Formulas stay in existing SafeEval; Reports field names reject brackets (`ReportsInspector.ts:217-222`). Peek module has no `DataSource` / `mutateFrontmatter` / `openNote`. |
| **Traceability** | Parent tasks/checklists for the five phases are mostly evidence-backed. Proof leaves 012/005, 014/005, 003/003 still check manuals that parent docs defer. Phase maps still say Complete. |
| **Maintainability** | EuroFormat isolation holds. Stale Complete language, wrong `ChartAggregation` path, and `src/data/` vs `src/views/` leftover in 014 summary will confuse the next closer. |

Un-run manuals, config-only 001, and don’t-build 015–017 are acceptable **if they stay unchecked**. They are not, on three proof children.

VERDICT: CONDITIONAL
- P0: none
- P1-001 proof-leaf `[x]` on un-run manuals (`012-files-column/005-files-column-proof/checklist.md:85-99`, `014-record-detail-panel/005-peek-display-proof/checklist.md:84-97`, `003-reports-computed-fields/003-reports-display-proof/checklist.md:83-86`); 009/005 is the honest control
- P1-002 title-hidden OPEN CSS (`styles.css:16271-16275`, `DatabaseView.ts:7946-7952`)
- P1-003 Saved / “all AC met” still checked (`003-reports-computed-fields/checklist.md:103-105`, `003-reports-computed-fields/003-reports-display-proof/checklist.md:83-84`)
- P2 leftover Complete maps/summaries; wrong `ChartAggregation` path (`002-rollup-aggregation-pack/implementation-summary.md:69`)
