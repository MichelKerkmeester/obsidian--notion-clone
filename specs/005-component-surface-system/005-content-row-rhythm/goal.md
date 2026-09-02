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

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator, which reads as finished rather than as unmeasured. The audit below is why the two
green-looking rows are ticked with their exposure attached and the rest are not ticked at all.*

- [x] 20 rows, wrapping off: standard deviation of row heights is **0**. **Measured against varying
      content 2026-09-01, which is what the audit's objection was about.**
      **What was wrong.** Every synthesised row carried the same string, so a spread of zero was
      guaranteed by construction: twenty identical rows are the same height however the row is laid
      out, and the check was reading its own fixture back to itself.
      **What changed.** The content lengths now run from a single character to a paragraph, so a row
      that WRAPS is a taller row and the deviation moves. `sd 0` at every one of the twelve
      width × field-count × device combinations, so the values truncate as the stylesheet says they
      do — a claim about the product rather than about the input.
      **Watched failing** with `overflow: hidden`, `text-overflow: ellipsis` and `white-space: nowrap`
      removed from `.db-list-field-value`: the deviation goes from `0` to between **99.2 and
      1475.63** across the same twelve combinations.
- [x] **Nothing sized `max-content` paints outside the container that bounds it**, 4 widths × 7
      views; every legitimate overflow scrolls rather than grows. **Held, with its exposure stated.**
      `replay` carries *no list row paints outside its container*: was 26, recorded 0, now 0. The
      audit's objection is that the harness makes the content small, so this can pass for the wrong
      reason — what keeps the tick is that the failing value was 26 on the same instrument, so the
      instrument can distinguish, and the repair moved it.
- [x] No descendant of `.db-header` has a right edge beyond the header's content box — 4 widths ×
      7 views. **Measured, then repaired 2026-09-01: 0 spills at any of the four widths.**
      **The check exists.** `view-census` measures every descendant against the HEADER's content box
      rather than against its immediate parent's, which is a different question: a control can sit
      neatly inside its own wrapper while the wrapper hangs off the header's edge, and a
      parent-by-parent measurement reports that chain as clean.
      **One spill, at one width.** `320px chrome-toolbar-search
      .db-toolbar-cluster.db-toolbar-utilities-cluster by 10px`. Nothing spills at 402, 768 or 1440.
      **Repaired 2026-09-01, and the earlier reading of it was wrong.** This note called the two
      fixes "one-line changes in opposite directions" and used that to leave the row open. They are
      not opposite: **`flex-wrap: wrap` is additive.** It does nothing at any width where the row
      already fits, so 402 and up are untouched by construction, and at 320 the clusters take a
      second line instead of overhanging. One declaration on `.db-toolbar`, reversible by deleting it.
      **The alternative genuinely does not work, and that is what made it look like a fork.** The
      cluster is `flex: 0 0 auto` with fixed-size icon children and `overflow: visible`, so letting
      it shrink moves the overflow from the header into the cluster rather than removing it — the
      buttons still paint past the edge.
      → *header descendants past the header's content box*: **1 → 0**, and back to 1 with the
      declaration removed.
      **It still does not settle what the narrowest supported width IS.** 320px is below the
      narrowest common handset, and this program's own list sweep starts at 360 for that reason.
      That remains the operator's call — it decides whether 320 is a width to design for or one to
      stop measuring. This makes the surface correct at either answer in the meantime, which is what
      a reversible default is for.
- [x] The rail scrolls rather than grows: `scrollWidth > clientWidth` with parent width unchanged.
      **Sound by the audit's own reading** — a relation between two measurements of the same element
      rather than an absolute size, so a host that pads the content moves both terms.
- [x] Switching view type changes header height by at most one token step. **No check.**
      **Checked 2026-09-01**, in the placement lane, by performing six switches rather than
      describing one. `ToolbarRenderer.render` forks per view type — calendar and timeline hand off
      to their own toolbar renderer entirely — so the cost of a switch is not readable from the
      source. Measured: `table=109px, board=109px, gallery=109px, list=109px, calendar=109px,
      timeline=109px`, **spread 0px against one `--db-space-2` step of 4px**.
      **The bound is a token step, not a pixel count**, because that is what this row says and
      because a pixel bound needs re-tuning every time the scale moves. The step is read off the
      surface rather than written down.
      **Watched red** by giving the calendar and timeline branch a second toolbar row:
      `calendar=151px, timeline=151px … spread 42px`.
      **The count is its own row beside it.** A height comparison over one rendered header passes
      while five others throw, and the first version of this check reported exactly that: six null
      heights and no error, because the stub answered `hideHeaderChrome` with a function and
      `if (actions.hideHeaderChrome) return;` is the first line of the render. **A truthy stub is
      not a neutral one** — flags now resolve to booleans and never to functions, and
      *every view type renders a header to measure* fails if any of the six stops drawing.
