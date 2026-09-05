---
title: "Session Handover: Component Surface System"
description: "Resume point: main carries 0.0.25 (2334046b, bundle f2518f5e) with the five desktop fixes from the operator's 0.0.23 desktop pass. This pass landed five new family phases 051-055 — the operator's componentization instruction — four drafted externally by GLM 5.3 flash and one written in-runtime after its leaf died at the scaffold. All five were corrected against 050's design-trueup.md, which landed while they were drafting and overturned twenty-five claims across them. All five pass validate.sh --strict with Errors 0. No T001 has run in any of them. 053's three ADRs stay Proposed and are operator questions."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-05T14:30:00Z"
    last_updated_by: "orchestrate-handover-19"
    recent_action: "Landed phases 051-055 and corrected them against the capture true-up"
    next_safe_action: "Ask the operator the five open questions in section 2, then run 051-055 T001"
    blockers:
      - "Rows 47-51 shipped in 0.0.25; operator confirmation owed"
      - "Rows 29-33, 39-41, 43 re-asked against 0.0.25, unanswered"
      - "053's three ADRs Proposed; none disposed by roadmap 6A"
      - "051-055: none past T001"
      - "046 T002/T016 and 044/045 AC-006 stay open"
    key_files:
      - "specs/005-component-surface-system/goal.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "specs/005-component-surface-system/050-anytype-adoption/design-trueup.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "053 ADR-001: extend the chip rail or rebuild it"
      - "053 ADR-002: delete the seven dead methods, keep their classes"
      - "053 ADR-003: confirm gates the drop or the gesture"
      - "051: does fullscreen survive as a third presentation"
      - "051: may a registered stacked pair become an in-place sub-page"
    answered_questions:
      - "The confirm primitive is 051's; 053 and 055 consume it"
      - "Anytype dual-mode trigger icons rejected: 120 captures, WCAG 1.4.11"
      - "Selection caps not adopted: no multi-select referent"
      - "055 was renamed from 051-states-feedback-and-motion"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

**Main carries `0.0.25`** (cut `2334046b`, bundle `f2518f5e`, cadence row `9e0abab4`). It ships the
five desktop fixes from the operator's 0.0.23 desktop pass — `roadmap.md` §4 rows **47-51**, all
five now reading *shipped in 0.0.25, awaiting operator*. `0.0.24` before it carried `048`'s stacked
sheets, `044`'s sheet grammar, `046`'s linked-view chrome and `007`'s gallery migration. **Nothing
in either release is operator-confirmed**, which is D3 working as written, not a gap.

**This pass landed five new phases: `051`-`055`.** They come from one operator instruction on
2026-09-05 — *"research recommendations and how to tackle / update / improve every modal, sheet and
general ui ux to take the best from AnyType and componentize stuff as much as possible."* `050`
already owned the fourteen view-level adoption items; nothing owned the componentization half. The
split is by surface family, with **one owner per surface**:

| Phase | Family | Owns | Level |
|---|---|---|---|
| `051-modal-and-sheet-componentization` | Modals and sheets | One shell primitive; **the confirm primitive** | 3 |
| `052-dropdown-menu-and-picker-componentization` | Dropdowns, menus, pickers | The menu primitive and the picker family | 3 |
| `053-toolbar-and-view-controls` | The toolbar | Five composed primitives; **the condition row**; `050` items 1, 2, 4, 7, 10, 12 | 3 |
| `054-record-and-relation-surfaces` | Records and relations | Record primitives; **one inline editor per column type** | 3 |
| `055-states-feedback-and-motion` | States, feedback, motion | Empty/toast/motion components; `050` items 5, 8, 9, 14 | 3 |

`048`'s stacking model is a **constraint** to all five and is re-specified by none of them.

**Four of the five were drafted outside this runtime**, by GLM 5.3 flash through cli-pi, in parallel
worktrees `080`-`084`. Two things happened that a later reader needs to know about, and both are
recorded rather than smoothed over.

**`051`'s leaf died silently after `create.sh`.** It left a 15-line `spec.md` of scaffold comment,
an 8-line `plan.md`, a bare-title `tasks.md`, and no `goal.md`, `checklist.md`,
`acceptance-criteria.md` or `decision-record.md` at all — with no error the orchestrator saw. The
whole packet was written in-runtime. **This is the fan-out's real failure mode**: not a bad draft,
an absent one that reports as present.

**`050`'s `design-trueup.md` landed while the drafts were running**, and it overturned claims in
every one of them. Under `050` ADR-003 the capture beats `047`'s code-derived research, and four
kinds of disagreement followed — tabulated with their resolutions in `roadmap.md` §7.9:

1. **A behaviour adopted that does not exist.** `053` D7 and its ADR-001, and `052` §7, adopted
   Anytype's "dual-mode" filter and sort trigger icons. The funnel measures `ink=52, blue=0` on a
   filtered view **and** an unfiltered one — identical to the pixel, across all 120 catalogue
   captures, cross-checked against `tools/mock-data/anytype/views-report.json`. Rejected, and
   rejected a second time on contrast: colour-only signalling fails WCAG 1.4.11 where our count
   badge already carries text. Adopted instead: the `N applied` count label in the settings panel.
