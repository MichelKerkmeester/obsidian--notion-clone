---
title: "Adversarial Review: What Would Let 1.3.1 Happen Again"
description: "Seventeen findings and three observations from an independent review of this program, with the verdict that the program could not, as first written, catch its own failure."
trigger_phrases:
  - "adversarial review findings"
  - "would this catch its own failure"
  - "surface system review"
importance_tier: "critical"
contextType: "research"
---
# Adversarial Review: 005-component-surface-system

**Target:** `specs/public/005-component-surface-system/` and all nine children (000–009)
**Question:** What in this program would let the 1.3.1 failure happen again?
**Date:** 2026-08-29
**Method:** Read-only review of every spec, plan, tasks, checklist, acceptance-criteria and goal file across the parent and all nine children, cross-referenced against the actual source files cited.

---

## FINDINGS

### F1 — The harness that 000 must repair is the harness 000 measures through

**Claim:** Phase 000 Stage 1 repairs the harness (adds `.mobile-navbar`, loads `styles.css` on desktop, inverts the `verify-placement.mjs` assertion). Stages 2–7 then measure their results through that repaired harness. But 000's own criteria (A1–A10) are asserted in the same `verify-placement.mjs` file that Stage 1 is rewriting. The phase that fixes the instrument is also the first phase that trusts it.

**Evidence:** 000/plan.md:157-168 (Stage 1 repairs), 000/spec.md:258-259 (A5 references verify-placement.mjs:164-171), 000/acceptance-criteria.md:92 (AC-004 measures via the harness). Confirmed: `tools/storybook/verify-placement.mjs:164-171` is the assertion, and line 220 is the only `styles.css` load.

**Verdict:** CONFIRMED — circular. The negative controls (N1–N3) partially mitigate this, but the controls themselves are demonstrated inside the same repaired harness. There is no independent second instrument. If the repair is wrong in a way that makes all checks pass, the same controls pass too.

**Consequence:** A subtly incorrect harness repair (e.g. the `.mobile-navbar` placed at the wrong z-index, or `styles.css` loaded with a different cascade context than production) would make every subsequent phase's criteria pass while the defect persists — the 1.3.1 pattern exactly, with a different wrapper supplying the illusion.

---

### F2 — verify-placement.mjs:164-171 asserts the defect, and it runs on every push today

**Claim:** The spec identifies this as a trap (000/spec.md:119-124, design-system.md:197-203, roadmap.md:93-98). The CI check at `.github/workflows/gates.yml:67` runs `npm run storybook:placement` on every push.

**Evidence:** Verified at `tools/storybook/verify-placement.mjs:164-171`: the check is named *"widthless caller still defaults wide (preset is the fix, not a global change)"* and asserts `wr.width > 320`. This currently passes because the 520px default is reachable.

**Verdict:** CONFIRMED — this is the most dangerous single finding. It is already identified in the spec, but it exists on the tree right now and will block phase 001. If 000 fails to invert it or if a rebase reverts the inversion, CI will reject the fix and accept the defect.

**Consequence:** Fixing the width policy in 001 turns CI red. The cheapest response is to revert the fix.

---

### F3 — `styles.css` is not loaded on the desktop page in verify-placement.mjs

**Claim:** 005/acceptance-criteria.md AC-013 states: "verify-placement.mjs loads styles.css on the phone page only (verify-placement.mjs:220), so the desktop page is already running a 'render without the stylesheet' substitution and reporting green."

**Evidence:** Verified. `tools/storybook/verify-placement.mjs:220` is the sole `addStyleTag` call for `styles.css`, and it targets only the `phone` page. The desktop geometry checks (lines 130–178) run against a page that has no stylesheet loaded.

**Verdict:** CONFIRMED — the desktop geometry checks measure a document that does not contain the cascade where the bug lives. Every desktop geometry result is structurally irrelevant to the shipped product.

**Consequence:** A desktop criterion that passes today tells you nothing about what the user sees. This is the exact same structural blindness as the `.note-database-container` wrapper: the harness measures a different rendering context than production.

