---
title: "Feature Specification: Component Surface System"
description: "Phase parent for the program that gives floating surfaces, sheets, checkboxes and content rows one architecture, one placement authority, and acceptance criteria measured where users actually see them."
trigger_phrases:
  - "component surface system"
  - "surface contract"
  - "dropdown design system"
  - "sheet overlay navbar"
  - "checkbox ownership"
  - "openSurface factory"
  - "005 component surface"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system"
    last_updated_at: "2026-08-29T14:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Program scaffolded from measured architecture findings; not started"
    next_safe_action: "Execute 000-surface-contract-and-truthful-harness; nothing else may start first"
    blockers: []
    key_files:
      - "spec.md"
      - "architecture-findings.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-parent"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Component Surface System

> Measured root causes, corrected inventory and the criteria doctrine live in
> [`architecture-findings.md`](architecture-findings.md). Child specs cite it; none restate it.
> **How to use the resulting component set-up — roles, mounts, widths, rows, sheets and checkboxes —
> is [`design-system.md`](design-system.md).** Read that before adding any surface.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

## 1. WHY THIS PROGRAM EXISTS

Release 1.3.1 fixed dropdowns, sheets, checkboxes and table rendering. Every gate passed. The
operator installed it and saw essentially no change, and the installed bundle was confirmed to
contain the code. The work was real; the outcomes were not.

The reason is architectural, not a collection of bugs. Design tokens are declared on nine
selectors; the surfaces that need them mount outside all nine. Every harness wraps its subject in
the one container that supplies those tokens, so no gate could ever show the defect. On top of
that, 87 selectors are declared twice and 124 property values are silently reversed by a later
block.

This program replaces per-instance patching with one contract, and replaces mechanism-based checks
with measurements taken where the user is standing.

---

## 2. SCOPE

Nine specs. Three of them were not on the original defect list and all three are mandatory: `000`
because four defects are one bug, `008` because no child phase can know a later stylesheet edit
preserved its result, and `009` because every gate so far has measured a reproduction of the product
rather than the product.

| Spec | Owns | Source defect |
|---|---|---|
| `000-surface-contract-and-truthful-harness` | `openSurface()`, the token root, honest harnesses | Foundation — four defects are this bug in different clothes |
| `001-overlay-placement-and-menu-language` | Placement contract, one row grammar, panel parity | Dropdowns misplaced and inconsistent |
| `002-properties-panel` | Row grid and information architecture | Properties panel clipped and oversized |
| `003-mobile-sheet-presentation` | Portal, one phone predicate, anchor lifetime | Sheets not overlaying the navbar; sheet glitches on edit |
| `004-checkbox-ownership` | One checkbox primitive, unconditional base appearance | Round checkboxes everywhere |
| `005-content-row-rhythm` | Intrinsic sizing for rows and the header rail | Ragged list rows; calendar bubbles overflowing |
| `006-record-open-target` | Where a record opens, and the setting for it | "Open" shows a peek card, not the page |
| `008-integration-and-release-observability` | The cross-phase replay, the release decision, and every compatibility retirement | Structural — `styles.css` is one serialized lane and every phase edits it in turn |
| `009-live-verification` | Driving and measuring the plugin inside the running Obsidian from a terminal | Structural — every harness measures a reproduction, not the app the operator installs |

**Out of scope.** Table render performance is already fixed and measured. Formula editor layout and
output number format remain on the earlier track.

---

## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder.
> All implementation details — plan, tasks, checklist, acceptance criteria, continuity — live inside
> the phase children. **Folder numbering is not the execution order.** The order is in §3.

| Phase | Folder | Focus | Status |
|---|---|---|---|
| 2 | `000-surface-contract-and-truthful-harness` | `openSurface()`, the token root, honest harnesses | Planned |
| 5 | `001-overlay-placement-and-menu-language` | Placement contract, one row grammar, panel parity | Planned |
| 6 | `002-properties-panel` | Row grid and information architecture | Planned |
| 7 | `003-mobile-sheet-presentation` | Portal, one phone predicate, anchor lifetime | Planned |
| 3 | `004-checkbox-ownership` | One checkbox primitive, unconditional base appearance | Planned |
| 4 | `005-content-row-rhythm` | Intrinsic sizing for rows and the header rail | Planned |
| 8 | `006-record-open-target` | Where a record opens, and the setting for it | Planned |
| 9 + early | `008-integration-and-release-observability` | Replay harness lands **before `001`** and runs at every lane handoff; the release decision and compatibility retirement stay last | Planned |
| 1 | `009-live-verification` | The independent instrument: drives and measures the plugin in the running Obsidian. Gates `000`'s harness-truth claims | Planned |
| — | `007-architecture-research` | Standing research run; not a program phase and not on the execution path | In progress |

### Phase Transition Rules

