---
title: "Goal: List View Deprecation"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "006 list deprecation goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation"
    last_updated_at: "2026-09-05T02:45:00Z"
    last_updated_by: "phase-007-landing"
    recent_action: "007 landed: renderer and measurement surface removed, gate 24/24 green"
    next_safe_action: "Proceed to 008-docs-and-release; T010 (styles.css) stays deferred"
    blockers:
      - "One operator report against a released 006 build is still unconfirmed. 007 ran and landed without it (recorded in 007/tasks.md T001), so this is now a gap behind the work rather than a gate in front of it."
    key_files:
      - "spec.md"
      - "plan.md"
      - "superseded-clickup-direction.md"
      - "005-usage-and-migration-audit/implementation-summary.md"
      - "006-hide-and-migrate/implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-deprecation-goal"
      parent_session_id: null
    completion_pct: 71
    open_questions: []
    answered_questions:
      - "Route B is superseded; the operator retired the view rather than converting it"
      - "005's audit ran: table confirmed via column-width.ts's shared getFieldWidth; the per-group create button is not a loss (table's version is the styled one); the picker is not the only list-minting surface — the settings-load sanitizer and the .base importer mint it too"
      - "Does list leave DatabaseViewType, or stay accepted-but-redirected like gallery? 007 decided (ADR-001, Accepted): stays accepted-but-redirected, migrated permanently"
      - "Do stacked titles and listCompactFields map to table, or are they a declared loss? Declared losses, per 005; listCompactFields removed from ViewConfig/i18n/the config panel by 007"
---
# Goal: List View Deprecation

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Retire the list view: nobody can reach it, every database already using it opens as a
table with the same columns, and nothing in the gate still measures it.

### Binding

**Read the child goal before working a phase.** Each is authoritative for its
phase and binds as if written here.

| Phase | Goal document |
|-------|---------------|
| 005-usage-and-migration-audit | `005-usage-and-migration-audit/goal.md` |
| 006-hide-and-migrate | `006-hide-and-migrate/goal.md` |
| 007-remove-renderer-and-harness | `007-remove-renderer-and-harness/goal.md` |
| 008-docs-and-release | `008-docs-and-release/goal.md` |

**Precedence.** Decisions below outrank child detail; child detail outranks any
summary of it. Name a conflict rather than resolving it silently.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The list view is retired, not improved.** The operator's words on 2026-09-04: *"Also deprecate list view completely"*. That supersedes the ClickUp direction outright rather than amending it. |
| D2 | Order is withdraw, then migrate, then remove — `030-gallery-view-deprecation`'s pattern. `viewType` is a persisted union written into vault files, so deleting the value before migrating strands every database already using it. |
| D3 | The migration target is **table with the same columns**. The list already derives its tracks from the table's column widths, so a migrated view keeps its column set rather than acquiring a new one. |
| D4 | The renderer and every measurement of it come out together: the `list-window` gate lane, its harness and ratchet, the fixtures and constructed scenarios, the bench entry, the replay claims and the unit specs. A gate still measuring a removed view is a false green, which is worse than no measurement. |
| D5 | `card-field-renderer.ts` is **not** the list's to delete. The board and gallery cards use it; only the list's use is removed. |
| D6 | The superseded children `000`-`004` and the superseded root documents are marked, not deleted. They are the record of why the direction changed, and the ClickUp interaction study inside them is real work. |
| D7 | New children are numbered from `005`. Reusing `001`-`004` would make every inbound reference ambiguous, including the ones that cite `000-grid-contract-and-list-harness/plan.md` by path from `005`'s research. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Three to seven bullets, each checkable without opening another file.

- [x] No surface offers list as a choice. **Shipped by `006-hide-and-migrate`** —
      `getViewTypeOptions` (`toolbar-renderer.ts`), the view-config panel, and the add-view fixture
      all filter `list` alongside `gallery`, with the `current` escape hatch for a view already
      configured as one.
- [x] A vault carrying a list-configured view opens it as a table with the same columns, once, with
      a notice. **Shipped by `006-hide-and-migrate`** — `src/data/list-migration.ts`, run on open in
      both hosts (`database-view.ts`, `embedded-database-renderer.ts`), notice in three locales.
- [x] `src/views/list-renderer.ts` is gone. **Done 2026-09-05** by `007-remove-renderer-and-harness`
      (`ba2acf7d`) — was 1,173 lines.
- [x] The `list-window` gate lane is **removed, not skipped**, and `npm run gate` exits 0 read from
      `$?`. **Done**: the lane list is 24 names, `list-window` is not one of them, `$?` is `0`.
