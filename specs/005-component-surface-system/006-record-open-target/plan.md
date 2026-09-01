---
title: "Implementation Plan: Record Open Target"
description: "Approach, gates and rollback for replacing four disagreeing open surfaces with one resolved target and the setting that chooses it."
trigger_phrases:
  - "006 record open target plan"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Record Open Target

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

The static census is already in [`spec.md`](spec.md) §4. This plan turns it into a decision, a
resolver, and a retirement.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, no output, read without a pipe |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, count not reduced |
| Trace | trace script | Stage 6 artefact differs from Stage 1 in the asserted numbers |
| Behaviour | browser harness | every criterion, each with a recorded prior failure |
| Negative control | harness, per check | deleting the target surface moves an asserted number |
| Persistence | reload the plugin | written setting equals read-back setting |
| Captures | `npm run screenshots` then **human review** | diffs explained, not merely regenerated |
| Capture manifest | `npm run screenshots:verify` | exit 0 — a partial recapture cannot satisfy it |
| Catalogue | `npm run story:smoke` | every target surface renders at its production mount point |

Lint stays report-only at its existing baseline.

**No DOM assertion in vitest.** `vitest` runs `environment: "node"` with no jsdom. A vitest test here
may assert source text and the setting's serialisation; every geometry and hit test lives in
`tools/storybook/verify-placement.mjs` or its successor.

### The `styles.css` lane — take, hold, release

`styles.css` is one serialized lane (parent `spec.md` §4). This packet is seventh and last of the
feature phases, after `000`, `004`, `005`, `001`, `002` and `003`.

| Moment | Rule |
|---|---|
| **Take** | Start of Stage 5 (*Retire the peek*) — the stage that removes the peek's fifteen rules and replaces the literal `z-index: 998` with a declared tier. Not earlier: Stages 1 to 4 trace, decide, build the resolver and route the affordances against an unedited stylesheet, so the trace records the tree as shipped |
| **Hold** | Stages 5 and 6. No other phase may edit `styles.css` in that window |
| **Release** | Only after all four release conditions below, in order |

1. **Full recapture** — one per target: side panel, full page, phone, both themes — then
   `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` never opens
   an image and cannot be this step.
3. **`008`'s early replay re-asserts `000`, `004`, `005`, `001`, `002` and `003`** against the
   released tree. This is the last handoff before `008`'s full release gate, and therefore the last
   cheap opportunity to find a cascade reversal introduced anywhere in the program.
4. **Cascade re-confirmation** — every duplicated selector touched has its computed winner recorded.
   Replacing a literal `998` with a declared tier changes stacking for anything that sat between the
   two values, so this is a real check here rather than a formality.

**Stage 5 has a second, non-lane constraint.** It may not retire the peek before Stages 1 to 4 have
recorded its *before* numbers for AC-002, AC-003, AC-007, AC-009 and AC-012. Deleting before Stage 4
strands `Mod+Enter`; deleting after Stage 4 recreates the disagreement; deleting before the numbers
exist leaves nothing to measure the fix against.

---

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**One policy, one resolver.** A single function resolves the open target from the setting, the
platform and the record. Every affordance in `spec.md` §3A calls it, and no affordance decides for
itself. The target is a real Obsidian surface — a leaf or a `Modal`, owned by the workspace, with a
lifetime independent of the database view's render cycle — and it contains the note's rendered body.

*Why not a CSS fix to the peek.* The question "where does a record open" is a product decision with a
settings surface, not a rule in `styles.css`. Sizing it as a styling change produces a fourth surface
rather than replacing the ones that already disagree.

*Why the peek is retired rather than kept alongside.* Leaving a surface nobody routes to reproduces
the exact condition `spec.md` §3A records: twenty affordances reaching four surfaces.

*Why the boundary is drawn explicitly.* `getLeaf(false)` is reached from `database-view.ts` in six
places and `embedded-database-renderer.ts` in seven. The database-definition-file opens at
`main.ts:689-724` use a different helper and must stay exactly as they are.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Drive the affordances and record what they actually produce

Twenty affordances, each activated in the running plugin, each producing a record of the surface's
constructor, parent, leaf-or-not, rect, and whether the database view survived. This is the step that
settles the discrepancy §6 names: the table **Open** button branches on `isTouchDevice`
(`database-view.ts:8425`), so on a phone the reported 360px dock is reachable only through
`Mod+Enter`, which has no touch guard (`database-view.ts:1717`). The delta between the trace and the
static table is the finding.

### Phase 2 — Take the target-policy decision with the operator

`spec.md` §10 is a real fork, not a formality. Side panel, full page, or both behind the setting
changes the size of every later stage: with "full page" as the default most affordances change only
which leaf they use, and with "side panel" all twenty change surface. **No code is written before
this is answered.**

### Phase 3 — The resolver and the setting

One function resolves the target from the setting, the platform and the record. The setting is added
to `PluginSettings` (`src/data/types.ts:636-657`) with an absent value meaning current behaviour, and
its control goes in `src/settings.ts` beside the existing open-related toggles at `:124-145` — which
govern the **database definition file** and must keep doing exactly that. The resolver is introduced
alongside the existing paths; both work at the end of this stage.

