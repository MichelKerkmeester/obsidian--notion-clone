---
title: "Research: Notion's Dropdown, Menu and Picker Grammar as an Additive Refinement to the Plugin Surface"
description: "Five-iteration fan-out synthesis comparing Notion's dropdown/menu/option/relation/date/colour picker patterns (screen digest N1-N12) against src/views/* and the 052 design record, with a ranked, threshold-bearing remediation plan and every Notion-vs-Anytype conflict named against its landed ruling."
---

# Research: Notion Dropdown / Menu / Picker Patterns vs the Note-Database Plugin Surface

<!-- SPECKIT_TEMPLATE_SOURCE: research | v1 -->

**Spec folder:** `specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization`
**Loop:** `/deep:research:auto` · fan-out, one lineage · label `glm-openrouter-dropdowns`
**Executor:** `cli-pi`, model `z-ai/glm-5.3-flash`, reasoning effort `max`, executed inline per the detached fan-out contract
**Iterations:** 5 / 5 (stop policy `max-iterations`; convergence below the cap is telemetry only)
**Findings:** 28 registry entries (14 load-bearing after supersessions) · **Question coverage:** 6 / 6 answered · **newInfoRatio:** 0.90 → 0.70 → 0.60 → 0.50 → 0.40 (avg 0.62)
**Notion source of record:** `notion-screens-digest.md` only — 101 screens, patterns N1-N12. No PNG was opened by this loop.

---

## 1. Executive Summary

The dropdown/menu/picker family is already substantially aligned with both of its references. The
desktop combobox (T016 / ADR-006), the shared picker host (`popover-host.ts`), the option,
relation and colour picker migrations (T010-T012), hover-open submenus, create-affordance-first
ordering and the colour picker's accessible names are all **landed on the tree**. Notion's digest
adds no structural disagreement with that shape — it corroborates it.

What the loop found instead is one **code-versus-ruling lag**, a short list of **additive Notion
refinements**, six **conflicts correctly resolved in favour of landed operator rulings**, and two
**stale `goal.md` criterion texts** that describe a pre-landing tree.

The lag is the highest-impact item and is owned by nobody: `dropdown-field.ts:240-253` builds the
selection check **first** (check → icon → label) and `styles.css:3239-3256` fixes that order
structurally with `grid-template-columns: 16px minmax(0, 1fr)`, so the dropdown popover renders a
**leading** tick. Both references rule trailing — Anytype G14 ("the primitive's check wins and it
is trailing, at the 16px right inset") and Notion N2 (all three of its selection indicators are
trailing: `ac33be32`, `cf573f99`, `53858386`). The ruling landed; two of the three row families
already comply (`cell-editor-relation.ts:175-180`, `cell-editor-option.ts:278-283`); only the
dropdown field lags, and no pending task opens that file — T009 does not, and the row census
counts its four hand-built rows without flipping them.

Everything else is additive and ordered in §11: trailing current-value text on submenu parent
rows (riding the open T008/T009 legs), resolved-date sublines under relative date presets, and
three 054-scoped picker refinements recorded rather than built here per D8.

---

## 2. Research Charter & Scope

**Question set (six, all answered):**

- **KQ1** — Which Notion patterns from the digest would improve this surface for a user, ranked by user impact?
- **KQ2** — For each, the concrete change to our code and CSS (file, rule/function, value) and its measurable threshold.
- **KQ3** — Which Notion behaviours the surface already implements.
- **KQ4** — Which Notion behaviours conflict with a landed Anytype ruling, and which prevails, with the reason.
- **KQ5** — Which candidate changes need a device-only check.
- **KQ6** — A ranked remediation plan as concrete phase tasks with thresholds and red-first checks, suitable for a new child phase.

**Bounded scope (as briefed):** `notion-screens-digest.md` as the only Notion source;
`src/views/dropdown-field.ts`, `owned-menu.ts`, `menu-row.ts`, `popover-host.ts`,
`popover-position.ts`, `record-surface/cell-editor-*.ts`, the menu/popover blocks of `styles.css`;
and the design record — `052/goal.md`, `design-trueup.md`, `decision-record.md`, `tasks.md`,
`005/design-system.md`, `roadmap.md` §6A. One "one more source file" exception was spent, on
`option-color-picker.ts` (§6).

**Standing constraint, stated by the operator and by the design system alike:** Anytype parity is
the default ruling for these surfaces (051 ADR-007, 056, 057). Notion refinements are **additive**;
where the two disagree the conflict is named and a recommendation given, and a landed operator
ruling is never overridden. `design-system.md` §12 supplies the value rule: *"Notion is the visual
target and is not a source at all — describe what it looks like, then derive values from our own
token scale."* No threshold in this document derives from a digest geometry estimate.

