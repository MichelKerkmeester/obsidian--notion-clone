---
title: "Implementation Plan: Excluded parity items"
description: "No build is planned: five Notion parity items stay excluded; only person/people and me() could reopen on identity plus Wave 6."
trigger_phrases:
  - "excluded parity items"
  - "out of scope parity"
  - "implementation plan"
  - "no build planned"
  - "person people property"
  - "me() function"
  - "goodbases renderer"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/017-excluded-parity-items"
    last_updated_at: "2026-08-26T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Fixed verification concerns: trigger width, QueryEngine path, 014 cites, Phase 2 HOLD"
    next_safe_action: "Keep closed; reopen person/me() only on identity + Wave 6"
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
# Implementation Plan: Excluded parity items

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | None for this phase (TypeScript plugin fork is not touched) |
| **Framework** | Obsidian plugin API (fork baseline only; no new capability) |
| **Storage** | Operator vault on iCloud; no new writes or fetches |
| **Testing** | None planned; there is no plugin diff to test |

### Overview
This is not a build — the synthesis Verdict is **DO-NOT-BUILD / HOLD**. Ship the ruling, not a module. The fork already covers the recoverable Notion surfaces (`Clients` as a relation, markdown `textRenderMode`, vault-local files, hover-open in phase 014); the remaining gaps are platform-blocked (no Obsidian user directory) or actively harmful (CDN fetch, swapping the renderer). There is no implementation sequence, no new module under `src/`, and no call-site edit — matching `spec.md` "Files to Change: (none in the plugin fork)" and "0 hours of fork work." **Only person/people and `me()` reopen**, and only if Obsidian gains a plugin-visible user/identity model **and** Wave 6 is explicitly entered. Notion CDN fetch and GoodBases-as-renderer **never** reopen. `style()`/`unstyle()` stays excluded even after identity. This plan records the **reserved** reopen-contract design so a future revisit is design-ready, not a blank slate.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented
- [ ] Success criteria measurable
- [ ] Dependencies identified

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Tests passing (if applicable)
- [ ] Docs updated (spec/plan/tasks)

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Decision-only packet. No runtime architecture is added. The fork keeps its existing engines, 12 column types, 7 view types, display-only rollups (`count|sum|avg|list`), and the markdown `textRenderMode`. None of the five excluded items gains a code path. What is recorded here is the **reserved** reopen-contract design — the shape any future build must follow — not a build.

### Locked reopen-contract design (reserved, not built)
The fork's established integration contract is the **EuroFormat isolated-diff model**: one new module under `src/data/` + 1–3 minimal call-site edits, rebase-safe. `src/data/EuroFormat.ts:1-42` is a 42-line isolated override ("Kept in one module so it stays a small, rebasable diff"), consumed at `src/views/CellRenderer.ts:13,198,2576` and `src/views/SummaryRenderer.ts:7,556`. Phase 014 REQ-004 locks the same shape (`014-record-detail-panel/spec.md:128`).

If the identity trigger (REQ-003) ever fires, the reserved build is **`src/data/PersonIdentity.ts`** only — map a plugin-visible user id onto the existing relation/wikilink value model (do **not** add a parallel directory). **No `"people"` union member is added** — `src/data/types.ts:50` and the relation pills at `src/views/CellRenderer.ts:193-195` stay as-is; relation pills already exist. The call-site cap is at most three:
1. Bases `me()` — `src/data/BaseExpression.ts:64` / `createBaseScope` at `:1099`
2. Native `me` — `FORMULA_BUILTIN_CONSTANTS` at `src/data/FormulaTokenizer.ts:22-24` + native evaluator `src/data/ComputedField.ts`
3. "Me" filter token — `src/data/QueryEngine.ts:91` (`matchesFilter`), mirroring the existing `ConditionalFormatRule.valueSource: "literal" | "today"` pattern (`src/data/types.ts:147`, `src/data/ConditionalFormatting.ts:12-20`)

Skip `src/views/CellRenderer.ts` while pills stay `case "relation"`. Treat `src/views/FilterPanelRenderer.ts:19` as out of budget unless the "Me" token is a literal `FilterRule.value` resolved in `QueryEngine` only.

