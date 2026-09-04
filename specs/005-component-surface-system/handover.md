---
title: "Session Handover: Component Surface System"
description: "Resume point: main is at e0145ac9, release 0.0.21 is cut and installed, the screenshots folder split has landed, and CI's 'Capture staleness' divergence is fixed. The operator's queued order of work continues from step 4 — 044's remaining phone-sheet legs, 006's children, 045, then 046 behind ADR-001. Four legs are in flight, none is a phase-blocking gap on main."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-04T22:22:00Z"
    last_updated_by: "orchestrate-handover-16"
    recent_action: "Cut 0.0.21 and landed the sheet fixes, reference captures and folder split"
    next_safe_action: "Confirm each in-flight worktree tip, then resume the order of work from step 4"
    blockers:
      - "Operator device confirmation owed on 0.0.21 for rows 29-36, 39, 40 and 41"
      - "Rows 37/38 need the operator's own vault side-by-side; the in-repo half is MET"
      - "ADR-001 (may an embed write) asked of the operator 2026-09-04, unanswered"
    key_files:
      - "specs/005-component-surface-system/goal.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "specs/005-component-surface-system/044-phone-sheet-alignment/tasks.md"
      - "specs/005-component-surface-system/045-board-card-properties/tasks.md"
      - "specs/006-list-view-deprecation/006-hide-and-migrate/tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "ADR-001: may a linked-view embed write back to the source, or is it read-only (046, blocks all four read-only gates until answered)"
    answered_questions: []
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

