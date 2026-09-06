---
title: "Session Handover: Component Surface System"
description: "Resume point: orchestrate-handover-23, 2026-09-06 ~16:35. Eleven legs landed since 11:05 (calendar unscheduled chip, wrap precedence, the stacked-sheet fix, board palette, modal-sheet scenarios, the Wrap-row hint, icon-picker drift, the sheet-family reconciliation, no-confirm delete, the dropdown combobox, failing-values wording). Two operator programmes now run at once: Anytype parity, and a new Notion refinement that reserves children 059-066 across the eight UI surfaces, wave 1 (059-062) researching since 16:14 and wave 2 queued. Three fresh rulings are recorded verbatim: run the sheet-family research now, the Notion refinement instruction, and the OpenRouter-then-DevPass GLM route. Documentation only: no src/, styles.css, tools/ or main.js file was touched."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-06T16:35:00Z"
    last_updated_by: "orchestrate-handover-23"
    recent_action: "Reserved 059-066 for the Notion refinement; recorded its additive-only rule as D15"
    next_safe_action: "Land 165/167/170/171/173 then cut 0.0.30; wave-1 syntheses open 059-062"
    blockers:
      - "059-066 are reserved, not created; only an Opus synthesis opens one, never a hand-made folder"
      - "058 T003 onward pending: the format-routing and Title-slot-affordance code has not landed"
      - "047: Fibery is running (worktree 150), ClickUp queued (151), Notion grouping query-derived (170)"
      - "051 T013/T014 (the operator device pass and confirm-timing follow-ups) stay open"
      - "056's ten T012 residuals: R6/R7 have a ruling to implement against; R1-R5, R8-R10 still open"
    key_files:
      - "specs/005-component-surface-system/roadmap.md"
      - "specs/005-component-surface-system/goal.md"
      - "specs/005-component-surface-system/058-card-title-and-title-formats/goal.md"
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover-23"
      parent_session_id: null
    completion_pct: 76
    open_questions:
      - "Does a Notion finding that contradicts a landed Anytype ruling ever become more than Proposed"
    answered_questions:
      - "058's per-view title picker is not new work: ViewConfig.titleField already ships"
      - "The real title gap is format routing (stringifyValue vs. the column's own formatter)"
      - "051 ADR-007 E4 closes: single-row delete drops its confirm, keeps the existing Undo toast"
      - "051 ADR-008: a new `side sheet` role, not a widened `panel` or a reused phone `sheet`"
      - "052's combobox ruling is distinct from dropdown-field.ts's existing gated (>8) search box"
      - "056 R6 reaffirms ADR-004 E1 as written; R7 is a fresh finding ADR-004 never addressed"
      - "054's and 057's roadmap-derived ratios were stale (3/7, 0/10); corrected to 2/7 and 7/10"
      - "a7db5035, previously cited as the wrap-toggle landing sha, is a post-rebase gate rebuild only"
      - "The sheet-family research does not wait for 044/048/051 to verify; the operator lifted that gate"
      - "GLM cannot read images, which is why every loop is fed a Sonnet digest instead of captures"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

### 2026-09-06 ~16:35, `orchestrate-handover-23`, read from `.worktrees/178-docs-refresh-1630`

**This is a documentation-only leg.** No `src/`, `styles.css`, `tools/` or `main.js` file was
touched. Main moved under it while it ran, as it has every session this week — **confirm branch tips
and worktrees yourself; treat every sha below as a record of what was true at 16:35, not as a
pointer.**

**Eleven legs landed since 11:05.** The calendar's unscheduled chip (`071041b7`), the wrap
precedence reversal and the phone wrap fix (`2c3c499a`), the stacked-sheet fix (`e632a1e1`), the
board palette (`dd71114f`), the modal-as-sheet screenshot scenarios (`5aeb7087`), the Wrap-row
wording hint (`5167eb8f`), the icon-picker drift (`4294770d` — resolved as a pointing-device
scrollbar mode, with the capture inputs widened rather than the baseline quietly re-pinned), the
sheet-family reconciliation (`6b16b87a`, taking `044` to 6/7, `048` to 7/8 and `051` to 2/9),
no-confirm single delete (`32411403`), the desktop dropdown combobox (`a952e5e7`) and the
failing-values wording (`0d36b377`).

**Two operator programmes now bind the same surfaces at once.** Anytype parity is unchanged for the
board and the calendar. On top of it, at ~16:10, the operator ordered a **Notion refinement** across
every UI phase. Eight children are **reserved and not created** — `059` board, `060` calendar, `061`
sheets, `062` table, `063` dropdowns, `064` toolbar, `065` record, `066` states. `goal.md` **D15**
and `roadmap.md` **§7.15** carry the rule that keeps them from fighting: **the refinement is
additive and never silently overrides a landed Anytype ruling**; a contradiction becomes a
**Proposed** ADR in the child and stops there.

**The pipeline, because its mechanics are what a resuming session gets wrong.** Per surface: (1) a
**Sonnet digest** of the relevant Notion captures at `<phase>/notion-screens-digest.md` — this stage
exists because **GLM 5.3 flash cannot read images**, so a capture reaches the loop as measured prose
or not at all; (2) `/deep:research:auto`, **5 iterations**, `--stop-policy=max-iterations`, on **GLM
5.3 flash max**; (3) an **Opus synthesis** that opens the child, landed by a fresh Opus verifier.
Wave 1 (`059`-`062`) has been running since **16:14** in `worktrees/174`-`177`; wave 2
(`063`-`066`) is queued.

