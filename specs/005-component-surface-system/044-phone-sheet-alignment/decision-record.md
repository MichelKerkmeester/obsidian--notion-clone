---
title: "Decision Record: Phone Sheet Alignment"
description: "ADR-001 REQ-007's owned-menu header carries 'header everywhere' over a title-less menu variant. ADR-002 one shared 16px row inset and 16px sheet title, replacing per-surface values."
trigger_phrases:
  - "044 decision record"
  - "header everywhere"
  - "sheet inset decision"
  - "sheet title size decision"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/044-phone-sheet-alignment"
    last_updated_at: "2026-09-05T04:40:00Z"
    last_updated_by: "code-agent"
    recent_action: "Recorded the two operator decisions this closing leg implemented"
    next_safe_action: "None — both ADRs are decided and implemented"
    blockers: []
    key_files:
      - "src/views/owned-menu.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-044-closing-leg-adr"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---

# Decision Record: Phone Sheet Alignment

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Does the owned context menu get a title-less variant, or a header like every other sheet?

**Status: DECIDED — 2026-09-05 (operator).**

### Context

REQ-007's original draft treated the owned context menu as a special case: a "menu" variant with no
title, only a close affordance, on the reasoning that a context menu's subject is usually obvious
from what was pressed. A fresh review at 07be64fe found the owned menu scoring 5/7 on the lane's own
predicates — no header, no padded rows, no close affordance at all — which made the variant a gap in
practice as well as in principle, and the review's own framing ("a dropdown is not a second grammar")
argued against carving out a second header shape for one surface.

### Decision

**Header everywhere.** Every phone sheet, including the owned context menu, gets a title row with a
title and a 44px close, via the same `createSheetHeader` every other registered surface already uses.
No title-less variant is implemented. REQ-007 in `spec.md` is amended in place (dated, reversible)
rather than superseded by a new requirement, since the seven/eight-element contract itself did not
change — only what the owned menu's header title names.

The owned menu's title names the row, column or field it was opened for (`row-menu.ts`'s file name,
`column-menu.ts`'s `col.label`), falling back to the active view's own tab title
(`.workspace-tab-header.is-active .workspace-tab-header-inner-title`, read from the document the menu
already portals into — no `App` reference needed), and finally to a generic `menu.title` label when
neither is available.

### Alternatives

| Option | For | Against |
|---|---|---|
| **Title-less menu variant (REQ-007's original draft)** | One fewer header on a surface whose subject is often visually obvious (the row or column just pressed) | Carves a second header shape into a contract whose whole point is one grammar; the review found this exact gap; a menu opened from a keyboard shortcut or a long-press has no visually obvious subject at all |
| **Header everywhere, generic title ("Menu")** | Simplest implementation, no title-resolution logic | Uninformative on every menu that has an obvious subject — worse than not deciding |
| **Header everywhere, subject-or-fallback title (chosen)** | Every sheet is discoverable the same way; the title is informative wherever a subject was threaded, and honest about falling back where it was not | Requires per-call-site wiring to be fully informative; two call sites (`row-menu.ts`, `column-menu.ts`) wired at landing, the rest use the documented view-name fallback |

### Consequences

- `createOwnedMenu`/`createOwnedMenuForEvent` (`owned-menu.ts`) gained an optional `title` field.
  Existing callers that omit it are unaffected in behaviour (they get the fallback chain), not broken.
- Nine call sites across `table-renderer.ts`, `board-renderer.ts`, `calendar-renderer.ts`,
  `gallery-renderer.ts`, `calendar-timeline-renderer.ts`, `embedded-database-renderer.ts` and
  `database-view.ts`'s own direct call still rely on the view-name fallback rather than a threaded
  subject. Threading a precise subject through each is a follow-up, not a defect: the fallback is the
  documented, intended behaviour for a call site with nothing more specific to say.
- The column-menu sub-popover (a different, nested surface — `column-menu.ts`'s
  `createColumnMenuSubpopover`) is not `createOwnedMenu`-based and was not given a header by this
  decision; it remains open, tracked in `tasks.md`.

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — REQ-007 already requires the seven/eight elements on every dropdown family; the owned menu was the one instance failing all of them |
| **Is there a simpler existing thing?** | `createSheetHeader`, already built and used by six other consumers — reused, not reinvented |
| **What does it touch?** | `owned-menu.ts`'s public API (`title` is additive), and the two call sites wired with a real subject |
| **What is the real caller that must not break?** | Every existing `createOwnedMenu`/`createOwnedMenuForEvent` caller with no `title` — verified unaffected, since the field is optional and the fallback chain never throws |
| **What contract must not break?** | The menu's own row/section/separator API and dismissal behaviour, untouched by this change |
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: One shared row inset and sheet-title size, or per-surface values?

**Status: DECIDED — 2026-09-05 (operator).**

### Context

A fresh review found the sheet's left inset varying 0/8/12/16px across registered surfaces (0 and 12
on settings' own header/rows, 8 on sort/filter's inherited container padding, 16 on add-view's
already-correct phone override) and the sheet title using the anchored-popover's 13px label size
everywhere except settings, which had already given itself a local `var(--db-font-lg)` (16px)
override. Both are the same shape of problem: a value decided per surface instead of once, which is
exactly what `spec.md`'s "one row grammar, not bespoke per surface" already asks for.

