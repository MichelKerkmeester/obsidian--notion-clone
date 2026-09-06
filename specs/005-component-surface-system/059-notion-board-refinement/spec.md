---
title: "Feature Specification: Notion Board Refinement"
description: "What the Notion kanban harvest should and should not change on the Anytype-parity board: one adopted group-management panel, eight recorded declines, and four errata."
trigger_phrases:
  - "059 spec"
  - "notion board refinement"
  - "board groups panel"
  - "notion vs anytype board conflicts"
importance_tier: "important"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Notion Board Refinement

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `worktrees/174-notion-board` |
| **Parent Spec** | ../spec.md |
| **Phase** | 59 of 67 |
| **Predecessor** | 058-card-title-and-title-formats |
| **Successor** | None |
| **Handoff Criteria** | `058`'s title-resolver leg has released `src/views/board-renderer.ts`, and the operator has answered ADR-004 / ADR-010 / ADR-011. `056` T014-T016 already released it — they landed on `main` at `dc1d54a9` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 59** of the Component Surface System program, and the board's Notion-refinement
child. Its input is the five-iteration research loop at
[`../056-board-anytype-parity/research/research.md`](../056-board-anytype-parity/research/research.md),
whose exclusive Notion fact source is
[`../056-board-anytype-parity/notion-screens-digest.md`](../056-board-anytype-parity/notion-screens-digest.md).

**Scope Boundary**: the board's *group-management* surface, plus the paper trail for every Notion
pattern the loop declined. The board's geometry, card anatomy, option colours and page-scroll
behaviour all stay with `056`; the title resolver stays with `058`. The loop ran against a tree that
has since moved — `dc1d54a9` landed the page scroll and the card text, closing `056` T014-T016 and
AC-012/AC-013 — so what the research ranked P0 is a **verification** row here rather than a task
(`goal.md` D7).

**Dependencies**:
- `056-board-anytype-parity` T014-T016 held `src/views/board-renderer.ts`; they landed at `dc1d54a9`
  and released it. Their landed state is what T001 re-reads.
- `058-card-title-and-title-formats` takes the same file next; this packet queues behind it.
- The operator's answer to `notion-screens-digest.md:277-281` gates every code leg (`goal.md` D6).

**Deliverables**:
- A Groups `panel` reachable from the board's own column menu, carrying per-group visibility and
  drag reorder in one place.
- A `showGroup` member on `BoardRendererActions`, implemented by both hosts, with `hideGroup` and
  `deleteGroup` either wired or removed (ADR-011).
- Eleven ADRs: seven Accepted on a landed ruling, four Proposed — and only three of the four gate
  code, because ADR-009 proposes changing nothing.
- Four errata notes (E-1, E-2, E-4, E-5; E-3 was closed by `dc1d54a9`), and four device-only
  checks named on `056` AC-010.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The board can put a group out of sight and offers nothing that brings it back. `hideGroup` and
`deleteGroup` are declared optional on `BoardRendererActions` (`src/views/board-renderer.ts:84-85`)
and **neither host implements them** (`src/views/database-view.ts:791-830`,
`src/views/embedded-database-renderer.ts:532-563`), so the two menu rows guarded on them
(`:558-559`) have never rendered — `src/i18n.ts:136-137` ships their labels in three locales for
rows nothing builds — and `config.boardHiddenGroups`, declared at `src/data/types.ts:560`,
allowlisted at `src/data/data-source.ts:1352` and applied at `board-renderer.ts:192-193`, has no
board-mounted writer or restorer at all. Separately, the Notion harvest raises eight patterns that a
landed Anytype ruling already settles, and the record carries four claims that the tree
contradicts.

### Purpose
A reader can see every group, hide one, bring it back, and reorder the lot from one surface — and
every Notion pattern this packet did *not* adopt is on the record with the ruling that decided it,
so the question is never re-litigated from a stale citation.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- A Groups `panel` in the `panel` role (292-360px, local anchor, trapped focus), entered from one
  new row in `renderBoardGroupOptions` (`src/views/board-renderer.ts:540-560`).
- Per-group visibility with a live toggle on every option, visible and hidden, plus bulk hide-all
  and show-all — Notion `e9698e1b`, `30ba5533`, `f6d1e7e6`, `2ef31bd5`.
- Drag reorder from the same rows, committing through `updateGroupOrder`
  (`src/views/board-renderer.ts:83`) and reusing the shared row builder
  `buildCheckboxPropertyRow` (`src/views/record-surface/property-row.ts:353`) exactly as
  `src/views/board-card-properties-panel.ts:48-125` already uses it.
