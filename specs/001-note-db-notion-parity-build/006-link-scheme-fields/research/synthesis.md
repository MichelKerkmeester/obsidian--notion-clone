# Synthesis: URL / Email / Phone Link Fields
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict

This is worth building now: it is a daily-friction Notion gap whose UX is already proven as “text storage, click behavior differs,” and the fork already has the exact additive-hint shape (`textRenderMode`) plus an isolated-module rebase pattern. Headline recommendation: ship a closed-allowlist `textLinkScheme` on the existing text column, assemble hrefs in a new EuroFormat-style module, and render only from the table text path in the first diff — do **not** add a 13th column type. The single biggest risk is not the renderer: it is that `window.open` for `mailto:` / `tel:` is unproven on Obsidian iOS/Android, while Board / Gallery / List / record-detail each have their own `textRenderMode === "link"` branches, so a CellRenderer-only change will not match Notion in those layouts.

## Ranked backlog

1. **Clickable URL / Email / Phone on hinted text cells (table)** — Notion URL opens in a new tab, Email launches the mail client, Phone prompts a call, while typed values stay ordinary text; the fork’s default text path is `td.textContent = String(value)` with no `mailto`/`tel` capability anywhere in `src/`. Feasibility: **clear**. Files: `src/data/types.ts` (optional field), new `src/data/textLinkScheme.ts`, `src/views/CellRenderer.ts` (default branch). Effort: **S**. Depends on: nothing. Citation: [Notion Help — Database properties](https://www.notion.com/help/database-properties).

2. **Href assembly: prepend-if-missing, never `javascript:`** — Notion (and its formulas) store the raw string and prefix at display/open time (`link("Call", "tel:" + prop("Phone"))`); naive `scheme + raw` as the spec currently writes would emit `mailto:https://…` and would pass a `javascript:` value through if “already has a scheme” is honored without a second allowlist gate. Feasibility: **clear**. Files: `src/data/textLinkScheme.ts` only (do not reuse `normalizeExternalUrlTarget` unmodified). Effort: **S**. Depends on: item 1 (same PR). Citation: `anytype-ts/src/ts/lib/relation.ts:911-942` (`getUrlScheme` / `checkUrlScheme`).

3. **Honor the hint in Board, Gallery, List, and record detail** — Notion properties click in every layout; the spec assumed “the existing text render path is reused by all views,” but those surfaces each special-case `textRenderMode === "link"` and never enter `CellRenderer`’s default branch. Feasibility: **likely** (one-line delegation once a shared helper exists). Files: `src/views/BoardRenderer.ts:1069`, `src/views/GalleryRenderer.ts:594`, `src/views/ListRenderer.ts:554`, `src/views/RecordDetailPanel.ts:372-373`. Effort: **S**. Depends on: item 1’s shared `{label, target}` helper. Citation: `src/views/BoardRenderer.ts:1069`.

4. **Column-menu picker for `https` | `mailto` | `tel` | none** — Notion users pick URL / Email / Phone in the property-type menu; the fork already has a text “display” popover (`plain` / `link` / `markdown`) but no way to set `textLinkScheme` without hand-editing config. Feasibility: **clear**, with a **REQ-005 tension** (this is a 4th/5th file vs the 1–3 call-site budget). Files: `src/views/ColumnMenu.ts:133-150,393-418`, `src/views/DatabaseView.ts:5096-5100`. Effort: **S**. Depends on: item 1. Citation: `src/views/ColumnMenu.ts:393-418`.

5. **Auto-width / wrap treats scheme-hint cells like link-mode labels** — Notion sizes on the visible value; `ColumnWidth` already measures `textRenderMode === "link"` by `parseTextLink` label, not raw text, so a scheme-hinted column that still looks like a link would otherwise over-fit on the full URL. Feasibility: **clear**. Files: `src/views/ColumnWidth.ts:17-31,48,101-105`. Effort: **S**. Depends on: item 1. Citation: `src/views/ColumnWidth.ts:22-26`.

6. **`tel:` visual separators on the target only** — Notion accepts a phone “just like Text” (spaces, parens); a strict “reject any whitespace” allowlist would leave real numbers unclickable. Feasibility: **clear**. Files: `src/data/textLinkScheme.ts` (target mutation only; stored cell unchanged). Effort: **S**. Depends on: item 2. Citation: RFC 3966; [Notion Help — Database properties](https://www.notion.com/help/database-properties).

7. **Copy (and optional Visit) affordance** — AppFlowy desktop URL cells expose Visit + Copy; Notion’s click-to-open is the P0, copy is extra and **out of spec** (no link editing / health checks). Feasibility: **likely**. Files: hover icon or `title` on the existing `db-text-link` anchor in `src/views/CellRenderer.ts:269-276`; long-press later. Effort: **S**. Depends on: item 1. Citation: `frontend/appflowy_flutter/lib/plugins/database/widgets/cell/desktop_grid/desktop_grid_url_cell.dart:67-74`.

8. **Auto-detect URL / email / phone in unhinted text columns** — Anytype’s `urlFix` classifies schemeless values via `matchEmail` / `matchPhone`; the spec explicitly forbids this (hint is explicit). Feasibility: **blocked** (out of scope, not a technical wall). Files: none this phase. Effort: **M** if ever approved. Depends on: operator scope change. Citation: `anytype-ts/src/ts/lib/util/string.ts:619-647`; spec Out of Scope.

Ruled out (do not schedule): a new `FieldType::URL`-style column (`url_type_option.rs:19-24` widens the union; fork `ColumnDef.type` at `src/data/types.ts:50` is the REQ-003 hard boundary); persisting assembled hrefs (`apply_changeset` stores the raw string in `url_type_option.rs:99-104`); DNS / Google-search fallbacks (`url.dart:219-236` is offline-hostile); extending `textRenderMode` with `"https"|"mailto"|"tel"` (breaks every switch, i18n key, and width measurer on that union).

## Recommended build (locked design)

**Core algorithm** (pure, zero imports, ~40 lines — same profile as `src/data/EuroFormat.ts:1-42`):

- Hint type: `textLinkScheme?: "https" | "mailto" | "tel"` on `ColumnDef`, sibling to `textRenderMode?: "plain" | "link" | "markdown"` (`src/data/types.ts:62`). Absent / unknown ⇒ today’s plain text (REQ-001, REQ-004).
- `assembleSchemeLinkTarget(scheme, value): string | null`:
  1. Coerce to string, trim; `""` / whitespace-only ⇒ `null`.
  2. Length `> 2048` ⇒ `null` (`anytype-ts/src/ts/lib/util/string.ts:623-627`).
  3. Embedded `\r` / `\n` / `\t` ⇒ `null` (fork already rejects whitespace in `normalizeExternalUrlTarget`, `src/data/TextLink.ts:37-39`).
  4. If the value already has a scheme (`URL_SCHEME_RE` at `src/data/TextLink.ts:33`, or `new URL(value).protocol` as Anytype `urlScheme`): return the value **as-is** only when the detected scheme is in the **hint family** — `https` hint accepts `http:` and `https:` (fork `isExternalUrl` is already `/^https?:\/\//i` at `src/data/TextLink.ts:29-31`); `mailto` accepts `mailto:`; `tel` accepts `tel:`. Any other scheme (`javascript:`, `data:`, `mailto:` under an `https` hint, …) ⇒ `null`. This is Anytype `checkUrlScheme` (`relation.ts:933-942`) plus the F-006.2 second gate; without it, Scenario 3 is not actually closed.
  5. Else prepend exactly one prefix: `https://` | `mailto:` | `tel:` (spec enum; **not** Anytype’s `http://` for URL).
  6. `tel:` only: strip visual separators from the **target** (`space`, `()`, `-`) after step 5; label remains the raw cell string. Do not write the stripped form back.
- Non-string / `null` ⇒ `null`.
- Empty assemble result ⇒ no `<a>` (plain text, no empty anchor).

**Do not** call `normalizeExternalUrlTarget` as the assembler: it returns `null` for every non-`http(s)` scheme (`src/data/TextLink.ts:37-41`), which is why `mailto`/`tel` are genuinely new.

**Precedence (locked):** if `isTextLinkScheme(col.textLinkScheme)` and assemble ≠ `null`, the scheme-hint anchor wins (it declares *how* to build the href). Else existing order: markdown → `textRenderMode === "link"` → plain (`src/views/CellRenderer.ts:211-233`). Do not extend the `textRenderMode` union.

**Render shell:** reuse `renderTextLink`’s 280 ms delayed `window.open` / dblclick-cancel (`src/views/CellRenderer.ts:269-291`). Build the anchor with `td.createEl("a", { text, attr })` — never `innerHTML` (`:272-276`). Class: `db-text-link external-link`. Label = raw value. `href` = assembled target. Interaction is orthogonal to assembly: extract a tiny shared opener inside `CellRenderer` rather than a second timer.

**Exports / sort / filter:** leave `stringifyValue` (`src/data/Stringify.ts:1-14`) on the raw cell; only the renderer assembles (AppFlowy `stringify_cell_data` returns `cell_data.data`, `url_type_option.rs:88-90`).

**Module name:** `src/data/textLinkScheme.ts`

Exports:

```ts
export type TextLinkScheme = "https" | "mailto" | "tel";
export const TEXT_LINK_SCHEMES: readonly TextLinkScheme[];
export function isTextLinkScheme(v: unknown): v is TextLinkScheme;
export function assembleSchemeLinkTarget(scheme: TextLinkScheme, value: unknown): string | null;
```

**EuroFormat call sites (locked v1, 1–3 edits):**

| Role | File | Edit |
|------|------|------|
| New module | `src/data/textLinkScheme.ts` | Allowlist + `assembleSchemeLinkTarget` |
| Call site 1 | `src/data/types.ts` (~line 62) | `textLinkScheme?: TextLinkScheme` on `ColumnDef` |
| Call site 2 | `src/views/CellRenderer.ts` (`default:` ~211-233, helper ~269-291) | Consult hint; emit delayed-open anchor or fall through |

That is the spec Files-to-Change table with corrected paths (`views/`, not `components/`; `data/types.ts`, not a loose `types.ts`). Items 3–5 stay off this diff unless the operator expands the call-site budget.

**12-type union:** `ColumnDef.type` at `src/data/types.ts:50` stays verbatim (`"text" | … | "rollup"`).

## Edge cases & mobile/iCloud safety

Handle these as assemble → `null` ⇒ plain text, except where noted:

| Case | Behavior |
|------|----------|
| Empty / whitespace-only | No anchor (spec; AppFlowy stores `""` verbatim). |
| `https://x.io/a?b=1` under `https` | Use as-is (no double prefix). |
| `http://x.io` under `https` | Use as-is (`http`/`https` family). |
| `mailto:a@b.c` under `https`, or `javascript:…` under any hint | Plain text (SC-004 / Scenario 3). |
| Bare `www.acme.com` under `https` | `https://www.acme.com` (concat, no DNS). |
| `a@b.c` under `mailto` | `mailto:a@b.c`; label raw. |
| `+31 20 123` under `tel` | Target `tel:+3120123`; label raw (item 6). |
| Value `> 2048` chars, or control chars | Plain text. |
| Markdown syntax under a scheme hint | Literal value; scheme wins (item 1 precedence). |
| Hint on non-text column | Ignored: non-text types never hit `default:` (`src/views/CellRenderer.ts:185-211`). |
| Unknown hint (`"ftp"`, `"javascript"`) | Plain text at config-read **and** assemble. |
| Toggle hint on/off | Render-only; no cell migration (toggling a hint is not AppFlowy’s RichText→URL transform, `url_type_option.rs:27-60`). |

**Mobile (REQ-006):** the planned path uses the same DOM + `window.setTimeout` + `window.open` surface `renderTextLink` already ships (`src/views/CellRenderer.ts:269-291`) — no clipboard, notifications, or DNS. AppFlowy mobile URL cells use an opaque hit target and a Launch/Copy sheet (`mobile_grid_url_cell.dart:25-40`); the fork should **not** add that sheet. Direct first-tap matches Obsidian’s own external-link preview behavior; the 280 ms delay is harmless on touch and still lets double-tap reach inline edit. Verify tap size on device: `db-text-link` has **no** stylesheet rule in the fork (class is set in `CellRenderer.ts:273` only), so padding may need a small CSS add if the native `.external-link` hit box is too tight — still display-only.

**iCloud / sync (REQ-007):** cell values are never written; hrefs are not persisted (AppFlowy lesson, `url_type_option.rs:99-104`). The only write is `ColumnDef` when a user opts into the hint — the same config save `setTextRenderMode` already does (`DatabaseView.ts:5096-5100`). No per-row frontmatter churn, no telemetry, no secrets, no network validation (the counter-example is AppFlowy’s `InternetAddress.lookup`). Two devices editing the same column hint can conflict exactly as they can for `textRenderMode` today.

**Build gates (SC-005 resolved):** `npm run build` → `node esbuild.config.mjs production`; `npm run lint`; vitest is configured (`vitest.config.ts` includes `src/**/*.test.ts`) even though `package.json` has no `test` script. Unit the T1–T10 matrix from iteration 010 against `assembleSchemeLinkTarget`. Diff vs upstream must not touch the 12-type union.

## Open questions / operator decisions

1. **Amend spec edge case “no double-prefix stripping”?** Detect-and-skip + family allowlist (Anytype + F-006.2) vs blind concat. **Default: amend.** Blind concat produces `mailto:https://…` and is the wrong Notion analog.

2. **Table-only v1 vs all layouts this phase?** Spec Files-to-Change and REQ-005 say table + 1–3 call sites; Notion parity and the spec’s own “reused by all views” sentence say otherwise, because that reuse is false. **Default: lock v1 to CellRenderer; schedule item 3 immediately after** (shared helper makes those four files one-liners). Approve a call-site-budget exception only if Wave 3 must look complete in Board/Gallery on day one.

3. **Menu this phase?** Nested scheme choices under the existing display popover vs config-only hint. **Default: defer menu (item 4)** so v1 stays EuroFormat-shaped; power users set `textLinkScheme` in view config the same way an optional field already round-trips. Approve ColumnMenu + `setTextLinkScheme` if discoverability is a launch requirement.

4. **`tel:` whitespace?** Reject (strict NFR) vs strip-for-target (Notion-like). **Default: strip-for-target only; never mutate storage.**

5. **Mobile confirm sheet?** AppFlowy sheet vs Obsidian-native direct open. **Default: no sheet;** reuse delayed-open; revisit only if accidental-navigation reports appear.

6. **`http://` under an `https` hint?** Treat as foreign (plain) vs family pass-through. **Default: pass through** (`src/data/TextLink.ts:29-31`).

7. **`mailto:` / `tel:` via `window.open` on iOS/Android?** UNKNOWN until on-device (zero `mailto`/`tel:` usage in `src/` today). **Default: ship `window.open` like existing externals; if mobile fails, add an opener fallback in the shared click helper — do not guess `app.openWithDefaultApp` in v1.**

8. **ColumnDef JSON round-trip of the new optional field?** Inferred safe by analogy with `textRenderMode` / `numberDisplayStyle` (`types.ts:47-71`); **confirm save/load at build.** Recommended default: proceed; treat a dropped field as a P0 if the round-trip fails.
