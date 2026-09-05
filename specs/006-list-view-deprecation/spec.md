---
title: "Feature Specification: List View Deprecation"
description: "The operator retired the list view outright on 2026-09-04, replacing the ClickUp direction this packet was built for. Phase parent for the retirement: audit what uses list, migrate it to table, remove the renderer and its harness surface, then document and release."
trigger_phrases:
  - "list view deprecation"
  - "deprecate list view"
  - "retire list view"
  - "006 list deprecation"
  - "list migration to table"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation"
    last_updated_at: "2026-09-05T02:45:00Z"
    last_updated_by: "phase-007-landing"
    recent_action: "007 landed: renderer and measurement surface removed, gate 24/24 green"
    next_safe_action: "Proceed to 008-docs-and-release; T010 (styles.css) stays deferred"
    blockers:
      - "007 ran and landed without the operator report this line names. The report itself is still unconfirmed anywhere in this tree; 007/tasks.md T001 records that gap rather than treating it as cleared."
    key_files:
      - "spec.md"
      - "superseded-clickup-direction.md"
      - "decision-record.md"
      - "005-usage-and-migration-audit/implementation-summary.md"
      - "006-hide-and-migrate/implementation-summary.md"
      - "007-remove-renderer-and-harness/implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-deprecation-006"
      parent_session_id: null
    completion_pct: 71
    open_questions: []
    answered_questions:
      - "Route B (list as a presentation mode of the grid) is superseded. The operator retired the view instead."
      - "The ClickUp children are kept as superseded history, not deleted."
      - "Does list stay an accepted-but-redirected value in DatabaseViewType, or leave the union? 007 decided (ADR-001, Accepted): stays, migrated permanently."
      - "Do stacked titles and listCompactFields have a table equivalent, or are they a declared loss? Declared losses; listCompactFields removed by 007."
---
# Feature Specification: List View Deprecation

> **This packet changed direction on 2026-09-04.** It was
> [`superseded-clickup-direction.md`](superseded-clickup-direction.md) — the list view rebuilt as a
> ClickUp-style grid — until the operator said *"Also deprecate list view completely"*. The old
> direction and its decision records are kept as history; none of them binds. The five children
> numbered `000` through `004` belong to that direction and are marked superseded in place.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

The list view is being retired, not improved. The precedent is
[`../005-component-surface-system/030-gallery-view-deprecation/`](../005-component-surface-system/030-gallery-view-deprecation/),
which retired the gallery in four moves: stop offering it, migrate what exists, remove the renderer
and everything that measured it, and lower the coverage ratchet deliberately rather than as a side
effect. This packet follows that shape with one difference the gallery did not have — the list is
measured by a gate lane of its own (`list-window`), and two `005` phases were built specifically to
fix it.

`030` also left a usable pattern for the hardest part. `viewType` is a persisted union written into
vault files, so deleting the value strands every database already configured with it. The gallery's
answer was to **withdraw the value from the pickers while keeping it renderable**, then migrate on
open (`toolbar-renderer.ts:1297-1308`, `src/data/gallery-migration.ts`). This packet reuses it, with
`table` as the migration target rather than `board`.

**Key decisions**: the migration target is the table with the same columns, chosen because the list
already derives its tracks from the table's column widths, so a migrated view keeps its column set
rather than acquiring a new one. Whether `list` leaves the type union or stays as an
accepted-but-redirected value is `007`'s to decide against the same evidence the gallery had.

**Critical dependencies**: `styles.css` is a single serialized lane; `033-list-virtualisation` and
`024-list-view-freeze` become moot and must be closed rather than silently abandoned;
`044-phone-sheet-alignment` asserts that **List view** has left the Add view picker, and this packet
performs the removal it asserts.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | `specs/006-list-view-deprecation/` |
| **Level** | 3 (Full) — `recommend-level.sh --loc 1800 --files 26 --architectural --db` returned 80/100, confidence 94% |
| **Phase decomposition** | Qualifies, both thresholds met independently: phase complexity **30/50** against a threshold of 25, and documentation level **3** against a threshold of 3. The script's suggested count at 30 is 2; four children are used because the deprecation has four distinct stopping points, and the count is the author's call under `phase-definitions.md` §2 |
| **Status** | In progress — `005` (audit) complete, `006` (hide and migrate) shipped + verified with operator confirmation open, `007` (remove renderer and harness) landed with `styles.css`'s list rules deferred (T010), `008` (docs and release) not started |
| **Primary source** | `src/views/list-renderer.ts` (1,173 lines), `src/views/card-field-renderer.ts` (349), `src/data/types.ts:317` (the persisted union), `tools/live/list-window.mjs` (a gate lane) |
| **Precedent** | `../005-component-surface-system/030-gallery-view-deprecation/` |
| **Superseded direction** | [`superseded-clickup-direction.md`](superseded-clickup-direction.md), children `000`-`004` |
| **Blocked by** | Nothing |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

