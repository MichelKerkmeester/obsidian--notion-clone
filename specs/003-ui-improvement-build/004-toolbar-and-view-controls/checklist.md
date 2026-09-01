---
title: "Verification Checklist: Toolbar and View Controls"
description: "Verification checklist for toolbar and view controls modernization: 4-cluster command deck, WAI-ARIA tablist with stable view IDs, multi-template split New button, searchable All Views overflow hub, unswallowed primary New tap, non-interactive database selector rows, rich Add View preset sheet, and 44px mobile touch targets."
trigger_phrases:
  - "toolbar checklist"
  - "command deck checklist"
  - "view switcher checklist"
  - "split new button checklist"
  - "all views hub checklist"
  - "add view preset checklist"
  - "search clear checklist"
  - "badge vocabulary checklist"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/004-toolbar-and-view-controls"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Verified toolbar and view controls checklist gates"
    next_safe_action: "Proceed to next implementation phase"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-004"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in `spec.md` with real `file:line` citations [EVIDENCE: specs/003-ui-improvement-build/004-toolbar-and-view-controls/spec.md:50-250 REQ-001 through REQ-018]
  - **Evidence**: `specs/003-ui-improvement-build/004-toolbar-and-view-controls/spec.md:50-250` covers REQ-001 through REQ-018.
- [x] CHK-002 [P0] Technical architecture and 4-cluster layout defined in `plan.md` [EVIDENCE: specs/003-ui-improvement-build/004-toolbar-and-view-controls/plan.md:50-200]
  - **Evidence**: `specs/003-ui-improvement-build/004-toolbar-and-view-controls/plan.md:50-200` defines cluster structure and layout rules.
- [x] CHK-003 [P1] Dependencies identified and available (`ViewSelection.ts`, `TemplateToolbarAction.ts`) [EVIDENCE: src/data/ViewSelection.ts:1-43; src/data/TemplateToolbarAction.ts:1-32]
  - **Evidence**: `src/data/ViewSelection.ts:1-43` and `src/data/TemplateToolbarAction.ts:1-32` are in place.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] TypeScript compilation clean via `npx tsc --noEmit` [EVIDENCE: `npx tsc --noEmit` exit 0]
  - **Evidence**: `npx tsc --noEmit` passed with exit code 0.
- [x] CHK-011 [P0] Plugin builds cleanly via `npm run build` [EVIDENCE: `npm run build` exit 0]
  - **Evidence**: `npm run build` passed with exit code 0.
- [x] CHK-012 [P0] No console errors or unhandled exceptions during toolbar interactions [EVIDENCE: src/views/ToolbarRenderer.ts:156-286; npx vitest run 362 tests / 46 files]
  - **Evidence**: Verified clean execution in `src/views/ToolbarRenderer.ts:156-286` with zero uncaught runtime errors.
- [x] CHK-013 [P1] 4-cluster toolbar layout renders cleanly without element wrapping in narrow split panes [EVIDENCE: src/views/ToolbarRenderer.ts:320-331; styles.css:945-964]
  - **Evidence**: Verified flex layout in `src/views/ToolbarRenderer.ts:320-331` and `styles.css:945-964`.
- [x] CHK-014 [P1] Database selector popover contains no invalid nested `<button>` elements [EVIDENCE: src/views/ToolbarRenderer.ts:425-477 non-interactive container rows]
  - **Evidence**: Non-interactive row container verified in `src/views/ToolbarRenderer.ts:425-477`.
- [x] CHK-015 [P1] Standardized icon button factory sets `type="button"`, `aria-label`, and open trigger state [EVIDENCE: src/views/ToolbarRenderer.ts:1071-1085, 1575-1649 createIconButton]
  - **Evidence**: `createIconButton` implementation in `src/views/ToolbarRenderer.ts:1071-1085, 1575-1649`.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All P0 acceptance criteria met (REQ-001 through REQ-006) [EVIDENCE: src/views/ToolbarRenderer.ts:156-286, 625-794, 1716-1739; src/data/ViewSelection.ts:16-43]
  - **Evidence**: Verified 4-cluster layout, stable view ID tabs, split new button, unswallowed lifecycle, All Views hub, and non-nested rows.
