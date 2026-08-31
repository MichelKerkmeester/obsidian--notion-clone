---
title: "Acceptance Criteria: Sheet Reading Rhythm and Keyboard Avoidance"
description: "Numbered, measurable criteria for the phone record sheet's reading rhythm and its behaviour when the software keyboard opens, each with a threshold and a red baseline."
trigger_phrases:
  - "010 acceptance criteria"
  - "sheet reading criteria"
  - "keyboard avoidance criteria"
importance_tier: "critical"
contextType: "planning"
---

# Acceptance Criteria: Sheet Reading Rhythm and Keyboard Avoidance

Every criterion below carries a number, a threshold, and the value it had **before** the change,
measured by a check that drives the shipped code. The red baseline is not a prediction; it is the
output of `tools/storybook/verify-placement.mjs` run against the tree as it arrived.

---

## 1. HOW THESE ARE MEASURED

The checks live in `tools/storybook/verify-placement.mjs`, in its phone section. They:

- bundle and call **`positionToolbarPopover`**, the function the record panel actually calls, rather
  than `applySheetChrome` — a check that calls the chrome helper alone exercises none of the
  placement arithmetic, and that mistake shipped a broken sheet twice;
- build the field rows with the shipped **`renderCardField`** from `src/views/card-field-renderer.ts`,
  so the class names, element types and nesting are production's rather than a hand-copy that can
  drift;
- measure **text rectangles** (`Range.getBoundingClientRect`) where the criterion is about what a
  person sees, and **box rectangles** where it is about layout pressure;
- run at 390 × 844 with `isMobile`, a viewport meta tag, a `.mobile-navbar`, a safe-area inset, and
  the leaf's real `contain: strict`.

Three of these criteria began as checks that **could not fail**, or as thresholds that were simply
wrong. They are marked ⚠ and each is explained where it appears, with the control that now proves
the check can go red.

**What no check here covers**: no harness in this repository contains a software keyboard. The
keyboard criteria are verified by driving the *mechanism the host uses to report a keyboard*, not by
opening one. Criterion 12 states that limit as a criterion of its own.

---

## 2. PROBLEM ONE — READING RHYTHM

Reference numbers are measured off `reference-notion-record.png` and `device-sheet-at-rest.png`,
both 1206 × 2622 at DPR 3, so 402 × 874 CSS px, by luminance-thresholding each row band and
decomposing it into ink runs rather than by eye.

The decisive pair of numbers: Notion's value column **starts** at a fixed 154.7px (spread 0.7px
across 13 rows) and its values end ragged; the plugin's values **end** at a fixed 382.7px (spread
0.3px) and start ragged across 51.0px. Fixed-start versus fixed-end is the signature of
`text-align: right` against a fixed column, and it is why the eye pairs each value with the value
above it instead of with its own label.

| # | Criterion | Threshold | Red baseline |
|---|---|---|---|
| 1 | The value text of every row starts at the same x — a fixed column, not a ragged edge produced by right-alignment. | left-edge spread across all rows **≤ 2px** | **42.3px** across 36 rows (device: 51.0px across 12) |
| 2 ⚠ | The value column begins early enough that a label and its value read as one line. | value column left edge **≤ 40%** of sheet width (reference measured 38.5%) | **84%** (device: 81–94%) |
| 3 | Row pitch reaches the reference rhythm. | min pitch **≥ 38px** (Notion measured 38.0) | **28.8px** (device: 28.0px) |
| 4 | A row is a thumb-sized target. | min row height **≥ 44px** (WCAG 2.5.5) | **26.8px** |
| 5 | No dead space between adjacent targets. | max gap between consecutive row boxes **≤ 0.5px** | **2.0px** (`gap: 2px` on the field list) |
| 6 | A visible divider separates each item, as the operator asked. | `border-bottom` width > 0 **and** colour not fully transparent | **`0px none`** — no divider at all |
| 7 | Value text is at least the size at which iOS does not zoom the page when the field is focused for editing. | **≥ 16px** | **13px** |
| 8 | The label is on the project's type scale and never larger than the value. | size ∈ {11, 12, 13, 16, 22} **and** ≤ value size | **13px = 13px** — equal, so the pair had no size rank at all |
| 9 ⚠ | A label longer than its column truncates instead of pushing the value column sideways. | value **box** left edge moves **≤ 1px** when the label text is replaced with a 36-character name | **moves 115px** (98 → 213) |

