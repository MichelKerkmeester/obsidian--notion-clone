# Design review — tokens lane

> Sonnet 5 (xhigh), read-only, judged against `sk-design` references. Findings are the reviewer's; line citations were spot-checked, not exhaustively verified.

## Verdict

The token layer's *shape* is well-designed — elevation, radius, and surface tokens follow the sk-design dark-mode rules correctly (lighten-not-darken elevation, hairline borders on raised dark surfaces, tint-based borders). But the layer is only partially load-bearing: spacing and typography tokens exist yet are bypassed by raw pixel values in roughly 70–80% of declarations, opacity has no scale at all, and two separate undocumented/parallel shadow mechanisms (`--shadow-s`, `--db-timeline-event-shadow`) sit outside the elevation system the rest of the file disciplined itself to use. This isn't a broken system — it's a good token set that most of the 18,760-line file quietly ignores, which is exactly the drift the token layer exists to prevent.

## Findings

### [P1] Spacing and type-scale tokens are minority-consumed
- **What**: `--db-space-*` is referenced 236 times against 818 total `padding`/`margin` declarations (~29%); `--db-font-*` is referenced 74 times against 256 raw `font-size: Npx` declarations (~22%). Most of the file hardcodes the numeral instead of the token, even when the numeral matches the scale.
- **Where**: token definitions at `styles.css:76-96`; raw usage scattered file-wide, e.g. `styles.css:9976,9924,9913` (raw `12px`) instead of `var(--db-font-sm)`.
- **Why it's wrong**: SKILL.md §4 Rule 1 — "a value off the scale is the defect this skill exists to prevent." A token nobody references isn't a system, it's decoration; the scale can drift silently because nothing forces new code through it.
- **Fix**: sweep raw `11/12/13/16/22px` font-sizes and `2/4/6/8/12/16/20/24px` spacing to their `var(--db-font-*)`/`var(--db-space-*)` equivalents, at minimum in new/touched code.

### [P1] Type scale has drifted off itself in four places
- **What**: `font-size: 14px` (`:14448`, `:17156`), `18px` (`:17155`), `26px` (`:17159`) — none of the plugin's own five sizes (11/12/13/16/22).
- **Where**: `styles.css:14448`, `17155-17159`.
- **Why it's wrong**: review-checklist.md §5 — "font sizes off the type scale." These are icon-emoji sizes tied to icon-box dimensions (18/14/26px containers), so they're somewhat justified, but they're still untracked values a scale search won't catch.
- **Fix**: either add an explicit `--db-icon-font-*` micro-scale or accept these as a named, documented exception.

