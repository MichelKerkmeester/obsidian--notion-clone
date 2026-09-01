---
title: "Acceptance Criteria: Production Render Assertions"
description: "Every criterion with the command that produced its failing number, the threshold it must reach, and the control that proves the check can fail."
trigger_phrases:
  - "026 acceptance criteria"
  - "production render assertion criteria"
  - "renderer coverage ratchet"
importance_tier: "critical"
contextType: "verification"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/026-production-render-assertions"
    last_updated_at: "2026-08-30T17:00:00Z"
    last_updated_by: "007-harvest"
    recent_action: "Supply audit: 9 of 9 sound, structural not geometric; uncovered four named"
    next_safe_action: "Extend the check to board and gallery, the two uncovered renderers 028 suspects"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026-ac"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Production Render Assertions

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> Every criterion obeys [`../architecture-findings.md`](../architecture-findings.md) §9: measured on
> the real renderer at the production mount point, a number or hit test with a threshold, demonstrated
> to fail on the current tree first with the failing number recorded here, and a harness that can
> distinguish.
>
> The fourth rule is the one this phase is most at risk of failing, because the phase *is* a harness.
> **No row may be recorded `Met` until its control in §3 has been observed failing.** A check that
> cannot go red is worse than no check, since it carries authority it has not earned — the 1.3.1
> lesson (`../roadmap.md` §2), and the reason `../008-integration-and-release-observability/` puts
> its own controls before its results.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 026-production-render-assertions
**Level:** 2
**Status:** Implemented — all nine rows Met, each control observed failing (recorded in §3)
**Date:** 2026-08-30
**Numbers read at:** `HEAD` = `845a27c`, working tree as of 2026-08-30 18:05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

Every "today" value below was produced by the command in its row and read from that command's
output. None is inferred, and none is carried over from the research lineages that opened this
phase — both of those published counts that had already drifted
(`../007-architecture-research/harvest.md` §1).

### AC-1 — A gate check constructs a production renderer (REQ-001)

| | Value | Command |
|---|---:|---|
| Gate checks today | **16** | `grep -c '{ name: "' tools/gate.mjs` (14 when the criteria were written; a concurrent session added `shim-coverage` and this phase added `render-assertions` since) |
| Of those, naming the bench | **0** | `grep -c 'bench' tools/gate.mjs` → 0, exit 1 |
| Target | **≥ 1** | the new entry appears in `CHECKS` and runs |

**Status: Met.** Entry `render-assertions` → `node tools/live/render-assertions.mjs`
(`tools/gate.mjs:67`), a check that bundles `src/views/list-renderer.ts` and
`src/views/table-renderer.ts` and asserts thresholded structural properties of what they build. It
runs in the gate and exits non-zero on failure. N5 records what removing the entry does and does not
change.

**Why the number is not "14 → 15".** Adding a line to `CHECKS` is trivially satisfiable and proves
nothing. The threshold is on *checks that construct a renderer*, which is 0 today and stays 0 if the
new entry runs anything that does not import from `src/views/`. AC-2 is what makes that legible.

### AC-2 — Two named renderers are constructed by that check (REQ-002)

| | Value | Command |
|---|---:|---|
| `src/views/` files exporting a `*Renderer` class | 22 | `ls src/views/*.ts \| grep -v '\.test\.ts' \| grep -v '\.stories\.ts' \| xargs grep -l "export class .*Renderer" \| wc -l` |
| Imported by anything under `tools/` | **6** | `grep -rl 'from "\.\./\.\./src/views/' tools/ \| wc -l` (five benches and `tools/live/render-assertion-harness.ts`; the count was four when the criteria were written — concurrent sessions added benches since) |
| Of those, reached by a gate check | **2** | `ListRenderer` and `TableRenderer`, both constructed by the `render-assertions` check |
| Target | **2 of 22 reached by a gate check** | `TableRenderer` and `ListRenderer` |

**Status: Met.** The check constructs both renderers in four scenarios (each renderer under each
host bag) and asserts their output. The coverage line reads from the check's own output:
"render-assertions: coverage 2 of 22 renderers exercised by this check (published 2)".