A forced `style()` build is **not** an isolated EuroFormat-shaped override and no `FormulaStyle.ts` is reserved: it is a type-system project (no styled output type at `src/data/types.ts:106`; no underline/colors in the parser at `src/data/InlineMarkdown.ts:8-9`; `automatic` sync would persist `**`/`==` into YAML then re-parse under `textRenderMode: "markdown"`). Default computed sync is already `"display-only"` (`src/data/ComputedSync.ts:3,42-44`); `style()`/`unstyle()` stays excluded even after identity.

### Key Components
- **This decision spec**: Holds the five ranked exclusions, each reason, the revisit trigger, and the reserved reopen-contract design
- **`Clients` relation (existing)**: The cheaper/safer alternative to a person/people property; people are modelled as related notes (`src/data/types.ts:34-37,67-68`), not a user directory — the AppFlowy/Anytype pattern
- **Markdown `textRenderMode` (existing)**: Already renders bold/italic/strike/highlight/code/links (`src/data/InlineMarkdown.ts:8-9`, `src/views/CellRenderer.ts:212-228`), which is why `style()`/`unstyle()` output is redundant
- **Rejected surfaces**: person/people property, `me()`, GoodBases renderer, Notion CDN fetch

### Data Flow
None. No user directory is introduced, no CDN request is issued, and no renderer is swapped. A future build of person/people or `me()` would first need Obsidian to provide a plugin-visible user/identity model **and** an explicit Wave 6 entry; CDN fetch and GoodBases never reopen; `style()` stays excluded even after identity. The reserved `PersonIdentity.ts` shape is the design-ready-if-revisited path, not a build scheduled here.

### Edge cases & mobile/iCloud safety
- **Styled formula write-back:** `stringifyValue` has no rich-text branch and JSON-stringifies objects (`src/data/Stringify.ts:1-14`). `ComputedSyncMode` includes `"automatic"` (`src/data/types.ts:111`, `src/data/ComputedSync.ts:42-44`); persisting `**`/`==` into YAML then re-rendering under `textRenderMode: "markdown"` double-parses markup. Underline and per-argument colors cannot render even if stored (`src/data/InlineMarkdown.ts:8-9`).
- **Home-grown `me()`:** a settings-stored id is per-vault, not per-viewer. The same iCloud vault on two devices (or two people in one vault) would disagree; Obsidian plugins cannot read Sync account identity.
- **CDN copy:** download → iCloud re-upload (double transfer) while the Notion URL rotates hourly, so the vault copy is stale by design. Offline then serves frozen bytes.
- **GoodBases swap:** loses formulas, rollups, footers, and the note-database column model; 014 already recorded the toolbar-restyle revert (`014-record-detail-panel/spec.md:87`).
- **Mobile:** `src/views` has no `pointerType`/`touchstart`/hover-mobile handling; GoodBases-style OPEN is desktop hover. Any future chrome must follow 014 REQ-005: no desktop-only APIs, touch/tap fallback, **no writes** (`014-record-detail-panel/spec.md:129`). Rollups are already display-only and never written to frontmatter (`src/data/types.ts:69-70`).

This phase is iCloud- and mobile-safe because it is **display-only by omission**: no network fetch, no new frontmatter fields, no renderer replacement, no identity blob in the vault.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Decision recorded in this packet (`spec.md`) — Verdict DO-NOT-BUILD / HOLD
- [ ] No project structure, dependencies, or development environment for a plugin build

### Phase 2: Exclusion record (HOLD — no implementation)
- [ ] No implementation is planned (HOLD). There is no Core Implementation phase and no scheduled module.
- [ ] Do not add a person/people property, `me()`, or `style()`/`unstyle()` formula output
- [ ] Do not add a `"people"` union member to `ColumnDef.type` (`src/data/types.ts:50` stays as-is; relation pills already exist at `src/views/CellRenderer.ts:193-195`)
- [ ] Do not adopt GoodBases as the renderer or fetch Notion file CDN URLs
- [ ] Reserved design only: `src/data/PersonIdentity.ts` (people/`me()`, no parallel directory) — recorded, not created. No `FormulaStyle.ts` is reserved; `style()` is a type-system project, not an isolated override

