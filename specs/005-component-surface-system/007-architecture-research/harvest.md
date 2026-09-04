---
title: "Harvest: what the two architecture lineages produced, and what became of it"
description: "Every substantive finding from luna-xhigh and grok46-xhigh-architecture, dispositioned as acted on, superseded or open, with the disagreements between the two lineages resolved against the tree rather than merged."
trigger_phrases:
  - "007 harvest"
  - "architecture research harvest"
  - "luna versus grok lineage"
  - "what happened to the architecture research"
  - "which lineage is current"
importance_tier: "critical"
contextType: "research"
---
# Harvest: what the two architecture lineages produced, and what became of it

> Companion to [`goal.md`](goal.md). That file says why the packet exists and how to re-run it. This
> one says what came out of it, what the program did with each finding, and which of the two
> lineages is current where they disagree.

<!-- SPECKIT_TEMPLATE_SOURCE: none — off-path research record, not a phase document -->

---

## 1. METHOD AND EVIDENCE BOUNDARY

Two detached lineages ran against the same question. Both are read here in full, together with the
earlier generation of the second one, and every finding is dispositioned against the working tree on
**2026-08-30, `HEAD` = `3d4d2f2`**, not against the lineage's own account of the tree.

| Source | Model | Iterations | Written | Size |
|---|---|---|---|---|
| [`research/lineages/luna-xhigh/research.md`](research/lineages/luna-xhigh/research.md) | GPT-5.6 LUNA xhigh | 10 of 10 | 2026-08-29 14:34 | 30 KB |
| [`research/lineages/grok46-xhigh-architecture/research.md`](research/lineages/grok46-xhigh-architecture/research.md) | Grok 4.6 xhigh, generation 2 | 5 of 5 | 2026-08-30 13:04 | 23 KB |
| [`…/_archive/20260830T105200Z-bqpmmv/research.md`](research/lineages/grok46-xhigh-architecture/_archive/20260830T105200Z-bqpmmv/research.md) | same lineage, generation 1 | 5 of 5 | 2026-08-30 12:23 | 34 KB |

**The proof/finding distinction is preserved.** Both lineages ran no browser, no vitest, no
playwright and no device, and both said so — luna in its evidence boundary, grok in the blockquote
under its title and again in its §2 table. Everything either of them says about a browser, a phone or
an operator is a **proof obligation**. Nothing in this harvest promotes one into a result. Where a
row below says a number was observed, the command that produced it is named.

**A note on measured counts.** The tree moved during and after both runs. Grok measured
`src/views/*.ts` at 56,559 lines on 2026-08-30 around 13:00; the same glob reads **56,672** now.
`list-renderer.ts` was 679 lines in generation 1, 787 now. `styles.css` was 19,800 in both grok
generations, 19,261 in [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md),
and **19,842** now. None of these differences changes a conclusion, and the disposition rows below
say so where it matters. Cite a count with its date or do not cite it.

---

## 2. THE DISAGREEMENTS, AND WHICH IS CURRENT

Five places where the two lineages, or a lineage and the tree, say different things. Merging them
into one voice would destroy the most useful thing in the material.

### D1 — The surface factory. Grok is current.

Luna's executive conclusion is a typed `SurfaceHandle` returned by `openSurface()`, backed by a
registry, mount adapter, owned token boundary and anchor lease, with a nine-step migration that adds
the adapter before removing anything (`luna-xhigh/research.md:14-18,58-67,101-122,326-336`).

`src/views/surface.ts` was deleted on 2026-08-30 after nine measurements, recorded at
[`../001-overlay-placement-and-menu-language/spec.md`](../001-overlay-placement-and-menu-language/spec.md) §13:
importers **0**, tests or stories **0**, `data-db-surface` production nodes **0**, in the shipped
bundle **no**, cursor-point `showAt` sites **12 of 14**, `positionToolbarPopover` sites passing an
axis the declaration cannot carry **10 of 34**, producers adoptable with no new capability **1 of 5**.
The commit is `e1d9df9` *refactor(views): delete the surface factory nothing ever reached*. `ls
src/views/surface.ts` is ENOENT today.

**Grok is current**: do not rebuild it. Its §7 restates 001's own retry bar and adds one condition —
a live importer already in the shipped bundle — which is the M4 lesson stated as a precondition
rather than a post-mortem. That addition is sound and is the only part of grok's factory section that
is not already in 001.