- A `showGroup` member on `BoardRendererActions`, implemented in both hosts.
- A "Hide empty groups" setting, default **off** (ADR-010).
- Eleven ADRs and four errata notes (E-1, E-2, E-4, E-5).
- Four device-only checks appended to `056` AC-010's operator pass.
- Four constructed captures and two assertion rows on lanes that already exist.

### Out of Scope
- The page-scroll ruling and the card-text defects — `056` AC-012/AC-013 and T014-T016 own them,
  both landed at `dc1d54a9` and both read **Met**, and no Notion capture could have arbitrated
  either (`notion-screens-digest.md:158-163`, `:266-268`). T001 re-reads them; nothing here redoes
  them.
- Sub-grouped (swimlane) board rendering — `056` D6 retires extensions with no Anytype counterpart,
  and Notion demonstrates sub-grouping on a Table view only (`65ed2da3`, `30ba5533`).
- A board-level text-wrap switch — ADR-009 recommends against it; it fights `056` AC-013.
- Per-type card property icons, a bare-text add-card, a desktop record count, card-size presets, a
  higher page limit — each declined with its ruling in `decision-record.md`.
- Any change to `src/views/title-field-display.ts` or the board's Title slot; that is `058`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/board-groups-panel.ts` | Create | The Groups panel: visibility toggles, bulk actions, drag reorder, "Hide empty groups" |
| `src/views/board-renderer.ts` | Modify | `showGroup` on the actions interface; one entry row in `renderBoardGroupOptions` (`:540-560`); the hidden-group filter at `:192-193` and a new empty-group filter beside it |
| `src/views/database-view.ts` | Modify | Supply `showGroup`, and wire or remove `hideGroup`/`deleteGroup` per ADR-011 |
| `src/views/embedded-database-renderer.ts` | Modify | Same, for the embedded host |
| `src/data/types.ts` | Modify | The "Hide empty groups" flag beside `boardHiddenGroups` (`:560`) |
| `src/data/data-source.ts` | Modify | Add the flag to the persisted key allowlist (`:1352`) |
| `src/i18n.ts` | Modify | Strings for the panel title, the entry row, the bulk actions and the empty-groups toggle |
| `styles.css` | Modify | Panel and row treatment, derived from our own token scale (`goal.md` D2) |
| `tools/live/render-assertions.mjs` | Modify | Panel-width and visibility-toggle rows, plus a negative control |
| `screenshots/manifest.json` | Modify | Register the four `constructed-board-groups-panel-*` captures |
| `../056-board-anytype-parity/notion-screens-digest.md` | Modify | Errata E-1, E-2, E-4, E-5 |
| `../056-board-anytype-parity/acceptance-criteria.md` | Modify | The four device items on AC-010. E-3 needs nothing: `dc1d54a9` rewrote AC-012 and it cites no stylesheet line |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A group hidden from the board is restorable from a board-mounted surface. Today `grep -rn "hideGroup" src/` returns **2** rows — one declaration, one guarded call site — and **0** implementations, and `config.boardHiddenGroups` has 0 board-mounted writers |
| REQ-002 | The Groups surface declares `role: "panel"`, sits inside the 292-360px band `../design-system.md:77` assigns that role, anchors locally, traps focus, and dismisses on outside click or Escape |
| REQ-003 | Every group option — visible and hidden — carries a live visibility toggle, with hide-all and show-all bulk actions on the same surface |
| REQ-004 | Group order is drag-reorderable from the same rows and round-trips through `updateGroupOrder` across a re-render |
| REQ-005 | "Hide empty groups" defaults to `false`, so the shared empty-column state at `src/views/board-renderer.ts:324-327` is never auto-deleted |
| REQ-006 | Each of the nine Notion-vs-Anytype conflicts the research named carries an ADR, plus two more for the adoption's own shape; the seven a landed ruling decides are `Accepted` citing it, and the four it does not are `Proposed` pending the operator |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-007 | The four record claims the tree contradicts (E-1, E-2, E-4, E-5) each carry an errata note in the document that makes them; E-3 is recorded as closed by `dc1d54a9` rather than fixed |
| REQ-008 | The four device-only checks are enumerated on `056` AC-010's operator pass rather than left inside a research document |
| REQ-009 | The panel is captured four ways and locked by assertion rows on lanes that already exist, with 0 new gate lanes and a negative control observed red first |
| REQ-010 | The phone presentation passes `tools/live/sheet-grammar.mjs` at 12 surfaces and 31 stacked pairs, exit 0 read from `$?` |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Hidden groups unreachable from a board-mounted surface goes from an unbounded count to **0**, and the proportion of group rows carrying a live toggle goes from **0%** to **100%**.
- **SC-002**: Notion patterns adopted beyond the one candidate: **0**. Eight declines landing 0 lines of code — seven citing the landed ruling that decided them, one (ADR-009) recording a decline no ruling has made; record claims contradicted without an errata note: **4 → 0**, with a fifth (E-3) recorded as closed by `dc1d54a9` rather than counted twice.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `src/views/board-renderer.ts` file lane | Blocked until `058` releases it; `056` T014-T016 already did, at `dc1d54a9` | Queue behind `058`; T001-T003 need none of it |
| Dependency | The operator's adoption answer (`notion-screens-digest.md:277-281`) | Every code leg blocked | `goal.md` D6 makes the gate explicit; the ADR pack is what goes to the operator |
| Risk | A fourth surface a reader must hunt through for a setting | Medium | The entry row lives in the column menu the reader already opened to hide the group; no new toolbar entry |
| Risk | Wiring `deleteGroup` resurrects a destructive action nobody asked for | Medium | ADR-011 puts the choice to the operator rather than assuming it; the safe default is removing the dead guard, not implementing it |
| Risk | Adopting Notion's screen shape imports Notion's mobile grammar | Medium | `goal.md` D2 and `../design-system.md:526-528`; the surface is a `panel`, phone-presented through `044`'s sheet grammar |
| Risk | "Hide empty groups" quietly deletes a captured state | High | REQ-005 pins the default to `false` and ADR-010 records why Notion's own default is not adopted |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The panel opens within one frame of the menu row's click on a board of 10 groups — no data fetch, it reads `config.schema` and the already-grouped rows.
- **NFR-P02**: A visibility toggle commits and re-renders the board without a full re-query; the existing `boardHiddenGroups` filter at `src/views/board-renderer.ts:192-193` is the only read path.

