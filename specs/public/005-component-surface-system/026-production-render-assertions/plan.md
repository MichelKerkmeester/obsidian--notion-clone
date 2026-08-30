---
title: "Implementation Plan: Production Render Assertions"
description: "Build the controls before the assertions, reuse the bench mechanism rather than a second one, cover two renderers and both host bags, then wire one gate entry."
trigger_phrases:
  - "026 plan"
  - "render assertion harness plan"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/026-production-render-assertions"
    last_updated_at: "2026-08-30T17:00:00Z"
    last_updated_by: "007-harvest"
    recent_action: "Plan written; stage order fixed so controls precede assertions"
    next_safe_action: "T1 — stand up the runner skeleton and make N2 fail"
    blockers: []
    key_files:
      - "plan.md"
      - "tools/bench/run-list.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026-plan"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Production Render Assertions

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

This phase ships no behaviour. It ships the ability to notice one.

The order is not arbitrary. **The controls come before the assertions**, because a harness written
first and falsified afterwards has already had the chance to be shaped by what it can see. N2 — the
substituted-fixture control — is built at the same time as the runner skeleton, before a single
product assertion exists, and it is the deliverable that would be most tempting to defer.

The second ordering rule: **reuse, do not rebuild.** `tools/bench/run-list.mjs` already esbuilds a
production renderer and drives it in headless Chrome. A second bundling pipeline beside it would be
the failure this program spent a phase deleting — an abstraction standing next to a working one.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Pass condition |
|---|---|---|
| Types | `npx tsc --noEmit` | exit 0, output read without a pipe |
| Unit | `npx vitest run` | exit 0, test count not reduced |
| Tool lint | `npm run lint:tools` | exit 0 |
| Comment hygiene | `node tools/naming/scan-comments.mjs` | exit 0 |
| Control arming | each of N1–N6 run against a scratch tree | **each fails.** A control that passes its mutant is theatre and this phase does not close |
| No visible change | `npm run screenshots` then human review | captures byte-identical. This phase edits no product file, so a non-identical capture means something unintended was touched |
| Lane | `npm run lane:check` | **not held by this phase** |

