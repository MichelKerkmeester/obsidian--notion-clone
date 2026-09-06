---
title: "Goal: Notion Table Refinement"
description: "The durable directive for the table view's Notion refinement, and the thresholds that decide when it is closed."
trigger_phrases:
  - "062 goal"
  - "notion table refinement goal"
  - "column freeze goal"
  - "table view notion goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/062-notion-table-refinement"
    last_updated_at: "2026-09-06T16:17:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened the packet from the Notion table research loop"
    next_safe_action: "Take T001 — the five guards on the already-haves, each red under its own control"
    blockers:
      - "ADR-005, ADR-006 and ADR-007 are Proposed and the operator owns them"
      - "styles.css edits are serialized by the parent's CSS lane"
      - "C9 is the operator's device read and no agent ticks it"
    key_files:
      - "src/views/table-renderer.ts"
      - "src/views/cell-renderer.ts"
      - "src/views/column-menu.ts"
      - "src/views/column-width.ts"
      - "src/views/table-record-peek.ts"
      - "src/data/types.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-062-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Where does the add-row noun come from, the view's source name or a fixed word"
      - "What does the frozen divider look like in dark theme, where no capture exists"
      - "Does a type-picker row ship before the data type behind it does"
    answered_questions:
      - "The wrap-off row-height defect landed on main at 41513bd3 and 1a2c7e00; it is not this packet's work"
      - "Conditional row colour already ships; only its naming could move"
      - "The digest's two second-hand line citations are exact, and a third registry it never named exists"
---

<!-- SPECKIT_TEMPLATE_SOURCE: goal-core | v2.2 -->
# Goal: Notion Table Refinement

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Refine the table view against Notion's, item by item — add the one structural pattern
we do not have, add the five small ones worth having, and turn thirteen behaviours that are already
at or ahead of parity into guards that cannot silently regress.

**Why.** A five-iteration deep-research loop
(`../053-toolbar-and-view-controls/research/research.md`, 26 merged findings) read our table against
a 98-screen Notion digest and found the gap is narrow. **One structural adoption is worth
building** — per-column Freeze, which exists in Notion's column menu (`74fe28d3`, `039351aa`; digest
P7) and nowhere in our tree. **Five to six small additions** follow it, none of them a redesign.
**Thirteen behaviours are already at or ahead of parity**, four of them ahead — the in-header
multi-sort ordinal, the per-chip inline remove, the select-all and range selection, and an inline
edit lifecycle stricter than any screenshot can show. And **the digest was wrong once**: it read
conditional row colour as absent, and it ships (`src/data/conditional-formatting.ts:168-206`,
painted at `styles.css:1317-1319`).

**The most user-visible defect the loop named is no longer ours to fix.** The research ranked the
wrap-off row-height bug second and wrote a whole phase around it. It landed on `main` while the loop
was running: `41513bd3` made the view switch the gate rather than a default a column could outvote,
and `1a2c7e00` collapsed a markdown cell's own `<br>` line breaks when the cell resolves to clip.
`resolvesToWrappedCell` now reads `Boolean(viewWrapText) && colWrap !== false`
(`src/data/column-types.ts:425-427`) — off clips every column, on lets a column's Clip mode opt back
out, and the phone honours the switch instead of holding every cell to one line. The research's
Phase B is **superseded, not carried**, and ADR-002 records the correction with the rule the tree
actually implements.

