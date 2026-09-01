---
title: "Acceptance Criteria: Phase 002 — ClickUp Chrome"
description: "Measurement plans for the chrome criteria, the per-criterion negative controls, and the three checks every row here had to pass before it was accepted."
trigger_phrases:
  - "006 phase 002 criteria"
  - "chrome negative controls"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-clickup/002-clickup-chrome"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 002; the two banned criterion shapes carried in verbatim"
    next_safe_action: "Wait for 001 to land the structure and hand over the held lane"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p002-acc"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Phase 002 — ClickUp Chrome

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Phase** | `002-clickup-chrome/` |
| **Criterion definitions** | [`../acceptance-criteria.md`](../acceptance-criteria.md) — the packet register |
| **This file** | The measurement plan, and the three checks each row here had to pass |
| **"Today" cells** | Filled by phase 000's census, **before any stylesheet edit existed to bias them** |
| **Measurement surface** | `tools/storybook/verify-placement.mjs` against system Chrome, at the production mount point |
| **Owned** | `AC-12` to `AC-21`, `AC-27`, `AC-29`, and the chrome half of `AC-25` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

### 2.1 Distinguishability is a per-criterion obligation

Each criterion this phase owns names **the node whose deletion must move an asserted number**. If
deleting it moves nothing, the criterion is rejected and rewritten. That is what happened to every
check that passed in release 1.3.1 while the operator saw no change.

A blanket claim that "the harness can see the list" does not satisfy this. Phase 000 proves the
harness distinguishes **one** node; every criterion here proves it for **its own**.

### 2.2 The three checks each row had to pass

Two banned shapes and one ambiguity check, applied to every criterion below before it was accepted.

**Check 1 — is it already true at rest?** A criterion asserting chrome that the current tree already
renders passes before a line is written. The instance in this packet: *"in edit mode the cell renders
a bordered pill."* Bordered chips appear in whole columns of **resting** rows on every primary
capture, so the criterion is true on HEAD. No criterion here asserts edit-mode chrome at all — the
captures show no edit state (`U2`), so there is nothing to assert it against.

**Check 2 — does the reference contradict the threshold?** The instance: the withdrawn `AC-16` read
*"the checkbox and the record icon occupy the same box, within 1px."* The captures show a reserved
gutter beside a glyph that stays put, so an implementation matching the reference would have
**failed** it. More dangerous than check 1, because the criterion was precise, measurable and
negative-controllable — and pointed at the wrong behaviour.

**Check 3 — does the target depend on an undecided choice?** Such a criterion fails ambiguously, and
the phase that fixes it chooses which reading it meant. Two of this phase's choices are open, so
**no criterion here depends on either**: the sort indicator's container (ADR-P2-01) and the select
pill's width within its column (ADR-P2-02).

### 2.3 Measurement plans

| ID | Subject named | Probe | Negative control |
|---|---|---|---|
| `AC-12` | `db-list-group-new` — **the affordance, not the row containing it** | authored declarations applying at the production mount point | delete the node; the measured set empties |
| `AC-13` | `db-list-row-checkbox` — same | same | delete the node; the measured set empties |
| `AC-14` | the gap between two adjacent rows, and the divider count | measured gap and count | delete a row; the divider count drops by one |
| `AC-15` | two group header pills, **group field carrying per-option colours** | two measured background colours | give both groups the same value; the colours converge |
| `AC-16` | chevron, record glyph and title, gutter empty versus occupied, in hover, focus and select | positions within 1px in every state, **and** box intersection between checkbox and glyph | delete the gutter; the two measurements collapse into one |
| `AC-17` | every text pair introduced or changed, **both themes** | contrast ratio | raise the background lightness; the ratio falls |
| `AC-18` | any border that alone identifies a control | contrast ratio | as above |
| `AC-19` | rendered row height at each of three densities | three values | set all three the same; they converge |
| `AC-20` | literals introduced off the token scale | a count | introduce one deliberately; the count rises |
| `AC-21` | a multi-value cell at a narrow width | overflow chip present, row height unchanged, **and distinguishable from an add affordance** | widen; the chip disappears |
| `AC-27` | two group headers **with colour removed from the measurement** | the rendered glyph node and the pill's text | give both groups the same value; the signals converge |
| `AC-29` | a `select` or `status` cell **at rest** | the dropdown affordance node | delete the affordance; the measurement empties |

### 2.4 Two rows that carry more weight than they look like they do

**`AC-27`, not `AC-15`, is the one that must hold for every group field.** `AC-15` is scoped to a
colour-bearing group field on purpose — the reference renders a non-status group field as a neutral
chip with **both** its group values carrying the same treatment, so an unscoped colour-difference
criterion would fail a rendering that correctly follows the field. The scope is not a hedge. A
criterion that only compares pill background colours also passes a colour-only encoding, which is
exactly what `FR-11a` exists to prevent.

**`AC-21` must not match on a leading `+`.** The reference carries a `+N` overflow chip **and** a
separate trailing `+` add affordance in the same column at rest. They are different glyphs and a
measurement matching on a leading `+` alone passes on the wrong node.

### 2.5 What no criterion here may assert

- **Edit-mode chrome.** No capture shows an edit state (`U2`).
- **That a collapsed group keeps its header row.** No capture shows a collapsed group (`U3`).
- **That the row divider is absent in the reference.** The captures are dark theme at a scale that
  does not resolve a hairline (`U6`). Absence there carries no information.
- **What the row's leading glyph encodes.** It varies across rows and groups in ways four captures
  cannot attribute (`U10`). The slot is allocated by `FR-13`; its occupant is **our** design decision.
- **Any numeric value read off a capture.** Forbidden by the licence boundary independently of scale
  (`U12`).

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

This phase closes when every criterion it owns has a recorded failing measurement from the 000
census, a recorded passing measurement from this tree, **and a negative control that moved** — and
when a named human has looked at the regenerated captures and signed off.

The capture-manifest check does not close this phase. It proves a capture was regenerated after its
source changed and it never opens an image.

A phase that reports all-green while a negative control moved nothing has not been verified. It has
been asserted.

<!-- /ANCHOR:closure -->
