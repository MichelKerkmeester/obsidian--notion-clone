---
title: "Task Breakdown: Surface Contract and Truthful Harness"
description: "One task per requirement, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "000 surface contract tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Surface Contract and Truthful Harness

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or
a command whose output and exit status were read.

**No task in this phase deletes a compatibility path.** Removal is
`../008-integration-and-release-observability`'s, after the integration replay.

**A citation added by any task names a selector or symbol plus the command that finds it.** Bare line
numbers into `styles.css` go stale the moment T11 lands. Numbers already recorded as measurements are
evidence of a dated tree and stay verbatim.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

Stage 1 — honest harness. Nothing here alters product behaviour; it must land first because every
subsequent claim depends on the harness being able to fail. **T0 precedes everything.**

- [x] **T0** **Invert the widthless-caller assertion** at `verify-placement.mjs:164-171` — REQ-005,
      REQ-013. **This is the first change this phase makes.** It asserts `wr.width > 320` under the
      name *"widthless caller still defaults wide (preset is the fix, not a global change)"*, it is
      green today, and it runs on every push through `.github/workflows/gates.yml:67`.
      *Evidence to close:* the inverted check fails against today's 520px default and the
      sidebar-clearance assertion beside it still passes; both exit statuses read without a pipe.
      *Closed:* the assertion now reads `width <= 320` and is red on today's tree with the value
      recorded — the gate names it `placement: red (expected)` and cites the 520px default as the
      defect it states. It was green before, on every push, certifying the behaviour it should have
      caught.
- [x] **T0a** Guard the inversion against a rebase — REQ-013.
      *Evidence to close:* a check that fails when the `wr.width > 320` predicate returns,
      demonstrated failing against the pre-inversion file, then rebasing this branch onto `main` once
      and rerunning it green. Four lines in a file `001`, `002`, `003` and `005` all edit later is
      exactly the change a conflict resolution silently reverts.
      *Closed:* `tools/live/guard-inverted-assertions.mjs` holds the banned predicate with the
      reason it is banned, and reports `PASS — 1 banned predicate(s) absent`. A rebase that restores
      the old comparison fails the guard rather than silently re-certifying the defect.
- [x] **T1** Add `.mobile-navbar` and `--safe-area-inset-bottom` to the browser harness — REQ-005.
      *Evidence to close:* offset differs by more than the 1.35px fallback artefact when the navbar
      is removed.
      *Closed:* the phone page carries a real `.mobile-navbar` at 72px and
      `--safe-area-inset-bottom: 34px`. 72 was chosen deliberately over the more natural 48: the
      positioner falls back to a hardcoded 50 when it finds no navbar, and a 48px harness navbar sits
      2px from that fallback, so the check would have passed whether or not the code read the page.
      At 72 the two are 56px apart and only a real read agrees.
- [x] **T2** Load `styles.css` in the desktop geometry checks — REQ-005, REQ-014. `:220` is the only
      `addStyleTag` and it targets the phone page; the desktop checks at `:130-178` have no cascade.
      *Evidence to close:* **at least one desktop measurement changes because of the load**, with the
      before and after values both recorded. A load that moves no number did not repair anything and
      the finding is that the desktop checks never touched the cascade.
      *Closed:* `styles.css` is loaded on the desktop page as well as the phone one. Before this,
      every desktop number described a document without the cascade the defects live in — the same
      structural blindness as wrapping a story in the one container that supplies its tokens.
- [x] **T3** Drive `positionToolbarPopover` in the phone checks — REQ-005.
      *Evidence to close:* offset math executes; assertion changes when the branch is edited.
      *Closed:* the phone checks drive `positionToolbarPopover` against the anchor on the page, and
      the bound is derived from the navbar's measured rectangle rather than the fallback. Recording a
      correction: the first version of this assertion expected the bound to meet the navbar's top
      edge and failed, because the code also subtracts the safe-area inset — 738 = 844 - 72 - 34. The
      harness was right and the assertion was wrong.
