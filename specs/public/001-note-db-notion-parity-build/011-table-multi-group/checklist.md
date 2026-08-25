---
title: "Verification Checklist: Table Group-by 2+ Fields"
description: "Verification checklist for multi-field table grouping; all items pending (scaffold)."
trigger_phrases:
  - "groupbyfields checklist"
  - "multi-field grouping verification"
  - "table grouping checks"
  - "group header indent check"
  - "table subgroup checklist"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/011-table-multi-group"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review findings; refreshed graph metadata; compacted continuity fields"
    next_safe_action: "Build phase 011 per plan.md and tasks.md (T001 then T002)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Table Group-by 2+ Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: `spec.md` documents `groupByFields[]` requirements REQ-001 through REQ-008, NFRs, edge cases, and the locked 1-module + 3-call-site design from `research/synthesis.md`. (Pending — not yet verified.)
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: `plan.md` includes summary, architecture (MultiFieldGrouping exports, depth-aware loop, path-qualified collapse keys), phases, testing, dependencies, rollback, and L2 addenda. (Pending — not yet verified.)
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: `plan.md` lists the upstream fork, `boardSubgroupField` / `getBoardSubgroups` precedent, `EuroFormat.ts` isolated-diff model, and the research synthesis as dependencies. (Pending — not yet verified.)

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/build checks [EVIDENCE: plugin lint/build command]
  - **Evidence**: Fork lint and build commands must exit 0 after the change. (Pending — not yet run.)
- [ ] CHK-011 [P0] No console errors during render matrix [EVIDENCE: dev vault]
  - **Evidence**: Dev vault console must be free of thrown errors across the render matrix (1/2/3 fields, nulls, empty groups, mixed types, checkbox/date at depth, multi-select fan-out, computed/rollup refusal, empty DB, collapsed parent, filter-before-group). The module's planned `console.warn` for leftover computed/rollup fields (`GroupDisplay.ts:64-69`) is an allowed warning, not a failure — fail only on thrown errors. (Pending — not yet run.)
- [ ] CHK-012 [P1] Null/empty-group handling implemented [EVIDENCE: render matrix cases]
  - **Evidence**: Each level gets `t("common.uncategorized")` (`QueryEngine.ts:279`); hide via `showEmptyGroups[field]` (`GroupVisibility.ts:24-30`); `withEmptyOptionGroups` per level (`GroupVisibility.ts:52-60`); multi-select defaults to hidden empties (`:20`); distinct nodes per depth. (Pending — not yet run.)
- [ ] CHK-013 [P1] Code follows the isolated-diff pattern [EVIDENCE: EuroFormat model]
  - **Evidence**: One new module `src/data/MultiFieldGrouping.ts` (pure functions, no renderer imports, `EuroFormat.ts:1-42` contract) + 3 logical call sites; CSS + Embedded additive. (Pending — not yet audited.)
- [ ] CHK-014 [P1] Computed/rollup refusal implemented [EVIDENCE: render matrix]
  - **Evidence**: Table Sub-group picker candidate filter = board filter plus `!isComputedGroupField` (board candidates exclude `file.name` + primary at `ToolbarRenderer.ts:1462`); module drops leftovers with a console warning (`GroupDisplay.ts:64-69`; create gate `TableRenderer.ts:149-150`); never crashes, never writes. (Pending — not yet run.)

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-008]
  - **Evidence**: `spec.md` REQ-001 through REQ-008 must pass. (Pending — not yet verified.)
- [ ] CHK-021 [P0] Manual render matrix complete [EVIDENCE: dev vault]
  - **Evidence**: 1/2/3-field configs, nulls, empty groups, mixed types, checkbox/date at depth, multi-select fan-out, computed/rollup refusal, empty DB, collapsed parent, filter-before-group (`DatabaseView.ts:6313` then `:6332`) verified in the dev vault. (Pending — not yet run.)
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md edge cases]
  - **Evidence**: Edge cases in `spec.md` §8 covered: legacy 1-field byte-identical, null/missing, empty groups, empty DB, filter-before-group, mixed types, checkbox/date at depth, multi-select fan-out, 3+ fields, computed/rollup, collapsed parent, DnD depth-0 only. (Pending — not yet run.)
- [ ] CHK-023 [P1] Mobile viewport + sticky validated [EVIDENCE: ≤360px check]
  - **Evidence**: Nested headers verified at ≤360px; no new media queries; no desktop-only APIs; `tableMinWidth` per header (`TableRenderer.ts:112`) keeps horizontal overflow equal to today (SC-004); collapse toggles stay 20×20; **sticky only at depth 0** (depth ≥ 1 not sticky — no stacked `top` offsets). (Pending — not yet run.)
