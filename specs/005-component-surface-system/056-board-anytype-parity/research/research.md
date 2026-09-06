---
title: "Deep Research Synthesis — Notion board refinements against the Anytype-parity board (056)"
description: "What Notion's kanban UI, read only through the screen digest, should and should not change on this plugin's board surface, with file:line and screen-id evidence, a conflict register against the landed Anytype rulings, and a ranked child-phase plan."
trigger_phrases:
  - "notion board refinements"
  - "kanban board research"
  - "board group management panel"
  - "notion vs anytype board conflicts"
importance_tier: "normal"
contextType: "general"
---

# Deep Research Synthesis — Notion board refinements against the Anytype-parity board

<!-- SPECKIT_TEMPLATE_SOURCE: research | v1.0 -->

**Packet:** `specs/005-component-surface-system/056-board-anytype-parity` · **Date:** 2026-09-06
**Lineage:** `glm-devpass-board` (`cli-opencode`, `llmgateway/glm-5.3-flash`, reasoning `max`)
**Stop policy:** `max-iterations` (5/5) · **Stop reason:** `maxIterationsReached`

---

## 1. Executive Summary

Notion's kanban UI, read only through `notion-screens-digest.md`, produces **one adoption
candidate and nothing else**. Every other divergence between Notion and our board is already
settled by a landed operator ruling, and the digest itself says so in seven of its eight conflict
rows (`notion-screens-digest.md:230-258`).

The one candidate is **P2, Notion's dedicated group-management screen**
(`notion-screens-digest.md:119-127`): per-group visibility with an eye toggle, hide-all/show-all,
drag-handle reorder, and "Remove grouping", all on one surface. It matters because our board can
hide a column (`board-renderer.ts:532`) but the renderer's actions interface exposes no matching
show action — `hideGroup` and `deleteGroup` exist at `board-renderer.ts:84-85`, no `showGroup`
does. *Inference (grounded in the interface, not in a runtime trace):* once a group is hidden into
`config.boardHiddenGroups` (read at `board-renderer.ts:188-189`), nothing board-mounted restores
it. The digest flags exactly this as an operator question rather than a ruling
(`notion-screens-digest.md:246-247`, `:277-281`), and it is left gated here for the same reason.

The highest-impact work on this surface is **not Notion's**. AC-012 and AC-013 are the two Unmet
rows in the packet (`acceptance-criteria.md:79-80`), owned by T014-T016 (`tasks.md:438-454`).
Notion contributes nothing to them: the digest has no capture dense enough to show a scrolled
board, a sticky scrollbar, or per-column scrolling (`notion-screens-digest.md:158-163`, `:266-268`),
so it can neither close nor reopen the page-scroll criterion. What Notion does contribute there is
a list of **device-only verifications** (§13).

Three documents in the record are stale against the current tree — two inside the digest, one
inside `acceptance-criteria.md` itself (§10). None changes a conclusion; all three are recorded so
a future reader does not re-litigate a settled question from an out-of-date citation.

---

## 2. Research Charter and Decision Standard

**Question.** How should Notion's kanban board UI — columns, column headers, cards, card
properties, add-card, group menus, drag, page scrolling, sticky scrollbar, phone board — refine
this plugin's board surface?

**Decision standard.** Anytype parity is the default ruling for these surfaces (051 ADR-007, 056,
057). Notion refinements are **additive only**. Where the two references disagree, this document
names the conflict and proposes which to adopt with a reason; it never overrides a landed operator
ruling. `056/goal.md` D3 gives accessibility (WCAG 1.4.11 / 1.4.3, the 44px touch floor) as the
only ground for *declining a measured Anytype value* — it says nothing about *adding more than
Anytype shows*, which the digest correctly identifies as a different kind of change
(`notion-screens-digest.md:280-281`).

**Value derivation.** `design-system.md:526-528` is binding: *"Notion is the visual target and is
not a source at all — describe what it looks like, then derive values from our own token scale."*
No number in this document is copied from Notion; every proposed value is re-derived from the
plugin's own role and token scale.

**Quality gates applied.** Every claim carries a `file:line` or a digest screen id. Every inference
is marked as an inference.

---

## 3. Scope, Boundaries and Evidence Base

**Notion fact source — exclusive.** `notion-screens-digest.md`, written by an image-capable analyst
from the Mobbin captures. **No PNG file was opened at any point in this run.** Screen ids are quoted
as the digest records them (`98dde396`, `71f9dba2`, `c9d34319`, `9d7ffd05`, `2050ac3d`, `69f98d1d`,
`e9698e1b`, `30ba5533`, `f6d1e7e6`, `56e2ae1a`, `65ed2da3`, `7d30bac2`, `cbc934dc`, `efc302e8`,
`e1897baf`, `888fb63c`).

**Implementation and design record read (bounded set, twelve sources):**

| Source | Role |
|---|---|
| `src/views/board-renderer.ts` | Board construction, columns, cards, group menu, drag, drop |
| `src/views/board-card-fields.ts` | Which properties reach a card |
| `src/views/board-card-properties-panel.ts` | The per-view property visibility/order panel |
| `styles.css` `db-kanban-*` block (`9328-9723`) | All board geometry and treatment |
| `056/goal.md` | Decisions D1-D9 |
| `056/design-trueup.md` | The measured Anytype read (A1-A13, C4-C5) |
| `056/decision-record.md` | ADR-001..ADR-008 |
| `056/tasks.md` | T012 rows R1-R10, T014-T016 |
| `056/acceptance-criteria.md` | AC-001..AC-013 |
| `005/design-system.md` | Role/width grammar, the Notion-is-not-a-source rule |
| `005/roadmap.md` §6A | Operator rulings, incl. the ~10:30 page-scroll ruling |
| `056/notion-screens-digest.md` | The Notion fact source |

