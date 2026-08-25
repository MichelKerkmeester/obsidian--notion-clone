---
title: "Implementation Plan: Format Match Paint Module"
description: "Halt on 009 APIs, then same-diff types, tree eval, icon/bold/color-optional paint, and CF CSS inside ConditionalFormatting.ts."
trigger_phrases:
  - "format match paint plan"
  - "evaluatefiltertree"
  - "applyconditionalformat"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/001-format-match-paint-module"
    last_updated_at: "2026-08-25T21:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored match-paint child from synthesis and final-plan"
    next_safe_action: "Halt on 009 APIs, then extend ConditionalFormatting.ts plus types and CSS"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-format-match-paint-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Format Match Paint Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | In-memory `ViewConfig` only this child; vault parse is child 002 |
| **Testing** | Baseline color-only rows plus in-memory tree cases; vitest file is child 005 |

### Overview
Confirm 009 exported `evaluateFilterTree` / `normalizeViewFilterTree`, inventory today's helper, then land types + match/eval + paint + CSS as one shippable diff. Do not add `ConditionalFormatTree.ts`. Do not edit renderer consumers.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1, 2, 6, 7, 9-paint and final-plan steps 0–4 read; icon/bold kept with trees.
- [ ] `src/data/ViewFilterTree.ts` and `QueryEngine.evaluateFilterTree` exist on disk.
- [ ] Baseline color-only first-match recorded on representative finance rows.

### Definition of Done
- [ ] Skip guard accepts a non-empty `conditionTree` (`:31` relaxed).
- [ ] Tree match is `evaluateFilterTree(...) === true`; legacy keeps `applyFilters` (`:38`).
- [ ] Paint covers icon/bold/optional color; TR icon lands in the first non-select `td`.
- [ ] CSS classes sit next to `styles.css:469-484`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
In-place EuroFormat surface (`ConditionalFormatting.ts` already owns every consumer). Pure match + DOM paint; no vault write.

### Key Components
- **`types.ts:143-152`**: additive optional fields including `color?: StatusColor`.
- **`getConditionalFormatMatch`**: first-match walk (`:29-41`) with 009 Kleene mapped to CF fail-closed.
- **`applyConditionalFormat`**: paint/clear CSS vars, bold class, icon attr/span (`:44-69`).

### Data Flow
`config.conditionalFormats` in list order → skip / target filter → tree or eval-time wrap → `evaluateFilterTree === true` (or legacy `applyFilters`) → first `{ color?, icon?, bold?, ruleId }` → paint on the passed `HTMLElement`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: `ConditionalFormatting.ts` plus additive `types.ts` and `styles.css`. Consumers this child must **not** edit: Table `463`/`503`, List, Board, Gallery, Calendar, CalendarTimeline, RecordDetailPanel, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`. Algorithm invariant: never treat `applyFilterTree` kept-row as a CF match; never invent `rule.color \|\| "gray"`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm `ViewFilterTree.ts`, `evaluateFilterTree`, `applyFilterTree`, `normalizeViewFilterTree`. Stop if absent.
- [ ] Read `ConditionalFormatting.ts:23-69` and `types.ts:143-152`. Record color-only baseline.

### Phase 2: Core Implementation
- [ ] Additive types at `types.ts:143-152`.
- [ ] Match + paint per final-plan step 3 (same diff as types).
- [ ] CSS beside `styles.css:469-484` (same diff).

### Phase 3: Verification
- [ ] Legacy color-only ≡ baseline; AND/OR in-memory trees; E2/E3/E5/E11/E12; TR icon not a child of `tr`.
- [ ] Grep this child for a second matcher and for `parseSourceRuleTree`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual / REPL | Legacy color-only ≡ baseline; in-memory AND/OR; TR icon placement | Fork source |
| Constraint | No renderer consumer edits; no `applyFilterTree` as CF matcher | `grep` |
| Unit | Twelve helper cases wait for child 005 | Vitest later |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| 009 `evaluateFilterTree` | Internal | Planned / absent on disk | Halt; no private walker |
| Children 002–005 | Internal | Later | New keys do not load from vault until 002 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Private CF walker appears; `applyFilterTree` used as matcher; icon/bold shipped without tree eval; TR gets a span child.
- **Procedure**: Revert `ConditionalFormatting.ts`, `types.ts`, and `styles.css` as one unit. Leave extra in-memory fields unused. Do not leave optional `color` on the type without paint that skips unset color.
<!-- /ANCHOR:rollback -->
