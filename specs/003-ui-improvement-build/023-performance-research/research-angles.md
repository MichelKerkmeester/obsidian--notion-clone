# Research angles — plugin speed and performance

No baseline exists. The first deliverable is a measurement method, not a fix list. A performance
claim without a before-and-after under stated conditions is not a finding.

## WHAT IS ALREADY KNOWN, FROM SOURCE

- **There is no virtualisation.** `database-viewport.ts` captures and restores scroll anchors across
  rerenders; its own header says so. It does not window rows. The only slicing found is
  `table-renderer.ts:583` `group.rows.slice(0, visibleCount)` on the grouped path.
  Consequence: layout cost per rerender has no upper bound and grows with row count.
- **Rerenders are wholesale.** Roughly 43 sites clear a container outright rather than patching.
- **Scale:** 242 TypeScript files, ~93,575 lines; `styles.css` is 19,102 lines / 538KB; the built
  `main.js` is ~2.0MB.
- **There is essentially no instrumentation:** two `performance.now` / `console.time` hits in the
  whole source tree.

## ANGLES

**1 — How do we measure at all?** Obsidian plugins have no built-in profiler surface. What is the
cheapest honest harness: `performance.mark`/`measure` around render entry points, a dev-only
timing overlay, or Chrome DevTools traces against the real vault? What does the existing screenshot
harness give us for free, and what can it never show?

**2 — Where does the time actually go?** Rank by measurement, not intuition: initial view mount,
rerender after an edit, scroll, view switch, filter/sort application, formula evaluation, and
metadata-cache reads. Which dominates on a database of 1k and 10k rows?

**3 — Is the absence of virtualisation the headline, or a red herring?** Windowing is the obvious
answer and also the most invasive: it interacts with the scroll-anchor module, sticky headers,
`table-layout: fixed` column widths, keyboard traversal, and every screenshot fixture. Establish
whether row count is genuinely the dominant cost before proposing it.

**4 — What is the cost of the wholesale rerender pattern?** Would targeted patching of changed rows
be a cheaper win than windowing, and what invalidation contract would it need?

**5 — Stylesheet and bundle cost.** A 538KB stylesheet and a 2MB bundle are parsed on every app
start. Is that measurable in practice, and is anything in either one dead?

**6 — Formula and rollup evaluation.** Are computed columns evaluated per render, per row, or
cached? What invalidates them?

## RULES

Measure before claiming. State conditions — row count, view type, device, warm or cold. Report the
baseline and the delta. Where a fix is proposed, name what would regress and how it would be caught.
Every load-bearing claim needs a current-branch `file:line`. Mark inference as inference.
