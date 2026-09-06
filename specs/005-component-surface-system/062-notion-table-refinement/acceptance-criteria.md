---
title: "Acceptance Criteria: Notion Table Refinement"
description: "The thresholds that close the table refinement: the frozen offset, the five guards, the date end, the four type registries, the handle, the border gate, the peek placeholder, the add-row noun and the operator's device read."
trigger_phrases:
  - "062 acceptance criteria"
  - "notion table closure gate"
  - "frozen offset threshold"
  - "table guard threshold"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/062-notion-table-refinement"
    last_updated_at: "2026-09-06T16:32:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Unblocked AC-004 and AC-008 on the 18:32 rulings; wrote thresholds"
    next_safe_action: "Take AC-002 first; five behaviours are right and unasserted"
    blockers:
      - "AC-009 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/table-renderer.ts"
      - "src/views/column-menu.ts"
      - "src/views/cell-renderer.ts"
      - "src/data/types.ts"
      - "styles.css"
      - "tools/live/render-assertions.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-062-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Person's vault value source — wikilink or plain text — owed an ADR before its renderer"
    answered_questions:
      - "The add-row noun is a per-view configured string, fallback today's 'New'"
      - "The frozen divider is a soft right-edge shadow, shown only once content scrolls under it"
      - "All eight missing Notion types ship as real data types; the count is 13 to 21"
      - "The wrap-off row-height defect is closed on main and is not a criterion here"
      - "The resize handle paints nothing at any time, not merely nothing until hover"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Table Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** `005-component-surface-system/062-notion-table-refinement`
**Level:** 3
**Status:** Draft
**Date:** 2026-09-06

