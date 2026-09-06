---
title: "Acceptance Criteria: Notion Dropdown, Menu and Picker Refinement"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "063 acceptance criteria"
  - "notion dropdown closure gate"
  - "trailing check criterion"
  - "sheet escalation criterion"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/063-notion-dropdown-refinement"
    last_updated_at: "2026-09-07T00:30:00Z"
    last_updated_by: "implementation-session"
    recent_action: "Implemented T001-T017 (T008 stays [B]); 14 of 16 criteria Met; npm run gate 26 green"
    next_safe_action: "Operator closes AC-011"
    blockers:
      - "AC-007 is blocked on 052's open T008 and T009"
      - "AC-011 is the operator's and is never ticked by an agent"
    key_files:
      - "src/views/dropdown-field.ts"
      - "src/views/option-color-picker.ts"
      - "styles.css"
      - "tools/live/constructed-state-assertions.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-063-acceptance"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Which surfaces does the measured cramped condition actually select — the operator's own read (AC-011) answers this"
    answered_questions:
      - "The trailing check is a landed ruling, not a new decision"
      - "The colour picker is a labelled list, ruled 2026-09-06 ~19:08 (ADR-004)"
      - "The cramped condition is an upfront estimate from the family's own row/search/section tokens, not a full pre-render (T006)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Dropdown, Menu and Picker Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/063-notion-dropdown-refinement
