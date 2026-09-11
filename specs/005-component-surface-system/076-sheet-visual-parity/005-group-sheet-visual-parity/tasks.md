---
title: "Tasks: Phase 5: Group Sheet Visual Parity"
description: "Thirteen write-first tasks across the two bound producers DEFINE found. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 5 tasks"
  - "005 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 5: Group Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

**Write-first is the whole order.** Every task from T003 to T009 runs its clause RED and writes the
failing number into `verification.md` **before** the producer moves, then GREEN with its number
beside it. A task that reports a number it did not read is the failure this packet exists to stop.

Each task is sized for one GLM 5.3 flash or Sonnet leg, across two bound producers (Surface A:
`toolbar-renderer.ts`'s Group/Sub-group popover; Surface B: `board-groups-panel.ts`'s Manage groups
sheet — see `spec.md` §3 and §13 for what each is and why both are bound).
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A-B: DEFINE and PLAN — closing out

DEFINE and PLAN are written (`spec.md` §13, `plan.md` §3). What remains of them is the lane setup
and the parent's own progress row — neither is a producer change, so neither is checked off here
until it is actually done.

- [ ] T001 Add the §5.A-style progress row for this child to `../../roadmap.md` (or confirm the
  phase parent's own map row, `../spec.md`'s Phase Documentation Map, already carries it) at
  **planned**, naming both bound producers and the fixture-versus-production gap on Surface A. No
  Proposed ADR is owed this pass — §12's ADR-G finding is a correction to `roadmap.md`'s own record,
  not a new contradiction — but flag that correction in the same edit (`../../roadmap.md`)
- [ ] T002 Add lane clauses **L1-L8** to `tools/live/sheet-grammar.mjs`, unwired, in the idiom
  already there. Run each one and **record its RED number** — the count, not the word "fails".
  Acquire the css-lane triplet for `styles.css`, record the baseline hash, and confirm no other
  child holds it (`tools/live/sheet-grammar.mjs`, `verification.md`, `tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase C: CREATE — RED, producer, GREEN, per surface

- [ ] T003 Surface A's existing `group` fixture (`scenarios/panels.mjs:333`) mirrors the renderer by hand and has no `constructed-*` counterpart. Add `constructedScenario("group-popover", { renderer: "toolbar", toolbarPopover: "group", … })` to `constructed-scenarios.mjs`, mirroring `board-groups-panel`'s own shape and reusing the harness's existing `.obnotion-group-btn` click path (`render-assertion-harness.ts:3278`), then point the `group` fixture's `fixtureOf` at it — the convention every sibling fixture in that file already follows. Nothing else on Surface A proceeds until this captures `constructed-group-popover-mobile-{light,dark}.png` from production (D2b). L1 RED → GREEN (`tools/screenshots/constructed-scenarios.mjs`, `tools/screenshots/scenarios/panels.mjs`)
- [ ] T004 Surface B: move `.obnotion-board-groups-panel`'s sheet padding from its flat 8px onto the shared `--obnotion-sheet-inset` (16px) token, joining the selector list `.obnotion-filter-panel`/`.obnotion-sort-panel`/`.obnotion-group-popover` already share. L2 RED first, record the flat-8px measurement (`styles.css`)
- [ ] T005 Surface B: replace the two orphan `Hide all`/`Show all` buttons with a `Visible groups` header (bulk action `Hide all` inline, right-aligned) above the shown-group rows and a `Hidden groups` header (`Show all` inline) above the hidden-group rows — both headers render even when one side is empty, per the internal-consistency argument `toolbar-renderer.ts:1909-1912` already states for the property Shown/Hidden split. L3 RED first, record 0 headers (`src/views/board-groups-panel.ts`, `styles.css`)
- [ ] T006 Surface B: add a hairline divider between every group row (none exists today — only the two edge dividers around the bulk-action area and the footer survive). L4 RED first, record 0 dividers (`styles.css`)
- [ ] T007 Surface B: raise the group-row floor from the inherited 30px to the family's 44px, matching `.obnotion-group-popover.obnotion-mobile-bottom-sheet .obnotion-menu-item`'s own already-landed rule. Reorder stays the arrow pair — `076/002`'s ADR-L already extended `071/012` ADR-001's ruling once; this task extends it again rather than re-litigating a grip. L5 RED first, record 30px (`styles.css`)
- [ ] T008 Surface B: replace the `Hide empty groups` footer's `createCheckbox` with a `.obnotion-toggle-switch`, matching Notion's own toggle and Surface A's own already-correct `showEmptyGroups` control — an internal-consistency fix, not a new pattern. L6 RED first, record "checkbox" (`src/views/board-groups-panel.ts`, `styles.css`)
- [ ] T009 Re-run `071/012`'s existing clauses (bulk hide/show present, per-group eye toggle present) unchanged in the same lane invocation and confirm they stay green through T003-T008 — no regression from the section-partition or divider changes. L7 (`tools/live/sheet-grammar.mjs`)
- [ ] T010 Resolve the §12 stacking question for Surface A's inline `Group by` field list against `048`'s stacking model and `003`/`004`'s own precedent for their field pickers. Either stack it as a separate sheet (matching Notion's two-level structure) or record the corrected target as staying flat, with the reasoning written into `spec.md` §13 before either producer change lands — this is a target decision, not a default (`spec.md`, `src/views/toolbar-renderer.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase D: SCREENSHOT — capture and look at it

- [ ] T011 Run `npm run screenshots </dev/null` and record the exit status and entry count (now including the new `constructed-group-popover-*` scenario), then `npm run screenshots:verify` and record the stale count. `group-mobile-{light,dark}.png` stays — it is the catalog fixture, `fixtureOf`-linked to the new constructed scenario, the same pattern every other fixture/constructed pair keeps. **Open every changed PNG, both surfaces, both themes, and look at it** (`tools/screenshots/capture.mjs`, `screenshots/notion-clone/panels/`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase E: VERIFY — lane, judge, operator

- [ ] T012 Gate (a): run every lane clause (L1-L8) and record each GREEN number beside the RED number T002-T009 recorded, re-running the `071` regression set in the same invocation. Gate (b): give a Sonnet or Opus reviewer both surfaces' phone captures beside their composed references and have it score the eight-row rubric from `../spec.md` §5 for each surface, noting the declared Frame deviation (capped at 1, ADR-I) in its justification line. Write both score tables into `verification.md`. **Pass is ≥ 14/16 with no row at 0, on both surfaces** (`tools/live/sheet-grammar.mjs`, `verification.md`)
- [ ] T013 Gate (c): record the operator's device row in `acceptance-criteria.md` as **Unmet**. **No agent ticks it.** Then close out: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — read each exit status. Release the css-lane triplet. Validate with `orchestrator.js --strict`, backfill graph metadata, re-validate, tick this child's row in `../goal.md` and `../checklist.md`, append a dated entry to `../../handover.md` (`recent_action` ≤ 96 characters) (`acceptance-criteria.md`, `../goal.md`, `../../handover.md`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase F: REMEDIATE — iterate until two clean passes, per surface

For any rubric row scoring below 2 on either surface: a clause RED for that row, the fix, GREEN,
re-screenshot, re-judge. Append each iteration to `verification.md` as its own section with its own
score table per surface. **Neither surface is done until its judge passes twice in a row on an
unchanged tree** — a second pass after a change is iteration *n+1*, not the second pass. If one
rubric row fails three consecutive iterations on the same surface, stop: the target is wrong for that
row, and DEFINE re-opens for it rather than CREATE trying again (`verification.md`, `spec.md`).
<!-- /ANCHOR:phase-5 -->
