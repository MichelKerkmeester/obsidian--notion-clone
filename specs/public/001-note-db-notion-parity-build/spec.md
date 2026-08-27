---
title: "Feature Specification: Note DB Notion Parity Build"
description: "Phase parent for the sequenced build program that closes the forked Note Database plugin's gap to Notion parity in seven dependency-ordered waves."
trigger_phrases:
  - "note db notion parity"
  - "live reports rollups"
  - "rollup aggregation pack"
  - "formula ifs switch let"
  - "nested view filter tree"
  - "conditional format icons"
  - "record detail panel"
  - "two way write back"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "swarm"
    recent_action: "Build phases 002-014 shipped + Sonnet-verified; parent reconciled to Complete"
    next_safe_action: "Build phases in wave order starting at 001-live-reports-rollups; see roadmap.md"
    blockers: []
    key_files:
      - "spec.md"
      - "roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
<!-- CONTENT DISCIPLINE: PHASE PARENT
  Detailed requirements, decisions, tasks, validation, and continuity live in child phases.
-->

# Feature Specification: Note DB Notion Parity Build

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | Phase parent |
| **Priority** | P1 |
| **Status** | Complete — build phases 002-014 shipped, Sonnet-verified, gate-green (tsc0/build0/vitest) on branch impl; 001 config-only (pending), 015-017 deferred/out of scope |
| **Created** | 2026-08-24 |
| **Branch** | `002-note-db-notion-parity-build` |
| **Track** | `notion-parity` |
| **Predecessor** | `001-notion-finance-migration/008-note-db-notion-parity` (research) |
| **Successor** | `001-live-reports-rollups` |
| **Handoff Criteria** | Child packets scaffolded and strict-valid; wave 0 (phase 001) may start; later waves enter only as their dependencies close |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The forked Note Database plugin is already far more capable than the legacy feature list assumed: it ships two formula engines (the Excel-style ComputedField.ts and the Bases method-chaining dialect BaseExpression.ts), 12 column types, 7 view types, and live cross-database relations with display-only rollups. The remaining gap to Notion parity is a set of targeted gaps to close, not a rebuild — but the ranked backlog from the 008 deep-research still lacks a sequenced, dependency-ordered build program.

### Purpose

Turn the 008 backlog into seven dependency-ordered waves (0..6) that close each gap with a minimal, rebase-friendly change — a new isolated module under `src/data/` plus 1-3 call-site edits, following the nl-NL EuroFormat.ts override as the model — so the MIT fork stays mobile-safe, iCloud-safe, and cleanly rebaseable onto upstream. The sharpest finance win (phase 001) needs zero plugin code: it configures Reports to roll up live from Expenses/Sales/Income, reversing the previous track's deliberate choice to store those totals as static values.

> This parent stays lean. Each child phase owns its detailed requirements, decisions, tasks, and validation. Wave 6 items (015 two-way write-back, 016 automations, 017 excluded types) are deliberately deferred or out of scope and carry a lean decision spec at most, never a build plan.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A sequenced build program of fourteen build phases (001-014) plus one deferred decision spec (015), executed in seven dependency-ordered waves.
- Every code change follows the EuroFormat model: a new isolated module under `src/data/` plus 1-3 minimal call-site edits, keeping `git rebase` onto upstream clean.
- Mobile-safe, iCloud-safe behavior: rollups and computed fields stay display-only so child edits never rewrite Report notes.
- MIT-forkable changes only; no telemetry, no secrets, no desktop-only APIs.

### Out of Scope

- Rebuilding the plugin's existing engines, column types, view types, or relations — the plugin is the baseline, not the gap.
- Two-way write-back (015) until an explicit owner decision; on-change automations (016) and person/style()/GoodBases parity (017) are recorded as out of scope.
- Any change that rewrites Report notes on child edits, adds telemetry or secrets, or breaks mobile or iCloud safety.

### Aggregate File Scope

| File Path | Change Type | Phase | Description |
|-----------|-------------|-------|-------------|
| `001-live-reports-rollups/` | Create | 001 | Live Reports roll-up configuration (no plugin code) |
| `002-rollup-aggregation-pack/` | Create | 002 | Aggregate.ts roll-up pack: min/max/median/range/earliest/latest |
| `003-reports-computed-fields/` | Create | 003 | Reports Remaining/Saved computed fields over live rollups |
| `004-formula-ifs-switch-math/` | Create | 004 | Formula IFS/SWITCH + math aliases |
| `005-formula-let-variables/` | Create | 005 | Formula LET/LETS variables |
| `006-link-scheme-fields/` | Create | 006 | URL/email/phone link column type |
| `007-unique-id-stamp/` | Create | 007 | Unique-ID stamp on create |
| `008-derived-inverse-relations/` | Create | 008 | Derived inverse (safe two-way) relations |
| `009-view-filter-tree/` | Create | 009 | Nested AND/OR view filter tree |
| `010-conditional-format-icons/` | Create | 010 | Multi-condition conditional formatting + icons |
| `011-table-multi-group/` | Create | 011 | Table group-by 2+ fields |
| `012-files-column/` | Create | 012 | Files/attachments column |
| `013-template-toolbar-button/` | Create | 013 | Toolbar new-from-template button |
| `014-record-detail-panel/` | Create | 014 | Record detail panel / hover-open |
| `015-two-way-write-back/` | Create (decision spec only) | 015 | Deferred: two-way write-back decision spec; no build plan |
| `016-onchange-automations/` | None — out of scope | 016 | On-change automations recorded out of scope in the parent map |
| `017-excluded-parity-items/` | None — out of scope | 017 | person/style()/GoodBases parity recorded out of scope in the parent map |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

