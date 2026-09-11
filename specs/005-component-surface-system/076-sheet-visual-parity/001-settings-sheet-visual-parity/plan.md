---
title: "Implementation Plan: Phase 1: Settings Sheet Visual Parity"
description: "The six-step loop for the Settings Sheet: the exact producer and stylesheet regions, the scenario and the mount function that proves it photographs production, nine numeric lane clauses, the capture set, and this sheet's instance of the eight-row image-judge rubric."
trigger_phrases:
  - "implementation plan"
  - "076 phase 1 plan"
  - "001 six step loop"
  - "001 lane clauses"
  - "001 rubric instance"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phase 1: Settings Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Reference images: see spec.md §Reference images — the planner reads every image before writing lane clauses.

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | The plugin's own sheet renderers plus `styles.css` |
| **Storage** | None — presentational |
| **Testing** | Vitest, `tools/live/sheet-grammar.mjs`, `tools/live/sheet-rebuild.mjs`, the constructed capture pipeline, and an image judge |

### Overview

The Settings sheet is a settings **form** — bordered boxes with prose under them — where the
reference is a settings **list**: rows you tap, values on the right, and nothing to read. `spec.md`
§13 is the brief; this file is how it is built and how it is proved.

### Reference mapping

Every Notion iOS capture here is **299×678**, a Mobbin thumbnail. The Notion column of `spec.md` §13
is **structural**; every pixel figure is ratio-derived, marked provisional in §13.12, and **no lane
clause in §3.3 asserts one** (parent D3). Rungs 1 and 2 are empty —
`screenshots/notion/ios/operator/` does not exist, checked this session.

> Runs through the parent's loop graph: see `../plan.md` §6A "Running a child through the loop" for the node/edge tables, the verdict-file and state-record schemas, and what happens at GATE and ESCALATE (`../decision-record.md` D6).

### What the DEFINE step changed about the plan

Two findings moved this plan away from the scaffold's assumptions, and both are evidenced in
`spec.md` §13.0 and §13.7:

1. **The card grouping `071/007` landed is correct and stays.** Notion's grouping idiom follows its
   presentation — full-screen lists group full-bleed, bottom sheets group into inset rounded cards —
   and our surface is a bottom sheet. The work is *inside* the cards, not on them.
2. **The dark theme is measurably inverted** in the capture the judge scores, and the token that
   paints the canvas is in neither of the two files anyone would guess. T004 names it before it
   changes it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready

- [x] DEFINE table complete; every reference path resolves (`spec.md` §13.0, seven references, all opened)
- [x] Every production surface enumerated (D2a) — `spec.md` §3; one surface, already registered
- [x] Every numeric target ours or provisional-with-a-settler (D3) — `spec.md` §13.12
- [x] The scenario proven to mount production, by reading each link rather than assuming it (§3.2)

### Definition of Done

- [ ] Every lane clause RED-then-GREEN with **both** numbers recorded in `verification.md`
- [ ] `npm run screenshots` exit 0; `npm run screenshots:verify` 0 stale; both themes opened and looked at
- [ ] `node tools/live/sheet-rebuild.mjs` exit 0 — it covers this sheet (§3.4)
- [ ] Judge ≥ 14/16, no row at 0, **twice consecutively on an unchanged tree**, with the tree hash recorded on both passes
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row present and **unticked**
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### 3.1 Files to change — the exact regions

