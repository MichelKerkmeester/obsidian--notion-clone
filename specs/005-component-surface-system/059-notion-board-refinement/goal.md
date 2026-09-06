---
title: "Goal: Notion Board Refinement"
description: "The durable directive for refining the Anytype-parity board against the Notion kanban harvest, and the criteria that decide when it is done."
trigger_phrases:
  - "059 goal"
  - "notion board refinement goal"
  - "board groups panel goal"
  - "notion vs anytype board goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/059-notion-board-refinement"
    last_updated_at: "2026-09-06T16:36:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:36 rulings; D6 discharged, T005 answered"
    next_safe_action: "Start the code half once 058 releases board-renderer.ts"
    blockers:
      - "T004 onward are gated on the operator answering the adoption question at notion-screens-digest.md:277-281"
      - "board-renderer.ts goes to 058 next; this packet queues behind it"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "specs/005-component-surface-system/056-board-anytype-parity/notion-screens-digest.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-059-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the operator adopt Notion's group-management screen as a panel, or does the board keep one hide toggle"
      - "Does hide/unhide belong to the new panel alone, or do the two dead host actions get wired as well"
    answered_questions:
      - "Eight of the nine Notion-vs-Anytype conflicts the research named are already settled by a landed ruling"
      - "Notion contributes nothing to the page-scroll criterion: no capture in the harvest shows a scrolled board"
      - "The page scroll the research listed as its P0 landed on main at dc1d54a9 before this packet opened"
---
# Goal: Notion Board Refinement

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Refine the board that `056-board-anytype-parity` rebuilt, using the Notion kanban
harvest as an *additive* reference only — adopt Notion's group-management surface as a `panel` so a
group's visibility stops being a dead axis, decline the eight Notion patterns a landed Anytype
ruling already settles and record each decline as an ADR, and file the record claims this loop
found contradicted by the current tree.

**Why.** The operator's instruction of 2026-09-06 ~16:10, verbatim: *"Based on notion screenshots
add phases to all ui improvement phases to further refine based on notion ui screenshots. But do 5
iters of deep research with glm 5.3 flash max on those screens per relevant phase"*. The board's
five-iteration loop ran as `glm-devpass-board` and is
[`../056-board-anytype-parity/research/research.md`](../056-board-anytype-parity/research/research.md).
Its verdict is narrow on purpose: **one adoption candidate and nothing else**, because the digest's
own conflict list rules for Anytype in seven of its eight rows
(`../056-board-anytype-parity/notion-screens-digest.md:230-258`).

**What this packet is not.** It does not reopen `056`. It does not touch the page-scroll work: the
research ranked it P0 and it **landed on `main` at `dc1d54a9` while the loop was still running**, so
this packet carries it as a verification row rather than a task, and no Notion capture could have
arbitrated it either way (`notion-screens-digest.md:158-163`, `:266-268`). It contributes four
*device-only* checks there and nothing else.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Notion is additive, never a substitution.** `056` D3 makes Anytype parity the default and gives WCAG 1.4.11, WCAG 1.4.3 and the 44px touch floor as the only grounds for *declining a measured Anytype value*. Adding something Anytype does not show is a different kind of change and needs the operator, not D3. Every Notion-vs-Anytype conflict the research named gets an ADR; a conflict a landed ruling already decides is `Accepted` citing that ruling, and one it does not is `Proposed` and waits. |
| D2 | **No number is copied from Notion.** `../design-system.md:526-528` is binding: *"Notion is the visual target and is not a source at all — describe what it looks like, then derive values from our own token scale."* Every value in this packet is re-derived from our own role and token scale, and the Notion screen id is cited as the *shape* it argues for, never as the measurement. |
| D3 | **Red first, per criterion, on a threshold, with the failing value observed red before any code is written.** Parent D2. A threshold that cannot be made to fail is not a threshold. |
| D4 | **Existing lanes only.** Every check this packet adds extends a lane `tools/gate.mjs` already runs — `render-assertions`, `screenshots-fresh`, `sheet-grammar`, `tests`, `evidence`. This packet adds **0** new lanes; the gate stays at its current lane count. |
| D5 | **`044`'s seven-element sheet grammar and `048`'s stacking are constraints, not deliverables.** The Groups surface presents as a sheet on phone and must leave `tools/live/sheet-grammar.mjs` at 12 surfaces and 31 stacked pairs green. |
| D6 | **The operator gate is real and blocks code, not documentation.** T001-T003 (the verification pass, the errata, the ADR pack) may run today. T004 onward may not start until the operator answers ADR-004, ADR-010 and ADR-011. **Discharged 2026-09-06 18:36** — all three ruled: *"Yes, one Groups panel"*, *"On by default, like Notion"*, *"Wire hide, delete the delete action"*. The gate stays written down because it is the rule; it is no longer holding anything. |
| D7 | **A research finding is checked against the tree before it becomes a row.** The loop ran against a tree that has since moved: `dc1d54a9` landed the page scroll and the card-text fix, and `056` T014-T016 and AC-012/AC-013 all closed with it. A finding this packet found already fixed becomes a **verification** row that re-reads the landed state, never a task that would redo it. |
| D8 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase, and an agent never ticks the operator's row. |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes
(objective, a decision, the binding table, a criterion), resend the full text
of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read `../goal.md` first** (D1-D15, and D15 is the one that opened this packet) and then
`../056-board-anytype-parity/goal.md` (D1-D9). Both bind here as written there. `../roadmap.md` §4
maps report to phase, §5.A places this phase, §6A holds the operator decisions this packet consumes,
and §7.15 is the rule that decides what a Notion finding may do to a landed Anytype ruling.

