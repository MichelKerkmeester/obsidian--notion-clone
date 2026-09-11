---
title: "Feature Specification: Phase 1: Settings Sheet Visual Parity"
description: "The Settings sheet is one large white card wrapped around a form of bordered text inputs and helper paragraphs; Notion's equivalent is a table of contents built from several inset cards of navigation rows."
trigger_phrases:
  - "076 phase 1"
  - "settings sheet visual parity"
  - "001 define table"
  - "settings sheet image judge"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/001-settings-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "DEFINE + PLAN: brief, delta, 9 clauses, 14 tasks"
    next_safe_action: "Execute tasks.md T001 (transcribe ADR-I/J/K), then T002 lane RED"
    blockers:
      - "No number may come from a 299x678 reference asset (D3)"
      - "The child does not close until the image judge passes twice on an unchanged tree (D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/view-config-panel-renderer.ts"
      - "styles.css"
      - "src/i18n.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "001-settings-sheet-visual-parity-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 0
    open_questions:
      - "Done versus the shared close glyph on all eleven sheets: ADR-I; Frame targets 1 until taken"
      - "No dark Notion reference at any rung: 123 candidates scanned, all light. OC-S2 settles it"
      - "Inter-card gap: 12px landed versus 16px ratio-derived. A retune, not a gate (OC-S1)"
    answered_questions:
      - "constructed-view-config reaches ViewConfigPanelRenderer.render at harness:3475; no scenario work owed"
      - "Grouping idiom follows presentation: full-screen full-bleed, sheets inset cards. 071/007 stands"
      - "View options has no destructive row: content ends after Duplicate view; tail ink is the home indicator"
      - "Pass is 14/16 with no rubric row at 0, twice consecutively on an unchanged tree"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 1: Settings Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The Settings sheet is one large white card wrapped around a form of bordered text inputs and helper paragraphs; Notion's equivalent is a table of contents built from several inset cards of navigation rows.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside the reference and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: none — this is the first child, and the operator named its sheet. `../002-properties-sheet-visual-parity/` inherits this child's settled vocabulary.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | DEFINE, PLAN and CREATE complete — awaiting the image judge and the operator |
