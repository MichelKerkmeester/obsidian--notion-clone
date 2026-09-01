---
title: "Implementation Plan: URL / Email / Phone Link Fields"
description: "Plan for the additive textLinkScheme hint that renders text cells as clickable URL, email, or phone links."
trigger_phrases:
  - "link fields"
  - "text link scheme"
  - "clickable url"
  - "implementation plan"
  - "mailto"
  - "tel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown-agent"
    recent_action: "Reconciled plan with final-plan.md review findings"
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
# Implementation Plan: URL / Email / Phone Link Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin) |
| **Framework** | Obsidian plugin API — MIT fork at `specs/obsidian/001-notion-finance-migration/build/note-database-fork` |
| **Storage** | None for cells — display-only render change. The only persisted write is `ColumnDef` config when a user opts into the hint (same save as `setTextRenderMode`, `DatabaseView.ts:5096-5100`) |
| **Testing** | `npm run build` (esbuild production), `npm run lint`, vitest (`vitest.config.ts` includes `src/**/*.test.ts`; `package.json` has no `test` script — invoke `npx vitest run`) |

### Overview
This plan ships a closed-allowlist `textLinkScheme` hint on the existing text column config and assembles hrefs in a new EuroFormat-style isolated module, rendering only from the table text path in the first diff. The change is additive and isolated: one optional config field on `ColumnDef` (`src/data/types.ts:62`), one new module `src/data/textLinkScheme.ts`, and one render case in `CellRenderer.ts`'s default branch (~211-233) reusing the existing `renderTextLink` interaction shell (~269-291) — the EuroFormat diff model — so the 12-type `ColumnDef.type` union (`src/data/types.ts:50`) stays untouched and upstream rebases stay clean. v1 is locked to CellRenderer; Board/Gallery/List/record-detail honoring (item 3) and the column-menu picker (item 4) are deferred to keep the diff EuroFormat-shaped.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Fork layout read (`src/data/types.ts:47-71`, `src/views/CellRenderer.ts:110-233` and `:269-291`, `src/data/TextLink.ts:29-41`, `src/data/EuroFormat.ts:1-42` located). `ColumnDef.type` union at `:50` listed.
- [ ] `EuroFormat.ts` isolated-diff model reviewed (42 lines, zero imports, pure exports).
- [ ] Research synthesis reviewed (ranked backlog + locked design + edge-case matrix).
- [ ] Scope limited to v1: `types.ts` + `textLinkScheme.ts` + `CellRenderer.ts` + tests only. No CSS file opened in v1 (rely on Obsidian `.external-link`; add `db-text-link` padding only if a tap-target check fails).
- [ ] `src/__tests__/setup.ts` exists (landed in phase 005, or add a one-line stub so vitest starts). Feature code does not depend on let/lets.

### Definition of Done
- [ ] `textLinkScheme?: TextLinkScheme` added to `ColumnDef` at `src/data/types.ts:62` (immediately after `textRenderMode`); `type:` union at `:50` untouched.
- [ ] `src/data/textLinkScheme.ts` created exporting `TextLinkScheme`, `TEXT_LINK_SCHEMES`, `isTextLinkScheme`, `assembleSchemeLinkTarget`; tel-strip runs on **every** `tel:` target (prepend and already-schemed as-is paths).
- [ ] `CellRenderer.ts` default branch (~211-233) consults the hint behind a `!isFileFieldKey(col.key)` guard and emits an anchor via a shared `renderDelayedExternalLink(td, row, { label, target })` extracted from `renderTextLink`'s 280 ms shell (~269-291); precedence: scheme-hint wins if set and assemble ≠ `null`, else markdown → `textRenderMode === "link"` → plain (not F-007.1's markdown→link→scheme).
- [ ] `npm run build`, `npm run lint`, and `npx vitest run` (T1–T11 matrix + round-trip test) pass.
- [ ] 12-type `ColumnDef.type` union at `src/data/types.ts:50` confirmed untouched.
- [ ] `ColumnDef` JSON round-trip of the new optional field confirmed via unit `JSON.parse(JSON.stringify(...))` in the vitest file (P0 if it drops).

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Additive optional hint on the existing `ColumnDef`, rendered by a single new case in the existing text render path. The hint never creates a new column type — the 12-type `ColumnDef.type` union (`src/data/types.ts:50`) is a hard boundary. The new module mirrors `src/data/EuroFormat.ts:1-42` (pure functions, zero Obsidian imports, ~40 lines, one doc comment) so it stays a small, rebasable diff.

