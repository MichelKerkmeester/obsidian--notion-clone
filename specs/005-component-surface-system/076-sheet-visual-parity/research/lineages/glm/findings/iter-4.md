# Iteration 4 — DESIGN SYSTEM

**Lineage:** `fanout-glm-1789102713325-fbmgv2` · gap class **4 of 5: DESIGN_SYSTEM**.
**Read first:** state (5 events) + deltas (17 finding records) — iterations 1–3's gaps are cross-referenced, not repeated (F1.3's listbox, F3.3's clause pack, F3.1's Source column are *inputs* here).
**Angle:** how the 19 children connect to **one token/component system** — sheet frame, header, row primitives, dividers, typography scale, colour roles, stacking — which shared primitives to extract instead of per-sheet CSS, and the landing order that avoids rework.

---

## Finding 4.1 — The design system already exists: `surface-shell.ts`'s exported geometry and presentation resolver are the token/component system 076 keeps re-deriving in prose

**Evidence:** `src/views/surface-shell.ts:139-163`:

```ts
export const SHELL_RADIUS_PX = 8;
export const SHELL_PADDING_X_PX = 16;
export const SHELL_DIVIDER_CLEARANCE_PX = 8;
export const SHELL_ROW_HEIGHT_PX = 28;
export const SHELL_PHONE_CLOSE_PX = 44;
…
export const SHELL_PHONE_FLOATING_INSET_PT = 8;
export const SHELL_PHONE_FLOATING_RADIUS_PT = 16;
export const SHELL_CARD_INSET_PT = 16;
export const SHELL_PHONE_HANDLE_WIDTH_PT = 34;
```

with the model commentary at `:152` — `The phone frame comes in two measured shapes, not one — a blanket inset on every side is…` — the fork D7's 16pt constraint lands on, and the presentation vocabulary at `:51` (`resolveShellPresentation`) and `:80` — `…`menu` (an anchored, handle-less popover)`. 001's header claim: `001/.../spec.md:214` — `buildShellHeader is shared, so this is a family decision`.

