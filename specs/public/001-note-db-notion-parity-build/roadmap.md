---
title: "Build Roadmap: Note DB Notion Parity Build"
description: "Dependency-ordered wave plan and ranked backlog for the Note Database fork -> Notion parity build."
trigger_phrases:
  - "roadmap"
  - "build order"
  - "notion parity"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-consistency-fix"
    recent_action: "Waves 1-5 (phases 002-014) shipped, Sonnet-verified, gate-green (tsc0/build0/vitest) on branch impl; see spec.md Status"
    next_safe_action: "Land wave 0 (phase 001, config-only, no code) to close the last pending item; wave 6 (015-017) stays deferred/out of scope and never-default unless an owner reopens it"
    blockers: []
    key_files:
      - "spec.md"
      - "roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 93
    open_questions: []
    answered_questions: []
---
# Build Roadmap: Note DB Notion Parity Build

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: roadmap | v2.2 -->

<!-- ANCHOR:waves -->
## 1. DEPENDENCY-ORDERED WAVES

### Wave 0 — Live Reports configuration (phase 001, no code)

The sharpest finance win needs zero plugin code: configure Reports to roll up live from Expenses/Sales/Income, reversing the previous Notion-Bases track's deliberate choice to store those totals as static values (so screenshot totals would not drift). Being config-only, it carries no rebase risk and no code review surface. Unblocks: 003 (Reports computed fields) and 008 (derived inverse relations need live relations/rollups).

### Wave 1 — Aggregate.ts roll-up pack (phase 002)

The roll-up engine today implements only count|sum|avg|list. This wave extends the same display-only roll-up path with min/max/median/range/earliest/latest in a new Aggregate.ts module. It is the first code wave and establishes the EuroFormat isolated-module pattern (new module under `src/data/` + 1-3 call-site edits) that every later wave follows. Unblocks: 003.

### Wave 2 — Reports computed fields + formula depth (phases 003, 004, 005)

- 003 consumes waves 0 and 1 to compute Remaining/Saved as display-only Reports fields.
- 004 (IFS/SWITCH + math aliases) lands before 005 (LET/LETS) because LET builds on the extended function surface 004 provides.
- Order within the wave: 003 first (it consumes the roll-up foundation), then 004, then 005.

### Wave 3 — Link fields + unique-id stamp (phases 006, 007)

Independent isolated modules: the URL/email/phone link column type (006) and the create-time unique-ID stamp (007). No hard dependencies on earlier code waves; ordered 006 before 007 so the column surface exists before the stamp targets it. Both stay display-only-safe.

### Wave 4 — Relation and view depth (phases 008, 009, 010, 011)

- 008 derived inverse (safe two-way) relations needs wave 0's live relations/rollups as its baseline.
- 009 nested AND/OR view filter tree precedes 010 multi-condition conditional formatting + icons (010 needs 009).
- 011 table group-by 2+ fields is independent.
- Largest wave; each item stays an isolated module, and 009/010 ship in sequence so the filter tree contract freezes before CF consumes it.

### Wave 5 — Content and UX (phases 012, 013, 014)

Files/attachments column (012), toolbar new-from-template button (013), and record detail panel / hover-open (014). Independent of each other; land after the data model is stable because 014 is the largest UI surface in the program.

### Wave 6 — Deferred and out (phases 015, 016, 017) — never-default

- 015 two-way write-back is deferred and carries only a lean decision spec: it breaks the display-only invariant (child edits would rewrite Report notes) and risks iCloud write churn.
- 016 on-change automations and 017 excluded parity items (person property, style(), GoodBases) are out of scope unless an owner explicitly re-opens them.
- Entering wave 6 requires an explicit owner decision; it is never the default continuation.
<!-- /ANCHOR:waves -->

---

<!-- ANCHOR:backlog -->
## 2. RANKED BACKLOG

| Phase | Item | Value | Effort | Rebase risk | Depends on |
|-------|------|-------|--------|-------------|------------|
| 001 | Live Reports roll-ups (config, no code) | High | Low | None | — |
| 002 | Aggregate.ts roll-up pack (min/max/median/range/earliest/latest) | High | Medium | Low | — |
| 003 | Reports Remaining/Saved computed fields | High | Low | Low | 001+002 |
| 004 | Formula IFS/SWITCH + math aliases | High | Low | Low | — |
| 005 | Formula LET/LETS variables | Medium | Low | Low | 004 |
| 006 | URL/email/phone link fields | Medium | Low | Low | — |
| 007 | Unique-ID stamp on create | Medium | Low | Low | — |
| 008 | Derived inverse (safe two-way) relations | High | Medium | Low | 001 |
| 009 | Nested AND/OR view filter tree | High | High | Medium | — |
| 010 | Multi-condition conditional formatting + icons | Medium | Medium | Low | 009 |
| 011 | Table group-by 2+ fields | Medium | Medium | Low | — |
| 012 | Files/attachments column | High | Medium | Low | — |
| 013 | Toolbar new-from-template button | Medium | Low | Low | — |
| 014 | Record detail panel / hover-open | High | High | Medium | — |
| 015 | Two-way write-back (DEFERRED) | Medium | High | High | write-churn decision |
| 016 | On-change automations (OUT) | Low | High | High | — |
| 017 | Excluded parity items: person/style()/GoodBases (OUT) | Low | High | Medium | — |

Value and effort are qualitative ratings from the 008 research ranking. Rebase risk is low by construction for every code phase: the EuroFormat isolated-module model (new module under `src/data/` + 1-3 call-site edits) keeps diffs small; phases 009 and 014 carry slightly higher risk because they touch the view serialization and the largest UI surface respectively. Phase 001 is config-only and has no diff.
<!-- /ANCHOR:backlog -->

---

<!-- ANCHOR:sequencing -->
## 3. SEQUENCING NOTES

- **Hard dependencies:** 003 needs 001+002; 005 needs 004; 008 needs 001; 010 needs 009. Nothing else in the program is a hard gate.
- **Value-x-effort ordering:** wave 0 is a zero-code win that unlocks two later phases; waves 1-2 build the shared roll-up and computed-field foundation before any view work; wave 4 groups all relation/view depth so the filter tree (009) precedes the CF icons (010); the largest UI surface (014) waits for wave 5, after the data model is stable.
- **Rebase discipline:** each code phase ships as a small, per-phase commit following the EuroFormat model, so `git rebase` onto upstream stays clean. The config-only phase 001 has no diff at all.
- **iCloud safety:** rollups and computed fields stay display-only; nothing rewrites Report notes on child edits. 015 two-way write-back is deferred precisely because it would break that invariant.
- **Wave 6 is never-default:** entering 015/016/017 requires an explicit owner decision; 015 gets a lean decision spec, 016/017 are recorded out of scope.
<!-- /ANCHOR:sequencing -->
