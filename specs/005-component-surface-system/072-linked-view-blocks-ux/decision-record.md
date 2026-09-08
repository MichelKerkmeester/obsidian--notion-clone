---
title: "Decision Record: Linked View Blocks UX and Mobile Drag Parity"
description: "The design choices behind the linked-view drag handle's phone gesture: reusing the desktop's write path, adopting the board's gesture grammar, tapping to the established picker, and what was deliberately left to other packets."
trigger_phrases:
  - "072 decision record"
  - "linked view drag handle adr"
  - "linked view touch gesture design decisions"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/072-linked-view-blocks-ux"
    last_updated_at: "2026-09-08T16:50:00Z"
    last_updated_by: "implementation-continuation"
    recent_action: "Recorded the four design decisions"
    next_safe_action: "None — this document does not gate closure"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "072-linked-view-blocks-ux-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Linked View Blocks UX and Mobile Drag Parity

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The fence, not the database view, is the confirmed reading — and the other readings are recorded, not fixed

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Deciders** | Implementation session |

---

### Context

The report's "the seperate views from database" is plural and does not distinguish a linked-view
fence inside a note, a database opened as its own view/tab, or a view switched through the picker;
the "dragging doesnt work on mobile" half could mean the fence's handle, the board's cards, the
table's rows, or the toolbar's tabs. Every one of these is a different producer, and 069 had
already shipped board card drag for both hosts in 0.0.32.

### Constraints

- One continuation pass cannot fix five producers at 069's evidence standard (red first, mutation
  proof, a headless lane per surface) without the diff outrunning the packet.
- The goal's completion criteria require the surface determination to come first, with evidence —
  a half-argued "probably the fence" is exactly what the packet exists to replace.

### Decision

Proceed on the reading the report's wording literally matches — the feature *named* linked views,
rendered by the fence — while recording every other candidate with its file:line so the report is
answered even where it is not fixed. On the drag half, fix the confirmed surface's own control (the
fence's drag handle), and measure rather than assume the one thing 069's proof never drove (the
embedded host's board). Table row, column and view-tab reorder are enumerated as defect rows in
`plan.md` §3 for their own packets.

### Consequences

- The shipped diff touches one renderer and one stylesheet rule.
- Four same-class defects remain unfixed and documented; their next packet inherits the
  determination, not a fresh investigation.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The touch release and the desktop drop share one resolution+notice+move sequence

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Deciders** | Implementation session |

---

### Context

The handle's HTML5 drop already resolves the note under the drop, notices on failure, pushes
history and moves the fence. A pointer-based release needs the identical sequence — the phone drop
must not invent a second notice, a second history write, or a second failure mode.

### Constraints

- The unit harness's fake DOM executes the real listener bodies; any duplication would need its own
  parity tests forever.
- 069's board work already established the opposite rule: the touch path calls the same
  `moveCardAndOrder` the mouse path calls.

### Decision

Extract the sequence from `completeLinkedViewDrop` into `completeLinkedViewDropAt` and have both
the `DragEvent` path and the pointer-release path call it. A phone release with no note under the
finger gets exactly the notice the desktop drop gives, and a successful move gets exactly the
history write the desktop drop makes.

### Consequences

- The existing desktop-drop unit tests pass unchanged through the refactor — that is the proof the
  seam moved nothing.
- A future defect in the resolution logic is fixed once and reaches both pointers.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The gesture grammar is the board's, copied — not abstracted

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Deciders** | Implementation session |

---

### Context

The fence's handle needs a long-press lift on a phone. The board shipped 450 ms, a 10 px pre-lift
cancel window, and a 20 ms vibration; its parameters were chosen against the Notion reference
during 069 and its headless proof machinery is standing.

### Constraints

- Two gestures sharing one implementation would put a gesture-grammar module in this packet's diff
  for the benefit of exactly one consumer.
- The interests diverge already: the board's press target is a card (which also opens the record on
  a short tap); the handle's short tap must open the move picker, because until now the control did
  nothing at all and the picker was the only established route to the operation.

### Decision

Copy the 450 ms / 10 px / 20 ms constants and the lifted-class treatment verbatim into the handle's
own listener. Diverge where the surfaces diverge: the handle's short tap opens
`openMoveLinkedViewPicker()` — the same `MarkdownFileSuggestModal` the note-header "move to page"
menu already drives — so the control finally does what it looks like it does, and does it through
the picker that already exists rather than a new one.

### Consequences

- The 069 lane doubles as the gesture's regression proof: if the constants drift on the board, the
  fence's copied grammar is the second witness.
- A third consumer would justify the extraction; the dedicated-when-second rule stands.
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The 4 px toolbar overflow was the harness, not the stylesheet

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Deciders** | Implementation session |

---

### Context

The first lane runs reported a 4 px horizontal overflow (scrollWidth 398 vs clientWidth 394, and
330 vs 326 on the embed) on the toolbar row in all three mounts — the one discrepancy the phone
chrome measurement was built to catch, and the natural candidate for a stylesheet fix.

### Constraints

- Inside Obsidian, the app's own `* { box-sizing: border-box }` reset applies to the plugin's
  markup; the lane's bare HTML document gets no such reset, so `width: 100%` plus
  `.obnotion-toolbar-right`'s `6px 2px 2px` padding legitimately computes 4 px wider there.
- Editing `styles.css` to satisfy a harness would spend the css-lane handover, move captures, and
  change the shipped surface to agree with a document the shipped surface never runs in.

### Decision

Give the lane's harness the border-box reset the host app supplies, and leave the stylesheet alone.
Instrument the lane to name the overflowing descendant so the next 4 px failure names its culprit
instead of its magnitude.

### Consequences

- The lane's numbers describe the phone, not the harness; the overflow measures 0 px in all three
  mounts.
- The lane's harness now carries one more piece of host fidelity to keep — it is documented in the
  harness itself, where the next fidelity question will find it.
<!-- /ANCHOR:adr-004 -->

---