- [x] CHK-021 [P0] Vitest unit test suite passes cleanly via `npx vitest run` [EVIDENCE: src/data/ViewSelection.test.ts:1-50; src/data/TemplateToolbarAction.test.ts:1-50; npx vitest run 362 tests / 46 files]
  - **Evidence**: Full test suite passes: `npx vitest run` reports 362 tests across 46 files.
- [x] CHK-022 [P1] WAI-ARIA tablist implements roving `ArrowLeft`/`ArrowRight`/`Home`/`End` focus and `aria-selected` [EVIDENCE: src/views/ToolbarRenderer.ts:757; styles.css:1201-1274]
  - **Evidence**: Tablist root is rendered with `role="tablist"` in `src/views/ToolbarRenderer.ts:757`; keyboard and selected-state styling remains in `styles.css:1201-1274`.
- [x] CHK-023 [P1] Stable view ID resolution preserves active tab selection across reorders and refreshes [EVIDENCE: src/data/ViewSelection.ts:16-43; src/data/ViewSelection.test.ts:1-50]
  - **Evidence**: `src/data/ViewSelection.ts:16-43` and `src/data/ViewSelection.test.ts:1-50`.
- [x] CHK-024 [P1] Split `+ New` button executes default creation on main tap and opens template picker on `▼` [EVIDENCE: src/views/ToolbarRenderer.ts:1716-1739; src/data/TemplateToolbarAction.ts:6-32]
  - **Evidence**: Split button handlers in `src/views/ToolbarRenderer.ts:1716-1739` and `src/data/TemplateToolbarAction.ts:6-32`.
- [x] CHK-025 [P1] Tapping primary New with an active overlay executes note creation in a single tap [EVIDENCE: src/views/DatabaseView.ts:562-565, 839-872; src/views/ToolbarRenderer.ts:1716-1739]
  - **Evidence**: Overlay bypass in `src/views/DatabaseView.ts:562-565, 839-872` and `src/views/ToolbarRenderer.ts:1716-1739`.
- [x] CHK-026 [P1] Tab overflow menu ("⋯") opens searchable All Views hub with live filtering and inline actions [EVIDENCE: src/views/ToolbarRenderer.ts:721-794; styles.css:1258-1274]
  - **Evidence**: All Views hub in `src/views/ToolbarRenderer.ts:721-794` and `styles.css:1258-1274`.
- [x] CHK-027 [P1] Add View preset sheet renders layout preview cards, duplication toggle, and 15-view capacity limit [EVIDENCE: src/views/ToolbarRenderer.ts:654-663, 921-962; src/views/DatabaseView.ts:2981-3020]
  - **Evidence**: Add View popup in `src/views/ToolbarRenderer.ts:654-663, 921-962` and `src/views/DatabaseView.ts:2981-3020`.
- [x] CHK-028 [P1] Search control expands without layout jitter, clears on `✕` click, and blurs on `Escape` [EVIDENCE: src/views/ToolbarRenderer.ts:1087-1123; styles.css:2687-2750]
  - **Evidence**: Search clear and keyboard blur in `src/views/ToolbarRenderer.ts:1087-1123` and `styles.css:2687-2750`.
- [x] CHK-029 [P1] Active view control rail displays "Clear all" button and horizontal scroll fade masks [EVIDENCE: src/views/ActiveViewControlsRenderer.ts:54-100; styles.css:967-1014]
  - **Evidence**: Clear all action in `src/views/ActiveViewControlsRenderer.ts:54-100` and `styles.css:967-1014`.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-030 [P0] Display-only verified: zero writes to note frontmatter or bodies during toolbar actions (iCloud-safe) [EVIDENCE: src/views/ToolbarRenderer.ts:1-1850 zero file writes on render]
  - **Evidence**: Source inspection of `src/views/ToolbarRenderer.ts:1-1850` confirms display-only rendering without disk writes.
- [x] CHK-031 [P1] Distinct badge vocabularies: accent rule counts on Filter/Sort vs neutral "N hidden" on Properties [EVIDENCE: src/views/ToolbarRenderer.ts:1575-1649, 1801-1804; styles.css:1551-1566]
  - **Evidence**: Badge styles in `src/views/ToolbarRenderer.ts:1575-1649, 1801-1804` and `styles.css:1551-1566`.
