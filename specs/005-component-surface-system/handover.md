---
title: "Session Handover: Component Surface System"
description: "Resume point: main is at b4be45bc, release 0.0.23 is cut (d3979cf5) and pushed to origin, carrying the sheet-inside-tap fix the twelve deferred rows were waiting on, the full list-renderer retirement, the settings-body grammar, the board card properties capture proof, the frozen bench clock, and 046's ADR-001/ADR-002 acceptance plus a partial capability landing. Not yet installed to the iCloud vault or operator-confirmed. `npm run gate` reads 25/25 green. Three worktrees carry uncommitted work discovered this pass and none has been read for content: 059 (046's stylesheet/code residual, 18 files), 062 (a new 048-stacked-sheets phase, scaffolded not committed), and 061 (047's Anytype/AppFlowy captures, untracked)."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-05T05:12:29Z"
    last_updated_by: "orchestrate-handover-18"
    recent_action: "Recorded 0.0.23: sheet-tap fix, list retirement, ADR-001/002 accepted"
    next_safe_action: "Continue 046: close AC-001/002/004/005 behind T002's answer"
    blockers:
      - "Rows 29-36, 39-41, 43: shipped in 0.0.23; operator device confirmation owed against it"
      - "Rows 37/38: the operator's own vault side-by-side; the in-repo half is MET"
      - "044 AC-006: operator reads the three sheets as aligned on iOS"
      - "045 AC-006: operator arranges a board card's properties, close to Notion's"
      - "046 AC-007: operator reads the Overview page's nested views as real databases"
      - "046 T016: operator call on whether writes ship behind a settings flag"
      - "006's 006 and 008: operator reports the migrated vault as working"
    key_files:
      - "specs/005-component-surface-system/goal.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "specs/005-component-surface-system/046-linked-views-notion-parity/tasks.md"
      - "specs/005-component-surface-system/046-linked-views-notion-parity/decision-record.md"
      - "specs/006-list-view-deprecation/008-docs-and-release/goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "046 T016: does the write capability ship behind a settings flag, per CHK-121"
      - "046 T002: can an embed reach reading-view content width without breaking prose around it"
    answered_questions:
      - "ADR-001 (may an embed write): Accepted 2026-09-05, full parity, operator verbatim \"Allow db writing from linked views\""
      - "045's two open questions: gallery does not share the mechanism (ADR-001); hiding a card field is cards only (ADR-002)"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

**Main is at `b4be45bc`, pushed, and `0.0.23` is cut** (release commit `d3979cf5`) but **not yet
installed** to the iCloud vault and **not operator-confirmed on any row**. `npm run gate` on this
checkout reads **25/25 green** (`operator-list` was regenerated this pass after drifting stale —
see Gotchas). `0.0.23` carries six lanes landed after `0.0.22`'s cut, in chronological order:

- **The tap-inside-sheet dismissal fix** (`3a77d523`, `308ba2d3`), root-caused and recorded at
  `66b69842`/`2be66ba5`: both views' outside-press dismissal read a portalled sheet as outside
  itself on `mousedown`, closing the sheet under the thumb and clearing the cell selection. This is
  the named blocker the operator's 2026-09-05 device check deferred rows 29-36, 39-41 and 43 on —
  the release-side half of that deferral is now met; the operator-side half (a fresh device check
  against `0.0.23`) is still owed.
- **The list renderer's full retirement** (`006-list-view-deprecation`'s child `007`), landed
  `6f2aef3f`, reconciled `ac7c78ac`, recorded `6dec09b9`/`3818298f`: `list-renderer.ts` is gone,
  `list-window` is absent from the gate's lane list (25, not 26), `renderer-coverage.json` carries
  its lowered floor with a reason, and `033`/`024` are both closed against the retirement. The
  retired view's stylesheet rules were dropped separately (`44e08bfb`, recorded `c871148c`).
- **The board/timeline bench's frozen clock** (`6bac9ce9`, recorded `15f79b70`): the timeline bench
  and its captures now read `renderNow()` instead of the real clock, so gantt/calendar renders stop
  drifting daily and no longer force a "restored to HEAD, real-clock drift" note on every
  reconciliation.
