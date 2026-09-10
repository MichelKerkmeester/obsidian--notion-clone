---
title: "Tasks: Phase 2: Properties Sheet Visual Parity"
description: "Thirteen write-first tasks: each is RED assertion, producer change, GREEN, capture, judge. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 2 tasks"
  - "002 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 2: Properties Sheet Visual Parity

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

**Write-first is the whole order.** Every task from T003 to T008 runs its clause RED and writes the
failing number into `verification.md` **before** the producer moves, then GREEN with its number
beside it. A task that reports a number it did not read is the failure this packet exists to stop.

Each task is sized for one GLM 5.3 flash or Sonnet leg. The lane clauses are `spec.md` §13.11; the
target rows are `spec.md` §13.3/§13.10; the rubric instance is `../spec.md` §5.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A-B: DEFINE and PLAN — closing out

DEFINE and PLAN are written. What remains of them is transcription and the lane.

- [ ] T001 Transcribe `spec.md` §13.13's two Proposed ADRs — **ADR-L** (the scaffold's original
  arrow-removal target corrected rather than followed, per `071/012` ADR-001) and **ADR-M** (this
  child's L5 addresses `roadmap.md` §7.18 ADR-D's 44px-floor gap) — into `../../roadmap.md` §7.19's
  table, one row each, raised-by `076/002`. Mark ADR-D (§7.18) addressed-by `076/002` rather than
  leaving it dangling. **Neither is implemented by this task.** Add the §5.A row for this child at
  `planned` (`../../roadmap.md`)
