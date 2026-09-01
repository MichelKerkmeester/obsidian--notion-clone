---
title: "Tasks: Reports Relation Wiring"
description: "Ordered tasks to inventory the four db_view notes and wire both relation sides with full-string [[wikilink]] values."
trigger_phrases:
  - "reports relation tasks"
  - "wikilink inventory"
  - "both relation sides"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/001-reports-relation-wiring"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Reports Relation Wiring

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (target — fork file:line or vault config)`

Fork file:line cites are read-only capability surfaces. This child mutates only vault YAML and wikilinks (fork files: none).
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Preflight: record `git status` on the Obsidian Plugin tree; copy current `database:` YAML from Reports / Expenses / Sales / Income `db_view` notes once located (live vault + fork tree — fork files: none) [S]
- [ ] T002 Locate the four `db_view` notes (paths UNKNOWN — do not invent; halt if not found) and inventory each `database:` YAML: database ids, relation column keys, existing `targetDatabaseId`, static Income/Expenses/Sales/Saved values, and whether Report frontmatter already holds `[[wikilink]]` arrays for Expenses (R) / Sales (R) / Income (R). Count child rows with empty Month vs malformed non-`[[...]]` values — `parseRelationLink` accepts only a full-string `[[...]]` (`Obsidian Plugin/src/data/RelationLinks.ts:9-25`) [S/M]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 Populate both halves of each relation pairing: add Reports relation columns targeting Expenses/Sales/Income (reuse Notion names such as Expenses (R)) and point each child row's Month link at its Report note. The fork rolls up only forward from `sourceRecord.frontmatter[relation.key]` with no inverse resolver (`Obsidian Plugin/src/data/RelationRollup.ts:70-78`). A wrong `targetDatabaseId` is `getTarget` null → empty (`RelationRollup.ts:43-49,64-66`). If T002 shows empty Reports-side links and more than a handful of children, bulk-fill via a one-shot vault script / Templater pass that writes `[[wikilink]]` arrays onto each Report note — still vault data, not fork `src/` (Reports + child `db_view` markdown — fork files: none) [S/M]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Confirm one sample Report's relation resolves to the expected child set (Reports view — fork files: none) [S]
- [ ] T005 Confirm fork `src/` has no this-child diffs (Obsidian Plugin tree) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Written inventory exists
- [ ] Sample Report relation resolves
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 1
- **Parent final-plan**: `../research/final-plan.md` steps 1–4
<!-- /ANCHOR:cross-refs -->