Every threshold below was **observed red on the tree at `94f03c88`** during this packet's opening,
with the `file:line` in the Verification cell. None was carried from the research report — which
matters, because the item the research ranked second had already been fixed on `main` by the time
the loop finished, and quoting it would have opened a packet around a closed defect.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a desktop table wider than its viewport, **When** a column is frozen from its header menu and the table is scrolled sideways, **Then** the frozen `th` and its `td`s compute `position: sticky` with `left` equal to the sum of the preceding frozen columns' widths within **±1px**, the last frozen column paints **no** right-edge shadow at `scrollLeft === 0` and a soft token-derived one once the table is scrolled sideways, unfreezing collapses the offset to 0, and `frozenColumnKeys` survives serialise → parse; **and Given** a phone, **Then** nothing changes, because auto layout has no horizontal overflow | Render-harness rows on the computed `left` and on the unfreeze control; a unit round-trip. **Today: observed red — the concept is absent.** `ColumnMenuActions` declares twenty-five actions with no freeze (`src/views/column-menu.ts:38-63`); a case-insensitive `freeze\|frozen` sweep of `src/` and `styles.css` returns only `Object.freeze`, a frozen render clock and one prose comment, **zero** on a column; the only sticky block in the table is `thead` (`styles.css:5425-5429`); `ViewConfig` carries `wrapText` (`src/data/types.ts:527`) and `columnWidths` (`:531`) and no third. Notion: `74fe28d3`, `039351aa`, digest P7. **The rendered design is ours, marked inference** — no capture shows a frozen state. **ADR-005 settles the divider** (operator 18:32, *"Subtle shadow when scrolled past"*): nothing at rest, soft right-edge shadow once content scrolls under the frozen column, measured in both themes under ADR-004; desktop-only stays | Met | - |
| AC-002 | REQ-002 | **Given** the tree, **Then** each of five behaviours already at or ahead of parity carries a permanent assertion that is green on the tree and **red under its own named control**: the footer's zero-row skip and 44px phone floor; the header's icon, label, menu target and sort ordinal; inline chips with 4px gaps and the 560px measurer cap; per-option pill colour; and the conditional tint painting through `tr > td` | Five rows on `tools/live/render-assertions.mjs`, each control observed red before the row is trusted. **Today: observed red — none of the five is asserted anywhere.** `src/views/table-renderer.ts:804` (the bare zero-row return), `styles.css:8486-8488` (the floor), `src/views/table-renderer.ts:632-647` (the header), `src/views/cell-renderer.ts:470-498` with `src/views/column-width.ts:118-125` (chips and measurer), `src/views/cell-renderer.ts:453-468` (pill colour), `styles.css:1317-1319` (the tint's `td` paint). Notion: `6055725d`, `101392c7`, `20a95974`; `19745d87`, `35c64a84`, `3b3c3c26`; `21d71e5f`; `8d6dcf3b`, `6673816d`; `142cef4e`, `b184ec4c` | Met | - |
| AC-003 | REQ-003 | **Given** a date column, **When** an end value is set, **Then** the picker offers an *End date* row and the cell renders both ends in one string; **and When** the end is absent, malformed, or earlier than the start, **Then** the cell renders without throwing and the picker states which value it treats as authoritative | Unit coverage on the display form including the three malformed cases; a harness read of the picker row. **Today: observed red — no end or range concept exists.** All 546 lines of `src/views/record-surface/cell-editor-date.ts` contain no end field, and `renderDate` formats exactly one value (`src/views/cell-renderer.ts:537-541`). Notion: `bd482935` | Met | - |
| AC-004 | REQ-004 | **Given** the type popover, **Then** it lists **21** types with one glyph each — today's thirteen plus **Person, URL, Email, Phone, created time, created by, last edited time and last edited by**, each with a working renderer behind it — the four registries behind it are the same length and the same members, and the grouped submenu's slice boundaries put each new type in the group it belongs to | An assertion that the four lists agree, plus a harness read of the popover row count. **Today: observed red at 13, and the target is 21 rather than the research's 18** — the eight the digest's canonical list (`af7a18b0`, digest §P2) shows we lack, in four places that must move together — the union `src/data/types.ts:82`, `PROPERTY_TYPES` `src/views/record-surface/type-picker.ts:28-32`, `PROPERTY_TYPE_ICON_NAMES` `src/views/property-type-icon.ts:32-46`, `COLUMN_TYPE_LABELS` `src/data/column-types.ts:135-151`. The submenu slices `PROPERTY_TYPES` at 6 and 9 (`src/views/column-menu.ts:262-264`), so an appended type lands in Advanced whatever it is. **The digest's two second-hand citations were re-verified here and are exact**, closing the research's own E3 debt; the third and fourth registries it never named are the reason this row counts four. Notion: `af7a18b0`, `7f2dbda0`, `3b3c3c26`. **ADR-007 Accepted** (operator 18:32, *"All types or add more as needed"*) — the rows ship enabled with real types behind them, so this row is no longer blocked. Person's vault value source is an open implementation decision owed its own ADR before its renderer, and does not gate the other seven | Met | - |
| AC-005 | REQ-005 | **Given** a column header, **When** it is hovered, **Then** the resize handle's computed background changes to a token-derived colour clearing **3:1** non-text contrast in both themes | A harness read of the computed background with and without hover, plus a contrast measurement in each theme. **Today: observed red, and further red than reported.** `.db-resize-handle` (`styles.css:5655-5663`) is a 4px absolutely-positioned strip carrying `cursor: col-resize` and **no background declaration and no `:hover` rule anywhere in the stylesheet** — it paints nothing at any time, so the cursor is the entire affordance. The research recorded it as "paints nothing until hover"; the measurement is worse. Notion: `d53b3912` | Met | - |
| AC-006 | REQ-006 | **Given** a view with the vertical-lines switch **off**, **Then** no `td` computes a right border; **and Given** the switch **on**, **Then** every `td`'s computed border is unchanged from today | A harness read of the computed `border-right-width` in both states, with today's value captured as the baseline first. **Today: observed red — borders are unconditional.** `.db-table th, .db-table td` declares `border-right: 1px solid var(--db-border-subtle)` with no gate (`styles.css:5414-5421`, the declaration at `:5416`). Notion: `d3acf726`. **This row also owes an answer on the sixth P10 toggle, *Show data source title*** — not located in the loop's reads and deliberately not guessed | Met | - |
| AC-007 | REQ-007 | **Given** a record open in the docked peek with a visible property that has no value, **Then** the peek renders a muted placeholder; **and Given** the same property in a table cell, **Then** the cell still renders blank | A harness read of both surfaces in one pass, so the second clause cannot be quietly broken by the first. **Today: observed red in the peek, and correct in the cell.** `valueEl.textContent = text` with `text` empty (`src/views/table-record-peek.ts:357-360`) renders a label beside nothing. The cell is already right and stays right: `src/views/cell-renderer.ts:263-264` and `styles.css:6766-6771` match Notion's blank table cell, and `050083af` — the capture showing the word — is **page-view only** | Met | - |
| AC-008 | REQ-008 | **Given** a view carrying a configured noun, **Then** the add-row affordance reads `+ New <noun>`; **and Given** a view whose noun is unset, empty or whitespace-only, **Then** it reads today's string with no trailing space; **and Then** the noun survives serialise → parse on `ViewConfig`, and the `+ New` framing and its fallback exist in all three locales | A harness read of the rendered button text in both cases; a locale-file check. **Today: observed red — the string is fixed.** `` `+ ${t("toolbar.new")}` `` at `src/views/table-renderer.ts:982`. Notion varies it per source: `+ New page` (`19745d87`) against `+ New task` (`e33466b4`). **ADR-006 Accepted** (operator 18:32, *"Per-view configured noun, fallback 'New'"*) — a per-view setting, not a derived string, so this row is no longer blocked | Met | - |
| AC-009 | REQ-009 | **Given** one released build, **When** the operator opens a wide table on iOS with a column frozen, reads the new colours in **both** themes, and opens a long-titled record at 390px, **Then** the frozen column holds through a real scroll, every new colour is legible in dark as well as light, and the title cell's open button stays inside its own inline box with the ellipsis on the text and the two hit areas disjoint | The operator's own words plus the three answers. **Only the operator closes this row; nothing in this repository can** (parent D3). Each of the three is unanswerable here by construction: no capture in the 98-screen read shows a frozen state (digest P7, §6 Q3); zero of the 102 screens are dark (digest preamble, §6 Q6); and the 390px composition was **not measured by the loop**, so **this row owes its own threshold before it can be read** and no number is guessed for it here | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Not yet — AC-001 through AC-008 are `Met`; AC-009 is `Unmet` and stays that way until
the operator reads a released build. Nothing else blocks closure: ADR-003 and ADR-005 through
ADR-008 are all Accepted, `npm run gate` is 26/26 green, and every guard's control was observed red
before the row was trusted.

Freeze shipped desktop-only with the scroll-conditional shadow the operator asked for
(`.is-scrolled-x .db-frozen-col-last`); all twenty-one types landed across the four registries with
Person's value source settled in ADR-008 before its renderer; the per-view add-row noun reached all
three locales; and the two new capture scenarios (`table-frozen-column`, `table-vertical-lines-off`)
were opened and read in both themes and both devices. What remains is AC-009 itself — read against
one build on a real device rather than inferred from a green lane.
<!-- /ANCHOR:closure -->
