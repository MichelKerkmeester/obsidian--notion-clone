---
title: "Tasks: Stored two-way write-back"
description: "No active build tasks: this Wave 6 packet holds the DO-NOT-BUILD ruling. The ranked backlog below records the decision, the safer read-only substitute (008), and the design-ready-if-revisited notes as blocked items — not an active build plan."
trigger_phrases:
  - "two-way write-back"
  - "stored write-back"
  - "tasks"
  - "no build planned"
  - "syncwrites"
  - "relation mirror writes"
  - "deferred write-back"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/015-two-way-write-back"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan findings: ship-lock, collapsed T005-T010 into one note"
    next_safe_action: "Revisit only if the recorded trigger fires; then write a new plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Stored two-way write-back

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred (gated on the revisit trigger or on another item) |

**Task Format**: `T### [P?] Description (file path) — Effort: S/M/L`

> Source of truth for every citation below: [`research/synthesis.md`](research/synthesis.md) and [`research/research.md`](research/research.md). (Any earlier pointer to `specs/obsidian/001-notion-finance-migration/008-note-db-notion-parity/research/...` is stale and superseded by this phase's own `research/`.)

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

The synthesis Verdict is DO-NOT-BUILD / HOLD. Setup is recording that decision and its fork-side rationale (not the unsupported Notion dual-copy claim).

- [x] T001 Keep stored two-way write-back unbuilt this wave — Effort: S (0 fork hours; spec.md Files to Change is empty). Gap vs Notion: the visible two-way UX is one write plus a live inverse, not two stored copies. Citation: `research/synthesis.md` Ranked backlog #1; [Notion `dual_property`](https://developers.notion.com/reference/property-object#relation)
- [x] T002 Record that `syncWrites` does not exist in source (fork-wide grep: zero `syncWrites`/`sync_writes` matches) and that a future ON path would be net-new code on `RelationConfig` (`src/data/types.ts:34-37`), not flipping a dormant switch — Effort: S to document; L to implement an ON path. Citation: `research/synthesis.md` Ranked backlog #3; `research/research.md` Iteration 4 finding 1
- [x] T003 Drop the unsupported claim that Notion "store[s] the link on both records and rewrite[s] both on every change"; ground the deferral in fork-side `DataSource.writeQueues` per-path cost + iCloud churn — Effort: S. Citation: `research/synthesis.md` Open questions #2; `research/research.md` Iteration 1 finding 8

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

No plugin implementation is planned this wave. This packet is a **ship lock**, not a backlog — closable work is T001–T003 + T011 only. The read-only substitute (`src/data/RelationInverse.ts` over `RelationRollup.ts:58-90`) is owned by `008-derived-inverse-relations`, not by this packet (see `008`'s tasks; 008 is Planned, not shipped). The single `[B]` item below is an **if-reopened design note**, not a task an implementer can close; it stays blocked until the revisit trigger fires, and even then a **new** plan must be written — the frozen shape in `plan.md` §3 has a double-hook bug (the call-site pair mirrors twice on the table path) and a refuse-vs-dual contradiction (step 7 issues a second write against the refuse-dual-write default).

- [ ] [B] T004 If-reopened design note (do not execute as-is): the frozen future shape in `plan.md` §3 records the module (`src/data/RelationWriteBack.ts`), the `RelationConfig` extension, the module invariants, the mobile/iCloud gates, the cardinality block, and the no-rollback ruling. It is design-ready-if-revisited, not an active build list. A new plan must first **re-ask refuse vs best-effort** (default: refuse dual-write, synthesis Q4) and **correct the call-site pair** (mutually exclusive — see `plan.md` §3 correction). Citation: `research/final-plan.md` Optimizations #1–#3; `research/synthesis.md` Recommended build
  - Extend `RelationConfig` (`src/data/types.ts:34-37` + column `:67-68`) with an explicit reverse property id (never the same frontmatter key on both notes, synthesis Q3) before any mirror write
  - Build `RelationWriteBack.ts` as an isolated delta mirror (AppFlowy delta, not full-array rewrite); Set-dedup on write, resolve-before-write, skip `sourcePath === targetPath`, skip same-database mirrors by default (Q5)
  - Keep mobile display-only; never dual-enqueue on iCloud (three module-boundary gates: platform, config, resolution; `.db-mobile-reorder-controls` `settings.ts:446-451` is reorder UI, not a write gate)
  - Do not port Notion "1 page" cardinality until a named 1:1 workflow exists (`RelationConfig` has no max-count)
  - Do not design a cross-path commit/rollback (`DataSource.ts:88-122` cannot become a two-path transaction; `mutateFrontmatter` only rolls back the failed file, `DataSource.ts:305-307`); refuse dual-write rather than compensate
  - Parser/dedup traps argue against building (not just module invariants): `parseRelationLink` strips `|alias`/`#subpath` (`RelationLinks.ts:15-19`); `parseRelationValues` does not dedup; only `buildRelationRollups` uses `seenPaths` (`RelationRollup.ts:69-77`); unresolved `getFirstLinkpathDest` is skipped on read (`:70-74`). A full-array-set mirror accumulates duplicates and drops aliases.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 Confirm the plugin fork is unchanged by this phase (grep `syncWrites` returns 0; no new module under `src/data/`; no call-site edit)
- [ ] [B] T012 Revisit only if the recorded trigger fires (`spec.md`): a concrete named workflow appears that the derived inverse (`008`) cannot serve — not abstract "Notion parity." Default: do not reopen. Citation: `research/synthesis.md` Open questions #1

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] Decision recorded (T001–T003): DO-NOT-BUILD, fork-side rationale, `syncWrites` is spec-only
- [ ] The single `[B]` design note (T004) remains blocked (no active build) — this is the correct end state for this wave
- [x] Manual verification passed (T011): fork tree unchanged; this packet reads Deferred

This phase is Deferred by design. The `[B]` design note is design-ready-if-revisited, not work to close out; it stays blocked until the revisit trigger fires, and even then a new plan must be written (the frozen shape has a double-hook bug and a refuse-vs-dual contradiction).

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Source of truth**: `research/synthesis.md` (Verdict, Ranked backlog, Recommended build, Edge cases, Open questions) and `research/research.md` (full evidence trail)
- **Safer substitute (owned elsewhere)**: `008-derived-inverse-relations` — the two-way READ this deferral relies on

<!-- /ANCHOR:cross-refs -->

---

<!--
CORE TEMPLATE (~60 lines)
- Simple task tracking
- 3 phases: Setup, Implementation, Verification
- Add L2/L3 addendums for complexity
-->