**Boundaries honoured.** No source outside that set was read; the one-extra-file allowance was
never spent (§12 records the one place it was declined). No file under `src/`, `styles.css` or
`tools/` was edited. No operator ruling was reopened.

---

## 4. Method and Convergence Record

Five iterations on a broadening focus ladder, one lineage, `max-iterations` stop policy so
convergence stayed telemetry-only and the loop could not synthesize early.

| # | Focus | `newInfoRatio` | Novelty |
|---|-------|----------------|---------|
| 1 | Column header + group menu (P1, P2) | 0.7 | P2→actions mapping; the ADR-006 digest staleness |
| 2 | Cards, card properties, add-card (P4, P5) | 0.5 | One digest gap (empty-property rows); one quarantined inference |
| 3 | Scrolling, drag, layout settings (P6, P7) | 0.5 | Board wrap toggle is the only new behaviour — recommended against |
| 4 | Phone board, device-only checks (§6) | 0.6 | Sub-grouping staleness; the Card-preview attribution |
| 5 | Consolidation | 0.3 | Ranked plan, conflict register, thresholds |

Ratios: `0.7, 0.5, 0.5, 0.6, 0.3`. Threshold `0.05` — never approached, so convergence never
became a legal stop even under the default policy; the cap ended the run.

**Citation verification.** Every load-bearing `file:line` in this document was re-read against the
current worktree during synthesis. Three drifted citations were found — all in the *record*, none
in this lineage's own findings (§10).

---

## 5. What Notion Shows — the seven patterns

- **P1 — label and count together, always, on both platforms** (`notion-screens-digest.md:109-117`).
  Web: coloured dot, plain-text (uncoloured) label, plain-text count, no border, no fill, no chip
  container (`98dde396`, `:78`). iOS: a filled grey pill holding label-plus-count, with `···` and
  `+` also permanently visible (`71f9dba2` `:73`; `c9d34319` `:75`). No capture on either platform
  suppresses the count (`:115`).
- **P2 — group management is a dedicated screen** (`:119-127`): "Hide empty groups" toggle;
  "Visible groups" with a per-group eye icon and "Hide all"; "Hidden groups" with "Show all";
  "Remove grouping"; and on `e9698e1b` a `⁚⁚` drag handle per row, making reorder a first-class
  action from the same screen (`:92`, `:124-125`). The eye is a live toggle, not decorative
  (`f6d1e7e6`, `:91`).
- **P3 — sub-grouping is a real second axis**, demonstrated on a **Table** view only
  (`65ed2da3`, `30ba5533`, `:131-135`).
- **P4 — "+ New page" is a bare text link** (`:137-142`): plain, left-aligned, directly below the
  last card; no border, no fixed-height box, no background (`71f9dba2`, `98dde396`).
- **P5 — card property rows carry small leading icons for several types** (`:144-148`): a circular
  avatar before a Person value; plain text for Formula and Date; select values as filled colour
  pills (`98dde396`, `69f98d1d`, `:78`).
- **P6 — one shared settings sheet across layouts** (`:150-156`): Table (`888fb63c`) and Board
  (`2050ac3d` / `9d7ffd05`) are the same sheet with a different tile active. Board-specific rows:
  Show data source title; Show page icon (on); **Wrap all content** / **Wrap all properties (on)**;
  Group by → Status; **Color columns** (on in `9d7ffd05`, off in `2050ac3d`); Open pages in → Side
  peek; Load limit → 25; Card preview → None; Card size → Medium (`:73-74`, `:84`).
- **P7 — nothing on the scrolling axis is measurable** (`:158-163`): no capture is dense enough to
  show a scrolled board, a partially-visible page header, per-column scrolling, or a sticky
  scrollbar of any kind. §4 states the digest "neither closes nor reopens" our page-scroll
  criterion (`:220-226`).

Additionally, `98dde396` shows a **Property visibility** side panel open beside the board, and
`69f98d1d` repeats it with a different property order (Person before Role vs Role before Person,
`:78-79`); the web View-options surface `56e2ae1a` carries "Properties → 4 shown" (`:97`).

---

## 6. What We Already Have — the parity ledger

Notion behaviours this board already ships, with the line that ships them:

| Notion behaviour | Our implementation | Evidence |
|---|---|---|
| Count beside the label, on phone, as plain text | `db-kanban-col-count` rendered in touch mode; 13px muted, no pill | `board-renderer.ts:267-268`; `styles.css:9461-9464` |
| `···` and `+` permanently visible on phone | The hover-hide is scoped `:not(.is-touch)`, so touch never hides them | `styles.css:9430-9437` |
| Labelled `+ New` row on phone | Touch `+ New` row at the 44px floor | `styles.css:9642-9656` |
| Phone-specific board geometry | 254.7px column, 23.3px gap, 0.7px card border | `styles.css:9669-9678`; landed at DPR 2 per `tasks.md:245-246` |
| Per-view property visibility **and order** panel | Fixed Cover/Title slots plus a reorderable checkbox list with per-row type icon, drag reorder, touch move up/down, persisted | `board-card-properties-panel.ts:42-43`, `:57-94`, `:95-111`, `:113-121`, `:129-136` |
| Select values as filled colour pills | 20px, 6px radius, tint fill with darkened text | `styles.css:9607-9610` |
| Checkbox keeps its label beside the glyph | Order swap plus a 14px circle | `styles.css:9586-9591`, `:9598-9603` |
| Per-view page limit (the *mechanism*) | Local `boardConfig` copy pins kanban to 10 without moving any other view's default | `board-renderer.ts:291-294`; AC-008 Met (`acceptance-criteria.md:75`) |
| Group hide, collapse, and direct drag reorder | `hideGroup`/`deleteGroup`/`updateGroupOrder`/`toggleGroupCollapsed` wired into the column menu | `board-renderer.ts:83-85`, `:118-119`, `:514-536` |
| "Show page icon → on" | `renderRecordIcon` forced onto every title row | `board-renderer.ts:424-428` (R3, `tasks.md:244`) |
| "Color columns → off" | Column bodies uncoloured; only the chip and tag chips tint | `board-renderer.ts:258-261`; A8/A9 (`design-trueup.md:203`) |
| "Card preview → None" (equivalent) | Description loads only when the host supplies `loadRowDescription` — default none. *Inference: same contract shape under a different name* | `board-renderer.ts:486-488` |
| "Open pages in" | Record-open target is a per-host setting on a fixed anchor | `roadmap.md:1414` |
| Empty-column state | Shared empty card | `board-renderer.ts:296-301` |
| Past-limit tail | Shared expand control | `board-renderer.ts:305`; `styles.css:9662-9664` |
| Drag language (drop tint, live preview, raised-then-fade card) | Shipped — but **design-inferred, not measured**, on both references | `styles.css:9475-9477`, `:9513-9520`; `board-renderer.ts:792-805`; `design-trueup.md:260` |

---

## 7. Ranked User-Impact Assessment

The dispatch question — *which Notion patterns from the digest would improve this surface for a
user* — answered in rank order:

| Rank | Pattern | User impact | Verdict |
|---|---|---|---|
| **1** | **P2 group-management screen** (`:119-127`) | Hidden columns become recoverable and visible in one place; bulk hide/show; reorder from a list rather than by dragging the board | **The one adoption candidate — operator-gated.** §8 |
| **2** | **P7 / scrolling** | Nothing Notion-side, but the *open ruling* it cannot arbitrate changes every scroll interaction on both platforms | **Already tasked** (AC-012/AC-013, T014-T016). Notion contributes device checks only (§13) |
| **3** | **P1 header count and control visibility** | Marginal on phone (already shipped); zero on desktop by ruling | Already have (phone) + conflict declined (desktop) |
| **4** | **P6 layout-sheet options** | One row maps to a feature we lack (board wrap) — recommended *against*; the rest map to existing config | Already have / declined |
| **5** | **P4 add-card, P5 property icons, P3 sub-grouping** | No user gain identified over the measured Anytype values | Declined per standing rulings |

---

## 8. The Adoption Candidate — P2, Made Concrete

**Why it is the only one.** The digest's own conflict list says "Anytype's ruling stands" in every
row but this one. For group-management depth it says instead: *"Neither reference is closer to ours
than the other is far from it — this is flagged for the operator rather than folded in, since D3's
parity-by-default logic has no Notion clause to invoke here"* (`notion-screens-digest.md:246-247`),
and §6 question 5 asks the operator directly whether P2 is worth a Notion-sourced refinement
(`:277-281`).

**The gap it closes.** Our only board-reachable hide affordance is the column menu's "Hide Column"
(`board-renderer.ts:532`). The actions interface (`board-renderer.ts:77-132`) declares
`hideGroup?` and `deleteGroup?` at `:84-85` and **no show/unhide counterpart**. *Inference from the
interface:* restoring a group hidden into `config.boardHiddenGroups` (`board-renderer.ts:188-189`)
requires leaving the board for the view-config surface, and nothing on the board distinguishes a
hidden column from an absent one. This inference must be confirmed against the view-config path
before it is written into an acceptance criterion — that confirmation is the red-first check below,
and it is the one place the one-extra-source allowance should be spent.

**Proposed shape** — only if the operator adopts P2; every value derived from our own scale per
`design-system.md:526-528`:

1. **Surface.** A "Groups" panel in the `panel` role — **292-360px**, local anchoring, trapped
   focus, dismissed on outside click or Escape (`design-system.md:77`, `:126`). Not a full screen:
   Notion's is a screen because Notion's mobile grammar is screens; ours is a panel because
   `design-system.md` §3 already assigns that role to "a working surface with several controls the
   user adjusts before closing".
2. **Entry point.** One new row in the existing group menu, beside the "Hide Column" row at
   `board-renderer.ts:532` — `menu.addRow({ icon: "eye", label: t("board.manageGroups"), onClick: … })`
   inside `renderBoardGroupOptions` (`board-renderer.ts:514-536`).
3. **Rows.** Every option of `groupField`, visible and hidden, each with an eye toggle wired to
   `hideGroup` and a **new `showGroup` action** added to the interface at `board-renderer.ts:84-85`.
   Plus "Hide empty groups" and "Remove grouping" rows.
4. **Reorder.** Drag handle per row → `updateGroupOrder(field, order)` (`board-renderer.ts:83`),
   reusing the drag grammar `board-card-properties-panel.ts:57-94` already implements for property
   rows — no new drag vocabulary.