- **The settings sheet's own body grammar** (`4f090d2e`, recorded `5b6996da`/`07be64fe`): the
  `.db-view-config-body` shared row/segmented grammar now covers the settings sheet too —
  `sheet-grammar` is 7 surfaces × 7 elements, closing `044`'s AC-005 and, once `045`'s own capture
  registered against it, `045`'s AC-005 as well.
- **The board card properties capture and grammar proof** (`c0abb6ff`/`ba2b37f7`, plus the phone
  record-peek assertion `5c5e7f42` and the T015-onto-main proof `f240e8fa`/`2a7db8cf`): the
  Properties panel is photographed on desktop and phone, `board-card-properties` is registered in
  `sheet-grammar.mjs` at 7/7, and `045`'s AC-005 is `Met`.
- **`046-linked-views-notion-parity`'s ADR-001 and ADR-002** were Accepted 2026-09-05
  (`decision-record.md`) — operator verbatim *"Allow db writing from linked views"* — and its
  capability leg landed **partially** on main (`ec893e67`, reconciled `e544a2c5`): the duplicate
  title and collapse chevron are gone, and the four `persistMode === "codeblock"` read-only gates
  are now one `isViewReadOnly()` seam (10 → 3 survivors, all presentation). AC-003 and AC-006 are
  `Met`. AC-001, AC-002, AC-004 and AC-005 stay `Unmet`: the card border and embed width are
  untouched in `styles.css` pending `T002`'s unanswered host-layout question against real Obsidian,
  and move/create are code-complete but unmeasured on a device. `T016` (ship the write behind a
  settings flag, per `checklist.md` CHK-121) is a fresh, unasked operator call.

**A CI-adjacent fix also shipped**: `4ab702ee` stops the gate's drift check from failing on the
release-only bundle (`main.js`/`manifest.json`/`package.json`/`versions.json` changing together on
a release commit was tripping a check meant to catch source drift).

**Rows 29-36, 39-41 and 43 are shipped in `0.0.23`, none is operator-confirmed.** They were
DEFERRED on 2026-09-05 pending exactly this release; the code-side half of that deferral is now
met and each row's boilerplate was updated in `roadmap.md` §4 to say so. Rows 37/38 still need the
operator's own vault side-by-side; the in-repo half (gantt zero gaps, board aligned) is MET.

**The parent DONE table stays 5 of 7 = 71%**, unchanged this pass — rows 1 and 2 are the only open
rows, both operator device confirmation.

**`006-list-view-deprecation`**: children `005` through `007` are done (`007` landed this pass, per
above). Child `008-docs-and-release` has its three in-repo rows done (changelog, README, no open
planning work) and its release row satisfied by `0.0.23` — only its own operator row and
`006-hide-and-migrate`'s operator row stay open. Its own top-level checklist reads 7 of 9.

**`044-phone-sheet-alignment`** and **`045-board-card-properties`**: both fully landed, both at
6-of-7 / 5-of-6 acceptance criteria `Met` with only their operator row (AC-006) open. `045`'s two
open questions were answered this session as ADR-001/ADR-002 (gallery does not share the
mechanism; hiding a card field is cards only).

**`046-linked-views-notion-parity`**: ADR-001/ADR-002 Accepted; capability partially landed (above).
**Three worktrees carry uncommitted, unread content discovered this pass** — see §2 and Gotchas.
None of it is represented as landed anywhere in this pass's docs, because none of it is committed.

**Delegation rung**: unchanged from the prior pass — devin's daily quota resets daily; Grok 4.6
xhigh via cli-cursor was the first rung reached for tonight's overnight work.

**Worktrees `.worktrees/022` through `.worktrees/062` all exist.** Most are at-or-behind main and
are the operator's to remove through `sk-git`. Three are not — read them fresh, do not trust this
sentence's list: see §2.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: READ THE THREE UNREAD WORKTREES, THEN RESUME 046

**This pass did not open or read the content of any worktree — only `git status`/`git log` against
each tip, which is a directory listing, not a review.** Three need a fresh read before anything
else, because their state is unknown and could change what is true above:

