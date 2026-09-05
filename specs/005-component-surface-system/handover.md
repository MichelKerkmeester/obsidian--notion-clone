---
title: "Session Handover: Component Surface System"
description: "Resume point: main is at 9436b964, release 0.0.22 is cut (7b976e28) and installed to the iCloud vault, carrying six landed lanes since 0.0.21 — board card properties, kanban line-height alignment, list hide-and-migrate, phone sheet grammar (26 gate lanes), the CI capture-staleness fix, and the symlink-safe ignore check. Three worktrees are in flight (list renderer retirement, the bench/board frozen clock, the settings-sheet body grammar), none a phase-blocking gap on main. `npm run gate` reads 26/26 green."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-05T01:01:00Z"
    last_updated_by: "orchestrate-handover-17"
    recent_action: "Cut 0.0.22: card properties, line-height, list hide-and-migrate, sheet grammar, CI fix landed"
    next_safe_action: "Resolve 047's rebase conflicts, land it, then verify 049 and 050 in order"
    blockers:
      - "Operator device confirmation owed on 0.0.21/0.0.22 for rows 29-36, 39, 40, 41 and 43"
      - "Rows 37/38 need the operator's own vault side-by-side; the in-repo half is MET"
      - "ADR-001 (may an embed write) asked of the operator 2026-09-04, still unanswered"
      - "045's two open questions: gallery sharing and hide-in-table, unresolved"
    key_files:
      - "specs/005-component-surface-system/goal.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "specs/006-list-view-deprecation/007-remove-renderer-and-harness/tasks.md"
      - "specs/005-component-surface-system/044-phone-sheet-alignment/tasks.md"
      - "specs/005-component-surface-system/046-linked-views-notion-parity/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "ADR-001: may a linked-view embed write back to source? Blocks 046's capability leg"
    answered_questions: []
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

