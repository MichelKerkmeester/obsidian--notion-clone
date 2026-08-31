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
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "keyboard-inset-publisher"
    recent_action: "AC-1 restored on a fallback-only measurement; bar reads --db-keyboard-inset"
    next_safe_action: "Regenerate the three fingerprint artefacts the stylesheet edit staled, then operator opens a keyboard on a device"
    blockers:
      - "css-lane, evidence and screenshots-fresh are red on the stylesheet fingerprint; their remedies write outside this phase's scope"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "implementation-summary.md"
      - "src/views/popover-position.ts"
      - "src/views/database-view.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 70
    open_questions:
      - "Which host shape is the operator's phone: visualViewport shrink or window resize"
    answered_questions:
      - "The bar's fit defect was real and is fixed: 36px in 28px became 46px in 46px"
      - "The embed must not inherit docking, and does not"
      - "The sheet's visual-viewport fallback is real, not merely argued: it lifts with no host variable set"
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
| **Read at** | 233 of 236 harness checks passing, 3 declared reds, exit 0 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

Every number below was printed by a browser measuring the shipped rule. None is copied from a
comment — this packet has already lost time to a derived number that was true when written and never
recomputed.

| # | REQ | Measurement | Threshold | Before | After | State |
|---|---|---|---|---|---|---|
| AC-1 | REQ-002 | The bar's bottom edge against the keyboard's top edge, **with no `--keyboard-height` set and the visual viewport shrunk instead** | above it | **828px — unmoved; the rule read a variable nothing publishes** | **bar bottom 513px, want 513px, bar reads 331px from the bottom** | Met |
| AC-10 | REQ-002 | The same measurement for the sheet, to settle whether its fallback was real or only argued from source | above the keyboard | never executed: every captured run set the variable and left the viewport at full height | **sheet bottom 513px, want 513px, lever var 331px** | Met |
| AC-11 | REQ-002 | Whether the publisher's viewport subscription survives the bar it published for | it must not | not asserted; no gate in this repository counts listeners | **variable held `0px` while a bar was up, unset once the selection cleared, and still unset after a shrink that would have republished it** | Met |
| AC-2 | REQ-003 | The bar's resting bottom with no keyboard | unchanged from today | 828px | **828px, and 828px again after a keyboard opens and closes** | Met |
| AC-3 | REQ-004 | The bar's content width against its own border box at phone width | content <= box | **36px inside a 28px box** — labels wrapped and clipped | **46px inside 46px** | Met |
| AC-4 | REQ-005 | Whether every action is reachable, and whether an overflowing bar says so | reachable, and visibly scrollable | actions ran off the screen edge silently | **scrollWidth 558px against clientWidth 356px, `overflow-x: auto`, `scrollbar-width: thin`** | Met |
| AC-5 | REQ-005 | Action hit height at phone width | >= 44px | not asserted | **44px minimum** | Met |
| AC-6 | REQ-006 | The bar's box against the available floor with a keyboard open | fully visible | not asserted | **bar occupies 465..513px, floor 513px** | Met |
| AC-7 | REQ-008 | The embedded bar's bottom, before and after a keyboard opens | unchanged | not asserted | **828px standalone and embedded; 828px before and after** | Met |
| AC-8 | REQ-009 | A fixture that photographs the bar rather than an empty region | non-blank capture | the fixture photographed a blank region | `chrome-selection-status-bar-mobile-{light,dark}.png`, regenerated | Met |
| AC-9 | REQ-001 | Which host shape the operator's phone is: `visualViewport` shrink or window resize | established | unknown | **UNKNOWN** — the harness confirms `visualViewport` exists in the WebView, which is not the same question | Open |

### AC-3 reads `content == box`, and that is not zero headroom

It looks like a coin flip and is not one. `scrollHeight` returns the box height whenever the content
fits, so equal numbers are what a comfortable pass prints — the two values do not drift apart as
margin grows. Measured by shrinking the box: 47px passes, 45px still passes on the tolerance, 30px
fails. The real margin is 2px plus the 1px tolerance.