1. **`.worktrees/059-linked-views-chrome`** — 18 files uncommitted, 545 insertions / 348 deletions,
   touching `embedded-database-renderer.ts`, `styles.css` (125 lines), `toolbar-renderer.ts`,
   `i18n.ts`, `linked-view-block.ts` (45 deletions — possibly a removed modal), plus `046`'s own
   `acceptance-criteria.md`/`checklist.md`/`decision-record.md`/`tasks.md`. This shape matches
   `046`'s `T002`/`T004`/`T005`/`T015` (the stylesheet leg and the host-layout answer) — **but this
   is a pattern match, not a verified read.** Read the diff, run the gate inside the worktree, and
   only then decide whether it supersedes what `046`'s row says on main.
2. **`.worktrees/062-stacked-sheets`** — a new phase, `048-stacked-sheets`, fully scaffolded
   (`spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md`, `implementation-summary.md`,
   `graph-metadata.json`) but **not committed**, plus a 2-line uncommitted edit to this packet's own
   `spec.md`. Nothing above references phase `048` because it does not exist on main. Read
   `048/spec.md` before assuming what it scopes.
3. **`.worktrees/061-competitor-captures`** — untracked `screenshots/anytype/` and
   `screenshots/appflowy/`, matching `047-competitor-references-and-pm-alignment`'s first leg. Not
   committed; row counts in `047`'s own docs still read 0/6.

**A fourth worktree likely needs discarding, not landing**: `.worktrees/057-sheet-grammar-close`'s
tip (`2a7db8cf`) is already an ancestor of main, but it carries 89 modified files, mostly
`screenshots/` capture noise. Confirm with a byte-hash diff before assuming it is inert; if it is,
it is the operator's to remove through `sk-git` like any other landed worktree.

**`.worktrees/054-linked-views` and `.worktrees/056-sheet-inside-tap`** are also at ancestors of
main (`e544a2c5`, `2be66ba5`) with only an untracked `specs/context` symlink target each — normal
worktree residue, safe to remove through `sk-git` once the operator confirms they are not needed
for reference. **`.worktrees/058-decisions-and-phases`** and **`.worktrees/060-gallery-audit`** are
likewise at main ancestors (`b240a8d5`, `b4be45bc`) with only the same symlink residue.
**`.worktrees/062-stacked-sheets`** is at `d3979cf5` (the release commit) plus its own uncommitted
`048` scaffold, named above.

**Then resume `046-linked-views-notion-parity`** (`goal-prompt.md`'s step 7): read
`.worktrees/059-linked-views-chrome` first — it may already answer `T002` and finish `T004`/`T005`/
`T015` — before starting fresh work on the host-layout question or the stylesheet leg. `T016` (the
settings-flag call) is the operator's, not this session's, to start.

**Still owed from the operator regardless of the above**: a fresh device check against `0.0.23` for
rows 29-36/39-41/43; the vault side-by-side for rows 37/38; `044`'s and `045`'s AC-006; `046`'s
AC-007 and its `T016` flag decision; and `006`'s two operator rows (`006-hide-and-migrate`,
`008-docs-and-release`). Each confirmation closes its `roadmap.md` §4 row or its phase's own AC row;
a "still broken" answer reopens the row with the device fact given, never argued with. **No agent
ticks an operator row.**
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Read this handover in full before touching anything.
2. Run `npm run gate` from a clean `main` checkout and confirm 25/25 green before assuming the tree
   is as described here (verified at `b4be45bc` this pass; `operator-list` was stale on pull and
   was regenerated — rerun `node tools/naming/build-operator-checklist.mjs --check` if it drifts
   again).
3. **Read the three unread worktrees in §2 before trusting any stated state for `046`, `047` or a
   possible `048`** — none of their content was reviewed this pass, only their file lists.
4. Wait for the operator's confirmations named in §2's closing paragraph before ticking any row
   they own; work `046`'s remaining code (`T002` onward) in the meantime.
5. Once the operator confirms a landed worktree is no longer needed for reference, offer to remove
   it through `sk-git`.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

- CI's "Capture staleness" step was red while the local gate stayed green on the identical commit:
  `specs/**/context/` is gitignored, so a reference-capture's declared source dependency (the
  vendored `obsidian-pm-main` tree, read locally through a symlink) had nothing to read in CI's
  checkout. A lane that is green locally is not evidence it is green in CI when its inputs include
  a gitignored path — check what the lane actually reads, not just its local exit code. Fixed by
  classifying a git-ignored, absent source as expected-missing rather than broken (`e0145ac9`).
