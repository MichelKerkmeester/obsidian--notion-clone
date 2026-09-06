---
title: "Goal: Notion Dropdown, Menu and Picker Refinement"
description: "The durable directive for refining 052's dropdown, menu and picker family against Notion's screen digest, and the thresholds that decide when the refinement is closed."
trigger_phrases:
  - "063 goal"
  - "notion dropdown refinement goal"
  - "trailing check goal"
  - "dropdown sheet escalation"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/063-notion-dropdown-refinement"
    last_updated_at: "2026-09-06T19:40:00Z"
    last_updated_by: "option-colour-picker-research-session"
    recent_action: "Added the eighth completion criterion from the ~19:08 colour-picker ruling"
    next_safe_action: "Run T001, the red-first DOM-order assertion, and read its exit status"
    blockers:
      - "ADR-005 is Proposed and operator-owned"
      - "styles.css edits are serialized by the parent's CSS lane"
      - "dropdown-field.ts and menu-row.ts are 052's file group, taken one leg at a time"
      - "T005 and T006 ride 052's open T008/T009 legs and do not open those files alone"
    key_files:
      - "src/views/dropdown-field.ts"
      - "src/views/menu-row.ts"
      - "src/views/date-value-picker.ts"
      - "src/views/popover-host.ts"
      - "src/views/option-color-picker.ts"
      - "styles.css"
      - "tools/live/constructed-state-assertions.mjs"
      - "specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/research/research.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-063-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does a colour swatch carry a visible label, or do the accessible name and the check icon suffice"
      - "Does E3's red-plus-trash rule take a carve-out for rows that remove structure without destroying content"
      - "Which anchored dropdown surfaces the operator reads as cramped, and at what measured width or height"
    answered_questions:
      - "The trailing check is a landed ruling (G14, ADR-005) that only dropdown-field.ts still lags"
      - "Every desktop dropdown is a combobox and the count gate is the phone's alone (ADR-006, a952e5e7)"
      - "The colour picker's grid is settled: G15 kept the grid and its accessible-name clause has landed"
---
# Goal: Notion Dropdown, Menu and Picker Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Refine `052`'s dropdown, menu and picker family against Notion's screen digest —
flip the one selection check that still renders leading, make submenu parent rows self-describing,
give the date presets their resolved dates, and give a cramped anchored dropdown a sheet to escalate
into — without un-ticking a measured row or overturning a landed Anytype ruling.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Additive only.** Inherited from the parent's D15. This packet may add a criterion, a task or an ADR. It may not un-tick a measured row, rewrite a landed ruling, or reopen a settled value. Where a Notion finding contradicts a ruling, the ADR names both readings and stops. |
| D2 | **Red first, with a number.** Every criterion carries a threshold and a value observed failing on today's tree, with the command named and `$?` read directly. Inherited from the parent's D2. |
| D3 | **Values come from our own tokens.** `design-system.md` §12: Notion is the visual target and is not a source at all. The digest's geometry is a qualitative estimate by its own method note, and no threshold here derives from one. |
| D4 | **One leg, one file group.** Inherited from `052`'s D6. The check flip is its own leg; the trailing values ride `052`'s open T008/T009 rather than forking them; the cell inline editors stay `054`'s under `052`'s D8. |
| D5 | **A pixel claim owes a pixel read.** Any assertion about rendered geometry carries a "pixel read owed" marker for an image-capable leg, per the `~18:20` ruling in `roadmap.md` §6A. The capture harness renders fixture markup, not the real renderers (`repo-rules/screenshot-currency.md` §3), so a harness-green check is not a device answer. |
| D6 | **The digest is the only Notion source.** 101 screens, patterns N1-N12. No PNG was read by the loop that opened this packet, and none is read to close it. |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes
(objective, a decision, the binding table, a criterion), resend the full text
of this file in chat so the operator can update their copy. A child goal change
that alters a parent decision or criterion is an amendment to the parent: apply
it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---


<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row carries its threshold, the value observed red on today's tree, the Notion screens that
motivate it, and our own `file:line`.

