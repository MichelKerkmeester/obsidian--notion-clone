---
title: "Decision Record: Phase 001 — List Grid Structure"
description: "ADR-P1-01 — whether the row's leading gutter is emitted as its own header cell or as padding on the first cell, and why AC-01 cannot be measured until it is decided."
trigger_phrases:
  - "006 phase 001 adr"
  - "leading gutter emission"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-clickup/001-list-grid-structure"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 001; FR-17 reversed per the operator's reading-identity decision"
    next_safe_action: "Wait for phase 000 to arm both guard tripwires"
    blockers: []
    key_files:
      - "decision-record.md"
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p001-dec"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Decision Record: Phase 001 — List Grid Structure

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-P1-01: How the row's leading gutter is emitted

**Status: OPEN.** It blocks `AC-01`'s measurement, not this phase's start.

<!-- ANCHOR:adr-001-context -->
### Context

The reference reserves a leading band on every row, empty at rest, that fills on reveal with a drag
grip and a selection checkbox. On the two primary captures that show it, the row's expand chevron,
record glyph and title sit at **the same horizontal positions** on the revealed row as on the
unaffected rows above and below it — so the band is allocated at rest and painted into, and it does
not push the row's content right. The group's own collapse toggle sits in the same band.

That fixes the **behaviour**: reserved, non-reflowing, shared with the group toggle. It does not fix
the **structure**. Two implementations produce it:

- **A — its own leading cell.** The gutter is a column in the grid, with a header cell that renders
  empty. Alignment across groups is free, because the grid already aligns columns.
- **B — padding on the first cell.** The gutter is inset space inside the title column's cell, with
  the affordances absolutely positioned into it. No extra track.

The parent's `AC-01` counts header elements as "visible columns plus the two utility columns", and
the two answers give different counts. The register already flags this: the emission decision **must
be recorded before the number is measured**, or the criterion cannot fail informatively — it fails
ambiguously, and the phase that fixes it gets to choose which reading it meant.

<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**Not yet made.** It is due at task T2.1b, before any header-count measurement.

What is already decided, and is not part of this question:

- The gutter is **reserved at rest**, not inserted on hover. Revealing it must not shift the row's
  chevron, glyph or title.
- It does **not** replace, hide or move the record glyph. The earlier reading that the checkbox swaps
  into the glyph's slot was contradicted by the captures and is recorded in the parent's ADR-004.
- The group's collapse toggle shares the same band. One gutter serves both.
- No slot in it is reserved for a subtask affordance. There is no subtask model and none is being
  built.

<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives

| Option | For | Against |
|---|---|---|
| **A — its own leading cell** | Alignment across groups is inherited from the grid. The header cell gives the group toggle a natural home. Easy to hit-test | Adds a track to every row. A read-only view renders an empty column that can never fill. The count in `AC-01` grows by one and the trailing track's symmetry argument gets weaker |
| **B — padding on the first cell** | No extra track; the grid stays content-width, which is what the reference does. Nothing renders in a read-only view | Absolute positioning inside a cell that also truncates text is fragile. Alignment across groups is no longer free — it depends on the inset being identical everywhere |
| **Defer past `AC-01`** | Nothing | Rejected. It is precisely the deferral the register bans: a criterion whose target depends on an undecided design choice cannot fail informatively |

<!-- /ANCHOR:adr-001-alternatives -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

Whichever is chosen:

- `AC-01`'s utility-column count is fixed by it and must be written into the register before the
  census number is compared against a target.
- `AC-16` (the positions of chevron, glyph and title, empty gutter versus occupied) is unaffected —
  it asserts non-reflow, which both options must satisfy.
- `AC-23`'s anchor is unaffected. It already names the **first column's leading-glyph origin** rather
  than its title text, because a reserved gutter and a variable run of glyphs sit between the two and
  the anchors do not coincide.
- Phase 000's `AC-31` is unaffected **by construction**: it was written so that either answer passes
  it, and T1.2d requires that to be demonstrated against both candidate structures. A tripwire that
  presumed one answer would fail a correct implementation of the other.

<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-five-checks -->
### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes. The reference reserves the band on every row and the register blocks a criterion on the answer |
| **Is there a simpler existing thing?** | Option B is the simpler of the two and is not obviously right; the grid's own alignment is the argument for A |
| **What does it touch?** | The row's leading structure, the group header's toggle position, and `AC-01`'s count |
| **What is the real caller that must not break?** | The table. Both views render through the same grid, so a leading track added for the list must be absent or empty for the table without a second code path |
| **What contract must not break?** | Non-reflow. Revealing the gutter must not move the chevron, the glyph or the title, in any of hover, focus and select |

<!-- /ANCHOR:adr-001-five-checks -->

<!-- ANCHOR:adr-001-impl -->
### Implementation note

Three constraints hold either way:

1. **No number comes off a capture.** The reference decides *which shape* the token is asked to
   produce; every value comes from the existing token scale.
2. **The trailing track is the mirror image and is already decided by observation** — the header's
   add-column affordance and the row's overflow menu occupy the same horizontal position. Whatever is
   chosen for the leading side should be argued against that symmetry rather than in isolation.
3. **Comment hygiene binds the implementation.** The gutter's `why` is that the band is allocated at
   rest so revealing the checkbox does not reflow the row. That is what belongs in a code comment. The
   ADR id does not.

<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->
