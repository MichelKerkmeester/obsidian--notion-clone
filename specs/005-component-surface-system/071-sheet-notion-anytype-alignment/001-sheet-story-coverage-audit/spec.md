---
title: "Feature Specification: Phase 1: Sheet Story Coverage Audit"
description: "Enumerate every sheet, panel and popover the app can open; map each to story/screenshot coverage and a Notion/Anytype reference capture, answering the operator's R7."
trigger_phrases:
  - "071 phase 1"
  - "sheet story coverage audit"
  - "sheet inventory"
  - "notion anytype reference mapping"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 1: Sheet Story Coverage Audit

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The operator asked whether the app truly has screenshots and stories for every sheet, and whether each aligns as closely as possible to Notion/Anytype. This phase answers that with an inventory table, not an assumption, and hands every later phase in this packet its own row of that table before it starts redesigning anything.

**Key Decisions**: The inventory is the gate — no later phase may claim a sheet is "covered" without a row here naming its coverage state and its reference mapping.

**Critical Dependencies**: None — this phase reads the existing app, harness and screenshot tree; it does not depend on any other packet's work landing first.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Implemented (inventory leg) — 2026-09-08: 86-row inventory + regenerating script + count test landed; 002-006 not started |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 1** of the Sheet family alignment to Notion x Anytype specification.

**Scope Boundary**: Inventory and mapping only — no sheet is redesigned in this phase.

**Dependencies**: None.

**Deliverables**:
- One inventory table: every sheet/panel/popover the app can open, its story-coverage state, its screenshot-manifest state, and its Notion/Anytype reference mapping (or the explicit absence of one)
- Coverage-gap fixes in `tools/storybook/story-coverage.mjs` / `story-coverage-allowlist.json` and `screenshots/manifest.json` for anything the inventory finds missing

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator's R7 asks a direct question this program has never answered as a single artifact: "Do we truly have screenshots and stories for every single sheet in app currently?" Coverage has been built incrementally, sheet by sheet, packet by packet (`013`, `027`, `048`, `051`, `054`, `067`), and no single document lists every sheet-capable surface against its coverage and reference state.

### Purpose
One inventory table exists, naming every sheet/panel/popover the app can open, its coverage state in the story/screenshot harnesses, and its Notion/Anytype reference mapping — so every later phase in this packet starts from a known state rather than a guess.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Enumerating every sheet/panel/popover surface: settings, add-property/property-type picker, view-config (title field/format, column settings), filter, sort, group, record detail, menu cards, and anything the enumeration finds beyond this starting list
- Reading `tools/storybook/story-coverage.mjs` and `story-coverage-allowlist.json` to determine which surfaces are covered, allowlisted (exempt), or blind
- Reading `screenshots/manifest.json` to determine which surfaces have a captured screenshot
- Reading `screenshots/notion/` and `screenshots/anytype/` to map each surface to a reference capture, or recording that none exists
- Closing any coverage gap the inventory finds that is a same-session fix (an allowlist entry that should be a real story, a manifest entry that is missing)

### Out of Scope
- Redesigning any sheet against its reference — that is phases 2-6
- Capturing new Notion/Anytype reference material where none exists — recorded as a gap for a later phase to capture, not done here

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `tools/storybook/story-coverage.mjs` | Modify | Close story-coverage gaps the inventory finds |
| `story-coverage-allowlist.json` | Modify | Remove allowlist entries the inventory finds should be real stories |
| `screenshots/manifest.json` | Modify | Register any surface missing a manifest entry |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Produce one inventory table naming every sheet/panel/popover surface, its story-coverage state, its screenshot-manifest state, and its Notion/Anytype reference mapping |
| REQ-002 | Close any coverage gap that is a same-session fix (allowlist-should-be-story, missing manifest entry) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | For every surface with no Notion or Anytype reference capture, record that gap explicitly rather than silently skipping it |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The inventory table's row count matches an independently-grepped count of sheet-capable surfaces in `src/` (no surface silently omitted)
- **SC-002**: Every row names a reference mapping or an explicit "no reference captured" state — no blank cells
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The inventory undercounts because a sheet is opened conditionally (feature flag, config-gated) | A later phase would redesign against an incomplete reference set | Grep for every call site of the shared sheet-shell/panel-open functions, not just the visible menu of sheets |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

Not applicable — this phase produces a document, not a runtime change.

## 8. EDGE CASES

- A sheet that exists in code but is unreachable from any current UI path — recorded in the inventory as dead code, not silently dropped
- A sheet family covered by Anytype's reference but not Notion's, or vice versa — recorded per-reference, not collapsed into a single yes/no

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 10/25 | One inventory pass, plus targeted allowlist/manifest fixes |
| Risk | 5/25 | Documentation-only; no runtime change |
| Research | 15/20 | Requires reading the full sheet-opening call-site surface, not just the obvious menu |
| **Total** | **30/70** | **Level 3** (parent packet's own architectural/file-count score, not this phase alone) |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Undercounted inventory | Medium | High (every later phase inherits the gap) | Grep-based enumeration, not manual recall |

## 11. USER STORIES

- As the operator, I want to know which sheets already have screenshots and stories, so the next redesign pass does not waste time rediscovering coverage I already asked for
- As a later phase in this packet, I want a reference mapping I can trust, so I redesign against the right target on the first attempt

## 12. OPEN QUESTIONS

- Does every sheet route through one shared sheet-shell component, or do some (e.g. the property-type picker per R6) still mount independently — this phase's enumeration answers it directly
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Plan**: `plan.md`
- **Tasks**: `tasks.md`
