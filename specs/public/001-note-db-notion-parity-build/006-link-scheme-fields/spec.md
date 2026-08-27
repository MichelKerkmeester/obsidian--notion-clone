---
title: "Feature Specification: URL / Email / Phone Link Fields"
description: "Additive optional link-scheme hint that renders text cells as clickable URL, email, or phone links without widening the 12-type column union."
trigger_phrases:
  - "link fields"
  - "clickable url"
  - "text link scheme"
  - "mailto"
  - "tel"
  - "url column"
  - "email column"
  - "phone column"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored from synthesis and final-plan"
    next_safe_action: "Build 001-text-link-scheme-module per its plan.md and tasks.md"
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
# Feature Specification: URL / Email / Phone Link Fields

> **Phase adjacency** — Predecessor: `005-formula-let-variables` · Successor: `007-unique-id-stamp` Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-24 |
| **Branch** | `006-link-scheme-fields` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion treats URL, email, and phone property values as first-class clickable links: URL opens in a new tab, Email launches the mail client, Phone prompts a call, while the stored value stays an ordinary string. The fork renders every text cell as plain text via `td.textContent = String(value)` with zero `mailto:`/`tel:` capability anywhere in `src/`, so those values must be copied and pasted into a browser or mail app. This is a daily-friction Notion-parity gap (Wave 3).

### Purpose
Ship a closed-allowlist `textLinkScheme` hint (`https` | `mailto` | `tel`) on the existing text column config and assemble hrefs in a new EuroFormat-style isolated module, rendering only from the table text path in the first diff. Do **not** add a 13th column type. The hint sits on `ColumnDef` in `src/data/types.ts:62` (sibling to `textRenderMode`) and is rendered from `CellRenderer.ts`'s default branch (~211-233) plus the existing `renderTextLink` interaction shell (~269-291). The single biggest risk is not the renderer: `window.open` for `mailto:`/`tel:` is unproven on Obsidian iOS/Android (zero `mailto`/`tel:` usage in `src/` today), and Board / Gallery / List / record-detail each have their own `textRenderMode === "link"` branches that never enter `CellRenderer`'s default branch, so a CellRenderer-only change will not match Notion in those layouts. Nested children own the ordered slices: table same-diff first, then layout honor, then the column-menu picker, then scheme-aware column width.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Optional `textLinkScheme?: "https" | "mailto" | "tel"` hint on `ColumnDef` in `src/data/types.ts:62` (sibling to `textRenderMode`).
- New isolated module `src/data/textLinkScheme.ts` (EuroFormat profile: pure functions, zero Obsidian imports, ~40 lines) exporting `TextLinkScheme`, `TEXT_LINK_SCHEMES`, `isTextLinkScheme`, and `assembleSchemeLinkTarget`.
- Clickable rendering for hint-bearing text cells from `CellRenderer.ts`'s default branch (~211-233), gated behind `!isFileFieldKey(col.key)` (matching link/markdown modes at `:212, 229`), via a shared `renderDelayedExternalLink` extracted from the existing `renderTextLink` 280 ms delayed-open / dblclick-cancel shell (~269-291).
- Detect-and-skip + family allowlist assembly: a value already carrying a scheme is returned as-is only when the detected scheme is in the hint family (`https` hint accepts `http:`/`https:`; `mailto` accepts `mailto:`; `tel` accepts `tel:`); any other scheme (`javascript:`, `data:`, `mailto:` under an `https` hint) ⇒ plain text.
- `tel:` visual separators (`space`, `()`, `-`) stripped from the **target** on every `tel:` result (both prepend and already-schemed as-is paths); label and stored cell stay raw.
- Plain-text fallback when the hint is absent, unknown, or assemble returns `null`.
- Display-only behavior (no cell writes) with mobile-safe tap targets; the only persisted write is `ColumnDef` config when a user opts into the hint (same churn profile as `setTextRenderMode`).