5. **"Hide empty groups" defaults OFF.** Notion's `30ba5533` has it on. Ours must not: an empty
   column renders the shared empty card (`board-renderer.ts:296-301`), and auto-hiding would delete
   a state our own captures commit to. This is part of the same operator question and is named here
   so it cannot be silently folded in.

**Thresholds.**

| Threshold | Green |
|---|---|
| Hidden groups not reversible from any board-mounted surface | **0** (today: ≥ 1 — *inference*, confirm first) |
| Group rows (visible **and** hidden) carrying a live eye toggle | **100%** |
| Reorder persisted through `updateGroupOrder` | round-trips across a re-render |
| Panel width | within the declared `panel` band, 292-360px |
| "Hide empty groups" default | **off** |

**Red-first check.** On the built board: hide a column from the group menu, then attempt to restore
it without leaving the board surface. Expected **red** today. Green after the panel lands.

**Sequencing.** `board-renderer.ts` is held by T014 (page scroll) and then by `058` (title resolver,
`056/goal.md:199-201`). A P2 leg queues after both, or takes the file lane.

---

## 9. Conflict Register — Notion vs Anytype

Nine rows. Eight resolve against Notion on a standing ruling; one is open and operator-gated; one
(row 9) is a conflict this loop added that the digest's own list does not carry.

| # | Topic | Notion | Anytype / ours | What stands, and why |
|---|---|---|---|---|
| 1 | Desktop header count | Always present (P1, `:111-115`) | None on desktop (A1, `design-trueup.md:33-36`) | **Anytype** — digest `:236-238`. Our phone count stays; desktop unchanged |
| 2 | Header treatment | Coloured dot + plain uncoloured label, no chip (`98dde396`, `:78`) | 24px tint-filled chip (`styles.css:9404-9419`, fill at `:9412`) | **ADR-006** (`decision-record.md:264-297`; `roadmap.md:1542`) — newer, operator-ruled, WCAG-motivated. Notion's dot-plus-small-grey-text would re-introduce the contrast class E1 declined (`design-trueup.md:349-352`) |
| 3 | `···` / `+` visibility | Permanent on iOS (`71f9dba2`, `c9d34319`) | Hover-only desktop, permanent phone (`styles.css:9430-9437`, with a `:focus-within` keyboard fallback at `:9435`) | **Anytype** for desktop — digest `:239-242`. Phone already agrees on both references |
| 4 | Group-management depth | Full dedicated screen (P2) | One "Hide Column" toggle | **OPEN — operator question** (`:246-247`, `:277-281`). §8 |
| 5 | Sub-grouping | A real second axis, Table-only (P3) | None rendered | **Anytype** — digest `:248-250`. Staleness noted, conclusion unaffected (§10 E-2) |
| 6 | Add-card weight | Bare text link (P4, `:139-141`) | Bordered 246×42px box (A5, `design-trueup.md:199`); labelled 44px row on touch | **Anytype** — digest `:251-252`. Placement already agrees (bottom of column) and survives T014 unchanged: the box is the cards list's last flex child (`board-renderer.ts:309-315`; `styles.css:9618-9623`) |
| 7 | Card property icons | Avatar / type icons on several types (P5, `:146-147`) | Values only, label hidden, relation icon the sole exception (A4, `design-trueup.md:198`; `styles.css:9583-9585`) | **Anytype** — digest `:253-255`. An icon-per-type system is a new vocabulary, not a value; D3 gives no ground to add one |
| 8 | Page-limit magnitude | 25 board / 50 table (`:73`, `:94`) | 10 kanban (A13; `board-renderer.ts:291-294`) | **Anytype** — digest `:256-257`. Mechanism already matches; only magnitude differs |
| 9 | **Board-level text wrap** | "Wrap all properties (on)" (`2050ac3d`, `:84`) | Single-line truncation: title ellipsis (`styles.css:9540-9548`), type/description ellipsis (`:9551-9561`), 25px property pitch (`:9572-9582`) | **Recommend no adoption** — see below. *Not in the digest's own conflict list; this loop added it* |

**Row 9 in full.** The *mechanism* already exists: the shared field renderer takes `wrap: col.wrap`
(`board-renderer.ts:711`) and the `-field-wrap` class is built dynamically (`tasks.md:405-407`), so
only a view-level switch is missing. It is still recommended against, on two grounds that point the
same way: Anytype's card is single-line by measurement (A4's 25px pitch; the description was folded
from a three-line clamp to one line, `design-trueup.md:264`), and our own **AC-013 pushes in the
same direction** — left-aligned, single-token values *ellipsised* at the content edge
(`acceptance-criteria.md:80`). A default-off board wrap switch would be a new affordance with no
Anytype counterpart, fighting a criterion that is currently Unmet. Revisit only if the operator
reports board text truncation as a defect; if ever adopted, the table's wrap rulings are the pattern
to follow (`roadmap.md:1618-1619` — the view switch gates, measured red-first per row).

---

## 10. Errata — Record Claims Stale Against the Current Tree

Three. None changes a conclusion; all three would mislead a future reader.