### [P1] Two undocumented shadow mechanisms bypass the elevation system
- **What**: `box-shadow: var(--shadow-s)` at `styles.css:14495` references a custom property that is **never defined anywhere in the codebase** — every other floating surface in the file uses `--db-elevation-1/2/3`. Separately, `--db-timeline-event-shadow` (`styles.css:15447, 16076, 16113, 16121, 16196`) redefines raw `rgba(0,0,0,…)` shadows locally per timeline state, with **no dark-mode override block**, unlike the global elevation tokens which get one explicitly at `:398-400`.
- **Why it's wrong**: SKILL.md §4 Rule 8 — "NEVER mix two systems of the same kind in one project." An undefined variable also silently drops the shadow (invalid custom property → initial value), so `.db-calendar-events-expanded` likely renders with no shadow at all against `--background-primary`, breaking depth parity with sibling popovers.
- **Fix**: replace `var(--shadow-s)` with `var(--db-elevation-2)` (it's a dropdown-class popover); fold `--db-timeline-event-shadow` into the elevation scale or give it an explicit dark-mode block.

### [P1] Opacity has no fixed scale
- **What**: 61 raw `opacity: 0.NN` declarations spanning 20 distinct values (`.28, .3, .34, .35, .4, .42, .45, .5, .55, .6, .65, .66, .7, .72, .78, .8, .82, .85, .9, .96`). Only one opacity token exists (`--db-disabled-opacity: 0.40`, `styles.css:127`) and it's used exactly once.
- **Where**: `styles.css` — distribution confirmed via grep across the file (16× `.55`, 9× `.5`, 9× `.45`, etc.).
- **Why it's wrong**: SKILL.md §3 Spacing — "Fix a small set of opacity values too… rather than eyeballing a slider each time." 20 near-duplicate values (`.6/.65/.66`, `.78/.8/.82/.85`) is the runtime-`lighten()` failure mode applied to opacity instead of color.
- **Fix**: collapse to a `--db-opacity-*` scale (e.g. `.1 .2 .4 .55 .7 .9`) and remap call sites.

### [P2] Elevation-3 alpha is lower than elevation-2 in light mode
- **What**: `--db-elevation-2: 0 10px 28px rgba(0,0,0,.24), 0 3px 8px rgba(0,0,0,.16)` vs `--db-elevation-3: 0 18px 50px rgba(0,0,0,.22), 0 6px 18px rgba(0,0,0,.14)` — offset/blur correctly grow, but alpha drops at the tier meant to read as *more* elevated (modals). The dark-mode override (`:398-400`) does not have this inversion — it increases monotonically (.30→.45→.48).
- **Where**: `styles.css:113-114` (light) vs `:399-400` (dark).
- **Why it's wrong**: SKILL.md §3 — "Closer to the user means more attention," and depth-and-detail.md's two-part model ties elevation to *both* spread and darkness. Blur growth likely masks this perceptually, but it's a measurable asymmetry between the two theme tunings.
- **Fix**: bring light-mode `--db-elevation-3` alpha to ≥`.24`/`.16` to match the monotonic dark-mode curve.

### [P2] Elevation-2 is overloaded across unrelated z-heights
- **What**: `--db-elevation-2` is used at 46 of 59 total elevation call sites — dropdown popovers, filter/sort panels, board hover cards, calendar cells, icon pickers — collapsing the skill's five-tier z-axis model into effectively one working tier plus two rarely-used ones (`elevation-1`×9, `elevation-3`×8).
- **Where**: full list from `grep -n "db-elevation-2"` (e.g. `styles.css:2085,2332,2614,2812,3021,6146…`).
- **Why it's wrong**: depth-and-detail.md — shadows should encode "where on the z-axis this sits," not be a single default reused for every floating element regardless of actual stacking context.
- **Fix**: not urgent given only 3 tiers are defined; if finer z-differentiation matters, split `elevation-2` into a lighter panel tier and heavier popover tier.

### [P2] Hardcoded `#000` selection ring bypasses the token system
- **What**: `box-shadow: 0 0 0 1px var(--background-primary), 0 0 0 3px #000;` at `styles.css:5122-5124` for a selected color swatch, while the visually equivalent selected-state affordance elsewhere (`styles.css:4332`) correctly uses `0 0 0 2px var(--interactive-accent)`.
- **Why it's wrong**: SKILL.md §4 Rule 3 — "NEVER generate shades at runtime" extends in spirit to "never hardcode a color the rest of the file tokenizes." A raw black ring also can't respect a themed accent the way the rest of the selection-state language does.
- **Fix**: swap to `var(--interactive-accent)` or a `--db-*` alias, matching `:4332`.

## What's genuinely good

- **Dark-mode elevation direction is correct and deliberate**: `--db-surface-raised/overlay/modal` mix toward `black` in light mode (`styles.css:108-110`) and toward `white` in dark mode (`:394-396`) — exactly the "build elevation by getting lighter, not darker" rule from color-system.md §7, and it's not a mechanical inversion.
- **Dark-mode hairline border on modal surfaces**: `--db-surface-modal-border: rgba(255,255,255,0.12)` (`styles.css:397`) is added only in the dark override, matching color-system.md §7's "a raised dark surface usually also needs a hairline border" — while light mode correctly defers to Obsidian's own `--background-modifier-border` instead of inventing a value.
- **Radius tokens are the best-adopted part of the system**: 286 `var(--db-radius-*)` call sites against only ~10 raw stragglers (mostly `999px` pill radii that should be `--db-radius-full`) — near-total consumption, unlike spacing/type.
- **Status-color pairs follow the correct contrast escape hatch**: every tag/status hue defines a light tint background with a dark foreground in light mode and inverts appropriately in dark mode (`styles.css:137-168`, `401-432`), matching color-system.md §6's "dark colored text on a light colored tint" pattern rather than solid saturated fills.
- **Borders use alpha-mix, not fixed hex**: `--db-border-subtle/regular` (`styles.css:102-104`) are `color-mix()` against the theme's own border var, so they adapt across arbitrary Obsidian themes per depth-and-detail.md §7.

## Needs visual confirmation

- Whether light-mode `--db-elevation-2` (`.24`/`.16` alpha) reads as heavier than intended against Obsidian's default light theme — the two-part alphas are notably darker than the reference two-part scale's mid-tier (`.15`/`.10`) in depth-and-detail.md.
- Whether `.db-calendar-events-expanded` (`styles.css:14486-14502`) visibly lacks a shadow given `--shadow-s` is undefined — depends on whether Obsidian's own theme happens to define that variable globally, which I could not verify from this repo alone.
- Actual contrast ratios of status-color fg/bg pairs against non-default community Obsidian themes, since `--background-primary` is theme-controlled and not fixed.
