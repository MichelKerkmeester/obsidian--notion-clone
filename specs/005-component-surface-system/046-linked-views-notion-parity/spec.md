---
title: "Feature Specification: Linked Views Notion Parity"
description: "An embedded database view on a page renders as a clipped bordered block with a duplicate title and no editing. Notion renders a linked view as the database itself. This phase closes that gap, lets a linked view move between pages, and gives creating one a Notion-like flow."
trigger_phrases:
  - "linked views notion parity"
  - "046 spec"
  - "embedded database chrome"
  - "move linked view"
  - "create linked view"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/046-linked-views-notion-parity"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Opened phase from operator report 42 and its two follow-ons"
    next_safe_action: "Settle the read-only decision for codeblock embeds (decision-record.md ADR-001)"
    blockers:
      - "Codeblock embeds are read-only by design today; parity needs that decision revisited"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "src/main.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does a full-bleed embed break reading-view layout for non-database content around it?"
      - "Does moving a linked view rewrite the codeblock in both files, or cut and paste one block?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Linked Views Notion Parity

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

An embedded database view is the same renderer as the standalone one —
`EmbeddedDatabaseRenderer` builds the toolbar, view tabs, panels and results the file view builds —
but it is dressed and gated as a *block*. The operator's Overview page shows it as a bordered card
carrying a second copy of the page's own "Reports" heading, an expand icon, a collapse chevron, and
a table clipped at the right edge. Opened standalone, the same kind of database is full-bleed, with
view tabs, a toolbar carrying filter and sort badges, a chip rail, a "+ New" row and footer
COUNT/SUM calculations.

Three asks, one surface. Make an embed look and behave like the database; let a linked view move to
another page; make creating one a flow rather than a copied code fence.

**Key Decisions**: the read-only gate on `persistMode === "codeblock"` is the real blocker and needs
an explicit decision, not an incremental relaxation. Whether an embed goes full-bleed inside a
reading view is a host-layout question that must be answered before any CSS is written.

**Critical Dependencies**: `044-phone-sheet-alignment`'s row grammar for the phone side of the
create flow and the move action; `043-constructed-capture`'s harness for photographing embeds.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 (`recommend-level.sh --loc 800 --files 14 --architectural --db` → 74/100, phase score 10/50, phases NO) |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-04 |
| **Branch** | Not yet dispatched |
| **Parent Spec** | ../spec.md |
| **Phase** | 46 of 46 |
| **Predecessor** | 045-board-card-properties |
| **Successor** | None |
| **Handoff Criteria** | None — report-driven (operator report 42), not blocked on `045` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 46** of the Component Surface System.

**Scope Boundary**: how a database view presents and behaves when it is embedded in a page, how it
moves between pages, and how one is created. Not the renderers themselves — every view type keeps
the renderer it has.

**Dependencies**:
- `044-phone-sheet-alignment` — the create flow and the move action are sheets on the phone and must
  use its grammar.
- `043-constructed-capture` — an embed needs a photographed constructed scenario, or the parity
  claim rests on one screenshot.
- `031-sheet-lifecycle-ownership` — the create flow opens panels from inside a sheet, the exact
  shape reports 34-36 were about.
- `006-record-open-target` — where a record opens from inside an embed is that phase's resolver, not
  a new decision here.

**Deliverables**:
- An embed that carries the standalone view's chrome and width.
- A linked view that can be moved to another page, keeping its config and source.
- A create-linked-view flow: pick source database, pick view type, name it, insert the block.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The operator, verbatim, 2026-09-04 ~20:41 CEST: *"on overview the nested views shouldn't be clipped
in blocks but look like original databases just like notion does"*, then *"allow for easy dragging /
moving of said views (database put on a different page like overview)"*, then *"get that UX of
adding a view linked to a source database close to Notion"*.

Read from the tree at `c6b5f11`, three separate mechanisms produce the reported shape.