**What luna got right inside the wrong recommendation.** Three of the five things it wanted the
factory to carry exist as separate live modules, and one of them is luna's own design shipped almost
verbatim. See H-L07 and H-L12.

### D2 — The first coupling seam. Grok is current, and its framing is sharper than the tree's.

Luna names no first seam in product terms; its migration order starts at "register each production
affordance". Grok names two live dispatch sites and argues that a factory with zero importers cannot
be a coupling seam because nothing is coupled to it (`grok…/research.md` §6).

Both sites are confirmed in the tree:

- `src/views/database-view.ts:6790-6791` — `else if (config.viewType === "list") { this.renderList(config); }`
- `src/views/embedded-database-renderer.ts:1152-1166` — the embed's own list arm, with its own
  grouped and ungrouped branches on `this.listRenderer`

**Grok is current.** This is also the finding with the largest unclosed consequence; see §4 O1.

### D3 — Whether the harness can drive a production renderer. Both are stale; the tree moved past them.

Luna's §6 and grok's §9 agree that every existing check either runs in Node with no DOM, or
photographs hand-written fixture markup, so no gate observes a production renderer. Grok states it as
a requirement on future work: *"S0 must import production renderers"*, and singles out
`tools/storybook/verify-placement.mjs` as *"not S0: it imports handwritten `SCENARIOS`, not production
renderers"*.

Two corrections, both measured:

1. **`verify-placement.mjs` does bundle shipped production code.** Its §3 is headed *BUNDLE THE
   SHIPPED POSITIONER* and its comment reads *"Re-export exactly what ships. Bundling rather than
   reimplementing is the point: a hand-copied positioner would prove the copy"*
   (`tools/storybook/verify-placement.mjs:52-60`). It imports `SCENARIOS` for the **DOM fixtures** and
   esbuilds the real `popover-position.ts` for the **logic**. Grok's sentence is true of the markup and
   false of the module under test.
2. **Two harnesses import a production renderer outright.** `tools/bench/table-render-bench.ts:30`
   imports `TableRenderer`; `tools/bench/list-render-bench.ts:31` imports `ListRenderer`.
   `tools/bench/run-list.mjs:85-120` esbuilds the entry and drives it in headless Chrome through
   `playwright-core`, with `App` supplied as `undefined` because the renderers tolerate a missing
   metadata cache (`tools/bench/list-render-bench.ts:171-173`).

The table bench is dated 2026-08-29 11:51 — it was in the tree while **both** lineages ran, and
neither read it. The list bench landed today at `173819e`.

**Neither lineage is current.** The mechanism grok specifies as S0's hard part already exists and is
proven. What is missing is different and narrower, and it is what §5 creates a phase for.

### D4 — The camelCase `setCssProps` programme. Grok generation 2 is current.

Generation 1 carries S6 as outstanding work with a named file list. Generation 2 marks it **skip —
already done by 020**. Confirmed: [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md)
§7 records that the shim implemented `setCssProps` with the `setCssStyles` body, that it was
corrected against the shipped runtime, and that *"All 23 camelCase keys across 6 files are now
hyphenated."* The shim now reads `this.style.setProperty(name, value)` at
`tools/storybook/obsidian-dom-shim.mjs:137-139`, with the reason preserved in the comment above it.

**Generation 2 is current.** Do not reopen a style-property migration as architecture work.

### D5 — The unfixtured-surface count. Grok generation 2 is current.

Generation 1 says 140 buildable surfaces have no fixture and 216 screenshot ids. Generation 2 says
129 and 224. The tree says **129** (`tools/live/design-conformance.json`, `measuredAt`
`2026-08-30T13:40:32.835Z`) and **224** (`grep -c '"id"' screenshots/manifest.json`).

**Generation 2 is current.** Read the archived generation for its reasoning, never for its numbers.

---

## 3. HARVEST TABLE

`L` rows are luna-xhigh, `G` rows are grok46-xhigh-architecture generation 2, `A` rows are unique to
the archived generation 1. Disposition is against the tree at `3d4d2f2`.

### 3.1 Acted on

