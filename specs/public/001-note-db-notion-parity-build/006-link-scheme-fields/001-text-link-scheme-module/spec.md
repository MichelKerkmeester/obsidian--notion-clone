---
title: "Feature Specification: Text Link Scheme Module"
description: "Same-diff table slice: create textLinkScheme.ts (closed allowlist + assemble including tel-strip), add the ColumnDef hint, render delayed-open anchors from CellRenderer default branch, extract a shared opener, and land T1–T11 plus JSON round-trip tests."
trigger_phrases:
  - "text link scheme"
  - "assembleSchemeLinkTarget"
  - "textLinkScheme"
  - "mailto tel https hint"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Text Link Scheme Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `006-link-scheme-fields` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 4 |
| **Predecessor** | None |
| **Successor** | 002-layout-scheme-honor |
| **Handoff Criteria** | Module, tests, `ColumnDef` hint, CellRenderer default-branch delayed-open, and exported shared opener all land together; `types.ts:50` union untouched |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 4** — Parent: [`../spec.md`](../spec.md) · Successor: `002-layout-scheme-honor`. This child is the **same-diff table slice** from `research/final-plan.md` steps 1–7 (plus desktop/mobile verification 8–9). Ranked items 1, 2, and 6 stay one PR: do not ship the module without types + CellRenderer, and do not split tel-strip into a second pass.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion URL / Email / Phone properties store ordinary text and differ only in click behavior. The fork's default text path is `td.textContent = String(value)` with zero `mailto:` / `tel:` capability in `src/`. Blind `scheme + raw` would emit `mailto:https://…` and would pass `javascript:` through if “already has a scheme” is honored without a family gate. `normalizeExternalUrlTarget` cannot be the assembler: it returns `null` for every non-`http(s)` scheme (`src/data/TextLink.ts:37-41`).

### Purpose
Create one EuroFormat-shaped leaf `src/data/textLinkScheme.ts` (~40 lines, zero imports) with `assembleSchemeLinkTarget`, add optional `textLinkScheme` on `ColumnDef` immediately after `textRenderMode` (`src/data/types.ts:62`), and render delayed-open anchors from `CellRenderer.ts` `default:` (`:211-233`) behind `!isFileFieldKey(col.key)`, extracting a shared 280 ms opener from `renderTextLink` (`:269-291`) so later layouts stay one-liners.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/textLinkScheme.ts`: export `TextLinkScheme`, `TEXT_LINK_SCHEMES`, `isTextLinkScheme`, `assembleSchemeLinkTarget(scheme, value): string | null`. Zero imports. Duplicate the `URL_SCHEME_RE` pattern from `TextLink.ts:33` rather than importing `TextLink`.
- Algorithm: coerce+trim; empty / whitespace-only ⇒ `null`; length > 2048 ⇒ `null`; embedded `\r` / `\n` / `\t` ⇒ `null`; non-string / `null` ⇒ `null`; if a scheme is already present, return as-is **only** when the family matches (`https` accepts `http:` / `https:`; `mailto` / `tel` exact) else `null` (`javascript:`, `data:`, `mailto:` under `https`); else prepend `https://` | `mailto:` | `tel:` (not Anytype's `http://` for URL). Then if the resulting target is `tel:`, strip `space`, `()`, `-` from the **href only** — including the already-schemed as-is path. Label and stored cell stay raw. Do not strip `.`.
- Call site 1: `src/data/types.ts` add `textLinkScheme?: TextLinkScheme` immediately after `textRenderMode` (`:62`). Prefer a type-only import. **Do not** edit the `type:` union at `:50`.
- Call site 2: `src/views/CellRenderer.ts` `default:` `:211-233`. Precedence: if `!isFileFieldKey(col.key)` && `isTextLinkScheme(col.textLinkScheme)` && assemble ≠ `null` → delayed-open anchor (label = raw `String(value)`, `href` = assembled, class `db-text-link external-link`, `td.createEl` only — never `innerHTML`). Else existing markdown → `textRenderMode === "link"` → `td.textContent`. Scheme-hint wins over markdown (locked synthesis, not F-007.1).
- Extract `renderDelayedExternalLink(td, row, { label, target })` from `renderTextLink` `:269-291` (280 ms `window.open` / `detail > 1` cancel). Scheme case calls it with external-only. Export it from this file so child 002 can import it. Do not add a fourth production file for CSS.
- Tests: `src/data/__tests__/textLinkScheme.test.ts` T1–T11 plus `isTextLinkScheme("ftp") === false` plus `JSON.parse(JSON.stringify(…))` round-trip of `textLinkScheme: "mailto"`. Stub `src/__tests__/setup.ts` if phase 005 has not created it.
- Display-only: no cell writes; `stringifyValue` (`Stringify.ts:1-14`) stays on the raw cell.