**E-1 — the digest's header row predates ADR-006.** `notion-screens-digest.md:173-179` describes our
header as taking the option colour as *text* with no fill. The current tree fills it:
`.db-kanban-col-chip { background: var(--db-status-bg, transparent) }` at `styles.css:9412`, per
operator ruling ADR-006 (`decision-record.md:264-297`, verbatim *"Anytype tint fill"*;
`roadmap.md:1542`), confirmed landed in `acceptance-criteria.md:78` (AC-011, "R6 and R7 are now
landed too", ADR-006/ADR-007 both **Implemented**). The Notion-vs-ours conflict survives the change —
it just resolves in favour of the newer ruling (row 2 above).

**E-2 — the digest's sub-grouping claim is stale.** `notion-screens-digest.md:193-195` states
sub-grouping is "not present in our schema or renderer at all — `board-renderer.ts` groups by
exactly one field". The current tree carries a subgroup axis: `BoardSubgroup` types
(`board-renderer.ts:66-70`), `subgroupField` threaded into the card-field resolver
(`board-renderer.ts:218-220`; excluded from cards at `board-card-fields.ts:48-53`), and subgroup
group-updates in the drop path (`board-renderer.ts:611-614`), all gated on
`config.boardSubgroupEnabled` / `config.boardSubgroupField`. **What is still true:** the *rendering*
is a flat strip — `renderReferenceColumn` (`board-renderer.ts:237-317`) renders one row of columns
and nothing reads the subgroup axis for layout. So the digest's conclusion holds unchanged
(`:196-197`); only its premise needs correcting.

**E-3 — AC-012's own stylesheet citations have drifted (~103-105 lines).** `acceptance-criteria.md:79`
cites `styles.css:9569-9573`, `:9447-9451` and `:9472-9474`. In the current tree those rules are at
`styles.css:9466-9474` (`.db-kanban-cards { … overflow-y: auto }`), `:9342-9352`
(`.note-database-container.db-kanban-view { overflow: hidden; … height: 100% }`) and `:9367-9369`
(`.db-kanban-board::-webkit-scrollbar { height: 10px }`). **The values are unchanged** — `overflow-y:
auto`, `overflow: hidden` + `height: 100%`, and a 10px scrollbar in the 8px reserved lane
(`styles.css:9351`) are all still exactly what the criterion describes. Only the anchors moved, so
AC-012's substance and its red state are intact. T016 (`tasks.md:452-454`) is the natural place to
re-anchor them.

---

## 11. Recommendations — Ranked Remediation Plan for a Child Phase

### N1 — P0, no new scope: land T014-T016

*Page scroll, card text, geometry pins re-expressed. Already tasked; this is a restatement with the
Notion-sourced additions folded in.*

- **Red-first, already measured in the stylesheet:** `.db-kanban-cards { overflow-y: auto }`
  (`styles.css:9466-9474`); `.note-database-container.db-kanban-view { overflow: hidden; height: 100% }`
  (`:9342-9352`); a 10px `::-webkit-scrollbar` (`:9367-9369`) in an 8px reserved lane (`:9351`);
  AC-013's right-aligned value and mid-word URL break (`acceptance-criteria.md:80`).
- **Thresholds:** **0** vertically scrolling elements inside the board; the page scrolls on both
  platforms; **0px** desktop scrollbar chrome at rest, sticky bar invisible-until-hover;
  `text-align: left` on every card text value; **0** mid-word breaks.
- **Negative control:** restoring `overflow-y: auto` must go red — `tasks.md:438-446` already
  specifies this. The scrollbar geometry pin is **re-expressed, not deleted** (T016,
  `tasks.md:452-454`).
- **Notion-sourced addition:** append device-only items 1-4 from §13 to AC-010's operator pass.
- **Errata addition:** re-anchor AC-012's three stylesheet citations under T016 (§10 E-3).

### N2 — P1, gated on an operator decision: the P2 Groups panel

- **Gate.** The operator must first answer the digest's own question
  (`notion-screens-digest.md:277-281`). Do not start without it — D3 has no Notion clause for adding
  beyond Anytype (`:280-281`).
- **Red-first.** Hide a column from the group menu (`board-renderer.ts:532`), then attempt
  restoration without leaving the board. Expected red today. *This also spends the one-extra-source
  allowance: confirm the view-config path before the criterion is written, since the "no `showGroup`"
  claim is an inference off the interface at `board-renderer.ts:84-85`, not a runtime trace.*
- **Thresholds.** As §8: 0 irreversible hides; eye toggle on every row; "Hide empty groups" default
  off; reorder persists through `updateGroupOrder`; panel within the 292-360px `panel` band.
- **Sequencing.** After T014 releases `board-renderer.ts`, and after `058` (`056/goal.md:199-201`).
  One file, one lane.

### N3 — P2, zero code: file the three errata

- E-1 (digest header row vs ADR-006), E-2 (digest sub-grouping vs the surviving axis), E-3 (AC-012's
  drifted stylesheet anchors). §10 has the replacement text for each.
- **Threshold:** **0** record claims contradicted by the current tree without an errata note.

### N4 — P2, evidence only: drag-state captures

- Both reference sets are silent on drag (`design-trueup.md:201`; digest P7 `:158-163`), so our drag
  language stays design-inferred exactly as `design-trueup.md:260` records it. Any future capture
  sweep should target held-drag frames. Nothing else to do; no task.

### Explicitly not recommended, with reasons

Board wrap toggle (row 9); card-size presets; loading skeletons; phone card-body reduction; per-type
property icons; bare-text add-card; desktop record count; swimlane revival. Each is carried in the
Eliminated Alternatives table below with its ground.

---

## Eliminated Alternatives

Negative knowledge — what was considered and why it was rejected. Primary research output, not an
appendix.

| Approach | Reason Eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Always-visible record count on the desktop header (P1) | Anytype measures no desktop count; digest rules Anytype stands | `notion-screens-digest.md:111-115`, `:236-238`; `design-trueup.md:33-36` | 1, 5 |
| Notion's dot + plain-text header in place of our tint chip | Overridden by the newer operator ruling ADR-006; small grey label re-introduces the contrast class E1 declined | `styles.css:9412`; `decision-record.md:264-297`; `design-trueup.md:349-352` | 1, 5 |
| Notion's iOS filled-pill header (label+count in one pill) on our phone board | Would move our phone count inside the chip, contradicting the measured phone anatomy; no user gain identified | `design-trueup.md:159-163`; `board-renderer.ts:267-268` | 1 |
| "Hide empty groups" **on** by default (as `30ba5533` ships it) | Would delete the shipped empty-column state our own captures commit to | `board-renderer.ts:296-301`; `design-trueup.md:205-206` | 1 |
| Per-type property icons (P5) | Anytype's ruling stands; an icon-per-type system is a new vocabulary, not a value, with no D3 ground | `notion-screens-digest.md:253-255`; `design-trueup.md:198` | 2, 5 |
| Person-only property icon as a middle path | Re-introduces the per-type dedicated slot the Anytype rebuild explicitly retired | `board-renderer.ts:441-444`; `notion-screens-digest.md:253-255` | 2 |
| Bare-text `+ New` link (P4) | Anytype's bordered box stands; ours already ships it, and placement already agrees | `notion-screens-digest.md:251-252`; `design-trueup.md:199`; `styles.css:9618-9656` | 2, 5 |
| Making the panel's Cover/Title rows drag-orderable like Notion's free-order panel | Cover/Title are reserved keys with dedicated card slots; ordering them would move the title out of the title row, contradicting A2 | `board-card-properties-panel.ts:42-43`; `board-card-fields.ts:56-57` | 2 |
| Board-level "Wrap all properties" toggle | Fights AC-013's ellipsis threshold and A4's single-line card; no Anytype counterpart | `acceptance-criteria.md:80`; `design-trueup.md:264`; `styles.css:9540-9582` | 3, 5 |
| Raising the kanban page limit toward Notion's 25/50 | Mechanism already matches; Anytype's magnitude of 10 stands | `notion-screens-digest.md:256-257`; `board-renderer.ts:291-294` | 3, 5 |
| Card-size presets ("Card size → Medium") | A size-preset system is additive beyond **both** references with no operator ask | `notion-screens-digest.md:73-74`; `styles.css:9385`; `design-trueup.md:196` | 3 |
| Loading skeletons modelled on Notion's grey placeholder boxes | Those are a transient loading state, not a designed treatment; our board renders synchronously | `notion-screens-digest.md:75-77`; `board-renderer.ts:180-194` | 4 |
| Phone-specific card-body reduction to match `71f9dba2`'s empty cards | The emptiness is attributable to Card preview → None on the same database, not to a phone grammar | `notion-screens-digest.md:73-74`; `design-trueup.md:158` | 4 |
| Reviving the subgroup axis as a swimlane mode | Swimlanes are a retired extension; D6 forbids resurrecting default-off affordances; no reference shows a sub-grouped board | `tasks.md:100-108`; `notion-screens-digest.md:273-276` | 4 |
| Chasing "Show data source title" into the toolbar renderer | Outside the bounded set and no finding hinges on it; recorded as unverified rather than spending the one-extra-file allowance | §12 | 3 |
| Double-counting `7d30bac2` / `cbc934dc`'s right-slide "Hidden groups" panel as a scrolling pattern | It is group visibility, already covered by P2 | `notion-screens-digest.md:119-127` | 3 |
| Elevating any declined conflict to a proposal "because the digest is only a digest" | Every decline cites a standing ADR or true-up row; the single open question is explicitly operator-gated | `notion-screens-digest.md:230-258` | 5 |
| Splitting N2 into per-menu vs separate-screen variants for the operator | Unnecessary: the panel is the minimal reversible increment, and `design-system.md` §3's `panel` role already fits | `design-system.md:77`, `:126` | 5 |

---

## Divergence Map

This run used the default convergence mode with a `max-iterations` stop policy; **no divergent
pivot was triggered**, so no Council artifact exists to reference. The map below records breadth
covered, not convergence claimed.

- **Saturated directions.** Notion-vs-Anytype conflict arbitration: the digest's §5 list
  (`notion-screens-digest.md:230-258`) is exhaustive for the captured surface, and iterations 1-3
  re-derived each row independently against the tree without finding a row to move. Further reading
  of this digest cannot produce new conflicts.
- **Pivots taken.** None. The focus ladder broadened by design (header → cards → scrolling → phone →
  consolidation) rather than by pivot.
- **Pivot failures / audited overrides.** None.
- **Remaining frontier — outside this digest.** (a) Notion's web board hover state, uncaptured
  (`:269-272`); (b) any dark-theme Notion board, uncaptured on either platform (`:262-266`); (c) a
  scrolled or sticky-scrollbar board, uncaptured (`:266-268`); (d) a sub-grouped Notion *board*,
  uncaptured (`:273-276`); (e) whether Notion renders rows for empty properties, never stated
  (`:78`, `:146-147`). Each needs a fresh Mobbin query, not a re-read of this set — the digest's own
  method note (`:265-266`).
- **Breadth caveat.** The frontier above is unexplored, not exhausted. Nothing here claims the
  *topic* converged; the run stopped at its iteration cap.

---

## 12. Open Questions

1. **Does the operator adopt P2?** The gating question for N2. The digest asks it directly
   (`notion-screens-digest.md:277-281`) and declines to answer it; so does this document.
2. **Is a hidden group genuinely irrecoverable from the board today?** Recorded as an *inference*
   off the actions interface (`board-renderer.ts:84-85`, `:188-189`), not a runtime trace. Confirm
   against the view-config path — the one-extra-source spend — before it becomes an acceptance
   criterion.
3. **Does Notion render rows for empty properties?** A genuine digest gap, not a divergence. Our
   cards skip an empty field unless `config.showEmptyFields === true` (`board-renderer.ts:451-452`;
   gate at `:724-726`); the digest's card descriptions never state Notion's behaviour (`:78`,
   `:146-147`), and Anytype's A4 is silent too. No adoption, no rejection.
4. **Does Notion's board hide the *grouping* property from its own cards?** `98dde396`'s cards carry
   select pills (`:78`), but the digest never says whether that board's grouping property also
   appears as a card row. *Inference-only territory* — it is not evidence against our rule, which
   deliberately drops the grouped field and all select/status columns
   (`board-card-fields.ts:60-64`) and is 045's shipped, AC-006-pinned mechanism (`056/goal.md:81`
   D5). No change.
