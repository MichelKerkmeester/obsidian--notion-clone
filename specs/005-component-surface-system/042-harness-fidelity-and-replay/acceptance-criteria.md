---
title: "Acceptance Criteria: Harness Fidelity and Replay"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "042 acceptance criteria"
  - "harness fidelity closure gate"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/042-harness-fidelity-and-replay"
    last_updated_at: "2026-09-03T23:50:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria for this packet"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers: []
    key_files:
      - "spec.md"
      - "goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-042-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Harness Fidelity and Replay

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/042-harness-fidelity-and-replay
**Level:** 3
**Status:** Draft
**Date:** 2026-09-03
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given no gate check constructs the chart renderer (`grep -in chart tools/live/render-assertion-harness.ts` returns nothing), When a chart-renderer scenario with an owned negative control is added, Then the scenario is observed red on the uncovered state before the fix and green after, with the control demonstrated failing on a present defect. | `node tools/live/render-assertions.mjs`, `$?`; `tools/live/renderer-coverage.json`'s `constructed` count | Unmet | - |
| AC-002 | REQ-002 | Given the calendar lane only ever calls `makeCalendarConfig(columns, "month")` (`render-assertion-harness.ts:1077`), When `scale: "week"` and `scale: "day"` scenarios are added with bounds set from measured reads, Then each is observed red on the uncovered state and green after, with an owned negative control per scale. | `node tools/live/render-assertions.mjs`, `$?`; each scenario's per-item bound assertion | Unmet | - |
| AC-003 | REQ-003 | Given `npm run replay`'s claims cover only phases `000`, `001`, `002`, `004`, `005` (8 claims, `tools/live/replay.json`), When entries for report 29, reports 34-36, and phases `037`-`041` are added with their recorded pre-fix numbers, Then `npm run replay` exits 0 with every new claim `held: true`, and removing a required entry reds the lane. | `node tools/live/replay.mjs`, `$?`; `tools/live/replay.json`'s `claims` array and count | Unmet | - |
| AC-004 | REQ-004 | Given three named row-6 dependencies (pinned `runtime-vars.css` calendar formula, `touch-targets.mjs`/`unstyled-links.mjs` fixture reads, `theme.css`'s absent `.mod-cta`), When each is audited, Then each is either removed (harness reads the constructed renderer or the product's real value) or declared in `goal.md`'s log with the exact criterion it cannot prove — no dependency is left silent. | Direct read of `tools/screenshots/runtime-vars.css`, `tools/live/touch-targets.mjs`, `tools/live/unstyled-links.mjs`, `tools/screenshots/theme.css` after the change; `grep` confirms removal or the declaration exists | Unmet | - |
| AC-005 | REQ-005 | Given `check-lane.mjs`'s `changedCaptures()` reads a byte-level git diff and the capture harness is not byte-deterministic (parent `goal.md` Traps: an identical rerun moved a different file set each time, 0 of 240 `layoutHash` entries moved across the same runs), When the comparator is corrected to a content/layout-hash or declared-tolerance basis, Then an A/B against a clean HEAD clone shows no false-positive churn on an unchanged capture and still catches a deliberately mutated one. | `tools/lane/check-lane.mjs`'s `changedCaptures()`/`reviewVerdict()` source; the A/B run's recorded output | Met | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Not yet started. Every criterion above is `Unmet`. Write this section when the packet closes, not
before — it should name which criteria carried the packet and what was consciously left out.
<!-- /ANCHOR:closure -->