### Phase 3: Verification
- [ ] No plugin verification is required until the revisit trigger fires
- [ ] Confirm the fork tree is not changed by this phase
- [ ] Revisit **only person/people and `me()`** if REQ-003 fires (identity API **and** explicit Wave 6). CDN/GoodBases never reopen; `style()` stays excluded even after identity

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None. No new module. | N/A |
| Integration | None. No new capability. | N/A |
| Manual | Confirm the fork is unchanged and this packet still reads Out of scope | Read `spec.md` / `plan.md` / `tasks.md` |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `Clients` relation | Internal | Existing model for people | The cheaper/safer alternative: people are modelled as a relation (`src/data/types.ts:34-37,67-68`), not a user directory — the AppFlowy/Anytype pattern |
| Markdown `textRenderMode` | Internal | Green (baseline) | Already renders bold/italic/strike/highlight/code/links (`src/data/InlineMarkdown.ts:8-9`); `style()` output is redundant |
| `012-files-column` ruling | Internal | Recorded | The Notion CDN fetch exclusion relies on that files-column decision (`012-files-column/spec.md:66,86`) |
| EuroFormat isolated-diff model | Internal | Established | The reserved reopen-contract shape: one module under `src/data/` + ≤3 call-site edits (`src/data/EuroFormat.ts:1-42`; `014-record-detail-panel/spec.md:128`) |
| Obsidian plugin-visible user/identity model | External | Not present | The only trigger that reopens person/people and `me()`. API exposes `vault`/`workspace`/`lastEvent` (pointer event, not identity) and no `user`/`account`/`profile` |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Not applicable to plugin code. This phase ships no fork diff (HOLD).
- **Procedure**: If a later session implements any excluded item against this decision (e.g. ships a home-grown people/`me()` store or a Notion CDN downloader), revert that diff and restore the DO-NOT-BUILD ruling in this packet. CDN fetch and GoodBases **never** reopen. `style()`/`unstyle()` stays excluded even after identity. A legitimate reopen of **person/people or `me()` only** must first satisfy REQ-003 (identity API **and** explicit Wave 6) and follow the reserved `PersonIdentity.ts` EuroFormat-shaped contract.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:l2-phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Setup) ──> Phase 2 (Exclusion record) ──> Phase 3 (Verify)
     (docs only)           (no build)                  (no plugin tests)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | None (no build follows) |
| Exclusion record | None | None (no implementation is planned) |
| Verify | None | None (no plugin gate) |

<!-- /ANCHOR:l2-phase-deps -->
---

<!-- ANCHOR:l2-effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | Decision already recorded in this packet |
| Exclusion record | None now (HOLD) | 0 hours of plugin work in this wave |
| Testing & Verification | None | 0 hours of plugin tests |
| **Total** | | **0 hours of fork work** (a future person/`me()` build is gated on identity **and** explicit Wave 6; CDN/GoodBases never; `style()` still skip; reserved `PersonIdentity.ts` design is L if ever reopened) |

<!-- /ANCHOR:l2-effort -->
---

<!-- ANCHOR:l2-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup created (N/A: no data or plugin change)
- [ ] Feature flag configured (N/A: no excluded item is implemented behind a flag)
- [ ] Monitoring alerts set (N/A: no runtime)

### Rollback Procedure
1. Immediate: do not merge any diff that implements an excluded item.
2. Revert code: N/A unless a later session added one; then revert that diff.
3. Database: N/A. No schema or note rewrite.
4. Verify: fork tree matches pre-phase baseline.
5. Notify: N/A. Personal vault, no product launch.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A. This phase writes no vault data.

<!-- /ANCHOR:l2-rollback -->

---

<!--
CORE TEMPLATE (~90 lines)
- Essential technical planning
- Simple phase structure
- Add L2/L3 addendums for complexity
-->
