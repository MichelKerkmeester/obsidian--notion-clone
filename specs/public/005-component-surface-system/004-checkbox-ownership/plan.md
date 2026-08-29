---
title: "Implementation Plan: Checkbox Ownership"
description: "Approach, gates and rollback for the checkbox primitive, the census that must precede it, and the doctrine test this spec doubles as."
trigger_phrases:
  - "004 checkbox ownership plan"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Checkbox Ownership

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Small, visible, and deliberately first. This spec is also the program's method test: it runs
immediately after `000` so that if criteria written to the doctrine still let round checkboxes ship,
the program learns it in a week rather than after the overlay chain is built on the same assumption.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, read without a pipe |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction in count |
| Computed appearance | browser harness | `appearance: none` on every family, measured not declared |
| Set equality | browser harness | distinct radius and box-size values within a role has cardinality 1 |
| Mount-point parity | browser harness | identical appearance at all three mount points |
| State coverage | browser harness | four states x every family, each a measurable difference |
| Touch target | browser harness | at least 28x28 under a coarse pointer, every family |
| Third-party themes | browser harness | unchanged under three themes, one restyling native checkboxes |
| Captures | `npm run screenshots` then human review | every family in every state; diffs explained, not merely regenerated |
| Catalogue | `npm run story:smoke` | family-by-state matrix renders at production mount points |

Lint stays report-only at its existing baseline.

**Stage 2 is a gate, not a task.** No product code is written until the failing numbers are in the
checklist.

### The `styles.css` lane — take, hold, release

`styles.css` is one serialized lane (parent `spec.md` §4). This packet is second in the order,
immediately after `000`, and is the first phase to hold the lane once `000` releases it.

| Moment | Rule |
|---|---|
| **Take** | Start of Phase 3 — building the primitive, the first stage that writes CSS. Not earlier: Phases 1 and 2 join and record against an unedited stylesheet, and the pre-fix parent-class strips for AC-012a to AC-012e must be taken on the tree as `000` released it |
| **Hold** | Phases 3, 4 and 5. `005` unblocks from `000` on the same edge as this packet and also edits `styles.css`; the two are serialized by this rule and nothing else |
| **Release** | Only after all four release conditions below, in order |

1. **Full recapture** — every family in every state — then `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**. The operator's defect here is *visible shape*: a machine that never opens a picture
   cannot close it.
3. **`008`'s early replay re-asserts `000`** against the released tree. This is the program's first
   lane handoff and therefore the first real test of whether the replay works at all — treat a
   failure here as a finding about the replay as much as about this packet.
4. **Cascade re-confirmation** — four ancestor-scoped rules are being replaced by one unconditional
   rule, so the specificity landscape moves and a previously losing declaration can start winning.
   Every duplicated selector this packet touched has its computed winner recorded before and after.

---

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

`createCheckbox(parent, { role })`. Base appearance unconditional — `appearance: none` plus the
plugin's box, border, radius, background and check glyph, with no ancestor in the selector. `role`
picks from a fixed set of sizes and nothing else.

The alternatives are rejected in `spec.md` §4B: extending the working ancestor-scoped selector fixes
one family and leaves the mechanism intact; adding a thirteenth class does not change what the
cascade is keyed to; and a role that also picks visual treatment lets the families drift apart again
and makes B2 unenforceable.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1 — Join the two populations

Enumerate every `type: "checkbox"` creation site and every CSS rule that could style a checkbox, and
join them. Record per site: file and line, class or classlessness, the parent's class at creation
time, the winning selector, and the **computed** `appearance`, `border-radius` and box size at the
production mount point. The join is what surfaces `db-list-row-checkbox` — in source, styled by
nothing — and the ten classless inputs, five of which only work through their parent's class.

### Phase 2 — Record the failing numbers

Fill in the "today" column of every criterion before touching product code. B1's 1-of-12 is the
headline; B3's mount-point comparison and B6's hit-target measurement have never been taken at all.
A criterion whose failing value is not recorded is not accepted.

**This stage also runs the pre-fix half of the two-sided control for AC-012a to AC-012e** (review
findings F13 and F16): strip `db-select-inner` or `db-checkbox-cell` from each of the five wrappers
in the harness and record which computed value moved. A site where nothing moves has been measured
wrong, not found safe — investigate the measurement before proceeding. The provenance table in
`acceptance-criteria.md` names every blank cell this stage owes.

### Phase 3 — Build the primitive

**Takes the `styles.css` lane here.**

`createCheckbox(parent, { role })`. Base appearance unconditional — `appearance: none` plus the
plugin's box, border, radius, background and check glyph, with no ancestor in the selector. `role`
picks from a fixed set of sizes and nothing else.

### Phase 4 — Migrate every site the join found

Including the five classless inputs that currently work by accident. Those are migrated first, not
last: they are the ones a "fix what looks broken" pass would skip, and they are one wrapper change
away from joining the broken population.

**The five are AC-012a to AC-012e and each is migrated on its own row** (review finding F13):
`table-renderer.ts:514`, `:785`, `cell-renderer.ts:489`, `card-field-renderer.ts:184`,
`record-detail-panel.ts:339` — re-resolve them with `rg -n 'type: "checkbox"' src/views/` and read
the two lines above each hit. **No site may be migrated before its pre-fix parent-class strip has
been run and recorded in Phase 2.** Without that half, the post-fix "stripping the wrapper moves
nothing" result is unfalsifiable: a site that never depended on the wrapper looks identical to one
that was fixed.

### Phase 5 — States and touch targets

Checked, indeterminate, disabled and focus for every family. Hit target at least 28x28 under a coarse
pointer, decoupled from the visual box the role selects.

### Phase 6 — Prove it, including against themes the plugin does not control

**Releases the `styles.css` lane here**, and only after the four release conditions in §2.

Computed-appearance assertions per family, a Storybook family-by-state matrix, screenshots of every
family in every state, and three third-party themes with at least one that restyles native
checkboxes.

---

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts:16`), so every computed-appearance
assertion lives in `tools/storybook/verify-placement.mjs`, measured at the production mount point.
Computed, not declared — the whole defect is the gap between the two.

