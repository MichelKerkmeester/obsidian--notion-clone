---
title: "Implementation Summary: Surface Contract and Truthful Harness"
description: "Nine of forty-one tasks verified real against the tree — a defect-certifying assertion inverted, the desktop cascade wired up, one token-root fix shipped — while the live cross-check this phase calls its own most important safeguard has not run."
trigger_phrases:
  - "000 implementation summary"
  - "surface contract truthful harness summary"
  - "widthless caller inverted"
importance_tier: "critical"
contextType: "verification"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/000-surface-contract-and-truthful-harness"
    last_updated_at: "2026-08-30T19:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Verified 9 harness tasks; wrote impl-summary; corrected spec.md Status"
    next_safe_action: "Run Phase 1.5 live cross-check (T7e-T7g) against 009 before Stage 2"
    blockers:
      - "Phase 1.5 live cross-check against 009 has not run; Stage 1 claims are uncorroborated"
    key_files:
      - "spec.md"
      - "tasks.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-000-impl-summary"
      parent_session_id: null
    completion_pct: 50
    open_questions:
      - "T14 and T18 read Closed in tasks.md prose but their checkboxes stay open; T14 states no reason"
      - "Whether commit 52e96cc's bundled recapture discharges css-lane.json's outstanding db-surface debt"
    answered_questions:
      - "All nine tasks in the dispatch's verification table independently confirmed against the tree"
---
# Implementation Summary: Surface Contract and Truthful Harness

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 000-surface-contract-and-truthful-harness |
| **Level** | 3 |
| **Status** | In progress — 9 of 41 tasks discharged, 2 under way, 30 untouched |
| **Completion figure** | **50**, derived 2026-09-02 from `goal.md`'s checklist under `../roadmap.md` §3.2 — 5 of 10 rows ticked. It read 20 here, a pre-checklist value the task fraction was standing in for |
| **State** | Stage 1 harness-truthfulness repairs committed (`14fc433`, `6bc121a`, `4928626`, `1cc397c`, `65ab2b9`, `58b3c13`, `0a38723`, `52e96cc`). Phase 1.5 live cross-check, Phase 2 production implementation and Phase 3 verification have not started; `checklist.md` and `acceptance-criteria.md` are unchanged from their pre-work state |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

Nine of this phase's forty-one tasks are real, independently verified against the current tree: a
defect-certifying test assertion inverted and guarded against a silent revert, three browser-harness
gaps closed so the desktop and phone checks can see what production actually renders, a scan that
catches a harness value contradicting the runtime's own computed output, an evidence-hash recorder, a
guard protecting five borrowed-ancestor checkboxes, and one shipped production fix — a token-root
selector that gives design tokens back to 73 body-mounted overlay classes. The other thirty-two
tasks, including the live cross-check this phase's own spec calls its most important safeguard, have
not started.

### The nine verified tasks

