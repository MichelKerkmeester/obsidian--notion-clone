---
title: "Implementation Plan: Mobile Sheet Presentation"
description: "Approach, gates and rollback for the sheet portal, the single phone predicate, the presentation contract and the anchor lifetime fix."
trigger_phrases:
  - "003 mobile sheet plan"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Mobile Sheet Presentation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Ordered so the navbar hit test can be trusted before anything is portalled through it. Six stages:
give the harness a navbar, census by runtime instrumentation, collapse the two phone predicates into
one, define the presentation contract and portal the sheet, fix anchor lifetime, then prove it where
the user stands.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, read without a pipe |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction in count |
| Navbar hit test | browser harness, phone profile | `elementFromPoint` over the navbar band returns the sheet |
| Sheet geometry | browser harness | bottom offset `0px` for **both** mechanisms, not one |
| Anchor survival | browser harness | node identity unchanged, top edge moved `0px`, a later resize still repositions |
| Keyboard | browser harness | focused field inside the reduced `visualViewport` rect |
| Negative control | harness, per check | removing the navbar moves an asserted number by more than 1.35px |
| Captures | `npm run screenshots` then human review | phone captures taken **with a navbar**; diffs explained, not merely regenerated |
| Catalogue | `npm run story:smoke` | sheet states render at the production mount point |

Lint stays report-only at its existing baseline.

**Stage 1 is a gate, not a task.** If the harness cannot distinguish a navbar from no navbar, work
stops there.

### The `styles.css` lane — take, hold, release

`styles.css` is one serialized lane (parent `spec.md` §4). This packet is sixth in the order, after
`000`, `004`, `005`, `001` and `002`, and it is the riskiest change in the program: it moves
surfaces to a different place in the document.

| Moment | Rule |
|---|---|
| **Take** | Start of Phase 4 — the presentation contract and the scrim, the first stage that writes CSS. Not earlier: Phases 1 to 3 are harness, census and predicate work against an unedited stylesheet |
| **Hold** | Phases 4 and 5. No other phase may edit `styles.css` in that window |
| **Release** | Only after all four release conditions below, in order |

1. **Full recapture with a navbar present** — a condition no capture has ever had — then
   `npm run screenshots:verify` exit 0.
2. **Human capture review, signed off by name in `checklist.md`.** `screenshots:verify` proves a
   capture was regenerated after its hand-maintained source list changed and **never opens an
   image**. This matters more here than anywhere: `runtime-vars.css:43` pinned
   `--db-mobile-sheet-bottom` to `0px` for every capture ever taken, so no existing capture could
   have shown this defect and the reviewer has no prior image to compare against.
3. **`008`'s early replay re-asserts every previously-closed phase** — `000`, `004`, `005`, `001`
   and `002` — against the released tree. A portal changes stacking and containment for everything
   mounted near it, so this is a real risk here, not a formality. A phase that closed earlier and
   does not re-close now blocks this release.
4. **Cascade re-confirmation** — every duplicated selector this packet touched has its computed
   winner recorded; a changed winner carries a written disposition.

---

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**The fix is a portal, not a number.** A sheet inside `.note-database-container` loses the navbar hit
test at any z-index; the same node on `document.body` wins it. Phone sheets therefore mount on
`document.body`, which is why `000`'s token root is a hard prerequisite — a portalled node has no
ancestry to inherit tokens from.

**One predicate, one contract.** `isTouchDevice()` and `isMobileBottomSheet()` collapse into a single
exported predicate, so the 601-760px disagreement band cannot exist. Presentation is then resolved
once, declaring portal target, scrim, safe-area padding and keyboard behaviour, and both `DbModal`
and the positioner satisfy it — which is what gives `--db-mobile-sheet-bottom` one writer instead of
one writer and one silent fallback.

**Why the bounds branch is deleted rather than retuned.** The `is-phone` branch at
`popover-position.ts:289-294` works as written; it deliberately subtracts the navbar band from the
bottom bound. Its intent is wrong, so tuning its numbers would preserve the defect in a new shape.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Ordered so the navbar hit test can be trusted before anything is portalled through it. The portal is
the riskiest edit in the program; everything before Stage 4 exists to make its failure legible.

### Phase 1 — Give the harness a navbar

No product code changes. Add a `.mobile-navbar` and a real `--safe-area-inset-bottom` to the browser
harness, delete the hardcoded `--db-mobile-sheet-bottom` from `tools/screenshots/runtime-vars.css:43`,
and drive the real positioner in the phone checks instead of `applySheetChrome` alone. Land this
while the numbers are still red. Until removing the navbar moves an asserted number by more than
1.35px, no later claim in this spec means anything.

### Phase 2 — Census by runtime instrumentation

Open every sheet-capable surface on a phone profile — every positioner sheet, all 20 `DbModal`
subclasses, the 3 `FuzzySuggestModal` subclasses — and log portal parent, computed `bottom`, rect,
and whether the node **and its anchor** survive a field commit. Static grep cannot produce this list;
the modals are invisible to it and the anchor question is a runtime one. The delta against the static
list is the finding.

### Phase 3 — Collapse the two predicates into one