5. **"Show data source title" — unverified in scope.** The Board tile carries the row
   (`notion-screens-digest.md:73-74`); toolbar ownership lies outside the bounded file set. Recorded
   as unverified rather than chased; no finding depends on it.

---

## 13. Device-Only Check List

Nothing below is decidable from the digest or from this repository's harnesses.

| # | Check | Why only a device closes it | Rides |
|---|---|---|---|
| 1 | Page scroll + hidden desktop scrollbar chrome | Digest §6.2 cannot arbitrate (`:266-268`); the green state is a scroll interaction | AC-012 (`acceptance-criteria.md:79`); ADR-008 (`decision-record.md:336-372`) |
| 2 | Dark theme on the board | No dark Notion board capture exists on either platform (`:262-266`); our dark palette is re-measured (ADR-006/007, 22 pairs ≥ 4.5:1) but the device read is separate | AC-010 |
| 3 | Desktop hover-reveal of `···` / `+` | Even Notion's web hover state is uncaptured (`:269-272`); ours is `styles.css:9430-9437` with a `:focus-within` keyboard fallback at `:9435` | AC-010 |
| 4 | Phone board on a real handset | R5's phone capture is harness-synthetic — forced `matchMedia("(pointer: coarse)")` (`tasks.md:246`) | AC-010 |
| 5 | Sub-grouped (swimlane) board | Only relevant if the operator ever asks; both references silent; our renderer is a flat strip (`board-renderer.ts:237-317`) | Dormant |
| 6 | Populated-past-limit and genuinely-empty columns | Shared gap: the Notion harvest never exceeds 2-3 records per column (`:62-65`) and Anytype's A11 is design-inferred (`design-trueup.md:205-206`). Both states verified in-repo (`board-renderer.ts:296-301`, `:305`), neither device-confirmed | AC-010 |