---

### F4 — `runtime-vars.css:43` pins `--db-mobile-sheet-bottom: 0px`, the exact value the sheet defect lives in

**Claim:** architecture-findings.md §3, design-system.md §7, and 000/spec.md:117.

**Evidence:** Verified at `tools/screenshots/runtime-vars.css:43`: `--db-mobile-sheet-bottom: 0px`. This is the token that controls the sheet's bottom offset. Pinning it to 0px means every screenshot capture shows the sheet positioned correctly regardless of whether the runtime code computes the right value.

**Verdict:** CONFIRMED.

**Consequence:** The 196 screenshot captures that fingerprint `styles.css` can never show a sheet-bottom defect. The captures prove the CSS was loaded, not that the sheet is correctly positioned.

---

### F5 — `runtime-vars.css:63` sets `--db-timeline-row: 34px` — a length where a grid line index is expected

**Claim:** 000/goal.md mentions this: "one of which (`--db-timeline-row`) is set to a length when it is a **grid line index**".

**Evidence:** Verified. `runtime-vars.css:63` sets `--db-timeline-row: 34px`. `styles.css:16316` and `styles.css:16554` both use it as `grid-row: var(--db-timeline-row, 1)`. A CSS `grid-row` property expects a line number or `auto`, not a length.

**Verdict:** CONFIRMED — this is a type error in the capture harness. Every timeline capture has bands resolving `grid-row: 34px`, which is invalid and falls back to the initial value.

**Consequence:** Every timeline screenshot ever taken shows a broken grid layout that differs from what the user sees. No gate has ever flagged it because nobody looks at the PNGs (per the spec: "`screenshots:verify` never opens an image").

---

### F6 — The CSS lane serialisation assumes phases execute cleanly in sequence; there is no mechanism to detect a violation

**Claim:** The parent spec (spec.md:115-116, §4) says "exactly one phase holds `styles.css` at a time." The order is 000 → 004 → 005 → 001 → 002 → 003 → 006 → 008.

**Evidence:** No lock file, semaphore, or CI check enforces this. The rule is prose in the spec. Phase 004 (checkboxes) and 005 (row rhythm) both touch `styles.css`, and both unblock at the end of 000's Stage 1 (000/plan.md:333-335). In the DAG, 004 and 005 are on the same branch after 000, serialized only by convention.

**Verdict:** CONFIRMED — the lane serialisation is a convention with no enforcement. An autonomous agent executing 004 and 005 concurrently (both unblock from 000) could edit `styles.css` simultaneously.

**Consequence:** Two concurrent edits to the 19,261-line `styles.css` would produce merge conflicts at best and silent cascade reversals at worst — the same 87-selector/124-conflict pattern the program exists to fix.

---

### F7 — 008's replay is the program's only cross-phase gate, and it does not exist yet

**Claim:** The parent spec (spec.md:110-112, §3 Phase Transition Rules) says 008 "re-runs every earlier phase's evidence after every later `styles.css` release." 008/acceptance-criteria.md AC-001 says: "no replay runner exists on the current tree."

**Evidence:** 008 is the last phase to execute. Every earlier phase (000, 001, 002, 003, 004, 005, 006) is permitted to close independently. The only mechanism that detects whether a later phase's CSS edit silently reversed an earlier phase's fix is 008's replay — which has not been built and cannot run until all other phases complete.

**Verdict:** CONFIRMED — this is the program's central structural risk. If any phase between 000 and 006 introduces a cascade reversal that invalidates an earlier phase's work, nothing catches it until 008. Each phase closes its own criteria against a snapshot that no later phase is required to preserve.

**Consequence:** Phase 000 could pass all criteria, phase 001 could edit `styles.css` and silently reverse the token root's effect at line 27, and no gate would fire until 008. The cost of discovering this at 008 rather than at each lane handoff is weeks.

---

### F8 — Criteria that would pass on today's broken tree

