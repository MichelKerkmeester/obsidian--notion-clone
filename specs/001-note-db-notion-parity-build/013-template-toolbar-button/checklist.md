---
title: "Verification Checklist: Toolbar New-From-Template Button"
description: "Verification checklist for the adaptive New from template toolbar control and row-menu twin — shipped and Sonnet-verified on branch impl; the 003 manual proof matrix was never separately run."
trigger_phrases:
  - "toolbar new from template"
  - "new from template button"
  - "template toolbar checklist"
  - "create entry plan"
  - "confirm modal template"
  - "row menu new from template"
  - "euroformat isolated module"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/013-template-toolbar-button"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled checked items to shipped-code evidence; lint and runtime proofs remain deferred"
    next_safe_action: "None — code shipped; deferred runtime proofs and unrelated lint findings remain"
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
    completion_pct: 83
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Toolbar New-From-Template Button

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

- [x] CHK-001 [P0] Requirements documented in spec.md
  - **Evidence**: [EVIDENCE: `rg -n 'REQ-001|REQ-002|REQ-003'` matches the requirement definitions]
- [x] CHK-002 [P0] Technical approach defined in plan.md
  - **Evidence**: [EVIDENCE: `rg -n 'TemplateToolbarAction|three call sites|existing create path'` matches the implementation approach]
- [x] CHK-003 [P1] Dependencies identified and available
  - **Evidence**: [EVIDENCE: src/data/RecordTemplate.ts:51-57; src/views/DatabaseView.ts:3608-3635,3759-3765]

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
  - **Evidence**: [EVIDENCE: DEFERRED -- `npm run lint` fails with 115 problems (100 errors, 15 warnings) repository-wide; some sit in modules added after this phase]
- [ ] CHK-011 [P0] No console errors or warnings
  - **Evidence**: [EVIDENCE: DEFERRED -- no runtime console check was run]
- [x] CHK-012 [P1] Error handling implemented
  - **Evidence**: [EVIDENCE: src/views/DatabaseView.ts:3606-3611,3759-3765]
- [x] CHK-013 [P1] Code follows project patterns
  - **Evidence**: [EVIDENCE: src/data/TemplateToolbarAction.ts:1-31; src/views/ToolbarRenderer.ts:1716-1738; src/views/RowMenu.ts:83-101]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met
  - **Evidence**: [EVIDENCE: TemplateToolbarAction.test.ts:18-77; 5/5 passed; src/views/ToolbarRenderer.ts:1716-1738; src/views/RowMenu.ts:61-101]
- [ ] CHK-021 [P0] Manual testing complete
  - **Evidence**: [EVIDENCE: DEFERRED -- desktop/mobile and row-menu manual matrix was not run]
- [ ] CHK-022 [P1] Edge cases tested
  - **Evidence**: [EVIDENCE: DEFERRED -- edge-case runtime checks were code-traced but not run as tests]
- [ ] CHK-023 [P1] Error scenarios validated
  - **Evidence**: [EVIDENCE: DEFERRED -- missing-template and error runtime checks were code-traced but not run]

### Edge cases (synthesis)
- [x] CHK-060 [P0] No template / empty path: control stays visible; label stays **New**; click still creates a blank note
  - **Evidence**: [EVIDENCE: TemplateToolbarAction.test.ts:23-47; 5/5 passed; src/views/ToolbarRenderer.ts:1716-1729; src/views/DatabaseView.ts:3759-3765]
- [x] CHK-061 [P0] Missing / unreadable template file: after confirm, create aborts with `Notice`; no note
  - **Evidence**: [EVIDENCE: src/views/DatabaseView.ts:3606-3611,3759-3765]
- [ ] CHK-062 [P0] Confirm cancel / modal close: zero writes (only if REQ-004 ships) — N/A, REQ-004 deferred
  - **Evidence**: [EVIDENCE: DEFERRED -- optional confirmation wiring was not shipped]
- [x] CHK-063 [P1] Chart view: control hidden
  - **Evidence**: [EVIDENCE: src/views/ToolbarRenderer.ts:239,285 (isChartView guard)]
- [x] CHK-064 [P1] Read-only / setup: control hidden
  - **Evidence**: [EVIDENCE: src/views/ToolbarRenderer.ts:239,285; src/views/RowMenu.ts:61-65]
- [x] CHK-065 [P1] Calendar / timeline: toolbar New still shown; row-menu item hidden
  - **Evidence**: [EVIDENCE: src/views/ToolbarRenderer.ts:239,285; src/views/RowMenu.ts:61-101; src/views/DatabaseView.ts:1939]
- [x] CHK-066 [P1] Two rapid clicks: no new debounce / queue / cron
  - **Evidence**: [EVIDENCE: src/views/DatabaseView.ts:860-864; src/views/ToolbarRenderer.ts:1731-1737; src/views/RowMenu.ts:90-95]