Items 1-4 are the Notion-sourced addition to AC-010's operator pass (N1).

---

## 14. Confidence, Inferences and Limitations

**Inferences, marked as such and listed in one place:**

1. No board-mounted unhide exists — read off the actions interface (`board-renderer.ts:77-132`,
   `:84-85`), not from a runtime trace. **Load-bearing for N2**; must be confirmed first.
2. "Card preview → None" ≈ our description-loader contract (`board-renderer.ts:486-488`) — same
   contract shape under a different name. Not load-bearing.
3. The iOS captures' empty card bodies are the Card-preview setting, not a phone card grammar —
   grounded in the same database's Layout sheet reading Card preview → None (`9d7ffd05`, `:74`) and
   in Anytype's measured phone card carrying property rows (`design-trueup.md:158`). Load-bearing
   for *declining* a phone change, which is the safe direction.
4. P2's user-impact rationale (hidden columns are invisible and irrecoverable) follows from
   inference 1.

**Limitations.**

- One lineage, one model. No cross-lineage corroboration.
- The digest is a second-hand read of the captures. Every Notion fact here is the analyst's
  description, never a pixel. No PNG was opened.
- Notion's harvest is thin where it matters most: no dark theme, no scrolled board, no web hover,
  no sub-grouped board (§Divergence Map).
- `newInfoRatio` stayed far above threshold through iteration 5 (`0.3`), so the topic is **not**
  saturated in the convergence sense — the cap stopped the run. What is saturated is the narrower
  question of conflict arbitration against this digest.

**Confidence.** High on the parity ledger (§6) and the conflict register (§9) — both are direct
reads of the tree and of the digest's own rulings, re-verified during synthesis. Medium on N2's
shape (the gap is inferred). High on the errata (§10) — all three re-read line by line.

---

## 15. Traceability and Hand-off

| Output | Destination |
|---|---|
| N1 thresholds and device items 1-4 | Fold into T014-T016 and AC-010; no new criterion needed |
| N2 (P2 Groups panel) | A new child phase, gated on the operator's answer to §12 Q1 |
| N3 errata E-1, E-2 | `notion-screens-digest.md` — add errata notes at `:173-179` and `:193-195` |
| N3 erratum E-3 | `acceptance-criteria.md:79` — re-anchor under T016 |
| N4 | A future capture sweep's target list; no task |
| Conflict register §9 | The operator record for why each Notion pattern was declined |