Criterion 9 is marked ⚠ because the first version measured the value's *text* rect. Under
`text-align: right` that edge is pinned by construction, so the check passed against the defect and
could never have failed. Its control now widens a label by 200px and confirms the assertion moves.

Criterion 2 is marked ⚠ because its first threshold was **wrong, not merely strict**. It read "max
gutter between a label's last glyph and its value's first glyph ≤ 24px", and the implementation
failed it at 33–80px. The implementation was right and the criterion was not: a fixed value column
*necessarily* leaves a variable gap beside a short label, and the reference does exactly that — its
own gutters range from 11px to 71px. A ≤ 24px rule forbids the layout being copied. What actually
made the sheet unreadable was the column's **position**, not the size of any one gap: values began
at 81–94% of the screen width, so a pair spanned the whole sheet. The criterion now measures that,
and the per-row range is still reported beside it so the two can be compared with the reference.

### 2.1 Values, and why each beat its neighbours

Every value is a step on a scale the project already declares in `styles.css` — `--db-space-*`,
`--db-font-*`, `--db-border-*`. Where the project's scale and the `sk-design` default scale disagree,
**the project's wins**; that is the rule, and it is why the label stays at 13px rather than moving to
the 14px step `sk-design` would otherwise pick.

| Property | From | To | Why not its neighbours |
|---|---|---|---|
| field list `gap` | `2px` | `0` | Any positive gap is dead space between two targets. 2px was also *smaller* than the 8px gap **inside** a row, which is the mechanical cause of the ledger reading: the eye binds the column that is closer, and the columns were closer than the pairs. |
| row `padding` | `4px 6px` | `8px 12px` | `--db-space-4` and `--db-space-5`. 8px vertical puts natural row height at 37.6px, within 0.4px of Notion's measured 38.0. `--db-space-3` (6px) lands at 33.6 and misses the reference; `--db-space-6` (16px) reaches 53.6 and only five rows survive on screen. |
| row `min-height` | — | `44px` | The one deliberate off-scale value in this change. 44 is not a step on `--db-space-*`; it is WCAG 2.5.5 target size, cited as such, and it is the operator's "make more clickable" expressed as a number. |
| row `align-items` | `baseline` | `center` | Baseline alignment is right when the box hugs its text. Once `min-height: 44px` makes the box taller than the line, baseline strands both texts against the top edge. The cost is that the 13px and 16px baselines now differ by about 1px; centring a thumb target is worth that. |
| label `font-size` | `var(--font-smaller)` | `var(--db-font-md)` (13px) | Same rendered size, but `--font-smaller` is `0.875em`, and `em` compounds through nesting and drifts with the user's text-size setting, so the scale silently stops existing. This is a units fix, not a size change. |
| label width | `min-width: 72px` | `flex: 0 0 96px` + ellipsis | `min-width` sets a floor, so a label wider than 72px still pushes the value — which is criterion 9's defect. A fixed basis makes the column fixed. Notion's measured label column is **103.4px**; 96px is the nearest scale step that still fits this record's longest label ("Subscriptions", 82px at 13px) with room to spare. 128px was rejected: it leaves 60px of dead space beside a short label like "Year", which is the defect being fixed, in miniature. |
| value `flex` | `1` | `1` (kept) | `flex: 1` is not the bug. With a *fixed* label beside it, `flex: 1` is exactly what puts every value box at the same x. |
| value `text-align` | `right` (inherited) | `left` | This is the bug. The inherited rule is `.note-database-container .db-board-card-value { text-align: right }`, and it reaches the sheet because the portal adds `note-database-container` to the sheet itself. It is overridden **only** inside the phone sheet; board cards keep it. |
| value `font-size` | inherited 13px | `var(--db-font-lg)` (16px) | The project scale's steps around it are 13 and 22. 13 is the status quo and leaves the iOS zoom defect; 22 is a title size. 16 also happens to be the iOS input floor, so one value satisfies "a bit bigger" and removes a functional defect. |
| divider | none | `1px solid var(--db-border-subtle)` | `--db-border-subtle` is the project's existing "light transparent" hairline (the border token at 40%), which is the operator's phrase. `--db-border-regular` (70%) reads as a table rule and returns the compartmentalised look. A divider that only separates content does not owe 3:1 — that floor is for borders that identify a control. |
| row `:active` | none | hover background | Touch has no hover, so without `:active` a tap has no feedback at all. The existing `:hover` rule is correctly guarded by `@media (hover: hover)` and stays that way. |

