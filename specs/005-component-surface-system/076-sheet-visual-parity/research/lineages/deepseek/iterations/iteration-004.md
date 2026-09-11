# Iteration 004 — DESIGN SYSTEM

**Gap class:** DESIGN SYSTEM · **Status:** complete · **newInfoRatio:** 0.68
**Findings file:** `findings/iter-4.md`

## Focus

How the children connect to one token/component system — sheet frame, header, row primitives,
dividers, typography scale, colour roles for status/priority, stacking; the shared primitives to
extract instead of per-sheet CSS; and the landing order that avoids rework.

## Headline findings

1. **DS-1 — "sheet" is a class-name convention, not a component.** `createSurfaceShell` is used by
   **9** files in all of `src/` (187 view modules). `filter-panel-renderer.ts:27` imports only
   `buildShellHeader` and builds its own panel at `:178`; `active-rule-popover-renderer.ts:121` builds
   `obnotion-active-rule-popover obnotion-filter-panel … obnotion-sort-panel` — **borrowing another
   sheet's class list to look like the sheet**. So `003`/`004`'s two producers reach the frame by two
   different routes and D7/D9 have no component to bind.
2. **DS-2 — five row heights, and the type scale cannot express the target.** 25 (board card meta) /
   28 (`SHELL_ROW_HEIGHT_PX`) / 34 (`--obnotion-row-height-default`) / 44 (`ROW_PITCH_FLOOR_PX`) / 50
   (`SHELL_PHONE_ROW_HEIGHT_PT`), against a scale of 11/12/13/14/16 where D7's remediation names
   **17pt**. Plus `SHELL_PHONE_DIVIDER_INSET_PT = 20` is **exported and read by nothing** while the
   lane asserts 16px and D9 mandates 16pt; and the nine option-colour swatches read the **host**
   `--status-color-fg-*` tokens, so there is no `--obnotion-*` colour-role layer. Proposed: a shared
   token register in `plan.md` §3A.
3. **DS-3 — two divider mechanisms.** The lane reads a row's `::before`
   (`sheet-grammar.mjs:1751`); the stylesheet's dominant mechanism is `border-bottom` (**76** sites),
   which cannot carry D7's leading inset. A child hitting the target with `border-bottom` looks right
   and is invisible to the clause. Proposed `LC-2a`.
4. **DS-4 — eleven row classes, 29 emitting files.** `obnotion-panel-row` (82 rules) plus ten siblings.
   Proposed extraction table: `obnotion-sheet-row`, `obnotion-sheet-section`,
   `obnotion-sheet-nav-row`, `obnotion-sheet-toggle-row`, `obnotion-sheet-picker-row`, with owners.
5. **DS-5 — the landing order is unstated and the independence clause lets five children edit
   `styles.css` without inheriting `001`'s vocabulary.** Proposed: primitives before consumers; the
   independence clause is about *gating*, not about *styling*.

## Design-system map

```
frames  surface-shell.ts (9 users) | hand-built panels (filter-panel:178) | borrowed classes (active-rule:121)
tokens  191 --obnotion-* | type 11/12/13/14/16 (no 17) | 5 row heights | ::before vs 76 border-bottom | host status colours
rows    obnotion-panel-row (82) + 10 siblings, 29 emitting files
lane    3 frame shapes, 1 pitch surface, 1 handle control, 6 card-premise sites for D7 to invert
```

## What was ruled out

- The frame is **not** already one component (9 shell users).
- `SHELL_PHONE_DIVIDER_INSET_PT = 20` is **not** the packet's divider inset — it is dead code; the
  lane's 16px is the live value.
- `--obnotion-row-height-default: 34px` is **not** a D9 breach; it is the compact table density ADR-D
  settled. Retained in the narrower "no register says which height applies where" form.

## Next focus

**LOOP LOGIC (iteration 5):** the D6 graph, the driver's own contract, the judge rubric, the guard,
DONE, release gating, parallelism under the cap and what to log. Entry points: `decision-record.md`
D6's node/edge tables and both JSONL schemas, `plan.md` §6A, D8's release rule, the guard
(`max_iters = 4`), and the observed `0.0.40` cut that D8 was written to prevent.
