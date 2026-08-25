---
title: "Implementation Plan: Format Parse Persist"
description: "Additive DataSource parse of conditionTree, icon, bold, and optional color using 009 normalizeViewFilterTree."
trigger_phrases:
  - "format parse persist plan"
  - "parseconditionalformats"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/002-format-parse-persist"
    last_updated_at: "2026-08-25T21:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-parse-persist child from synthesis rank 4 and final-plan step 5"
    next_safe_action: "Parse conditionTree/icon/bold/optional color in DataSource.parseConditionalFormats"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-format-parse-persist"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Format Parse Persist

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | DataSource view-config whitelist |
| **Storage** | View YAML `conditionalFormats`; new keys additive |
| **Testing** | JSON round-trip; grep for `parseSourceRuleTree` |

### Overview
Extend `parseConditionalFormats` (`800-825`) so child 001's fields survive reload. Use 009 `normalizeViewFilterTree` only. Stop requiring `color`. Leave `761-765` copy as `{...rule.condition}`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 4 and final-plan step 5 read.
- [ ] Child 001 types exist (`conditionTree?` / `icon?` / `bold?` / optional `color`).
- [ ] 009 `normalizeViewFilterTree` is importable.

### Definition of Done
- [ ] Color-only JSON loads unchanged.
- [ ] Tree+icon+bold and color-omitted JSON load.
- [ ] No `parseSourceRuleTree` in CF parse.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Whitelist parse (existing `parseConditionalFormats`). Additive fields only.

### Key Components
- **`normalizeViewFilterTree`**: view-op tree; not `parseSourceRuleTree` (`SourceRules.ts:227-257`).
- **`OPTION_COLORS`**: still validates `color` when present (`:815`).
- **`condition` object**: required leaf for Apply-to.

### Data Flow
Raw view JSON → `parseConditionalFormats` → typed `ConditionalFormatRule[]` on the view → child 001 evaluator.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: `DataSource.ts` `parseConditionalFormats`. Consumer: child 001 matcher once rules are in memory. Invariant: never call `parseSourceRuleTree`; never drop `condition` because a tree is present.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 types and 009 `normalizeViewFilterTree`.
- [ ] Read `DataSource.ts:800-825` and `:761-765`.

### Phase 2: Core Implementation
- [ ] Additive parse of `conditionTree` / `icon` / `bold`.
- [ ] Stop requiring `color`; allow-list when present.

### Phase 3: Verification
- [ ] Color-only, tree+icon+bold, color-omitted, invalid tree, extra keys, db-level copy.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Integration | Parse then in-memory match | DataSource + child 001 helper |
| Constraint | No `parseSourceRuleTree` | `grep` |
| Unit | Extra-key / invalid-tree cases in child 005 | Vitest later |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 types | Internal | Predecessor | Nothing to parse into |
| 009 `normalizeViewFilterTree` | Internal | Planned | Halt; do not use `parseSourceRuleTree` |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Color-only JSON fails to load; `parseSourceRuleTree` appears; `condition` dropped.
- **Procedure**: Revert `DataSource.ts` `parseConditionalFormats` only. Extra YAML keys remain ignored by old code.
<!-- /ANCHOR:rollback -->
