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
| C1 | Migration rows at target; replaced vocabularies deleted | close runs **17** (grep `this.closeTitleActionsPopover();`), dual class **2** (`toolbar-renderer.ts:1249`, `:1341`), dead methods **7** | counts **0**, close sequence preserved, negative control red | [ ] |
| C2 | Declared trigger state + direction-coloured leading sort chip + the `N applied` count label (`050` item 1, **restated**) | rail present but **no direction colour**; **no trigger declares a state**; **0 settings rows** carry the count label; both triggers open the panel unconditionally (`toolbar-renderer.ts:2211`, `:2229`) — 0 of 4 combinations assertable | row present iff active; state declared; label present; **4 of 4** combinations assertable. **Dual-mode icon behaviour is rejected, not deferred** (`design-trueup.md` REQ-001) | [ ] |
| C3 | Settings land after create/duplicate (`050` item 2) | **never — nothing opens** (`database-view.ts:3460-3462`, `:3941-3943`) | ≤ **100ms** | [ ] |
| C4 | Duplicate + context menu carried by the primitives (`050` item 4) | behaviour exists, **hand-rolled** (`database-view.ts:3925-3956`, `toolbar-renderer.ts:1229-1284`) | config equal except `id`/name suffix; **new** id; menu via the shell | [ ] |
| C5 | Sort-conflict confirm (`050` item 7) | **absent on both renderers** — the drop commits and the sort silently reorders it | confirm raised; decline no-op; accept clears sort | [ ] |
| C6 | Per-view new-row presets (`050` item 10) | **no preset can be stored** (`types.ts:415-432` has no map; `createEntry`'s `defaults` never receives one) | every preset value applied; no-preset rows byte-identical to today | [ ] |
| C7 | Measured embed collapse (`050` item 12) | boolean hide-or-nothing (`embedded-database-renderer.ts:2410-2416`); sweep not yet run — **T002 records the first overflowing width** | no overflow at any width in the 250px-up sweep; measured, once per resize | [ ] |
| C8 | One settings path; fallback classes resolve | **1 live path (utilities row) + 7 dead methods**; fallbacks query classes the dead methods would stamp | exactly one path; fallbacks resolve against the live trigger | [ ] |
| C9 | `044` grammar + `048` stacking hold on changed surfaces | conforming today — the migrations must not regress it | **7 of 7** elements per phone surface; stacking rows green | [ ] |
| C10 | Gate + replay + PM parity | not yet run for this phase; board/gantt baseline to capture before the first `board-renderer.ts` commit | gate exit **0**, one row per criterion, controls red→green; replay holds, reversed **0**; parity `pixelHash` identical | [ ] |
| C11 | Capture-read records per migration row | **0 of 24** — `toolbar-surface-inventory.md` §6 does not exist yet | **24 of 24** rows carry a record or a named gap | [ ] |
| C12 | Operator device pass | **not asked yet** | the operator reads the rebuilt toolbar as the improvement; **operator-only row, stays unticked until they say so** | [ ] |

**C2, C3, C5 and C7 are what the operator will notice first. C10 is the check that C1-C9 are not
theatre. C12 is the check that only the operator can pass.**
<!-- /ANCHOR:protocol -->