**Level:** 2
**Status:** Implemented — 14 of 16 criteria Met; AC-007 Unmet (blocked on `052`'s open T008/T009); AC-011 is the operator's alone
**Date:** 2026-09-07
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every row's Verification cell names the command or artifact that decides it. Where a row records a
value observed on today's tree, that value was read on `origin/main` at `c9966433`, after the
rebase, not carried over from the research loop's pre-rebase citations.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a dropdown popover built by the real renderer, When an option row is emitted, Then `.db-dropdown-option-check` is that row's last element child | `tools/live/constructed-state-assertions.mjs` `constructed-dropdown`, extended marker, `$?` read. Red today: `dropdown-field.ts:349` creates the check first | Met | - |
| AC-002 | REQ-001 | Given each of the four `.db-dropdown-option` grid variants, When the row renders, Then the check occupies the trailing 16px track at G14's right inset | Read `styles.css:3237-3241`, `:3258-3260`, `:3262-3264`, `:3266-3268`; re-taken `constructed-dropdown` capture opened; pixel read owed to an image-capable leg | Met | - |
| AC-003 | REQ-001 | Given the flip, When the keyboard moves the highlight, Then `aria-selected` and `aria-activedescendant` behave exactly as before | `npx vitest run src/views/dropdown-field.test.ts`, plus `dropdown-field.ts:539` still querying by class not position | Met | - |
| AC-004 | REQ-004 | Given a desktop dropdown whose anchored placement falls toward `minWidth: 180` or whose panel reaches `owned-menu.ts:360`'s height cap, When it opens, Then it presents as a sheet with a dedicated button rather than as a cramped popover | A test case in `src/views/dropdown-field.test.ts` asserting the branch, red today because `dropdown-field.ts` has no such branch (0 escalation paths) | Met | - |
| AC-005 | REQ-004 | Given the escalated sheet, When it is open, Then `044`'s sheet-grammar pairs and `048`'s stacking model are still green | `npm run gate`, `$?` read, `sheet-grammar` lane row green | Met | - |
| AC-006 | REQ-005 | Given any desktop dropdown, including one the escalation converted to a sheet, When it opens, Then a search input is present and focused, and the phone sheet's `> 8` count gate is unchanged | `dropdown-field.ts:228` unchanged in its phone branch; a test asserting the focused input on the escalated surface | Met | - |
| AC-007 | REQ-002 | Given a submenu parent row whose child carries a current value, When the row renders, Then `.db-menu-item-current` appears before `.db-menu-item-chevron` | A menu-row assertion over the four rows at `column-menu.ts:128`, `:144`, `:160` and `toolbar-renderer.ts:1312`. Red today: 2 of 6 such rows carry a value | Unmet | - |
| AC-008 | REQ-003 | Given the date picker's three relative presets, When the picker opens, Then each carries the date it resolves to in the secondary-text role, the picker is still 252px wide, and no tap target is below 28px desktop / 44px phone | Read `date-value-picker.ts:157-171` and `popover-host.ts:229-233`; presets block height measured before and after. Red today: 0 of 3 | Met | - |
| AC-009 | REQ-006 | Given the whole packet, When `npm run gate` runs, Then it exits 0 with the extended `constructed-dropdown` row green, having been observed red first | `npm run gate`, `$?` read; T001's red recorded in `tasks.md` with its own exit status | Met | - |
| AC-010 | REQ-007 | Given `052`'s two stale completion-criterion "Today:" texts, When they are refreshed, Then they describe the landed tree and no checkbox anywhere changed state | `git diff` on `052/goal.md` showing prose-only changes; no `- [ ]` → `- [x]` and no reverse | Met | - |
| AC-011 | REQ-004 | Given the operator, When they open dropdowns, menus and pickers on iOS and on desktop, Then they read the family as refined and the escalation as selecting the surfaces they called cramped | The operator's own report. Never ticked by an agent | Unmet | - |
| AC-012 | REQ-008 | Given the option colour picker on desktop, When it opens, Then it emits sixteen `.db-dropdown-option` rows and zero `.db-color-picker-swatch` elements, each row carrying a 16px leading colour dot, the colour's visible name, and `.db-dropdown-option-check` as its last element child on the current one only | `rg -n 'db-color-picker-swatch' src styles.css` returns 0 hits, plus a case in `src/views/option-color-picker.test.ts`, a file this packet creates, counting the rows and asserting the check's position. Red today: 16 swatches, 0 rows, check drawn inside the swatch (`option-color-picker.ts:72-88`) | Met | - |
| AC-013 | REQ-008 | Given the picker's geometry, When it is measured, Then the desktop row is at least 30px tall and the panel resolves to 224px, and the phone row is at least 44px tall — the family's own floors, not new numbers | Read `popover-host.ts` `SWATCH_PICKER_POPOVER` (`minWidth`/`preferredWidth`/`maxWidth` all 224, was 124 at `:236-240`) and the computed box of a rendered row against `styles.css:3245` (30px) and `:3188` (44px). Anytype's measured 28px row is declined with its reason in ADR-004's Constraints | Met | - |
| AC-014 | REQ-008 | Given the phone sheet holding sixteen rows, When it opens, Then the sheet does not exceed the grammar's existing `90svh` cap, the list scrolls inside it rather than the sheet growing, and the current colour's row is scrolled into view | A case in the same new `src/views/option-color-picker.test.ts` asserting the scroll-into-view call, plus the re-taken `constructed-option-color-picker-mobile-*` pair opened and read. 16 x 44px is 704px before chrome, so on a 844px viewport the cap binds and the assertion is not vacuous | Met | - |
| AC-015 | REQ-008 | Given each of the sixteen `OPTION_COLORS`, When its row renders, Then the visible label resolves through `t()` and no raw enum value reaches the DOM as text | A case iterating `OPTION_COLORS` and asserting each label differs from the raw key in at least one shipped locale, plus `rg -n 'title: color' src/views/option-color-picker.ts` returning 0 hits (1 today, at `:79`) | Met | - |
| AC-016 | REQ-008 | Given `048`'s registered pair for this picker, When the shape changes, Then both halves are re-taken and the phone scenario photographs the sheet rather than the desktop popover | `npm run screenshots:verify` `$?` read, then the four PNGs opened and looked at. Red today in a second way: `field-option-color-picker-mobile-light.png` is shape-identical to its desktop twin, so the registered phone capture shows no sheet at all | Met | - |

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

**Closeable:** No — two rows outside this leg's authority to close

Fourteen of sixteen criteria are `Met`, evidenced in `tasks.md` (T001, T004-T007, T009, T010,
T014-T017) and confirmed by `npm run gate` (26 green, 0 red). The two that remain:

- **AC-007** stays `Unmet`. It waits on `052`'s T008 and T009, which own the caller files
  (`column-menu.ts`, `toolbar-renderer.ts`); re-checked against the rebased `origin/main` at the
  start of this implementation pass, both are still open. Not waived — recorded as blocked.
- **AC-011** is the operator's alone and cannot be closed by an agent. AC-016's capture defect
  (the registered phone pair not photographing the phone grammar) is fixed as part of T017; the
  operator's own read of the family is what AC-011 still asks for.
<!-- /ANCHOR:closure -->