- A pre-release local install and the tagged release can coexist under adjacent backup names:
  `.backup-<version>-preview` is not the shipped `<version>` — confirm the release tag on `origin`
  and the live manifest's version field together, never infer shipped status from a versioned
  backup folder's presence alone.
- Reading a fresh in-repo side-by-side against a CAPTURED reference (not just its source) can find
  gaps a source-only comparison missed entirely: the board's inherited `line-height` cascade and
  its uncopied `::-webkit-scrollbar` rules were both invisible to every earlier CSS-source read,
  because neither shows up in a component that never scrolls in the capture that exercised it.
- A worktree showing `UU` in `git status` can have some files fully resolved (zero conflict
  markers, just unstaged) and others still genuinely conflicted — check each file's own marker
  count, not the worktree's aggregate unmerged-paths list, before assuming a rebase needs full
  re-resolution.
- `tools/` is neither typechecked nor linted for TypeScript. Root `tsconfig.json` includes
  `src/**/*.ts` only, and `lint:tools` runs eslint over `tools/**/*.mjs`, so
  `render-assertion-harness.ts` — the file every constructed pass mounts through — has no gate
  covering it. Do not cite a type annotation as evidence in this repo without checking which
  config actually compiles the file.
- A lane can depend strictly on a fixture and still not be harness-dependent. Ask what the value
  IS, not only where it was measured.
- Two exported lists in this tree are both called `SCENARIOS` and cover different sets — check
  which list a lane imports before claiming that lane covers a scenario.
- A lane's own evidence JSON is a before/after instrument: `git show <old-sha>:tools/live/<lane>.json`
  against the current file settles a coverage claim in one command.
- A worktree rebased or branched before a sibling lane lands can go stale at its `--onto` target;
  check the target's distance from the current main tip before landing, not just before starting.
- Rebase a phase branch onto main before its verification, not after. Write the packet's
  implementation summary in the same pass as its first checklist ticks; `validate.sh` fails
  without it.
- The full landing sequence for a phase: verify in the worktree, commit on its own branch,
  fast-forward main, gate main, push, then release from a clean clone.
- The capture harness is not byte-deterministic: hash decoded pixels, not raw bytes.
- Run `npm run screenshots` detached; `check-lane` needs `SURFACE_PHASE` set.
- A review-type agent cannot write; hand its release, checklist-tick and commit steps to a code
  leaf.
- Every external delegate's claim is verified in-runtime: a browser number from a sandboxed or
  cloud lane is not evidence.
- A pipe makes `$?` the pipe's status; read exit codes directly, unpiped.
- `validate.sh` on a phase parent recurses into children; take the FIRST `RESULT:` line for this
  packet's own verdict. Regenerate metadata after any spec-doc edit.
- Where `.opencode` is a symlink, spec-kit scripts can silently no-op; invoke through `realpath`
  with `NODE_PRESERVE_SYMLINKS=1` and confirm by content, not exit code.
- A docs commit that cites the sha where a rebasing branch "closed on main" can be wrong the moment
  a sibling lane lands underneath it before that branch pushes — `git merge-base --is-ancestor
  <sha> HEAD` answers this in one command.
- **A lander must wait for the verifier's own completion notification, not for a poll on "clean
  tree."** A working tree can read clean between two of a verifier's own writes — a race, not a
  signal — so a landing step that polls `git status` for cleanliness can act on a mid-verification
  snapshot instead of the verifier's actual finish.
- **A wait loop must inspect process commands starting with `node`, not just a fixed process name.**
  This program's own verification and gate scripts are invoked as `node tools/...`; a wait loop
  that greps for a narrower literal can miss every one of them and report idle when work is live.
- **A `theme.css` edit stales every capture, not just the ones that touch the changed rule.** The
  capture pipeline fingerprints the whole stylesheet bundle as one input, so editing the harness's
  own host-control baseline invalidates the entire manifest's freshness, not a scoped subset —
  budget a full recapture, not a partial one, after any `theme.css` change.
- **Real-clock anchors are now frozen via `renderNow()`** (`6bac9ce9`, `calendar-date-time.ts:100`).
  A bench or capture that still reads `new Date()` directly instead of `renderNow()` will drift
  again the way the timeline bench did before this fix; grep for the raw constructor before
  trusting a "today"-anchored render as reproducible.