**What the reconciliation against `main` at `94f03c88` also settled.** The loop closed with four
verification debts. Two are answered here rather than carried: the digest's second-hand citations
are **exact** — `src/data/types.ts:82` is the thirteen-member `ColumnDef["type"]` union and
`src/views/property-type-icon.ts:32-46` is `PROPERTY_TYPE_ICON_NAMES` with one glyph per member —
and reading them turned up a **third registry the digest never named**, `PROPERTY_TYPES` at
`src/views/record-surface/type-picker.ts:28-32`, plus `COLUMN_TYPE_LABELS` at
`src/data/column-types.ts:135-151`. A type is four registries, not one, which is why C4's threshold
counts four and ADR-007 asks whether the row should ship before the data type does. The resize
handle's red is also sharper than reported: `.db-resize-handle` (`styles.css:5655-5663`) declares no
background **and carries no hover rule at all**, so it paints nothing ever rather than nothing until
hover.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The table is governed by item-wise adoption, not by 1:1 parity with anything.** `050` ADR-006 and `../roadmap.md` §6A (2026-09-05 ~22:45) moved the board and the calendar to Anytype 1:1 and kept the table ours, *"with grid patterns adopted where the captures show them better"*. Every Notion item below is argued on its own merits against our tree, and an item that loses stays out. This is why the loop found zero conflicts with a landed ruling: there is no parity target here for a Notion pattern to contradict. |
| D2 | **A Notion claim needs a screen id; a claim about our tree needs a `file:line`.** The digest is the only admissible source of Notion fact for this packet — no image file was opened by the loop, by construction — and the digest's own "no match" greps are claims, not evidence. Iteration 4 proved that when P9 flipped from absent to already-shipping on two targeted reads. **Re-grep by symbol, never by phrase**, before writing any absence into this packet. |
| D3 | **Red first, per criterion, on a threshold.** Every row in `acceptance-criteria.md` carries one number or one boolean observed failing on the tree at `94f03c88`, with the failing `file:line` in its Verification cell. The word used for a failing measurement is **observed red**. |
| D4 | **Guards are written before features**, per `050` ADR-004 — assert what is missing *and* separately assert what already works, so it cannot regress. Thirteen behaviours are at or ahead of parity and none of them has a permanent assertion today; a packet that ships Freeze and lets the footer guard rot has traded one gap for another. |
| D5 | **No colour is taken from a Notion capture.** All 102 screens in the digest are light theme, so Notion supplies no colour values at all. Every new tint, line or divider derives from our own token scale (`../design-system.md` §12 — *"Notion is the visual target and is not a source at all"*) and clears `050` ADR-005's bar: 3:1 for non-text under WCAG 1.4.11, 4.5:1 for text under 1.4.3, verified in **both** our themes. |
| D6 | **Hover carries no Notion claim.** Hover state is structurally unobservable in a screenshot catalogue (digest §6 Q5), so our header and cell hover states are judged against our own contrast bar and nothing else. "No hover captured" is never read as "Notion has none". |
| D7 | **One leg touches one file group**, carried from `053` D6. `styles.css` is the exception every leg may reach and is serialized by the parent's CSS lane. |
| D8 | **This packet is additive and may not un-tick a measured row in `053` or `052`, rewrite a landed ruling, or change either packet's parity target** (parent D15, `../roadmap.md` §7.15). Where a Notion finding contradicts a landed Anytype ruling it becomes a **Proposed** ADR carrying both readings, and only the operator moves it to Accepted. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D14 bind here as written there, and **D15**
is the rule this packet exists under. `../roadmap.md` §5.A places this phase, §6A holds the operator
instruction that opened it, §7.15 the conflict rule.

**The Notion source of record is
`../053-toolbar-and-view-controls/notion-screens-digest.md`**, and the research of record is
`../053-toolbar-and-view-controls/research/research.md`. Where the research and the tree disagree,
the tree wins and the finding is corrected in place, dated — three were, at this packet's opening.

**The owning packets are `053` and `052`.** The table view has no packet of its own; `053` holds the
toolbar, the wrap switch and the column menu, `052` the cell editors and pickers. Nothing here
re-specifies either.

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **C1 — A column can be frozen, and the frozen columns hold their place while the rest
      scrolls.** Notion exposes Freeze in the column header menu, worded *"Freeze up to and
      including this column"* (`74fe28d3`, `039351aa`; digest P7). **Today: observed red — the
      concept does not exist anywhere in the tree.** `ColumnMenuActions`
      (`src/views/column-menu.ts:38-63`) declares twenty-five actions and no freeze among them; a
      case-insensitive `freeze|frozen` sweep across `src/` and `styles.css` returns only
      `Object.freeze`, a frozen render clock and one prose comment, with **zero** hits on a column.
      Done is: `ViewConfig.frozenColumnKeys?: string[]` beside `columnWidths`
      (`src/data/types.ts:531`); one menu row beside the wrap row
      (`src/views/column-menu.ts:194-213`); a frozen `th` whose computed `left` equals the sum of
      the preceding frozen widths within **±1px** in the render harness; a checked state that
      persists per column through a serialise/parse round-trip; a divider gated on horizontal
      scroll; and an unfreeze negative control that collapses the offset. **Desktop only, with the
      reason in the task** — the phone switches to content-driven auto layout and has no horizontal
      overflow to freeze against (`styles.css:21021-21035`), which satisfies `050` D3's "no silent
      no-phone". The frozen state appears in **no** capture in the 98-screen read (digest P7, §6
      Q3), so the sticky offset and the divider are **our design, marked inference**, not an
      adoption.