| Phase | Folder | Focus | Wave | Status |
|-------|--------|-------|------|--------|
| 001 | `001-live-reports-rollups/` | Live Reports roll-ups (config, no code) | 0 | Planned |
| 002 | `002-rollup-aggregation-pack/` | Aggregate.ts roll-up pack (min/max/median/range/earliest/latest) | 1 | Complete |
| 003 | `003-reports-computed-fields/` | Reports Remaining/Saved computed fields | 2 | Complete |
| 004 | `004-formula-ifs-switch-math/` | Formula IFS/SWITCH + math aliases | 2 | Complete |
| 005 | `005-formula-let-variables/` | Formula LET/LETS variables | 2 | Complete |
| 006 | `006-link-scheme-fields/` | URL/email/phone link fields | 3 | Complete |
| 007 | `007-unique-id-stamp/` | Unique-ID stamp on create | 3 | Complete |
| 008 | `008-derived-inverse-relations/` | Derived inverse (safe two-way) relations | 4 | Complete |
| 009 | `009-view-filter-tree/` | Nested AND/OR view filter tree | 4 | Complete |
| 010 | `010-conditional-format-icons/` | Conditional formatting: multi-condition + icons | 4 | Complete |
| 011 | `011-table-multi-group/` | Table group-by 2+ fields | 4 | Complete |
| 012 | `012-files-column/` | Files/attachments column | 5 | Complete |
| 013 | `013-template-toolbar-button/` | Toolbar new-from-template button | 5 | Complete |
| 014 | `014-record-detail-panel/` | Record detail panel / hover-open | 5 | Complete |
| 015 | `015-two-way-write-back/` | Two-way write-back (DEFERRED) | 6 | Deferred |
| 016 | `016-onchange-automations/` | On-change automations (OUT) | 6 | Out of scope |
| 017 | `017-excluded-parity-items/` | Excluded parity items: person/style()/GoodBases (OUT) | 6 | Out of scope |

### Phase Transition Rules

- Phases execute in wave order (0..6). A phase enters only when the phases its wave depends on have closed; hard dependencies: 003 needs 001+002; 005 needs 004; 008 needs 001; 010 needs 009.
- Wave 0 (phase 001) is configuration only and has no code diff; it must land before 003 and 008.
- Wave 6 is never-default: 015, 016, and 017 are entered only on an explicit owner decision. 015 carries a lean decision spec; 016 and 017 are recorded as out of scope and get no build plan.
- Every child must pass strict validation at intake and closure. The parent map remains the coordination truth; detailed execution lives in children.

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 008 research | Parent scaffold | Ranked backlog, capability baseline, constraints, and fork location recorded; child contracts scaffolded | Parent strict validation |
| Wave 0 (001) | Waves 1-2 (002, 003) | Reports roll up live from Expenses/Sales/Income; totals stay display-only; zero code diff | Config applied in fork vault; child intake checks |
| Wave 1 (002) | Phase 003 | Aggregate.ts pack closed with min/max/median/range/earliest/latest | Phase 002 acceptance suite |
| Phase 004 | Phase 005 | IFS/SWITCH + math aliases validated before LET/LETS builds on them | Phase 004 checks pass |
| Wave 0 (001) | Phase 008 | Live relations/rollups stable before derived inverse relations | Phase 001 closure evidence |
| Phase 009 | Phase 010 | Nested AND/OR filter tree stable before multi-condition CF + icons | Phase 009 closure evidence |
| Waves 0-5 | Wave 6 review | All fourteen build phases closed before any deferred item re-opens | Explicit owner decision |
<!-- /ANCHOR:phase-map -->

---

<!-- ANCHOR:questions -->
## 4. OPEN QUESTIONS

- Which vault location inside the fork holds the live Reports configuration for wave 0?
- Does each phase's isolated module rebase cleanly onto upstream, and is that checked per phase rather than at the end?
- Will the deferred item 015 (two-way write-back) ever re-enter as a build, and under what iCloud write-churn conditions?
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- Research backlog and ranked roadmap: `001-notion-finance-migration/008-note-db-notion-parity/research/research.md`
- Fork baseline: `001-notion-finance-migration/build/note-database-fork`
- Live Reports roll-ups: `001-live-reports-rollups/spec.md`
- Aggregate pack: `002-rollup-aggregation-pack/spec.md`
- Reports computed fields: `003-reports-computed-fields/spec.md`
- Formula IFS/SWITCH: `004-formula-ifs-switch-math/spec.md`
- Formula LET: `005-formula-let-variables/spec.md`
- Link fields: `006-link-scheme-fields/spec.md`
- Unique-ID stamp: `007-unique-id-stamp/spec.md`
- Derived inverse relations: `008-derived-inverse-relations/spec.md`
- View filter tree: `009-view-filter-tree/spec.md`
- Conditional formatting icons: `010-conditional-format-icons/spec.md`
- Table multi-group: `011-table-multi-group/spec.md`
- Files column: `012-files-column/spec.md`
- Template button: `013-template-toolbar-button/spec.md`
- Record detail panel: `014-record-detail-panel/spec.md`
- Two-way write-back (deferred): `015-two-way-write-back/spec.md`
- Machine metadata: `description.json` and `graph-metadata.json`