**Main is at `e0145ac9`, pushed, and `0.0.21` is cut and installed** (release commit `5af7eef7`) to the iCloud vault plugin
folder (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel Kerkmeester/.obsidian/
plugins/note-database`); `manifest.json`, `package.json` and `versions.json` there all read
`0.0.21`. A `.backup-0.0.21-preview` sits beside the live install — it is a superseded pre-release
build from earlier in the session, not the shipped one; check the release tag and the manifest
version together, never the presence of a versioned backup folder alone. `0.0.21` carries four
legs:

- **The WebKit sheet fix's second bug** (`031`), landed `9ecb5fff` on main and re-trued at
  `45a1750d`: a dead-anchor drop fix (`9f31bf6f`), a retained-node rebuild of the sort/filter
  panels (`8140a1ae`), a pointerdown-only outside-dismissal pin (`efb5b54f`), and a
  `debugSheetTrace` device report for what emulation cannot reproduce (`c12817a8`).
- **The settings sheet fix** (`044`, contract owners `003`/`016`), root-caused to the sheet
  scrolling its own header and grab band out of reach — `dbdec603`, recorded `355d24ff`.
- **The column-width sheet fix** (`044`), a shared keyboard-aware bottom sheet with segmented
  presets — `8bcb11f3`, recorded `e494be00`.
- **The gantt's reinstated local milestone-label anti-collision fix** (`037`, the operator's
  decided ruling on row 39) — `1358927`.
- **The Project Manager reference captures** (`043` T031) under `screenshots/project-manager/` —
  `295401ad`, reconciled `04814e24` — closing `roadmap.md` rows 37 and 38's in-repo half.

**Rows 34-36, 39, 40 and 41 are all shipped in 0.0.21, none is operator-confirmed.** For rows
34-36, the operator should enable "Trace sheet lifecycle", reproduce, then run "Copy sheet trace"
and paste it back if the class still reproduces on device.

**A fresh in-repo side-by-side against the Project Manager reference captures** (`565d86d0`,
desktop/dark, 2880x1800, DPR 2) found the gantt clean — zero fidelity gaps; its two remaining
differences (the bar/label-dot colour and the phone label width) are dispositions, not defects.
The board came out with line-height-driven gaps instead: `.note-database-container`'s inherited
1.45 line-height inflates the count chip, the column header and the subtask parent line 2-3px
taller than the reference, and the reference's `::-webkit-scrollbar` rules for the board and its
card list were never copied. A fix (`line-height: normal` reset on the kanban host) is in progress,
uncommitted, on `worktrees/046-board-line-height`; `styles.css` on main is untouched. Rows 37 and
38 stay open either way, pending the operator's own vault side-by-side.

**The parent DONE table stays 5 of 7 = 71%** — row 6 ticked at `2242fa0` (done-audit-11); rows 1
and 2 are the only open rows, both operator device confirmation. Nothing this session touched
moves that count.

**`006-list-view-deprecation`**: child `005-usage-and-migration-audit` is done (`c98e05ab`: one
list view found in the vault, four declared losses). Child `006-hide-and-migrate` is implemented
(`8152cf4f`) — a devin pass that ran out of daily quota mid-way, finished by Grok 4.6 via
cli-cursor — and is under verification on `worktrees/044-list-hide-migrate`. Children `007` and
`008` are next, not started.

**`044-phone-sheet-alignment`**: T005-T007 landed. T003/T004/T008-T012 (the grammar contract, the
shared header, the Add view sheet, record peek, the gantt's owned menu, the suggest modals, and
`group-order-modal.ts` removed) are under verification on `worktrees/043-sheet-alignment-2`, a
rebase onto `0.0.21` — a P0 in the modal chrome helper was caught and fixed there. Four of the five
conflicted files are resolved but unstaged; `specs/005-component-surface-system/
044-phone-sheet-alignment/tasks.md` still carries live conflict markers there.

**`045-board-card-properties`**: a Grok pass is done — the resolver, the persisted property list,
and the Properties panel — and a verifier is running on `worktrees/045-board-card-properties`.

**`046-linked-views-notion-parity`**: ADR-001 (may an embed write back to the source) was asked of
the operator 2026-09-04 and is still unanswered; the four read-only gates stay untouched until it
is.

**The screenshots folder split has landed** (`worktrees/042-screenshots-folders`, landed
`7d95a882`+`aa049b45`, reconciled with main `933308a5`): captures now live under
`screenshots/notion-clone/<group>/` (534 PNGs, this program's own fixtures and constructed
renders) and `screenshots/project-manager/` (16 PNGs, `037`'s reference captures, untouched by
this reconciliation). All 550 final entries verified byte-identical to the prior blob for that
path — the move changed paths, not pixels. `roadmap.md` §4 rows 37/38 were updated to say both
legs landed.

**CI fixed** (`e0145ac9`): the Gates workflow's "Capture staleness" step had failed on every push
to main since `e494be00` — `specs/**/context/` is gitignored, so the vendored `obsidian-pm-main`
reference tree the Project Manager captures declare as their source dependency exists locally (as
a symlink) but never in CI's checkout, and every declared source read MISSING. `verify.mjs` now
runs each missing source through `classifySource()`, which asks git's own ignore rules
(`isGitIgnored()`) whether the checkout was ever going to have it; a git-ignored absent source
downgrades to a reported-but-non-failing `VENDOR UNAVAILABLE` bucket, while a present source is
still hashed and compared exactly as before, so real drift still fails STALE. Verified in a fresh
clean clone: red before (exit 1, 200 MISSING SOURCE), green after (exit 0, 200 VENDOR UNAVAILABLE,
0 problems); the Gates run on `e0145ac9` is green.

**Delegation rung, tonight**: devin's daily quota exhausted at ~23:00 CEST; Grok 4.6 xhigh via
cli-cursor is the active first rung until it resets; GLM 5.3 flash max via cli-opencode/llmgateway
is available as a further fallback.

**Worktrees `.worktrees/022` through `.worktrees/046` all exist.** Landed ones are the operator's
to remove through `sk-git`; the in-flight ones are named throughout this section and in §2.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: RESUME THE QUEUED ORDER AT STEP 4

The operator's pause on setting the goal prompt is over — the order below is the same one
`goal-prompt.md` carried. Steps 1-3 are done this session: 0.0.21 cut, the reference captures
landed, and the screenshots folder split landed (§1).

4. **Finish `044`'s remaining phone-sheet work** on `worktrees/043-sheet-alignment-2` — resolve the
   two remaining conflict markers in `044-phone-sheet-alignment/tasks.md`, stage the four already-
   resolved files, verify, then land.
5. **`006-list-view-deprecation`'s children, in order**: verify and land `006-hide-and-migrate`
   (`worktrees/044-list-hide-migrate`), then `007` then `008`. Not negotiable.
6. **Verify and land `045-board-card-properties`** (`worktrees/045-board-card-properties`), behind
   the existing `boardExtensionsEnabled` flag.
7. **`046-linked-views-notion-parity`** stays blocked on the operator's ADR-001 ruling.

**Still owed from the operator regardless of the above**: device confirmation on 0.0.21 for rows
34-36/39/40/41 and on releases 0.0.7-0.0.20; the vault side-by-side for rows 37/38; and ADR-001.
Each confirmation closes its `roadmap.md` §4 row; a "still broken" answer reopens the row with the
device fact given, never argued with. **No agent ticks an operator row.**
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Read this handover in full before touching anything.
2. Run `npm run gate` from a clean `main` checkout and confirm 25/25 green before assuming the
   tree is as described here. CI's Gates workflow is also green as of `e0145ac9` (§1).
3. **Confirm each in-flight worktree's tip against §1 before trusting any stated state** — several
   moved during this session and the fastest-changing ones (`043-sheet-alignment-2`,
   `044-list-hide-migrate`, `045-board-card-properties`, `046-board-line-height`) can move again
   before this doc is read.
4. Work the order in §2. Land, gate-green, ship; a phase is not done because its lane is green —
   D3 keeps shipped, verified and operator-confirmed apart.
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
  covering it. An earlier audit cited `tsc --noEmit` as binding its 13 action bags to `src/views`'
  interfaces; the annotations are there, the enforcement is not. Do not cite a type annotation as
  evidence in this repo without checking which config actually compiles the file.
- A lane can depend strictly on a fixture and still not be harness-dependent. `replay.mjs` holds
  each claim on `actual === recorded`, and one claim loads `board-drop-language`'s hand-written
  markup — but the two class names it checks are asserted on a real `BoardRenderer` under real drag
  events by `board-renderer-parity.test.ts`. Ask what the value IS, not only where it was measured.
- Two exported lists in this tree are both called `SCENARIOS` and they cover different sets:
  `render-assertion-bundle.mjs`'s is what `render-assertions`, `touch-targets` and `unstyled-links`
  iterate, and `constructed-scenarios.mjs`'s `CONSTRUCTED_SCENARIOS` is what the capture pipeline
  photographs into the shared manifest. A scenario added to one is invisible to the other. Check
  which list a lane imports before claiming that lane covers a scenario.
- A lane's own evidence JSON is a before/after instrument. If a change was supposed to widen a
  lane's coverage, `git show <old-sha>:tools/live/<lane>.json` against the current file settles it
  in one command: an unchanged scenario count is proof the lane did not widen, stronger than any
  narrative in a summary.
- A worktree rebased or branched before a sibling lane lands can go stale at its `--onto` target;
  check the target's distance from the current main tip before landing, not just before starting.
- Rebase a phase branch onto main before its verification, not after.
- Write the packet's implementation summary in the same pass as its first checklist ticks;
  validate.sh fails without it.
- The full landing sequence for a phase: verify in the worktree, commit on its own branch,
  fast-forward main, gate main, push, then release from a clean clone. Skipping the order risks
  gating a state main never actually reaches.
- The capture harness is not byte-deterministic: a handful of captures can move between identical
  runs on encoder noise alone; hash decoded pixels, not raw bytes, and restore a byte-only mover to
  its committed bytes rather than recommitting it.
- Run `npm run screenshots` detached; `check-lane` needs `SURFACE_PHASE` set. `screenshots-fresh`
  keys captures to source files, so a `src` change needs a recapture commit or the next gate is red.
- Build releases from `git clone --local`, never `git archive`. Never `git stash` in a tree another
  lane is writing; path-limit any stash to files you own.
- A review-type agent cannot write; hand its release, checklist-tick, and commit steps to a code
  leaf. Verify a port phase in its worktree, land to main only after the last leg is verified there.
- Every external delegate's claim is verified in-runtime: a delegate's report is a claim, not a
  result, and a browser number from a sandboxed or cloud lane is not evidence.
- A pipe makes `$?` the pipe's status; read exit codes directly, and `head` can SIGPIPE-truncate a
  run early; audit to completion, unpiped.
- `validate.sh` on a phase parent recurses into children; take the FIRST `RESULT:` line for this
  packet's own verdict. Regenerate metadata after any spec-doc edit.
- Where `.opencode` is a symlink, spec-kit scripts can silently no-op (exit 0, zero output);
  invoke through `realpath` with `NODE_PRESERVE_SYMLINKS=1` and confirm by content, not exit code.
- A completion figure is re-read fresh each audit against its criterion's own wording; a looser
  reading than the text is the same failure as a stricter one, pointed the other way.
- A criterion phrased as a readiness signal must name the instrument that can observe it. A frame
  count phrased as a pixel difference cannot be proven by screenshot, because the capture command
  flushes pending animation frames before it rasterises; the mount-level measurement can still be
  real and discriminating even when the pixel-level one is not.
- A constructed capture proves structure and layout, not typed rendering by default. Bench data
  defaults to untyped text columns and stub placeholder icons, so a fixture depicting a select
  pill, a date format, or a real icon stays the only evidence for that state until the bench data
  or the stub changes; declare the gap rather than letting the new capture quietly stand in for it.
- Declaring a dependency (naming it, bounding it, cross-checking it) does not remove it. A
  completion criterion phrased unconditionally still fails on a declared-and-bounded dependency,
  not only on a hidden one, unless every remaining piece is confirmed inert or genuinely equivalent.
- A bound that narrows a finding is not the same as closing it. When an audit trail narrows a
  criterion's population to a named subset, emptying that subset does not tick the criterion — the
  part the bound set aside has to be re-stated with a measured count, not inherited as closed.
- An evidence stamp is a measurement, not a constant. Run a lane twice and diff the committed
  stamp before quoting its number — a single run agreeing with the docs is not the same as the
  lane being reproducible.
- A capture container appended after an empty host div can inherit that div's full-viewport height
  as its own `offsetTop` reference before the mount moves inside it, producing a phantom scroll
  offset no real host pane ever has; detach the target container before mounting a renderer as
  `document.body`'s only child, then restore it once the render has already measured its window.
- A registry-builder function that fans a new `ScenarioSpec` field through a spread-conditional list
  can silently drop one you forgot to add to that list, even though the harness branch that reads it
  is correct and a hand-built spec proves it. Read every new capture rather than trusting a passing
  assertion alone.
- A popover positioned with `position: fixed`/`absolute` escapes an element-scoped `#shot` crop; a
  constructed capture of one needs the full-page (`page.screenshot()`, not `target.screenshot()`)
  path. The same popover can also take Obsidian's real bottom-sheet presentation on a phone
  (`isMobileBottomSheet`) instead of an anchored panel — a genuine device difference to expect.
- A verbatim reference copy reproduces the reference's own visual quirks along with its structure.
  The gantt's milestone-label/month-band overpaint looked like a regression until reading the
  reference source itself showed both labels painting on the same header SVG at fixed `y` offsets
  in `GanttView`'s own code — a faithful copy is not obligated to be prettier than what it copies,
  and that distinction is an operator call, not a defect to silently patch over.
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
  `.github/workflows/release.yml` auto-creates a release on any `*.*.*` tag push and can race a
  manual tag-recreation pass — push the tag and wait for CI, or expect `gh release create` to fail
  with "already exists".
  - **2026-09-04, operator ~17:30 CEST, four rulings**: (1) rows 34-36 reopened (still reproduce on
    0.0.20) — fix leg to `031`/`worktrees/036-sheet-freeze`, now shipped in 0.0.21. (2) rows 37/38
    redirected to an in-repo comparison against captured Project Manager screenshots rather than a
    dual-vault install — now landed. (3) row 39 (milestone overpaint): reinstate the local
    anti-collision fix — now shipped in 0.0.21. (4) `043` AC-002: accept determinism over the
    unmeetable pixel-difference wording — Met.
  - **2026-09-04, operator, "Also deprecate list view completely"**: superseded the ClickUp-style
    list-view direction outright; `specs/006-list-view-deprecation/` became a phased retirement
    using `030-gallery-view-deprecation` as precedent. Its Route B decision is kept as history in
    that packet's own `decision-record.md`.
  - **2026-09-04, evening pass, reports 40-43**: opened `044-phone-sheet-alignment`,
    `045-board-card-properties`, `046-linked-views-notion-parity`, and asked ADR-001 (still
    unanswered). Every phase 000-046 was given a nested `goal.md`, referenced from the parent
    `goal.md`'s DONE table.
- **2026-09-04, done-audit-11**: parent DONE row 6 ticked at `2242fa0` after `043` T030 gave 46 of
  51 fixtureOf-less fixtures a production-mounted constructed counterpart, taking the parent to 5
  of 7 = 71%. The five that cannot be constructed (three `DbModal` panels, the
  `MarkdownRenderChild`-hosted status bar, one mid-gesture board drag class) are a coverage limit
  the corpus cannot raise, not a hidden dependency — recorded against row 3's ledger, not absorbed
  by the tick. Full done-audit-1 through -11 trail: `043-constructed-capture/goal.md` and
  `implementation-summary.md`.
- **2026-09-04, this session**: cut and installed 0.0.21 (§1); the Project Manager reference
  captures landed and a fresh in-repo side-by-side found the gantt clean and the board carrying
  line-height-driven gaps; `006`'s `005` audit and `006` hide-and-migrate landed, verifying; `045`
  implemented, verifying; CI's "Capture staleness" divergence diagnosed to the `specs/**/context/`
  gitignore gap.
- **2026-09-05, screenshots folder split landed** (`worktrees/042-screenshots-folders`, `7d95a882`
  +`aa049b45`, reconciled `933308a5`): captures split into `screenshots/notion-clone/<group>/`
  (534 PNGs) and `screenshots/project-manager/` (16 PNGs); all 550 final entries verified
  byte-identical to the prior blob for that path. `roadmap.md` §4 rows 37/38 recorded both legs
  landed.
- **2026-09-05, CI fixed** (`e0145ac9`): `verify.mjs` gained `classifySource()`, downgrading a
  git-ignored absent source to a non-failing `VENDOR UNAVAILABLE` bucket instead of `MISSING
  SOURCE`; real drift still fails STALE. Verified red-then-green in a fresh clean clone; the Gates
  workflow is green on main. Main advanced to `9afe6e13` then `e0145ac9` while this handover was
  in progress; rebased in place twice.
