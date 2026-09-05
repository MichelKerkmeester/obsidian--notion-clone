---
title: "Design True-Up: The Seven States, the Feedback Shapes and the Motion Set Against the Captures and the Source"
description: "One row per state, feedback shape and motion token: the Anytype screen it was designed against or the named gap, the values read off that screen or off anytype-ts's stylesheet with file:line, what our tree does today, and where the evidence contradicts 047's research or this packet's own draft."
trigger_phrases:
  - "055 true-up"
  - "states design true-up"
  - "motion true-up"
  - "state capture alignment"
  - "T001 capture read"
  - "anytype motion tokens"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The Seven States, the Feedback Shapes and the Motion Set

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This is T001's output and the gate on every leg in `plan.md`. Method is
> `../050-anytype-adoption/design-trueup.md`'s, unchanged: **measure, then decide**. Every value
> below was read off a file in `screenshots/anytype/`, off a line in
> `specs/context/anytype-ts/src/scss/`, or off a line in `src/`. Nothing is carried over from
> `047`'s research unless it is labelled as such, and `050`'s restated thresholds for items 5, 8, 9
> and 14 bind here rather than `050`'s originals.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

Three things changed, and none of them was on the list this packet expected to check.

**Anytype's destructive treatment is platform-split, and the desktop half has no treatment at
all.** A per-pixel scan of `menus/anytype-menu-object-more-dark.png` returns **0 reddish pixels in
the whole 280 × 528 capture** — `Move to Bin` is the same `#E1E1E1` as `Copy Link`. The same scan
of `menus/anytype-menu-nav-widget-bin-dark.png`, whose second row is `Empty Bin`, the most
destructive action in the product, also returns **0**. On iOS the same action is
`#FF4A4D` text beside a red trash glyph (`mobile/anytype-mobile-sheet-object-more-dark.png`,
`mobile/anytype-mobile-sheet-set-more-dark.png`). One product, two answers, and the packet was
about to design against the one nobody photographed.

**Anytype ships no reduced-motion story whatsoever.** `prefers-reduced-motion` occurs **0 times**
in `specs/context/anytype-ts/src`. AC-007 is not adopting anything; it is doing something the
reference build does not do.

**`047` §10's motion finding is wrong in both halves, and the source says so plainly.** There is no
0.1s exit — the toast's enter and exit share **one** `transition-duration: 0.2s`
(`notification/common.scss:21`, `:25`) — and the "one centralized `animationProps` helper" is three
constants plus 18 hand-typed `0.3s` and 96 bare `ease` keywords.

And one finding that is ours, not Anytype's: **this packet's own duration census contradicts
itself in four places.** 42 and 78 are both true and count different things; the documents use them
interchangeably. Fixed below, measured.

### Where the evidence wins, in one list

Nine contradictions, each resolved in the evidence's favour per this task's rule, each expanded in
its row and each carried into `decision-record.md` ADR-004 and ADR-005.

| # | The draft or `047` says | The captures or the source show | Row |
|---|---|---|---|
| C1 | `047` §10: motion is **0.2s enter / 0.1s exit** | One `transition-duration: 0.2s` serves both `.from` and `.to` (`notification/common.scss:21`, `:25`). `0.1s` occurs 4× in the whole stylesheet and **none of them is an exit** | Motion |
| C2 | `047` §10: **one centralized** `animationProps` helper | Three constants (`_mixins.scss:2`, `:5-7`), 18 hand-typed `0.3s`, and `ease` used bare 96 times against 2 `ease-out` | Motion |
| C3 | `destructive.confirm` renders a **danger-styled** confirm | Desktop destructive rows carry **no colour at all** (0 reddish px); iOS carries `#FF4A4D` **plus** a red glyph. The treatment is the platform's, not the product's | `destructive.confirm` |
| C4 | `050` C6: Anytype renders **no empty-state block** | True, and now **desktop-scoped**. The phone renders three different empty shapes, and the richest one carries an action button | `empty.no-matches`, `empty.no-source` |
| C5 | AC-007: reduced motion extends what Anytype does | Anytype has **no** `prefers-reduced-motion` rule. Nothing to extend | Motion |
| C6 | `spec.md` §4 / vocabulary §4: **42** hand-typed `120ms`; T001 and T009: **78** | **Both, of different units**: 42 `transition:` *declarations* carry `120ms`, and those declarations contain 78 `120ms` *occurrences* | Motion |
| C7 | `--db-transition-fast` reaches **8** uses | **7** (`grep -c 'var(--db-transition-fast)' styles.css`) | Motion |
| C8 | The residual census lists only `ms` spellings | **16 more** untokenized durations are written in seconds (10×`0.15s`, 3×`0.2s`, 2×`0.1s`, 1×`0.3s`), so the real 150ms population is **14**, not 4 | Motion |
| C9 | AC-009 and AC-011 are restated "as restated by **ADR-004**" | `decision-record.md` holds ADR-001 and ADR-002 only. The cited ADR did not exist | All 050-inherited rows |
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE EVIDENCE WAS READ

