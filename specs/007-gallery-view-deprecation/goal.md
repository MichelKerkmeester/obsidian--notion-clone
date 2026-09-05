---
title: "Goal: Gallery View Deprecation"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "007 gallery deprecation goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation"
    last_updated_at: "2026-09-05T06:45:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the durable directive from the operator's retire-the-gallery ruling"
    next_safe_action: "Run child 001-usage-and-migration-audit; remove nothing before it reports"
    blockers:
      - "Nothing is removable until 001's audit says what a live vault holds"
      - "003 must not start until 002's migration has SHIPPED, not merely merged"
    key_files:
      - "spec.md"
      - "roadmap.md"
      - "001-usage-and-migration-audit/goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-view-deprecation-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does gallery leave DatabaseViewType, or stay accepted-but-redirected as list did?"
      - "Does the embedded codeblock host migrate, or inherit 030's partial state?"
    answered_questions:
      - "The operator retired the gallery: 'should have been deprecated'"
      - "The migration target is board: it is the other cover-drawing surface"
---
# Goal: Gallery View Deprecation

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Retire the gallery view: nothing can mint one, every database already using it opens
as a board with the same cover, and nothing in the gate still measures it.

### Binding

**Read the child goal before working a phase.** Each is authoritative for its
phase and binds as if written here.

| Phase | Goal document |
|-------|---------------|
| 001-usage-and-migration-audit | `001-usage-and-migration-audit/goal.md` |
| 002-settings-redirect-and-migrate | `002-settings-redirect-and-migrate/goal.md` |
| 003-remove-renderer-and-harness | `003-remove-renderer-and-harness/goal.md` |
| 004-docs-and-release | `004-docs-and-release/goal.md` |

**Precedence.** Decisions below outrank child detail; child detail outranks any
summary of it, including a roadmap row. Name a conflict rather than resolving it
silently. An agent never ticks an operator row.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The gallery is retired, not improved.** The operator's words on 2026-09-05: *"should have been deprecated"*, with the instruction to retire it completely the way the list view is being retired. |
| D2 | Order is withdraw, then migrate, then remove — `030-gallery-view-deprecation`'s own pattern, and `006-list-view-deprecation`'s. `viewType` is a persisted union written into vault files, so deleting the value before migrating strands every database already using it. **The withdrawal half is already done** by `030`; this packet starts at the surfaces `030` left open. |
| D3 | The migration target is **board with the same cover image**, not table. `gallery-migration.ts` already says why in its own header: the board is the only other surface that draws a cover, and it reads `boardImageField` through the same `resolveCoverImage` call the gallery makes with `galleryImageField`. A gallery becoming a table is a card grid becoming a spreadsheet with no warning. |
| D4 | The renderer and every measurement of it come out together: `gallery-renderer.ts`, the bench and its driver, the `renderer-coverage.json` pins, the constructed scenario, the capture manifest entries, the placement checks and the unit specs. A gate still measuring a removed view is a false green, which is worse than no measurement. |
| D5 | `card-field-renderer.ts` is **not** the gallery's to delete. The board uses it, and `045-board-card-properties` builds its card field list on it. Only the gallery's use is removed. |
| D6 | **The dead CSS comes out in this packet.** `006`'s `007-remove-renderer-and-harness` deferred its `db-list-*` sweep as T010 and it is still open. 85 gallery lines in `styles.css` are not deferred here. |
| D7 | `030-gallery-view-deprecation` is a **predecessor, not a parent**. It is not reopened, renumbered, or grown into. Its open rows are closed against this retirement, the way `006`'s REQ-007 closed `033` and `024`. |
| D8 | **`003` does not start until `002` has shipped in a release.** Merged is not shipped. Deleting the renderer while an unmigrated gallery sits in a vault file turns that view into whatever unknown-type coercion does. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] No surface offers gallery as a choice **and no surface mints one**. The two pickers are
      already filtered by `030`, and the `.base` importer was fixed upstream — `main.ts:1577` now
      lands a `cards` view on `board`. **The settings-load sanitizer (`main.ts:146`, `:182`) still
      exempts `gallery` from the unknown-type coercion and must not.**
- [ ] A vault carrying a gallery-configured view opens it as a board with the same cover, once,
      with a notice — in **both** hosts. `applyGalleryMigration` is called only from
      `database-view.ts:11669` today; `embedded-database-renderer.ts` has no equivalent call.
