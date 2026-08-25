# Final Plan: URL / Email / Phone Link Fields
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

Build it. Notion URL/email/phone are “text storage, click behavior differs” (`research.md` F-005.1). The fork already has the additive-hint shape (`textRenderMode` at `types.ts:62`) and the EuroFormat isolated-module pattern (`EuroFormat.ts:1-42`). Widening `ColumnDef.type` (`types.ts:50`) is correctly forbidden. Blind concat is correctly rejected: Anytype `checkUrlScheme` plus F-006.2’s family gate is the Notion analogue (`synthesis.md` ranked item 2; `research.md` F-004.2, F-006.2). Do **not** call `normalizeExternalUrlTarget` as the assembler — it returns `null` for every non-`http(s)` scheme (`TextLink.ts:37-41`); repo grep is still zero `mailto`/`tel:` in `src/`. v1 locked to CellRenderer is the right EuroFormat budget; Board/Gallery/List/record-detail each special-case `textRenderMode === "link"` and never enter `CellRenderer`’s `default:` (`BoardRenderer.ts:1070`, `GalleryRenderer.ts:594`, `ListRenderer.ts:554`, `RecordDetailPanel.ts:373` — synthesis’s `:1069` / `:372` are off-by-one). Menu picker is correctly deferred (4th/5th file vs REQ-005).

What is solid: closed allowlist, assemble→`null` ⇒ plain text (no empty `<a>`), `td.createEl` never `innerHTML` (`CellRenderer.ts:272-276`), 280 ms delayed `window.open` / dblclick-cancel (`:269-291`), `stringifyValue` stays raw (`Stringify.ts:1-14`), AppFlowy lesson not to persist hrefs, no DNS, no confirm sheet.

Gaps and under-weighted edges:

1. **T001–T003 are Definition of Ready, not build tasks.** T016–T025 explode one test file into ten tasks. That pads the list without changing the diff.

2. **Shared opener is named in architecture and then not tasked.** Synthesis: “extract a tiny shared opener inside `CellRenderer` rather than a second timer.” T007 says “reuse `renderTextLink`.” Copy-paste of the 280 ms timer is how Board/Gallery later become four copies. Extract now (still one file) so deferred T011 is actually one-liners.

3. **`isFileFieldKey` guard is missing from the render case.** Markdown and link modes skip file fields (`CellRenderer.ts:212, 229`). File columns can still reach `default:` (e.g. `file.tags` after the special-file early return at `:174`). A hint on a file column must be ignored the same way.

4. **Tel strip does not run on already-schemed values.** Locked algorithm step 4 returns as-is when the family matches; step 6 strips separators only after prepend. `tel:+31 20 123` under `tel` keeps spaces. Step 3 only rejects `\r\n\t`, not space. **Strip visual separators on every `tel:` target**, including the as-is path. Storage and label stay raw.

5. **T1–T10 omit the locked `http://` family pass-through** (`TextLink.ts:29-31`; synthesis Q6). Add `http://x.io` + `https` ⇒ unchanged. Also missing: already-schemed `mailto:` under `mailto`, `tel:` under `tel` after strip.

6. **JSON round-trip (T010 / CHK-026) has no method.** There is no setter in v1 (`setTextRenderMode` is `DatabaseView.ts:5096-5100`). Persistence is `JSON.stringify` of `ColumnDef` inside view/schema config (`DatabaseView.cloneDatabaseConfig` `:930-931` is `JSON.parse(JSON.stringify(config))`). Optional fields survive if present; `undefined` is omitted — same as `textRenderMode`. Prove with a unit stringify/parse of a column object. Do not wait for a menu.

7. **Precedence vs iteration 007.** F-007.1 briefly said markdown → link → scheme. Locked synthesis/plan is correct: **scheme-hint wins** if `isTextLinkScheme` and assemble ≠ `null`, else markdown → `textRenderMode === "link"` → plain (`CellRenderer.ts:211-233`). Implement the locked rule, not F-007.1.

8. **75 minutes underweights verification.** Module + two call sites is ~45 min. Shared-opener extract, T1–T11, round-trip test, build/lint, desktop click/dblclick is closer to **M (~2 h)**. Mobile `window.open` for `mailto:`/`tel:` is UNKNOWN (synthesis Q7) — do not block v1 on-device (CHK-045 is P1 with an explicit fallback, not a P0).

