---
title: "Roadmap: Component Surface System"
description: "Execution order, gating, lane ownership and current status for the nine-phase program that gives floating surfaces, sheets, checkboxes and content rows one architecture and criteria measured where users stand."
trigger_phrases:
  - "surface system roadmap"
  - "component surface roadmap"
  - "005 roadmap"
importance_tier: "high"
contextType: "planning"
---
# Roadmap: Component Surface System

> Read `architecture-findings.md` for the measured root causes and `design-system.md` for how to
> build on the contract. This file answers one question: **what happens, in what order, and what
> stops it.**

---

## 1. THE ONE-LINE REASON THIS EXISTS

1.3.1 passed tsc, build, 410 tests, 196 captures, Storybook and 13 geometry checks, and changed
nothing the operator could see. Every gate measured a mechanism. None measured an outcome.

---

## 2. EXECUTION ORDER

**`009 → 000 → 004 → 005 → 001 → 002 → 003 → 006 → 008`**, with `007` off-path. Folder numbers are
identifiers, not sequence.

**This order changed after an independent review.** `009` was parallel and gating nothing; `008`'s
replay arrived only at the end. Both were structural holes — see `adversarial-review.md` F1, F4, F7.

| # | Phase | Why here |
|---|---|---|
| 1 | `009` live verification | **The independent instrument.** `000` repairs the harness and would otherwise measure its own work through it — the circularity that produced 1.3.1. The running app is the one instrument `000` cannot influence. |
| 2 | `000` surface contract + truthful harness | Everything else measures through it. Blocks all. Its harness numbers must agree with `009`'s live numbers. |
| 3 | `004` checkboxes | Small, highly visible, needs only the harness. **Proves the method cheaply** — if this ships and circles remain, the doctrine is wrong and the cost is a week, not a quarter. |
| 4 | `005` content row rhythm | The only work with no overlay dependency. Runs while the CSS lane is free or it never gets scheduled. |
| 5 | `001` overlays | Needs the factory. Once everything routes through it, later phases get simpler. |
| 6 | `002` properties panel | After `001` the placement half is solved; only the row grid remains. |
| 7 | `003` sheets | Riskiest change (a portal). Lands after the factory is shaken out on desktop where debugging is cheap. |
| 8 | `006` record open target | Needs `003` to answer where a record opens on a phone. |
| 9 + early | `008` integration + release observability | **Its replay harness lands before `001`** and runs at every lane handoff; the release decision stays last. Only phase allowed to delete a compatibility path. |
| — | `007` architecture research | Standing research. Not a phase. |

---

## 3. WHAT BLOCKS WHAT

```
009 ── 000 ──┬── 004 ── 005 ─────────────────────────┐
             └── 001 ── 002 ── 003 ── 006 ───────────┴── 008 (release)
             008's replay harness lands before 001 and runs at EVERY lane handoff
```

- **000 blocks all seven.** No phase can measure honestly until the harness stops wrapping its
  subject in the container that hides the defect.
- **008 depends on every phase and re-opens all of them.** A phase passing its own criteria is
  necessary and never sufficient, because the stylesheet lane is shared.
- **009 is now a gate, not an accelerator.** It is the second instrument. A harness number and a live
  number that disagree block the handoff. Desktop only — the mobile story stays operator-reported.
- **The lane is enforced, not assumed.** A recorded owner and a check that fails when a phase without
  the lane modifies `styles.css`. `004` and `005` both unblock after `000`, so convention alone would
  permit two concurrent edits to a 19,000-line file.

---

## 4. THE SERIALIZED CSS LANE

`styles.css` is 19,261 lines, must not be split, and all 196 captures fingerprint it.

**Exactly one phase holds the file at a time.** A phase releases the lane only after a full
recapture **and a human looking at the changed PNGs** — `screenshots:verify` proves a capture was
regenerated, never that it looks right. `008` then re-runs the earlier phases' evidence, because a
later edit can reverse an earlier result with no compiler warning and 87 selectors in this file
already do exactly that.

---

## 5. STATUS

| Phase | State | Next action |
|---|---|---|
| `000` | Planned | Invert the CI check that currently asserts the defect, then run the mount-point census by instrumentation |
| `004` | Planned | Join all checkbox creation sites against every rule that could style one |
| `005` | Planned | Sizing census across seven view types at four widths |
| `001` | Planned | Overlay census by user-reachable trigger |
| `002` | Planned | Count emitted vs laid-out children per breakpoint and condition |
| `003` | Planned | Sheet census at runtime on a phone profile |
| `006` | Planned | Trace all twenty open affordances to their six call paths |
| `008` | Planned | Stand up the replay matrix before the first lane release |
| `009` | Planned | **Runs first.** Prove `obsidian eval` round-trips a computed style, and that the probe reproduces a defect we already know exists |
| `007` | Complete | 10 iterations + synthesis; findings folded into `000`, `008`, `009` |

---

## 6. THE TRAP THAT OUTRANKS THE REST

A CI check written during the previous attempt **asserts the defect**: it requires a widthless
caller to render wider than 320px, and it runs on every push. Fixing `001`'s width policy turns CI
red. `000` inverts it before `001` starts.

Assume there are others. A gate that has never failed has never been tested.
