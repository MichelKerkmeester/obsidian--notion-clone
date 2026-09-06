---
title: "Acceptance Criteria: Notion Board Refinement"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "059 acceptance criteria"
  - "board groups panel closure gate"
  - "notion board refinement criteria"
  - "showGroup acceptance"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/059-notion-board-refinement"
    last_updated_at: "2026-09-06T16:36:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:36 rulings into AC-005, AC-008 and AC-010"
    next_safe_action: "Run T002 and pin each observed red into its Today cell"
    blockers:
      - "AC-010 is the operator's device read and an agent never ticks it"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-059-acceptance"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the operator adopt the Groups panel at all"
    answered_questions:
      - "AC-006's subject landed on main at dc1d54a9 before this packet opened"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Board Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** `005-component-surface-system/059-notion-board-refinement`
**Level:** 2
**Status:** Draft — opened 2026-09-06, no source file touched
**Date:** 2026-09-06
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every threshold below carries a value **observed red on the rebased tree** — the tree that carries
`dc1d54a9`, not the tree the research loop read (`goal.md` D3, D7). Exit statuses are read from `$?`
and never through a pipe. AC-010 is the operator's and an agent never ticks it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a board whose group field has options, **When** a reader hides one and then wants it back, **Then** it is restorable from a board-mounted surface without leaving the board | **Observed red:** `grep -rn "hideGroup" src/` returns **2** rows — the declaration at `board-renderer.ts:84` and the guarded call at `:558` — and **0** implementations; the same for `deleteGroup`. So the two menu rows at `:558-559` never build, the column menu ships **3** rows, and `config.boardHiddenGroups` (declared `src/data/types.ts:560`, allowlisted `src/data/data-source.ts:1352`, applied `board-renderer.ts:192-193`) has **0** board-mounted writers and **0** restorers. Green is one implementation per declaration in both hosts, **0** unreachable hidden groups, and **100%** of group rows carrying a live toggle | Unmet | - |
| AC-002 | REQ-002 | **Given** the Groups surface, **When** it opens, **Then** it declares `role: "panel"`, sits inside the 292-360px band the role assigns, anchors locally, traps focus and dismisses on outside click or Escape | **Observed red:** `grep -rn "manageGroups\|db-board-groups" src/` returns **0** — no such surface exists. Green is the declared role and a computed width inside the band, asserted by the `render-assertions` row T012 adds, with the band read from `../design-system.md:77` and `:126` rather than from Notion | Unmet | - |
| AC-003 | REQ-003 | **Given** every option of the group field, visible and hidden, **When** the panel lists them, **Then** each carries a live visibility toggle and the surface carries hide-all and show-all | **Observed red:** **0%** of group options carry a toggle today, because no surface lists them. Notion carries the pattern on one screen (`e9698e1b`, `30ba5533`, `f6d1e7e6`, `2ef31bd5`; digest `:119-127`). Green is **100%**, including an orphan key present in `boardHiddenGroups` with no matching schema option — listed as unknown and restorable, never dropped (NFR-R02) | Unmet | - |
| AC-004 | REQ-004 | **Given** the same rows, **When** one is dragged, **Then** the order commits through `updateGroupOrder` and survives a re-render | **Observed red:** order and visibility live apart. Reorder is reachable only by dragging a column or through the toolbar's group-order popover (`src/views/database-view.ts:3119-3287`), which carries **0** visibility controls. Green is a drag handle per row committing through `board-renderer.ts:83`, the order round-tripping across a re-render, and **0** new drag vocabulary — the rows are built by `buildCheckboxPropertyRow` (`src/views/record-surface/property-row.ts:353`) | Unmet | - |
| AC-005 | REQ-005 | **Given** a **default** view config, **When** the board renders a group with no records, **Then** the column is suppressed, because `boardHideEmptyGroups` defaults **`true`**; **and Given** a config that sets it **`false` explicitly**, **Then** the column is shown and its shared empty card still builds | **ADR-010 Accepted 2026-09-06 18:36** — operator, verbatim: *"On by default, like Notion"*, which **reverses this packet's opening proposal** of a `false` default. Notion ships the toggle **on** in all three management captures (`30ba5533`, `e9698e1b`, `2ef31bd5`). Green is `boardHideEmptyGroups` defaulting **`true`**, **0** empty columns rendered under a default config, the empty card still built at `board-renderer.ts:324-327` under an explicit `false`, and the eight `board-empty-column-*` / `constructed-board-empty-column-*` capture fixtures **pinned to `hideEmptyGroups: false` in the fixture itself** so their hashes stay unchanged and no longer depend on an unstated default | Unmet | - |
| AC-006 | REQ-007 | **Given** the research loop's P0 and its erratum E-3, **When** this packet reads the tree they describe, **Then** both are recorded as landed rather than repeated as work | **Verification row, not a task** (`goal.md` D7). `dc1d54a9` landed the page scroll and the card text: `056/tasks.md` T014, T015 and T016 all `[x]`; `056` AC-012 and AC-013 both **Met**; `grep -n "9569\|9447\|9472" ../056-board-anytype-parity/acceptance-criteria.md` returns **0** rows, so E-3's drifted anchors are gone with the row that carried them; `.db-kanban-cards` carries no `overflow-y`; `.note-database-container.db-kanban-view` carries both axes (`styles.css:9348-9356`) with its `::-webkit-scrollbar` at `height: 0` at rest and `10px` on hover or `.is-scrolling` (`:9386-9392`). Green is that read recorded here with its output, and **0** rows in this packet that would redo it | Unmet | - |
| AC-007 | REQ-007 | **Given** four record claims the current tree contradicts, **When** each is filed, **Then** the document that makes the claim carries the note | **Observed red: 4 uncorrected.** E-1 (digest `:173-179` vs `styles.css:9440`), E-2 (digest `:193-195` vs `board-renderer.ts:63-70`, `:222`, `:639-640`), E-4 (digest `:183-186` and research §6/§8 vs the two unimplemented actions, with `src/i18n.ts:136-137` shipping labels for rows nothing renders), E-5 (digest `:220-226` vs the rules `dc1d54a9` deleted, plus every §4 anchor that drifted with it). Green is **0** contradicted claims without a note. E-3 is not counted here — AC-006 records it as closed | Unmet | - |
| AC-008 | REQ-006 | **Given** the nine Notion-vs-Anytype conflicts the research named, **When** the packet closes, **Then** each carries an ADR and the eight declines land **0** lines of code | **Observed red: 0 of 9** carry an ADR in this packet today, though **7** are already decided by a landed ruling (research §9). Green is eleven ADRs — **ten Accepted and one Proposed** after the operator's 2026-09-06 18:36 rulings on ADR-004, ADR-010 and ADR-011 — and each of the eight declines measurable and unmoved: desktop count still absent (`board-renderer.ts:294`, touch branch only), chip still filled (`styles.css:9440`), `···`/`+` still `:not(.is-touch)` with a `:focus-within` fallback (`:9458-9464`), add-card still the bordered 42px box (`:9660-9672`), per-type property icons still **0** outside relation, page limit still **10** (`board-renderer.ts:320`), the board still a flat strip (`:263-341`), board-level wrap switches still **0** | Unmet | - |
| AC-009 | REQ-008, REQ-009, REQ-010 | **Given** the new surface and the four device-only checks, **When** the packet closes, **Then** both are locked by lanes and rows that already exist | **Observed red:** `ls screenshots/notion-clone/panels/ \| grep -c board-groups` returns **0** against 116 files in that folder, and `056` AC-010's verification cell enumerates **0** device checks. Green is four `constructed-board-groups-panel-*` captures registered in `screenshots/manifest.json` with `screenshots-fresh` green, two `render-assertions` rows each observed red first, **4** device items named on AC-010, `sheet-grammar.mjs` still 12 surfaces and 31 stacked pairs at exit 0, and **0** new gate lanes | Unmet | - |
| AC-010 | OPERATOR | **Given** a release carrying the Groups panel, **When** the operator opens it on iOS and on desktop, **Then** they report it as an improvement rather than a fourth place to hunt for a setting | The operator's own words. ADR-004, ADR-010 and ADR-011 were answered on 2026-09-06 18:36, so this row now waits on a release rather than on a decision. Nothing in this repository can close it, and an agent never ticks it | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

Ten rows, all `Unmet`, which is the honest state of a packet opened today with no source file
touched. **No row is gated on a decision any more** — ADR-004, ADR-010 and ADR-011 were ruled on
2026-09-06 18:36, so AC-002 through AC-005 and AC-009 can start. AC-010 remains the operator's own
device read. The closure sentence
proper is written when the packet closes, not now.
<!-- /ANCHOR:closure -->