- [x] Plus the five stateful dimensions. **No mapping exists.** **Mapped 2026-09-01**, in
      `acceptance-criteria.md` §2b. Three dimensions had evidence and now have a row naming it;
      **resource ownership had none, and it is the one that matters most here** because the listener
      is registered on the SCROLLER, which outlives the list — `clear()` says so in its own comment,
      and a comment is not a measurement.
      → *each re-render of the flat list releases the listener it replaces*: `10 added, 9 removed,
      1 outstanding over 10 renders`. Same for the grouped path, whose release is a **separate
      line** added recently enough that nothing had exercised it. **Red on each with its own release
      dropped from `clear()`, and the two break differently** — the flat path accumulates,
      `10 added, 0 removed, 10 outstanding; per render [1, 2, 3 … 10]`, while the grouped path
      subscribes once and keeps it, `1 added, 0 removed`. One rising series and one flat line, both
      wrong, and only the add count sees both.
      **The assertion took three formulations and the first two passed the control.** `outstanding
      === 1` is true of a list that releases every re-render *and* of one that subscribed once and
      never released — `10/9` and `1/0` are the same total. `removed === added - 1` is also true of
      both, trivially: `0 === 1 - 1`. Only `added === renders` discriminates. **Two plausible
      statements of the same claim were non-discriminating**, and a control run once would have
      recorded either as evidence.
      **The premise row caught its own fixture.** The grouped arm first measured `0 scroll
      subscription(s)` — two groups of exactly 200 rows against a `shown.length > 200` threshold, so
      neither section windowed and the arm proved nothing. A check that only asserted the release
      would have reported a clean pass over an empty measurement.

- [ ] The operator scrolls a list and the rows do not jitter. **Only the operator closes this.**
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
`styles.css` can supply.
**2026-09-02 — the `HOST_BARE_CONTROLS` half of this is spent, and the 5/8/0 count is left standing as
the reading of 2026-08-31 rather than restated.** `verify-placement.mjs` now appends
`HOST_BARE_CONTROLS` to `styles.css` on every page it builds, the desktop page included (`:316`), and
both rhythm sections carry it (`:3314`, `:3461`). So chips, rail controls and header actions are no
longer measured narrower than the host draws them, and the two overflow bullets no longer pass
because the harness made the content small. What is **not** spent is the wider point: `HOST_BARE_CONTROLS`
is a modelled subset of `app.css`, not the file, and the row-height bullet's answer is that it now
varies its content rather than that it has a host. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**YOUR DESKTOP HARNESS HAS NO CASCADE, AND THAT IS THIS PHASE'S BIGGEST EXPOSURE.** `verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it targets the **phone** page. **The desktop page is already running a "render without the stylesheet" substitution and reporting green** — the exact substitution your own AC-013 exists to catch, running permanently and unlabelled. On such a page `.db-list-row` has no `min-height`, no `--db-*` token resolves, the rail has no `overflow-x`, and **A6's sweep finds zero elements: a clean pass that means nothing.** `000` fixes the load. Until it has, **no desktop number here is admissible**, and one recorded before the repair is discarded rather than re-used. **A8 is the gate that proves it landed** and is written as a probe for a value that cannot exist without the stylesheet, precisely so it can fail.

**RESOLVED 2026-09-02, and the paragraph above is kept as the exposure the phase was opened on.** The load landed: `verify-placement.mjs:316` adds `styles.css` plus `HOST_BARE_CONTROLS` to the desktop page, and every other page it builds does the same. The desktop numbers this packet records are therefore admissible, and the substitution described above is no longer running.

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
**All three pins are gone as of 2026-09-02**: `tools/screenshots/runtime-vars.css:99-102` now carries them as a record of what was removed rather than as declarations, so captures no longer render list fields 30px narrow or collapse every timeline band. And 320 and 768 are no longer new work — `view-census.json` records all four widths, 320 included.

**A6 AND A8 WERE REWRITTEN.** A6 asked you to resolve each of the 31 `width: max-content` declarations and walk its ancestors, targeting "0 unclassified" — a classification task you satisfy by finishing the spreadsheet, with the user seeing no difference. It now closes on **0 elements painting outside the container that bounds them**, at 4 widths x 7 view types, with every legitimate overflow scrolling rather than growing (**parent width delta 0**). The **31** is preserved as the static input that makes the sweep exhaustive — reproduce it with `rg -c 'width:\s*max-content' styles.css`. A8 closed on the harness "being able to see the widths"; it now closes on a stylesheet-dependent probe returning a non-default value on **both** pages at all four widths.

**EVERY CRITERION HERE HAD A BLANK FAILING NUMBER on 2026-08-29.** Not some — all of them. `verify-placement.mjs` rendered no view at all, so nothing in this packet had been measured, and every row was `Blocked` rather than `Unmet`. **That is no longer the state, and it is corrected here rather than deleted because the ordering below still binds.** Six of the seven rows above now carry a measured number and a watched red, `tools/live/view-census.json` stamps the four-width sweep, and the header-height row is measured by performing six real view switches in the placement lane. The one row still open is the operator's, which no measurement closes. `acceptance-criteria.md` names what produces each number and at which stage. **Do not invent one.** Stage 3 may not write the sizing contract before Stage 2 fills the cells, and **Stage 2 may not run before A8's probe passes.**
<!-- /ANCHOR:log -->
