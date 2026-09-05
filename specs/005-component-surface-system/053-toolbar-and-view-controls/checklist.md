---
title: "Verification Checklist: Toolbar and View Controls"
description: "The thresholds with the failing measurement recorded first, so a pass means a surface actually changed rather than a check being added."
trigger_phrases:
  - "053 checklist"
  - "toolbar verification"
  - "toolbar thresholds"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per acceptance criterion, numbered to match `AC-1NN`. Desktop measurements are taken on
the real renderer at the production mount point; phone measurements on a 390×844 profile with a
navbar present. **T002 fills every `Today` cell that carries a mechanism rather than a figure** —
a "today" cell written after the fix is a cell nobody can check against the tree that produced it.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Migration rows at target; replaced vocabularies deleted | close runs **17** (grep `this.closeTitleActionsPopover();`), dual class **3** (`toolbar-renderer.ts` title-actions / type-change / tab-menu rows), dead methods **7** | counts **0**, close sequence preserved, negative control red | [x] `createPopoverShell` ×8; dual-class 0; dead methods 0; `toolbar-surface-contract.test.ts` |
| C2 | Declared trigger state + direction-coloured leading sort chip + the `N applied` count label (`050` item 1, **restated**) | rail present at **26px**; direction word already on sort chips (`common.asc`/`common.desc`); **no trigger declared a state at HEAD**; **0 settings rows** carried the count label — 0 of 4 combinations assertable | row present iff active; state declared; label present; **4 of 4** combinations assertable. **Dual-mode icon behaviour is rejected, not deferred** (`design-trueup.md` REQ-001) | [x] chip 28px + `data-control-state` + summaries shipped; 4-of-4 trigger combos now one live pass in `render-assertions` (`chrome-toolbar-rules-{filter,sort,both}`, `chrome-active-view-controls-{none,filter,sort}`) |
| C3 | Settings land after create/duplicate (`050` item 2) | **never — nothing opens** (`database-view.ts:3460-3462`, `:3941-3943`) | ≤ **100ms** | [ ] `openViewSettingsAfterMutation` exists, called synchronously (same tick, no setTimeout/promise gap) after `rerenderToolbar()`; wall-clock reading against a real host still not taken |
| C4 | Duplicate + context menu carried by the primitives (`050` item 4) | behaviour exists, **hand-rolled** (`database-view.ts:3925-3956`, `toolbar-renderer.ts` tab menu); duplicate id already new via `generateId()` | config equal except `id`/name suffix; **new** id; menu via the shell | [x] menu uses `createPopoverShell`; constructed row `chrome-toolbar-tab-menu/file-view` right-clicks a real tab and reads rename/duplicate/remove (caught and fixed a single-view-fixture false negative on the delete row) |
| C5 | Sort-conflict confirm (`050` item 7) | **absent on both renderers** — table `canManualReorder` blocked when sorted so drop handlers were not attached; board same-group + sorted returned `"ignore"` with no confirm | confirm raised; decline no-op; accept clears sort | [ ] `confirmSortConflict` on table+board, source-verified correct on both branches; live decline/accept branches not driven (out of this landing pass's bound — see AC-105) |
| C6 | Per-view new-row presets (`050` item 10) | **no preset can be stored** (`types.ts` had no map; New menu had no `Settings` section; `createEntry(undefined)` only) | every preset value applied; no-preset rows byte-identical to today | [x] `view-row-presets.test.ts` + New-menu `toolbar.settings` section |
| C7 | Measured embed collapse (`050` item 12) | boolean hide-or-nothing (`embedded-database-renderer.ts:2410-2416`); first overflowing width **unmeasured** (no Chrome sweep in this session) | no overflow at any width in the 250px-up sweep; measured, once per resize | [ ] ResizeObserver+scrollWidth shipped for New/query/properties/add-view `+`; 250px sweep not read; the tab-row-to-dropdown rung is unbuilt (`applyToolbarChromeCollapse`'s `targets` never includes the tab strip) |
| C8 | One settings path; fallback classes resolve | **1 live path (utilities row) + 7 dead methods**; fallbacks queried classes the dead methods would stamp | exactly one path; fallbacks resolve against the live trigger | [x] dead methods 0; fallbacks on `.db-toolbar-more-btn` |
| C9 | `044` grammar + `048` stacking hold on changed surfaces | conforming today — the migrations must not regress it | **7 of 7** elements per phone surface; stacking rows green | [x] `sheet-grammar` green, `sheet-teardown` green; `sheet-rebuild` green in **both** Chrome and WebKit on this tree's gate |
| C10 | Gate + replay + PM parity | not yet run for this phase; board/gantt baseline to capture before the first `board-renderer.ts` commit | gate exit **0**, one row per criterion, controls red→green; replay holds, reversed **0**; parity `pixelHash` identical | [x] `npm run gate` 25/25 green; `npm run replay` 28/28 held; `screenshots/project-manager/` 0 files changed (pixelHash-identical). "One row per criterion" only partially true — C3/C5/C7 still lack a dedicated lane row |
| C11 | Capture-read records per migration row | **24 of 24** — `toolbar-surface-inventory.md` §8.1 carries a record or a named gap for every migration row | **24 of 24** rows carry a record or a named gap | [x] |
| C12 | Operator device pass | **not asked yet** | the operator reads the rebuilt toolbar as the improvement; **operator-only row, stays unticked until they say so** | [ ] |

**C2, C3, C5 and C7 are what the operator will notice first. C10 is the check that C1-C9 are not
theatre. C12 is the check that only the operator can pass.**
<!-- /ANCHOR:protocol -->
