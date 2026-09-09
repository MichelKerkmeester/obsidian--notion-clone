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
    last_updated_at: "2026-09-09T22:50:00Z"
    last_updated_by: "sheet-notion-audit"
    recent_action: "Scaffolded from the sheet-notion audit's gap tables"
    next_safe_action: "Execute tasks.md T001-T011"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/views/column-manager-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "009-properties-sheet-row-model-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the operator want the per-row wrap and delete controls in an edit-property sheet, or behind a per-row overflow menu? The audit reads Notion as the former"
      - "Can the operator supply a full-resolution Notion Property-visibility capture (audit C-2)"
    answered_questions: []
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
- [ ] Every properties row carries at most 4 interactive controls, lane-measured RED then GREEN
- [ ] 0 rows render a bracketed internal key on the phone presentation
- [ ] The list partitions into Shown and Hidden sections, each header carrying its bulk action
- [ ] Wrap and delete are reachable from an edit-property sheet rather than from icons on the list row
- [ ] No regression on the sheet's landed pitch, section-boundary hairlines or native-select count
- [ ] Recaptured phone-only light and dark, with a measured before/after recorded
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
| Implementation | Not started | Deferred to `tasks.md` |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| The strings for the missing sections already ship | `panel.shownSection` ("Shown"), `panel.hiddenSection` ("Hidden"), `panel.hideAllProperties` ("Hide all") and `panel.showAllProperties` ("Show all") are in `src/i18n.ts` and are consumed by `record-detail-panel.ts:222-226`. The Properties sheet — the surface whose whole job is showing and hiding properties — is the one that does not use them |
| Notion's own destructive treatment is inconsistent and is not copied | In `notion-ios-database-properties-05-086606f1-d300-4d22-a236-46180752ed89.webp` Notion renders "Delete property" in the same tone as the row above it, while four other captures in the same harvest render destructive rows red. Our `is-warning` treatment (`styles.css:813`, used by three producers) is the more consistent of the two and stays |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
