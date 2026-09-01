---
title: "Implementation Plan: Surface Contract and Truthful Harness"
description: "Approach, gates and rollback for the typed handle that extends the existing ownership seam, the owned token boundary, the anchor lease, the cascade audit and the harness repairs every other spec depends on."
trigger_phrases:
  - "000 surface contract plan"
  - "migration order"
  - "compatibility gate"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Surface Contract and Truthful Harness

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Ordered so the harness can prove each later step, because the reason this program exists is that
the previous one could not. Eight stages: repair the harness honestly, **cross-check that repair
against an instrument this phase cannot edit**, declare and observe the surface registry, audit the
cascade by computed winner, introduce `openSurface()` **as an adapter over the paths that already
work**, give it a logical anchor lease, migrate the safest call-site families, then enforce.

**Stage 1.5 is new and it is the point of this revision.** Stages 2 onward previously trusted a
harness that Stage 1 had just rewritten — the phase repaired the instrument and then measured its own
work through it. `../009-live-verification` now runs before this phase and supplies the second
witness: the running Obsidian, read through the CLI's renderer `eval`, which nothing in this phase
can reach. Stage 1.5 pairs every Stage-1 harness number with the live number for the same surface. A
disagreement blocks; it does not get resolved by preference.

**Stage 1 has an internal order too**, and it is not cosmetic. The `verify-placement.mjs` assertion
that certifies the defect is corrected **first**, before the pinned harness variables, before the
navbar, before anything. It runs on every push today and it is the one repair whose absence blocks a
later phase outright.

