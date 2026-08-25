---
title: "Implementation Plan: Text Link Scheme Module"
description: "Same-diff plan for textLinkScheme.ts, ColumnDef hint, CellRenderer delayed-open, shared opener extract, T1–T11 tests, and JSON round-trip."
trigger_phrases:
  - "text link scheme plan"
  - "assembleSchemeLinkTarget"
  - "cell renderer delayed open"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/006-link-scheme-fields/001-text-link-scheme-module"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table same-diff child from synthesis ranks 1, 2, 6 and final-plan steps 1–9"
    next_safe_action: "Implement textLinkScheme.ts plus the same-diff types.ts and CellRenderer call sites"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-text-link-scheme-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Text Link Scheme Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None in v1 — display-only; the hint is an optional `ColumnDef` field that round-trips with existing view/schema JSON |
| **Testing** | Vitest (`vitest.config.ts` includes `src/**/*.test.ts`) |

### Overview
Land one EuroFormat-shaped leaf plus two call sites in a single shippable diff so table cells can open `https` / `mailto` / `tel` without a 13th column type. Assembly is pure and must not call `normalizeExternalUrlTarget`. Tel-strip is part of assemble, not a follow-up pass. Extract the delayed opener now so child 002 does not copy the timer.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1, 2, 6 and final-plan steps 0–9 read; same-diff coupling confirmed.
- [x] Locked algorithm: family gate, `http://` pass-through, tel-strip on every `tel:` target.
- [x] Do not import `normalizeExternalUrlTarget`; do not touch `types.ts:50`.

### Definition of Done
- [ ] `textLinkScheme.ts` exports assemble + allowlist; zero imports.
- [ ] `npx vitest run` green on T1–T11 + round-trip.
- [ ] CellRenderer default branch emits delayed-open anchors; unhinted DOM unchanged.
- [ ] Shared opener extracted and importable; `types.ts:50` untouched; no cell writes.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + rebase-safe call sites (`src/data/EuroFormat.ts:1-42`). Pure functions, zero Obsidian imports.

### Key Components
- **`textLinkScheme.ts`**: `assembleSchemeLinkTarget`; closed allowlist; tel-strip on href only.
- **`types.ts`**: optional `textLinkScheme` after `textRenderMode` (`:62`).
- **`CellRenderer.ts`**: scheme case in `default:` plus exported `renderDelayedExternalLink`.

### Data Flow
Renderer reads `col.textLinkScheme` and the raw cell. Assemble returns `string | null`. Null / unknown hint / file-field key → existing markdown → link-mode → plain path. Non-null → `<a>` with raw label and assembled `href`. `stringifyValue` never sees the href. No cell migration when the hint toggles.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `textLinkScheme.ts`. Consumers in this same diff: `types.ts` (`ColumnDef`) and `CellRenderer.ts` `default:` plus `renderTextLink`. Layout consumers wait for child 002. Menu / width wait for children 003 / 004. Algorithm invariant: never persist assembled hrefs; never emit `javascript:`; never double-prefix in-family values.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `types.ts:47-71`, `CellRenderer.ts:110-233` and `:269-291`, `TextLink.ts:29-41`, `EuroFormat.ts:1-42`.
- [ ] Confirm `src/__tests__/setup.ts` exists (005 or stub).

### Phase 2: Core Implementation
- [ ] Create `textLinkScheme.ts` including tel-strip on every `tel:` target.
- [ ] Create `textLinkScheme.test.ts` (T1–T11 + ftp guard + round-trip).
- [ ] Add `textLinkScheme?` on `ColumnDef`; leave `:50` untouched.
- [ ] Scheme case in CellRenderer `default:`; extract/export shared delayed opener.

### Phase 3: Verification
- [ ] `npm run build`; `npm run lint`; `npx vitest run`.
- [ ] Confirm `stringifyValue` unused by assemble; no render-path writes.
- [ ] Desktop click / dblclick; do not block on-device `window.open`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | T1–T11 assemble matrix, `isTextLinkScheme("ftp")`, JSON round-trip | Vitest (`npx vitest run`) |
| Integration | Not this child — no Obsidian API in the module | — |
| Manual | One hinted https / mailto / tel column (schema JSON) plus one unhinted column; click vs dblclick | Obsidian fork desktop |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| Phase `005-formula-let-variables` `setup.ts` | Internal | Optional | Stub `src/__tests__/setup.ts` if missing; feature code does not depend on let/lets |
| Children 002–004 | Internal | Later | This child must export the delayed opener so 002 stays one-liners |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Family gate misses `javascript:`; `types.ts:50` changes; empty `<a>` for null assemble; circular import of `TextLink`; tests fail.
- **Procedure**: Revert `types.ts` + `CellRenderer.ts`, delete `textLinkScheme.ts` (+ tests, + stub if this child added it). No cell migration to undo.
<!-- /ANCHOR:rollback -->
