---
title: "Decision Record: Dropdown, Menu and Picker Componentization"
description: "ADR-001 the submenu is a child surface in the overlay stack, not an inline region. ADR-002 the create-affordance slot is preserveValueOnSelect, not a new option kind. ADR-003 the geometric grid navigator is one function keyed by layout. ADR-004 amends the create row's placement against the capture read and confirms ADR-001 and ADR-003. ADR-005 rules on which measured Anytype values the family adopts and which it refuses."
trigger_phrases:
  - "052 decision record"
  - "submenu child surface decision"
  - "create option slot decision"
  - "grid navigator decision"
  - "create row placement decision"
  - "menu geometry adoption decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/052-dropdown-menu-and-picker-componentization"
    last_updated_at: "2026-09-05T16:10:00Z"
    last_updated_by: "design-trueup"
    recent_action: "Added ADR-004 and ADR-005 after T001's capture read; amended ADR-002's placement clause"
    next_safe_action: "Execute T002, the red baselines, with the corrected census figures"
    blockers: []
    key_files:
      - "src/views/owned-menu.ts"
      - "src/views/overlay-stack.ts"
      - "src/views/dropdown-field.ts"
      - "design-trueup.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-052-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "How far the create-option convention reaches beyond select-value pickers — the operator's, not this record's"
      - "Whether the desktop view-tab context menu is built at all, given no capture shows one"
    answered_questions:
      - "Hover-open submenus on desktop: YES, proved by the sweep's own procedure and decided in ADR-004"
      - "Escape closes the innermost only: observed in the capture procedure, confirming ADR-001"
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
- Hover-open on desktop is **not** decided here — ~~it is `anytype-menu-grammar.md`'s G8 gap and
  `spec.md` §11's open question, because the captures show no hover state~~. **[amended 2026-09-05 ·
  T001]** The premise was wrong: 37 menus were reached by hovering a parent row, so the captures do
  show hover states. **ADR-004 decides it** — hover-open adopts behind `@media (hover: hover)`. And
  this ADR's own Escape clause stops being a design argument: `screenshots/anytype/README.md` records
  that one Escape closes the child and leaves the parent open, which is innermost-only **observed**.

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
`anytype-filter-tag-value-picker-dark.png`; grammar G11). **[T001 measured four shapes, not one]**:
that placeholder, a first row under the search (`menus/anytype-menu-object-more-add-link-to-object-dark.png`),
an iOS header `＋`, and a `Create` button inside the empty state. Our dropdown already has an action-row
mechanic — `preserveValueOnSelect` (`dropdown-field.ts:42-43`), used by four call sites for
create-field actions — and the cell option editor has its own add row (`cell-renderer.ts:1508-1516`).

### Decision

**`preserveValueOnSelect` is the slot.** Anytype's pattern is adopted as a convention (~~the action
row sits last in its section~~ — **placement amended by ADR-004, 2026-09-05 · T001: the create row
sits *first*, under the search field and above the list; last-in-section is where Anytype puts an
escalation** — reachable from the empty state) plus the shared search of REQ-006 — not as a second
option kind. **The mechanism this ADR fixes is unchanged**; only the placement clause moved. The cell option editor's add row remains the reference implementation
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

---

<!-- ANCHOR:adr-004 -->
## ADR-004: Where does the create affordance sit, and what does the capture read change about the three earlier decisions?

