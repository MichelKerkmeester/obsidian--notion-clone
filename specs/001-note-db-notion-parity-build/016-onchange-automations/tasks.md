---
title: "Tasks: On-change Automations / Triggers"
description: "No plugin tasks: this Wave 6 packet holds the out-of-scope ruling and does not schedule a build."
trigger_phrases:
  - "on-change automations"
  - "onchange automations"
  - "tasks"
  - "no build planned"
  - "vault change hook"
  - "cron templates"
  - "network buttons"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/016-onchange-automations"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan opt 1: marked T001/T013 done, reframed completion criteria"
    next_safe_action: "Hold; ranked backlog is revisit-only — do not start [B] items"
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
# Tasks: On-change Automations / Triggers

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
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Hold the Notion automation gap — ship lock (Wave 6 decision record). Effort: **S**. Files: none in the plugin fork. This packet stays On Hold (DO-NOT-BUILD) and changes no fork code (`spec.md` REQ-001/REQ-002; "Files to Change: (none in the plugin fork)"). Evidence: `research/synthesis.md` Ranked backlog item 1.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

No plugin implementation is planned now — the synthesis Verdict is DO-NOT-BUILD / HOLD. The ranked backlog below is the design-ready-if-revisited plan; every item is **blocked [B]** on the spec's revisit trigger (non-iCloud backend OR a safe first-class Obsidian change-hook that distinguishes user edits from sync/iCloud metadata echo). Do not start any [B] item while the hold stands. Items marked **never** are out of scope under this spec regardless of the trigger.