Stage 2 is a gate, not a task: no product code is written until every criterion's failing number is in
`checklist.md`. Each check is then demonstrated to fail before it is trusted, and the negative controls
in `checklist.md` §2 are part of the exit condition rather than an optional extra.

Three third-party themes, at least one restyling native checkboxes, decide B5. It cannot be inferred
from the default theme.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`000-surface-contract-and-truthful-harness` — the honest harness only, **not** the factory. A checkbox
is not a floating surface, so this spec takes no `openSurface()` dependency and stays off the overlay
critical path by design.

Blocks nothing. Successor `005-content-row-rhythm` needs only the same honest harness.

Holds the serialized `styles.css` lane for the checkbox rules while it runs.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Each stage lands as its own commit and is separately revertable.

- Stages 1 and 2 write documents only; there is nothing to roll back.
- Stage 3 adds the primitive alongside existing call sites, so it is inert until Stage 4 uses it.
- Stage 4 is the migration. Reverting restores the previous call sites, whose current classes and
  parent classes are recorded verbatim in the Stage 1 join, so restoration is a copy rather than an
  archaeology exercise.
- The CSS deletions are the only step that feels irreversible; every deleted rule is quoted in the
  join before removal.

If a third-party theme defeats the base appearance, **do not roll back R2 and reintroduce ancestor
scoping.** Record the theme, the winning selector and its specificity as a finding, and treat it as
input to the research gate.

---

<!-- /ANCHOR:rollback -->
---

## 8. RISK

**The failure mode here is incompleteness, not breakage.** Checkboxes have no layout dependents and
no persisted state. The realistic way this spec fails is by fixing eleven families and missing the
twelfth, which is a recognisable description of what already happened. B2's set-equality form exists
so an under-enumerated fix fails the criterion instead of passing it.

**The five accidentally-working classless inputs pass every check today.** A migration that trusts
appearance rather than the join will skip them.

**Specificity, not correctness, decides against a hostile theme.** R2 says the base rule carries no
ancestor, which also means it carries low specificity. The primitive must win on the merits of its
selector rather than by escalating to `!important` across the board — that path re-creates the
`!important` tail already documented in the stylesheet as a source of silent reversal.

**This spec holds the serialized `styles.css` lane** while it runs. No other spec may hold the file
concurrently, and this one ends with a full recapture and a human looking at the changed PNGs.

---

## 9. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md` read for the measurement behind the task's requirement
- [ ] `000` confirmed landed — the harness no longer wraps subjects in a token-supplying container by
      default
- [ ] The Stage-1 join row for this task's creation site exists, with the winning selector and the
      computed values recorded
- [ ] Every criterion's failing number is in `checklist.md` before any product code is written
- [ ] The serialized CSS lane is held by this phase

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Join before numbers, numbers before code, and the five accidentally-working classless inputs are migrated **first**, not last |
| TASK-SCOPE | Checkbox creation and appearance only. No `openSurface()` dependency may be introduced; content-row rhythm belongs to `005` |
| TASK-EVIDENCE | Every criterion task records the failing number before the change and the passing number after. Computed values, never declared ones |
| TASK-CSS | This phase holds `styles.css` for the checkbox rules; every deleted rule is quoted verbatim in the join before removal, and every landing ends in a full recapture and a human opening the changed PNGs |
| TASK-SPECIFICITY | The base rule wins on the merits of its selector. Escalating to `!important` across the board re-creates the documented source of silent reversal |

### Status Reporting Format

Report per task: `TNN <status> — <failing number> -> <passing number>`, where status is one of
`complete`, `in progress`, `not started`, `blocked`. A criterion task with no failing number is
reported as `not started`, whatever its code state.

### Blocked Task Protocol

A task is BLOCKED when `000` has not landed, when its join row is missing, when the CSS lane is held
elsewhere, or when its failing number cannot be measured. On BLOCK: record the blocker in `tasks.md`,
stop that task, and never substitute a class-name or call-count assertion for the blocked
measurement. If a third-party theme defeats the base appearance, record the theme, the winning
selector and its specificity as a finding — do not roll back REQ-002 and reintroduce ancestor scoping.
When a criterion fails twice without a new hypothesis, open the standing research gate in `spec.md`
§5A rather than retrying.

---

## 10. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)