**Two evidence classes, and they answer different questions.** A still capture answers *what does
the state look like*; it cannot answer *how does it move*. So every state row below is read off a
capture and every motion row is read off `specs/context/anytype-ts/src/scss` with a `file:line`.
Neither is used to answer the other's question, and a row with neither says so.

**Scale.** The desktop menu captures are 1 device pixel to 1 CSS pixel, per `050`'s proof. The iOS
simulator captures are **1206 × 2622 at 3×**, so every phone figure below is stated in **points**
(the pixel measurement ÷ 3) and the raw pixel band is given beside it. A figure quoted in points is
directly comparable to `044`'s 44px close and to `design-system.md`'s spacing.

**Colour and contrast.** Sampled with a per-pixel scan, never by eye, and every ratio recomputed
from the sampled RGB rather than quoted. The scan is what turned "Move to Bin is probably red like
every other destructive row" into a measured zero — the same class of error `050` §2 records for
the filter funnel.

**What no capture in the sweep contains.** After scanning all 600 menu captures, all 118 iOS
captures and the 151-file desktop set by filename and by index description: **no destructive
confirmation dialog, no loading or skeleton state, no error surface, no toast, and no
no-results state.** The sweep's own `menus.mjs` refuses destructive actions by name
(`screenshots/anytype/README.md:401`), which is why the confirm was never reachable — the absence
is procedural, not evidence that the product lacks one.

### The measured Anytype motion system, as one table

Read from `specs/context/anytype-ts/src/scss`. This is the table `047` §10 was summarising, and it
is why both halves of that summary are corrected above.

| Property | Measured value | Where |
|---|---|---|
| Common transition | **`0.15s cubic-bezier(0.22, 1, 0.36, 1)`** | `_mixins.scss:2`, aliased `all` at `:3` |
| Menu, popup and sidebar | **`0.2s`**, one constant each, all three equal | `_mixins.scss:5`, `:6`, `:7` |
| Menu easing | **`cubic-bezier(0.2, 0, 0, 1)`** (`$easeDecelerate`) | `_mixins.scss:9`; consumed `menu/common.scss:28`, `:44` |
| Popup easing | **`cubic-bezier(0.22, 1, 0.36, 1)`** (`$easeInQuint`) | `_mixins.scss:1`; consumed `popup/common.scss:18`, `:22` |
| Declared but unused pair | `$easeSpring: cubic-bezier(0.34, 1.56, 0.64, 1)`, `$easeSmooth: cubic-bezier(0.4, 0, 0.2, 1)` | `_mixins.scss:10`, `:11` |
| Toast enter **and** exit | **`0.2s`**, one duration, properties `transform, opacity, bottom` | `notification/common.scss:21` |
| Toast from/to transform | **`scale3d(0.75, 0.75, 1)`** with `opacity: 0` | `notification/common.scss:25` |
| Popup from/to transform | **`scale(0.95, 0.95)`** with `opacity: 0` | `popup/common.scss:18` |
| Dimmer | opacity over the same `0.2s` | `popup/common.scss:22` |
| Explicit no-animation hatch | **`.noAnimation { transition: none !important; }`** | `common.scss:89` |
| Reduced motion | **absent — 0 occurrences in `src/`** | — |
| Duration population | `0.2s` ×36 · `0.15s` ×23 · `0.3s` ×18 · then loops and schedules | histogram over every `transition:`/`animation:` in `scss/` |
| Easing population | `ease` ×96 · `linear` ×25 · `ease-out` ×2 · `ease-in-out` ×1 · `ease-in` ×1 | same histogram |

**One naming defect, recorded because it will otherwise be copied.** `$easeInQuint`
(`_mixins.scss:1`) is `cubic-bezier(0.22, 1, 0.36, 1)` — a curve that starts fast and settles, which
is an ease-**out**. The name says the opposite of the shape. Anyone porting the constant by its name
gets the wrong direction, which matters because `sk-design`'s motion rule pairs entrances with
`ease-out` and exits with `ease-in`.

**Two of these are rejected rather than adopted.** `scale3d(0.75)` on the toast is far outside the
`0.95`–`1.05` deformation bound and below even the `0.8` that `sk-design` allows a *dialog*; on the
one surface this phase is building, that reads as a pop rather than an arrival. And the absent
reduced-motion story is not a gap to mirror.

### The measured Anytype toast, as one table

No capture shows it, so this is a **source** read — and it is complete enough to design against,
which the packet's "Capture: none" line for T002 did not know.