| # | Finding | Where it landed |
|---|---|---|
| H-L01 | The missing phase: production-surface integration and release observability, owning cross-phase replay because no child phase can know a later stylesheet edit preserved its result | [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md). Deliverable A shipped as `tools/live/replay.mjs` and runs in the gate at `tools/gate.mjs:55` |
| H-L02 | Cross-phase invariant matrix — producer, mount, role, environment, transition, cascade, outcome | 008 spec, and the release decision matrix survives as 008's own gate table |
| H-L03 | Three deliberately different inventory sets: declaration registry, source projection, runtime observer — no one of them certifies completeness | `tools/live/design-conformance.json` carries exactly three: contract scan **193**, registry equality **82**, reachability **129**. The triangulation is luna's; the numbers are the tree's |
| H-L04 | Portal-scoped tokens: a body-mounted surface cannot inherit declarations that exist only under an ancestor, so the surface must own a token root | Conformance check *token boundary — rendered surfaces without plugin tokens*, `enforced: true`, value **0**, target **0**. `roadmap.md` §5.1 records portal-unrecoverable 537 → 0 under `001` |
| H-L05 | Anchor identity is logical, not a DOM node; the node is a render-epoch cache; states run open → anchored → anchor-missing → close | Shipped almost verbatim. `src/views/anchor-ref.ts:22` declares `AnchorState = "open" \| "anchored" \| "anchor-missing" \| "closed"`, and the module header at lines 5-9 states luna's reasoning in the program's own words. 192 lines |
| H-L06 | A wholesale view refresh must not strand a sheet's scoped lease for scrim, drag handle and scroll suppression | This is luna's single most valuable call, and it was the actual root cause of the program's most-reported defect. `roadmap.md` §4 report 1: the panel's own content render empties the panel, destroying the grab bar the sheet module prepended, so **every re-render silently unbound the gesture**. Measured 60.0px fresh / 0.0px after re-render before, 60.0px / 60.0px after. Owned by `016` |
| H-L07 | The surface **contract** — roles, mounts, dismissal sets, focus modes, width policy, token keys, producer registry — is separable from any factory that applies it | `src/views/surface-contract.ts` kept in full and measured live when the factory was deleted: covered by `surface-contract.test.ts`, imported by `anchor-ref.ts`, read by two tools. 001 §13 *"The design survives the factory"* |
| H-L08 | Behaviour study of Anytype and AppFlowy only; never copy code, CSS values or token scales across the MIT / AGPL boundary | [`../architecture-findings.md`](../architecture-findings.md) §10, and restated as a hard block in `../../006-list-view-deprecation/plan.md` §2 |
| H-G01 | Do not rebuild `openSurface`; the retry bar is three numbers and a live importer | `../001-overlay-placement-and-menu-language/spec.md` §13 *What would settle a rebuild*. Enforced by reachability: `design-conformance.mjs` read 3 unwired modules with the factory and 2 without |
| H-G02 | Guard line numbers in the 006 plan are stale; navigate by enclosing method name | `../../006-list-view-deprecation/000-grid-contract-and-list-harness/plan.md` §3 re-anchors the table off the enclosing method name and documents the line number as expected to rot |
| H-G03 | Seven of eleven guards convert; G8 and G11 are view-semantic and must not; both would pass `tsc` and the unit suite if broken | `../../006-list-view-deprecation/plan.md` §3 guard table; `decision-record.md` ADR-001; tripwires AC-31 and AC-32 specified in `000-grid-contract-and-list-harness/plan.md` §3 with the mutant-must-fail gate |
| H-G04 | Route B — the list becomes a presentation mode of the grid renderer — reached independently from the F1–F29 capability difference | Already decided by the operator and recorded at `../../006-list-view-deprecation/decision-record.md` ADR-001. The independent arrival is corroboration, not new information |
| H-G05 | `styles.css` is one serialized lane and must not be split; the header, the source-order tests and 224 captures all depend on it | `architecture-findings.md`, the lane mechanism at `tools/lane/css-lane.json` with `npm run lane:check` gated at `tools/gate.mjs:47` |
| H-G06 | S6 camelCase `setCssProps` is already done | `../020-harness-fidelity-repair/spec.md` §7; shim at `tools/storybook/obsidian-dom-shim.mjs:137-139` |
| H-G07 | The DOM shim was more permissive than the device, so the harness certified code the phone drops | Repaired at `780a736` *fix(harness): stop the test shim from being more permissive than the device*; 020 §7 records that the repair immediately turned a silent drop into a visible `inline=NaNpx` failure |
| H-G08 | Release 1.3.1 is the governing failure: every gate measured a mechanism, none measured an outcome | `roadmap.md` §2 and §3, which now separates Shipped / Verified / Operator-confirmed and states the program closes on the third |