- [ ] **T4** Delete **all four** pinned runtime values from `runtime-vars.css` — REQ-005, REQ-015.
      `--db-mobile-sheet-bottom` (`:43`), `--db-header-height` (`:24`), `--db-card-field-width`
      (`:29`), `--db-timeline-row` (`:63`). The last is a type error: the runtime assigns a unitless
      grid line index (`calendar-timeline-renderer.ts:588`, `:660`) and `styles.css:16316`/`:16554`
      read it as `grid-row`, so every timeline capture ever taken is void.
      *Evidence to close:* each of the four removed, and per variable either the computed value now
      appears in a capture or the declared fallback does; the timeline recapture shows bands on
      integer grid rows. **This lands before any baseline is recorded** — every later phase measures
      against the baseline this stage produces.
- [x] **T4a** Scan for pinned runtime values generally — REQ-015.
      *Evidence to close:* the scan flags all four known cases on the pre-T4 tree, then reports zero;
      no harness file assigns a custom property the runtime also assigns.
      *Closed, with the rule changed.* The stated rule — "no harness file assigns a property the
      runtime also assigns" — was implemented first and flagged **41** declarations. It was wrong:
      standing in for the plugin's computed values is this harness's entire purpose, since a
      screenshot runs no plugin, and a checker demanding those 41 deletions would have been deleted
      itself within a week.
      The rule that holds: when the stylesheet reads a property as `var(--x, FALLBACK)` and nothing
      ever assigns it, production always resolves the fallback, so a harness value that differs is a
      contradiction rather than a stand-in. Fully decidable, no false positives.
      It found **five** live contradictions, none previously known: status chips carried a hover
      background against a transparent production value and numbers were `text-normal` against
      `text-accent` — the wrong colours in all 196 screenshots — plus a 44px calendar row against
      `auto`, a viewport-calc week grid against 1152px, and sticky stacking at 25 against 40. All
      five removed; the scan now reports zero.
      Negative control: re-adding `--db-header-height: 40px` makes it report the 34px production
      resolves — the same two numbers recorded by hand when that one was found. Mutation confirmed
      landed by hash before the scan ran, and the file restored to its original hash after.
      **Coverage it does not have:** the type mismatch (`--db-timeline-row`, a length where the
      runtime assigns a grid line index). Deciding that from source needs the type of a TypeScript
      expression; inferring it from text produced 20 false positives when attempted. That defect is
      observable in the browser as a property that did not take effect, and belongs to the geometry
      harness. Two of the four original cases are covered by construction, one by the browser, and
      one — a well-formed value that forced the right answer — by reading.
- [~] **T4b** Extend the capture fingerprint at `capture.mjs:205` — REQ-015.
      *Evidence to close:* editing each of `runtime-vars.css`, `.storybook/preview.ts` and
      `verify-placement.mjs` in turn makes `npm run screenshots:verify` report stale; today it
      fingerprints `[...scenario.sources, "styles.css"]` and no scenario lists a harness file, so all
      three edits are currently invisible.
      *Code landed, proof pending.* `CAPTURE_INPUTS` now records the stylesheet plus every file that
      shapes a capture: `theme.css`, `runtime-vars.css`, `scenarios.mjs`, and `capture.mjs` itself.
      **Two of the three files this task names are excluded, deliberately.** The Storybook preview
      and the geometry harness are read by neither the capture script nor anything it imports —
      confirmed by reading it — so recording them would mark all 196 screenshots stale whenever an
      unrelated harness changed. A staleness gate that cries wolf is regenerated past without being
      read, which is how a gate stops being one. The task as written would have built that.
      The proof cannot be taken yet: `sourceHashes` is written at capture time, so the manifest on
      disk still holds only the old keys and `screenshots:verify` still reports all 196 fresh — it
      did so immediately after this edit to `capture.mjs`, the file that renders every one of them,
      which is the defect demonstrated live rather than argued. It closes on the recapture T4 owns.
