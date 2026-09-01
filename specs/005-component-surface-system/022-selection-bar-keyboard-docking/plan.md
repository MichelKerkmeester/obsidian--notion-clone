---
title: "Implementation Plan: Dock the Selection Bar to the Keyboard"
description: "Answer the host-shape question first, then dock the bar on the mechanism 010 built, then make its content fit the box it is in."
trigger_phrases:
  - "022 selection bar plan"
  - "keyboard docking approach"
  - "selection bar fit"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Dock the Selection Bar to the Keyboard

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This plan forecasts work that has not started.** Nothing below is a record of anything.

Four stages, and the first is a measurement that can end the phase.

Answer the host-shape question. Freeze the two contexts this phase must not disturb. Dock the bar on
the mechanism `010` already built. Then make its content fit the box it is in.

The order is not arbitrary. `../roadmap.md` row 4 records that `openRecordDetailPanel` registers
`onResize = () => close()`, so on a host that announces the keyboard by resizing the window the
surface is destroyed before any inset can apply. On that host no amount of CSS docks anything, and
finding out after writing the CSS is the expensive way to learn it.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction in count |
| Gate | `npm run gate` | exit 0, all lanes green |
| Placement | `npm run storybook:placement` | the new bar checks green; no previously-green check reddens |
| Captures | `npm run screenshots:verify` | current, none blank, none identical across themes |
| Lane | `npm run lane:check` | the css lane is held by this phase for the duration of the edit |

The bar's fixture was photographing an empty region until `020` fixed it, so `screenshots:verify` is
load-bearing here in a way it usually is not: a green capture of this surface used to mean nothing.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**One selector, three contexts.** `.db-selection-status-bar` is declared at `styles.css:2281` under
`.note-database-container`, and the embedded renderer reaches it again at `:6148` and `:17142`. A
change keyed to the standalone view only will miss the embed; one keyed too broadly will move the bar
in an embed where there is no keyboard to dock to. Both failure directions are real and C6 and C7
exist to catch them.

**The docking term.** Two options, and `spec.md` §12 leaves the choice open.

*Consume `--db-mobile-sheet-bottom`.* `keyboardInset()` at `popover-position.ts:514` already computes
the inset and writes that variable at `:301`, including the pinch-zoom guard at `scale <= 1.01`.
Reusing it means the bar inherits a guard that has already been measured, and there is exactly one
place in the codebase that decides what "the keyboard is open" means.

*Introduce `--keyboard-height` to the stylesheet.* Obsidian's own variable, more direct, and
currently referenced **zero** times in `styles.css`. It would be a second definition of the same
concept, and the pinch-zoom guard would have to be either duplicated or deliberately omitted.

The first is preferable on the evidence available. One term with one guard is how the sheet already
works, and a second answer to "is the keyboard open" is the shape of defect this program keeps
finding — two owners of one fact.

**The fit is a separate mechanism from the placement.** The box is
`--db-selection-status-height: 30px` at `styles.css:646`, border-box, 1px border each edge, so 28px
of content box holding 36px of content. Nothing about docking changes that arithmetic. Three ways
out — wrap to a second line, scroll horizontally, or shorten the labels — and they are visibly
different products. `spec.md` §12 keeps it an operator question.

**Why not `visualViewport` directly.** It is the mechanism `010` already wrapped, and reaching past
that wrapper would put a second resize listener on a surface whose existing one is the risk this
phase opens with.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Answer the host-shape question, or stop

Establish whether the operator's phone shrinks `visualViewport` or resizes the window. On the second,
`onResize = () => close()` destroys the surface before any inset applies, and this phase is blocked
on a different fix rather than being a CSS change at all.

Record the answer either way. A phase that reports "blocked, and here is the measurement" is a
result; a phase that ships CSS onto a host that cannot run it is not.

### Phase 2 — Freeze what must not move

Measure and pin the desktop bar and the embedded bar before touching anything. The selector is shared
across three contexts, and pinning after the edit measures the edit rather than constraining it.

### Phase 3 — Dock the bar

Replace the fixed `bottom: max(16px, env(safe-area-inset-bottom))` with a term that adds the keyboard
inset, keyed to the phone context. With no keyboard the inset is 0 and the bar must land exactly where
it does today — C2 is an equality against the current value, not an approximation.

### Phase 4 — Make the content fit

36px into 28px, by whichever of wrap, scroll or shorter labels the operator chooses. This is the half
that was never reported and is the reason the phase is not finished when the bar moves.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Placement | Bar bottom against keyboard top, both states; row overlap; content fit; right-edge reach | `verify-placement.mjs` |
| Negative control | Each new check shown red before the stylesheet edit | `verify-placement.mjs` on the tree as received |
| Leak control | Desktop and embed geometry frozen and asserted | `verify-placement.mjs` |
| Capture | The bar photographed for real, both themes, both devices | `screenshots` + `screenshots:verify` |

Every check drives the production path. The bar's own history is the argument for that rule: its
fixture photographed an empty region for long enough that a real layout defect sat unnoticed inside a
green capture set.

