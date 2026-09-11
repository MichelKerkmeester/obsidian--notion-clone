---
title: "Tasks: Phase 1: Settings Sheet Visual Parity"
description: "Fourteen write-first tasks: each is RED assertion, producer change, GREEN, capture, judge. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 phase 1 tasks"
  - "001 loop tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 1: Settings Sheet Visual Parity

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

**Write-first is the whole order.** Every task from T004 to T011 runs its clause RED and writes the
failing number into `verification.md` **before** the producer moves, then GREEN with its number
beside it. A task that reports a number it did not read is the failure this packet exists to stop.

Each task is sized for one GLM 5.3 flash or Sonnet leg. The lane clauses are `plan.md` §3.3; the
target rows are `spec.md` §13.3; the rubric instance is `plan.md` §3.5.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A-B: DEFINE and PLAN — closing out

DEFINE and PLAN are written. What remains of them is transcription and the two lanes.

- [x] T001 Transcribe `spec.md` §13.13's three Proposed ADRs — **ADR-I** (the shared header's `✕` against the reference's `Done`), **ADR-J** (the parent's inset-card read of a full-bleed screen, and the presentation rule that reconciles it), **ADR-K** (the dark card/canvas inversion `071/007` left behind) — into `../../roadmap.md` §7.19's table, one row each, raised-by `076/001`. **None is implemented by this child.** Add the §5.A row for this child at `planned` (`../../roadmap.md`)
- [x] T002 Add clauses **L1-L9** to the lane, unwired, in the idiom already there: thresholds beside `SETTINGS_CARD_GAP_MIN_PX` (`:329-330`), geometry inside `measureSettingsRowGrammar` (`:1624-1734`), thresholds applied by the node-side caller (`:4341-4460`). Run each one and **record its RED number** — the count, not the word "fails". **L9 is a guard, not a measurement**: prove it by emptying the stack-row set and watching the landed width clause pass vacuously, then watching L9 turn that into an error (`tools/live/sheet-grammar.mjs`, `verification.md`)
- [x] T003 Acquire the css-lane triplet for `styles.css`, record the baseline hash, and confirm no other child holds it. Add `src/i18n.ts` to the `constructed-view-config` scenario's `sources` list — T009 changes strings, and today's list would leave the capture looking fresh while its content moved (`tools/lane/check-lane.mjs`, `tools/screenshots/constructed-scenarios.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase C: CREATE — RED, producer, GREEN, one property at a time

- [x] T004 **The dark inversion.** Before editing anything, read `getComputedStyle` on the sheet and on a card in both themes and **name the two tokens by computed value** — the capture's canvas resolves to `rgb(46,46,46)` and `tools/screenshots/theme.css:129-131` declares neither `#1e1e1e` nor `#252525` at that value, so the canvas comes from a third token. Decide from that read whether the wrongness is in the plugin or in the harness stand-in (`screenshot-currency.md` §3), then fix it where it is. **L6 RED first** — dark card 30 against canvas 46 — then GREEN with both luminances (`styles.css` `:12363-12367`, `tools/screenshots/theme.css` `:126-131`)
- [x] T005 **The section heading.** Drop `text-transform: uppercase` and `letter-spacing: 0.04em`, take `font-weight` 700 → 400, and move `--obnotion-font-xs` (11px) → `--obnotion-font-md` (13px) on the sheet variant, so `CURRENT DATABASE` reads `Current database`. **L7 RED first** with all three computed values recorded (`styles.css` `:24220-24231`)
- [x] T006 **The navigation-row primitive.** Add `renderNavRow()` beside `renderSelect` (`:2145`): leading icon, label, right-aligned secondary value vertically centred on the label's line, trailing chevron, `min-height: 44px`, whole row a tap target with `role="button"` and a keyboard path. Convert **R11-R15** — View type, Properties, Filters, Sorts, Conditional color — onto it, each opening the picker or sheet it already opens. **L3 RED first at 0** (`src/views/view-config-panel-renderer.ts` `:528-610`, `styles.css`)
- [x] T007 **The database rows.** Convert **R03-R10** — Source folder, Source rules, New note folder, New record template, Database cover, Record icon, Computed sync, Status presets — onto the T006 primitive, each carrying its value as trailing text. **Source rules takes its three bare glyphs (`+`, folder-plus, `>_`) with it into its own sheet**, which is what empties the strip. **L4 RED first at its true count** (`src/views/view-config-panel-renderer.ts` `:630-796`, `:1234-1360`)
- [x] T008 **Retire the bordered form.** `Name` (R01) becomes an icon-chip row with a **borderless** inline field; `Description` (R02) and `Add row noun` (R22) become labelled rows with a borderless inline value; the **textarea path is deleted, not restyled**. **L2 RED first** at the rendered count and the producer's 14 constructions (`src/views/view-config-panel-renderer.ts` `:2190-2243`, `styles.css`)
- [x] T009 **The prose tier.** Remove or shorten every text run over 80 characters that reaches this sheet. Five EN keys exceed it and each has a zh and a zh-TW twin: `viewConfig.sourceRules.help` **147** (`:999`, `:2821`, `:4610`), `viewConfig.viewSourceRulesHint` **141** (`:615`, `:2418`, `:4211`), `viewConfig.computedSync.help` **129** (`:1061`, `:2883`, `:4672`), `viewConfig.newRecordFolderLocked` **128** (`:1051`, `:2873`, `:4662`) and `viewConfig.statusPreset.help` **107** (`:1101`, `:2923`, `:4706`). `settings.sourceFolder.desc` measures **65** and is already inside the rule — leave it. Fix in **all three locales**. An explanation that must survive moves behind the row it explains, never under it. **L5 RED first** with the longest run's length and its key — expected **147**, `viewConfig.sourceRules.help` (`src/i18n.ts`, `src/views/view-config-panel-renderer.ts`)
- [x] T010 **The terminal action card.** `Manage status presets` (R23) becomes an action row — leading icon, label, **no chevron and no value** — in a last card carrying `obnotion-settings-card-footer`. **L8 RED first** (`src/views/view-config-panel-renderer.ts` `:788-795`, `styles.css`)
- [x] T011 **The five cards.** Split `openSection` (`:384-387`) into the five cards of `spec.md` §13.2 — `Name`, `Current database`, `Current view`, `Display`, and the T010 footer — and take the inter-card gap `--obnotion-space-5` (12px) → `--obnotion-space-6` (16px). **L1 RED first at 1 card.** Re-run the whole `071` regression set in the same invocation and record it green: row pitch 44-52px, inset 16px, hairline geometry, 0 native selects, radius and gap floors, title centring (`src/views/view-config-panel-renderer.ts` `:337-470`, `styles.css` `:12363-12367`, `tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: SCREENSHOT — capture, then look at it

- [x] T012 Run `npm run screenshots </dev/null` and record the exit status and the entry count; then `npm run screenshots:verify` and record the stale count; then `node tools/live/sheet-rebuild.mjs </dev/null` and record its exit status and the *"settings sheet chrome survives its own scroll"* result. **Then open the phone light and the phone dark PNG and look at each one**, and record what changed against the pre-change capture both by decoded pixel delta and by eye. **A run that moved nothing proves nothing — say so if that is what happened** (`tools/screenshots/capture.mjs`, `tools/live/sheet-rebuild.mjs`, `screenshots/notion-clone/**`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E-F: VERIFY, REMEDIATE — and the gate no agent ticks

- [ ] T013 **The judge, and the loop until it passes twice.** Give a Sonnet or Opus reviewer our phone captures and the references — **R-4/R-5 for the frame, R-1 for the content** — and have it score the eight rows of `plan.md` §3.5, each 0/1/2, with a one-line justification per row, into `verification.md`. **Pass is ≥ 14/16 with no row at 0**; the plan predicts **15/16** with *Frame* at 1 while ADR-I is open, so a *Frame* of 1 is expected and is not a remediation trigger. Any **other** row below 2 opens a remediation cycle — clause RED for that row, fix, GREEN, re-screenshot, re-judge — appended to `verification.md` as its own numbered iteration with its own table. **Record the tree hash on every pass**: two passes with a change between them is iteration *n+1*, not the second pass. If one row fails **three consecutive** iterations, stop — the target is wrong and DEFINE re-opens (`verification.md`, `spec.md`)
- [ ] T014 **Gate (c) and close-out.** Record the operator's device row in `acceptance-criteria.md` as **Unmet** — **no agent ticks it**. Then `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate`, reading each exit status and its output rather than assuming them. Release the css-lane triplet naming every capture that moved. Validate with `orchestrator.js --strict`, run the scoped `backfill-graph-metadata.js`, re-validate, tick this child's rows in `../goal.md` and `../checklist.md`, move `../../roadmap.md` §5.A from `planned` to its landed state, and append a dated entry to the top of §1 of `../../handover.md` with `recent_action` ≤ 96 characters (`acceptance-criteria.md`, `../goal.md`, `../checklist.md`, `../../roadmap.md`, `../../handover.md`)
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:ordering -->
## Ordering and parallelism

**Strictly sequential.** T004-T011 all edit `styles.css` or the one producer, and `spec.md` §13.10's
properties interact: T011's card split needs T006's primitive to exist, T010's footer card needs
T011's card host, and T008 empties the row set T002's L9 guards. No `[P]` task in this child.

The one dependency that is not internal: **T003 must precede T009**, or the capture that T012 reads
will look fresh while its strings have moved.
<!-- /ANCHOR:ordering -->

---

<!-- ANCHOR:frame-ruling-remediation -->
### Frame-ruling remediation (2026-09-11)

The operator ruled out the card container T011 built (D7, `../decision-record.md`) and separately
named typography and sizing defects on the same sheet, on the same capture (0.0.40). This block runs
**before** T013 is re-attempted: `spec.md` §13 is already rewritten to the divider target; these
tasks carry the shipped tree to it. Write-first, same idiom as T004-T011 — clause RED against the
**shipped, 5-card tree**, then the producer change, then GREEN.

- [ ] T015 **RED.** Run the rewritten `spec.md` §13.11 clauses against the current, unchanged tree
  and record the failing numbers: L1 ("0 card containers under `.obnotion-view-config-body`; ≥4
  dividers") reads **5 card containers, 0 group dividers**; L6 ("0 elements compute a background
  distinct from canvas, both themes") reads **5 elements per theme** (the five `.obnotion-settings-card`
  fills); L8 ("0 card wrapper on the terminal group") reads **1** (`obnotion-settings-card-footer`);
  L10 (row label weight ≤ 500, leading icon 20-22pt) reads today's computed weight and icon size.
  Record every number in `verification.md` before touching the producer (`tools/live/sheet-grammar.mjs`)
- [ ] T016 **Producer change.** Remove `.obnotion-settings-card` and its five container instances from
  `view-config-panel-renderer.ts`'s five groups; replace the card boundary with a hairline divider
  between groups (leading-edge inset to the label, full-bleed to the trailing edge, per `spec.md`
  §13.6); drop the card fill token and the dark-theme retune it needed (D7 retires ADR-K, no fill to
  invert). Retune the row label to regular (400) weight and the leading icon to the 20-22pt range.
  Convert **R09** (`Formula result storage`, `viewConfig.computedSyncMode`) from its inline
  three-option segmented control into a single navigation row — icon, label, the chosen option as its
  trailing value, chevron — opening a picker sheet that lists the three options
  (`displayOnly`/`manual`/`automatic`) as their own rows; carry **R09 (Computed sync)** as the same
  row under its corrected label rather than as a second control (`src/views/view-config-panel-renderer.ts`,
  `styles.css`)
- [ ] T017 **GREEN.** Re-run the same clauses and record: L1 at **0** card containers with the group
  count of dividers now present; L6 at **0** elements with a background distinct from canvas, both
  themes; L8 at **0** card wrapper on the terminal group; L10 at the new label weight and icon size.
  Re-run the `071` regression set and the rest of L2-L5, L7, L9 in the same invocation and confirm
  they stay green (`tools/live/sheet-grammar.mjs`, `verification.md`)
- [ ] T018 **Capture.** Run `npm run screenshots </dev/null`, `npm run screenshots:verify`, and
  `node tools/live/sheet-rebuild.mjs </dev/null`; open the phone light and dark PNGs and confirm by
  eye that no card boundary remains and dividers separate the five groups. Record the pixel delta
  against the pre-remediation capture (`screenshots/notion-clone/**`)
- [ ] T019 **Judge, remediation pass.** Score the eight-row rubric (`spec.md` §5, as rewritten for D7)
  against the new capture, same reviewer discipline as T013: **Frame** and **Sections** score against
  dividers-on-plain-background, and a card container anywhere scores **0** on Frame. Record the score
  table into `verification.md` as its own iteration. This pass, not the pre-remediation one, is what
  T013's "twice consecutively on an unchanged tree" counts from
<!-- /ANCHOR:frame-ruling-remediation -->
