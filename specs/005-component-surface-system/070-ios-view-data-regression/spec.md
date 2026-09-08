---
title: "Feature Specification: iOS view data regression (all frontmatter properties render empty)"
description: "On iOS, 0.0.32 (and 0.0.31, never loaded on the phone) renders every database view with its property columns empty while the title/file-name column still resolves; frontmatter data is intact on disk."
trigger_phrases:
  - "feature specification"
  - "070 ios view data regression"
  - "ios properties empty"
  - "metadata cache cold read"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "070-ios-view-data-regression"
    last_updated_at: "2026-09-08T08:44:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Opened the packet from the operator's R1 report and its 08:44 clarification"
    next_safe_action: "Reproduce the empty-property read with a mirrored fixture"
    blockers:
      - "No confirmed root cause yet; three suspects named in §7, none excluded"
    key_files:
      - "src/data/data-source.ts"
      - "src/data/title-field-display.ts"
      - "src/data/legacy-plugin-data-migration.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "070-ios-view-data-regression-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the empty read reproduce cold-cache-only, or on every load on iOS regardless of cache state?"
      - "Is titleFormat (058) implicated, or is this a pre-existing iOS-only read path never exercised until now?"
    answered_questions:
      - "Nothing was lost by deleting note-database: both the old and fresh data.json hold databases: [] (settings only), row values live in each note's frontmatter, and the view definition lives in Finance Reports.md frontmatter"
      - "The operator's 08:44 clarification: ALL properties are empty on iOS, not just Income; the title/file-name column still renders; the Testbed board shows all 27 cards under No value with an empty Pinned checkbox and a bare 0"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: iOS View Data Regression

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | Draft — opened 2026-09-08, nothing started |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../005-component-surface-system/` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
On the operator's iPhone, on the build that shipped as 0.0.32, every database view renders with its property columns empty while the title/file-name column still resolves correctly. Confirmed on two independent databases: the Finance › Reports table (view "2026", 37 rows, Month column populated, Income column empty) and the Database Testbed board (all 27 cards grouped under "No value", each card showing an empty "Pinned" checkbox and a bare "0" where a number property should read). The operator's own diagnosis attempt — removing the note-database plugin — did not restore the data, which rules out a stale companion-plugin cache as the cause. Underlying frontmatter on disk is intact: `Finance/Reports/01 • Jan '25.md` carries `income: 3537.32`, `expenses: 2634.28`, `year: "2025"`, `sort_key: 202501`, `done: true`; the view definition in `Finance/Finance Reports.md` correctly maps `income` to an Income currency column. Both the recovered legacy `note-database/data.json` and the fresh `obnotion/data.json` hold `"databases": []`, confirming the plugin's own settings file carries no row data and was never the source of it.

