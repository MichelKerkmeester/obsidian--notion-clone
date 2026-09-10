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
    last_updated_at: "2026-09-10T01:05:00Z"
    last_updated_by: "277-record-sheet-header"
    recent_action: "Implemented T001-T009; record family on shared header; 21/21 icons; 006 green; gate 28-0"
    next_safe_action: "Operator device read (D3) closes the packet; then 008, 009, 012-014 in the audit's order"
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
    completion_pct: 86
    open_questions:
      - "Can the operator supply a full-resolution Notion record page carrying many properties (audit C-5), so the question of a collapse affordance can be settled?"
    answered_questions:
      - "Does record-peek adopt the shared header builder outright, or keep its own header and merely satisfy the centring contract? — RESOLVED: the peek's phone surface is the record-detail bottom sheet (the peek hands off through openRecordDetailPanel), so one producer branch mounting the shared buildPhoneRecordHeader covers both surfaces; the clause's record-family selector fallback keeps the measured delta honest if the producer drifts again"
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
- [x] record-detail and record-peek are members of the title-centring contract's surface list — `tools/live/sheet-grammar.mjs`'s `TITLE_CENTERED_SURFACES` no longer excludes them, and the clause's measured report names which selector answered (`via shell`)
- [x] Both measure their title centre within 0.50px of the frame centre — GREEN: 0.49px each, `via shell` (the shared header); RED at the pre-change producers, measured: 47.50px each, `via record-family`
- [x] Every record property row renders its type icon — RED 0/21 → GREEN 21/21, the icon inside the label's 96px box, 21/21 rows still 44.0px
- [x] No regression on `006`'s landed record row grammar — 21/21 rows 44.0px, 20/20 hairlines (last 0px), 16.0px inset, 1/1 section headings 16.0px/1px, 0 native selects, scrollWidth 390 ≤ 389+1 at 402px, all unchanged, both engines (lane exit 0)
- [x] Recaptured phone-only light and dark, with a measured before/after recorded — `npm run screenshots` ×2, 480/480, exit 0 both: 15 content movers, every one at identical counts across both runs (record-detail family 8, record-peek family 4, the submenu fixture that mounts the record detail 2, the time-relative field-file-fields read 1), 1 jitter (2px@Δ1, one run) restored; the pixel before/after against the committed blobs is in `tools/lane/css-lane.json`'s 011 release entry
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
| Implementation | Done | 2026-09-10, worktree `277-record-sheet-header`, tasks.md T001-T009. RED measured at the pre-change producers: record-detail 47.50px, record-peek 47.50px (clause reports `via record-family`), 0/21 icons, lane exit 1. GREEN: 0.49px both surfaces via the shared shell header, 21/21 icons, lane exit 0 (2349 PASS / 0 FAIL); `006`'s clauses unchanged. Producer: the record-detail panel mounts `buildPhoneRecordHeader` on the bottom-sheet path (record icon → leading slot, expand action → trailing beside the close, the title decorations onto the shared title element); the desktop anchored panel keeps its own header; the row icon paints inside the label's fixed 96px box via a `renderLabelTypeIcon` opt-in in the shared card-field renderer. Unit revert-proof: at the pre-change producer 1 of 3 contract tests fails, restored 3/3. vitest 1591/1591, tsc 0, build 0, screenshots ×2 480/480 (15 two-run movers kept, 1 jitter restored), css-lane triplet signed (holder `011-record-sheet-header-and-icons`, baselineHash `892ac77282a3`), evidence 16/16 fresh, naming scans 0, gate 28/0 |
| Operator device read | Open | D3 — the 2026-09-09 ~22:30 ruling opened this; the next device read closes it |

### Deviations and findings

| Item | Note |
|------|------|
| This is the audit's Mechanism B, in its clearest form | The contract did not fail on this surface because the surface was never in the contract's list. `007` found the same class of gap by a different route — a comparison never made. Recorded in `../sheet-notion-audit.md` §1 |
| The fix has two possible shapes and the packet does not pre-decide | Either the record family adopts the shared `createSheetHeader` (one header builder, contract membership automatic) or it keeps its own header and is added to the clause's surface list with a selector that matches both. The first is cleaner and has the wider blast radius; T005 chooses with the measurement in hand |
| The shape chosen, and why | T006's measurement decided it: the shared `buildPhoneRecordHeader` already existed in `record-header.ts` with no production caller, so the producer now mounts it on the bottom-sheet path and the record family's contract membership is structural rather than a selector's promise. The clause still carries the record-family selector as a measured fallback (it reports which selector answered, `via shell` / `via record-family`), so a producer that silently stops mounting the shared header goes visibly red instead of invisibly green — the same coverage-gap class this packet exists to close. The desktop anchored panel keeps `.obnotion-record-detail-header`: a different surface, a byte-compatible DOM its own CSS depends on |
| No landed Anytype ruling is contradicted | D15 (`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar, not for sheets. Where a Notion reading contradicts a landed decision, this packet records it as Proposed in `../sheet-notion-audit.md` §6 rather than resolving it |
<!-- /ANCHOR:log -->
