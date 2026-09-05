---
title: "Feature Specification: Gallery View Deprecation"
description: "Retire the gallery view outright: nothing can mint one, every gallery-configured database opens as a board with its cover intact, and the renderer plus every measurement of it is removed rather than skipped."
trigger_phrases:
  - "gallery view deprecation"
  - "deprecate gallery view"
  - "retire gallery view"
  - "007 gallery deprecation"
  - "gallery migration to board"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation"
    last_updated_at: "2026-09-05T06:40:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Opened the packet from the operator's retire-the-gallery ruling and inventoried it"
    next_safe_action: "Run child 001-usage-and-migration-audit before anything is removed"
    blockers:
      - "Nothing is removable until 001's audit says what a live vault actually holds"
    key_files:
      - "spec.md"
      - "goal.md"
      - "roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-view-deprecation-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does gallery leave DatabaseViewType, or stay accepted-but-redirected as list did?"
      - "Does the embedded codeblock host migrate too, or inherit 030's partial state?"
    answered_questions:
      - "The operator retired the gallery: 'should have been deprecated'"
      - "The migration target is board, not table: board is the other cover-drawing surface"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 3 -->

# Feature Specification: Gallery View Deprecation

> Sibling packet to `../006-list-view-deprecation/`, which retires the list view on the same pattern
> and against the same gate. Predecessor: `../005-component-surface-system/030-gallery-view-deprecation`,
> which performed the withdrawal this packet finishes. `030` is not reopened.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft — opened 2026-09-05, nothing started |
| **Created** | 2026-09-05 |
| **Branch** | `main` |
| **Parent Spec** | None — this is a top-level packet |
| **Parent Packet** | None |
| **Predecessor** | `005-component-surface-system/030-gallery-view-deprecation` (withdrawal) |
| **Successor** | None |
| **Handoff Criteria** | Each child passes `validate.sh --strict` and `npm run gate` exits 0 before the next begins |
| **Complexity** | 90/100, confidence 95% — `recommend-level.sh --loc 1800 --files 55 --api --db --architectural`. Phase score **50/50** against a threshold of 25, and the level is 3 against a threshold of 3, so both `phase-definitions.md` §2 conditions are met independently and this is a phased packet |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The gallery view is **withdrawn but not removed**, and has been since `030-gallery-view-deprecation`
shipped. Nothing new can be made a gallery — `toolbar-renderer.ts:97` and
`view-config-panel-renderer.ts:515` both filter the value out of their pickers unless the view
already is one — and the 787-line renderer, its bench, its coverage pin, its constructed screenshot
scenario and 85 `styles.css` declarations all still ship. On 2026-09-05 the operator settled what
should happen to that half-state, verbatim: **"should have been deprecated"**, and asked for the
gallery to be retired completely, the same way the list view is being retired in
`../006-list-view-deprecation/`.

A withdrawn-but-measured view is the specific failure this program's parent names in its own §2: a
gate that passes while measuring something nobody can reach. `tools/live/renderer-coverage.json`
pins both `src/views/gallery-renderer.ts` and `tools/bench/gallery-render-bench.ts` in its `inputs`,
and the constructed capture set carries a `constructed-gallery` scenario — so every release re-proves
that a surface no user can create still renders correctly.

### Purpose

Finish the retirement: nothing mints a gallery, everything that is one becomes a board with its
cover intact, and the renderer leaves together with every check that measures it — so the gate gets
smaller and stays honest rather than shrinking silently.

> **Phase-parent note:** this `spec.md` is the only authored document at the parent level besides
> `goal.md` and `roadmap.md`. Plans, task breakdowns and decision records live in the child phase
> folders in the Phase Documentation Map below, so the parent cannot drift stale as phases execute.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- An audit of what a live vault actually holds and what a migration would cost, before anything is
  removed — the same first move `006`'s `005-usage-and-migration-audit` made, and it found two
  list-minting surfaces that packet's own spec had not named.
- Closing every remaining path that accepts or mints `viewType: "gallery"`, including the two
  `030` left open: the settings-load sanitizer and the `.base` file importer.
- Migrating gallery-configured views to **board** on open, in both hosts rather than only the one
  `030` wired.
- Removing `src/views/gallery-renderer.ts` and every measurement of it together: the bench, the
  coverage pin, the constructed scenario, the capture entries, the unit specs and the dead CSS.
- Documentation and a release that tells a user whose gallery became a board what happened.