| # | Task | What changed | Verified |
|---|---|---|---|
| 1 | T0 | `verify-placement.mjs`'s widthless-caller assertion inverted from `wr.width > 320` (required the 520px default) to `wr.width <= 320`, marked "EXPECTED TO FAIL until the width policy lands" | Read at `verify-placement.mjs:305-318`; the file's own comment names the defect it used to certify |
| 2 | T0a | `tools/live/guard-inverted-assertions.mjs` bans the old `pass: wr.width > 320` predicate by regex and exits 1 if it returns | File read in full; committed `14fc433` |
| 3 | T1 | `.mobile-navbar` (72px) and `--safe-area-inset-bottom` (34px) added to the phone harness page | `mobile-navbar` × 8, `safe-area-inset-bottom` × 6 in `verify-placement.mjs` |
| 4 | T2 | `styles.css` now loads on the desktop geometry page, not only the phone one | `styles.css` × 25 references in `verify-placement.mjs` |
| 5 | T3 | The phone checks drive `positionToolbarPopover` against a real anchor instead of asserting a fallback | `positionToolbarPopover` × 29 references in `verify-placement.mjs` |
| 6 | T4a | `tools/screenshots/scan-pinned-values.mjs` flags a harness value that contradicts an unassigned CSS fallback | File exists, wired as `npm run screenshots:scan-pinned`; committed `6bc121a` |
| 7 | T7b | `stamp()`/`fingerprint()` in `tools/live/evidence.mjs` content-address a recorded measurement against the files it was read from | Both functions read directly; committed `58b3c13`, `0a38723` |
| 8 | T7d | `checkbox-borrowed-ancestor.test.ts` pins the five classless checkbox call sites to the ancestor class each one borrows | Test file, `checkbox-appearance.json` and `checkbox-inventory.json` all present; committed `4928626`, `1cc397c`, `65ab2b9` |
| 9 | T15 | `.db-surface` added to both the light token-root selector list and the separate dark `:is()` block | `styles.css:33` (light) and `styles.css:711` (dark); committed `52e96cc` |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

T0 landed first, as the phase's own task notation requires — "T0 precedes everything." Every later
measurement in this phase is read through the harness T0 begins repairing, and the widthless-caller
check was the one place a defect was certified as correct on every push, through
`.github/workflows/gates.yml:67`. Its guard, T0a, exists specifically because the inversion is four
lines in a file three later phases (`001`, `002`, `003`) all edit, and a routine rebase conflict
resolution reverts exactly that kind of change without anyone noticing.

Each of the nine closed tasks follows the discipline the phase's task notation states: no task closes
on "looks right," and each cites a number that was read or a command whose exit status was read. T4a
is the clearest example of that discipline changing the plan mid-task — the rule as originally scoped
("no harness file assigns a property the runtime also assigns") flagged 41 declarations on its first
run, which would have deleted the harness's own stand-in values and broken its purpose, since a
screenshot runs no plugin and needs something to stand in for its computed output. The rule was
rewritten to flag only a harness value that contradicts an unassigned CSS fallback; that version found
five real contradictions with zero false positives. T7d's guard needed a second attempt for a related
reason: the first mutation search used an eight-space indent against a file that uses four, so the
guard "passed" against a file that had never actually been changed, and was redone by line number.

T15 is the one task in this group that changes shipped product CSS rather than harness code. It was
committed together with a bundled recapture of the affected view screenshots (`52e96cc`: 18 changed
PNGs plus `screenshots/manifest.json`), and the commit message independently states the same
seventy-of-seventy-three, then seventy-three-of-seventy-three split the task's own evidence records,
plus the seventeen surfaces the token fix alone does not reach because their styling is addressed
through an ancestor class rather than the surface itself.