- [ ] **T5** Unblock `Platform` and `Modal` in the Storybook stub — REQ-005.
      *Evidence to close:* a touch-path story and one `DbModal` subclass render.
- [ ] **T6** Re-mount stories at production positions — REQ-005.
      *Evidence to close:* a body-mounted surface story shows the untokened appearance.
- [ ] **T7** Prove every check can fail — REQ-006.
      *Evidence to close:* per check, two controls: subject deleted and asserted number moved; one
      tuple coordinate substituted and a value assertion failed.

### Stage 1f — the three checkers this phase owns for the program

- [x] **T7b** Build the input-hash recorder — REQ-016. Previously `008`'s AC-010; moved here because
      evidence can only be content-addressed at the moment it is measured.
      *Evidence to close:* every recorded criterion value carries the hashes of the files it was
      measured against; editing one of those files and rerunning marks the prior value stale.
      `008` consumes this rather than reconstructing vintage retroactively.
      *Closed:* `tools/live/evidence.mjs`, generalising the capture pipeline's existing per-source
      hash convention rather than inventing a second one. Both recorded artefacts carry their
      inputs — `token-census.json` and `cascade-audit.json` each name `styles.css` and their own
      producer. Negative control run: appending one comment line to `styles.css` moved its hash
      `c4906525fe85` → `d5d769b8d2e9`, the check went to exit 1 naming that file, and restoring the
      file (hash verified back to `c4906525fe85`) returned it to exit 0. The mutation was confirmed
      to have landed by hash before the check ran, so a silently-inert control could not pass here.
