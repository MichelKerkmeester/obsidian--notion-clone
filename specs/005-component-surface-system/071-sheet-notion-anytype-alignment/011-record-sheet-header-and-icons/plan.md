---
title: "Implementation Plan: Phase 11: record-sheet-header-and-icons"
description: "The record sheet is the one phone sheet whose title does not centre, because it builds its own header instead of the shared one the centring contract queries — so the contract covers thirteen surfaces and misses this one. This phase brings record-detail and record-peek under the contract and gives their property rows the type icon every sibling surface already shows."
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 11: record-sheet-header-and-icons

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | Plugin's own panel/sheet renderers |
| **Storage** | None (producer layout + styles + captures only) |
| **Testing** | Vitest + the live lane harness (`tools/live/sheet-grammar.mjs`) |

### Overview
The record sheet is the one phone sheet whose title does not centre, because it builds its own header instead of the shared one the centring contract queries — so the contract covers thirteen surfaces and misses this one. This phase brings record-detail and record-peek under the contract and gives their property rows the type icon every sibling surface already shows.

### Reference mapping (REQ-001 evidence)
Taken from `../sheet-notion-audit.md` and its §0. **Every Notion iOS capture in this repository is
299x678** — verified with `sips` over a 400-file sample of all 1,315 files and over all 171 files
in the five folders this packet's family leans on. The Notion column in `spec.md` §13 is therefore
**structural only**: row order, row type, control type, grouping, header and footer shape, copy.
**Every number in the Target column is ours** — from `node tools/live/sheet-grammar.mjs`, from
`styles.css` read directly, or from `src/i18n.ts` counted directly — or is marked
`TBD — needs operator capture` and listed in the audit's §5.
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
Producer/renderer + stylesheet, the same shape every other sheet family here uses. No new pattern.

### Key Components
See `spec.md` §3's Files to Change; each row names the file and what it gains.

### Data Flow
Unchanged. This phase is presentational — no behaviour, persistence or stored shape moves; only
the arrangement, labelling or copy of the controls that read and write them.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — a UI change on the sheets named in `spec.md` §3. No security, path handling, env
precedence, schema boundary, persistence, public response or shared policy is touched.
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
| Lane (live) | Each measured property in `spec.md` §13, plus the prior phases' regression set | `tools/live/sheet-grammar.mjs` |
| Unit | Revert-proof contract for each new class or string rule | Vitest |
| Manual/device | Whole-surface read | Operator's own iPhone (D3, not agent-tickable) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The landed row grammar of `002`-`006` | Internal | Green | Must not regress; each packet's REQ names its own regression clause |
| An operator device capture (audit §5) | External | Not supplied | Structural requirements are unaffected; only `TBD` numeric cells wait on it |
| `007`'s card-grouping decision (audit §6 ADR-A) | Internal | **LANDED 2026-09-09** (`a56020f7`+`48dbd5d9`; 2/2 cards, radius ≥8px, distinct backgrounds, gap ≥8px, its four card metrics provisional until its own T001 operator capture) | Not blocking: no packet here adds a card or canvas treatment. Once `007`'s metrics are retuned, ADR-A decides whether the treatment propagates to these families |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: A change here regresses a landed clause from `002`-`006` and the regression cannot be closed inside this phase's Files to Change.
- **Procedure**: Revert this phase's producer and stylesheet changes; the surfaces return to their shipped shape, which stays green on the existing lane. The new lane clauses go red and are reverted in the same commit.
<!-- /ANCHOR:rollback -->
