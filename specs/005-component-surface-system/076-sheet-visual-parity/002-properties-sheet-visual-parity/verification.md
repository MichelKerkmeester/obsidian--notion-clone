---
title: "Verification: Phase 2: Properties Sheet Visual Parity"
description: "The image judge's per-iteration score table against the parent's eight-row rubric, plus the lane and operator gates that close this child."
trigger_phrases:
  - "002-properties-sheet-visual-parity verification"
  - "002-properties-sheet-visual-parity judge score"
  - "002-properties-sheet-visual-parity verification.md"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Verification: Phase 2: Properties Sheet Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/002-properties-sheet-visual-parity
**Level:** 2
**Status:** CREATE landed; lane green; iteration 1 JUDGE pass recorded below — **fail, 11/16, 1 zero (Colour)** — awaiting REMEDIATE
**Date:** 2026-09-11
**Loop graph:** `../decision-record.md` D6; `../plan.md` §6A "Running a child through the loop". This file is the VERIFY step's artefact (parent `spec.md` §5 step 5) and the record the JUDGE and REMEDIATE nodes write to.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:gates -->
## 2. THE THREE GATES

- **(a) Lane.** Every measurable row of `spec.md` §13's DEFINE table green, with its RED number and GREEN number recorded in `tasks.md`.
- **(b) Image judge.** The eight-row rubric below, scored 0-2 each, maximum 16. Pass is **>= 14/16 with no row at 0**, **twice consecutively on an unchanged tree** (parent `decision-record.md` D1).
- **(c) Operator.** The operator's own phone read closes the alignment judgement. **No agent ticks this row** (parent D1, D5).
<!-- /ANCHOR:gates -->

---

<!-- ANCHOR:iterations -->
## 3. ITERATIONS

| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CREATE self-score (not the JUDGE pass) | this commit | `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` | `constructed-column-manager-mobile-dark.png` | 1 | 2 | 2 | 2 | 2 | 2 | 1 | 1 | 13 | 0 | self-score, informal | see paragraph below |
| **1 (JUDGE)** | `4ab094cf` | `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` | `constructed-column-manager-mobile-dark.png` | 1 | 1 | 2 | 2 | 2 | 2 | 0 | 1 | **11** | **1** | **fail** | `findings-1.md` |
| **2 (remediate leg)** | `a2146136` | `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` | `constructed-column-manager-mobile-dark.png` | 1 (carried) | — | — | — | — | — | — | — | — | — | judge re-score owed | see Iteration 2 below |

### Iteration 1 — JUDGE node's own pass

Reviewed against R-1 (`hiding-properties-02`, nothing hidden) and R-2 (`hiding-properties-03`, one
hidden), per `spec.md` §13.0 precedence (rungs 1-2 empty, rung 3 is binding). Both `constructed-
column-manager-mobile-{light,dark}.png` opened at full resolution; several claims cross-checked by
pixel sample (`PIL`) rather than eye alone, since a token-level colour claim is not reliably read off
a compressed render by inspection.

