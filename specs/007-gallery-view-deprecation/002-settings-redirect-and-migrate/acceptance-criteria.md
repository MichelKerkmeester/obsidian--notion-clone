---
title: "Acceptance Criteria: Gallery Settings Redirect and Migration"
description: "The criteria this phase must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "007 phase 2 criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-05T07:10:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the closure gate for the redirect and migration phase"
    next_safe_action: "Wait for 001; its surface list decides this phase's REQ set"
    blockers:
      - "001's audit must land before this phase's REQ set is final"
    key_files:
      - "spec.md"
      - "src/main.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-002-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Gallery Settings Redirect and Migration

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 007-gallery-view-deprecation/002-settings-redirect-and-migrate
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** a settings file declaring `viewType: "gallery"`, **When** settings load, **Then** the value no longer survives as `"gallery"`. Closed via the real migration rather than the bare unknown-type fallback — see `decision-record.md` ADR-002 for why a verbatim copy of `006`'s edit would strand the cover | `gallery-hide-and-migrate.test.ts`, observed red before the `main.ts` edit, green after (11/11) | Met | - |
| AC-002 | REQ-001 | **Given** a `.base` file carrying a `cards` view, **When** it is imported, **Then** the resulting view is a **board**, and the image field still passes the schema guard. **This already holds** — `main.ts:1577` lands `cards` on `board`, `:1580` guards the field | Two regression units in `gallery-hide-and-migrate.test.ts` pin the mapping line and the image-field carry | Met | - |
| AC-003 | REQ-002 | **Given** a vault view configured as a gallery, **When** it is opened in the standalone host, **Then** it renders as a board with the same cover, and the notice appears once. **Today: this already works** via `database-view.ts:11678`; upgraded in this phase to the persisted-notice shape `migrateListViewOnOpen` already uses | `database-view.test.ts`-adjacent coverage: `gallery-migration.test.ts`'s plan/apply suite plus `gallery-hide-and-migrate.test.ts`'s source-level pin of `galleryMigrationNotices` wiring | Met | - |
| AC-004 | REQ-004 | **Given** a gallery-configured **codeblock** embed, **When** it renders, **Then** it is migrated. ADR-001 in `decision-record.md`: the call is added, mirroring `migrateListViewOnOpen`'s exact shape | `gallery-hide-and-migrate.test.ts` asserts `planGalleryMigration`, `migrateGalleryViewOnOpen` and `galleryMigrationNotices` are all present in `embedded-database-renderer.ts` | Met | - |
| AC-005 | REQ-005 | **Given** a view migrated on its first open, **When** it is opened again, **Then** the migration is a no-op and no second notice appears | `gallery-migration.test.ts`'s "refuses to apply a second time" case at the pure-function level; the persisted `galleryMigrationNotices` guard mirrors `migrateListViewOnOpen`'s own tested shape in both hosts | Met | - |
| AC-006 | REQ-003, REQ-006 | **Given** the finished phase, **When** `npm run gate` runs, **Then** it exits 0 read from `$?`, and every closed surface has a test that was seen failing first | `npm run gate` exit 0 (25/25 lanes green); red-first record in `tasks.md` T004/T006 | Met | - |
| AC-007 | REQ-002 | **Given** this phase's work is merged, **When** `003` is considered, **Then** a **released** version number carries the migration. Merged is not shipped, and this row is why | The release tag and the version in `manifest.json` — **not this dispatch's to cut**; T013 hands this to the orchestrator | Unmet | - |

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

Nothing has run. Every row is `Unmet` with its state today named rather than left blank. AC-001 is
the one live minting surface `030` left open; **AC-002 is not a defect** — the `.base` importer was
fixed upstream and already lands on `board`, so that row exists to pin behaviour no test currently
guards. AC-004 names the asymmetry that has now been inherited twice. AC-007 is the row that most wants to be waived and must not be: it is the
only thing standing between an unmigrated vault and a deleted renderer.
<!-- /ANCHOR:closure -->