**The list view is being retired on operator instruction, and the retirement has to be done rather than declared.**

The operator's words, 2026-09-04: *"Also deprecate list view completely"*, and in the same pass
*"Convert old clickup list spec to multi phase list deprecation spec"*. That supersedes the ClickUp
direction outright; it does not amend it.

Four measured facts fix the size of the retirement. All read from the tree at `c6b5f11`.

1. **`list` is a persisted union value.** `src/data/types.ts:317` declares
   `DatabaseViewType = "table" | "board" | "gallery" | "list" | "chart" | "calendar" | "timeline"`,
   and a view config carrying `viewType: "list"` is written into vault files. Deleting the value
   without a migration strands every database already using it — the exact problem `030` hit with
   `gallery` and solved by withdrawing rather than deleting.
2. **The list has a renderer and a second cell pipeline.** `src/views/list-renderer.ts` is 1,173
   lines and renders through `src/views/card-field-renderer.ts` (349 lines) rather than
   `cell-renderer.ts`. `card-field-renderer.ts` is **shared with the board and gallery cards**, so
   it is not the list's to delete — `007` must separate the two.
3. **The list is measured by a gate lane of its own.** `tools/gate.mjs:89` runs
   `tools/live/list-window.mjs`, backed by `list-window-harness.ts` and ratcheted through
   `tools/live/list-window.json`. There are also list fixtures in `tools/screenshots/scenarios.mjs`,
   constructed scenarios in `constructed-scenarios.mjs` (`list`, `list-sparse`), a
   `tools/bench/list-render-bench.ts` entry in `renderer-coverage.json`, replay claims in
   `tools/live/replay.mjs`, and three unit specs (`list-reservation.test.ts`,
   `list-row-contracts.test.ts`, plus list assertions inside shared specs). Removing the renderer
   without removing these leaves a gate measuring a view that is gone.
4. **Two `005` phases exist to fix the list and are now moot.** `033-list-virtualisation` and
   `024-list-view-freeze` were opened against list-specific defects. `024`'s own AC-6 already reads
   NOT MET and its exit signal was reassigned to `028-remaining-freezes`. Neither should quietly
   rot; both need closing against this decision, with the reason recorded where a reader will find
   it.

**Purpose.** Remove the list view from the plugin so that no user can reach it, no existing database
breaks, and nothing in the gate still measures it.

<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In scope

- Every surface that offers `list` as a choice: the view picker, the Add view sheet, the view
  switcher, and any menu.
- The migration path for databases already configured as a list, to `table` with the same columns.
- `src/views/list-renderer.ts` and the list's share of `card-field-renderer.ts`.
- The list's measurement surface: the `list-window` gate lane and its ratchet, list fixtures and
  constructed scenarios, the list bench and its `renderer-coverage` entry, list replay claims, list
  unit specs, and the captures that photograph any of them.
- The renderer-coverage ratchet's new floor, lowered deliberately with the reason recorded beside
  the number — `030`'s REQ-004, restated here because the same trap applies.
- Closing `033-list-virtualisation` and `024-list-view-freeze` against this decision.
- README, changelog and the release that carries the removal.

### Out of scope

- Table, board, calendar, timeline and chart views, except where a shared symbol is touched and the
  touch is enumerated before it is made.
- `card-field-renderer.ts` as a whole. The board and gallery cards use it; only the list's use is
  removed.
- The gallery's own deprecation. `030` owns it, it is at a different stage, and the two must not be
  bundled into one release.
- Any new table capability to compensate for a list feature. If a list affordance has no table
  equivalent, it is a declared loss recorded in `005`'s audit, not a table feature request.
- Re-opening the ClickUp direction.

### Frozen boundary

`SCOPE LOCK` applies. A child that finds a defect outside this list — including in the table it
migrates to — records it and does not fix it.

