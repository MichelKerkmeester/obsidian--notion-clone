---
title: "Acceptance Criteria: Dock the Selection Bar to the Keyboard"
description: "Each requirement against the number a browser produced for it, the control that moves that number, and what is still not proven."
trigger_phrases:
  - "022 acceptance criteria"
  - "selection bar criteria"
  - "keyboard docking criteria"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/022-selection-bar-keyboard-docking"
    last_updated_at: "2026-08-30T20:10:00Z"
    last_updated_by: "phase-reconciliation"
    recent_action: "Criteria written against eight measured harness checks; REQ-001 left open"
    next_safe_action: "Operator reports which host shape their phone is, then REQ-001 closes"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Which host shape is the operator's phone: visualViewport shrink or window resize"
    answered_questions:
      - "The bar's fit defect was real and is fixed: 36px in 28px became 46px in 46px"
      - "The embed must not inherit docking, and does not"
---
# Acceptance Criteria: Dock the Selection Bar to the Keyboard

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Phase** | Dock the selection bar to the keyboard |
| **Producer** | `tools/storybook/verify-placement.mjs`, driving the shipped stylesheet |
| **Surface** | `.db-selection-status-bar` on a phone, standalone and embedded |
| **Read at** | 212 of 216 harness checks passing, 4 declared reds, exit 0 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

Every number below was printed by a browser measuring the shipped rule. None is copied from a
comment — this packet has already lost time to a derived number that was true when written and never
recomputed.

| # | REQ | Measurement | Threshold | Before | After | State |
|---|---|---|---|---|---|---|
| AC-1 | REQ-002 | The bar's bottom edge against the keyboard's top edge, with the host reporting a keyboard | above it | under the keyboard: the rule read the viewport floor, which a keyboard does not move | **bar bottom 513px, keyboard covers 513..844** | Met |
| AC-2 | REQ-003 | The bar's resting bottom with no keyboard | unchanged from today | 828px | **828px, and 828px again after a keyboard opens and closes** | Met |
| AC-3 | REQ-004 | The bar's content width against its own border box at phone width | content <= box | **36px inside a 28px box** — labels wrapped and clipped | **46px inside 46px** | Met, with no headroom |
| AC-4 | REQ-005 | Whether every action is reachable, and whether an overflowing bar says so | reachable, and visibly scrollable | actions ran off the screen edge silently | **scrollWidth 558px against clientWidth 356px, `overflow-x: auto`, `scrollbar-width: thin`** | Met |
| AC-5 | REQ-005 | Action hit height at phone width | >= 44px | not asserted | **44px minimum** | Met |
| AC-6 | REQ-006 | The bar's box against the available floor with a keyboard open | fully visible | not asserted | **bar occupies 465..513px, floor 513px** | Met |
| AC-7 | REQ-008 | The embedded bar's bottom, before and after a keyboard opens | unchanged | not asserted | **828px standalone and embedded; 828px before and after** | Met |
| AC-8 | REQ-009 | A fixture that photographs the bar rather than an empty region | non-blank capture | the fixture photographed a blank region | `chrome-selection-status-bar-mobile-{light,dark}.png`, regenerated | Met |
| AC-9 | REQ-001 | Which host shape the operator's phone is: `visualViewport` shrink or window resize | established | unknown | **UNKNOWN** — the harness confirms `visualViewport` exists in the WebView, which is not the same question | Open |

### Why AC-3 is marked "Met, with no headroom"

46px of content in a 46px box passes inside a 1px tolerance and has nothing to spare. Any padding,
font or label change tips it red. That is not a defect and it is not a reason to widen the tolerance
— it is a fact about how close this criterion sits to its threshold, recorded so the next person to
touch the bar knows the check will tell them immediately.

### Why AC-9 does not block the rest

The docking rule is `max(16px, env(safe-area-inset-bottom), var(--keyboard-height, 0px))`.
`--keyboard-height` is Obsidian's own variable and the `max()` falls back to the safe floor whenever
it is `0px`, so the bar behaves correctly under either host shape. The host question matters for the
record **sheet**, where `onResize = () => close()` destroys the surface before an inset can apply —
a different surface and a different phase.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

Eight of nine criteria are Met, each against a number a browser produced. The ninth is a question
about the operator's hardware that no harness can answer.

**This phase does not close.** Per the packet's third decision, shipped, verified and
operator-confirmed are three states and only the third closes anything. Nothing here has been seen
on a device.
<!-- /ANCHOR:closure -->
