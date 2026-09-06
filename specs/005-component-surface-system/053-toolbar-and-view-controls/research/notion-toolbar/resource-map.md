# Resource Map — 053 Notion toolbar research

> Evidence-derived map of every source the run read, carried up from the lineage's own map.
>
> **How this file was produced.** The workflow emits it through
> `reduce-state.cjs … --emit-resource-map --fanout-resource-map-only`. That script refuses to run
> against a spec folder inside `.worktrees/`: `resolveArtifactRoot` derives its approved roots from
> the shared module's own location, so the worktree path resolves outside them and the reducer exits
> with *"specFolder resolves outside the approved specs roots"*. The lineage's in-process reducer had
> no such problem, so `lineages/glm-openrouter-toolbar/resource-map.md` is machine-emitted and
> intact; this file is composed from it by hand and says so rather than pretending to be generated.
> `067-sheet-family-remediation` recorded the same limitation for the sheet-family run.
>
> `resource-map.md` was absent from the packet at init, so no coverage gate ran; the map is emitted
> because `config.resource_map.emit` is `true`.

## Notion evidence — the digest, and nothing else

No image file was opened. GLM-5.3-Flash cannot read one, and the brief forbade it regardless.

| Resource | Sections used | Screen ids cited |
|---|---|---|
| `specs/005-component-surface-system/053-toolbar-and-view-controls/notion-screens-digest-toolbar.md` | §1 selection and caveats, §2 per-screen table, §3 patterns P1-P13, §4 divergences, §5 Anytype vs Notion, §6 open questions | 71f9dba2, 98dde396, 3b3c3c26, 9aed23d0, 21d71e5f, 795eb9b5, 9693630d, 07cec641, 213f8a7c, a8a5865d, d426cb7f, d3de8071, 56aa9350, 792336a7, a9f0dfea, 0159ba7f, e3ebbca9, eb167dde, 94f0fd50, 658fd83b, d8abbe0b, d89efb14, 84653307, 1067756c, 82d66d47, 86a8e66c, 8ff7ae4b, 1f10ae24, 41665ca0, 24295cd3, 13bbee6c, d6d8022a, ac0d576b, 8a7eeea7, 995ca0e3, e4dfff31, 9e80b489, 420dd630, 8bb9115f, ddcba3da, 35c32af9, e9698e1b, 7d30bac2, 2f7bbc1f, 55602f6a, 348fd2b7, 794591f5, 142cef4e |

## Our implementation

| Resource | Read for |
|---|---|
| `src/views/toolbar-renderer.ts` | Render and row assembly (:239-421), gear (:431), overflow (:448), tabs (:849), tab collapse (:1040-1103), all-views hub (:1105-1273), delete rows (:1180, :1330), add-view (:1377), inline search (:1613-1680), group popover (:1701-2099), filter/sort/column triggers (:2241-2284), split New (:2351-2568), embedded collapse ladder (:2561-2642) |
| `src/views/toolbar-primitives.ts` | Row floors (:41-42), popover shell (:62-107), condition row (:135-165), control-cluster button (:186-220), settings entry (:240-265), tab strip (:322-394) |
| `src/views/active-view-controls-renderer.ts` | Chip rail (:72-180), overflow fade (:68, :173-180), direction word (:230-232), clear-all (:166-172) |
| `src/views/filter-panel-renderer.ts` | Depth cap (:52), leaf creation (:100-104), panel render (:129-228), zero-rule branch (:184-191), tree rows (:365-455), pickers (:509-527, :663-712) |
| `src/views/sort-panel-renderer.ts` | Panel render (:71-228), field dropdown (:158-168), drag reorder (:231-272) |
| `src/views/view-config-panel-renderer.ts` | Render (:365-500), applied summaries (:510-534), side-sheet presentation (:540-565), board settings (:1967-2008), searchable-select precedent (:2076-2090) |
| `src/views/surface-shell.ts` | `SHELL_SIDE_SHEET_CLASS` (:185) |
| `src/views/database-view.ts` | `deleteView` (:3445-3456) — the host behind both delete call sites |
| `src/views/confirm-sheet.ts` | `buildConfirmSheetBody` (:46) — `051`'s confirm primitive, T-A's consumer |
| `styles.css` | Toolbar (:1728-2100), chip rail (:1779-1900), badge (:2405-2417), group popover (:10860-10990), phone sheets (:11266+), filter and sort sheets (:12195+), responsive and phone (:19810-19928) |

## Design record

| Resource | Used for |
|---|---|
| `053-toolbar-and-view-controls/goal.md` | D1-D9, completion criteria, AC-111, the gear amendment |
| `053-toolbar-and-view-controls/design-trueup.md` | REQ-001, T13, T14-adjacent |
| `053-toolbar-and-view-controls/decision-record.md` | ADR-001 through ADR-006 |
| `053-toolbar-and-view-controls/tasks.md` | T004, T005, T008 thresholds and capture notes |
| `005-component-surface-system/design-system.md` | §3 role vocabulary, §4 table, §5 sizing, the condition-panel role |
| `005-component-surface-system/roadmap.md` | §6A operator decisions — `048` D1, the condition panel, the sheet bar, the gear ruling |

## Gaps — read boundaries the run honoured and named

- `column-manager-renderer.ts` and `column-menu.ts` are cited through the packet record only; the
  digest's P6 and P12 rows carry their line numbers.
- The board and table renderers, which T-F's hidden-group set would have to reach, were deliberately
  not read. Named in F-302 and made T-F's first job rather than assumed away.
- The `FilterRule` value shape behind a multi-value picker (F-204) is a data-model question this run
  did not open.

## Run artefacts

| Path | What it holds |
|---|---|
| `research.md` | This run's synthesis, 17 sections plus the convergence report |
| `findings-registry.json` / `deep-research-findings-registry.json` | 34 merged findings, 6 resolved questions |
| `fanout-attribution.md` | The pool's attribution row (its `Kind`/`Model` read `unknown`; the authoritative record is the lineage's `invocation-metadata.json`) |
| `orchestration-summary.json`, `orchestration-status.log`, `observability-events.jsonl` | The pool's own run record |
| `deep-research-config.json` | The persisted setup, including the `fanout` block |
| `lineages/glm-openrouter-toolbar/` | The lineage's iterations, deltas, state log, strategy, dashboard, registry, its own `research.md` and `resource-map.md`. Gitignored |
