# Sonnet 5 Verification — 011-table-multi-group

- Reviewer: Claude Sonnet 5 (read-only; verified in an isolated `git worktree` @ `d9e038c`, cleanly removed — insulated from the dirty concurrent 012 tree)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` (range `8a14675^..d9e038c`, 5 commits) vs `spec.md` + `research/{synthesis,final-plan}.md`
- Gate re-run at review time (isolated worktree): `tsc --noEmit` exit 0; `vitest` 17 files / 181 tests pass

## Verdict

**CONCERNS (P0)** — the data/logic layer is correct and robust, but the phase's own P0 requirement (REQ-003: indented, non-overlapping nested group headers) is **not actually shipped** — its `styles.css` was never committed. Same driver root cause as 010, but here it fails a P0 acceptance criterion.

## Findings

### P0 — REQ-003 not shipped (missing committed CSS)
- `git diff 8a14675^..d9e038c -- styles.css` is **empty** — zero CSS across all 5 commits, though `TableRenderer.ts:123,128-129` applies `getGroupHeaderClassName(depth)` (`MultiGroupDisplay.ts:21-26`) emitting `db-group-header db-group-header--depth-N` + inline `--db-group-depth` for any depth ≥ 1.
- The rules that give those classes meaning — `padding-left: calc(16px * var(--db-group-depth,0))`, `position: relative` un-stick for `:not(.--depth-0)`, consecutive-header `margin-top` — exist **only in the uncommitted working tree** (`styles.css:6199-6208,6281`). Whole-tree `git grep -l "db-group-header--depth" d9e038c` finds only `main.js` + docs/tests — no CSS file supplies the rule.
- **Production effect:** nested (depth ≥ 1) headers render with **zero indentation** (indistinguishable from depth 0) and stay `position: sticky` with identical `top`/`z-index` — the explicitly-named "sticky stacking" risk (spec §6, final-plan) is **unmitigated**; two depths visually overlap exactly as the risk register predicted. REQ-003 is a P0 blocker in `spec.md` §4.

### Correctness — otherwise strong (verified, not trusted)
- `MultiFieldGrouping.ts:31-88`: `effectiveGroupFields`, recursive `buildGroupTree`, preorder `flattenGroupTree` (collapseKey = `key` at depth 0, `path.join("::")` deeper) match spec; hand-traced + `MultiFieldGrouping.test.ts` node-by-node.
- **Collapse-key/leaf-value/create-defaults conflation risk avoided:** `TableRenderer.ts:225-236` (`getGroupPath`) rebuilds per-level `{field,key}` from `group.path` + a `fieldsByDepth` accumulator; `getGroupDefaults` (`:238-246`) merges per level — a new row in `Cat/Type` gets `Category="Cat", Type="Type"`, not `"Cat::Type"`.
- Collapsed-subtree skip (`TableRenderer.ts:113-117`, single `collapsedDepth`) traced across collapse-at-0/1/sibling scenarios — correct.
- **1-field backward compat (REQ-004):** all grouping now routes through `buildGroupTree`/`flattenGroupTree`; a 1-field config yields depth-0 nodes with `collapseKey===key`, functionally identical to the old flat path (code-traced).
- Persistence: `DataSource.ts:900-902/1108` whitelist-adds `groupByFields`; `DataSource.test.ts` round-trips + filters non-strings + omits empty.
- `setGroupByField` (`DatabaseView.ts:2421-2432`) mutates only when `viewType==="table"` — board/gallery/list/timeline untouched.
- Embedded parity (`EmbeddedDatabaseRenderer.ts:1013-1039,3397`): same calls + `origView.groupByFields` copy-back (no silent drop on settings save).
- Sub-group picker (`TableSubgroupPicker.ts`, `ToolbarRenderer.ts:1269-1479`) clones the board popover (not the dead-end table settings path), adds `!isComputedGroupField`, gated to table.

### Coverage / No-regression / Safety
- Synthesis #1–#8 implemented; #9 (2nd picker), #10 (nested DnD) explicitly deferred (spec §3). The one gap is the CSS half of #3/#4 — the P0 above.
- Diff scoped to 6 files + 4 new; board/gallery/list/timeline + `patchGroupedRows` untouched; `tryPatchExternalTableRows` intentionally falls back to full re-render for 2-field trees (documented safety valve).
- `MultiFieldGrouping.ts`/`MultiGroupDisplay.ts` pure (no renderer imports/fetch/writes); `setupGroupDropTarget` + row-move gated to `depth===0` everywhere (deferred-nested-DnD, iCloud-safe).

### Tests
`MultiFieldGrouping/MultiGroupDisplay/TableSubgroupPicker.test.ts` + `DataSource.test.ts` meaningfully cover recursion, computed-field dropping (warning counts), candidate filtering, persistence. No `TableRenderer.test.ts` for the depth-aware DOM loop — but the whole codebase has never had renderer DOM tests (project convention), so not an 011 regression; still the gap that let the CSS miss through.

## Fix-stage targets
- **P0 — commit the group-header depth CSS** (from the uncommitted `styles.css:6199-6208,6281`). Do NOT blind-commit the whole dirty file — it also carries 010's `db-conditional-format-*` CSS; the accumulated-CSS catch-up commit should stage all shipped phases' CSS together and be reviewed hunk-by-hunk.
- **Doc reconciliation** (6 `implementation-summary.md`, packet-wide pattern).