### Phase 4 — Route every affordance through it

All twenty, in one pass, because a partial migration is the condition `spec.md` §4 describes. The
hardcoded touch branch at `database-view.ts:8425` is retired here. `getLeaf(false)`
(`data-source.ts:425`) becomes the resolver's business; the database-definition-file opens at
`main.ts:689-724` are explicitly outside the boundary and are not touched.

### Phase 5 — Retire the peek

**Takes the `styles.css` lane here.**

`table-record-peek.ts` and its fifteen `styles.css` rules go, or the module is reduced to the
resolver's preview mode with the literal `z-index: 998` (`styles.css:18324`) replaced by a declared
tier from the scale at `styles.css:71-74`. Deleting before Stage 4 would strand `Mod+Enter`; leaving
it after Stage 4 recreates the disagreement.

### Phase 6 — Re-run the trace unchanged

Same script, same twenty affordances. Criteria are the delta between the Stage 1 and Stage 6
artefacts.

### Phase 7 — Captures and catalogue

**Releases the `styles.css` lane here**, and only after the four release conditions in §2.

One capture per target — side panel, full page, phone — both themes, then a human looks at the
changed PNGs. Storybook gets each target surface at its production mount point plus the setting's
states.

---

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom. A vitest test here may assert source text and the
setting's serialisation; every geometry and hit test lives in `tools/storybook/verify-placement.mjs`
or its successor.

The trace is the measurement instrument: the same script drives the same twenty affordances at Stage
1 and Stage 6, and every criterion is the delta between the two artefacts. The negative controls run
before the criteria are trusted.

Persistence is its own gate — the setting is written, the plugin reloaded, and the value read back.
`screenshots:verify` is not a visual gate; it proves a capture was regenerated after its
hand-maintained source list changed and never opens an image.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`000-surface-contract-and-truthful-harness` for the factory, the token root and the Storybook `Modal`
stub the chart-drilldown precedent needs.

`003-mobile-sheet-presentation` is a hard dependency, not a preference: without the portal the phone
target is another container-bound panel and A3 cannot pass.

Stage 2's operator decision gates every later stage. This spec is last in the program and blocks
nothing. It holds the serialized `styles.css` lane for Stage 5.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Each stage is separately revertable and lands as its own commit.

- Stage 1 writes an artefact and changes nothing.
- Stage 2 writes a decision and changes nothing.
- Stage 3 is additive: the resolver exists, nothing calls it, the setting defaults to absent and
  absent means today's behaviour. Reverting is a deletion with no migration.
- Stage 4 is the behavioural change. Reverting restores the per-affordance choices; the resolver can
  stay in place unused.
- Stage 5 is the only step that deletes. The peek module and its CSS rules are recorded verbatim in
  the Stage 1 artefact before removal.

**The setting is persisted state.** An absent value must retain current behaviour, so a vault that
never opens settings is unaffected by a revert in either direction. That property is what makes
Stage 3 safe to land early.

**CSS lane.** This spec holds `styles.css` for Stage 5 and releases it at Stage 7's recapture.

---

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 7A. DEPENDENCY GRAPH

