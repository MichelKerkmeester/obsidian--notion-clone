---
title: "Implementation Plan: Reports Relation Wiring"
description: "Vault-only plan to inventory the four db_view notes and wire both relation sides so Reports-side [[wikilink]] arrays exist before any rollup column is bound."
trigger_phrases:
  - "reports relation plan"
  - "wikilink inventory"
  - "both relation sides"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/001-live-reports-rollups/001-reports-relation-wiring"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored relation-wiring child from synthesis rank 1 and final-plan steps 1-4"
    next_safe_action: "Inventory the four db_view notes; do not invent paths"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-reports-relation-wiring"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Reports Relation Wiring

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian vault markdown `database:` YAML and per-row frontmatter |
| **Framework** | Fork relation engine is read-only here — forward-only from `sourceRecord.frontmatter[relation.key]` (`RelationRollup.ts:70-78`) |
| **Storage** | Personal finance vault Report / Expenses / Sales / Income `db_view` notes (paths UNKNOWN) |
| **Testing** | Written inventory plus one sample Report whose relation resolves to the expected child set |

### Overview
EuroFormat isolated-module pattern this phase: **zero new `src/` files, zero call sites.** This child only locates notes, records backups, and writes `[[wikilink]]` relation data the existing engine already knows how to read. A wrong `targetDatabaseId` is `getTarget` null → empty (`RelationRollup.ts:43-49,64-66`).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 1 and final-plan steps 1–4 read; forward-only coupling confirmed.
- [x] Wikilink rule locked: full-string `[[...]]` only (`RelationLinks.ts:9-25`).
- [x] No invented `db_view` paths.

### Definition of Done
- [ ] Preflight backups and fork `git status` recorded.
- [ ] Written inventory of the four notes exists (or halt if not found).
- [ ] One sample Report relation resolves to the expected child set.
- [ ] Fork `src/` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Vault configuration only. No new module. The engine already walks Reports rows, not children.

### Key Components
- **Reports relation columns**: `relationConfig.targetDatabaseId` = child database ids; per-row `[[wikilink]]` arrays of that month's children.
- **Child Month fields**: each Expenses/Sales/Income row points at its Report note (pairing for humans and later inverses; the engine does not read this side for rollups).
- **Optional bulk-fill**: Templater / one-shot vault script if Reports-side is empty — still not fork TypeScript.

### Data Flow
`buildRelationRollups` reads `sourceRecord.frontmatter[relation.key]`, parses with `parseRelationValues` → `metadataCache.getFirstLinkpathDest`, keeps paths that exist in `databaseById.get(targetDatabaseId).recordsByPath`, dedups with `seenPaths` (`RelationRollup.ts:70-78`). This child must put the right wikilinks on the Report row.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: vault `database:` YAML and per-row frontmatter. Consumer later: `buildRelationRollups` (`RelationRollup.ts:70-78`). No fork call-site edits. Algorithm invariant: only full-string `[[...]]` links resolve (`RelationLinks.ts:9-25`).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Record fork `git status` so later dirt is not blamed on this phase.
- [ ] Copy current `database:` YAML from the four `db_view` notes once found.

### Phase 2: Core Implementation
- [ ] Locate the four notes; write the inventory (ids, keys, `targetDatabaseId`, static totals, Reports-side occupancy, empty vs malformed Month values).
- [ ] Wire both relation sides; bulk-fill Reports-side `[[wikilink]]` arrays if inventory shows empty and many children.

### Phase 3: Verification
- [ ] One sample Report's relation resolves to the expected child set.
- [ ] Confirm fork `src/` still clean.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None — no TypeScript | — |
| Integration | None — no plugin API change | — |
| Manual | Inventory completeness; sample Report relation vs expected children; wikilink shape | Obsidian vault |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live finance vault `db_view` notes | External | UNKNOWN paths | Halt; do not invent |
| Fork `RelationRollup.ts:70-78` | Internal (read-only) | Green | Child Month links alone cannot fill figures |
| Derived inverse relations (parent phase 008) | Internal | Out of this child | Do not wait |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Wrong `targetDatabaseId`, malformed links, or accidental fork edits.
- **Procedure**: Restore the copied `database:` YAML backups; revert per-row wikilink edits from those copies. Revert any fork `src/` file. Do not leave half-wired Report rows.
<!-- /ANCHOR:rollback -->
