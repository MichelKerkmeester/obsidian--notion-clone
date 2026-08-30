<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
**Phase 028 — Remaining freezes**

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. Runs after `024`, which fixed one of at least three instances of the same defect. Needs no lane — the CSS lane is free and this phase does not want it.

**READ FIRST:** `../024-list-view-freeze/implementation-summary.md` — especially §2, which names the two renderers it deliberately did not fix — then this folder's `spec.md` and `acceptance-criteria.md`.

**THE REPORTS ARE SIX, THE BOUNDARY IS ONE.** List view freezes. Board view freezes. Calendar and "other non table views" freeze. The sort sheet freezes on add and on close. The filter sheet does the same. **The table does not.** Six reports read like six bugs; *every non-table view freezes and the table does not* reads like one defect with a name — and it hands you a control you cannot fake, because any candidate cause that is also on the table path is refuted by the table working.

**THE PREVIOUS REPAIR WAS REAL AND INSUFFICIENT.** `024` found a genuine quadratic — `isTouchDevice()` calling `getBoundingClientRect()` once per row, inside the loop appending to that same container — hoisted it, measured **8,646ms → 246.6ms blocked at 1,600 rows (35.1×)**, and shipped it. The operator still freezes. That is not a failed fix. It is a fix for one of at least three sites, and `024` §2 says so in writing: *"The same quadratic in `TableRenderer`. Already measured and written up. Fixing it is a different phase."* Record it this way or the next reader either re-finds it or dismisses it.

**MEASURED: THE PATTERN SURVIVES IN TWO MORE RENDERERS.** `024` hoisted `list-renderer.ts:161` and `:184`. The identical construct is still live at **`board-renderer.ts:770`**, inside `private renderCard` (declared `:730`), called from three loops at `:334`, `:583` and `:657` that append to the same `cards` container — a forced layout per card, in the loop building the cards. And at **`table-renderer.ts:790`**, inside `renderRow`, where it is worse: `list` and `board` short-circuit behind `!isReadOnly`, the table calls it first and unconditionally on every row. **Board freezing is `024`'s defect, in `024`'s shape, in a file `024` did not open.** Of 33 non-test call sites, 3 are per-item; the audit table is `spec.md` §5.

**AND THE HYPOTHESIS THIS PHASE WAS HANDED IS REFUTED.** The card pipeline was the obvious suspect: table renders through `cell-renderer.ts`, every other view through `card-field-renderer.ts`, and that split is the architecture research's own root finding. It dies on measurement. At one matched shape — 21 columns, 30% fill, 390px, real `ListRenderer` against real `TableRenderer` — **the table is slower at every row count measured**: 65.1ms against 45.1ms at 400 rows, 712.6ms against 429.2ms at 3,200, **5,641.7ms against 2,665.3ms at 12,800** — while building 10% *fewer* DOM nodes, and with its cell renderer stubbed to constant time, which flatters it. If render cost through the card pipeline were the cause, the table would freeze first. **Do not spend this phase in `card-field-renderer.ts`.**

**THE ROW COUNT NOBODY HAS ESTABLISHED, ESTABLISHED.** Every freeze number in this program came from a bench topping out at 1,600 rows — and 1,600 is below the bend. Pushed to 12,800 the list is **SUPERLINEAR, per-row ×2.55 desktop and ×3.21 phone-width**, and `npm run bench:list --rows=…,12800 --cols=21 --fill=0.3` **exits 1** at 2,877.7ms against its own 2,000ms budget. Read at phone-class CPU (6× throttle, the operator holds a phone, not an M-series Mac) the list crosses 2,000ms at **≈2,300 rows** at 21 columns — 1,290.5ms at 1,600 and 2,990.0ms at 3,200. **So the answer is roughly two to three thousand rows, not twelve thousand.** It is scale, so the row count decides the phase: **this is a virtualisation question, not a micro-optimisation one.**

**THE SHARED TRIGGER IS ONE METHOD AND IT IS NOT IN A RENDERER.** Every sheet report routes through `DatabaseView.refresh()` (`database-view.ts:11421`), which removes all top-level rendered output and calls `render()` — a full rebuild of every row. Add-sort reaches it at `sort-panel-renderer.ts:88`; the sheet's own close at `database-view.ts:2816`; the toolbar toggle at `:2810`; an outside click at `:2916`. The filter panel is wired identically at `:2801` and `:2787`. **The sheets are not broken. They are doorways onto a render that is too slow on the operator's data**, which is also why *closing* one freezes — otherwise a strange thing for a dismissal to do. Opening, adding a rule and closing is **three** full rebuilds: ≈7s of frozen app at 2,300 rows on a phone.

**ONE CONTRADICTION IS OPEN AND MUST NOT BE PAPERED OVER.** Measurement says the table is the slowest surface here and carries an unfixed per-row forced layout; the operator says the table works. Both cannot be true of the same data. Four reconciliations were tested and **all four failed**: the table does not paginate or virtualise, it caps rows only when grouped exactly as the card views do, it draws its columns from the same `getVisibleColumns(config, rows, vs, pendingShowColumns)` call the list does, and the `ResizeObserver` in `observeTouchEnvironment` is guarded against re-entry. **Resolve it with the operator before building** — `spec.md` §7 carries the three questions. If their table view is a different database or a different row count, the boundary is an artefact and the defect is plain scale; if it is genuinely the same data, something is still unfound and a virtualisation build would be aimed at the wrong target.
<!-- /ANCHOR:directive -->

<!-- ANCHOR:completion -->
**ACCEPTANCE — thresholded, failing value recorded, control named.**
- One full-view rebuild stays under budget at the operator's confirmed shape, at phone-class CPU. **Today: 2,990.0ms at 3,200 rows × 21 cols at 6× throttle.**
- The per-item forced layout is gone from `board-renderer.ts:770` and `table-renderer.ts:790`, each shown failing first on the pre-fix tree. **Today: 2 of 3 sites unfixed.**
- The scaling verdict is not SUPERLINEAR at any measured shape up to 12,800 rows. **Today: ×2.55 desktop, ×3.21 phone, ×4.5 table.**
- Opening, mutating and dismissing a sort or filter sheet costs **one** rebuild, not three.
- The table remains the control: whatever is fixed must explain why the table was already fine, or the boundary was never real.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:log -->
**TRAPS.** A pipe makes `$?` the pipe's status — use `cmd >log 2>&1; echo $?`. The screenshot fixtures render hand-written markup and import nothing from `src/`, so they cannot see any of this — but `tools/bench/*-render-bench.ts` and `verify-placement.mjs:52-60` **do** bundle shipped code, and are the instruments that can. The shipped table bench stubs `renderCell` to `td.setText`, so it measures structure only and flatters the table; say so wherever you quote it. `bench:list` defaults stop at 400 rows and the old ceiling was 1,600 — **any run that does not pass `--rows` past 3,200 cannot see this defect at all.**

**DONE MEANS** the operator opens a list on their phone, adds a sort, closes the sheet, and the app never stops responding.
<!-- /ANCHOR:log -->