| File | Region | What moves |
|---|---|---|
| `src/views/view-config-panel-renderer.ts` | `render()` `:337-470`, `openSection` `:384-387` | Two sections become the five cards of `spec.md` §13.2 |
| ″ | **new** `renderNavRow()` beside `renderSelect` `:2145` | The navigation-row primitive: leading icon · label · trailing value · chevron, `≥ 44px` |
| ″ | `renderText` `:2190`, `renderTextarea` `:2220` | Borderless inline row field; the textarea path is deleted, not restyled |
| ″ | `renderDatabaseGlobals` `:630-658`, `renderDatabaseSettings` `:769-796` | R02-R10 become navigation rows |
| ″ | `renderAppliedSummaries` `:528-543`, `renderAppliedSummary` `:563-572` | R12-R15: summary rows gain icon, chevron and a tap target |
| ″ | `renderViewType` `:573-610` | R11: dropdown → navigation row opening the existing picker |
| ″ | `renderSourceRules` `:1234`, `renderSourceRuleGroup` `:1308` | R04: the three bare glyphs leave this sheet with the editor |
| `styles.css` | `:12363-12367` `.obnotion-settings-card` | Gap `--obnotion-space-5` → `--obnotion-space-6`; card fill re-tuned to the §13.7 direction |
| ″ | `:24220-24231` `.obnotion-view-config-section-title` | Drop `text-transform`, `letter-spacing`; `700 → 400`; `--obnotion-font-xs` → `--obnotion-font-md` |
| ″ | `:12333-12351` the hairline `::before` | Unchanged — the landed `071/007` grammar; re-run as regression |
| ″ | **new** `.obnotion-settings-nav-row`, `.obnotion-settings-card-footer` | The nav-row and terminal-action-row paint |
| `tools/screenshots/theme.css` | `:126-131` `.theme-dark` | **Only if T004's computed read names the stand-in as the wrong file** |
| `src/i18n.ts` | `viewConfig.sourceRules.help` `:999`, `viewSourceRulesHint` `:615`, `computedSync.help` `:1061`, `newRecordFolderLocked` `:1051`, `statusPreset.help` `:1101` — each with its zh and zh-TW twin | L5: the five EN runs over 80 chars (147 / 141 / 129 / 128 / 107), all three locales |
| `tools/live/sheet-grammar.mjs` | `:318-330` thresholds, `:1609-1760` the measure, `:4341-4460` the caller | Clauses L1-L9 (§3.3) |
| `verification.md` | new | One score table per judge iteration |

### 3.2 The scenario, and the mount function that proves it photographs production

**It already mounts production. Verified link by link this session, not assumed:**

```
tools/screenshots/constructed-scenarios.mjs:921
  constructedScenario("view-config", { renderer: "view-config", … })
    → mountConstructed(page, device, theme, spec)                 node-side driver
      → window.__mountConstructed(spec)                           CONSTRUCTED_ENTRY_BODY, in-page
        → runRenderAssertions(document.body, spec, …)             tools/live/render-assertion-harness.ts
          → the `scenario.renderer === "view-config"` branch      :3412, else-branch at :3457
            → new ViewConfigPanelRenderer().render(container, …)  :3475   ← the shipped renderer
              → provenanceResult(container, "view-config-panel-renderer")  :3477
```

`render()`'s own `isMobileBottomSheet(panel.ownerDocument)` fork at `:361` is what makes it the phone
bottom sheet on the device pass — the harness does not decide that, and neither does the scenario.

**So task 1 is not a scenario fix**, and the mismatch that would have made it one does not exist:
the three fixtures that duplicate this sheet — `panel-view-config`, `panel-view-config-sheet`,
`panel-settings-side-sheet` — each declare `fixtureOf: "constructed-view-config"`, so the constructed
capture is already the authority. Captures:
`screenshots/notion-clone/panels/constructed-view-config-mobile-{light,dark}.png`, 804×1748.

**One caveat that binds T004** (`screenshot-currency.md` §3): the harness stands in for what Obsidian
supplies through `tools/screenshots/theme.css` and `runtime-vars.css`. A colour that looks wrong in
the capture may be a gap in the stand-in rather than a defect in the plugin, and T004 reads the
computed value to decide which **before** it edits either file.

### 3.3 The lane assertions — nine clauses, each a number

Written into `tools/live/sheet-grammar.mjs` in the idiom already there: thresholds as module consts
beside `SETTINGS_CARD_GAP_MIN_PX` (`:329-330`), geometry gathered in `measureSettingsRowGrammar`
(`:1624-1734`), thresholds applied by the node-side caller (`:4341-4460`) with one
`console.log("  PASS|FAIL  …")` per measurement and `failures.push` on breach.