| **Created** | 2026-09-10 |
| **Branch** | `worktrees/290-sheet-parity-program` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `076-sheet-visual-parity` |
| **Predecessor** | None |
| **Successor** | `../002-properties-sheet-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 1** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:40 ruling — *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"* and *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*.

**Scope boundary**: the Settings Sheet and every other production surface that renders its grammar. Presentational only — no behaviour, persistence or stored shape moves.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row, the producer changes that reach them, a current phone light + dark capture set, and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The Settings sheet is one large white card wrapped around a form of bordered text inputs and helper paragraphs; Notion's equivalent is a table of contents built from several inset cards of navigation rows.

### Purpose

The Settings Sheet reads as its reference does — frame, sections, row anatomy, controls, type, spacing, colour and both themes — and that reading is established by a reviewer opening the two images side by side, not by a number going green.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the sheet is named after:

- `constructed-view-config` — `constructedScenario("view-config", { renderer: "view-config", viewConfigVariant })` in `tools/screenshots/constructed-scenarios.mjs`, mounted by `mountConstructed` → `window.__mountConstructed` → `runRenderAssertions`, harness branch `scenario.renderer === "view-config"` at `tools/live/render-assertion-harness.ts:3412`. Captures `screenshots/notion-clone/panels/constructed-view-config-mobile-{light,dark}.png`
- Fixtures `panel-view-config`, `panel-view-config-sheet` and `panel-settings-side-sheet` all declare `fixtureOf: "constructed-view-config"`, so the constructed capture is already the authority and no scenario work is owed

### Producers

- `src/views/view-config-panel-renderer.ts` — builds every row of the sheet
- `styles.css` — the sheet's card, section and row tokens
- `src/i18n.ts` — the `settings.*.desc` helper strings the redesign removes or moves

### Out of Scope

- Behaviour, semantics, persistence and data shape
- Desktop presentations, except as a regression check
- Reopening any `071` landing. A contradiction becomes a Proposed ADR in `../../roadmap.md` §7 (D15), never an amendment made here
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 — Blockers (MUST complete)

- **REQ-001** Every numeric target in §13 is measured from our own tree or marked `TBD — needs operator capture`. None is derived from a 299×678 reference asset (D3)
- **REQ-002** Every production surface rendering this grammar is enumerated before any file is named (D2a)
- **REQ-003** Every lane clause runs RED with its failing number recorded before the producer moves
- **REQ-004** The image judge scores ≥ 14/16 with no row at 0, **twice consecutively on an unchanged tree** (D1)

### P1 — Required

- **REQ-005** Phone light and dark captures are current, and both were opened and looked at
- **REQ-006** The `071` clauses this sheet already carries re-run unchanged and green
- **REQ-007** The operator's device row is present and unticked (D5)
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

| ID | Criterion | Measured by |
|----|-----------|-------------|
| SC-001 | Every row of §13 has a target, and every reference path resolves | `spec.md` §13 |
| SC-002 | Every lane clause green, each with its RED number recorded beside it | `tools/live/sheet-grammar.mjs` |
| SC-003 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree | `verification.md` |
| SC-004 | The operator reads the sheet on their own iPhone and reports it aligned | Operator — **no agent ticks this** |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|------|--------|------------|
| A green lane over an unchanged picture — the failure that opened this programme | The sheet ships looking the same | D1: the judge is a required gate; every rubric row is written about identity and appearance, not count |
| A second surface renders the same grammar and is missed | Half the sheet is fixed | D2a: §3 enumerates every producer before §13 names a file |
| A number is read off a 299×678 thumbnail | A target that is precise and wrong | D3: structural reference only; every number is ours or `TBD` |
| `styles.css` contention with another child | Two changes each pass alone and conflict merged | D4: one child at a time, one css-lane holder |
<!-- /ANCHOR:risks -->

---

## 7. NON-FUNCTIONAL REQUIREMENTS

Touch targets ≥ 44px on every control this child adds or moves. No contrast regression in either theme. No new dependency, no new runtime pattern.

---

## 8. EDGE CASES

- The sheet at its longest content, against the 90svH cap and the published keyboard inset
- The sheet with the keyboard up
- Empty and single-item states for every list this sheet renders
- Both themes, each read on its own rather than assumed from the other

---

## 9. COMPLEXITY ASSESSMENT

Level 2. One surface family, presentational, with a shared stylesheet and a shared row vocabulary. The complexity is in the verification loop, not the change.

---

## 10. RISK MATRIX

| Area | Likelihood | Impact | Net |
|---|---|---|---|
| Visual regression on a sibling sheet sharing a primitive | Medium | High | Regression clauses re-run in the same lane run |
| The target itself is wrong | Low | High | Three failed judge iterations on one rubric row re-opens DEFINE rather than patching CREATE |

---

## 11. USER STORIES

As the operator, I open the Settings Sheet on my iPhone and it reads like Notion's, so I stop reporting it.

---

## 12. OPEN QUESTIONS

- **Does the operator accept `Done` in place of `✕` across all eleven sheets?** Notion's bottom sheet closes on a text `Done` in accent blue (R-4) or a `‹` back (R-5), never a `✕`. `buildShellHeader` is shared, so this is a family decision — held as **Proposed ADR-I** (§13.13), and until it is taken the rubric's *Frame* row targets **1** rather than 2
- **The whole dark-theme column has no reference at any rung.** All three view-options files and all 120 `database/` files were scanned by mean luma this session and every one is light. Every dark target is ours, and **OC-S2** — a dark-theme operator capture — is what would settle it
- **Is the inter-card gap 12px or 16px?** 12px is landed; 16px is the thumbnail's ratio-derived reading. The lane keeps its `≥ 8px` floor either way, so the question is a retune and not a gate (**OC-S1**)
- Every number in §13 that came from a 299×678 asset is marked provisional in §13.12, and **no lane clause asserts one of them** (D3)

---

<!-- ANCHOR:gap-table -->
## 13. DEFINE — the designer's brief, and the delta

> This section is written as a brief to a builder. §13.0 records what was read and what could not
> be; §13.1-§13.8 are the target, property by property; §13.9 is the honest before; §13.10 is the
> delta table with its rubric mapping; §13.11 the lane clauses; §13.12 the provisional register;
> §13.13 the contradictions held Proposed.

### 13.0 The references, and the one rule that governs them

Reference precedence is parent **D3**. Rung 1 (operator capture) and rung 2 (full-resolution Notion
iOS) are both **empty** — `screenshots/notion/ios/operator/` does not exist, checked this session.
Every read below is rung 3, a Mobbin thumbnail at **299×678**, `sips`-confirmed on all three
view-options files.

| # | Path | What it is | What it answers |
|---|---|---|---|
| R-1 | `screenshots/notion/ios/flows/view-options/notion-ios-flow-view-options-02-794591f5-*.webp` | Notion's **View options**, full-screen, at rest | The row inventory, the row anatomy, the group order, the section-header treatment |
| R-2 | `…-view-options-03-e4dfff31-*.webp` | The same screen, **View name focused, keyboard up** | The keyboard-open state: the list does not restructure, the focused row shows its value in place, a second `Done` appears on the keyboard accessory bar |
| R-3 | `…-view-options-01-213f8a7c-*.webp` | The database page the sheet opens from | Context only — it is **not** the sheet, and no target is taken from it |
| R-4 | `screenshots/notion/ios/database/notion-ios-database-database-01-2cb53019-*.webp` | **Data source actions**, a bottom sheet | The bottom-sheet frame and the terminal action card |
| R-5 | `…-database-14-d1de51a5-*.webp` | **Layout**, a bottom sheet | The bottom-sheet frame, the drill-in card, and the toggle-row / navigation-row mix |
| R-6 | `…-database-15-cc8b241a-*.webp` | **Property visibility** | `002`'s reference; consulted here only for the shared card vocabulary |
| R-7 | `047` research and `screenshots/anytype/**` | Anytype | Tie-breaks only, under D15 |

**The governing finding, and it is the reason the earlier structural read looked wrong.**
`../spec.md` §4 describes View options as *"three separate inset cards with visible gaps between
them"*. Measured on R-1, that is **false of that screen**: sampling the row bands at `x=0` and
`x=298` returns `rgb(255,255,255)` and the spacer bands return `rgb(247,247,245)`, the dividers span
`x=0…298` with no left inset, and probing the group's top-left corner at `y=170…182, x=0…10` shows a
clean grey→white step with no rounding. R-1's groups are **full-bleed white bands with zero radius
and zero horizontal inset.**

R-4 and R-5 then settle the *structural* question — both are **bottom sheets** — grab handle,
rounded top, dimmed backdrop — and both draw their groups as inset rounded cards: white span
`x=12…286` on a `rgb(250,248,246)` canvas, corner curve resolving over ~6px, 12-13px of canvas
showing between cards. That reading stood as this child's target through its first CREATE landing.

> **Superseded 2026-09-11 by D7 (operator ruling, not a reference correction).** The operator, having
> seen the card container this reading produced on-device (`0040-properties-card-container-rejected.png`),
> ruled it out directly: *"Never use bg container like here for values, notion / anytype use
> dividers on plain sheet bg thats better."* **Notion's own inset-card idiom for a bottom sheet is no
> longer this packet's target, regardless of how faithfully R-4/R-5 show it.** Every sheet in this
> packet, including this one, groups its rows with **hairline dividers on the plain sheet
> background** — inset from the leading edge to the label, full-bleed to the trailing edge — and
> never inside a rounded or lighter container. `071/007`'s card landing and its dark-theme retune are
> retired by this ruling (`roadmap.md` §7.19 ADR-J and ADR-K, both **resolved by the operator**, not
> left Proposed). §13.1-§13.11 below are rewritten to this target; §13.9's "before" reading is left
> as the historical record of the pre-`076` state, and the shipped-cards state this child's first
> CREATE produced is itself now a remediation input, carried in `tasks.md`'s
> `### Frame-ruling remediation (2026-09-11)` block rather than rewritten into history here.

**What the references cannot answer.**

- **No dark-theme Notion capture exists.** All three view-options files and all 120 `database/`
  files were scanned by mean luma this session; the single sub-110 result is a light screen behind a
  modal scrim, not a dark theme. **Every dark-theme target below is ours**, justified by internal
  consistency and by the iOS elevation convention, and the rubric's *Both themes* row is judged on
  internal consistency, never against a dark reference.
- **No destructive row.** R-1's content terminates after `Duplicate view`: the band from `y=578` to
  `y=647` is uniform `rgb(247,247,245)` whose only ink is the home indicator at `y≈638`. The screen
  is at scroll-top, so nothing is below a fold. This **corrects** the scaffold's *"unreadable at
  299×678 — below the fold"*: the honest read is that **this screen has no destructive row**, and
  `001` still claims no position for one, because our sheet has none to place.
- **Every pixel value is ratio-derived and provisional.** R-1's status-bar-plus-nav-bar band measures
  78px; at 59pt + 44pt that fixes the device at 393×852pt and the scale at `299/393 = 0.7608`, so
  1 thumbnail px = 1.3143pt. Every pt figure below carries that division. **Under D3 no lane clause
  asserts one of them** (§13.11); they are design intent, and §13.12 names what settles each.
- **The accent blue behind `Done` is `thumbnail, value unreadable`** — the glyph is 9px tall and
  antialiased against white.
- **Divider thickness is `thumbnail, value unreadable`** — 1-2 thumbnail px at 0.76 scale cannot
  distinguish a 0.33pt hairline from a 1pt rule.

---

### 13.1 (a) The sheet frame

Read from R-4 and R-5, which are the bottom sheets. Ours in `styles.css:237` and `buildShellHeader`.

| Property | Target | Where it comes from |
|---|---|---|
| Presentation | Bottom sheet, `max-height: calc(90svh - keyboard inset)` | Ours, landed by `005/003`; unchanged |
| Backdrop | Dimmed scrim, sheet rounded at the top only | Ours; matches R-4's `rgb(~222)` scrim |
| Sheet top radius | Unchanged from the landed sheet token | R-4's corner resolves over ~8-10 thumbnail px (~11-13pt) — provisional, **not asserted** |
| Grab handle | **Present**, centred, above the header | R-4 and R-5 both show one; the parent's rubric row *Frame* names it |
| Canvas | **One surface token for the whole sheet body — no second "card" surface painted on top of it (D7).** Rows are separated by hairline dividers, not by a second background | Operator ruling, D7; supersedes the R-4/R-5 card/canvas pair (`rgb(250,248,246)` canvas, `rgb(255,255,255)` card) this row targeted before 2026-09-11 |
| Title | Centred within 1px, one line, semibold | R-1/R-4/R-5 all centre it; R-1's title bbox centre is `x=149.0` against a screen centre of `x=149.5` |
| Trailing control | **`✕` — unchanged for this child.** R-4 shows a text `Done` in accent blue; R-5 shows a `‹` back and no trailing control; ClickUp (D9) shows a round `✕` in a circle. Neither Notion form is a bare `✕` | `buildShellHeader` is shared by all eleven sheets, so the change is a family decision → **Proposed ADR-I** (§13.13), now informed by ClickUp's circular-close precedent too. The rubric's *Frame* row therefore targets **1**, not 2 (§13.10) |
| Leading control | None | R-1 and R-4 have nothing top-left; R-5's `‹` belongs to a drill-in, which this sheet is not |
| Footer | None. The last divider-separated group's terminal action row is the footer | R-1 and R-4 both end on a terminal group, then canvas |

---

### 13.2 (b) The section list, in order

**Five divider-separated groups, not cards (D7).** Each is one kind of row throughout — the rule R-1
and R-5 both obey: **router rows carry leading icons; option rows do not; action rows carry an icon
and no chevron.** Headings are grey, **sentence case**, regular weight, sitting on the plain sheet
background above their own group (R-1's `View name`), with a hairline divider — not a card edge —
separating each group from the next.

| # | Heading | Kind | Rows |
|---|---|---|---|
| G1 (formerly C1) | `Name` | naming | 1 |
| G2 (formerly C2) | `Current database` | router | 9 |
| G3 (formerly C3) | `Current view` | router | 6 |
| G4 (formerly C4) | `Display` | option | 6 |
| G5 (formerly C5) | *(none)* | action, terminal | 1 |

R-1's own shape is the same four kinds in the same order: a one-row naming group under a grey
heading, two router groups, then a terminal action group with no heading and no chevrons. **The
group boundary is a hairline divider on the plain background, never a card edge** — the `C1`-`C5`
labels used elsewhere in this document (§13.3's row table, `tasks.md`, `plan.md`) name the same five
groups and are read as group identifiers from 2026-09-11 forward, not as card identifiers.

---

### 13.3 (c) The row-by-row table

Trailing `›` means a chevron. `[value]` is right-aligned secondary text. `⟨field⟩` is a borderless
inline text field on the row's own background — **not** a bordered box.

| # | Group | Leading icon | Label | Trailing element | Tap opens |
|---|---|---|---|---|---|
| R01 | G1 | database chip (bordered rounded square) | *(none — the field carries the placeholder)* | `⟨database name⟩` | inline edit, in place |
| R02 | G2 | `file-text` | Description | `⟨description⟩` / `None` | inline edit, in place |
| R03 | G2 | `folder` | Source folder | `[notes]` `›` | the existing folder picker |
| R04 | G2 | `filter` | Source rules | `[None]` / `[n rules]` `›` | a Source rules sheet — **and the three bare glyphs go with it** |
| R05 | G2 | `folder-plus` | New note folder | `[value]` / `[Same as source]` `›` | the existing folder picker |
| R06 | G2 | `file-plus-2` | New record template | `[value]` / `[Not set]` `›` | the existing template picker |
| R07 | G2 | `image` | Database cover | `[Not set]` `›` | the existing cover picker |
| R08 | G2 | `smile` | Record icon | `[value]` / `[Not set]` `›` | the existing icon-field picker |
| R09 | G2 | `refresh-cw` | Formula result storage (this sheet's own row grammar previously mislabelled it "Computed sync"; the shipped UI string is `viewConfig.computedSyncMode`, "Formula result storage") | `[chosen option]` `›` | **a picker sheet**, the three options (`Show only in this database`, `Save to note properties manually`, `Automatically save to note properties`) as three navigation/selection rows — not inline segmented buttons |
| R10 | G2 | `list-checks` | Status presets | `[n presets]` `›` | the existing preset manager |
| R11 | G3 | `table` | View type | `[Table]` `›` | the existing view-type picker |
| R12 | G3 | `list` | Properties | `[n shown]` / `[All shown]` `›` | the Properties sheet |
| R13 | G3 | `filter` | Filters | `[None]` / `[n applied]` `›` | the Filter sheet |
| R14 | G3 | `arrow-up-down` | Sorts | `[None]` / `[n applied]` `›` | the Sort sheet |
| R15 | G3 | `palette` | Conditional color | `[None]` / `[n rules]` `›` | the existing conditional-format editor |
| R16 | G3 | `sliders-horizontal` | View source rules | switch | toggles in place |
| R17 | G4 | *(none)* | Row density | `[Default]` `›` | a density picker |
| R18 | G4 | *(none)* | Wrap text | switch | toggles in place |
| R19 | G4 | *(none)* | Show empty fields | switch | toggles in place *(non-table views only)* |
| R20 | G4 | *(none)* | Year display | `[Always]` `›` | a year-display picker |
| R21 | G4 | *(none)* | Default column width | `[180]` `›` | the existing width control |
| R22 | G4 | *(none)* | Add row noun | `⟨noun⟩` / `New` | inline edit, in place |
| R23 | G5 | `settings-2` | Manage status presets | **none** — no chevron, no value | the existing preset manager |

**Nothing in this table is new capability.** Every `Tap opens` names a picker, sheet or editor the
plugin already ships; R04's sheet is the existing source-rules editor given its own surface. The
sheet's row count (23) exceeds R-1's (12) because our database carries settings Notion's does not —
the rubric asks for grammar parity, not row-count parity.

**Two rulings this table deliberately does not cross.** Roadmap **row 83** put Filter, Sort and
Properties on labelled *toolbar* buttons; R12-R14 are **additional** ways in, which is what the
sheet already renders as summary rows today, so no toolbar affordance moves. And `071`'s audit §6
ruled the layout choice **stays as rows**, so R11 opens the existing picker and does not become
R-5's tile grid — that grid belongs to `006`.

---

### 13.4 (d) Control types

Notion's whole control vocabulary on these three screens is four kinds, and ours must be the same
four:

1. **Navigation row** — leading icon, label, right-aligned secondary value, chevron. It *opens*
   something. R-1 uses it for all six router rows; R-5 for `Open pages in` and `Load limit`.
2. **Toggle row** — label, iOS switch at the trailing edge, no icon, no chevron. R-5's
   `Show data source title` and `Show page icon`.
3. **Inline text field** — borderless, on the row's own background. R-1's View name row: the icon is
   in a 23×23px bordered chip, and the editable text at `x=40…98` has **no box around it**; the row
   band is uniform white to both edges.
4. **Action row** — leading icon, label, **no chevron and no value**. R-1's `Lock database` /
   `Copy link to view` / `Duplicate view`; R-4's two action cards. Probing R-1's `Lock database` row
   for chevron ink at `x=240…299` returns **nothing**.

**Forbidden on this sheet, each because the reference never does it:**

- A **bordered** text input or textarea anywhere in the sheet body. Notion borders a box only to
  *search*; it never borders one to name or to choose.
- A **bare icon-glyph strip** as an add affordance. Notion's add affordances are full-width labelled
  rows.
- A **helper paragraph** under a field. R-1 carries exactly one subtitle in the whole screen —
  `Change settings, add new features`, one line, grey, in a two-line row — and no paragraph.
- A **native `<select>`**. Already 0 and held by a landed `071` clause.
- **A rounded or lighter card container around a row, a group of rows, or a value (D7, operator
  ruling 2026-09-11).** Groups are separated by hairline dividers on the plain sheet background, not
  by a second painted surface. This retires the `.obnotion-settings-card` container this child's
  first CREATE landed and both metrics it carried (§13.13's ADR-J, ADR-K — resolved, not Proposed).

---

### 13.5 (e) Type scale

Cap-height measured off R-1 and divided by the 0.7608 scale; **every figure provisional until the
operator's own Notion capture (OC-S1) arrives**, per D7's remediation register (also §13.12).

| Role | Reference (provisional) | Target token | Weight |
|---|---|---|---|
| Sheet title | ~17pt semibold — cap height 9px | the landed shell-header token, unchanged | 600 |
| Section heading | ~13pt — cap height 8px, `rgb(~140)` grey | `--obnotion-font-md` (13px), `--text-muted` | **400**, sentence case, **no letter-spacing** |
| Row label | **17pt regular** — cap height 9px, near-black (label ink) | the landed sheet row-label token | **400 — regular, not semibold** |
| Row value | **17pt, secondary colour** — same size as the label | same size as the row label, `--text-muted` | 400 |
| Leading icon | **20-22pt, at label ink colour** — not dimmed/muted | icon glyph size token, provisional | n/a |
| Two-line subtitle | ~15pt grey, one line | `--obnotion-font-base` (14px), `--text-muted` | 400 |
| Footnote | **not present** — R-1 has no footnote tier | n/a; the tier is deleted, not restyled | — |

**The name row is a plain row, not a card (D7 remediation, from the operator's settings-sheet
finding).** The current build's `Reports`-style name row sits in a bordered card of its own; the
target is a plain row — icon plus name, no card, no border.

The load-bearing delta: our heading is `styles.css:24220-24231` — `font-size: var(--obnotion-font-xs)`
(**11px**), `font-weight: 700`, `letter-spacing: 0.04em`, `text-transform: uppercase`. That paints
`CURRENT DATABASE`. R-1's heading is sentence case, unspaced and regular. **Row value equal in size
to row label** is the second: a value that shrinks reads as a caption, and R-1's `Table` and `Layout`
measure the same 9px cap.

---

### 13.6 (f) Spacing rhythm

| Property | Reference (provisional) | Ours today | Target |
|---|---|---|---|
| Single-line row height | **44-48pt** (widened range, D7 remediation; was a single 44pt reading) — 33-34px thumbnail | `--obnotion-sheet-row-min-height: 44px` | **44-48pt**, provisional until OC-S1; the lane keeps its `≥ 44px` floor |
| Two-line row height | ~63pt — 48px | n/a | ≥ 56px where a subtitle survives |
| Row inset, left and right | **16pt** — card white starts at `x=12`, chevron ink ends at `x=281` | `--obnotion-sheet-inset: 16px` | unchanged, 16px |
| Label left edge | ~56pt — `x=42-43` | driven by icon width + gap | icon column + `--obnotion-space-3` gap |
| ~~Card corner radius~~ | *(retired, D7 — no card exists)* | `--obnotion-radius-lg: 8px`, on the retired `.obnotion-settings-card` | n/a |
| Inter-group spacing | provisional, ~8-16pt of breathing room either side of a divider | `--obnotion-space-5: 12px`, on the retired inter-card gap | a divider plus its own top/bottom padding replaces the gap; the lane's `≥ 8px` floor is read as the divider's own padding, not a gap between two surfaces |
| Section-heading band | ~43pt — 33px, label baseline near the band's bottom | `space-5 / inset / space-2` | unchanged |
| Divider | **Full-bleed to the trailing edge, inset from the leading edge to the label (D7).** Separates every row and stands in for the group boundary a card used to carry | 1px inset 16px left, flush right, only *within* a card | full-bleed trailing edge, leading-edge inset to the label; now the **only** grouping device — no card edge remains |

---

### 13.7 (g) Both themes

There is no dark Notion reference (§13.0), so the dark target is **ours**, and it is one invariant —
**retired and replaced by D7's ruling** (the card-lighter-than-canvas invariant this row previously
carried, and the ADR-K retune that measured it, are both moot once no card fill exists to invert;
`roadmap.md` §7.19 ADR-K is marked **resolved by the operator**, not left Proposed):

> **The divider is a consistent hairline token, visible against the plain sheet background in both
> themes.** There is no second surface to invert — the failure mode this invariant used to guard
> against (a card fill that reads backwards in dark mode) cannot occur once rows sit directly on the
> canvas.

The retired card/canvas measurement — light `rgb(242,242,242)` canvas vs. `rgb(255,255,255)` card
(**+13**, correct), dark `rgb(46,46,46)` canvas vs. `rgb(30,30,30)` card (**−16**, inverted) — no
longer applies to a target with no card. `sheet-design-review.md`'s original finding against
`071/007` ("no perceptible result in either theme") is superseded by D7 rather than fixed: the fix is
removing the surface, not re-tuning its fill.

---

### 13.8 (h) States

| State | Target | Reference |
|---|---|---|
| **Empty** | Every router row shows its empty word as secondary text, never a blank trailing area: `None`, `Not set`, `All shown`, `Same as source` | R-1 shows `None` on four of six rows — the empty state *is* the resting state |
| **Many items** | The count replaces the empty word (`3 applied`, `2 shown`); the row does not grow, wrap or gain a second line | R-1's `2 shown` sits on one line at the same pitch as `None` |
| **Keyboard open** | The list does **not** restructure. The focused row keeps its place and its value edits in situ; the sheet's `90svh` cap comes down by the published keyboard inset, which is landed behaviour | **R-2 is the direct evidence**: with the keyboard up, every group, order and row is identical to R-1 and only the focused value changes from placeholder to `Table` |
| **Long content** | The body region scrolls; the grab bar and the header do not — landed, and guarded by `sheet-rebuild.mjs`'s *settings sheet chrome survives its own scroll* surface | ours |
| **Read-only database** | Router rows keep their chevron only where the destination is readable; inline fields fall back to their read-only value row | ours — no reference |

---

### 13.9 The before — what a user sees today

Read off `screenshots/notion-clone/panels/constructed-view-config-mobile-{light,dark}.png`
(804×1748, both opened this session) and confirmed against
`src/views/view-config-panel-renderer.ts`.

**Structure.** A grab handle, a centred `Settings` title, a `✕` top-right. Then a heading
`CURRENT DATABASE` — uppercase, letterspaced, bold, 11px — and below it **one card** filling the
sheet, wrapped around a form. The card's inset and radius are landed and correct; what is inside it
is not.

**Controls, in render order.** `Name` label over a **bordered text input** reading `Bench`.
`Description` label over a **bordered three-row textarea** reading `Add a short description…`.
`Database cover  Not set` with a **bare trailing icon button**. `Source folder` label over a
**bordered text input** reading `notes`, then a **two-line helper paragraph**. `Source rules`, a
**three-line helper paragraph**, an empty-state line, then a **strip of three bare glyphs** —
`+`, folder-plus, `>_`. `New note folder` label over a **bordered text input**, then a **three-line
helper paragraph**. Then `New record template`, clipped by the viewport. The producer carries
**14** input/textarea constructions (`grep -c`) and reaches the sheet through `renderText`,
`renderTextarea`, `renderSelect`, `renderSwitch` and `renderRange`.

**Type.** Labels and values are the same size, which is right. The heading is the wrong tier
entirely. The helper paragraphs are a fourth tier that the reference does not have.

**Colour.** Light reads. Dark does not: the card is 16 RGB units *darker* than its canvas, so the
grouping `071/007` landed is close to invisible in dark, which is exactly what
`sheet-design-review.md` reported and what §13.7 now measures.

**In one sentence.** It is a settings *form* on a phone — a stack of bordered boxes with prose
under them — where the reference is a settings *list*: rows you tap, values on the right, and
nothing to read.

---

### 13.10 The DELTA table — before → target, per property, with its rubric row

**This table's "Before" column is now the packet's second before-state.** The original row (a form
with 1 card, measured pre-`076`) is superseded by the `.obnotion-settings-card` shape this child's
first CREATE landed (5 cards, measured on the shipped tree). Both rows appear where they diverge; the
remediation task block in `tasks.md` re-measures the shipped state as its own RED.

| Property | Before (pre-`076`) | Before (shipped, 5-card CREATE) | Target (D7) | Rubric row |
|---|---|---|---|---|
| Card / container count | **1** card | **5** cards | **0** card containers — dividers on the plain background | Frame |
| Inter-card gap → inter-group spacing | n/a | 12px (`--obnotion-space-5`) | no gap between two surfaces; a divider plus its own padding | Spacing |
| Card radius | n/a | 8px (`--obnotion-radius-lg`) | n/a — no card exists to radius | Frame |
| Card vs canvas, light | n/a | card `rgb(255,255,255)` on `rgb(242,242,242)`, **+13** | n/a — retired (D7) | Colour |
| Card vs canvas, dark | n/a | card `rgb(30,30,30)` on `rgb(46,46,46)`, **−16** | n/a — retired (D7); ADR-K resolved, not Proposed | Both themes |
| Section heading | 11px / 700 / `0.04em` / uppercase | unchanged from pre-`076` | 13px / 400 / no tracking / sentence case / `--text-muted` | Type |
| Bordered text inputs in the body | **14** constructions in the producer | 0 (closed by the first CREATE) | **0**, unchanged | Controls |
| Textareas in the body | **1** (`Description`) | 0 (closed by the first CREATE) | **0**, unchanged | Controls |
| Navigation rows (icon + value + chevron) | **0** | **≥ 13** landed (R03-R15) | **≥ 13**, unchanged; Formula result storage (R09) joins as a nav row opening a picker | Row anatomy |
| Bare icon-glyph buttons | **≥ 3** (the Source-rules strip) | 0 (closed by the first CREATE) | **0**, unchanged | Controls |
| Helper prose runs > 80 chars | **5** EN keys — 147 / 141 / 129 / 128 / 107 chars, each with a zh and zh-TW twin | 0 (closed by the first CREATE) | **0**, unchanged | Type |
| Trailing action rows without a chevron | **0** | **1** card, `≥ 1` row, `obnotion-settings-card-footer` | **1** terminal group, `≥ 1` row, no card wrapper | Sections |
| Row label weight | n/a | as landed | **regular (400)**, not semibold — remediation finding | Type |
| Leading icon size / colour | n/a | as landed | **20-22pt, at label ink** — remediation finding, provisional | Colour |
| Row value alignment | mixed — some stacked below the label | right-aligned, landed | unchanged | Row anatomy |
| Row height | 44px min, landed | 44px min, landed | **44-48pt**, provisional (D7 remediation) | Spacing |
| Row inset | 16px, landed | 16px, landed | unchanged, 16px | Spacing |
| Native `<select>` | 0, landed | 0, landed | unchanged | Controls |
| Header trailing control | `✕` | `✕` | `✕` — **Proposed ADR-I** would make it `Done`, now also informed by ClickUp's circular close (D9) | Frame |

---

### 13.11 The lane clauses these rows become

Written into `tools/live/sheet-grammar.mjs` beside the landed `settings sheet card grouping` and
`settings sheet reference row grammar` clauses, in their idiom: a `console.log` header, one
`PASS`/`FAIL` line per measurement, `failures.push` on breach. **No clause asserts a number derived
from a reference asset** (D3); every threshold below is a structural count, an ours-measured value,
or a direction.

**L1 and L6 are rewritten below to D7's target (2026-09-11); L1-L9's original assertions had gone
GREEN against the 5-card shape this same table now retires. The remediation task block in
`tasks.md` runs each rewritten clause RED-first against the shipped tree before the producer
changes.**

| Clause | Assertion | Expected RED today (against the shipped 5-card tree) |
|---|---|---|
| **L1** | The sheet renders **0** elements with a card-like background/border-radius container (`.obnotion-settings-card` or equivalent) under `.obnotion-view-config-body`, and **≥ 4** divider elements separating its five groups | 5 cards, 0 dividers between groups |
| **L2** | **0** bordered text inputs and **0** textareas in the sheet body: no `input[type=text]` or `textarea` whose computed `border-width` is non-zero on any side | 0 — already GREEN, re-run unchanged |
| **L3** | **≥ 13** rows carry all three of a leading icon, a right-aligned secondary value on the label's line, and a trailing chevron; every one is `≥ 44px` tall | 0 — already GREEN, re-run unchanged |
| **L4** | **0** icon-only buttons in the sheet body — every button has a text label | 0 — already GREEN, re-run unchanged |
| **L5** | **0** text runs longer than **80** characters in the sheet body, in all three locales | 0 — already GREEN, re-run unchanged |
| **L6** | **0** elements compute a background colour distinct from the sheet's own canvas background, anywhere in the sheet body, in **both** themes — i.e. no residual card fill of any kind | dark and light: 5 elements each read `.obnotion-settings-card`'s fill, distinct from canvas |
| **L7** | The section heading computes `text-transform: none`, `letter-spacing: normal`, `font-weight ≤ 500` | 0 — already GREEN, re-run unchanged |
| **L8** | The last group carries **0** card wrapper and **0** of its rows has a chevron or a trailing value | 1 card wrapper (`obnotion-settings-card-footer`) |
| **L9** | *(guard)* The landed stack-row width clause fails on an **empty** row set rather than passing vacuously | passes on a non-empty set today; unaffected by this remediation |
| **L10** | The row label computes `font-weight ≤ 500` (regular, not semibold) and the leading icon computes a font-size in **20-22pt**'s pixel-equivalent range | provisional until OC-S1; RED recorded against whatever the shipped tree currently computes |

**L9 is not decoration.** `spec-tree-layout.md` §2 records the same failure class in
`scan-failing-values.mjs`: a lane that walks a fixed set reports clean when the set empties. L2
empties the set the landed clause measures, so without L9 a real regression would land green.

**The `071` regression set re-runs unchanged in the same invocation**: row pitch 44-52px, row inset
16px, hairline geometry, 0 native selects, card radius and gap floors, and title centring.

---

### 13.12 The provisional register — and what settles each

Two operator captures are named. **OC-S1**: a full-resolution device capture of Notion's View
options sheet, light. **OC-S2**: the same screen in dark theme — it settles the entire dark column,
which today has **no reference at any rung**.

| Provisional | Value | How it was derived | Settled by |
|---|---|---|---|
| Device and scale | 393×852pt, `299/393 = 0.7608` | R-1's 78px status+nav band against a known 59pt + 44pt | OC-S1 |
| Single-line row height | **44-48pt** (widened, D7 remediation) | 33-34 thumbnail px | OC-S1 |
| Two-line row height | ~63pt | 48 thumbnail px | OC-S1 |
| Row inset from the sheet edge | ~16pt | white span `x=12…286` on R-4/R-5, read as the row inset now that no card exists to carry it (D7) | OC-S1 |
| ~~Card corner radius~~ | *(retired, D7 — no card exists)* | corner curve over ~6 thumbnail px, no longer applicable | n/a |
| Inter-group spacing | ~8-16pt of breathing room either side of a divider | 12-13 thumbnail px of canvas, re-read as divider padding rather than a gap between two surfaces (D7) | OC-S1 |
| Section-heading band | ~43pt | 33 thumbnail px | OC-S1 |
| Label left edge | ~56pt | ink at `x=42-43` | OC-S1 |
| Chevron right inset | ~16pt | ink ends `x=281` of 299 | OC-S1 |
| Row label / row value size | **17pt** — label regular, value secondary colour (D7 remediation names the weight explicitly) | 9px cap height | OC-S1 |
| Leading icon size | **20-22pt, at label ink** (D7 remediation, new) | not previously measured; provisional pending OC-S1 | OC-S1 |
| Section-heading size | ~13pt | 8px cap height | OC-S1 |
| Subtitle size | ~15pt | 11px bbox with descender | OC-S1 |
| Sheet top radius | ~11-13pt | R-4's corner over 8-10 thumbnail px | OC-S1 |
| Canvas colour | `#FAF8F6` (sheet); `#F7F7F5` (full-screen) | direct sample; the card half of this row is retired (D7 — no card colour to carry) | OC-S1 |
| Divider thickness | **thumbnail, value unreadable** | 1-2px at 0.76 scale cannot resolve a hairline | OC-S1 |
| Accent blue behind `Done` | **thumbnail, value unreadable** | 9px antialiased glyph on white | OC-S1 |
| **Every dark-theme value** | **no reference at any rung** | scanned: 3/3 view-options and 120/120 database files are light | **OC-S2** |

---

### 13.13 Contradictions with landed rulings — Proposed, not applied (except where marked resolved)

Under **D15** and parent **D3**, each is a **Proposed ADR** to be transcribed into
`../../roadmap.md` §7.19 by **T001**. ADR-J and ADR-K are the exception: the operator's D7 ruling
(2026-09-11) resolved both directly, so they are recorded here as **resolved**, not left Proposed.

| # | The landed ruling | What this DEFINE read finds | Raised by |
|---|---|---|---|
| **ADR-I** | Every phone sheet closes on a `✕` glyph in the shared `buildShellHeader` | Notion's bottom sheet closes on a **text `Done` in accent blue** (R-4) or a **`‹` back** where the sheet is a drill-in (R-5); ClickUp's own bottom sheet closes on a **round `✕` in a circle** (D9). None of the three is a bare `✕`. The change is one shared header, so it moves all eleven sheets at once or none — a family decision, not this child's. Until it is taken, the rubric's *Frame* row targets **1** | `076/001` |
| **ADR-J** — **resolved by the operator (D7), 2026-09-11** | `../spec.md` §4 read View options as *"three separate inset cards with visible gaps"* | R-1 is **full-bleed with zero radius and zero inset**, sampled at `x=0`/`x=298` and probed at the corner; the inset-card reading came from R-4/R-5. The operator has since ruled the inset-card idiom out for this packet entirely, regardless of which reference showed it — sheets group with dividers on the plain background (D7). Not a live contradiction to resolve; recorded as closed | `076/001` |
| **ADR-K** — **resolved by the operator (D7), 2026-09-11** | `071/007` set the card fill token so the card *"reads lifted against the canvas in both themes"* (`styles.css` comment) | In the capture the judge scored, dark was **inverted**: card `rgb(30,30,30)` on canvas `rgb(46,46,46)`. The operator's D7 ruling retires the card itself rather than re-tuning its fill direction — there is no longer a card to invert | `076/001` |

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Predecessor packet**: `../../071-sheet-notion-anytype-alignment/`, whose landings are this child's regression floor
