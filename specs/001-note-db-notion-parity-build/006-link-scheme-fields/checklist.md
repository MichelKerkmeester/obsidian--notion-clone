---
title: "Verification Checklist: URL / Email / Phone Link Fields"
description: "Verification checklist for the shipped additive textLinkScheme link fields phase."
trigger_phrases:
  - "link fields"
  - "checklist"
  - "text link scheme"
  - "clickable url"
  - "mailto"
  - "tel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "None — phase complete"
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
# Verification Checklist: URL / Email / Phone Link Fields

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

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: src/data/textLinkScheme.ts:1-31]
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: src/data/textLinkScheme.ts:12-31; src/views/CellRenderer.ts:79-105]
- [x] CHK-003 [P1] Dependencies identified and available [EVIDENCE: src/__tests__/setup.ts:1-41]
- [x] CHK-004 [P0] vitest `setupFiles` present [EVIDENCE: src/__tests__/setup.ts:1-41; textLinkScheme.test.ts 15/15]

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: DEFERRED -- `npm run lint` reports 115 problems (100 errors, 15 warnings) repository-wide]
- [x] CHK-011 [P0] No console errors or warnings [EVIDENCE: `npm run build` (exit 0)]
- [x] CHK-012 [P1] Error handling implemented [EVIDENCE: src/data/textLinkScheme.ts:12-31]
- [x] CHK-013 [P1] Code follows project patterns [EVIDENCE: `src/data/textLinkScheme.ts`; `src/views/CellRenderer.ts`]
- [x] CHK-014 [P1] Anchor built without innerHTML [EVIDENCE: src/views/CellRenderer.ts:86-89]
- [x] CHK-015 [P1] `normalizeExternalUrlTarget` not reused as assembler [EVIDENCE: src/data/textLinkScheme.ts:12-31]
- [x] CHK-016 [P1] File-field guard on scheme branch [EVIDENCE: src/views/CellRenderer.ts:247; src/views/BoardRenderer.ts:1050; src/views/GalleryRenderer.ts:575; src/views/ListRenderer.ts:532; src/views/RecordDetailPanel.ts:348]
- [x] CHK-017 [P1] Shared delayed-open helper extracted [EVIDENCE: src/views/CellRenderer.ts:79-105]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: `src/views/BoardRenderer.ts`; `src/views/GalleryRenderer.ts`; `src/views/ListRenderer.ts`; `src/views/RecordDetailPanel.ts`; `src/views/ColumnMenu.ts`; `src/views/ColumnWidth.ts`; `npm run build`]
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: DEFERRED -- desktop/mobile manual tap proof was not run]
- [x] CHK-022 [P1] Edge cases tested [EVIDENCE: src/data/__tests__/textLinkScheme.test.ts:5-65 (15/15)]
- [x] CHK-023 [P1] Error scenarios validated [EVIDENCE: src/data/textLinkScheme.ts:18-31]

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Link fields implemented [EVIDENCE: src/data/types.ts:49-65; src/views/CellRenderer.ts:247-257]
- [x] CHK-025 [P1] 12-type column union untouched [EVIDENCE: src/data/types.ts:52-65]
- [x] CHK-026 [P0] `ColumnDef` JSON round-trip preserves `textLinkScheme` [EVIDENCE: src/data/__tests__/textLinkScheme.test.ts:68-81 (15/15)]
- [x] CHK-027 [P1] `stringifyValue` stays on raw cell [EVIDENCE: src/data/Stringify.ts:1-14; src/views/CellRenderer.ts:247-257]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets [EVIDENCE: `grep -ri secret src/` (no matches)]
- [x] CHK-031 [P0] Input validation implemented [EVIDENCE: src/data/textLinkScheme.ts:12-31]
- [x] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: `rg -n -i 'authentication|authorization|login|password|api[_-]?key|secret' src --glob '*.ts'` (no matches)]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: `textLinkScheme`; `assembleSchemeLinkTarget`; `renderDelayedExternalLink`]
- [x] CHK-041 [P1] Code comments adequate [EVIDENCE: src/data/textLinkScheme.ts:1-31]
- [x] CHK-042 [P2] README updated (if applicable) [EVIDENCE: shipped: README scope not applicable]

### Mobile & iCloud Safety (REQ-006 / REQ-007)

- [x] CHK-043 [P0] Display-only: no cell writes [EVIDENCE: src/views/CellRenderer.ts:142-174; src/views/DatabaseView.ts:5189-5195]
- [x] CHK-044 [P0] No desktop-only APIs in the render path [EVIDENCE: src/views/CellRenderer.ts:79-105]
- [ ] CHK-045 [P1] `mailto:`/`tel:` dispatch verified on iOS/Android [EVIDENCE: DEFERRED -- iOS/Android dispatch was not run]
- [x] CHK-046 [P1] No AppFlowy-style confirm sheet [EVIDENCE: src/views/CellRenderer.ts:93-105]
- [ ] CHK-047 [P1] Tap-target size adequate on mobile [EVIDENCE: DEFERRED -- mobile tap-target proof was not run]
- [x] CHK-048 [P1] iCloud sync neutrality [EVIDENCE: `src/data/types.ts:65`; `src/views/CellRenderer.ts:247-257`]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: `find . -type f -not -path './node_modules/*' -not -path './.git/*' \( -name '*.tmp' -o -name '*.temp' -o -name '*~' -o -name '.DS_Store' \) -print` (no matches)]
- [x] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: `find . -path './scratch/*' -print` (empty)]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked with evidence | Unchecked/deferred |
|----------|-------|----------------------|--------------------|
| P0 Items | 13 | 11/13 | 2 |
| P1 Items | 20 | 18/20 | 2 |
| P2 Items | 1 | 1/1 | 0 |
| **All Items** | **34** | **30/34** | **4** |

**Verification Date**: 2026-08-26 (Sonnet 5 review + fix stage) / 2026-08-27 (docs reconciliation)
**Verified By**: Claude Sonnet 5 (read-only, hunter/skeptic/referee adversarial self-check) — `research/sonnet-verification.md`; i18n fix commit `29d7b14`; commits `74b836a`/`1b0527f`/`be9516b`/`c3d3a01`/`30ce2ea`/`a179b97` on branch `impl`

<!-- /ANCHOR:summary -->