**Read exit codes without a pipe.** `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status rather than the command's — the trap `tools/gate.mjs:9` exists to name.

### Comment hygiene — hard block

No spec path, packet number, phase number, task id, ADR id or requirement id in any code comment this
phase writes. This binds the runner, every fixture and every control. Keep the durable *why*: a
comment may explain that a renderer is bundled rather than reimplemented because a hand-copied
renderer would prove the copy — it may not say which criterion asked for that.

### Scope boundary — hard block

This phase writes under `tools/` and in its own spec folder. It does not edit `src/`, `styles.css`,
or any sibling phase's documents. If a product defect is found while building the harness, it is
**recorded** and left; finding a defect is this instrument's purpose, and fixing it here would mean
the instrument's first act was to make itself unnecessary to prove.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### The mechanism already exists and is not being replaced

`tools/bench/run-list.mjs` does four things this phase needs: writes an entry that imports from
`src/views/`, esbuilds it (`:85`), launches Chrome through `playwright-core` (`:120`), and exits
non-zero when a threshold is crossed (`:187-193`). `tools/bench/list-render-bench.ts` supplies the
fifth: a fixture shape taken from a real database rather than invented, and an `App` of `undefined`
with the consequence recorded in place (`:171-173`).

The new runner reuses all of it. What changes is what comes back from the browser: **structural
facts with thresholds** instead of milliseconds.

### Assert at the renderer boundary, and say so

`DatabaseView` extends Obsidian's `FileView`; `EmbeddedDatabaseRenderer` extends
`MarkdownRenderChild`. Both need a live `App`, a workspace and a metadata cache, which is exactly why
the screenshot harness renders hand-written markup instead. The renderers do not — that is the
property the bench discovered and this phase exploits.

So the harness constructs **renderers**, and reproduces the hosts by their **action bags**, which are
plain objects and can be built twice. It does not construct the hosts. AC-8 requires the runner to say
this in its own output, because a harness whose limits live only in a spec document will be quoted
past them.

### Both bags, one renderer, one run

The file view builds `ListRenderer` with 26 members (`src/views/database-view.ts:785-813`); the embed
builds it with 18 (`src/views/embedded-database-renderer.ts:465-483`); nine members are file-view
only. The harness drives the same renderer twice, once per bag, and asserts on both outputs.

This is what makes an embed-only regression visible. It is also, deliberately, the smallest useful
form of the finding that the list-view packet does not mention the embed host at all
(`../007-architecture-research/harvest.md` §4 O1). This phase does not fix that packet — it makes the
consequence measurable.

### What the assertions are about

Structural properties of what the renderer builds, not snapshots:

| Property | Why it and not a snapshot |
|---|---|
| Node count per row, by kind | A snapshot of DOM is a second copy of the renderer; a count moves when the renderer changes shape and is stable when it does not. This is the property the freeze moved — 120,007 nodes to 75,207 (`173819e`) |
| Row-level affordance presence, per bag | The nine-member bag difference has to land somewhere observable or it is not a difference worth asserting |
| Column index of a given field across rows | The alignment invariant `024` measured, and the one a reservation change silently breaks |
| Forced-layout count during the row loop | The exact defect that shipped; a count of 0 inside the loop is the shape-level assertion AC-6 asks for |

The fourth is the one worth spending effort on, because it generalises: a forced synchronous layout in
an append loop is quadratic in any renderer, not just this one.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Six implementation units for this packet. They are not program phases and this packet has no
children — `recommend-level.sh` scored the phase recommendation at 10 of 50 against a threshold of
25.

#### Phase 1 — Runner skeleton, and the substitution control first

Stand up a runner under `tools/live/` that bundles a production renderer through the esbuild path
`tools/bench/run-list.mjs:85` already uses, and make it **refuse input that did not come from a
bundled `src/views/` module**. Arm N2 here, by handing it a fixture DOM lifted from
`tools/screenshots/scenarios/`, before a single product assertion exists. This is the deliverable
most tempting to defer and the one that decides whether the phase means what its title says.
Exit signal: N2 observed failing.

#### Phase 2 — First assertions under the file-view bag

Build the 26-member `ListRendererActions` shape from `src/views/database-view.ts:785-813` as data,
not by importing the host. Assert node count per row by kind, the column index of a named field
across every row, and zero forced synchronous layouts inside the row-append loop. Exit signal: N1
observed failing.

#### Phase 3 — The second host bag

Build the 18-member embed bag from `src/views/embedded-database-renderer.ts:465-483`, run every
Phase 2 assertion under it, and report the nine file-view-only members by name rather than letting a
diverging count imply them. Whatever the comparison surfaces is **recorded and left**: a defect found
on the instrument's first run is the best evidence the instrument works, and fixing it here would
breach §2's scope boundary. Exit signal: N4 observed failing.

#### Phase 4 — Second renderer

Extend to `TableRenderer`, reusing `tools/bench/table-render-bench.ts:30`'s import where it fits, and
run it under both bags. Exit signal: AC-2 reads 2 of 22 from command output.

#### Phase 5 — The historical control

Run against `173819e^` in a detached worktree and require red; run against `HEAD` and require green.
Record the **shape** — that the check distinguishes the trees — not a millisecond budget, which
belongs to `tools/bench/run-list.mjs:44` and stays there. Exit signal: N3 observed failing.

#### Phase 6 — Gate entry and ratchet

One entry in `tools/gate.mjs` `CHECKS`, and the coverage number published through the evidence stamp
so `tools/live/evidence.mjs --check-all` dates it. Exit signal: N5 and N6 observed failing, then
`npm run gate` green with its exit status read without a pipe.

### Where stopping is legal

Stopping after Phase 3 leaves the tree better than it found it: one renderer, both bags, run by hand.
Stopping after Phase 1 does not — a runner with no assertions and no gate entry is an unwired module,
and this program has already deleted one of those (`../001-overlay-placement-and-menu-language/spec.md` §13).
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING

`npx vitest run` is **not evidence for any criterion in this phase.** It runs `environment: "node"`
with no jsdom (`vitest.config.ts:14-17`), so it cannot assert anything about a rendered surface. It
remains a regression guard for the pure logic the runner may need, and nothing more.

Everything else is the runner itself, plus the six controls in
[`acceptance-criteria.md`](acceptance-criteria.md) §3. Each control is run against a scratch tree and
the tree restored by hash, with the restoration recorded.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Needs | State |
|---|---|
| `tools/bench/run-list.mjs` bundling pipeline | exists |
| `playwright-core`, `esbuild` | already dependencies (`tools/bench/run-list.mjs:36-37`) |
| A system Chrome, or `SCREENSHOT_CHROME` | the convention `REPO RULES.md` already sets |
| `tools/gate.mjs` | exists; one entry added at Phase 6 |
| `tools/live/evidence.mjs --check-all` | exists and is gated (`tools/gate.mjs:52`); consumes the coverage stamp |
| The CSS lane | **not needed** |
| `000`, `008` or `009` to land first | **not needed.** This phase is independent, which is most of why it is worth doing now |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK

Every stage is additive under `tools/`, plus one line in `tools/gate.mjs` at Phase 6. Rollback is deleting
the new files and that line; no product file changes, so nothing to revert in `src/` or `styles.css`
and no captures to restore.

The one irreversible act is social: once a gate check exists, a later phase may quote it. AC-8 is the
mitigation — the runner states its own limits in its output, so the quote carries them.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:critical-path -->
## 8. CRITICAL PATH

`P1 + N2 → P2 + N1 → P3 + N4 → P4 → P5 + N3 → P6 + N5 + N6`

The path is serial by design. Each phase's control is armed inside the phase that could break it,
never afterwards, because a control written after the thing it checks is a control shaped by what the
thing happens to do.
<!-- /ANCHOR:critical-path -->