| # | Clause, stated numerically | RED expected today |
|---|---|---|
| **L1** | `cards.length ≥ 5`; every `borderRadius ≥ 8`; every consecutive gap `≥ 8` | 1 card |
| **L2** | Count of `input[type=text]`, `textarea` in the body whose computed `border-*-width` is non-zero on any side `=== 0` | ≥ 4 rendered, 14 constructions in the producer |
| **L3** | Count of rows carrying **all three** of a leading icon, a right-aligned secondary value vertically centred on the label (`|Δcentre| ≤ 4px`), and a trailing chevron, **and** `height ≥ 44` — `≥ 13` | 0 |
| **L4** | Count of `button` elements in the body with no non-empty text node `=== 0` | ≥ 3 |
| **L5** | Longest text run in the body `≤ 80` characters, asserted per locale over the derived sheet-reachable key set | **147** — 5 EN keys over |
| **L6** | `relativeLuminance(card.background) > relativeLuminance(canvasBackground)` in **both** themes, from `getComputedStyle` | dark: 30 vs 46 — inverted |
| **L7** | Section heading computes `text-transform === "none"`, `letter-spacing === "normal"`, `font-weight ≤ 500` | `uppercase` / `0.04em` / `700` |
| **L8** | Last card has `obnotion-settings-card-footer`; count of its rows with a chevron **or** a trailing value `=== 0` | no footer card |
| **L9** | *(guard)* the landed stack-row width clause **fails on an empty set** rather than passing vacuously | passes on a non-empty set — goes vacuous the moment L2 lands |

**L9 exists because this plan empties the set a landed clause measures.** `spec-tree-layout.md` §2
records the same class in `scan-failing-values.mjs`: a lane that walks a fixed set reports clean when
the set empties. Making an empty result an error is the fix there and here.

**Regression set, re-run unchanged in the same invocation:** `071`'s row pitch 44-52px, row inset
16px, hairline geometry (1px, `left: 16px`, `right: 0`), 0 native selects, card radius/gap floors,
and the shared title-centring clause.

**Each clause is proven able to fail before it is asked to pass.** The lane already ships
`window.__shellSettingsRowGrammarNegativeControl` (`:1743`) and
`…ColumnControl` (`:1768`); L1-L8 each get their mutation recorded RED-with-a-number in
`verification.md` before the producer moves.

### 3.4 The capture set

| Capture | Command | What it proves |
|---|---|---|
| `constructed-view-config-mobile-light.png` | `npm run screenshots` | The judged surface, light |
| `constructed-view-config-mobile-dark.png` | ″ | The judged surface, dark — and L6's direction by eye |
| `constructed-view-config-sheet-mobile-{light,dark}.png` | ″ | **The judged image** — the full-sheet variant, the sheet expanded past its 90svh cap to its own content height (2101px against the 874px viewport), so the cards a viewport crop keeps below the fold (C3–C5) are scored |
| `constructed-view-config-desktop-{light,dark}.png` | ″ | Regression only: the anchored side sheet keeps the continuous list and must not gain cards |
| `panel-view-config*`, `panel-settings-side-sheet*` | ″ | The three `fixtureOf` fixtures, which move with the constructed one |
| Freshness | `npm run screenshots:verify` | 0 stale. `sources` for the constructed scenario must gain `src/i18n.ts` — L5 changes strings and today's list would not invalidate the capture |
| **Real-app WebKit** | `node tools/live/sheet-rebuild.mjs` | It covers this sheet: surface *"settings sheet chrome survives its own scroll"* (`:56`), reading `.obnotion-view-config-panel .obnotion-mobile-bottom-sheet-handle` at `:657`. Exit 0 required |

### 3.5 The image-judge rubric instance for this sheet

The parent's eight rows (`../spec.md` §5), each with the concrete expectation a reviewer checks for
**this** sheet. Reference for the judge: **R-4 and R-5** for the frame, **R-1** for the content.
Pass is **≥ 14/16 with no row at 0**.

| Row | What scores 2 on the Settings sheet | Target |
|---|---|---|
| **Frame** | Grab handle centred above the header; title centred within 1px; canvas token visibly distinct from the card token in both themes; card radius 8px | **1** — the trailing control is a `✕` where the reference has `Done`. Held as **ADR-I**; 1 is planned, not conceded, and 2 is unreachable without a family decision |
| **Sections** | Five cards in the §13.2 order, grey sentence-case headings above their own card, the last card a chevron-less action card | 2 |
| **Row anatomy** | Leading icon · label · right-aligned grey value · chevron, on **one line**, on ≥ 13 rows; no stacked label-over-control anywhere | 2 |
| **Controls** | Four control kinds only — navigation row, toggle row, borderless inline field, action row. **Zero** bordered inputs, **zero** textareas, **zero** bare glyph buttons, **zero** native selects | 2 |
| **Type** | Heading 13px/400/sentence case; label and value the same size; no prose tier at all | 2 |
| **Spacing** | 44px row pitch, 16px inset, 8px radius, 16px inter-card gap, headings on the canvas | 2 |
| **Colour** | Label near-`--text-normal`, value `--text-muted`, divider subtle, chevron at the value's weight; no contrast regression | 2 |
| **Both themes** | The card band is lighter than its canvas in **both**; judged on internal consistency, since no dark Notion reference exists at any rung (§13.0) | 2 |