- [ ] CHK-024 [P1] Persistence round-trip verified [EVIDENCE: dev vault reload]
  - **Evidence**: Set `groupByFields`, reload, confirm preservation; serialize `undefined` when empty (`DataSource.ts:885, 1088`); no `legacyViewKeys` strip entry. (Pending — not yet run.)
- [ ] CHK-025 [P1] Embedded-view regression verified [EVIDENCE: dev vault]
  - **Evidence**: Embedded views render identical nested headers; copy-back `EmbeddedDatabaseRenderer.ts:3353` preserves `groupByFields`. (Pending — not yet run.)

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-026 [P0] Multi-field grouping implemented [EVIDENCE: fork diff]
  - **Evidence**: `groupByFields[]` accepted; recursive indented headers render in `TableRenderer.ts`; `MultiFieldGrouping.ts` exports `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree`, `dropComputedGroupFields`; `TableGroup` carries `depth?`, `path?`, `field?`, `collapseKey?`, `children?`. (Pending — not yet built.)
- [ ] CHK-027 [P0] Single-field backward compatibility + patch behavior [EVIDENCE: before/after render]
  - **Evidence**: `groupByFields` absent ⇒ `effectiveGroupFields = [groupByField]`; flatten depth 0; collapse keys unchanged; before/after render byte-identical; 1-field external patch still succeeds; 2-field patch falls back to full render (safety valve). (Pending — not yet run.)
- [ ] CHK-028 [P1] Path-qualified collapse keys + namespace separation [EVIDENCE: render matrix]
  - **Evidence**: Collapse key = `path.join("::")` under `groupByFields[0]` (depth 0 ⇒ `collapseKey === key`); collapsed parent hides subtree (skip while `depth > collapsedDepth`); `collapsedGroups` (`types.ts:368`) unchanged; collapse key, leaf value, and create defaults are three distinct fields — a new row in `Cat / Type` gets `Category = <cat>` and `Type = <type>`, not `Category = "Cat::Type"`. (Pending — not yet run.)
- [ ] CHK-029 [P1] Diff-shape audit [EVIDENCE: git diff --stat]
  - **Evidence**: One new `src/data/MultiFieldGrouping.ts` module + 3 logical call sites (DatabaseView, TableRenderer, settings types.ts+DataSource.ts); CSS + Embedded additive; no `ViewStateStore`; nested DnD out. (Pending — not yet audited.)

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets [EVIDENCE: diff audit]
  - **Evidence**: Diff audit must show no credential-shaped values. (Pending — not yet audited.)
- [ ] CHK-031 [P0] No network/telemetry [EVIDENCE: diff audit]
  - **Evidence**: No network calls or telemetry in the change (REQ-008). (Pending — not yet audited.)
- [ ] CHK-032 [P0] Display-only / iCloud-safe (no new write paths) [EVIDENCE: diff + render audit]
  - **Evidence**: `groupBy` is pure (`QueryEngine.ts:132-152`); the new module writes nothing; collapse/expand only `scheduleConfigSave` view definition (`DatabaseView.ts:9850-9856`), serialized per-file; no note-body / frontmatter row writes; nested DnD deferred so no new write path (REQ-007 / NFR-R01); grep the new module for vault writes / `fetch`. (Pending — not yet audited.)
- [ ] CHK-033 [P1] Nested DnD deferred [EVIDENCE: diff audit]
  - **Evidence**: `setupGroupDropTarget` called only at depth 0 using the plain leaf `key` (not `collapseKey`); nested groups have no drop target so regrouping cannot `updateBoardGroup` two fields; T011 remains `[B]`. (Pending — not yet audited.)

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: phase 011 files]
  - **Evidence**: `spec.md`, `plan.md`, and `tasks.md` all describe `groupByFields[]`, the `MultiFieldGrouping.ts` module, recursive indented headers, the table-gated toolbar Sub-group picker (not a ViewConfigPanel section), and the 1-module + 3-call-site diff shape. (Pending — confirm at build.)
- [ ] CHK-041 [P1] Code comments carry durable WHY only [EVIDENCE: diff review]
  - **Evidence**: No spec paths, phase numbers, or requirement IDs inside code comments. (Pending — not yet reviewed.)
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Not applicable for a display-only view setting change. (Confirm at build.)

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: no temp files]
  - **Evidence**: No task-created residue outside the fork diff and this phase folder. (Pending — not yet checked.)
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: no scratch dir]
  - **Evidence**: No `scratch/` directory remains in the phase or fork diff. (Pending — not yet checked.)

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 0/9 |
| P1 Items | 11 | 0/11 |
| P2 Items | 1 | 0/1 |

**Verification Date**: Pending — docs rewritten 2026-08-25 to match research synthesis; phase not yet implemented.
**Verified By**: Pending — build per `plan.md` and `tasks.md` required first.

<!-- /ANCHOR:summary -->