9. **CSS.** `db-text-link` is set only at `CellRenderer.ts:273`; `styles.css` has no rule (research F-009.1). Rely on Obsidian `.external-link` in v1; add padding only if a tap-target check fails. Do not open a fourth file for speculative CSS.

10. **Phase 005 adjacency.** `vitest.config.ts` requires `src/__tests__/setup.ts`. If 005 has not landed, 006 still needs that file (can be a one-line stub) or vitest will not start. Feature code does not depend on let/lets.

Out of scope stays out: 13th column type, persisting hrefs, auto-detect (`urlFix`), extending `textRenderMode`, AppFlowy DNS/Google fallback, confirm sheet.

## Optimizations

- Collapse T001–T003 into DoR. Collapse T016–T025 into one test-file task plus an explicit extra case for `http://` and schemed `tel:` strip.
- One `assembleSchemeLinkTarget` implementation including tel-strip on **all** tel targets; T006 is not a second pass.
- Refactor `renderTextLink` to a tiny `renderDelayedExternalLink(td, row, { label, target })` (external-only for scheme hints; existing internal/external branch stays for link-mode). Scheme case calls it with `external: true`.
- Guard `!isFileFieldKey(col.key)` on the scheme branch, matching link/markdown.
- Round-trip test in the same vitest file as assemble (no DatabaseView boot).
- Defer T011–T015 as written. If Wave 3 must look complete in Board on day one, T011 is the only budget exception — still not this default plan.
- Do not add ColumnMenu in v1. Tester/power-user config: set `"textLinkScheme": "mailto"` on a text `ColumnDef` in the saved schema (same JSON round-trip as `textRenderMode`).

## Final build plan (ordered)

| # | Step | Module / call site | Effort | Acceptance | Depends on |
|---|------|--------------------|--------|------------|------------|
| 0 | DoR | Read `types.ts:47-71`, `CellRenderer.ts:110-233` and `:269-291`, `TextLink.ts:29-41`, `EuroFormat.ts:1-42`. Confirm `setup.ts` exists (005 or stub). | S | Default branch and delayed-open contract confirmed. `ColumnDef.type` union at `:50` listed. | — |
| 1 | New module | Create `src/data/textLinkScheme.ts` (~40 lines, **zero imports**). Export `TextLinkScheme`, `TEXT_LINK_SCHEMES`, `isTextLinkScheme`, `assembleSchemeLinkTarget(scheme, value): string \| null`. Algorithm: coerce+trim; empty ⇒ `null`; length > 2048 ⇒ `null`; `\r`/`\n`/`\t` ⇒ `null`; non-string/null ⇒ `null`; if `URL_SCHEME_RE` (`TextLink.ts:33`) matches, return as-is **only** when family matches (`https` accepts `http:`/`https:`; `mailto`/`tel` exact); else `null` (`javascript:`, `data:`, `mailto:` under `https`); else prepend `https://` \| `mailto:` \| `tel:`. Then if the resulting target is `tel:`, strip `space`, `()`, `-` from the **href only**. Unknown scheme type never reaches assemble (`isTextLinkScheme` false at call site). | S | Unit matrix below green. Do not import or call `normalizeExternalUrlTarget`. | 0 |
| 2 | Tests | `src/data/__tests__/textLinkScheme.test.ts` (one file). T1 `www.acme.com`+https → `https://www.acme.com`; T2 full https unchanged; T3 `mailto:a@b.c`+https → `null`; T4 `javascript:alert(1)` any → `null`; T5 `a@b.c`+mailto → `mailto:a@b.c`; T6 `+31 20 123`+tel → `tel:+3120123`; T6b `tel:+31 20 123`+tel → `tel:+3120123`; T7 empty/whitespace → `null`; T8 2049 chars → `null`; T9 `\r\n` → `null`; T10 number/null → `null`; T11 `http://x.io`+https → unchanged. Also: unknown hint never assembled if tests call `isTextLinkScheme("ftp") === false`. | S | All cases pass via `npx vitest run`. | 1 |
| 3 | Call site 1 | `src/data/types.ts`: add `textLinkScheme?: TextLinkScheme` on `ColumnDef` **immediately after** `textRenderMode` (`:62`). Import or duplicate the type alias from `textLinkScheme.ts` (prefer import of the type only — `types.ts` already imports sibling modules). **Do not** edit the `type:` union at `:50`. | S | `git diff` on `:50` empty. Optional field sibling to `textRenderMode`. | 1 |
| 4 | Call site 2 | `src/views/CellRenderer.ts` `default:` `:211-233`. Precedence: if `!isFileFieldKey(col.key)` && `isTextLinkScheme(col.textLinkScheme)` && assemble ≠ `null` → delayed-open anchor (label = raw `String(value)`, `href` = assembled, class `db-text-link external-link`, `td.createEl` only). Else existing markdown → link-mode `renderTextLink` → `td.textContent`. Extract shared 280 ms `window.open` / `detail > 1` cancel from `renderTextLink` `:269-291` so scheme and link-mode share one timer. | M | Hinted cell clickable; unhinted DOM unchanged; markdown under a set hint is literal (scheme wins); file fields ignore the hint; dblclick still reaches `makeEditable` (`:242-245`). | 1, 3 |
| 5 | Round-trip | Same test file: `JSON.parse(JSON.stringify({ key: "c", label: "C", type: "text", textLinkScheme: "mailto" }))` keeps `textLinkScheme`. Absent field stays absent. | S | CHK-026. Analogous to `textRenderMode` / `numberDisplayStyle` (`types.ts:62-64`). | 3 |
| 6 | Display-only / stringify | Confirm no writes in the render path; `stringifyValue` (`Stringify.ts:1-14`) unused by assemble. | S | Exports/sort/filter still see raw cell. Only config write is a future menu; v1 has none. | 4 |
| 7 | Gates | `npm run build`; `npm run lint`; `npx vitest run`. `git diff --stat` = `textLinkScheme.ts` + `types.ts` + `CellRenderer.ts` + tests (+ `setup.ts` stub if 005 missing). Union at `types.ts:50` untouched. | S | SC-003, SC-005, REQ-001–005, REQ-007. | 2, 4, 5 |
| 8 | Manual (desktop) | One hinted https / mailto / tel column (config JSON) + one unhinted column. Click opens OS handler; double-click edits. | S | SC-001, SC-002, delayed-open preserved. | 7 |
| 9 | Manual (mobile viewport / on-device) | Tap target vs `.external-link`; double-tap edit. `mailto:`/`tel:` via `window.open` on iOS/Android is **UNKNOWN**. | S | Do not fail the phase if on-device is unavailable. If it fails later: opener fallback **inside** the shared click helper — not `app.openWithDefaultApp` in v1. | 7 |

