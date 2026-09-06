---
title: "Decision Record: Notion Sheet Refinement"
description: "Seven decisions on the table cell surface and the destructive confirm — six Accepted on the operator's 19:00 four-reference ruling, one parked, and a register recording that none of the eight Notion-versus-Anytype conflicts overrides a landed ruling."
trigger_phrases:
  - "061 decision record"
  - "confirm card adr"
  - "cell tap adr"
  - "notion anytype conflict register"
  - "cell selection pill"
  - "four reference read"
  - "anytype evernote fibery notion comparison"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/061-notion-sheet-refinement"
    last_updated_at: "2026-09-06T19:30:00Z"
    last_updated_by: "design-research-session"
    recent_action: "Read 50 captures across four products; accepted ADR-001 to ADR-004"
    next_safe_action: "Take AC-002 red-first; the spec now asks for a pill, not a bar"
    blockers:
      - "ADR-006 stays parked behind an Anytype multi-section re-read the operator schedules"
    key_files:
      - "src/views/database-view.ts"
      - "src/views/confirm-sheet.ts"
      - "src/views/surface-shell.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-061-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Whether the pill's re-anchor runs on the sticky-header scroll listener or its own"
    answered_questions:
      - "Zero landed Anytype rulings are overridden by this packet"
      - "Zero of four reference products dock a labelled action bar to the frame's bottom edge"
      - "Digest P9 is about pickers inside a property editor, not about a grid cell's editor"
---
# Decision Record: Notion Sheet Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Parent **D15** governs every row here. A Notion finding never silently overrides a landed Anytype
> ruling; where the two disagree the conflict is named, a side is proposed with a reason, and the
> decision stays **Proposed** until the operator rules.
>
> **All five decisions that were Proposed on 2026-09-06 at 17:40 have now been ruled on.** The
> operator declined to decide the cell surface on Notion's captures alone and widened the evidence,
> verbatim (2026-09-06, 19:00): *"Check anytype, evernote, fibery and find best ui ux approach for
> this"* — and separately accepted the confirm's shape in the same sitting: *"Yes, centred card with
> stacked buttons"*. **ADR-000** is the four-product read that resulted; **ADR-001 to ADR-004 are
> Accepted**; **ADR-005** is unchanged and still records **zero** landed rulings overridden;
> **ADR-006** stays parked behind the Anytype re-read that is its stated precondition.

---

<!-- ANCHOR:adr-000 -->
## ADR-000: The four-reference read that ADR-002, ADR-003 and ADR-004 are decided from

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

### Context

ADR-002, ADR-003 and ADR-004 were written `Proposed` from Notion's captures alone, and Notion's
table set is thin: three flow frames and eight rendered views, none of them a multi-cell selection.
The operator declined to rule on that evidence and widened it instead, verbatim (2026-09-06, 19:00):
*"Check anytype, evernote, fibery and find best ui ux approach for this"*.

Four reference products were then read directly — not through a digest — at **50 captures: 14 Notion**
(iOS and web), **12 Anytype** (phone and desktop), **12 Evernote** (iOS and web) and **12 Fibery**
(desktop only; the harvest has no phone platform). Every screen was opened and read, and every one of
the 50 paths was checked to resolve on disk. The result is one finding strong enough to decide all
three ADRs at once, and it is not the finding the `Proposed` versions were built on.

**The count was 51 in the first draft of this ADR and it is 50.** The draft claimed 18 Notion screens
against 14 actually cited, and 12 Evernote against 8. The Evernote gap was closed by reading four more
(the four `web/` rows in the manifest below); the Notion figure was simply wrong and is corrected
down. The number is stated here because a headline count nobody can audit is worth nothing — so the
full path manifest is carried at the end of this ADR, and every row of it was checked against disk
rather than transcribed.

### The comparison

| Question | **Notion** (iOS / web) | **Anytype** (phone / desktop) | **Evernote** (iOS / web) | **Fibery** (desktop) |
|---|---|---|---|---|
| What one tap or click on a cell does | **Edits.** The cell becomes an editable box **in place**, caret in it, keyboard up | **Edits.** Phone: that property's own bottom sheet. Desktop: an in-cell input, or an anchored dropdown under the cell | **Edits.** The caret lands in the cell, which fills yellow; keyboard up | **Edits.** An anchored popover opens **under the cell** |
| Whether a cell selection exists at all | Yes — but never from an ordinary tap. It is reached by dragging the active cell's corner handle, or by a grip on a column | **None.** No cell selection in 12 read captures, phone or desktop | Only the caret's own cell, extended by drag | **Rows only**, through an explicit leading checkbox column |
| What a selected cell or range wears | An accent outline, a corner drag handle, an edge grip chip, and a **two-control anchored pill** (`↔`, `···`) beside it | Nothing | A yellow cell fill | A tinted row and a ticked checkbox |
| Where that selection's actions live | The pill's `···` → a **bottom sheet** of grouped labelled rows ("Actions") | **Inside the editor** — `Clear` is a leading text button in the sheet's own header, and the last row of the desktop dropdown's footer | A **one-row, icon-only accessory bar above the keyboard**, each icon opening a **titled bottom sheet** of three to six labelled rows | An **"Actions ⟨N⟩" count pill in the view toolbar** → an anchored dropdown |
| Where the value editor is drawn | At the cell (iOS in place, web anchored under it) | Phone: a pushed bottom sheet. Desktop: at the cell | At the cell | At the cell, anchored under it |
| **A labelled action bar docked to the frame's bottom edge** | **Never** | **Never** | **Never** | **Never** |

**Citations, by row.**