- [x] `renderer-coverage.json` carries the new floor with the reason beside the number. **Done**:
      `"constructed": 6, "total": 21, "note": "was 7/22; list renderer retired"`.
- [x] `033-list-virtualisation` and `024-list-view-freeze` are closed against this decision rather
      than left open against a view that no longer exists. **Done**: both `spec.md`s read superseded
      2026-09-05, each keeping its own historical measurement as evidence rather than deleting it.
- [ ] **The operator opens a vault that had a list view and reports it as migrated rather than
      broken.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Direction converted | Done | Operator 2026-09-04: *"Also deprecate list view completely"*, *"Convert old clickup list spec to multi phase list deprecation spec"* |
| Folder renamed | Done | `git mv specs/006-list-view-clickup specs/006-list-view-deprecation`, 47 files moved with history preserved |
| ClickUp direction preserved | Done | `superseded-clickup-direction.md`, `git mv` from the old `spec.md`; `decision-record.md` untouched |
| Four deprecation children opened | Done | `005`-`008` |
| Usage audit | Done | `005-usage-and-migration-audit/implementation-summary.md` — migration target confirmed, 4 declared losses, measurement surface enumerated, 2 open questions answered with recommended defaults |
| Hide and migrate | Shipped + verified, operator confirmation open | `006-hide-and-migrate/implementation-summary.md` — list withdrawn from every picker and switcher, migration on open with a locale-complete notice, `npm run gate` 25/25 green; open item is one operator report against a released build |
| Remove renderer and harness | Landed, one deferral | `007-remove-renderer-and-harness/implementation-summary.md` — `list-renderer.ts` and its whole measurement surface (lane, harness, ratchet pins, fixtures, constructed scenarios, replay claims, unit specs) removed together; `list` stays on `DatabaseViewType`, migrated permanently (ADR-001); `npm run gate` 24/24 green (the lane count dropped from 25 with `list-window` gone). `styles.css`'s now-dead `db-list-*` rules deferred to a follow-up (T010). The parent's own operator-report precondition above was still unconfirmed when this phase ran — recorded as a gap in `007/tasks.md` T001, not treated as cleared. |

### Deviations and findings

| Item | Note |
|------|------|
| Children numbered from `005`, not `001` | The brief suggested `001`-`004`. Those numbers are taken by superseded children that inbound references cite by path — `005`'s `007-architecture-research/harvest.md` names `000-grid-contract-and-list-harness/plan.md` directly. Reusing them would silently repoint those citations at different documents. |
| Five superseded children, not three | The brief named three. There are five: `000-grid-contract-and-list-harness` and `004-mobile-and-live-verification` belong to the same direction and are marked the same way. |
| The old `spec.md` was preserved rather than rewritten in place | It carried a twenty-screen ClickUp interaction study and a measured feature diff. Overwriting it would have lost real work, so it moved to `superseded-clickup-direction.md` by `git mv` and the new `spec.md` cites it. |
| `030`'s own deprecation is unfinished | `renderer-coverage.json` still pins `gallery-renderer.ts`, and `toolbar-renderer.ts` still renders gallery when a view already is one. That is the precedent working as designed — withdrawal without deletion — and it is also a reminder that this packet's `007` is the step that actually removes anything. |
| `005` found two more list-minting surfaces than this document named | The settings-load sanitizer (`main.ts:142,178`) and the `.base` file importer (`main.ts:1544-1585`) both accept or mint `viewType: "list"` independently of the view picker. `006`'s REQ-002 ("no surface offers list as a choice") needs to account for all three, not just the picker. |
| The embedded-codeblock migration gap is inherited from `030`, not introduced by this packet | `gallery-migration.ts` is called only from `database-view.ts`'s `refresh()`; `embedded-database-renderer.ts` has no equivalent call and would still render a list-configured codeblock through `ListRenderer` unmigrated. `006` decides whether to close this for `list` or accept the same partial state the gallery already ships with. |
| `007` found a harness regression its own removal introduced, not a surface `005` missed | Re-pointing `render-assertion-harness.ts`'s shared column/row builders from the deleted list bench to the table bench exposed that the two benches' `makeConfig` build differently-shaped `ViewConfig`s (only one carries `schema.columns`), blanking every constructed filter/sort/active-rule/summary scenario's field selector. `npm run gate`'s own `render-assertions` lane never exercises those renderer branches, so only the full screenshot capture caught it. Fixed at the source in `table-render-bench.ts`. |
<!-- /ANCHOR:log -->