- Each phase MUST pass `validate.sh <child> --strict` independently before the next phase begins.
- The execution order is **009 → 000 → 004 → 005 → 001 → 002 → 003 → 006 → 008**, argued in §3.
  The folder numbers are identifiers, not sequence.
- **`009` moved to the front.** It was originally parallel and gating nothing. An independent review
  found that `000` repairs the harness and then measures its own work through it — the circularity
  that produced 1.3.1. The running app is the only instrument `000` cannot influence, so `009`
  stands the live probe up first and `000`'s harness claims are cross-checked against it. A harness
  number and a live number that disagree is a blocking failure.
- **`008` delivers its replay harness EARLY**, before `001`, and it runs at every lane handoff. The
  full release gate stays last. Previously `008` was the only cross-phase gate and did not exist
  until the end, so a later phase could silently reverse an earlier one for weeks undetected.
- **`008` re-runs every earlier phase's evidence after every later `styles.css` release.** A phase
  passing its own criteria is necessary and not sufficient; the lane is shared and later edits can
  reverse an earlier result with no compiler warning.
- **`009` runs in parallel and blocks nothing.** It makes each phase's operator review cheap enough
  to run per phase rather than once at the end.
- **Exactly one phase holds `styles.css` at a time** (§4). A phase releases the lane only after a full
  recapture and a human reviewing the changed PNGs.
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase.
- Run `validate.sh --recursive` on this parent to validate all phases as an integrated unit.

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|---|---|---|---|
| — | `009` | Nothing; it runs first | n/a |
| `009` | `000` | The live probe reproduces a defect we already know exists, measured in the running app | `009` live-probe criteria |
| `000` | `004` | Honest harness landed: a check fails when its subject is deleted, **and every harness number agrees with the live probe on the same surface** | `000` criteria A4, A5, A6 + the `009` cross-check |
| `004` | `005` | Checkbox criteria moved from their failing values; the doctrine verdict is recorded | `004` criteria B1-B6 and its §6 verdict |
| `005` | `001` | Sizing contract landed and the CSS lane released | `005` criteria A1-A7 |
| `000` | `001` | Factory and token root landed: a body-mounted surface carries its tokens; **the registry is complete** (source census equals runtime census) and **the anchor lease survives a wholesale refresh** | `000` criteria A1, A2, A7, plus registry equality and the anchor-lease criterion |
| `000` | `003` | **The `AnchorRef` lease is proven**, not merely implemented: a surface survives its anchor being destroyed and still repositions | `000`'s anchor-lease criterion, named explicitly because `003`'s sheet fix consumes it |
| `001` | `002` | Every surface goes through the factory; placement is resolved by role | `001` criteria A1-A7 |
| `002` | `003` | The factory has been shaken out on desktop where debugging is cheap | `002` criteria B1-B6 |
| `003` | `006` | Phone presentation exists, so "where does a record open on a phone" is answerable | `003` criteria C1-C6 |
| `006` | `008` | Every child phase has handed its matrix rows forward | each child's `acceptance-criteria.md` proof-tuple coverage filled |
| any | `008` | A phase releasing the `styles.css` lane triggers a cascade re-confirmation before the next phase takes it | `008` criteria G3 |
| `009` | any | The real-app probe is available, so an operator review names only what a machine cannot see | `009` criteria L1, L4 |

---

## 3. EXECUTION ORDER AND BLOCKING

```
009 live-verification ─▶ 000 surface-contract ──┬───────────────────────────────┐
  (the independent                              ├─▶ 004 checkboxes ─▶ 005 row-rhythm
   instrument)                                  │      (need the honest harness only)
                                                └─▶ 001 overlays ─▶ 002 properties ─▶ 003 sheets ─▶ 006 open-target
                                                                                          │
        008 handoff replay — built once 000's registry lands, runs at EVERY lane handoff ──┤
                                                                                          ▼
                                              008 release gate ─▶ retirement ─▶ release
```

**Order: 009 → 000 → 004 → 005 → 001 → 002 → 003 → 006 → 008.**

- **000 blocks everything.** 001, 002, 003 and 006 need the factory and the token root; 004 and 005
  need only the honest harness.
- **004 runs before 001 deliberately.** It is small and highly visible, and it validates the
  criteria doctrine cheaply. If checkboxes ship and circles remain, the method is wrong and the
  cost is a week rather than a quarter.
- **005 next**, while the overlay lane is free. It is the only work with no overlay dependency and
  will otherwise never be scheduled.
- **001 before 002:** once every surface goes through the factory, the properties panel is just
  another surface and only its row grid remains.
- **003 after 002:** the portal is the riskiest change, so it lands once the factory has been shaken
  out on desktop where debugging is cheap.
- **006 last of the defect phases:** it needs 003's phone presentation to answer where a record opens
  on a phone.