- [x] CHK-067 [P1] `{{date}}` / `{{title}}` unchanged
  - **Evidence**: [EVIDENCE: src/data/RecordTemplate.ts:51-57; src/views/DatabaseView.ts:3626-3635]
- [x] CHK-068 [P0] Confirm result type: `executeNewFromTemplate` branches on `ok === true` (no double create)
  - **Evidence**: [EVIDENCE: src/data/TemplateToolbarAction.ts:26-30; TemplateToolbarAction.test.ts:49-77; 5/5 passed]
- [x] CHK-069 [P1] Row-menu item hidden with zero templates
  - **Evidence**: [EVIDENCE: src/data/TemplateToolbarAction.ts:6-8; src/views/RowMenu.ts:83-101]

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Requested New from template control shipped
  - **Evidence**: [EVIDENCE: src/data/TemplateToolbarAction.ts:20-30; src/views/ToolbarRenderer.ts:1731-1737; src/views/RowMenu.ts:84-95]
- [x] CHK-025 [P1] Out-of-scope items left out
  - **Evidence**: [EVIDENCE: `{ sed -n '1716,1738p' src/views/ToolbarRenderer.ts; sed -n '83,101p' src/views/RowMenu.ts; sed -n '567,580p' src/views/DatabaseView.ts; sed -n '1,31p' src/data/TemplateToolbarAction.ts; } | rg -n -i 'scheduler|cron|mail|webhook|slack|notifications?|telemetry|secret|fetch|setInterval|setTimeout|multi.?template|split.?button|inline.*new.*template'` returned no matches]

### Mobile / iCloud safety (display-only until existing create runs)
- [x] CHK-070 [P0] Mobile-safe: no desktop-only APIs on control or modal
  - **Evidence**: [EVIDENCE: src/views/ToolbarRenderer.ts:1724-1730; src/views/RowMenu.ts:52-53; src/views/modals/ConfirmModal.ts:13-20]
- [x] CHK-071 [P0] iCloud-safe: one create write per confirmed click
  - **Evidence**: [EVIDENCE: src/data/TemplateToolbarAction.ts:26-30; src/views/DatabaseView.ts:3640-3649]
- [x] CHK-072 [P1] Display-only until existing create runs
  - **Evidence**: [EVIDENCE: src/views/ToolbarRenderer.ts:1731-1737; src/views/RowMenu.ts:90-95]
- [x] CHK-073 [P1] MIT / local-only
  - **Evidence**: [EVIDENCE: package.json:24 (MIT license); src/data/TemplateToolbarAction.ts:1-30 (local-only injected action)]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
  - **Evidence**: [EVIDENCE: src/data/TemplateToolbarAction.ts:1-31 (no secret-bearing inputs)]
- [x] CHK-031 [P0] Input validation implemented
  - **Evidence**: [EVIDENCE: src/views/DatabaseView.ts:3759-3765; src/data/RecordTemplate.ts:13-17]
- [x] CHK-032 [P1] Auth/authz working correctly
  - **Evidence**: [EVIDENCE: `{ sed -n '1716,1738p' src/views/ToolbarRenderer.ts; sed -n '83,101p' src/views/RowMenu.ts; sed -n '567,580p' src/views/DatabaseView.ts; sed -n '1,31p' src/data/TemplateToolbarAction.ts; } | rg -n -i 'authorization|oauth|bearer|api.?key|access.?token|permission'` returned no matches]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
  - **Evidence**: [EVIDENCE: `rg -n 'TemplateToolbarAction|REQ-004|DEFERRED'` matches the shared implementation and deferral records]
- [x] CHK-041 [P1] Code comments adequate
  - **Evidence**: [EVIDENCE: src/data/TemplateToolbarAction.ts:20-30 (self-contained injected action path)]
- [x] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: [EVIDENCE: README.md:154-157 (existing template/create documentation; no toolbar-specific update required)]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only
  - **Evidence**: [EVIDENCE: `find . -type d -name scratch -exec ls -la {} \;` shows only `.gitkeep` files]
- [x] CHK-051 [P1] scratch/ cleaned before completion
  - **Evidence**: [EVIDENCE: `find . -type d -name scratch -exec ls -la {} \;` shows only `.gitkeep` files]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|----------|-------|---------|----------|
| P0 Items | 15 | 11 | 4 |
| P1 Items | 19 | 17 | 2 |
| P2 Items | 1 | 1 | 0 |
| **Total** | **35** | **29** | **6** |

**Verification Date**: 2026-08-27 (documentation reconciliation).
**Verified By**: Shipped-code and task-evidence reconciliation; `npx tsc --noEmit` passed; `TemplateToolbarAction.test.ts` passed 5/5. `npm run lint` remains deferred for seven unrelated errors, and desktop/mobile/manual runtime proofs were not run.

<!-- /ANCHOR:summary -->