---

## 3. PROBLEM TWO — KEYBOARD AVOIDANCE

### 3.1 The mechanism, established before anything was designed

Measured against Obsidian's own shipped bundle (`app.js` and `app.css` extracted from
`obsidian.asar`), not assumed.

- Obsidian declares **`--keyboard-height: 0px` on `:root`** and writes it from the native
  `keyboardWillShow` / `keyboardWillHide` events. It reads the value back off
  `document.documentElement` in three places and propagates it to popped-out windows.
- Obsidian positions **its own mobile chrome** from it:
  `.mobile-toolbar { top: calc(100vh - var(--keyboard-height) - var(--mobile-toolbar-height)) }` and
  `body.is-mobile .app-container { max-height: calc(100vh - var(--keyboard-height)) }`.
- So the WebView is **not** resized: `body.is-mobile` stays `height: 100vh`. Obsidian shrinks
  `.app-container` instead. The sheet is portalled to `document.body`, a **sibling** of
  `.app-container`, so it inherits none of that shrink. That is the whole defect.
- `window.visualViewport` exists and the positioner already subscribes to its `resize` and `scroll`.
  The listener was never the missing piece — `place()` recomputed `bottom: 0px` every time it ran.

The host variable is therefore the **primary** source, because anything else would put the sheet on a
different number from the toolbar riding beside it. The visual viewport is a **fallback** for the
case where the variable has not been written yet, and the two are combined with `max()` so whichever
observes the keyboard first wins.

| # | Criterion | Threshold | Red baseline |
|---|---|---|---|
| 10 | With no keyboard, the sheet still reaches the viewport floor and covers the navigation bar. **`003` must not regress.** | bottom within **1px** of `innerHeight` | green — 844 = 844, and stays green |
| 11 | When the host reports a keyboard, the sheet's bottom edge sits on top of it. | bottom within **2px** of `innerHeight − keyboardHeight` | **844, want 513** — the sheet did not move at all |
| 12 | A lifted sheet fits in the space the keyboard leaves; it must not be pushed off the top. | `top ≥ -1` **and** height ≤ `innerHeight − keyboardHeight` | **top 84, height 760, space available 513** |
| 13 | When the keyboard closes, the sheet returns to the floor. | bottom within **1px** of `innerHeight` | green, and stays green |
| 14 | A pinch-zoom must not be mistaken for a keyboard. | with `visualViewport.scale > 1`, sheet stays on the floor | not previously observable — and **still not observable**: see the withdrawal below |
| 15 | The fallback works on its own: with the host variable absent but the visual viewport shrunk, the sheet still clears the keyboard. | bottom within **2px** of the visual viewport's bottom | not previously observable — and **no check was ever written**: see below |

#### 14 and 15 re-audited, 2026-08-31 — the two that decide whether this sheet shares `022`'s defect

**Criterion 14 is withdrawn.** The check that stands for it, *the visual-viewport fallback is guarded
against pinch-zoom*, evaluates `window.visualViewport.scale <= 1.01 && zoomed <= 1` where `zoomed =
innerHeight − visualViewport.height − offsetTop` (`verify-placement.mjs:921-926`). Under Playwright
`scale` is always 1 and `visualViewport.height` always equals `innerHeight`, so the expression
reduces to `1 <= 1.01 && 0 <= 1`: two constants, true on every run, unfailable. The check does not
call `keyboardInset` and its own comment concedes the viewport "cannot be pinched from script". It
measures the harness's viewport identity, not the guard. The guard itself
(`popover-position.ts:557-560`) is correct on reading; it is simply unmeasured.

**Criterion 15 has no check at all.** Nothing in `verify-placement.mjs` — or anywhere in `tools/` —
shrinks `visualViewport.height`. Both keyboard blocks (`:819` and `:4724`) set `--keyboard-height`
and then dispatch a *synthetic* resize event, which triggers re-placement but supplies no
measurement, so the `observed` term is 0 in every captured run.

**Why these two matter more than their position in the table suggests.** `022-selection-bar-keyboard-docking`
withdrew its own AC-1 on 2026-08-30 because the bar docks on `var(--keyboard-height, 0px)` in CSS,
nothing in the plugin writes that variable, and the harness writes it — so the check proved
arithmetic given a number that may never arrive. Criteria 11–13 here read the same variable through
the same harness write, and their `want` is computed from the same `KEYBOARD = 331` literal that set
it (`verify-placement.mjs:800`, `:819`, `:845`).