**Main is at `9436b964`, pushed, and `0.0.22` is cut and installed** (release commit `7b976e28`) to
the iCloud vault plugin folder (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel
Kerkmeester/.obsidian/plugins/note-database`); `manifest.json`, `package.json` and `versions.json`
there all read `0.0.22`, confirmed against the live install directly. `npm run gate` on this
checkout reads **26/26 green**. `0.0.22` carries six lanes landed after `0.0.21`'s cut, in
chronological order:

- **The screenshots-folder split and the CI capture-staleness fix** were already recorded by
  `orchestrate-handover-16` as session work ahead of `0.0.21`'s cut; both are unchanged this pass.
- **The symlink-safe ignore check** (`6328c9cb`): `isGitIgnored()` fatals or misreports on a path
  that crosses a symlink, which every worktree's `specs/context` link does; `classifySource()` now
  resolves the real path before asking git, so a vendored reference absent through a worktree
  symlink still classifies as `VENDOR UNAVAILABLE` rather than a false `MISSING SOURCE`.
- **List hide-and-migrate** (`006-list-view-deprecation`'s child `006`), landed `e0e1c568`,
  reconciled `e466696b`, recorded `4ac061ca`/`c78c5592`, live evidence refreshed at `f49eda4c`:
  List view is hidden from every surface and existing list views migrate to the table. This is the
  006 → 007 handoff precondition ("shipped, not merely merged"), and 0.0.22 is that release.
- **Board card properties** (`045-board-card-properties`), landed `a79d7421`, reconciled `ff1dacec`,
  trued up `56a34199`: a per-view ordered property list for board cards behind the existing
  `boardExtensionsEnabled` flag. Two questions stay open (see Blockers).
- **The kanban line-height fix** (`038-board-kanban-port`'s reopened gap), landed `74a26419`,
  reconciled through the folder-split and card-properties rebases (`4df2720c`/`b7dc7cf5`), trued up
  at `53513962`: `.note-database-container`'s inherited 1.45 line-height no longer inflates the
  count chip, column header or subtask parent past the reference. Rows 37/38 stay open regardless —
  see Blockers.
- **Phone sheet grammar** (`044-phone-sheet-alignment`'s remaining legs), feature landed at
  `2c0902fc`, reconciled twice as sibling lanes landed underneath it (`bdf255cf`, then `9436b964`
  after the line-height fix), recorded `52df995a`/`113530ba`: `sheet-grammar` is now a registered
  gate lane (**26 gate lanes total, up from 21**), the shared header (`createSheetHeader`) and
  seven-element contract (`src/views/sheet-grammar.ts`) cover six surfaces, and the Add view sheet
  and record peek both conform. AC-001 through AC-005 and AC-007 are `Met`; AC-006 stays operator-
  only, `Unmet` by design.

**A correction against this packet's own prior docs**: `roadmap.md` §4 rows 40/41/43 and §5.A's
`044` row cited `dcff742e` as the sha where phone sheet grammar "closed on main." That commit is
**not an ancestor of current main** — a later rebase (`bdf255cf`, then `9436b964`) superseded it
after the board line-height fix landed underneath it, the same class of trap row 34's history
already carries once (`fb44a302`). Fixed in this pass to cite `9436b964`.

**Rows 29-36, 39, 40, 41 and 43 are all shipped (0.0.21 or 0.0.22), none is operator-confirmed.**
For rows 34-36, the operator should enable "Trace sheet lifecycle", reproduce, then run "Copy sheet
trace" and paste it back if the class still reproduces on device. Rows 37/38 need the operator's
own vault side-by-side; the in-repo half (gantt zero gaps, board aligned after the line-height fix)
is MET.

**The parent DONE table stays 5 of 7 = 71%**, unchanged this pass — rows 1 and 2 are the only open
rows, both operator device confirmation.

**`006-list-view-deprecation`**: children `005` and `006` are both shipped (`006` in 0.0.22, above).
Child `007-remove-renderer-and-harness` is **in flight** on `worktrees/047-list-remove-renderer`
(see §2) — its unblocking precondition ("`006` shipped, not merely merged") is now met. Child
`008-docs-and-release` stays blocked on `007`.

**`044-phone-sheet-alignment`**: fully landed (above). One follow-on scope its own
`implementation-summary.md` named as deliberately out of reach — the settings sheet's body grammar
(`.db-view-config-row`, native radio group) — is now its own in-flight leg on
`worktrees/050-settings-body-grammar` (see §2).

**`045-board-card-properties`**: fully landed (above). Open questions: does the gallery share the
mechanism or get its own, and should hiding a card field also hide the table column — neither
scoped or answered yet.

**`046-linked-views-notion-parity`**: ADR-001 (may an embed write back to the source) was asked of
the operator 2026-09-04 and is still unanswered; the four read-only gates stay untouched until it
is.

**Delegation rung**: devin's daily quota has been exhausted since ~23:00 CEST on 2026-09-04 and has
not reset; Grok 4.6 xhigh via cli-cursor is the active first rung; GLM 5.3 flash max via
cli-opencode/llmgateway is available as a further fallback.

**Worktrees `.worktrees/022` through `.worktrees/050` all exist.** Landed ones are the operator's
to remove through `sk-git`; the three in-flight ones are named in §2.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: LAND THE THREE IN-FLIGHT WORKTREES, THEN RESUME ORDER OF WORK AT STEPS 5 AND 7

`goal-prompt.md`'s ORDER OF WORK is at steps 5 and 7 now — steps 1, 2 (in-repo half), 3, 4 and 6 are
done (0.0.21/0.0.22 cut, reference captures, folder split, `044`'s phone-sheet grammar, `045`'s
card properties). Three worktrees carry work opened since `orchestrate-handover-16`, none landed:

1. **`worktrees/047-list-remove-renderer`** (006's child `007-remove-renderer-and-harness`) — **mid
   interactive rebase, stopped on conflicts.** `git rebase-merge` shows the feat commit
   (`ba2acf7d`, "retire the list renderer, its lane and its captures") applied with conflicts still
   open: `UU` in `screenshots/manifest.json`, six `constructed-{filter,sort}-panel` captures,
   `tools/lane/css-lane.json`, and nine `tools/live/*.json` evidence files (`capture-device-parity`,
   `renderer-coverage`, `replay`, `sheet-rebuild`, `sheet-teardown`, `touch-targets`,
   `touch-targets-baseline`, `touch-targets-constructed-baseline`, `unstyled-links`,
   `view-census`); `tools/live/list-window.json` is `UD` (deleted by us, modified by them). One
   docs commit (`7042699a`, "record the list renderer retirement") is queued behind it. Resolve,
   `git rebase --continue`, verify (`npm run gate` should drop to 25 lanes once `list-window` is
   gone), then land — this is the irreversible step `007` exists to be. The queued docs commit also
   edits this packet's own `goal-prompt.md` (a gate-lane count correction) and
   `006-list-view-deprecation`'s `goal.md`/`spec.md`; read it fresh before trusting its numbers
   against whatever `main` is at by the time it lands. Landing this unblocks `008-docs-and-release`.
2. **`worktrees/050-settings-body-grammar`** — a Grok 4.6 (cli-cursor) pass giving the settings
   sheet's body its own row grammar, the scope `044`'s own `implementation-summary.md` named as
   deliberately out of reach (`.db-view-config-row`, native radio group). Working tree carries
   `view-config-panel-renderer.ts`, `tools/live/sheet-grammar.mjs`, a new
   `view-config-panel-renderer.test.ts`, and a `044-phone-sheet-alignment/tasks.md` edit — nothing
   committed yet. Needs a verifier next: run the gate, confirm `sheet-grammar`'s settings row is
   real rather than special-cased, then commit and land.
3. **`worktrees/049-bench-frozen-today`** — a board/timeline bench and capture pass freezing "today"
   so gantt/calendar renders stop drifting on the real clock (the recurring cause behind every
   "restored to HEAD, real-clock drift" note on recent board/gantt reconciliations). Working tree
   touches `calendar-date-time.ts`, `calendar-timeline-model.ts`, `board-renderer.ts`,
   `calendar-timeline-renderer.ts`, the timeline bench, and roughly 60 captures — nothing committed.
   **Land this one last** among the three; once it lands, `043-constructed-capture`'s docs need a
   pass recording the frozen-clock fixture and retiring the "drift, restored to HEAD" caveat
   wherever it still reads as a standing limitation rather than a fixed one.

**Then resume `goal-prompt.md`'s ORDER OF WORK**: step 5 finishes with `008-docs-and-release`
(README, changelog with the rollback sentence, the release that carries the removal) once `007`
lands; step 7 (`046-linked-views-notion-parity`) stays blocked on the operator's ADR-001 ruling and
is not this session's to start.

**Still owed from the operator regardless of the above**: device confirmation on 0.0.21/0.0.22 for
rows 29-36/39/40/41/43 and on every release before them; the vault side-by-side for rows 37/38;
ADR-001; and `045`'s two open questions (gallery sharing, hide-in-table). Each confirmation closes
its `roadmap.md` §4 row; a "still broken" answer reopens the row with the device fact given, never
argued with. **No agent ticks an operator row.**
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Read this handover in full before touching anything.
2. Run `npm run gate` from a clean `main` checkout and confirm 26/26 green before assuming the
   tree is as described here (verified at `9436b964` this pass). CI's Gates workflow is also green
   as of `e0145ac9` (§1).
3. **Confirm each in-flight worktree's tip against §2 before trusting any stated state** —
   `worktrees/047-list-remove-renderer`, `worktrees/049-bench-frozen-today` and
   `worktrees/050-settings-body-grammar` can all move again before this doc is read; `047` in
   particular is mid-rebase and its conflict list is a snapshot, not a promise.
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
- A docs commit that cites the sha where a rebasing branch "closed on main" can be wrong the moment
  a sibling lane lands underneath it before that branch pushes: the rebase target moves, the branch
  re-rebases onto the new target, and the sha the docs already named stops being an ancestor of
  main at all — `git merge-base --is-ancestor <sha> HEAD` answers this in one command, and
  `git log --oneline --all | grep <sha>` confirms whether it survives even as a dangling ref. This
  packet's own `roadmap.md` carried exactly that trap for `044`'s landing sha (`dcff742e`, orphaned
  by the board line-height fix landing underneath it and a second reconciliation to `9436b964`) —
  the same class row 34's history already names for `fb44a302`. Check ancestry before citing a
  landing sha in docs, not just before trusting one already written.
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
- **2026-09-05, six lanes landed and 0.0.22 cut**: the symlink-safe ignore check (`6328c9cb`,
  `isGitIgnored()` now resolves through a worktree's `specs/context` symlink before asking git);
  `006-list-view-deprecation`'s child `006-hide-and-migrate` (`e0e1c568`, reconciled `e466696b`,
  trued `f49eda4c`); `045-board-card-properties` (`a79d7421`, reconciled `ff1dacec`, trued
  `56a34199`); the kanban line-height fix reconciled twice more and trued at `53513962`; and
  `044-phone-sheet-alignment`'s remaining legs (`2c0902fc`, reconciled `bdf255cf` then `9436b964`
  after the line-height fix landed underneath it), registering `sheet-grammar` as a gate lane
  (21 → 26). `0.0.22` cut at `7b976e28`, installed to iCloud, `npm run gate` 26/26 green. Corrected
  `roadmap.md`'s stale `dcff742e` citation for `044`'s landing to `9436b964` (§4 gotchas) —
  `dcff742e` was superseded by a later rebase and is not an ancestor of main. Three worktrees opened
  and left in flight, uncommitted: `047-list-remove-renderer` (mid-rebase, conflicts open),
  `049-bench-frozen-today` (board/timeline frozen-clock pass), `050-settings-body-grammar` (Grok
  4.6 via cli-cursor, needs a verifier).