**Constraints honoured by this run.** No edits to `src/`, `styles.css` or `tools/`. No landed
operator ruling reopened. No image file opened. No source outside the bounded set read.

---

## 16. References

### Notion fact source (exclusive)

- `specs/005-component-surface-system/056-board-anytype-parity/notion-screens-digest.md` — patterns
  P1-P7 at `:109-163`; per-element divergences `:167-227`; conflict list `:230-258`; open questions
  `:261-281`.

### Local implementation

- `src/views/board-renderer.ts` — actions interface `:77-132`; subgroup types `:66-70`; hidden set
  `:188-189`; column render `:237-317`; touch count `:267-268`; page limit `:291-294`; empty column
  `:296-301`; expand tail `:305`; add-card `:306-316`; card render `:361-439`; page icon `:424-428`;
  empty-field gate `:451-452`, `:724-726`; description hydration `:486-503`; group menu `:514-536`;
  subgroup drop `:611-614`; field wrap `:711`; drag preview `:792-805`.
- `src/views/board-card-fields.ts` — subgroup exclusion `:46-53`; reserved keys `:56-57`; derived
  visibility `:60-64`; stored list `:89-99`.
- `src/views/board-card-properties-panel.ts` — panel `:31-127`; fixed slots `:42-43`; drag `:57-94`;
  touch move `:95-111`; type icon `:113-121`; persist `:129-136`.
- `styles.css` `db-kanban-*` block `9328-9723` — view `:9342-9352`; board + scrollbar `:9354-9379`;
  column `:9382-9387`; chip `:9404-9419`; hover reveal `:9430-9437`; count `:9461-9464`; cards
  `:9466-9474`; drop tint `:9475-9477`; card `:9491-9520`; title `:9540-9548`; description
  `:9551-9561`; property rows `:9568-9614`; add-card box `:9618-9656`; touch add-card `:9642-9656`;
  expand `:9662-9664`; phone geometry `:9669-9678`; tint palette `:9688-9723`.

### Packet and design record

- `056/goal.md` — D2, D3, D5, D6; `058` sequencing `:199-201`.
- `056/design-trueup.md` — A1 `:33-36`; phone card `:158`; phone header `:159-163`; A4 `:198`;
  A5 `:199`; A7 `:201`; A8/A9 `:203`; A11 `:205-206`; C5 `:200-202`; drag inference `:260`;
  description fold `:264`; contrast `:349-352`.
- `056/decision-record.md` — ADR-006 `:264-297`; ADR-008 `:336-372`.
- `056/tasks.md` — retired swimlanes `:100-108`; R3 `:244`; R5 `:245-246`; field-wrap class
  `:405-407`; T014 `:438-446`; T015 `:447-451`; T016 `:452-454`.
- `056/acceptance-criteria.md` — AC-008 `:75`; AC-011 `:78`; AC-012 `:79`; AC-013 `:80`.
- `005/design-system.md` — `menu` / `panel` / `condition panel` roles `:76-78`; anchoring table
  `:124-128`; the Notion-is-not-a-source rule `:526-528`.
- `005/roadmap.md` §6A — record-open anchor `:1414`; R6/R7 tint rulings `:1542-1543`; page-scroll
  ruling `:1598`; table wrap rulings `:1618-1619`.

### Run artifacts

- Iterations: `research/lineages/glm-devpass-board/iterations/iteration-001.md` … `-005.md`
- Deltas: `research/lineages/glm-devpass-board/deltas/iter-001.jsonl` … `iter-005.jsonl`
- Merged registry: `research/findings-registry.json` (23 key findings) ·
  `research/fanout-attribution.md`
- Resource map: [resource-map.md](resource-map.md)

*`resource-map.md` did not exist at init (`deep-research-config.json` `resource_map_present: false`),
so no coverage gate applied to this run; the file above was emitted by synthesis from the converged
deltas.*

---

## 17. Convergence Report

- **Stop reason:** `maxIterationsReached`.
- **Total iterations:** 5 of 5 (anti-convergence floor: 3).
- **Convergence threshold:** `0.05` — telemetry only under `--stop-policy=max-iterations`.
- **Ratios:** `0.7, 0.5, 0.5, 0.6, 0.3`. Never below threshold; convergence was never a legal stop.
- **Last 3 iterations:** run 3 — scrolling/drag/layout settings (0.5); run 4 — phone board and
  device checks (0.6); run 5 — consolidation (0.3).
- **Questions:** 5 charter questions dispositioned (which patterns help / concrete change and
  threshold / what we already have / what conflicts / what needs a device). 5 open questions remain,
  recorded in §12 — one operator gate, one confirmation, three digest gaps.
- **Findings:** 23 merged into `research/findings-registry.json`; 18 eliminated alternatives
  preserved in the required table.
- **Divergence summary:** no divergent pivots recorded; no Council artifacts. Breadth documented in
  the Divergence Map above.
- **Lineages:** 1 (`glm-devpass-board`, `cli-opencode`, `llmgateway/glm-5.3-flash`).
- **Scope:** no writes outside the research packet; `src/`, `styles.css` and `tools/` untouched; no
  image file opened; no operator ruling reopened.

<!-- ANCHOR:findings -->
<!-- ANCHOR:convergence-report -->