<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A database already configured as a list opens without error after the upgrade, on the migration path `005-usage-and-migration-audit` establishes and `006-hide-and-migrate` implements. No vault file is left unreadable by an older build. |
| REQ-002 | No surface offers list as a choice: not the view picker, not the Add view sheet, not the view switcher, not any menu. `044-phone-sheet-alignment` asserts the Add view picker's half of this; the removal itself is `006-hide-and-migrate`'s. |
| REQ-003 | The list renderer, its bench, its `list-window` gate lane and harness, its fixtures and constructed scenarios, its replay claims and its unit specs are removed together, not piecemeal. A gate that still measures a removed view is a false green. |
| REQ-004 | The renderer-coverage ratchet is lowered to its new floor deliberately, with the reason recorded beside the number. The ratchet fails closed on a decrease, which is what makes an accidental drop visible and a deliberate one a decision. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | A migrated view carries the same column set it had as a list. The list already derives its tracks from the table's column widths, so this is a preservation, not a mapping. |
| REQ-006 | The one-time migration notice is written in three locales, matching how every other user-facing string in this plugin ships. |
| REQ-007 | `033-list-virtualisation` and `024-list-view-freeze` are closed against this decision with the reason recorded in each, rather than left open against a view that no longer exists. |
| REQ-008 | The five superseded children (`000`-`004`) and the superseded root documents keep their content. They are marked, not deleted: the ClickUp interaction study and the ADRs are the record of why the direction changed. |
| REQ-009 | No spec path, phase number, task id or requirement id appears in any code comment this packet writes. |

<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: a vault carrying a list-configured view opens it after the upgrade and lands on a table
  with the same columns, with a one-time notice.
- **SC-002**: `rg -n '"list"' src/data/types.ts` and the picker surfaces agree with the decision `007`
  takes about the union value — no surface offers what the union forbids, and none forbids what a
  saved file still contains.
- **SC-003**: `npm run gate` exits 0 from the final state, read from `$?` rather than through a pipe,
  with the `list-window` lane removed rather than skipped.
- **SC-004**: `renderer-coverage.json` records the new floor with the reason beside it.
- **SC-005**: the operator opens a vault that had a list view and reports it as migrated rather than
  broken.
<!-- /ANCHOR:success-criteria -->

---

## PHASE DOCUMENTATION MAP

> This packet uses phased decomposition. Each phase is an independently executable child spec
> folder. Children `000`-`004` belong to the **superseded** ClickUp direction and are kept as
> history; children `005`-`008` are the deprecation.
>
> **The new children are numbered from `005`, not from `001`.** The lower numbers are taken by the
> superseded children, and reusing them would make every inbound reference ambiguous — including the
> ones in `../005-component-surface-system/007-architecture-research/harvest.md`, which cites
> `000-grid-contract-and-list-harness/plan.md` by path.

| Phase | Folder | Focus | Status |
|---|---|---|---|
| — | `000-grid-contract-and-list-harness/` | Grid contract and list harness for the ClickUp conversion | **Superseded 2026-09-04** — kept as history |
| — | `001-list-grid-structure/` | The list rebuilt on the grid's DOM | **Superseded 2026-09-04** — kept as history |
| — | `002-clickup-chrome/` | ClickUp's list chrome | **Superseded 2026-09-04** — kept as history |
| — | `003-group-affordances-and-selection/` | Per-group add affordance and selection semantics | **Superseded 2026-09-04** — kept as history |
| — | `004-mobile-and-live-verification/` | Phone presentation and live verification of the converted list | **Superseded 2026-09-04** — kept as history |
| 1 | `005-usage-and-migration-audit/` | Which vaults and views use list; what the migration target must preserve; the data-loss check | **Complete** — Level 1 |
| 2 | `006-hide-and-migrate/` | Remove list from the pickers and the switcher; migrate existing list views to table with a one-time notice, in three locales | **Shipped + verified, operator confirmation open** — Level 1 |
| 3 | `007-remove-renderer-and-harness/` | Delete the renderer, the `list-window` lane, the fixtures and constructed scenarios, the bench and the replay claims; re-baseline the ratchets; prune the captures | Draft — Level 3 |
| 4 | `008-docs-and-release/` | README, changelog, and the release that carries the removal | Draft — Level 1 |

### Phase Transition Rules

- Each phase MUST pass `validate.sh <child> --strict` independently before the next begins.
- The order is `005 → 006 → 007 → 008` and it is not negotiable: removing a renderer before knowing
  what uses it, or before existing views have somewhere to go, is how a deprecation becomes a data
  loss.
- `006` may ship on its own. Withdrawing the value and migrating is reversible by deleting one
  filter; `007` is not reversible in the same sense, and should not ride the same release.