- **The `sk-git` live-sync hook can rebase a worktree under a working agent.** Local `main` advanced
  from `d3979cf5` to `b4be45bc` mid-session with no action from this agent — a legitimate
  fast-forward from `origin/main`, but one that can land between a read and a write if not
  re-checked. Re-verify `HEAD` immediately before any commit or push, not just at session start.
<!-- /ANCHOR:next-session -->

---

## 5. CONTINUITY LOG

Compacted out of frontmatter (SPECDOC_FRONTMATTER_007) into this section so no fact is lost. Each
phase's own `goal.md`/`implementation-summary.md` carries its full audit trail; this is the
program-level decision record only.

- **2026-08-30**: four operator decisions taken — row height stays 34px (density over the 44px
  touch floor); the grab band is accepted at 35px against the 48px ask; row range-select moves
  behind a long press; the list view was scoped as a presentation mode of the grid (superseded
  2026-09-04, see below). Recorded in `roadmap.md` §6A.
- **2026-09-02**: external-delegation model revised to devin (`deepseek-v4-flash-max`,
  `--permission-mode dangerous`) first, then codex/opencode (`gpt-5.6-luna`), with every result
  verified in-runtime by a fresh Sonnet agent running the gate and `validate.sh` itself.
- **2026-09-04, version renumbering**: the fork point is `pangy9/obsidian-note-database` at
  upstream 1.2.8; fifteen post-fork releases were re-tagged 1.2.8-euro.1 through 1.4.10 as 0.0.1
  through 0.0.15, and the cadence has run 0.0.N ever since (`roadmap.md` §5.3).
- **2026-09-04, evening pass, reports 40-43**: opened `044-phone-sheet-alignment`,
  `045-board-card-properties`, `046-linked-views-notion-parity`, and asked ADR-001.
- **2026-09-04, done-audit-11**: parent DONE row 6 ticked at `2242fa0`, taking the parent to 5 of
  7 = 71%. Full done-audit-1 through -11 trail: `043-constructed-capture/goal.md` and
  `implementation-summary.md`.
- **2026-09-05, six lanes landed and 0.0.22 cut** (`7b976e28`): symlink-safe ignore check, `006`'s
  hide-and-migrate, `045`'s board card properties, the kanban line-height truing, and `044`'s
  remaining phone-sheet-grammar legs. `npm run gate` 26/26 at that point.
- **2026-09-05, ADR-001/ADR-002 Accepted, `045`'s questions answered**: `046`'s ADR-001 (operator,
  *"Allow db writing from linked views"*) and ADR-002 (phase author, split presentation from
  capability) both Accepted; `045`'s gallery-sharing and hide-in-table questions answered the same
  day (ADR-001: no, gallery is retired instead by `specs/007-gallery-view-deprecation`; ADR-002:
  no, cards only).
- **2026-09-05, the 0.0.22 device check and twelve deferrals**: operator reported 0.0.22 as still
  broken (*"pressing any action in a sheet doesn't work and instantly closes it"*), deferring rows
  29-36, 39-41 and 43 on one named blocker (tap inside an open sheet dismisses it). Rows 37/38
  moved the other way (*"align closer"*), opening `047-competitor-references-and-pm-alignment`.
  The operator's gallery ruling (*"should have been deprecated"*) opened `007-gallery-view-
  deprecation` as a second top-level sibling.
- **2026-09-05, the named blocker fixed, landed, then shipped**: `3a77d523`/`308ba2d3` fixed the
  sheet-inside-tap dismissal, root-caused and recorded at `66b69842`/`2be66ba5`, re-verified at
  `b240a8d5`, then released as **`0.0.23`** (`d3979cf5`) alongside the list renderer's full
  retirement, the frozen bench clock, the settings-body grammar, the card-properties capture proof,
  and `046`'s ADR-001/ADR-002 acceptance plus a partial capability landing (`ec893e67`). This
  handover (`orchestrate-handover-18`) recorded it: `roadmap.md` §1/§4/§5.3/§5.A and `goal.md`'s
  DONE table updated, `operator-checklist.md` regenerated (109 rows / 48 phases, up from 103/47),
  three worktrees with uncommitted, unread content discovered and flagged rather than assumed
  (`.worktrees/059-linked-views-chrome`, `062-stacked-sheets`, `061-competitor-captures`).