**Nothing is deleted in this phase.** The program's removal step belongs to
`../008-integration-and-release-observability`, after the full integration replay. One capability
moves *into* this phase in the other direction: input-hash recording, previously `008`'s AC-010,
because evidence can only be content-addressed at the moment it is measured.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0 |
| Build | `npm run build` | exit 0 |
| Unit | `npx vitest run` | exit 0, no reduction in count |
| Surface geometry | `npm run storybook:placement` | all criteria, each with a recorded prior failure |
| **Live cross-check** | new runner over `../009-live-verification`'s probe | every reachable surface's harness number pairs with its live number and agrees; the uncorroborated set is written out |
| **Inversion guard** | new check | fails when `verify-placement.mjs`'s widthless-caller predicate returns to `wr.width > 320` |
| **Harness pinning scan** | new check | zero harness files assign a custom property the runtime also assigns |
| **Blank-cell checker** | new check | no phase moves `Planned` → `In Progress` with an empty *census*/*trace* "today" cell |
| **Checkbox-parent guard** | new check | the five borrowed-ancestor call sites still class their parents |
| Registry equality | browser harness | observed roots = registry entries; raw-mount control fails the run |
| Negative control | harness, per check | deletion **and** single-coordinate substitution each move an asserted value |
| Captures | `npm run screenshots` then human review | diffs explained, not merely regenerated; the fingerprint now covers the harness files, so a harness edit reports stale |
| Catalogue | `npm run story:smoke` | every story renders at its production mount point |
| Contract | new CI scan | **exits non-zero on a reintroduced bypass, then 0 once removed** — both statuses read, in that order |

Lint stays report-only at its existing baseline. Everything above is already wired into
`.github/workflows/gates.yml` except the six rows marked new, which this phase adds.

Exit statuses are read without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the
pipe's status, and this program has already lost time to that.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**A typed handle owned by the scope that already owns containment — not a second system beside it.**

The repository already contains two thirds of this contract, and the first version of this plan
missed it. `src/views/overlay-stack.ts` is a LIFO registry keyed on `panel.ownerDocument`, with one
capture-phase `keydown`/`pointerdown` pair per document, containment by
`panel.contains(target) || anchor?.contains(target)`, and focus restoration to the anchor. Its reach
is 25 call sites through the `installPopoverAutoClose` adapter (`src/views/popover-auto-close.ts:37`).
`src/views/interaction-scope.ts` adds what a portal needs: `ownsElement` resolves containment three
ways — `root.contains(target)`, any registered portal, and `portalSelectors.some(sel => target.closest(sel))` —
plus `addPortal`, `setPaused`, `restoreFocus` and a real `trapFocus`.

What is missing is not a listener system. It is **identity, mount policy, token ownership and anchor
lifetime**. So:

`openSurface(options)` returns a `SurfaceHandle`:

| Member | Purpose |
|---|---|
| `id`, `role` | Stable identity and a **declared** typed role. Not derived from a class string |
| `scope`, `dispose()` | The owning `InteractionScopeRegistry` entry and its teardown |
| `mount` | An explicit adapter: `local`, `bodyPortal`, `shadowRoot`, `topLayer` |
| `anchor` | A logical `AnchorRef` provider plus a replaceable current-node cache |
| `dismissal` | Policy and exclusivity/LIFO group, delegated to `overlayStack` |
| `tokens` | The owned token root and its snapshot version |
| `on(...)` | Lifecycle telemetry: open, reconcile, dismiss, close, owner teardown |

**Three boundaries the handle owns that nothing owns today.**

*Token boundary.* A portalled surface cannot inherit declarations that exist only under
`.note-database-container`. `.db-surface` joins the token-root selector list (`styles.css:19-27`),
**and** the adapter copies a versioned snapshot of the resolved contract onto the surface root:
semantic background and foreground, border, shadow, radius, density, layer, environment insets. It
writes nothing to `body`, `documentElement` or an Obsidian ancestor. A snapshot is safer than
inheriting arbitrary host variables because it makes the plugin/host boundary explicit and cannot
pollute the host; a theme change refreshes it for every open surface.

*Mount boundary.* Each mode has a different platform contract, so each is an adapter rather than a
flag. `local` needs a local root, owner and anchor. `bodyPortal` needs the surface root plus the token
snapshot, because ancestry custom properties and host selectors disappear. `shadowRoot` needs owned
style delivery whose lifetime follows the adapter — a globally referenced stylesheet would make
teardown and theme refresh ambiguous. `topLayer` changes stacking, light-dismiss, focus and event
semantics at once and is therefore **opt-in per role with its own proof**, never selected because the
browser supports the API.

*Anchor boundary.* A renderer refresh replaces the DOM node while the logical row, cell or event
survives. `AnchorRef` therefore carries logical scope, row path / cell key / event key, role and any
stable record identity; the node is a render-epoch cache re-resolved at each renderer commit. States:
`open → anchored(A) → anchor-missing(pending) → anchored(B) → close`, with a bounded pending window.
Retaining the last rectangle indefinitely is worse than closing, because it leaves an
actionable-looking surface pointing at nothing.

**Why not the alternatives.**

*A parallel global listener system.* Rejected: `overlayStack` and `interaction-scope` already
participate in portal containment and dismissal, and duplicating them is the migration risk, not the
migration. `createOwnedMenu`'s private capture-phase pair (`src/views/owned-menu.ts:138-139`) is the
existing example of exactly that mistake — 10 production menus dismiss through a stack the other 25
popovers know nothing about — and this phase retires it rather than adding a third.

*Parent-selector identity.* Today's behaviour and the documented trap: a row does not lay itself out,
`display: flex` lives on `.db-owned-menu .db-menu-item` (`styles.css:258`). It cannot survive the
portal `003` requires and it cannot express declared intent. Parent selectors may remain as
compatibility **inputs** with a removal plan; letting both remain authoritative produces contradictory
styling as the factory scales.

*Blind global replacement of legacy callers.* Rejected: it removes compatibility before mount, role
and lifecycle parity is established. Hence REQ-011 and the order in §4.

*Grep or AST as the inventory authority.* Rejected: construction is distributed across factories,
callback-time branches and dynamic host selection (`src/views/dropdown-field.ts:187-195`, `:379-389`).
AST discovery stays a source projection; the typed registry plus the runtime birth observer is the
authority, and every difference between them carries an explicit disposition.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### The program's migration order, and which phase owns each step

The safe order for the whole program is nine steps. This phase owns steps 0-3 and the body-portal
half of step 6; the rest are named here so no later phase invents its own sequence.

| Step | What | Owner |
|---|---|---|
| 0 | Register every production affordance — role, producer, host, mount, anchor key / pointer origin, dismissal owner, token root, evidence status. Instrument the factory boundary **before** removing anything | `000` Stage 2 |
| 1 | Add `openSurface()` as an **adapter over** `positionToolbarPopover` and `OwnedMenuHandle`. Preserve legacy geometry, classes, selectors, interaction-scope portals and menu handles. Register lifecycle once | `000` Stage 4 |
| 2 | Migrate the three no-option positioner paths first — declared role, width policy, logical anchor, old placement retained behind the adapter | `000` Stage 6 |
| 3 | Migrate the compact toolbar / view-config family as explicit typed entries, not a textual signature rewrite | `000` Stage 6 |
| 4 | Migrate bespoke callers by mount/anchor family: toolbar / calendar / chart; cell / date / dropdown / option / colour / icon; record / database / embedded; then column-menu subpopovers | `001` |
| 5 | Migrate owned menus in families — row menus before calendar/timeline and database/embedded context menus, nested column menus last — keeping one dismissal / focus / LIFO owner throughout | `001` |
| 6 | Enable body-portal token roots, then shadow-root delivery; keep top-layer opt-in and its fallback separate | body portal: `000` Stage 4 · shadow and top layer: `008` |
| 7 | Migrate sheet-capable surfaces **only after** portal tokens, menu ownership, logical anchors and host-chrome fixtures pass, including visual viewport, navbar, scrim, keyboard, scroll and refresh/rebind traces | `003` |
| 8 | Remove compatibility paths one disposition at a time, only after the full integration replay, source/runtime registry equality, capture review and device/operator review pass. Restore the byte-exact checkpoint on any regression | `008` |

This order minimises simultaneous changes in the serialized stylesheet lane. It is **not a proof**
until every gate has a production-mount replay and the earlier gates are rerun after later CSS
changes — which is `008`'s whole reason to exist.

### Phase 0 — Confirm the second instrument exists

`../009-live-verification` runs before this phase. Confirm its transport proof has passed and its
baseline probe run is recorded, because Stage 1.5 has nothing to compare against otherwise. If `009`
stopped at its own stop condition — the transport could not return a real computed value — record
that, and every harness claim in this phase carries an explicit *uncorroborated* label instead of a
pair. Proceeding without noticing is the failure this ordering exists to prevent.

### Phase 1 — Make the harness honest, before changing any product code

Nothing here alters product behaviour, so it can land while the numbers are still red — and it must,
because every subsequent claim depends on the harness being able to fail. **The order inside this
stage is load-bearing.**

**1a. Invert the widthless-caller assertion first.** `tools/storybook/verify-placement.mjs:164-171`
asserts `wr.width > 320` and names it *"widthless caller still defaults wide (preset is the fix, not
a global change)"*. It runs on every push through `.github/workflows/gates.yml:67` (step *Popover and
sheet geometry* → `npm run storybook:placement`). Left alone it turns CI red the day `001` fixes the
defect, and the cheapest reading of a red pipeline is to revert the fix.

*Rebase risk, stated because it is the realistic failure.* This is a four-line change in a file that
`001`, `002`, `003` and `005` all edit later. A rebase, a cherry-pick or a conflict resolved toward
`main` restores the old predicate silently and CI goes green on the defect again. The inversion
therefore ships **with a guard that fails when the old predicate returns**, and that guard is
demonstrated failing against the pre-inversion file before it is trusted. Confirm the guard survives
by rebasing the branch onto `main` once and rerunning it.

**1b. Load `styles.css` on the desktop page, and prove it mattered.** `:220` is the only
`addStyleTag` for the stylesheet and it targets the phone page; the desktop checks at `:130-178` run
against a document with no cascade. Add the desktop load — then **record at least one desktop
measurement that changes because of it, before and after**. If nothing moves, the desktop checks were
never touching the cascade and the repair is bigger than a stylesheet load; that is a finding, and it
lands here rather than at release.

**1c. Remove all four pinned runtime values from `tools/screenshots/runtime-vars.css`**, before any
baseline is recorded — every later phase measures against the baseline this stage produces, so a
pinned value here is inherited by the whole program:

| Variable | Line | Why it is wrong |
|---|---|---|
| `--db-mobile-sheet-bottom` | `:43` | computed at `src/views/popover-position.ts:115`; pinning `0px` pins the sheet defect to its correct answer |
| `--db-header-height` | `:24` | never assigned in `src/` at all; the sole consumer `styles.css:17698` takes its `34px` fallback in production, so `40px` is a value the product never produces |
| `--db-card-field-width` | `:29` | set conditionally at `src/views/card-field-renderer.ts:108`; pinning it means the unset branch is never rendered |
| `--db-timeline-row` | `:63` | a **type error**: the runtime assigns a unitless grid line index (`src/views/calendar-timeline-renderer.ts:588`, `:660`) and `styles.css:16316`/`:16554` read it as `grid-row: var(--db-timeline-row, 1)`. `34px` is invalid, so every timeline capture ever taken shows a fallback layout |

Then add the general scan: **no harness file may assign a custom property the runtime also assigns.**
Four known violations are its first fixtures; the scan is what stops a fifth.

**1d. Extend the capture fingerprint.** `tools/screenshots/capture.mjs:205` fingerprints
`[...scenario.sources, "styles.css"]`. Add `tools/screenshots/runtime-vars.css`,
`.storybook/preview.ts` and `tools/storybook/verify-placement.mjs`, so a harness change that alters
what every capture shows forces a recapture instead of passing silently.

**1e. The remaining repairs.** Add `.mobile-navbar` and a safe-area inset; give the phone checks a
real positioner call; unblock `Platform` and `Modal` in the Storybook stub; re-mount stories at
production positions.

**1f. Stand up the three checkers this phase owns for the program:** the input-hash recorder
(REQ-016), the blank-cell checker (REQ-019) and the checkbox-parent guard (REQ-017). All three are
small and all three are worth more before the measurements start than after.

### Phase 1.5 — Cross-check the repair against the running app

The stage that makes the rest of this phase trustworthy. For every surface `009`'s probe can reach,
run both instruments against the same tree and record the pair. **They must agree within the
criterion's own threshold.**

A disagreement fails the stage. It is not resolved by preferring the live number, and not by
preferring the harness: the harness can be blind and the probe can be measuring the wrong node, and
the point is to find out which. The investigation is recorded and its conclusion names the instrument
that was wrong.

Where the probe structurally cannot reach — a phone-only branch, a CI-only context, a surface with no
production trigger in the testbed — the surface goes on an **uncorroborated list with its reason**.
That list is an exit artefact of this stage. A surface that is simply absent from both the pairs and
the uncorroborated list means the cross-check was incomplete, not that the surface was fine.

### Phase 2 — Declare the registry, then observe it

Migration step 0. Declare every production affordance in the typed registry, then instrument: a
temporary shim over `createDiv` plus a development-build birth observer log class, mount parent,
resolved tokens, rect, registry id, role, producer, owner, document and terminal event for every
surface created while a script drives the plugin through every surface. **The delta between that log
and the static grep is the deliverable** — those are the surfaces nobody knew existed. Reconciliation
is an equality, and a deliberate raw-mount control must fail it.

Registry equality is an **exit criterion of this phase, consumed by `001`**, which migrates surfaces
against it. It is not tradable for the earlier A1/A2/A7 subset at the `000` → `001` handoff: starting
`001` against an incomplete registry defers the discovery to `008`, which is weeks later and one
integration replay too late.

Every number this stage records goes through the input-hash recorder from Stage 1f, so a later reader
can tell which tree produced it.

### Phase 3 — Cascade audit by computed winner

Classify all 87 duplicated selectors and 124 overridden values as intentional context variant,
canonical duplicate, dead rule, or unknown — where **unknown blocks release** rather than defaulting
to the last declaration. Classification is by replaying the computed winner at real production
mounts, per theme and per media context, not by reading source order. This is reading, not editing,
and it produces the list `008` deletes from.

### Phase 4 — `openSurface()` as an adapter, plus the token boundary

Migration step 1 and the body-portal half of step 6. Introduce the handle **over** the existing
paths: `positionToolbarPopover` remains the placement implementation, `OwnedMenuHandle` remains the
menu implementation, `overlayStack` and `InteractionScopeRegistry` remain the owners. Add
`.db-surface` to the token-root selector list at `styles.css:19-27` and implement the owned snapshot
for `bodyPortal`. Retire `createOwnedMenu`'s private listener pair onto the shared owner. At this
point both creation paths work and A1, A2 and the owner count should already move.

### Phase 5 — The anchor lease

Implement `AnchorRef` and the four-state machine with its bounded pending window, re-resolving at
renderer commit. `003` depends on this and cannot be built safely without it; building it here keeps
the riskiest phase from also owning the newest abstraction.

The lease is an **exit criterion of this phase, consumed by `003`**, and it is proven rather than
merely implemented: a surface survives its anchor being destroyed by a wholesale `refresh()` and
still repositions on the next resize. The `000` → `003` handoff names it explicitly, because a
partial lease that satisfies A1/A2/A7 would otherwise hand `003` a foundation it discovers is hollow
after committing to it.

### Phase 6 — Migrate the two safest families, and re-run the census

Migration steps 2 and 3. The three no-option positioner paths first — `src/views/filter-panel-renderer.ts:213`,
`src/views/sort-panel-renderer.ts:90`, `src/views/column-manager-renderer.ts:134` — each gaining a
declared role, width policy and logical anchor while the old placement stays behind the adapter. Then
the 15 compact-preset sites in `toolbar-renderer.ts` and `view-config-panel-renderer.ts` as explicit
typed entries. Re-run the Stage-2 census and require registry equality before Stage 7.

**No deletions.** The bespoke families, the owned-menu families and every compatibility path are
`001`'s and `008`'s.

### Phase 7 — Enforce

CI scan fails when a floating surface is created outside the factory; the birth observer fails the
suite on a raw mount.

**Both are accepted on behaviour, never on existence.** The sequence is: reintroduce a bypass, run
the scan, read a non-zero exit; remove the bypass, rerun, read exit 0. In that order, both statuses
read without a pipe. "The CI check is wired up" is a mechanism claim of exactly the shape every one
of 1.3.1's criteria had, and every one of those passed.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts:16`), so no DOM assertion can
live in the unit suite. Every geometry, token, ownership and lifecycle measurement runs in the
browser harness, at both mount points, with the navbar and safe-area present. Node and vitest remain
correct for the pure contract logic — the role union, the registry reconciliation function, the
anchor state machine's transitions — and nothing else.

Each check is trusted only after its negative control, and there are now two kinds. **Deletion**:
removing the subject from the harness DOM must change an asserted number. **Substitution**: changing
exactly one coordinate of the proof tuple — producer, runtime branch, mount/host, environment,
transition, semantic identity — must fail a value assertion. A check that survives either is theatre
and is rewritten, not recorded.

Every test must drive a **real producer**, assert the expected mount and role, mutate the relevant
environment or lifecycle, re-resolve the semantic target, perform the user action, and verify focus
and cleanup. A number taken from a single static frame is not evidence for a stateful surface.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

**Upstream: `../009-live-verification`.** Its transport proof and baseline probe run are what Stage
1.5 compares against. This is a real dependency, not a courtesy: without it the phase repairs the
instrument and then measures its own work through it, which is the circularity that produced 1.3.1.
If `009` closed at its stop condition, this phase still runs — but every harness claim carries an
explicit *uncorroborated* label and the parent's `009` → `000` handoff row records why.

Downstream, this phase blocks every other spec in the program: `001`, `002`, `003` and `006` need the
handle, the token boundary and the anchor lease; `004` and `005` need only the honest harness. Two
of its criteria are named exit gates with named consumers:

| Exit criterion | Consumer | Why it cannot be traded away |
|---|---|---|
| Registry equality (A8) | `001` | `001` migrates surfaces against the registry; an incomplete one defers the discovery to `008` |
| `AnchorRef` lease proven (A9) | `003` | `003`'s sheet fix is built on the lease; a partial implementation is discovered after `003` has committed to it |

It hands two obligations forward: `../008-integration-and-release-observability` replays this phase's
whole matrix after every later stylesheet lane holder and owns the removal of every compatibility
path. This phase is not complete in the program's sense until `008` is green, and it says so rather
than pretending a locally green harness settles it.

One obligation moves the other way. **Input-hash recording, previously `008`'s AC-010, is owned
here.** Evidence can only be content-addressed at the moment it is measured; reconstructing the
vintage of a green result afterwards is archaeology, and `008` is already the most loaded phase in
the program. `008` consumes the hashes for its temporal-validity gate rather than inventing the
capability last.

It holds the serialized `styles.css` lane alone. No sibling phase may touch the file until the full
recapture and human review are complete.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Each stage is separately revertable and lands as its own commit. A byte-exact checkpoint of
`styles.css` is taken before the lane opens and is retired only when `008` is green.

- Stage 1 touches only harness files; reverting restores the previous (blind) checks.
- Stage 4's token-root line is one line; reverting it returns surfaces to ancestry-derived tokens.
  The owned snapshot reverts with it.
- Stage 4's listener retirement is the riskiest reversible step: reverting restores
  `owned-menu.ts`'s private pair, which is worse but known.
- Stage 6 changes call sites only, behind an adapter that preserves the old geometry; reverting a
  family is a per-file revert.

If the token root causes unexpected leakage into the host app, revert Stage 4 and Stage 5 together;
the handle can stand without the token root while the scoping is reworked.

**Nothing in this phase deletes CSS**, so the archaeology risk that made the previous plan's Stage 5
irreversible-feeling has moved to `008`, where the integration replay can catch it.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:dependency-graph -->
## 8. L3: DEPENDENCY GRAPH

```
009 live probe (predecessor) ──▶ Stage 0 confirm the instrument
                                        │
                    Stage 1 honest harness (1a invert ▸ 1b desktop CSS ▸ 1c four pinned vars
                                        │              ▸ 1d fingerprint ▸ 1e navbar/stub/stories
                                        │              ▸ 1f hashes, blank-cell, checkbox guard)
                                        │
                    Stage 1.5 live cross-check ◀── 009's recorded probe run
                                        │
                    Stage 2 registry + census ──▶ Stage 3 cascade audit
                                        │                          │
                                        └──▶ Stage 4 handle + token boundary ◀┘
                                                       │
                                             Stage 5 anchor lease
                                                       │
                                             Stage 6 migrate 2 families, re-census
                                                       │
                                             Stage 7 enforce
                                                       │
                                          ▶ 008 integration replay, then removal
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|---|---|---|---|
| `009` live probe | A running Obsidian | The independent instrument and its baseline run | Stage 1.5, and this phase's right to trust a harness number |
| Stage 0 confirm instrument | `009` | Either a usable baseline, or a recorded reason every claim is uncorroborated | Stage 1.5 |
| Stage 1 honest harness | None | Checks that can fail; A4/A5/A6/A12/A13/A14/A15 measurable; the defect-certifying assertion inverted and guarded; four pinned values gone; the fingerprint covering the harness; the three program checkers standing | Every later stage, and phases `004`/`005` |
| Stage 1.5 live cross-check | Stage 1, `009` | Harness/live pairs per surface; the uncorroborated list with reasons | Stage 2 onward — no later stage trusts a harness number before this passes |
| Stage 2 registry + census | Stage 1.5 | The typed registry, the birth observer, the named list of surfaces static analysis missed, and the checkbox-parent guard in force | Stage 4, Stage 6 migration set, **and `001` via registry equality** |
| Stage 3 cascade audit | None (reading only) | 87 selectors classified by computed winner; the unknown set named | `008` deletions |
| Stage 4 handle + token boundary | Stages 1-3 | `openSurface()`, `SurfaceHandle`, `.db-surface` in the token root, the owned snapshot, one dismissal owner | Stage 5, Stage 6, and phases `001`/`002`/`003`/`006` |
| Stage 5 anchor lease | Stage 4 | `AnchorRef` and the four-state machine, **proven under a wholesale refresh** | `003` via the named lease handoff, and `006` |
| Stage 6 migrate + re-census | Stages 4-5 | Registry equality across the no-option and compact families | Stage 7 |
| Stage 7 enforce | Stage 6 | CI scan and birth-observer enforcement of REQ-001, each demonstrated failing then passing | Release of the CSS lane |
| `008` integration replay | This phase and every sibling | Cross-phase evidence; compatibility removal; temporal validity **on this phase's input hashes** | Program release |

<!-- /ANCHOR:dependency-graph -->
---

<!-- ANCHOR:critical-path -->
## 9. L3: CRITICAL PATH

1. **Stage 1a — invert the defect-certifying assertion** - CRITICAL and first. It runs on every push,
   it blocks `001` outright, and every hour it stays green is an hour CI is arguing for the defect.
2. **Stage 1 — the rest of the honest harness** - CRITICAL. Nothing later can be trusted until a
   check can fail, and the four pinned values must be gone before the program's baseline is recorded.
3. **Stage 1.5 — live cross-check** - CRITICAL. This is the independent instrument. Without it the
   phase certifies its own repair, which is the failure mode the whole program exists to remove.
4. **Stage 4 — handle and token boundary** - CRITICAL. Four defects across the program are this one
   selector-list line plus one creation path plus one dismissal owner.
5. **Stage 5 — anchor lease** - CRITICAL for `003`. The sheet glitch cannot be fixed durably without
   it, and `003` should not be the phase that invents it.
6. **Stage 6 — migrate the safe families** - CRITICAL for registry equality, which Stage 7 enforces
   and `001` consumes.

**Total Critical Path**: Stage 1a → Stage 1 → Stage 1.5 → Stage 4 → Stage 5 → Stage 6. Stage 7
follows but blocks only the lane release.

**Parallel Opportunities**:
- Stage 2 (census) and Stage 3 (cascade audit) can run simultaneously — the audit is reading only.
- Sibling phases `004` and `005` unblock at the end of Stage 1.5, not Stage 1. They need a harness
  that has been confirmed against the live app, not merely one that has been rewritten.

<!-- /ANCHOR:critical-path -->
---

<!-- ANCHOR:milestones -->
## 10. L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|---|---|---|---|
| M0 | CI stops arguing for the defect | A12: CI fails on the old `wr.width > 320` predicate and passes on the inverted one; the guard survives a rebase onto `main` | End of Stage 1a |
| M1 | Harness can fail, and nothing in it is pinned | A4 moves a material amount when `.mobile-navbar` is removed; A5 shows all four named values gone; A13 records a desktop measurement that moved because the stylesheet loaded; A14's scan finds no pinned property; A15 shows all three harness files now force a recapture | End of Stage 1 |
| M1.5 | The repair has a second witness | A11: every reachable surface has a harness/live pair and they agree; the uncorroborated list is written with a reason per entry | End of Stage 1.5 |
| M2 | Inventory known and declared | The census delta names every surface static analysis missed; registry equality runs and the raw-mount control fails it; all 87 duplicated selectors classified with the unknown set named; A17's checkbox-parent guard fails when one of the five parents is unclassed | End of Stage 3 |
| M3 | Tokens follow the surface, one owner dismisses it | A1 at 0 differ, A2 at 0 empty at the production mount point; exactly one dismissal owner per surface; zero plugin variables on host roots | End of Stage 4 |
| M4 | A surface survives its view | A9: an open surface re-anchors after a wholesale refresh and still repositions on resize | End of Stage 5 |
| M5 | Registry equality across the migrated families | Census rerun shows the three no-option and 15 compact sites registered and birthing exactly one root each | End of Stage 6 |
| M6 | Contract enforced | A7 and A10: the scan and the birth observer each **exit non-zero on a deliberately reintroduced violation and exit 0 once it is removed**, both statuses read in that order; CSS lane released | End of Stage 7 |

<!-- /ANCHOR:milestones -->
---

## 11. RISK

**The stylesheet has a documented history of reversing itself.** This phase therefore deletes
nothing. Stage 3 classifies and records; `008` deletes, after the replay that can tell a dead block
from a live one.

**The token root touches every surface simultaneously.** That is intentional — the alternative is a
per-surface migration that would leave the two-population problem in place for months — but it is why
this spec holds the CSS lane alone and why Stage 1 comes first.

**Two ownership systems already exist.** The failure mode of this phase is producing a third. Stage 4
is the moment that risk is live, and AC-011's owner count is the check that catches it.

---

## 12. AI EXECUTION PROTOCOL

### Pre-Task Checklist

- [ ] `../architecture-findings.md` read for the measurement behind the task's requirement
- [ ] `009`'s baseline probe run exists, or the task's claim is labelled uncorroborated
- [ ] The stage's predecessor stage landed and its evidence recorded
- [ ] The CSS lane is held by this phase, if the task touches `styles.css`
- [ ] Both negative controls for the task's check identified before the check is written — the
      deletion and the single-coordinate substitution
- [ ] Every citation the task adds names a selector or symbol plus the command that finds it, not a
      bare line number in a file this program edits
- [ ] The task does not delete a compatibility path; that is `008`'s

### Execution Rules

| Rule | Requirement |
|---|---|
| TASK-SEQ | Stages run in order 1 to 7, and Stage 1's internal order 1a to 1f is binding: the assertion inversion precedes everything |
| TASK-CROSSCHECK | No stage after 1.5 records a harness number as evidence until that number has been paired with `009`'s live number, or the surface is on the uncorroborated list with a reason |
| TASK-SCOPE | Only files named in `spec.md` §3 or produced by the Stage-2 census. No adjacent cleanup |
| TASK-EVIDENCE | A task closes only on a number that was read or a command whose output and exit status were read, and the recorded value carries its input hashes |
| TASK-CSS | One phase holds `styles.css` at a time; every CSS change ends in a full recapture and a human looking at the changed PNGs |
| TASK-NEGATIVE | No assertion is recorded as passing until it has been demonstrated failing, by deletion and by substitution. A check asserted to *exist* is not a check |
| TASK-CITE | A citation to a file this program edits names the selector or symbol plus the grep that finds it. Bare line numbers already recorded as measurements stay verbatim |
| TASK-COMPAT | Legacy geometry, classes, selectors, portals and menu handles are preserved behind the adapter until `008` |

### Status Reporting Format

Report per task: `T-NNN <status> — <evidence read>`, where status is one of `complete`,
`in progress`, `not started`, `blocked`. Evidence names the number read or the command whose exit
status was read. "Looks right" is not a status.

### Blocked Task Protocol

A task is BLOCKED when its measurement cannot be taken, its predecessor stage has not landed, or the
CSS lane is held elsewhere. On BLOCK: record the blocker in `tasks.md`, stop that task, and do not
substitute a mechanism-based check for the blocked measurement. If a criterion fails twice without a
new hypothesis, open the standing research gate in `spec.md` §5 rather than retrying.

---

## 13. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md) · [`../design-system.md`](../design-system.md)
- [`../adversarial-review.md`](../adversarial-review.md) — the review this plan's Stage 0, Stage 1a and Stage 1.5 answer
- [`../009-live-verification/spec.md`](../009-live-verification/spec.md) — the independent instrument
- [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md)