### 3.2 Superseded

| # | Finding | Superseded by | Evidence |
|---|---|---|---|
| H-L09 | Build `openSurface()` returning a typed `SurfaceHandle` | The deletion | 001 §13 M1–M9; `e1d9df9`; `ls src/views/surface.ts` ENOENT |
| H-L10 | The nine-step migration that wraps `positionToolbarPopover` and `OwnedMenuHandle` under one lifecycle owner, then retires compatibility paths one disposition at a time | Same deletion — the destination no longer exists. The program explicitly chose to keep placement, menus, LIFO dismissal, outside-dismissal and token inheritance distributed | 001 §13 *What the program is choosing not to have* |
| H-L11 | Register every production affordance, then instrument the intended factory boundary before removal | Half superseded, half acted on. The registry exists and is measured (H-L03); the *factory boundary* it was to instrument does not | `design-conformance.json` registry-equality check, value 82 |
| H-A01 | S6 as outstanding work across a named file list | Generation 2 and 020 | D4 above |
| H-A02 | 140 unfixtured surfaces, 216 capture ids, `styles.css` at 19,100 | Generation 2 and the tree | D5 above |
| H-G09 | `verify-placement.mjs` is not a production-code harness | The file itself, which bundles the shipped positioner | `tools/storybook/verify-placement.mjs:52-60`. See D3 |
| H-G10 | S0 must build a production-importing browser harness from nothing | Two already exist | `tools/bench/table-render-bench.ts:30`, `tools/bench/list-render-bench.ts:31`, `tools/bench/run-list.mjs:85-120`. See D3 |
| H-G11 | `list-renderer.ts` is 679 lines and is a deletion candidate at S4 | It is 787 lines and gained measured, load-bearing layout logic today | `wc -l src/views/list-renderer.ts`; commits `173819e` and `31dce9a`, both from `024`. See O3 |

### 3.3 Open

| # | Finding | Deserves | Why |
|---|---|---|---|
| O1 | The embed host has its own list dispatch arm and the 006 packet does not mention it anywhere | **An amendment to 006** — outside this agent's write scope | See §4 O1 |
| O2 | No gate check executes a production renderer | **A phase.** Created as [`../026-production-render-assertions/`](../026-production-render-assertions/) | See §5 |
| O3 | `ListRenderer` is being invested in while the decided architecture deletes it | **A decision**, before 006 phase 001 starts | See §4 O3 |
| O4 | Luna's five added acceptance dimensions were never written into the doctrine they correct | **A decision** — a short edit to `architecture-findings.md` §9, owned by whoever holds it | See §4 O4 |
| O5 | The stale `openSurface` comment survived the recapture that was supposed to clear it | **Nothing but a note**, now that the condition is recorded | See §4 O5 |
| O6 | Luna's shadow-root and top-layer mount adapters | **Nothing.** No such surface exists | See §6 |
| O7 | Luna's AST-batch stylesheet normalization with computed replay | **Nothing now.** Partially served by `npm run census:cascade` | See §6 |

---

## 4. THE OPEN ITEMS, IN FULL

### O1 — The embed host is absent from the packet that is about to change the list

`grep -rn "embedded-database-renderer\|EmbeddedDatabaseRenderer\|embed" --include='*.md'` across
`specs/006-list-view-deprecation/` — parent and all five children — returns **zero matches**.

The embed is not a detail. It is a second Obsidian host, 4,069 lines, that constructs its own
`TableRenderer`, `BoardRenderer`, `GalleryRenderer` and `ListRenderer`
(`src/views/embedded-database-renderer.ts:367-464`), dispatches the same seven view kinds
(`:1128-1192`), and passes `ListRenderer` a **thinner action bag** than the file view does — the leaf
wires `openRecordDetail`, `saveCellValue` and `editFileName`, the embed omits them
(`src/views/database-view.ts:784-814` against `src/views/embedded-database-renderer.ts:464-484`).

006 phase 000 already commits to fixing half of this. Its plan §3 says the guard re-derivation must
*"Name the render-dispatch site. The branch that chooses the list renderer over the grid renderer is
where Route B's central edit lands, and it is not in the parent's guard table at all."* That sentence
is singular. There are two branches, in two files, and the packet names neither host.

