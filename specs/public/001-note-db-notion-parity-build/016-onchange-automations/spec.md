---
title: "Feature Specification: On-change Automations / Triggers"
description: "Wave 6 out-of-scope decision: reject on-change automations, triggers, cron templates, and network buttons because they are unsafe on an iCloud-synced personal-finance vault."
trigger_phrases:
  - "on-change automations"
  - "onchange automations"
  - "vault change hook"
  - "field change trigger"
  - "cron templates"
  - "network buttons"
  - "icloud metadata echo"
  - "out of scope automations"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/016-onchange-automations"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan review: fixed origin citation, added formula/rollup alternative"
    next_safe_action: "Hold; revisit only if the recorded trigger fires"
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
# Feature Specification: On-change Automations / Triggers

> Adjacent phases: predecessor `015-two-way-write-back`, successor `017-excluded-parity-items`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P2 |
| **Status** | On Hold (DO-NOT-BUILD) |
| **Created** | 2026-08-24 |
| **Branch** | `016-onchange-automations` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion-style on-change automations ("when field X changes, do Y"), triggers, and recurring/cron templates look like remaining parity gaps, but the synthesis Verdict is DO-NOT-BUILD / HOLD. The 10 research iterations prove a EuroFormat-shaped engine is design-ready if the single revisit trigger fires, because the fork already has origin-tagged `onDataChanged` batches, `FilterRule` matching, and serialized writes — but design-readiness does not overturn the hold. The single biggest risk is that iCloud/Obsidian Sync pulls still look like user edits: `vault.on("modify")` has no official origin bit, so a second desktop treating `origin === "external"` as "when field X changed" will write, sync, and retrigger (obsidian-log-keeper#23; `DataSource.ts:163-166` is only the `vault.on("modify")` registration — origin `"plugin" | "external"` is classified at `scheduleNotify` `1938-1966` (~`1949-1951`) and owned-path credits at `2009-2054`, but those credits classify only this process's writes, not foreign sync). Network buttons (mail, webhook, Slack, notifications) add a network dependency and need a people/identity model the fork does not have.

### Purpose
Record the Wave 6 DO-NOT-BUILD / HOLD decision: do not build automations, triggers, cron templates, or network buttons now. The cheaper, safer alternative is the read-only / no-build path — write nothing, leave DataSource owned-path windows as the only echo defense, keep the frozen 5-stage algorithm as design-ready-if-revisited notes, and let finance "when X then Y" stay manual or formula/computed/rollup (display-only, `types.ts:69-70`). Revisit only if the vault moves off iCloud onto a non-iCloud storage backend, or Obsidian gains a safe first-class change-hook that distinguishes user edits from sync/iCloud metadata echo.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Recording the DO-NOT-BUILD / HOLD decision for on-change automations, triggers, and recurring/cron templates
- Recording why a `vault.on` change hook is unsafe on iCloud: `vault.on("modify")` has no official origin bit, so iCloud/Obsidian Sync pulls look like user edits and a second desktop will write, sync, and retrigger (obsidian-log-keeper#23; `DataSource.ts:163-166` is only the `vault.on("modify")` registration; origin is classified at `scheduleNotify` `1938-1966` (~`1949-1951`) and owned-path credits at `2009-2054`, but those classify only this process's writes, not foreign sync)
- Recording why network buttons are out (network dependency, no people/identity model; REQ-002)
- Recording the single revisit trigger: a non-iCloud storage backend, or Obsidian gaining a safe first-class change-hook that distinguishes user edits from sync/iCloud metadata echo
- Capturing the frozen 5-stage algorithm and the EuroFormat integration (1 module + 3 call sites) as design-ready-if-revisited notes, not an active build plan

### Out of Scope
- Any plugin implementation of automations, triggers, cron/recurring templates, or network buttons (the recommendation is NOT to build now)
- Two-way write-back (owned by predecessor `015-two-way-write-back`)
- Excluded parity items person/style()/GoodBases (owned by successor `017-excluded-parity-items`)
- Changes to the existing engines, column types, view types, rollups, or DataSource owned-path windows (those are baseline, not this gap)
- Trigger-page formula variables (`BaseExpression.ts` is file/frontmatter-scoped and owned by predecessor/formula packets; ranked backlog item 10)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| (none in the plugin fork) | None | This phase is a DO-NOT-BUILD / HOLD decision record only; no module, call-site, or CSS change. The frozen `src/data/AutomationEngine.ts` design + 3 call sites are recorded as revisit-only notes, not scheduled work |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Do not add on-change automations, triggers, or recurring/cron templates now (DO-NOT-BUILD / HOLD) | The fork has no new `vault.on` change hook, trigger engine, or cron/recurring template module; the frozen 5-stage algorithm lives only as revisit-only design notes |
| REQ-002 | Do not add network buttons (mail, webhook, Slack, notifications) | The fork has no new network-button surface and no people/identity model |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | Keep the revisit trigger explicit and single | This spec names one trigger: a non-iCloud storage backend, OR Obsidian gaining a safe first-class change-hook that distinguishes user edits from sync/iCloud metadata echo (`onDataChanged` + owned-path credits are NOT that hook) |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: **Given** this packet stays On Hold (DO-NOT-BUILD), **Then** the plugin fork gains no automation hook, trigger engine, cron template, or network-button surface.
- **SC-002**: **Given** an iCloud-synced personal-finance vault, **Then** DataSource owned-path windows remain the only defense against metadata-modify echo and this phase does not wrap, replace, or bypass them.
- **SC-003**: **Given** a later owner review, **Then** work re-enters only if the vault is on a non-iCloud storage backend, OR Obsidian ships a safe first-class change-hook that distinguishes user edits from sync/iCloud metadata echo — not on design-readiness alone.
- **SC-004**: **Given** two desktops both online, **Then** the engine stays unshipped, because `origin === "external"` cannot tell a foreign sync pull from a real user edit (obsidian-log-keeper#23).

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | A change hook on iCloud retriggers from metadata-modify echo, and a second desktop treats foreign sync pulls as user edits | High: write storms and churny note rewrites in a personal-finance vault (obsidian-log-keeper#23; `DataSource.ts:163-166` is only the `vault.on("modify")` registration; origin at `scheduleNotify` `1949-1951`, credits at `2009-2054` classify only this process's writes) | Keep this phase On Hold (DO-NOT-BUILD); leave DataSource owned-path windows as the only echo defense |
| Risk | Network buttons without a people/identity model | High: mail/webhook/Slack/notification sends have no safe recipient surface (Notion itself limits webhooks to 5/automation, POST-only, properties-only) | Keep network buttons Out of scope |
| Risk | Reopening on design-readiness alone | High: the 10 iterations prove the engine is design-ready, which is the temptation to ship unsafely | Reopen only on the storage/hook trigger, not on design-readiness |
| Dependency | iCloud as the live storage backend | High if a build is attempted: echo loop is inherent and `vault.on("modify")` has no origin bit | Revisit only after a non-iCloud backend |
| Dependency | Obsidian safe first-class change-hook | High if a build is attempted: a raw `vault.on` hook is unsafe here | Revisit only if Obsidian ships a hook that distinguishes user edits from sync/iCloud metadata echo |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- None. The revisit trigger is recorded; this phase does not wait on a further owner decision to stay On Hold (DO-NOT-BUILD). The synthesis open questions (single-desktop-writer sufficiency, `editor-change` as origin hint, bulk "Edit pages in" slicing, rules-home, run-log persistence, network/cron flags) are operator decisions for a future revisit, not blockers to staying out of scope now.

<!-- /ANCHOR:questions -->

---

<!--
CORE TEMPLATE (~80 lines)
- Essential what/why/how only
- No boilerplate sections
- Add L2/L3 addendums for complexity
-->
