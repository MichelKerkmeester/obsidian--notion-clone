---
title: "Goal: Group Sheet Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "005-group-sheet-visual-parity goal"
  - "005 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/005-group-sheet-visual-parity"
    last_updated_at: "2026-09-11T08:30:00Z"
    last_updated_by: "307-loop-005-group-sheet-visual-parity"
    recent_action: "DEFINE+PLAN redone: two producers named, ADR-G resolved, tasks.md rewritten to 14 tasks"
    next_safe_action: "Execute tasks.md T003: add the constructed mount for Surface A and wire the existing fixture's fixtureOf to it, before any producer change"
    blockers:
      - "No number may come from a 299x678 reference asset (D3)"
      - "The child does not close until the image judge passes twice on an unchanged tree, on both surfaces (D1)"
      - "ADR-I (shared close-glyph) is still operator-held; Frame is capped at 1, ceiling <= 15/16, on both surfaces until it resolves"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/toolbar-renderer.ts"
      - "src/views/board-groups-panel.ts"
      - "styles.css"
      - "tools/screenshots/constructed-scenarios.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "005-group-sheet-visual-parity-plan"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 10
    open_questions:
      - "Does the toolbar's inline Group by field list stack as its own sheet per the 048 stacking model, or stay inline? T011 decides before CREATE touches the row"
    answered_questions:
      - "D2(a) gap found and closed: the scaffold named one producer, this DEFINE names two (toolbar Group popover, board Manage groups sheet)"
      - "ADR-G is resolved: screenshots/notion/ios/flows/group-2/-03/-04 is the populated Notion grouped-result screen the earlier audit could not find"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree, per surface"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Group Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The group sheet spans two producers (`toolbar-renderer.ts`'s Group/Sub-group popover and `board-groups-panel.ts`'s Manage groups sheet) where the scaffold named one. This phase takes each through the programme's six-step loop until a reviewer, opening our capture beside its composed reference, scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is the gate. The lane clauses in `spec.md` §13 are the floor beneath it and never close this sheet on their own |
| D2 | The target binds **every** production surface painting this grammar — `spec.md` §3 lists them — and every parity capture comes from a scenario mounting production |
| D3 | Every Notion capture here is 299×678. The reference is read **structurally**; every number is ours or `TBD — needs operator capture` |
| D4 | This phase runs in its programme order, alone, holding the css-lane triplet by itself |
| D5 | Only the operator's own device read closes the alignment judgement. **No agent ticks that row** |

### Operator copy

The operator holds the parent directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] DEFINE complete: every row of `spec.md` §13 has a target, every reference path resolves, every number ours or `TBD`
- [x] Every production surface painting this grammar enumerated (two: toolbar Group popover, board Manage groups sheet)
- [ ] Surface A gets a constructed mount (not just its existing fixture) covered by the lane (T003)
- [ ] Every lane clause RED-then-GREEN, both numbers recorded, on both surfaces
- [ ] Phone light and dark captures current for both surfaces, and both opened and looked at
- [ ] Image judge **≥ 14/16, no row at 0** — pass #1, on both surfaces
- [ ] Image judge **≥ 14/16, no row at 0** — pass #2, on an unchanged tree, on both surfaces
- [ ] The `071` clauses this sheet carries re-run unchanged and green
- [ ] The operator re-reads the sheet on their own iPhone and reports it aligned — **no agent ticks this row**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-10 — scaffolded

Opened as phase 5 of `076-sheet-visual-parity`. The references in `spec.md` §13 were selected this session and the gaps they cannot answer are recorded there rather than filled by inference.

1 contradiction with landed `071` ruling was recorded at scaffold and is raised as Proposed ADR in `../../roadmap.md` §7 before this child implements. No `071` child is amended from here.

### 2026-09-11 — DEFINE and PLAN redone

Every reference the scaffold named, plus the wider `flows/group` and `flows/group-2` families it did not check, was opened directly (Notion, Anytype, ClickUp, operator, current-state). Two findings correct the scaffold rather than extend it:

1. **D2(a) gap.** The scaffold analysed only `board-groups-panel.ts`. `toolbar-renderer.ts`'s own Group/Sub-group popover — a second bottom sheet, reached from the toolbar's Group button, promoted to a sheet by the same shared `applySheetChrome` path every sibling panel uses — renders the field-picker half of the same grammar. Its registered capture (`scenarios/panels.mjs:333`, current in the manifest) is a **hand-authored fixture that mirrors the renderer's markup rather than mounting it**, with no `fixtureOf` pointing at a `constructed-*` counterpart the way every sibling fixture in that file has — the D2(b) gap is fixture-versus-production, not missing registration (a first read this session got that wrong before checking `roadmap.md`'s own record and correcting it). Both surfaces are now named in `spec.md` §3 and carry their own DEFINE rows in §13.
2. **The scaffold's one contradiction (ADR-G) is resolved, not escalated.** `screenshots/notion/ios/flows/group-2/…-03/-04.webp` is the populated Notion grouped-result screen two prior audits reported missing — filed under a flow name neither checked. It shows exactly the Visible-groups/Hidden-groups partition `071/012` already built, validating rather than contradicting it. No Proposed ADR is raised this session; §12 records the correction owed to `roadmap.md`'s ADR-G row instead, which sits outside this child's write scope.

Following `001`/`002`'s own precedent, Frame is targeted at 1 (not 2) on both surfaces pending ADR-I, and the arrow-pair reorder control on Surface B is kept per `076/002`'s own ADR-L rather than replaced with a grip. `tasks.md` was rewritten to 13 write-first tasks covering both surfaces, following `076/002`'s own convention of leaving DEFINE/PLAN transcription tasks unchecked until done; T003 (adding Surface A's constructed mount) is the next safe action.
<!-- /ANCHOR:log -->