- [ ] **C2 — The thirteen behaviours already at parity each carry a permanent assertion that goes
      red under its own negative control.** **Today: observed red — five of them have no assertion
      at all.** The footer's zero-row skip is a bare `if (rows.length === 0) return`
      (`src/views/table-renderer.ts:801-804`) with the 44px phone floor in one rule
      (`styles.css:8486-8488`) and nothing reading either; the header's type icon, label and
      multi-sort ordinal are unasserted (`src/views/table-renderer.ts:632-647`); the inline
      multi-select chips and their measurer — badges plus 4px gaps plus 20, capped at 560px —
      are unasserted (`src/views/cell-renderer.ts:470-498`, `src/views/column-width.ts:118-125`);
      the per-option pill colour is unasserted (`src/views/cell-renderer.ts:453-468`); and the
      conditional row tint paints through `tr.db-conditional-format > td`
      (`styles.css:1317-1319`) with no row reading it. Notion evidence for each: `6055725d`,
      `101392c7`, `20a95974` (footer); `19745d87`, `35c64a84`, `3b3c3c26` (header); `21d71e5f`
      (chips); `8d6dcf3b`, `6673816d` (pills); `142cef4e`, `b184ec4c` (conditional colour). Done is
      five rows on an existing lane, each **observed red** under a named control — remove the
      zero-row return, drop the floor rule, stack the chips in a block container, force one pill
      colour, delete the `td` paint rule — and green on the tree.
- [ ] **C3 — A date value can carry an end.** Notion's date picker offers an End date and renders
      the range in the cell (`bd482935`). **Today: observed red — there is no end or range concept
      anywhere.** All 546 lines of `src/views/record-surface/cell-editor-date.ts` contain no end
      field, and `renderDate` formats exactly one value
      (`src/views/cell-renderer.ts:537-541`). Done is: an optional end value on the date, an End
      date row in the picker, a range display form, and a cell that renders both ends. Timezone and
      Remind rows are **out** — Notion-service features with no Obsidian analogue.
- [ ] **C4 — The type picker offers every type the four registries agree on, and they agree.**
      Notion shows Person, URL, Email, Phone and a set of audit types
      (`af7a18b0`, `7f2dbda0`, `3b3c3c26`) that our thirteen do not carry. **Today: observed red at
      thirteen, across four registries that must move together** — the `ColumnDef["type"]` union
      (`src/data/types.ts:82`), `PROPERTY_TYPES` (`src/views/record-surface/type-picker.ts:28-32`),
      `PROPERTY_TYPE_ICON_NAMES` (`src/views/property-type-icon.ts:32-46`) and
      `COLUMN_TYPE_LABELS` (`src/data/column-types.ts:135-151`), with the grouped Basic/Options/
      Advanced submenu slicing `PROPERTY_TYPES` at 6 and 9
      (`src/views/column-menu.ts:262-264`) so a bare append lands in the wrong group. Done is
      eighteen rows with one glyph each in the type popover, all four registries in step, and the
      slice boundaries corrected in the same change. **Gated on ADR-007** — whether a picker row
      ships before the data type behind it exists is the operator's call, and the alternative
      (defer the whole item) is named there.
- [ ] **C5 — The resize handle is visible before you need it.** Notion's grip becomes visible on
      column selection (`d53b3912`). **Today: observed red, and worse than the research reported.**
      `.db-resize-handle` (`styles.css:5655-5663`) is a 4px absolutely-positioned strip with
      `cursor: col-resize` and **no background declaration and no hover rule anywhere in the
      file** — it paints nothing at any time, so the cursor change is the only feedback the column
      edge gives. Done is a 2px token-derived line whose computed background changes on `th:hover`,
      clearing D5's contrast bar in both themes.