- [ ] `src/views/gallery-renderer.ts` is gone. It is 787 lines today.
- [ ] The gallery's gate surface is **removed, not skipped**, and `npm run gate` exits 0 read from
      `$?`: the bench and its driver, the two `renderer-coverage.json` `inputs` pins, the
      `constructed-gallery` scenario, the gallery-only capture entries, and the unit specs.
- [ ] `renderer-coverage.json` carries the new floor with the reason beside the number, in the same
      idiom `006` used (`"note": "was 7/22; list renderer retired"`).
- [ ] `styles.css` carries no `db-gallery-*` rule. 81 selectors today, and this is not deferred.
- [ ] `030-gallery-view-deprecation`'s open rows read as closed against this retirement rather than
      open against a view that no longer exists.
- [ ] README and CHANGELOG tell a user whose gallery became a board what happened, what it cost, and
      what a rollback does not undo. Every declared loss named individually, not as "some settings".
- [ ] The release ships, carrying the removal.
- [ ] **The operator opens a vault that had a gallery view and reports it as migrated rather than
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
| Packet opened | Done | Operator 2026-09-05: *"should have been deprecated"*, with the instruction to retire the gallery completely the way the list view is being retired. Recorded as `../005-component-surface-system/roadmap.md` §6A and `045/decision-record.md` ADR-001 |
| Level and shape decided | Done | `recommend-level.sh --loc 1800 --files 55 --api --db --architectural` → **Level 3, 90/100, confidence 95%**; phase score **50/50** against a threshold of 25. Both `phase-definitions.md` §2 conditions met independently, so a phased packet with four children rather than four sibling folders |
| Four children opened | Done | `001`-`004`, scaffolded from the contract-backed templates |
| Inventory taken | Done | `spec.md` §4 — 42 `src/` files, 31 `tools/` files, 85 `styles.css` lines, 24 of 546 capture entries, a 787-line renderer. Counted against the tree at `464cd7e3`, not estimated |
| Inventory re-derived after a rebase | Done | The packet was first drafted against `2a7db8cf`; `464cd7e3` landed `046`'s linked-view work underneath it. Every `file:line` in this packet was re-checked against the new tree — line numbers moved in `main.ts`, `database-view.ts`, `toolbar-renderer.ts`, `i18n.ts` and `manifest-schema.mjs`, the `src/` file count went 41 to 42, `styles.css` went 84 to 85, **and one claim turned out to be false**: the `.base` importer no longer mints a gallery |
| Audit | Not started | `001-usage-and-migration-audit` |
| Settings redirect and migrate | Not started | `002-settings-redirect-and-migrate` |
| Remove renderer and harness | Not started | `003-remove-renderer-and-harness` |
| Docs and release | Not started | `004-docs-and-release` |

### Deviations and findings

| Item | Note |
|------|------|
| Children numbered from `001`, not `005` | `006-list-view-deprecation` numbers its deprecation children from `005` because `000`-`004` are superseded ClickUp children that inbound references cite by path. This packet has no superseded children, so `001` is free and the mirror is of the *shape*, not of the numbering. |
| The withdrawal half is already done | `006` had to withdraw the list itself. Here `030` did it in August, so `002` starts at the surfaces `030` left open rather than at the pickers. That is why this packet's second child is a *redirect* rather than a *hide*. |
| Four of the six gallery capture scenarios are shared with the board | `card-cover-states`, `constructed-card-covers`, `chrome-group-selection-controls` and `constructed-group-selection-controls` mount both renderers. A blanket delete would remove board coverage — the single most likely way this packet breaks something, named before it happens rather than after. |
| One minting surface survived `030`'s withdrawal, not two | The settings sanitizer at `main.ts:146`/`:182` still exempts `gallery` from the coercion. The `.base` importer was the other candidate and has **already been fixed upstream**: `main.ts:1577` lands a `cards` view on `board`, and only gallery-named locals remain. This packet's first draft named both on the strength of `006`'s parallel finding and was wrong about one of them — which is the argument for `001` reading the tree rather than inheriting a sibling's list. |
| The embedded-codeblock migration gap is inherited twice over | `030` wired `applyGalleryMigration` into `database-view.ts` only. `006` inherited the same asymmetry for the list, recorded it, and left it to a child. It is `002`'s to close or to ship knowingly. |
| `006` deferred its dead-CSS sweep; this packet does not | `006`'s `007` left `db-list-*` in `styles.css` as T010, still open. D6 refuses the same deferral for `db-gallery-*`. |
<!-- /ANCHOR:log -->