**Status: DECIDED — 2026-09-05 (T001's read; this packet, within its granted scope).**

### Context

`design-trueup.md` is T001's output and the read of record for this packet. It opened the 150
clipped menus in `screenshots/anytype/menus/` and the 59 iOS states in `screenshots/anytype/mobile/`
and measured them. Eleven drafted premises are wrong; three of them touch decisions this record has
already taken, and one of those is a decision clause rather than a mechanism.

ADR-002 fixed the create-affordance **mechanism** as `preserveValueOnSelect` and, in passing, its
**placement**: "the action row sits last in its section". The captures contradict the placement.

### Decision

**The mechanism stands; the placement is amended.**

1. **The create row sits first — directly under the search field and above the list.** Measured on
   `menus/anytype-menu-object-more-add-link-to-object-dark.png`: `＋ Create Object` renders between
   the search field and the first result, with the `＋` in the 16px icon slot. That is the only
   position where the affordance is reachable while the query that would create the thing is still
   on screen.
2. **Last-in-section is reserved for escalation, not creation.**
   `menus/anytype-menu-set-filter-property-picker-dark.png` puts `Add advanced filter` last, below a
   divider — an escalation out of the current surface, which is a different act.
3. **The affordance stays reachable when the list is empty.** All three captured phone shapes keep
   it: a header `＋` (`sheet-cell-select-priority`, `sheet-relation-add`) and a `Create` button
   inside the empty state (`sheet-cell-multiselect-empty`). This is AC-006's clause, and it is now
   evidence-backed rather than asserted.
4. **Four shapes, chosen by surface, not one.** Search placeholder where typing creates; first row
   where creation is a distinct act; header `＋` on the phone; a button in the empty state.

**ADR-001 is confirmed rather than changed, and two of its clauses stop being design arguments.**
Hover-open and innermost-only Escape are now **observed**: the sweep could open each of the 37
submenus only by hovering its parent row, and `screenshots/anytype/README.md` records that one
Escape closes the child and leaves the parent open. `spec.md` §11's hover question closes with it —
hover-open on desktop behind `@media (hover: hover)`, click and `ArrowRight` retained.

**ADR-003 is confirmed, with its citations corrected.** Both navigators are still ours, still
grids, still near-duplicates; the line numbers have drifted to `option-color-picker.ts:138` and
`icon-picker-popover.ts:284`. Anytype's colour picker turns out to be a **224px labelled list, not a
grid** (`menus/anytype-menu-object-block-menu-color-dark.png`), which removes an outside precedent
for our grid but changes nothing about the duplication ADR-003 exists to end.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Keep "last in its section"** | No amendment; the drafted convention stands | Contradicted by the only capture that shows the row. A create row below the results is off screen exactly when a long list makes creation likeliest |
| **Adopt the placeholder alone** | One shape, cheapest | Three of the four captured shapes are not placeholders, and a placeholder disappears the moment the user types — which is when the create act becomes available |
| **Adopt Anytype's labelled colour list** | Matches a captured surface | A redesign of a shipped picker with a registered `048` pair, for no requirement in this packet |

### Consequences

- `componentization-plan.md` P1/P2's create-affordance rows carry the captured position.
- The shared search's empty state renders the affordance, which AC-006 already asserts.
- ADR-002's five checks are unaffected: the mechanism, its four call sites and `DropdownOption`'s
  frozen shape are exactly as recorded.
- `spec.md` §11 loses one open question and keeps two.

### Five checks

| Check | Answer |
|-------|--------|
| **Does this need to exist at all?** | Yes — a decision clause contradicted by the evidence it cites cannot stand unamended |
| **Is there a simpler existing thing?** | `preserveValueOnSelect`, unchanged. This ADR moves a row, not a mechanism |
| **What does it touch?** | The shared search's row order, and the documentation of the convention |
| **What is the real caller that must not break?** | The four existing `preserveValueOnSelect` call sites — position is a render-order change, not an API change |
| **What contract must not break?** | `DropdownOption`'s public shape; `048`'s registered dropdown pairs |
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: Which measured Anytype values does the family adopt, and which does it refuse?

**Status: DECIDED — 2026-09-05 (T001's read; this packet, within its granted scope).**

### Context

`design-trueup.md` §2 carries a measured geometry set and five width tiers. A measurement outranks a
default for the surface it covers (`050` ADR-003), but a themed host owns its own colours and an
established project value beats a neighbouring measurement. Without a ruling, each leg would decide
this again per surface, which is the drift this phase exists to end.

### Decision

**Adopted from measurement**, because a measurement outranks a default for the surface it covers:
the **28px row pitch**, **16px content inset**, **8px corner radius**, **16px divider inset**,
**44-48px section pitch across a divider**, **16px icon box with a 14px glyph and an icon slot that
is optional per row**, the **4 × 8px chevron at the 16px right inset**, a **28px search field first
in the panel**, a **row highlight inset ~8-10px at full row height**, the **32px option-row pitch
with a 24px chip and a drag handle at the 16px inset**, and the **2px submenu gap with the child's
top aligned to its opening row and flipping to the parent's left at the viewport edge**.

**Adopted by agreement**: the **360px panel tier**, which is already the top of our `panel` role
(`design-system.md` §5). Nothing moves; the measurement and the established value are the same
number.

**Adopted as behaviour**: hover-open submenus on desktop; innermost-only Escape; the create
affordance's captured position (ADR-004); a **trailing** checkmark, single grammar; captioned
sections where a section configures rather than acts; picker grouping only when the list mixes
kinds; and the parent row of an open child keeping its highlight **and** rotating its chevron.

**Refused, each with its measurement.**

1. **`#232323` as a hover or selection fill** — **1.14:1** against its own `#171717` panel. A row
   highlight that is the only thing marking state has to clear 3:1 (WCAG 1.4.11). `050` §4 refused
   the same colour on a preselect; this read is the first to measure it on a **hover**, which is
   what makes it this packet's refusal as well as an inherited one.
2. **The `Create` pill's height** in `mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png` —
   **~35pt** against the 44pt iOS floor and `044`'s 44px close. The shape is adopted; the height is
   not. `055` refused the same pill for the same reason.
3. **Anytype's 224px and 256px menu tiers**, against our documented **292px** `menu` role. `050`
   already declined 256; 224 is narrower still, and a themed host with the user's own font stack has
   no business there.
4. **iOS's two checkmark grammars** — a blue filled circle for a value and a plain tick for a single
   choice. One product, two ticks for one affordance, is the exact defect G14 exists to close.

**Not adopted, with reasons**: `#E1E1E1`, `#A3A3A3`, `#3C7FFB` and `#4686FB` are fixed values in a
themed host — this is an Obsidian plugin and the user's theme owns them, so the `--db-text-*` roles
and `--interactive-accent` stand. Anytype's **408px** grid picker loses to our 318px content floor,
its **288px** date picker to our 252px one, and its **224px labelled colour list** to our shipped
12-swatch grid.

**One number that must not be "corrected" toward Anytype.** Anytype's filter panel is **360px**
where our `condition panel` role is **440-560px** (552 shipped). The reason is visible in
`menus/anytype-menu-set-filter-select-dark.png`: Anytype stacks the condition — property on the
panel, operator and value in a second popover — where our row carries property, operator, value,
group, NOT and remove on one line. Different row shape, different floor. `design-system.md` §5's
derivation stands.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Adopt every measured value** | Maximum parity | Adopts a 1.14:1 highlight and a 35pt target, and overwrites an established 292px role with a narrower measurement |
| **Adopt none; keep every default** | No migration | Discards a measurement that agrees with our own role on 360px, and leaves the family's geometry undecided per surface — the drift this phase closes |
| **Decide per leg** | Flexible | Guarantees the same argument three times, with three answers |

### Consequences

- `componentization-plan.md` §3's width table is re-counted against the measured tiers.
- The 28px deviation from the 4/8/12/16/24/32 spacing scale is **named, not absorbed**: it is
  simultaneously Anytype's measured row and `design-system.md` §9's coarse-pointer floor, so a
  measurement and an established value agree and the scale default loses to both. On the phone the
  floor is `044`'s 44px, unchanged.
- Nothing here changes a token. Every refusal keeps an existing token; every adoption is geometry.

### Five checks

| Check | Answer |
|-------|--------|
| **Does this need to exist at all?** | Yes — otherwise each leg re-decides adoption per surface, which is the drift the phase exists to end |
| **Is there a simpler existing thing?** | `design-system.md`'s role vocabulary, which this ADR feeds rather than replaces |
| **What does it touch?** | `styles.css` geometry for the family's rows, and `componentization-plan.md` §3 |
| **What is the real caller that must not break?** | Every registered `sheet-grammar` pair whose selectors sit on the rows being re-measured — updated in the same leg (TASK-SYNC) |
| **What contract must not break?** | `design-system.md` §5's role widths, §9's 28×28 coarse-pointer floor, `044`'s 44px close |
<!-- /ANCHOR:adr-005 -->