```ts
// optional hint on ColumnDef, sibling to textRenderMode; absent/unknown ⇒ plain text
textLinkScheme?: "https" | "mailto" | "tel"
```

### Key Components
- **`src/data/types.ts:62`**: Declares optional `textLinkScheme?: TextLinkScheme` on `ColumnDef`, sibling to `textRenderMode?: "plain" | "link" | "markdown"`.
- **`src/data/textLinkScheme.ts`** (new): Closed allowlist + `assembleSchemeLinkTarget(scheme, value): string | null`. Pure, zero imports, testable with vitest.
- **`src/views/CellRenderer.ts`** (default branch ~211-233, helper ~269-291): Consults the hint; hint-bearing cells with assemble ≠ `null` emit an anchor via the existing `renderTextLink` 280 ms delayed-open / dblclick-cancel shell; all others render plain text exactly as today.

### Locked Module API

```ts
export type TextLinkScheme = "https" | "mailto" | "tel";
export const TEXT_LINK_SCHEMES: readonly TextLinkScheme[];
export function isTextLinkScheme(v: unknown): v is TextLinkScheme;
export function assembleSchemeLinkTarget(scheme: TextLinkScheme, value: unknown): string | null;
```

### Locked `assembleSchemeLinkTarget` algorithm

1. Coerce to string, trim; `""` / whitespace-only ⇒ `null`.
2. Length `> 2048` ⇒ `null` (`anytype-ts/src/ts/lib/util/string.ts:623-627`).
3. Embedded `\r` / `\n` / `\t` ⇒ `null` (fork `normalizeExternalUrlTarget`, `src/data/TextLink.ts:37-39`).
4. If the value already has a scheme (`URL_SCHEME_RE` at `src/data/TextLink.ts:33`, or `new URL(value).protocol`): return the value **as-is** only when the detected scheme is in the **hint family** — `https` hint accepts `http:` and `https:` (`src/data/TextLink.ts:29-31`); `mailto` accepts `mailto:`; `tel` accepts `tel:`. Any other scheme (`javascript:`, `data:`, `mailto:` under `https`) ⇒ `null`. This is Anytype `checkUrlScheme` (`relation.ts:933-942`) plus the F-006.2 second gate.
5. Else prepend exactly one prefix: `https://` | `mailto:` | `tel:` (spec enum; **not** Anytype's `http://` for URL).
6. `tel:` only: strip visual separators (`space`, `()`, `-`) from the **target** on **every** `tel:` result — both the prepend path (step 5) and the already-schemed as-is path (step 4). Label remains the raw cell string. Do not write the stripped form back.
- Non-string / `null` ⇒ `null`. Empty assemble result ⇒ no `<a>` (plain text, no empty anchor).

**Do not** call `normalizeExternalUrlTarget` as the assembler: it returns `null` for every non-`http(s)` scheme (`src/data/TextLink.ts:37-41`), which is why `mailto`/`tel` are genuinely new.

### Locked precedence

If `isTextLinkScheme(col.textLinkScheme)` and assemble ≠ `null`, the scheme-hint anchor wins (it declares *how* to build the href). Else existing order: markdown → `textRenderMode === "link"` → plain (`src/views/CellRenderer.ts:211-233`). Do not extend the `textRenderMode` union.

### Locked render shell

Extract a tiny shared `renderDelayedExternalLink(td, row, { label, target })` from `renderTextLink`'s 280 ms delayed `window.open` / `detail > 1` dblclick-cancel (`src/views/CellRenderer.ts:269-291`) so scheme-hint and link-mode share one timer. The existing internal/external branch stays inside `renderTextLink` for link-mode; the scheme case calls the shared helper with `external: true`. Build the anchor with `td.createEl("a", { text, attr })` — never `innerHTML` (`:272-276`). Class: `db-text-link external-link`. Label = raw value. `href` = assembled target. This extract stays inside `CellRenderer.ts` (still one file) so deferred Board/Gallery/List/record-detail delegations (item 3) are one-liners.

### Locked call sites (v1, 1–3 edits)

| Role | File | Edit |
|------|------|------|
| New module | `src/data/textLinkScheme.ts` | Allowlist + `assembleSchemeLinkTarget` |
| Call site 1 | `src/data/types.ts` (~line 62) | `textLinkScheme?: TextLinkScheme` on `ColumnDef` |
| Call site 2 | `src/views/CellRenderer.ts` (default ~211-233, helper ~269-291) | Consult hint behind `!isFileFieldKey(col.key)` guard; emit delayed-open anchor via shared `renderDelayedExternalLink` or fall through |

Items 3–5 (Board/Gallery/List/record-detail delegation, ColumnMenu picker, ColumnWidth measurement) stay off this diff unless the operator expands the call-site budget.

### Data Flow
Column config → renderer reads `textLinkScheme` → `src/data/textLinkScheme.ts` validates the scheme against the closed allowlist and assembles the link (`https://…` / `mailto:…` / `tel:…`) → `CellRenderer` emits an anchor for valid schemes, plain text otherwise. `stringifyValue` (`src/data/Stringify.ts:1-14`) stays on the raw cell — exports/sort/filter never see the assembled href.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup (DoR)
- [ ] DoR items in §2 confirmed: fork layout read (`types.ts:47-71`, `CellRenderer.ts:110-233` + `:269-291`, `TextLink.ts:29-41`, `EuroFormat.ts:1-42`), EuroFormat model reviewed, synthesis reviewed, v1 scope locked, no CSS file in v1, `src/__tests__/setup.ts` exists (005 or stub).

### Phase 2: Core Implementation
- [ ] **Step 1 — New module**: Create `src/data/textLinkScheme.ts` (~40 lines, zero imports) with the locked algorithm including tel-strip on **all** `tel:` targets (prepend and already-schemed as-is). Do not import or call `normalizeExternalUrlTarget`.
- [ ] **Step 2 — Tests**: `src/data/__tests__/textLinkScheme.test.ts` (one file): T1–T11 matrix (adds `http://` family pass-through, schemed `tel:` strip, and schemed `mailto:` as-is) + `isTextLinkScheme("ftp") === false` + `ColumnDef` JSON round-trip test.
- [ ] **Step 3 — Call site 1**: Add `textLinkScheme?: TextLinkScheme` to `ColumnDef` at `src/data/types.ts:62` immediately after `textRenderMode`. Do not edit `type:` union at `:50`.
- [ ] **Step 4 — Call site 2**: `CellRenderer.ts` default branch (~211-233): `!isFileFieldKey(col.key)` && `isTextLinkScheme` && assemble ≠ `null` → delayed-open anchor via shared `renderDelayedExternalLink` extracted from `renderTextLink` (:269-291). Precedence: scheme-hint wins, else markdown → link-mode → plain (not F-007.1's order).
- [ ] **Step 5 — Round-trip**: Same vitest file: `JSON.parse(JSON.stringify({ key:"c", label:"C", type:"text", textLinkScheme:"mailto" }))` keeps `textLinkScheme`; absent field stays absent.
- [ ] **Step 6 — Display-only confirm**: No writes in the render path; `stringifyValue` (`Stringify.ts:1-14`) unused by assemble.

### Phase 3: Verification
- [ ] **Step 7 — Gates**: `npm run build`; `npm run lint`; `npx vitest run`. `git diff --stat` = `textLinkScheme.ts` + `types.ts` + `CellRenderer.ts` + tests (+ `setup.ts` stub if 005 missing). Union at `types.ts:50` untouched.
- [ ] **Step 8 — Manual (desktop)**: One hinted https/mailto/tel column (config JSON) + one unhinted column. Click opens OS handler; double-click edits.
- [ ] **Step 9 — Manual (mobile)**: Tap target vs `.external-link`; double-tap edit. `mailto:`/`tel:` via `window.open` on iOS/Android is UNKNOWN — do not fail the phase if on-device is unavailable; if it fails later, opener fallback inside the shared click helper (not `app.openWithDefaultApp` in v1).

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| TypeScript build | Fork-wide | `npm run build` (esbuild production) |
| Lint | Fork-wide | `npm run lint` |
| Unit tests | `assembleSchemeLinkTarget` + round-trip | `npx vitest run` — T1–T11 matrix (adds `http://` family pass-through, schemed `tel:` strip, and schemed `mailto:` as-is) + `ColumnDef` JSON round-trip test, same file |
| Manual | Desktop + mobile viewport | Tap test of https/mailto/tel anchors and plain-text cells; double-click/double-tap edit preserved |
| Rebase check | Diff vs upstream | `git diff` review confined to new module + 1–3 call-site edits; 12-type union untouched |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Fork source files (`src/data/types.ts`, `src/views/CellRenderer.ts`, `src/data/EuroFormat.ts`, `src/data/TextLink.ts`) | Internal | Green | No call-site to edit; phase cannot start |
| `EuroFormat.ts` diff model | Internal | Green | Isolated-diff pattern unavailable; rebase risk rises |
| Fork build/lint/vitest setup | Internal | Green | `npm run build`, `npm run lint`, `npx vitest run` (`vitest.config.ts` present; `package.json` has no `test` script) |
| `mailto:`/`tel:` dispatch via `window.open` on iOS/Android | External | UNKNOWN | Mobile may not open mail/phone handler; fallback is an opener helper in the shared click handler, not `app.openWithDefaultApp` in v1 |
| `src/__tests__/setup.ts` (vitest `setupFiles`) | Internal | Green if 005 landed; else stub needed | If missing, `npx vitest run` fails to start — add a one-line stub (feature code does not depend on let/lets) |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Text render regression, failing build/lint/vitest, or rebase conflict on upstream.
- **Procedure**: Revert the two call-site edits (`src/data/types.ts`, `src/views/CellRenderer.ts`) and delete `src/data/textLinkScheme.ts`. All changes are additive, so rollback is a clean removal with no migration.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 10 minutes |
| Core Implementation | Medium | ~75 minutes |
| Verification | Medium | ~35 minutes |
| **Total** | | **~2 hours (M)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Call-site edits enumerated (`src/data/types.ts:62`, `src/views/CellRenderer.ts` default branch + shared `renderDelayedExternalLink` helper).
- [ ] New module path recorded (`src/data/textLinkScheme.ts`).
- [ ] `ColumnDef.type` union diff at `src/data/types.ts:50` confirmed empty.
- [ ] `ColumnDef` JSON round-trip of `textLinkScheme` confirmed (unit stringify/parse test).
- [ ] `src/__tests__/setup.ts` present (005 or stub) so vitest runs.

### Rollback Procedure
1. Revert the two call-site edits (`src/data/types.ts`, `src/views/CellRenderer.ts`).
2. Remove the new module (`src/data/textLinkScheme.ts`).
3. Re-run `npm run build`, `npm run lint`, `npx vitest run`.
4. Re-check the diff vs upstream (isolated-diff shape preserved; 12-type union untouched).

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A — display-only render hint; no cell data is written. The only persisted artifact is `ColumnDef` config when a user opted into the hint, which round-trips identically to `textRenderMode` and is ignored by older builds.

<!-- /ANCHOR:enhanced-rollback -->