- [B] T002 Same-row when/do: page added + property edited → `Edit property`. Effort: **M**. Files: new `src/data/AutomationEngine.ts`; call sites `src/main.ts` (after `startListening`, lines 212–213) and `src/settings.ts` (`DEFAULT_SETTINGS` 21–33). Build-order: blocked on the revisit trigger; do not start while T001 holds. **First post-revisit slice = same-row `editProperty` only** (synthesis Q4 default: no bulk); omit T005/T008/T009/T010 from the first slice. Evidence: `DataSource.ts:124-129` (`onDataChanged`) + `DataSource.ts:1938-2055` (origin from 5s dual-channel owned-path credits). `research/synthesis.md` Ranked backlog item 2.
- [B] T003 Any/all trigger composition without a new language. Effort: **S**. Files: `src/data/QueryEngine.ts` (call `applyFilters`, do not rewrite it); `src/data/types.ts` `FilterRule` 137–141; optional formula predicates via `src/data/BaseExpression.ts:59-70`. Build-order: after T002. Evidence: `QueryEngine.ts:74-95` (`logic: "and" | "or"`). `research/synthesis.md` Ranked backlog item 3.
- [B] T004 Notion-like evaluation window, no chaining, echo-free writes. Effort: **S**. Files: internals of `AutomationEngine.ts` only; writes must go through `DataSource.ts:99-122` (`enqueueWrite` already calls `markOwnedPath`) and `DataSource.ts:247-249` (`markPluginWrite`). Build-order: same commit as T002. Evidence: `DataSource.ts:1968-1999` (80ms batch, external-wins) + `RefreshCoordinator.ts:97-103` (idle 2s) / `RefreshCoordinator.ts:61` (max 10s) + AppFlowy trailing cancel/re-arm (`flowy-notification/src/debounce.rs:21-52`). `research/synthesis.md` Ranked backlog item 4.
- [B] T005 Add record in another database (local "Add page to"). Effort: **M**. Files: `AutomationEngine.ts` action union; reuse existing create path (no new IO primitive). Build-order: after T002; after T004 so creates are plugin-origin and cannot re-enter evaluation. **Omit from the first post-revisit slice** (same-row `editProperty` only). Evidence: fork write serialization `DataSource.ts:99-122`. `research/synthesis.md` Ranked backlog item 5.
- [B] T006 Startup reconciliation + delete+create-as-rename. Effort: **M**. Files: `AutomationEngine.ts` snapshot cache using `DataSource.getRecordSnapshot` (`DataSource.ts:239-244`) + rename remap (`DataSource.ts:175-191`). Build-order: same release as T002 (unsafe to evaluate without a baseline). Evidence: `DataSource.ts:239-244` + Vault Change Feed iCloud mtime/delete+create note. `research/synthesis.md` Ranked backlog item 6.
- [B] T007 Settings when/do list (display-only on mobile). Effort: **M**. Files: `src/settings.ts` `SettingsTab.display()` (anchor `settings.ts:61-69`); reuse `getFilterOperatorsForColumn` (`FilterPanelRenderer.ts:19-40`) and `createDropdownField`; additive `automation.*` keys in `src/i18n.ts`. Build-order: after T002; UI without the engine is dead chrome. Evidence: EuroFormat call-site shape `EuroFormat.ts:8-9` + `CellRenderer.ts:13` / `SummaryRenderer.ts:7`. `research/synthesis.md` Ranked backlog item 7.
- [B] T008 Bulk "Edit pages in". Effort: **L**. Files: same engine; `QueryEngine.applyFilters` for the target set; mandatory affects-N count before save. Build-order: after T002–T005; omit from any first post-revisit slice (personal-finance blast radius; last-writer-wins across rules). Evidence: `QueryEngine.ts:74-95`. `research/synthesis.md` Ranked backlog item 8.
- [B] T009 View-scoped evaluation. Effort: **S**. Files: `AutomationEngine.ts` calling `applyFilters` against the view's `FilterRule[]`; no new matcher. Build-order: after T003. **Omit from the first post-revisit slice** (same-row `editProperty` only). Evidence: `QueryEngine.ts:74-95`. `research/synthesis.md` Ranked backlog item 9.
- [B] T010 Trigger-page formula variables. Effort: **L**. Files: `BaseExpression.ts` (out of this phase's frozen scope — predecessor/formula packets own it). Build-order: after a revisit AND an explicit formula-context expansion; not part of the EuroFormat automations module; omit from the first post-revisit slice. Evidence: `BaseExpression.ts:12-21,59-70` (`BaseExpressionContext` is file/frontmatter-scoped; DANGEROUS_TOKENS already blocks `fetch`/`eval`/`new`). `research/synthesis.md` Ranked backlog item 10.
- [B] T011 Slack / webhook / mail / notification buttons. Effort: n/a. Files: none. Build-order: **never** under this spec (no people/identity model; network dependency). Evidence: `spec.md` REQ-002. `research/synthesis.md` Ranked backlog item 11.
- [B] T012 Cron / recurring-template triggers. Effort: n/a. Files: none. Build-order: **never**; not even a Notion-portable target (Notion itself does not fire automations from recurring/template-created pages). Evidence: `spec.md` REQ-001 + Thomas Frank origin-filter. `research/synthesis.md` Ranked backlog item 12.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T013 Confirm the plugin fork is unchanged by this phase (no `vault.on` hook, no `AutomationEngine.ts`, no network-button surface)
- [ ] T014 Revisit only if the recorded trigger fires (`spec.md` REQ-003): a non-iCloud storage backend, OR Obsidian gaining a safe first-class change-hook that distinguishes user edits from sync/iCloud metadata echo — not on design-readiness alone (`onDataChanged` + owned-path credits are NOT that hook; obsidian-log-keeper#23)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] T001 done (ship lock recorded in this packet; `spec.md` REQ-001/REQ-002, `research/synthesis.md` Ranked backlog item 1)
- [x] T013 done (fork unchanged by this phase; `plan.md` §3 "No runtime architecture is added now", `spec.md` "Files to Change: (none in the plugin fork)")
- [ ] T014 pending (revisit gate — stays open until the recorded trigger fires)
- T002–T012 stay `[B]`/`never` — these are NOT completion blockers; they are revisit-only by design

This phase is On Hold (DO-NOT-BUILD). Completion = T001 done and T002–T012 stay `[B]`/`never`; T014 stays pending as the standing revisit gate. The [B] ranked backlog (T002–T010) is revisit-only and stays blocked until the spec's revisit trigger fires; T011/T012 are never under this spec.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`

<!-- /ANCHOR:cross-refs -->

---

<!--
CORE TEMPLATE (~60 lines)
- Simple task tracking
- 3 phases: Setup, Implementation, Verification
- Add L2/L3 addendums for complexity
-->
