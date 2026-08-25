---
title: "Feature Specification: Stored two-way write-back"
description: "Wave 6 deferred decision: do not mirror a relation into both notes' frontmatter. Notion's two-way contract is a schema-level dual_property pair plus a derived inverse (one relation array written on the edited row), and both AppFlowy and Anytype ship the same single-write / derived-backlink model — so dual frontmatter mirrors would be a fork-only storage invention, not Notion parity."
trigger_phrases:
  - "two-way write-back"
  - "stored write-back"
  - "syncwrites"
  - "relation mirror writes"
  - "two-way frontmatter"
  - "deferred write-back"
  - "icloud write churn"
  - "dual note write"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/015-two-way-write-back"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan findings: added frozen-shape risks, tightened revisit trigger"
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
# Feature Specification: Stored two-way write-back

> Adjacent phases: predecessor `014-record-detail-panel`, successor `016-onchange-automations`. Parent spec: [`../spec.md`](../spec.md). Source of truth: [`research/synthesis.md`](research/synthesis.md), [`research/research.md`](research/research.md).

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P2 |
| **Status** | Deferred |
| **Created** | 2026-08-24 |
| **Branch** | `015-two-way-write-back` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The Wave 6 question was whether to port Notion's two-way relations into the note-database fork as **stored** dual frontmatter mirrors — i.e., on every relation click, mirror the wikilink into **both** notes' frontmatter. The research verdict is **do not build this**. Notion's public contract is a schema-level `dual_property` pair plus a **derived** inverse: one relation array is written on the edited row, and the counterpart is rendered from that one write (`developers.notion.com/reference/property-object#relation`; the duplication FAQ proves the inverse is derived, since duplicating a database "convert[s] the relation from a 2-way sync to a 1-way sync" — `notion.com/help/relations-and-rollups#faq`). Both reference clones ship the same model: AppFlowy writes one cell and has its related-database counterpart write **commented out** (`context/appflowy/.../event_handler.rs:1204-1223`); Anytype treats `backlinks` as a featured read-only key the client never writes (`context/anytype-ts/src/ts/lib/util/object.ts:487-494`). Dual frontmatter mirrors would therefore **not** be Notion parity — they would be a fork-only storage invention that dirties two markdown files per click through `DataSource.writeQueues`.

The product need (a Report lists its Expenses) is real and is served by the two-way **read**: `008-derived-inverse-relations` inverts the existing `RelationRollup.ts` scan into a read-only inbound list (`src/data/RelationRollup.ts:58-90` is the scan 008 inverts). That path dirties one markdown file. The storage need is not real.

### Purpose
Record the Wave 6 deferral and its **real** rationale, so a later owner does not "close the Notion gap" by turning on a `syncWrites` write path. Two corrections the research forces:

1. **Drop the unsupported Notion dual-copy claim.** The prior framing asserted Notion "store[s] the link on both records and rewrite[s] both on every change." Public evidence shows one relation array per edited page plus `dual_property` schema pairing and a derived inverse; Notion's internal storage is undocumented (inference boundary, not a build input). The deferral stands on **fork-side** facts, not a Notion mirror claim.
2. **`syncWrites` does not exist in source.** A fork-wide grep returns zero `syncWrites`/`sync_writes` matches. It is spec-packet language, not a dormant code switch. A future ON path would be net-new code (a flag would first have to be invented on `RelationConfig` in `src/data/types.ts:34-37`), not flipping a switch.

The single biggest risk this packet must guard against is a later owner enabling a `syncWrites` path that does not exist, justified by the now-corrected Notion claim.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Recording the deferral and its fork-side rationale: stored two-way write-back is not built this wave
- Recording what the feature would have been: mirror a relation into both notes' frontmatter on every link, behind a `syncWrites`-style gate (a spec concept; net-new code if ever built, default OFF)
- Recording the real cost basis: two markdown writes per click; two keys in `DataSource.writeQueues` (`src/data/DataSource.ts:88-122`); iCloud churn on both notes
- Recording the cheaper/safer alternative the synthesis names: ship the two-way **read** in `008-derived-inverse-relations` (`RelationInverse.ts` over the existing `RelationRollup.ts` scan) and leave this packet Deferred
- Recording the single revisit trigger below

