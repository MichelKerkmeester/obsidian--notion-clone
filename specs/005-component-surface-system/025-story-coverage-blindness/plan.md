---
title: "Implementation Plan: The Story Coverage Gate Runs a Different Script"
description: "Wire the story-coverage check into the gate, disambiguate the two script names, widen the matcher from a name test to a capability test, and discharge the modules it reveals."
trigger_phrases:
  - "025 story coverage plan"
  - "gate lane rename"
  - "coverage matcher widening"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: The Story Coverage Gate Runs a Different Script

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Three stages, and the order matters more than the size of any of them.

**Wire first, widen second, discharge third.** Wiring the existing check into the gate is a two-line
change that turns a hidden red into a visible one — that is the deliverable, and it is worth having
even if nothing else in this phase lands. Widening the matcher before wiring it would produce a
larger red that nobody is yet reading, which is the state the repository is already in.

The third stage is the one that consumes the effort and the one most likely to be done badly.
Thirteen modules become visible at once, and the cheap way to make the gate green is to write
thirteen allowlist entries. `tasks.md` argues each one individually for that reason.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Tool lint | `npm run lint:tools` | exit 0 |
| Story coverage | `node tools/storybook/story-coverage.mjs` | exit 0, and the exit status read without a pipe |
| Shim coverage | `node tools/storybook/verify-coverage.mjs` | exit 0, unchanged by this phase |
| Matcher widening | `node tools/storybook/story-coverage.mjs --json` | `covered + exempt + missing` counts at least 31 modules |
| **Negative control** | the widened matcher against the tree as received | reports all 13 blind modules as missing. **A silent pass fails this gate** |
| Whole gate | `npm run gate` | exit 0, with both coverage lanes present and distinctly named |

The exit code is read directly, never through a pipe. `tools/gate.mjs`'s own header records four
occasions in one session where a pipe made `$?` the pipe's status and a red check was read as green.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

There is no architecture here in the usual sense. There is a wiring diagram that is wrong in one
place, and a predicate that is wrong in one way.

**The wiring.** `tools/gate.mjs:58` declares `{ name: "story-coverage", cmd: ["npm", "run",
"storybook:coverage"] }`. The lane's name and its command name two different scripts. The gate has
no mechanism that would catch this and should not grow one — a gate that validated its own lane
names against the scripts they run would be a fourth instrument to keep honest. The fix is to make
the two names agree and to make the pair distinguishable in `package.json`, so the next reader does
not have to hold `story:` versus `storybook:` in their head.

**The predicate.** `story-coverage.mjs` decides renderability with:

```js
const EXPORTED = /^export function ((?:create|render)\w+)\s*\(([^)]*)/gms;
```

then confirms the captured parameter list contains `HTMLElement`, or names an options interface with
a `parent` member. The second half is the capability test and it is right. The first half is a name
filter that runs before it, so a module is only asked the capability question if it already passed a
naming convention.

Reversing the order is the whole change: match any `export function`, then apply the existing
parameter test unchanged. `createStarterViewConfig` — the case the current comment cites — is
excluded by the parameter test on its own, because it returns a config object and takes no parent.
That is worth verifying rather than assuming, and it is a task.

**Reproducing the blind set.** The count in `spec.md` §3 comes from this, and it should be re-run
rather than trusted:

```
node -e '
const {readdirSync,readFileSync}=require("fs");const {join}=require("path");
const V="src/views";
const files=readdirSync(V).filter(f=>f.endsWith(".ts")&&!f.endsWith(".test.ts")&&!f.endsWith(".stories.ts"));
const NAMED=/^export function ((?:create|render)\w+)\s*\(([^)]*)/gms;
const ANY=/^export function (\w+)\s*\(([^)]*)/gms;
for(const f of files){
  const s=readFileSync(join(V,f),"utf8");
  const named=[...s.matchAll(NAMED)].some(m=>m[2].includes("HTMLElement"));
  const any=[...s.matchAll(ANY)].filter(m=>m[2].includes("HTMLElement"));
  if(!named && any.length) console.log(f, "->", any.map(m=>m[1]).join(", "));
}'
```

**Why the allowlist is the pressure point.** The allowlist is the only sanctioned way to make this
gate green without writing a story, and it already holds seven entries whose reasons are specific and
checkable — a vault dependency, a `MarkdownRenderer` with no standalone build, a `ViewConfig` fixture
that would be larger than the component. Those seven set the standard. An entry reading "hard to
story" would pass the twelve-character length check the script applies and would defeat the purpose
entirely, and no automated check can tell the two apart. That is why each exemption is argued in
`tasks.md` under its own task rather than added in a batch.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Wire the check in, and let it go red

