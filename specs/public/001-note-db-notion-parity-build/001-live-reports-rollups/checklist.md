---
title: "Verification Checklist: Live Reports Roll-ups"
description: "Verification checklist for live Reports rollups delivered as vault configuration with no fork source changes."
trigger_phrases:
  - "live reports rollups"
  - "reports db_view configuration"
  - "relation rollup sum"
  - "computed sync display-only"
  - "month relation report note"
  - "snapshot audit totals"
  - "icloud-safe rollups"
  - "expenses sales income rollup"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review to checklist.md; status Planned"
    next_safe_action: "Build phase 001, then run this checklist"
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
# Verification Checklist: Live Reports Roll-ups

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: pending]
  - **Evidence**: Pending. After implementation, confirm `spec.md` still states both relation sides wired (Reports-side columns plus child Month links), SUM/COUNT rollups via existing `count|sum|avg|list` kinds bound to ops-confirmed keys, `computedSyncMode=display-only`, configuration-only scope, and Saved remaining static.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: pending]
  - **Evidence**: Pending. After implementation, confirm `plan.md` still describes vault `database:` YAML as the only mutation surface, the temporary `list` inventory step, and iCloud-safe display-only as a done gate.
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: pending]
  - **Evidence**: Pending. Ops must confirm live amount property keys (currently UNKNOWN — a wrong key silently yields an empty SUM). The fork's forward-only resolution (`RelationRollup.ts:70-78`) is the read-only capability dependency; the fork must remain unedited.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: pending]
  - **Evidence**: Pending. This phase ships no plugin TypeScript; the quality gate is valid YAML `database:` config on Reports and child `db_view` notes plus an unmodified fork tree.
- [ ] CHK-011 [P0] No console errors or warnings [EVIDENCE: pending]
  - **Evidence**: Pending. After wiring, open the Reports view in Obsidian (desktop and mobile) and confirm no errors on rollup columns or missing Month links.
- [ ] CHK-012 [P1] Error handling implemented [EVIDENCE: pending]
  - **Evidence**: Pending. Confirm empty Month relations omit the child from SUM/COUNT without a crash, that a wrong `targetDatabaseId` degrades to an empty value (`getTarget` null), and that neither case is papered over with a guessed key or plugin fallback.
- [ ] CHK-013 [P1] Code follows project patterns [EVIDENCE: pending]
  - **Evidence**: Pending. Configuration-only change; later plugin phases must still follow the isolated-module pattern modeled by `EuroFormat.ts`. This phase must not add fork files or call-site edits.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: pending]
  - **Evidence**: Pending. REQ-001 through REQ-004 (both relation sides, SUM/COUNT rollups, display-only, no fork edits) are unmet until vault config is applied and verified.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: pending]
  - **Evidence**: Pending. A manual SUM of related children must match on-screen rollups, cross-checked against the temporary `list`/`file.name` inventory of resolved children. The `list` `targetField` must be `file.name` (not the amount key — reusing the amount field would dedupe two children with the same amount into one entry via `stringifyValue`, `RelationRollup.ts:110-119`). The `list` columns are removed only after SC-001 + SC-002 (no-write proof) both pass — not at the same moment SUM is added. A child amount edit must update the figure while Report bytes stay identical.
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: pending]
  - **Evidence**: Pending. Exercise per synthesis edge cases: empty Month link (COUNT `0`, SUM empty placeholder — not read as `0`), Report with zero children (not deleted or rewritten), duplicate wikilinks counted once via `seenPaths`, two relation columns over the same children counted independently, non-numeric amounts dropped from SUM, nested-rollup target rejected as empty (`RelationRollup.ts:101`). Also confirm a bare title / path / Markdown link (non-`[[...]]`) is dropped with the same empty UI as "no children" (`RelationLinks.ts:9-25`) — Setup must have inventoried and corrected these.
- [ ] CHK-023 [P1] Error scenarios validated [EVIDENCE: pending]
  - **Evidence**: Pending. Wrong `targetDatabaseId` (silent empty value) and omitted `computedSyncMode=display-only` are failure modes; confirm by reading the actual YAML for display-only and the correct Reports target ids. Also exercise the silent-SUM detector: if COUNT > 0 and SUM is empty, the amount key is wrong — fix the YAML, do not patch the fork.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-024 [P0] Requested valid fixture files regenerated [EVIDENCE: pending]
  - **Evidence**: Pending. The requested outcome is live Reports Income/Expenses/Sales figures via vault `database:` YAML, not plugin code. Saved must remain static or `Snapshot*`; Remaining/Saved math stays deferred.