### Out of Scope
- Board / Gallery / List / record-detail honor (child `002-layout-scheme-honor`).
- Column-menu picker and `setTextLinkScheme` (child `003-column-menu-scheme-picker`).
- `ColumnWidth` measuring scheme-hint cells like link-mode (child `004-scheme-column-width`).
- Copy / Visit, auto-detect, 13th column type, persisting hrefs, extending `textRenderMode`, DNS / Google fallback, confirm sheet, speculative `db-text-link` CSS (parent out of this phase).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/textLinkScheme.ts` | Create | Allowlist + `assembleSchemeLinkTarget`; tel-strip on every `tel:` target; zero imports |
| `src/data/__tests__/textLinkScheme.test.ts` | Create | T1–T11, unknown-hint guard, JSON round-trip |
| `src/__tests__/setup.ts` | Create | Vitest stub if missing (`vitest.config.ts` `setupFiles`) |
| `src/data/types.ts` | Edit | Optional `textLinkScheme` after `textRenderMode` (`:62`); leave `:50` untouched |
| `src/views/CellRenderer.ts` | Edit | Default-branch scheme case + extract/export shared delayed opener (`:211-233`, `:269-291`) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Isolated assemble module exists | `src/data/textLinkScheme.ts` exports the four symbols; ~40 lines; **zero imports**; does not call `normalizeExternalUrlTarget` (`TextLink.ts:37-41`) |
| REQ-002 | Family gate + tel-strip are one function | Already-schemed values return as-is only in-family; `javascript:` / foreign schemes ⇒ `null`; every `tel:` target strips `space`, `()`, `-` including `tel:+31 20 123` |
| REQ-003 | Optional hint on `ColumnDef` | `types.ts:62` sibling to `textRenderMode`; `types.ts:50` union byte-stable (`git diff` on `:50` empty) |
| REQ-004 | Table text path renders delayed-open anchors | `CellRenderer.ts` `default:` `:211-233` gated by `!isFileFieldKey(col.key)` (`:212, 229`); empty assemble ⇒ plain text, no empty `<a>`; `td.createEl` only (`:272-276`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Shared opener extracted now | One 280 ms timer (`:269-291`); scheme and link-mode share it; helper is importable by later layout files |
| REQ-006 | Vitest matrix + round-trip | `npx vitest run` green on T1–T11, `isTextLinkScheme("ftp") === false`, and stringify/parse keeps `textLinkScheme` (`DatabaseView.cloneDatabaseConfig` `:930-931` analog) |
| REQ-007 | Display-only / iCloud-safe | Render path writes no cells; `stringifyValue` (`Stringify.ts:1-14`) unused by assemble; no menu setter in this child |
| REQ-008 | Rebase-friendly EuroFormat budget | Diff is the new module + `types.ts` + `CellRenderer.ts` + tests (+ `setup.ts` stub if needed); no CSS file; no `ColumnMenu` / `ColumnWidth` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: T1–T11 matrix green, including `http://x.io` + `https` unchanged and schemed `tel:` strip (`tel:+31 20 123` + `tel` → `tel:+3120123`).
- **SC-002**: Hinted table cell is clickable; unhinted DOM is unchanged; markdown under a set hint is literal (scheme wins).
- **SC-003**: `git diff` of `types.ts:50` is empty; file fields reaching `default:` (e.g. `file.tags` after `:174`) ignore the hint.
- **SC-004**: Desktop click opens the OS handler; double-click still reaches `makeEditable` (`:242-245`). On-device `mailto:` / `tel:` via `window.open` is UNKNOWN and does not block this child.

### Acceptance Scenarios

- **Given** `www.acme.com` under `https`, **when** assembled, **then** the target is `https://www.acme.com` (concat, no DNS).
- **Given** `mailto:a@b.c` under `https`, or `javascript:alert(1)` under any hint, **when** assembled, **then** the result is `null` (plain text).
- **Given** `+31 20 123` under `tel`, **when** assembled, **then** the target is `tel:+3120123` and the label stays raw.
- **Given** `http://x.io` under `https`, **when** assembled, **then** the value is unchanged (`TextLink.ts:29-31` family).
- **Given** a column object `{ type: "text", textLinkScheme: "mailto" }`, **when** `JSON.parse(JSON.stringify(…))` runs, **then** `textLinkScheme` is still `"mailto"`.
- **Given** an unhinted text cell, **when** rendered, **then** output matches the pre-change `td.textContent` path.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Copy-paste of the 280 ms timer | Board/Gallery later become four copies | Extract `renderDelayedExternalLink` in this same file now |
| Risk | Hint on a file-derived column reaching `default:` | File tags become fake links | `!isFileFieldKey(col.key)` on the scheme branch (`:212, 229`) |
| Risk | Tel-strip only after prepend | `tel:+31 20 123` keeps spaces | Strip on every `tel:` target, including as-is |
| Risk | `mailto:` / `tel:` via `window.open` on iOS/Android | UNKNOWN — zero usage in `src/` today | Ship `window.open` like `:289`; fallback later inside the shared helper, not `app.openWithDefaultApp` |
| Dependency | `src/__tests__/setup.ts` | Vitest will not start | Add a stub if 005 has not landed |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: family allowlist (not blind concat); `http://` under `https` passes through; tel-strip on every tel target; no CSS in v1; no confirm sheet; JSON round-trip is a unit stringify/parse, not a UI setter.
<!-- /ANCHOR:questions -->
