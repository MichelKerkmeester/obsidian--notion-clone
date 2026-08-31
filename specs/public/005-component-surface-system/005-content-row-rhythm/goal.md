**Phase 005 — Content row rhythm**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **Runs third.** No overlay dependency — take the CSS lane while it is free or this never gets scheduled. Take it at Stage 4, release it at Stage 7.

**TWO DEFECTS, ONE QUESTION.** List rows are ragged; calendar filter bubbles overflow their container. Both ask: **does the container own the size, or the child?** One sizing decision fixes both, and they touch the same CSS regions. Split only if different people ship them.

**BUILD.** An intrinsic-sizing contract: `min-width: 0` discipline, a declared row rhythm, and an explicit scroller-vs-grower decision per container.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**LANE.** Take at Stage 4, release at Stage 7, and only after all four in order: (1) full recapture at four widths per view, both themes — meaningful only once Stage 1 has removed `--db-card-field-width` and `--db-timeline-row` from `runtime-vars.css`, since until then list fields render 30px narrow and every timeline band collapses to `auto`; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — `screenshots:verify` never opens an image; (3) **`008`'s early replay re-asserting `000` and `004`** against the tree you released — you are collapsing seven rail blocks that render in **all seven view types**, so the blast radius is the whole application chrome; (4) cascade re-confirmation, each deletion citing its entry in `000`'s cascade audit, because a block that looks dead here has already been shown elsewhere in this stylesheet to be load-bearing through a duplicate class.

`004` unblocks from `000` on the same edge you do and also edits `styles.css`. **You are serialized by this rule and nothing else** — there is no lock file.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE.**
- 20 rows, wrapping off: standard deviation of row heights is **0**. Wrapping on: every height a whole multiple of the line box.
- **Nothing sized `max-content` paints outside the container that bounds it**, 4 widths × 7 views; every legitimate overflow scrolls rather than grows.
- No descendant of `.db-header` has a right edge beyond the header's content box — 4 widths × 7 views.
- The rail scrolls rather than grows: `scrollWidth > clientWidth` with parent width unchanged.
- Switching view type changes header height by at most one token step.
- Plus the five stateful dimensions.

**DONE MEANS** the operator scrolls a list and the rows do not jitter.
**HARNESS DEPENDENCE, 2026-08-31 — 5 sound / 8 dependent / 0 unknown.** Every bullet here is about
**intrinsic size**, and an intrinsic width is content plus padding — where the padding on a bare
control comes from `app.css`, which the instruments do not load. `view-census.mjs:69-71` loads
`styles.css`, `theme.css` and `runtime-vars.css`; the two rhythm sections in `verify-placement.mjs`
(`:3269`, `:3354`) build the same set and **omit `HOST_BARE_CONTROLS`**, the one host rule the harness
does model. So chips, rail controls and header actions are narrower and shorter here than on any
device: *"nothing sized `max-content` paints outside the container that bounds it"* and *"no
descendant of `.db-header` has a right edge beyond the header's content box"* both pass **because the
harness made the content small**. Row-height standard deviation and the header-height step inherit
the same floor — and the row-height cell already concedes its uniformity is a property of the
fixtures. **Sound:** the rail scrolls-not-grows relation, the deletion and mutation controls, the
scroll-owner count, and AC-008, which closes on `min-height: 44px` and a `--db-*` token — values only
`styles.css` can supply. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**YOUR DESKTOP HARNESS HAS NO CASCADE, AND THAT IS THIS PHASE'S BIGGEST EXPOSURE.** `verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it targets the **phone** page. **The desktop page is already running a "render without the stylesheet" substitution and reporting green** — the exact substitution your own AC-013 exists to catch, running permanently and unlabelled. On such a page `.db-list-row` has no `min-height`, no `--db-*` token resolves, the rail has no `overflow-x`, and **A6's sweep finds zero elements: a clean pass that means nothing.** `000` fixes the load. Until it has, **no desktop number here is admissible**, and one recorded before the repair is discarded rather than re-used. **A8 is the gate that proves it landed** and is written as a probe for a value that cannot exist without the stylesheet, precisely so it can fail.