- [ ] CHK-025 [P1] Intentional warning fixture left unchanged [EVIDENCE: pending]
  - **Evidence**: Pending. Out-of-scope surfaces stay untouched: fork source (successor `002-rollup-aggregation-pack` owns the `src/data/Aggregate.ts` work — not `RollupAggPack.ts`; this phase must not pre-create that file), Remaining/Saved formulas, derived inverse relations, footer/chart aggregation kinds.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets [EVIDENCE: pending]
  - **Evidence**: Pending. After YAML edits, inspect Reports and child `database:` blocks for account numbers, tokens, or telemetry endpoints; none are allowed.
- [ ] CHK-031 [P0] Input validation implemented [EVIDENCE: pending]
  - **Evidence**: Pending. Rollup `property` fields must use ops-confirmed keys, and kind ids must be limited to `count|sum|avg|list` — unknown ids silently fall through to sum, so median/min/max must never appear in rollup YAML. The diagnostic `list` `targetField` must be `file.name` (or another unique identity field), never the amount key, to avoid `stringifyValue` dedup collapsing same-amount children.
- [ ] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: pending]
  - **Evidence**: Pending. Not applicable to vault `db_view` configuration (no auth surface). Record N/A with operator confirmation at verification time; do not invent an auth check.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:mobile-icloud-safety -->
## Display-Only / Mobile / iCloud Safety

- [ ] CHK-033 [P0] Display-only pin verified in YAML and behavior [EVIDENCE: pending]
  - **Evidence**: Pending. Read the Reports `database:` block and assert `computedSyncMode: display-only` literally present and pinned in the **first** YAML edit (independent of the SUM change-set — it is the iCloud P0); then byte-compare the Report file before/after one child amount edit — identical bytes required. Rollup computation itself never writes frontmatter (`types.ts:69`); the real write-back early-returns under display-only are `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834` (`!this.isAutomaticComputedSync()`; default `ComputedSync.ts:3`, load-time coerce `DataSource.ts:787`) — `ComputedSync.ts:42-44` is `normalizeComputedSyncMode` only, not the early-return.
- [ ] CHK-034 [P0] Report path never write-queued by rollup flows [EVIDENCE: pending]
  - **Evidence**: Pending. The only enqueue sites are frontmatter mutations and user-initiated view-config saves (`DataSource.ts:989-992`). Verify a child edit queues the child path only; concurrent edits to two children serialize per path without touching the Report file.
- [ ] CHK-035 [P1] Benign-write + bidirectional-drift runbook recorded [EVIDENCE: pending]
  - **Evidence**: Pending. Document that residual Report-file writes are one-time startup migrations and user-initiated view-config saves (debounced), neither triggered by rollup recomputation — prevents false P0 alarms during audits. Include the ≤80ms refresh coalescing expectation so slow refresh is not mistaken for breakage. Also record the bidirectional-drift maintenance rule: until later inverse-relations plugin work, every new child must be added on both the child Month `[[wikilink]]` and the matching Report relation entry — the fork has no inverse resolver (`RelationRollup.ts:70-78`), so a child Month link alone will not fill the Report rollup and live SUMs silently rot if pairing is treated as one-shot.
- [ ] CHK-036 [P1] Mobile rendering verified [EVIDENCE: pending]
  - **Evidence**: Pending. Open the Reports view in Obsidian mobile: rollup cells render formatted (nl-NL grouping accepted this phase; euro-sign currency on rollup cells is explicitly out of scope), `Snapshot*` columns remain visually adjacent to live figures on narrow widths, and no desktop-only API is involved in the path.

<!-- /ANCHOR:mobile-icloud-safety -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: pending]
  - **Evidence**: Pending. After implementation, `spec.md`, `plan.md`, `tasks.md`, and `checklist.md` must still agree on: configuration-only scope; both-side relation wiring (with bulk-fill via vault script if empty); display-only pinned in the first YAML edit independent of SUM; COUNT + `list`/`file.name` resolution proof split from and preceding the SUM gate; the `list` removed only after SC-001 + SC-002 pass; the bidirectional-drift runbook rule; and the Saved handoff to a later phase.
- [ ] CHK-041 [P1] Code comments adequate [EVIDENCE: pending]
  - **Evidence**: Pending. This phase adds no plugin comments. Any YAML comments must state durable WHY (iCloud-safe display-only, audit snapshots) and must not embed spec paths, phase numbers, or requirement ids.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Pending. No README update is required for vault `database:` configuration; defer unless the operator asks for a vault-local note.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: pending]
  - **Evidence**: Pending. YAML backups from Setup belong in operator-controlled backup, not untracked residue at the repo root or under sibling phase folders.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: pending]
  - **Evidence**: Pending. This packet folder must still contain only the spec-kit docs plus tooling metadata; no sibling phase folders and no `description.json` / `graph-metadata.json` authored by the implementer.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 0/11 |
| P1 Items | 13 | 0/13 |
| P2 Items | 1 | 0/1 |

**Verification Date**: Not yet verified
**Verified By**: Pending (status Planned; nothing built)

<!-- /ANCHOR:summary -->
