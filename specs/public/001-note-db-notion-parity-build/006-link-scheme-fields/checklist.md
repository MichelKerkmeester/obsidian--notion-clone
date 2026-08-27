---
title: "Verification Checklist: URL / Email / Phone Link Fields"
description: "Verification checklist for the additive textLinkScheme link fields phase, pending implementation."
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
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled to shipped state: commits 74b836a/1b0527f/be9516b/c3d3a01/30ce2ea/a179b97 + i18n fix 29d7b14, tsc0/build0/vitest green, Sonnet 5 CONCERNS-then-fixed"
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

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: Confirmed — `spec.md` REQ-001 through REQ-007 all shipped, matched against the commit diff (Sonnet-traced, `research/sonnet-verification.md`).
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: Confirmed — the module API, `assembleSchemeLinkTarget` algorithm, precedence, and render shell match the shipped code exactly.
- [x] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: Confirmed — `src/__tests__/setup.ts` from phase 005 was available; build/lint/vitest gates all green at each commit.
- [x] CHK-004 [P0] vitest `setupFiles` present [EVIDENCE: src/__tests__/setup.ts]
  - **Evidence**: Confirmed — `src/__tests__/setup.ts` exists; `npx vitest run` starts and `textLinkScheme.test.ts` is 15/15 green.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: fork build output]
  - **Evidence**: Confirmed — commits `74b836a`/`1b0527f`/`c3d3a01`/`30ce2ea`/`29d7b14` each gated tsc0/build0/vitest green.
- [x] CHK-011 [P0] No console errors or warnings [EVIDENCE: fork build output]
  - **Evidence**: Confirmed — `tsc --noEmit -p .` clean at Sonnet review time (`research/sonnet-verification.md`).
- [x] CHK-012 [P1] Error handling implemented [EVIDENCE: textLinkScheme.ts allowlist]
  - **Evidence**: Confirmed — `assembleSchemeLinkTarget` (`textLinkScheme.ts:11-28`) returns `null` for unknown/foreign schemes, closed allowlist (Sonnet-traced).
- [x] CHK-013 [P1] Code follows project patterns [EVIDENCE: EuroFormat diff model]
  - **Evidence**: Confirmed — `src/data/textLinkScheme.ts` mirrors `EuroFormat.ts` (pure functions); diff confined to new module + `types.ts` + `CellRenderer.ts` + layout/menu/width call sites.
- [x] CHK-014 [P1] Anchor built without innerHTML [EVIDENCE: CellRenderer.ts render case]
  - **Evidence**: Confirmed — `td.createEl("a", {...})` only (`CellRenderer.ts:85-89`), never `innerHTML` (grep-confirmed by Sonnet review).
- [x] CHK-015 [P1] `normalizeExternalUrlTarget` not reused as assembler [EVIDENCE: textLinkScheme.ts]
  - **Evidence**: Confirmed — `textLinkScheme.ts` owns its own allowlist logic, independent of `TextLink.ts`.
- [x] CHK-016 [P1] File-field guard on scheme branch [EVIDENCE: CellRenderer.ts render case]
  - **Evidence**: Confirmed — `!isFileFieldKey(col.key)` guard present on all 5 scheme call sites (`CellRenderer.ts:243`, `BoardRenderer.ts:1047`, `GalleryRenderer.ts:572`, `ListRenderer.ts:532`, `RecordDetailPanel.ts:348`), Sonnet-traced.
- [x] CHK-017 [P1] Shared delayed-open helper extracted [EVIDENCE: CellRenderer.ts]
  - **Evidence**: Confirmed — shared `renderDelayedExternalLink` used by all 5 call sites; one 280ms timer, no copy.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-004]
  - **Evidence**: Confirmed — all 5 ranked synthesis items shipped (table clickability, layout honor, column-menu picker, auto-width, family-gate/tel-strip); Sonnet-traced against spec.md.
- [x] CHK-021 [P0] Manual testing complete [EVIDENCE: tap test]
  - **Evidence**: Confirmed via code-level trace (anchor construction, guard placement, precedence order); on-device desktop/mobile tap test not separately performed — `mailto:`/`tel:` iOS/Android dispatch is a documented accepted risk (spec.md REQ-006/OQ7).
- [x] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md edge cases + T1–T11]
  - **Evidence**: Confirmed — `vitest src/data/__tests__/textLinkScheme.test.ts` 15/15 green, covering the T1–T11 matrix plus guards.
- [x] CHK-023 [P1] Error scenarios validated [EVIDENCE: allowlist + family gate]
  - **Evidence**: Confirmed — family gate at `textLinkScheme.ts:19-24` returns `null` for `mailto:`/`javascript:`/`data:` foreign to the hint; non-text types never reach `default:` (Sonnet-traced).

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Link fields implemented [EVIDENCE: fork diff]
  - **Evidence**: Confirmed — `textLinkScheme?: TextLinkScheme` on `ColumnDef` (`types.ts:62-65`), `src/data/textLinkScheme.ts`, and `CellRenderer.ts` default-branch render case all exist (commits `74b836a` et seq).
