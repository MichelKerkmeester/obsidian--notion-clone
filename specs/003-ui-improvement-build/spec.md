---
title: "Feature Specification: Note DB UI Improvement Build"
description: "Phase parent for the UI improvement program that turns the two-track UI research into eight dependency-light build phases across the forked Note Database plugin's interface."
trigger_phrases:
  - "note db ui improvement"
  - "ui improvement build"
  - "plugin ui polish"
  - "table grid experience"
  - "popover elevation"
  - "design tokens typography"
  - "views parity polish"
  - "mobile accessibility ui"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Scaffolded eight UI build phases from the two-track research synthesis"
    next_safe_action: "Implement phases in priority order starting with the quick wins"
    blockers: []
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Note DB UI Improvement Build

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
<!-- CONTENT DISCIPLINE: PHASE PARENT
  Detailed requirements, decisions, tasks, and validation live in the child phases.
-->

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | Phase parent |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-27 |
| **Branch** | `impl` |
| **Track** | `ui-improvement` |
| **Predecessor** | `002-ui-improvement-research` (two-track deep research) |
| **Handoff Criteria** | Child phases scaffolded and strict-valid; phases may start independently in priority order |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The forked Note Database plugin is functionally rich — 12 column types, 7 view types, live relations and rollups — but its interface has not kept pace with that capability. Two independent research tracks (Gemini 3.7 Flash High and GPT-5.6-Luna xhigh, ten iterations each) audited the real UI against Anytype, AppFlowy, and Notion and converged on the same conclusion: the gaps are not missing features but missing interface polish — repeated table chrome, low-elevation floating surfaces, undifferentiated toolbars, ad-hoc spacing and type scale, bare empty states, and thin mobile/accessibility affordances.

### Purpose

Turn that research into eight independently shippable build phases, each grounded in concrete `file:line` targets from the research and each holding the plugin's standing constraints. The reference apps supply proven interaction patterns; this program adopts the ones that fit an Obsidian plugin whose rendering must stay display-only.

> This parent stays lean. Each child phase owns its requirements, plan, tasks, and verification. Anytype/AppFlowy pattern findings are cross-cutting and feed every phase rather than forming a phase of their own.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- Eight UI improvement phases covering empty states, the table/grid surface, floating surfaces, toolbar chrome, the design-token layer, the non-table views, micro-interactions, and mobile/accessibility.
- Presentation-layer changes only: rendering, CSS, and view-state affordances.
- Adoption of Anytype / AppFlowy / Notion interaction patterns where they fit the plugin's constraints.

### Out of Scope

- New database capabilities, column types, or view types — this program is interface work.
- Anything that writes to note bodies during rendering, adds telemetry, or requires desktop-only APIs.
- Recommendations the research explicitly excluded for violating the standing constraints.

### Aggregate File Scope

| File Path | Change Type | Phase | Description |
|-----------|-------------|-------|-------------|
| `001-empty-and-first-run-states/` | Create | 001 | Empty, zero-result, and first-run states across every view |
| `002-table-grid-experience/` | Create | 002 | Table/grid headers, cells, row affordances, density, footers |
| `003-popovers-menus-elevation/` | Create | 003 | Popovers, dropdowns, menus: elevation, structure, interaction |
| `004-toolbar-and-view-controls/` | Create | 004 | Toolbar, view switcher, settings, and add/new affordances |
| `005-design-tokens-typography/` | Create | 005 | Color tokens, type scale, spacing, radius, theming consistency |
| `006-views-parity-polish/` | Create | 006 | Board, gallery, calendar, list parity and per-view polish |
| `007-micro-interactions/` | Create | 007 | Hover, drag/reorder, inline edit, selection, loading, error feedback |
| `008-mobile-and-accessibility/` | Create | 008 | Touch targets, Obsidian mobile, contrast, focus, ARIA |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 001 | `001-empty-and-first-run-states/` | Empty, zero-result, first-run and no-database states | Planned |
| 002 | `002-table-grid-experience/` | Table/grid surface: headers, cells, density, footers | Planned |
| 003 | `003-popovers-menus-elevation/` | Floating surfaces: elevation, structure, keyboard/hover | Planned |
| 004 | `004-toolbar-and-view-controls/` | Toolbar chrome, view switcher, settings, overflow | Planned |
| 005 | `005-design-tokens-typography/` | Design tokens, type scale, spacing, theming | Planned |
| 006 | `006-views-parity-polish/` | Board, gallery, calendar, list parity | Planned |
| 007 | `007-micro-interactions/` | Hover, drag, inline edit, selection, feedback | Planned |
| 008 | `008-mobile-and-accessibility/` | Mobile, responsive, contrast, focus, ARIA | Planned |
| 009 | `009-header-affordance-defects/` | Column header menu placement, truncation, cursors | Complete |
| 010 | `010-add-view-popover-layout/` | Add-view popover box model and card tiles | Complete |
| 011 | `011-mobile-table-and-panel-ux/` | Mobile: column auto-fit, record sheet dismissal, touch hover suppression | Complete |
| 012 | `012-mobile-name-column-and-fab/` | Mobile: name-column content sizing, icon open affordance, New button nav-bar clearance | Complete |

### Phase Sequencing

- Phases are dependency-light and may ship independently; 005 (design tokens) is the natural first mover because later phases consume its tokens.
- The research synthesis ranks individual recommendations by impact per unit effort; its quick-wins list is the recommended entry point regardless of phase order.
- Every phase must pass the same gate before it closes: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, plus strict spec validation.

### Standing Constraints (every phase)

- Mobile-safe and iCloud-safe: rendering stays display-only and never writes note bodies.
- MIT-forkable: no telemetry, no secrets, no desktop-only APIs.
- Rebase-clean: prefer an isolated module plus a few call sites over broad edits.
<!-- /ANCHOR:phase-map -->