2. **"Today" premises the tree does not have.** All four of `055`'s `050` items were among the six
   thresholds the true-up found unfalsifiable. The scroll-restore machinery already exists
   (`database-viewport.ts`, four request kinds); `row-menu.ts` **cannot** render empty; **twelve**
   empty-state reasons ship, not one; and there is **no virtualization anywhere in `src/views`** to
   avoid. All four reds were rewritten from the tree.
3. **Designs built from a screen nobody saw.** `053` T1's view-tab context menu and `054` A5's
   search-first add-relation picker are both `047` source reads. Now labelled *design inferred from
   source code, not seen*.
4. **Line drift.** Twenty-five `file:line` citations across four drafts were wrong. `053`'s were the
   most accurate — all seven dead-method line numbers exact — and `055`'s the least, including a
   `120ms` transition count of **78** that recounts to **42**.

**All five packets pass** `validate.sh --strict` with `Errors: 0` on the first `RESULT:` line, and
each carries a binding `goal.md`. **None has run its T001**, so no design in any of them has been
checked against the captures its own rows name. That is why every one reads `0/N` in the parent's
DONE table and *open, drafted 2026-09-05, awaiting T001 true-up* in `roadmap.md` §5.A.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: ASK THE FIVE OPEN QUESTIONS, THEN RUN 051-055 T001

### The operator questions this pass opened, and did not answer

**`053`'s three ADRs stay PROPOSED.** Each was tested against one question at landing — *does it sit
inside a decision the operator has already taken in `roadmap.md` §6A?* — and **none of the three
does**. §6A covers the chip rail's neighbours but not the chip rail, and the confirm's presentation
but not its timing. Two carry an upstream constraint that narrows them without deciding them.

1. **`053` ADR-001 — extend the existing chip rail, or rebuild it on a new primitive?** The rail
   ships (`active-view-controls-renderer.ts`, auto-hiding at `:97`, on both the full-page and
   embedded paths) and the fixtures and screenshot manifest already track it. Its dual-mode clause
   was **amended at landing** and is no longer part of the question.