**Consequence if it stays open.** Route B lands on the file view, the embed keeps rendering card
rows, and every criterion in the packet passes, because every fixture the packet describes is a file
view. That is the 1.3.1 failure with a narrower blast radius: a green gate over a surface nobody
measured.

**The fix is small and is not this agent's to make.** Two rows in `../../006-list-view-deprecation/plan.md`
§3 — the two dispatch arms with their intended change — and one line in
`000-grid-contract-and-list-harness/plan.md` §3 turning *the* render-dispatch site into *both*. The
census that phase already plans to run would then cover it.

### O3 — The renderer the plan deletes is the renderer the program is improving

`024-list-view-freeze` fixed a quadratic freeze inside `ListRenderer`: at 21 properties and 30% fill,
1,600 rows blocked the main thread for 8,646.0ms and now block it for 246.6ms
(`../024-list-view-freeze/acceptance-criteria.md` §2, AC-1, both terms measured through one runner).
The uncommitted continuation adds a column-reservation decision with its reasoning recorded in the
code — a measured 3,131px against 2,123px for a twelve-card list
(`src/views/list-renderer.ts:132-152`, landed at `31dce9a` while this harvest was being written).

Grok's S4 deletes this file. Both things can be right — a freeze must be fixed on the renderer that
ships today, and the architecture still says list rows should come from the grid engine — but nobody
has written down which. Two specific pieces of knowledge are at risk of being deleted with the file:

- **The forced-layout trap.** Asking a per-row question that measures the container, inside the loop
  that appends to that container, is quadratic. `TableRenderer` must not reintroduce it when it grows
  a list presentation.
- **The reservation trade.** Whether an empty property holds its column is a *layout-width* question,
  not a touch question and not a phone question, and getting it wrong costs either alignment or 84px
  of dead height per card.

**The decision needed, before 006 phase 001 starts:** does the grid presentation inherit these two
results as requirements, or is `ListRenderer` kept and S4 dropped? Not a phase. A paragraph in
`../../006-list-view-deprecation/plan.md`, and a bench run against `TableRenderer` at the same shape.

### O4 — The doctrine still lists four rules

[`goal.md`](goal.md) records luna's acceptance-doctrine hole as one of the things that *changed the
program*: a temporally stale or semantically aliased surface passes all four existing rules, so five
dimensions were added — semantic identity, transition trace, action outcome, resource ownership,
negative-control mutation.

[`../architecture-findings.md`](../architecture-findings.md) §9 still says *"A criterion is invalid
unless it meets all four"* and lists four. The five additions live only in the research synthesis and
in this packet's `goal.md`, neither of which any phase reads when writing a criterion.

The gap is not academic. `024`'s AC-1 is a good criterion by the four rules and was **still wrong on
first writing** — it credited the fix with work it had moved rather than removed, and the phase
caught it by re-deriving with both terms
(`../024-list-view-freeze/acceptance-criteria.md` §2). That is luna's *action outcome* dimension
found the hard way.

A decision, not a phase: either fold the five dimensions into §9, or record that they were considered
and declined. Leaving `goal.md` claiming a change the doctrine does not carry is the documentary form
of the 1.3.1 failure.

### O5 — The residual comment outlived its clearing condition

`src/views/popover-position.ts:146` still explains its hide-on-detached-anchor behaviour by reference
to the deleted factory's `place()`. 001 §13 left it deliberately, because correcting it rehashes four
`panel-record-detail-sheet` captures and *"belongs to whoever next holds the capture lane, in the same
landing as a recapture."*

A recapture landed today — `3b22924` *chore(screenshots): recapture after the sheet editor and list
renderer changes* — and the comment was not corrected. The disposition is unchanged and still correct;
what is new is that the trigger fired once without being noticed, so it is worth attaching to the
next lane holder explicitly rather than to a condition.

---

## 5. WHAT THIS HARVEST CREATED

One phase: [`../026-production-render-assertions/`](../026-production-render-assertions/), Level 2.

**Why it earned one, when nothing else did.** Every other open item is a paragraph in a document that
already exists. This one needs code, a gate wiring and a negative control, and it is the precondition
both lineages independently put first — luna's *"the harness must prove what it is connected to"*,
grok's S0. The reason it is worth building **now** rather than when 006 reaches it is that the
expensive half is already done and neither lineage knew: `tools/bench/` proves a production renderer
can be esbuilt and driven in headless Chrome, with `App` absent, at
`tools/bench/list-render-bench.ts:171-173`.