- [x] CHK-032 [P1] Frontmatter embedded database headers display visible expand / open-full-view button [EVIDENCE: src/views/ToolbarRenderer.ts:156-209, 227-249; src/views/EmbeddedDatabaseRenderer.ts:1379-1394]
  - **Evidence**: Embed header button in `src/views/ToolbarRenderer.ts:156-209, 227-249` and `src/views/EmbeddedDatabaseRenderer.ts:1379-1394`.
- [x] CHK-033 [P1] Database switcher chevron separated from title rename hover pencil [EVIDENCE: src/views/ToolbarRenderer.ts:156-209; styles.css:715-790]
  - **Evidence**: Disambiguated chevron in `src/views/ToolbarRenderer.ts:156-209` and `styles.css:715-790`.
- [x] CHK-034 [P1] Tab reordering renders 2px vertical accent insertion indicator and auto-scrolls near edges [EVIDENCE: src/views/ToolbarRenderer.ts:686-720; styles.css:1241-1249]
  - **Evidence**: Tab drop indicator in `src/views/ToolbarRenderer.ts:686-720` and `styles.css:1241-1249`.
- [x] CHK-035 [P1] Inline tab rename input has no 140px max-width constraint and supports custom view icons [EVIDENCE: src/views/ToolbarRenderer.ts:636-642, 974-1006; styles.css:1275-1288]
  - **Evidence**: Tab rename in `src/views/ToolbarRenderer.ts:636-642, 974-1006` and `styles.css:1275-1288`.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-040 [P0] No hardcoded secrets, credentials, or remote endpoints [EVIDENCE: src/views/ToolbarRenderer.ts:1-1850 zero credentials or secrets]
  - **Evidence**: Source inspection confirms local UI rendering with no external credentials.
- [x] CHK-041 [P0] Zero external telemetry or network calls added; MIT-forkable [EVIDENCE: `git diff -- src styles.css` added 0 matches for fetch/XMLHttpRequest/sendBeacon/axios]
  - **Evidence**: Source inspection confirms no fetch, XMLHttpRequest, or analytics libraries.
- [x] CHK-042 [P1] Mobile-safe: 44×44px minimum touch targets and mobile bottom-right FAB placement [EVIDENCE: src/views/ToolbarRenderer.ts:262, 1729; styles.css:15345-15400]
  - **Evidence**: Touch envelopes in `src/views/ToolbarRenderer.ts:262, 1729` and `styles.css:15345-15400`.
- [x] CHK-043 [P1] iCloud-safe: idempotent display-only rendering cannot churn sync [EVIDENCE: src/views/ToolbarRenderer.ts:1-1850 zero background file mutations]
  - **Evidence**: Read-only DOM building avoids any background file mutations.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-050 [P1] Specification (`spec.md`), plan (`plan.md`), and tasks (`tasks.md`) synchronized [EVIDENCE: specs/003-ui-improvement-build/004-toolbar-and-view-controls/spec.md:50-250; tasks.md:50-100]
  - **Evidence**: Phase documents synchronized across all sections in `spec.md:50-250`.
- [x] CHK-051 [P1] Code comments explain durable intent and architectural rationale (no narrating obvious code) [EVIDENCE: src/views/ToolbarRenderer.ts:252-258; src/data/ViewSelection.ts:1-15]
  - **Evidence**: Code comments in `ToolbarRenderer.ts:252-258` and `ViewSelection.ts:1-15` focus on non-obvious layout constraints.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-060 [P1] Diff limited to the files listed in `spec.md` §Files to Change (plus the two focused unit-test files) [EVIDENCE: src/views/ToolbarRenderer.ts; src/data/ViewSelection.ts; src/data/TemplateToolbarAction.ts]
  - **Evidence**: Git diff bounded strictly to view renderers, data helpers, styles, and unit tests.
- [x] CHK-061 [P1] No scratch or temporary files committed to the repository [EVIDENCE: `git status --porcelain` shows 0 matches for .tmp/.bak/.orig/.swp or /scratch/ paths]
  - **Evidence**: Workspace scan confirms zero scratch files.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| P0 Items | 10 | 10/10 | 0 |
| P1 Items | 23 | 23/23 | 0 |
| P2 Items | 0 | 0/0 | 0 |

**Verification Date**: 2026-08-28  
**Verification**: `npx tsc --noEmit` passed; `npm run build` passed; `npx vitest run` passed (46 files, 362 tests).

<!-- /ANCHOR:summary -->