2. **`053` ADR-002 — delete the seven dead settings-entry methods and keep their classes?** Seven
   methods have zero call sites (`toolbar-renderer.ts:512`, `:519`, `:551`, `:1594`, `:2239`,
   `:2252`, `:2290`), and two anchor-fallback queries still read the classes they would stamp
   (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`).
3. **`053` ADR-003 — does the sort-conflict confirm gate the drop, or the gesture?** Gating the
   gesture changes the surface the board parity lane photographs; gating the drop leaves the
   surprise until drop time. `design-trueup.md` REQ-007 already ruled **confirm, not disable**, and
   `051` ADR-003 makes the confirm primitive `051`'s — neither says *when* it fires.
4. **`051` — does `fullscreen` survive as a third presentation?** Four surfaces use it, one of them
   the 1,664-line formula workbench that stays ours.
5. **`051` — may a registered stacked pair become an in-place sub-page?** Converting one changes a
   green `sheet-grammar` row's subject, which is the operator's call, not an agent's.

### The in-flight worktrees, with their tips

Read before assuming any state they touch. **None of these was opened for content this pass except
the five draft trees, which were read in full.**

| Worktree | Tip | State |
|---|---|---|
| `.worktrees/074-anytype-ios-sim` | `964a0b2a`, clean | The simulator route for mobile screens — the operator's decision that Anytype's mobile clients get captured in a simulator rather than scraped again from the stores. The twenty mobile images in `screenshots/anytype/` are **App Store / Google Play marketing creative**, and `design-trueup.md` REQ-012 refuses to take a number from them |
| `.worktrees/079-anytype-menus` | `396e1532`, **220 files dirty** | Every Anytype dropdown and mobile sheet screenshotted, per the operator's decision. This is the capture set `052`'s `anytype-menu-grammar.md` §4 lists as still missing and `054`'s §5B rows still need. **Uncommitted and unread** |
| `.worktrees/085-record-open-dock` | `9e0abab4`, clean | "Fix record open for all callers" — generalising row 48's fix from the one board card the report named to every caller of the record-open path. Running on GLM |
| `.worktrees/080-phase-modal-componentization` | `4a5b339b` | **Superseded.** Its `051` draft was scaffold only; the packet was written in-runtime |
| `.worktrees/081-phase-menu-componentization` | `4a5b339b` | **Superseded** by the landed `052` |
| `.worktrees/082-phase-toolbar-view-controls` | `4a5b339b` | **Superseded** by the landed `053` |
| `.worktrees/083-phase-record-relation-surfaces` | `4a5b339b` | **Superseded** by the landed `054` |
| `.worktrees/084-phase-states-feedback` | `4a5b339b` | **Superseded** by the landed `055`. Its copy of the parent `spec.md` carries two injected placeholder rows (`[Phase 51 scope]`, `[Criteria TBD]`) from `create.sh`; **they were not carried over** — this landing branched from `origin/main`, whose parent spec has none, and the phase map was written by hand |
| `.worktrees/086-land-phases-051-055` | this pass | The landing branch |

The five draft worktrees are the operator's to remove through `sk-git` once they confirm the landed
packets supersede them. Removing a worktree is not removing its branch.

### Still owed from the operator

A fresh device check against **`0.0.25`** for rows 29-33, 39-41 and 43, and a first look at rows
47-51; the vault side-by-side for rows 37/38; `044`'s and `045`'s AC-006; `046`'s AC-007 and its
`T016` settings-flag call; `006`'s two operator rows; and the five questions above. Each
confirmation closes its `roadmap.md` §4 row or its phase's own AC row; a "still broken" answer
reopens the row with the device fact given, never argued with. **No agent ticks an operator row.**
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Read this handover in full, then `goal-prompt.md`, before touching anything. The prompt was
   rewritten this pass and is under the 4,000-character cap at **3,912**.
2. Run `npm run gate` from a clean `main` checkout and confirm it green before assuming the tree is
   as described here. If the parent's phase count moved, regenerate `operator-checklist.md` with
   `node tools/naming/build-operator-checklist.mjs` — the `operator-list` lane reads it.
3. Ask the five operator questions in §2. Three of them (`053`'s ADRs) block that phase's first
   implementation leg; the other two block `051`'s.
4. **Run `051`-`055`'s T001 before any implementation in them.** Each phase's T001 is its capture
   read or its surface inventory, and each is a gate rather than a step — which is precisely the
   lesson this pass paid for.
5. Read `.worktrees/079-anytype-menus` before `052`'s or `054`'s T001: it holds the dropdown and
   mobile-sheet captures both of them are missing.
6. Work `050` T002 onward against the **restated** thresholds (ADR-004), never the originals.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

- **The spec-kit relocated to `runtime/cli`, and the validator is flaky inside a worktree.** Scripts
  now live under `.opencode/skills/system-spec-kit/runtime/cli/` (was `scripts/`), and the compiled
  validator is at `runtime/dist/lib/validation/orchestrator.js`. Validate every folder **from the
  primary checkout's cwd**, invoking through `realpath`, because a worktree's symlinked
  `node_modules` makes the run unreliable:
  `node "$(realpath .opencode)/skills/system-spec-kit/runtime/dist/lib/validation/orchestrator.js" <worktree-folder> --strict`.
  Take the **first** `RESULT:` line as a folder's own verdict — a phase parent recurses into its
  children and the tail describes the last child, not your packet.
- **`repair-derived.cjs` refuses a target outside the packet tree** when run from the primary
  checkout against a worktree path. Use
  `runtime/cli/dist/graph/backfill-graph-metadata.js <folder>` instead, scoped to the touched
  folders — **never `--all`**.
- **The `specs/context` symlink incident, and why this landing made no symlink in the draft trees.**
  A convenience symlink at `specs/context` was once staged as a self-referencing `120000` entry,
  and pulling it replaced the gitignored vendored `obsidian-pm-main` tree that
  `tools/live/reference-mount.ts` imports from. This pass symlinked only `.opencode` and
  `node_modules` into its own worktree, quoted, and read the five draft trees read-only.
- **A release commit must carry `main.js`.** `0.0.25` needed a second commit (`f2518f5e`) to
  include the rebuilt bundle after the cut (`2334046b`). A tag on a cut without its bundle installs
  as the previous version on the operator's phone and reads as "the fix did not ship."
- **The fan-out `iterations` field is load-bearing, and a leaf can die silently.** `051`'s leaf
  reported nothing and left scaffold. A wave needs a landing pass that reads each leaf's output;
  the file list is not the read.
- **Executor caps are real and they differ.** codex has a hard cap; opencode-go is a monthly cap.
  Neither is a per-run limit, so a wave that fits today may not tomorrow — check before dispatching
  five leaves, not after four of them return.
- **A "today" cell written from a prior document rather than from the tree is the expensive
  mistake.** Six of `050`'s fourteen thresholds asserted a failing value the tree does not have, and
  a threshold whose failing value is wrong cannot be observed red — so the criterion is
  unfalsifiable while looking rigorous. Every red in the five landed packets was re-measured.
<!-- /ANCHOR:next-session -->

---

## 5. CONTINUITY LOG

- **2026-09-05, `orchestrate-handover-19`: five family phases landed.** `051`-`055` opened from the
  operator's componentization instruction, four drafted by GLM 5.3 flash through cli-pi in parallel
  worktrees `080`-`084` and one (`051`) written in-runtime after its leaf died at the scaffold. All
  five reviewed against the parent's D1-D14, `050`'s `design-trueup.md` and the current tree;
  twenty-five `file:line` citations corrected; `055` renamed from `051-states-feedback-and-motion`
  with every internal identifier moved; `054` raised to Level 3. All five pass `--strict` with
  `Errors: 0`. Parent updated: `roadmap.md` §4 rows 47-51, §5.A rows 051-055, §6A's five afternoon
  decisions, §7.9's conflict table; `goal.md`'s DONE table and log; `spec.md`'s phase map extended
  to `055`; `goal-prompt.md` rewritten to 3,912 characters. `053`'s three ADRs left **Proposed**.

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
