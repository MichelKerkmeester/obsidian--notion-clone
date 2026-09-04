---
title: "Feature Specification: Component Surface System"
description: "Phase parent for the program that gives floating surfaces, sheets, checkboxes and content rows one architecture, one placement authority, and acceptance criteria measured where users actually see them."
trigger_phrases:
  - "component surface system"
  - "surface contract"
  - "dropdown design system"
  - "sheet overlay navbar"
  - "checkbox ownership"
  - "openSurface factory (deleted 2026-08-30)"
  - "005 component surface"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-02T23:30:00Z"
    last_updated_by: "parent-basis-reconciled"
    recent_action: "Reconciled completion_pct basis to 57 across spec/goal/handover"
    next_safe_action: "Answer the scope-exclusion question in section 2 that phase 019 crosses"
    blockers:
      - "Report 1 (sheet drag) open on the shipped build; 004 state contested; gate red at 12/13"
    key_files:
      - "spec.md"
      - "roadmap.md"
      - "architecture-findings.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-parent"
      parent_session_id: null
    completion_pct: 57
    open_questions:
      - "Does the out-of-scope exclusion on output number format cover card fields, or only the formula editor"
      - "Does report-driven scheduling replace the declared 009-first execution order"
    answered_questions:
      - "Is openSurface still a deliverable? No. Deleted 2026-08-30 on nine measurements; the contract it sat on was kept"
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

**`completion_pct: 57`, reconciled 2026-09-02.** `roadmap.md` §3.2 binds the figure to ticked ÷
total over `goal.md`'s own completion-criteria checklist — now 4 of the 7 §3 rows (`D13`), row 6
having ticked on `c5566db`'s owned negative controls (armed 1601/1601/2003 layout reads over the
bound 8/8/8, disarmed 1/1/3), verified in-runtime — not the operator-reports ledger this field
previously carried at 50, and not the prior 3-of-7 reading of 43; both are dated history, not the
current basis.

---

## 2. SCOPE

**Thirty-five phase folders** as of 2026-08-31 (`ls -d [0-9][0-9][0-9]-* | wc -l`), in two
generations. This read "twenty" long after the count moved; it is a growing number, so it is dated
and given its command rather than restated.

The first ten were cut from the architecture findings. Three of them were not on the original defect
list and all three are mandatory: `000` because four defects are one bug, `008` because no child
phase can know a later stylesheet edit preserved its result, and `009` because every gate so far has
measured a reproduction of the product rather than the product.

The second generation, `010` through `019`, was cut from operator reports made after this program
started shipping. They are listed below the first ten and mapped to their reports in
[`roadmap.md`](roadmap.md) §4. They were not planned; they are what the operator found.

| Spec | Owns | Source defect |
|---|---|---|
| `000-surface-contract-and-truthful-harness` | The token root and the honest harnesses | Foundation — four defects are this bug in different clothes |
| `001-overlay-placement-and-menu-language` | Placement contract, one row grammar, panel parity | Dropdowns misplaced and inconsistent |
| `002-properties-panel` | Row grid and information architecture | Properties panel clipped and oversized |
| `003-mobile-sheet-presentation` | Portal, one phone predicate, anchor lifetime | Sheets not overlaying the navbar; sheet glitches on edit |
| `004-checkbox-ownership` | One checkbox primitive, unconditional base appearance | Round checkboxes everywhere |
| `005-content-row-rhythm` | Intrinsic sizing for rows and the header rail | Ragged list rows; calendar bubbles overflowing |
| `006-record-open-target` | Where a record opens, and the setting for it | "Open" shows a peek card, not the page |
| `008-integration-and-release-observability` | The cross-phase replay, the release decision, and every compatibility retirement | Structural — `styles.css` is one serialized lane and every phase edits it in turn |
| `009-live-verification` | Driving and measuring the plugin inside the running Obsidian from a terminal | Structural — every harness measures a reproduction, not the app the operator installs |
| `010-sheet-reading-and-keyboard` | The phone sheet's reading rhythm, and keyboard avoidance | Reports 3 and 4 |
| `011-mobile-menu-presentation` | Owned menus as phone sheets; one sheet menu row | Reports 5 and 6 |
| `012-mobile-touch-semantics` | What a touch means in the table | Report 8 |
| `013-add-view-sheet` | The Add View surface, rebuilt on the row grammar | Report 12 |
| `014-desktop-select-checkbox` | The select-column checkbox pin on desktop | Report 14 |
| `015-desktop-dropdown-placement` | Five desktop placement paths, and the four that are not maintained | Report 15 |
| `016-sheet-drag-and-audit` | The sheet drag, and the eight sheet asks measured together | Reports 1, 2, 3, 4, 6, 9, 10, 11 |
| `017-touch-row-range-selection` | Row range selection on touch, and the gesture that replaces it | An unnumbered report inside report 8's surface |
| `018-select-column-affordance-fit` | Room for the reorder button beside the row checkbox | Report 16 |
| `019-card-field-value-formatting` | A number rendering the same in a card as in a cell | Report 7 |