### Purpose
Every property on every view reads and renders its value from frontmatter on iOS exactly as it does on desktop, proven by a red-before-green fixture-driven reproduction in the headless harness rather than by inference from the operator's screenshots alone.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Reproducing the empty-property read in the existing headless render-assertion harness, using a fixture that mirrors the operator's real shapes (synthetic values, not the operator's own data) for both a table view (Finance-shaped: currency, text, date-ish sort key) and a board view (Testbed-shaped: checkbox, number)
- Reproducing with the metadata cache cold (a fresh `data.json`, first-load timing) as an explicit, separate case from a warm-cache reproduction
- Root-causing the read path: `src/data/data-source.ts` (`parseViewConfig`, `toViewPayload`, the ~800/~988 parse paths named in the operator's own diagnosis), `src/data/title-field-display.ts`, and `src/data/legacy-plugin-data-migration.ts`'s data.json bridge
- A fix scoped to the confirmed root cause
- A test that fails against the pre-fix code (mutation-proven) and passes after
- Recapturing the affected surfaces once fixed
- An operator device row (unticked) confirming the phone read is restored

### Out of Scope
- Per-type value *formatting* (currency symbol, decimal style) — the operator's 08:44 clarification narrowed this from a formatting bug to a read/render bug; formatting is unaffected once a value is present
- Any other 0.0.32 report (071-074, R2-R13) — tracked in sibling packets
- The note-database plugin's own removal or reinstallation — already ruled out as the cause

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/data-source.ts` | Investigate/Modify | Property-read and view-payload construction; prime suspect for the 058 titleFormat parse paths |
| `src/data/title-field-display.ts` | Investigate/Modify | Title/format resolution introduced by 058; confirm it does not shadow the general property-read path |
| `src/data/legacy-plugin-data-migration.ts` | Investigate | The rename's data.json bridge; confirm it does not clear or race property reads on iOS |
| `tools/live/*.mjs` (harness) | Modify | New fixture + reproduction scenario, cold- and warm-cache cases |
| `*.test.ts` (nearest existing suite for the confirmed root file) | Modify | New failing-then-passing assertion |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Reproduce the empty-property read in the headless harness against a fixture mirroring the operator's shapes, with the metadata cache cold as an explicit case, before any fix is written |
| REQ-002 | Identify the root cause among the three named suspects (or a fourth found in the process) with file:line evidence, not inference |
| REQ-003 | Fix the confirmed root cause and add a test that is proven to fail against the pre-fix code and pass after |
| REQ-004 | Recapture every affected surface (Finance Reports table, Database Testbed board, and any other view type the root cause touches) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | Record an operator device row (unticked) that only the operator's own phone re-check may tick |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The harness reproduces 0 properties rendered where N are expected, on a cold cache, before the fix; N of N after
- **SC-002**: The fix is traced to one root cause with file:line evidence, not a defensive patch applied without a confirmed mechanism
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Obsidian's `MetadataCache` readiness timing on iOS | A fix that only works once the cache is warm would leave the reported symptom (first-load) unfixed | Cold-cache case is a named, separate acceptance criterion, not folded into the warm-cache case |
| Risk | The three named suspects (058's titleFormat parse paths, title-field-display, the legacy migration bridge) may all be innocent and the real cause is iOS-specific YAML/number coercion | Investigation is not scoped to only these three files | Root-cause requirement (REQ-002) requires file:line evidence before a fix is written, not a guess against the suspect list |
| Risk | A fix proven only in jsdom/unit tests may not hold on the real Obsidian mobile host | Recapture and the operator device row are both required, matching the pattern `037`'s teardown fix and `069`'s drag fix used | REQ-004, REQ-005 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The fix must not regress the render-time budget already gated by `tools/live/render-assertion-harness.ts` (list-bench and equivalents)

### Security
- N/A — read path over local frontmatter, no network or auth surface

### Reliability
- **NFR-R01**: The cold-cache reproduction must be deterministic (repeatable red before the fix, repeatable green after) rather than flaky, since a first-load timing bug is exactly the kind of defect a flaky check would hide
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: a database with zero rows must still render its column headers correctly (not conflated with the "properties render as empty" defect)
- Maximum length: not applicable — this is a presence/absence defect, not a truncation one

### Error Scenarios
- Metadata cache cold: first paint immediately after Obsidian starts, before `resolvedLinks`/frontmatter cache is populated for every file in `sourceFolder`
- Metadata cache warm: the same views re-rendered after the vault has been open for a while, to confirm whether the defect is timing-only or persistent

### State Transitions
- Partial completion: N/A, this packet is a bug fix, not a multi-stage rollout
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 15/25 | 3-6 files, one confirmed read path once root-caused |
| Risk | 12/25 | P0 data-visibility regression, but read-only and reversible |
| Research | 15/20 | Root cause not yet confirmed; three named suspects to eliminate |
| **Total** | **42/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does the empty read reproduce with the metadata cache warm too, or only cold?
- Does the same defect reach the desktop build, or is it iOS-only (as reported)?
<!-- /ANCHOR:questions -->

---