- [ ] **C6 — Vertical lines are a view choice.** Notion carries a *Show vertical lines* switch in
      the table's view options (`d3acf726`). **Today: observed red — borders are
      unconditional.** `.db-table th, .db-table td` declares `border-right: 1px solid
      var(--db-border-subtle)` with no gate (`styles.css:5414-5421`, the declaration at `:5416`).
      Done is a `ViewConfig` switch driving a container class under which **no `td` computes a right
      border**, with the switch on leaving today's computed borders unchanged. The first read of
      this item also owes an answer on the sixth P10 toggle, *Show data source title*, which the
      loop deliberately did not guess at.
- [ ] **C7 — An empty visible property reads as empty in the peek.** Notion writes the word in its
      page view (`050083af`). **Today: observed red — it renders as nothing.**
      `renderValue` assigns `valueEl.textContent = text` for a non-option value
      (`src/views/table-record-peek.ts:357-360`), and `text` is `""` for an empty property, so the
      row shows a label and a blank. Done is a muted placeholder in the **peek only**. **Table cells
      are unchanged by design** and changing them would break parity rather than create it: Notion's
      own table cells render blank, exactly as ours do
      (`src/views/cell-renderer.ts:263-264`, `styles.css:6766-6771`), and `050083af` is page-view
      only.
- [ ] **C8 — The add-row affordance names what it adds.** Notion derives the noun from the data
      source — `+ New page` on one board (`19745d87`), `+ New task` on another (`e33466b4`).
      **Today: observed red — the string is fixed.** `src/views/table-renderer.ts:982` builds
      `` `+ ${t("toolbar.new")}` ``. Done is `+ New <noun>` where the noun is derivable, today's
      string where it is not, and the key in all three locales. **Gated on ADR-006** — where the
      noun comes from is a product decision and the operator's.
- [ ] **C9 — The operator reads the refined table on a device, in both themes.** Three things no
      headless harness in this repository can answer. **The frozen column mid-scroll on iOS**:
      WebKit's sticky-inside-table behaviour is not something the render harness stands in for, and
      no capture of a frozen state exists to compare against. **Every new colour in dark theme**:
      zero of the 102 opened screens are dark, so the divider, the handle line and any tint are
      unverified there by construction. **The title-cell affordance at 390px**: Notion lets its OPEN
      pill overlap the tail of a long title rather than truncating first (`19745d87`, `35c64a84`,
      `d9d61160`), while ours is a button inside a phone `td` capped at 60vw with ellipsis
      (`src/views/table-record-peek.ts:86-114`, touch branch `:102-104`;
      `styles.css:21029-21035`) — whether it steals title width, overlaps the ellipsis or collides
      with the link hit area **was not measured by the loop and no number is guessed here**; the
      task owes the threshold. **Operator-owned. No agent ticks this row.**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Notion screen digest | Done | `../053-toolbar-and-view-controls/notion-screens-digest.md` — 98 screen ids, patterns P1-P12, a divergence table, an Anytype cross-read and six open questions, written by an image-capable analyst because GLM cannot read images |
| Deep-research loop run | Done | `/deep:research:auto`, 5 of 5 iterations, `stopPolicy: max-iterations`, lineage `glm-devpass-table` on `llmgateway/glm-5.3-flash` at `reasoningEffort: max`, 26 merged findings. `../053-toolbar-and-view-controls/research/` |
| Opus synthesis | Done | This packet, plus the parent `roadmap.md` §5.A row, the parent `goal.md` reserved-children row and the pointer in `053`'s `tasks.md` |
| Level chosen | Done | `recommend-level.sh --loc 950 --files 15` → Level 2, **50/100**, confidence **90%**, phase score **10/50** against the 25 threshold — a standard child, not a phase parent. **Raised to Level 3 on judgment**, which the kit's own rule asks for when judgment reads higher: a persisted `ViewConfig` field with a serialise/parse contract, a type addition that must move four registries in step, two viewports, and three device-only reads no harness can stand in for |
| Red-first anchors | Done | Every criterion verified **observed red** against the tree at `94f03c88` during synthesis rather than carried from the loop's report; the `file:line` for each is in `acceptance-criteria.md` |
| Implementation | Not started | No code touched by this packet |