- **008 closes the program.** It is not a final screenshot collection: it replays every registered
  surface through its real producer, mount, environment and transition after the last stylesheet
  edit, and it is the only phase permitted to remove a compatibility path. No phase that authored a
  new path certifies the removal of the old one.
- **009 runs first and gates 000.** It builds the transport that drives and measures the plugin
  inside the running Obsidian. It cannot replace the browser harnesses — they are faster and
  CI-native — and it reaches the one coordinate they structurally cannot: the operator's real app,
  theme, plugin set and host chrome.

---

## 4. THE SERIALIZED CSS LANE

`styles.css` is 19,261 lines, must not be split, and all 196 captures fingerprint it. **Exactly one
spec may hold the file at a time.**

**This was a convention with no enforcement, and conventions do not survive autonomous execution.**
`004` and `005` both unblock after `000`, so a runner could edit a 19,000-line stylesheet twice
concurrently — producing merge conflicts at best and silent cascade reversals at worst, which is the
87-selector, 124-conflict pattern this program exists to remove. The lane is therefore **owned by a
recorded holder and enforced by a check**: a modification to `styles.css` by a phase that does not
hold the lane fails. `008` specifies the ownership file, the command and the failure mode.

Each spec that touches the file ends with a full recapture **and a recorded capture-review sign-off**
— per changed PNG, with a reviewer and a date. `screenshots:verify` only proves a capture was
regenerated after its hand-maintained source list changed; **it never opens an image**, so a lane
release gated on it alone certifies file existence, not visual correctness. That is precisely how
1.3.1's captures were regenerated while showing the wrong thing.

**At every lane handoff, `008`'s replay re-asserts every previously-closed phase's criteria against
the current tree.** A phase's evidence is valid only for the tree it was measured on.

---

## 5. EVERY SPEC CARRIES THESE PHASES

Beyond its own work, each child spec must contain:

1. **Exhaustive inventory before any change.** Enumerate every instance by the method its spec
   names — runtime instrumentation where static analysis provably misses cases. A sample is not an
   inventory.
2. **Architecture** — the variant mechanism, argued against the alternatives.
3. **Implementation.**
4. **Measured tests** in the browser harness. Vitest runs `environment: "node"` with no jsdom, so
   every DOM assertion lives in `tools/storybook/verify-placement.mjs` or its successor.
5. **Screenshots** across the widths and device profiles the spec names, ending in a human review.
6. **Storybook verification** at the production mount point, not inside a convenience wrapper.
7. **A standing research gate**, triggered when a criterion fails twice without a new hypothesis.
   Read AnyType and AppFlowy under `external/` for behaviour only — both are AGPL/source-available
   against this plugin's MIT, so never copy code, CSS values or token scales. Notion is the visual
   target and is not a source.

---

## 6. ACCEPTANCE CRITERIA DOCTRINE

A criterion is invalid unless it is measured on the real renderer at the production mount point,
expressed as a number or hit test with a threshold, **demonstrated to fail on the current tree
first with the failing number recorded**, and asserted by a harness that can distinguish — if
deleting the thing under test changes no asserted number, the check is theatre.

Class names and call counts are banned as criteria. Every one of 1.3.1's criteria was of that form,
and every one passed.


### The failing number is the gate, and it must exist before work starts

A criterion whose "today" cell is blank is **not a criterion** — it is an intention. Without the
before-number a passing measurement proves only that a value sits within a threshold, never that
anything changed. That is the class-name trap wearing a number.

Many criteria are currently marked *census* or *trace* because no runtime value exists yet. Each
must name **what produces its number and at which stage**, and **a phase may not move from Planned
to In Progress while any cell is blank.** `000` owns the checker that enforces this; it is not a
prose commitment.

### What the unit suite is, and is not

`vitest` runs `environment: "node"` with no jsdom, so all 410 tests exercise pure logic. **No
criterion in this program can be evidenced by them.** Every phase lists the suite as a quality gate,
and it is one — a regression guard against breaking what already works. It is not evidence that a
surface renders correctly, and a green suite must never be read as progress against a criterion.
---

## 7. DEFINITION OF DONE FOR THE PROGRAM

The program is complete when every child spec's criteria pass, **`008`'s replay is green from the
final state with every proof-tuple coordinate driven**, every compatibility path is retired against a
recorded parity trace or carries a written disposition, **and** the operator confirms on device that
each original defect is resolved. Gate passage alone has already been shown to be insufficient
evidence here, and does not close this program.

The doctrine each child applies is in `architecture-findings.md` §9 plus the five dimensions added
after it: semantic identity, transition trace, action outcome, resource ownership, and
negative-control mutation. A criterion satisfying only the original four can still be watching a
stale rectangle or the wrong logical row. Each child's `acceptance-criteria.md` carries the full
proof tuple — producer, runtime branch, mount/host, environment, transition, semantic outcome,
negative control — as a coverage table, and a blank cell blocks closure even when the number in it
would have been valid.
