---
title: "Implementation Plan: Sheet Reading Rhythm and Keyboard Avoidance"
description: "The approach that was taken to make the phone record sheet read as pairs rather than columns, and to lift it clear of the software keyboard using the host's own reporting variable."
trigger_phrases:
  - "010 sheet reading plan"
  - "keyboard avoidance approach"
  - "record sheet rhythm"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Sheet Reading Rhythm and Keyboard Avoidance

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work shipped before the plan was written, so the
gates below carry observed numbers rather than intended thresholds.

Two problems were addressed in one stylesheet block plus one placement lever. They arrived together
from the same device report and share a surface, but they are independent and were measured
independently.

*Reading rhythm.* The sheet presented each row as a label pinned left and a value pinned hard right,
producing two disconnected columns with a wide gutter between them. Nine criteria now govern the
repair.

*Keyboard avoidance.* The sheet is `position: fixed` with `bottom: 0`, docked to the layout viewport,
which a software keyboard does not change. It stayed behind the keyboard while a field was edited.
Six criteria govern that half.

**The method mattered more than either fix.** Both halves were measured before anything was designed
— the reference screenshot was decomposed into ink runs rather than judged by eye, and the host's
keyboard mechanism was read out of Obsidian's shipped bundle rather than assumed.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Observed |
|---|---|
| Value text starts on one column | left-edge spread was 42.3px across 36 rows; threshold ≤ 2px |
| Value column position | began at 84% of sheet width; threshold ≤ 40% |
| Row pitch | 28.8px; threshold ≥ 38px, reference measured 38.0 |
| Row height | 26.8px; threshold ≥ 44px |
| Gap between targets | 2.0px; threshold ≤ 0.5px |
| Divider present | `0px none`; threshold width > 0 and not fully transparent |
| Value text size | 13px; threshold ≥ 16px, the iOS zoom floor |
| Label truncates instead of shoving | value box moved 115px on a long label; threshold ≤ 1px |
| Sheet lifts on a reported keyboard | bottom stayed 844 where 513 was wanted; threshold within 2px |
| Sheet still reaches the floor with no keyboard | 844 = 844, green before and after |
| Desktop unchanged | row 26.84px, value right-aligned, gap 2px, no divider — identical before and after |

**Two of these criteria were themselves wrong and were corrected rather than satisfied.** That is
recorded here because a criterion that cannot fail is worse than a missing one.

Criterion 9 first measured the value's *text* rectangle. Under `text-align: right` that edge is
pinned by construction, so the check passed against the defect and could never have gone red. It now
measures the value's box and its control widens a label by 200px to confirm the assertion moves.

Criterion 2 first read "gutter between a label's last glyph and its value's first glyph ≤ 24px", and
the implementation failed it at 33–80px. **The implementation was right and the criterion was not.** A
fixed value column necessarily leaves a variable gap beside a short label, and the reference does
exactly that — its own gutters run 11px to 71px. A ≤ 24px rule forbids the layout being copied. What
made the sheet unreadable was the column's *position*, not the size of any one gap.

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**The reading defect has a mechanical cause, not an aesthetic one.** The field list carried
`gap: 2px` while each row carried `8px` of internal padding. The eye binds the column that is closer,
and the columns were closer than the pairs. That single inequality is why thirteen rows read as two
ledgers rather than thirteen records.

The decisive measurement is a shape, not a size: Notion's value column *starts* at a fixed 154.7px
with 0.7px of spread across 13 rows and ends ragged; the plugin's values *ended* at a fixed 382.7px
with 0.3px of spread and started ragged across 51.0px. Fixed-start against fixed-end is the signature
of `text-align: right` on a fixed column. The inherited rule reaches the sheet because the portal adds
`note-database-container` to the sheet itself.

**The keyboard defect is about which viewport the sheet is docked to.** Obsidian declares
`--keyboard-height: 0px` on `:root` and writes it from the native `keyboardWillShow` and
`keyboardWillHide` events; it positions its own mobile toolbar from that value and shrinks
`.app-container` with it. The WebView is never resized — `body.is-mobile` stays at `height: 100vh`.
The sheet is portalled to `document.body`, a **sibling** of `.app-container`, so it inherits none of
that shrink. That is the entire defect.

