---
title: "Implementation Plan: Sheet Visual Parity"
description: "The parent-level coordination plan: the shared six-step loop each child instantiates, the shared harness and gate commands, the cross-child dependencies, and the rollback."
trigger_phrases:
  - "implementation plan"
  - "076 plan"
  - "sheet parity loop plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Sheet Visual Parity

<!-- SPECKIT_LEVEL: phase -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin, no framework |
| **Framework** | The plugin's own panel/sheet renderers plus `styles.css` |
| **Storage** | None — every child here is presentational |
| **Testing** | Vitest, the live lane (`tools/live/sheet-grammar.mjs`), the constructed capture pipeline, and an image judge |

### Overview

Eleven children, one per sheet, each instantiating the same six-step loop from `spec.md` §5. This
plan carries what is shared; the per-sheet file lists, lane clauses and target tables live in each
child's own `plan.md` and `spec.md` §13.

### The mount path every child's SCREENSHOT step uses

Identical for all eleven, and named here so no child re-derives it:

```
tools/screenshots/constructed-scenarios.mjs
  constructedScenario("<view>", { renderer: "<r>" })       ← the scenario entry
    → mountConstructed(page, device, theme, spec)          ← the node-side driver
      → window.__mountConstructed(spec)                    ← CONSTRUCTED_ENTRY_BODY, in-page
        → runRenderAssertions(document.body, spec, …)      ← tools/live/render-assertion-harness.ts
          → the `scenario.renderer === "<r>"` branch       ← mounts the shipped renderer
```

Two families take their own driver: the `DbModal`-as-sheet family goes through
`constructedModalSheetScenario` → `mountConstructedModalSheet` →
`window.__mountConstructedModalSheet`, and the three-level chains go through
`constructedDepth3Scenario` → `mountConstructedDepth3Stack`. Each child's `plan.md` names which of
the three its sheet uses and which harness branch line mounts it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready (per child)
- [ ] The child's DEFINE table is complete and every reference path resolves
- [ ] Every production surface rendering the sheet's grammar is enumerated (D2a)
- [ ] Every numeric target is ours or marked `TBD — needs operator capture` (D3)

### Definition of Done (per child)
- [ ] Every lane clause ran RED with its number recorded, then GREEN with its number recorded
- [ ] `npm run screenshots` exit 0; phone light and dark current per `npm run screenshots:verify`
- [ ] The image judge scored ≥ 14/16, no row at 0, **twice consecutively on an unchanged tree**
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` all read and green
- [ ] The operator row is present and unticked
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Producer/renderer plus stylesheet, the same shape the whole sheet family already uses. No new
runtime pattern. The one new *process* artefact is `verification.md` per child, holding the judge's
score table once per iteration.

### Key Components
`spec.md`'s Phase Documentation Map names each child's primary producer. `styles.css` is shared and
serialised: one css-lane acquire/edit/release triplet per child, one holder at a time.

### Data Flow
Unchanged everywhere. No behaviour, persistence or stored shape moves — only the arrangement,
grouping, labelling and control kind of what already reads and writes it.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not applicable — presentational changes to the sheets named in `spec.md`. No security, path
handling, env precedence, schema boundary, persistence, public response or shared policy is touched.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Sequential, per D4. Each child's own `tasks.md` owns its six step groups and their checkboxes.

| Order | Child | Gate to the next |
|---|---|---|
| 1 | `001-settings-sheet-visual-parity` | Its card vocabulary is settled and its judge has passed twice |
| 2 | `002-properties-sheet-visual-parity` | Judge twice |
| 3 | `003-filter-sheet-visual-parity` | Judge twice, on **both** filter surfaces |
| 4 | `004-sort-sheet-visual-parity` | Judge twice, on **both** sort surfaces |
| 5 | `005-group-sheet-visual-parity` | Judge twice |
| 6 | `006-add-view-sheet-visual-parity` | Judge twice |
| 7 | `007-property-editor-sheet-visual-parity` | Judge twice |
| 8 | `008-record-sheet-visual-parity` | Judge twice |
| 9 | `009-menu-and-confirm-visual-parity` | Judge twice |
| 10 | `010-picker-sheets-visual-parity` | Judge twice |
| 11 | `011-toolbar-overflow-and-column-width` | Judge twice; the parent's map goes `complete` |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Lane (live) | Every measurable row of each child's DEFINE table, plus the `071` regression set | `tools/live/sheet-grammar.mjs` |
| Unit | A revert-proof contract per new class or string rule | Vitest |
| Capture | Phone light + dark through the production mount path | `npm run screenshots`, `npm run screenshots:verify` |
| Real-app (WebKit) | Sheets the rebuild harness covers, on an emulated iPhone in both engines | `node tools/live/sheet-rebuild.mjs` |
| **Image judge** | The eight-row rubric, our capture beside the reference | A Sonnet or Opus reviewer; result in the child's `verification.md` |
| Manual/device | Whole-surface read | The operator's own iPhone (D5, not agent-tickable) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `071`'s landed row grammar | Internal | Green | Must not regress; each child re-runs the `071` clauses unchanged |
| The operator's C-1..C-6 and settings captures | External | **Not supplied** | Structural targets are unaffected; `TBD` numeric cells and D3 rung 1 wait on them |
| The css-lane serialisation of `styles.css` | Internal | Live | Two children editing at once conflict; D4's sequencing is what prevents it |
| An image-judge reviewer | External (model) | Available | Without it no child can close: D1 makes it a required gate |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:loop-graph -->
## 6A. RUNNING A CHILD THROUGH THE LOOP

`decision-record.md` **D6** names the graph itself — the node table, the edge table, the two
JSON/JSONL schemas, the guard and the human gate. This section carries only the operational half:
how a child is actually driven through it.

### The two driver invocations

```bash
# One child's inner graph (DEFINE+PLAN -> GATE -> CREATE -> LAND -> JUDGE -> DONE|ESCALATE)
loop-driver.sh <child-folder-name e.g. 001-settings-sheet-visual-parity> [max_iters=4]