All nine tasks are committed to `main`; `styles.css` and every touched harness file are clean in the
working tree as of this write-up.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| T0 lands before every other task in the phase | Every later measurement in this phase is read through the harness this task repairs; a repaired harness that cannot itself be shown failing first proves nothing about what it measures |
| T4a's rule rewritten mid-task, from "no assignment of a runtime-computed property" to "no value that contradicts an unassigned fallback" | The literal rule as scoped would have flagged the harness's own 41 stand-in values; deleting them would have broken the harness's purpose |
| T1's navbar fixture height set to 72px, not the more natural 48px | The positioner's own fallback is a hardcoded 50px; a 48px harness navbar sits 2px from that fallback, so the check would pass whether or not the code actually read the page. 72px separates the two by 56px |
| T7d's mutation control redone by line number after an indent-based search silently no-op'd | The first attempt searched for an 8-space indent in a file that uses 4-space indentation, so the guard "passed" against an unmodified file |
| T15 added `.db-surface` to both the light selector list and the separate dark `:is()` block | The dark root is a distinct selector list; adding the class to only one root would have fixed the token in one theme and left the other exactly as broken |
| T0a's guard reads the source text for a banned predicate rather than a git diff or a test result | Cheaper than rediscovering the same regression later, and built specifically to survive the four-line rebase conflict that reverted the fix once already |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|---|---|
| T0 / T0a — inverted assertion and rebase guard | Read directly: `wr.width <= 320` at `verify-placement.mjs:317`, was `> 320`; `guard-inverted-assertions.mjs` bans the old predicate by regex. Committed `14fc433` |
| T1 — navbar and safe-area fixtures | `.mobile-navbar` × 8, `--safe-area-inset-bottom` × 6, read directly in `verify-placement.mjs` |
| T2 — desktop `styles.css` load | `styles.css` × 25 references, read directly |
| T3 — `positionToolbarPopover` driven on phone checks | 29 references, read directly |
| T4a — pinned-value scan | `tools/screenshots/scan-pinned-values.mjs` exists; `npm run screenshots:scan-pinned` wired in `package.json:28`. Committed `6bc121a` |
| T7b — evidence hash recorder | `stamp()` and `fingerprint()` read directly in `tools/live/evidence.mjs`. Committed `58b3c13`, `0a38723` |
| T7d — checkbox-parent guard | `checkbox-appearance.json`, `checkbox-inventory.json`, `checkbox-borrowed-ancestor.test.ts` all present on disk. Committed `4928626`, `1cc397c`, `65ab2b9` |
| T15 — `.db-surface` token root | Present in the light selector list (`styles.css:33`) and the dark `:is()` root (`styles.css:711`). Committed `52e96cc`; the commit message independently states the same 70/73 → 73/73 split |
| `node tools/screenshots/verify.mjs` (read-only, run for this write-up) | Exit 0 — "228 entries match their sources, and none is blank or identical across themes" |
| Full gate — `npm run gate`, `npx tsc --noEmit`, `npx vitest run`, `npm run storybook:placement`, live cross-check vs `009` | **Not (re)run for this write-up.** `checklist.md`'s own Verification Summary records all of these as "not run," and nothing here changes that record |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

**Eight of the nine tasks are instrumentation. The one product fix is explicitly partial.** T15
makes `--db-radius-lg` and the rest of the token scale resolve non-empty on 73 of 73 census-covered
overlay classes. The task's own note is explicit that this does not mean those surfaces look right:
17 of the 73 still compute differently once tokened, because their rules are addressed through an
ancestor class rather than the surface itself — a defect T17 (unstarted) exists to fix. Reading the
token-root fix as "the surfaces are correct now" would repeat the exact error this phase was written
to prevent.

**Phase 1.5 — the safeguard this phase's own spec calls its most important — has not run.**
`spec.md`'s executive summary states that Stage 1 repairs the harness and then measures its own work
through that same harness, and that a repair "subtly wrong in a way that makes every check pass is
indistinguishable from a correct one when the harness is the only witness." The three tasks that
exist to close that gap — confirming `009`'s live baseline (T7e), pairing every reachable surface's
harness number against it (T7f), and writing the uncorroborated list (T7g) — are all unchecked. None
of the nine tasks verified above has been cross-checked against the running app yet. `AC-013` in
`acceptance-criteria.md` records this directly: "no live pair exists on this tree; `009` has not run."

