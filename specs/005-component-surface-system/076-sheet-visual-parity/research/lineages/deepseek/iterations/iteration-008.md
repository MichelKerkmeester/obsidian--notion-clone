# Iteration 008 — DESIGN SYSTEM, second axis (colour roles, type migration, stacking engine)

**Gap class:** DESIGN SYSTEM (second pass, different axis) · **Status:** complete · **newInfoRatio:** 0.66
**Findings file:** `findings/iter-8.md`

## Focus

The three parts of the system the rulings name and no token carries: colour roles for status/priority,
the typography scale against D7's 17pt, and the stacking model.

## Headline findings

1. **Y-1 — the colour-role layer exists, is theme-paired, and is named outside the system the packet
   audits.** `OPTION_COLORS = [...STATUS_COLORS]` (`src/data/column-types.ts:205`) drives
   `.obnotion-option-color-<role>` and the `--status-color-fg-<role>` / `-bg-<role>` pairs, defined
   **in this plugin's stylesheet** (light `styles.css:183-202`, dark `:1050`) — not host tokens, which
   corrects iteration 4's DS-2. It is outside the `--obnotion-*` namespace, it carries a documented
   collision (`gray ≡ slate`, separation 0/255, `styles.css:178-182`), and **no lane clause asserts any
   swatch** (`sheet-grammar.mjs`: 3 mentions, none an assertion; `render-assertions.mjs`: 1). Proposed: a
   colour-role register and clause `LC-7` (4.5:1 per role per theme + pairwise distinguishability).
2. **Y-2 — typography is literal-driven.** ~**275** literal `font-size` declarations (12px ×117,
   11px ×66, 13px ×48, 16px ×15, 10px ×6, 14px ×4, then singles) against **102** `--obnotion-font-*`
   uses and **45** host `--font-ui-*` uses — three sources for one property, and **no 17px step** for the
   value D7 named. Proposed: `--obnotion-font-row-label` / `-row-value` at 17px and a migration rule with
   a published literal count.
3. **Y-3 — the stacking engine exists and no child owns its pairs.** `REGISTERED_STACKED_PAIRS` names
   each pair, with the `is-stack-parent` toggle, the 0.710 ± 0.02 scrim band and transition-aware waits;
   the audit's stacked table has **32 pairs**; no child's tasks name the registry. Corrects iteration 3's
   `LC-5` (the engine exists) and adds a per-child pair-ownership task.
4. **Y-4 — the post-D7 elevation ladder is undocumented**: the retired card is still asserted in both
   themes and both directions (`sheet-grammar.mjs:1943-1946`, `:4896`), while the surviving recessed
   field has no named token. Proposed: canvas → sheet → recessed field, with the card retirement naming
   its three clauses and two token declarations.

## Second-axis verdict

| Question | Answer |
|---|---|
| Colour roles in the packet's token system? | No |
| Type scale can express D7's 17pt? | No |
| Stacking mechanism exists? | Yes — but no child owns its pairs |
| Post-D7 elevation ladder documented? | No |

## What was ruled out

- **Priority is not a colour role** — `priority` appears **0 times** in `styles.css` and is not a
  board-renderer concept; the roles are the *option* roles, user-named and data-driven.
- **`--status-color-fg-*` are not host tokens** — they are the plugin's own, defined per theme.
  Iteration 4's DS-2 is corrected, not withdrawn.
- **The stacked-pair registry is not small** — eight named pairs in the visible slice, 32 in the audit.

## Next focus

**LOOP LOGIC, second axis (iteration 9):** the parts of the loop the first pass did not touch — how a
child's new lane clauses become gate lanes, the evidence-freshness/stamp machinery, the LAND node's
mutation check and pixel-delta judgement, and the *outer* walk's policy (LAUNCH, skip, ordering) as the
packet grows from 12 to 19 children. Entry points: the gate's lane count (`28/0` on 0.0.40, `27/0`
earlier), the evidence stamp tool (`evidence --check-all 16/16`), `tools/lane/css-lane.json` and the
acquire/edit/release triplet, and `program-loop.sh`'s stated behaviour in `plan.md` §6A.