**Chrome.** `main.ts:387` and `:401` register two code-block processors, `note-database` and
`database-view`, both constructing `EmbeddedDatabaseRenderer` with `persistMode: "codeblock"`.
`markEmbedCodeBlockHost` (`embedded-database-renderer.ts:600-611`) then walks up to eight ancestors
adding `note-database-embed-codeblock-host` until it reaches `markdown-rendered` or
`markdown-preview-view` — that ancestor chain is what boxes and constrains the embed. The toolbar
does render (`renderToolbar`, `:1409`) with real view tabs, which is why the operator's screenshot
shows "All" and "2026" tabs inside the block. On top of it sits a second title from `db-header` and
a `db-embed-header-toggle` chevron (`:1724-1745`) whose only job is to hide that header again.

**Behaviour.** The embed is deliberately read-only in codeblock mode, in at least four places:
`createEntry` no-ops when `isCodeBlock` (`:421`, `:433`, `:463`), `isReadOnly: this.persistMode === "codeblock"`
(`:1592`), `showChartOptions: persistMode !== "codeblock"` (`:1593`), and `syncComputedFields`
similarly gated (`:1575`). That is why the embed has no "+ New" row and no cell editing while the
standalone view in the operator's second screenshot has both, plus footer COUNT/SUM calculations and
a "+ Calculate" affordance.

**Creation and location.** A linked view is a hand-placed code fence. The only creation path is
copy-and-paste: `copyCurrentViewCode` (`database-view.ts:3912`) and `copyEmbeddedViewCode`
(`embedded-database-renderer.ts:3561`) both write

```
```note-database
dbId: <id>            # or dbPath: <path> when the database has no id
viewId: <id>
hideHeader: true      # optional
```
```

to the clipboard and leave the operator to paste it. There is no picker, no view-type step, no
naming step, and no way to move a placed block to another page except cut and paste.

### Purpose

An embedded linked view is the database, not a picture of one: same chrome, same width, same
affordances. Placing one, moving one and creating one are actions in the plugin rather than
clipboard work.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Embed chrome parity: no card border, no nested title, no expand/collapse block furniture; view
  tabs, toolbar with filter/sort badges, chip rail, summary and footer calculations, "+ New".
- Embed width parity: the embed spans the reading view's content width rather than being clipped by
  the code-block host chain.
- The read-only decision for `persistMode === "codeblock"`, taken explicitly in
  `decision-record.md` before any of the four gates is touched.
- Moving a linked view to another page: a drag affordance on desktop and a **Move to page…** action
  in its sheet on the phone, preserving `dbId`/`dbPath`, `viewId` and any block options.
- A **Create linked view** flow: pick the source database, pick a view type, name it, insert the
  block — with the shared sheet and dropdown grammar on the phone.

### Out of Scope
- The renderers themselves. A table embed renders through the same table renderer it does now.
- `hideHeader` as a feature. It stays supported for existing blocks; it stops being the answer to
  "the embed has a title I did not ask for".
- Obsidian's own reading-view layout engine. Where full-bleed conflicts with the host, the host
  wins and the conflict is recorded rather than fought.
- Notion's database inline/full-page toggle. The ask is that an embed looks like the database, not
  that we reproduce Notion's page model.
