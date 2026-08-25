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
    packet_pointer: "obsidian/002-note-db-notion-parity-build/006-link-scheme-fields"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Reconciled checklist with final-plan.md review findings"
    next_safe_action: "Implement per plan.md/tasks.md starting with T001 (DoR)"
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
    completion_pct: 0
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

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: Pending — `spec.md` defines REQ-001 through REQ-007 for the additive `textLinkScheme` hint, with the closed allowlist + family gate (REQ-004) and the mobile/iCloud safety notes (REQ-006/007) from the synthesis.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: Pending — `plan.md` locks the module API, `assembleSchemeLinkTarget` algorithm, precedence, render shell, and the 1–3 call-site diff.
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: Pending — `plan.md` lists fork source files, the EuroFormat diff model, the build/lint/vitest gates, and the UNKNOWN `mailto:`/`tel:` mobile-dispatch dependency.
- [ ] CHK-004 [P0] vitest `setupFiles` present [EVIDENCE: src/__tests__/setup.ts]
  - **Evidence**: Pending — `src/__tests__/setup.ts` exists (landed in phase 005, or a one-line stub added in 006) so `npx vitest run` starts. Feature code does not depend on let/lets.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: fork build output]
  - **Evidence**: Pending — `npm run build` (esbuild production) and `npm run lint` must exit 0.
- [ ] CHK-011 [P0] No console errors or warnings [EVIDENCE: fork build output]
  - **Evidence**: Pending — build/lint output must be clean for the new render case.
- [ ] CHK-012 [P1] Error handling implemented [EVIDENCE: textLinkScheme.ts allowlist]
  - **Evidence**: Pending — unknown/absent scheme, foreign scheme, empty/whitespace, > 2048 chars, and control-char values all assemble to `null` ⇒ plain text (no empty anchor).
- [ ] CHK-013 [P1] Code follows project patterns [EVIDENCE: EuroFormat diff model]
  - **Evidence**: Pending — `src/data/textLinkScheme.ts` mirrors `src/data/EuroFormat.ts:1-42` (pure functions, zero Obsidian imports, ~40 lines); diff confined to new module + `types.ts` + `CellRenderer.ts`.
- [ ] CHK-014 [P1] Anchor built without innerHTML [EVIDENCE: CellRenderer.ts render case]
  - **Evidence**: Pending — anchor constructed via `td.createEl("a", { text, attr })` (`CellRenderer.ts:272-276`); never `innerHTML`.
- [ ] CHK-015 [P1] `normalizeExternalUrlTarget` not reused as assembler [EVIDENCE: textLinkScheme.ts]
  - **Evidence**: Pending — `normalizeExternalUrlTarget` returns `null` for every non-`http(s)` scheme (`src/data/TextLink.ts:37-41`); the new module owns its own allowlist logic.
- [ ] CHK-016 [P1] File-field guard on scheme branch [EVIDENCE: CellRenderer.ts render case]
  - **Evidence**: Pending — scheme branch gated behind `!isFileFieldKey(col.key)`, matching link/markdown modes (`CellRenderer.ts:212, 229`); a hint on a file-derived column reaching `default:` (e.g. `file.tags` after the special-file early return at `:174`) is ignored.
- [ ] CHK-017 [P1] Shared delayed-open helper extracted [EVIDENCE: CellRenderer.ts]
  - **Evidence**: Pending — `renderDelayedExternalLink(td, row, { label, target })` extracted from `renderTextLink` (`:269-291`); scheme-hint and link-mode share one 280 ms timer (no copy-pasted second timer).

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-004]
  - **Evidence**: Pending — hint presence, clickable rendering, unchanged 12-type union, and closed-allowlist + family-gate fallback each verified.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: tap test]
  - **Evidence**: Pending — https/mailto/tel anchors and plain-text cells tap-tested on desktop and mobile-sized viewport; double-click/double-tap edit preserved.
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md edge cases + T1–T11]
  - **Evidence**: Pending — T1–T11 vitest matrix passes: bare domain, already-schemed, foreign scheme, `javascript:`, email, `tel:` with separators (prepend + already-schemed), schemed `mailto:` as-is, empty/whitespace, > 2048 chars, control chars, non-string, `http://` family pass-through. Plus `isTextLinkScheme("ftp") === false`.
- [ ] CHK-023 [P1] Error scenarios validated [EVIDENCE: allowlist + family gate]
  - **Evidence**: Pending — unsupported scheme values render plain text; `mailto:` under `https` and `javascript:` under any hint render plain text; hint on non-text configs is ignored (non-text types never reach `default:`).

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-024 [P0] Link fields implemented [EVIDENCE: fork diff]
  - **Evidence**: Pending — `textLinkScheme?: TextLinkScheme` on `ColumnDef` (`src/data/types.ts:62`), `src/data/textLinkScheme.ts` module, and `CellRenderer.ts` default-branch render case exist in the fork.
