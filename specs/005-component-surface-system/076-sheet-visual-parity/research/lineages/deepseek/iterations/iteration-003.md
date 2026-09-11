# Iteration 003 — REFERENCE COMPOSITION

**Gap class:** REFERENCE COMPOSITION · **Status:** complete · **newInfoRatio:** 0.65
**Findings file:** `findings/iter-3.md`

## Focus

Every DEFINE table's Source column and its reason; the ClickUp lead for board surfaces; the D7 frame
ruling's mechanical presence in every child (no containers, dividers, handle, 16pt inset, 44pt rows,
stacking); contradictions raised as Proposed ADRs.

## Headline findings

1. **R-1 — the frame ruling is prose-only, and the lane still requires the card it retires.**
   `tools/live/sheet-grammar.mjs:1815` computes `dividerExpected: titlePrev != null &&
   !titlePrev.classList.contains("obnotion-settings-card")`, and `:1794-1797` documents the card
   premise in a comment. Five more sites key on the card (`:1823`, `:1955`, `:4871`, `:4890`, `:4929`),
   `styles.css:114/1044/12384-12534/13793` still carries the fill and nine rules, and no child's task
   names the inversion. Proposed: a five-clause shared constraint set (`LC-1`–`LC-5`) in `spec.md` §5
   and a `T015a Lane inversion` task with the six sites quoted.
2. **R-2 — D9 and `roadmap.md` §7.21 give `012` different reference owners.** D9 names
   `012-board-card-fields` as a board child that reads ClickUp first; §7.21 says its field-layout rule
   "stays judged against Anytype". Proposed `roadmap.md` §7.22 as a Proposed ADR with two shapes,
   recommending the narrower carve-out.
3. **R-3 — adding a Source column to a table headed `Notion (structural)` creates a header
   contradiction.** Proposed header adds one column per reference plus Source and Why; `005`'s three
   `unreadable at 299×678 → TBD` rows then fill with a named owner instead of a bare gap.
4. **R-4 — no packet-level reference index.** Four children's T001 re-derive the same reads, and the
   parent already holds the two facts the index needs (the 299×678 ceiling; D3's three observed gaps).
   Proposed `076/references.md`.
5. **R-5 — composition has no legal value for a zero-reference surface**, which is 47 of the
   inventory's rows and most of `017`. `005/spec.md:246` already invented the answer
   ("our own consistency argument, recorded as such"); proposed as a D9 amendment naming the six legal
   Source values and requiring `internal` to name the child whose grammar is followed.

## Composition verdict

| Check | Result |
|---|---|
| Source column in every child | 7 / 19 |
| Source cell carries a **reason** | 0 / 19 as a rule (partial in `013`–`019`) |
| ClickUp leads board surfaces | 4 / 5 board children (`012` excepted, R-2) |
| Frame ruling as lane clause | **0 / 19** (2 children carry it as a task; 19 as prose) |
| New Proposed ADRs | 1 (§7.22, from R-2) |

## What was ruled out

- `012`'s Anytype column is **not** a straight D9 breach — §7.21 carves it out deliberately. R-2 is
  recorded in the narrower "D9 text vs §7.21 scoping" form and will not be re-raised.
- `018`/`019` need **no** new ADR — §7.21 already carries the `056` ADR-001 departure as settled. The
  only residue is the word `Proposed` in D9 against `settled` in §7.21, folded into R-2 rather than
  given its own finding.

## Next focus

**DESIGN SYSTEM (iteration 4):** how a single token/primitive system connects the children — sheet
frame, header, row primitives, dividers, typography scale, colour roles for status/priority, stacking;
which shared primitives the children should extract instead of per-sheet CSS; and the landing order
that avoids rework. Entry points: `styles.css` `--obnotion-*` (191 declarations), the
`.obnotion-settings-card` block to be retired, `src/views/surface-shell.ts`, the
`record-surface/` row builders, and the lane's shared-token surfaces
(`EDGE_CONTROL_TOKEN_SURFACE`, `FRAME_SHAPE_SURFACES`, `ROW_PITCH_SURFACE`).