- `database-view` as a second code-block language. It stays registered; this phase does not
  consolidate the two processors.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/embedded-database-renderer.ts` | Modify | The chrome: nested title, header toggle, host classes; the read-only gates once ADR-001 is taken |
| `src/main.ts` | Modify | Registration of the create-linked-view command; nothing about the processors themselves |
| `styles.css` | Modify | The embed's width and the removal of the block card (serialized lane — see `../spec.md` §4) |
| `src/views/toolbar-renderer.ts` | Modify | The create-linked-view entry beside Add view |
| `src/views/modals/` (new) | Create | The create-linked-view flow: source picker, view-type picker, name |
| `src/views/database-view.ts` | Modify | The move action's source side |
| `src/i18n.ts` | Modify | Labels in three locales |
| `tools/screenshots/constructed-scenarios.mjs` | Modify | A constructed embed scenario at both widths |
| `src/views/embedded-database-renderer.test.ts` | Modify | Chrome and codeblock round-trip coverage |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | An embedded linked view renders without block furniture: no card border, no nested database title duplicating the page's own heading, no expand/collapse chevron whose purpose is to hide chrome the embed should not have had. The reference is the operator's own pair of screenshots — `report-42-embedded-view-clipped.png` against `report-42-standalone-reference.png`. |
| REQ-002 | An embedded linked view spans the reading view's content width and its table is not clipped at the right edge. The eight-ancestor `note-database-embed-codeblock-host` walk (`embedded-database-renderer.ts:600-611`) is the mechanism to change; a fixed pixel width is not an acceptable fix. |
| REQ-003 | The embed carries the standalone view's affordances: view tabs, toolbar with filter and sort badges, the active-rule chip rail, the summary row, footer calculations with the "+ Calculate" affordance, and a "+ New" row. Which of these are reachable depends on ADR-001; whichever are not must be absent by an explicit decision, not by an incidental `persistMode` check. |
| REQ-004 | ADR-001 is recorded before any of the four read-only gates is touched: `createEntry` (`:421`, `:433`, `:463`), `isReadOnly` (`:1592`), `showChartOptions` (`:1593`), `syncComputedFields` (`:1575`). Relaxing them one at a time is how an embed ends up half-editable with no one able to say which half. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | A linked view moves to another page: a drag affordance on the embed on desktop and a **Move to page…** action in its sheet on the phone. The move preserves `dbId` or `dbPath`, `viewId` and any block options, and it removes the block from the source page in the same operation. |
| REQ-006 | A **Create linked view** flow exists: pick the source database, pick a view type, name the view, and insert the block at the cursor. On the phone it uses `044`'s sheet and dropdown grammar. It never asks the operator to paste a code fence. |
| REQ-007 | The block format stays backward compatible. Every existing `note-database` and `database-view` block, with `dbId` or `dbPath`, with or without `viewId` and `hideHeader`, still resolves. A block written by the new flow is readable by the current parser. |
| REQ-008 | No spec path, phase number, task id or requirement id appears in any code comment this phase writes. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: an embed and the same view opened standalone are captured side by side at the same
  width, and the difference is content, not chrome.
- **SC-002**: no table column is clipped in an embed at either captured device width.
- **SC-003**: a linked view moved between two pages resolves the same database, the same view and
  the same options after the move, proven by re-reading both files.
- **SC-004**: creating a linked view takes no clipboard step.
- **SC-005**: the operator opens the Overview page and reports the nested views as reading like real
  databases.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Obsidian's reading-view layout | High — full-bleed inside a markdown preview is host territory | Answer the layout question in T002 before writing CSS; record the host's constraint if it wins |
| Dependency | `044`'s sheet grammar | Med — the phone flows need it | Desktop flows land first; phone flows follow |
| Risk | Relaxing read-only piecemeal | High — a half-editable embed nobody can describe | REQ-004 makes ADR-001 a precondition |
| Risk | Editing from an embed writes to notes the page's author did not open | High — data change from a surface that reads as a preview | ADR-001 must state the write model explicitly, including undo |
| Risk | Moving a block edits two files | Med — a crash between the two leaves a duplicate or a loss | Write the destination first, then remove the source; a duplicate is recoverable and a loss is not |
| Risk | The serialized `styles.css` lane | Med | Hold the lane, recapture, human PNG read on release |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: a page with several embeds does not render them all eagerly; the existing
  `IntersectionObserver` visibility gate (`embedded-database-renderer.ts:620-637`) stays and the
  chrome change does not defeat it.
- **NFR-P02**: widening an embed adds no new layout thrash; the host-viewport capture/restore pair
  around `render()` (`:670`, `:712`) keeps its current behaviour.

### Security
- **NFR-S01**: N/A. No auth surface.
- **NFR-S02**: a move rewrites two markdown files. Both writes go through Obsidian's vault API, and
  neither constructs a path from unvalidated block content.

### Reliability
- **NFR-R01**: a block naming a database that no longer exists keeps its current empty state with a
  retry action (`:678-689`), rather than throwing into the reading view.
- **NFR-R02**: an interrupted move leaves the destination block written and the source block intact,
  never the reverse.

## 8. EDGE CASES

### Data Boundaries
- Empty input: a block with a `dbId` and no `viewId` resolves the database's first view, as today.
- Maximum length: a database with many views scrolls its tab rail inside an embed rather than
  wrapping the toolbar to two rows.
- Invalid format: an unparsable block shows the existing read-failed card, not a blank region.

### Error Scenarios
- External service failure: N/A.
- Network timeout: N/A.
- Concurrent access: two embeds of the same view on one page — the existing `sourceInstanceId` on
  `ViewConfigMutation` already stops a writer reacting to its own write, and the move must not
  bypass it.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 19/25 | Files: ~14, LOC: ~800, Systems: renderer, host layout, code-block format, two file writes |
| Risk | 18/25 | Auth: N, API: N, Breaking: Y — the read-only relaxation and the block-format round trip |
| Research | 14/20 | The host-layout question and the write model both need answering before code |
| Multi-Agent | 8/15 | Three legs: chrome, move, create |
| Coordination | 8/15 | `044` grammar, `043` harness, the serialized CSS lane |
| **Total** | **67/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | Full-bleed fights Obsidian's reading-view layout and breaks surrounding content | H | M | T002 answers the layout question against the real host before CSS is written; the host wins and the constraint is recorded |
| R-002 | Read-only is relaxed incrementally and the embed becomes half-editable | H | M | REQ-004 makes ADR-001 a precondition for touching any of the four gates |
| R-003 | The move loses a block between two file writes | H | L | Destination first, source second; a duplicate is recoverable, a loss is not |
| R-004 | The new create flow writes a block the current parser cannot read | H | L | REQ-007 plus a round-trip test over every option combination |
| R-005 | Removing the nested title breaks pages that relied on it as a heading | M | M | Keep `hideHeader` honoured for existing blocks; the removal is of the default, not of the capability |
| R-006 | Editing from an embed surprises the page author | M | M | ADR-001 states the write model, including whether undo reaches the embed |

---

## 11. USER STORIES

### US-001: A linked view that reads like the database (Priority: P0)

**As a** vault owner with an Overview page, **I want** the databases I embed there to look and work
like the databases themselves, **so that** the page is a place I work rather than a place I look at
previews and then navigate away.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-002: Moving and creating a linked view without the clipboard (Priority: P1)

**As a** vault owner reorganising pages, **I want** to move a linked view to another page and to
create one from a picker, **so that** placing a database on a page is an action rather than a copied
code fence I have to paste in the right spot.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

## 12. OPEN QUESTIONS

- Does a full-bleed embed break the reading view's layout for content around it? This is the
  question that decides whether REQ-002 is a CSS change or a negotiation with the host, and it must
  be answered against the real Obsidian before any rule is written.
- Does moving a linked view rewrite the block in both files, or cut one block and paste it? The
  second is simpler and loses block-local options if the parse and re-serialise are not exact.
- Should an embed be editable at all? Recorded as ADR-001 rather than assumed. The operator asked
  for embeds that *look like* databases; whether they should *behave* like them, including creating
  notes from a page that reads as prose, is their call.
- Does `hideHeader: true` keep meaning anything once the default header is gone? Probably it becomes
  a no-op, and a no-op option left in the format is a trap for the next reader.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Closure Gate**: See `acceptance-criteria.md`
- **Decision Records**: See `decision-record.md`
