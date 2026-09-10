---
title: "Implementation Plan: Phase 15: sheet-design-fundamentals"
description: "Raise the calendar mini-nav's coarse-pointer touch target to match its siblings, and register the missing group-sheet screenshot scenario, so both cross-sheet findings from the design review are fixed or made reviewable."
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 15: sheet-design-fundamentals

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | Plugin's own panel/sheet renderers + the screenshot capture harness |
| **Storage** | None |
| **Testing** | Vitest + the live lane harness (`tools/live/sheet-grammar.mjs` / `touch-targets.mjs`) + the screenshot harness |

### Overview
Two cross-sheet findings from `../sheet-design-review.md` land here because no single existing
child owns the surface or the gap: a 24×24px calendar-navigation control shared by three sheet
families, and a missing capture scenario for the toolbar's Group-by sheet.

### Reference mapping
Neither item is a Notion-parity question — both are `sk-design-fundamentals` findings (Fitts's Law
touch-target sizing; `screenshot-currency.md`'s capture-before-claiming-done rule). No number in
this child is derived from a Notion asset because none is cited; the touch-target floor comes from
`interaction-craft.md` §3 and the project's own sibling-control precedent
(`styles.css:24462-24486`).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented
- [x] Success criteria measurable
- [x] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing
- [ ] Docs updated (spec/plan/tasks)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Two independent, additive changes: a CSS rule joining an existing media-query block, and a
screenshot scenario following the existing `sort-panel`/`filter-panel` registration pattern. No new
pattern.

### Key Components
See `spec.md` §3's Files to Change.

### Data Flow
Unchanged. No producer logic, stored shape or control behavior moves.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — a CSS floor raise and a capture-harness registration. No security, path handling,
env precedence, schema boundary, persistence, public response or shared policy is touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | Touch-target floor, RED before GREEN | `tools/live/touch-targets.mjs`, `tools/live/sheet-grammar.mjs` |
| Capture | The new `group` scenario exists, is registered, and has been opened and looked at | `npm run screenshots`, manual review |
| Regression | Every landed sheet clause, both engines | `tools/live/sheet-grammar.mjs`, `npm run gate` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `012-sort-and-group-sheet-rows`'s Shown/Hidden partition | Internal | LANDED 2026-09-10 | The new scenario photographs `012`'s shipped content; if `012`'s producer changes again, the scenario's fixture may need a matching update, same as any other capture |
| The design review this child was opened from | Internal | Complete | `../sheet-design-review.md` §6 F-5, §9 F-7 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: The touch-target floor raise shifts the date picker's header row layout in a way
  the capture diff shows as a real (not sub-pixel-jitter) regression.
- **Procedure**: Revert the `styles.css` addition; `.obnotion-calendar-mini-nav` returns to 24px
  and the new lane clause goes red with it, reverted in the same commit.
<!-- /ANCHOR:rollback -->