**Planned total: 15/16, no row at 0.** A plan that predicts 16 while ADR-I is open would be
predicting something it has no way to deliver.

### Pattern

Producer plus stylesheet. No new runtime pattern, no new dependency, no behaviour change: every
`Tap opens` in §13.3 names a picker, sheet or editor the plugin already ships.

### Data flow

Unchanged. Only arrangement, grouping, labelling and control kind move.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — a presentational change to the surfaces named above. No security, path handling,
env precedence, schema boundary, persistence, public response or shared policy is touched. The one
shared artefact in the Files table is `styles.css`, serialised by the css-lane triplet (T003/T014).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES — the six steps

| Phase | Step | Tasks | Artefact | Pass rule |
|---|---|---|---|---|
| A | DEFINE | **complete** — `spec.md` §13; T001 transcribes its three Proposed ADRs | `spec.md` §13 | Every row has a target; every reference resolves; every number ours or provisional-with-a-settler |
| B | PLAN | **complete** — this file; T002-T003 land the lane and the css-lane | §3 + `tools/live/sheet-grammar.mjs` | Producer, stylesheet region, scenario **and mount function**, and one clause per measurable row all named |
| C | CREATE | T004-T011 | Commits | Each clause RED with its number, then the producer, then GREEN with its number |
| D | SCREENSHOT | T012 | The capture set | `npm run screenshots` exit 0; light **and** dark current and looked at; `sheet-rebuild.mjs` exit 0 |
| E | VERIFY | T013 | `verification.md` | Lane green **and** judge ≥ 14/16 with no 0 |
| F | REMEDIATE | T013 (loop), T014 | `verification.md` iterations | Any row < 2 opens RED→fix→GREEN→recapture→re-judge; done needs **two** consecutive passes on an unchanged tree |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | L1-L9 plus the `071` regression set, one run | `tools/live/sheet-grammar.mjs` |
| Negative control | Each of L1-L8 mutated red before it is asked to pass | `__shellSettingsRowGrammarNegativeControl` and per-clause mutations |
| Unit | The nav-row primitive's element order and the 80-char string rule, revert-proof | Vitest, `src/i18n.test.ts` |
| Capture | Phone light + dark through the production mount path | `npm run screenshots`, `npm run screenshots:verify` |
| Real-app (WebKit) | *"settings sheet chrome survives its own scroll"* on an emulated iPhone | `node tools/live/sheet-rebuild.mjs` |
| **Image judge** | The §3.5 rubric instance, our capture beside R-1/R-4/R-5 | A Sonnet or Opus reviewer; result in `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone — **not agent-tickable** |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| The css-lane triplet on `styles.css` | Internal | One holder at a time | Edits serialise or conflict; T003 acquires, T014 releases |
| **OC-S1** — full-res operator capture of View options, light | External | **Not supplied** | Structural targets unaffected; §13.12's provisional column waits |
| **OC-S2** — the same screen in **dark** | External | **Not supplied** | The dark column has no reference at any rung; the *Both themes* row is judged on internal consistency until it lands |
| An image-judge reviewer | External (model) | Available | Without it the child cannot close (D1) |
| **ADR-I** — `✕` versus `Done` across the shared header | Operator | **Proposed** | *Frame* caps at 1; the child still passes at 15/16 |
| `071`'s landed clauses | Internal | Green | Must not regress; re-run unchanged in the same invocation |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a `071` clause regresses and cannot be closed inside this child's files; or the judge
  fails a third consecutive iteration on the same rubric row, which means the target is wrong rather
  than the implementation.
- **Procedure**: revert this child's producer and stylesheet commits — the surface returns to its
  shipped shape, which is green on the existing lane — and release the css-lane triplet naming every
  capture that moved. L1-L9 go red and are reverted in the same commit. **A wrong target re-opens at
  DEFINE, not at CREATE.**
- **The one-way door to watch**: L2 deletes the textarea path rather than restyling it. If
  `Description` has to come back as a multi-line control, it comes back as a row that opens its own
  editor — not as a box in this sheet.
<!-- /ANCHOR:rollback -->
