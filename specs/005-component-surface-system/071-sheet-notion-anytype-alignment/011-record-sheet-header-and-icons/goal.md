---
title: "Goal: Record Sheet Header and Property Icons"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "011-record-sheet-header-and-icons goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/011-record-sheet-header-and-icons"
    last_updated_at: "2026-09-09T22:50:00Z"
    last_updated_by: "sheet-notion-audit"
    recent_action: "Scaffolded from the sheet-notion audit's gap tables"
    next_safe_action: "Execute tasks.md T001-T009"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-notion-audit.md"
      - "src/views/record-detail-panel.ts"
      - "tools/live/sheet-grammar.mjs"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "011-record-sheet-header-and-icons-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does record-peek adopt the shared header builder outright, or keep its own header and merely satisfy the centring contract?"
      - "Can the operator supply a full-resolution Notion record page carrying many properties (audit C-5), so the question of a collapse affordance can be settled?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Record Sheet Header and Property Icons

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The record sheet's title centres like every other phone sheet's, its two surfaces join the title-centring contract that today covers thirteen and misses them, and its property rows carry the type icon our properties and filter sheets already show — closing the audit's §3.3 finding.

### Decisions

| ID | Decision |
|----|----------|
| D1 | No numeric target in this packet may be derived from a Notion asset. The one number here — 0.50px — is ours, already met by 13 covered surfaces |
| D2 | The record sheet's landed row grammar is regression-checked, not re-designed: `006` converged 21/21 rows at 44.0px, 20/20 hairlines, the 16.0px inset and 0 native selects |
| D3 | The record's open target — bottom sheet against Notion's side peek / center peek / full page — is **out of scope**; `006-record-open-target` owns it and this packet must not move it |
| D4 | Only the operator's own device recheck may close the alignment judgement; no agent ticks the device row |

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
- [ ] record-detail and record-peek are members of the title-centring contract's surface list
- [ ] Both measure their title centre within 0.50px of the frame centre
- [ ] Every record property row renders its type icon
- [ ] No regression on `006`'s landed record row grammar
- [ ] Recaptured phone-only light and dark, with a measured before/after recorded
- [ ] Operator's own device re-read reports the record sheet aligned (no agent ticks this row)
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-09, worktree `worktrees/272-sheet-notion-audit` |
| Reference inventory | Done | `../sheet-notion-audit.md` §3.3 — `screenshots/notion/ios/database/notion-ios-database-row-page-03-0cb59457-00da-4154-b7c0-5bb2a4831ba2.webp`, 299x678, read for structure only: properties render label-left/value-right with a **leading type icon** per row, and an `+ Add a property` row closes the list |
| Current-state measurement | Done | `node tools/live/sheet-grammar.mjs` PASS exit 0. The title-centring clause names **13** surfaces and record-detail and record-peek are not among them; the 13 covered all measure ≤0.50px |
| Root cause located | Done | `record-detail-panel.ts` builds `.obnotion-record-detail-header`, and `styles.css:10806-10825` gives it `display:flex` with the title at `flex: 1` — left-anchored. The lane's clause queries `.obnotion-shell-header` (`sheet-grammar.mjs:3402`), which this surface never mounts, so it was never eligible to fail |
| Visual read | Done | `screenshots/notion-clone/panels/constructed-record-detail-mobile-light.png` (804x1748) opened: the title `row-0` sits hard left, while `Filter`, `Sort` and `Properties` all centre in their own captures |
| Gap table | Done | `spec.md` §13 |
| Implementation | Not started | Deferred to `tasks.md` |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| This is the audit's Mechanism B, in its clearest form | The contract did not fail on this surface because the surface was never in the contract's list. `007` found the same class of gap by a different route — a comparison never made. Recorded in `../sheet-notion-audit.md` §1 |
| The fix has two possible shapes and the packet does not pre-decide | Either the record family adopts the shared `createSheetHeader` (one header builder, contract membership automatic) or it keeps its own header and is added to the clause's surface list with a selector that matches both. The first is cleaner and has the wider blast radius; T005 chooses with the measurement in hand |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