### Security
- **NFR-S01**: No new persisted key escapes the view-config allowlist at `src/data/data-source.ts:1352`; a vault's `data.json` cannot introduce an unlisted board flag, the property `056` AC-005 already locks for `boardExtensionsEnabled`.
- **NFR-S02**: Group keys are rendered as text, never as HTML; the panel builds rows through `buildCheckboxPropertyRow` rather than string concatenation.

### Reliability
- **NFR-R01**: Reorder and visibility both persist through the existing config save path, so a crash mid-panel loses at most the uncommitted row.
- **NFR-R02**: A group key present in `boardHiddenGroups` but absent from the schema is listed as unknown and restorable, not dropped — the state that makes a hide irreversible today.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: a view with no group field — the entry row is absent, matching the toolbar's own `t("notice.selectGroupField")` path at `src/views/database-view.ts:3122-3126`.
- Maximum length: a select column with many options — the panel scrolls its list inside the declared width; the width is not widened to fit.
- Invalid format: a stored `boardHiddenGroups` key with no matching option — listed as unknown and restorable (NFR-R02), never silently discarded.

### Error Scenarios
- External service failure: none — the panel is local and reads no network.
- Network timeout: not applicable.
- Concurrent access: a refresh arriving while the panel is open re-reads config rather than closing the surface, per `048`'s stacking model.

### State Transitions
- Partial completion: every toggle commits immediately, as the group-order popover's own `commitOrder` already does (`src/views/database-view.ts:3162-3168`); there is no save step to abandon.
- Session expiry: not applicable.
- Hiding the last visible group: the board renders its empty state rather than a blank strip, and the panel stays open so the action is reversible in place.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | ~470 LOC across 8 source files plus captures and assertion rows |
| Risk | 15/25 | `BoardRendererActions` is a contract two hosts implement; no auth, no DB, no breaking change to a persisted shape |
| Research | 13/20 | Five iterations landed; one operator gate and three digest gaps remain open |
| **Total** | **46/70** | **Level 2** — `recommend-level.sh --loc 470 --files 8 --api` returns 46/100, confidence 82%, recommended level 2, phase score 0/50. Without `--api` the same inputs return 38/100 and Level 1 |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does the operator adopt Notion's group-management surface at all? `notion-screens-digest.md:277-281` asks it and declines to answer; ADR-004 carries it.
- Does hide/unhide belong to the new panel alone, or are the two dead host actions wired as well? ADR-011.
- Does Notion render rows for empty properties? A genuine digest gap (`:78`, `:146-147`); ours skip an empty field unless `config.showEmptyFields === true` (`src/views/board-renderer.ts`, the card-field gate). No adoption and no rejection is proposed.
- Does Notion's board hide the *grouping* property from its own cards? Inference-only territory; `045`'s mechanism deliberately drops the grouped field (`src/views/board-card-fields.ts`) and `056` D5 pins it. No change proposed.
<!-- /ANCHOR:questions -->

---