### Out of Scope
- Any plugin implementation of stored write-back, a `syncWrites` ON path, dual frontmatter mirrors, or conflict policy for two stored properties
- The derived read-only inverse (owned by `008-derived-inverse-relations`)
- Record detail panel / hover-open (owned by predecessor `014-record-detail-panel`)
- On-change automations (owned by successor `016-onchange-automations`)
- Changes to the existing engines, 12 column types, 7 view types, display-only rollups (`count|sum|avg|list`, `src/data/types.ts:69-70`), or `DataSource.writeQueues`

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| (none in the plugin fork) | None | Deferred decision only; no module, call-site, or CSS change. spec.md Files to Change is empty; 0 fork hours |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Do not build stored two-way write-back this wave | The fork gains no dual-frontmatter mirror and no `syncWrites` ON write path |
| REQ-002 | Default write path stays single-file | A relation click continues to dirty one markdown file (`enqueueWrite(file.path)` in `mutateFrontmatter`, `src/data/DataSource.ts:293`); this phase adds no second `writeQueues` key |
| REQ-003 | Ground the deferral in fork-side facts, not the Notion mirror claim | spec.md no longer asserts Notion stores/rewrites both records; the rationale cites `DataSource.writeQueues` per-path behavior and iCloud churn |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Keep one concrete revisit trigger | Work re-enters only if a concrete named workflow appears that the derived inverse cannot serve |
| REQ-005 | Record the safer substitute | The two-way read in `008-derived-inverse-relations` (`RelationInverse.ts` over `RelationRollup.ts`) is named as the substitute this deferral relies on |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: **Given** this packet stays Deferred, **Then** the plugin fork does not mirror a relation into a second note's frontmatter and does not implement a `syncWrites` ON path.
- **SC-002**: **Given** a relation click on the default path, **Then** iCloud sees one note churn, not two, because this phase adds no second `writeQueues` key (`src/data/DataSource.ts:88-122`).
- **SC-003**: **Given** a later owner review, **Then** work re-enters only if a concrete named workflow appears that the derived inverse (`008`) cannot serve — not for abstract "Notion parity."
- **SC-004**: **Given** the deferral rationale, **Then** it cites fork-side `writeQueues`/iCloud cost and does **not** claim Notion stores/rewrites both records (unsupported by public evidence).

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | A later owner enabling a `syncWrites` path that does not exist in source, justified by the old Notion dual-copy claim | High: two markdown writes per click; iCloud churns both notes; builds a fork-only invention sold as "parity" | Drop the unsupported Notion claim (REQ-003); record that `syncWrites` is spec-only (zero grep matches); keep this phase Deferred |
| Risk | Building write-back "for Notion parity" without a named workflow | High: Effort L, no cross-path transaction (`DataSource.ts:88-122`), conflict policy, dual stored properties, no extra read benefit beyond the derived inverse | Require the single revisit trigger before any design |
| Risk | Half-applied dual writes if ever built | High: two `enqueueWrite` slots fail independently; no cross-path rollback (`mutateFrontmatter` only rolls back in-memory overrides for the file that failed, `DataSource.ts:305-307`) | Do not build; if ever built, refuse dual-write or accept best-effort counterpart with edited note canonical |
| Risk | The frozen future shape's call-site pair double-writes on the table path, and its step 7 contradicts the refuse-dual-write default | High if ever built: hooking both `saveValue` (post-injector) and `saveCellValueWithHistory` mirrors twice (`CellRenderer.ts:91`; `DatabaseView.ts:514`); a stored mirror also desyncs on undo (undo/fill/paste go through `applyFrontmatterChanges`, `DatabaseView.ts:8198-8216`, not the frozen sites) | Do not execute the `[B]` list as-is; if reopened, write a new plan that corrects the call sites (mutually exclusive pair) and re-asks refuse vs best-effort (default: refuse, synthesis Q4) |
| Risk | `008-derived-inverse-relations` spec still says Notion "store[s] a second property … and mirror[s] it on write" — the claim 015 research killed | Medium: a later owner reading 008 first can reopen 015 for "parity" | 015 research wins (Notion internals stay an inference boundary, `research/research.md` Iteration 1 finding 8); cite this packet's §2 correction when revisiting |
| Dependency | Derived read-only inverse (`008-derived-inverse-relations`) | High: that packet is the two-way READ substitute this deferral relies on | Do not start write-back instead of 008; 008 must complete before any 015 reopen |
| Dependency | `DataSource.writeQueues` per-path queues (`src/data/DataSource.ts:88-122`) | High if a build is attempted: both paths enqueue and sync independently | Revisit only after the trigger fires; then a new design must confront the dual-queue cost |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- None blocking the deferral. The revisit trigger is recorded and this phase does not wait on a further owner decision to stay Deferred.
- Operator decisions recorded for a possible reopen (defaults per synthesis): (1) keep 015 Deferred — no; (2) drop the Notion dual-copy claim — yes (done in §2); (3) if reopened, use an explicit reverse property id (Notion `dual_property`), never the same frontmatter key on both files; (4) if reopened, refuse dual-write, edited note canonical; (5) skip same-database self-relation mirrors unless a named self-relation workflow appears; (6) display-only on mobile, never dual-enqueue on iCloud; (7) do not add "1 page" cardinality until a named 1:1 workflow exists (`types.ts:34-37` has no max-count).

**REVISIT TRIGGER:** Reopen this packet only if a concrete named workflow appears whose two-way need the derived inverse (`008`) cannot serve. Do not reopen for abstract "Notion parity." If the trigger fires, write a **new** plan; do not execute this packet's `[B]` list as-is — the frozen call-site pair double-writes on the table path and step 7 contradicts the refuse-dual-write default (synthesis Q4). Re-ask refuse vs best-effort before writing any module (default: refuse).

<!-- /ANCHOR:questions -->

---

<!--
CORE TEMPLATE (~80 lines)
- Essential what/why/how only
- No boilerplate sections
- Add L2/L3 addendums for complexity
-->