- [ ] T002 Add clauses **L1-L6** to `tools/live/sheet-grammar.mjs`, unwired, in the idiom already
  there. Run each one and **record its RED number** — the count, not the word "fails". Acquire the
  css-lane triplet for `styles.css`, record the baseline hash, and confirm no other child holds it
  (`tools/live/sheet-grammar.mjs`, `verification.md`, `tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase C: CREATE — RED, producer, GREEN

- [ ] T003 **The state control.** In `buildCheckboxPropertyRow` (`property-row.ts:384-439`), remove
  the leading `createCheckbox` call (`:417`) and add a trailing eye/eye-slash icon button as the
  row's last child, wired to the same `checked`/`onCheckboxClick` semantics under new names (an
  `onToggle` reading the same state). **L1 and L2 RED first**, both numbers recorded
  (`src/views/record-surface/property-row.ts`, `styles.css`)
- [ ] T004 **The required-property contrast.** Give the eye icon a visibly lower-contrast state when
  `checkboxDisabled` (renamed to reflect the new control, e.g. `stateControlDisabled`) is true —
  reduced opacity or a muted colour token, targeting the same order of magnitude as R-2's measured
  gap (`rgb(162,162,162)` vs `rgb(30,30,30)`, §13.12). **L3 RED first** (`src/views/record-surface/property-row.ts`, `styles.css`)
- [ ] T005 **The section cards.** Apply `076/001`'s landed `.obnotion-settings-card` declaration
  (`background: var(--background-primary); border-radius: var(--obnotion-radius-lg); margin: 0 var(--obnotion-sheet-inset) var(--obnotion-space-5);`)
  to `.obnotion-column-manager-section` in `column-manager-renderer.ts`'s `renderSection` output.
  The existing 1-card/0-heading vs 2-card/2-heading branch (`:121-156`) is unchanged at the logic
  level — only the container gains the card treatment. **L4 RED first** (`src/views/column-manager-renderer.ts`, `styles.css`)
- [ ] T006 **The section heading.** Drop `text-transform: uppercase` on
  `.obnotion-column-manager-section-title` (`styles.css:13670-13674`); update the heading strings
  (`panel.shownSection` / `panel.hiddenSection`) to their sentence-case `in table` form in all three
  locales, flagging the open question (`spec.md` §12) inline as a comment rather than resolving it
  silently (`src/i18n.ts`, `styles.css`)
- [ ] T007 **The add-property card.** Give `.obnotion-column-manager-add-row` the same card
  background as T005's sections. The row shape itself is unchanged — confirmed already correct in
  `spec.md` §13.4. **L6 RED first** (`src/views/column-manager-renderer.ts`, `styles.css`)
- [ ] T008 **The row height.** `.obnotion-column-manager-row`'s `min-height: 30px`
  (`styles.css:14336-14344`) → `min-height: var(--obnotion-sheet-row-min-height)`. **L5 RED first at
  30**. Re-run the board-groups panel's shared-row clauses and the `071` regression set in the same
  invocation and record them green (`styles.css`, `tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture, then look at it

- [ ] T009 Run `npm run screenshots </dev/null` and record the exit status and the entry count; then
  `npm run screenshots:verify` and record the stale count; then, if the rebuild harness covers this
  sheet, `node tools/live/sheet-rebuild.mjs </dev/null` and record its exit status. **Then open the
  phone light and the phone dark PNG and look at each one**, and record what changed against the
  pre-change capture both by decoded pixel delta and by eye. **A run that moved nothing proves
  nothing — say so if that is what happened** (`tools/screenshots/capture.mjs`, `screenshots/notion-clone/**`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E-F: VERIFY, REMEDIATE — and the gate no agent ticks

- [ ] T010 Gate (a): run every lane clause (L1-L6) and record each GREEN number beside the RED
  number T003+ recorded. Re-run the `071` clauses and the board-groups shared-row clauses this sheet
  already carries, unchanged, in the same run (`tools/live/sheet-grammar.mjs`)
- [ ] T011 **The judge, and the loop until it passes twice.** Give a Sonnet or Opus reviewer our
  phone captures and the references — **R-1/R-2 for the content, `076/001`'s R-4/R-5 precedent for
  the frame, since this sheet's own frame target is unchanged (§13.1)** — and have it score the
  eight rows of `../spec.md` §5, each 0/1/2, with a one-line justification per row, into
  `verification.md`. **Pass is ≥ 14/16 with no row at 0**; Frame is expected at **1** while ADR-I is
  open (inherited from `076/001`, not re-decided here), so a Frame of 1 is not a remediation trigger.
  Any **other** row below 2 opens a remediation cycle — clause RED for that row, fix, GREEN,
  re-screenshot, re-judge — appended to `verification.md` as its own numbered iteration with its own
  table. **Record the tree hash on every pass**: two passes with a change between them is iteration
  *n+1*, not the second pass. If one row fails **three consecutive** iterations, stop — the target is
  wrong and DEFINE re-opens (`verification.md`, `spec.md`)
- [ ] T012 For every rubric row scoring below 2 (Frame excepted per T011), run the remediation cycle
  to a second consecutive pass. **The child is not done until the judge passes twice in a row on an
  unchanged tree** (`verification.md`, `spec.md`)
- [ ] T013 **Gate (c) and close-out.** Record the operator's device row in `acceptance-criteria.md`
  as **Unmet** — **no agent ticks it**. Then `npx tsc --noEmit`, `npm run build`, `npx vitest run`,
  `npm run gate`, reading each exit status and its output rather than assuming them. Release the
  css-lane triplet naming every capture that moved. Validate with `orchestrator.js --strict`, run the
  scoped `backfill-graph-metadata.js`, re-validate, tick this child's rows in `../goal.md`, move
  `../../roadmap.md` §5.A from `planned` to its landed state, and append a dated entry to the top of
  §1 of `../../handover.md` with `recent_action` ≤ 96 characters (`acceptance-criteria.md`, `../goal.md`, `../../roadmap.md`, `../../handover.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:ordering -->
## Ordering and parallelism

**Strictly sequential.** T003-T008 all edit `styles.css` or the shared row producer; T005 and T007
both need the reused `.obnotion-settings-card` declaration in place once, so T005 precedes T007 in
practice even though nothing blocks doing them the other way round. No `[P]` task in this child.

T008's board-groups regression check depends on T003-T007 already being in (it re-runs the shared
row's clauses after every change that touches the row shell, not just the height).
<!-- /ANCHOR:ordering -->