| Property | Measured value | Where |
|---|---|---|
| Container | `position: fixed; right: 12px; bottom: 12px; z-index: 200` | `notification/common.scss:6` |
| Width | **384px**, fixed | `notification/common.scss:6` |
| Card | `min-height: 70px`, `border-radius: 12px`, `padding: 16px`, 1px border | `notification/common.scss:20`, border mixin `:4` |
| Shadow | `0 2px 16px rgba(0, 0, 0, 0.07)` | `notification/common.scss:3` |
| Title | small text, **weight 600**, `margin-bottom: 2px` | `notification/common.scss:36` |
| Body | small text, regular | `notification/common.scss:37` |
| **Action row** | `display: flex; gap: 8px; margin-top: 12px`, buttons at **weight 500** | `notification/common.scss:38`, `:40` |
| **Action row auto-hides** | `.buttons:empty { display: none; }` | `notification/common.scss:39` |
| Stacking | every card is absolutely positioned at `bottom: 0`; **only `:first-child` renders its content** | `notification/common.scss:20`, `:50-52` |
| Dismiss affordance | a 24px round `notificationDelete` icon at `top: -8px; left: -8px`, `opacity: 0` until hover | `notification/common.scss:28-32`, `:53-55` |

**The action slot is not our invention.** ADR-001 argues for it from our own broken promise
(`src/i18n.ts:1455`). It is also what the reference build does, and it uses the same auto-hide
idiom our count badge already uses. That strengthens ADR-001 rather than changing it.
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:rows -->
## 3. THE SEVEN STATES, ROW BY ROW

Each row carries the same six things: whether the surface was **seen**, the files, what the real
screen or the real stylesheet does, what our tree does today, the values that change, and the phone
disposition.

---

### `empty.no-source` — the view's source is missing or deleted

**Half seen. The phone has a state for the equivalent condition; the desktop does not.**

**Captures.** `mobile/anytype-mobile-sheet-grid-cell-objecttype-empty-dark.png`.
**Not captured:** a desktop view whose collection or query source was deleted.

**What the real screen does.** A sheet titled `Object type`, and where the value list would be, a
**yellow rubber-duck illustration** over one line: *"The property is empty."* Measured: the
illustration occupies y 1868..2030px → **622.7..676.7pt, 54pt tall**; the message sits at
y 2079..2122px → **693.0..707.3pt**, and it is **`#F3F3F3`** — the *primary* text colour, not the
secondary grey. Gap illustration → message **16.3pt**. No title, no body, no action.

So the shape is: **illustration + one primary-weight line, and nothing else**, for a state whose
answer is "there is nothing here and you cannot fix it from this sheet".

**What we do today.** `no-database` **is** this flavour and is richer — `empty-state-renderer.ts:24`
declares it, `:145-149` gives it a `database` icon, the title *"Start with a database"* and the body
*"Create a local database or begin with a lightweight starter layout."*, and `:100-134` adds four
starter presets. The gap `050` found remains exactly where it was: `getEmptyStateReason` maps
`diagnostics.sourceCount === 0` to `no-matching-data` (`empty-state-renderer.ts:210`), so a *view*
whose source vanished gets the no-match card rather than this one, and the embed uses a third shape
again (`embedded-database-renderer.ts:693-700`, `read-failed`).

**Values that change.**

| Was | Is |
|---|---|
| "the `target` flavour was **not captured**" | **Captured**, on the phone, in its property-level form and quoted above |
| Adopt Anytype's target empty state | Only its **tiering**: an unactionable empty state gets illustration + one line at primary colour, no body and no button. Ours already exceeds that for `no-database`; the finding is that the *routing* is the defect, not the card |
| The card is the same shape for every reason | **Restated**: three tiers, per the ladder in the next row. `no-source` is tier 2 |
| Illustration size unspecified | **48px** — the on-scale neighbour of the measured 54pt, and the size our existing icon tile already uses. The measured value is not adopted verbatim because 54 is on no scale of ours |

**Phone.** Relevant, and it is where the only evidence is. The card renders inline in the view body,
so neither `044` nor `048` binds; `compact` (`empty-state-renderer.ts:45`) stays the phone
expression.

---

### `empty.no-matches` — the source exists and nothing matched

**Seen, twice, in two different shapes — and this narrows `050`'s C6 rather than overturning it.**

**Captures.** `mobile/anytype-mobile-sheet-view-filters-empty-dark.png`,
`mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png`,
`menus/anytype-menu-set-sort-empty-dark.png`, and `anytype-inlinecollection-empty-dark.png` for the
desktop contrast.

**What the real screens do — a three-rung ladder.** This is the finding of the row.

| Rung | Shape | Where | When it is used |
|---|---|---|---|
| 1 | **One centred grey line, no icon, no button.** *"No filters here. You can add some"*, `#909090`, y 1480..1516px → **493.3..505.3pt** | `sheet-view-filters-empty` | The list is empty *by configuration* and the add affordance already exists in the header |
| 2 | **Illustration + one primary line.** 54pt glyph, 16.3pt gap, `#F3F3F3` message | `sheet-grid-cell-objecttype-empty` | Nothing here, and nothing to do about it from this surface |
| 3 | **Illustration + title + body + action.** 56pt glyph (y 1180..1348px → 393.3..449.3pt), 17pt gap, title *"No options"* `#F3F3F3` at y 1399..1449px → **466.3..483.0pt**, 7.7pt gap, body *"Nothing found. Create first option to start."* `#909090` at y 1472..1522px → **490.7..507.3pt**, 14.4pt gap, then a pill **`Create`** button | `sheet-cell-multiselect-empty` | Nothing here **and** the user can make the first one |