- The superseded children `000`-`004` are not validated as part of the deprecation's progress. They
  are history, and their criteria describe a direction that no longer exists.

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|---|---|---|---|
| — | `005` | Nothing; it runs first and it is read-only | n/a |
| `005` | `006` | The migration target is decided and the data-loss check has run, so the migration knows what it preserves and what it drops | `005`'s audit output |
| `006` | `007` | Existing list views migrate and no surface offers list, on a released build | `006`'s criteria plus one operator report |
| `007` | `008` | The renderer and every measurement of it are gone together, and `npm run gate` exits 0 with the lane removed rather than skipped | `007`'s criteria, `$?` read directly |

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | A vault file carrying `viewType: "list"` is opened by a build that no longer knows the value | H — the database will not open | `030`'s pattern: withdraw from pickers, keep renderable, migrate on open. `007` decides the union's fate only after `006` has shipped and migrated |
| Risk | `card-field-renderer.ts` is deleted with the list | H — the board and gallery cards use it | REQ-003's "together, not piecemeal" is about the list's own surface; the shared renderer is explicitly out of scope |
| Risk | The coverage ratchet drops silently | M | REQ-004, taken directly from `030`'s REQ-004, which exists because this trap already caught that packet |
| Risk | `list-window` is skipped rather than removed | M — a skipped lane reads as green forever | SC-003 says removed, not skipped, and the lane count in `tools/gate.mjs` is the evidence |
| Risk | A list affordance has no table equivalent and users lose it silently | M | `005`'s data-loss check names every one, and a loss is declared rather than discovered |
| Dependency | `styles.css` serialized lane | Med | `007` takes it once and releases once |
| Dependency | `044-phone-sheet-alignment` | Low | `044` asserts the Add view picker's absence; `006` performs the removal. Neither blocks the other's start |
| Dependency | `033-list-virtualisation`, `024-list-view-freeze` | Low | REQ-007 closes both against this decision |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: removing the list renderer must not change the table's render cost. The table is what
  migrated views land on, and a regression there converts a deprecation into a defect.
- **NFR-P02**: the migration runs once per view on open, not per render.

### Security
- **NFR-S01**: N/A. No auth surface.
- **NFR-S02**: the migration rewrites view config in vault files. Every write goes through the
  existing config-mutation path; none constructs a path from unvalidated config content.

### Reliability
- **NFR-R01**: a view whose migration fails opens as it did before rather than as an error, and the
  failure is reported once rather than per render.
- **NFR-R02**: the migration is idempotent. A view migrated twice is a view migrated once.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Empty input: a list view with no columns migrates to an empty table rather than refusing.
- Maximum length: a list view with more columns than the table's default width budget keeps every
  column; widths are already shared, so nothing needs re-deriving.
- Invalid format: a config carrying `viewType: "list"` with a corrupt column set falls back to the
  database's schema order, the same fallback the table already uses.

### Error Scenarios
- External service failure: N/A.
- Network timeout: N/A.
- Concurrent access: two views over one database migrating at once — the existing
  `ViewConfigMutation` `sourceInstanceId` guard applies, and the migration must not bypass it.

### State Transitions
- Partial completion: a migration interrupted mid-write leaves the view as a list, which still
  renders while `006` is the shipped state.
- Session expiry: N/A.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 22/25 | Files: ~26, LOC: ~1,800, Systems: renderer, persisted union, gate lanes, fixtures, benches, docs |
| Risk | 20/25 | Auth: N, API: N, Breaking: Y — a persisted union value and a migration that rewrites vault files |
| Research | 12/20 | The usage audit is a real investigation; the precedent is already read |
| Multi-Agent | 12/15 | Four children with a strict order |
| Coordination | 14/15 | The CSS lane, `044`'s assertion, two moot phases to close, one release |
| **Total** | **80/100** | **Level 3** |
<!-- /ANCHOR:complexity -->

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | A saved list view is stranded by removing the union value too early | H | M | `030`'s withdraw-then-migrate order; `007` decides the union only after `006` has shipped |
| R-002 | The shared card-field renderer is deleted with the list | H | L | Named out of scope; `007` separates the list's use from the board's and gallery's |
| R-003 | The coverage ratchet drops as a side effect | M | M | REQ-004 makes lowering it an explicit act with the reason beside the number |
| R-004 | `list-window` is skipped instead of removed and reads green forever | M | M | SC-003 requires removal, and the lane count in `tools/gate.mjs` is the evidence |
| R-005 | The migration silently drops a list-only affordance | M | M | `005`'s data-loss check enumerates them; a loss is declared |
| R-006 | `006` and `007` ship in one release and a rollback has to undo both | M | M | The transition rules say `006` may ship alone and `007` should not ride with it |

