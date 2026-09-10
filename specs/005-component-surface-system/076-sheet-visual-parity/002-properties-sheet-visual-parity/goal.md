---
title: "Goal: Properties Sheet Visual Parity"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "002-properties-sheet-visual-parity goal"
  - "002 completion criteria"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/002-properties-sheet-visual-parity"
    last_updated_at: "2026-09-11T00:20:00Z"
    last_updated_by: "295-loop-002-properties-sheet-visual-parity"
    recent_action: "CREATE landed: T001-T010 done, L1-L6 RED-then-GREEN, gate 28/0, awaiting LAND/JUDGE"
    next_safe_action: "LAND node rebases and pushes; JUDGE node scores verification.md against ../spec.md §5"
    blockers:
      - "No number may come from a 299x678 reference asset (D3)"
      - "The child does not close until the image judge passes twice on an unchanged tree (D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/column-manager-renderer.ts"
      - "src/views/record-surface/property-row.ts"
      - "src/views/checkbox.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "002-properties-sheet-visual-parity-plan"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "The section headings read Shown in table / Hidden in table. The in table suffix suggests the string may be view-type-specific; no non-table-view capture exists here, so whether it varies is unreadable at 299x678"
      - "Whether Notion offers a direct (non-Settings-drill-in) entry to Property visibility is unobserved; Frame's leading-vs-trailing header control stays deferred to 076/001's Proposed ADR-I"
    answered_questions:
      - "The sheet is photographed through the production mount path already; no scenario work is owed unless T003 finds an unregistered surface"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
      - "The scaffold's + New property / Learn about properties citation read the wrong Notion screen (the Properties editor, not Property visibility); corrected in spec.md 13.0"
      - "071/012 ADR-001 (arrows survive over the grip, because they carry a keyboard path) is extended here rather than contradicted: the reorder arrows are unchanged"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Properties Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every Properties row still renders as up-arrow, down-arrow, a filled blue checkbox, a type icon and a label; Notion's row is a drag handle, a type icon, a label and an eye. This phase takes it through the programme's six-step loop until a reviewer, opening our capture beside the reference, scores it **≥ 14/16 with no row at 0, twice consecutively on an unchanged tree**.

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
- [x] Every production surface painting this grammar enumerated and covered
- [x] Every lane clause RED-then-GREEN, both numbers recorded
- [x] Phone light and dark captures current, and both opened and looked at
- [ ] Image judge **≥ 14/16, no row at 0** — pass #1
- [ ] Image judge **≥ 14/16, no row at 0** — pass #2, on an unchanged tree
- [x] The `071` clauses this sheet carries re-run unchanged and green
- [ ] The operator re-reads the sheet on their own iPhone and reports it aligned — **no agent ticks this row**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-10 — scaffolded

Opened as phase 2 of `076-sheet-visual-parity`. The references in `spec.md` §13 were selected this session and the gaps they cannot answer are recorded there rather than filled by inference.

### 2026-09-10 — DEFINE + PLAN

Re-read every reference this DEFINE cites, against the actual renderer code and the current
captures, rather than carrying the scaffold's draft forward unverified. Two corrections resulted:
the scaffold's "Add affordances" target cited the wrong Notion screen (the Properties editor, not
Property visibility — `spec.md` §13.0), and its arrow-removal target is dropped in favour of
extending `071/012` ADR-001 (the arrow pair carries a keyboard path a grip does not) rather than
contradicting it. **2 Proposed ADRs** (L, M) recorded in `spec.md` §13.13 for `../../roadmap.md`
§7.19; ADR-M notes this child's own L5 clause addresses `roadmap.md` §7.18 ADR-D's 44px-floor gap.
`076/001`'s already-landed reference scale, card token and dark-theme invariant are reused rather
than re-derived (§13.5-§13.7, §13.12). 6 lane clauses (L1-L6), 13 tasks.

### 2026-09-11 — CREATE

T001-T010 landed. The row shell (`property-row.ts`'s `buildCheckboxPropertyRow`) drops its leading
checkbox for a trailing eye/eye-slash toggle (`onCheckboxClick`/`onCheckboxChange`/`checkboxDisabled`
renamed to `onToggle`/`stateControlDisabled` since the checkbox-shaped names no longer describe the
control); the shown/hidden sections and the add-property row gain `076/001`'s settings-card fill,
radius and margin, scoped to `.obnotion-column-manager.obnotion-mobile-bottom-sheet`; the row gains
the shared 44px min-height floor in that same scope; the section heading drops its uppercase
transform. Two new i18n keys (`panel.shownInTable`/`panel.hiddenInTable`) carry the "in table" copy
rather than reusing `panel.shownSection`/`hiddenSection`, which the record sheet's own hidden-group
and the board's group-by popover also read — a shared-key edit would have misworded both. All six
lane clauses ran RED against the reverted producer (`git stash`) and GREEN after: L1 16→0, L2 0/16→
16/16, L3 N/A on this fixture's viewType (no required column to disable — the opacity/disabled wiring
is unit-tested instead), L4 0→2 cards, L5 34→48px, L6 flat→carded. The shared row shell reaches
`board-groups-panel.ts` and `board-card-properties-panel.ts` too (§3); their own lane/render-assertion
coverage was updated to read the eye toggle instead of a checkbox, and three screenshot fixtures
(`panel-column-manager`, `panel-board-groups`, `panel-board-card-properties`) had their hand-authored
row markup updated after the new CSS grid broke their stale checkbox layout into two lines — a real
regression the DEFINE's "no scenario work owed" finding did not anticipate. `tools/storybook/
obsidian-stub.mjs` gained a plain `eye` icon entry (only `eye-off` existed) after the first capture
showed a placeholder diamond in its place. Full local gate: tsc 0, vitest 1617/1617, build 0,
sheet-grammar/render-assertions/touch-targets/verify-placement/naming-scans all green, `npm run gate`
28/0. css-lane acquired and released as `076-002-properties-sheet-visual-parity` (28 real movers
named, 2 one-run jitters restored). The judge has not run; the hidden section and add-row card could
not be visually confirmed in the constructed capture (the fixture's 16-row list scrolls past the
viewport before either renders) — confirmed structurally instead via the L4/L6 computed-style
assertions. See `verification.md` for the self-score and what still differs from the reference.
<!-- /ANCHOR:log -->