Contrast, measured against the `#1F1F1F` sheet: `#F3F3F3` is **14.85:1**, `#909090` is **5.16:1**.
Both clear 4.5:1, so the tiering is carried by colour *and* by structure, not by colour alone.

**And the desktop still renders nothing.** `anytype-inlinecollection-empty-dark.png` is unchanged
from `050`'s reading: a header row, a `+ New Object` row, and below it nothing at all. So `050`'s C6
stands and gains a scope — **the desktop renders no empty-state block; the phone renders three
different ones.** A finding that read as "Anytype has no empty-state design" was reading one
platform.

**One string worth taking on its merits.** *"Nothing found. Create first option to start."* names
the action rather than the absence. Our nearest, `emptyState.noMatchingMessage`, is *"There are no
records in this view yet."* — which states the absence twice and names no action.

**What we do today.** Four reasons already refine this flavour —`no-matching-data`, `search-empty`,
`filter-empty`, `filter-and-search-empty`, plus `limit-empty` — each with its own title, body and
Lucide icon (`empty-state-renderer.ts:24-36`, copy `:143-203`), selected at `:209-216`. One card
shape serves all of them.

**Values that change.**

| Was | Is |
|---|---|
| "an empty inline collection renders no empty-state block at all… ours is better" (`050` C6) | **Desktop-scoped.** True of the desktop client, false of the iOS client, which renders three distinct shapes. The sentence stays; its scope is added |
| One card shape for every reason | **Three tiers**, selected by how actionable the state is. `filter-empty` and `search-empty` are tier 3 (they have a clear-this action); `no-matching-data` is tier 3; `empty-group` is tier 1 — it is a valid drop destination, and a full card in every board column is noise |
| Spacing inside the card unspecified | **8px title → body, 16px body → action, 16px illustration → title.** The measured 7.7 / 14.4 / 17pt rounded onto our scale, preserving the relationship that the group gap exceeds the within-group gap |
| Copy names the absence | **Copy names the action.** `emptyState.noMatchingMessage` and its siblings are restated in the L2 leg to say what to do, on the multi-select string's model. This is a copy change, not a component change |
| Adopt the pill `Create` button | **Refused on two counts, both measured** — see the refusals section |

**Phone.** Relevant, and it is the whole evidence base for this row. Inline in the view body; neither
`044` nor `048` binds.

---

### `empty.deleted-relation` — the grouping field is gone from the schema

**Not seen. Nothing in 151 desktop captures, 600 menu captures or 118 iOS captures shows a board
grouped by a deleted relation, and the sweep never deleted a relation.**

**What the real screen does.** Unknown. `047` §9's description of a dedicated state pointing at view
settings stands in, and stands in as **source, not as a screen**.

**The nearest adjacent evidence, which is worth having.**
`mobile/anytype-mobile-sheet-kanban-groupby-dark.png` and
`menus/anytype-menu-set-layout-kanban-group-by-dark.png` prove the *destination* the state must
point at exists and is one row inside the layout panel. So the state's call to action has a real
target on both platforms, which is the part a design needs.

**What we do today.** Nothing. `getDefaultBoardField` silently re-groups by the first status/select
column (`database-view.ts:2678`, `:2890`, `:3378`). `empty-group` is a different state — its copy is
*"This is a valid destination for new or moved records."* (`src/i18n.ts:1545`), which is the opposite
of what a deleted relation means.

**Values that change.** One, and it is a label rather than a value: this stays **design inferred
from source code, not seen**, and it is the only one of the three empty flavours with no capture at
all. Its tier is **3** — it has an action (open view settings, pick a field) and the action is the
whole point of the state.

**Phone.** Relevant. The action opens the layout sheet, which is already a `sheet-grammar` surface,
so `044` is inherited; nothing stacks, so `048` does not bind.

---

### `loading` — data pending

**Not seen, and none was expected.** A skeleton is a transient and every capture is a still. No
loading, skeleton or spinner state appears anywhere in the sweep.

**Source evidence instead.** `anytype-ts` has one relevant idiom: `@keyframes rotate`
(`common.scss:22`) driven `linear`, which is the progress case `sk-design`'s ruleset reserves linear
for. Our shimmer is `1.1s ease-in-out infinite` (`styles.css:2749`) — a loop, and the one place
where a non-linear curve on a repeating animation is defensible because it is a sheen, not a
measure of progress.

**What we do today.** `db-skeleton-loader` at `database-view.ts:11847` with `role="status"` already
declared; CSS `styles.css:2709-2755`.

**Values that change.** None. The row is complete today and the phase's only work on it is naming
its shimmer in the reduced-motion reset — which matters more than it sounds, because an `infinite`
loop that survives the reset never stops for a reduced-motion reader.

**Phone.** No separate expression; the skeleton renders in the view body.

