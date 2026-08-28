---
title: "Feature Specification: Component Screenshot System"
description: "Phase parent for the screenshot system that photographs every documented view, component and state of the forked Note Database plugin in dark and light, and fails a check when a capture falls behind the code it depicts."
trigger_phrases:
  - "component screenshot system"
  - "npm run screenshots"
  - "screenshots verify"
  - "screenshot freshness"
  - "capture harness"
  - "scenario registry"
  - "screenshot coverage"
  - "screenshot manifest"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/004-component-screenshot-system"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Recorded the shipped screenshot system as four phases under one parent"
    next_safe_action: "Await orchestrator gates on the shipped screenshot system"
    blockers: []
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "screenshot-system-parent"
      parent_session_id: null
    completion_pct: 75
    open_questions: []
    answered_questions: []
---
# Feature Specification: Component Screenshot System

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
| **Status** | In progress |
| **Created** | 2026-08-28 |
| **Branch** | `impl` |
| **Track** | `ui-documentation` |
| **Predecessor** | `003-ui-improvement-build` (ten UI build phases) |
| **Handoff Criteria** | `npm run screenshots:verify` exits 0 and every registered scenario has a dark and a light capture |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The fork's interface work produced no visual record. Ten UI build phases changed `styles.css` and the renderers under `src/views/`, and the only way to see what any of them produced was to run the plugin inside Obsidian and navigate to the surface by hand. Three consequences followed. A reviewer had to read CSS to judge a visual change. A regression could ship because nobody looked at the surface it broke. And a claim that a surface "looks right" carried no artefact anyone could check.

A second problem sits underneath the first: even a folder of pictures decays. A screenshot taken before a renderer changed is worse than no screenshot, because it reads as current documentation while showing something the code no longer produces.

### Purpose

Photograph every documented view, component and state in dark and light against the shipped stylesheet, and make the pictures fail loudly when they fall behind the code:

- A **capture harness** that drives the system Chrome, composes each page from the real `styles.css` plus stand-ins for what Obsidian supplies at runtime, and writes one PNG per scenario per theme.
- A **scenario registry** naming what gets photographed, which source files each capture depicts, and any per-scenario adjustment needed to make a surface visible outside a live app.
- A **freshness gate** that fingerprints each capture's sources and exits non-zero when a source has changed since the picture was taken, backed by a repository rule requiring the check before UI work is claimed done.
- The **coverage still owed**: the surfaces that have no capture yet.

> This parent stays lean. Each child phase owns its requirements, plan, tasks, and verification.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A repeatable capture step under `tools/screenshots/`, runnable from `npm run screenshots`.
- Stand-ins for the values Obsidian supplies at runtime — host theme variables, bare form-control styling, and the layout measurements the plugin sets from JavaScript.
- A registry of scenarios with per-scenario source lists, notes and capture overrides.
- A freshness check runnable from `npm run screenshots:verify`, plus the repository rule that requires it.
- The generated `screenshots/` tree: PNGs, `manifest.json` and an index `README.md`.

### Out of Scope

- Any change to plugin behaviour, rendering, or styling. This program is documentation; it reads `styles.css` and the renderers and never edits them.
- Pixel-diff regression testing. The gate compares source fingerprints, not image bytes.
- Driving the real renderers, which need a live Obsidian `App`, a vault and a metadata cache.
- Bundling a browser. The harness uses a system Chrome and adds no download to the repository.

### Aggregate File Scope

| File Path | Change Type | Phase | Description |
|-----------|-------------|-------|-------------|
| `001-capture-harness/` | Create | 001 | The renderer for captures: Chrome driver, page composition, runtime stand-ins |
| `002-scenario-registry/` | Create | 002 | The catalogue of what gets photographed and which sources each capture depicts |
| `003-freshness-enforcement/` | Create | 003 | The mechanism that keeps captures current: fingerprint check, manifest, repository rule |
| `004-coverage-expansion/` | Create | 004 | The surfaces not yet photographed |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 001 | `001-capture-harness/` | Chrome driver, page composition, theme and runtime stand-ins, npm scripts | Complete |
| 002 | `002-scenario-registry/` | Scenario catalogue, source lists, fixture markup, capture overrides | Complete |
| 003 | `003-freshness-enforcement/` | Fingerprint check, manifest, generated index, repository rule | Complete |
| 004 | `004-coverage-expansion/` | Calendar, timeline, detail panel, peek, panels, toolbar, mobile, interaction states | Planned |

### Phase Sequencing

- 001 comes first: the registry has nothing to run against and the check has no manifest to read until the harness exists.
- 002 and 003 are separable but were shipped together, because a registry with no gate decays and a gate with no registry has nothing to check.
- 004 depends on all three. Each new surface is a registry entry plus a capture run, and the calendar and timeline entries additionally need new stand-ins in the harness.
- Every phase closes on the same gate: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots:verify`, plus strict spec validation.

### Standing Constraints (every phase)

- Documentation-only: the capture step reads `styles.css` and the renderer sources and writes only under `screenshots/` and `tools/screenshots/`.
- MIT-forkable: no telemetry, no secrets, no bundled browser download, no desktop-only APIs.
- Honest artefacts: a partial capture run must never leave the manifest reading as complete.
<!-- /ANCHOR:phase-map -->