**Two mechanics of the runner that will otherwise cost an hour each.** The research runner's print
session **ends when the fan-out detaches** — it looks like the loop died and it has not — so
`finish-research.sh` waits for the lineage and resumes the synthesis; run it rather than
re-dispatching. And **the gate must be run with stdin from `/dev/null`**, or `verify.mjs` hangs at
0% CPU looking like a slow run rather than a blocked one.

**The GLM route is a transport rule, not a model rule.** The operator at ~16:25:
*"use openrouter untill usage is 0 then devpass"*. `openrouter/z-ai/glm-5.3-flash` is tried first,
`llmgateway` (DevPass) is the fallback; OpenRouter credit read **$1.65 of $30 at 16:25**, so the
fallback is exercised rather than theoretical. Model ids pass exactly as each transport spells them,
never a near-miss (D14).

**In flight at 16:35, by worktree.** `150` Fibery harvest (web only, since ~16:04) · `151` ClickUp
harvest (queued, Opus xhigh) · `165` calendar rebuild (**12 of 15 gestalt rows green**, unlanded) ·
`167` board page-scroll · `170` Notion content reclassification (the harvest's non-flow groups are
query-derived; 5 of 9 web spot checks were in a group they do not depict) · `171` shell lane rows
and depth-3 captures · `172` the 10-iteration sheet-family research on DevPass, started ~15:50 on
the operator's *"Run it now on the current state"* · `173` comment-hygiene enforcement (the comments
lane was not checking artifact ids) · `174`-`177` the Notion wave-1 research.

**Order of work is `goal-prompt.md`'s**, and it starts with landing `165`, `167`, `170`, `171` and
`173`, then cutting **0.0.30**. Do not tick an operator row, and do not open `059`-`066` by hand.

### 2026-09-06, read from this worktree (`.worktrees/152-docs-058-and-refresh`) — main is a moving target, do not trust a pinned sha

**This session's own work is a documentation-only leg**, run per an explicit hard rule: no `src/`,
`styles.css`, `tools/` or `main.js` file was touched, nothing was pushed, and a fresh verifier lands
it. It opened `058-card-title-and-title-formats` from the operator's phone-board report and amended
six sibling goals — `047` (Mobbin reference harvests), `051` (the desktop Settings side sheet, ADR-008,
and ADR-007 E4's closure), `052` (the combobox ruling, the Operator-dropdown anchoring defect), `053`
(the toolbar gear button, the table footer rule, row 53 confirmed shipped), `055` (the single-row
delete confirm removed, closing E4), `056` (R6/R7 board-colour rulings, a pointer to `058`) — plus a
refreshed `roadmap.md` (§4, §5.A, §6A) and this document. Every touched packet's `validate.sh
--strict` first `RESULT:` line reads `PASSED`; the 005 parent's own recursive-free packet check does
too.

**Main is advancing concurrently, in real time, while this leg ran.** Checked twice in one sitting:
main's `HEAD` moved from `0e8185b6` to `03aa151d` between two `git rev-parse` calls a few minutes
apart, and `manifest.json` on main already reads **`0.0.29`** — a version this session was told to
expect only *after* `056`'s residuals and `057`'s flatten-to-chip-ink leg landed. Reading main's log
directly (not from memory) shows both have: `9f30fc31` (`fix(calendar): flatten the week/day timed
block to the month chip's ink`) and a confirm-primitive/E4 sequence (`1a72ed9e`, `e2e2416e`,
`66d92b4f`) plus board-geometry work (`0fe620fd`, `eebbb29f`, `e97524fb`, `1a4b30e6`) and a doc
commit, `06c6425a`, that **already records `056`'s R6/R7 rulings** independently of this session's
own `056` amendment. `git diff --stat` between this branch's merge-base (`3b3ac633`) and main's tip
shows real, substantive, **independent** edits to `055/056/057`'s own tasks/acceptance/decision
files — this branch and main diverged on the same shared program docs.