**Claim:** Multiple criteria assert mechanism-based facts that are currently true even though the product is broken.

**Evidence:**
- **000/AC-007 (A7):** "Creating a floating surface outside `openSurface()` fails CI" — threshold "no such check exists". This is a criterion about a check's existence, not about a user-visible outcome. It would be "met" the moment the CI scan is wired up, regardless of whether the scan actually catches anything meaningful.
- **001/AC-008:** "The dead panel layout block ... and `db-anchored-popover` marker are deleted or made live" — closed by "census entry and the full recapture with human review, not by a measurement." This closes on a deletion, not an outcome.
- **005/AC-006 (A6):** "For every `width: max-content` declaration, resolve the element at runtime and walk its ancestors for a scrolling one" — the measured today value is "31 declarations, unclassified." This is a classification task, not a user-visible measurement.

**Verdict:** CONFIRMED — these criteria would pass when their mechanism is implemented, without proving the user sees a different result. They are necessary infrastructure checks, but they are not outcome checks and should not be confused with evidence that the defect is fixed.

**Consequence:** A phase could close all its mechanism-based criteria while the user-visible defect persists — 1.3.1 in miniature.

---

### F9 — The `screenshots:verify` command never opens an image and is cited as a gate

**Claim:** design-system.md:198-199, roadmap.md:68-69, 000/plan.md:45, 001/plan.md:83-84 all say `screenshots:verify` "only proves a capture was regenerated after its hand-maintained source list changed. It never opens an image."

**Evidence:** The command is used as a pass/fail gate (001/plan.md:83: "`npm run screenshots` then `npm run screenshots:verify`"). The human review of changed PNGs is named separately as a requirement, but it is a prose instruction with no enforcement.

**Verdict:** CONFIRMED — `screenshots:verify` passes when captures exist and match the source list. It cannot detect a visual regression. The "human looks at the PNGs" step has no gate, no sign-off field, no tooling.

**Consequence:** If the human review is skipped (fatigue, time pressure, autonomous execution), the screenshots gate passes on the existence of files, not on their visual correctness. This is exactly what happened in 1.3.1: captures were regenerated and nobody noticed they showed the wrong thing.

---

### F10 — 009's mobile automation claim is asserted, not argued

**Claim:** 009/spec.md §3B states "Automated live verification on a real iOS or Android device is not achievable" and lists four blocks.

**Evidence:** The four blocks are:
1. `obsidian-local-rest-api` is `isDesktopOnly: true` — verified (009/spec.md:241).
2. CLI's `eval` is behind `isDesktopApp && window.electron` — stated as "read by the investigating agent, not by me" (009/spec.md:223-224). This is an inferred claim, not a verified one.
3. `obsidian://` has no eval action — plausible but not verified against the current app version.
4. No remote debugging port on mobile — stated as assumption (009/spec.md:219).

**Verdict:** PLAUSIBLE but not fully verified. Block 2 (the critical one — the `isDesktopApp` guard) is stated as having been read by a sub-agent, not by the spec author. Block 4 is an assumption. The spec is honest about these limits (it says "inferred" and "assumption"), but downstream consumers (008, the parent spec) treat the conclusion as settled.

**Consequence:** If mobile automation turns out to be possible (e.g. through a future Obsidian update that lifts the desktop guard, or through a web-clip/PWA mode), the program's decision to accept "honest emulation + manual review" as the phone story would need revision. Nothing in the program structure detects this.

---

### F11 — Stale line-number references across the spec tree

**Claim:** Multiple specs cite `styles.css` line numbers as evidence.

