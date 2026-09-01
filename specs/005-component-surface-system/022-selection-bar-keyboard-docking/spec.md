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
    packet_pointer: "005-component-surface-system/022-selection-bar-keyboard-docking"
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Shipped: bar docks to --keyboard-height, box 30px to 48px, 8 harness checks green"
    next_safe_action: "Operator selects cells, opens the keyboard, reports what the bar does"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "device-bar-floating.png"
      - "reference-notion-accessory-bar.jpg"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 75
    open_questions:
      - "Does the operator's phone shrink visualViewport, or resize the window?"
      - "Does the bar wrap, scroll or shorten its labels to fit its box?"
    answered_questions:
      - "The stylesheet references --keyboard-height nowhere today; grep returns 0"
      - "The docking mechanism is proven in this program: 336px moved a fixed edge 844 to 508 and back"
---
# Feature Specification: Dock the Selection Bar to the Keyboard

> Phase chain: parent [`../spec.md`](../spec.md). Shipped in 1.3.9 — commit `a0d42a1` precedes the
> release cut `9e12fe1` — so it is in the build the operator is running. That is not the same as
> confirmed: the operator has not yet opened a keyboard over a selection. This line read *Not
> started* after the code landed. Depends on the keyboard-inset
> mechanism built in [`../010-sheet-reading-and-keyboard/spec.md`](../010-sheet-reading-and-keyboard/spec.md)
> and measured in `016`; inherits the unresolved host-shape question recorded in
> [`../roadmap.md`](../roadmap.md) row 4.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

An operator selected a cell on a phone, the numeric keyboard opened, and the selection bar stayed
where it was — floating across the middle of the table, over the rows, with its right-hand actions
running off the screen edge.

There are **two** defects here and only one of them was reported. The bar is in the wrong place, and
separately its content does not fit the box it is in. Fixing the placement alone produces a bar that
is correctly positioned and still unreadable, which is why they are one phase.

The mechanism for the placement half already exists in this repository and has already been measured
working. What is not yet known is whether the operator's phone is the host shape it works on.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 022-selection-bar-keyboard-docking |
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | **Shipped + verified, awaiting device — 6 of 8 criteria.** Shipped in 1.3.9: `styles.css:2436-2445` docks the bar on `--db-keyboard-inset`, published by `publishKeyboardInset` in `src/views/popover-position.ts`. Open: which host shape the phone is, and the operator seeing a usable bar. Was *Planned* |
| **Created** | 2026-08-30 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `010-sheet-reading-and-keyboard` built the inset; `016` measured it |
| **Successor** | None |
| **Blocks** | Nothing |
| **CSS lane** | **Takes the lane.** Edits `.db-selection-status-bar`, shared with the embedded renderer |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### The Report

`device-bar-floating.png` shows a cell selected on a phone with the numeric keyboard open. The
selection bar — `× Esc | 1 cells selected | Copy TSV | Copy Markdown | …` — floats across the middle
of the table, over the rows, with its right-hand actions running off the screen edge. The operator:

> *"You see that bar floating? It's not really usable. Ideally it's attached to the open keyboard
> similar to notion."*

`reference-notion-accessory-bar.jpg` is the target: a toolbar sitting directly on top of the
keyboard, moving with it, never overlapping content.

### Two Defects, And The Second Is Already Measured

**Placement.** `styles.css:2281` declares `.note-database-container .db-selection-status-bar` with
`position: fixed` and, at `:2293`, `bottom: max(16px, env(safe-area-inset-bottom))`. That is the
viewport floor, which a software keyboard does not change — so an open keyboard sits on top of the
bar, or crowds it up against the rows.

**Its content does not fit its box.** `020` measured this while investigating something else: at
402px the bar's content is **36px inside a 28px content box**, so labels wrap and are cut. The box
is `--db-selection-status-height: 30px` (`styles.css:646`) with `box-sizing: border-box` and a 1px
border on each edge, which is where the 28px comes from.

`020` measured it identically with the bar `position: fixed` and forced into flow, so it is shipped
layout rather than an artefact of how it was captured. It went unnoticed because the bar's screenshot
fixture was photographing an empty region — the blank-capture defect `020` also fixed.

### Why It Matters

