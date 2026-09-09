---
title: "Implementation Plan: Phase 5: filter-sort-group-sheets"
description: "[2-3 sentences: what this implements and the technical approach]"
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 5: filter-sort-group-sheets

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (plugin source), CSS (`styles.css`, one file, lane-guarded) |
| **Framework** | Obsidian plugin API; the project's own toolbar/sheet primitives (`toolbar-primitives.ts`, `mobile-bottom-sheet.ts`) |
| **Storage** | None — this phase touches presentation only |
| **Testing** | vitest (unit/structural), Playwright-core (Chrome + WebKit, live DOM measurement) via `tools/live/*.mjs` |

### Overview
Filter, sort and group already share one Notion-style row grammar (44-52px pitch, 16px inset,
single inset-to-inset span, plugin-native pickers). Filter and sort measured green on arrival; the
group popover's own overflow sweep and heading-divider clause were red. Both traced to shared
mechanics the group popover alone exercises in this fixture (a scrollbar the popover's tall content
triggers, and a `:first-of-type` selector matched against the wrong DOM census) rather than to
group-specific markup, so both fixes stay at the mechanism rather than special-casing one surface.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md` §2-3, §4b gap table)
- [x] Success criteria measurable (`acceptance-criteria.md`, `sheet-grammar.mjs`'s panel-row-grammar and overflow-sweep clauses)
- [x] Dependencies identified (Phase 1's reference mapping, already cited in the gap table)

### Definition of Done
- [x] All acceptance criteria met (`acceptance-criteria.md`)
- [x] Tests passing (`npx vitest run` 1727/1727; `tools/live/sheet-grammar.mjs`, `sheet-rebuild.mjs`, `render-assertions.mjs`, `touch-targets.mjs`, `verify-placement.mjs` all green; `npm run gate` 27/27)
- [x] Docs updated (spec/plan/tasks/acceptance-criteria/decision-record/implementation-summary, parent `handover.md`)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Presentation-layer fix inside an existing renderer/stylesheet architecture — no new component, no
new data flow. The three sheets' producers (`filter-panel-renderer.ts`, `sort-panel-renderer.ts`,
`toolbar-renderer.ts`'s `renderGroupPopover`) already build the DOM this phase's CSS targets.

### Key Components
- **`styles.css` family rules** (filter/sort/group `.obnotion-mobile-bottom-sheet` selectors): own the row pitch, inset, divider and now the scrollbar-hiding and sibling-combinator divider fix.
- **`mobile-bottom-sheet.ts`**: owns the shared drag-handle chrome (`applySheetChrome`, `createSheetHandle`) whose `::before` band assumes a scrollbar-free content box — untouched by this phase, cited in `decision-record.md` ADR-001 as the seam the fix respects rather than edits.
- **`tools/live/sheet-grammar.mjs`**: the live measurement gate this phase's fixes were driven by (panel-row-grammar clauses, the all-sheets overflow sweep).
- **`tools/storybook/sheet-inventory.mjs`**: the coverage inventory generator, given a curated producer for the `group` registry row this phase's gap table already named.

### Data Flow
No data flow change. A phone renders the same sheet DOM; the stylesheet now hides the desktop-style
scrollbar on these three sheets (so the shared drag handle centres correctly whether or not the
sheet's content needs to scroll) and divides the group popover's sections by sibling position in its
own title list rather than by DOM-wide tag position.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Use this section when `research_intent=fix_bug`, when planning from a deep-review FAIL/CONDITIONAL verdict, or when any finding touches security, path handling, env precedence, schema boundaries, persistence, public responses, or shared policy.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| [producer/helper/policy] | [what owns the behavior] | [update/unchanged/not a consumer] | [grep/test/doc evidence] |
| [consumer/status/docs/tests] | [how it observes the behavior] | [update/unchanged/not a consumer] | [grep/test/doc evidence] |

Required inventories:
- Same-class producers: `rg -n '<field|string|helper|literal|error-pattern>' <module-or-files>`.
- Consumers of changed symbols: `rg -n '<changedSymbol>|<changedConstant>|<changedPublicField>' . --glob '*.ts' --glob '*.js' --glob '*.md'`.
- Matrix axes: list every independent input axis and the required rows before implementation.
- Algorithm invariant: for path/redaction/parser/resolver/security fixes, state the invariant and adversarial cases.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | [Components/functions] | [Jest/pytest/etc.] |
| Integration | [API endpoints/flows] | [Tools] |
| Manual | [User journeys] | Browser |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| [System/Library] | [Internal/External] | [Green/Yellow/Red] | [Impact] |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: [Conditions requiring rollback]
- **Procedure**: [How to revert changes]
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Setup) ──────┐
                      ├──► Phase 2 (Core) ──► Phase 3 (Verify)
Phase 1.5 (Config) ───┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core, Config |
| Config | Setup | Core |
| Core | Setup, Config | Verify |
| Verify | Core | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | [Low/Med/High] | [e.g., 1-2 hours] |
| Core Implementation | [Low/Med/High] | [e.g., 4-8 hours] |
| Verification | [Low/Med/High] | [e.g., 1-2 hours] |
| **Total** | | **[e.g., 6-12 hours]** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup created (if data changes)
- [ ] Feature flag configured
- [ ] Monitoring alerts set

### Rollback Procedure
1. [Immediate action - e.g., disable feature flag]
2. [Revert code - e.g., git revert or redeploy previous version]
3. [Verify rollback - e.g., smoke test critical paths]
4. [Notify stakeholders - if user-facing]

### Data Reversal
- **Has data migrations?** [Yes/No]
- **Reversal procedure**: [Steps or "N/A"]
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Phase 1   │────►│   Phase 2   │────►│   Phase 3   │
│   Setup     │     │    Core     │     │   Verify    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │  Phase 2b │
                    │  Parallel │
                    └───────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| [Component A] | None | [Output] | B, C |
| [Component B] | A | [Output] | D |
| [Component C] | A | [Output] | D |
| [Component D] | B, C | [Final] | None |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **[Phase/Task]** - [Duration estimate] - CRITICAL
2. **[Phase/Task]** - [Duration estimate] - CRITICAL
3. **[Phase/Task]** - [Duration estimate] - CRITICAL

**Total Critical Path**: [Sum of durations]

**Parallel Opportunities**:
- [Task A] and [Task B] can run simultaneously
- [Task C] and [Task D] can run after Phase 1
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | [Setup Complete] | [All dependencies ready] | [Date/Phase] |
| M2 | [Core Done] | [Main features working] | [Date/Phase] |
| M3 | [Release Ready] | [All tests pass] | [Date/Phase] |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: [Decision Title]

**Status**: [Proposed/Accepted/Deprecated]

**Context**: [What problem we're solving]

**Decision**: [What we decided]

**Consequences**:
- [Positive outcome 1]
- [Negative outcome + mitigation]

**Alternatives Rejected**:
- [Option B]: [Why rejected]

---