Both ends are asserted, not just the one that was reported. A bar that clears the keyboard by
overlapping a row has traded one defect for another, and a check that only measures the bottom edge
would call that a pass.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| `keyboardInset()` / `--db-mobile-sheet-bottom` | Internal | Green, measured by `016` | The docking term has to be built from scratch |
| The css lane | Internal | Must be acquired | No stylesheet edit may proceed |
| `020`'s capture verifier | Internal | Green | A blank capture of this surface would pass again |
| The host-shape answer | External | **Open** | Phase 1 is the answer; the phase cannot proceed past it |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the docked bar overlaps content in a state the checks did not cover, or the embed moves.
- **Procedure**: revert the stylesheet block. The bar returns to the safe-area floor, which is where
  it is today — a known, reported defect rather than an unknown one.
- **Data reversal**: none.

The two halves are independently revertible: the docking is a `bottom` term and the fit is a box
decision, and neither depends on the other having landed.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
Phase 1 host-shape measurement ──▶ (window-resize host) ──▶ BLOCKED, reported
        │
        ▼ (visualViewport host)
Phase 2 freeze desktop + embed
        │
        ▼
Phase 3 dock the bar ──┐
                       ├──▶ recapture ──▶ operator review
Phase 4 fit the content┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Host-shape measurement | A phone | The answer that decides whether this phase can exist | Everything |
| Desktop + embed freeze | Phase 1 | C6, C7 baselines | Any stylesheet edit |
| Docking term | Phases 1-2 | C1, C2, C3 | Recapture |
| Content fit | Phase 2, plus the operator's wrap/scroll/shorten answer | C4, C5 | Recapture |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **Phase 1 — the host-shape measurement** - CRITICAL, and a stop condition.
2. **Phase 2 — the freeze** - CRITICAL. It has to precede the edit to constrain it.
3. **Phase 3 — the docking term** - CRITICAL. It is the reported defect.

**Total Critical Path**: Phase 1 → 2 → 3. Phase 4 is required for completion but sits off the
critical path: it needs an operator answer, not a predecessor.

**Parallel Opportunities**:
- The fixture and capture work can be prepared while the host-shape question is outstanding.
- The wrap/scroll/shorten decision can be put to the operator at any point.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | The host shape is known | The answer recorded, with what was measured | End of Phase 1 |
| M2 | The blast radius is pinned | C6 and C7 asserted against current values | End of Phase 2 |
| M3 | The bar docks | C1, C2, C3 green, each shown red first | End of Phase 3 |
| M4 | The bar is readable | C4, C5 green | End of Phase 4 |

<!-- /ANCHOR:milestones -->
---

## 11. L3: ARCHITECTURE DECISION RECORD

### ADR-001: Consume the existing inset term rather than introducing `--keyboard-height`

**Status**: Proposed — `spec.md` §12 keeps it open pending the Phase 1 measurement.

**Context**: The stylesheet references `--keyboard-height` zero times. `010` already computes the
inset in `keyboardInset()` and publishes it as `--db-mobile-sheet-bottom`, with a pinch-zoom guard.

**Decision**: Consume `--db-mobile-sheet-bottom`.

**Consequences**:
- One place in the codebase decides what "the keyboard is open" means.
- The pinch-zoom guard is inherited rather than reimplemented or forgotten.
- The bar's placement is coupled to a term named for the sheet, which reads oddly. That is a naming
  cost, and it is smaller than a second definition of the same fact.

**Alternatives Rejected**:
- *Introduce `--keyboard-height` to the stylesheet*: more direct and more honestly named, but it
  creates a second answer to one question. Two owners of one fact is the defect shape this program
  has found repeatedly — in the sheet's child list, in the checkbox's appearance, in the note body's
  frontmatter.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] The host-shape question is answered and recorded
- [ ] The css lane is acquired and `lane:check` is green
- [ ] Desktop and embed geometry are measured and pinned
- [ ] Each new check has been shown red on the tree as received
- [ ] The operator has answered wrap / scroll / shorter labels

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Phase 1 is a stop condition. No stylesheet edit before the host shape is known |
| TASK-SCOPE | Every rule is keyed to the phone context. Desktop and the embed are frozen, not adjusted |
| TASK-EVIDENCE | A task closes on a measured number, not on a screenshot that looks right |
| TASK-CONTROL | A check closes only after it has been shown failing on the tree as received |
| TASK-BOTHENDS | Docking and row overlap are asserted together. Clearing the keyboard by covering a row is not a pass |
| TASK-HYGIENE | No spec paths, phase numbers or task ids in `styles.css` |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. A measurement taken in the harness rather than on a device
says which.

### Blocked Task Protocol

A task is BLOCKED when the host-shape answer is outstanding, the css lane is held elsewhere, or the
wrap/scroll/shorten decision has not been made. On BLOCK: record the blocker in `tasks.md` and stop.
**A window-resize host blocks the whole phase**, and that is reported as a finding rather than
worked around with CSS that cannot apply.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md)
- [`../010-sheet-reading-and-keyboard/spec.md`](../010-sheet-reading-and-keyboard/spec.md)
- [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md)