### Out of Scope

- **`src/views/card-field-renderer.ts`** — the board uses it, and `045-board-card-properties`'s
  card field list is built on it. It is not the gallery's to delete. This is the same carve-out
  `006`'s D5 makes for the list.
- **The board's own cover settings.** `view-config-panel-renderer.ts:1843-1845` parameterises one
  cover-settings renderer over `galleryImageField`/`boardImageField` pairs; the board half stays.
- **`030-gallery-view-deprecation` itself.** It performed the withdrawal, it is 4/6 on its own
  `goal.md`, and it is not reopened or renumbered. This packet is its successor, not its revision.
- **Reviving the gallery.** Not a design conversation. The operator retired it.

### Files to Change

Per-phase detail lives in each child's `plan.md`. This is the audit-trail summary.

| File Path | Change Type | Phase | Description |
|-----------|-------------|-------|-------------|
| `src/main.ts` | Modify | `002` | The settings-load sanitizer (`:146`, `:182`) stops exempting `gallery` from the unknown-type coercion. The `.base` importer already lands a `cards` view on `board` (`:1577`); only its gallery-named locals remain |
| `src/data/gallery-migration.ts` | Modify | `002` | Already returns board; gains whatever the audit says it is missing |
| `src/views/embedded-database-renderer.ts` | Modify | `002` | Gains the migration call it has never had — see §6 |
| `src/views/gallery-renderer.ts` | Delete | `003` | 787 lines |
| `tools/bench/gallery-render-bench.ts`, `tools/bench/run-gallery.mjs` | Delete | `003` | 225 + 30 lines |
| `tools/live/renderer-coverage.json` | Modify | `003` | Two `inputs` pins removed; `constructed`/`total` lowered with the reason beside the number |
| `tools/screenshots/constructed-scenarios.mjs`, `tools/screenshots/scenarios/*.mjs` | Modify | `003` | Gallery scenarios removed, not skipped |
| `screenshots/manifest.json` | Modify | `003` | 24 gallery-touching entries |
| `styles.css` | Modify | `003` | 85 gallery references |
| `src/data/types.ts` | Modify | `003` | The union at `:317` and six `gallery*` `ViewConfig` fields at `:562-574`, subject to the §6 union question |
| `src/i18n.ts` | Modify | `003` | 21 gallery keys across three locales |
| `README.md`, `CHANGELOG.md` | Modify | `004` | The user-facing account of the retirement |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:inventory -->
## 4. THE GALLERY INVENTORY, MEASURED

Counted on 2026-09-05 against the working tree at `3a8df24c`, by `grep -ril gallery` per root and
`grep -ic gallery` per file. It is a starting map, not the audit — child `001` owns the audit, and
`006`'s equivalent found surfaces its own spec had missed, which is the reason this list is written
down rather than assumed.

### 4.1 The renderer and its direct support

| File | Mentions | Lines | Note |
|---|---|---|---|
| `src/views/gallery-renderer.ts` | 75 | **787** | The deletion target |
| `src/data/gallery-migration.ts` | 14 | 74 | `030`'s migration. Pure by design — takes a view, returns what to write |
| `src/data/gallery-migration.test.ts` | 44 | 138 | Its unit spec |
| `tools/bench/gallery-render-bench.ts` | 16 | 225 | The bench the constructed scenario renders through |
| `tools/bench/run-gallery.mjs` | 8 | 30 | Its driver |

### 4.2 `src/` — 42 files mention the gallery

The ones that decide behaviour rather than merely name the string:

| File | Mentions | What it holds |
|---|---|---|
| `src/views/database-view.ts` | 60 | `migrateGalleryViewOnOpen()` at `:2711`, called once at `:11663`. The gallery render branch |
| `src/views/view-config-panel-renderer.ts` | 37 | The picker filter (`:510`, `:515`), the gallery-only config section (`:470`), and the shared cover-settings renderer (`:1843-1845`, `:1910-1914`) |
| `src/views/embedded-database-renderer.ts` | 29 | Renders the gallery **and never calls the migration** — see §6 |
| `src/data/data-source.ts` | 28 | Parses the six `gallery*` fields in two places (`:798-803`, `:978-983`), and `parseViewType()` (`:1527-1529`) is a **second accepting surface** `001`'s audit found beyond the sanitizer this table already named — it gates every `viewType` parsed from a `db_view: true` file's frontmatter and accepts `"gallery"` today |
| `src/i18n.ts` | 21 | 21 keys across `en`, `zh-CN` and `zh-TW`, including `notice.galleryMigrated` at `:1456` |
| `src/data/types.ts` | 15 | `DatabaseViewType` at `:317`; `galleryImageField`, `galleryImageAspectRatio`, `galleryCardSize`, `galleryCardSizePreset`, `galleryImageAspectRatioPreset`, `galleryImageFit` at `:562-574` |
| `src/main.ts` | 9 | The settings sanitizer at `:146`/`:182`, which still exempts `gallery` from the unknown-type coercion. The `.base` importer at `:1571-1641` **already lands on `board`** (`:1577`) and keeps gallery-named locals (`:1578`, `:1580`, `:1583`, `:1641`) |
| `src/views/toolbar-renderer.ts` | 6 | `getViewTypeOptions` withdrawal (`:91`, `:97`) and the type icon (`:102`) |
| `src/views/card-field-renderer.ts` | 1 | **Shared with the board. Out of scope** |

The remaining 32 files carry one or two mentions each — mostly a `viewType === "gallery"` branch, a
test fixture name, or a doc comment. `001` enumerates them; this table names the ones that hold a
decision.

**Correction from `001`'s audit (`implementation-summary.md` §7):** `src/settings.ts:79`'s
`DEFAULT_VIEW_TYPES` is a **third already-closed minting surface**, undocumented until the audit
read it — its own comment states "Gallery and list stay out... never offered when creating
something new." It needed no action, the same way the two pickers `030` already closed needed none;
it is named here so the enumeration is complete rather than because it is open.

### 4.3 `tools/` — 31 files mention the gallery

| File | Mentions | What it holds |
|---|---|---|
| `tools/live/render-assertion-harness.ts` | 62 | The constructed-render path for the gallery |
| `tools/live/checkbox-appearance.json` | 63 | Recorded evidence naming gallery fixtures |
| `tools/screenshots/scenarios/core.mjs` | 30 | The `gallery-view` capture scenario |
| `tools/lane/css-lane.json` | 21 | Three entries carry `"phase": "030-gallery-view-deprecation"` |
| `tools/screenshots/scenarios/shared.mjs` | 16 | Card-cover and group-selection scenarios that mount the gallery |
| `tools/live/view-census.json` | 13 | Census output naming the gallery surface |
| `tools/screenshots/constructed-scenarios.mjs` | 12 | `constructedScenario("gallery", …)` at `:237`, plus two shared-card scenarios citing the renderer |
| `tools/live/renderer-coverage.json` | 2 | Pins the renderer and the bench in `inputs`; today `constructed: 6, total: 21` |
| `tools/storybook/verify-placement.mjs` | 6 | Placement checks over gallery surfaces |

### 4.4 Everything else

| Surface | Count | Note |
|---|---|---|
| `styles.css` | **85** lines mention gallery, **81** of them a `db-gallery-*` selector | The dead-CSS sweep `006`'s `007` deferred as its T010. This packet does not defer it |
| `screenshots/manifest.json` | **24** of 546 scenario entries touch the gallery | Six ids × 4 theme/device combinations: `gallery-view`, `constructed-gallery`, `card-cover-states`, `constructed-card-covers`, `chrome-group-selection-controls`, `constructed-group-selection-controls`. **Only two of the six are gallery-only** — the other four mount the gallery *and* the board, so they are edited, not deleted |
| `README.md` | 7 | "Six database views" at `:22`, the screenshot table at `:43-45`, page-preview and cover-settings prose at `:87`, `:120-123` |
| `package.json` | 1 | The plugin `description` names the gallery |

### 4.5 What the inventory already tells us

**Four of the six gallery-touching capture scenarios are shared with the board.** A blanket delete
would remove board coverage. That is the single most likely way this packet breaks something.

**The migration exists and is asymmetric.** `applyGalleryMigration` is called from
`database-view.ts` and from nowhere else. `006`'s own `goal.md` recorded this as inherited from
`030` and left the decision to its `006-hide-and-migrate` child; it is inherited here too, and §6
asks it as a question rather than assuming the answer.