**The design read of record is `../050-anytype-adoption/design-trueup.md`** by way of
`../056-board-anytype-parity/design-trueup.md`. The Notion fact source is
`../056-board-anytype-parity/notion-screens-digest.md` and **only** that document — no PNG was
opened by the research loop, and none is opened here.

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **A group's visibility is reachable, and reversible, from a board-mounted surface.**
      **Today, observed red on the rebased tree, and larger than the research inferred:**
      `hideGroup?` and `deleteGroup?` are declared optional at `src/views/board-renderer.ts:84-85`
      and **neither host supplies them** — the two board actions objects are
      `src/views/database-view.ts:791-830` and
      `src/views/embedded-database-renderer.ts:532-563`, and `grep -rn "hideGroup" src/` returns
      **2** rows — the declaration and the guarded call site — and **0** implementations. So the two guarded menu rows at
      `board-renderer.ts:558-559` have never rendered, the column menu ships **3** rows rather than
      5 (sort ascending, sort descending, collapse), and `config.boardHiddenGroups` — declared at
      `src/data/types.ts:560`, allowlisted at `src/data/data-source.ts:1352`, read and applied at
      `board-renderer.ts:192-193` — has **0** board-mounted writers and **0** board-mounted
      restorers. Notion carries both on one surface (`e9698e1b`, `30ba5533`, `f6d1e7e6`,
      `2ef31bd5`; `../056-board-anytype-parity/notion-screens-digest.md:119-127`). Done is **0**
      hidden groups unreachable from a board-mounted surface and **100%** of group options —
      visible and hidden — carrying a live visibility toggle that a host actually implements.
- [ ] **The Groups surface is a `panel`, and its width and dismissal come from the role rather than
      from Notion.** **Today, observed red:** no such surface exists —
      `grep -rn "manageGroups\|db-board-groups" src/` returns **0**. Notion's is a full screen on
      phone and a right-hand side panel on web (`30ba5533`, `2ef31bd5`), which is Notion's grammar,
      not ours. Done is `role: "panel"` declared at the call site, width inside the **292-360px**
      band `../design-system.md:77` assigns the role, local anchoring per `../design-system.md:126`,
      trapped focus, and dismissal on outside click or Escape — with the phone presentation going
      through `044`'s sheet grammar rather than a second vocabulary.
- [ ] **Group order is reorderable from the same surface that carries visibility, and it
      round-trips.** **Today, observed red:** order and visibility live apart. Reorder is reachable
      only by dragging a column on the board or through the toolbar's group-order popover
      (`src/views/database-view.ts:3119-3287`), which carries **0** visibility controls; visibility
      has no surface at all. Notion puts a `⁚⁚` handle on every row of the screen that carries the
      eye (`e9698e1b`; digest `:92`, `:124-125`). Done is a drag handle per row committing through
      `updateGroupOrder` (`src/views/board-renderer.ts:83`), the order surviving a re-render, and
      the drag and move-up/move-down grammar reused from the shared row builder
      `buildCheckboxPropertyRow` (`src/views/record-surface/property-row.ts:353`) as
      `src/views/board-card-properties-panel.ts:48-125` already uses it — **0** new drag vocabulary.
- [ ] **"Hide empty groups" ships default OFF and the empty-column state survives.**
      **Today, observed red in the reference, not in our tree:** Notion ships the toggle **on** in
      all three of its management captures (`30ba5533`, `e9698e1b`, `2ef31bd5`). Our board renders
      a shared empty card for an empty column at `src/views/board-renderer.ts:324-327`, and that
      state is committed to eight captures (`screenshots/notion-clone/components/board-empty-column-*`
      and `constructed-board-empty-column-*`, `056` AC-011). Done is the setting's default reading
      **false**, **0** columns suppressed for emptiness under a default config, and those eight
      capture hashes unchanged.
