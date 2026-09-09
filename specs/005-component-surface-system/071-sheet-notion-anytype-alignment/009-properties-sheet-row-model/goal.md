---
title: "Goal: Properties Sheet Row Model"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "009-properties-sheet-row-model goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/009-properties-sheet-row-model"
    last_updated_at: "2026-09-09T23:39:05Z"
    last_updated_by: "implementation-leg"
    recent_action: "Implemented T001-T011; 3 controls, key-free labels, shown/hidden partition; gate 28/28"
    next_safe_action: "Operator device read (D3) closes the packet; audit C-2 capture would ground §13's Notion column"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/views/column-manager-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "009-properties-sheet-row-model-implementation"
      parent_session_id: null
    completion_pct: 88
    open_questions:
      - "Does the operator want the per-row wrap and delete controls in an edit-property sheet, or behind a per-row overflow menu? The audit reads Notion as the former; this leg implemented the former"
      - "Can the operator supply a full-resolution Notion Property-visibility capture (audit C-2)"
    answered_questions:
      - "Edit-property sheet chosen over a per-row overflow menu: implemented as the audit read Notion, wrap toggle plus a full-width is-warning Delete property row; the D3 device read confirms it"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Properties Sheet Row Model

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The Properties sheet's rows carry at most four interactive controls and no internal storage key, its list partitions into Shown and Hidden sections with the bulk actions our own record sheet already names, and the two controls the row sheds land in an edit-property sheet — closing the audit's §3.1 and §3.2 findings.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No numeric target in this packet may be derived from a Notion asset. Every Notion iOS capture here is 299x678; the Notion column is structural and every number is ours |
| D2 | Row pitch, section-boundary hairlines and the native-select count are regression-checked, not re-designed — `002`-`006` converged them |
| D3 | Only the operator's own device recheck may close the alignment judgement; no agent ticks the device row |
| D4 | The shown/hidden vocabulary is not invented here: `panel.shownSection`, `panel.hiddenSection`, `panel.hideAllProperties` and `panel.showAllProperties` already exist in `src/i18n.ts` and are already used by `record-detail-panel.ts:222-226`. This packet reuses them rather than adding strings |
| D5 | No card or canvas treatment is added here — `007` owns that decision (audit §6 ADR-A) |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Reference and current-state gap table complete (`spec.md` §13, from `../sheet-notion-audit.md`)
- [x] Every properties row carries at most 4 interactive controls, lane-measured RED then GREEN (RED: 6 per row → GREEN: 3 on all 16 rows, wanted ≤4)
- [x] 0 rows render a bracketed internal key on the phone presentation (RED: 0/16 key-free → GREEN: 16/16)
- [x] The list partitions into Shown and Hidden sections, each header carrying its bulk action (RED: 0 headers → GREEN: 2, `Shown`/`Hide all` + `Hidden`/`Show all`)
- [x] Wrap and delete are reachable from an edit-property sheet rather than from icons on the list row (name tap → `editColumn` proven; the delete hands the edited column to the confirmed `deleteColumn`)
- [x] No regression on the sheet's landed pitch, section-boundary hairlines or native-select count (lane exit 0 unchanged: 3/3 hairlines, 0.49px centring, 0 native selects, 34px rows; record sheet clauses green; WebKit 401 ≤ 401)
- [x] Recaptured phone-only light and dark, with a measured before/after recorded (5 capture runs exit 0/480; decoded-pixel judgment, all movers deterministic, none jitter; numbers in the log below)
- [ ] Operator's own device re-read reports the Properties sheet aligned (no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.1 and §3.2 — Notion ships **two** variants of this surface and both are cited: `screenshots/notion/ios/flows/hiding-properties/notion-ios-flow-hiding-properties-02-9867cb76-74ed-4ff0-9254-398aeff2265e.webp` (Property visibility: drag handle + type icon + label + eye) and `screenshots/notion/ios/flows/adding-new-properties/notion-ios-flow-adding-new-properties-02-2f52d1bc-fcf7-4da5-8f96-6b1e31339dc4.webp` (Properties, with Done and a chevron per row). Both 299x678, read for structure only |
| Current-state measurement | Done | `node tools/live/sheet-grammar.mjs` PASS exit 0: the sheet's 3/3 between-section boundaries carry the edge-to-edge 1px hairline; title centres within 0.49px |
| Visual read | Done | `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` (804x1748) opened: every row carries ↑ ↓ checkbox type-icon label wrap edit trash, and the label reads `Name [file.name]`, `Field 1 [field1]` |
| Gap table | Done | `spec.md` §13 |
| Implementation | Done | T001-T011 executed 2026-09-09/10 in `worktrees/275-properties-sheet-rows`. GREEN lane: 16/16 rows at **3** interactive controls (RED: 6), **16/16** labels key-free (RED: 0/16), **2** section headers — `Shown`/`Hide all` and `Hidden`/`Show all` — each bulk action on its own line (RED: 0), 0 native selects, 34px row heights; regression clauses unchanged (3/3 hairlines, 0.49px centring); WebKit long-name extent 401 ≤ 401. Unit: `column-manager-renderer.test.ts` 7/7, proven red-then-green (1 failed | 6 passed → 7/7) on the key-free clause; vitest 1591/1591; tsc 0; build 0; verify-placement 418/420 (2 declared); `npm run screenshots` 480×5 exit 0, movers judged by decoded pixel delta (the redesigned surface 321990-361711px at maxDelta 196-225, its dependent stacks and the rewritten panel fixtures following; every mover reproduced across runs, none jitter); evidence 16/16 fresh; scans 0; gate **28/28 exit 0**. The css-lane was acquired, edited and released at `0d6a8dbd2fa2` with 20 captures named reviewed |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| The storybook fixture had to leave the 5-file scope | `tools/screenshots/scenarios/panels.mjs`'s `panel-column-manager` hand-HTML still rendered the old 8-child row; under the new 5-track grid the three removed buttons wrapped onto a second line, the replay artefact read 2 row tracks against its recorded 1 (`BROKE: 002-properties-panel, recorded 1 now 2`) and four panel captures changed size. The fixture was rewritten to the shipped row (3 controls, key-free label, the two partition sections, no header All-toggle) and `tools/live/replay.mjs` holds 28/28. Recorded here because the deviation is real: 6 files, not 5 |
| The Properties phone sheet's own scrollbar dropped to 0px | The partition's two extra header lines tip a sheet of long, wrapping names past the 90svh cap, and the desktop-WebKit lane then draws the classic 8px bar, eating 8px of the root's width and tripping the horizontal-overflow clause (extent 397 > 393, five failures). `scrollbar-width: none` on `.obnotion-column-manager.obnotion-mobile-bottom-sheet` — a phone's scrollbar is the overlay kind that never draws, matching the shipped portalled-sheet ruling; the centring negative control now injects the historic 88px (All + close) trailing width itself, since the shipped header's trailing slot is the close alone |
| The strings for the missing sections already ship | `panel.shownSection` ("Shown"), `panel.hiddenSection` ("Hidden"), `panel.hideAllProperties` ("Hide all") and `panel.showAllProperties` ("Show all") are in `src/i18n.ts` and are consumed by `record-detail-panel.ts:222-226`. The Properties sheet — the surface whose whole job is showing and hiding properties — was the one that did not use them. Now does; no string added |
| Notion's own destructive treatment is inconsistent and is not copied | In `notion-ios-database-properties-05-086606f1-d300-4d22-a236-46180752ed89.webp` Notion renders "Delete property" in the same tone as the row above it, while four other captures in the same harvest render destructive rows red. Our `is-warning` treatment (`styles.css:813`, used by three producers) is the more consistent of the two and stays |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
