---
title: "Implementation Plan: On-change Automations / Triggers"
description: "No build is planned: on-change automations, triggers, cron templates, and network buttons stay out of scope until the recorded revisit trigger fires."
trigger_phrases:
  - "on-change automations"
  - "onchange automations"
  - "implementation plan"
  - "vault change hook"
  - "cron templates"
  - "network buttons"
  - "no build planned"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/016-onchange-automations"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan review: checked DoR/DoD, clarified citations, added first-slice"
    next_safe_action: "Hold; do not start the engine while the revisit trigger is unfired"
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
# Implementation Plan: On-change Automations / Triggers

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | None for this phase (TypeScript plugin fork is not touched) |
| **Framework** | Obsidian plugin API (fork baseline only; no new hook) |
| **Storage** | Operator vault on iCloud; no new writes |
| **Testing** | None planned; there is no plugin diff to test |

### Overview
This is not a build — the synthesis Verdict is DO-NOT-BUILD / HOLD. On-change automations, triggers, recurring/cron templates, and network buttons stay unshipped because `vault.on("modify")` has no official origin bit, so iCloud/Obsidian Sync pulls look like user edits and a second desktop treating `origin === "external"` as "when field X changed" will write, sync, and retrigger (obsidian-log-keeper#23; `DataSource.ts:163-166` is only the `vault.on("modify")` registration — origin `"plugin" | "external"` is classified at `scheduleNotify` `1938-1966` (~`1949-1951`) and owned-path credits at `2009-2054`, but those credits classify only this process's writes, not foreign sync). The 10 iterations prove a EuroFormat-shaped engine is design-ready if the single revisit trigger fires, but design-readiness does not overturn the hold. There is no implementation sequence, no new module under `src/data/`, and no call-site edit. The cheaper, safer alternative is the read-only / no-build path: write nothing, leave DataSource owned-path windows as the only echo defense, keep the frozen 5-stage algorithm below as revisit-only design notes, and let finance "when X then Y" stay manual or formula/computed/rollup (display-only, `types.ts:69-70`).

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented
- [x] Success criteria measurable
- [x] Dependencies identified

### Definition of Done
- [x] All acceptance criteria met (REQ-001/002/003: do not build; revisit trigger recorded)
- [x] Tests passing (if applicable) — N/A: no plugin diff
- [x] Docs updated (spec/plan/tasks)

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Decision-only packet (DO-NOT-BUILD / HOLD). No runtime architecture is added now. The fork keeps its existing DataSource owned-path windows as the only iCloud-echo defense; this phase does not wrap, replace, or extend them. The frozen 5-stage algorithm and EuroFormat integration below are revisit-only design notes, activated solely by the spec's revisit trigger.

### Key Components
- **This decision spec**: Holds the DO-NOT-BUILD / HOLD ruling and the single revisit trigger
- **Existing DataSource owned-path windows**: Baseline defense against iCloud metadata-modify echo; unchanged (`DataSource.ts:2009-2055`)
- **Rejected-for-now surfaces**: `vault.on` change hook, trigger engine, cron/recurring templates, network buttons (mail/webhook/Slack/notifications)
- **Frozen design (revisit-only):** `src/data/AutomationEngine.ts` — 5-stage evaluator (subscribe/diff/match/act/record) that never registers `vault.on` itself; consumes `dataSource.onDataChanged` only

### Data Flow
None now. No handler is registered, no field-change event is consumed, and no network send is introduced. The frozen post-revisit data flow is: `dataSource.onDataChanged` (external-origin batches only) → field-level diff against the engine snapshot → `QueryEngine.applyFilters` match + transition chip → sequential local actions through `enqueueWrite` → in-memory run log. That path is not built here.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

Not a bug-fix plan. No producer or consumer symbol changes now. The table records the surfaces that must stay untouched, plus the frozen revisit-only design and its exact call sites.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| DataSource owned-path windows | Suppress iCloud metadata-modify echo for this process's writes (`DataSource.ts:2009-2055`) | unchanged | No new hook around DataSource; this phase must not wrap, replace, or bypass them |
| `vault.on` change / modify hook | Would fire on every metadata echo, including foreign sync pulls (obsidian-log-keeper#23) | not a consumer | Do not register a change hook; the frozen engine subscribes to `dataSource.onDataChanged` only (`DataSource.ts:124-129`) |
| Trigger / cron / recurring templates | Notion-like "when X changes, do Y" | not a consumer now | Do not add a template runner; cron is not even a Notion automation trigger (Thomas Frank) |
| Network buttons (mail/webhook/Slack/notifications) | Would send off-vault | not a consumer | Do not add a network-button surface (REQ-002; Notion limits webhooks to 5/automation, POST-only, properties-only) |
| People / identity model | Does not exist in the fork | unchanged | Do not invent recipients |

### Locked build design (revisit-only — DO NOT START while the hold stands)

**Module:** `src/data/AutomationEngine.ts` — types, snapshot cache, subscribe/diff/match/act/log, `start()` / `destroy()`. Header discipline matches `EuroFormat.ts:8-9` ("Kept in one module so it stays a small, rebasable diff."). Do NOT add `AutomationTypes.ts` / `AutomationModal.ts` / `AutomationListRenderer.ts` in the first post-revisit slice; those extra files are research gold-plating past the 1-module pattern.

**Call site 1 — `src/main.ts` ~212–213:** after `this.dataSource = new DataSource(this.app); this.dataSource.startListening(...)`, construct and `start()` the engine; `onunload` calls `destroy()` (mirror `DataSource.destroy`, `DataSource.ts:195-210`). On `Platform.isMobile`, skip `start()` of evaluation (list may still render).

**Call site 2 — `src/settings.ts` `DEFAULT_SETTINGS` 21–33:** add `automations: []` (and the matching `PluginSettings` field / `createDefaultSettings`).

**Call site 3 — `src/settings.ts` `SettingsTab.display()` ~61+:** one settings group: rule rows, enabled toggle, last-run chip, Add/Edit inline using existing filter widgets. No ribbon, no command view, no toasts per run.

**Frozen 5-stage algorithm (post-revisit only):**

1. **Subscribe** — `dataSource.onDataChanged` only (`DataSource.ts:124-129`), same pattern as `DatabaseView.ts:742` and `EmbeddedDatabaseRenderer.ts:422`. Drop `origin === "plugin"` batches. Raw `vault.on("modify")` is ruled out: DataSource already wraps it (`DataSource.ts:145-192`) and a second listener bypasses owned-path credits (`DataSource.ts:2009-2055`). **`origin === "external"` is not the same as a user edit** — a foreign sync pull is also external; do not treat external batches as user edits unless the revisit trigger (a safe first-class hook) is actually fired (synthesis Q1–Q2; `editor-change` is open-file-only, log-keeper#23).
2. **Diff** — change unit = `(path, field, oldValue, newValue)`. Old value from the engine's snapshot (`getRecordSnapshot`, `DataSource.ts:239-244`); new value from the batch path; compare with `valuesEqual` semantics (`DataSource.ts:1730-1736` is **private** — the engine cannot import it; it must copy the JSON equality semantics). Carry values in the diff (do not copy AppFlowy's field-id-only `UpdatedRowPB`; Notion webhooks are signal-only and force a follow-up GET — the vault avoids that tax).
3. **Match** — `QueryEngine.applyFilters(..., "and"|"or")` (`QueryEngine.ts:74-95`) over `FilterRule[]` (`types.ts:137-141`) **plus** a transition chip (changed to / from / any) — `applyFilters` alone is a **state** matcher (it tests the current row), not a **transition** matcher, so calling it alone would fire on every external touch of a file that already matches. Optional formula predicates: `evaluateBaseFilterExpression` (`BaseExpression.ts:59-62`, file/frontmatter-scoped — no Trigger-page context in v1). No new expression language.
4. **Act** — sequential local actions only: `editProperty` (set/add/remove/clear), then `addRecord` if in scope. Every write through `enqueueWrite` (`DataSource.ts:99-122`) so `markOwnedPath` mints 5s metadata+vault credits before IO; `frontmatterOverrides` keep the UI consistent for 10s (`DataSource.ts:1664-1688`). Hard no-chaining: actions are plugin-origin, so stage 1 never re-enters (Notion: automations cannot trigger automations). On `Platform.isMobile`, skip `start()` of evaluation — the settings list may still render, but no actions fire (`CellRenderer.ts:1484` pattern).
5. **Record** — in-memory run log shaped like Anytype's `{ id, type, status, createTime, isLocal, payload }` (`model/notification.ts:6-21`); optional bounded ring buffer in plugin settings JSON, never vault frontmatter.

**Debounce stack (all three, not one):** DataSource 80ms merge (`DataSource.ts:1994-1998`) → RefreshCoordinator idle 2s / max 10s (`RefreshCoordinator.ts:97-103`, `RefreshCoordinator.ts:61`) → engine trailing 3s per `(ruleId, path)` with cancel-on-newer (AppFlowy `DebounceNotificationSender`, `debounce.rs:28-52`; Notion's 3s window). Failure: retry at most twice per change, then pause the engine after five consecutive failures — this max-two/pause-after-five is **new engine policy**, not existing behavior (`RefreshCoordinator.ts:140-144` re-queues dirty paths on error with no cap).

**Imports are one-directional:** the engine imports `DataSource` / `QueryEngine` / `BaseExpression` / `types`; only `main.ts` and `settings.ts` import the engine — the EuroFormat graph (`EuroFormat.ts` imported only from `CellRenderer.ts:13` and `SummaryRenderer.ts:7`).

**Full EuroFormat surface (the "1 module + 3 call sites" shorthand omits two paired edits):** the budget also covers `PluginSettings` (`types.ts:547-568`, paired with call site 2) and additive `automation.*` keys in `src/i18n.ts` (paired with call site 3 / T007). Count them when sizing the slice.

**First post-revisit slice (synthesis Q4 default):** same-row `Edit property` only — omit T005 `addRecord`, T008 bulk "Edit pages in", T009 view-scope, and T010 formulas from the first slice. Bulk requires an affects-N count before save if it ever ships (`QueryEngine.ts:74-95`).

### Edge cases & mobile/iCloud safety (mandatory if the frozen engine is ever applied)

- **Why the current phase is safe:** it writes nothing — no hook, no template runner, no network send. DataSource owned-path windows stay the only echo defense (`DataSource.ts:2009-2055`) and this phase must not wrap, replace, or bypass them.
- **Sync-as-external (the residual loop):** owned-path credits suppress this process's writes, not Device B's iCloud pull. `workspace.on("editor-change")` is user-only but open-file-only (log-keeper#23). Two desktops both running the engine remain unsafe; the spec's non-iCloud (or first-class hook) trigger is the real gate, not "we subscribed to `onDataChanged`".
- **iCloud uploader mtime churn:** iCloud can rewrite files during upload; ecosystem mitigation is debounce past the notify window (obsidian-icloud-mirror; mnott/Obsidian-iCloud three-way mtime). Engine window ≥ 3s; never add a parallel mtime writer.
- **Closed-app / mobile / CLI edits:** reconcile on `start()` against `getRecordSnapshot` (`DataSource.ts:239-244`); iCloud can present delete+create with a fresh mtime (Vault Change Feed) — treat identical-content delete+create as rename (`DataSource.ts:175-191` already remaps overrides).
- **Field lifecycle:** rules key by property key (`FilterRule.field`). `ColumnPropertySync.rename/delete/convert` (`src/views/ColumnPropertySync.ts:22-53`, not `data/`) can orphan a rule — validate at load/eval, surface "field X no longer exists", re-check operators with `getFilterOperatorsForColumn` (`FilterPanelRenderer.ts:19-40`). Never fail silent.
- **Missing/renamed database:** `databaseId` miss → skip and disable-with-reason; remap `oldPath→newPath` from DataSource rename (`DataSource.ts:175-191`).
- **Rule interactions:** no chaining (plugin origin). Two rules on one field: last-writer-wins by stable id order, documented in the UI.
- **Permission / scope:** actions write only inside the target database's source rules; coerce values via existing column types (no raw YAML injection; `BaseExpression` already blocks `fetch`/`eval`).
- **Performance:** lazy per-changed-path snapshot, O(fields in that file) diff, O(rules × matched files) match; ring-buffer the log. A personal-finance vault (hundreds of files, dozens of rules) stays cheap if you never full-vault re-diff.
- **Failure storms:** max two retries per change; pause after five consecutive failures (`RefreshCoordinator.ts:113-144` as the retry idiom).
- **Mobile:** evaluation + actions off (`Platform.isMobile`). Settings list may be readable; Add/Edit/Delete disabled. Desktop remains the only writer; that invariant fails if two desktops are online.
- **Run log persistence:** if a ring buffer is stored in plugin `data.json`, that file can sync via iCloud/Obsidian Sync — this is not note churn, but it is still a multi-device surface that can replicate last-run chips across machines. Keep it small (last ~200 runs, memory-first) and never write run history into note frontmatter.

Required inventories:
- Same-class producers: none now. This phase adds no field, helper, literal, or error pattern.
- Consumers of changed symbols: none now. No symbol changes.
- Matrix axes: iCloud vs non-iCloud storage; presence vs absence of a safe first-class change-hook. A build is allowed only when at least one axis leaves the unsafe iCloud-plus-raw-hook cell.
- Algorithm invariant: do not write the vault in response to a metadata-modify echo; never bypass DataSource owned-path windows.

<!-- /ANCHOR:affected-surfaces -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] DO-NOT-BUILD / HOLD decision recorded in this packet (`spec.md`)
- [ ] No project structure, dependencies, or development environment for a plugin build

### Phase 2: Core Implementation
- [ ] No core implementation is planned (the recommendation is NOT to build now)
- [ ] Do not add a `vault.on` change hook, trigger engine, or cron/recurring template
- [ ] Do not add network buttons (mail, webhook, Slack, notifications)
- [ ] Do not start `src/data/AutomationEngine.ts` or its 3 call sites while the hold stands (frozen as revisit-only design notes)

### Phase 3: Verification
- [ ] No plugin verification is required until the revisit trigger fires
- [ ] Confirm the fork tree is not changed by this phase
- [ ] Revisit only if the vault is on a non-iCloud backend, OR Obsidian ships a safe first-class change-hook that distinguishes user edits from sync/iCloud metadata echo — not on design-readiness alone

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None. No new module. | N/A |
| Integration | None. No new hook or network path. | N/A |
| Manual | Confirm the fork is unchanged and this packet still reads On Hold (DO-NOT-BUILD) | Read `spec.md` / `plan.md` / `tasks.md` |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Non-iCloud storage backend | External | Red | A change-hook build stays unsafe; this phase remains On Hold (DO-NOT-BUILD) |
| Obsidian safe first-class change-hook (distinguishes user edits from sync/iCloud metadata echo) | External | Red | A raw `vault.on` hook stays unsafe; this phase remains On Hold (DO-NOT-BUILD) |
| People / identity model | Internal | Red | Network buttons have no recipient surface |
| DataSource owned-path windows | Internal | Green | Existing echo defense; do not bypass it |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Not applicable to plugin code. This phase ships no fork diff.
- **Procedure**: If a later session adds a change hook, trigger engine, cron template, or network button against this DO-NOT-BUILD / HOLD decision, revert that diff and restore the On Hold ruling in this packet.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:l2-phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Setup) ──> Phase 2 (Core) ──> Phase 3 (Verify)
     (docs only)      (no build)         (no plugin tests)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | None (no build follows) |
| Core | None | None (no implementation is planned) |
| Verify | None | None (no plugin gate) |

<!-- /ANCHOR:l2-phase-deps -->
---

<!-- ANCHOR:l2-effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | DO-NOT-BUILD / HOLD decision already recorded in this packet |
| Core Implementation | None | 0 hours of plugin work |
| Testing & Verification | None | 0 hours of plugin tests |
| **Total** | | **0 hours of fork work** |

<!-- /ANCHOR:l2-effort -->
---

<!-- ANCHOR:l2-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup created (N/A: no data or plugin change)
- [ ] Feature flag configured (N/A: no feature)
- [ ] Monitoring alerts set (N/A: no runtime)

### Rollback Procedure
1. Immediate: do not merge any automation, trigger, cron, or network-button diff.
2. Revert code: N/A unless a later session added a forbidden hook; then revert that diff.
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
