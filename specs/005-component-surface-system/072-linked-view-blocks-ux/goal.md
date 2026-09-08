---
title: "Goal: Linked View Blocks UX and Mobile Drag Parity"
description: "The durable directive this packet executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "072 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "072-linked-view-blocks-ux"
    last_updated_at: "2026-09-08T17:05:00Z"
    last_updated_by: "implementation-continuation"
    recent_action: "Implemented, proved, gate green; device pass open"
    next_safe_action: "The operator's device pass (AC-004); the four enumerated readings are other packets' work"
    blockers: []
    key_files:
      - "spec.md"
      - "implementation-summary.md"
      - "tools/live/embedded-linked-view-ux.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "072-linked-view-blocks-ux-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Does R2 mean embedded/linked database views inside notes, table row/column drag, or both? — the fence, whose handle was touch-dead; the other readings enumerated, not fixed"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Linked View Blocks UX and Mobile Drag Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** R2's ambiguous "separate views… bugged" and "dragging doesnt work on mobile like it would on notion" is resolved into a named, confirmed surface, and mobile drag on that surface matches Notion's own feel.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The surface is determined against the shipped 0.0.32 build, not assumed from the report's wording alone |
| D2 | Board cross-group drag is out of scope — already shipped in `069` |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Surface determination complete: R2 traced to embedded/linked views, table drag, or both, with file:line evidence — the linked-view fence, its handle's HTML5-only wiring, and the other readings, all named (`spec.md` §2, `plan.md` §3)
- [x] UI/UX defects on the confirmed surface(s) enumerated — 6-row defect table: one fixed, four recorded, one measured to parity (`plan.md` §3)
- [x] Mobile drag on the confirmed surface(s) fixed and measured against a Notion reference capture — the 069 gesture grammar; the 4 gesture tests red→green (2\|28 → 30/30) and the two-bag lane parity (`implementation-summary.md`)
- [x] Operator device row recorded and left unticked — AC-004, Untmet until the operator's own phone speaks
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Surface determined | Done | `spec.md` §2, 2026-09-08 — the linked-view fence (a); (b)/(c) recorded, not fixed |
| Implementation + verification | Done | 4 unit tests red→green with 4 single-diff mutations; the two-bag lane, `RESULT: PASSED` twice; gate exit 0, 27 green — `implementation-summary.md` |
| CSS lane | Done | Acquired from 075 at its released hash, the one-rule edit recorded, 4 movers reviewed by decoded pixel delta, released — `tools/lane/css-lane.json` |
| Operator device pass | Open | AC-004, the only criterion the operator's phone can decide |

### Deviations and findings

| Item | Note |
|------|------|
| The lane's first runs corrected its own expectations | The same-column drop expectation was rewritten to the shipped keep-in-place rule (0 calls, not 1), and the 4 px toolbar overflow was traced to the harness's missing border-box reset, not the stylesheet — decision-record ADR-004 |
| 12 evidence artefacts went stale under the one-rule stylesheet edit | Re-measured by their own tools, never edited; `engine-parity`'s 50 known differences verified byte-identical to its committed list |
| The gate's first run | 1 unexpected failure (`lint:tools`, the new lane's unused variable); fixed; the re-run: 27 green, 0 red |
<!-- /ANCHOR:log -->