---

### `error` — an operation failed or data could not be read

**Not seen. No error surface, failed read or error toast appears in any capture.**

**Source evidence.** The notification component (§2's second table) carries no severity variant at
all — `notification/common.scss` has one `.notification` class, no `.isError`, no `.isSuccess`. So
Anytype's toast is **severity-free**, and the severity axis in REQ-055-1 is ours.

**What we do today.** Two shapes. The persistent card (`read-failed`, `empty-state-renderer.ts:36`,
copy at `:190-193`: *"This view could not be loaded" / "Check the database source and try again."*)
and the transient rail (`showOperationResult`, `database-view.ts:9433-9437`, timer at `:11261`,
CSS `styles.css:2662-2700`). Plus 247 bare `new Notice(...)` for everything else, and error strings
that interpolate raw text (`errors.deleteFailed`, `src/i18n.ts:1450`).

**Values that change.**

| Was | Is |
|---|---|
| Toast severity is adopted from Anytype | **Ours, with the gap named.** The reference toast has exactly one visual, no severity axis. Adding one is a deliberate deviation, and the reason is that our error toast is sticky-until-acted while our success toast auto-dismisses — a behavioural split needs a visual one |
| Error toast timing unspecified | **Sticky, no timer**, unchanged from NFR-P03. Nothing measured contradicts it |
| Second signal for severity | **Required, and it is an icon, not a hue.** `sk-design` forbids colour-alone, and the iOS `Delete` row is the model: red text **and** a red trash glyph |

**Phone.** Relevant. The toast docks bottom, so it collides with the selection bar's dock; the
`db-bottom-dock-taken` coordination (`styles.css:2591`) is the precedent ADR-001 already names.

---

### `success.notice` and the `undo` affordance

**Half seen — and the half that was seen puts undo somewhere we did not consider.**

**Captures.** `mobile/anytype-mobile-sheet-object-more-dark.png`.
**Not captured:** any toast, on either platform.

**What the real screen does.** In the object's `···` menu, third section, between `Favorite` and
`Publish to Web`, sits a single row: **`Undo/Redo`**, with a combined circular-arrow-plus-dots glyph.
Not an action on a transient surface — a **persistent menu row**, always available, that opens its
own affordance. The same menu on a *set* (`mobile/anytype-mobile-sheet-set-more-dark.png`) does
**not** carry it.

That is a different model from ours in one important way: it does not depend on catching a toast
before it dismisses. Our `notice.nothingToUndo` (`src/i18n.ts:1484`) exists precisely because ours
does.

**What we do today.** Two shapes, as the vocabulary records: the rail's Undo/Retry
(`database-view.ts:9433-9437`, 2200ms at `:11261`) and the selection bar's button (`:7719`). Plus
the promise `notice.galleryMigrated` has never been able to keep — *"Undo to keep it a gallery."*
(`src/i18n.ts:1455`) raised through a bare `Notice`.

**Values that change.**

| Was | Is |
|---|---|
| "no Anytype capture shows an undo surface and no `047` finding names one" | **False.** Undo is a captured *menu row* on iOS. The placement is captured; the toast is not |
| Undo lives only in the toast's action slot | **Kept, and a second placement is recorded as the model rather than built.** A persistent `Undo` row is the answer to "the toast dismissed before I reached it", and it is out of this phase's scope. Named here so the next phase finds the evidence, not a fresh idea |
| Toast geometry unspecified | **Measured from source** (§2's table): fixed bottom-right at 12px, 384px wide, 12px radius, 16px padding, action row `gap: 8px` at `margin-top: 12px`, auto-hidden when empty |
| Toast min-height | **64px** — the on-scale neighbour of the measured 70px |
| Multiple simultaneous toasts | **Adopt the collapsed stack**: cards stack at the same bottom anchor and only the first renders its content (`notification/common.scss:20`, `:50-52`). This is also what NFR-P03's "one timer per visible toast" needs to be true |
| Auto-dismiss budget | **2200ms**, unchanged, ours (`database-view.ts:11261`). Anytype sets no dismissal timer in the stylesheet |

**Phone.** Relevant, and the only captured evidence is the phone's. The toast is not a sheet, so
`044` does not bind; it must not dock over the selection bar, which is a lane assertion, not a
grammar one.

---

### `destructive.confirm` — an irreversible action needs a decision

**Not seen, on either platform, and the reason is procedural.** The sweep's `menus.mjs` carries a
`DESTRUCTIVE`/`MUTATING` refusal list — Move to Bin, Delete, Duplicate, Remove view, Add a view,
Create object — consulted before every hover (`screenshots/anytype/README.md:401`). No destructive
action was ever committed, so no confirmation was ever raised. **Design inferred from source code,
not seen**, and it stays that way.

**The confirm primitive is `051`'s.** `051` ADR-003 promotes `openAndWait`
(`modals/confirm-modal.ts:45`, module entry `:97`) to the family's exported confirm and asserts
`044`'s seven elements on it. This row **consumes** that primitive; nothing here re-specifies it,
and ADR-002's "signature unchanged" is what makes the consumption possible.

**What the destructive *rows* show, which is the part that is captured.** This is C3, and it is the
row's real finding.

| Platform | Label | Treatment | Evidence |
|---|---|---|---|
| Desktop | `Move to Bin` | `#E1E1E1`, identical to `Copy Link`. **0 reddish pixels** across the whole 280 × 528 capture | `menus/anytype-menu-object-more-dark.png` |
| Desktop | `Empty Bin` | No icon, no colour. **0 reddish pixels** across the whole capture | `menus/anytype-menu-nav-widget-bin-dark.png` |
| iOS | `Delete` | **`#FF4A4D`** text **and** a red trash glyph, last row, below a divider, under `Duplicate` | `mobile/anytype-mobile-sheet-object-more-dark.png`, `mobile/anytype-mobile-sheet-set-more-dark.png` |

`#FF4A4D` on the `#101010` menu panel measures **5.75:1** — it clears 4.5:1 as normal text, which is
not automatic for a red. And it is not colour alone: the trash glyph is red *and* a trash glyph.

**What we do today.** `ConfirmModal` (`modals/confirm-modal.ts:35`) declares `sheet` at `:42`,
renders an `h3` title (`:56`), a `db-modal-help` message (`:57`), and an actions row (`:59`) ordered
**Cancel → [secondary] → confirm**, where the confirm carries `mod-warning` when `danger` is set
(`:73`). It never calls `createSheetHeader`, which is the 0-of-7 figure.

**Values that change.**

| Was | Is |
|---|---|
| The confirm's danger button is "danger-styled" against Anytype's precedent | **There is no Anytype precedent to cite.** No confirm dialog is captured. `mod-warning` stays because it is Obsidian's theme-owned destructive class, and the reason is now *host convention*, not adoption |
| Destructive treatment is one decision | **Two, and both are evidenced.** Desktop: neutral row, destructive meaning carried by the label (`Move to Bin` is reversible and says so). iOS: red text plus red glyph, colour never alone |
| Our destructive vocabulary | **Adopt the iOS pairing, not the hue**: wherever a destructive action is red, it carries a matching icon. `#FF4A4D` itself is not adopted — this is a themed host and `mod-warning` is the user's theme's |
| Button order | **Unchanged and already correct**: Cancel leads, confirm trails (`confirm-modal.ts:60-76`), which is what both captured platforms do with their trailing destructive row |

**Phone.** Relevant and it is the phase's only phone surface. `048`'s stacking model applies
unchanged. Note one thing the captures show about the parent: in
`mobile/anytype-mobile-sheet-grid-cell-objecttype-empty-dark.png` the page behind the sheet is **not
dimmed and not scaled back**. That is a *first* sheet over a page, not a stacked pair, so it does
not contradict `048` — recorded so nobody reads it as one.

---

### Motion — the token set

**Not seen, and none can be: motion is invisible in a still.** Every value in this row is a source
read of `specs/context/anytype-ts/src/scss` with a `file:line`, reconciled against `sk-design`'s
bands and against our own established values. §2 carries the full measured table; this row decides.

**The four tokens, decided.**

| Token | Draft value | **True-up value** | Why |
|---|---|---|---|
| `--db-motion-fast` | `120ms ease` | **`120ms ease`** — unchanged | Anytype's nearest is `0.15s` (`_mixins.scss:2`). Both sit in `sk-design`'s 120-180ms direct-feedback band, and 120ms is an established project value with 42 declarations already on it. An established value beats a neighbouring measurement |
| `--db-motion-surface` | `180ms ease-out` | **`200ms ease-out`** — changed | Anytype puts menu, popup **and** sidebar on one constant, `0.2s` (`_mixins.scss:5-7`), and its popup easing is a decelerating curve, which is `ease-out`'s direction. 200ms is inside `sk-design`'s 180-260ms small-state band. Our 180ms is not an established token — it is 3 stray literals, exactly the population this phase is retiring — so the measurement wins |
| `--db-motion-sheet` | `260ms ease-out` | **`260ms ease-out`** — unchanged | Ours, with its reason already written at `styles.css:114-120`. Anytype's desktop client has no bottom sheet, so nothing measured contradicts it |
| `--db-motion-emphatic` | `1.1s ease-in-out infinite` | **`1.1s ease-in-out infinite`** — unchanged | Anytype's loops run `1.2s`/`2s` `linear`; ours is the same order and the curve is defensible for a sheen rather than a progress measure |

**One token added by the true-up.**

| Token | Value | Why |
|---|---|---|
| `--db-motion-scale-from` | **`0.98`** | Our popover already enters from `0.98` (`styles.css:360`) and Anytype's popup from `0.95` (`popup/common.scss:18`); both are inside `sk-design`'s 0.95-1.05 bound, so the established value holds. It becomes a token because the toast needs the same number and a scale written twice is a scale that drifts — the same argument `styles.css:114-120` already makes for the sheet duration. **Anytype's toast `scale3d(0.75)` (`notification/common.scss:25`) is refused**: it is outside the bound on the exact surface this phase builds |

**The census, corrected.** Every figure below was re-measured on the current tree; C6, C7 and C8 are
the corrections.

| Measure | Draft | **Measured** |
|---|---|---|
| `transition:` declarations in `styles.css` | 87 | **87** ✓ |
| `animation:` declarations | 21 | **21** ✓ |
| Declarations carrying `120ms` | "42" *and* "78", used interchangeably | **42 declarations**, containing **78 `120ms` occurrences**. Both figures are real; they are not the same unit |
| `var(--db-transition-fast)` uses | 8 | **7** |
| Untokenized `ms` strays | 4×150 · 3×180 · 1×160 · 1×100 · 1×80 | **✓ exact** |
| Untokenized `s`-notation durations | *not counted* | **16**: 10×`0.15s` · 3×`0.2s` · 2×`0.1s` · 1×`0.3s`. So the real 150ms population is **14**, and the real 200ms population is **3** — which is a second, independent reason `--db-motion-surface` should be 200ms |
| Animation durations | multi-second schedules | **✓**: 3×2.2s · 3×1.2s · 2×160ms · 700ms · 650ms · 220ms · 1.1s · 0.8s |

**Reduced motion is ours alone.** `prefers-reduced-motion` occurs **0 times** in
`specs/context/anytype-ts/src`. Our reset (`styles.css:918-947`) — the container's near-zero, the
`.db-surface` real zero, and the reasoning for the difference written above it — has no counterpart
to adopt from and no counterpart to measure against. AC-007 stands exactly as written, and the
shimmer's `infinite` count is the clause that most needs its lane row.
<!-- /ANCHOR:rows -->

---

<!-- ANCHOR:inherited -->
## 4. THE FOUR INHERITED 050 ITEMS, AT THEIR RESTATED THRESHOLDS

`050`'s `design-trueup.md` already restated items 5, 8, 9 and 14 against the tree, and those
restatements — not `050`'s originals — bind here. This section confirms each against today's tree
and records the one thing this sweep adds.

| Item | `050`'s restated threshold, binding | Confirmed on this tree | What this sweep adds |
|---|---|---|---|
| **5** — scroll restore (AC-010) | "0 views restore" is accurate as a symptom, wrong as a diagnosis; the machinery exists in `database-viewport.ts` (`:37`, `:67`, `:76`, `:84`) and view switching asks `reset-top`. **Wire the existing snapshot; do not build a second** | Unchanged. No capture is possible and none is needed | Nothing. The row is complete as restated |
| **8** — never-empty menus (AC-009) | `row-menu.ts` **cannot** render empty (`menu.openNote` unconditional, `row-menu.ts:88`); the only violator is `bulk-edit-field-menu.ts`. Selection caps **not adopted** — no multi-select referent | Confirmed: `bulk-edit-field-menu.ts:30` reads `getBulkEditableColumns(options.columns)` and `:38` maps `options` straight from it, with no floor and no fallback | **Two measured proofs.** (a) *Gating is real and observable*: the same iOS `···` menu carries `Undo/Redo` and `Publish to Web` on an object and omits both on a set (`sheet-object-more` vs `sheet-set-more`) — the row set is computed from the target, which is exactly the predicate AC-009 asks for. (b) *Anytype's never-empty answer is a **default row**, not a fallback message*: the Sort panel with no user sort still shows `Last modified date`, `+ Add sort` and `Delete sort` (`menus/anytype-menu-set-sort-empty-dark.png`). The **"No available actions" wording stays code-derived** — no capture shows it |
| **9** — empty flavours (AC-005) | Twelve reasons already ship; `no-database` **is** the target flavour; the real red is the third state, the deleted relation. **Adopting Anytype's empty-state design is rejected — there is nothing to adopt** | Confirmed: `empty-state-renderer.ts:24-36`, copy `:143-203`, selection `:209-216` | **The rejection is narrowed, not overturned.** It was true of the desktop and is now **desktop-scoped**; the phone renders three shapes and one carries an action button. What is adopted is the **three-tier ladder** and the **action-naming copy**, both above. The deleted-relation state remains the one flavour with no capture on either platform |
| **14** — `Load more` (AC-011) | "the virtualization path is entered" is **false** — no virtualization in `src/views`. Page limit **60**, rows **≈40px inline / 48px full-page**, measured | Unchanged | **The phone screen the vocabulary flagged has been checked.** `mobile/anytype-mobile-set-grid` renders the 326-record catalogue as a horizontally scrolling grid and the index records no `Load more` row. That is not evidence of absence — the capture is a viewport, not a scroll to the end — so **the 60 stays from `anytype-set-gallery-view-dark.png`'s `Page limit  60 ›`** and no phone figure is taken |
<!-- /ANCHOR:inherited -->

---

<!-- ANCHOR:rollup -->
## 5. ROLL-UP

### Seen, not seen, and the four with no evidence at all

| Row | Surface seen? | Evidence | Phone-relevant |
|---|---|---|---|
| `empty.no-source` | **Half** — phone yes, desktop no | `sheet-grid-cell-objecttype-empty` | Yes |
| `empty.no-matches` | **Seen**, three shapes; narrows `050` C6 | `sheet-view-filters-empty`, `sheet-cell-multiselect-empty`, `inlinecollection-empty` | Yes |
| `empty.deleted-relation` | **Not seen** | — (destination proved by `kanban-groupby`) | Yes |
| `loading` | **Not seen**, none possible | — | No separate expression |
| `error` | **Not seen** | — (source: no severity axis exists) | Yes |
| `success.notice` / `undo` | **Half** — undo seen as a menu row; no toast | `sheet-object-more`; toast from `notification/common.scss` | Yes |
| `destructive.confirm` | **Not seen** — refused by the sweep's own safety list | destructive *rows* seen, and they contradict across platforms | Yes — the phase's only phone surface |
| Motion | **Not seen**, none possible | `_mixins.scss`, `notification/`, `popup/`, `menu/`, `common.scss` | Yes, via reduced motion |

**Design inferred from source code, not seen: `empty.deleted-relation`, `loading`, `error`,
`destructive.confirm`, and the whole motion set.** Two of those (`loading`, motion) need no capture
and their tasks should stop carrying a capture field. Two (`empty.deleted-relation`, `error`) are
designed from `047` §9 and from our own tree. `destructive.confirm` is `051`'s primitive and this
packet does not design it at all.

### The values we adopt, and the four we refuse

**Adopted from measurement**, because a measurement outranks a default for the surface it covers:
the **three-tier empty-state ladder**; **8px / 16px / 16px** card spacing; a **48px** illustration
tile; the toast's **384px** width, **12px** radius, **16px** padding, **64px** min-height, **8px**
action gap at **12px** offset, **auto-hidden empty action row**, and **collapsed stacking with only
the first card rendering content**; **`--db-motion-surface: 200ms ease-out`**; and
**`--db-motion-scale-from: 0.98`** as a token rather than a repeated literal.

**Adopted as behaviour**: copy that **names the action** rather than the absence; a destructive
signal that pairs colour **with an icon**, never colour alone; capability-gated menus proved by two
captured row sets on one menu family; and a never-empty guarantee delivered as a **default row**
where one exists, with the fallback message reserved for where one does not.

**Refused, and each with its measurement.**

1. **The iOS `Create` pill's border.** `#555555` on `#1F1F1F` measures **2.21:1** — below the 3:1
   that WCAG 1.4.11 asks of a border that is the only thing identifying a control. This is `050`'s
   `#232323`-at-1.14:1 refusal from the other end of the ramp, and it is refused for the same reason.
2. **The same pill's height.** y 1565..1672px → **35.7pt**, against the 44pt iOS floor and `044`'s
   44px close. A primary action inside an empty state is exactly where a short target hurts most.
3. **The toast's `scale3d(0.75)`** (`notification/common.scss:25`), far outside `sk-design`'s
   0.95-1.05 deformation bound, on the one surface this phase builds.
4. **Anytype's absent reduced-motion story.** Zero occurrences is not a design to mirror.

**Not adopted, with reasons**: `#FF4A4D` and `#E1E1E1` are fixed values in a themed host — this is
an Obsidian plugin and the user's theme owns them, so `mod-warning` and the `--db-text-*` roles
stand. `$easeInQuint` is not ported as a bespoke curve: `design-system.md` declares no easing
vocabulary today, and introducing one cubic-bezier beside the `ease`/`ease-out` keywords would be
the "two systems of the same kind" `sk-design` §4 forbids. And the constant's **name is wrong for
its shape**, which is a second reason not to carry it.

**One deviation, named rather than absorbed.** `--db-motion-surface` moves from 180ms to 200ms, so
the three existing `180ms` literals are migrated rather than aliased. The reason is stated above and
the migration is L4's, in the same commit as the token — otherwise a literal outlives the value it
was supposed to become.
<!-- /ANCHOR:rollup -->

---

<!-- ANCHOR:cross-refs -->
## 6. CROSS-REFERENCES

- **Requirements**: `spec.md` §4, §6
- **Thresholds**: `acceptance-criteria.md`
- **Tasks**: `tasks.md` — T001 is this document
- **Rulings**: `decision-record.md` — ADR-004 and ADR-005 carry this document's contradictions
- **Vocabulary**: `state-feedback-vocabulary.md`
- **Method and the binding restatements**: `../050-anytype-adoption/design-trueup.md`
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §9, §10
- **Capture index**: `../../../screenshots/anytype/README.md`
- **Motion source**: `../../context/anytype-ts/src/scss/`
- **Token and role authority**: `../design-system.md`
- **Phone grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
- **Confirm primitive owner**: `../051-modal-and-sheet-componentization/decision-record.md` ADR-003
<!-- /ANCHOR:cross-refs -->
