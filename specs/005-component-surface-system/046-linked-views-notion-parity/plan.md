---
title: "Implementation Plan: Linked Views Notion Parity"
description: "Answer two questions before writing anything — whether a full-bleed embed survives the reading view, and whether an embed may write — then strip the block furniture, widen the embed, and add the move and create flows on the existing code-block format."
trigger_phrases:
  - "linked views parity plan"
  - "046 plan"
  - "embed chrome plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify + level3-arch | v2.2 -->
# Implementation Plan: Linked Views Notion Parity

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API, `MarkdownRenderChild` |
| **Framework** | None — direct DOM inside Obsidian's markdown reading view |
| **Storage** | Markdown code fences in the vault plus the database's own view config. The block format is `dbId`/`dbPath` + optional `viewId` + optional `hideHeader` |
| **Testing** | Vitest for the block round trip and the move; constructed captures for the chrome; a device pass for the operator's own page |

### Overview

Two questions decide most of this phase and neither is a coding question. Does a full-bleed embed
survive Obsidian's reading-view layout, and may an embed write to the vault? Both are answered
first — the second as ADR-001 — because the alternative is discovering the answer through a
half-finished CSS rule or a half-relaxed read-only gate.

After that the work splits cleanly into three legs that barely touch: strip the block furniture and
widen the embed; move a placed block between pages; create one from a picker. The block format does
not change, which is what keeps the third leg small: the create flow writes the fence
`copyCurrentViewCode` already writes, it just writes it into a file instead of the clipboard.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear — three mechanisms cited by file:line in `spec.md` §2
- [ ] Success criteria measurable — SC-001 and SC-002 are capture comparisons, SC-003 is a file re-read
- [ ] Dependencies identified — the host layout answer and ADR-001 are both preconditions, not risks

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing — `npm run gate` exits 0 with the new embed scenarios captured
- [ ] Docs updated (spec/plan/tasks/decision-record), parent map and `../roadmap.md` §5 carry the phase
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Presentation and capability split. Today `persistMode === "codeblock"` decides both — it dresses the
embed as a block *and* makes it read-only, in the same conditional vocabulary spread across the
file. The phase separates them: a presentation mode that says how the surface is dressed, and a
capability decision (ADR-001) that says what it may do. An embed can then be full-chrome and
read-only, or full-chrome and writable, and someone can say which without reading four call sites.

### Key Components
- **`EmbeddedDatabaseRenderer` chrome**: `markEmbedCodeBlockHost` (`:600`), `renderHeaderChromeToggle`
  (`:1724`), and the `db-header` the toolbar builds. This is what produces the border, the nested
  title and the chevron.
- **Width**: the `note-database-embed-codeblock-host` ancestor chain and the CSS that reads it.
- **Capability gates**: `createEntry` (`:421`, `:433`, `:463`), `isReadOnly` (`:1592`),
  `showChartOptions` (`:1593`), `syncComputedFields` (`:1575`). Four sites, one decision.
- **Block serialiser**: `serializeCodeBlockReference` (`:3555`) and `copyCurrentViewCode`
  (`database-view.ts:3912`) already produce the exact fence. The move and create flows reuse it
  rather than writing a second serialiser.
- **Move**: read the block, write it into the destination file, then remove it from the source.
- **Create**: source picker → view-type picker → name → insert at cursor.

### Data Flow

A code fence is parsed into a `dbId`/`dbPath` plus `viewId`, resolved against the database registry,
and rendered by the same renderer the file view uses. Nothing in that path changes. What changes is
the chrome applied around it, the capability set granted to it, and two new writers that produce or
relocate the fence itself using the existing serialiser.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `main.ts:387`, `:401` | Producers: two code-block processors, both `persistMode: "codeblock"` | Unchanged — consolidating them is out of scope | `rg -n 'registerMarkdownCodeBlockProcessor' src` still returns two |
| `embedded-database-renderer.ts:600` `markEmbedCodeBlockHost` | Policy: marks up to 8 ancestors as the embed host | Update — this is the width and border mechanism | Rendered ancestor classes read at both device widths |
| `:1724` `renderHeaderChromeToggle` / `hideHeader` | Consumer of the header the embed should not have had | Update — the default header goes; the option stays honoured for existing blocks | Round-trip test over blocks with and without `hideHeader` |
| `:421`/`:433`/`:463` `createEntry`, `:1592` `isReadOnly`, `:1593` `showChartOptions`, `:1575` `syncComputedFields` | Policy: four independent read-only gates keyed on one string | Update together, after ADR-001, or not at all | `rg -n 'persistMode === "codeblock"' src/views/embedded-database-renderer.ts` — count stated before and after |
| `:3555` `serializeCodeBlockReference`, `database-view.ts:3912` `copyCurrentViewCode` | Producers of the fence | Reused by the move and create flows; format unchanged | Round trip: serialise → parse → serialise is byte-identical |
| `styles.css` embed rules | Policy: the serialized lane | Update under a held lane | Recapture and a human PNG read on lane release |
| `:620` `observeVisibility` | Consumer: lazy render gate | Unchanged, and must stay effective after the width change | A page with several embeds renders lazily, measured |

Required inventories:
- Same-class producers: `rg -n 'persistMode' src/views/embedded-database-renderer.ts` — every gate
  keyed on the mode, so none is relaxed by accident.