- *Tap edits.* Notion `screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-01-d53b3912-f60a-4bd1-872e-18276fe2acd5.webp` (the "Wednesday" cell outlined with a caret in it, keyboard up); Anytype `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-grid-cell-objecttype-empty-light.png` (a grid cell tapped opens that property's sheet) and `screenshots/anytype/desktop/menus/anytype-menu-cell-text-light-full.png` (a click grows the cell into a blue-outlined textarea in place) and `anytype-menu-cell-number-light.png`; Evernote `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-04-3e941ce4-7bb9-4398-b3fd-152ee7701bbd.webp`; Fibery `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/selecting-from-multi-select/fibery-web-flow-selecting-from-multi-select-02-a624cc0a-c157-43b3-b933-80274057f9ad.webp` (a "TYPE" popover anchored under the cell).
- *No selection at rest.* Notion `screenshots/notion/ios/views/notion-ios-views-table-11-90277769-e407-4476-bc16-4309ee11276d.webp`, `-12-d95ea247-b077-4e8a-89f7-9cee67b4921a.webp`, `-13-6673816d-9c68-4275-8902-f6cf6982f982.webp` and `screenshots/notion/web/views/notion-web-views-table-01-3b3c3c26-58ac-42ec-9ddd-f4783d4f5f4f.webp`, `-02-b184ec4c-7b84-4cba-b7e1-bc727bde0eea.webp`; Anytype `screenshots/anytype/mobile/app/anytype-mobile-set-grid-light.png` and `screenshots/anytype/desktop/sets/project-tracker/anytype-project-tracker-grid-light.png`.
- *Selection chrome.* Notion `…/reordering-a-table-02-026940b3-e0de-443d-a948-6eb1e53e4ea1.webp` (outline + corner handle + the `↔ ···` pill, no bar) and `-03-db2814d9-78bd-4b01-9d57-8e1c4dcbdbbc.webp` (the same pill on a column, with a grip chip on its top edge); Fibery `…/deleting-entities/fibery-web-flow-deleting-entities-02-904506e0-6d8d-437c-ad53-1f51bb23a350.webp` (ten ticked checkboxes, tinted rows, an "Actions ⟨10 Problems⟩" pill in the toolbar) and `-03-0a207252-0899-4e33-8a10-a9c22005dbaa.webp` (that pill's anchored dropdown: Convert to… ▸ / Duplicate / The Big Red Button / Delete).
- *Actions behind one control.* Notion `screenshots/notion/ios/flows/turning-a-table-into-a-database/notion-ios-flow-turning-a-table-into-a-database-03-6ecea6c7-4682-4c35-b649-412a0a240738.webp` — the `···` sheet, titled "Actions", eleven labelled rows in four rounded groups with Delete in red; Evernote `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-05-0487410c-2d35-470c-8dc8-39ae80077152.webp` ("DELETE TABLE CELLS", three labelled rows, a close `×`), `-07-7b8bc311-753c-403a-89f1-c85b2ce3f348.webp` ("TABLE CELL COLOR"), `-09-915ca0ef-e2df-4e72-a2b5-f372635c4ffb.webp` ("TABLE ALIGNMENT"); Evernote web `screenshots/evernote/web/flows/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-03-e209caa0-17c7-4fe6-ae8d-ebceead4dc2d.webp` and `screenshots/evernote/web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-07-0cc08b17-d100-44b1-9285-43b1dac4efab.webp` (one anchored menu, captioned groups — `CELL BACKGROUND` swatches, a width group, `CELL ALIGNMENT`, `Merge Cells` — ending in the three delete rows). **Correction to a first reading:** those three web rows are *not* red. Only the iOS sheet colours its destructive rows; the web menu leaves them in body text and relies on position alone. Our sheet follows **iOS**, because a phone is the surface in question and colour plus last position is stronger than position alone.
- *`Clear` inside the editor.* Anytype `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-cell-text-longtext-light.png`, `anytype-mobile-sheet-cell-number-light.png`, `anytype-mobile-sheet-cell-select-priority-light.png`, `anytype-mobile-sheet-cell-date-light.png` (leading `Clear` in the sheet header); desktop `anytype-menu-cell-date-light.png` (trailing `Clear` in the dropdown's footer row).
- *One-row accessory bar above the keyboard.* Notion `…/reordering-a-table-01-…webp`; Evernote `…/adding-a-table-87fa2082-06-90b8e7fd-3e12-44c0-8460-3bb550f29720.webp`, `-08-3650c593-5777-440d-9e06-137df163a5e2.webp`, `-10-53a99577-f253-4503-9f6d-693867ebb7e2.webp` (`Text | Table` tabs over six icon-only controls, never wrapping).
- *The affordance appears **at** the selection, never at the frame's edge.* Evernote web
  `screenshots/evernote/web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-07-a9dea261-9199-4fa7-b68b-2f965db3c12d.webp`
  (a caret editing in place, a chevron growing on that cell's own right edge, a `+` grip at the row's
  left edge and a grip band above the column — every control on the thing it acts on),
  `…/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-02-a93a2aa9-6147-45fb-aace-9bbd32320f75.webp`
  (a selected header row tinted, its chevron on the row's own trailing cell) and
  `…/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-09-ccc28baf-8888-42ce-bdb7-51220006fb54.webp`
  (a resting table: no selection chrome, no action bar anywhere on the page). This is the same rule
  the design skill states outright, reached from a fourth product.
- *Everything is an anchored popover on a pointer surface.* Notion `screenshots/notion/web/flows/editing-an-option/notion-web-flow-editing-an-option-02-efb2b347-39b5-4457-83a4-7fb381055038.webp`, `screenshots/notion/web/flows/creating-a-database-table/notion-web-flow-creating-a-database-table-06-136d7dd8-7324-4d4c-9a70-f5ea1a36ce52.webp`, `screenshots/notion/web/flows/adding-rows/notion-web-flow-adding-rows-03-804bfb4b-5c99-4b7d-9c53-e03577cdab5c.webp`, `screenshots/notion/web/flows/adding-a-column/notion-web-flow-adding-a-column-02-30d9c95f-4756-4d91-a635-6f889d300648.webp`; Fibery `…/editing-a-field/fibery-web-flow-editing-a-field-02-…webp` and `-03-26bd6da0-e2dd-44ac-97a7-0fa0d367ce42.webp`, `…/adding-a-field-grid/…-03-d4dfd6b4-c0c4-4845-972a-d9e2d0a3b059.webp`, `…/adding-a-row/…-03-c462001c-9385-413b-bde8-c171b31cfc47.webp`, `…/sorting-table/…-02-04b7bbcd-dca1-4725-af32-8bcd52973ceb.webp`, `…/editing-column-settings/…-02-8d743d36-4809-4128-9a4f-7887f1f843ef.webp`, `…/adding-color-coding-grid/…-02-c31c8f5f-463f-442b-b9c5-13e039214803.webp`, `…/setting-up-table/…-03-8583fd27-468f-49ac-b347-e917c18b0296.webp`, `…/searching-table/…-02-37395a20-8be7-42b6-a424-fba61b9f3a73.webp`.

### One line per app, judged for a phone-first Obsidian plugin

| App | What it does | Is it better for us? |
|-----|--------------|----------------------|
| **Notion** | Tap edits in place; a selected cell wears a two-control anchored pill and a corner handle; `···` opens a labelled-row sheet; the resting table has no chrome at all | **Yes, and it is the shape adopted.** The pill sits beside what it acts on, which is the one placement rule the design skill states outright, and it is the reference the operator already named for this surface at 17:07 |
| **Anytype** | No cell selection exists; a tap opens that property's editor, and the editor's own header carries `Clear` | **Partly.** Its silence is why nothing here overrides a landed ruling, and its `Clear`-in-the-editor is a better home for the single-cell case than any bar — but a product with no multi-cell selection cannot tell us how to shape ours |
| **Evernote** | Tap edits in place; a one-row icon-only accessory bar rides above the keyboard; every icon opens a small titled sheet | **Yes, for the overflow half.** It is the cleanest proof that a phone table's actions belong in a titled sheet of labelled rows rather than in a row of words, and its accessory bar never wraps because it never holds more than six icons |
| **Fibery** | Selection is explicit (checkboxes); the count and the bulk actions are one "Actions ⟨N⟩" pill in the view toolbar opening a dropdown | **Yes, for the collapse.** It is the only reference with real multi-selection, and it proves the whole action set can live behind **one** control carrying the count — which is exactly what our eight-child bar refuses to do. Its toolbar placement is the half we do not take: a phone's top edge is the worst thumb reach on the screen |

### The finding

**Zero of four reference products dock a labelled action bar to the bottom edge of the frame.** The
operator's first capture is therefore not a bar that wraps — it is a bar that should not exist on a
phone. That is what ADR-004 is rewritten around, and it is why ADR-002 and ADR-003 could be accepted
unchanged in substance: three of the four references already do what ADR-002 proposed, and three of
the four draw the value editor at the cell, which is what ADR-003 proposed.

### Why the finding is a rule and not a coincidence

Four products converging is evidence; it is not a reason on its own. `sk-design` routes this question
to **`sk-design-fundamentals`** (intents `REVIEW` and `VALUES`, which resolve to the same mode), and
its references name the mechanism behind each half of the model. Every row below is a rule the
references state, matched to the choice it decides — not a rule invented to fit a conclusion.

| The rule, where it is stated | What it decides here |
|---|---|
| *"Display feedback relative to its trigger … Feedback that appears far from what caused it makes the user hunt for the connection"* — `references/interaction-craft.md` §8 | **The pill is anchored to the range, not docked to the frame.** A bar pinned to the bottom of a phone for a cell in the middle of a scrolling grid is that hunt, and it is why all four references place the affordance on the thing it acts on |
| **Jakob's Law** — *"People spend most of their time on other products, so they expect yours to work the way those do … Deviate only where the deviation earns something the familiar pattern cannot give"* — `references/ux-laws.md` §6 | **This is the law the whole four-product read is an application of.** Our bottom bar is the deviation, and it earns nothing the anchored pill cannot give. It is also the answer to "why not just keep our own shape" |
| **Hick's Law** and the **Pareto Principle** — `references/ux-laws.md` §3 | **Eight controls become three.** Decision time rises with the count of visible choices; the count and `Copy` carry the common case, and the remaining six earn their place behind disclosure rather than on the surface |
| **Progressive Disclosure** — *"Hick's Law applied over time"* — `references/ux-laws.md` §3 | **`···` is the disclosure, and nothing is deleted to achieve it.** All seven actions survive, one tap away |
| **Miller's Law** — chunk into groups of roughly five to nine — and **Common Region**, `references/ux-laws.md` §3 and §5 | **The sheet's three labelled groups**, each a bounded card. Notion's own `···` sheet is eleven rows in four such groups, which is the same arithmetic |
| **Serial Position Effect** and the **Von Restorff Effect** — `references/ux-laws.md` §2 and §5 | **`Clear` is last and is the only red row.** Last is remembered; exactly one distinct element stays distinct. Two red rows would cancel the effect |
| **Fitts's Law**, reconciled at 44px for a thumb and 32px for a dense pointer UI — `references/ux-laws.md` §2 and `references/interaction-craft.md` §3 | **44px on the phone pill, and desktop's declared 30px is left alone** — it is a pointer surface, and 30px sits inside the pointer band rather than failing the thumb one |
| *"Interactive elements in a … list must have no dead areas between them. Increase their `padding` rather than adding margin"* — `references/interaction-craft.md` §3 | **The pill's three children are padded, not margined**, so every pixel between two controls belongs to one of them |
| *"Big red button for something that is not the main action → give destructive actions secondary or tertiary treatment; save the red primary button for the confirmation dialog"* — `references/diagnosis-table.md` §2 | **`Clear` is a red *row*, not a red button**, and the red primary lands in ADR-001's confirm card — which is where this table says it belongs |
| *"Busy, boxed-in, over-compartmentalized → too many borders"* — `references/diagnosis-table.md` §3 | **The pill is one elevated surface, not eight bordered chips.** The operator's word for the current bar was *"extremely bad ui ux"*; this row is the mechanical name for it |

Two rules cut **against** a piece of the model and are recorded rather than buried. Fitts's Law also
says targets are faster to hit when they are **closer to where the pointer already is** — which is an
argument for a bar in a *fixed, learned* position over a pill that moves with the selection. It loses
to §8 here because the fixed position in question is occupied by Obsidian's own navigation, so the
learned location is not available to us. And the **Aesthetic-Usability Effect** warns that polish is
not licence to cover a broken hierarchy: the pill is not a restyle of the bar, it is fewer controls,
which is why AC-002 counts children rather than measuring appearance.

### Consequences

**What improves**: three ADRs decide on four products rather than on one thin capture set, and the
one design question none of them could answer alone — where a multi-cell selection's actions go — is
answered by the only reference that has one.

**What it costs**: nothing was overridden. **Landed rulings overridden by this read: zero.** Anytype
parity by default (`051` ADR-007) is untouched because Anytype is silent on cell selection, exactly
as `design-trueup.md` row 1 records it silent on the confirm.

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator declined to rule on Notion alone and named the three other products |
| 2 | **Beyond Local Maxima?** | PASS | Four products, four different answers to the same question, weighed row by row, then cross-checked against `sk-design-fundamentals` so the convergence is held up by a stated rule rather than by a vote |
| 3 | **Sufficient?** | PASS | 50 captures read directly, every path checked against disk; the comparison table and the rule table are the whole deliverable |
| 4 | **Fits Goal?** | PASS | REQ-001 |
| 5 | **Open Horizons?** | PASS | The register survives for `062`'s table refinement, which asks the same question of the row grammar |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: nothing in `src/`. **How to roll back**: not applicable — this is the evidence
record the three ADRs below cite.

**Correction carried, not buried**: `spec.md` §4 REQ-001 cites
`screenshots/notion/web/views/notion-web-views-table-03-bd482935-…webp` for the desktop half. That
file is not at that path — the 2026-09-06 reclassification (`screenshots/notion/README.md`) moved
the web `views/table-*` set down to `-01`, `-02` and `-06`. The desktop claim is re-cited above off
`-01` and `-02`, which carry it: a resting web table with no selection chrome and no action bar
anywhere on the page.
### The 50 captures, by path
Every path below was checked to resolve on disk at the time this ADR was written. Notion, Anytype
and Evernote paths are relative to this repository; **Fibery's are relative to the repository root**,
because its harvest lives in a sibling worktree and not in this one.

**Notion — 14.**
- `screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-01-d53b3912-f60a-4bd1-872e-18276fe2acd5.webp` — a cell in edit: outlined, caret inside, the keyboard's one-row icon accessory bar above it
- `screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-02-026940b3-e0de-443d-a948-6eb1e53e4ea1.webp` — a selected cell: accent outline, corner drag handle, the two-control `↔ ···` pill beside it, no bottom bar
- `screenshots/notion/ios/flows/reordering-a-table/notion-ios-flow-reordering-a-table-03-db2814d9-78bd-4b01-9d57-8e1c4dcbdbbc.webp` — the same pill on a selected column, with a grip chip on its top edge
- `screenshots/notion/ios/flows/turning-a-table-into-a-database/notion-ios-flow-turning-a-table-into-a-database-03-6ecea6c7-4682-4c35-b649-412a0a240738.webp` — the `···` sheet, titled "Actions": eleven labelled rows in four rounded groups, Delete red
- `screenshots/notion/ios/views/notion-ios-views-table-11-90277769-e407-4476-bc16-4309ee11276d.webp` — a resting table view: no selection chrome, no action bar
- `screenshots/notion/ios/views/notion-ios-views-table-12-d95ea247-b077-4e8a-89f7-9cee67b4921a.webp` — the same, second state
- `screenshots/notion/ios/views/notion-ios-views-table-13-6673816d-9c68-4275-8902-f6cf6982f982.webp` — the same, third state
- `screenshots/notion/ios/database/notion-ios-database-property-editor-02-658fd83b-c23b-4573-aac8-a18e06e185a1.webp` — the destructive confirm: a centred card margined on four sides, three stacked full-width buttons
- `screenshots/notion/web/views/notion-web-views-table-01-3b3c3c26-58ac-42ec-9ddd-f4783d4f5f4f.webp` — a resting web table: no selection chrome, no action bar anywhere on the page
- `screenshots/notion/web/views/notion-web-views-table-02-b184ec4c-7b84-4cba-b7e1-bc727bde0eea.webp` — the same, second state
- `screenshots/notion/web/flows/editing-an-option/notion-web-flow-editing-an-option-02-efb2b347-39b5-4457-83a4-7fb381055038.webp` — an anchored popover on a pointer surface
- `screenshots/notion/web/flows/creating-a-database-table/notion-web-flow-creating-a-database-table-06-136d7dd8-7324-4d4c-9a70-f5ea1a36ce52.webp` — the same
- `screenshots/notion/web/flows/adding-rows/notion-web-flow-adding-rows-03-804bfb4b-5c99-4b7d-9c53-e03577cdab5c.webp` — the same
- `screenshots/notion/web/flows/adding-a-column/notion-web-flow-adding-a-column-02-30d9c95f-4756-4d91-a635-6f889d300648.webp` — the same

**Anytype — 12.**
- `screenshots/anytype/mobile/app/anytype-mobile-set-grid-light.png` — a resting phone grid: no selection chrome, no action bar
- `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-grid-cell-objecttype-empty-light.png` — a grid cell tapped opens that property's own bottom sheet
- `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-cell-text-longtext-light.png` — `Clear` as a leading text button in the editor sheet's own header
- `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-cell-number-light.png` — the same header slot, number
- `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-cell-select-priority-light.png` — the same header slot, select
- `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-cell-date-light.png` — the same header slot, date
- `screenshots/anytype/desktop/sets/project-tracker/anytype-project-tracker-grid-light.png` — a resting desktop grid: no selection chrome, no checkbox column, no action bar
- `screenshots/anytype/desktop/menus/anytype-menu-cell-text-light-full.png` — a click grows the cell into a blue-outlined textarea in place
- `screenshots/anytype/desktop/menus/anytype-menu-cell-number-light.png` — the same, number
- `screenshots/anytype/desktop/menus/anytype-menu-cell-select-light.png` — an anchored dropdown under the cell, select
- `screenshots/anytype/desktop/menus/anytype-menu-cell-multiselect-light.png` — the same, multi-select
- `screenshots/anytype/desktop/menus/anytype-menu-cell-date-light.png` — the same, date — with `Clear` trailing in the dropdown's footer row

**Evernote — 12.**
- `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-04-3e941ce4-7bb9-4398-b3fd-152ee7701bbd.webp` — the caret lands in the cell in place; `Text | Table` tabs over six icon-only controls, one row
- `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-05-0487410c-2d35-470c-8dc8-39ae80077152.webp` — the titled sheet "DELETE TABLE CELLS": three labelled red rows and a close `×`
- `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-06-90b8e7fd-3e12-44c0-8460-3bb550f29720.webp` — the accessory bar again, never wrapping
- `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-07-7b8bc311-753c-403a-89f1-c85b2ce3f348.webp` — the titled sheet "TABLE CELL COLOR"
- `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-08-3650c593-5777-440d-9e06-137df163a5e2.webp` — the edited cell filled yellow around the caret, accessory bar above
- `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-09-915ca0ef-e2df-4e72-a2b5-f372635c4ffb.webp` — the titled sheet "TABLE ALIGNMENT"
- `screenshots/evernote/ios/flows/adding-a-table/evernote-ios-flow-adding-a-table-87fa2082-10-53a99577-f253-4503-9f6d-693867ebb7e2.webp` — the accessory bar again, six icons, one row
- `screenshots/evernote/web/flows/creating-a-table/evernote-web-flow-creating-a-table-66ef6ee6-07-a9dea261-9199-4fa7-b68b-2f965db3c12d.webp` — a caret editing in place; the chevron on the cell's own edge, a `+` grip at the row, a grip band over the column
- `screenshots/evernote/web/flows/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-02-a93a2aa9-6147-45fb-aace-9bbd32320f75.webp` — a selected header row tinted, its chevron on the row's own trailing cell
- `screenshots/evernote/web/flows/updating-cell-background/evernote-web-flow-updating-cell-background-e13d4456-03-e209caa0-17c7-4fe6-ae8d-ebceead4dc2d.webp` — one anchored menu: captioned groups, ending in the three delete rows (not red on web)
- `screenshots/evernote/web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-07-0cc08b17-d100-44b1-9285-43b1dac4efab.webp` — the same anchored menu over a yellow-filled cell
- `screenshots/evernote/web/flows/adding-a-table/evernote-web-flow-adding-a-table-daf9cb67-09-ccc28baf-8888-42ce-bdb7-51220006fb54.webp` — a resting web table: no selection chrome, no action bar

**Fibery — 12.**
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/deleting-entities/fibery-web-flow-deleting-entities-02-904506e0-6d8d-437c-ad53-1f51bb23a350.webp` — ten ticked checkboxes, ten tinted rows, an "Actions ⟨10 Problems⟩" count pill in the view toolbar
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/deleting-entities/fibery-web-flow-deleting-entities-03-0a207252-0899-4e33-8a10-a9c22005dbaa.webp` — that pill's anchored dropdown: Convert to… ▸ / Duplicate / The Big Red Button / Delete
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/selecting-from-multi-select/fibery-web-flow-selecting-from-multi-select-02-a624cc0a-c157-43b3-b933-80274057f9ad.webp` — a "TYPE" popover anchored under the cell
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/editing-a-field/fibery-web-flow-editing-a-field-02-6a09e703-dd8b-4e25-8950-244ed73ec8e4.webp` — an anchored popover on a pointer surface
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/editing-a-field/fibery-web-flow-editing-a-field-03-26bd6da0-e2dd-44ac-97a7-0fa0d367ce42.webp` — the same
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/adding-a-field-grid/fibery-web-flow-adding-a-field-grid-03-d4dfd6b4-c0c4-4845-972a-d9e2d0a3b059.webp` — the same
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/adding-a-row/fibery-web-flow-adding-a-row-03-c462001c-9385-413b-bde8-c171b31cfc47.webp` — the same
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/sorting-table/fibery-web-flow-sorting-table-02-04b7bbcd-dca1-4725-af32-8bcd52973ceb.webp` — the same
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/editing-column-settings/fibery-web-flow-editing-column-settings-02-8d743d36-4809-4128-9a4f-7887f1f843ef.webp` — the same
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/adding-color-coding-grid/fibery-web-flow-adding-color-coding-grid-02-c31c8f5f-463f-442b-b9c5-13e039214803.webp` — the same
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/setting-up-table/fibery-web-flow-setting-up-table-03-8583fd27-468f-49ac-b347-e917c18b0296.webp` — the same
- `.worktrees/150-harvest-fibery/screenshots/fibery/web/flows/searching-table/fibery-web-flow-searching-table-02-37395a20-8be7-42b6-a424-fba61b9f3a73.webp` — the same
<!-- /ANCHOR:adr-000 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The confirm keeps its sheet mount and gains a declared card frame role

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted** |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

**The ruling, verbatim** (2026-09-06, 19:00): *"Yes, centred card with stacked buttons"*.

---

<!-- ANCHOR:adr-001-context -->
### Context

Notion presents "are you sure" identically on iOS and on web as a small centred card, margined on
every side, with stacked full-width buttons (digest A4, C9, G3;
`screenshots/notion/ios/database/notion-ios-database-property-editor-02-658fd83b-c23b-4573-aac8-a18e06e185a1.webp`,
read directly: a two-line centred question and **three** buttons stacked full width, each with its
own outline, Cancel last, the card margined on all four sides over a dimmed sheet).
Anytype is silent — `051/design-trueup.md` row 1 reads "Not seen" across 118 iOS states and 600
menus. This is the one place in 77 screens where Notion fills a gap rather than contradicting a
ruling, and the surface matters: every bulk and non-undoable destructive path routes through the
confirm (`051` goal D5).

Ours is a flush full-width bottom sheet with a right-aligned side-by-side action pair.

### Constraints

- `048` **D1** (operator, 2026-09-05): *"Obsidian modals opened from a sheet on the phone … become
  stacked bottom sheets; none stay modals"* (`roadmap.md` §6A). So the obvious move — changing
  `super(app, "sheet")` to `"dialog"` — is closed: the shell's `dialog` presentation *"stays a
  centred dialog everywhere"* (`surface-shell.ts:41`).
- The dismissal contract is asserted by the shipped confirm lane row and must not move:
  `openAndWait` resolves `false` on Escape, outside press and drag (`confirm-modal.ts:6-8`).
- Notion's thumbnails carry no sampled value (goal D7), so the 16px inset is read proportionally,
  not measured. It is stated as a **floor**, not as a parity figure.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: keep the sheet mount and add a **third, declared** frame role — `db-sheet-card` —
beside the existing floating/flush split. **The operator accepted it on 2026-09-06 at 19:00, in
those words: *"Yes, centred card with stacked buttons"*.**

**How it works**: `SheetChromeOptions` (`mobile-bottom-sheet.ts:29-45`) gains a frame-role field;
`classifySheetFrameShape` (`:364`) gains the third class and applies it **only** from that
declaration, never from a height inference, with the existing `ResizeObserver` watcher (`:385`)
keeping the other two current. `ConfirmModal` passes the role through `createSurfaceShell`;
`getShellRole()` already returns `"dialog"` (`confirm-modal.ts:51-53`) and the card is its phone
expression. `buildConfirmSheetBody` (`confirm-sheet.ts:46`) gains `stackedActions`, and the actions
row (`:54`) carries `.db-modal-actions.db-confirm-stacked` with the button order and the
`mod-warning` / `mod-cta` classes unchanged (`:55-71`).

The footer grammar splits **by surface family, not by platform**: `.db-confirm-stacked` is scoped to
the confirm on both platforms, while the 16px card inset is phone-only. Notion's own desktop
confirm (G3) uses the same stacked footer while its non-confirm editors keep a side-by-side one
(H3), so the split follows the reference rather than our platform boundary.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Declared card frame role, sheet mount kept** | Honours `048` D1; reuses the frame-shape mechanism that already ships; one class, one constant | A third shape in a split that was deliberately two | 8/10 |
| `super(app, "dialog")` | One-line change | Violates `048` D1 — a phone modal must become a stacked sheet | 2/10 |
| Inferring the card from height | No new declaration | The height that produces a card is the same height that produces a floating sheet; the classifier's own hysteresis comment (`mobile-bottom-sheet.ts:322-338`) is the argument against inferring a shape that changes its own input | 3/10 |
| Leave the confirm as it is | Zero risk | The one shape both reference products agree on, on the highest-traffic destructive surface | 3/10 |

**Why this one**: it is the only option that adopts Notion's shape without contradicting an operator
ruling, and it reuses a mechanism the tree already has rather than inventing a presentation.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The two choices in a destructive confirm become equally sized and equally thumb-reachable.
- The confirm stops reading as another sheet in a stack of sheets.

**What it costs**:
- A third frame class in a split documented as two. Mitigation: it is declared, never inferred, so
  it cannot participate in the oscillation the two-cutoff hysteresis exists to prevent.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A tall confirm loses its card | M | The role is declared per surface; height plays no part |
| Reference captures move | M | Parent D5: the 32 Project Manager entries checked `pixelHash`-identical at the landing |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The confirm is the highest-traffic destructive surface and diverges from both references |
| 2 | **Beyond Local Maxima?** | PASS | Four options weighed, two closed by a ruling |
| 3 | **Sufficient?** | PASS | One constant, one class, one flag on an existing builder |
| 4 | **Fits Goal?** | PASS | REQ-002, the loop's rank-1 finding over 77 screens |
| 5 | **Open Horizons?** | PASS | A declared frame role is reusable by any surface that later needs one |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `src/views/surface-shell.ts` — a card-inset constant beside the frame-shape constants (`:156-170`).
- `src/views/mobile-bottom-sheet.ts` — `SheetChromeOptions` (`:29-45`), `classifySheetFrameShape` (`:364`).
- `src/views/modals/confirm-modal.ts` — the declared role passed through; `:44` unchanged.
- `src/views/confirm-sheet.ts` — `stackedActions` (`:46-71`).
- `styles.css` — `.db-sheet-card` beside `.db-sheet-floating` (`:276`), and a scoped
  `.db-confirm-stacked` action rule beside `:8592`.

**How to roll back**: remove the `.db-sheet-card` and `.db-confirm-stacked` blocks and stop passing
the role. The class is additive — with it absent, `classifySheetFrameShape` produces exactly the two
shapes it produces today.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: A phone tap on an editable cell edits and does not select

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted** |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

**Decided against the four-reference read the operator ordered at 19:00** (ADR-000). Three of the
four products already do exactly this; the fourth has no cell selection to fall through to.

---

### Context

The operator's report, verbatim (2026-09-06 ~17:07): *"This menu still has extremely bad ui ux, the
attached menu you see when you click a cell, should be redesigned to mimic how notion would do it."*
Two captures came with it: a floating bar reading `× Esc | 1 cell selected | Copy TSV | Copy
Markdown` wrapping to a second row that sits under Obsidian's navigation pill, and a text cell's
editor popover drawn over that same bar's second row. Both were re-read directly for this decision
and both show exactly that.

The tap resolver already answers correctly. `resolveCellTapAction` returns `edit-cell` for a touch
press on an editable, non-title cell (`table-cell-gesture.ts:269-273`), and its own comment states
the intent: *"a tap in a cell opens that column's editor."* The caller does not honour it. It returns
early only on `open-record` (`database-view.ts:4791`) and then runs `nextCellRange`,
`renderCellSelectionClasses` and `renderSelectionStatusBar` on the same press (`:4795-4803`), so one
tap produces an editor **and** a selection **and** an eight-control bar.

**The four-reference read makes this unanimous rather than Notion-only** (ADR-000 row 1). Notion iOS
edits in place with a caret in the cell; Evernote iOS does the same, filling the cell yellow;
Anytype opens that property's editor; Fibery opens an anchored popover under the cell. **No
reference paints a selection from a plain press.** Notion additionally shows the resting table with
no chrome at all (`notion-ios-views-table-11/-12/-13`), as does Anytype
(`anytype-mobile-set-grid-light.png`).

### Constraints

- Desktop must not move. A mouse press resolves to `select-cell` in every cell
  (`table-cell-gesture.ts:270`) and the click-selects / double-click-edits grammar is unchanged.
- The embedded renderer holds its own copy of the same path
  (`embedded-database-renderer.ts:4384-4401`) and must move with it.

### Decision

**We chose**: on the `edit-cell` branch, the caller returns before touching the selection — the same
early return `open-record` already gets.

**How it works**: `database-view.ts:4791` gains the `edit-cell` case, so the editor the cell renderer
opens (`cell-renderer.ts:575-592`) is the only outcome of the press. Selection is reached by the
explicit gesture ADR-004 specifies, never by an ordinary tap.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Return early on `edit-cell`** | One press, one outcome — the rule the file's own comment at `:4782-4785` already states for `open-record`, and the rule all four references follow | Multi-cell selection needs its own entry gesture | 9/10 |
| Keep the selection, hide the bar | Smaller diff | The selection outline is still painted under the editor, which is the state `styles.css:2620-2632` already calls out as unexplainable to a user; and no reference paints one | 4/10 |
| Show the bar only above two cells | Smaller diff | The one-cell bar is the operator's actual capture | 3/10 |

**Why this one**: it makes the caller agree with the resolver it already asks, rather than adding a
second rule beside it — and four of four references agree with the resolver.

### Consequences

**What improves**: a tap does the one thing it says it does.

**What it costs**: multi-cell selection on a phone needs a deliberate entry. Mitigation: the long
press the row grammar already binds (`table-cell-gesture.ts:243-249`), specified in ADR-004.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Selection becomes unreachable on a phone | H | A lane row asserts the entry gesture reaches the pill, with a negative control |
| The embedded renderer drifts | M | Both call sites named in `spec.md` §3 and moved in one leg |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator's report with two captures |
| 2 | **Beyond Local Maxima?** | PASS | Three options weighed, then re-tested against four products (ADR-000) |
| 3 | **Sufficient?** | PASS | One early return, plus the entry gesture |
| 4 | **Fits Goal?** | PASS | REQ-001 |
| 5 | **Open Horizons?** | PASS | Restores the one-press-one-outcome rule the file already argues for |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `database-view.ts:4786-4803`, `embedded-database-renderer.ts:4384-4401`,
`table-cell-gesture.ts`.

**How to roll back**: remove the `edit-cell` case from the early return. The branch below it is
untouched.
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The value editor is drawn at the cell, and claims the bottom dock for its whole life

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted** |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

**Decided against the four-reference read the operator ordered at 19:00** (ADR-000). The `Proposed`
version framed the inline overlay as a divergence to be recorded. The four-product read reverses
that framing: it is the plurality, and digest P9 was answering a different question.

---

### Context

Digest **P9** reads: *"A picker's own value editor is a further pushed/stacked surface, never
inline. No screen in the set shows a value editor rendered inline inside the row that opened it."*
Read against the four products, **P9 is true of a picker inside a property editor and false of a
table cell.** Every screen behind P9 is a property-editor row, not a grid cell; Notion's iOS set
contains no table-cell editor at all, which the `Proposed` version already conceded.

What the direct read shows for a **grid cell**:

- **Notion iOS** edits **in place**: the cell itself becomes the editor, outlined, caret inside, the
  keyboard's accessory bar above it
  (`…/reordering-a-table-01-d53b3912-f60a-4bd1-872e-18276fe2acd5.webp`).
- **Evernote iOS** edits **in place**, the cell filling yellow around the caret
  (`…/adding-a-table-87fa2082-04-…webp`, `-08-…webp`, `-10-…webp`).
- **Fibery** opens an **anchored popover under the cell**
  (`…/selecting-from-multi-select-02-a624cc0a-…webp`).
- **Anytype desktop** does both, by type: an in-cell input for text and number
  (`anytype-menu-cell-text-light-full.png`, `anytype-menu-cell-number-light.png`) and an anchored
  dropdown under the cell for select, multi-select and date (`anytype-menu-cell-select-light.png`,
  `anytype-menu-cell-multiselect-light.png`, `anytype-menu-cell-date-light.png`).
- **Anytype phone** is the single exception: a grid cell opens that property's **bottom sheet**
  (`anytype-mobile-sheet-grid-cell-objecttype-empty-light.png`).

Ours is an inline overlay: `openTextPopoverEditor` inserts
`.db-cell-edit-popover.is-mobile.is-inline-overlay` into the cell's own scroll container and
positions it absolutely below the cell (`cell-editor-text.ts:356-378`) — which is Fibery's shape and
Anytype desktop's shape exactly. Half of our editors already are sheets: select, status, date and
datetime open on click through the picker family (`cell-renderer.ts:604-606`), which `048` registers
as stacked pairs — which is Anytype phone's shape. **Our tree already carries the same split the
references carry.**

### Constraints

- Converting the text editor to a pushed sheet touches `048`'s thirty-one registered pairs and
  `051`'s shell — both held by `067`.
- The operator named Notion as the reference for this one surface (2026-09-06 ~17:07), and Notion
  edits at the cell.

### Decision

**We chose**: the value editor is drawn **at the cell** — in place or anchored directly under it —
for text and number, and the picker family keeps its sheets. The divergence recorded by the
`Proposed` version is **withdrawn**: it was a divergence from a claim about pickers, not about
cells.

**What does change** is the dock claim. `openTextPopoverEditor` (`cell-editor-text.ts:331`) takes
and releases the bottom dock exactly as `openSingleLineEditor` does at `:212` and `:233`, on every
close path — commit, cancel and outside press alike. That is the operator's second capture, and it
is inside REQ-001.

**Anytype's own better idea is adopted where it is free**: its editor sheet header carries `Clear`
as a leading text button (`anytype-mobile-sheet-cell-text-longtext-light.png`,
`…-number-light.png`, `…-select-priority-light.png`, `…-date-light.png`), and its desktop dropdown
carries `Clear` in the footer (`anytype-menu-cell-date-light.png`). Our picker sheets already have
a header slot for it. **Recorded, not required**: it is not a task here, because the single-cell
`Clear` is already reachable from ADR-004's sheet and adding a second home for it is scope this
packet did not open.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Editor at the cell; fix the dock claim** | Closes the operator's actual defect; matches Notion, Evernote, Fibery and Anytype-desktop; no reach into `048`'s registered pairs | Diverges from Anytype **phone** alone, which is the parity default | 9/10 |
| Convert text/number to pushed sheets | Full Anytype-phone parity | A phone-sized surface for a one-line value; touches two packets' file groups; contradicts the reference the operator named for this surface, and three of four products | 3/10 |
| Keep inline **and** record it as a divergence from P9 (the `Proposed` version) | Smallest edit to the record | The divergence is not real — P9 is about pickers in a property editor. Recording a false divergence sends a later loop to re-litigate it | 5/10 |

**Why this one**: the defect the operator reported is the missing dock claim, not the overlay, and
the direct read of four products shows the overlay is the plurality rather than the outlier.

### Consequences

**What improves**: no editor is ever drawn over a bar that stayed, and the record stops naming a
divergence that does not exist.

**What it costs**: a named departure from Anytype **phone** — the one reference that pushes a grid
cell's editor to a sheet. It is recorded in ADR-005's register as **C-I** rather than left loose,
and it overrides no ruling: no landed ruling addresses where a grid cell's editor is drawn.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The dock claim is released on one close path but not another | M | NFR-R01 asserts release on cancel and outside-press as well as commit |
| A later Anytype re-read licenses the sheet after all | L | C-I carries its citation, so it reopens against evidence rather than being rediscovered |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The missing claim is one of the operator's two captures |
| 2 | **Beyond Local Maxima?** | PASS | The conversion was costed and refused against four products, not one |
| 3 | **Sufficient?** | PASS | Two calls, matching an existing pair |
| 4 | **Fits Goal?** | PASS | REQ-001 |
| 5 | **Open Horizons?** | PASS | C-I keeps the Anytype-phone reading reopenable |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `src/views/record-surface/cell-editor-text.ts:331` and its close path.

**How to roll back**: drop the two `claimBottomDock` calls.
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: No bottom-docked bar on a phone — the selection wears a three-control anchored pill, and everything past Copy is a sheet

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted** |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

**This supersedes the `Proposed` decision of the same number**, which kept the bottom-docked bar and
collapsed it to six children. The four-reference read the operator ordered at 19:00 (ADR-000)
removed the premise: **zero of four products dock a labelled action bar to the frame's bottom edge.**

---

### Context

For one selected cell the bar builds eight children (`database-view.ts:7643-7712`) into a row
declared `flex-wrap: wrap` at `max-width: calc(100vw - 32px)` (`styles.css:2645-2654`). At 390px it
wraps, and the second row lands under Obsidian's navigation pill because the bar's `bottom`
(`:2646`) carries no term for it — while the mobile FAB on the same container already reads
`--db-mobile-navbar-height` (`:22569`) off the value `toolbar-renderer.ts:2419` publishes. The
operator's first capture shows both failures at once: `× Esc | 1 cell selected | Copy TSV | Copy
Markdown` on row one, and row two behind Obsidian's own `‹ › 🔍 + [11] ☰` pill.

The `Proposed` version treated this as a wrap to be un-wrapped. **The four-product read says the
shape itself is wrong.** Notion, Anytype, Evernote and Fibery all put a selection's actions either
**beside the selection** or **in the view's own chrome**, and all four collapse everything past one
or two controls behind a single `···` that opens a menu or a titled sheet. The design skill states
the rule the references are following: *"Display feedback relative to its trigger … Feedback that
appears far from what caused it makes the user hunt for the connection"*
(`sk-design-fundamentals/references/interaction-craft.md` §8). A bar pinned to the bottom of the
frame for a cell in the middle of a scrolling grid is exactly that hunt, and on this phone it is
drawn under the host app's navigation.

### Constraints

- Nothing is removed. All three copy formats keep their strings (`i18n.ts:369-371`) and stay
  reachable.
- The count keeps its live region (`database-view.ts:7636-7641`, `:7660-7662`).
- Every control keeps the 44px floor on a phone (`styles.css:2660-2663`) — WCAG 2.5.5, and the
  thumb figure `interaction-craft.md` §3 reconciles.
- Desktop's bar is a shipped surface at a declared 30px (`--db-selection-status-height`,
  `styles.css:925`) and its grammar is not the operator's complaint.
- `048`'s stacking model and `044`'s sheet grammar bind whatever sheet this opens.

### Decision

**We chose**: **a phone grows no bottom-docked selection bar at all.** The selection's chrome is a
three-control pill anchored to the selection, and everything past `Copy` lives in a titled sheet
behind `···`. Desktop keeps its bar and adopts the same collapse.

#### The phone spec

1. **Entry.** Selection mode is entered by a **long press on a cell** — `attachLongPress`, the same
   object the row grammar already binds (`table-cell-gesture.ts:243-249`), so threshold, movement
   tolerance and haptic are shared rather than matched, exactly as the 2026-08-30 row-range ruling
   required. The long-pressed cell is the anchor. A second long press, or a drag from the anchor's
   corner handle, extends the range. **No ordinary tap ever enters selection** (ADR-002).
2. **The pill.** One row, `flex-wrap: nowrap`, **exactly three children**: the live count `N`, one
   **Copy** control, and **`···`**. Height **44px**; radius `--db-radius-full`; internal gap
   `--db-space-2`; horizontal padding `--db-space-3`; the shell's floating elevation. Every child's
   hit box is at or above **44 × 44px**.
3. **Anchoring.** The pill is positioned against the selection range's bounding rect: **8px above**
   its top edge when there is room above, otherwise **8px below** its bottom edge. It is clamped
   horizontally into the grid's scroll viewport with an **8px** margin on each side, and clamped
   vertically so its own bottom edge never crosses
   `max(env(safe-area-inset-bottom), var(--db-mobile-navbar-height, 0px)) + 8px` — the **same
   published value the mobile FAB reads** at `styles.css:22569`. `toolbar-renderer.ts`'s
   `reserveMobileFabInset` (`:2410-2419`) is called unconditionally on a phone rather than only
   inside the New-button build (`:2362`), so the value exists whether or not a FAB rendered; its own
   50px fallback (`:2417`) covers a bar that cannot be measured.
4. **The overflow.** `···` opens the shell's existing bottom sheet — `044`'s grammar, header
   everywhere, registered as an `048` stacked pair — titled **"N cells selected"**, carrying labelled
   rows in three groups: *Copy TSV · Copy Markdown · Copy CSV* | *Paste · Fill · Bulk edit
   <Column>* | ***Clear*** (destructive, last, and the only red row). This is Notion's own "Actions"
   sheet shape (`…/turning-a-table-into-a-database-03-…webp`) and Evernote's titled-sheet shape
   (`…/adding-a-table-87fa2082-05/-07/-09`). Rows absent from the current context are not rendered,
   and a group that would be empty is not drawn.
5. **Exit.** A tap outside the range, the sheet's own close affordance, or an editor opening.
   **`× Esc` is not built on a phone** — it is desktop vocabulary that the operator's capture shows
   spending a 44px circle on a key the device does not have.
6. **`.db-selection-status-bar` renders zero times on a phone.** The phone rule at
   `styles.css:2645-2654` — `flex-wrap: wrap`, `row-gap`, the `max-width` and the nav-blind `bottom`
   — is deleted rather than repaired.

#### The desktop spec

Unchanged grammar: a click selects, a double click edits, shift and drag extend. The bar stays a bar
at its declared 30px, and adopts the same collapse: **at most five children** — count, one **Copy**,
**Paste**, **Clear**, **`···`** — under `flex-wrap: nowrap`, with the three copy formats and Fill in
the `···` **anchored menu**. Every reference uses an anchored menu rather than a wide button row on a
pointer surface (Notion web, Evernote web, Fibery, Anytype desktop), so this is parity rather than a
phone change leaking upward.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Anchored three-control pill + `···` sheet; no phone bar** | The shape Notion actually uses for a selected cell; puts the feedback at its trigger; cannot collide with the nav pill or with an editor, because it is inside the grid viewport; collapses eight controls to three | A pill that must re-anchor on scroll and on range change | 9/10 |
| Six children, one row, bottom-docked (**the `Proposed` version**) | Smallest diff; keeps a familiar bar | Keeps the one shape **zero of four** references use; still six words of chrome across the bottom of a phone; still needs a nav-bar term to avoid the host's own pill | 4/10 |
| Fibery's shape — a count pill in the view toolbar | Proven with real multi-selection; cannot be clipped; reuses the rail `053` just landed | A phone's top edge is the worst thumb reach on the screen, and the toolbar is not always in view while the grid scrolls | 6/10 |
| Horizontal scroll instead of wrap | No control moves | A scrollable bar hides actions behind a gesture with no affordance; the phone rule explicitly turned it off (`styles.css:2651-2652`) | 3/10 |
| Drop Markdown and CSV | Simplest | Removes shipped capability | 1/10 |

**Why this one**: it is the only option that both fits the viewport and puts the actions where the
thing they act on is — and it is the only one that four independently designed products agree on.

### Consequences

**What improves**: the selection's chrome reads in one glance at three controls instead of eight; it
sits beside the cells it acts on; it cannot be drawn under Obsidian's navigation pill, because it is
clamped inside the grid; and it cannot be drawn under an editor, because an editor replaces it.

**What it costs**:
- Two of three copy formats gain a tap, and Paste and Clear gain one. Mitigation: a lane row asserts
  every one of them is reachable within one tap of `···`.
- A new positioning routine that must re-run on scroll, on resize and on range change. Mitigation:
  it is the same clamp-into-viewport arithmetic the dropdown family already runs, and the pill is a
  single element with no internal layout.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The pill re-anchors late and lags a fast scroll | M | It is repositioned on the same scroll listener that already keeps the sticky header current, and clamped rather than free |
| A selection taller than the viewport has no room above or below | M | The clamp resolves to the viewport's own top or bottom edge minus the nav-bar term; the pill is never placed outside the grid |
| The nav-bar height is unpublished | M | The publisher's guard is lifted in the same leg; the 50px fallback (`toolbar-renderer.ts:2417`) covers an unmeasurable bar. **Trap:** a `var()` that misses does not fail — the silence `styles.css:2639-2644` already documents |
| A read-only view leaves an empty sheet group | L | Groups that would be empty are not drawn; a sheet with only the copy group still opens |
| The desktop bar and the phone pill drift apart | M | One builder produces both; the platform decides the frame, not the control set |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The wrap and the occlusion are both in the operator's capture, and the shape is in none of four references |
| 2 | **Beyond Local Maxima?** | PASS | Five options weighed, including the `Proposed` version this supersedes and Fibery's toolbar placement |
| 3 | **Sufficient?** | PASS | One builder, one positioning routine, one sheet body, one deleted CSS rule |
| 4 | **Fits Goal?** | PASS | REQ-001 |
| 5 | **Open Horizons?** | PASS | The `···` sheet is where every later bulk action lands instead of widening anything |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `database-view.ts:7607-7712` (the builder, and the pill's positioning),
`embedded-database-renderer.ts:4569-4579`, `table-cell-gesture.ts` (the long-press entry),
`styles.css:2590-2665` (the phone bar rule deleted, `.db-cell-selection-pill` added),
`toolbar-renderer.ts:2362` and `:2410-2419` (the publication made unconditional on a phone),
`i18n.ts:369-371` (the sheet's row strings).

**How to roll back**: restore the `.is-phone … .db-selection-status-bar` block and the eight-child
builder. The navigation-bar term and the desktop collapse are independent and should not be rolled
back with them.
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: Eight Notion-versus-Anytype conflicts, and none overrides a landed ruling

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Parent D15 |

---

### Context

The loop found eight places where a Notion pattern contradicts something a landed operator ruling
already settled. Parent **D15** decides what happens to them: the conflict is named, a side is
proposed with a reason, and no ruling is overridden. This ADR is `Accepted` because it changes
nothing — it records the status quo so that a later reader does not rediscover eight conflicts as
eight new findings.

### Decision

**We chose**: keep every landed Anytype ruling. **Count of rulings overridden: zero.** That count
survives the 19:00 four-reference read unchanged: Anytype has no cell selection at all in twelve
read captures, so the model ADR-004 adopts contradicts no Anytype ruling — it fills a silence, the
same way ADR-001's confirm card does.

**The register** — permanent, and never a task:

| # | Conflict | Ruling of record | Disposition |
|---|----------|------------------|-------------|
| C-A | **Header slots.** Notion's plurality is title-only with zero actions (digest B1, B4, C1, C6, C10, C12, D2, D8, D9, E1 — ~10 of ~30 headered surfaces); we adopted Anytype's three slots with a centred title (`surface-shell.ts:253-290`) | `051` ADR-007, parity by default | **Keep Anytype.** Notion contradicts itself — the same "View options" sheet is zero-action at C10 and "Done"-trailing at D2 — which is weak evidence against a measured, adopted rule |
| C-B | **Close affordance.** Notion splits roughly 50/50 between an explicit close and handle-only, with no visible rule (A3/A11/B7 against B4/C1/C6) | `044` REQ-007, `051` ADR-007 exception **E1** — the 44px close, kept on the handle's 2.21:1 contrast | **Keep the 44px close.** Notion corroborates neither side, and the accessibility number does not move |
| C-C | **Grouped sections.** Notion iOS uses gutter bands between rounded cards (C10, D2, E1); ours are dividers inside one card (`styles.css:12408-12415`) | Parity by default | **Parked**, see ADR-006 |
| C-D | **Confirm shape.** Anytype silent (`design-trueup.md` row 1, "Not seen"); Notion consistent on both platforms (A4, C9, G3) | `051` ADR-007 **E4** closed the *whether* — no confirm for a single delete, an Undo toast instead. The *shape* of the surviving bulk confirm was never settled | **Adopt Notion**, as ADR-001. The one place it fills a silence rather than contradicting a ruling |
| C-E | **Desktop side panel.** Notion's config panels float, content-sized and inset (I4 ~190px, I10 ~340px); only the comments/inbox panel (I11) is edge-flush | Operator, 2026-09-06 ~10:55: *"Keep the overlay."* (`051` ADR-008 amendment; `roadmap.md` §6A) | **No action.** Recorded only: our 420px edge-docked shape is closer to Notion's I11 outlier than to its config-panel norm. Worth revisiting only if a second config surface adopts the shape (`051` T023) |
| C-F | **Commit placement.** Notion C11 uses a trailing "Save" in the header; ours is Anytype's full-width pill commit row | `051/design-trueup.md` row 19, FLIPPED | **Keep the pill.** A named divergence, and the mechanism for the alternative already exists unused (`mobile-bottom-sheet.ts:143`, `surface-shell.ts:260-288`) |
| C-G | **Desktop builder width.** Notion keeps filter and sort builders to single- or double-row anchored dropdowns (J2-J8); our condition panels are 440-560px | Already open at `roadmap.md` §7.11 | **No new action.** Owned where it already lives |
| C-H | **Keyboard.** Notion does not resize the sheet; rows below the focused field are simply covered, and "Done" repeats as a keyboard accessory (F2). We lift the sheet via `--db-keyboard-inset` (`mobile-bottom-sheet.ts:190` publishes `--db-keyboard-inset`; the sheet consumes it as `--db-mobile-sheet-bottom` at `styles.css:232` and `:245`) | No Anytype keyboard measurement exists in the true-up | **Keep the lift.** It is the accessibility-friendlier behaviour **[inference]** and no ruling says otherwise; verified on device as part of `067` AC-011 |

### Addendum, 2026-09-06 19:00 — one conflict added by the four-reference read

The eight rows above are the loop's, and their count is what REQ-003 and AC-006 assert; it does not
move. The read the operator ordered at 19:00 (ADR-000) surfaced one more, and it is recorded here
rather than folded into the eight so that neither count becomes ambiguous.

| # | Conflict | Ruling of record | Disposition |
|---|----------|------------------|-------------|
| C-I | **Where a grid cell's value editor is drawn.** Anytype **phone** pushes it to that property's own bottom sheet (`screenshots/anytype/mobile/sheets/anytype-mobile-sheet-grid-cell-objecttype-empty-light.png`); Notion iOS and Evernote iOS edit **in place in the cell**, and Fibery and Anytype **desktop** anchor a popover **under** it | Parity by default (`051` ADR-007). No landed ruling addresses a grid cell's editor placement | **Adopt the plurality**, as ADR-003 — the editor is drawn at the cell. Three of four products place it there, and the operator named Notion as the reference for this surface at 17:07. Anytype phone is the single dissenting reference and is named here rather than silently outvoted |

Two further items are recorded rather than actioned, because they belong to another packet:
**unsaved-state signalling** (digest D3/D4/C1/D7 — a dot on the filter pill, an orange "Save for
everyone" banner) belongs to `053`'s condition rows; and the **dark-theme capture gap** is Notion's,
not ours — zero dark-theme sheet, menu or dialog captures exist in the 3,647-file harvest (digest
K1/K2), so no dark-theme Notion claim is possible at all.

### Consequences

**What improves**: eight findings stop being loose. **What it costs**: nothing — no code moves.

**Risks**: a later loop re-reports one of these as new. Mitigation: this register, cited from
`spec.md` §12 and from `goal.md`'s completion criteria.

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Parent D15 requires the record |
| 2 | **Beyond Local Maxima?** | PASS | Each row names the alternative and why it lost |
| 3 | **Sufficient?** | PASS | A table; no mechanism |
| 4 | **Fits Goal?** | PASS | REQ-003 |
| 5 | **Open Horizons?** | PASS | Each row carries its citation, so any of them can be reopened against new evidence |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: nothing in `src/`. **How to roll back**: not applicable — the register is a record.
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: Grouped gutter bands stay parked behind an Anytype re-read

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

---

### Context

Notion's iOS sheets separate logical groups with a background gutter band between rounded cards —
five groups in one sheet at digest C10, and the same at D2 and E1. Ours draws dividers inside one
card via `.db-panel-row` (`styles.css:12408-12415`), which matches Anytype. The digest's own ruling
is explicit: *"nothing here licenses adopting it"* (§4 P4, §6 Q3), because under parity-by-default
the question is what **Anytype's** multi-section sheets do, and that read was never taken.

### Constraints

- Every registered stacked pair's rect assertions would move with a band, so no band lands without
  a lane-row update in the same commit.
- The row-padding floor the grammar already measures stays (`sheet-grammar.ts:52`,
  `ROW_PADDING_FLOOR_PX = 2`).

### Decision

**We chose**: park it, and name the precondition — a re-read of Anytype's own multi-section sheets,
which is the operator's to schedule.

**How it works**: nothing is built. If the re-read licenses it, the sketch is a `.db-sheet-group`
wrapper per logical group, each its own rounded card at `--db-radius-lg` with `overflow: hidden`,
and an 8px band of page background showing between two cards — a gap, not a divider inside one card.
Threshold if licensed: band height 8px ± 1.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Park behind the re-read** | Honours parity-by-default; costs nothing | The question stays open | 8/10 |
| Build it from Notion alone | Visible improvement | Contradicts the digest's own ruling and parent D15 | 2/10 |
| Close it as refused | Removes an open question | Refusing on absent evidence is the same error as adopting on it | 3/10 |

**Why this one**: the missing input is an Anytype read nobody has taken, and neither adopting nor
refusing is decidable without it.

### Consequences

**What improves**: the question has a named precondition instead of being an open bullet.

**What it costs**: it stays open. Mitigation: AC-007 accepts a recorded park as closure.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The park is read as a refusal | L | AC-007's wording distinguishes the two |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The digest names it as an open question for the loop |
| 2 | **Beyond Local Maxima?** | PASS | Three dispositions weighed |
| 3 | **Sufficient?** | PASS | A recorded park plus a precondition |
| 4 | **Fits Goal?** | PASS | REQ-004 |
| 5 | **Open Horizons?** | PASS | The sketch and its threshold survive for whoever takes the re-read |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: nothing in `src/`. **How to roll back**: not applicable.
<!-- /ANCHOR:adr-006 -->

---