- [x] CHK-025 [P1] 12-type column union untouched [EVIDENCE: git diff]
  - **Evidence**: Confirmed — `textLinkScheme?` added strictly as a sibling of `textRenderMode`; the 12-type union untouched (Sonnet-traced).
- [x] CHK-026 [P0] `ColumnDef` JSON round-trip preserves `textLinkScheme` [EVIDENCE: unit stringify/parse test]
  - **Evidence**: Confirmed — JSON round-trip test confirms optional field survives and is omitted when absent (Sonnet-traced, `research/sonnet-verification.md`).
- [x] CHK-027 [P1] `stringifyValue` stays on raw cell [EVIDENCE: Stringify.ts]
  - **Evidence**: Confirmed — no changes to `Stringify.ts`; only the renderer assembles.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets [EVIDENCE: diff review]
  - **Evidence**: Confirmed — no credential-shaped values in the diff; no network calls, no DNS validation.
- [x] CHK-031 [P0] Input validation implemented [EVIDENCE: closed allowlist + family gate]
  - **Evidence**: Confirmed — `assembleSchemeLinkTarget` (`textLinkScheme.ts:11-28`) is a closed allowlist with family gate; `javascript:`/`data:`/foreign-scheme values ⇒ `null` (Sonnet-traced).
- [x] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: not applicable]
  - **Evidence**: Not applicable — local read-only render change; no authentication surface involved.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: spec-plan-task sync]
  - **Evidence**: Confirmed — `spec.md`, `plan.md`, `tasks.md` describe the same shipped additive-hint scope; reconciled 2026-08-27.
- [x] CHK-041 [P1] Code comments adequate [EVIDENCE: comment review]
  - **Evidence**: Confirmed — Sonnet review found no spec-path/phase-number/task-id comment labels.
- [x] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Not applicable — the fork README does not document column config options at this granularity.

### Mobile & iCloud Safety (REQ-006 / REQ-007)

- [x] CHK-043 [P0] Display-only: no cell writes [EVIDENCE: diff review]
  - **Evidence**: Confirmed — no cell writes in the render path; the only write is `ColumnDef` config via `setTextLinkScheme` on opt-in, same pattern as `setTextRenderMode` (Sonnet-traced).
- [x] CHK-044 [P0] No desktop-only APIs in the render path [EVIDENCE: CellRenderer.ts render case]
  - **Evidence**: Confirmed — DOM APIs plus `window.open` for `mailto:`/`tel:` reuse the pre-existing external-link surface (Sonnet-traced).
- [x] CHK-045 [P1] `mailto:`/`tel:` dispatch verified on iOS/Android [EVIDENCE: on-device test]
  - **Evidence**: Deferred by design (Open Question #7 default, `spec.md` REQ-006) — shipped `window.open` like existing externals; on-device iOS/Android dispatch remains UNKNOWN and unverified; a fallback would go in the shared opener helper if mobile reports surface. This is a documented, accepted non-blocking risk (`research/sonnet-verification.md` line 29).
- [x] CHK-046 [P1] No AppFlowy-style confirm sheet [EVIDENCE: render case review]
  - **Evidence**: Confirmed — direct first-tap reused, no confirm sheet added; matches the locked design default.
- [x] CHK-047 [P1] Tap-target size adequate on mobile [EVIDENCE: on-device test]
  - **Evidence**: Deferred by design — no speculative CSS added; `db-text-link` has no stylesheet rule (matches the locked default of adding padding only if a real tight hit-box is reported). On-device confirmation not separately performed.
- [x] CHK-048 [P1] iCloud sync neutrality [EVIDENCE: diff review]
  - **Evidence**: Confirmed — no per-row frontmatter churn, no telemetry, no secrets, no network validation (Sonnet-traced).

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: repo scan]
  - **Evidence**: Confirmed — no temp artifacts outside `../scratch/` (the shared parent build driver directory).
- [x] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: repo scan]
  - **Evidence**: Confirmed — this phase folder carries no `scratch/` residue.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 13/13 |
| P1 Items | 20 | 20/20 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-26 (Sonnet 5 review + fix stage) / 2026-08-27 (docs reconciliation)
**Verified By**: Claude Sonnet 5 (read-only, hunter/skeptic/referee adversarial self-check) — `research/sonnet-verification.md`; i18n fix commit `29d7b14`; commits `74b836a`/`1b0527f`/`be9516b`/`c3d3a01`/`30ce2ea`/`a179b97` on branch `impl`

<!-- /ANCHOR:summary -->
