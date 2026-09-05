---
title: "Decision Record: Gallery Settings Redirect and Migration"
description: "ADR-001 the embedded codeblock host gains the migration call. ADR-002 the two accepting surfaces are closed by routing them through the real migration rather than by the bare unknown-type fallback list's exemption removal used."
trigger_phrases:
  - "gallery embedded migration decision"
  - "gallery accepting surface decision"
  - "007 phase 2 adr"
  - "gallery sanitizer decision"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-05T09:00:00Z"
    last_updated_by: "redirect-and-migrate-run"
    recent_action: "Took both ADRs 001's audit left open for this phase"
    next_safe_action: "Hand off to the orchestrator for a release cut (T013); 003 waits for it"
    blockers: []
    key_files:
      - "src/main.ts"
      - "src/data/gallery-migration.ts"
      - "src/views/embedded-database-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-002-adr"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "The embedded host gains the migration call — ADR-001"
      - "The sanitizer routes gallery through the real migration rather than the bare fallback — ADR-002"
---
# Decision Record: Gallery Settings Redirect and Migration

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The embedded codeblock host

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Implementation (per `plan.md`'s framing: "the options are to add the call, or to ship the same partial state with the reason written down") |

### Context

`applyGalleryMigration` had exactly one call site, `database-view.ts:11678`. A gallery-configured
codeblock embed rendered through `EmbeddedDatabaseRenderer` unmigrated — the same gap `006` inherited
for the list and closed with `migrateListViewOnOpen(config)` at `embedded-database-renderer.ts:776-800`.
`046-linked-views-notion-parity`'s ADR-001 already settled the categorical objection: the operator
allowed an embedded, read-triggered view to write to its source database for linked-view parity, which
removes the strongest argument against a migration write from the same host.

### Decision

Add the call. `embedded-database-renderer.ts` now imports `planGalleryMigration`/`applyGalleryMigration`
and runs `migrateGalleryViewOnOpen(config)` from `render()`, in the same position `migrateListViewOnOpen`
already occupies. The new method copies `migrateListViewOnOpen`'s exact shape: a database-keyed session
set guards the attempt within a session, `plugin.settings.galleryMigrationNotices` guards the notice
across sessions and across leaves, and a `try`/`catch` rolls the `viewType` back to `"gallery"` on a
thrown write so a failed migration is not silently half-applied.

### Consequences

- A gallery-configured codeblock now migrates and notifies exactly like the standalone file view.
- The embedded host performs a write it did not before — precedented by `046`'s ADR-001, and scoped to
  exactly one field set (`viewType`, `boardImageField`, `boardImageAspectRatio`, `boardImageFit`), not a
  general write capability.
- `003` can now delete the renderer without leaving embedded galleries coerced to `table` by the
  unknown-type fallback, closing the asymmetry `030` shipped and `006` inherited.

### Alternatives Rejected

- **Ship the asymmetry with a recorded reason.** Rejected: by the time `003` runs the renderer is gone,
  and the embedded host would have no path left to carry the cover. `030`'s own outcome — an
  asymmetry inherited twice, across two packets — is the argument against inheriting it a third time.
- **Decide it in `003`.** Rejected in `plan.md` already: too late, the window to migrate closes with
  the renderer.
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: How the two accepting surfaces close

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Implementation, resolving what `001-usage-and-migration-audit/implementation-summary.md` explicitly left open: *"Whether `002` should wire the migration into the two accepting surfaces or leave them inert is a recommendation, not a decision this phase is positioned to make."* |

### Context

`001`'s audit named two surfaces that still accept a persisted `"gallery"` value: the settings-load
sanitizer (`main.ts:146`/`:182`) and `data-source.ts:1527-1529`'s `parseViewType()`. It found that
closing either the way `006`'s `e0e1c568` closed the parallel `list` exemption — deleting the special
case so the value falls through to the generic unknown-type coercion — would be **unsafe** for gallery
specifically: list's target (`table`) equals the unknown-type fallback, so removing list's exemption
cost nothing. Gallery's target is `board`, so a bare fallback to `table` at settings-load time, before
the on-open migration ever runs, would silently strand `galleryImageField` — worse than the state `030`
shipped, not a fix for it.

### Decision

The two surfaces are handled differently, on purpose, and neither is a verbatim copy of `006`'s edit:

1. **The settings-load sanitizer (`main.ts:146`, `:182`) is closed, but not by deletion.** Both sites
   now special-case `"gallery"` explicitly: instead of leaving it exempt, they call
   `planGalleryMigration`/`applyGalleryMigration` on the loaded view in place, converting it to
   `"board"` with its cover, aspect ratio and fit carried across in the same step. A settings-json view
   no longer survives a load as `"gallery"` — the literal requirement — and it does so without ever
   passing through the generic `"table"` fallback that would have dropped the cover. This is silent
   (no `Notice`) by design: it runs during `onload()`, before any view has rendered, and it is naturally
   idempotent — once a view is `"board"` it never re-enters the `"gallery"` branch on a later load.
2. **`data-source.ts`'s `parseViewType()` stays open, and stays open on purpose.** It is the read path
   for every `db_view: true` vault file, called from `main.ts:661`/`:671` before either render host ever
   sees the view. Closing it here — coercing at parse time — would run into the identical strand-the-
   cover problem the sanitizer avoids above, except here there is no plan/apply step available at parse
   time without duplicating the migration into the parser itself. Leaving it open means a persisted
   gallery reaches the render hosts as a real `ViewConfig` with `viewType: "gallery"`, exactly the input
   `migrateGalleryViewOnOpen` (both hosts, ADR-001) is built to redirect, once, with a notice. `list`
   is accepted by this same function today for the identical reason — it is not a one-off exemption
   grown for gallery, it is the plugin's one existing pattern for a value that is redirected on open
   rather than rejected on read.

### Consequences

- REQ-001 ("no surface mints or accepts `viewType: "gallery"` past this phase") is satisfied for the
  settings-json storage path structurally: after `loadSettings()` returns, no `ViewConfig` in
  `plugin.settings.databases` can hold `viewType: "gallery"`.
- The vault-frontmatter storage path continues to accept the value on read, by design, so the on-open
  migration in both hosts (ADR-001, and the existing standalone-host call) is what actually performs the
  user-visible redirect with its notice — matching REQ-002's "opens it as a board, once, with a notice."
- A settings-json view that is silently normalized at load time will not additionally show the on-open
  `Notice`, because there is nothing left for `migrateGalleryViewOnOpen` to do by the time it renders.
  This is accepted as correct rather than a gap: the value never reached the user as a rendered gallery
  in the first place, so there is nothing to announce a change away from.

### Alternatives Rejected

- **Delete the sanitizer's exemption outright, matching `006`'s edit literally.** Rejected: proven
  unsafe by `001`'s own audit — it strands the cover field before the migration ever runs.
- **Leave the sanitizer's exemption exactly as `030` shipped it.** Rejected: it is the literal
  completion criterion this packet exists to close, and leaving it unchanged would report the same
  partial state `001`'s audit already flagged as needing a decision, this time by omission.
- **Close `parseViewType()` too, coercing at parse time.** Rejected: identical data-loss risk to the
  sanitizer's naive form, with no plan/apply step available at that point in the pipeline to prevent it.
<!-- /ANCHOR:adr-002 -->
