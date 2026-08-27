---
title: "Implementation Summary: Toolbar New-From-Template Button"
description: "Shipped status for the New from template toolbar phase: built, gate-green, Sonnet-verified (code correct; 003 proof was a manual matrix never separately run)."
trigger_phrases:
  - "toolbar new from template"
  - "new from template button"
  - "template toolbar summary"
  - "create entry plan"
  - "record template toolbar"
  - "confirm modal template"
  - "notion buttons parity"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled phase 013 docs to shipped state (commits e158b0f, f5ed81a); Sonnet-verified, 003 proof honestly marked as superseded"
    next_safe_action: "None — phase complete. Packet-wide completion-doc reconciliation continues per remediation-plan.md R1."
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
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 013-template-toolbar-button |
| **Completed** | 2026-08-26 (branch `impl`, commits `e158b0f`, `f5ed81a`) |
| **Level** | 2 |
| **Actual Effort** | ≈3.5 hours, matching Effort S estimate |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped on branch `impl` (commits `e158b0f`, `f5ed81a`): the adaptive **New from template** toolbar control and its row-menu twin, both routed through the new isolated `src/data/TemplateToolbarAction.ts` module (`executeNewFromTemplate`) — a single `createEntry()` call per invocation, confirm path deferred (`confirmEnabled: false` at both call sites, per the spec's own recommended default).

Gate: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass (re-run at Sonnet 5 review time). Independently verified by a fresh, read-only Claude Sonnet 5 review (2026-08-26, hunter/skeptic/referee adversarial self-check): **CONCERNS** — the code itself is correct and composes properly with the 007 unique-ID create path; the only findings were non-code (completion docs still said "Planned," and the `003-create-path-proof` artifact was never recorded — see Deviations below).

Built on Luna-via-cursor after the Codex OpenAI executor's quota died mid-run (see `synthesis.md` §3).

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/TemplateToolbarAction.ts` | Added | Isolated decision module: `hasRecordTemplate`, label/tooltip helpers, `executeNewFromTemplate` |
| `src/views/ToolbarRenderer.ts` | Modified | Adaptive toolbar New control (label/icon/tooltip, phone icon-only) |
| `src/views/RowMenu.ts` | Modified | Row-menu New-from-template twin, gated on `hasRecordTemplate` |
| `src/views/DatabaseView.ts` | Modified | `getDatabaseConfig` wiring for the RowMenu host |
| `specs/public/001-note-db-notion-parity-build/013-template-toolbar-button/{spec,plan,tasks,checklist,implementation-summary}.md` | Reconciled | Docs updated to reflect shipped state (this pass) |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Built serially through sub-phases 001-002 (adaptive toolbar control → row-menu twin), each gated on `tsc --noEmit` + `npm run build` + `vitest` before commit. Sub-phase 003 (`003-create-path-proof`) was scoped as a manual verification pass and was never separately executed or committed — see Deviations. Verified read-only by a fresh Claude Sonnet 5 review after the phase completed, which independently re-traced the create-path composition (call-chain trace + real `tsc`/`vitest` + a safety grep) in place of that un-run proof.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Ship the useful half of Notion Buttons as a click-only **New from template** control | Create-with-defaults already exists; the gap is discoverability, not a new engine. Effort S, value 2. |
| Call `RecordTemplate.ts` + `CreateEntryPlan.ts` (markdown/core/templater, `{{date}}` / `{{title}}`) | Reimplementing create would drift from the fork’s working path and inflate the diff. |
| Leave recurrence on duplicate-row | Duplicate-row already covers recurrence; this control must not add interval/scheduler UI. |
| Explicitly OUT: scheduler/cron and network buttons (mail/webhook/Slack/notifications) | Those are not local vault features and need people/services; they are not MIT-personal-finance-vault work. |
| Isolated `src/data/` module + 1–3 call-site edits | Imitate `EuroFormat.ts` so `git rebase` onto upstream stays clean. |
| Optional `ConfirmModal` | Confirm-before-write is useful; existence of a mobile-safe modal in the fork is UNKNOWN — reuse or defer, never desktop-only APIs. |
| Wave 5, `depends_on: none` | Adjacent to `012-files-column` and `014-record-detail-panel` in the parent packet only; this control does not wait on those phases. |
| Mobile-safe, MIT-forkable, iCloud-safe, no telemetry, no secrets | Personal finance vault on iCloud; one create write per confirmed click, no churny extra writers. |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| `tsc --noEmit` | Pass | Exit 0 | Re-run at Sonnet review time |
| `vitest` | Pass | 19 files / 194 tests | `TemplateToolbarAction.test.ts` covers `hasRecordTemplate`, label/tooltip, create-once/no-create-on-cancel |
| Manual toolbar/row-menu | Verified by code trace | Desktop | Sonnet 5 review: adaptive control + row-menu twin traced, gated correctly on `hasRecordTemplate` |
| Diff contract | Pass | One `src/data/` module + 3 named call sites | `git show --stat`: `TemplateToolbarAction.ts` new; `ToolbarRenderer.ts`/`RowMenu.ts`/`DatabaseView.ts` modified; `RecordTemplate.ts`/`CreateEntryPlan.ts` absent from the diffs |
| 003-create-path-proof manual matrix | Not run | — | Never executed or committed; substituted by the Sonnet 5 review (call-chain trace, real gate re-run, safety grep) |

### Test Coverage Summary

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| `TemplateToolbarAction.ts` | Covered by `TemplateToolbarAction.test.ts` | Covered — `hasRecordTemplate`, confirm branch (`confirmed !== true`) | Covered |
| Toolbar / row-menu call sites | No dedicated test (house convention — no view-host DOM tests) | — | Verified by Sonnet 5 code trace |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| NFR-P01 | No polling/cron/extra vault walks on click | Confirmed — no timers/polling in the module | Pass |
| NFR-S01 | No secrets, telemetry, or network-button payloads | Confirmed — Sonnet 5 safety grep (`fetch`/`setInterval`/`setTimeout`/`webhook`) clean in `TemplateToolbarAction.ts` | Pass |
| NFR-R01 | Cancelled confirm writes nothing; create errors stay on existing path | Confirmed by code trace; confirm itself deferred (`confirmEnabled: false`) | Pass |
| NFR-R02 | Mobile-safe APIs only | Confirmed — no desktop-only APIs | Pass |
| NFR-R03 | One create write per confirmed click | Confirmed — single `createEntry()` call, no double-create at either host | Pass |
| NFR-R04 | Isolated `src/data/` module + 1–3 call sites | Confirmed — 1 module + 3 named call sites | Pass |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **REQ-004 confirm-before-create was deferred**, per the spec's own recommended default: `confirmEnabled: false` at both call sites; the overlay guard remains the double-click backstop.
2. **Scheduler/cron and network buttons** (mail/webhook/Slack/notifications) remain out of scope for this fork, as designed.
3. **Recurrence stays on duplicate-row**; this control has no interval UI, as designed.
4. **The string-typed `confirmed` branch is untested** (unreachable while `confirmEnabled: false`) — a P2 per Sonnet 5 review, add a test if/when the optional-confirm path is enabled.
5. **`RowMenu.ts:97` inlines `{dom?}`** instead of the `MenuItemWithDom` alias — a pre-existing cosmetic pattern, per Sonnet 5 review, not a defect introduced here.

<!-- /ANCHOR:limitations -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| Build the toolbar **New from template** control per `plan.md` | Built as planned across 2 commits | Matches estimate |
| Codex-executor build throughout | Codex OpenAI quota died mid-run; rebuilt on Luna-via-cursor | Executor swap, documented in `synthesis.md` §3 |
| Run the `003-create-path-proof` manual matrix and record it | Never executed or committed — no `003-create-path-proof` commit exists on `impl`; `003/scratch/` has only `.gitkeep` | The code substance was independently re-verified by the Sonnet 5 review (call-chain trace + real `tsc`/`vitest` + safety grep) in place of the un-run manual proof; this is an artifact gap, not a code defect (per `research/sonnet-verification.md`) |

<!-- /ANCHOR:deviations -->