### Deviations and findings

| Item | Note |
|------|------|
| **The research's second-ranked item landed on `main` before this packet opened** | The loop ranked the wrap-off row-height defect second and built its Phase B around it. `41513bd3` and `1a2c7e00` closed it: the view switch became the gate (`resolvesToWrappedCell`, `src/data/column-types.ts:425-427`), the phone stylesheet stopped out-specifying the wrapping class (`styles.css:21029-21047`), and a markdown cell's own `<br>` breaks collapse when the cell resolves to clip. Phase B is **superseded, not carried**, and ADR-002 records both the supersession and the corrected resolution rule — the loop cites ADR-004's original `col.wrap ?? config.wrapText`, under which a column always won, and that is no longer what the tree does. |
| **The digest was wrong once, and the loop caught it** | §4 P9 read conditional row colour as having no match here. It ships: `applyConditionalFormat` sets `--db-conditional-format-bg` on the `tr` (`src/data/conditional-formatting.ts:168-206`), wired at `src/views/table-renderer.ts:85`, `:866` and `:911`, and painted by `tr.db-conditional-format > td` (`styles.css:1317-1319`). The digest's grep pattern could not match the symbol names in use. This is the general lesson D2 carries: **an absence grep is a claim, not evidence.** |
| **Two verification debts closed at synthesis, and a third registry surfaced** | The loop flagged `types.ts:82` and `property-type-icon.ts:32-46` as second-hand from the digest and unverified. Both are exact — the union has thirteen members, the icon map has thirteen entries at those exact lines — but the file is `src/views/property-type-icon.ts`, not under `record-surface/`. Reading them found `PROPERTY_TYPES` (`src/views/record-surface/type-picker.ts:28-32`), the one list three sites were consolidated onto, and `COLUMN_TYPE_LABELS` (`src/data/column-types.ts:135-151`). C4's threshold counts four registries because of it, and the grouped submenu's hardcoded slice boundaries at 6 and 9 (`src/views/column-menu.ts:262-264`) mean a bare append lands in the wrong group. |
| **One red is sharper than reported** | The loop wrote the resize handle as *"paints nothing until hover"*. It paints nothing at all: `.db-resize-handle` (`styles.css:5655-5663`) has no background declaration and no `:hover` rule anywhere in the stylesheet. The threshold is unchanged; the red value is worse and is stated as measured. |
| **A loose end with no visual change proposed** | `.db-numeric-value` is stamped on number cells (`src/views/cell-renderer.ts:318-321`, `:419`) and **no stylesheet rule matches it**. Numbers are left-aligned by inheritance and at parity with `a9f53856` by accident, which is `../design-system.md` §10's "class in source that nothing styles" pattern — a `text-align: left` assertion would pass today for the wrong reason. Recorded, not scheduled: it belongs to whoever next opens that block, either as a deliberate one-line rule or as a documented hook. |
| **What the loop declined to build, and why it matters that it is written down** | Fourteen approaches were eliminated with evidence, and three of them would have looked like progress: re-mapping our `currency` and `datetime` onto Notion's fold-into-Number/Date model (deletes two landed types for a cosmetic unification), adopting Notion's flat type list over our Basic/Options/Advanced grouping (worse for thirteen-plus types), and changing empty **table-cell** rendering to Notion's word placeholder (Notion's own table cells are blank — it would break parity, not create it). |
| **Two debts stay open and are named rather than absorbed** | Create-on-type inside a table cell is unresolved: our option editor accepts an `initialSearch` (`src/views/cell-renderer.ts:916-927`), Notion creates on type (`cbf001e4`), and `record-surface/cell-editor-option.ts` sat outside the loop's bounded read list, so this is **verification debt, not a finding of absence**. The column manager's title-eye disabled state against `9867cb76` is the second — the digest asserts the panel matches, but not that specific state. |
<!-- /ANCHOR:log -->
