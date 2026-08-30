---
title: "Feature Specification: Sheet Reading Rhythm and Keyboard Avoidance"
description: "Make the phone record sheet read like a record rather than a two-column ledger, and keep the field being edited visible when the software keyboard opens."
trigger_phrases:
  - "sheet reading rhythm"
  - "record sheet alignment"
  - "sheet dividers"
  - "keyboard avoidance"
  - "keyboard overlap sheet"
  - "visualViewport"
  - "010 sheet reading"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/010-sheet-reading-and-keyboard"
    last_updated_at: "2026-08-30T05:20:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from operator device reports with screenshots; not started"
    next_safe_action: "Measure the sheet's label/value geometry against the Notion reference before changing any value"
    blockers: []
    key_files:
      - "spec.md"
      - "device-sheet-at-rest.png"
      - "device-sheet-keyboard-overlap.png"
      - "reference-notion-record.png"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-010"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Sheet Reading Rhythm and Keyboard Avoidance

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `003-mobile-sheet-presentation`, which
> made the sheet reach the floor and clear the navigation bar. This phase is about what the sheet
> looks like once it is there, and what happens when the keyboard opens.

<!-- ANCHOR:problem -->
## 1. WHY THIS EXISTS

Both problems were reported from a phone, with screenshots, after `003` landed. Neither is
speculative and neither is visible in any fixture. The evidence is in this folder:

- `device-sheet-at-rest.png` — the sheet as it ships today.
- `device-sheet-keyboard-overlap.png` — the same sheet with the keyboard open.
- `reference-notion-record.png` — Notion's record view on the same phone, which the operator names
  as the target.

## 2. PROBLEM ONE — the sheet reads as a ledger, not a record

In `device-sheet-at-rest.png` each row is a label pinned left and a value pinned hard right, with
nothing between them. Thirteen rows of that produce two disconnected columns with a wide empty gutter
down the middle, and the eye has to travel the full sheet width to pair a label with its value.

`reference-notion-record.png` does the opposite: an icon, a label, and the value sitting immediately
after it in a fixed column, so every pair reads as one line. Its type is larger and its rows are
taller, which also makes them read as targets rather than as text.

The operator's three asks, in their words: no space between, text a bit bigger, and a light
transparent divider between each item to make more clickable.

**Not to be resolved by taste.** The current values are `gap: 8px`, `padding: 4px 6px`,
`flex-direction: column; gap: 2px` on the field list, and a value element with `flex: 1` that pushes
itself to the right edge. Measure the Notion reference and the current sheet before choosing
replacements, and put the numbers in the acceptance criteria.

## 3. PROBLEM TWO — the keyboard hides the field being edited

In `device-sheet-keyboard-overlap.png` the keyboard covers roughly the bottom half of the screen and
the field under edit — Expenses — sits behind it. The sheet does not move, resize, or scroll; it
stays docked to the viewport floor, which is now behind the keyboard.

The sheet is `position: fixed` with `bottom: 0`, so it is docked to the **layout** viewport, which a
software keyboard does not change. The **visual** viewport does change. `window.visualViewport` is
the thing that reports it, and it is the only mechanism that observes the keyboard on iOS.

**Do not guess at this.** Establish first, by measurement, which of these the app actually gets:
whether `visualViewport` resize or scroll events fire, whether Obsidian sets any safe-area or
keyboard inset variable of its own, and whether the WebView is already resizing. A fix built on the
wrong one of those is the shape of defect this program keeps producing.
<!-- /ANCHOR:problem -->

<!-- ANCHOR:scope -->
## 4. WHAT THIS PHASE MUST NOT DO

- Must not regress `003`. The sheet still reaches the viewport floor and still covers the navigation
  bar; `verify-placement` asserts both and they stay green.
- Must not change desktop. The anchored panel shares this markup and is not in scope.
- Must not be verified by a fixture alone. No harness in this repo contains a software keyboard, so
  the keyboard half is honest only with a stated limit or an operator check.
<!-- /ANCHOR:scope -->

<!-- ANCHOR:success-criteria -->
## 5. ACCEPTANCE CRITERIA

Written by the phase, not here. Each criterion needs a number with a threshold shown failing first,
a check that drives the production path, and an image a person opened. See
[`acceptance-criteria.md`](acceptance-criteria.md).
<!-- /ANCHOR:success-criteria -->