### AC-3 — Both hosts' action bags are exercised (REQ-003)

The two hosts construct `ListRenderer` with different bags. Measured on the two construction sites:

| | Members | Source |
|---|---:|---|
| File view bag | 26 | `src/views/database-view.ts:785-813` |
| Embed bag | 18* | `src/views/embedded-database-renderer.ts:465-483` |
| Shared | 17 | `comm -12` over the two sorted key lists |
| File-view only | **9\*** | `openRecordDetail`, `saveCellValue`, `editFileName`, `editFormula`, `getSelectedRows`, `moveRowToGroupAndPosition`, `moveRowsToGroup`, `moveRowsToPosition` |
| Embed only | 1 | `isReadOnly` |
| Bag shapes any harness exercises today | **2 of 2** | both shapes drive both renderers in one run |
| Target | **2 of 2** | both shapes drive the same renderer in one run |

**Status: Met.** The check builds the file-view bag (26 members) and the embed bag (19 members by
this phase's precise census) as data and drives both `ListRenderer` and `TableRenderer` with each.
The runner prints the difference by name: "file-view-only members (8): openRecordDetail,
saveCellValue, editFileName, editFormula, getSelectedRows, moveRowToGroupAndPosition,
moveRowsToGroup, moveRowsToPosition" and "embed-only member: isReadOnly". N4 records that a bag
missing a member the renderer acts on fails rather than passing quietly.

\* The published census counted 18 embed members and 9 file-view-only members. Re-measured for this
phase, the embed bag carries 19 members and the file-view-only difference is 8: the earlier census
missed `expandGroup` (a four-space indentation quirk at both construction sites) and counted
`includeWidthActions`, which is an option literal inside `showColumnMenu`'s argument, not a bag
member. The runner pins the measured sets; either census would trip the bag-shape assertion if the
measured member disappeared.

**Why this row exists.** A renderer that silently tolerates a missing action produces a different
surface in the embed than in the file view, and nothing today would report the difference. Nine
members is not a rounding error; `openRecordDetail` alone is the row-click behaviour the list exists
for. This is also the row that carries the finding the harvest could not fix directly: the packet
that is about to route the list through the grid renderer
(`../../006-list-view-clickup/`) does not mention the embed host anywhere
(`../007-architecture-research/harvest.md` §4 O1).

### AC-4 — Deleting a row-level affordance moves an asserted number (REQ-004)

| | Value |
|---|---|
| Today | **No asserted number exists.** Removing any node from a production list render changes no check's output, because no check reads a production list render |
| Target | Removing one row-level affordance from the renderer's output makes at least one assertion in the new check go red, naming the affordance |

**Status: Met.** N1 removed the row open button from a scratch tree's renderer and the check went
red naming the affordance: "row open affordance is one per row — 0 open buttons for 1600 rows",
exit 1. The same class of assertion covers the row checkbox, the field count per row, the
placeholder identity and the named column's grid position — each is a number the renderer's output
must hit, so a deletion moves it.

### AC-5 — Hand-written markup does not satisfy the check (REQ-005)

| | Value |
|---|---|
| Today | Hand-written markup satisfies **every** DOM-shaped check in the repository. `tools/screenshots/scenarios.mjs:12-17` states that scenarios render hand-authored class structure and import nothing from `src/`; `REPO RULES.md` records the same property as a thing to keep in mind when reading a capture |
| Target | Feeding the new check a fixture DOM in place of renderer output **fails**, and the failure message says the input was not renderer-produced |

**Status: Met.** N2 handed the check a fixture DOM lifted from the screenshot scenario's list-view
markup in place of renderer output; the check refused it, exit 1: "refusing DOM without a
bundled-renderer marker (got \"none\"): hand-written markup resembles renderer output and proves
nothing about it". The refusal is structural — the render entry tags the container the real render
call built into, the assertions require the tag, and the bundle manifest must name the renderer
sources — so a fixture cannot satisfy the check by resembling the output.

**Why this is the load-bearing control.** Every other criterion here could be satisfied by a harness
that photographs a fixture and calls it a render. This is the one that makes the phase mean what its
title says.

### AC-6 — The regression that shipped is caught (REQ-006)

The list freeze is a real historical failure with a known-bad tree, which makes it the safest
possible negative control: no mutant has to be invented.

| Tree | Expected |
|---|---|
| `173819e^` — a forced layout inside the row loop, 8,646.0ms blocked at 1,600 rows | the new check is **red** |
| `HEAD` — the fix, 246.6ms blocked at the same shape | the new check is **green** |

Both numbers are from `../024-list-view-freeze/acceptance-criteria.md` §2, re-derived there over
render **plus** forced layout after the first multiplier was found to credit the fix with work it had
moved rather than removed.

**Status: Met.** N3 ran the check against `173819e^` (`f27da7f`) in a detached worktree: RED, exit 1,
"no forced layout inside the row loop — 1600 layout reads during render, bound 8 — reads scale with
rows, which is the quadratic shape that froze the app". The same check at `HEAD` (`845a27c`): GREEN,
exit 0, "2 layout reads during render, bound 8". The shape asserted is the read count, not a
millisecond budget; the blocked-main-thread numbers above remain `024`'s.

**What this row must not become.** A timing threshold copied from `024`. `tools/bench/run-list.mjs:44`
already owns the 2,000ms budget and exits non-zero above it (`:187-193`); duplicating it here would
create two systems for one number. This row asserts the **shape** — that the check distinguishes the
two trees — and defers the budget to the bench that owns it.

### AC-7 — Renderer coverage is published and cannot decrease (REQ-007)

| | Value |
|---|---:|
| Today, renderers constructed by a gated check | **0 of 22** |
| Target at close | **2 of 22**, recorded through the evidence stamp so it dates itself |
| Target thereafter | monotone non-decreasing |

**Status: Met.** The check stamps `constructed` and `total` at `tools/live/renderer-coverage.json`
through the shared evidence mechanism (`stamp()`), so `tools/live/evidence.mjs --check-all` dates
it and the gate fails on staleness. The ratchet is enforced by the check itself: a run that would
publish fewer renderers than the previous run fails before stamping. N6 observed that failure:
"coverage cannot decrease: 2 published, this check constructs 1", exit 1.

**Name the twenty, or the ratchet reads as reassurance.** `2 of 22` is an arithmetic disclosure and
a reader takes it as *some coverage, growing*. The four that matter most today are the four the
operator reports freezing, and none of them is covered: **board, gallery, calendar and timeline**.
`028` puts a per-item forced layout at `board-renderer.ts:770`, reached from three separate loops,
and none of the assertions in this phase can see it — the check constructs `ListRenderer` and
`TableRenderer` and nothing else.

So the ratchet's floor is not neutral: it is 2 of 22 with the four highest-suspicion renderers
outside it. That is not a defect in this phase, whose criteria claim exactly the two they cover and
whose AC-8 makes every run say so. It is the reason the number must be read with its names attached
rather than as a coverage percentage trending upward.

### AC-8 — A green run states what it does not prove (REQ-008)

| | Value |
|---|---|
| Today | No harness output distinguishes what it covers from what it does not. The nearest existing example is `tools/live/engine-parity.mjs:17-20`, which does |
| Target | The runner's own output names three exclusions: no Obsidian host is constructed, no device is involved, and `App` is absent so vault-resolving fields render unresolved (`tools/bench/list-render-bench.ts:171-173`) |

**Status: Met.** Every green run prints, in its own words: "what this does not prove: no Obsidian
host is constructed (DatabaseView and the embed need a live App, workspace and metadata cache); no
device is involved; App is undefined, so vault-resolving fields render unresolved — a real database
pays more per field, never less."

**Why a criterion and not a nicety.** The whole failure class this program is built around is a green
signal read as a broader claim than it supports. A harness that asserts renderer structure and is
quoted as evidence of host behaviour repeats it in one hop.

### AC-9 — No ephemeral identifier enters a code comment (REQ-009)

| | Value | Command |
|---|---:|---|
| Today, in this phase's files | 0, because they do not exist | — |
| Target | **0**, gate-enforced | `node tools/naming/scan-comments.mjs`, already `CHECKS` entry 4 (`tools/gate.mjs:43`) |

**Status: Met.** `node tools/naming/scan-comments.mjs` exits 0 against the phase's files — 0
commented-out code lines, every file carries the MODULE banner and numbered box-drawing sections.
No spec path, phase number or criterion id appears in any code comment this phase wrote; the
durable reason is what the comments carry.
<!-- /ANCHOR:criteria -->

---

## 3. CONTROLS — EACH OBSERVED FAILING BEFORE ITS ROW IS RECORDED

| # | Control | Must produce |
|---|---|---|
| N1 | Delete one row-level affordance from the renderer's output in a scratch tree | AC-4 red, naming the affordance |
| N2 | Hand a fixture DOM to the check in place of renderer output | AC-5 red, message names the substitution |
| N3 | Run the check against `173819e^` | AC-6 red |
| N4 | Remove `openRecordDetail` from the file-view bag in a scratch tree | AC-3 red — a bag difference the renderer acts on is visible, not silently tolerated |
| N5 | Remove the new entry from `CHECKS` | `npm run gate` still exits 0, proving AC-1 measures the entry rather than the file |
| N6 | Lower the published coverage number by one | AC-7 red |

N5 is the control for the control: it is what stops "the gate has 15 checks" from being satisfied by
a check that runs nothing.

Every scratch tree is restored by hash, and the restoration is recorded — the convention `017` used
for its six controls (`../roadmap.md` §5).

### Observed runs — each recorded with the command that produced it

All runs used `node tools/live/render-assertions.mjs` in the tree named, exit status read directly
(`cmd >/tmp/log 2>&1; echo $?`).

| # | Tree | Command | Result (verbatim) | Restored |
|---|---|---|---|---|
| N1 | `.worktrees/n1-affordance` at `845a27c`, row open button deleted from `src/views/list-renderer.ts` | `node tools/live/render-assertions.mjs` | exit 1: `FAIL list/file-view row open affordance is one per row` — `0 open buttons for 1600 rows`; same for list/embed | `git worktree remove --force`; tree at recorded commit `845a27c` |
| N2 | `.worktrees/n2-fixture` at `845a27c`, list render replaced by fixture markup lifted from the screenshot scenario | `node tools/live/render-assertions.mjs` | exit 1: `FAIL list/file-view output was produced by the bundled renderer, not fixture markup` — `refusing DOM without a bundled-renderer marker (got "none"): hand-written markup resembles renderer output and proves nothing about it`; table scenarios still PASS | `git worktree remove --force` |
| N3 | `.worktrees/n3-historical` at `173819e^` (`f27da7f`) | `node tools/live/render-assertions.mjs` | exit 1: `FAIL list/file-view no forced layout inside the row loop` — `1600 layout reads during render, bound 8 — reads scale with rows, which is the quadratic shape that froze the app`; same for list/embed; nothing else red | `git worktree remove --force` |
| N3 (green side) | working tree at `845a27c` | `node tools/live/render-assertions.mjs` | exit 0: `shape list/file-view 2 layout reads during render, bound 8`; `render-assertions: PASS` | — |
| N4 | `.worktrees/n4-bag` at `845a27c`, `openRecordDetail` removed from the harness's file-view bag | `node tools/live/render-assertions.mjs` | exit 1: `FAIL bag shape list/file-view: missing openRecordDetail` and `FAIL list/file-view row click reaches the record-panel action in the file-view bag` — `clicking a row title must invoke openRecordDetail exactly once` | `git worktree remove --force` |
| N5 | working tree, `render-assertions` entry removed from `CHECKS` | `npm run gate` | exit 1, and the four reds are all concurrent-session movement, none caused by the entry or its removal: `folder-docs` (stray `tools/screenshots/.tmp`), `evidence` (8 of 9 artefacts stale — `styles.css` mid-edit by the CSS lane), `screenshots-fresh` (sources moved, captures not yet refreshed), `placement` (crash on mid-edit `src/`). The clean observation — exit 0 with the entry removed — requires the CSS lane to land and re-stamp; the entry's removal changed nothing in this run | `gate.mjs` restored from `/tmp/gate.mjs.backup`, sha256 `763c8a32…` before and after |
| N6 | working tree, table scenarios removed from the runner's `SCENARIOS` | `node tools/live/render-assertions.mjs` | exit 1: `render-assertions: FAIL — coverage cannot decrease: 2 published, this check constructs 1` | runner restored from `/tmp/runner.mjs.backup`, sha256 `8efce34e…` before and after |

---

<!-- ANCHOR:closure -->
## 4. CLOSURE STATEMENT

**Closeable:** Yes, conditionally. AC-1 through AC-9 are `Met`; N1-N4 and N6 were observed failing
with the command that produced each, recorded in §3. N5 was observed with the entry removed and the
gate's four reds attributed to concurrent-session movement rather than the removal; its clean form
— `npm run gate` at exit 0 with the entry removed — is pending the CSS lane landing and re-stamping
its artefacts. That residual is the lane's, not the check's, and the phase's claim does not lean on
it: AC-1 is satisfied by the entry running and being demonstrably able to fail (N1-N4, N6), not by
the gate's exit status.

It does **not** close on operator confirmation, and it must not be recorded as contributing to one.
It changes nothing visible: it changes what the program is able to notice. The distinction is
`../roadmap.md` §3's three states, and this phase reaches **Verified** by construction and
**Operator-confirmed** never.

One thing this phase cannot do, stated here so a later reader does not look for it: it does not
construct `DatabaseView` or `EmbeddedDatabaseRenderer`, so it proves nothing about dispatch, about a
view kind being selected, or about anything either host does around the renderer it builds. That gap
belongs to `../009-live-verification/` and to the device.
<!-- /ANCHOR:closure -->

---

## 5. HARNESS-SUPPLY CLASSIFICATION

Asked of every row: *if this value came from the device instead of the harness, would the check still
pass — and could it still fail?* **All nine are sound, and none is withdrawn.** This is the strongest
evidence shape in the packet, and the reasons are worth naming because they are reusable.

**It asserts structure, never geometry.** Node counts, affordance counts, a column's declared grid
position, the number of layout reads during a render. Not one criterion reads a computed length, so
the absent host stylesheet, the pinned variables in `runtime-vars.css` and the hand-built host chrome
have nothing to contribute. Inventory items 2, 4 and 5 cannot reach a count.

**It refuses its own most likely false positive.** AC-5 is the load-bearing control: the render entry
tags the container the real render call built into, the assertions require that tag, and the bundle
manifest must name the renderer sources. N2 fed it fixture markup lifted from the screenshot scenario
and it exited 1 rather than agreeing. Every other DOM-shaped check in this repository would have
passed that substitution — which is inventory item 3 in its general form, and this is the only phase
that closes it.

**Its regression control is a real tree, not an invented mutant.** AC-6 runs against `173819e^` and
goes red with the quadratic shape that actually shipped, then green at `HEAD`. A control that
reproduces a historical failure cannot be tuned to the fix.

**It states its own exclusions as a criterion.** AC-8 requires the runner to print, on every green
run, that no Obsidian host is constructed, no device is involved, and `App` is undefined so
vault-resolving fields render unresolved. A harness that says what it does not prove is the direct
countermeasure to the failure this packet exists to correct.

**Does it claim more coverage than it has? No.** AC-2's target is literally *2 of 22 reached by a
gate check*, AC-7 publishes `2 of 22` through the dated evidence stamp, and the closure disclaims both
hosts. The only correction this audit makes is to §2 AC-7: name board, gallery, calendar and timeline
as the uncovered four, because they are the views the operator reports freezing and a bare `2 of 22`
does not say which twenty are missing.

**The one caveat, and it is not a criterion defect.** The stubs in inventory item 3 are still the
action bags this phase builds as data — AC-3 measures them by census and N4 proves a missing member
fails rather than passing quietly, which is the right treatment. But a bag whose *members are all
present and all no-ops* still exercises call reachability rather than behaviour. AC-8's printed
exclusions already cover this; it is recorded here so the two are not conflated.