### Out of Scope
- New column types — the 12-type `ColumnDef.type` union at `src/data/types.ts:50` stays verbatim.
- Persisting assembled hrefs anywhere (AppFlowy lesson: `apply_changeset` stores the raw string).
- Link editing, custom display labels, link health checks, DNS / Google-search fallbacks.
- Auto-detection of URLs/emails/phones in unhinted text columns (the hint is explicit; Anytype `urlFix` auto-classification is a future option, not this phase).
- Extending the `textRenderMode` union with `"https"|"mailto"|"tel"` (breaks every switch, i18n key, and width measurer on that union).
- Board / Gallery / List / record-detail honoring the hint in v1 (default: lock v1 to CellRenderer; schedule the four one-line delegations immediately after — see Open Questions #2).
- Column-menu picker for the scheme (default: defer; power users set `textLinkScheme` in view config — see Open Questions #3).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/types.ts` (~line 62) | Edit | Add optional `textLinkScheme?: TextLinkScheme` to `ColumnDef`, sibling to `textRenderMode` |
| `src/data/textLinkScheme.ts` | Add | New isolated module: closed allowlist + `assembleSchemeLinkTarget` (EuroFormat diff model) |
| `src/views/CellRenderer.ts` (default branch ~211-233; helper ~269-291) | Edit | Consult hint; emit delayed-open anchor or fall through to existing markdown → link-mode → plain order |
| `specs/public/001-note-db-notion-parity-build/006-link-scheme-fields/spec.md` | Add | This specification |
| `specs/public/001-note-db-notion-parity-build/006-link-scheme-fields/plan.md` + `tasks.md` + `checklist.md` + `implementation-summary.md` | Add | Phase plan, task breakdown, verification checklist, and summary |

> Paths are relative to the fork root (`specs/obsidian/001-notion-finance-migration/build/note-database-fork`). The scaffold's `components/CellRenderer.ts` and loose `types.ts` references are corrected here to `views/CellRenderer.ts` and `data/types.ts`.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `textLinkScheme` hint exists on `ColumnDef` | `src/data/types.ts:62` declares optional `textLinkScheme?: TextLinkScheme` sibling to `textRenderMode`; configs without it render plain text exactly as today |
| REQ-002 | Clickable rendering for hint-bearing text cells | `CellRenderer.ts` default branch (~211-233) emits an anchor built via `assembleSchemeLinkTarget` behind a `!isFileFieldKey(col.key)` guard (matching link/markdown modes); `mailto:` and `tel:` links invoke the OS mail/phone handler through `window.open` |
| REQ-003 | 12-type column union unchanged | `ColumnDef.type` at `src/data/types.ts:50` stays verbatim (`"text" \| … \| "rollup"`); no new column type is introduced |
| REQ-004 | Closed allowlist + family gate | Only `https` \| `mailto` \| `tel` are honored; a value already carrying a scheme is returned as-is only when the detected scheme is in the hint family; any other scheme (`javascript:`, `data:`, `mailto:` under `https`) ⇒ plain text. `tel:` visual separators stripped from the target on every `tel:` result (prepend and as-is) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Rebase-friendly isolated diff | Changes follow the EuroFormat model: one new module under `src/data/` + 1-3 minimal call-site edits; `git rebase` onto upstream stays clean. A Column-menu picker (item 4) is a 4th/5th file and creates a REQ-005 tension — defer by default |
| REQ-006 | Mobile-safe | Reuse the same DOM + `window.setTimeout` + `window.open` surface `renderTextLink` already ships (~269-291); no clipboard, notifications, or DNS. `mailto:`/`tel:` via `window.open` on iOS/Android is UNKNOWN until on-device; fallback is an opener helper, not `app.openWithDefaultApp` in v1. No AppFlowy-style confirm sheet |
| REQ-007 | Display-only (iCloud-safe) | No cell writes; hrefs not persisted. The only write is `ColumnDef` config when a user opts into the hint (same save `setTextRenderMode` already does, `DatabaseView.ts:5096-5100`). No per-row frontmatter churn, no telemetry, no secrets, no network validation |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A text cell whose column config carries `textLinkScheme: "https"` renders as a clickable link opening the value URL; bare `www.acme.com` becomes `https://www.acme.com` (concat, no DNS).
- **SC-002**: Cells without the hint (or with an unknown/assemble-`null` result) render exactly as before (plain text; zero visual diff).
- **SC-003**: `git diff` of the fork shows no change to the 12-type `ColumnDef.type` union at `src/data/types.ts:50`.
- **SC-004**: A column configured with an unsupported scheme value, or a value carrying a foreign scheme (`mailto:a@b.c` under `https`, `javascript:…` under any hint), renders plain text (closed allowlist + family gate).
- **SC-005**: Fork build gates pass: `npm run build` (esbuild production), `npm run lint`, and the vitest T1–T11 matrix against `assembleSchemeLinkTarget` plus the `ColumnDef` JSON round-trip test (`vitest.config.ts` includes `src/**/*.test.ts`; `src/__tests__/setup.ts` must exist — 005 or stub).

### Acceptance Scenarios

- **Scenario 1**: **Given** a text column with `textLinkScheme: "mailto"`, **when** a cell holds `a@b.c`, **then** the anchor `href` is `mailto:a@b.c`, the label is the raw `a@b.c`, and tapping it opens the mail handler.
- **Scenario 2**: **Given** a text column without the hint, **when** the cell renders, **then** output matches the pre-change render (the new case is inert without the hint).
- **Scenario 3**: **Given** a text column with `textLinkScheme: "https"` and a cell value `mailto:a@b.c`, **when** the cell renders, **then** the value stays plain text (family gate rejects `mailto:` under an `https` hint; `javascript:` under any hint is likewise plain text).
- **Scenario 4**: **Given** the fork diff vs upstream, **when** reviewed, **then** changes are confined to the new `src/data/textLinkScheme.ts` module and the 1-3 call-site edits (`types.ts`, `CellRenderer.ts`); the 12-type union is untouched.
- **Scenario 5**: **Given** a `tel`-hinted cell holding `+31 20 123`, **when** assembled, **then** the target is `tel:+3120123` (visual separators stripped from target only) and the label is the raw `+31 20 123`.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Upstream Obsidian plugin template | Rebase conflicts if call sites move upstream | Keep edits minimal (1-3 call sites) on the EuroFormat model |
| Dependency | `EuroFormat.ts` isolated-diff pattern | Deviating from the pattern risks dirty rebases | Mirror the module + call-site split exactly |
| Risk | `mailto:`/`tel:` via `window.open` on iOS/Android | UNKNOWN — zero `mailto`/`tel:` usage in `src/` today; mobile may not dispatch | Ship `window.open` like existing externals; if mobile fails, add an opener fallback in the shared click helper — do not guess `app.openWithDefaultApp` in v1 |
| Risk | Board / Gallery / List / record-detail do not honor the hint | Each special-cases `textRenderMode === "link"` and never enters `CellRenderer`'s default branch; CellRenderer-only v1 will not match Notion in those layouts | Lock v1 to CellRenderer; schedule the four one-line delegations (item 3) immediately after via a shared `{label,target}` helper |
| Risk | Anchor styling in dense tables | Visually noisy rows | Reuse the existing text-cell class; underline-on-hover only. `db-text-link` has no stylesheet rule in the fork — padding may need a small CSS add if the native `.external-link` hit box is too tight (still display-only) |
| Risk | Arbitrary scheme injection (e.g., `javascript:`) | Security issue in rendered links | Closed allowlist `https` \| `mailto` \| `tel` + family gate at assembly; fallback to plain text |
| Risk | Render regression in the text path | All text columns affected | New case is gated on hint presence and assemble ≠ `null`; run full build/lint/vitest gate |
| Dependency | `src/__tests__/setup.ts` (vitest `setupFiles`) | If phase 005 has not landed, vitest will not start | Add a one-line stub; feature code does not depend on let/lets |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Link assembly costs one string concatenation per rendered hint-bearing cell; plain cells take the existing path with no added work. `stringifyValue` (`src/data/Stringify.ts:1-14`) stays on the raw cell — only the renderer assembles.

### Security
- **NFR-S01**: Only `https` | `mailto` | `tel` are accepted; a value already carrying a scheme is returned as-is only when the detected scheme is in the hint family. Unknown values, foreign schemes (`javascript:`, `data:`), and `mailto:` under an `https` hint fall back to plain text, so no arbitrary scheme can produce executable links. Anchors are built with `td.createEl("a", { text, attr })` — never `innerHTML`.

### Reliability
- **NFR-R01**: Rendering is deterministic — hint presence and assemble result are the only behavioral switches; display-only, so no data can be corrupted. Empty/whitespace-only, length > 2048, and control-char (`\r`/`\n`/`\t`) values all assemble to `null` ⇒ plain text.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries

| Case | Behavior |
|------|----------|
| Empty / whitespace-only | No anchor (AppFlowy stores `""` verbatim). |
| `https://x.io/a?b=1` under `https` | Use as-is (no double prefix). |
| `http://x.io` under `https` | Use as-is (`http`/`https` family). |
| `mailto:a@b.c` under `https`, or `javascript:…` under any hint | Plain text (SC-004 / Scenario 3). |
| Bare `www.acme.com` under `https` | `https://www.acme.com` (concat, no DNS). |
| `a@b.c` under `mailto` | `mailto:a@b.c`; label raw. |
| `+31 20 123` under `tel` | Target `tel:+3120123`; label raw (visual separators stripped from target only). |
| `tel:+31 20 123` under `tel` | Target `tel:+3120123` (strip runs on already-schemed too); label raw. |
| `mailto:a@b.c` under `mailto` | Use as-is (family match); label raw. |
| Value `> 2048` chars, or control chars (`\r`/`\n`/`\t`) | Plain text. |
| Markdown syntax under a scheme hint | Literal value; scheme wins (precedence). |
| Hint on non-text column | Ignored: non-text types never hit `default:` (`CellRenderer.ts:185-211`). |
| Hint on a file-derived column reaching `default:` (e.g. `file.tags` after the special-file early return at `:174`) | Ignored: `!isFileFieldKey(col.key)` guard on the scheme branch, matching link/markdown (`CellRenderer.ts:212, 229`). |
| Unknown hint (`"ftp"`, `"javascript"`) | Plain text at config-read **and** assemble. |
| Toggle hint on/off | Render-only; no cell migration (not AppFlowy's RichText→URL transform). |

### Error Scenarios
- Unknown hint value renders plain text (allowlist fallback at both config-read and assembly).
- Hint present on a non-text column config is ignored — non-text types never reach the default branch.
- Hint on a file-derived column that reaches `default:` (e.g. `file.tags` after the special-file early return) is ignored — `!isFileFieldKey(col.key)` guard on the scheme branch, matching link/markdown.
- Assemble returns `null` (empty, too long, control chars, foreign scheme) ⇒ plain text, no empty anchor.

### Concurrent Operations
- No cell writes, so multi-device/iCloud sync is unaffected; the change is render-only. The only persisted write is `ColumnDef` config when a user opts into the hint — the same save `setTextRenderMode` already performs. Two devices editing the same column hint can conflict exactly as they can for `textRenderMode` today.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 4/25 | One optional config field + one render case + one small module |
| Risk | 4/25 | Render regression surface gated behind hint presence; security via closed allowlist |
| Research | 3/20 | Fork layout and EuroFormat diff model read; remaining paths confirmed at build time |
| **Total** | **11/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

1. **No double-prefix stripping?** Detect-and-skip + family allowlist (Anytype + F-006.2) vs blind concat. **Default: amend** — blind concat produces `mailto:https://…` and is the wrong Notion analog.
2. **Table-only v1 vs all layouts this phase?** Spec Files-to-Change and REQ-005 say table + 1–3 call sites; Notion parity says otherwise because the "reused by all views" sentence is false. **Default: lock v1 to CellRenderer; schedule item 3 immediately after.**
3. **Menu this phase?** Nested scheme choices under the existing display popover vs config-only hint. **Default: defer menu (item 4)** so v1 stays EuroFormat-shaped.
4. **`tel:` whitespace?** Reject (strict) vs strip-for-target (Notion-like). **Default: strip-for-target only; never mutate storage.**
5. **Mobile confirm sheet?** AppFlowy sheet vs Obsidian-native direct open. **Default: no sheet;** reuse delayed-open; revisit only if accidental-navigation reports appear.
6. **`http://` under an `https` hint?** Foreign (plain) vs family pass-through. **Default: pass through** (`src/data/TextLink.ts:29-31`).
7. **`mailto:` / `tel:` via `window.open` on iOS/Android?** UNKNOWN until on-device. **Default: ship `window.open` like existing externals; if mobile fails, add an opener fallback in the shared click helper — do not guess `app.openWithDefaultApp` in v1.**
8. **`ColumnDef` JSON round-trip of the new optional field?** Inferred safe by analogy with `textRenderMode` / `numberDisplayStyle` (`types.ts:47-71`); **confirmed via unit `JSON.parse(JSON.stringify(...))` in the vitest file** (no DatabaseView boot needed — persistence is `JSON.stringify` of `ColumnDef` inside view/schema config, `DatabaseView.cloneDatabaseConfig:930-931`). Treat a dropped field as a P0 if the round-trip fails.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-text-link-scheme-module/ | New `textLinkScheme.ts` (closed allowlist + assemble including tel-strip), `ColumnDef` hint, CellRenderer default-branch delayed-open, shared opener extract, vitest T1–T11 plus JSON round-trip — one same-diff slice | Complete |
| 2 | 002-layout-scheme-honor/ | Honor the hint in Board, Gallery, List, and record-detail via the shared `{label,target}` helper | Complete |
| 3 | 003-column-menu-scheme-picker/ | Column-menu picker for https, mailto, tel, or none, plus `setTextLinkScheme` beside `setTextRenderMode` | Complete |
| 4 | 004-scheme-column-width/ | Auto-width / wrap treats scheme-hint cells like link-mode labels | Complete |

Future / out of this phase (not child folders): Copy / Visit affordance; auto-detect URL / email / phone in unhinted text; a 13th column type; persisting assembled hrefs; extending `textRenderMode`; DNS / Google-search fallbacks; AppFlowy confirm sheet; speculative `db-text-link` CSS.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-text-link-scheme-module | 002-layout-scheme-honor | `textLinkScheme.ts` exports assemble + allowlist; `types.ts:62` has the optional hint; CellRenderer default branch emits delayed-open anchors; `renderDelayedExternalLink` is extracted (and importable) so layouts stay one-liners; `types.ts:50` union untouched | `npx vitest run` green on T1–T11 plus JSON round-trip; hinted table cell clickable; unhinted DOM unchanged |
| 002-layout-scheme-honor | 003-column-menu-scheme-picker | Board, Gallery, List, and record-detail honor the hint through the shared `{label,target}` helper instead of only `textRenderMode === "link"` | Call sites at `BoardRenderer.ts:1070`, `GalleryRenderer.ts:594`, `ListRenderer.ts:554`, `RecordDetailPanel.ts:373` delegate; no second 280 ms timer copy |
| 003-column-menu-scheme-picker | 004-scheme-column-width | Display popover can set `textLinkScheme` without hand-editing schema JSON; setter sits beside `setTextRenderMode` | `ColumnMenu.ts:133-150,393-418` plus `DatabaseView.ts:5096-5100` setter; optional field still round-trips |
<!-- /ANCHOR:phase-map -->