- Consumers of changed symbols: `rg -n 'note-database-embed-codeblock-host|note-database-embed-headerless|db-embed-header-toggle' src styles.css tools`
- Matrix axes: {`dbId`, `dbPath`} × {`viewId` present, absent} × {`hideHeader` true, absent} ×
  {`note-database`, `database-view`} = 16 blocks, each of which must resolve identically before and
  after. That is REQ-007's row count.
- Algorithm invariant: parse then re-serialise is byte-identical for every block the current writers
  can produce. Adversarial cases: a `dbPath` containing a colon, a `viewId` that is an empty string
  (`copyCurrentViewCode` writes `viewId: ` with no value when `view.id` is unset), and a block with
  trailing whitespace.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Block round trip across the 16-row matrix; the move's two-file sequence; the create flow's serialisation | Vitest |
| Integration | A constructed embed scenario at both device widths, captured beside the standalone view of the same data | `tools/screenshots/constructed-scenarios.mjs`, `capture.mjs` |
| Manual | The operator opening their Overview page | Device |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Obsidian reading-view layout | External | Unknown until T002 | Red if full-bleed is not achievable; REQ-002 is then renegotiated with the operator rather than forced |
| ADR-001 (write model) | Internal | Not taken | Blocks REQ-003's affordance set and the whole capability leg |
| `044-phone-sheet-alignment` | Internal | Yellow — opened, not started | Phone flows wait; desktop flows do not |
| `043-constructed-capture` harness | Internal | Green | Falls back to a manual capture pair |
| `styles.css` serialized lane | Internal | Yellow — contended | Leg queues behind whoever holds it |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: an embed breaks the reading view's layout for surrounding content, or a moved block
  fails to resolve on either page.
- **Procedure**: the chrome leg is a CSS and DOM change with no persisted effect — reverting restores
  the block presentation exactly. The move and create flows write markdown; blocks they wrote stay
  valid after a revert because the format did not change.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 read the three mechanisms ──┐
T002 host layout answer ─────────┼──► T004 chrome ──► T005 width ──┐
T003 ADR-001 write model ────────┘                                 ├──► verification
                                  └──► T006 capability gates ──────┤
                                       T007 move ──────────────────┤
                                       T008 create ────────────────┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup (T001-T003) | None | Everything |
| Chrome + width (T004-T005) | T001, T002 | Verification |
| Capabilities (T006) | T003 | Verification |
| Move (T007) | T001 | Verification |
| Create (T008) | T001 | Verification |
| Verify (T009-T013) | All | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Med | 3-4 hours, mostly T002's host investigation |
| Core Implementation | High | 14-20 hours across three legs |
| Verification | Med | 4-5 hours including the 16-row round trip and the capture pair |
| **Total** | | **21-29 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup created — N/A for the chrome leg. For the move leg, the operator's vault is the data;
      the destination-first ordering is the safeguard rather than a backup
- [ ] Feature flag configured — the capability change gets one if ADR-001 says embeds may write,
      because that is a behaviour change to every existing page
- [ ] Monitoring alerts set — a constructed embed scenario in the capture manifest, so a chrome
      regression shows in `screenshots-fresh` rather than on the operator's page

### Rollback Procedure
1. Revert the chrome and width commits; block presentation returns exactly.
2. If the capability change shipped, disable its flag before reverting code, so an in-flight edit
   is refused rather than half-written.
3. Recapture and read the changed PNGs before releasing the `styles.css` lane.
4. Blocks written by the create or move flows stay valid — the format did not change, which is the
   point of REQ-007.

### Data Reversal
- **Has data migrations?** No. No stored shape changes.
- **Reversal procedure**: N/A, except that notes created from a writable embed are ordinary notes
  and are not removed by a revert.
<!-- /ANCHOR:enhanced-rollback -->

---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Phase 1   │────►│   Phase 2   │────►│   Phase 3   │
│  Questions  │     │ Three legs  │     │   Verify    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  Phase 2b   │
                    │ phone flows │
                    │  (needs 044)│
                    └─────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Host layout answer (T002) | None | A yes/no on full-bleed, measured against real Obsidian | Chrome, width |
| ADR-001 (T003) | None | The write model for embeds | Capability gates |
| Chrome + width | T002 | An embed dressed like the view | Verification |
| Capability gates | ADR-001 | The affordance set REQ-003 names | Verification |
| Move | Block serialiser | A relocated block | Verification |
| Create | Block serialiser | A block written from a picker | Verification |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **T002 host layout answer** - 2-3 hours - CRITICAL. Everything visual waits on it, and a wrong
   assumption here is a rewrite rather than a fix.
2. **T004-T005 chrome and width** - 6-8 hours - CRITICAL. This is the operator's actual complaint.
3. **T009-T010 capture pair and round trip** - 3-4 hours - CRITICAL. Without them the parity claim
   is one screenshot.

**Total Critical Path**: 11-15 hours.

**Parallel Opportunities**:
- ADR-001 (T003) is written while T002 runs; neither needs the other.
- The move (T007) and create (T008) legs are independent of the chrome leg and of each other.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Questions answered | T002 has a measured yes/no on full-bleed; ADR-001 is Accepted | Before any code |
| M2 | Embed reads as the database | SC-001 and SC-002 met on a captured pair at both widths | Chrome leg |
| M3 | No clipboard | SC-003 and SC-004 met; the 16-row round trip is green | Move and create legs |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

The decisions themselves live in `decision-record.md`, which is the document this section points at
rather than duplicates. ADR-001 (may an embed write?) is a precondition for REQ-003 and REQ-004 and
must be Accepted before the capability leg starts.

---