**Out of scope.** Table render performance is already fixed and measured. Formula editor layout
**and the formula editor's output number format** remain on the earlier track.

**That exclusion is now amended, by the operator.** It previously read "output number format" with
no owner named, and `019-card-field-value-formatting` changed output number format inside this
program on 2026-08-30 before anyone read it. The operator has resolved it to the **narrow reading:
the exclusion covers the formula editor's number format only.** A card field's number format is a
different surface and this program legitimately owns it, so `019` is in scope where it sits and does
not move. The sentence above now says which, because the previous wording did not.

---

## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder.
> All implementation details — plan, tasks, checklist, acceptance criteria, continuity — live inside
> the phase children. **Folder numbering is not the execution order.** The order is in §3.

**Status here is the one-word summary. [`roadmap.md`](roadmap.md) §5.1 carries the evidence for each
and is the document to read before believing any row.** A phase marked Shipped has code in the
working tree and nothing more; see `roadmap.md` §3 for why shipped, verified and operator-confirmed
are counted separately.

| Declared order | Folder | Focus | Status |
|---|---|---|---|
| 2 | `000-surface-contract-and-truthful-harness` | The token root and the honest harnesses | Partially shipped |
| 5 | `001-overlay-placement-and-menu-language` | Placement contract, one row grammar, panel parity | Partially shipped |
| 6 | `002-properties-panel` | Row grid and information architecture | Shipped |
| 7 | `003-mobile-sheet-presentation` | Portal, one phone predicate, anchor lifetime | Shipped; report 1 open |
| 3 | `004-checkbox-ownership` | One checkbox primitive, unconditional base appearance | **Resolved — `roadmap.md` §7.1.** The lane entry is corroborated and the verifier refuted: `appearanceOwnedByAncestor: 0` of 211 controls |
| 4 | `005-content-row-rhythm` | Intrinsic sizing for rows and the header rail | Shipped |
| 8 | `006-record-open-target` | Where a record opens, and the setting for it | **In progress** — desktop Open and the peek layer landed under another phase's lane hold |
| 9 + early | `008-integration-and-release-observability` | Replay harness lands **before `001`** and runs at every lane handoff; the release decision and compatibility retirement stay last | Deliverable A shipped |
| 1 | `009-live-verification` | The independent instrument: drives and measures the plugin in the running Obsidian. Gates `000`'s harness-truth claims | Instrument built, nothing gated |
| — | `007-architecture-research` | Standing research run; not a program phase and not on the execution path | Complete |
| report-driven | `010-sheet-reading-and-keyboard` | Sheet reading rhythm and keyboard avoidance | Shipped + verified |
| report-driven | `011-mobile-menu-presentation` | Owned menus as phone sheets; one sheet menu row | Shipped + verified |
| report-driven | `012-mobile-touch-semantics` | What a touch means in the table | 90% |
| report-driven | `013-add-view-sheet` | The Add View surface, rebuilt on the row grammar | Shipped + verified |
| report-driven | `014-desktop-select-checkbox` | The select-column checkbox pin on desktop | 85%, recapture owed |
| report-driven | `015-desktop-dropdown-placement` | Five desktop placement paths | 80%, one defect declared |
| report-driven | `016-sheet-drag-and-audit` | The sheet drag, and the eight sheet asks together | 90%; report 1 root-caused |
| report-driven | `017-touch-row-range-selection` | Row range selection on touch | 95% |
| report-driven | `018-select-column-affordance-fit` | Room for the reorder button beside the row checkbox | Shipped, unverified |
| report-driven | `019-card-field-value-formatting` | A number rendering the same in a card as in a cell | Shipped, unverified |
| report-driven | `029-numeric-coercion-parity` | A row reading a numeric column whole rather than parsing its leading digits | Shipped, unverified; captures owed |
| report-driven | `035-visual-pass-product-defects` | The seventeen product defects the 2026-09-02 visual pass read, which `020`'s D5 forbids `020` from fixing | In progress — 14 of 17 fixed and read on a recapture |
| port-plan | `037-timeline-gantt-port` (Level 2) | Port obsidian-pm's timeline/Gantt geometry, controls, header/grid, bars, drag and dependency-link UX near one-to-one into `calendar-timeline-renderer.ts` | Opened 2026-09-02, not started |
| port-plan | `038-board-kanban-port` (Level 2) | Port obsidian-pm-main's Kanban status-column hierarchy, card density and hover/drag/drop visual language into `board-renderer.ts` near one-to-one, without narrowing the local action contract | Opened 2026-09-02, not started |
| port-plan | `039-calendar-parity-port` (Level 2) | obsidian-pm has no calendar view; merge its verified date and milestone language into the existing `calendar-renderer.ts` | **Landed (partial)** `57043e7` + `1588576`, release pending, not operator-confirmed |
| port-plan | `040-subtask-tree-port` (Level 3, raised over `recommend-level.sh`'s L1 — see its `spec.md` §1) | Port obsidian-pm-main's recursive subtask model — normalized parent index, cycle-safe move/reorder, depth/expand UI — into this repo's per-note frontmatter model near one-to-one | **Landed (partial)** `1d611db` + `00b7bd2`, release 1.4.7 pending, not operator-confirmed |
| port-plan | `041-shared-ui-ux-port` (Level 2) | Rewrite obsidian-pm's shared token, primitive, motion and settings language into this repository's `db-*` surfaces without replacing the local bottom sheet | **Landed (partial)** `cb9aedf` + `25ae3a9`, release pending, not operator-confirmed |
| audit-driven | `042-harness-fidelity-and-replay` (Level 3) | Chart and calendar week/day renderer coverage (DONE-row 3); replay backfill for report 29, reports 34-36 and phases `037`-`041` (DONE-row 5); the row-6 harness-dependency audit — pinned `runtime-vars.css` calendar formula, `touch-targets.mjs`/`unstyled-links.mjs` fixture reads, `theme.css`'s absent `.mod-cta`, plus the capture manifest's byte-level (non-content-hash) compare | Landed `7e9fd27`: chart and calendar week/day render-assertion scenarios with owned controls; 21 replay claims, three delegating to the sheet lanes; `runtime-vars.css` and `theme.css` pinned to product values; criterion 5 manifest compare open, a lane is on it; not operator-relevant |
| seam-driven | `043-constructed-capture` (Level 3) | `042` left DONE-row 6 open on five fixture-only gate lanes (css-lane, screenshots-fresh, device-parity, plus the fixture pass of two constructed-pass-supplemented checks). This phase gives `capture.mjs` a constructed scenario type that reuses `042`'s bundle/mount seam, photographs at least one scenario per registered view (list, table, board, gallery, calendar's three scales, timeline's five scales, chart), declares which existing fixtures it supersedes, and rewires css-lane/screenshots-fresh/device-parity to read the constructed capture where one exists | **Landed (partial)** `2ab4942` + `0af4ca6` + `bf67475` + `425d552`, not operator-relevant. Nine constructed scenarios, 36 captures, declared alongside 7 of 11 planned fixtures via `fixtureOf`; `captureData` now gives all nine views real typed cells and real icons (T004-T006 covered seven, T027 closed the last two — table routes through a real `CellRenderer`, chart sums a real per-row value column). css-lane and device-parity now read the constructed captures with zero code change, screenshots-fresh's DECLARED-staleness wiring stays open. AC-002 (the readiness negative control) is unmet as written — screenshot rasterisation flushes the frame the wait proves — and needs an operator ruling. Constructed entries share `screenshots/manifest.json` rather than AC-006's separate file, and the timeline is captured at week scale only. Parent DONE row 6 stays open (done-audit-8), narrowed to the 13 named fixture-only scenarios, which back five of the 25 `npm run gate` lanes and make ticked row 4's green partly dependent on hand-authored markup. **T028 (worktree, unmerged):** all 13 now have a constructed counterpart; row 6 narrowed a fourth time, deliberately left unticked for a fresh audit (D4) |

**Rows for `020`-`028` and `030`-`034` are missing from this table.** Those folders exist and this
map otherwise stops at `029`. The gap is recorded rather than filled by whoever noticed it, since
each row carries a status claim its own phase owns. `035` is here because the phase that opened it
wrote its own row; the same is owed by the other fourteen and is theirs to write.

### Phase Transition Rules

- Each phase MUST pass `validate.sh <child> --strict` independently before the next phase begins.
  **This rule was not kept, and the scaffold half of it has since been closed.** As of 2026-08-30
  every child failed `--strict`, most on scaffold gaps rather than content. `010` through `017` were
  then missing the `plan.md` and `tasks.md` their declared level requires; as of 2026-08-31 **all
  eight carry both**. What remains is the `implementation-summary.md` a child owes once its tasks
  are ticked, which is written after implementation rather than before it.
- The declared execution order is **009 → 000 → 004 → 005 → 001 → 002 → 003 → 006 → 008**, argued in
  §3. The folder numbers are identifiers, not sequence.
- **The declared order was not the order run.** The lane journal's acquire sequence is
  `000` (partial) → `004` → `005` → `002` → `001` → `003` → `010` → `003` → `013` → `014` → `012` →
  `004`. `009` gated no handoff and `006` never started; `010` onward were cut in the order the
  operator reported them. `roadmap.md` §8 states both readings of what that means and does not pick
  one.
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
- **A superseded bullet, kept as a record rather than deleted.** This list used to also say
  *"`009` runs in parallel and blocks nothing"*, which is the pre-review model the bullet three
  above replaced. The two sat here contradicting each other while the program ran. In practice
  neither was true: `009` was declared a blocking gate, ran as neither, and gated nothing.
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
| `000` | `001` | Token root landed (the factory this row named, `openSurface`, was deleted 2026-08-30): a body-mounted surface carries its tokens; **the registry is complete** (source census equals runtime census) and **the anchor lease survives a wholesale refresh** | `000` criteria A1, A2, A7, plus registry equality and the anchor-lease criterion |
| `000` | `003` | **The `AnchorRef` lease is proven**, not merely implemented: a surface survives its anchor being destroyed and still repositions | `000`'s anchor-lease criterion, named explicitly because `003`'s sheet fix consumes it |
| `001` | `002` | Every surface shares one placement contract; placement is resolved by role | `001` criteria A1-A7 |
| `002` | `003` | That contract has been shaken out on desktop where debugging is cheap | `002` criteria B1-B6 |
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

**Declared order: 009 → 000 → 004 → 005 → 001 → 002 → 003 → 006 → 008.** This is the argument, not
the history. The order actually run is in the Phase Transition Rules above, and `roadmap.md` §8
holds both readings of the difference.

- **000 blocks everything.** 001, 002, 003 and 006 need the token root and the honest harness; 004
  and 005 need only the harness. **The factory this bullet used to name is gone**: `openSurface` was
  deleted on 2026-08-30 after measurement showed it had zero importers, zero tests and was absent
  from the shipped bundle — nothing imported it, so the bundler dropped it. The contract it sat on,
  `src/views/surface-contract.ts`, is live and was deliberately kept. The decision and its nine
  measurements are in `001-overlay-placement-and-menu-language/spec.md` §13.
- **004 runs before 001 deliberately.** It is small and highly visible, and it validates the
  criteria doctrine cheaply. If checkboxes ship and circles remain, the method is wrong and the
  cost is a week rather than a quarter.
- **005 next**, while the overlay lane is free. It is the only work with no overlay dependency and
  will otherwise never be scheduled.
- **001 before 002:** once every surface shares one placement contract, the properties panel is just
  another surface and only its row grid remains. *(This read "goes through the factory" — the
  `openSurface` factory it named was deleted, and `positionToolbarPopover` plus the sheet module are
  what the surfaces actually share.)*
- **003 after 002:** the portal is the riskiest change, so it lands once that shared contract has
  been shaken out on desktop where debugging is cheap.
- **006 last of the defect phases:** it needs 003's phone presentation to answer where a record opens
  on a phone.
- **008 closes the program.** It is not a final screenshot collection: it replays every registered
  surface through its real producer, mount, environment and transition after the last stylesheet
  edit, and it is the only phase permitted to remove a compatibility path. No phase that authored a
  new path certifies the removal of the old one.
- **009 runs first and gates 000.** It builds the transport that drives and measures the plugin
  inside the running Obsidian. It cannot replace the browser harnesses — they are faster and
  CI-native — and it reaches the one coordinate they structurally cannot: the operator's real app,
  theme, plugin set and host chrome. **It did not run first.** `tools/live/probe.mjs` exists, no
  criterion of `009`'s is recorded as met, and it gated no handoff. The circularity this ordering
  was designed to prevent — `000` repairing a harness and then measuring its own work through it —
  was therefore never prevented. `016`'s drag probe then tested the argument by accident, and the
  argument won: three source-reading checks had certified a drag that no check had ever performed,
  and the defect surfaced only once something drove a real touch stream through the shipped code.

---

## 4. THE SERIALIZED CSS LANE

`styles.css` must not be split, and every capture fingerprints it. **Exactly one spec may hold the
file at a time.**

Measured 2026-08-31: **20,124 lines** (`wc -l styles.css`) and **236 captures**
(`find screenshots -name '*.png' | wc -l`). Both were recorded here as 19,261 and 196 and drifted
unread — the commands are given so the next reader re-derives them instead of trusting this line.

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

## 4a. THE VISUAL PASS, AND WHAT READING BEAT MEASURING TO

Captures were recaptured and read, not merely regenerated. Seven surfaces end to end, chosen to span
every family rather than to sample evenly: owned menu sheet, record detail sheet, list view, board
view, timeline, table view, and the date-value picker — each at phone width, dark theme.

**What reading found that no check had.** The list row's checkbox looked far too large against its
neighbours. It is not: the stylesheet raises every checkbox to a 28px minimum under
`@media (pointer: coarse)`, and `min-width` beats `width`, so a phone paints 28x28 where a desktop
paints 16x16. But `checkbox-appearance.mjs` measured **every** fixture on one 1200px fine-pointer
page, including the ones named `list-mobile`, `board-mobile` and `table-mobile`. The coarse block
never applied. Fifty-three controls were reported at a size no phone renders, and the 28px floor was
invisible to the only instrument that existed to see it.

That resolved a contradiction recorded as open elsewhere in this packet: `roadmap.md` §7.1 had the
switch at 34x28 and the artefact at 34x18. Same control, two pointer modes, one of which the tool
could not see.

**What reading confirmed.** Long names ellipsise rather than wrap. Sheets reach the bottom edge, 844
of 844 with a 0px gap. Date-picker states are distinguishable — selected boxed, today in accent,
out-of-month dimmed. The timeline's bars align to their day columns. Board columns clip for
horizontal scroll rather than overflowing.

**What reading cannot do, and what replaced it.** Four pixels is invisible in a picture and decisive
under a thumb, so target size is measured instead. The `touch-targets` lane renders every scenario
at 390px with `hasTouch` and measures all 1,080 interactive elements. Against this project's own
28px floor, **286 controls across 37 classes** fall short, the smallest at 10x14. That set is held
as a ratchet rather than mass-edited: resizing 37 control classes changes how the plugin feels and
how nearly every capture looks, which is an operator decision rather than a repair.

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
   **This has drifted.** `015` and `016` each built probes inside their own phase folder rather than
   extending the shared harness, because that file was held by another session. `015` records the
   merge back as owed. A phase-local probe is a reasonable answer to a file lock and a bad permanent
   home: it is not run by the gate, so a check that lives there guards nothing after the phase ends.
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

`vitest` runs `environment: "node"` with no jsdom, so every test in it exercises pure logic. The
count was 410 when this was written and reads 434 in `001`'s continuity as of 2026-08-30; treat any
number written here as stale and read the run. **No criterion in this program can be evidenced by
them**, with one exception opened on 2026-08-30: `019`'s subject is three pure formatting functions,
which is exactly what this suite can evidence and exactly why their having no test at all matters.
Every phase lists the suite as a quality gate,
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

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, verification, decisions, continuity) live inside the phase children. **This anchored table is scaffold-appended** (the hand-authored map above at §"PHASE DOCUMENTATION MAP" predates the `<!-- ANCHOR:phase-map -->` marker and is the reader-facing table `roadmap.md` §5.1 cites); the same row is carried in both so neither goes stale alone.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 42 | 042-harness-fidelity-and-replay/ | Chart and calendar week/day renderer coverage, replay backfill for every landed result since `005`, and the row-6 harness-dependency audit | Opened 2026-09-03, not started |
| 43 | 043-constructed-capture/ | Photograph the constructed production renderers (reusing `042`'s bundle/mount seam) for at least one scenario per registered view, declare the fixtures they supersede, and wire css-lane, screenshots-fresh and device-parity to read the constructed capture where one exists | **Landed (partial)** `2ab4942` + `0af4ca6` + `bf67475` + `425d552`, Level 3. Typed data and real icons now landed for all 9 constructed views (T004-T006 covered 7, T027 closed table and chart). AC-002 unmet as written and needs an operator ruling; shared manifest kept over the separate file AC-006 specified; timeline captured at week scale only. Parent DONE row 6 stays open (done-audit-8), narrowed to the 13 fixture-only scenarios that back 5 of the 25 `npm run gate` lanes, feeding ticked row 4's green. **T028 (worktree/022-constructed-state-variants, unmerged):** all 13 now have a constructed counterpart via ten new additive `ScenarioSpec` options plus three `fixtureOf` declarations; row 6 narrowed a fourth time, deliberately left unticked for a fresh audit (D4) |
### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 041-shared-ui-ux-port | 042-harness-fidelity-and-replay | None — `042` is audit-driven (opened from the parent's own 2026-09-03 DONE-table audit), not blocked on `041`'s release | n/a |
| 042-harness-fidelity-and-replay | 043-constructed-capture | None — `043` is seam-driven (opened from `042`'s own investigation of `capture.mjs`'s fixture-only scenario type), not blocked on `042`'s release | n/a |
<!-- /ANCHOR:phase-map -->
