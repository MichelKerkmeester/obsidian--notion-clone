---
title: "Feature Specification: Dock the Selection Bar to the Keyboard"
description: "The cell-selection action bar floats over the table at a fixed offset from the viewport floor, so an open keyboard covers or crowds it, and its own content is taller than the box that holds it."
trigger_phrases:
  - "selection bar floating"
  - "selection status bar keyboard"
  - "copy tsv bar mobile"
  - "accessory bar above keyboard"
  - "022 selection bar"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/022-selection-bar-keyboard-docking"
    last_updated_at: "2026-08-30T13:20:00Z"
    last_updated_by: "phase-author"
    recent_action: "Cut from an operator device report with a Notion reference; not started"
    next_safe_action: "Measure the bar against an open keyboard before choosing a docking mechanism"
    blockers: []
    key_files:
      - "spec.md"
      - "device-bar-floating.png"
      - "reference-notion-accessory-bar.jpg"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Dock the Selection Bar to the Keyboard

## 1. THE REPORT

`device-bar-floating.png` shows a cell selected on a phone with the numeric keyboard open. The
selection bar — `× Esc | 1 cells selected | Copy TSV | Copy Markdown | …` — floats across the middle
of the table, over the rows, with its right-hand actions running off the screen edge. The operator:

> *"You see that bar floating? It's not really usable. Ideally it's attached to the open keyboard
> similar to notion."*

`reference-notion-accessory-bar.jpg` is the target: a toolbar sitting directly on top of the
keyboard, moving with it, never overlapping content.

## 2. TWO DEFECTS, AND THE SECOND IS ALREADY MEASURED

**Placement.** `styles.css:2281` pins the bar `position: fixed` at
`bottom: max(16px, env(safe-area-inset-bottom))`. That is the viewport floor, which a software
keyboard does not change — so an open keyboard sits on top of it, or crowds it up against the rows.

**Its content does not fit its box.** A prior phase measured this while investigating something
else: at 402px the bar's content is **36px inside a 28px box**, so labels wrap and are cut. That was
measured identically with the bar `position: fixed` and forced into flow, so it is shipped layout
rather than an artefact of how it was captured. It went unnoticed because the bar's screenshot
fixture was photographing an empty region.

Fixing placement without fixing the box produces a bar that is correctly positioned and still
unreadable.

## 3. THE MECHANISM ALREADY EXISTS HERE

`--keyboard-height` is Obsidian's own variable and this program has already proven it works: a
measured 336px keyboard moved a fixed element's bottom edge from 844 to 508 and back. **The
stylesheet does not reference it anywhere today** — confirmed by grep.

Do not reach for `visualViewport` before establishing whether the existing variable is sufficient.
And note the trap a sibling phase found: on a host that announces the keyboard by resizing the
window rather than shrinking the visual viewport, a resize handler can destroy the surface outright.

## 4. WHAT GOOD LOOKS LIKE

The bar sits directly above the keyboard when one is open and at the safe-area floor when it is not,
moving with the keyboard rather than being covered by it. Every action stays reachable and legible
at 390px. Nothing overlaps a table row. Desktop is unchanged.

## 5. CONSTRAINTS

- The bar is shared with the embedded renderer (`styles.css:6148`, `:17100`); a change keyed to the
  standalone view only will miss it, and one keyed too broadly will move it in an embed where there
  is no keyboard.
- The capture verifier now rejects blank and theme-identical images, so this surface must be
  photographed for real rather than through the fixture that was showing nothing.
- Comment hygiene: no spec paths, phase numbers or task ids in the stylesheet.

## 6. ACCEPTANCE CRITERIA

Written by the phase. Each needs a number with a threshold shown failing first, from a check that
drives the production path, and an image a person opened.