**Non-goals:** implementing any fix; reading image files; web research about Notion;
re-litigating landed rulings; writing outside the research packet.

---

## 3. Methodology & Sources

Five iterations, each with a declared focus, findings carrying `file:line` or `§`-citations, and
inferences marked as inferences:

| # | Focus | newInfoRatio | Findings |
|---|---|---|---|
| 1 | Digest N1-N12 read in full, then the dropdown menu stack (`dropdown-field.ts`, `owned-menu.ts`, `menu-row.ts`, `styles.css` row blocks) | 0.90 | F1-F9 |
| 2 | Landed ruling text (`goal.md`, `design-trueup.md` 1-734, `decision-record.md`) + option/relation editors | 0.70 | F10-F17 |
| 3 | `cell-editor-date.ts`, `popover-host.ts`, `option-color-picker.ts` (scope exception), `design-system.md` | 0.60 | F18-F23 |
| 4 | `roadmap.md` §6A authority check, `tasks.md` inventory, `design-trueup.md` tail 735-912 | 0.50 | F24-F28 |
| 5 | Synthesis: final ranking and the ranked remediation plan | 0.40 | plan rows P1-P6 |

**Method notes that changed the output.** Reading the digest's divergence table first and then
verifying each claimed gap against the current tree caught three stale citations (§3 of the
digest, and two `goal.md` criterion texts) and surfaced the check-side lag, which neither document
alone states. Reading the ruling documents *before* fixing iteration 1's dispositions flipped one
candidate from "improvement" to "ruled; no change" (F2 → F10). Digest geometry values are
qualitative estimates by the digest's own method note and were never used as thresholds.

**Source diversity:** one Notion digest (by design), nine implementation files, and six design-record
documents. No load-bearing claim rests on a single weak source; every one is code-cited or
ruling-cited.

---

## 4. The Notion Reference Surface (what the digest supplies)

The digest's twelve patterns, and what each one contributed here:

| Pattern | Substance | Disposition |
|---|---|---|
| N1 | Row grammar `[icon] label … [trailing slot]`, five trailing slot kinds (value+chevron, chevron, toggle, check, plain), never two at once | 3 of 5 slots already ours (F4); value+chevron is candidate P2 (F25); toggle conditional |
| N2 | Selection indicators are **trailing**, in three grammars: checkmark, blue filled circle, radio — never mixed within one list | Checkmark side = the lag (F3/F12); circle and radio refused (F15) |
| N3 | Search-first pickers at any option count, including a 3-option list (`8ff7ae4b`) | Corroborates the landed desktop combobox (F1); phone gate ruled separately (F10) |
| N4 | Colour choice as a labelled list or labelled grid | Already disposed by G15 + landed accessible names (F19); visible-label delta is an operator question |
| N5 | One card, divider rules, text caption above a section (`78e7f802`); iOS card sectioning (`6ecea6c6`) | Desktop grammar already ours (F5); iOS card sectioning low-value |
| N6 | Destructive rows inconsistent: red+icon, red without icon, plain text for structure removal | 051 ADR-007 E3 rules red+trash universal (F24); carve-out survives only as an operator question |
| N7 | Submenus flip side by available room (`78e7f802`); depth-3 cascade exists (`f19c6f50`) | Already ours (F6); depth is not a parity target per D8 |
| N8 | Tile-grid row mode for the block-insert chooser | Out of scope unless a leg names a concrete caller (P6) |
| N9 | Value and count badges in the trailing slot (`213bed5`, `52348672`) | Feeds P2 (F25) |
| N11 | Status options grouped into workflow buckets, each with its own "+" (`622d2611`) | Additive, 054-scoped, low priority (F16) |
| N12 | Floating popover and docked side panel coexist inconsistently | Already answered by 051 ADR-008 (F24) |

Relation and date screens contributed outside the numbered patterns: `b4fd8ac7` / `932bb81c`
(icon+title+subtitle rows, a "Suggested" captioned section), `b95c9bf0` (inline clear in the typed
search), `cfca14fb` (relative presets each carrying a resolved literal date/time subline),
`cb9d8cab` (date editor as a sheet with an inline calendar), `841ae11d` (the create field **is**
the search in the option editor), `7adbbfc8` (footer-button picker).

---

## 5. Dropdown and Menu Stack (Q1, Q3)