**Evidence verified against the actual file (19,261 lines):**
- `styles.css:19-27` (token root selectors): **CONFIRMED** — lines 19-27 are the nine selectors.
- `styles.css:32` (first `--db-*` declaration): **CONFIRMED** — line 32 is `--db-space-1: 2px;`.
- `styles.css:125` (block closing): **CONFIRMED** — line 125 is `}`.
- `styles.css:258` (`.db-owned-menu .db-menu-item`): **CONFIRMED** — line 258 is that selector.
- `styles.css:425-433` (dark theme override): **CONFIRMED** — lines 425-433 are the dark theme selectors using `:is()`.
- `styles.css:5071-5073` (292px width): **CONFIRMED** — shows `width: 292px; min-width: 292px; max-width: 292px`.
- `styles.css:9829-9852` (dead panel layout block): **CONFIRMED** — starts with `.note-database-container .db-filter-panel`.
- `architecture-findings.md` says first `--db-*` declaration is at `:32` — **CONFIRMED**.

However, `architecture-findings.md` §2 says "Design tokens are declared once, at `styles.css:32`" while `design-system.md` §2 says "The token block sits at `styles.css:19-27`." These describe different things (the selector list vs the first declaration) but a hasty reader could confuse them.

**Verdict:** Line references are CONFIRMED accurate as of this reading. But `styles.css` is 19,261 lines and every phase edits it. All line numbers go stale after the first edit and no spec has a mechanism to update them.

**Consequence:** After phase 000's cascade audit and dead-block deletions, every line number cited in phases 001–006 and in architecture-findings.md will be wrong. A developer following a spec after 000 has landed will grep, not seek, but an AI agent might trust the numbers.

---

### F12 — The `--db-timeline-row: 34px` type error in runtime-vars.css is cited nowhere in any acceptance criteria

**Claim:** 000/goal.md mentions it in passing, but no phase's acceptance criteria measure or gate on it.

**Evidence:** The only mention is in 000/goal.md:9: "one of which (`--db-timeline-row`) is set to a length when it is a **grid line index**." No AC-ID in any of the nine phases references `--db-timeline-row`. 000's AC-005 (A5) targets `--db-mobile-sheet-bottom` specifically; the timeline variable is not enumerated.

**Verdict:** CONFIRMED — this known harness defect has no criterion, so no phase is required to fix it.

**Consequence:** Timeline captures will continue to show incorrect band layout. If a phase's changes happen to affect timeline rendering, the captures will look wrong in a way that has nothing to do with the change, and the human reviewer (if they review at all) must distinguish the pre-existing timeline defect from a regression — a cognitive tax that increases the chance of missing a real one.

---

### F13 — The five "works by accident" checkbox sites have no blocking criterion until 004 runs, and 004 depends only on 000's honest harness

**Claim:** architecture-findings.md §7 identifies five checkbox creation sites that work only because their parent is classed one line earlier. 004/acceptance-criteria.md AC-012 and AC-013 are the criteria that catch them.

**Evidence:** 004 depends only on 000's Stage 1 (the honest harness), per parent spec.md:98 and 000/plan.md:333-335. The five borrowed-ancestor sites are not mentioned in 000's criteria at all — 000 fixes the harness and the token root but does not touch checkboxes. Between 000 Stage 1 completing and 004 starting, any refactoring that changes a wrapper around these five sites would silently break them with no gate.

**Verdict:** CONFIRMED — the five dangerous checkbox sites are in a protection gap between 000 and 004.

**Consequence:** The gap is small in a sequential execution, but in a parallel execution (004 and 005 can both start after 000 Stage 1), a change to a wrapper in any of these files could break checkboxes without a failing test.

---

### F14 — The openSurface registry does not exist and nothing gates the handoff from 000 to downstream phases

**Claim:** 000 creates the registry. 001, 002, 003, 006 depend on it. 008 reconciles against it.

**Evidence:** 000/acceptance-criteria.md AC-008: "no registry exists on the current tree." The handoff criteria (parent spec.md:125-134) require 000's criteria A1, A2, A7 to pass before downstream phases start. But the handoff table does not require AC-008 (registry equality) to pass before 001 starts — it requires A1 (tokens), A2 (token resolution), and A7 (CI scan). The registry could be incomplete when 001 begins.