**The failing numbers it is built on**, all read from the tree today:

| Number | Value | Source |
|---|---|---|
| Gate checks | 14 | `tools/gate.mjs:40-62` |
| Gate checks that construct a production renderer | **0** | same — `bench` and `bench:list` are in `package.json:16-17` and in no `CHECKS` entry |
| Files under `src/views/` exporting a `*Renderer` class | 22 | `grep -l "export class .*Renderer" src/views/*.ts`, excluding tests and stories |
| Of those, imported by any harness | **2** | `tools/bench/table-render-bench.ts:30`, `tools/bench/list-render-bench.ts:31` |
| Obsidian hosts | 2 | `database-view.ts`, `embedded-database-renderer.ts` |
| Hosts any check constructs | **0** | `embedded-database-renderer` appears in `tools/` only inside comments and a `sources:` list (`tools/screenshots/scenarios/chrome.mjs:648`) |
| Buildable surfaces no fixture renders | 129 | `tools/live/design-conformance.json`, `measuredAt` 2026-08-30T13:40:32Z |

The phase's own criteria, its negative controls and its scope boundary are in
[`../026-production-render-assertions/acceptance-criteria.md`](../026-production-render-assertions/acceptance-criteria.md).

---

## 6. JUDGED NOT WORTH ACTING ON

Each of these is a real recommendation from one of the lineages, declined with a reason rather than
left unmentioned.

| Finding | Lineage | Why not |
|---|---|---|
| **Shadow-root style delivery and an explicit top-layer (Popover API) mount adapter** | luna §1 | The plugin mounts local and body-portal surfaces. No shadow root and no top-layer surface exists, and luna's own text says top-layer changes stacking, light-dismiss and focus at once and needs a per-role accessibility proof before opting in. Building two adapters for zero call sites is the `openSurface` failure mode in miniature — the abstraction whose registry contains nothing |
| **AST-batch stylesheet normalization with per-batch computed replay and byte-exact rollback checkpoints** | luna §7 | The safety reasoning is right and the cost is not earned yet. `npm run census:cascade` (`tools/live/cascade-audit.mjs`) already reports duplicate-selector context, and the lane mechanism already serializes edits with a holder and a check. A full AST pipeline is worth building when a normalization pass is actually scheduled; nothing schedules one |
| **A development browser observer recording every surface-root birth and close** | luna §2 | Superseded in effect by the three conformance counts, which measure the same thing statically and are already gated by freshness (`tools/gate.mjs:52`). A runtime observer would add a fourth number and a second thing to keep true |
| **Extract shared host helpers from the two hosts (grok S5)** | grok §8 | Correctly marked optional by grok itself. `FileView` and `MarkdownRenderChild` are different Obsidian base classes and the two hosts already pass different action bags; extracting before both run the same path would freeze the divergence into a helper signature |
| **Merge board and gallery into one card renderer** | implied by grok §5 | Not proposed as work by either lineage and explicitly outside Route B. Recorded so a later reader does not mistake the four-engine table for a merge instruction |
| **Rewriting `database-view.ts` because it is 11,628 lines, or splitting `cell-renderer.ts` by field type** | both, as eliminated alternatives | Both lineages eliminated these and both were right. Recorded here because file size is the most available proxy for architectural debt and the most misleading one: the measured gap is a dispatch branch, not a line count |
| **Any count either lineage published** | both | Superseded on sight. Use the command, not the citation. §1 lists the three that already drifted |

---

## 7. REFERENCES

- Lineages: [`research/lineages/luna-xhigh/`](research/lineages/luna-xhigh/),
  [`research/lineages/grok46-xhigh-architecture/`](research/lineages/grok46-xhigh-architecture/),
  and the archived generation 1 under that lineage's `_archive/`.
- Factory deletion: [`../001-overlay-placement-and-menu-language/spec.md`](../001-overlay-placement-and-menu-language/spec.md) §13.
- Shim repair: [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md) §7.
- Criteria doctrine: [`../architecture-findings.md`](../architecture-findings.md) §9.
- Programme status: [`../roadmap.md`](../roadmap.md) §3, §4, §5.
- Route B: [`../../006-list-view-deprecation/decision-record.md`](../../006-list-view-deprecation/decision-record.md) ADR-001.
- Created by this harvest: [`../026-production-render-assertions/`](../026-production-render-assertions/).