Replace `isTouchDevice()` (`src/data/touch-environment.ts:46-55`, threshold 760px) and
`isMobileBottomSheet()` (`src/views/popover-position.ts:299-304`, threshold 600px) with one exported
predicate. Do this before the portal: while two predicates disagree, a portal bug and a predicate bug
are indistinguishable. **Run AC-008's six-width band sweep — 600, 620, 660, 700, 720, 760 — before the
collapse as well as after**, or the fix has nothing to be measured against. Record which surfaces change classification in the 601-760px band — that is
the behavioural blast radius, and it is a number, not a guess.

### Phase 4 — Presentation contract, then the portal

**Takes the `styles.css` lane here.** The `is-phone` bounds branch may not be deleted until AC-007's
*before* table exists — every anchored popover the phone census reaches, sheet and non-sheet, with
its rect recorded against the visual viewport. The branch is shared, so an unmeasured deletion moves
non-sheet popovers on a phone too.

Define presentation once — portal target, scrim, safe-area padding, keyboard behaviour — and route
both `DbModal` and the positioner through it, so `--db-mobile-sheet-bottom` has one writer. Then
portal phone sheets to `document.body` and delete the `is-phone` bounds branch at
`popover-position.ts:289-294` outright, taking the hardcoded `50` at `:291` with it. Build the scrim
here: none exists today.

### Phase 5 — Anchor lifetime

Land whichever design the Stage 2 census showed to be cheaper: surgical `calendar` and `timeline`
cases in `updateCellDOM` (`src/views/database-view.ts:8597-8619`), or identity-based anchor
re-resolution in the positioner. Record the decision and its reason before writing the code. This
stage is non-negotiable — the spec does not close without it.

### Phase 6 — Prove it where the user stands

**Releases the `styles.css` lane here**, and only after the four release conditions in §2.

Hit test over the navbar band, geometry for both mechanisms, a `visualViewport` reduction standing in
for the keyboard, phone captures with a navbar present, and Storybook sheet states at the production
mount point.

---

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts:16`), so every DOM assertion —
hit test, geometry, keyboard — lives in `tools/storybook/verify-placement.mjs`, driving the real
positioner rather than `applySheetChrome` alone.

Stage 1 is a gate, not a task: until removing the navbar from the harness moves an asserted number by
more than the 1.35px fallback artefact, no later claim in this spec means anything. Every check is
demonstrated to fail before it is trusted, and the negative controls in `checklist.md` §2 are part of
the exit condition rather than an optional extra.

Phone captures are taken with a navbar present, which no capture has had, and closure requires the
operator confirming on a phone that the sheet covers the navigation bar.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`000-surface-contract-and-truthful-harness` is a hard prerequisite: `.db-surface` must be a token root
before a sheet can be portalled out of the container, and the Storybook stub repairs
(`tools/storybook/obsidian-stub.mjs:52-57`, `Modal` at `:90`, `FuzzySuggestModal` at `:80`) are
`000`'s work, not this phase's.

Sequenced after `002-properties-panel` so the factory has been exercised on desktop where debugging is
cheap. Blocks `006-record-open-target`, which needs this phase's phone presentation to answer where a
record opens on a phone.

Holds the serialized `styles.css` lane for the sheet, scrim and safe-area rules.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Each stage is separately revertable and lands as its own commit.

- Stage 1 touches only harness files; reverting restores the previous blind checks and changes no
  shipped behaviour.
- Stage 3 is a predicate substitution; reverting restores two predicates and the 601-760px
  disagreement band with them.
- Stage 4 is the portal. Reverting returns phone sheets to the container and restores the `is-phone`
  bounds branch, which is recorded verbatim in the census before deletion so restoration is a copy
  rather than a reconstruction.
- Stage 5 is independent of the portal in both designs and can be reverted alone.

**If the portalled sheet renders untokened, do not revert this spec.** That symptom is `000`'s token
root failing, and reverting the portal hides it rather than fixing it. Confirm `--db-radius-lg`
resolves non-empty on the portalled node first.

---

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 7A. DEPENDENCY GRAPH

```
Stage 1 harness navbar ──▶ Stage 2 runtime census ──▶ Stage 3 one predicate
                                                              │
                                              Stage 4 contract, portal, scrim
                                                              │
                                                     Stage 5 anchor lifetime
                                                              │
                                                        Stage 6 proof
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| Stage 1 harness navbar | `000` stub repairs for the catalogue work only | A harness that can distinguish a navbar from no navbar | Every later stage |
| Stage 2 runtime census | Stage 1 | Per-surface portal parent, computed `bottom`, rect, node and anchor survival; non-sheet popover bottom bounds | Stages 3, 4 and 5 |
| Stage 3 one predicate | Stage 2 | One exported phone predicate and the list of surfaces reclassified in the 601-760px band | Stage 4 |
| Stage 4 contract, portal, scrim | Stage 3, `000` token root | One writer for `--db-mobile-sheet-bottom`; body-mounted sheets; a full-viewport scrim | Stage 6 |
| Stage 5 anchor lifetime | Stage 2 census rows | A sheet that survives the rebuild that destroys its anchor | Closure |
| Stage 6 proof | Stages 4 and 5 | Hit test, geometry, keyboard assertions, captures with a navbar, catalogue states | Lane release |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 7B. CRITICAL PATH