Recorded because the opposite was written here first, and "passes with nothing to spare" is the kind
of claim that sounds appropriately cautious while being false.

### AC-1 is restored: the bar reads a number the plugin measures

AC-1 was withdrawn because the harness supplied the value the defect lived in. `styles.css` docked
the bar with `max(16px, env(safe-area-inset-bottom), var(--keyboard-height, 0px))`, nothing in this
plugin ever set `--keyboard-height`, and the check set it directly on the document element before
measuring. The arithmetic was proven; the arrival of the variable was not.

The gap was wider than that. Both keyboard blocks in the harness set the variable and then dispatched
a synthetic resize **without shrinking `visualViewport.height`**, so the observed term inside
`keyboardInset()` computed `0` in every run ever captured. The fallback branch that protects both
surfaces on a host publishing nothing had never once executed.

**What was measured first, before any product code moved.** A block that sets no `--keyboard-height`
at all and shrinks the visual viewport instead — the device's own signal rather than the host's
report. Overriding `visualViewport.height` models the platform, because a phone really does shrink
that viewport; setting `--keyboard-height` would have done the host's job for it and presupposed the
thing under test. Against that, the sheet lifted to 513px on an 844px screen with the variable unset:
its protection is real, not merely argued from source. The bar sat at 828px, unmoved.

**What changed.** `publishKeyboardInset` in `src/views/popover-position.ts` writes `keyboardInset()`
— the larger of the host's report and the visual viewport's shrink, guarded against pinch-zoom — to
`--db-keyboard-inset` on the view's container, and the bar's `max()` reads that. The host's number
still reaches the bar, laundered through the function that also knows about the viewport, so both
paths are green: 513px with the host reporting, and 513px with the host silent.

**Lifecycle.** The container is written on `window` resize and on `visualViewport` resize and scroll,
coalesced onto a frame so the bar and the sheet move together rather than a frame apart. The
subscription is taken when a bar is created and released on the branch that removes it, so the common
case — no selection — holds no listener at all; `onClose` releases again for a view closed with a
selection live. `--keyboard-height` itself is never written: it is the host's namespace.

**The control.** `SELECTION_BAR_CONTROL=revert` puts the bar back on the host variable alone. Under
it the fallback check reports `bar bottom=828 want=513` and the run exits 1, while the host-path check
stays green — so the fallback check is specifically the one carrying the fix. Removing the release
call from the clear branch turns AC-11 red with the variable republished at `331px` after the bar was
already gone, which is the leak it exists to catch.

### Why AC-9 does not block the rest

The docking rule is `max(16px, env(safe-area-inset-bottom), var(--db-keyboard-inset, 0px))`, and the
published inset takes the larger of the host's report and the visual viewport's own shrink. One host
shape moves the first term, the other moves the second, and `max()` falls back to the safe floor when
both are zero — so the bar behaves correctly under either shape, and now for a measured reason rather
than an assumed one. The host question matters for the
record **sheet**, where `onResize = () => close()` destroys the surface before an inset can apply —
a different surface and a different phase.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

Eleven of twelve criteria are Met, each against a number a browser produced — and AC-1, AC-10 and
AC-11 against a browser that was given **no host variable at all**, which is the only shape of check
that can fail for the right reason here. The twelfth is a question about the operator's hardware that
no harness can answer.

Three gate checks stand red, all on one cause: `css-lane`, `evidence` and `screenshots-fresh` are
content fingerprints over `styles.css` and `src/views/popover-position.ts`, and this fix necessarily
moves both. Their remedies write to `tools/lane/css-lane.json`, `tools/live/*.json` and
`screenshots/`, none of which this phase holds.

**This phase does not close.** Per the packet's third decision, shipped, verified and
operator-confirmed are three states and only the third closes anything. Nothing here has been seen
on a device.
<!-- /ANCHOR:closure -->