Add the story check to the gate as its own lane and give the shim check a name that describes it.
Disambiguate the two `package.json` script names in the same edit, so the pair cannot be confused
again.

Expect the gate to go red immediately, on `src/views/checkbox.ts`. **That red is the deliverable of
this phase**, not an obstacle to it. It is a defect that has been present and unreported since the
gate was written.

Resolve `checkbox.ts` on its merits: it is the control at the centre of `004`'s checkbox-ownership
work, so a story is the expected answer, but nobody has checked whether it renders standalone under
the catalogue stub. Check, then decide.

### Phase 2 — Widen the matcher, and prove it widened

Replace the name-and-parameter test with the parameter test alone. Before doing anything with the
result, run it against the tree as received and confirm it names all thirteen. A matcher that widens
without reporting anything new is a matcher that did not widen.

Then confirm the exclusion the old comment was protecting still holds: `createStarterViewConfig` and
its kind must stay out, excluded by the parameter test rather than by their names.

### Phase 3 — Discharge the thirteen, one at a time

Each module gets a story or a reasoned exemption, argued individually. The two that should be
resisted hardest as exemptions are `mobile-bottom-sheet.ts` and `popover-position.ts`: both paint
chrome, both are the subject of shipped phases in this program, and both are exactly what the
catalogue exists to hold.

The behaviour-only modules are the genuine question rather than the awkward one. `trapFocus`,
`setRovingTabindex` and `trackCellGesture` attach behaviour to an element that already exists. §12 of
`spec.md` leaves that open, and this phase does not close it by implication — it closes it by asking.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Negative control | The widened matcher, against the tree as received, must name all 13 | `story-coverage.mjs --json` |
| Regression | `createStarterViewConfig` and its kind stay out of the renderable set | `story-coverage.mjs --json`, read the list |
| Regression | The stale and unreasoned allowlist checks still fire | seed a stale entry, confirm exit 1, remove it |
| Integration | Both coverage lanes run in the gate and their exit codes are read | `npm run gate` |

The negative control is the only test here that can fail for an interesting reason, and it is the one
a hurried pass would skip. The pattern is the program's own: `020` proved its role check by swapping a
fixture's role and watching the old suite pass 3/3 while the new one failed. The same shape applies —
run the new matcher on the unmodified tree and require it to find what the old one could not.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| `tools/gate.mjs` | Internal | Green | The lane cannot be wired; the phase has no deliverable |
| `tools/storybook/story-coverage.mjs` | Internal | Green, exits 1 | None; its red is the starting condition |
| `tools/storybook/story-coverage-allowlist.json` | Internal | Green | None |
| Operator decision on the lane naming | External | **Open** | Phase 1 can proceed on either answer, but not on neither. `spec.md` §12 |

Nothing upstream. `020` is complete and this phase does not depend on it.

Nothing downstream waits on this phase. It removes a false green rather than unblocking a surface,
which is why it is P1 and not P0 despite being cheap.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the widened matcher proves unworkable — it demands stories across so much of
  `src/views` that the allowlist becomes the document rather than the exception.
- **Procedure**: revert the matcher to the name-and-parameter form. **Keep Phase 1.** The wiring fix
  stands on its own and is independent of the widening; reverting both because the second was
  unworkable would restore the false green this phase exists to remove.
- **Data reversal**: none. This phase writes no state and touches no product surface.

The staging exists for exactly this: Phase 1 is valuable alone, Phase 2 is reversible without it, and
Phase 3 cannot strand anything because a story is additive.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
operator answers the lane-naming question
                │
                ▼
Phase 1 wire the lane ──▶ checkbox.ts resolved ──▶ gate green again
                │
                ▼
Phase 2 widen the matcher ──▶ negative control names 13
                │
                ▼
Phase 3 discharge 13, one at a time ──▶ story or reasoned exemption
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Lane wiring | The naming decision | A gate lane that reads the story check's exit code | Everything; it is the deliverable |
| `checkbox.ts` | Lane wiring | The first honest green on this lane | Phase 2's baseline |
| Matcher widening | Phase 1 | 31+ modules in the renderable set | Phase 3 |
| Negative control | Matcher widening | Proof the widening reveals what it claims | Any completion claim about the matcher |
| The thirteen | Phase 2 | Stories or reasoned exemptions | Phase completion |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **The naming decision** - blocking, and it is an operator question rather than work.
2. **Phase 1, the lane wiring** - CRITICAL. Two lines, and the entire value of the phase.
3. **Phase 2's negative control** - CRITICAL. Without it the widening is asserted rather than shown.