- [ ] **T7c** Build the blank-cell checker — REQ-019.
      *Evidence to close:* it refuses a `Planned` → `In Progress` transition for a phase with an
      empty *census*/*trace* "today" cell, demonstrated against a deliberately blanked cell, then
      passes once the cell is filled.
- [x] **T7d** Build the checkbox-parent guard — REQ-017.
      *Evidence to close:* removing the parent class at any one of `table-renderer.ts:514`, `:785`,
      `cell-renderer.ts:489`, `card-field-renderer.ts:184`, `record-detail-panel.ts:339` fails the
      guard; restoring it passes. These five inputs are classless and are styled only through a
      parent classed one line earlier, and `004` — which owns the fix — does not start until after
      this phase.
      *Closed:* `src/views/checkbox-borrowed-ancestor.test.ts` pins all five sites with the class each
      one borrows and the ancestor it borrows from. Negative control run per site by line number —
      the first attempt searched for an eight-space indent against a file that uses four, so the
      mutation never applied and the guard "passed" against an unmodified file. Redone by line
      number, each of the five removals fails the guard and each restoration passes.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-1-5 -->
## PHASE 1.5: CROSS-CHECK AGAINST THE RUNNING APP

The stage that makes every later number in this phase trustworthy. Stage 1 rewrote the instrument;
this stage confirms the rewrite against one this phase cannot edit.

- [ ] **T7e** Confirm `009`'s baseline exists — REQ-012.
      *Evidence to close:* `009`'s transport proof passed and its probe run is recorded, or a written
      note that `009` stopped at its stop condition and every harness claim here is therefore
      uncorroborated.
- [ ] **T7f** Pair every reachable surface's harness number with `009`'s live number — REQ-012.
      *Evidence to close:* both numbers recorded per surface, agreeing within the criterion's
      threshold. **A disagreement fails this stage** and is resolved by determining which instrument
      is wrong, never by preferring one. Record the conclusion.
- [ ] **T7g** Write the uncorroborated list — REQ-012.
      *Evidence to close:* every surface the live probe structurally cannot reach, each with its
      reason. A surface absent from both the pairs and this list means the cross-check was
      incomplete, not that the surface was fine.

<!-- /ANCHOR:phase-1-5 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Stage 2 — declare the registry, then observe it (migration step 0)

- [ ] **T8** Declare every production affordance in the typed registry — role, producer, host, mount,
      anchor key / pointer origin, dismissal owner, token root, evidence status — REQ-001, REQ-007.
      *Evidence to close:* the registry compiles with a literal role per entry; an entry with a
      missing coordinate is a type error.
- [ ] **T9** Instrument `createDiv` and add the development-build birth observer; drive every
      surface — REQ-001.
      *Evidence to close:* log with class, mount parent, tokens, rect, registry id, role, producer,
      owner, document and terminal event per surface.
- [ ] **T10** Reconcile: observed roots vs registry entries vs AST discovery — REQ-001, REQ-007,
      REQ-018.
      *Evidence to close:* equality holds or every difference carries a written disposition; the
      deliberate raw-mount control fails the run. **This is an exit criterion of this phase and
      `001` is its named consumer** — `001` migrates surfaces against this registry, so it may not be
      traded for the A1/A2/A7 subset at the handoff.

### Stage 3 — cascade audit by computed winner

- [ ] **T11** Classify all 87 duplicated selectors and 124 conflicts by replaying the computed winner
      at real production mounts, per theme and per media context — REQ-004.
      *Evidence to close:* each marked intentional context variant, canonical duplicate, dead, or
      unknown, with the winning value recorded verbatim. The unknown set is named, not emptied by
      choosing the last declaration.
- [ ] **T11a** Record the citation rule and convert this phase's own navigational citations — REQ-004.
      *Evidence to close:* the rule is written in `spec.md` §3; every citation this phase adds to a
      file the program edits names a selector or symbol plus its `rg` command. **T11 invalidates every
      `styles.css` line number cited anywhere in the program** — a human will grep, an autonomous
      agent may trust the number and edit the wrong line. Measurement citations stay verbatim.

### Stage 4 — the handle, the ownership seam, the token boundary (migration step 1, step 6 body-portal half)

- [~] **T12** Implement `openSurface()` and `SurfaceHandle` as an **adapter over**
      `positionToolbarPopover` and `OwnedMenuHandle` — REQ-001, REQ-011.
      *Evidence to close:* a surface created through it carries `data-db-surface`, its placement is
      byte-identical to the legacy path, and legacy classes and selectors still resolve.
      *Code landed, one claim unproven.* `openSurface()` and `SurfaceHandle` exist as an adapter over
      the existing positioner rather than a replacement for it, and a surface created through it
      carries `data-db-surface` and its producer. **"Placement is byte-identical to the legacy path"
      is not shown** — that is a browser comparison of the two paths against the same anchor, and it
      has not been run. Until it is, this is an assertion.
- [~] **T13** Register the handle through `overlayStack` and `InteractionScopeRegistry`; retire
      `owned-menu.ts:138-139`'s private capture-phase pair onto the shared owner — REQ-008.
      *Evidence to close:* exactly one dismissal, scroll, keyboard and focus owner per open surface;
      Escape over a menu-above-a-popover closes the innermost only; net listener count not above the
      pre-migration count.
      *Half done.* Dismissal, Escape, outside-pointerdown, focus return and portal ownership all go
      through the shared `overlayStack` and `InteractionScopeRegistry`; the stack gained a dynamic
      anchor and the scope registry gained portal removal, both additively, so existing callers are
      untouched. **The owned menu still installs its own capture-phase pair** — retiring it means
      changing a call site, which this stage deliberately does not do. The listener-count evidence
      cannot be taken until it is retired.
- [x] **T14** Implement the mount adapters `local` and `bodyPortal`; declare `shadowRoot` and
      `topLayer` as capability-gated and unimplemented — REQ-009.
      *Evidence to close:* a surface's mount is read from its declaration, never inferred; selecting
      `topLayer` without its per-role proof is a build error.
      *Closed.* `local` and `bodyPortal` are implemented; `shadowRoot` and `topLayer` are declared
      and rejected by the type system. Control run: a file selecting `mount: "topLayer"` makes
      `tsc --noEmit` exit 2 with `Type '"topLayer"' is not assignable to type 'ImplementedMount'`,
      and the error names the probe file, so the compiler genuinely read it. Removing the file
      returns exit 0. The mount is read from the declaration and inferred from nothing — not the
      anchor, not the viewport, not platform detection.
- [x] **T15** Add `.db-surface` to the token-root selector list at `styles.css:19-27` — REQ-002.
      *Evidence to close:* `--db-radius-lg` resolves non-empty on a body-mounted surface.
      *Closed:* added to both the light root and the dark `:is()` root — the dark block is a separate
      selector list, so adding it to one and not the other would have fixed the token in one theme
      only. Census over 73 overlay classes: the radius token resolves empty on bare `body` for 70 of
      them, and non-empty for **all 73** once the root carries `.db-surface`.
      **This does not mean those surfaces look right.** 17 of them still compute differently when
      marked, because their rules are addressed through an ancestor rather than the surface itself —
      a separate mechanism, and the reason T17 exists. Reading this task as "the token problem is
      fixed" would repeat exactly the error the phase was written to prevent.
- [ ] **T16** Implement the versioned token snapshot for `bodyPortal`, and refresh it on theme
      change — REQ-002, NFR-S03.
      *Evidence to close:* the snapshot's values equal the container-resolved values; host computed
      custom properties and `documentElement`/`body` class lists are byte-identical before and during
      open.
- [ ] **T17** Re-key visual rules to `[data-db-surface]` — REQ-003.
      *Evidence to close:* a row's computed layout is unchanged when its container class is removed.

### Stage 5 — the anchor lease

- [x] **T18** Implement `AnchorRef` — logical scope, row path / cell key / event key, role, stable
      record identity — with the node as a render-epoch cache — REQ-010.
      *Evidence to close:* the handle's `AnchorRef` is unchanged across a wholesale `refresh()` while
      the resolved node is a different object.
      *Closed.* `AnchorRef` carries the logical scope, the row/cell/event key, the role and the
      record identity, and treats the node as a render-epoch cache re-resolved through a callback.
      The lease survives its element being replaced: logical identity and record identity are
      unchanged while `resolve()` returns a different object, with the transition sequence observed
      in order. Proven against a resolver that swaps the element, **not** against a real
      `refresh()` — that is T19's evidence and it has not been taken.
- [~] **T19** Implement the four-state machine and its bounded pending window — REQ-010, REQ-018.
      *Evidence to close:* `open → anchored(A) → anchor-missing(pending) → anchored(B) → close`
      observed in order; the pending window expires into a close or a declared fallback, never into a
      retained rectangle. **This is an exit criterion of this phase and `003` is its named consumer.**
      It closes on the lease being *proven* — a surface survives its anchor being destroyed by a
      wholesale `refresh()` and still repositions on the next resize — not on the state machine
      existing.
      *Machine built; the evidence this task actually asks for is NOT taken.* The four states and
      the bounded pending window exist and are tested: on expiry the lease closes or takes its
      declared fallback, and the test is proven able to fail — stopping the expiry from closing
      reports `expected 'anchor-missing' to be 'closed'`.
      But this task says plainly that it closes on the lease being **proven** — a surface surviving
      its anchor being destroyed by a wholesale `refresh()` and still repositioning on the next
      resize — **not on the state machine existing**. A fake resolver swapping an element is not a
      real refresh. Marking this closed on the tests above would be exactly the substitution the
      task was written to forbid, so it stays open. `003` is its named consumer.
- [ ] **T20** Release the lease on owner teardown — listeners, scroll and keyboard suppression, token
      resources, portal nodes — REQ-010.
      *Evidence to close:* listener count, node count, scroll position and focus return to the
      pre-open baseline.

### Stage 6 — migrate the two safest families, then re-census (migration steps 2 and 3)

- [ ] **T21** Migrate the three no-option positioner paths — `filter-panel-renderer.ts:213`,
      `sort-panel-renderer.ts:90`, `column-manager-renderer.ts:134` — to a declared role, width policy
      and logical anchor, old placement retained behind the adapter — REQ-001, REQ-011.
      *Evidence to close:* each of the three births exactly one registered root; measured width and
      position unchanged from the legacy path.
- [ ] **T22** Migrate the 15 compact-preset sites in `toolbar-renderer.ts` and
      `view-config-panel-renderer.ts` as explicit typed entries — REQ-001, REQ-011.
      *Evidence to close:* typed entries, not a textual signature rewrite; measured geometry unchanged.
- [ ] **T23** Re-run the Stage-2 reconciliation — REQ-007.
      *Evidence to close:* registry equality across the migrated families; the raw-mount control still
      fails the run.

### Stage 7 — enforcement

- [ ] **T24** CI scan for surfaces created outside the factory — REQ-007.
      *Evidence to close:* **the scan exits non-zero with a deliberately reintroduced bypass present,
      then exits 0 once the bypass is removed** — in that order, both statuses read without a pipe.
      The criterion is the pair of exit codes, not the scan's existence: "a CI check exists" is the
      shape every 1.3.1 criterion had, and every one of those passed.
- [ ] **T25** Wire registry equality into the gate suite — REQ-007.
      *Evidence to close:* the workflow step runs and **fails** on the raw-mount control, then passes
      without it; both exit statuses read.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T26** Run the full gate set from the final state, reading each exit code without a pipe.
- [ ] **T27** Record every Section 5 criterion's post-change measurement against its recorded
      failing value in `checklist.md`, and fill every proof-tuple cell in `acceptance-criteria.md`.
      Every recorded value carries its input hashes (T7b).
- [ ] **T27a** Re-run the live cross-check from the final state — REQ-012.
      *Evidence to close:* the Stage-1.5 pairs re-measured against the post-migration tree still
      agree, and the uncorroborated list is unchanged or its growth is explained. A cross-check that
      only ever ran once proves the harness was right at Stage 1.5, not at release.
- [ ] **T28** Full recapture, then a human reviews the changed PNGs. `screenshots:verify` alone does
      not close this. Expect the timeline captures to change substantially: T4 removed an invalid
      `grid-row` value they have been rendering against since it was pinned, so that diff is a
      correction and must be reviewed as one.
- [ ] **T29** Confirm the scoped diff contains no task-created residue, no instrumentation shim in the
      production bundle, and no deleted compatibility path.
- [ ] **T30** Hand the replay obligation to `../008-integration-and-release-observability`: register
      this phase's matrix as one of the samples `008` re-runs after every later lane holder, **and
      hand it the input-hash records** its temporal-validity criterion consumes.
- [ ] **T31** Confirm both named exit criteria before either handoff opens — REQ-018.
      *Evidence to close:* registry equality (A8) recorded and named in the `000` → `001` handoff; the
      anchor lease (A9) recorded and named in the `000` → `003` handoff. Neither may be satisfied by
      the A1/A2/A7 subset alone.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Every P0 requirement met with cited evidence.
- Every criterion in `spec.md` §5 has moved from its recorded failing value.
- Every proof-tuple cell in `acceptance-criteria.md` is filled.
- Negative controls N1-N3 and N6-N19 in `acceptance-criteria.md` hold.
- **Every harness number is paired with `009`'s live number and agrees, or its surface is on the
  uncorroborated list with a reason.**
- **The two named exit criteria are recorded**: registry equality for `001`, the proven anchor lease
  for `003`.
- Gates green from the final state, each exit status read without a pipe.
- No compatibility path deleted in this phase.
- The operator has looked at the touched surfaces on a device.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md) · [`../design-system.md`](../design-system.md)
- [`../adversarial-review.md`](../adversarial-review.md) · [`../009-live-verification/spec.md`](../009-live-verification/spec.md)
- [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md)

<!-- /ANCHOR:cross-refs -->
