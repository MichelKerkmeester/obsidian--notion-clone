---
title: "Research: Note Database plugin UI improvement (Anytype + AppFlowy in context)"
description: "Two-executor deep research (Gemini 3.7 Flash High via cli-devin + GPT-5.6-Luna xhigh via cli-codex), 10 forced iterations each, no early convergence, on improving the forked Note Database Obsidian plugin UI across the board with Anytype and AppFlowy analyzed for reference."
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "002-ui-improvement-research"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "research-orchestrator"
    recent_action: "Scaffolded two-executor UI-improvement research packet"
    next_safe_action: "Run 10+10 research iterations then synthesize"
    blockers: []
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-research"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Research: Note Database plugin UI improvement

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

## 1. GOAL

Produce concrete, actionable recommendations to improve the forked Note Database Obsidian plugin's UI across the board — not only polishing the current setup, but analyzing **Anytype** and **AppFlowy** (and Notion where useful) UI/UX patterns for what is worth adopting, given the plugin's constraints (mobile-safe, iCloud-safe, display-only, MIT-forkable, rebase-clean).

## 2. METHOD

- Two executors, run in parallel, each 10 iterations, **no early convergence** (forced depth):
  - **devin-gemini** — `gemini-3-7-flash-high` via cli-devin.
  - **codex-luna** — `gpt-5.6-luna` reasoning xhigh, service tier fast, via cli-codex.
- Each iteration takes a distinct FOCUS AREA (below) plus the cumulative findings so far, analyzes the real plugin (`src/`, `styles.css`) AND the reference apps, and writes `research/<track>/iteration-NN.md`.
- A final `research/synthesis.md` distills the ranked, decision-ready recommendations across both tracks.

## 3. FOCUS AREAS (one per iteration, 1..10)

1. Overall UI/UX audit: visual hierarchy, consistency, information density, first-run/empty states.
2. Table / grid view (primary surface): headers, cells, row affordances, sort/filter/group controls.
3. Popovers, menus, dropdowns: elevation, structure, alignment, keyboard + hover interaction.
4. Toolbars & view controls: icon buttons, view switcher, settings, add/new affordances.
5. Visual design system: color tokens, typography scale, spacing, radius, dark/light theming.
6. Anytype UI/UX patterns worth adopting (object-oriented UI, sidebar, blocks, sets/collections).
7. AppFlowy UI/UX patterns worth adopting (grid/board/calendar, field editors, theming, row detail).
8. Views beyond table: board, gallery, calendar, list — parity, polish, and per-view affordances.
9. Micro-interactions & feedback: hover, drag/reorder, inline edit, selection, loading, empty, error.
10. Mobile / responsive / accessibility: touch targets, Obsidian mobile, contrast, focus, ARIA.

## 4. CONSTRAINTS (must hold for every recommendation)

- Mobile-safe and iCloud-safe: display-only rendering, no writes to note bodies on view.
- MIT-forkable, no telemetry, no desktop-only APIs, rebase-clean isolated changes.
- Cite real `file:line` in `src/` / `styles.css` when proposing a change to the current UI.

## 5. OUTPUT

- `research/devin-gemini/iteration-01.md` .. `iteration-10.md`
- `research/codex-luna/iteration-01.md` .. `iteration-10.md`
- `research/synthesis.md` — ranked, decision-ready recommendations (with effort + constraint check).
