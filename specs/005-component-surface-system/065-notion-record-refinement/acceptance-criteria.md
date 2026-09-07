---
title: "Acceptance Criteria: Notion Record Refinement"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "waiver adr"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/065-notion-record-refinement"
    last_updated_at: "2026-09-07T01:30:00Z"
    last_updated_by: "implementation-session"
    recent_action: "AC-001 through AC-009 and AC-011 through AC-015 all Met; AC-010 stays Unmet (T008 deferred)"
    next_safe_action: "AC-012 is the operator's device read; nothing else is agent-schedulable"
    blockers:
      - "AC-012 is the operator's device read and is never ticked by an agent"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/record-surface/property-row.ts"
      - "src/views/column-manager-renderer.ts"
      - "src/views/record-detail-panel.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-065-acceptance"
      parent_session_id: null
    completion_pct: 87
    open_questions: []
    answered_questions:
      - "The empty-fields home is the existing showEmptyFields switch, resolved in the implementing leg"
      - "ADR-001 to ADR-004 are settled by landed Anytype rulings and need no operator call"
      - "AC-009 is unblocked: the add-property entry is Notion's trailing row (operator 19:05)"
      - "The hidden group holds view-hidden columns and carries Notion's full row grammar (operator 19:05)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Record Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/065-notion-record-refinement
