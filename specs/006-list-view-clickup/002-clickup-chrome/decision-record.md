---
title: "Decision Record: Phase 002 — ClickUp Chrome"
description: "ADR-P2-01 the sort indicator's container and ADR-P2-02 the select pill's width, both deliberately left to the capture review so neither is smuggled into a threshold."
trigger_phrases:
  - "006 phase 002 adr"
  - "sort indicator badge"
  - "select pill width"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup/002-clickup-chrome"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 002; the two banned criterion shapes carried in verbatim"
    next_safe_action: "Wait for 001 to land the structure and hand over the held lane"
    blockers: []
    key_files:
      - "decision-record.md"
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p002-dec"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Phase 002 — ClickUp Chrome

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-P2-01: Does the sort indicator gain a badge container?

**Status: OPEN — deliberately.** Left to the capture review rather than settled in advance. No
criterion in this phase depends on the answer.

<!-- ANCHOR:adr-001-context -->
### Context

Both indicators carry the same information and differ only in container.

| | Ours | The reference's |
|---|---|---|
| Direction | a filled triangle | an arrow with a stem |
| Ordinal | the rule's index | the rule's index |
| Container | **none** — bare accent-coloured text, no background, border or padding | a **filled rounded badge**, separated from the label |
| One rule active | the ordinal is **suppressed** | **unobservable** — every primary capture carries a three-rule sort |

The attribution question is settled and it was settled the wrong way once. An earlier draft
recommended keeping our form and dropping the reference attribution, on the grounds that twenty
secondary screens showed no header arrow. That sample was assembled with nothing sorted, so a header
*could not* have shown one — absence of evidence read as evidence of absence. Five primary captures
then showed the indicator on three headers each, repeated in every per-group header row.

So the indicator is required and the attribution stands. What remains is only the container.

<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**Not yet made.** Due at the capture review in stage I, before the lane is released.

Deciding it in advance would put a container choice into a threshold, and a criterion whose target
depends on an undecided design choice cannot fail informatively. `AC-28` is therefore written over
the **count of indicator instances and the ordinal each carries** — both true whichever container
wins.

<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives

| Option | For | Against |
|---|---|---|
| **Keep bare text** | No new component. Lighter in a header row that repeats per group — on a five-group view the indicator renders fifteen times | Less legible against a busy header; the reference chose otherwise and the reference is the operator's stated target |
| **Adopt a badge container** | Matches the reference. Separates the indicator from the label so a sorted column reads at a glance | Fifteen filled badges on a five-group view is a lot of visual weight for a secondary signal |
| **Badge only when more than one rule is active** | Weight where it earns itself | The reference's single-rule behaviour is **unobservable** — every primary capture carries three rules — so this option is inventing a rule and attributing it |

<!-- /ANCHOR:adr-001-alternatives -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

- Whichever wins, the indicator is emitted from the **same header build path**, so it appears on
  every repetition rather than only the first. That is `FR-03a` and it is not part of this question.
- Our ordinal suppression at one active rule is **ours**, not copied. The reference's single-rule
  behaviour is unobserved and no claim is made about it.
- The container choice must not introduce a value off the token scale. `AC-20` counts them, target 0.

<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-five-checks -->
### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | The indicator does — five primary captures, three sorted headers each. The container is the open half |
| **Is there a simpler existing thing?** | Bare text, which we already ship. It is a live option, not a fallback |
| **What does it touch?** | The header build path, shared by both views |
| **What is the real caller that must not break?** | The table, which renders the same indicator today |
| **What contract must not break?** | Every repetition of the header row carries the indicator, with the same ordinal |

<!-- /ANCHOR:adr-001-five-checks -->

<!-- ANCHOR:adr-001-impl -->
### Implementation note

The capture review compares two rendered candidates side by side at the same widths and themes. It
does not compare one rendered candidate against a screenshot of the reference — that is how a pixel
value crosses the licence boundary.

<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-P2-02: Is the select pill uniform-width within its column?

**Status: OPEN — deliberately.** Left to the capture review. No criterion in this phase depends on
the answer.

### Context

The reference's select pills are **uniform width within their column**, measured on three primary
captures: every pill occupies the same horizontal extent regardless of label length, inset from both
column edges, with the chevron at the pill's right edge and the unset dash sitting where the filled
pill's left edge would be rather than centred in the cell.

Ours are text-hugging.

This is the evidence an earlier decision left open. It does **not** settle the question: the
hierarchy argument against uniform width still stands — a pill that spans its track reads as a
heavier element than a categorical value deserves, and in a grid that is already content-width it
adds weight to every row. What has changed is that the capture review now compares two **measured**
shapes instead of one measured and one imagined.

### Decision

**Not yet made.** Due at the capture review in stage I.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Text-hugging (ours today)** | Lighter. The pill's width carries information — a short label reads as a short value | Ragged left edges down a column; the unset dash has no natural anchor |
| **Uniform width within the column** | Matches the reference on three captures. The unset dash gets an anchor — the pill's left edge — which is what the reference does | Heavier. Every row gains a full-width filled element for a categorical value |
| **Uniform width only for columns above a width threshold** | Neither ragged nor heavy | A threshold nobody has measured, and a rule the reference does not show. This is the third check failing: the target depends on a choice nobody has made |

### Consequences

- `FR-21`'s requirement — a dropdown affordance at rest, colour from the option — holds either way.
  `AC-29` asserts the affordance's presence, not the pill's width.
- The unset-cell rendering follows from this decision. `AC-21` and the placeholder task both describe
  the dash's position relative to the pill's left edge, which only has a fixed meaning under uniform
  width. If text-hugging wins, that phrasing is re-derived rather than kept.
- No measured width from any capture reaches the stylesheet. The reference decides **which shape**
  the token is asked to produce.

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — the two shapes render differently and the choice is visible on every row |
| **Is there a simpler existing thing?** | Text-hugging, which we ship. It is a live option |
| **What does it touch?** | The select and status cell renderer, shared by both views |
| **What is the real caller that must not break?** | The table, which renders the same cells |
| **What contract must not break?** | The colour comes from the option's configured colour and never from the value's magnitude |

### Implementation note

If uniform width wins, the width comes from the column track and the token scale — never from a
measurement taken off a capture.

<!-- /ANCHOR:adr-002 -->