The bar is the only route to Copy TSV and Copy Markdown. A control that is present, unreadable and
partly off-screen is worse than one that is absent, because the operator cannot tell whether they
have missed a step or hit a bug.

### Goals

- The bar sits directly above the keyboard when one is open, and at the safe-area floor when it is
  not, moving with the keyboard rather than being covered by it.
- Every action stays reachable and legible at 390px.
- Nothing overlaps a table row.
- Desktop and the embedded renderer are unchanged.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `.db-selection-status-bar` placement on a phone.
- The bar's own box: whether it wraps, scrolls, or shortens its labels to fit its content.
- A screenshot fixture that photographs the bar for real.
- A placement check that measures both the docking and the fit.

### Out of Scope

- The desktop bar. It has room and no keyboard.
- The keyboard-inset mechanism itself. It exists and is measured; this phase consumes it.
- Any change to what the bar's actions do.

### The Mechanism Already Exists Here

`--keyboard-height` is Obsidian's own variable, and this program has already proven the pattern
works. `016` measured it: with `--keyboard-height: 336px` a fixed element's bottom edge moved from
**844 to 508** and returned to 844 when the keyboard closed, with the surface's top staying on
screen at y=275.

The plumbing is `keyboardInset()` at `popover-position.ts:514`, written to `--db-mobile-sheet-bottom`
at `:301`, with a pinch-zoom guard at `scale <= 1.01`.

**The stylesheet does not reference `--keyboard-height` anywhere today** — `grep -c` returns 0. So
this phase either consumes the existing `--db-mobile-sheet-bottom` term or introduces the variable to
the stylesheet for the first time, and that choice is `plan.md`'s to make.

Do not reach for `visualViewport` before establishing whether the existing mechanism is sufficient.

### The Trap A Sibling Phase Found

`../roadmap.md` row 4 records it, and it is the reason this phase's first task is a measurement
rather than an edit:

`openRecordDetailPanel` registers `onResize = () => close()`. iOS shrinks `visualViewport` and leaves
the window alone, so the inset works there. **A host that announces the keyboard by resizing the
window destroys the surface before any inset can apply.** Which of the two the operator's phone does
decides whether this phase is a small CSS change or is blocked on a different fix entirely.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority |
|---|---|---|
| REQ-001 | Establish which host shape the operator's phone is: `visualViewport` shrink, or window resize. Everything else depends on the answer. | P0 |
| REQ-002 | With a keyboard open, the bar's bottom edge sits above the keyboard's top edge, not under it. | P0 |
| REQ-003 | With no keyboard, the bar sits at the safe-area floor exactly as it does today. | P0 |
| REQ-004 | The bar's content fits its box at 390px: no label is clipped and no label wraps out of view. | P0 |
| REQ-005 | Every action is reachable at 390px — nothing runs past the screen edge unless the bar is deliberately scrollable and shows that it is. | P0 |
| REQ-006 | The bar overlaps no table row in either keyboard state. | P1 |
| REQ-007 | Desktop geometry is frozen and asserted, so a phone-shaped rule that leaks is caught rather than discovered later. | P0 |
| REQ-008 | The embedded renderer's bar is unchanged. Its rules live at `styles.css:6148` and `:17142`, and there is no keyboard in an embed. | P0 |
| REQ-009 | The bar is photographed for real, in both keyboard states where the harness can produce them. | P1 |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Each needs a number with a threshold shown failing first, from a check that drives the production
path, and an image a person opened. The "before" column is filled by the phase's own first
measurement; only C4 has a number today, and it is `020`'s.

| # | Criterion | Threshold | Before |
|---|---|---|---|
| C1 | Bar bottom clears the keyboard top, keyboard open | >= 0px gap | to measure |
| C2 | Bar bottom sits at the safe-area floor, keyboard closed | unchanged from today | unchanged |
| C3 | Bar overlaps no table row, both states | 0px overlap | to measure |
| C4 | Bar content height against its content box at 402px | <= 28px | **36px** |
| C5 | Rightmost action's right edge against the viewport | inside, or scrollable and visibly so | to measure |
| C6 | Desktop bar geometry | exact, frozen | to measure |
| C7 | Embedded renderer's bar geometry | exact, frozen | to measure |