**Verdict:** PLAUSIBLE — the handoff criteria from 000 to 001 (parent spec.md:129) cite "A1, A2, A7" but not AC-008. Phase 001 depends on the factory and the token root but could start with an incomplete registry if 000 closes A1/A2/A7 before finishing the Stage 6 re-census.

**Consequence:** 001 could begin migrating surfaces against an incomplete registry. The overlap would be caught at 008 but not at the 000→001 boundary.

---

### F15 — The AnchorRef lease is designed in 000 and consumed by 003, but the handoff criteria do not include anchor-lease verification

**Claim:** 000/plan.md Stage 5 implements `AnchorRef`. 003 depends on it for the sheet glitch fix.

**Evidence:** Parent spec.md Phase Handoff Criteria (line 129): from 000 to 001 the criteria are "A1, A2, A7." From 000 to 004 the criteria are "A4, A5, A6." The anchor lease (000's AC-009, A9) is not in any handoff row. 003's dependency on the anchor lease is stated in 000/plan.md:325 ("003 depends on this") and 003/acceptance-criteria.md AC-010, but the parent handoff table has no row from 000 to 003 that gates on A9.

**Verdict:** CONFIRMED — there is a 000→002→003 chain in the handoff table (000→001→002→003) but the anchor lease criterion (A9) is never named in a handoff gate. 003's spec says it needs the lease, but the formal handoff structure does not enforce it.

**Consequence:** If 000 ships with a partial or broken anchor lease implementation but A1/A2/A7 passing, the handoff would proceed and 003 would discover the problem when it tries to build on it.

---

### F16 — Every "census" and "trace" criterion has no recorded failing number and can be accepted without one

**Claim:** The doctrine (architecture-findings.md §9, parent spec.md §6) says "A criterion is invalid unless … demonstrated to fail on the current tree first, with the failing number recorded." But many criteria across all phases are marked *census* or *trace* with the cell blank.

**Evidence:** 000/AC-008, AC-009, AC-010, AC-011, AC-012 all say "census" or "trace" with no failing number. Similarly in 001 (AC-009–AC-013), 002 (AC-008–AC-012), 003 (AC-010–AC-014), 004 (AC-009–AC-013), 005 (AC-009–AC-013), 006 (AC-009–AC-013), 008 (AC-001, AC-002, AC-004, AC-005, AC-007, AC-009, AC-010).

The acceptance criteria files all say: "each takes its failing value from the Stage-2 artefact before the criterion is accepted — the same rule 000 applies." But this is a forward commitment, not a current gate. No tooling enforces that the number must be recorded before the criterion is worked on.

**Verdict:** CONFIRMED — the criteria's own doctrine says a blank failing-number cell blocks acceptance, but the cells are blank now and the enforcement is prose. An eager implementer could satisfy the measurement threshold without ever recording what the measurement was before.

**Consequence:** Without the before-number, a passing criterion proves only that a number is within threshold, not that it changed. This is the class name / call count trap in numerical clothing.

---

### F17 — 008's temporal validity criterion (AC-010) has no implementation path

**Claim:** 008/acceptance-criteria.md AC-010: "No replay result is admissible unless it was produced after the last edit to every lane it depends on. Compare each recorded result's input hashes against the current tree." Measured today: "nothing records input hashes today."

**Evidence:** No existing gate, script, or CI step records input hashes for any artefact. 008's plan would need to build this capability from scratch. The threshold is "0 results carried forward across a lane edit; 0 gates satisfied by a stale artefact."

**Verdict:** CONFIRMED — this is the most ambitious criterion in the program and has no prior art in the codebase. It requires every phase's evidence to be content-addressed and every replay result to be traceable to its inputs. Building it is 008's job, but 008 is also responsible for the replay itself, the parity traces, the compatibility retirements, the capture review, and the operator device review. It is the most loaded phase.

**Consequence:** If 008 is time-pressured, temporal validity is the criterion most likely to be waived or weakened, and it is the only criterion that prevents the program's central failure mode: a later CSS edit silently reversing an earlier phase's fix.

---

## ADDITIONAL OBSERVATIONS

### O1 — The `--db-header-height` variable in runtime-vars.css:24

Set to `40px` in the capture harness but 005/acceptance-criteria.md AC-005 says "never assigned in `src/`; the only assignment is `runtime-vars.css:24`." This means the header height in every capture is a fixed stub, not a measured value. A view-switch that changes the header height in production would not be visible in captures. This is a known defect (005 names it) but, like F12, it has no upstream gate.

### O2 — The 196 captures fingerprint `styles.css` but not the harness files

Every capture fingerprints the stylesheet (if a line changes, the capture must be regenerated). But the captures do not fingerprint `runtime-vars.css`, `.storybook/preview.ts`, or `verify-placement.mjs`. A harness change that alters what the captures show does not trigger a recapture.

### O3 — No phase has a vitest-enforceable criterion

The spec repeatedly notes `vitest` runs `environment: "node"` with no jsdom. All DOM assertions live in the browser harness. The vitest suite (410 tests) tests pure logic only. This means the entire unit test suite is structurally irrelevant to every criterion in the program. The phrase "Unit: `npx vitest run` exit 0, no reduction in count" appears in every phase's quality gates, but it is a regression guard, not evidence for any criterion.

---

## CORRECTIONS TO THIS REVIEW

Two claims here were checked against the source and found wrong. Both were confirmed by reading the
files, not by argument.

**F17's "no prior art in the codebase" is false, and it makes the fix cheaper.** The capture
pipeline already content-addresses its inputs: `tools/screenshots/capture.mjs:204` writes a
per-scenario `sourceHashes` map that includes `styles.css`, `:226` writes
`generatedFrom.stylesheet` (currently `styles.css@9732449e4746`), and
`tools/screenshots/verify.mjs:45-48` recomputes and compares them as sha256 truncated to 12. So
`000` generalises an existing convention rather than inventing content-addressing from nothing.
The real gaps are narrower and still stand: the `sources` list is hand-maintained, the harness files
(`runtime-vars.css`, `.storybook/preview.ts`, `verify-placement.mjs`) are unfingerprinted — which is
O2 — and nothing ever opens an image.

**F9 is confirmed by the source's own comment**, which is stronger evidence than the review gave.
`verify.mjs:15` states it "compares fingerprints rather than image bytes deliberately", and its only
PNG operation is `existsSync`. The gate is working exactly as designed; the design cannot see a
visual regression.

**`~19,100 lines` was stale.** `wc -l styles.css` reports **19,261**. Corrected throughout.

---

## VERDICT

**Would this program catch its own failure?**

No, not as currently constructed. The program diagnoses the 1.3.1 failure with remarkable precision — it correctly identifies that harnesses wrap subjects in the container that supplies tokens, that `screenshots:verify` never opens an image, that the CI assertion certifies the defect, and that mechanism-based criteria are worthless. It then builds an elaborate criteria doctrine (the nine dimensions, the proof tuple, the negative controls) designed to prevent exactly that class of failure.

But the program has a structural circularity it cannot escape: the instrument it uses to verify the fix is the instrument the fix modifies. Phase 000 repairs the harness and then measures its own work through that harness. Phase 008 replays everything but does not exist until the end. Between those two, each phase closes its own criteria against a `styles.css` snapshot that no later phase is required to preserve, with no temporal validity check until 008 builds one. The CSS lane serialisation is a convention with no enforcement. The `screenshots:verify` gate passes on file existence, not visual correctness. The human PNG review has no tooling. And the mobile story rests on assumptions that are honestly labelled but never verified.

The program is far better than what it replaces — it would catch a class-name-only criterion, a hardcoded runtime variable, and an inverted assertion. But it would not catch a harness repair that is subtly wrong in a way that makes everything pass, a cascade reversal introduced by a later phase that 008 has not yet been built to detect, or a capture that shows the wrong thing and is reviewed by an operator who has seen 196 PNGs and stopped looking. Those are the exact failure modes of 1.3.1, dressed differently.