**What this means for the next session, stated plainly rather than smoothed over.** This branch's
`051`/`052`/`053`/`055`/`056` amendments were written and validated against this branch's own base
(`3b3ac633`), which is now behind main. They are not wrong — every finding in them was read from
source and is still true of the code as of this branch's base — but landing them onto current main
needs a real rebase and a truth reconciliation pass, the same discipline this program has applied to
every prior concurrent-edit collision (`roadmap.md` §7's own worked examples), **not** a blind merge.
In particular: `056`'s R6/R7 addendum in this branch's `decision-record.md` will very likely need to
be read alongside `06c6425a`'s independent record of the same two rulings and reconciled rather than
both kept. Do not assume either side is the complete picture; read both.

**Live worktrees relevant to tonight**, re-read from `git worktree list` plus each one's own
`git log -1` and `git status --porcelain` at the time of this rebase — not carried from the earlier
read, which is already stale:

| Worktree | Tip | Working tree | What it carries |
|---|---|---|---|
| `146-impl-053-table-footer` | `38dde17a` | clean | The footer rule landed and recorded (`20389105` is its earlier docs commit); ahead of what `053`'s own docs describe |
| `147-impl-052-searchable-dropdowns` | `4b3adca0` | 11 files dirty | The Operator-dropdown anchoring fix; the combobox behaviour itself is still ahead of it |
| `153-impl-051-settings-side-sheet` | `6c718f63` | 58 files dirty | ADR-008's side sheet role, mid-flight |
| `154-impl-055-no-confirm-delete` | `c68e0347` | clean | `fix(delete): skip the confirm for a single-row delete, keep the toast's Undo` — E4's ruling implemented, not yet on main |
| `155-impl-057-phone-week` | `6c718f63` | 32 files dirty | T018's minimum column width and horizontal phone-week scroll |
| `156-impl-056-palette` | `0e8185b6` | 10 files dirty | R6/R7's tint fill and neutral grey |
| `148-harvest-notion`, `149-harvest-evernote`, `150-harvest-fibery`, `151-harvest-clickup` | all `3b3ac633` | `148` 1 file dirty, rest clean | `047`'s four Mobbin harvests, none dispatched. **Dispatch them one at a time** — four concurrent capture legs contend for the same manifest and lane artefacts |

**There is no `157-release-0-0-29` worktree.** The earlier read of this document named one; `git
worktree list` has no such entry, and `0.0.29` was cut on main directly at `03aa151d`. **None of the
worktrees above was opened for content by this leg** — the table reports their git state only.

**Corrected against the operator's own dictation, and the earlier correction was itself wrong.**
The earlier read reported `793b9b4` as "not a valid revision"; that string is a mistyped
abbreviation. **`793ab9b4` resolves**, and it is `chore(gate): re-stamp evidence timestamps from the
closing gate run` (2026-09-06 04:11) — the *closing* commit of the month-grid landing sequence, not
the landing. The true chain, read from `git log --oneline | grep -i calendar` on main:
**`d2fe6bea`** `feat(calendar): retarget month grid to Anytype's measured layout (T005-T007)` is the
landing; **`9ccb8d80`** `docs(specs): close AC-002 and AC-003 on the month-grid retarget` records
it; `4beec550` recaptured, `3ade4cae`/`2f5cf1e7` took the CSS lane, and `793ab9b4` re-stamped the
evidence. Separately, **`9f30fc31`** `fix(calendar): flatten the week/day timed block to the month
chip's ink` is the *flatten* landing and **`6b5d0ea2`** is its docs commit — a different leg from the
month grid, and the pair the earlier read had conflated with it. Cite the landing, not the
re-stamp: an evidence re-stamp names the run, not the change.

**Harness traps learned tonight, from the ledger this session read rather than from firsthand
reproduction — recorded as reported, not re-verified by this leg:** `git config rerere.enabled` is
`false` in this repository (confirmed directly) — do not expect rerere to resolve a rebase conflict
automatically. Capture **bytes** jitter run to run while `pixelHash` stays deterministic — a byte-diff
on a PNG is not evidence of a visual change; read the hash, and if it moved, look at the image. A
print-mode gate leg must not be backgrounded — the pattern this program already carries
(`npm run gate` needs `</dev/null`) generalises: anything that reads stdin or writes a progress
stream to a foreground terminal will hang or truncate if it is not run to completion in the
foreground. When restoring a bytes-only re-encoded capture, restore the **named file paths**, never
the whole directory — a directory-level restore can revert a sibling capture that changed for a real
reason in the same pass. **`gh` resolves to the upstream repository from the primary checkout**, so
every `gh` call that must act on this fork passes `-R MichelKerkmeester/obsidian--notion-clone`
explicitly; without it a release or issue command silently addresses the wrong repository.

---

**Main carries `0.0.29`** (cut `03aa151d`, 2026-09-06 09:01; the cadence row landed after it at
`578991e8`). Tonight's later landings on main, in order and each read from `git log`:
`6c718f63` (08:23, the calendar leg's post-rebase re-derive), `4224b092` (08:41, the confirm
primitive's evidence rebuild), `0e8185b6` (08:54, the board residuals' third-rebase re-derive),
`03aa151d` (09:01, the `0.0.29` cut) and `578991e8` (09:09, the cadence row). **This branch is
rebased onto `578991e8`**, and the shared-doc reconciliation the paragraph above asked for has been
done rather than deferred: `051`'s E4 closure, `056`'s R6/R7 and the roadmap's §5.A rows and §6A
entries each survive **once**, taking main's landed record where the two disagreed and folding in
only what this branch carried that main did not.

The paragraph below is retained as the state at `0.0.26` and is history, not current:

**`0.0.26`** (cut `8c7b65aa`). It ships `006-record-open-target`'s docking fix
(`ae46da94`) — the generalisation of §4 row 48 to **every** caller that opens a record with no
element to point at, which is §4 **row 52**, now reading *shipped in 0.0.26, awaiting operator*.
`0.0.25` under it carries the five desktop fixes (rows **47-51**) and `0.0.24` the stacked sheets,
sheet grammar, linked-view chrome and gallery migration. **Nothing in any of the three is
operator-confirmed**, which is D3 working as written, not a gap.

**All six capture true-ups are done, and the reconciliation pass that read them together is this
one.** `050`'s T001 landed earlier; `051`-`055`'s landed 2026-09-05 in worktrees `087`-`092` as
`8e0149af`, `a58bbcd5`, `fbbddc13`, `621de37f` and `ffcf434b`+`cd8030a8`. Running five reads of one
product in parallel is what made the next paragraph possible, and it is the argument for having done
it that way.

**`050`'s own read — the program's read of record — was wrong in five places, and its siblings found
them.** `053`'s T001 opened the catalogue List views, the `New ⌄` menu and the per-layout settings
blocks that `050` never opened:

| `050` said | The captures show | Now at |
|---|---|---|
| C2: no chip row on any capture | The chip rail on **eleven** captures, and **conditional** — present on 5 of 5 List views carrying a filter, absent on Grid, Gallery, Kanban, Calendar and Graph | C2 withdrawn; the rail's geometry adopted, its contrast refused |
| C7: no per-view default in the product | `Default Type for this View` and `Template for this View`, in the `New ⌄` menu's `Settings` section | C7 narrowed to the settings panel; our row belongs beside the create affordance |
| REQ-013: the filter panel is one `+ New filter` row | That is the **empty state**. The populated panel is captured across **twelve** relation formats | REQ-013 leaves the "no reference screen" list, which falls from five items to four |
| The page limit is 60, Anytype's captured default | **Per-layout**: Gallery 60, Kanban 10, and no limit row on Grid, List, Calendar or Graph | AC-014's 60 becomes **our** number for an embedded table, argued rather than quoted |
| §2: hover states were never captured (from the capture index) | **37** of the 150 menus were reached by hovering a parent row, each photographing that row hovered: `#232323`, 28px, 1.14:1 | Corrected in `050` §2, in `screenshots/anytype/README.md`, and in `roadmap.md` §6A |

**Three of the four are one error**, and it is worth carrying forward: **an absence asserted from a
surface that was never examined.** C2 scanned the four toolbar icons and never the band beneath them.
C7 searched the settings panel and concluded "absent from the product". The page limit was read off
one layout's panel and quoted as a product default. `050` ADR-003 gains a second corollary —
*absence in one captured surface is evidence about that surface only*.

**Four numbers disagreed across the five reads, and `roadmap.md` §7.10 settles them**: secondary text
is **7.11:1** not 7.95:1 (the read that stated its method wins), the `#232323` fill is **1.14:1** not
1.20:1 (three packets and a re-derivation against one), Anytype's motion exit is **0.2s** not 0.1s
(`055` read the source file `047` paraphrased), and the iOS sheet row pitch is **not** a disagreement
— five packets measured five different sheets and there is no single product figure. The same section
names **one owner per shared primitive**; two of the six were owned only in this document's family
table and are now written into their own packets.

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
each carries a binding `goal.md`. **All five have now run their T001**, and every one still reads
`0/N` in the parent's DONE table — which is correct, not a lag. A true-up designs against the
captures; **T002 is what measures a red**, and no packet has run one. `roadmap.md` §5.A reads *T001
true-up done 2026-09-05, implementation pending* for all six, with `053`'s cell naming the codex leg.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: THE TRUE-UPS ARE DONE — RUN T002, NOT CODE

**Every packet's next step is its own T002**, the red-first measurement of the thresholds its true-up
restated. `053`'s implementation leg is already running on codex and is the exception, not the
pattern: it starts first because it carries `050` items 1, 2, 4, 7, 10 and 12 and because all three
of its ADRs are Accepted. **`052` is the next to open** (its `checklist.md` C7 is now reconciled and
its migration table, T003, is the leg after), then `054`, `051`, `055` by inventory rank.

**Do not read a true-up as permission to write code.** Six documents now describe what each surface
should be; not one of them has observed a failing value on the current tree. D2 is unsatisfied in all
six until T002 runs, and the whole reason `050`'s thresholds had to be restated was a packet that
asserted a red without measuring it.

### The five operator questions, answered 2026-09-05 (~14:15) and unchanged since

**`053`'s three ADRs were PROPOSED at landing.** Each was tested against one question — *does it
sit inside a decision the operator has already taken in `roadmap.md` §6A?* — and **none of the
three did**. §6A covered the chip rail's neighbours but not the chip rail, and the confirm's
presentation but not its timing. The operator has since answered all three directly, and `051`'s two
open questions alongside them. All five are now **Accepted** — quoted in full in `roadmap.md` §6A's
"Five more, taken 2026-09-05 (~14:15)" table and in each packet's own `decision-record.md`.

1. **`053` ADR-001 — extend the existing chip rail, or rebuild it on a new primitive?** **Accepted:
   "Extend the existing rail."** `active-view-controls-renderer.ts` is kept and reshaped to the
   Anytype-derived layout; no new chip-row component. (Its dual-mode clause was already amended out
   at landing.)
2. **`053` ADR-002 — delete the seven dead settings-entry methods and keep their classes?**
   **Accepted: "Delete methods, keep classes."** The seven zero-call-site methods
   (`toolbar-renderer.ts:512`, `:519`, `:551`, `:1594`, `:2239`, `:2252`, `:2290`) are removed; the
   two anchor-fallback queries (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) keep
   the classes `createSettingsEntry` stamps on the live trigger.
3. **`053` ADR-003 — does the sort-conflict confirm gate the drop, or the gesture?** **Accepted:
   "On drop."** The drag proceeds unchanged; on drop, an active sort raises the confirm and offers
   clear-sort-and-commit or decline-and-revert.
4. **`051` — does `fullscreen` survive as a third presentation?** **Accepted: "Keep fullscreen for
   the workbench only."** `FormulaModal` stays `fullscreen`; the other three fullscreen subclasses
   become modal (desktop) / sheet (phone). Recorded as new ADR-004.
5. **`051` — may a registered stacked pair become an in-place sub-page?** **Accepted: "Yes, where
   the capture shows it."** A pair converts only where its equivalent Anytype surface's capture
   shows the replace-in-place pattern, judged per pair; `048`'s stacking model stays the default for
   every other pair. `048/decision-record.md` records the scoped exception.

### The in-flight worktrees, with their tips

Read before assuming any state they touch. **None of these was opened for content this pass except
the five draft trees, which were read in full.**

| Worktree | Tip | State |
|---|---|---|
| `.worktrees/074-anytype-ios-sim` | `964a0b2a` — **now on `origin/main`** | **Landed during this pass.** The open-source Anytype iOS client built from source and run on a simulator: **59 states in light and dark, 118 files** under `screenshots/anytype/mobile/`, against the same 326-record demo space the desktop captures used. It closes `050` item 13's capture gap — `design-trueup.md` REQ-013 recorded that no filter or sort sheet appears in any of the 151 desktop files, and four now do — and gives `051`-`055` the phone reference every one of them was designed without. Each of the five gained a dated reconciliation block; **the pixels are unread in all of them** |
| `.worktrees/079-anytype-menus` | `396e1532`, **220 files dirty** | Every Anytype dropdown and mobile sheet screenshotted, per the operator's decision. This is the capture set `052`'s `anytype-menu-grammar.md` §4 lists as still missing and `054`'s §5B rows still need. **Uncommitted and unread** |
| `.worktrees/094-impl-053-toolbar` | `ae46da94` at dispatch | **In flight, on codex.** `053`'s implementation leg — the first of the five families to start. It holds the toolbar's five composed primitives and `050` items 1, 2, 4, 7, 10, 12. Do not open the same files from another leaf |
| `.worktrees/096-screenshots-regroup` | `d486eab9`, **landed on `origin/main`** | **Landed.** The Anytype captures are regrouped into `screenshots/anytype/{official, desktop/{sets/<use-case>, app, menus}, mobile/{official, sheets, app}}`, filenames unchanged, and the citing docs under `047`, `051`-`055` follow. **Cite the new form.** One residue it left: `052`'s `design-trueup.md` still carries ~70 bare `menus/` shorthand references — that packet's to normalise. Removable |
| `.worktrees/087-trueup-051` … `092-trueup-054` | `8e0149af`, `a58bbcd5`, `fbbddc13`, `621de37f`, `cd8030a8`, `7b516cba` | **Landed. Removable.** All six are ancestors of `origin/main`; removing a worktree is not removing its branch |
| `.worktrees/085-record-open-dock` | `ae46da94`, landed | **Landed and shipped in 0.0.26.** "Fix record open for all callers" — row 48's fix generalised to every caller of the record-open path. Removable |
| `.worktrees/080-phase-modal-componentization` | `4a5b339b` | **Superseded.** Its `051` draft was scaffold only; the packet was written in-runtime |
| `.worktrees/081-phase-menu-componentization` | `4a5b339b` | **Superseded** by the landed `052` |
| `.worktrees/082-phase-toolbar-view-controls` | `4a5b339b` | **Superseded** by the landed `053` |
| `.worktrees/083-phase-record-relation-surfaces` | `4a5b339b` | **Superseded** by the landed `054` |
| `.worktrees/084-phase-states-feedback` | `4a5b339b` | **Superseded** by the landed `055`. Its copy of the parent `spec.md` carries two injected placeholder rows (`[Phase 51 scope]`, `[Criteria TBD]`) from `create.sh`; **they were not carried over** — this landing branched from `origin/main`, whose parent spec has none, and the phase map was written by hand |
| `.worktrees/086-land-phases-051-055` | this pass | The landing branch |

The five draft worktrees are the operator's to remove through `sk-git` once they confirm the landed
packets supersede them. Removing a worktree is not removing its branch.

### The evidence moved again while this pass was committing

`964a0b2a` landed on `origin/main` between this pass's last packet commit and its rebase. It is the
iOS simulator capture set, and it supersedes `design-trueup.md` wherever that document reports a
phone surface as uncaptured — which is often, because its only phone evidence was twenty App Store
and Google Play marketing images. **This is the second time in one day that a landing had to
reconcile against evidence that arrived mid-flight**, and it is the same lesson both times: the
capture read is a gate, not a step.

Rather than land five packets asserting a gap that had just closed, each gained a dated
reconciliation block naming the captures its phone rows should now be trued against. **No block
claims a reading** — this pass could not open image files any more than the drafting pass could.
Four specific changes a later reader should not have to rediscover:

- **`053` T1/T2**: `design-trueup.md` C4 said no view-tab context menu was ever captured, so its
  design stayed source-derived. On iOS it is captured twice —
  `anytype-mobile-sheet-set-viewswitcher-edit` (delete handles, reorder grips, a pencil per view)
  and `anytype-mobile-sheet-view-edit-more` (the view's own action menu). The desktop finding is
  unchanged; the phone half is no longer a guess.
- **`053` T16/T17 and `050` item 13**: four filter and sort sheets now exist where the desktop
  sweep had none.
- **`054` A5**: corrected to *code-derived* earlier in this same pass, and now back to captured on
  the phone — `anytype-mobile-sheet-relation-add` shows all eleven formats.
- **`054` S9**: twelve captured cell editors, one per format, against ADR-002's ten extractions.

**Read `screenshots/anytype/README.md`'s mobile section before any of the five T001s.** It carries a
written description per file and records what the set cannot answer: the iOS client ships **no
Calendar and no Graph layout at all**, so its surface set is narrower than the desktop's rather than
a translation of it.

### Still owed from the operator

A fresh device check against **`0.0.26`** for rows 29-33, 39-41 and 43, and a first look at rows
**47-52** — row 52 being the record-open docking this release carries; the vault side-by-side for
rows 37/38; `044`'s and `045`'s AC-006; `046`'s AC-007 and its `T016` settings-flag call; and
`006`'s two operator rows. The five questions above are answered as
of 2026-09-05 (~14:15). Each confirmation closes its `roadmap.md` §4 row or its phase's own AC row;
a "still broken" answer reopens the row with the device fact given, never argued with. **No agent
ticks an operator row.**
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Read this handover in full, then `goal-prompt.md`, before touching anything. The prompt was
   rewritten this pass and sits at the 4,000-character cap exactly.
2. **Read `roadmap.md` §7.10 before quoting any measured Anytype number.** Four of them disagreed
   across the five reads and the section says which value won and why. Quoting the loser is how a
   corrected number gets re-introduced.
3. Run `npm run gate` from a clean `main` checkout, `</dev/null`, and confirm it green before
   assuming the tree is as described here. If the parent's phase count moved, regenerate
   `operator-checklist.md` with `node tools/naming/build-operator-checklist.mjs` — the
   `operator-list` lane reads it.
4. **Run each packet's T002 before any implementation in it.** All six T001s are done; not one
   threshold has been observed red. `053` is the exception already in flight on codex — check
   `worktrees/094-impl-053-toolbar` before opening any toolbar file.
5. Work `050` T002 onward against the **restated** thresholds (ADR-004 **as amended 2026-09-05**),
   never the originals — and note that AC-014's `60` is now ours to argue, not Anytype's to quote.
6. Cite captures in the regrouped form (`d486eab9`): `desktop/sets/<use-case>/`, `desktop/app/`,
   `desktop/menus/`, `mobile/official/`, `mobile/sheets/`, `mobile/app/`. Filenames did not change.
   `052`'s `design-trueup.md` still carries ~70 bare `menus/` references and is the one file left.
7. `.worktrees/079-anytype-menus` is still uncommitted and holds desktop dropdown captures; the
   `desktop/menus/` set the true-ups cite is on main.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

### The day's traps, in the order they cost time

- **GLM cannot read images, and it loops on exploration when asked to.** The true-up legs are capture
  reads. A GLM leaf given one will explore the tree indefinitely rather than report that it cannot
  open a PNG. Route a capture read to a model that can see, and treat "still working" on an image
  task as a failure signal, not progress.
- **OpenRouter has an idle timeout**, and a long reasoning leg hits it without producing an error the
  caller recognises as a timeout. DevPass is the fallback per §6A, and its own failure is a mid-run
  stop that reads as a completed dispatch. Both need the landing pass that reads each leaf's output.
- **codex has a cap window, not a per-run limit.** A wave that fits at noon may not fit at four.
  Check before dispatching, not after the third leaf returns empty.
- **`npm run gate` needs `</dev/null`.** Without it the gate can block on a prompt and read as a
  hang, which then gets killed and reported as a failure it was not.
- **The validator is flaky inside a worktree** — see the item below. Validate from the primary
  checkout's cwd, through `realpath`, and require an explicit `RESULT: PASSED`; a stale compiled
  orchestrator exits 3 with **no rule output at all**, which a grep for `FAILED` reads as clean.
- **The spec-kit relocated to `runtime/cli`.** Scripts that used to be under `scripts/` are not.
- **The `specs/context` symlink incident.** Never stage it; symlink it into a worktree and leave it
  out of every commit.
- **A release commit must carry `main.js`.** `0.0.25` needed a second commit for the bundle. A tag
  on a cut without its bundle installs as the previous version and reads as "the fix did not ship".
- **The Anytype captures moved.** `d486eab9` regrouped them into
  `screenshots/anytype/{official, desktop/{sets/<use-case>, app, menus}, mobile/{official, sheets, app}}`
  with filenames unchanged. Cite the new form; the old flat and `mobile-official/` paths are gone.
- **`screenshots/README.md` is generated** by `tools/screenshots/capture.mjs`, and it does **not** yet
  list the `anytype/` and `project-manager/` roots. That is a harness follow-up, not a document edit
  — editing the file by hand would be overwritten by the next capture run.

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
- **And the same mistake has a second half, learned today: a value read off one surface and quoted
  as the product's.** `050` did it three times — no chip row (from a region never scanned), no
  per-view default (from one panel), a 60-row page limit (from one layout). A capture read is only
  evidence about what it photographed, and "I looked and it is not there" needs the *where* attached
  to be worth anything.
- **A quoted contrast ratio is not a measured one.** Two of the four cross-family conflicts were
  arithmetic: 7.95 versus 7.11, 1.20 versus 1.14. Recompute from the sampled hex and say that you
  did; a ratio carried between documents drifts and nothing catches it.
- **An ownership written in the handover and not in the packet is invisible.** The condition row and
  the inline editors each had one owner in this document's family table and nothing in `053`'s or
  `054`'s own files. An implementation leg opens the packet, not the handover.
- **`check-lane` reads only the NEWEST history entry, so an older release's `reviewed` list is
  never re-checked.** `reviewVerdict` takes `history[history.length - 1]` and returns pass
  immediately unless that entry is a `release` whose `hash` equals `baselineHash`. Grandfathering
  older releases is deliberate — back-filling `reviewed` onto reviews nobody did would manufacture
  the evidence the rule exists to require — but it has a live consequence: if your commit moves a
  capture and the newest entry is somebody else's release sitting on the current stylesheet, the
  fix is to **append your own release entry at the same hash naming your captures**, never to add
  your paths to their list. There is ample precedent for a "not a CSS edit" release at an unchanged
  `baselineHash`; roughly two dozen entries already are one.
- **One capture depends on the host's pointing device, not on this repository.**
  `field-icon-picker-desktop-{dark,light}` moves 10 device px whenever the machine flips between
  classic and overlay scrollbars (macOS "Show scroll bars: Automatically" resolves on whether a
  mouse is attached). `.db-icon-picker-scroll` asks for `scrollbar-gutter: stable`, which Blink
  honours with real width only under classic scrollbars, and `.db-icon-picker-grid` centres an
  `auto-fill` track set inside it, so a 10px content-width change moves the partially-filled Recent
  row 5 CSS px. It is the only capture in the 576 with this sensitivity — a full run on a flipped
  host moves exactly those two and nothing else. **Do not bisect it.** If it reappears, recapture,
  append a lane release naming the two files, and move on; removing the sensitivity for real means
  either left-aligning the picker's grid (a product change, needs the operator) or pinning
  scrollbar metrics in `tools/screenshots/theme.css` (re-renders every scrollable surface).
- **Comment hygiene's artifact-id rule is now enforced, not only stated.** `scan-comments.mjs`
  (the `comments` gate lane) scans `src/**/*.ts`, `tools/**/*.{ts,mjs,js}`, `styles.css` and every
  `describe`/`it`/`test` name for a task id, an ADR/REQ/CHK/AC id, a packet number used as a label,
  or a numbered spec-folder path, with no baseline — a hard block with a ratchet is a suggestion.
  This repo also carries its own `tools/git-hooks/pre-commit` (install:
  `git config core.hooksPath tools/git-hooks`), because the pre-commit hook this machine actually
  runs lives outside this repository and does not catch every shape this rule forbids.
<!-- /ANCHOR:next-session -->

---

## 5. CONTINUITY LOG

- **2026-09-06 ~10:50, `orchestrate-handover-22`: five new operator reports recorded, `057`
  reopened, the phone-week ruling superseded — documentation-only.** Ran in
  `.worktrees/163-docs-refresh-1045` under the same hard rule as handover-21: nothing outside
  `specs/`, no sub-agents, foreground only.

  **Landed on main since the 09:30 refresh**, all read from `origin/main` rather than from a
  report: `0d36b377` (the two footer and board red values reworded so the failing-values scan reads
  them), `32411403` (the no-confirm single delete recorded), `f962d626`/`7c7617c4` (that delete and
  its test), `537bbb61` (the shared popover left-aligned under its trigger), `0c3f6410` (every
  desktop dropdown a combobox, the trigger becoming the input), `a952e5e7` (the combobox ruling
  recorded and the tree re-derived), and `396bcae7` (the phone week/day grid's 80px minimum
  column — **superseded within the hour**, see below).

  **Five operator inputs inside forty minutes, now §4 rows 59-63.** Row 59, 10:04 on iOS 0.0.29:
  the stacked sheet is *"really bad bugged"* — four defects on one capture (a duplicate close
  control, a header/body ink split, ~200px of dead space above the title, parent bleed with a "14"
  badge over the toolbar), owners `048`/`051`/`044`, fix leg `worktrees/159`. The same report
  carries a **standing instruction** rather than a defect: once `044`, `048` and `051` are done and
  verified, an extra `/deep:research:auto` of 10 iterations at `--stop-policy=max-iterations` on
  GLM 5.3 flash max via `cli-pi` (OpenRouter first, DevPass fallback), bounded prompts with an
  explicit file list and **no image reads** (GLM cannot read PNGs), in a fresh worktree, then an
  Opus synthesis that updates or adds phases — recorded as a planned leg with its executor spec in
  `051/goal.md` §4, `051/tasks.md` T025 and `051` AC-014. Row 60, ~10:25 desktop: wrap off still
  draws six-line rows in a long-text column; owner `053`, leg `worktrees/160`, **the producer is
  not named and the criterion says so**. Row 61, ~10:30 board: the page must scroll rather than a
  column and desktop scrollbar chrome is hidden; owner `056`, and it **declines a measured parity
  value**, so ADR-008 records an operator ruling as a third ground beside ADR-002's two WCAG
  grounds, with §7.13 carrying the conflict against `design-trueup.md` A10's 10px sticky bar. Row
  62, ~10:33 calendar: the unscheduled band becomes a subtle affordance; owner `057`, leg
  `worktrees/161`. Row 63, ~10:40: *"in general our calendar looks nothing like anytype yet"* —
  **`057` is REOPENED**.

  **`057` is the substantive change.** Its Met rows were measured value by value and every number
  still holds; a gestalt judgement is a different question and outranks them (D3). **Nothing is
  un-ticked.** A new OPERATOR/GESTALT criterion and AC-013 open with the **threshold deliberately
  empty**, to be filled from the side-by-side review running in `worktrees/162` into
  `review-ui-calendar-2026-09-06.md`; §7.14 records the conflict. The ~10:47 ruling *"Stagger
  overlaps at 45px"* **supersedes `396bcae7`'s 80px minimum column**: ADR-005 is amended in place
  and dated, T018 stays closed as the record of what landed, T019 carries the supersession.

  **In flight at handover:** `148`-`151` (047's Mobbin harvests — Notion running since ~10:00 by
  the **scripted-loop** method, one Code Mode execution per batch, two platform lanes, 40 req/min,
  1,679 `.webp` counted in its worktree at 10:50 against the leg's reported 1,510+ at 10:27;
  Evernote, Fibery and ClickUp queued and idle), `156` (056 palette), `159` (048 stacked-sheet fix),
  `160` (053 wrap-off rows), `161` (057 unscheduled).

  **Two of them landed while this leg was writing, and the rebase reconciled by truth rather than
  by ours-versus-theirs.** `153`'s side sheet landed (`74f4db4b` and below): 051's criterion keeps
  main's measured text — three of four clauses green, *interactive* still open — and this leg's
  deep-research criterion is appended after it rather than replacing it. `162`'s calendar review
  landed too, which **superseded this leg's own 057 wording an hour after it was written**: the
  gestalt criterion no longer says "threshold TO BE FILLED", it takes the review's **G1-G15**, and
  the chip-alignment criterion and task written here were **dropped** because G3 and G5 already own
  them, measured on the same corpus. The stagger task renumbered T019 → **T020** behind main's
  T019 rebuild. §5.A was re-derived a second time after the rebase: 051 is 1/9, 053 is 2/11, 056 is
  0/10, 057 is 7/12.

  **§5.A was re-derived from each `goal.md` rather than carried forward, and three figures were
  wrong.** `055` read 25% — 2/8; its `goal.md` has never held a ticked criterion, so the honest
  figure is 0% — 0/9. `056` read 91% — 10/11 and `057` read 80% — 8/10; both were the
  acceptance-criteria scale rather than §3.2's `goal.md` rule. After the rebase they re-derive to
  0% — 0/10 and 58% — 7/12. The AC counts are kept alongside, named as the other scale, rather
  than deleted, and `057`'s cell now also carries **0 of 15** on the review's G rows.

  **A trap worth carrying:** a gate run started without `</dev/null` hangs at 0% CPU inside
  `verify.mjs` waiting on stdin. It looks like a slow capture sweep and is not one. Redirect stdin
  from `/dev/null` on every gate invocation.


- **2026-09-06, `orchestrate-handover-21`: `058` opened, six goals amended, roadmap and this
  document refreshed — documentation-only, nothing pushed.** Ran in an isolated worktree
  (`.worktrees/152-docs-058-and-refresh`) under an explicit hard rule: no `src/`, `styles.css`,
  `tools/` or `main.js` edit, foreground only, a fresh verifier lands it. `058-card-title-and-title-
  formats` opened Level 2 from the operator's phone-board report; reading the tree first found the
  per-view title picker already shipped (`ViewConfig.titleField`) and reaching the board card and
  record header for every view but calendar/timeline — the real gap is `resolveTitleFieldDisplay`
  routing every title through `stringifyValue()` instead of the chosen column's own number/currency
  format, and the board's own Properties sheet showing the title choice as inert text. Four ADRs
  record it; no code changed. Six sibling goals amended with dated sections, new completion
  criteria, task rows and acceptance rows (never rewriting history): `047` (four queued Mobbin
  harvests — Notion, Evernote, Fibery, ClickUp — one landed and verified before the next opens),
  `051` (ADR-008, a new `side sheet` shell role for the desktop database Settings surface; ADR-007's
  flagged E4 hold closed on the operator's "No confirm for single delete, Undo toast" ruling), `052`
  (every desktop dropdown becomes a combobox; the filter/sort Operator dropdown's anchoring defect),
  `053` (a toolbar-rail gear button before `···`; the table-footer hide-at-zero-rows rule; row 53's
  wrap toggle reconfirmed shipped with its real commits, correcting an earlier session's mis-cited
  landing sha), `055` (the `deleteRow` call-site change `051`'s E4 closure requires), `056` (R6/R7
  board-colour rulings — "Anytype tint fill", "Neutral, match Anytype" — recorded as a `decision-
  record.md` ADR-004 addendum, and a pointer to `058`). `roadmap.md` gained three §4 rows (56, 57,
  58), a refreshed §5.A (058 added; 047/050-057 read against their own docs rather than the prior
  roadmap prose, which surfaced and corrected two stale derived ratios — `054` 3/7 → 2/7, `057`
  0/10 → 7/10), and five new §6A ruling entries. The parent `goal.md`'s phase-subgoals table gained
  058 and carried the same two ratio corrections; its continuity frontmatter was refreshed.
  **The one finding that outranks the rest of this entry**: main advanced concurrently and in real
  time while this leg ran (`HEAD` moved from `0e8185b6` to `03aa151d` between two checks minutes
  apart; `manifest.json` already reads `0.0.29`), landing real, independent edits to `055`/`056`/
  `057`'s own doc files — including a `06c6425a` commit that separately records `056`'s R6/R7
  rulings. This branch and main have diverged on shared program docs and need a rebase plus a truth
  reconciliation before landing, not a blind merge; see §1's dated subsection for the full reading
  and the live-worktree inventory. Every touched packet here validated `RESULT: PASSED` against
  this branch's own base; that has not been re-checked against main's current tip.

- **2026-09-05, `orchestrate-handover-20`: all six true-ups reconciled, and `050` corrected.**
  `051`-`055` each ran T001 in its own worktree (`087`-`092`) and landed as `8e0149af`, `a58bbcd5`,
  `fbbddc13`, `621de37f` and `ffcf434b`+`cd8030a8`; `006`'s record-open docking landed at `ae46da94`
  and shipped as **0.0.26** (`8c7b65aa`), closing the in-repo half of §4 row 52. This pass read the
  five together, which is a different job from running any one of them, and it found the program's
  own read of record wrong in five places. **`053`'s T001 overturned four `050` claims** — C2's "no
  chip row" (the rail is on eleven captures and is conditional), C7's "no per-view default in the
  product" (it is in the `New ⌄` menu), REQ-013's "one `+ New filter` row" (that is the empty state;
  twelve formats are captured), and the flat 60-row page limit (it is per-layout, Gallery 60 and
  Kanban 10). **`052`'s overturned a fifth**: the "no hover state was captured" caveat five documents
  had inherited from the capture index — 37 menus show it. All five corrected at their sites in
  `050`'s `design-trueup.md`, `spec.md`, `acceptance-criteria.md`, `decision-record.md` and
  `checklist.md`, and in `screenshots/anytype/README.md`. **Three of the four are one error**, now
  ADR-003's second corollary: an absence asserted from a surface that was never examined.
  **Four cross-family numbers disagreed** and `roadmap.md` §7.10 settles each with its winner and the
  reason — 7.11:1 over 7.95:1, 1.14:1 over 1.20:1, a 0.2s Anytype exit over 0.1s, and the iOS row
  pitch recorded as *not* a conflict because five packets measured five different sheets. §7.10 also
  fixes **one owner per shared primitive**, writing the condition row into `053` and the inline
  editors into `054`, where they had existed only in this document's family table. Residues cleared:
  `052`'s `checklist.md` C7 (8 width literals at 14 sites, the only 240 a story) and its `goal.md`
  D3; `054`'s `checklist.md` C3 Today cell (one list, one filtered subset, one submenu, not three
  lists); `055`'s vocabulary census, already closed at `cd8030a8` and now marked closed in its
  summary. **Nothing was ticked and no operator row was touched.** All six packets stay `0/N`: every
  T001 is done and no T002 has run, so not one threshold has been observed red. `053`'s
  implementation leg is running on codex in `worktrees/094-impl-053-toolbar`; `096-screenshots-regroup`
  landed the capture regrouping at `d486eab9` and its path form is the one to cite.
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
