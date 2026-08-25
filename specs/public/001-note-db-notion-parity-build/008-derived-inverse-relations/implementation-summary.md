---
title: "Implementation Summary: Derived Inverse (Safe Two-Way) Relations"
description: "Honest unbuilt summary of the planned read-only derived inverse for many-to-one wikilinks."
trigger_phrases:
  - "derived inverse summary"
  - "inverse relations implementation"
  - "relationinverse not built"
  - "syncwrites deferred"
  - "icloud-safe two-way"
  - "derived inbound expenses"
  - "forward wikilink source of truth"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/008-derived-inverse-relations"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "swarm"
    recent_action: "Scaffolded phase 008 docs; status Planned"
    next_safe_action: "Build phase 008 per plan.md and tasks.md"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Derived Inverse (Safe Two-Way) Relations

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 008-derived-inverse-relations |
| **Completed** | Not yet implemented (Planned) |
| **Level** | 2 |
| **Actual Effort** | 0 hours (estimated: 8 hours, effort M) |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

This phase is **not built yet**. Status is Planned. Scaffolding only: the design lives in `plan.md` and the work orders live in `tasks.md`. No `RelationInverse.ts` module exists in the fork, and `RelationRollup.ts` / `RelationLinks.ts` have not been wired to a derived inbound set.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `specs/obsidian/001-notion-finance-migration/build/note-database-fork/src/data/RelationInverse.ts` | Not yet created | Isolated read-only inverse of the existing relation scan |
| `specs/obsidian/001-notion-finance-migration/build/note-database-fork/src/data/RelationRollup.ts` | Not yet modified | Call site for display-only rollups over derived inbound records |
| `specs/obsidian/001-notion-finance-migration/build/note-database-fork/src/data/RelationLinks.ts` | Not yet modified | Call site for read-only back-references |
| `spec.md`, `plan.md`, `tasks.md`, `checklist.md`, `implementation-summary.md` | Scaffolded | Phase documentation only; not product code |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Implementation has not started. Delivery, when it happens, follows `plan.md`: confirm `001-live-reports-rollups`, add `src/data/RelationInverse.ts`, wire two call sites, keep `syncWrites` OFF, then record observed verification. Until then this file is a Planned scaffold.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Store only the many-to-one wikilink (`Expenses.Month -> Report`) | Notion two-way is a second stored property mirrored on write; a naive port dirties two markdown files per click |
| Compute `Report -> Expenses` as a read-only derived inverse | Delivers the two-way **benefit** (target lists inbound records) without the write **cost** |
| New module `src/data/RelationInverse.ts` inverts the existing `RelationRollup.ts` scan | Rollups already walk relations for display-only `count` / `sum` / `avg` / `list`; a second vault walk would hurt mobile and duplicate work |
| Call sites limited to `RelationRollup.ts` and `RelationLinks.ts` | EuroFormat-style isolated diff: new `src/data/` file plus 1–3 hunks so rebase onto upstream stays clean |
| `syncWrites` flag exists, default **OFF** | Later escape hatch toward stored two-way write-back; this phase must not enable it |
| `DataSource.writeQueues` stays one path per relation click | Queues are per-path; dual writes would make iCloud see both notes churn |
| Finance already named both directions on the Notion-Bases track | Product labels for both ends exist; storage still stays forward-only |
| Depends on `001-live-reports-rollups` | Inverse cannot ship before forward relations and the rollup scan are live |
| This is the iCloud-safe substitute for deferred stored write-back | Stored two-way mirroring is out of scope here on purpose |
| Mobile-safe, MIT-forkable, no telemetry | Personal finance vault + MIT plugin fork constraints |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Strict validation | Pending | This phase folder | `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh specs/obsidian/002-note-db-notion-parity-build/008-derived-inverse-relations --strict` |
| Unit (inverse scan) | Pending | Empty / one / many / dangling / cross-db miss | Test path UNKNOWN until the fork test tree is read |
| Write-path | Pending | Single `DataSource.writeQueues` path | Must prove the Report file is not rewritten when `syncWrites` is OFF |
| Call-site wiring | Pending | `RelationRollup.ts`, `RelationLinks.ts` | Not implemented |

### Test Coverage Summary

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| `RelationInverse.ts` | N/A — not built | N/A — not built | N/A — not built |
| `RelationRollup.ts` / `RelationLinks.ts` call sites | N/A — not wired | N/A — not wired | N/A — not wired |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| NFR-P01 | Reuse the existing relation scan; no second vault walk | UNKNOWN — not implemented | Pending |
| NFR-P02 | View open does not enqueue extra `writeQueues` work | UNKNOWN — not implemented | Pending |
| NFR-S01 | No secrets or telemetry; no formula-eval widening | UNKNOWN — not implemented | Pending |
| NFR-S02 | MIT-forkable; no desktop-only APIs | UNKNOWN — not implemented | Pending |
| NFR-R01 | Default inverse never mutates the target note | UNKNOWN — not implemented | Pending |
| NFR-R02 | Missing/empty/cross-db misses return empty sets without writes | UNKNOWN — not implemented | Pending |
| NFR-R03 | One edited path per relation click when `syncWrites` is OFF | UNKNOWN — not implemented | Pending |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Not implemented.** No runtime inverse exists until `plan.md` / `tasks.md` are executed.
2. Inverse will be **read-only**. Users cannot edit the back-reference on the Report and expect a source wikilink to be rewritten (that would be stored two-way write-back).
3. `syncWrites` remains **OFF**. Enabling it is deferred; this phase does not define conflict policy for dual stored properties.
4. Rollup math stays `count` / `sum` / `avg` / `list`. Median/min/max/range/percent already exist on charts/footers and are not this module's job.
5. Exact `RelationRollup.ts` export names and the colocated test path are UNKNOWN until implementation reads those files.
6. Depends on `001-live-reports-rollups`; building this packet first would invert a scan that is not live.

<!-- /ANCHOR:limitations -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| Build `RelationInverse.ts` and wire two call sites | Not started | Packet is a Planned scaffold; implementation has not run |
| Record passing write-path and inverse tests | Pending | No code yet; verification must wait for observed command evidence |

<!-- /ANCHOR:deviations -->