**Finding:** The D7/D9 hard constraints (no containers, dividers, grab handle, 16pt inset, 44pt rows, stacked sheets for pickers) are *already naming* values this file owns: the 16pt inset = `SHELL_CARD_INSET_PT`; the 44pt = `SHELL_PHONE_CLOSE_PX`-class sizing; the grab handle = `SHELL_PHONE_HANDLE_WIDTH_PT` (34pt — note: **not** 44 — F3.3's L-FC3 wording must say "≥ its own shipped token size", which it does); the stacked-vs-popover choice = `resolveShellPresentation`'s declared modes, including a *handle-less* one. Every 076 clause written as a fresh number beside these consts duplicates them; every presentation migration written as per-toolbar work (F3.3's 016 T008b) duplicates a resolver that already answers it. Worse, `SHELL_ROW_HEIGHT_PX = 28` is the *desktop* row — the 44pt phone floor lives in the phone branch, so a clause reading the desktop const reports GREEN for a phone question: the exact Green-but-wrong-shape class F2.4's vacuity guardseries.

**Proposed text** — into the parent `plan.md` §6A (CREATE node contract), one paragraph:

```md
- **Frame clauses cite shell consts, never fresh numbers.** Every L-FC* clause (F3.3's pack) measures
  against `src/views/surface-shell.ts`'s exported geometry — `SHELL_CARD_INSET_PT` (16), the phone
  handle/row/close sizes, `SHELL_RADIUS_PX` — and, where a number is phone-conditional, asserts
  which presentation it read (`resolveShellPresentation`'s modes: `fullscreen` / sheet / `menu`
  handle-less). A clause that restates a shell constant as a literal is a drift waiting for the
  next D7; the plan reviewer strikes it. Presentation questions (stacked sheet vs popover, 016's
  T008b, 015's editors) are answered *in the resolver's declaration for that surface*, one decision
  in `surface-shell.ts` — not by per-surface geometry edits.
```

**Confidence:** 90% — the consts, the two-shapes note and the presentation modes are read off the file; the 28-vs-44 trap is stated from the const names and the comment's explicit "two measured shapes" (the phone-branch reading is inference, flagged).

---

## Finding 4.2 — The programme's own primitive-ownership doctrine (roadmap §7.11) was never extended to 076: the packet re-opens 053's condition-row and 052's picker primitives without citing them, and its *new* shared primitives have no owner table at all

**Evidence:** `roadmap.md:2161-2163` — `The five family phases divide by surface, not by component, so several components are consumed by more than one of them. Each has exactly one owner; a consumer references it and never re-specifies it.` — and the table's rows: **Condition row** → owner `053` (consumers: `050` REQ-013, `052`); **Menu primitive and the picker family** → owner `052`; **Sheet grammar / stacking model** → `044` / `048` — *unchanged, and named here so the family phases are not read as replacing them*. The doctrine's own lesson, `:2176-2177` — `a primitive whose owner is named nowhere the implementation leg reads is a primitive every consumer builds again`. Yet: `003/.../tasks.md:62` — `T009 **Bring the active-rule popover onto the sheet's grammar first**…make the popover render the condition through the same builder the sheet uses` — 003 re-architects the condition row (053's owned primitive) with **zero** references to 053 (grep `053` in 003's spec: 0); `010`'s pickers (F1.3's proposed listbox owner) sit on 052's picker-family ownership, equally unreferenced; and 076's *new* shared surfaces — the shell/header/handle (001), the property-row grammar (002), the status/colour roles (018's T001: `018:175` — `Status colour token source (option colour vs. fixed palette) is ambiguous | Wrong colour source implemented | T001…before choosing; recorded in §13`), the board-card anatomy tri-split (012/013/018) — are each owned by *some* task but by no *table*.

**Finding:** 076 divides by surface (19 children) exactly the way the five family phases did, and every failure mode §7.11 recorded — the invisible owner, the per-surface re-implementation, the "stated in a handover but not in the packet" — is now being re-run at 5× the familial scale. The condition-row case is the sharpest: 053 owns it, 003/004 rewrite it, and the two settlements (053's toolbar vocabulary vs 003's sheet summary-row) have never been reconciled in either packet.

**Proposed text** — into `076/decision-record.md`, as a new **D10 — Shared-primitive ownership within 076** (the §7.11 mechanism, packets updated):

```md
## D10 — One owner per shared primitive inside 076 (2026-09-11)

076 divides by surface; these components are consumed across it. Each has exactly one owner;
consumers reference the owning child and never re-specify. Inherited and unchanged per §7.11:
sheet grammar `044`, stacking model `048` (implemented — awaiting operator confirmation, `048/spec.md:26`),
confirm `051`, menu+picker family `052`, condition row `053`, inline editors `054`, empty/toast/motion
`055`.

| Shared primitive | 076 owner | Consumers (reference, never re-specify) |
|---|---|---|
| Sheet frame, header, grab handle, close glyph, presentation modes | **001** — the one-time remediation through `surface-shell.ts` + `buildShellHeader`; ADR-I is 001's §13.13 | 002–011, 013–017, 020 (everyDbModal/popover that renders shell chrome); the Frame row of every rubric |
| Row anatomy + divider grammar (the D7 reference implementation) | **002** — `record-surface/property-row.ts`'s landed grammar, generalised by its §13 | 003–011's row clauses; 013; 015 |
| Condition row + value pickers (sheet grammar form) | **003** (rule row), **004** (its sort twin) — *jointly, one shared-producer pair; reconciled with 053's toolbar-form ownership, recorded as the §7.11 cross-reference* | the active-rule popover-renderer (both), 015's select/value editors |
| Shared listbox anatomy (inventory row 30) | **010** (F1.3) — on behalf of 003/004/006/007 | those four, by pointer |
| Status/priority colour roles | **018** — its T001 token-source decision, landed as `--obnotion-*` tokens | 012 (relation chips), 002/010 (option rows), 015 (value renders), 020 (selection bar) |
| Board card: field-layout / anatomy / visibility / drag | **012 / 018 / 013 / 019** respectively (018 §13's Anytype bullet already records the 012-018 division) | each other, by pointer |
| Utility/zero-reference chrome | **017** — DbModal base derivation (`modals/obnotion-modal.ts:63`), one grammar for 18+2 | 016's popover chrome where shared, 020's non-sheet surfaces |
| The regression clause set (L-FC0–4 + every landed child's clauses) | **001** seeds it; *every later CREATE re-runs it* — the roadmap §11 mechanism | all 19+1 |

A primitive whose owner is named nowhere the implementation leg reads is a primitive every consumer
builds again (roadmap §7.11's own closing rule, 2026-09-05 — cited, not re-derived).
```

**Confidence:** 85% — the 053/052 non-citations are greps returning 0; the table's rows are proposals argued from the iteration-1–3 record (018's T001, 001's header, F1.3's 010) — the *split* of 003/004 as a "shared-producer pair" is this proposal's own invention, flagged as needing the operator's nod at GATE.

---

## Finding 4.3 — Landing order: the lane is the bottleneck (one `styles.css` holder, release = recapture + human eyes), the D7 debt deletion is 001's alone, and 003+004 should share one lane holding

**Evidence:** `roadmap.md:2590-2600` (§11) — `styles.css` is 19,261 lines, must not be split…**Exactly one phase holds the file at a time.** A phase releases the lane only after a full recapture **and a human looking at the changed PNGs**…`008` then re-runs the earlier phases' evidence, because a later edit can reverse an earlier result with no compiler warning and 87 selectors in this file already do exactly that. Since written, the file grew to **24,967 lines** (worktree `wc -l`), and 076 will queue **19+1 holders**. The D7 deletion debt: `.obnotion-settings-card` machinery = 24 grep hit-sites in `styles.css` — the light/dark token *pair* `:114` / `:1044` (`--obnotion-settings-card-fill`) plus the selectors `:12384-12399` — all retired by `roadmap.md:1955` (`Retires…071/007's settings-card landing`), all inside 001's remediation scope. The shared producer: `003` and `004` both claim `src/views/active-rule-popover-renderer.ts` (parent spec §4: `the active-rule popovers are inside 003 and 004 for this reason (D2)`), and 003's T009 (:62) re-architects it *first*.

**Finding:** Three orderings follow, none recorded in the packet's sequencing rules:

1. **001's remediation is the only Land-Rich deleter**: it deletes the retired machinery (24 sites) rather than appending; every later child's css-lane diff shrinks if it lands first. Under D4 (001→011) this is already true — the finding is that *nothing says 001's lane hold includes the deletion*, and a later child might otherwise "fix" a retired selector.
2. **003+004 = one producer, two children**: 003's T009 rebuilds the shared popover; 004's clauses measure it. If 003 releases the lane before 004's clauses exist, 004's re-acquire re-opens what 003 just recorded — the §11 reversal warning, twice. They are the packet's only co-tenants of a producer (018/019 already sequence *strictly* — 019's own D3).
3. **The §11 re-run rule generalizes**: `008 then re-runs the earlier phases' evidence` is written for one defunct phase; 076's per-CHILD version is 003's own T022 (`Re-run the 071 clauses this sheet already carries, unchanged, in the same run`) — which, extended, becomes: after 001's remediation lands, **every** subsequent CREATE runs 001's L-FC0–4 + 002's L1–L6 beside its own. Without that standing rule, the 87-reversing-selectors warning applies to 19× the diff surface.

**Proposed text** — into the parent `spec.md`'s Phase Transition Rules (after the 013–017 independence bullet):

```md
- **Lane order is capture order.** 001's remediation hold *includes the deletion* of the retired
  `.obnotion-settings-card` machinery (token pair `styles.css:114`/`:1044`, selectors
  `:12384-12399`); no later child re-styles a retired selector — it records the miss in its own
  verification and stops.
- **003 and 004 share one lane holding** (the active-rule popover producer is common, D2): 003's
  condition-row verdicts and 004's are struck in the same hold, 003's first; they are two GATE and
  JUDGE cycles, one css-lane acquisition. This is the 018→019 precedent, extended backwards.
- **The regression re-run is packet-wide**: from 002 on, every child's VERIFY runs its own clauses
  *plus* the L-FC0–4 pack plus every prior landed child's clauses, unchanged, in one invocation —
  the roadmap §11 rule (`008 then re-runs the earlier phases' evidence`) applied per child, because
  87 selectors in this file already reverse earlier results with no compiler warning.
- **017 holds the lane last of its wave** (18+2+1 surfaces, 13 of which need their constructed
  scenarios registered first — F2.3), and 020 lands after 008 (its bottom-edge arbitration reads
  008's landed record-sheet grammar).
```

**Confidence:** 87% — the 24-site deletion census and the 19,261→24,967 drift are counted; the 003/004 co-tenancy is this proposal (the shared producer is fact, the shared *hold* is the recommendation); 020's "after 008" is a dependency argued in F1.5 and restated, not re-derived.

---

## Finding 4.4 — Typography and colour roles are provisional by ruling, dark is provisional by absence, and 014's shell premise is already answered by the import graph — three facts the DEFINE tables should stop hedging

**Evidence:** The typography ruling — `roadmap.md:1955-1956`: `…row label 17pt regular, row value 17pt secondary, leading icon 20-22pt at label ink, row height 44-48pt (all provisional pending the operator's own Notion capture)`. The dark gap: `001/.../spec.md:37` — `No dark Notion reference at any rung: 123 candidates scanned, all light. OC-S2 settles it`. 014's premise, now answerable: its audit-row promise — `014`'s surfaces are `FuzzySuggestModal` instances `routed through one createSurfaceShell chrome (pending T001 confirmation)` — versus the import graph: `grep -rln createSurfaceShell src/` → `main.ts`, `src/views/image-file-suggest-modal.ts`, `src/views/markdown-file-suggest-modal.ts`, `folder-suggest-modal.ts`, plus `modals/obnotion-modal.ts` — the DbModal base (`:63`, `export class DbModal extends Modal`) *also* routes through the shell factory, which means 017's 18 surfaces are one presentation family downstream of the same shell, not a second bespoke family. And `styles.css` carries **194** `--obnotion-*` token definitions — the vocabulary exists; 018's status-colour question (F4.2) is a *pointer* problem, not a vocabulary problem.

**Finding:** Three hedges in the packet are now cheap to retire: (a) 014's "pending T001 confirmation" — four of its five surfaces' producers *import `createSurfaceShell` today*; its T001 shrinks to the fifth (`base-file-suggest`, via `main.ts:3061`'s mount) plus the "no bespoke override" read; (b) the typography numbers (17pt/44-48pt) sit in DEFINE tables as provisional when their *governing event* — the C-1..C-6 + OC-S2 captures — is already the packet's tracked blocker, so the honest state is "provisional until capture, then frozen once, in 001's remediation, for the packet"; (c) 018's T001 ambiguity is written as 018-local, but its output (a token, or the named existing model) propagates to five other children — the cross-child consequence lives nowhere.

**Proposed text** — into the parent `spec.md` §4, as the **"Type & Colour roles" convention**:

```md
- **Typography:** the D7 numbers (label 17pt regular, value 17pt secondary, leading icon 20-22pt,
  rows 44–48pt) are packet-level targets, provisionally ours, until the C-1..C-6 / OC-S2 captures
  land (D3 rung 1). 001's remediation measures them *once* into tokens (or confirms the shell
  consts); 002–019's Type rows cite 001's landed values, never re-measure — and 020/017's
  non-sheet surfaces inherit them unchanged unless their OWN reference reads otherwise, recorded
  in their Source cell.
- **Status/priority colour = 018's T001, landed as tokens.** Whatever 018's T001 settles (option
  colour model vs. fixed palette, `018:175`), it lands as `--obnotion-*` status/priority roles;
  012, 002, 010, 015 and 020 consume the token, never a fixed palette, and each of their §13's
  colour rows cites `018`'s §13 row as the source (D10's column, reference-not-re-specify).
- **014's shell premise**: its T001 confirms the fifth surface only — the import graph already
  answers the other four (`image-file-suggest-modal.ts`, `markdown-file-suggest-modal.ts`,
  `folder-suggest-modal.ts`, `main.ts` all import `createSurfaceShell`).
```

**Confidence:** 88% — 194/24 counts and the import-graph answers are greps; (b)'s packet-level-target framing is the proposed *governance* (the provisional numbers themselves are the ruling's own words); 017-via-DbModal-through-the-shell is read from `modals/obnotion-modal.ts:63` + the import hit, and DbModal's *body* chrome (not just its mount) needs 017's T001 bespoke-override read, which this finding does not presume.

---

## Also read, no finding (negative knowledge)

- `048`'s stacking model: **implemented**, awaiting 0.0.24 confirmation (`048/spec.md:26` — `| **Status** | Implemented — awaiting operator confirmation on 0.0.24 |`). 076's F3.3 L-FC4 and 016's T008b therefore depend on nothing unlanded; the §7.11 caution ("Sheet grammar / stacking model — 044/048, unchanged, named here so the family phases are not read as replacing them") is why this packet never re-derives stacking — cited as the connection that already works.
- The `SHELL_ROW_HEIGHT_PX = 28` / phone-44pt split, and the two measured phone shapes (`surface-shell.ts:152`), are *modelled* deliberately — the commentary says so; F4.1's proposal formalizes the clause↔const citation rather than flags an error.
- `styles.css`'s 24 `.obnotion-settings-card`/`.obnotion-kanban-card-meta` co-occurrences: the latter half of that count is 012's *landed, kept* machinery — only the settings-card half is D7-retired debt (F4.3's deletion scope), and 012's own :88-quoted evidence (`render-assertions.mjs`'s passing clause) remains the kept half's registration.

**newInfoRatio: 0.7** — justification: the shell-const inventory, the §7.11 non-extension, the 003+004 co-tenancy, the 24-site/194-token/24,967-line censuses and the 014-premise resolution are all first-appearance evidence; iterations 1–3's findings appear only as inputs (F1.3, F2.3, F3.1, F3.3).

**Sources (11):** src/views/surface-shell.ts:51-163; roadmap.md:2159-2178 (§7.11) + 2589-2603 (§11); roadmap.md:1955-1956 (D7/D9 numbers); styles.css (:114, :1044, :12384-12399; 194-token/24-hit census); src/views/modals/obnotion-modal.ts:63; src/main.ts; 001/spec.md:37,214; 003/tasks.md:62; 014/017 specs (createSurfaceShell premises); 018/spec.md:175; 048/spec.md:26.