1. **Stage 1 — harness navbar** - CRITICAL. Nothing later can be trusted until removing the navbar
   moves an asserted number by more than 1.35px.
2. **Stage 4 — contract, portal, scrim** - CRITICAL. This is the operator's reported defect, C1 and
   C2 both.
3. **Stage 5 — anchor lifetime** - CRITICAL and non-negotiable. The spec does not close without it.

**Total Critical Path**: Stage 1 → Stage 3 → Stage 4 → Stage 5. Stage 6 follows and gates the lane
release.

**Parallel Opportunities**:
- Stage 5 is independent of the portal in both of its designs and can be built alongside Stage 4 once
  the Stage-2 census rows exist.
- The non-sheet popover bounds recording (T9) can run during Stage 2 without waiting for Stage 3.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 7C. MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M1 | Harness can fail | Removing the navbar moves an asserted number by more than 1.35px; `runtime-vars.css` no longer pins `--db-mobile-sheet-bottom` | End of Stage 1 |
| M2 | Population known | Every positioner sheet, all 20 `DbModal` subclasses and all 3 `FuzzySuggestModal` subclasses have a census row, with node and anchor survival recorded | End of Stage 2 |
| M3 | One predicate | Both old symbols have zero callers; the reclassified 601-760px surfaces are named | End of Stage 3 |
| M4 | The sheet covers the navbar | C1 returns the sheet; C2 reads `0px` for both mechanisms; C5 scrim covers the navbar band | End of Stage 4 |
| M5 | The sheet survives editing | C3 holds after two consecutive field commits, and C4 keeps the focused field visible under a reduced `visualViewport` | End of Stage 5 |
| M6 | Proven where the user stands | Phone captures with a navbar reviewed by a human; operator confirms on a phone | End of Stage 6 |

<!-- /ANCHOR:milestones -->
---

## 8. RISK

**The `is-phone` bounds branch is shared.** `getVisiblePopoverBounds` serves every anchored popover,
not only sheets, so deleting the branch moves non-sheet popovers on a phone too. The census records
their current bottom bound so the blast radius is measured before the deletion, not discovered after
it.

**Two presentation mechanisms are being merged while one of them is being portalled.** If C2 stays
split after Stage 4, the fault is the contract, not the portal — the diagnostic is which code path
wrote `--db-mobile-sheet-bottom`, and after Stage 4 there must be exactly one.

**Storybook cannot see any of this until `000` lands.**
`tools/storybook/obsidian-stub.mjs:52-57` hardcodes `Platform` to desktop and `Modal` (`:90`) and
`FuzzySuggestModal` (`:80`) throw, so no touch path and no modal sheet renders. Stage 6's catalogue
work is blocked on those stub repairs and must not be substituted with a container-wrapped
approximation.

**This spec holds the serialized CSS lane** for the sheet, scrim and safe-area rules. No other spec
may hold `styles.css` concurrently, and this one ends with a full recapture and a human looking at
the changed PNGs.

---

## 9. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md` read for the measurement behind the task's requirement
- [ ] `000-surface-contract-and-truthful-harness` confirmed landed: `.db-surface` is a token root and
      the Storybook stub no longer forces desktop or throws on `Modal`
- [ ] Stage 1 has landed and the harness can distinguish a navbar from no navbar
- [ ] The Stage-2 census row for this task's surface exists, with node and anchor survival recorded
- [ ] The criterion's failing number is recorded before the fix lands

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Harness before census, census before predicate, predicate before portal, portal before proof. Stage 1 is a gate: if the harness cannot distinguish a navbar, work stops there |
| TASK-SCOPE | Phone sheet presentation, the shared bounds branch, the two predicates, the scrim and anchor lifetime. Desktop placement is `001`; the properties panel row grid is `002`; where a record opens is `006` |
| TASK-EVIDENCE | Every criterion task records the failing number before the change and the passing number after. A task closes on a number that was read or a command whose output and exit status were read |
| TASK-CSS | This phase holds `styles.css` for its sheet, scrim and safe-area rules; every landing ends in a full recapture and a human opening the changed PNGs |
| TASK-TOKENS | An untokened portalled sheet is `000`'s token root failing. Confirm `--db-radius-lg` resolves non-empty on the body-mounted node before reverting anything here |

### Status Reporting Format

Report per task: `TNN <status> — <failing number> -> <passing number>`, where status is one of
`complete`, `in progress`, `not started`, `blocked`. A criterion task with no failing number is
reported as `not started`, whatever its code state.

### Blocked Task Protocol

A task is BLOCKED when `000` has not landed, when Stage 1 has not made the harness honest, when its
census row is missing, when the CSS lane is held elsewhere, or when its failing number cannot be
measured. On BLOCK: record the blocker in `tasks.md`, stop that task, and never substitute a
container-wrapped approximation for a production-mount measurement. When a criterion fails twice
without a new hypothesis, open the standing research gate in `spec.md` §5A rather than retrying.

---

## 10. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)