**LINE NUMBERS ARE HINTS, NOT ADDRESSES.** Every `styles.css:NNNN` below was correct on 2026-08-29; `000` deletes dead blocks and you then collapse seven rail blocks yourself. `acceptance-criteria.md` carries the resolution table. The three-act `mask-image` reversal matters most: **the order of the three is the whole argument**, so read `rg -n -A6 '\.db-active-view-controls-scroll' styles.css` in order and record which act computed the winner, before and after your collapse.

**SEVEN VIEW TYPES, NOT FIVE.** `types.ts:238` — table, board, gallery, list, **chart**, calendar, timeline. The census matrix is **84 states**, not 60. Criteria written against five under-cover two entire views.

**THE RAIL IS NOT THE CALENDAR'S.** `.db-active-view-controls` is a child of `.db-header` and renders in **every** view. Fixing it on the calendar alone ships six untested surfaces. It has **seven** competing CSS blocks, and the `mask-image` reversal has a third act: `18577` sets a gradient, `19096` sets `none`, `19101` re-applies it under `.is-overflowing` — a class the renderer already computes from `scrollWidth > clientWidth + 1`. **The mechanism the criteria ask for already exists and nothing asserts it.**

**THE REPORT CONTRADICTS THE SOURCE — SETTLE IT BY CENSUS.** The operator reports ragged rows *unless* wrapping is on. But desktop `.db-list-row-meta` is `flex-wrap: nowrap` (`9668`), so no field can reach a second line, and `flex: 0 0 150px` (`9703`) beats `width: max-content` (`9719`) — so wrapping does not widen the field, it paints the value outside its box. Static reading predicts the **opposite** of the report. Both readings fail the criteria, so this does not block, but they imply **different fixes**. The census decides.

**INVENTORY.** Render each view at 320/402/768/1440 with 1, 6 and 20 fields. Record every element whose right edge exceeds its parent's content box, plus the height histogram of sibling rows. Automatic and exhaustive.

**THREE HARNESS LIES SIT DIRECTLY IN THIS PHASE'S MEASUREMENT PATH.**
- `--db-header-height` is **never assigned in `src/`** — only in `runtime-vars.css`, at 40px.
- `--db-card-field-width` pinned to 120px where the stylesheet falls back to 150px: captures render list fields 30px narrow.
- `--db-timeline-row` set to `34px` when it is a **grid line index** — `grid-row: 34px` is invalid, so **every timeline band collapses to `auto` in every capture ever taken**.
Fix all three before measuring anything. Only two capture devices exist (1440, 402), so 320 and 768 are new work, and `verify-placement.mjs` renders no view at all today.

**A6 AND A8 WERE REWRITTEN.** A6 asked you to resolve each of the 31 `width: max-content` declarations and walk its ancestors, targeting "0 unclassified" — a classification task you satisfy by finishing the spreadsheet, with the user seeing no difference. It now closes on **0 elements painting outside the container that bounds them**, at 4 widths x 7 view types, with every legitimate overflow scrolling rather than growing (**parent width delta 0**). The **31** is preserved as the static input that makes the sweep exhaustive — reproduce it with `rg -c 'width:\s*max-content' styles.css`. A8 closed on the harness "being able to see the widths"; it now closes on a stylesheet-dependent probe returning a non-default value on **both** pages at all four widths.

**EVERY CRITERION HERE HAS A BLANK FAILING NUMBER.** Not some — all of them. `verify-placement.mjs` renders no view at all, so nothing in this packet has ever been measured. Every row is `Blocked`, not `Unmet`. `acceptance-criteria.md` names what produces each number and at which stage. **Do not invent one.** Stage 3 may not write the sizing contract before Stage 2 fills the cells, and **Stage 2 may not run before A8's probe passes.**
<!-- /ANCHOR:log -->