Deferred (do not build): T011 Board `:1070` / Gallery `:594` / List `:554` / RecordDetail `:373` via `{label,target}` helper; T012 ColumnMenu `:133-150,393-418` + `setTextLinkScheme` beside `setTextRenderMode` `:5096-5100`; T013 `ColumnWidth.ts:17-31,48,101-105`; T014 copy/visit; T015 auto-detect.

Rollback: revert `types.ts` + `CellRenderer.ts`, delete `textLinkScheme.ts` (+ tests). No cell migration.

## Risks & open decisions

| Item | Recommendation (default) |
|------|--------------------------|
| Table-only vs all layouts | **Lock v1 to CellRenderer.** Schedule T011 immediately after; do not expand this diff unless Wave 3 must look complete in Board/Gallery on day one. |
| Column menu | **Defer.** Power users set `textLinkScheme` on the column in saved schema JSON. Approve T012 only if discoverability is a launch requirement (REQ-005 tension). |
| `mailto:`/`tel:` on iOS/Android `window.open` | **Ship `window.open` like existing externals** (`CellRenderer.ts:289`). Fallback later in the shared helper; do not guess `app.openWithDefaultApp` in v1. Do not block merge on CHK-045. |
| `http://` under `https` hint | **Pass through** (`isExternalUrl` at `TextLink.ts:29-31`). |
| `tel:` separators | **Strip `space`, `()`, `-` from every tel target**, including already-schemed. Do not strip `.` unless a follow-up shows US dotted numbers failing. Never write stripped form to storage. |
| Tap-target CSS | **No CSS in v1.** Add a `db-text-link` padding rule only after a real tight hit-box. Still display-only. |
| Confirm sheet | **No.** Revisit only if accidental-navigation reports appear. |
| JSON round-trip | **Proceed.** Treat a dropped field as P0. Evidence = stringify/parse test, not a UI setter. |
| Vitest `setupFiles` missing | If 005 has not created `src/__tests__/setup.ts`, **add a stub** so 006 tests run. Do not wait on let/lets. |
| Auto-detect unhinted text | **Out of scope** (T015). Hint is explicit. |