- [ ] CHK-025 [P1] 12-type column union untouched [EVIDENCE: git diff]
  - **Evidence**: Pending — `git diff` of `ColumnDef.type` at `src/data/types.ts:50` shows no change.
- [ ] CHK-026 [P0] `ColumnDef` JSON round-trip preserves `textLinkScheme` [EVIDENCE: unit stringify/parse test]
  - **Evidence**: Pending — unit `JSON.parse(JSON.stringify({ key:"c", label:"C", type:"text", textLinkScheme:"mailto" }))` in the vitest file keeps `textLinkScheme`; absent field stays absent. Persistence is `JSON.stringify` of `ColumnDef` (`DatabaseView.cloneDatabaseConfig:930-931`); no DatabaseView boot needed. A dropped field is a P0.
- [ ] CHK-027 [P1] `stringifyValue` stays on raw cell [EVIDENCE: Stringify.ts]
  - **Evidence**: Pending — exports/sort/filter operate on the raw value; only the renderer assembles (`src/data/Stringify.ts:1-14`).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets [EVIDENCE: diff review]
  - **Evidence**: Pending — fork diff and docs contain no credential-shaped values; no network calls, no DNS validation (offline-hostile counter-example: AppFlowy `InternetAddress.lookup`).
- [ ] CHK-031 [P0] Input validation implemented [EVIDENCE: closed allowlist + family gate]
  - **Evidence**: Pending — only `https` | `mailto` | `tel` are honored; a value already carrying a scheme is returned as-is only when the detected scheme is in the hint family; `javascript:`, `data:`, and `mailto:` under `https` render as plain text.
- [ ] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: not applicable]
  - **Evidence**: Pending — local read-only render change; no authentication surface involved.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: spec-plan-task sync]
  - **Evidence**: Pending — `spec.md`, `plan.md`, and `tasks.md` must all describe the same additive-hint scope and the synthesis locked design.
- [ ] CHK-041 [P1] Code comments adequate [EVIDENCE: comment review]
  - **Evidence**: Pending — comments carry durable WHY only; no spec paths, phase numbers, or task ids in code comments.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Pending — only if the fork README documents column config options.

### Mobile & iCloud Safety (REQ-006 / REQ-007)

- [ ] CHK-043 [P0] Display-only: no cell writes [EVIDENCE: diff review]
  - **Evidence**: Pending — hrefs not persisted (AppFlowy lesson, `url_type_option.rs:99-104`); the only write is `ColumnDef` config when a user opts into the hint (same save as `setTextRenderMode`, `DatabaseView.ts:5096-5100`).
- [ ] CHK-044 [P0] No desktop-only APIs in the render path [EVIDENCE: CellRenderer.ts render case]
  - **Evidence**: Pending — only DOM APIs (`createEl`, `addEventListener`) plus `window.setTimeout`/`window.open` — the exact surface `renderTextLink` already ships (`CellRenderer.ts:269-291`). No clipboard, notifications, or DNS.
- [ ] CHK-045 [P1] `mailto:`/`tel:` dispatch verified on iOS/Android [EVIDENCE: on-device test]
  - **Evidence**: Pending — UNKNOWN until on-device (zero `mailto`/`tel:` usage in `src/` today). Default: ship `window.open`; if mobile fails, add an opener fallback in the shared click helper — do not guess `app.openWithDefaultApp` in v1.
- [ ] CHK-046 [P1] No AppFlowy-style confirm sheet [EVIDENCE: render case review]
  - **Evidence**: Pending — direct first-tap matches Obsidian's native external-link preview behavior; the 280 ms delay is harmless on touch and still lets double-tap reach inline edit. Revisit only if accidental-navigation reports appear.
- [ ] CHK-047 [P1] Tap-target size adequate on mobile [EVIDENCE: on-device test]
  - **Evidence**: Pending — `db-text-link` has no stylesheet rule in the fork (class set in `CellRenderer.ts:273` only); padding may need a small CSS add if the native `.external-link` hit box is too tight (still display-only).
- [ ] CHK-048 [P1] iCloud sync neutrality [EVIDENCE: diff review]
  - **Evidence**: Pending — no per-row frontmatter churn, no telemetry, no secrets, no network validation. Two devices editing the same column hint can conflict exactly as they can for `textRenderMode` today (accepted upstream behavior).

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: repo scan]
  - **Evidence**: Pending — no temp artifacts outside a `scratch/` directory.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: repo scan]
  - **Evidence**: Pending — `scratch/` absent or empty at completion.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 0/13 |
| P1 Items | 20 | 0/20 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-08-25
**Verified By**: Not yet verified — phase 006 is Planned; nothing is built

<!-- /ANCHOR:summary -->
