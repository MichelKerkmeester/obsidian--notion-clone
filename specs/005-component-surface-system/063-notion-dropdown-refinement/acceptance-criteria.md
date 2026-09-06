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
    last_updated_at: "2026-09-06T18:20:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Authored the acceptance criteria from the Notion research synthesis"
    next_safe_action: "Observe AC-001's assertion red, then close it"
    blockers:
      - "AC-005 is blocked on 052's open T008 and T009"
      - "AC-009 is the operator's and is never ticked by an agent"
    key_files:
      - "src/views/dropdown-field.ts"
      - "styles.css"
      - "tools/live/constructed-state-assertions.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-063-acceptance"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Which surfaces does the measured cramped condition actually select"
    answered_questions:
      - "The trailing check is a landed ruling, not a new decision"
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
**Status:** Draft
**Date:** 2026-09-06
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
| AC-001 | REQ-001 | Given a dropdown popover built by the real renderer, When an option row is emitted, Then `.db-dropdown-option-check` is that row's last element child | `tools/live/constructed-state-assertions.mjs` `constructed-dropdown`, extended marker, `$?` read. Red today: `dropdown-field.ts:349` creates the check first | Unmet | - |
| AC-002 | REQ-001 | Given each of the four `.db-dropdown-option` grid variants, When the row renders, Then the check occupies the trailing 16px track at G14's right inset | Read `styles.css:3237-3241`, `:3258-3260`, `:3262-3264`, `:3266-3268`; re-taken `constructed-dropdown` capture opened; pixel read owed to an image-capable leg | Unmet | - |
| AC-003 | REQ-001 | Given the flip, When the keyboard moves the highlight, Then `aria-selected` and `aria-activedescendant` behave exactly as before | `npx vitest run src/views/dropdown-field.test.ts`, plus `dropdown-field.ts:539` still querying by class not position | Unmet | - |
| AC-004 | REQ-004 | Given a desktop dropdown whose anchored placement falls toward `minWidth: 180` or whose panel reaches `owned-menu.ts:360`'s height cap, When it opens, Then it presents as a sheet with a dedicated button rather than as a cramped popover | A test case in `src/views/dropdown-field.test.ts` asserting the branch, red today because `dropdown-field.ts` has no such branch (0 escalation paths) | Unmet | - |
| AC-005 | REQ-004 | Given the escalated sheet, When it is open, Then `044`'s sheet-grammar pairs and `048`'s stacking model are still green | `npm run gate`, `$?` read, `sheet-grammar` lane row green | Unmet | - |
| AC-006 | REQ-005 | Given any desktop dropdown, including one the escalation converted to a sheet, When it opens, Then a search input is present and focused, and the phone sheet's `> 8` count gate is unchanged | `dropdown-field.ts:228` unchanged in its phone branch; a test asserting the focused input on the escalated surface | Unmet | - |
| AC-007 | REQ-002 | Given a submenu parent row whose child carries a current value, When the row renders, Then `.db-menu-item-current` appears before `.db-menu-item-chevron` | A menu-row assertion over the four rows at `column-menu.ts:128`, `:144`, `:160` and `toolbar-renderer.ts:1312`. Red today: 2 of 6 such rows carry a value | Unmet | - |
| AC-008 | REQ-003 | Given the date picker's three relative presets, When the picker opens, Then each carries the date it resolves to in the secondary-text role, the picker is still 252px wide, and no tap target is below 28px desktop / 44px phone | Read `date-value-picker.ts:157-171` and `popover-host.ts:229-233`; presets block height measured before and after. Red today: 0 of 3 | Unmet | - |
| AC-009 | REQ-006 | Given the whole packet, When `npm run gate` runs, Then it exits 0 with the extended `constructed-dropdown` row green, having been observed red first | `npm run gate`, `$?` read; T001's red recorded in `tasks.md` with its own exit status | Unmet | - |
| AC-010 | REQ-007 | Given `052`'s two stale completion-criterion "Today:" texts, When they are refreshed, Then they describe the landed tree and no checkbox anywhere changed state | `git diff` on `052/goal.md` showing prose-only changes; no `- [ ]` → `- [x]` and no reverse | Unmet | - |
| AC-011 | REQ-004 | Given the operator, When they open dropdowns, menus and pickers on iOS and on desktop, Then they read the family as refined and the escalation as selecting the surfaces they called cramped | The operator's own report. Never ticked by an agent | Unmet | - |

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

Eleven criteria, all `Unmet`, none waived. The packet was opened by a research synthesis and no
code has changed yet. AC-011 is the operator's and cannot be closed here; AC-007 waits on `052`'s
open T008 and T009, which own the caller files.
<!-- /ANCHOR:closure -->