**One minting surface survived the withdrawal, and it is one rather than two.** `main.ts:146` and
`:182` still exempt `gallery` from the coercion that sends every unrecognised `viewType` to `table`,
so a settings load re-blesses the value. The `.base` importer was the other candidate and **it has
already been fixed**: `main.ts:1577` reads `const viewType = bv.type === "cards" ? "board" : "table"`,
and its own comment at `:1571-1576` records why — withdrawing a type from the pickers did nothing
about an importer that kept minting it. What remains there is cosmetic: the locals are still called
`galleryImageField` (`:1578`, `:1580`, `:1583`) and land on `view.boardImageField` (`:1641`).

**That correction is itself the argument for `001`.** This packet's first draft named the importer as
a live minting surface on the strength of `006`'s parallel finding, and it was wrong — the fix landed
upstream between the draft and the rebase. An audit that reads the tree is the difference between
that error being caught in a spec and being carried into a requirement.
<!-- /ANCHOR:inventory -->

---

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder.
> All implementation details (plan, tasks, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | `001-usage-and-migration-audit/` | What a live vault holds, every surface that accepts or mints `gallery`, what a migration to board loses, and what measures the gallery today | Not started |
| 2 | `002-settings-redirect-and-migrate/` | Close the settings sanitizer and the `.base` importer; migrate on open in both hosts, once, with a notice | Not started |
| 3 | `003-remove-renderer-and-harness/` | Delete the renderer, the bench, the coverage pin, the constructed scenario, the capture entries, the unit specs and the dead CSS — together | Not started |
| 4 | `004-docs-and-release/` | README, CHANGELOG and the release that carries the removal | Not started |

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume 007-gallery-view-deprecation/<NNN-phase>/` to resume a specific phase
- Run `validate.sh --recursive` on the parent to validate all phases as an integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| `001-usage-and-migration-audit` | `002-settings-redirect-and-migrate` | Every accepting or minting surface is enumerated, and every declared loss is named individually rather than as "some settings" | `001/implementation-summary.md` lists them; `002`'s REQ set covers each one |
| `002-settings-redirect-and-migrate` | `003-remove-renderer-and-harness` | The migration is **shipped in a release**, not merely merged. Deleting the renderer while a vault still holds an unmigrated gallery turns those views into whatever unknown-type coercion does | A released version number, and `npm run gate` exits 0 on the migration build |
| `003-remove-renderer-and-harness` | `004-docs-and-release` | `gallery-renderer.ts` is absent, `npm run gate` exits 0 read from `$?`, and `renderer-coverage.json`'s new floor carries its reason beside the number | `git log --diff-filter=D`, the gate's own exit status, the JSON diff |
| `004-docs-and-release` | None | README and CHANGELOG name every declared loss individually, and the release ships | The release tag, and the operator opening a migrated vault |
<!-- /ANCHOR:phase-map -->

---

<!-- ANCHOR:requirements -->
## 5. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | No surface offers gallery as a choice, **and no surface mints one** — the two pickers `030` closed, plus the settings sanitizer and the `.base` importer it did not |
| REQ-002 | A vault carrying a gallery-configured view opens it as a **board with the same cover image**, once, with a notice, in **both** hosts |
| REQ-003 | `src/views/gallery-renderer.ts` is deleted, and the bench, coverage pin, constructed scenario, capture entries and unit specs go with it in the same change |
| REQ-004 | `npm run gate` exits 0 read from `$?` after the removal, with the gallery lanes **removed, not skipped** |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | `renderer-coverage.json` carries the new floor **with the reason beside the number**, in the idiom `006` already established (`"note": "was 7/22; list renderer retired"`) |
| REQ-006 | The dead `db-gallery-*` CSS is removed in this packet, not deferred — `006`'s `007` deferred its equivalent as T010 and it is still open |
| REQ-007 | README and CHANGELOG tell a user whose gallery became a board what happened, what it cost, and what a rollback does not undo |
| REQ-008 | `030-gallery-view-deprecation`'s open rows are closed **against this retirement** rather than left open against a view that no longer exists — the move `006`'s REQ-007 makes for `033` and `024` |

> Acceptance criteria live in each child's `acceptance-criteria.md`, which is what decides whether
> that phase may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:questions -->
## 6. OPEN QUESTIONS

- **Does `gallery` leave `DatabaseViewType`, or stay accepted-but-redirected?** `006`'s `007` decided
  this for the list in its ADR-001: `list` **stays** on the union and is migrated permanently, because
  the value is written into vault files and removing it strands anything the migration has not yet
  reached. The same argument applies here and the same answer is the likely one, but it is `003`'s
  ADR to take, not this parent's to assume.
- **Does the embedded codeblock host migrate too?** `applyGalleryMigration` is called only from
  `database-view.ts:11678`. `embedded-database-renderer.ts` renders the gallery and has no
  equivalent call, so a gallery-configured codeblock renders unmigrated today. `006` inherited this
  gap and recorded it; this packet can either close it for the gallery or ship the same partial
  state knowingly. It cannot ship it unknowingly.
- **Do the four shared capture scenarios lose their gallery arm or their whole entry?**
  `card-cover-states`, `constructed-card-covers`, `chrome-group-selection-controls` and
  `constructed-group-selection-controls` each mount the board *and* the gallery. `001` measures what
  board coverage each one contributes before `003` touches any of them.
- **What happens to the six `gallery*` `ViewConfig` fields?** They are persisted, so the same
  strand-the-vault argument as the union question applies. `galleryImageField` in particular is the
  input the migration reads to carry a cover across.
<!-- /ANCHOR:questions -->

---

## 7. AI EXECUTION PROTOCOL

The phase children each carry their own protocol markers in their `plan.md`. This section is the
packet-level one, because a lean phase parent has no `plan.md` to hold it and an agent that opens
this folder first needs to know how to work the packet.

**One note so this is not "fixed" later by breaking something.** `validate.sh`'s `AI_PROTOCOL` rule
reads only `plan.md` and `tasks.md`, so a Level 3 phase parent warns at 0/4 no matter what this
section says. The phase-parent template forbids `plan.md` and `tasks.md` at the parent level, so the
warning is structural rather than a defect: it is a warning, it does not fail the run, and the
correct response is to leave it. Declaring this packet Level 2 would silence it and would also be a
lie — `recommend-level.sh` returns 90/100.

### Pre-Task Checklist

1. Read this `spec.md`, then `goal.md`, then `roadmap.md`. In that order — the decisions bind, the
   roadmap only describes.
2. Read the child's own `goal.md` before working a child. It is authoritative for that phase.
3. Confirm the child's predecessor actually landed. For `003` that means **released**, not merged.
4. Record the failing value before changing anything. A criterion with an empty "today" cell is not
   accepted.

### Execution Rules

| Rule | Requirement |
|------|-------------|
| Order | `001` → `002` → **release** → `003` → `004`. The release between `002` and `003` is parent D8 and is not a formality |
| Scope | Only the files the active child's `spec.md` §3 names. `card-field-renderer.ts` is never one of them |
| Evidence | Every criterion carries a threshold and a failing value observed red before green |
| Exit codes | Read from `$?` directly, never through a pipe |
| Validation | `validate.sh <child> --strict` per child; take the FIRST `RESULT:` line as that folder's verdict |
| Operator rows | An agent never ticks one |

### Status Reporting Format

Report per child, in this shape: the child folder, which acceptance criteria moved and on what
observed evidence, the gate's exit status read from `$?`, and what is still open. Distinguish
confirmed from inferred. A delegate's report is a claim, not a result.

### Blocked Task Protocol

A task marked `[B]` names what unblocks it and who owns that. `003` is blocked on a release cut the
orchestrator owns; `002` and `004` are blocked on their predecessors. When blocked, record the
blocker in the child's `goal.md` continuity `blockers` list and stop — do not work around a
predecessor that has not landed. That workaround is exactly what `006`'s `007` had to record as a
gap behind its own work.

---

## RELATED DOCUMENTS

- **Phase children**: `001-usage-and-migration-audit/`, `002-settings-redirect-and-migrate/`,
  `003-remove-renderer-and-harness/`, `004-docs-and-release/` — each carries its own `spec.md`,
  `plan.md`, `tasks.md`, `goal.md` and `acceptance-criteria.md`
- **Sibling packet**: [`../006-list-view-deprecation/spec.md`](../006-list-view-deprecation/spec.md) —
  the same retirement, one view earlier, and the source of this packet's shape
- **Predecessor phase**: [`../005-component-surface-system/030-gallery-view-deprecation/spec.md`](../005-component-surface-system/030-gallery-view-deprecation/spec.md)
- **The ruling that opened this packet**: [`../005-component-surface-system/045-board-card-properties/decision-record.md`](../005-component-surface-system/045-board-card-properties/decision-record.md) ADR-001,
  and [`../005-component-surface-system/roadmap.md`](../005-component-surface-system/roadmap.md) §6A
- **Roadmap**: [`roadmap.md`](roadmap.md) · **Goal**: [`goal.md`](goal.md)