The sheet is nevertheless **not** in the bar's position, and criterion 15 is the reason: the sheet's
number is not the variable. `placeSheet` calls `keyboardInset()`, which returns `max(host variable,
innerHeight − visualViewport.height − offsetTop)` (`popover-position.ts:547-561`), and the panel path
re-runs it on every `visualViewport` `resize` and `scroll` (`:284-285` → `:201`). On a host that
shrinks the visual viewport and never writes the variable, this sheet lifts and that bar does not.
Criterion 15 is the criterion that would demonstrate it, and it has never run — so the protection is
established by reading the source, at that strength and no higher.

**A supply not in the harness inventory.** The panel these criteria measure is `rhythmPanel`
(`verify-placement.mjs:575`), a hand-mounted `div.db-record-detail-panel`. It is driven through the
production placement path and the production `renderCardField`, which is why §1 can claim the
placement arithmetic is real — but it is not built by `openRecordDetailPanel`, so it carries none of
that opener's lifecycle. Specifically it lacks `window.addEventListener("resize", onResize)` with
`onResize = () => close()` (`record-detail-panel.ts:200`, `:292`). Criteria 10 and 13 therefore
measure a sheet that survives a window resize the shipped sheet is destroyed by. §4 item 2 already
records the `onResize` behaviour; what is new is that the surface under test does not have it, so the
resting and returning readings are not readings of the shipped surface at all.

### 3.2 Values

| Property | From | To | Why |
|---|---|---|---|
| `--db-mobile-sheet-bottom` | hardcoded `"0px"` in `place()` | the measured keyboard inset | The `!important` rule `bottom: var(--db-mobile-sheet-bottom, 0px)` already existed and already beat the inline `bottom`. The variable was the lever; it was simply always written 0. |
| sheet `max-height` | `90svh !important` | `calc(90svh - var(--db-mobile-sheet-bottom, 0px)) !important` | Raising the bottom edge without lowering the cap pushes the top off screen (criterion 12). With the variable at `0px` this reduces to exactly `90svh`, so `003`'s cap is unchanged by construction. |
| pinch-zoom guard | — | visual-viewport term ignored when `scale > 1.01` | `innerHeight − visualViewport.height − offsetTop` is also non-zero under pinch-zoom. Without the guard the sheet jumps when a user zooms. The host variable is unaffected and still applies. |

---

## 4. WHAT IS NOT CLAIMED

1. **No software keyboard was opened.** Criteria 11–15 drive the host's reporting mechanism
   (`--keyboard-height`, `visualViewport`) at a value measured from the operator's screenshot
   (331px). They prove the sheet responds correctly *to the signal*. They do not prove iOS emits
   that signal at that moment with that number. Only the operator's device can close that gap.
2. **`record-detail-panel.ts` closes the panel on `window` resize** (`const onResize = () => close()`).
   On iOS this never fires for the keyboard, which is why the reported screenshot shows the sheet
   still open, so it is not part of the reported defect. On a WebView that *does* resize, it would
   close the sheet mid-edit. Left unchanged: it is outside the reported defect and could not be
   verified here without driving the panel opener, which needs a vault.
3. **Desktop is untouched.** Every rule added is scoped
   `.db-record-detail-panel.db-mobile-bottom-sheet …`, a class only the phone sheet carries.
   Criterion 16 asserts it.

| # | Criterion | Threshold | Red baseline |
|---|---|---|---|
| 16 | The desktop anchored panel keeps its existing geometry. | four measured values identical before and after: row height **26.84px**, value `text-align: right`, field-list gap **2px**, `border-bottom` **`0px none`** | n/a — a non-regression, and the reason it carries four numbers rather than the word "unchanged" is below |

Criterion 16 originally read "unchanged from baseline" with no values. That is not a criterion: a
later reader has nothing to compare against, so the check silently becomes "somebody looked once".
The four numbers above are the ones the run produced, and they are deliberately the **inverse** of
what the phone criteria assert — the phone moved to a 44px row, left-aligned values, a 0px gap and a
1px divider, so if a phone rule ever leaks to desktop, all four move at once and this row goes red
for the exact reason it exists. A single value would not have that property.