### Decision

**One shared token for each.** `--db-sheet-inset: var(--db-space-6)` (16px) and the sheet title at
`var(--db-font-lg)` (16px), declared once in the same scope as the other `--db-space-*` tokens (not
`:root` — `:root` is an ancestor of `.note-database-container`, so a `:root` declaration cannot see a
token that block defines below it, and a `var()` with no visible reference resolves the whole custom
property invalid rather than falling through to a default; this was found and fixed during
implementation, not assumed). Applied to: the header of the four newly-headered families (whose
containers declared no inset of their own), the settings header and body rows (retiring its own
12px/4px override), and the sort/filter container (retiring its inherited 8px, inline only — the
block padding stays the container's own). Not applied to: add-view (already 16px, no change needed),
record-detail and column-width (already-shipped, already-operator-verified surfaces this leg did not
re-audit for inset — see Consequences).

### Alternatives

| Option | For | Against |
|---|---|---|
| **Leave each surface's own value** | No risk of touching an already-correct surface | The review's own finding — this is the defect being fixed |
| **8px (sort/filter's existing anchored-popover density)** | Already used by two surfaces, no capture risk there | Cramped on a full-width phone sheet; not what add-view already shipped at (16px), which would have made add-view the outlier instead |
| **16px (chosen)** | Matches add-view's already-shipped, already-captured value; matches the existing precedent at `toolbar-utilities`/`new-template` popovers' own `.is-phone` override (`--size-4-4`, also 16px) | Requires touching settings' and sort/filter's own container-level rules, each individually verified rather than assumed safe |

### Consequences

- Settings' rows and header, and sort/filter's container, now read the shared token; their own
  per-surface overrides were edited in place rather than left as dead, unreachable declarations.
- Record-detail and column-width were deliberately left unaudited for inset in this pass: both are
  already-shipped, already-operator-verified surfaces with no reviewer finding against them, and a
  blind retrofit risked a regression this leg had no capture-by-capture budget to catch. This is a
  named gap, not a silent one — see `tasks.md`'s closing note.
- The sheet-title rule is scoped to `.db-mobile-bottom-sheet .db-panel-title`/`.db-record-detail-title`
  so it never reaches a desktop anchored popover's own 13px density.

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — the review measured four different inset values and two different title sizes doing the same job |
| **Is there a simpler existing thing?** | The `--db-space-*`/`--db-font-*` token scale already in the stylesheet — reused, not a new scale |
| **What does it touch?** | Settings' header/body rules, sort/filter's container rule, and the four new families' header rule — each edited individually after reading its current value, not swept |
| **What is the real caller that must not break?** | Every registered surface's own capture — re-verified by hand after the change, not assumed from the CSS diff alone |
| **What contract must not break?** | Desktop's own anchored-popover density (8px inset, 13px title), which this decision does not touch |
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:parity-retarget-note -->
## NOTE, 2026-09-05 (~18:30): `051` retargets to Anytype parity, and this packet's grammar yields where the two differ

The operator ruled *"Yes, parity by default"* over `051-modal-and-sheet-componentization`
(`051/decision-record.md` ADR-007, Accepted). Every sheet and modal in `051`'s census now targets the
values measured off Anytype's captures, and a deviation is permitted only where the measured value
fails WCAG 1.4.11, WCAG 1.4.3 or a 44px touch floor.

**The 44px close is exactly such a deviation, and it survives.** `044` REQ-007's amendment —
*"header everywhere"*, every phone sheet gets a title row with a 44px close — was a preference stated
without a reference screen. It now has a number behind it: no Anytype iOS sheet carries a close
control at all, and the affordance it substitutes is the grab handle, `#555555` on `#1F1F1F` =
**2.21:1**, below 1.4.11's 3:1 for the only non-text element identifying the dismissal control. That
is `051` ADR-005, unchanged, and it is now ADR-007's exception **E1** — the single presentation value
in the whole `051` census that parity does not take. **This packet's rule is not amended; it is
evidenced.**

**Where the grammar does yield.** `051`'s row 26 flips the `menu` role's phone presentation from a
grab-handle bottom sheet to an **anchored, handle-less card over a dimmed parent**, because that is
what `anytype-mobile-sheet-object-more-dark.png`, `-object-more-submenu-dark.png`,
`-set-more-dark.png` and `-kanban-column-menu-dark.png` all show — none carries a 34 × 5pt handle
band at any y. Where a `044` grammar element and a measured `051` parity value describe the same
thing differently, **the parity value wins and this note is the record of it**. The 44px close is the
stated exception and is not one of them.

**What does not move.** `044`'s seven grammar elements remain the contract `051` must satisfy, and
the twelve registered `sheet-grammar` surfaces remain the regression gate. Nothing in this record's
ADR-001 or ADR-002 is reopened: the shared 16px row inset and the sheet-title size are unaffected by
`051`'s frame-shape and header-slot changes, and `051`'s legs assert `044` conformance after every
one.
<!-- /ANCHOR:parity-retarget-note -->