The lever already existed. `bottom: var(--db-mobile-sheet-bottom, 0px)` was declared `!important` and
already beat the inline `bottom`; `place()` was simply always writing `0px` into it. The
`visualViewport` subscription was also already there and was never the missing piece.

**The host variable is primary and the visual viewport is a fallback**, combined with `max()` so
whichever observes the keyboard first wins. Primacy goes to the host variable because anything else
would put the sheet on a different number from the toolbar riding beside it.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

**Step 1 — measure both references before designing either fix.** The two screenshots were
luminance-thresholded per row band and decomposed into ink runs; the host's keyboard mechanism was
read out of `app.js` and `app.css` extracted from `obsidian.asar`. Neither number came from
inspection.

**Step 2 — re-rule the sheet rows.** Value un-pinned from the right edge, label given a fixed 96px
column that truncates, list gap taken to 0 with a hairline between rows, padding raised, label moved
off the `em`-based token, value raised to the 16px step.

**Step 3 — wire the keyboard lever.** Write the measured inset into `--db-mobile-sheet-bottom`, and
subtract the same term from the sheet's `max-height` so lifting the bottom edge cannot push the top
off screen.

**Step 4 — guard the false positive.** Ignore the visual-viewport term when `scale > 1.01`, because
`innerHeight − visualViewport.height − offsetTop` is also non-zero under pinch-zoom and would
otherwise make the sheet jump when a reader zooms.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The checks live in the phone section of `tools/storybook/verify-placement.mjs` and are built to
resist two specific ways this program has previously fooled itself.

They call **`positionToolbarPopover`**, the function the record panel actually calls, rather than
`applySheetChrome`. A check that calls the chrome helper alone exercises none of the placement
arithmetic, and that exact mistake shipped a broken sheet twice.

They build rows with the shipped **`renderCardField`**, so class names, element types and nesting are
production's rather than a hand-copy free to drift.

They measure **text rectangles** where the criterion is about what a person sees and **box
rectangles** where it is about layout pressure — the distinction that made criterion 9 unfalsifiable
the first time.

**The keyboard half is verified against the mechanism, not against a keyboard.** No harness in this
repository contains one. Criteria 11 through 15 drive `--keyboard-height` and `visualViewport` at a
value measured off the operator's screenshot (331px). They prove the sheet responds correctly to the
signal. They do not prove iOS emits that signal at that moment with that number.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`003-mobile-sheet-presentation` is the predecessor and the regression surface: it made the sheet reach
the floor and cover the navigation bar, and `verify-placement` asserts both. Criterion 10 holds them
green, and the `max-height` change reduces to exactly `90svh` when the inset term is `0px`, so `003`'s
cap is unchanged by construction rather than by retest.

The host is a dependency in the strong sense: the fix reads a variable Obsidian owns. If Obsidian
stops writing `--keyboard-height`, the visual-viewport fallback carries it.

The serialized `styles.css` lane was acquired for the edit. It was taken while the stylesheet had
already drifted with no phase claiming the edit, so `check-lane` was red before this phase touched
anything. That drift belongs to the overlay phase and was recorded rather than absorbed, so this
phase's own diff stays measurable.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Every rule added is scoped `.db-record-detail-panel.db-mobile-bottom-sheet`, a class only the phone
sheet carries, so reverting the block restores the previous phone sheet and cannot reach desktop.
Desktop was measured identical before and after — row 26.84px, value right-aligned, gap 2px, no
divider — which is the evidence that a revert is narrow.

The keyboard lever reverts independently: writing `0px` into `--db-mobile-sheet-bottom` returns the
sheet to the floor and restores `90svh` exactly.

**One known hazard is deliberately left in place.** `record-detail-panel.ts` closes the panel on a
`window` resize. On iOS that never fires for the keyboard, which is why the reported screenshot shows
the sheet still open, so it is not part of the reported defect. On a host that *does* announce the
keyboard by resizing the window, it would close the sheet mid-edit — and no inset can apply to a
destroyed sheet. Left unchanged because it is outside the reported defect and could not be verified
here without driving the panel opener, which needs a vault. It is the open question that decides
whether the keyboard half is finished or blocked on the operator's handset.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md) · [`../design-system.md`](../design-system.md)
- [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md) — the presentation this refines
- [`../016-sheet-drag-and-audit/spec.md`](../016-sheet-drag-and-audit/spec.md) — re-measured these asks on the shipped build