# The outer walk over all eleven children, launching loop-driver.sh per child
program-loop.sh [concurrency=2] [max_iters_per_child=4]
```

`program-loop.sh` is normally the one invoked directly; it re-reads the children from
`origin/main`'s tree on every pass and launches `loop-driver.sh` for any child with no state yet,
under the concurrency cap, until every child reports `DONE:pass` or the walk is stopped.

### Where state and logs live

- `$S/loop/<child>.jsonl` — the child's append-only state log (D6's child-log schema)
- `$S/loop/<child>.log` — the same transitions in a human-readable line per entry
- `$S/loop/<child>/<node>-<iter>.json` — each node's verdict file (D6's verdict-file schema)
- `$S/loop/<child>/<node>-<iter>.prompt` and `.log` — the exact prompt and raw output for that node's agent run
- `$S/loop/076.jsonl` — the outer graph's append-only event log (D6's parent-log schema)

`$S` is the scratchpad the orchestrator runs from, not this repository; nothing under `$S/loop/`
is a spec-doc artefact and none of it is committed.

### What happens at GATE

PLAN's pass is not enough to start CREATE. The orchestrator posts the child's DEFINE table to the
operator in chat and waits; the operator may correct the plan before approving it. Only once the
orchestrator drops `$S/loop/<child>/plan-approved` does the driver's GATE node resolve to `pass` and
CREATE begin. A child sitting at `GATE:waiting` is not stalled — it is waiting on that reply.

### What happens at ESCALATE

Any node reporting `blocked`, or the iteration guard (default 4) being exceeded without two
consecutive JUDGE passes, moves the child to `ESCALATE` and stops its own driver. The outer
`program-loop.sh` does not stop for it: an escalated child is skipped on every subsequent pass while
the other children keep advancing, and the operator decides the escalated child's next step outside
the graph.

### What closes a child

DONE is the graph's own terminal state — two consecutive JUDGE passes on an unchanged tree — and it
is necessary but not sufficient. Per D1 and D5, **the operator's own phone screenshot is what
actually closes a child**, never an agent: DONE hands the child to that final, out-of-graph read, it
does not substitute for it. `goal.md` §3's per-child operator row stays unticked until the operator
reports it aligned.
<!-- /ANCHOR:loop-graph -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a child regresses a landed `071` clause and cannot close it inside its own Files to Change; or the judge fails a third consecutive iteration on the same rubric row, which means the target itself is wrong rather than the implementation.
- **Procedure**: revert that child's producer and stylesheet commits — the surface returns to its shipped shape, which is green on the existing lane — and release the css-lane triplet. The child's new lane clauses go red and are reverted in the same commit. A wrong target is re-opened at DEFINE, not patched at CREATE.
<!-- /ANCHOR:rollback -->
