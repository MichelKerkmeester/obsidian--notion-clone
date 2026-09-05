---
title: "Decision Record: Stacked Sheets"
description: "ADR-001 an Obsidian modal opened from a sheet presents as a stacked sheet rather than forking the flow. ADR-002 every surface below the top is pushed back, not only the one directly beneath it. ADR-003 a sheet beneath another is never re-placed."
trigger_phrases:
  - "048 decision record"
  - "D1 modal presentation"
  - "stacked modal decision"
  - "stack parent marking decision"
  - "sheet re-placement decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-05T09:30:00Z"
    last_updated_by: "code-agent"
    recent_action: "Recorded D1 as accepted and the two model decisions the implementation forced"
    next_safe_action: "None — all three ADRs are decided and implemented"
    blockers: []
    key_files:
      - "src/views/modals/db-modal.ts"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/popover-position.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-adr"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "D1: modals opened from a sheet present as sheets"
---

# Decision Record: Stacked Sheets

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Does a modal opened from a sheet present as a sheet, or does the phone flow replace it?

**Status: ACCEPTED — 2026-09-05 (operator).**

### Context

`spec.md` §3 raised this as D1 and left it open, because it is the one question in the packet whose
answer changes how many code paths exist rather than how one behaves. Six inventory rows waited on
it: `Create property`, `ConfirmModal`, the two modal-on-modal chains, the import confirm, and the
`fullscreen` pair. The operator's third capture is the visible form of the question — `Create
property` arrives over the Properties sheet wearing Obsidian's own chrome, and the middle band the
capture shows is that chrome plus the host's round close button, not a third sheet.

### Decision

**Present as a sheet.** `DbModal.applyPresentation` routes every touch-mounted modal through
`attachSheetChromeToModal`, which gives it the shared header, hides the host's own close button, and
lets its content box scroll under that header. The phone flow is not forked.

Two consequences were accepted with it. A modal opened while a sheet is already open presents as a
sheet **even when its own declared presentation is `fullscreen`** — the `fullscreen` pair named as a
third arrangement in the inventory §3.8 therefore has no separate rule, because stacking over a sheet
is what decides it. And the header's title is resolved from the modal's own heading when the subclass
does not name one, so nineteen subclasses inherit a correct title without nineteen edits.

### Why not the alternative

Replacing each phone flow with a bespoke sheet forks twenty subclasses into a phone branch and a
desktop branch. This program has already paid once for two answers to one question
(`popover-position.ts:363-372`), and the mechanism for the accepted answer already existed:
`DbModal` has declared a presentation per subclass since `003`.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Is the pushed-back parent the one directly beneath the top, or every surface below it?

**Status: DECIDED — 2026-09-05 (implementation).**

### Context

The first cut of the model marked only the surface immediately beneath the top, which is what iOS
does when a modal covers its presenter completely. Phone sheets are bottom-anchored and shorter than
the screen, so a third-level chain leaves the outermost sheet visible above both surfaces stacked on
it — the operator's own capture shows two parents peeking above `Create property`.

### Decision

**Every sheet below the top is a stack parent**, marked by the mount rather than computed by any
surface. Depth still comes from the stack and still increments, but the visual treatment is one step
for all of them rather than a per-level ramp; a ramp was not built because no requirement asks for
one and nothing measures it.

Measured consequence: three depth-3 rows in the lane — `properties property type picker`,
`record column submenu`, `import confirm dropdown chain` — failed `parent dims and scales back`
under the first rule and pass under this one.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Does a sheet beneath another re-place itself when the stack changes?

**Status: DECIDED — 2026-09-05 (implementation).**

### Context

The model publishes a stack-change event so a sheet can re-read its keyboard inset when its depth
moves. Subscribing every sheet to it re-ran the anchored positioner on parents as well as on the top
surface. A parent whose anchor had been destroyed then re-resolved down the anchored branch, which
stripped its sheet chrome and left it detached beneath its own child — measured on the record sheet,
where the parent lost `db-mobile-bottom-sheet` and `isConnected` went false while its child stayed
open.

### Decision

**Only the top sheet re-places.** A sheet beneath one is not repositioned at all: the mount already
writes its inset to zero, so there is nothing left for a placement pass to compute, and re-running
placement on a parent is precisely what "the parent does not move" forbids. When the child closes and
the parent becomes top again, the same event re-places it and it picks the keyboard back up.

This is why REQ-002 and REQ-005 do not fight each other. The parent is not asked for a number and
then told to ignore it; it is not asked.
<!-- /ANCHOR:adr-003 -->