- [ ] **The eight declined Notion patterns land zero code change, each with an ADR — seven naming
      the landed ruling that decides it, and ADR-009 recording a decline no ruling has made.**
      **Today, observed red: 0 of 9** conflict rows in the research register
      (`../056-board-anytype-parity/research/research.md` §9) carry an ADR in this packet, though
      **7** of them are already decided by a landed ruling. Done is
      every one of the eight measurable and unmoved on the rebased tree: desktop header count still
      absent (`board-renderer.ts:294`, touch branch only), header chip still
      `background: var(--db-status-bg, transparent)` (`styles.css:9440`, ADR-006), `···`/`+` still
      scoped `:not(.is-touch)` with a `:focus-within` fallback (`styles.css:9458-9464`), add-card
      still the bordered 42px box (`styles.css:9660-9672`), per-type card property icons still
      **0** outside relation, kanban page limit still **10** (`board-renderer.ts:320`), the board
      still a flat strip (`board-renderer.ts:263-341`), and board-level wrap switches still **0**.
- [ ] **Every record claim contradicted by the current tree carries an errata note.**
      **Today, observed red: 4 uncorrected.** **E-1** — the digest's header row at
      `notion-screens-digest.md:173-179` describes an unfilled chip that ADR-006 filled
      (`styles.css:9440`). **E-2** — the digest at `:193-195` says sub-grouping is absent from our
      renderer, while `board-renderer.ts:63-70`, `:222` and `:639-640` carry the axis behind
      `config.boardSubgroupEnabled`. **E-4** — the digest at `:183-186` and the research at §6 and
      §8 both say our column menu carries "Hide Column" and that our board can hide a column; it
      cannot, because neither host wires the action, and `src/i18n.ts:136-137` ships the two labels
      in three locales for rows that never render. **E-5** — the digest's page-scrolling paragraph
      at `:220-226` describes `.db-kanban-cards { overflow-y: auto }` and `.db-kanban-view
      { overflow: hidden; height: 100% }` as current; `dc1d54a9` removed both, and every
      `board-renderer.ts` and `styles.css` anchor in the digest's §4 drifted with it. Done is **0**
      contradicted claims without a note. **E-3 is not on this list** — see the verification row.
- [ ] **The page-scroll landing and the erratum it closed are re-read from the final state rather
      than trusted.** **Today, observed red in the research and green in the tree:** the loop's
      §11 N1 ranks "land T014-T016" as its P0 and its §10 E-3 records `056`
      `acceptance-criteria.md`'s AC-012 citing three drifted stylesheet anchors. Both statements
      were true when the loop read them and are false now: `056` `tasks.md` T014, T015 and T016 are
      all `[x]`, AC-012 and AC-013 both read **Met**, `grep -n "9569\|9447\|9472"` on that file
      returns **0** rows, and the landed rules are `.db-kanban-cards` with no `overflow-y` at all,
      `.note-database-container.db-kanban-view` carrying the scroll (`styles.css:9348-9356`) and its
      `::-webkit-scrollbar` at `height: 0` at rest rising to `10px` on hover or `.is-scrolling`
      (`:9386-9392`). Done is that re-read recorded here with its command output, and **0** rows in
      this packet that would redo work `dc1d54a9` already landed (D7).