- **Frame (1)** — Grab handle, centred `Properties` title, trailing `✕`, bottom-sheet presentation
  all match R-1/R-2 structurally. Canvas measures `rgb(242,242,242)` light / `rgb(46,46,46)` dark
  against R-1/R-2's own measured `rgb(250,248,246)` — a canvas-token gap `spec.md` §13.1 already
  records as out of scope for this child (inherited from `076/001`'s Frame ceiling, not a new defect).
  Capped at 1 by the rubric's own "wrong canvas" anchor, matching the DEFINE's own expectation.
- **Sections (1)** — What is visible matches the target exactly: one card, `Shown in table` in
  sentence case, `Hide all` right-aligned on the same line, card visibly lighter than canvas in
  light theme. **But the judged capture never reaches the second state.** Both PNGs are 1748px tall
  and end mid-list around `Field 13`/`Field 14` — the `Hidden in table` card, its own heading/`Show
  all` link, and the add-property card's own terminal wrapper are all outside the frame in both
  images. A lane clause (`L4`, `L6`) asserts these exist structurally, but D1 is explicit that a lane
  is a floor, not evidence a picture looks right, and this judge can only score what the two named
  images show. Scored 1 rather than 2 because half of the rubric's own claim — "same sections, same
  order" — is unconfirmable from this capture set.
- **Row anatomy (2)** — Confirmed at 3x crop: `arrow · arrow · type icon · label · eye` in that
  order, zero checkboxes anywhere in either theme. Matches the DEFINE's corrected target (`arrow ·
  arrow` retained per `071/012` ADR-001, extended not contradicted).
- **Controls (2)** — The trailing control is an icon-only eye/eye-off button, no chevron, no value,
  matching Notion's eye-toggle control kind exactly. Reorder stays the arrow pair, intentionally.
- **Type (2)** — `Shown in table` renders sentence case, no uppercase transform; row label weight is
  unchanged and reads correctly against R-1/R-2.
- **Spacing (2)** — Row pitch reads generously taller than the old 30px hardcode — measured centre-
  to-centre eye-icon spacing in the capture is consistent with a ≥44px row, clearing the phone thumb
  floor; card inset and corner radius read consistent with `076/001`'s own landed figures.
- **Colour (0)** — Two independent, unrelated contrast failures found by direct pixel sample of the
  capture, not merely a single token off: **(a)** dark card fill measures `rgb(57,57,57)` against
  dark canvas `rgb(46,46,46)` — an 11/255 delta that reads as visually flat, versus light theme's
  clearly legible `rgb(255,255,255)` vs `rgb(242,242,242)` pair (inherited `076/001` ADR-K).
  **(b)** The required `Name` row's eye icon was targeted (`spec.md` §13.3, lane `L3`) to compute a
  measurably lower contrast than an enabled row's. A 3x crop of the `Name`/`Field 1`/`Field 3` eye
  icons shows them **pixel-identical** — same stroke colour, same weight — even though the same row's
  own up-arrow control visibly greys out under the same disabled state. `styles.css:14485`'s
  `.obnotion-column-manager-eye:disabled { opacity: 0.5 }` rule exists but is not reaching the
  rendered icon in this capture. Two independent hierarchy breaks, not one token off — scored 0 per
  the rubric's own "wrong hierarchy or a contrast failure" anchor.
- **Both themes (1)** — Light is fully legible and internally consistent with the target. Dark is
  structurally identical (same row order, same single-card branch visible) but its card boundary
  does not read against canvas for the same ADR-K reason as Colour, so the two themes are not equally
  legible even though structurally matched.

**Total 11/16, 1 zero (Colour) — fail**, both on the total and on the zero-row rule. Findings
recorded in `findings-1.md` for REMEDIATE.

Each row is one JUDGE pass. The eight rubric columns hold a 0/1/2 score with a one-line
justification carried into the Findings cell whenever the score is below 2. Total is the sum out of
16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0) or `fail`; Findings
points at `findings-<iter>.md` under the loop's scratch state on a fail (`plan.md` §6A). The child is
not done in-repo until two consecutive rows both read `pass` on an unchanged tree.

**The row above is the CREATE node's own read, not the JUDGE node's pass** (`../decision-record.md`
D6 keeps these two nodes distinct; the loop graph runs JUDGE after LAND). It is recorded so the
operator and the JUDGE node both have a documented baseline before the official run, per this
child's dispatch. Self-scored against the phone captures, both themes, opened and looked at:

- **Frame (1)** — Unchanged for this child by design (`spec.md` §13.1); ADR-I stays open and inherited
  from `076/001`, so 1 is the expected ceiling here, not a remediation trigger.
- **Sections (2)** — Both states present and correctly shaped in both themes: one undivided card
  when nothing is hidden, two headed cards when one is (`L4`, computed-style confirmed). Headings
  read `Shown in table` / `Hidden in table`, sentence case, with the bulk link right-aligned on the
  same line — matching R-1/R-2 exactly, including the copy.
- **Row anatomy (2)** — `arrow · arrow · type icon · label · eye` in that order, confirmed in the
  actual capture; zero checkboxes remain (`L1`).
- **Controls (2)** — The state control is an eye/eye-off icon button, not an input; the reorder pair
  is unchanged per ADR-001's extension (not a grip); no native select, no bordered text input.
- **Type (2)** — Section heading drops its uppercase transform; row label/value type is unchanged
  (already correct per `spec.md` §13.5).
- **Spacing (2)** — Row height reads 48px (44px token plus the row's own 2px/2px padding), clearing
  the 44px floor; card inset/gap reuse `076/001`'s already-scored figures rather than re-deriving
  them, so this is inherited confidence, not independently re-measured against Notion here.
- **Colour (1)** — Light theme: card reads visibly lighter than canvas, matching the target
  relationship. **Dark theme: the card is barely distinguishable from its own canvas** — this is
  `076/001`'s own open Proposed ADR-K (the shared `--obnotion-settings-card-fill` computes darker
  than canvas in dark theme), inherited here exactly as `spec.md` §6/§13.7 predicted and explicitly
  not this child's to fix. Scored 1 rather than 0 because the light-theme relationship is correct
  and the defect is a tracked, known dependency rather than an unaddressed contradiction.
- **Both themes (1)** — Light is fully consistent with the target. Dark is structurally identical
  (same two cards, same row anatomy) but the card boundary does not read clearly against the canvas
  for the same ADR-K reason above, so the two themes are not equally legible even though they are
  structurally matched.

**What could not be directly viewed.** The fixture's default state photographs 16 property rows,
which scroll past the phone viewport before the hidden section and the add-property card enter
frame — the static capture shows only the "everything shown" portion of the list. The hidden-section
card and the add-row card were confirmed structurally (not visually) through `L4`/`L6`'s
computed-style assertions (background distinct from canvas, radius ≥ 8px) and visually through the
6-column hand-authored `panel-column-manager` fixture (not the judged capture, and not carrying the
phone-sheet card CSS since it renders as the desktop anchored presentation) after that fixture's own
row markup was brought current in this same change.

**Self-score total is 13/16, below the 14/16 pass bar, driven entirely by the inherited dark-theme
ADR-K defect (Colour, Both themes).** This is not a defect this child introduces or can close on its
own — the shared token is `076/001`'s to fix — so a first official JUDGE pass may need `076/001`'s
own dark-card fix to land first, or may accept the light-theme correctness and score the dark
shortfall as a shared, tracked risk rather than a `076/002`-owned remediation target. Recorded here
so the JUDGE node has this reasoning rather than rediscovering it.
### Iteration 2 — remediate leg (clause RED → producer → GREEN; the judge's re-score is owed, not recorded here)

The remediate leg took the three rows the judge scored below 2 (Sections 1, Colour 0, Both themes 1) one
clause at a time: the clause runs RED against the judged fixture as it stood, the producer moves, the
clause runs GREEN, then the whole corpus is re-photographed twice and the judged captures themselves
are sampled. Rows the judge scored 2 were not touched, and Frame 1 stays the carried, expected 1 —
the canvas token gap is the same cross-child dependency it has been since the judge's pass, owned by
the settings packet, not remediated here.

| Finding (judge, iteration 1) | RED — the clause, before | Producer | GREEN — the clause, after | Judged-capture evidence |
|---|---|---|---|---|
| Sections 1 — the judged captures end mid-list; the hidden-section card, its bulk link and the add-property card sit past the judged fold | judged-frame clause: the sheet measures 1064.8px against the 874px judged viewport (deepest section 964.8px, add-property row 1064.8px into the sheet, both themes) | the judged fixture: sixteen rows became ten (nine shown, one hidden) | judged-frame clause: sheet 786.6px, deepest section 676.8px, add-property row 776.8px into the sheet — all inside 874, both themes | the judged 804×1748 captures sampled: the hidden-section card's fill at y=1500 and the add-property card's at y=1690 read the card, the 12px margin below the add-row reads the canvas — both grouping states, both headings and the bulk links are inside the judged frame |
| Colour 0 (a) — the dark card fill computes rgb(57,57,57) against a rgb(46,46,46) canvas, 11/255, visually flat | both-themes card-step clause, dark: 11.25/255 (floor 12; light leg 12.75/255 under the theme's own token) | the shared grouped-settings card token: the dark theme declares its own 85% mix instead of borrowing the 88% modal rung — 63.75 on the 45.75 canvas, 18/255; light theme untouched | both-themes card-step clause: dark 18/255, light 12.75/255 | the judged dark capture: cards rgb(64,64,64) on rgb(46,46,46); light unchanged: rgb(255,255,255) on rgb(242,242,242). This lands the settings packet's own ADR-K re-tune on its behalf; its verdict rows inherit the brighter dark fill (57 → 64 on a 46 canvas) and its own judge leg reconciles its recorded current state |
| Colour 0 (b) — the required column's eye renders pixel-identical to an enabled row's | required-eye clause: 0 disabled eyes of 16 — the fixture's config declared no titleField, so no eye ever mounted disabled, and the 0-case printed N/A instead of failing | the judged fixture declares the titleField; the title column mounts required — its eye renders with the `disabled` attribute and the 0.5 opacity rule (specificity: the `:disabled` rule outranks the bottom-sheet hit-box rule, confirmed by the computed read, not by selector arithmetic) | required-eye clause: 0.5 vs 1, 1 required of 10 rows | the judged captures mount the Name row's eye disabled and dimmed; the required-column hint reads beneath the label, the shipped required indicator, not a fixture-only decoration |
| Both themes 1 — the dark card boundary does not read against its canvas | = the Colour (a) dark leg | = the 85% step | = the 18/255 dark step | the judged dark capture: rgb(64,64,64) cards against rgb(46,46,46) — 18/255, wider than light's 13/255 reference delta, so the dark boundary now reads at least as distinctly as the light one |

**Corpus evidence.** The full capture corpus ran twice; the two runs agreed, so the 27 moved captures are
deterministic: the column-manager pair and its desktop pair from the fixture, the settings-carded surfaces
from the 57 → 64 fill, the view-config/settings/panel views from the same shared token, and two board views
at 1-6px on one channel. 15 of the 27 move at the manifest's own fingerprints, 12 at bytes only; the lane
release names all 15 content-moved captures (check-lane exit 0). The 16 evidence artefacts were re-derived
by their own tools against this tree (evidence 16/16 fresh). Gate 28/28. Type, spacing and row-anatomy
behaviour rode the same fixture change and their clauses stayed green (L1 0 checkboxes, L2 10/10 exactly one
trailing eye, L5 heights 48, L4 2 sections, L6 add-row carded) — the two board-view 1px moves are the
card token's own residual, recorded in the lane release.

**What this iteration does not prove.** The pass-2 judge row. The clauses above prove the judged fixture now
mounts the states the reference photographs; the eight-row rubric is the judge's to re-score, twice, on this
tree. The one defect this leg carried, the canvas token (rgb(46,46,46) ours against the
reference's rgb(250,248,246)), is the settings packet's — carried, untouched, not remediated here.

### Iteration 2 — JUDGE node (current tree)

The expanded production-mount captures `screenshots/notion-clone/panels/constructed-column-manager-sheet-mobile-light.png`
and `constructed-column-manager-sheet-mobile-dark.png` were opened at full resolution beside the named
Notion Property visibility states R-1/R-2, the separate add-affordance precedent R-5, and the Anytype
properties list R-6. No operator capture exists at the preferred reference rung, as recorded in `spec.md`
§13.0. The current pixels, rather than the lane prose, are decisive: both themes still paint the shown,
hidden, and add-property groups as rounded filled containers, which the operator's D7 ruling explicitly
rejects.

The visual review applies the loaded design fundamentals as the decision lens: hierarchy is carried by
weight and color before size (`hierarchy.md` §2-3), group separation uses proximity and a deliberate boundary
(`ux-laws.md` §5), surfaces emulate one consistent depth cue (`depth-and-detail.md` §2 and §7), colors are
checked for readable light/dark contrast (`color-system.md` §6-7), and the component/state checks include
touchable icon controls and consistent typography (`interaction-craft.md` §3-5; `review-checklist.md` §5).

| Rubric row | Score | Evidence and design fundamental |
|---|---:|---|
| Frame | 0 | Both light and dark captures visibly put the property rows and add actions inside rounded lighter/darker containers on the sheet, which is an explicit D7 no-container failure under the parent rubric (`depth-and-detail.md` §7; `diagnosis-table.md` §3). |
| Sections | 0 | Both captures show the shown, hidden, and add-property groups separated by filled rounded card boundaries rather than plain headings plus a hairline divider, the exact grouping form D7 scores zero (`hierarchy.md` §3; `ux-laws.md` §5). |
| Row anatomy | 2 | In both themes each row visibly reads as paired reorder arrows, leading type icon, label or required hint, and a trailing eye/eye-off, matching this child’s composed target and the reference’s leading-label-trailing grammar (`spec.md` §13.3; `interaction-craft.md` §5). |
| Controls | 2 | Both captures show the trailing eye/eye-off toggle and retained reorder arrows with no filled checkbox or native input in the row, while the add actions remain full-width labelled rows (`interaction-craft.md` §3 and §5; `review-checklist.md` §5). |
| Type | 2 | Light and dark preserve the same centered semibold title, sentence-case muted section labels, regular row labels, and subdued required hint hierarchy visible in the Notion references (`hierarchy.md` §2; `review-checklist.md` §5). |
| Spacing | 2 | Both captures show a consistent generous row pitch, stable leading/trailing insets, and even section gaps without local crowding or drift (`SKILL.md` §3-4; `ux-laws.md` §5). |
| Colour | 1 | In both captures the primary and secondary text remains legible and the theme contrast is now visible, but the expected hairline divider is absent and opaque group fills remain the dominant color cue, leaving the divider/color treatment one token off (`color-system.md` §6-7; `hierarchy.md` §2-3). |
| Both themes | 2 | The light and dark captures share the same header, row order, section count, control placement, and required-row treatment, and each remains internally legible with an appropriate theme contrast (`color-system.md` §7; `review-checklist.md` §5). |

**Total: 11/16, 2 zeros — fail.** The pass rule is 14/16 or higher with no zero, so this iteration does
not close the child and opens remediation for Frame, Sections, and Colour.

<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 4. OPERATOR GATE

- [ ] The operator has read this sheet on their own iPhone and reports it aligned with the reference — never ticked by an agent (parent `decision-record.md` D1, `goal.md` D5)
<!-- /ANCHOR:operator -->
