---
title: "Decision Record: Add-Property Sheet Redesign"
description: "The architectural decisions this phase took, their alternatives, and their status."
trigger_phrases:
  - "decision record"
  - "003-add-property-sheet decisions"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/003-add-property-sheet"
    last_updated_at: "2026-09-08T23:02:00Z"
    last_updated_by: "003-implementation-leg"
    recent_action: "Recorded the absorbed-shape, sole-scroller, definite-height and shared-builder decisions"
    next_safe_action: "None here; 071-002-settings-sheet takes the css-lane next"
    blockers: []
    key_files:
      - "src/views/modals/create-property-modal.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-add-property-sheet-implementation"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Add-Property Sheet Redesign

<!-- ANCHOR:adr-001 -->
## ADR-0001 — The picker's 21 formats become inline scrolling rows inside the create sheet (absorbed shape)

**Status:** Accepted

**Context.** The property-type picker must show Select, Multi-select, Status, Formula, Relation, Rollup, Files and the four timestamp/user formats while the note header stays visible and the keyboard is up. Notion iOS opens the type picker as a second surface after the name step; Anytype keeps a modal type grid. Our presentation contract is replace-in-place: the type-picker dropdown never becomes a third sheet.

**Decision.** The 21 formats render as one flat scrolling list inside the create sheet itself — no second surface, no replaced-in-place step, no Basic/Options/Advanced grouping (the grouping stays the column-menu submenu's own concern).

**Alternatives considered.**
- *Notion's second surface* — rejected: it breaks the packet's replace-in-place presentation contract for this family and adds a third sheet to the stack the grammar already measures.
- *Anytype's modal type grid* — rejected: a grid of tiles loses the per-format reason line the gated Relation→Rollup path needs, and the plugin's token ladder has no tile geometry to inherit.
- *Grouped ladder (Basic/Options/Advanced) inside the sheet* — rejected for this surface: the grouping exists for the column-menu's submenu where more than the format matters; here it adds headers to a 21-row list the operator scans, and one flat list is what the Notion reference's properties surface reads.

**Consequences.** The whole 21-row list must scroll inside the sheet's own 90svH ceiling; the sheet needs a definite height (ADR-0003) and exactly one scrolling element (ADR-0002). The former trigger-and-replace shape and its search input retire from this surface.

<!-- /ANCHOR:adr-001 -->

<!-- ANCHOR:adr-002 -->
## ADR-0002 — The list, not the form, is the sole scrolling element

**Status:** Accepted

**Context.** The previous shape traded the whole form for a replaced-in-place picker, which moved what the user had already typed.

**Decision.** Name field and key row stay pinned above the format list and outside the scrolling element; only the list scrolls (`flex: 1 1 0` under `min-height: 0`), inside the sheet's existing keyboard-aware 90svH cap. Rows carry a 44px minimum pitch, icon + label, 16px inline padding, and a 402×874 no-overflow guard.

**Alternatives considered.** *Scrolling the whole form* — rejected: the name the user typed jumps out of view exactly when the keyboard occupies the lower third; the reference's own surfaces keep the identification step stationary.

**Consequences.** What the user has already typed never moves, whatever the list does. The pinned row and the scroller are separate boxes, which is what the harness's pinned-above-the-list assertion measures.

<!-- /ANCHOR:adr-002 -->

<!-- ANCHOR:adr-003 -->
## ADR-0003 — The sheet takes a definite keyboard-aware height, not only a cap

**Status:** Accepted

**Context.** Under the 90svH maximum, the pinned fields alone under-fill the ceiling, so an auto-height sheet collapses to them and the list's `flex: 1 1 0` divides a zero-height box — 21 formats in a scrollbox nobody can see.

**Decision.** The sheet's root (guarded by `:has(> .obnotion-create-property-modal)`) takes `height: calc(90svh - var(--obnotion-mobile-sheet-bottom, 0px))` — the same keyboard-aware arithmetic its own cap reads.

**Alternatives considered.** *A fixed pixel height* — rejected: it would not follow the host's keyboard inset variable, recreating the overlap defect this phase exists to close. *Making the whole formscroll* — superseded by ADR-0002.

**Consequences.** The list always owns a real remainder; the sheet's height reads the same variable the keyboard-inset defence uses, so the two cannot disagree.

<!-- /ANCHOR:adr-003 -->

<!-- ANCHOR:adr-004 -->
## ADR-0004 — The harnesses measure the shared body builder, not the modal class

**Status:** Accepted

**Context.** The sheet-grammar harness cannot construct a `DbModal` (the obsidian stub only throws), yet its assertions must measure what the modal really mounts, not a copy.

**Decision.** The dialog's whole form lives in `renderCreatePropertyBody`, mounted by the `CreatePropertyModal` class in the plugin and by the grammar's faithful host-modal stand-in in the harness. Neither mounts a copy; the confirm step (collision checks, result) stays with the modal, which is the only party that owns it.

**Alternatives considered.** *A second harness-local builder* — rejected: a copy drifts; the first divergence would silently make the grammar measure a sheet the plugin never ships.

**Consequences.** The grammar's geometry assertions and the vitest suite (which pins the choices underneath the geometry: the 21-row completeness, the gated reason, the pinning, the label→key mirror, Enter-submit) exercise one builder. A behavioural change to the sheet cannot pass one harness while failing the other.
<!-- /ANCHOR:adr-004 -->
