---
title: "Decision Record: Dropdown, Menu and Picker Componentization"
description: "ADR-001 the submenu is a child surface in the overlay stack, not an inline region. ADR-002 the create-affordance slot is preserveValueOnSelect, not a new option kind. ADR-003 the geometric grid navigator is one function keyed by layout."
trigger_phrases:
  - "052 decision record"
  - "submenu child surface decision"
  - "create option slot decision"
  - "grid navigator decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/052-dropdown-menu-and-picker-componentization"
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the three decisions the plan takes before implementation"
    next_safe_action: "Execute T001, the capture read"
    blockers: []
    key_files:
      - "src/views/owned-menu.ts"
      - "src/views/overlay-stack.ts"
      - "src/views/dropdown-field.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-052-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Hover-open submenus on desktop: deferred to the grammar doc's open question, not decided here"
    answered_questions: []
---
# Decision Record: Dropdown, Menu and Picker Componentization

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Is a submenu an inline region inside its parent menu, or a child surface in the overlay stack?

**Status: DECIDED — 2026-09-05 (this packet, within its granted scope).**

### Context

The menu primitive needs real submenus (REQ-001). Two mechanisms exist in the codebase's history:
the column menu's hand-built subpopovers — separate body-mounted surfaces with their own cleanup
(`column-menu.ts:568-633`) — and the inline option, never tried here. Anytype's submenus are
separate hover-opened surfaces (research §9), which is evidence for the child-surface shape but not
proof, since our phone grammar differs from Anytype's mobile stack.

### Decision

**Child surface, registered in `overlayStack` with `parentId` set to the parent menu's surface id.**
Escape closes the innermost only; the LIFO dismissal rule holds without a new listener pair (the
design-system's "a second dismissal system" anti-pattern stays dead); and the phone expression is
the stacked sheet `048` already registers for this exact shape — the `record column submenu` pair
(`sheet-grammar.mjs:110-112`) is a dropdown at depth 3 today and stays a registered child surface
under the primitive.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Inline region inside the parent menu** | One surface, no registration cost | Breaks `044`'s header-per-sheet grammar on phone (the submenu would be rows inside a sheet whose header names the parent's subject); re-invents the hand-built lifecycle this phase deletes; Escape/outside-dismissal needs a second mechanism |
| **Keep per-surface subpopovers, just tidy them** | No primitive change | Leaves the "affordance without a mechanism" anti-pattern live; every future submenu re-pays the cleanup lifecycle |

### Consequences

- `OwnedMenuHandle` gains a child-menu method; `menu-row.ts`'s `submenu: true` chevron becomes true.
- Depth-3 chains keep `048`'s stacking behaviour; the registered pair's selector may change only in
  the same leg that changes the markup (plan §4).
- Hover-open on desktop is **not** decided here — it is `anytype-menu-grammar.md`'s G8 gap and
  `spec.md` §11's open question, because the captures show no hover state.

### Five checks

| Check | Answer |
|-------|--------|
| **Does this need to exist at all?** | Yes — REQ-001 exists because the chevron currently promises a menu nothing can open |
| **Is there a simpler existing thing?** | `overlayStack`'s `parentId` — declared since before `048` and load-bearing since it; no new registry |
| **What does it touch?** | `owned-menu.ts` (handle), `menu-row.ts` (chevron truth), `column-menu.ts` (consumer) |
| **What is the real caller that must not break?** | The depth-3 registered pair `record column submenu` and every `createOwnedMenu` caller — the handle is additive |
| **What contract must not break?** | `044`'s header-everywhere and `048`'s stacking model, consumed unchanged |
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Is the create-affordance slot a new option kind, or the existing `preserveValueOnSelect` action row?

**Status: DECIDED — 2026-09-05 (this packet, within its granted scope).**

### Context

Anytype's pickers carry a create affordance inside the picker ("Filter or create options…",
`anytype-filter-tag-value-picker-dark.png`; grammar G11). Our dropdown already has an action-row
mechanic — `preserveValueOnSelect` (`dropdown-field.ts:42-43`), used by four call sites for
create-field actions — and the cell option editor has its own add row (`cell-renderer.ts:1508-1516`).

### Decision

**`preserveValueOnSelect` is the slot.** Anytype's pattern is adopted as a convention (the action
row sits last in its section, reachable from the empty state) plus the shared search of REQ-006 —
not as a second option kind. The cell option editor's add row remains the reference implementation
for inline creation and is rendered through the shared row builder.

### Alternatives

| Option | For | Against |
|---|---|---|
| **New `createOption` kind** | Mirrors Anytype's semantics literally | Forks the option model the picker host just unified; four existing call sites migrate for no behavioural gain |
| **No convention; per-surface as today** | Zero migration | The affordance's existence stays invisible to callers; the drift this phase closes continues |

### Consequences

- `DropdownOption`'s shape is frozen as the family's shared option model (plan §4).
- The operator still disposes how far the convention reaches (spec §11's open question) — this ADR
  fixes the mechanism, not the rollout breadth.

### Five checks

| Check | Answer |
|-------|--------|
| **Does this need to exist at all?** | Yes — G11 is one of the two Anytype patterns the pickers visibly lack |
| **Is there a simpler existing thing?** | `preserveValueOnSelect`, shipped and proven at four call sites |
| **What does it touch?** | The shared search's empty state, and documentation of the convention |
| **What is the real caller that must not break?** | The four existing `preserveValueOnSelect` call sites — the convention is their generalisation, not a change |
| **What contract must not break?** | `DropdownOption`'s public shape; `048`'s registered dropdown pairs |
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Is the geometric grid navigator one function keyed by layout, or two functions?

**Status: DECIDED — 2026-09-05 (this packet, within its granted scope).**

### Context

`icon-picker-popover.ts:281-306` and `option-color-picker.ts:130-173` are near-identical
nearest-neighbour navigators; the icon picker's variant is row-aware (the grid's row length changes
with width), the colour picker's flat (a fixed 3-column swatch row). Both were written for the same
problem at different grid shapes.

### Decision

**One function in the picker host, keyed by layout**: the row-aware branch is the same function
with row partitioning enabled. The colour grid enables it with its fixed-row parameter; the icon
grid measures rows. Both pickers consume the one implementation (REQ-003, checklist C5).

### Alternatives

| Option | For | Against |
|---|---|---|
| **Keep two functions** | No migration risk | C5 never closes; the next grid change re-drifts them exactly as the design-system's row-vocabulary section documents |
| **One function, no layout key** | Simplest | Either the row-aware logic pollutes the flat case or vice versa; the key is what keeps both behaviours honest |

### Consequences

- Both navigators' recorded behaviour is the unit test's oracle: the unified function must reproduce
  both legacy implementations' outputs on their own grids before either picker migrates (tasks T012).

### Five checks

| Check | Answer |
|-------|--------|
| **Does this need to exist at all?** | Yes — C5's baseline of 2 is a counted duplication |
| **Is there a simpler existing thing?** | Either of the two functions, generalized once |
| **What does it touch?** | `popover-host.ts` (the function), both pickers (consumers) |
| **What is the real caller that must not break?** | Arrow-key navigation in both pickers — oracle-tested against recorded outputs |
| **What contract must not break?** | The pickers' keyboard accessibility (`aria-pressed`/roving tabindex behaviour unchanged) |
<!-- /ANCHOR:adr-003 -->