C6 and C7 are the leak controls. The bar is shared across three contexts and this phase edits one of
them, so the other two are pinned before the edit rather than checked after it.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | The operator's host resizes the window, so `onResize = () => close()` destroys the surface before any inset applies | H | M | REQ-001 measures this first. A blocked phase reported honestly beats a CSS change that cannot work |
| R-002 | A phone-keyed rule leaks to desktop or to the embed | M | M | REQ-007, REQ-008; C6 and C7 freeze both before the edit |
| R-003 | Placement is fixed and the fit is not, so the bar is correctly positioned and still unreadable | H | M | C4 is a separate criterion with a number already measured; the phase does not close on C1 alone |
| R-004 | The fixture photographs an empty region again | M | L | `020` fixed the fixture and added blank and theme-identical rejection to the capture verifier; REQ-009 relies on it |
| R-005 | Shortening labels to fit is chosen silently, changing what the actions are called | M | M | §12 keeps wrap/scroll/shorten open as an operator question |

**Dependencies.** `010`'s keyboard inset and `016`'s measurement of it, both complete. The css lane
must be free; `../../tools/lane/css-lane.json` is the record.

**Dependents.** None.

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-P01 | No layout thrash. The bar reads a variable the host already maintains rather than installing its own resize listener. |
| NFR-A01 | Every action keeps a 44px touch target. The bar is already short; docking it must not be paid for by shrinking its controls. |
| NFR-M01 | Comment hygiene: no spec paths, phase numbers or task ids in `styles.css`. The durable reason stays. |

---

## 8. EDGE CASES

- **Keyboard opens while the bar is already visible.** The bar moves; it does not re-enter. A
  re-entry animation on every keystroke would be worse than the defect.
- **Keyboard closes while a selection is still active.** The bar returns to the safe-area floor and
  stays visible. Selection state and keyboard state are independent.
- **Landscape.** The keyboard is shorter and the bar has less vertical room. C1 and C3 must hold in
  both orientations or the phase records which one it does not cover.
- **The embedded renderer.** No keyboard, no docking. The rules at `:6148` and `:17142` are frozen.
- **Pinch zoom.** The existing inset guards at `scale <= 1.01`; this phase inherits that guard rather
  than writing a second one.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 11/25 | One surface, two defects, three contexts to keep frozen |
| Risk | 14/25 | Shared selector across standalone, embed and desktop; a host shape that may make the work impossible |
| Research | 13/20 | The host-shape question is unanswered and gates everything |
| Multi-Agent | 3/15 | Single lane |
| Coordination | 8/15 | Takes the css lane; consumes `010`'s mechanism |
| **Total** | **49/100** | Scored Level 2 by content; **authored at Level 3** to match the program's phase-document convention |

---

## 10. RISK MATRIX

See §6.

---

## 11. USER STORIES

### US-001: Reach the copy actions with the keyboard open (Priority: P0)

**As an** operator selecting cells on a phone, **I want** the action bar to sit above the keyboard,
**so that** I can reach Copy TSV without dismissing the keyboard first.

**Acceptance:** C1, C2, C3, C5.

### US-002: Read the actions at all (Priority: P0)

**As an** operator, **I want** the bar's labels to fit inside the bar, **so that** I can tell which
action I am about to press.

**Acceptance:** C4, C5.

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- **Which host shape is the operator's phone?** `visualViewport` shrink, or window resize. REQ-001,
  and it decides whether this phase is small or blocked.
- **Wrap, scroll, or shorter labels?** All three make the content fit. Shortening changes what the
  actions are called, which is the operator's decision and not the implementer's.
- **Does the bar consume `--db-mobile-sheet-bottom`, or introduce `--keyboard-height` to the
  stylesheet?** The first reuses a term that already carries the pinch-zoom guard. The second is more
  direct and adds a variable the stylesheet has never referenced.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`plan.md`](plan.md) · [`tasks.md`](tasks.md)
- `device-bar-floating.png` — the operator's report
- `reference-notion-accessory-bar.jpg` — the target behaviour
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md) — row 4 carries the host-shape finding
- [`../010-sheet-reading-and-keyboard/spec.md`](../010-sheet-reading-and-keyboard/spec.md) — the inset mechanism
- [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md) — measured the 36px-in-28px fit defect and fixed the blank fixture
