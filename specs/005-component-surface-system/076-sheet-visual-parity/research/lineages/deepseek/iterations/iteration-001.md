# Iteration 001 — COVERAGE

**Gap class:** COVERAGE · **Status:** complete · **newInfoRatio:** 0.80
**Findings file:** `findings/iter-1.md`

## Focus

Map every operator request in `roadmap.md` §4 rows 70–9x and every §6A ruling dated 2026-09-08 →
2026-09-11 against the 19 children of `076`'s Phase Documentation Map, task and lane clause; and
every surface in `tools/storybook/sheet-inventory.mjs` (87: 55 primary + 32 stacked) against the same.

## Headline findings

1. **C-1** D9's Source column exists in 7 children (`013`–`019`) and in **none of the eleven sheets**
   (`001`–`012`). `004/spec.md:237` reads `| Element | Ours today | Notion (structural) | Target |`;
   `013/spec.md:221` reads the five-column form D9 requires. The rubric judges Frame/Sections/Controls
   **against the composed target**, so eleven children would be scored against a composition they
   never recorded.
2. **C-2** The 2026-09-11 rulings reach 8 children as remediation and 9 as a **one-line pointer**.
   `003`–`011` carry exactly one D7 mention and no D7 task block; each will burn a judge cycle
   discovering Frame 0 (D7: a card container scores 0 on Frame) that `001`/`002` were handed in
   advance.
3. **C-3** Eight children (`012`–`019`) cite `scratchpad/…` evidence paths that **do not exist** in
   this worktree or the main checkout, including the only copies of the operator's ClickUp reference
   images and the frame-ruling note. The parent's own DEFINE pass rule requires every reference to be
   a real path.
4. **C-4** `dropdown-field.ts` and `checkbox.ts` — the most-reused control family in the programme —
   have no owning child; the coverage audit marks the listbox "covered contextually", the exact
   evidence shape D1 was written to disqualify. Proposed child `020-control-primitives-visual-parity`
   with its six phases.
5. **C-6** The toast is claimed by `017` but its only captures are two of the nine fixtures with no
   constructed counterpart, so `017` must register a scenario **first** or violate D2(b); and
   `chrome-selection-status-bar` / `chrome-table-load-more` are named in `spec.md` §2/§4 but in no
   audit table and no child. `076` also adds nineteen operator gate-(c) rows with no consolidated
   device list, while `roadmap.md` §4A's own device pass carries a stale denominator.
6. **C-7** §4 has three rows numbered 86 and two each numbered 87/88, so "rows 84–9x" is not
   resolvable by number alone.

## Coverage verdict

- Rows 70–88: **no unowned request.** Every one routes to a named packet; `072` reads
  `completion_pct: 100`, `073` `90`.
- Rows 89–94: every 076-relevant row is claimed — `89`→parent, `90`→`012`, `91`→`002`, `92`→`001`,
  `93`→`013`–`017`, `94`→`018`/`019`.
- Surfaces: one genuine gap (`dropdown-field` + `checkbox` → `020`), one partial (`017`'s toast
  needs a constructed scenario), two unrecorded exclusions.
- **Children: 19 exist, 1 proposed (`020`) → 20.**

## What was ruled out

- `016`'s four toolbar-option renderers are **not** dead surfaces left over from the calendar /
  timeline / chart deprecation — all four files are live under `src/views/`; `archive/` holds only the
  view renderers. Hypothesis disproved and recorded.
- `002`–`012` are **not** missing their §13 tables; they are missing the composition column.
- `loop-driver.sh` / `program-loop.sh` are absent from the repository by design (D6 places them in the
  orchestrator's scratchpad) — the graph is reviewable only as spec text, deferred to iteration 5.

## Next focus

**DEPTH (iteration 2):** grade every child's `plan.md`/`tasks.md` per phase against L3/L3+ —
thresholds, RED/GREEN lane clauses with numbers, capture ids, both-theme targets, rubric rows — and
write the missing text for every phase below L3. First measured signal: `001` 138 task lines and
`002` 184 against a uniform 94 for `003`–`011` and 85–87 for `013`–`019`, i.e. the scaffolding depth
is bimodal and the newer children are the thin half.