**The `.db-surface` recapture: the lane journal and the capture record disagree, and this could not
be fully reconciled.** `tools/lane/css-lane.json` released the CSS lane immediately after the T15
edit with the note: "Released with a debt: the `.db-surface` edit has NOT been recaptured and no PNG
has been signed off. The screenshots on disk predate it. 000 owes that recapture and it is not
discharged by this handover." That same debt is still named in the file's `outstanding` list as of
its most recent entry, a full day and roughly a dozen phases later. Against that, `capture-review.md`'s
"Release 2 — token boundary" section describes 19 changed images reviewed and verdicted for this exact
change, and commit `52e96cc` (the T15 commit itself) bundles 18 changed screenshot PNGs and
`screenshots/manifest.json` alongside the `styles.css` edit — direct evidence a recapture happened at
commit time. Running `node tools/screenshots/verify.mjs` now reports all 228 captures fresh against
the current tree, which is consistent with a recapture having occurred but does not by itself prove
the `.db-surface` increment specifically was the one reviewed, since every later phase's release also
recaptures. What both records agree on: no human operator has signed off any of these images on a
device. **UNKNOWN: whether the lane journal's outstanding entry is a stale bookkeeping line the
commit already discharged, or whether it is correctly warning that the capture-review entries were
written against a recapture that did not actually happen.** What would settle it: comparing today's
on-disk bytes for the 18 affected view PNGs against the versions recorded in commit `52e96cc`, or the
operator's own device-level review, which both records agree has not happened either way.

**`checklist.md` and `acceptance-criteria.md` were not updated by this phase's work and are not
touched by this write-up.** Every one of the 20 acceptance criteria still reads `Unmet`, and
`acceptance-criteria.md`'s own closure statement still reads "Closeable: No. Work has not started" —
a claim this summary's own evidence contradicts, but correcting it was not in the scope given for this
write-up (`spec.md`'s Status field only), so it is left as-is. `checklist.md`'s Verification Summary
table lists every gate — `tsc`, build, `vitest`, the browser harness, the live cross-check, the
inversion guard, the pinning scan, the blank-cell checker, the checkbox guard, recapture-plus-human-
review, `story:smoke`, working-tree cleanliness — as "not run." All 20 criteria do carry a recorded
pre-fix failing number, verified by reading the table directly (29/29 differ; 87 selectors / 124
conflicts; 4 pinned runtime values; and so on for the rest), so none of this phase's criteria were
accepted without a documented baseline. None of the 20 has a recorded post-fix passing number yet;
filling that column is T27's job, in Phase 3, which has not started.

**Two tasks beyond the verified nine are mid-flight and are not counted as complete.** T4b (the
capture-fingerprint extension) is marked `[~]`: the code is written, but its own evidence — that
editing a harness file reports the affected captures stale — cannot be taken until the T4 recapture
happens, and T4 itself is unstarted. T19 (the anchor-lease state machine) is also `[~]`: the
four-state machine exists and is tested, but the task's own text says it closes only on a survival
test against a real `refresh()`, and what exists so far is proven only against a resolver that swaps
an element, which the task explicitly distinguishes from a real refresh.

**Four Phase 2 tasks (T12, T13, T14, T18) carry a "Closed" or "Half done" narrative in `tasks.md`
while their checkboxes remain unchecked.** T13's text explains its own gap (the owned menu still
installs a private listener pair whose retirement needs a call-site change the stage deliberately
defers). T18's text explains its gap too (proven against a fake resolver, not the wholesale
`refresh()` its own evidence bar names). T12's text names one unproven claim (byte-identical placement
against the legacy path). **T14's text gives no stated reason for its open checkbox** — its control
run (a `topLayer` mount selection failing `tsc` with a named probe file, then passing once removed)
reads as satisfying its own evidence bar in full. **UNKNOWN: whether T14's checkbox is simply
unflipped, or an unstated bar is still open.** This summary's "what was built" section credits only
the nine boxes actually checked as shipped, and does not count T12–T14, T18, T4b or T19 as complete.

**The mechanism meant to prevent exactly this kind of stale-status problem does not exist yet.** T7c
— the blank-cell checker that AC-020/A18 names, which refuses a `Planned` → `In Progress` transition
while any *census*/*trace* criterion has an empty "today" cell — is unstarted. It would not have
caught this particular contradiction on its own (a `Planned` status next to nine checked tasks is a
different failure shape than a blank measurement cell), but its absence means nothing today enforces
the discipline this phase exists to establish.

<!-- /ANCHOR:limitations -->