- [ ] **The dropdown popover's selection check is the row's last element child, sitting in a
      trailing 16px track.** **Today: RED, measured.** `src/views/dropdown-field.ts:349` creates the
      check span **first** — check, then icon, then label, then swatches — and
      `styles.css:3237-3241` fixes that order structurally with
      `grid-template-columns: 16px minmax(0, 1fr)`, with the same leading track in the three
      variants at `styles.css:3258-3268`. Both references rule trailing: Anytype **G14** ("the
      primitive's check wins and it is trailing, at the 16px right inset") and Notion **N2**, whose
      three selection indicators are all trailing (`ac33be32`, `cf573f99`, `53858386`, `5d02e087`,
      `5f81b365`). Two of the three row families already comply
      (`cell-editor-relation.ts:153-154`, `cell-editor-option.ts:532-534`); only this one lags, and
      no pending `052` task opens the file. Threshold: the check is the last element child in the
      constructed dropdown popover, the trailing track is 16px, and `aria-selected` /
      `aria-activedescendant` behaviour is unchanged.
- [ ] **Every submenu parent row whose child carries a current value renders that value before its
      chevron.** **Today: RED, 4 of 6.** `menu-row.ts:107-119` already builds the slot and pushes
      the chevron right; two production rows use it (`column-menu.ts:197`,
      `embedded-database-renderer.ts:2594`, both the wrap-mode row) and four do not —
      `column-menu.ts:128` (Change type), `column-menu.ts:144` and `:160` (Number display style),
      and `toolbar-renderer.ts:1312` (Change view type). Notion shows the same slot twice
      (**N1** `213bed5` "Theme Dark ›", `52348672` "Property visibility 3 ›"; **N9** count badges),
      and our own `052/design-trueup.md` §4 M7 flagged it against Anytype first. Threshold: those
      four rows carry their current value; a row whose child has no current value keeps the bare
      chevron; `menu-row.ts` is not changed.
- [ ] **Each relative date preset carries the date it resolves to.** **Today: RED, 0 of 3.**
      `date-value-picker.ts:157-171` builds Today, Tomorrow and Next week as bare
      `.db-date-preset` buttons carrying a label and nothing else. Notion pairs each relative
      preset with its literal (`cfca14fb`: "In an hour / In a day / In a week", each with a
      date-time subline). Threshold: all three presets carry a resolved literal in the
      secondary-text role; the picker's width role stays the hard 252 at
      `popover-host.ts:229-233`; no preset's tap target drops below the 28px desktop floor or the
      44px phone floor (`design-system.md` §9); the height growth is measured before and after.
- [ ] **A desktop dropdown that cannot be shown comfortably as an anchored popover presents as a
      sheet opened by a dedicated button.** **Added 2026-09-06** from the operator's ruling.
      **Today: RED, 0 escalation paths.** `dropdown-field.ts:421` positions every desktop dropdown
      with `{ preferredWidth: 280, maxWidth: 360, minWidth: 180, gap: 6 }` and has no branch that
      can present it any other way; the sheet branch at `dropdown-field.ts:224` is phone-only.
      Notion carries both shapes and moves between them — a sheet with a `Done` header
      (`9acbba50`), a right-docked panel where the popover would be cramped (`1d99acb0`,
      `50d73158`), and an explicit escalation row into a fuller picker (`cfca14fb` "Choose date ›").
      Threshold: cramped is a measured condition, not a judgement — the anchored placement cannot
      honour `preferredWidth` and falls toward `minWidth`, or the panel's height reaches
      `owned-menu.ts:360`'s viewport cap so the list scrolls; the escalation is decided once in the
      dropdown primitive rather than per call site; the dedicated button carries the 28px desktop
      target floor; and `048`'s stacking model and `044`'s sheet grammar stay green.
- [ ] **Every desktop dropdown still opens with a search input active, including any surface the
      escalation converts to a sheet.** `dropdown-field.ts:228`'s desktop branch is unconditional
      today (`searchable = phoneSheet ? … : true`, landed at `a952e5e7` / ADR-006) and the
      criterion is that it stays that way through the escalation — Notion agrees at any option
      count (**N3** `8ff7ae4b` on a 3-option list, `86a8e66c`). **Today: unexercised**, because no
      desktop sheet surface exists yet to carry it. The phone sheet's `> 8` count gate at
      `dropdown-field.ts:228` is untouched: ADR-006 ruled it the phone's alone.
- [ ] **`npm run gate` exits 0 with the `constructed-dropdown` lane asserting the trailing check,
      observed red first.** The lane exists — `tools/live/constructed-state-assertions.mjs:417-420`
      with the `dropdownPopover` marker at `:123` — and is extended, not replaced; its fixture
      counterpart at `tools/screenshots/scenarios/core.mjs:251-256` moves with it. **Today: RED**,
      because the marker asserts only that a disabled option exists. Threshold: the extended marker
      fails on today's tree with its exit status read, passes after, and the
      `constructed-dropdown` capture is re-taken and opened, with the pixel read owed to an
      image-capable leg per D5.
- [ ] **The option colour picker is a one-column labelled list — dot, visible name, trailing tick —
      on desktop and on the phone alike.** Added 2026-09-06 ~19:08 from the operator's ruling,
      verbatim: *"Check fibery, anytype and notion and suggest best ui ux"* (ADR-004, REQ-008).
      **Today: RED, 16 of 16.** `option-color-picker.ts:72-88` emits sixteen unlabelled
      `db-color-picker-swatch` buttons into a 96px wrapping flex box, with the check drawn inside
      the selected swatch rather than trailing in a row. Thresholds: sixteen `.db-dropdown-option`
      rows and zero swatches; a 16px leading dot; the desktop row at the family's 30px floor
      (`styles.css:3245`) and the phone row at 44px (`:3188`); the panel at Anytype's measured
      224px; the phone sheet inside the grammar's existing `90svh` cap with the list scrolling and
      the current row scrolled into view; every one of the sixteen names resolving through `t()`.
- [ ] **The operator opens dropdowns, menus and pickers on iOS and on desktop and reads them as
      refined.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow. Progress, evidence, deviations
and findings belong here.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened from the research synthesis | Done | `052/research/research.md`, five iterations, 28 findings, stop reason `maxIterationsReached` |
| Level scored | Done | `recommend-level.sh --loc 450 --files 8 --architectural` → 58/100, confidence 92%, Level 2; phase score 10/50, below the 25 threshold, so a standard child |
| Eight ADRs written | Done | `decision-record.md`; six restate landed rulings, ADR-004 and ADR-005 are Proposed and operator-owned |
| Implementation | Pending | No code changed by this packet |

### Deviations and findings

| Item | Note |
|------|------|
| Two of `052`'s completion criteria describe a tree that no longer exists | The combobox criterion and the picker-host criterion in `052/goal.md` §3 both still carry pre-landing "Today:" text: `dropdown-field.ts:160-166` opens the combobox and `popover-host.ts` provides all five shared pieces the second one demands. T007 refreshes that text against the landed tree; it un-ticks nothing, so D1 holds. |
| The check flip is owned by no pending task | `052`'s T009 does not open `dropdown-field.ts`, and the row census counts its four hand-built rows without flipping them. That is why T001-T003 are this packet's own leg rather than a rider on an existing one. |
| One citation in the research is second-hand | `date-value-picker.ts` was never opened by the loop; the pointer came through `design-trueup.md` G13. It was re-derived here at `:157-171` before the criterion was written, and T006 reads the file again before writing the check. |
| Line numbers were re-derived after the rebase | The loop ran on the pre-rebase worktree and cited `dropdown-field.ts:240-253` / `styles.css:3239-3256`. On `origin/main` at `c9966433` the same code sits at `dropdown-field.ts:349-359` and `styles.css:3237-3241`. Every citation in this packet is the re-derived one — `roadmap.md` §7.9's line-drift kind, caught rather than inherited. |
<!-- /ANCHOR:log -->
