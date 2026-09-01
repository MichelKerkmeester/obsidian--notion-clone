---
title: "Checklist: Remaining Freezes"
description: "Closing conditions with their evidence column; investigation items are closed, build items are open."
trigger_phrases:
  - "remaining freezes checklist"
  - "028 checklist"
importance_tier: "high"
contextType: "verification"
---
# Checklist: Remaining Freezes

---

## INVESTIGATION — closed

| | Item | Evidence |
|---|---|---|
| [x] | The shared trigger is identified | All four sheet reports reach `DatabaseView.refresh()`; call sites tabulated in `spec.md` §2 |
| [x] | The freeze threshold is measured | `bench:list --rows=…12800 --cols=21 --fill=0.3` exit **1**, 2,877.7ms vs the 2,000ms budget |
| [x] | The row count question is answered | ≈2,300 rows at 21 cols at 6× CPU throttle; ≈10,000 at 1×. `acceptance-criteria.md` §1B |
| [x] | The scaling shape is established | `SUPERLINEAR (per-row ×2.55)` desktop, `×3.21` phone width, `×4.5` table |
| [x] | ~~All 33 forced-layout sites audited, not spot-checked~~ **superseded — the count was wrong** | Re-derived from the call graph: **at least 6 per-item, not 3**. The audit never opened `gallery-renderer.ts`, which carries three. `implementation-summary.md` §2 |
| [x] | Per-item and costly are different properties | A per-item forced layout is free when the container is detached (×0.8 at 6,400 rows) and quadratic when attached (×80.1). `implementation-summary.md` §3 |
| [x] | The table contradiction is resolved without an operator answer | `TableRenderer` builds its body off-document (`:139-146`) and attaches once, so its per-row calls flush nothing. `implementation-summary.md` §3 |
| [x] | Board's freeze is explained | `board-renderer.ts:770` in `renderCard` (`:730`), called from loops `:334`, `:583`, `:657` |
| [x] | The card-pipeline hypothesis was tested, not assumed | Refuted: table slower at every row count, 5,641.7ms vs 2,665.3ms at 12,800. `spec.md` §6 |
| [x] | Four alternative reconciliations tested | All failed — pagination, group caps, column visibility, `ResizeObserver`. `spec.md` §6 |
| [x] | What `024` did and did not address is recorded | `spec.md` §3, quoting `024` §2 declining the table |
| [x] | The measurement is reproducible | `run-compare.mjs` re-run from the phase folder, exit 0, numbers within noise |
| [x] | No source file was modified | `src/` working tree unmodified; no commit |

## BUILD — open

| | Item | Blocked on |
|---|---|---|
| [ ] | AC-1 — one rebuild under 2,000ms at the operator's shape | **Still open, and the hoist does not close it.** Post-fix board crosses 2,000ms at ≈2,200 rows desktop / ≈2,350 phone at 6× throttle. `implementation-summary.md` §6 |
| [x] | AC-2 — every **costly** per-item forced layout hoisted, each with a recorded before-number | Board `2,990.4ms → 1,068.8ms` (k 1.38→1.14); gallery `16,700.2ms → 1,000.7ms` (k 1.89→1.10). Control reinstating one line returns exit 1. `implementation-summary.md` §5 |
| [x] | AC-2b — the sites left alone are justified, not missed | Table and record-peek are per-item but detached, so free; `database-view.ts:5087` is a latent correctness bug needing an owner. `implementation-summary.md` §3–§4 |
| [ ] | AC-3 — no SUPERLINEAR verdict up to 12,800 rows | Board and gallery are LINEAR to 6,400 unthrottled; not measured to 12,800, and 6× throttle still goes superlinear at the top of the ladder |
| [x] | AC-4 — a sheet round trip costs one rebuild | Counted, not inferred: `run-panel-refresh` **2 → 1** for sort and filter, by both dismissals. Three controls, each exit 1 — see the row below |
| [x] | AC-4's check was shown to go red, three ways | (a) dismissal guards removed → 2 rebuilds, OVER. (b) filter flush removed → 1 rebuild but STALE, painting `value: ""` against `value: "ab"`. (c) skip widened to the column manager → STALE, painting `hiddenColumns: []` against `["amount"]`. Control (c) **passed on its first attempt and was worthless**: the scenario had no render while the panel was open, so the open-marks-dirty flag carried the rebuild and the exclusion was never exercised. It only became a real control once the scenario forced a paint first |
| [x] | AC-5 — the table boundary is explained or retired | **Retired without needing Q1–Q3**: attached vs detached container, measured. `implementation-summary.md` §3 |
| [x] | Baseline returned to green | vitest **444** exit 0 · tsc 0 · placement **202/206, 4 declared reds** exit 0 · screenshots exit 0 · comments PASS · eslint identical before/after. `gate` exits 1 on `evidence` only, owned by a concurrent lane — `implementation-summary.md` §7 |
| [ ] | 12 filter-panel captures refreshed | `screenshots:verify` names 12 captures whose sources include `filter-panel-renderer.ts`. **Not refreshed here**: `npm run screenshots` regenerates all 240 stale captures, and 228 of them are stale from a concurrent `styles.css` lane this phase must not touch. The 12 cannot change content — the captures render hand-written fixture markup against the stylesheet and never execute this renderer, and the diff adds a private method and swaps one call with no DOM construction changed. Refresh with the CSS lane, not against it |
| [ ] | Operator confirms on device | Nothing here substitutes for it — and §6 says this alone will not fix their freeze |

## TRAPS CARRIED FORWARD

| | |
|---|---|
| [x] | Exit codes read unpiped — a pipe reports the pipe's status |
| [x] | A rebuild count read off the call graph over-counted by one; reachable is not executed |
| [x] | At phone width the panels are portalled to `body`, so a container-scoped harness reports "never rendered" |
| [x] | The filter panel's first `.db-panel-button` is the AND/OR toggle, not "+ Add condition" |
| [x] | A count check alone rewards dropping the last update; pair it with a freshness check or it certifies a stale view |
| [x] | Bench defaults stop at 400 rows; the old ceiling was 1,600. Both sit below the bend |
| [x] | The shipped table bench stubs `renderCell`, so it flatters the table — say so when quoting it |
| [x] | Screenshot fixtures import nothing from `src/` and cannot see any of this — third demonstration |
| [x] | `run-compare.mjs` writes a `dist/`; delete it, it is build residue not evidence |