**Total Critical Path**: decision → wire → widen → control. Phase 3's volume sits off the critical
path: each of the thirteen is independent of the others.

**Parallel Opportunities**:
- The blind-set inventory can be re-run at any point; it reads the tree and changes nothing.
- The thirteen can be discharged in any order, and by different hands.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | The gate reads the story check | A lane runs `story-coverage.mjs`; its red on `checkbox.ts` is visible in the gate output | End of Phase 1 |
| M2 | The gate is honestly green | C3 and C4: the story check exits 0 and the whole gate exits 0 | End of Phase 1 |
| M3 | The matcher is wider, and shown to be | C7: the widened matcher names all 13 against the tree as received | End of Phase 2 |
| M4 | The blind set is discharged | C5 and C6: 31+ renderable, 0 with neither a story nor a reason | End of Phase 3 |

<!-- /ANCHOR:milestones -->
---

## 11. L3: ARCHITECTURE DECISION RECORD

### ADR-001: Widen the matcher rather than rename the modules

**Status**: Proposed

**Context**: Thirteen modules build DOM under verbs the matcher does not recognise — `open*`,
`attach*`, `apply*`, `set*`, `track*`, `install*`, `place*`, `position*`, `capture*`. Renaming them to
`create*` or `render*` would make the existing matcher see them without touching the harness.

**Decision**: Widen the matcher. Do not rename the modules.

**Consequences**:
- The predicate matches the property that actually matters — takes a parent, builds into it — rather
  than a convention layered on top of it.
- `attachSheetDragToDismiss` keeps a name that describes what it does. `createSheetDragToDismiss`
  would be worse code written to satisfy an instrument.
- The renderable set roughly doubles, and the allowlist has to carry more weight. That is a real cost
  and it is the reason Phase 3 argues each entry rather than batching them.

**Alternatives Rejected**:
- *Rename the modules*: inverts the relationship between the product and the harness. This program's
  founding defect was trusting an instrument over the thing it measured; reshaping the thing to suit
  the instrument is the same error with the sign flipped.
- *Leave the matcher and only fix the wiring*: cheaper and genuinely valuable, which is why Phase 1
  stands alone in the rollback plan. But it would leave a gate that reports "0 uncovered" over 18 of
  31 modules — the same shape as the coverage defect `020` found, where "0 uncovered" was a statement
  about ten families rather than twelve.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] The operator has answered the lane-naming question in `spec.md` §12
- [ ] The blind-set inventory has been re-run on the current tree, not read from `spec.md`
- [ ] `node tools/storybook/story-coverage.mjs` has been run and its exit code read without a pipe
- [ ] The seven existing allowlist reasons have been read, so a new one can be held to them

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Wire before widening. A larger red that nobody reads is the state this phase inherited |
| TASK-EVIDENCE | A task closes on a command whose output and exit status were read, never on a file having been edited |
| TASK-CONTROL | The widened matcher is shown naming the thirteen before any of them is discharged |
| TASK-EXEMPT | An allowlist entry names the specific dependency that makes a story meaningless. "Hard to story" clears the length check and fails this rule |
| TASK-SCOPE | No `src/views` module is renamed or refactored to suit the matcher |
| TASK-HYGIENE | No spec paths, phase numbers or task ids in `tools/` or `src/`. The reason stays, the tracker id does not |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. A module discharged by exemption reports the reason it was
given, not just that it was exempted.

### Blocked Task Protocol

A task is BLOCKED when the naming decision has not been made, or when a module's exemption cannot be
argued on its merits. On BLOCK: record the blocker in `tasks.md` and stop that task. Do not add an
allowlist entry to unblock yourself — an unreasoned exemption is the one failure this phase can
produce that is worse than the defect it was opened to fix.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md)
- [`../spec.md`](../spec.md)
- [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md) — the six
  instruments repaired before this one was found
- [`../021-sheet-inline-edit-alignment/spec.md`](../021-sheet-inline-edit-alignment/spec.md) — the open
  `setPosition` defect, in one of the thirteen
