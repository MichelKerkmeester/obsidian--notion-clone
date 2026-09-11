---
title: "Verification: Phase 12: Board Card Fields Never Wrap Side by Side"
description: "The image judge's per-iteration score table against the parent's eight-row rubric, plus the lane and operator gates that close this child."
trigger_phrases:
  - "012-board-card-fields verification"
  - "012-board-card-fields judge score"
  - "012-board-card-fields verification.md"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Verification: Phase 12: Board Card Fields Never Wrap Side by Side

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/012-board-card-fields
**Level:** 2
**Status:** Iteration 1 judged
**Date:** 2026-09-11
**Loop graph:** `../decision-record.md` D6; `../plan.md` §6A "Running a child through the loop". This file is the VERIFY step's artefact (parent `spec.md` §5 step 5) and the record the JUDGE and REMEDIATE nodes write to.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:gates -->
## 2. THE THREE GATES

- **(a) Lane.** Every measurable row of `spec.md` §13's DEFINE table green, with its RED number and GREEN number recorded in `tasks.md`.
- **(b) Image judge.** The eight-row rubric below, scored 0-2 each, maximum 16. Pass is **>= 14/16 with no row at 0**, **twice consecutively on an unchanged tree** (parent `decision-record.md` D1). This child is judged against the Anytype mobile kanban reference (`spec.md` §13), not Notion.
- **(c) Operator.** The operator's own phone read closes the alignment judgement. **No agent ticks this row** (parent D1, D5).
<!-- /ANCHOR:gates -->

---

<!-- ANCHOR:iterations -->
## 3. ITERATIONS

| Iteration | SHA | Light capture | Dark capture | Frame | Sections | Row anatomy | Controls | Type | Spacing | Colour | Both themes | Total | Zeros | Verdict | Findings |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2b30f6f5 | `screenshots/notion-clone/views/constructed-board-{mobile,desktop}-light.png` | `screenshots/notion-clone/views/constructed-board-{mobile,desktop}-dark.png` | 2 | 2 | 1 | 2 | 2 | 2 | 2 | 2 | 15 | 0 | pass | n/a |

Each row is one JUDGE pass. The eight rubric columns hold a 0/1/2 score with a one-line
justification carried into the Findings cell whenever the score is below 2. Total is the sum out of
16; Zeros is the count of rubric rows scored 0; Verdict is `pass` (>= 14, no 0) or `fail`; Findings
points at `findings-<iter>.md` under the loop's scratch state on a fail (`plan.md` §6A). The child is
not done in-repo until two consecutive rows both read `pass` on an unchanged tree.

### Iteration 1 — evidence

Reference: `screenshots/anytype/mobile/app/anytype-mobile-set-kanban-{light,dark}.png`. Ours: `constructed-board-mobile-{light,dark}.png` (production mount, `constructedScenario("board", …)`), cross-checked against `constructed-board-desktop-light.png` at 1440px.

- **Frame (2).** Both surfaces show a rounded-corner card box on the theme's canvas token (white/light-gray border in light, dark gray fill and border in dark), title top-left, no other chrome inside the card — matches the reference's header/canvas layout.
- **Sections (2).** Neither surface groups fields into sub-blocks inside a card — every property is a flat stack of full-width rows in both ours and Anytype's "Sandbox parity fixes" / "Feature…" cards; column-level grouping (Backlog/Todo/etc. vs Uncategorized/Blocked) matches structurally too.
- **Row anatomy (1).** The core fix reads correctly — every field in our mobile and desktop captures now occupies its own full-width row with nothing beside it, matching Anytype's "no two properties share a row" rule (confirmed at both 340px-class mobile and 1440px desktop, e.g. `withdrawn`, `transfer`, `category` all full-width, unclipped). It does not score a 2 because our rows keep a persistent `label value` pair on every line (`month 0,5`, `withdrawn January 10, 2026`), while Anytype's plain-value rows (dates, numbers, free text) carry no leading label at all — only its checkbox and chip rows have an identifying element. This is a documented, intentional divergence (spec.md §13, §12 — 045's visible-label improvement is kept), not a defect to remediate, but it is the one row where the reference's exact anatomy is not reproduced.
- **Controls (2).** Checkbox glyph (empty/filled circle) and pill-shaped chip badges appear in both surfaces with the same kind and affordance — no input rendered where the reference navigates or vice versa.
- **Type (2).** Card title reads bold/larger than the regular-weight field rows in both surfaces; the hierarchy is the same two-level scale in ours and in Anytype.
- **Spacing (2).** Single-column pitch is even and full-width in both our mobile and desktop captures, matching the reference's one-row-per-property rhythm; no half-width truncation is visible anywhere (`Related tasks`-length labels aren't in this fixture, but the longest labels present — `withdrawn`, `transfer`, `category` — sit comfortably inside the full card width at both viewports).
- **Colour (2).** Label/value/chip colour tokens read correctly in both themes — no contrast failure, chip colours (purple, green, orange, blue) stay legible against both the light and dark card backgrounds.
- **Both themes (2).** Light and dark captures are structurally identical row-for-row in both ours and the reference; only the palette inverts, consistently.

Total 15/16, zero rows at 0 → **pass** for this iteration.
<!-- /ANCHOR:iterations -->

---

<!-- ANCHOR:operator -->
## 4. OPERATOR GATE

- [ ] The operator has read the board on their own iPhone and reports fields no longer wrapping side by side — never ticked by an agent (parent `decision-record.md` D1, `goal.md` D5)
<!-- /ANCHOR:operator -->