---

## 11. USER STORIES

### US-001: A vault that used the list keeps working (Priority: P0)

**As a** vault owner with a list-configured view, **I want** it to open after the upgrade, **so that**
retiring a view I was not using heavily does not cost me the database I was.

**Acceptance criteria:** see `acceptance-criteria.md` in each child (rows referencing this story).

---

### US-002: The gate stops measuring a view that is gone (Priority: P1)

**As a** maintainer, **I want** the list's lane, fixtures, bench and claims removed with the
renderer, **so that** a green gate means the shipped product passed rather than that a removed view
still has a passing test.

**Acceptance criteria:** see `007-remove-renderer-and-harness/acceptance-criteria.md`.

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- Does `list` leave `DatabaseViewType`, or stay as an accepted-but-redirected value the way `gallery`
  currently does? `007` decides, against the same evidence `030` had, and after `006` has shipped.
- Do the list's own affordances — the stacked title reading mode, `listCompactFields`, the per-group
  create button — have a table equivalent, or are they a declared loss? `005` answers with an
  enumeration, not an opinion.
- Should the gallery's withdrawal and the list's removal ship together? They are two deprecations at
  different stages, and bundling them makes one rollback undo both. Recorded, not decided.
- What happens to `033-list-virtualisation`'s measured work? It shipped real improvements to a view
  being removed. Closing it is right; deleting the measurements would lose the evidence that the
  freeze was real.

### Answered

- **Route B — the list becomes a presentation mode of the grid.** Superseded 2026-09-04. The operator
  retired the view instead. The decision is kept in [`decision-record.md`](decision-record.md)
  because it explains what the five superseded children were built for.
- **Do the ClickUp children get deleted?** No. They are marked superseded in place. Deleting them
  would remove the only record of why the direction changed.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Superseded direction**: [`superseded-clickup-direction.md`](superseded-clickup-direction.md)
- **Decisions, including the superseded ones**: [`decision-record.md`](decision-record.md)
- **Implementation Plan**: [`plan.md`](plan.md)
- **Durable directive**: [`goal.md`](goal.md)
- **Precedent**: [`../005-component-surface-system/030-gallery-view-deprecation/`](../005-component-surface-system/030-gallery-view-deprecation/)

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder.
> All implementation details (plan, tasks, verification, decisions, continuity) live inside the
> phase children. **This anchored table is scaffold-appended**; the reader-facing map with the
> superseded ClickUp children is the hand-authored one above, and the same rows are carried in both
> so neither goes stale alone.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 5 | 005-usage-and-migration-audit/ | Which vaults and views use list; the migration target and what it preserves; the data-loss check | **Complete** — Level 1 (`recommend-level.sh` 24/100, floored to the packet minimum) |
| 6 | 006-hide-and-migrate/ | Withdraw list from every picker and switcher; migrate existing list views to table with a one-time notice in three locales | **Shipped + verified, operator confirmation open** — Level 1 (39/100) |
| 7 | 007-remove-renderer-and-harness/ | Delete the renderer, the `list-window` lane and harness, the fixtures and constructed scenarios, the bench entry and the replay claims; re-baseline the ratchets; prune the captures | Draft — Level 3 (72/100) |
| 8 | 008-docs-and-release/ | README, changelog, and the release that carries the removal | Draft — Level 1 (18/100, floored) |

**Children `000`-`004` are not in this table.** They belong to the superseded ClickUp direction and
are listed in the hand-authored map above, which is where their status is recorded.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 004-mobile-and-live-verification | 005-usage-and-migration-audit | None — `004` is superseded and gates nothing. `005` opens the deprecation | n/a |
| 005-usage-and-migration-audit | 006-hide-and-migrate | The migration target is decided and the data-loss check has run, so the migration knows what it preserves and what it drops | `005`'s audit output |
| 006-hide-and-migrate | 007-remove-renderer-and-harness | Existing list views migrate and no surface offers list, on a released build. `007` is the irreversible step and does not start before `006` has shipped | `006`'s criteria plus one operator report |
| 007-remove-renderer-and-harness | 008-docs-and-release | The renderer and every measurement of it are gone together, and `npm run gate` exits 0 with the `list-window` lane removed rather than skipped | `007`'s criteria, `$?` read directly |
<!-- /ANCHOR:phase-map -->