**Level:** 2
**Status:** Draft
**Date:** 2026-09-06
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every Verification cell names the check **and** the value that check reads today, so the row records
what has to change rather than only what has to pass. The observed reds were re-derived against this
tree at `37207535` on 2026-09-06, after `3f4d40ac`, `9207e8e8` and `de67f816` landed.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a board card with an empty `select` field, When the card renders, Then the field reads "Select option" rather than "Empty" | `tools/live/render-assertions.mjs` over the board-card scenario. **Observed red:** `src/views/board-renderer.ts:754-757` returns `t("common.empty")` for every non-checkbox format. Digest screens `16ddd22c`, `bf2171ff`  **Observed green:** `board-renderer.ts`'s `getEmptyDisplayValue` now delegates to `getPropertyEmptyPrompt`; the constructed-record-detail/board captures show "Select option" not "Empty" (visually confirmed). `npx vitest run` green. | Met | - |
| AC-002 | REQ-001 | Given a board card with an empty `multi-select` and an empty `checkbox`, When the delegation lands, Then the multi-select still receives a one-element array and the checkbox still receives `false` | Unit test mirroring `src/views/record-detail-panel.ts:514-519`. **Observed red:** the shapes are produced by a second, private path today  **Observed green:** the delegation mirrors the shape exactly; `property-row.test.ts` and the card-field-renderer suite pin the multi-select array and checkbox `false` cases unchanged. `npx vitest run` green. | Met | - |
| AC-003 | REQ-002 | Given a `number`, `date`, `datetime`, `currency`, `text` or `files` field with no value, When it renders on the record sheet or a board card in either locale, Then it carries a verb+noun prompt and never the string "Empty" | `tools/live/constructed-state-assertions.mjs` plus the locale walk in `tasks.md` CHK-022. **Observed red:** `src/views/record-surface/property-row.ts:286-291` returns `null` for every format outside the three ruled ones  **Observed green:** `getPropertyEmptyPrompt` covers all ten editor-bearing formats — `status` was added during landing verification, which measured it still reading "Empty" on the live record sheet at 402px and 1440 because the first pass stopped at the nine named here; `property-row.test.ts`'s "names the action for every other format with an editor" case pins all six new formats in English; both locale tables carry the six new keys. `npx vitest run` green. | Met | - |
| AC-004 | REQ-003 | Given the `constructed-record-detail` scenario at desktop width, When a property row renders, Then the label's computed `font-size` equals the value's | `tools/live/constructed-state-assertions.mjs`, a computed-style read. **Observed red:** `styles.css:10300-10306` sets the label to `var(--font-smaller)` and the two computed sizes differ  **Observed green:** the desktop label's `font-size` declaration was removed; nothing else sets it on the desktop selector, so it inherits the same value the row's value element does. `constructed-record-detail` captures opened and read both themes, both devices. `screenshots:verify` exit 0. | Met | - |
| AC-005 | REQ-003 | Given the phone record sheet, When AC-004 lands, Then the phone label's computed `font-size` is unchanged from the value T001 recorded | The same lane run reads both arms. **Guard:** `styles.css:10459-10468` holds the iOS 16px input-zoom floor A2 does not reopen  **Observed green:** the phone arm's own more-specific selector (`.db-record-detail-panel.db-mobile-bottom-sheet .db-record-detail-field-label`) still sets `--db-font-base` unconditionally and wins by specificity; untouched by the desktop-only edit. | Met | - |
| AC-006 | REQ-004 | Given a single-select value on the record sheet or a board card, When it renders, Then it carries a `status-color-text-*` class and no `.status-badge` fill, while multi-select keeps its chips | `tools/live/render-assertions.mjs` and the record-sheet assertions. **Observed red:** `src/views/record-surface/property-row.ts:76-101` fills both kinds, and `renderOptionValue` at `:255` has zero production consumers — only `property-row.test.ts` calls it  **Observed green:** `renderPropertyValue`'s new `splitOptionValue` flag routes select/status to `renderOptionValue`'s text branch and multi-select to its chip branch; both consumers (`board-renderer.ts`, `record-detail-panel.ts`) pass the flag. `card-field-renderer.test.ts`'s new suite pins both branches through the real `renderCardField` entry. `npx vitest run` green. | Met | - |
| AC-007 | REQ-004 | Given every stored option colour, When the split lands, Then each foreground/background pair measures at or above 4.5:1 | `tools/screenshots/scan-option-tones.mjs`, already in `npm run gate`. This is A2's C9 floor, not a new one  **Observed green:** `scan-option-tones.mjs` (`option-tones` lane) green in the full 26-lane gate; the split reuses the same `status-color-*`/`status-color-text-*` tokens A2 already validated. | Met | - |
| AC-008 | REQ-005 | Given the add-property picker, When a user types "Due Date" and selects `date`, Then a `date` column labelled "Due Date" is created in one pass | Unit test over the picker wiring or `src/views/database-view.ts:5088`'s `initialLabel` path. **Observed red:** `src/views/column-manager-renderer.ts:200` calls `createProperty(type)` with no label; `:201` is the only path using the query and it forces `text`. Digest screen `1589e7c8`  **Observed green:** `onSelect` reads `picker.searchInput.value` at click time and forwards it as `createProperty(type, query)`. `column-manager-renderer.test.ts`'s new suite pins this directly (red confirmed against the pre-fix call, then green) plus the create fall-through unchanged. `npx vitest run` green. | Met | - |
| AC-009 | REQ-006 | Given the record sheet, When it renders, Then a muted "+ Add a property" row sits below the last field and above the hidden group, opens the search-first picker, and measures at or above 44px on the phone sheet | `tools/live/touch-targets.mjs` plus a constructed scenario. **Observed red:** zero add affordances on the record sheet; `src/views/record-detail-panel.ts` imports nothing from `add-property-row.ts`. **Unblocked** — ADR-008 Accepted 2026-09-06 19:05, operator verbatim *"Trailing '+ Add a property' row"*; sequenced after AC-013  **Observed green:** `RecordDetailActions.addProperty` renders `.db-record-detail-add-row` between the field list and the hidden group; `database-view.ts`'s `openRecordAddPropertyPicker` opens the same search-first picker the column manager uses. `.db-record-detail-add-button` carries `min-height: var(--db-sheet-row-min-height, 44px)`. `constructed-record-detail*` captures opened and read. | Met | - |
| AC-010 | REQ-007 | Given this program's docs and any user-facing label naming a record shell, When they are read, Then the three shells are Side peek, Center peek and Full page | A read of the changed files. Zero code; `006`'s placement ruling untouched. Digest screen `0cb59457`  **Deferred, not met.** `tasks.md` T008 records the reason: the live setting's two-way label pair is not the digest's three named shells, and the third shell is `006`'s own placement surface, outside this leg's file group. No waiving ADR exists for this row, so it stays Unmet rather than Waived. | Unmet | - |
| AC-011 | REQ-008 | Given ADR-005, ADR-006, ADR-007 and ADR-008, When the operator reads them, Then each carries a threshold and a red-first check, and none of its code has been written | A read of `decision-record.md` against `git diff` — no source file touched by a gated item  **Observed green:** ADR-005, ADR-006 and ADR-008 converted directly into T012/T013/T007's implementation; ADR-007 stays Deferred with no code written for the cover/icon strip. `git diff` touches no cover, icon or description-strip surface. | Met | - |
| AC-012 | — | Given a device build, When the operator opens a record on iOS and on desktop, Then they report the refinement as landed | The operator's own read. **Never ticked by an agent**  Left for the operator; not ticked by this session. | Unmet | - |
| AC-013 | REQ-009 | Given a column hidden in view config, When the record sheet renders, Then that column appears in the sheet's hidden-properties group and is counted there, and an empty but visible field does not | `tools/live/constructed-state-assertions.mjs`, reading the group's **membership** rather than its count. **Observed red:** the sheet's group holds empty fields (`src/views/record-detail-panel.ts:384-393`) while the peek's holds view-hidden columns (`src/views/table-record-peek.ts:246-248`); a column hidden in view config never reaches the sheet at all. ADR-006, operator 19:05 verbatim *"View-hidden columns, like Notion and the peek"*. Digest screens `cc8b241a`, `7ffa073f`  **Observed green:** `OpenRecordDetailOptions` gained `allColumns`; the hidden group's population is now `allColumns` minus a locally-owned `localVisibleKeys` set (the peek's own complement-of-`visibleKeys` shape), with the same empty-derived/read-only exclusion. `render-assertion-harness.ts`'s `recordDetailAssertions` gained a membership-shaped check; `sheet-grammar.mjs`, `render-assertions.mjs`, `verify-placement.mjs` all exercise the real path and pass. | Met | - |
| AC-014 | REQ-010 | Given the hidden-properties group, When it renders, Then every row carries a drag handle, type icon, name, eye toggle and chevron; the Shown and Hidden sections each carry their own bulk link; the Hidden section is absent while nothing is hidden; the count stays on the entry row; the title row's eye is disabled | `tools/live/constructed-state-assertions.mjs` over the group in both states, plus `tools/live/touch-targets.mjs` for the new phone rows. **Observed red:** zero eye controls inside `db-record-detail-hidden-group`; the group is a single disclosure (`src/views/record-surface/hidden-properties.ts:44-73`). ADR-005, operator 19:05. **Depends on AC-013** — an eye in a group of empty fields toggles nothing meaningful  **Observed green:** every hidden-group row now carries a drag handle, type icon, name, an eye button (disabled on the title row only) and a chevron; the group splits into Shown/Hidden sections each with a bulk link; the Hidden section renders only when non-empty; the disclosure itself always renders. `hidden-properties.test.ts` rewritten, 6 cases, `npx vitest run` green; `render-assertion-harness.ts` gained matching structural checks. | Met | - |
| AC-015 | REQ-011 | Given the property-visibility list, When a name is typed into its search field, Then the rows filter to name matches with every eye state untouched, and clearing restores the full list | A unit or constructed-state assertion over the filter. **Observed red:** zero `input` elements inside the column manager's list — its header carries only the select-all toggle (`src/views/column-manager-renderer.ts:222-235`), while the add-property picker has the input one file away (`src/views/record-surface/add-property-row.ts:58-60`). Sweep S1; digest screens `9867cb76`, `2f52d1bc`, `01cde7f6`  **Observed green:** a new `.db-column-manager-search` input filters rows by toggling `.db-column-manager-row-search-hidden`, never touching a row's checkbox. `column-manager-renderer.test.ts`'s new suite pins the filter and the clear-restores-all case. `sheet-grammar.mjs`'s overflow sweep caught the input overflowing the 390px sheet by 2-4px before `box-sizing: border-box` was added — a genuine red from the repo's live tooling. Landing verification then measured the filter itself and found it inert: `.note-database-container .db-column-manager-row-search-hidden` tied `.note-database-container .db-column-manager-row`'s own `display: grid` on specificity and lost on source order, so a query toggled the class on rows that stayed visible (`display: grid` measured at both 402px and 1440). Both classes now sit on one selector; the same measurement reads `none` after, `grid` for the one match. The unit suite passed throughout because it asserts the class, not the computed display. | Met | - |

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

**Closeable:** No

Thirteen of fifteen rows are `Met`, each with the command and the observed value that closed it.
Two rows stay `Unmet`: AC-012 is the operator's own device read and is never ticked by an agent;
AC-010 is T008's deferral (the display-mode vocabulary rename), left `Unmet` rather than `Waived`
because no ADR backs a waiver for it — `tasks.md` names the reason beside the deferred task instead.
The full 26-lane gate is green, `npx tsc --noEmit`/`npm run build`/`npx vitest run` all exit 0, and
`npm run screenshots:verify` exits 0 against the fully recaptured manifest. This statement is
rewritten when the packet closes, not before.
<!-- /ANCHOR:closure -->
