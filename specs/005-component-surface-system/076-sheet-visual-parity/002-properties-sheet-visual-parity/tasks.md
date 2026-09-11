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

- [x] T001 Transcribe `spec.md` §13.13's two Proposed ADRs — **ADR-L** (the scaffold's original
  arrow-removal target corrected rather than followed, per `071/012` ADR-001) and **ADR-M** (this
  child's L5 addresses `roadmap.md` §7.18 ADR-D's 44px-floor gap) — into `../../roadmap.md` §7.19's
  table, one row each, raised-by `076/002`. Mark ADR-D (§7.18) addressed-by `076/002` rather than
  leaving it dangling. **Neither is implemented by this task.** Add the §5.A row for this child at
  `planned` (`../../roadmap.md`)
- [x] T002 Add clauses **L1-L6** to `tools/live/sheet-grammar.mjs`, unwired, in the idiom already
  there. Run each one and **record its RED number** — the count, not the word "fails". Acquire the
  css-lane triplet for `styles.css`, record the baseline hash, and confirm no other child holds it
  (`tools/live/sheet-grammar.mjs`, `verification.md`, `tools/lane/check-lane.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase C: CREATE — RED, producer, GREEN

- [x] T003 **The state control.** In `buildCheckboxPropertyRow` (`property-row.ts:384-439`), remove
  the leading `createCheckbox` call (`:417`) and add a trailing eye/eye-slash icon button as the
  row's last child, wired to the same `checked`/`onCheckboxClick` semantics under new names (an
  `onToggle` reading the same state). **L1 and L2 RED first**, both numbers recorded
  (`src/views/record-surface/property-row.ts`, `styles.css`)
- [x] T004 **The required-property contrast.** Give the eye icon a visibly lower-contrast state when
  `checkboxDisabled` (renamed to reflect the new control, e.g. `stateControlDisabled`) is true —
  reduced opacity or a muted colour token, targeting the same order of magnitude as R-2's measured
  gap (`rgb(162,162,162)` vs `rgb(30,30,30)`, §13.12). **L3 RED first** (`src/views/record-surface/property-row.ts`, `styles.css`)
- [x] T005 **The section cards.** Apply `076/001`'s landed `.obnotion-settings-card` declaration
  (`background: var(--background-primary); border-radius: var(--obnotion-radius-lg); margin: 0 var(--obnotion-sheet-inset) var(--obnotion-space-5);`)
  to `.obnotion-column-manager-section` in `column-manager-renderer.ts`'s `renderSection` output.
  The existing 1-card/0-heading vs 2-card/2-heading branch (`:121-156`) is unchanged at the logic
  level — only the container gains the card treatment. **L4 RED first** (`src/views/column-manager-renderer.ts`, `styles.css`)
- [x] T006 **The section heading.** Drop `text-transform: uppercase` on
  `.obnotion-column-manager-section-title` (`styles.css:13670-13674`); update the heading strings
  (`panel.shownSection` / `panel.hiddenSection`) to their sentence-case `in table` form in all three
  locales, flagging the open question (`spec.md` §12) inline as a comment rather than resolving it
  silently (`src/i18n.ts`, `styles.css`)
- [x] T007 **The add-property card.** Give `.obnotion-column-manager-add-row` the same card
  background as T005's sections. The row shape itself is unchanged — confirmed already correct in
  `spec.md` §13.4. **L6 RED first** (`src/views/column-manager-renderer.ts`, `styles.css`)
- [x] T008 **The row height.** `.obnotion-column-manager-row`'s `min-height: 30px`
  (`styles.css:14336-14344`) → `min-height: var(--obnotion-sheet-row-min-height)`. **L5 RED first at
  30**. Re-run the board-groups panel's shared-row clauses and the `071` regression set in the same
  invocation and record them green (`styles.css`, `tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture, then look at it

- [x] T009 Run `npm run screenshots </dev/null` and record the exit status and the entry count; then
  `npm run screenshots:verify` and record the stale count; then, if the rebuild harness covers this
  sheet, `node tools/live/sheet-rebuild.mjs </dev/null` and record its exit status. **Then open the
  phone light and the phone dark PNG and look at each one**, and record what changed against the
  pre-change capture both by decoded pixel delta and by eye. **A run that moved nothing proves
  nothing — say so if that is what happened** (`tools/screenshots/capture.mjs`, `screenshots/notion-clone/**`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E-F: VERIFY, REMEDIATE — and the gate no agent ticks

- [x] T010 Gate (a): run every lane clause (L1-L6) and record each GREEN number beside the RED
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

---

<!-- ANCHOR:frame-ruling-remediation -->
### Frame-ruling remediation (2026-09-11)

T005 gave this sheet's two groups `076/001`'s `.obnotion-settings-card` treatment; the operator has
since ruled the card container out entirely (D7, `../decision-record.md`), on the same session as
`076/001`'s own remediation. This block runs before T011 is (re-)attempted. Write-first, same idiom
as T003-T008 — clause RED against the **shipped, card-grouped tree**, then the producer change, then
GREEN.

- [x] T014 **RED.** Run the rewritten `spec.md` §13.11 clauses against the current, unchanged tree
  and record the failing numbers: L4 ("0 containers; dividers present") reads **2 section containers
  with a card background, 0 dividers** when ≥1 column is hidden, and **1 container** when none is;
  L6 ("0 containers; dividers present") reads **1 add-property container** with a background distinct
  from canvas. Record both numbers in `verification.md` before touching the producer
  (`tools/live/sheet-grammar.mjs`). **Landed:** the clauses were first rewritten to the
  divider premise, then run against the untouched tree: **L4 FAIL — 2 of 2 groups read as a
  container (radius 8, fill 63.75 vs canvas 45.75) and no divider drawn at the group boundary in
  either theme; L6 FAIL — the add-property row reads as a card in both themes with no divider drawn
  at its seam; L8 FAIL — surface-vs-canvas step 18.0/255 dark, 12.75/255 light against a ceiling of
  1/255.** All three numbers are in `verification.md` before the producer moved
- [x] T015 **Producer change.** Remove the `.obnotion-settings-card` background/radius from
  `.obnotion-column-manager-section` and from `.obnotion-column-manager-add-row`
  (`column-manager-renderer.ts`); when ≥1 column is hidden, paint a hairline divider between the
  `Shown in table` and `Hidden in table` groups (leading-edge inset to the label, full-bleed to the
  trailing edge, the same grammar `076/001`'s remediation lands); when none is hidden, no divider is
  needed since there is only one group. Widen the row min-height target to the 44-48pt provisional
  range alongside `076/001`'s own retune (`src/views/column-manager-renderer.ts`, `styles.css`).
  **Landed:** the declaration is a stylesheet one — the renderer's markup needed no change — so the
  fix is `styles.css` only: both card declarations (fill, radius, card margin) are gone from
  `.obnotion-column-manager-section` and `.obnotion-column-manager-add-row`; the second group draws
  its own leading hairline (`--obnotion-border-subtle`) inset at the label and flush at the trailing
  edge, with the following element's margin carrying the space so the boundary reads as a group edge;
  the suppressed add-action seam is restored and now leads with the same inset. Row min-height stays
  on `--obnotion-sheet-row-min-height` at 48px (already ≥ 44; L5 green, so the 44-48pt retune is owed
  to `076/001`'s own pass, not here)
- [x] T016 **GREEN.** Re-run L4 and L6 and record: L4 at **0** containers in both states, **1** divider
  present when ≥1 column is hidden; L6 at **0** containers, the add-property row's background matching
  canvas. Re-run L1-L3, L5 and the `071`/board-groups regression set in the same invocation and
  confirm they stay green (`tools/live/sheet-grammar.mjs`, `verification.md`). **Landed:** L4 and L8 at
  **0 containers / 0/255 step in both themes**, L6 at **0 containers, 0 boundary problems**, the group
  boundary and the add-action seam both drawing the inset 1px hairline; L1 (0 checkboxes), L2 (10/10
  trailing eyes), L3 (0.5 vs 1), L5 (48px), L7 (both themes fit) and the `071`/board-groups regression
  set all green in the same invocation — `node tools/live/sheet-grammar.mjs` exit 0. The sheet's own
  divider-inset clause and its negative control were flipped in the same pass (a card-premise
  assertion, red the moment the card left)
- [ ] T017 **Capture.** Run `npm run screenshots </dev/null` and `npm run screenshots:verify`; open
  the phone light and dark PNGs and confirm by eye that no card boundary remains and, where a group
  boundary exists, it is a divider. Record the pixel delta against the pre-remediation capture
  (`screenshots/notion-clone/**`). **Partially landed, deliberately not ticked:** the captures ran
  twice (504/504, exit 0 both), `screenshots:verify` 504 current, and the decoded pixel delta across
  both runs is recorded in `verification.md` with a byte-for-byte negative control proving the 13
  movers belong to this change. **The by-eye read is not an agent's to claim** — these captures are
  what the JUDGE node opens at T018
- [ ] T018 **Judge, remediation pass.** Score the eight-row rubric (`../spec.md` §5, as rewritten for
  D7) against the new capture, same reviewer discipline as T011: **Frame** and **Sections** score
  against dividers-on-plain-background, and a card container anywhere scores **0** on Frame. Record
  the score table into `verification.md` as its own iteration. This pass, not any pre-remediation
  pass, is what T011/T012's "twice consecutively" counts from
<!-- /ANCHOR:frame-ruling-remediation -->