**F12 — the selection check renders leading; the ruling says trailing (P1 candidate).**
`dropdown-field.ts:240-253` creates the check span first, and `styles.css:3239-3256` encodes it:
`.db-dropdown-option { grid-template-columns: 16px minmax(0, 1fr); }` and
`.has-icon { grid-template-columns: 16px 16px minmax(0, 1fr); }` — the leading 16px column is the
check. G14 (`design-trueup.md`) and ADR-005 ("adopted as behaviour: … a **trailing** checkmark,
single grammar") both rule trailing at a 16px right inset; digest N2 and §4 "Checkmark side" agree
and record the ruling as "corroboration, already adopted". The other two row families already
comply — `cell-editor-relation.ts:175-180` appends the check after the label with a code comment
saying so, and `cell-editor-option.ts:278-283` appends `.db-option-check` with `menuitemcheckbox`
semantics from `createMenuRow`. **This is a code-versus-ruling lag, not a new decision.**

**F25 — submenu parent rows carry a bare chevron where a current value exists (P2 candidate).**
`design-trueup.md` §4 M7 already flagged it against Anytype (`Layout    Grid ›`), and the digest
says the same twice (N1 `213bed5` "Theme Dark ›", `52348672` "Property visibility 3 ›"; N9 count
badges). `menu-row.ts:98-120` **already renders** a `value` slot before the chevron — no primitive
change is needed, only callers passing `value`. The callers are the two pending legs T008
(toolbar action panels) and T009 (column-menu submenus), so this rides them rather than opening a
new leg.

**F1, F4-F6, F8, F9 — already aligned.** Desktop dropdown is an unconditional combobox
(`dropdown-field.ts:193-195`: "Every desktop dropdown is a combobox: the list filters as you type,
whatever its length"); `menu-row.ts:88-120` builds `[icon] label … [value] [chevron]`;
`menu-row.ts:150-163` builds captioned sections and separators matching N5's desktop grammar;
`owned-menu.ts:118-124` allows one open child per menu and its `showAt` flips submenu side via
`resolvePopoverHorizontalLeft(..., "left", "right")` as N7 observes; `dropdown-field.ts:214-218`
(`moveCreateOptionsFirst`) puts create rows directly under the search field; `owned-menu.ts:258-272`
caps menu height before measuring (`max-height: max(120, bounds.height - 8)`, `overflow-y: auto`,
`overscroll-behavior: contain`) with a phone-only scroll affordance at `dropdown-field.ts:442-447`.

---

## 6. Pickers: Option, Relation, Date, Colour (Q1, Q3)

**Option editor (F13, F16 — 054-scoped per D8).** `cell-editor-option.ts` renders the whole
`optionDefs` list with **no filter**; the add input (`db-cell-option-add`, ~:330-340) handles only
Enter-to-create and sits **below** the list (rows insert before it, ~:216). Notion makes the create
field the search (`841ae11d`), and Anytype's G10 measures the search field first in the panel,
always. The editor already half-behaves that way: the `initialSearch` path (~:395-400) focuses and
seeds the input from in-cell typing. Status bucket grouping (N11, `622d2611`) is additive with no
ruling touching it; low priority for short status presets. Both belong to 054 — D8: "Cell inline
editors are `054`'s… this phase migrates only the option popover's *row construction*".

**Relation picker (F14 — additive).** Ours renders title-only rows (`cell-editor-relation.ts:156-181`).
Notion's carry icon+title+**subtitle** (`b4fd8ac7`, `932bb81c`) and a "Suggested" captioned
section. G12's kinds-rule already covers the captioned section. Two additive candidates: a
secondary line under the row title in the secondary-text role, and a Suggested section ahead of
the flat list when the plugin can propose recently-linked targets.

**Date picker (F20, F23 — P3 candidate).** The core already matches: segmented YYYY-MM-DD(+HH:mm)
inputs, a mini calendar with day/month/year drill modes and a Today action
(`cell-editor-date.ts:341-395`), a mobile inline dock with `visualViewport` tracking and
Save/Cancel (:120-160, :215-224), Escape cancel and outside-click commit. The delta is Notion's
`cfca14fb`: each relative preset carries its resolved literal as a subline. Our matching preset row
is the filter-side picker's Today / Tomorrow / Next week / Clear footer (G13, citing
`date-value-picker.ts:164-166`, our 252px floor kept against Anytype's 288). **Marked inference:**
`date-value-picker.ts` was not read by this loop — the citation is second-hand via G13, and the
implementing leg must read the file first.

**Colour picker (F19 — closed, no change).** The bounded-scope exception paid off. G15's
disposition was: keep the 12-swatch grid (a shipped surface with a registered 048 pair), adopt the
trailing tick and named-colour labels **as accessible names**. `option-color-picker.ts` carries all
of it — `"aria-label": color` per swatch with the comment "the choice is never colour-only"
(:53-62), the `check` icon on the selected swatch, `title: color` as a hover label, and the
disposition recorded verbatim in the module comment (:23-26). ADR-003's one-navigator ruling is
landed too (`getGridNavigationTarget` consumed; `closeActiveOptionColorPicker` routes through the
shared registry). **The digest's own open question §6 q1 therefore already has an answer on the
tree.** Only the always-visible label remains as an operator question.

**Picker host (F18, F27 — landed).** `popover-host.ts` provides all five shared pieces the
`goal.md` criterion demands — `filterPickerRows` (§1), `moveCreateOptionsFirst` (§2), the
one-per-document `activePickers` WeakMap (§3), `mountPickerSheetHeader` (§4),
`getGridNavigationTarget` (§5) — plus the named width roles (§6: `DATE_PICKER_POPOVER` 252,
`SWATCH_PICKER_POPOVER` 124, `GRID_PICKER_POPOVER` 318, `RELATION_PICKER_POPOVER` 360/420/520).
`design-trueup.md` §5's width disposition is closed on the tree; T013's remaining work is the grep
proof, not a new decision.

---

## 7. Already-Implemented Inventory (Q3, complete for the bounded surface)

Desktop always-on combobox with trigger-as-input (T016 / ADR-006) · relation picker search-always
with no count gate (`cell-editor-relation.ts:120-124`) · footer with selected count + Clear + Save
(:127-132) · `aria-multiselectable` listbox with per-row toggle semantics (:135-181) · option editor
create-reachable-when-empty (AC-006), destructive delete pairing colour + icon + confirm (G6),
drag handles and reorder controls, trailing tick (G14), `initialSearch` seeding · colour picker
grid with per-swatch accessible names and shape-coded selection (G15) · hover-open submenus behind
`(hover: hover)` (G8 / ADR-004) · innermost-only Escape (G8 / ADR-001) · submenu flush-beside
placement with side-flip (N7) · create-affordance-first ordering (ADR-004) · captioned sections and
separators (N5) · height-capped scrollable menus · the shared picker host and its width roles ·
the `menu-row` trailing value/chevron grammar (N1, 3 of 5 slots).

---

## 8. Conflicts With Landed Rulings (Q4 — six dispositions, every ruling stands)

| Notion behaviour | Landed ruling | Why the ruling prevails |
|---|---|---|
| iOS search-first pickers at any count (N3, `86a8e66c`, `7174b226`) vs our phone `>8` gate | ADR-006 ¶1: "The count gate is the phone's alone… On a phone sheet the old condition is untouched, so `044`'s sheet grammar and its registered pairs are unchanged." | Operator-era ruling decided the same day; Notion's iOS evidence is recorded as a possible future operator question, not acted on (F10) |
| Entity-picker blue filled circle (N2, `7174b226`) | ADR-005 refusal 4: "iOS's two checkmark grammars… One product, two ticks for one affordance, is the exact defect G14 exists to close." | Notion's circle *is* that second grammar; same disposition the record already took against Anytype's iOS split (F15) |
| Radio-button selection grammar (N2, `aeb6d373`) | Single trailing tick (G14) | Appears only in a search-results sort-order list; no consumer matches, and mixing indicators would violate N2's own never-mixed rule (ruled out, iteration 1) |
| Labelled colour list or grid (N4) | G15 / ADR-005: grid kept, accessible names adopted — both landed | Shipped surface with a registered 048 pair; only the always-visible-label delta remains, and that is an operator question, not a defect (F19) |
| Plain-text structure-removing destructive rows (N6, `e9698e1b`, `299e69bb`) | 051 ADR-007 exception **E3**: red-plus-trash-icon on **every** destructive row | E3 is universal by construction; the carve-out proposed in iteration 1 (F7) is **downgraded** to an operator question, not a recommendation (F24) |
| Popover-versus-docked-panel inconsistency (N12) | 051 ADR-008: database settings = 420px right side sheet; menus and pickers stay anchored | Both shapes already exist, each on its ruled surface; Notion's own inconsistency needs no decision from us (F24) |

**Two operator questions survive** (no code proposed for either): always-visible colour labels
(the N4 delta), and a documented structure-removal carve-out to E3 if the operator ever wants one.

---

## 9. Device-Only Checks (Q5)

1. **Phone date editor** — ours is an inline overlay docked under the cell with `visualViewport`
   tracking (`cell-editor-date.ts:120-160`); Notion's date screens are full sheets with inline
   calendars (`cb9d8cab`). Whether the digest's phone grammar applies to our inline dock is not
   answerable from captures.
2. **Check-side flip verification (P1)** — the capture harness renders fixture markup, not the real
   renderers (`repo-rules/screenshot-currency.md` §3), so the trailing-tick read-back needs live
   confirmation; `design-system.md` §11 item 9 says the same ("the harness does not have the
   operator's theme").
3. **Option rename on a coarse pointer** — rename is bound to `ondblclick` on the label
   (`cell-editor-option.ts:250-283`); reorder has explicit phone controls
   (`db-mobile-reorder-controls`), rename visibly does not. Is option rename reachable on a phone
   at all?
4. **Any new control's touch floor** — 28×28 desktop / 44px phone (`design-system.md` §9; 044).
5. **Phone sheet space** — only if the operator ever re-opens ADR-006's phone clause.

---

## 10. Thresholds and Evidence Discipline (Q2 constraints)

Every plan row below inherits these, and they are the reason the rows are shaped the way they are:

- **Values come from our tokens, never from the digest** — `design-system.md` §12. The digest's own
  method note says its geometry is a qualitative estimate.
- **Red-first** — `design-system.md` §11 item 8: "Write the check before the code… demonstrated
  failing on today's tree first", with a negative control. `tasks.md`'s TASK-VERIFY requires the
  command to be named and `$?` read directly.
- **Pixel claims owe a pixel read** — any pixel-level assertion carries a "pixel read owed" marker
  for an image-capable leg (054 ADR-005 precedent, roadmap §6A ~18:20).
- **No bespoke widths at call sites** (`design-system.md` §5); rows built with `createMenuRow`,
  extended once if needed (§6); registry/producer declarations kept current.
- **Drift kinds to guard** — roadmap §7.9's four (stale premise, unseen screen designed from, line
  drift, evidence moving mid-flight) and §7.10's rule that "a value with a stated measurement
  method beats one that is quoted". This loop hit the first kind three times; cite the newest
  authority (ADR-006 over the digest and over `goal.md`).
- **One leg touches one file group** (D6); cell inline editors belong to 054 (D8).

---

## 11. Recommendations — Ranked Remediation Plan

### 11.1 Ranking by user impact (KQ1)

1. **Trailing selection check in the dropdown field** (F12 → P1). Every dropdown, every user, every
   open — the most-seen surface in the family; both references rule trailing; the ruling is landed
   and only this file lags. Small, exact diff.
2. **Trailing current-value text on submenu parent rows** (F25 → P2). Makes menus self-describing;
   two independent references agree; rides the already-open T008/T009 legs.
3. **Relation picker subtitle rows + Suggested section** (F14 → P4). Record identification in the
   picker most likely to hold ambiguous titles; additive, no ruling touched.
4. **Option editor create-field-as-search** (F13 → P4, 054). Grows with option count; matches
   Notion `841ae11d` and Anytype G10; currently the only major picker without a filter.
5. **Date preset literal-date sublines** (F20 → P3). Confirmation aid on the filter-side picker.
6. **Status bucket grouping** (F16 → P4, 054). Low for short status presets.
7. **Menu-row toggle trailing slot** (F4 → P6, conditional). Only once a consumer exists.

### 11.2 Plan rows, shaped for a child phase's `tasks.md`

**P1 — Flip the dropdown selection check to trailing.** *Un-owned by any pending task; one leg.*
- Files: `src/views/dropdown-field.ts` (row builder, check span ~:240-253); `styles.css`
  (`.db-dropdown-option` grid blocks ~:3239-3256 plus the settings / modal / subpopover context
  variants that re-spec `.db-dropdown-option-check`).
- Change: create the check last (icon → label → swatches → check); grid becomes a
  `minmax(0, 1fr) … 16px`-shaped trailing form with the check in the trailing 16px column, per
  G14's 16px right inset. Context-variant blocks move with it.
- Red-first: an assertion in the constructed-dropdown scenario that the check is the row's **last**
  element child — observed red on today's tree with `$?` read directly — plus a negative control
  (a row built without a check still passes the other assertions).
- Threshold: check last in DOM order; trailing at the 16px right inset; `aria-selected` and
  `aria-activedescendant` behaviour unchanged; `dropdown-field.test.ts` gains the DOM-order case;
  `constructed-dropdown-search-desktop-*` re-taken and opened, with a **pixel read owed**; the css
  lane's release note names the moved captures.
- Rulings consumed: G14, ADR-005, D2, `design-system.md` §11.

**P2 — Trailing current values on submenu / chevron rows.** *Rides T008 and T009; no separate leg.*
- Files: the T008/T009 legs' own files (`toolbar-renderer.ts`, `column-menu.ts`).
  `menu-row.ts` needs **no change** — the `value` slot exists at :98-120.
- Red-first: a scenario assertion that a submenu row carrying a current value renders its
  `.db-menu-item-current` text before the chevron — red today (bare chevron on, for example, the
  column type row), green after.
- Threshold: every submenu row whose child carries a current value renders it; rows without one
  keep the bare chevron. T018's wrap-hint pattern is the in-repo precedent.

**P3 — Date preset sublines.** *Small 052-family leg (D1's picker family).*
- Files: `src/views/date-value-picker.ts` — **unread by this loop**; the leg reads it first and
  re-derives G13's citation.
- Change: each relative preset (Today / Tomorrow / Next week) gains a resolved literal date/time
  subline in the secondary-text role, per `cfca14fb`.
- Red-first: assertion that each relative preset row carries a subline element with a non-empty
  resolved value; observed red first.
- Threshold: subline in the secondary-text role; footer height growth measured before and after and
  kept inside the picker's bounds arithmetic; tap targets ≥ 28px desktop / 44px phone; capture
  re-taken and opened.

**P4 — 054-facing candidates: recorded, not built here (D8).** Option-editor create-field-as-search
with filter-as-you-type (F13); relation subtitle rows plus a Suggested captioned section (F14);
status bucket grouping (F16). Each carries its threshold from §6; the 054 leg owns the files.

**P5 — Metadata reconcile (a reconcile leg, not research).** Refresh `goal.md`'s two stale
criterion "Today:" texts — the combobox criterion (F11) and the picker-host criterion (F18) —
against the landed tree, and re-verify the criterion checkboxes. Can run independently and
immediately.

**P6 — Operator questions (no code).** Always-visible colour labels (N4 delta); a structure-removal
carve-out to E3 if ever wanted (N6); the phone search gate, only if ADR-006's phone clause is
re-opened; a tile-grid row mode for the block-insert chooser (N8) — extend the primitive once per
D1 **only** if the T008 leg names a concrete caller, else out of scope.

**Execution order:** P1 → P2 (rides T008/T009) → P3 → P4 (054) → P5 → P6. Every row names its
command, reads `$?`, and registers capture and lane updates in the same commit (TASK-SYNC).

---

## Eliminated Alternatives

Negative knowledge from this loop — approaches and candidates dropped, so a later run does not
re-open them:

| Approach | Reason Eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Adopt Notion's radio-button selection grammar (N2, `aeb6d373`) | Appears only in a search-results sort-order list; no consumer in our surface matches, and mixing indicators inside one list breaks N2's own never-mixed rule | `notion-screens-digest.md` §N2; no matching call site in `src/views/` | 1 |
| Treat the digest's `dropdown-field.ts:193` citation as "desktop is gated" | The gate is now phone-only; desktop is an unconditional combobox | `dropdown-field.ts:193-195` vs `notion-screens-digest.md` §4 | 1 |
| Treat the phone `>8` search gate as a gap to close (F2) | ADR-006 ¶1 rules the count gate the phone's alone; the Notion iOS evidence is non-adopted, not unheard | `decision-record.md` ADR-006 | 2 (closes F2 as F10) |
| Adopt Notion's entity-picker filled circle | ADR-005 refusal 4 — two ticks for one affordance is the defect G14 closes | `decision-record.md` ADR-005 | 2 |
| Treat the option editor's missing search as 052 work | D8 assigns cell inline editors to 054; recorded as a 054-facing candidate instead | `goal.md` D8 | 2 |
| Recommend the labelled colour list/grid redesign (N4) | G15 kept the grid and the accessible-name clause has landed; only the visible-label delta remains, and that is an operator question | `option-color-picker.ts:23-26, 40-63`; `design-trueup.md` G15 | 3 |
| Read `popover-position.ts` in full | `design-system.md` §5 already carries its presets (`compact` 220/292/320 at :47-51, the 520 default at :73-74, `PANEL_POPOVER` 292/552/552 at :90-94) and the width policy; a second read would duplicate a cited source | `design-system.md` §5 | 3 |
| The F7 carve-out (plain-text structure-removing rows) as a recommendation | 051 ADR-007 E3 makes red-plus-trash universal; only an operator question survives | `roadmap.md` §6A (2026-09-05 ~18:30) | 4 |
| Any N12-derived host change | 051 ADR-008 already rules the settings panel a right side sheet while menus and pickers stay anchored | `roadmap.md` §6A (2026-09-06 ~08:15) | 4 |
| Duplicating T008 / T009 / T013 work as new remediation rows | D6's one-leg-one-file-group discipline; the pending legs already own those files | `tasks.md` T008, T009, T013; `goal.md` D6 | 4 |

## Divergence Map

This lineage ran under `convergence_mode: default` with `stop_policy: max-iterations`, so the
5-iteration count was a fixed depth requirement and convergence was telemetry only. No Council
pivot occurred and none was called for: **completed pivots 0, failed pivots 0, audited overrides 0**.
newInfoRatio declined monotonically (0.90 → 0.70 → 0.60 → 0.50 → 0.40) as the focus moved from the
dropdown stack to the pickers, then to the authority documents, then to synthesis — a normal
narrowing pattern, and all six key questions were answered before the cap.

**Saturated directions:** the dropdown-stack pattern mapping; the colour-picker disposition; the
width disposition; the conflict register.

**Remaining frontier:** `date-value-picker.ts` (cited second-hand via G13 and never opened — P3's
implementing leg opens it first); `popover-position.ts` internals (deliberately not read); the four
device-only checks in §9, none of which a further research iteration can close; and any 054-owned
picker file, which belongs to that phase's own loop.

## 12. Open Questions

All six charter questions were answered within scope. What follows are questions this loop's own
findings raised, plus the decisions that are the operator's and not ours:

- **Operator — always-visible colour labels.** N4 shows a labelled list or labelled grid. We ship a
  swatch grid with per-swatch accessible names, a hover title and a shape-coded selection, which
  satisfies the anti-colour-only rule. Does the operator want visible labels anyway?
- **Operator — a structure-removal carve-out to E3.** N6 shows Notion using plain text for rows that
  remove structure without destroying content (`Remove grouping`, `Delete filter`). E3 currently
  rules red-plus-trash universal. Carve-out, or keep E3 whole?
- **Operator — the phone search gate.** ADR-006 keeps the `>8` count gate on the phone sheet;
  Notion's iOS screens are search-first at any count. Re-open, or leave as ruled?
- **Needs a file read, not a decision — `date-value-picker.ts`.** P3's threshold assumes the preset
  rows are shaped the way G13 describes; the leg must confirm against the file before writing the
  check.
- **Conditional — the toggle trailing slot.** N1's fifth slot has no consumer in our tree today.
  Does T008's layout panel produce one?
- **Device-only, unanswerable from captures — the four checks in §9.**

## 13. Hand-off Notes

- **The plan's rows are already shaped for a child phase's `tasks.md`** — each carries its files,
  its change, its red-first check and its threshold. P1 is the only row with no owner in 052's
  pending set; P2 rides T008/T009; P4 is 054's; P5 is a reconcile leg that can run immediately.
- **Two `goal.md` criteria describe a tree that no longer exists** (F11 combobox, F18 picker host).
  Any phase that re-reads those criteria as current state will draw a wrong conclusion; P5 exists
  to fix that and should not be deferred behind the code rows.
- **No plugin code was changed by this loop.** Every item in §11 is a proposal to sequence.
- **Cite ADR-006, not the digest or `goal.md`,** for anything about the search gate's disposition:
  it is the only document that post-dates the landing.

## 14. Convergence Report

- **Stop reason:** `maxIterationsReached` (5 / 5), per `stopPolicy: max-iterations`; the 0.05
  `newInfoRatio` convergence threshold was never crossed and was telemetry only for the whole run.
- **Total iterations:** 5 (1-4 evidence, 5 synthesis) · **Findings:** 28 registry entries (14
  load-bearing after supersessions and resolutions) · **Source families:** 3 (the Notion digest;
  nine implementation files; six design-record documents).
- **Questions answered:** 6 / 6.
- **newInfoRatio series:** 0.90, 0.70, 0.60, 0.50, 0.40 — average 0.62, monotonically declining.
- **Convergence signals at the cap:** rolling average (w 0.30) CONTINUE; MAD noise (w 0.35)
  CONTINUE; entropy (w 0.35) n/a (all questions answered before the cap). Legal-stop and graph
  gates not applicable — the hard max-iteration stop precedes gate evaluation, and no `graphEvents`
  were emitted.
- **Quality guards:** source diversity satisfied; every iteration's focus mapped to a tracked
  question; no finding rests on a single weak source; zero stuck iterations; zero scope violations.
- **Executor route-proof:** lineage label `glm-openrouter-dropdowns`, session
  `fanout-glm-openrouter-dropdowns-1788706707176-ed4azu`, parent session `dr-20260906-165807`,
  executor `cli-pi` / `z-ai/glm-5.3-flash` / reasoning effort `max`, executed inline per the
  detached fan-out contract.

## 15. Run History

One lineage was configured and one completed; there were no executor substitutions.

| Lineage | Kind / model | Iterations | Salvaged | Verdict |
|---|---|---|---|---|
| `glm-openrouter-dropdowns` | `cli-pi` / `z-ai/glm-5.3-flash`, effort `max` | 5 / 5 | 0 | succeeded (`maxIterationsReached`) |

`research/orchestration-summary.json` records `total: 1, succeeded: 1, failed: 0` with no orphaned
lineages and no failure classes. It also records five `timestamp_anomalies` of class `after_window`
on the lineage state log: the inline executor stamped its later records with wall-clock times past
the pool's observation window. The anomaly is a **timestamp-provenance** note, not a content
defect — iteration order, delta files and findings are internally consistent — and it is recorded
here so a later audit does not read it as evidence of a partial run.

This top-level synthesis was compiled in a separate session after the original orchestrator process
was terminated by a session cap between `synthesis_complete` on the lineage and the top-level merge.
The merge (`fanout-merge.cjs`) and the resource-map emission (`reduce-state.cjs
--emit-resource-map --fanout-resource-map-only`) were run with the workflow's own tooling; no state
log was hand-edited.

## 16. References

**Notion source (the only one):** `notion-screens-digest.md` — 101 screens, patterns N1-N12, the §4
divergence table, §5 Anytype-vs-Notion, §6 open questions. Screen ids cited above: `ac33be32`,
`cf573f99`, `53858386`, `7174b226`, `aeb6d373`, `8ff7ae4b`, `86a8e66c`, `78e7f802`, `6ecea6c6`,
`f19c6f50`, `213bed5`, `52348672`, `fd5e59c9`, `5e7e723d`, `5f81b365`, `ca4fd83f`, `e9698e1b`,
`299e69bb`, `622d2611`, `b4fd8ac7`, `932bb81c`, `b95c9bf0`, `cfca14fb`, `cb9d8cab`, `841ae11d`,
`7adbbfc8`.

**Implementation:** `src/views/dropdown-field.ts`, `src/views/owned-menu.ts`,
`src/views/menu-row.ts`, `src/views/popover-host.ts`, `src/views/option-color-picker.ts`,
`src/views/record-surface/cell-editor-option.ts`, `cell-editor-relation.ts`, `cell-editor-date.ts`,
and the `.db-dropdown-option*` / `.db-menu-item*` blocks of `styles.css`. Cited but **not read**
this run: `src/views/popover-position.ts`, `src/views/date-value-picker.ts`,
`src/views/cell-renderer.ts`, `src/views/filter-panel-renderer.ts`.

**Design record:** `052/goal.md` (D1-D9, completion criteria, the §4 combobox amendment),
`052/design-trueup.md` (C1-C11, G1-G16, §5 widths, §7 roll-up), `052/decision-record.md`
(ADR-001…ADR-006), `052/tasks.md` (T001-T019 with landing proofs),
`specs/005-component-surface-system/design-system.md` (§4, §5, §6, §9, §11, §12),
`specs/005-component-surface-system/roadmap.md` §6A (051 ADR-007 E3; the ~07:50 undo-toast ruling;
the ~08:15 side-sheet and combobox rulings; the ~10:47 board-scroll precedent; the ~18:20 pixel-read
ruling) and §7.9-7.11. Repo rule: `repo-rules/screenshot-currency.md` §3.

**Generated artifacts from this run:** `research/resource-map.md` (emitted from the converged
lineage deltas), `research/findings-registry.json` and `research/deep-research-findings-registry.json`
(merged from the lineage registry), `research/fanout-attribution.md`,
`research/orchestration-summary.json`, `research/observability-events.jsonl`, and the full lineage
trail under `research/lineages/glm-openrouter-dropdowns/` (`deep-research-state.jsonl`,
`deep-research-strategy.md`, `deep-research-dashboard.md`, `findings-registry.json`,
`resource-map.md`, `research.md`, `iterations/iteration-001.md` … `iteration-005.md`,
`deltas/iter-001.jsonl` … `iter-005.jsonl`).

## 17. Machine State (do not hand-edit)

Reducer-owned anchors are refreshed from `findings-registry.json`, the lineage
`deep-research-state.jsonl` and `deep-research-strategy.md` under `research/` and
`research/lineages/glm-openrouter-dropdowns/`. This section exists so a later reducer run can
locate and refresh those anchors without mutating the synthesis above.

<!-- ANCHOR:deep-research-notion-dropdown-picker-source -->
<!-- ANCHOR:findings -->
<!-- ANCHOR:convergence-report -->