- [ ] **The four device-only checks are named on `056` AC-010's operator pass rather than left in a
      research document.** **Today, observed red:** AC-010's verification cell reads "the operator's
      own words" and enumerates **0** checks
      (`../056-board-anytype-parity/acceptance-criteria.md`, AC-010 row). Done is **4** enumerated:
      page scroll with hidden desktop chrome, the board in dark theme (no dark Notion board exists
      in the harvest on either platform — digest `:262-266`), desktop hover-reveal of `···`/`+`
      (uncaptured even on Notion's own web — digest `:269-272`), and the phone board on a real
      handset (`056` R5's phone capture is harness-synthetic, forced
      `matchMedia("(pointer: coarse)")`).
- [ ] **The new surface is captured and locked by lanes that already exist.**
      **Today, observed red:** `ls screenshots/notion-clone/panels/ | grep -c board-groups` returns
      **0** against 116 files in that folder. Done is four constructed captures —
      `constructed-board-groups-panel-{desktop,mobile}-{dark,light}.png` — registered in
      `screenshots/manifest.json` with `screenshots-fresh` green, a panel-width and a
      visibility-toggle row added to `tools/live/render-assertions.mjs` with a negative control
      observed red first, `tools/live/sheet-grammar.mjs` still reporting 12 surfaces and 31 stacked
      pairs at exit 0, and **0** new gate lanes.
- [ ] **OPERATOR:** the operator answers the adoption question at
      `../056-board-anytype-parity/notion-screens-digest.md:277-281` — ADR-004, ADR-010 and
      ADR-011, **all three Accepted on the operator's 2026-09-06 18:36 rulings** — before any code
      leg starts, and afterwards reads the Groups panel on iOS and on desktop and reports it as an
      improvement rather than a fourth place to hunt for a setting. Nothing in this repository can
      close this row, and an agent never ticks it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive and it is expected to grow.

### Opened 2026-09-06, from the Notion board research loop

The operator asked for Notion-sourced refinement phases on every UI phase, each preceded by five
deep-research iterations on the Notion screens. The board's loop ran as `glm-devpass-board`
(`cli-opencode`, `llmgateway/glm-5.3-flash`, reasoning `max`), stop policy `max-iterations`, 5 of 5,
`newInfoRatio` `0.7, 0.5, 0.5, 0.6, 0.3` against a `0.05` threshold — so convergence was never a
legal stop and the cap ended the run. Its synthesis is
[`../056-board-anytype-parity/research/research.md`](../056-board-anytype-parity/research/research.md).

**Level 2.** `recommend-level.sh --loc 470 --files 8 --api` returns **46/100**, confidence 82%,
recommended level **2**; phase score **0/50**, below the 25 threshold, so a standard child rather
than a phased one. The `--api` flag is the actions-interface change: `BoardRendererActions` is a
contract two hosts implement, and this packet adds a member to it. Without `--api` the same inputs
return 38/100 and Level 1, which would not carry `acceptance-criteria.md` — the figure is recorded
rather than hidden.

### The two corrections this packet makes to its own research

**One inference was under-stated.** The loop recorded as an *inference* that "our board can hide a
column (`board-renderer.ts:532`)" and that restoring it needs the view-config surface. Spending the
one-extra-source allowance the research reserved for exactly this — reading
`database-view.ts:791-830` and `embedded-database-renderer.ts:532-563` — shows the red is **larger**,
not smaller: neither host supplies `hideGroup` or `deleteGroup`, so those two menu rows have never
rendered in the shipped app and `config.boardHiddenGroups` has no board-mounted writer at all. The
inference is now a read, the digest's and the research's account of our own menu is filed as erratum
E-4, and criterion 1's threshold is written against the measured state rather than the inferred one.

**One P0 was already landed.** The loop's §11 ranked N1 — "land `056` T014-T016, the page scroll and
the card text" — as its P0 and treated AC-012 and AC-013 as the packet's two Unmet rows. Between the
loop's read and this synthesis, `dc1d54a9` landed on `main`: both axes moved to
`.note-database-container.db-kanban-view`, `.db-kanban-board` took `flex-shrink: 0` and dropped its
own overflow, the sticky column header was withdrawn as a wrong inference, the scrollbar reads 0 at
rest and 10px on hover, and the card values were left-aligned. `056` T014-T016 are `[x]` and AC-012
and AC-013 are both **Met**. Under D7 that becomes a verification row here, not a task. The same
commit closed the loop's erratum **E-3** — AC-012 was rewritten and no longer cites a stylesheet
line at all — and produced a new one, **E-5**, because the digest's §4 now describes rules the
commit deleted.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Research loop, 5 iterations | Done | `../056-board-anytype-parity/research/research.md`, `research/deep-research-state.jsonl` |
| Packet opened | Done | This file; `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md`, `decision-record.md` |
| Reconciliation against `dc1d54a9` | Done | The two corrections above; the verification criterion carries the commands |
| Red-first measurement (T002) | Pending | The criterion reds above are read off the rebased tree; T002 pins them into `acceptance-criteria.md` |
| Operator adoption gate (T003) | **Discharged 2026-09-06 18:36** | ADR-004, ADR-010, ADR-011 all `Accepted`; ADR-009 stays `Proposed` and proposes no change |
| Any code leg | Blocked | D6, and `board-renderer.ts` goes to `058` next |

### Deviations and findings

| Item | Note |
|------|------|
| The research's load-bearing inference was under-stated | Confirmed against both hosts; recorded as E-4 and folded into criterion 1 rather than left as an inference |
| The research's P0 landed before the synthesis ran | `dc1d54a9`; carried as a verification row under D7, and E-3 closed with it |
| Notion's group management is a *screen*; ours is proposed as a *panel* | `../design-system.md:77` already assigns the `panel` role to a working surface with several controls; adopting Notion's screen shape would import Notion's mobile grammar, which D2 forbids |
| The board wrap switch is a conflict the digest never listed | The research added it as row 9 and recommends against it; ADR-009 carries it as `Proposed` so the operator sees a decline that no landed ruling made for them |
<!-- /ANCHOR:log -->