```
Stage 1 driven trace ──▶ Stage 2 policy decision ──▶ Stage 3 resolver + setting
                                                              │
                                              Stage 4 route all twenty
                                                              │
                                                   Stage 5 retire the peek
                                                              │
                                                  Stage 6 re-run the trace
                                                              │
                                          Stage 7 captures + catalogue
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Stage 1 driven trace | `000` honest harness | One record per affordance: constructor, parent, leaf-or-not, rect, view survival; the peek archived verbatim | Stages 2 to 6 |
| Stage 2 policy decision | Stage 1, the operator | Side panel, full page, or both — and the shape of the setting | Stages 3 to 5 |
| Stage 3 resolver + setting | Stage 2, `003` for the phone target | The resolver, the persisted setting, the target surface | Stage 4 |
| Stage 4 route all twenty | Stage 3 | Every affordance resolving through one policy; the touch branch retired | Stage 5 |
| Stage 5 retire the peek | Stage 4 | The peek module and its fifteen CSS rules gone, or reduced to preview mode on a declared tier | Stage 6 |
| Stage 6 re-run the trace | Stages 4 and 5 | The delta artefact the criteria are read from | Stage 7 |
| Stage 7 captures + catalogue | Stage 6 | One capture per target, both themes, reviewed by a human | Lane release |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 7B. CRITICAL PATH

1. **Stage 2 — the policy decision** - CRITICAL. It sets the size of every later stage, and no code is
   written before it closes.
2. **Stage 4 — route all twenty** - CRITICAL and deliberately non-incremental; a partial migration is
   the defect, not a step toward fixing it.
3. **Stage 5 — retire the peek** - CRITICAL. A surface nobody routes to recreates the disagreement.

**Total Critical Path**: Stage 1 → Stage 2 → Stage 3 → Stage 4 → Stage 5 → Stage 6. Stage 7 gates the
lane release.

**Parallel Opportunities**:
- Stage 3's resolver is additive and can be built while the Stage-2 decision is still being taken,
  provided nothing calls it and the setting stays absent.
- The Stage-1 archive of the peek module (T4) can be taken at any point before Stage 5.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 7C. MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | What actually happens is known | All twenty affordances have a driven record; the phone question is answered by observation | End of Stage 1 |
| M2 | The policy exists | Side panel, full page or both, recorded with its reason; `spec.md` §12 answered | End of Stage 2 |
| M3 | The target shows the page | A1: the seeded note's body characters are present in the surface, and it is a leaf or a `Modal` | End of Stage 3 |
| M4 | One policy, honoured everywhere | A4: zero affordances produce a surface other than the configured target; A7: the view survives | End of Stage 4 |
| M5 | No surface outside the resolver | A6: a dropdown inside the surface wins the hit test; the literal `998` is gone | End of Stage 5 |
| M6 | Proven by delta | Stage 6 artefact differs from Stage 1 in the asserted numbers; A5 round-trips across a reload | End of Stage 6 |
| M7 | Seen by a person | One capture per target, both themes, reviewed by a human; the operator has opened a record on desktop and on a phone and seen the page | End of Stage 7 |

<!-- /ANCHOR:milestones -->
---

## 8. RISK

**Twenty affordances, four surfaces, one pass.** Stage 4 is deliberately not incremental. A partial
migration leaves the same glyph and the same `menu.openNote` label producing different outcomes,
which is the defect, not a step toward fixing it.

**`getLeaf(false)` has a wide blast radius.** It is reached from `database-view.ts` in six places and
`embedded-database-renderer.ts` in seven. The database-definition-file opens at `main.ts:689-724` use
a different helper and must stay untouched; the resolver's boundary is drawn explicitly and asserted.

**`003-mobile-sheet-presentation` is a hard dependency.** Without the portal the phone target is
another container-bound panel and A3 cannot pass. If `003` slips, this spec stops at Stage 4 with the
phone target unimplemented rather than shipping a fourth phone surface.

**The chart drilldown is the only real `Modal` in the program** (`chart-renderer.ts:970`,
`ChartDrilldownModal extends DbModal`). If the chosen target is a modal, that class is the precedent
and the `Modal` stub in Storybook must be unblocked — which `000` T5 already owns.

**Research gate.** Standing. If a criterion fails twice without a new hypothesis, study Notion's
side-peek and full-page behaviour: what each shows, what persists across a re-render of the
underlying view, what the phone does instead. Notion is the visual target and is **not** a source.
AnyType and AppFlowy under `external/` are behaviour-only references; both are AGPL/source-available
against this plugin's MIT, so never copy code, CSS values or token scales.

---

---

## 9. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md` read, and `spec.md` §3A's census read, before opening any source
      file
- [ ] `000` confirmed landed, and `003` confirmed landed for anything touching the phone target
- [ ] The Stage-2 policy decision is recorded — no code is written before it closes
- [ ] The Stage-1 driven record for this task's affordance exists
- [ ] The criterion's failing number is recorded from the Stage-1 artefact

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Trace before decision, decision before code, route before retire. Deleting the peek before Stage 4 strands `Mod+Enter`; leaving it after Stage 4 recreates the disagreement |
| TASK-SCOPE | Record opens only. The database-definition-file opens at `main.ts:689-724`, hover preview and field-link opens are outside the boundary and are asserted unchanged |
| TASK-ATOMIC | Stage 4 routes all twenty affordances in one pass. A partial migration leaves the same glyph and label producing different outcomes, which is the defect itself |
| TASK-EVIDENCE | Every criterion's number comes from the driven trace, not from reading the source. A4 counts observed surfaces produced by driven affordances, never static call sites |
| TASK-SETTING | Absent means current behaviour. A vault that never opens settings must see no change |
| TASK-CSS | This phase holds `styles.css` for Stage 5; the peek's rules are archived verbatim before deletion and the lane is released at Stage 7's recapture |

### Status Reporting Format

Report per task: `TNN <status> — <Stage 1 observation> -> <Stage 6 observation>`, where status is one
of `complete`, `in progress`, `not started`, `blocked`. A criterion task with no Stage-1 observation
is reported as `not started`, whatever its code state.

### Blocked Task Protocol

A task is BLOCKED when `000` or `003` has not landed, when the Stage-2 decision is open, when its
Stage-1 record is missing, or when the CSS lane is held elsewhere. On BLOCK: record the blocker in
`tasks.md` and stop that task. If `003` slips, stop at Stage 4 with the phone target unimplemented
rather than shipping a fourth phone surface. When a criterion fails twice without a new hypothesis,
open the standing research gate in `spec.md` §5A rather than retrying.

---

## 10. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)
- Predecessor: [`../003-mobile-sheet-presentation/spec.md`](../003-mobile-sheet-presentation/spec.md)
- Foundation: [`../000-surface-contract-and-truthful-harness/spec.md`](../000-surface-contract-and-truthful-harness/spec.md)
- [`acceptance-criteria.md`](acceptance-criteria.md)
