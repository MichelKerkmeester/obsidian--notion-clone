# Deep Research: URL / Email / Phone Link Fields

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/ox-alpha-cline`. Stop reason: max_iterations. Average newInfoRatio: 0.700.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork Baseline: Existing Link Machinery

**Focus:** Establish the exact current state of link rendering in the fork so `textLinkScheme` is designed against reality, not the scaffold's assumptions.

## Findings

### F-001.1 — A sibling per-column hint already exists: `textRenderMode`
`ColumnDef` (src/data/types.ts:47) carries a 12-type union at line 50 (`"text" | "number" | ... | "rollup"` — spec's REQ-003 boundary confirmed verbatim). Line 62 declares `textRenderMode?: "plain" | "link" | "markdown"` — an optional, additive, per-column display hint with exactly the shape the spec proposes for `textLinkScheme`. This is the strongest precedent: the new hint should be a fourth display knob, not a parallel mechanism.
[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types.ts:47,50,62]

### F-001.2 — Text render dispatch lives in the default branch
CellRenderer.ts:211 `default:` → markdown mode (:213), link mode (:229-231 `renderTextLink`), else plain `td.textContent = String(value)` (:233). The scaffold's "~lines 212-229" estimate is accurate. Any `textLinkScheme` case slots into this same default branch; non-text column types never reach it (each has its own case), which mechanically enforces the spec's "hint ignored on non-text columns" edge case.
[SOURCE: src/views/CellRenderer.ts:211-233]

### F-001.3 — `parseTextLink` deliberately REJECTS mailto:/tel: today
TextLink.ts defines `URL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i` (~line 28) and `normalizeExternalUrlTarget` returns null for any value carrying a non-http(s) scheme; only bare domains get normalized to `https://…` via `BARE_WEB_URL_RE` (~line 29). So the existing link path cannot render `mailto:` or `tel:` values at all — the new module must own its own allowlist logic rather than reuse `normalizeExternalUrlTarget` unmodified. Repo-wide grep finds zero occurrences of `mailto`/`tel:` in src/ — this is genuinely new capability.
[SOURCE: src/data/TextLink.ts:28-46; repo grep]

### F-001.4 — Interaction contract: delayed single-click open coexisting with inline edit
`renderTextLink` (CellRenderer.ts:269-299) opens links on click after a 280ms timer so double-click can still enter the inline editor; second click cancels the pending open. External links use `window.open`, internal use `app.workspace.openLinkText`. Anchor class: `db-text-link external-link|internal-link`. A scheme-hint anchor must reproduce this dblclick-coexistence or cells become hard to edit.
[SOURCE: src/views/CellRenderer.ts:269-299]

### F-001.5 — Menu UX precedent for choosing the hint
ColumnMenu.ts:130-150 adds a "display" submenu item for text columns with hover popover; ColumnMenu.ts:395-418 renders plain/link/markdown options as a listbox and calls `actions.setTextRenderMode`; DatabaseView.ts:5096-5097 persists `undefined` for "plain" (absent = default). Adding `https|mailto|tel|none` options to this same popover keeps call-site growth minimal and UX discoverable.
[SOURCE: src/views/ColumnMenu.ts:130-150,395-418; src/views/DatabaseView.ts:5096-5097]

### F-001.6 — Width/wrap machinery already special-cases link mode
ColumnWidth.ts measures rendered text differently for `link` (label only) vs `markdown` vs plain (:18-48, :95-104). If scheme hints render anchors, width measurement should treat them like link-mode labels or leave plain measurement — needs a decision in the integration iteration.
[SOURCE: src/views/ColumnWidth.ts:18-48,95-104]

### F-001.7 — EuroFormat isolated-module model quantified
EuroFormat.ts = 42 lines, zero imports, pure exported functions, one doc comment explaining the rebase rationale ("Kept in one module so it stays a small, rebasable diff"). The textLinkScheme module should match this profile: closed allowlist constant + one `assembleLink(scheme, value): {target} | null` function + no Obsidian imports (testable with vitest, config exists at fork root vitest.config.ts).
[SOURCE: src/data/EuroFormat.ts:1-42; package.json scripts (`build`=esbuild, `lint`=eslint; vitest.config.ts present)]

## Ruled out
- Reusing `normalizeExternalUrlTarget` as-is for scheme assembly — it structurally rejects mailto/tel (F-001.3).
- Placing the allowlist inline in CellRenderer — violates the EuroFormat isolation model and spec Files-to-Change table.

## newInfoRatio: 1.0 (fully-new baseline against empty registry)

## Next Focus
002 — AppFlowy Rust core: how flowy-database2 models URL type options/cells.

---

# Iteration 002 — AppFlowy Rust Core: URL Field Model

**Focus:** How flowy-database2 models URL cells at the grid-model layer, to contrast with the fork's additive-hint design.

## Findings

### F-002.1 — AppFlowy makes URL a SEPARATE field type; the fork deliberately does not
`URLTypeOption` implements `TypeOption` as its own FieldType (`FieldType::URL`) alongside RichText: `impl TypeOption for URLTypeOption { type CellData = URLCellData; ... }`. This widens the type union — exactly what the fork's REQ-003 forbids. The fork's hint-on-text-config approach achieves the same UX inside the existing text type; AppFlowy confirms the capability is worth a first-class model but does not mandate a new column type.
[SOURCE: specs/obsidian/002-note-db-notion-parity-build/context/appflowy/frontend/rust-lib/flowy-database2/src/services/field/type_options/url_type_option/url_type_option.rs:19-24]

### F-002.2 — Cell payload is scheme-free raw string; assembly happens at render/open time
`URLCellData { data: String }`; the changeset stores the user input verbatim (`apply_changeset` wraps `changeset` with zero normalization — test proves `"123"` stays `"123"`, `""` stays `""`). No scheme validation, no persistence of a derived href. Lesson: store the raw value, derive the link deterministically at render — matches the fork's display-only design and keeps iCloud/frontmatter data untouched.
[SOURCE: url_type_option.rs:99-104; url_tests.rs:10-27]

### F-002.3 — Text→URL transform migrates cell content wholesale
`transform_type_option` copies every RichText cell into `URLCellData::from(cell)` when converting a column. Implication for the fork: toggling `textLinkScheme` on an existing text column needs NO data migration — values are already strings; only rendering changes. The spec's "no writes" stance is strictly simpler than AppFlowy's because no type change occurs.
[SOURCE: url_type_option.rs:29-60]

### F-002.4 — Stringify stays raw
`stringify_cell_data` returns `cell_data.data` unchanged — exports/sort/filter operate on the raw value, not the assembled href. Fork parallel: `Stringify.ts`-style consumers must keep seeing the plain value; only the renderer assembles links.
[SOURCE: url_type_option.rs:88-90]

## Ruled out
- Following AppFlowy's separate-field-type architecture (violates REQ-003; unnecessary given per-column config hints already exist in the fork).
- Persisting normalized hrefs into cell data (display-only spec; AppFlowy itself doesn't).

## newInfoRatio: 0.7 (new architecture contrast + storage contract; partially overlaps known "no new type" constraint)

## Next Focus
003 — AppFlowy Flutter UI: URL cell rendering/editing skins.

---

# Iteration 003 — AppFlowy Flutter UI: URL Cell Rendering & Interaction

**Focus:** Concrete UI/UX mechanics for clickable URL cells across desktop and mobile.

## Findings

### F-003.1 — Link affordance = underline + theme primary color
Desktop grid skin styles the cell text with `color: colorScheme.primary` + `TextDecoration.underline`, single line unless wrap enabled (`maxLines: wrap ? null : 1`). Matches the spec risk-mitigation "reuse the existing text-cell class; underline-on-hover only" — AppFlowy shows a permanent subtle link style is acceptable and expected by users.
[SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/widgets/cell/desktop_grid/desktop_grid_url_cell.dart:39-63]

### F-003.2 — Hover accessories: Visit + Copy (desktop)
Desktop accessory builder attaches `VisitURLCellAccessoryBuilder` and `CopyURL` actions; copy shows a toast (`message_copy_success`). A copy affordance is a parity-relevant extra the fork could add cheaply via title/tooltip or a small hover icon.
[SOURCE: desktop_grid/desktop_grid_url_cell.dart:76-83; editable_cell_skeleton/url.dart:200-216]

### F-003.3 — Scheme fallback chain at open time (robustness pattern)
`openUrlCellLink`: parse → if no scheme, prepend `http://` (+DNS check) → on any failure fall back to `https://www.google.com/search?q=<encoded content>`. Guarantees the click always does something useful even for junk values — a graceful-degradation idea beyond the fork's current binary plan/plain split.
[SOURCE: editable_cell_skeleton/url.dart:219-236]

### F-003.4 — Mobile: tap opens bottom-sheet editor with Launch/Copy quick actions; opaque hit target
Mobile grid skin wraps content in `GestureDetector(onTap…, behavior: HitTestBehavior.opaque)` with generous padding (12h/10v), horizontal-scroll single-line text; tap opens `showMobileBottomSheet` with **Launch** and **Copy** buttons gated on non-empty content. Mobile does NOT navigate directly from the cell — an explicit confirm step that prevents accidental navigation on touch scroll. The fork's mobile-safe requirement (REQ-006) should mirror this: larger tap area, and consider whether direct anchor navigation is acceptable in Obsidian mobile or whether a menu-first approach is safer.
[SOURCE: mobile_grid/mobile_grid_url_cell.dart:18-56]

### F-003.5 — Validation is advisory, network-based, non-blocking
`URLCellBloc._isUrlValid` prefixes `http://` when missing, parses host, does `InternetAddress.lookup(hostName)`; result drives an `isValid` state but never blocks saving. Lesson: validation-as-warning (e.g., tooltip) beats hard rejection; but DNS lookups are offline-hostile — the fork's closed allowlist without network checks is more iCloud/offline-friendly.
[SOURCE: application/cell/bloc/url_cell_bloc.dart:79-100]

## Ruled out
- DNS/network validation in the fork (offline-hostile, overkill for display-only).
- Direct navigation from cell tap on mobile without any affordance (accidental-nav risk shown by AppFlowy's bottom-sheet confirm step).

## newInfoRatio: 0.8 (all-new UX mechanics: accessories, fallback chain, mobile sheet pattern)

## Next Focus
004 — Anytype: Url/Email/Phone relation formats and their scheme algorithm.

---

# Iteration 004 — Anytype: Url/Email/Phone Relation Formats

**Focus:** Anytype's exact scheme-mapping algorithm — the closest open-source analogue to `textLinkScheme`.

## Findings

### F-004.1 — Three distinct text-family formats share one "isUrl" click behavior
`Relation.isUrl(type)` returns true for `[RelationType.Url, RelationType.Email, RelationType.Phone]` — Anytype models the trio as three formats of one clickable family, exactly mirroring the spec's `https|mailto|tel` enum as one hint with three values.
[SOURCE: context/anytype-ts/src/ts/lib/relation.ts:860-867]

### F-004.2 — THE algorithm: format→scheme prefix map + prepend-if-missing
`getUrlScheme(type, value)` maps Url→`http://`, Email→`mailto:`, Phone→`tel:`; `checkUrlScheme(type, value)` extracts any existing scheme via `new URL(value).protocol` and prepends the mapped prefix ONLY when none is present. This is precisely `textLinkScheme.ts`'s core function, and it answers the spec's double-prefix edge case better than the spec's current stance ("no double-prefix stripping"): detect-and-skip means a cell containing a full URL under an Email-hinted column still opens correctly instead of producing `mailto:https://…`.
[SOURCE: lib/relation.ts:911-948; lib/util/string.ts:605-616]

### F-004.3 — Click routing: only when not editing
Grid cells call `Action.openUrl(Relation.checkUrlScheme(format, value))` on click only when `!canEdit`; dataview card/board views gate on `!isRecordEditing`. Confirms the fork's existing pattern (delay/cancel click when inline edit may start) matches industry behavior.
[SOURCE: component/cell/index.tsx:72-74; component/block/dataview.tsx:847-849]

### F-004.4 — Defense-in-depth at the open boundary
`Action.openUrl`: fixes scheme via `urlFix`, then checks scheme against `allowedSchemes` AND a dangerous blocklist (`javascript, data, ws, wss, chrome, about, ssh, blob, ms-msdt, search-ms, ms-officecmd`); unapproved/dangerous schemes trigger a confirmation popup before `Renderer.send('openUrl', url)`. The fork's closed allowlist (`https|mailto|tel`) makes the blocklist unnecessary at render time, but Obsidian's own external-link handling remains the final gate.
[SOURCE: lib/action.ts:199-235]

### F-004.5 — urlFix hardening extras worth borrowing
`urlFix` rejects strings > 2048 chars (DoS/abuse guard), and auto-classifies schemeless values via `matchEmail` → `mailto:`, `matchPhone` → `tel:`, else `https://`. The 2048 cap is a cheap NFR-grade guard for link assembly; auto-detection stays OUT of scope per spec (hint is explicit) but shows the ceiling if parity demand grows.
[SOURCE: lib/util/string.ts:619-647, 347, 452]

## Ruled out
- Auto-detection of emails/phones in plain columns (spec Out-of-Scope; noted as future option since Anytype proves demand).
- Confirmation popup per click (Obsidian already gates external links; double-confirm adds friction).

## newInfoRatio: 0.9 (direct algorithmic template found; changes recommended edge-case handling)

## Next Focus
005 — Notion reference behavior for URL/email/phone properties (web).

---

# Iteration 005 — Notion Reference Behavior (Web)

**Focus:** Ground truth on how Notion itself treats URL, Email, and Phone properties.

## Findings

### F-005.1 — Official semantics: three properties, three click outcomes
Notion Help, Database properties: **URL** "Accepts a link to a website and opens the link in a new tab when clicked"; **Email** "Accepts an email address and launches your mail client when clicked"; **Phone** "Accepts a phone number and prompts your device to call it when clicked". Also: "You can simply type or paste values for URL, Email, Phone and Number properties, just like you would for a Text property." — i.e., entry UX is identical to text; ONLY the click behavior differs. This validates the fork's design: keep the text type, change click/render behavior via a hint.
[SOURCE: https://www.notion.com/help/database-properties]

### F-005.2 — Notion API models them as distinct types but stores raw strings
The Notion API property schema enum includes `"url"`, `"email"`, `"phone_number"` as separate types; their value payloads are plain strings (`url`, `email`, `phone_number` objects hold unparsed strings). Same lesson as AppFlowy F-002.2: store raw, derive links at render.
[SOURCE: https://developers.notion.com/reference/property-schema-object ; https://developers.notion.com/reference/page-property-values]

### F-005.3 — tel: is mainstream inside Notion formulas
Notion's own formula docs demonstrate `link("Call", "tel:" + prop("Phone"))` — prefix-assembly of `tel:` at display time from a raw stored number, exactly Anytype's checkUrlScheme pattern and exactly what `textLinkScheme.ts` will do.
[SOURCE: https://www.notion.com/help/formula-syntax]

## Ruled out
- Nothing ruled out this pass; Notion confirms rather than contradicts the hint approach.

## newInfoRatio: 0.6 (parity target confirmed; entry-vs-click separation is a new explicit finding)

## Next Focus
006 — Security & scheme-allowlist engineering details.

---

# Iteration 006 — Security: Scheme Allowlist Engineering

**Focus:** Exact rules the isolated module needs so no crafted cell value becomes an executable or malicious link.

## Findings

### F-006.1 — Closed allowlist is the primary control; blocklists become unnecessary
Spec NFR-S01 accepts only `https | mailto | tel`; anything else falls back to plain text. This is stronger than Anytype's runtime posture, which must blocklist dangerous schemes reactively (`javascript, data, ws, wss, chrome, about, ssh, blob, ms-msdt, search-ms, ms-officecmd`) because its users can type any relation format. The fork never constructs a link outside the three schemes, so `javascript:` Scenario 3 is structurally impossible.
[SOURCE: lib/action.ts:213-227 (anytype-ts); spec.md REQ-004/NFR-S01]

### F-006.2 — Scheme-detection gate before assembly prevents cross-prefix pollution
Assembly must first ask "does the value already carry ANY scheme?" using a `URL` parse or `^[a-z][a-z0-9+.-]*:` regex (the fork's own `URL_SCHEME_RE`). If yes, use the value AS the target (Anytype checkUrlScheme) — but only after confirming the detected scheme is itself in the allowlist; otherwise fall back to plain text. Without the second half, a `javascript:alert(1)` value under an https-hinted column would pass through untouched-but-clickable.
[SOURCE: lib/relation.ts:933-948 (anytype-ts); src/data/TextLink.ts:28]

### F-006.3 — Control-character and whitespace rejection
`normalizeExternalUrlTarget` already rejects any target containing whitespace. The new module should apply the same to ALL schemes: reject `\r`/`\n`/`\t` (href header/parse injection vectors) and trim outer whitespace. For `tel:` specifically, RFC 3966 allows limited characters — practical rule: strip nothing, but reject values containing whitespace or `<>"` rather than sanitizing silently (deterministic fallback beats mutation, matching the spec's reliability stance).
[SOURCE: src/data/TextLink.ts:31-36; RFC 3966 (tel URI)]

### F-006.4 — Length cap
Anytype refuses to fix/open URLs > 2048 chars. A cheap guard against absurd values and pathological anchors; recommend rejecting >2048-char values to plain text.
[SOURCE: lib/util/string.ts:623-627 (anytype-ts)]

### F-006.5 — DOM construction stays textContent-only
Fork precedent builds anchors via `td.createEl("a", { text: label })` — attribute/text APIs, never innerHTML, so label/target strings cannot inject markup. The new render case must follow suit; the href attribute assignment through `attr:` is safe for validated targets.
[SOURCE: src/views/CellRenderer.ts:273-277]

### F-006.6 — Final navigation gate is Obsidian's own handler
Both fork paths route clicks through `window.open(target)` for external links (CellRenderer.ts:294) — Obsidian mediates actual protocol launching at the app layer. The module's allowlist is defense-in-depth ahead of that gate; mailto:/tel: reach the OS handler the same way external http(s) links already do. Verify mailto/tel dispatch on desktop and mobile during the build-time manual pass (UNKNOWN today — no mailto exists anywhere in src).
[SOURCE: src/views/CellRenderer.ts:293-295; repo grep (zero mailto/tel)]

## Ruled out
- Sanitize-and-render (mutating values into "safe" links) — deterministic fallback is simpler and matches spec determinism NFR-R01.
- Per-click confirmation popups (Anytype-style) — redundant behind allowlist + Obsidian's handler.

## newInfoRatio: 0.8

## Next Focus
007 — Integration design: hint vs textRenderMode precedence, module API, call-site budget.

---

# Iteration 007 — Integration Design: Precedence, Module API, Call-Site Budget

**Focus:** Fit `textLinkScheme` into the fork's existing hint system with the EuroFormat diff shape.

## Findings

### F-007.1 — Precedence problem: the fork already has a link display mode
`textRenderMode?: "plain"|"link"|"markdown"` (types.ts:62) and `textLinkScheme` overlap: both make text clickable. Unresolved precedence would be a bug farm. Recommended rule (DECISION for plan): **`textLinkScheme` wins when set**; it is strictly more specific (declares HOW to build the link, not just "render links"), and the ColumnMenu popover should surface scheme options as a nested choice under the existing "link" mode so the two can't silently conflict. Cells then dispatch: markdown → link-mode(parse) → **scheme-hint anchor** → plain.
[SOURCE: src/data/types.ts:62; src/views/ColumnMenu.ts:395-418]

### F-007.2 — Module API (EuroFormat profile: pure functions, zero imports)
```
export type TextLinkScheme = "https" | "mailto" | "tel";
export const TEXT_LINK_SCHEMES: readonly TextLinkScheme[];
export function isTextLinkScheme(v: unknown): v is TextLinkScheme;
export function assembleSchemeLinkTarget(scheme: TextLinkScheme, value: unknown): string | null;
```
`assembleSchemeLinkTarget`: trim; empty→null; length>2048→null; control chars/whitespace inside→null; if value already has a scheme → return it iff allowlisted else null; else return `${prefixFor(scheme)}${value}` (`https://`, `mailto:`, `tel:`). Mirrors Anytype checkUrlScheme + urlFix guards; ~40 lines like EuroFormat.ts's 42.
[SOURCE: lib/relation.ts:911-948, lib/util/string.ts:619-647 (anytype-ts); src/data/EuroFormat.ts:1-42]

### F-007.3 — Call-site budget reality check
Spec allows "1-3 call-site edits". Minimal viable = types.ts (+1 field), CellRenderer.ts (+1 branch ~8 lines in default case reusing renderTextLink's anchor/delay pattern). Discoverable UX adds ColumnMenu.ts (+scheme submenu) and DatabaseView.ts (setter action ~5096 pattern) — 4 files total. Recommendation: implement all four but keep menu changes inside the EXISTING text-display popover block (ColumnMenu.ts:130-150) so the diff stays contiguous and rebase-safe; document the 3-vs-4 deviation against REQ-005 as user-approved scope note. Board/Gallery/List/Card views each have their own `textRenderMode === "link"` branches (BoardRenderer.ts:1069, GalleryRenderer.ts:594, ListRenderer.ts:554) — spec says shared text path reused; flag that those views will NOT honor the hint unless their branch also consults it (each is a one-line delegation to the same helper).
[SOURCE: src/views/ColumnMenu.ts:130-150; src/views/DatabaseView.ts:5096-5097; src/views/{BoardRenderer,GalleryRenderer,ListRenderer}.ts]

### F-007.4 — Config persistence is already forward-compatible
ColumnDef serializes into the database view config; an optional new field is ignored by older builds (same mechanism as `numberDisplayStyle`, `textRenderMode`). No migration, iCloud-neutral: the only persisted change is the column config itself when a user opts in — identical churn profile to existing hints.
[SOURCE: src/data/types.ts:47-77; src/views/DatabaseView.ts:5096-5097]

### F-007.5 — Render case should reuse renderTextLink's interaction shell
The 280ms delayed-open/dblclick-cancel logic (CellRenderer.ts:279-298) is orthogonal to how the target was assembled. Refactor `renderTextLink(td,row,value)` minimally to accept an optional pre-assembled `{label,target}` or add a sibling `renderSchemeHintLink` that calls a shared open helper — either keeps one interaction implementation.
[SOURCE: src/views/CellRenderer.ts:269-299]

## Ruled out
- Extending the `textRenderMode` union with `"https"|"mailto"|"tel"` values (breaks every switch over that union incl. i18n keys and width measuring; larger blast radius than an additive sibling field).
- Storing assembled hrefs anywhere (display-only).

## newInfoRatio: 0.9

## Next Focus
008 — Edge cases & data boundaries matrix.

---

# Iteration 008 — Edge Cases & Data Boundaries

**Focus:** Enumerate concrete cell-value scenarios and pin the expected behavior for each.

## Findings / Decision Table

| # | Scenario | Expected behavior | Basis |
|---|----------|-------------------|-------|
| E1 | Empty string / whitespace-only | Plain text, no anchor | Spec edge cases; AppFlowy stores "" verbatim [SOURCE: url_tests.rs:20-22] |
| E2 | Value already has allowlisted scheme (`https://x.com` under https hint) | Use value as-is, no double prefix | Anytype checkUrlScheme [SOURCE: relation.ts:933-948] |
| E3 | Value has foreign scheme (`mailto:a@b.c` under https hint; `javascript:…` any hint) | Plain text fallback | F-006.2; spec SC-004 |
| E4 | Bare domain (`www.notion.com`) under https hint | `https://www.notion.com` (plain concat; no DNS check) | Anytype prefix pattern; AppFlowy skips network checks offline-hostility F-003.5 |
| E5 | Email under mailto hint (`a@b.com`) | `mailto:a@b.com`; label shows raw value | Notion Email semantics F-005.1 |
| E6 | Phone with spaces/parens (`+31 20 123`) under tel hint | Reject whitespace → plain text (strict), OR strip spaces (lenient) — RECOMMEND lenient strip-for-target-only: target `tel:+3120123`, label raw. Notion/AppFlowy store raw and launch raw; RFC 3966 visual separators are safe to drop from the TARGET only | RFC 3966; F-006.3 refinement |
| E7 | Value >2048 chars | Plain text | Anytype urlFix cap [SOURCE: string.ts:623-627] |
| E8 | Control chars (`\r\n\t`) in value | Plain text | F-006.3 |
| E9 | Very long valid URL rendering | Existing wrap/ellipsis rules apply to the LABEL; anchor inherits text-cell class | desktop_grid_url_cell wrap flag F-003.1; spec risk row |
| E10 | Markdown-syntax value (`[l](t)`) under scheme hint | Scheme hint wins (F-007.1 precedence); value treated literally per E2-E4 rules | DECISION recorded iteration 007 |
| E11 | Hint set on non-text column | Ignored structurally — non-text types never reach the default branch | CellRenderer.ts:190-211 case dispatch |
| E12 | Unknown hint value (`"ftp"`) | Plain text (allowlist guard at both config-read and assembly) | Spec REQ-004 |
| E13 | Exports/stringify/sort/filter of hinted column | Raw value everywhere; only renderer assembles | AppFlowy stringify_cell_data F-002.4; fork Stringify.ts consumers |
| E14 | Hint toggled on/off repeatedly | Purely render-time; zero data migration | AppFlowy transform analysis F-002.3 |

## Ruled out
- Silent mutation of stored values in any scenario (display-only contract).

## newInfoRatio: 0.7 (E6 refines the spec's stated behavior; rest formalizes known edges)

## Next Focus
009 — Mobile tap safety + iCloud/sync neutrality specifics.

---

# Iteration 009 — Mobile Tap Safety & iCloud Neutrality

**Focus:** REQ-006 (mobile-safe) and REQ-007 (display-only/iCloud-safe) made concrete.

## Findings

### F-009.1 — Mobile pattern: opaque hit area + explicit action sheet
AppFlowy mobile URL cells use `GestureDetector(behavior: HitTestBehavior.opaque)` with 12h/10v padding and a bottom-sheet offering Launch/Copy before navigation (F-003.4). Obsidian fork equivalent: the anchor element itself is the tap target — ensure `display:inline-block` with adequate padding via the existing `db-text-link` styling, and rely on the same delayed-open handler; on touch there is no hover, so the 280ms delay is harmless and dblclick-to-edit maps to double-tap. Direct navigation on first tap matches Obsidian's native external-link behavior in preview panes, so a confirm sheet is NOT required for parity — but Launch/Copy as a long-press context affordance is a cheap future add.
[SOURCE: mobile_grid/mobile_grid_url_cell.dart:18-56; src/views/CellRenderer.ts:279-298]

### F-009.2 — No desktop-only APIs in the planned path
The render case uses only DOM APIs (`createEl`, `addEventListener`) plus `window.setTimeout`/`window.open` — the exact surface renderTextLink already ships on both platforms today. No clipboard/notifications/DNS calls. Mobile risk therefore reduces to styling/tap-size verification on the device.
[SOURCE: src/views/CellRenderer.ts:269-299]

### F-009.3 — iCloud/sync neutrality argument
Writes are confined to ColumnDef config when a user changes the hint (F-007.4) — the same file/metadata write any column tweak performs; cell values never change, so no per-row churn, no merge pressure on frontmatter across devices. No telemetry, no network calls (unlike AppFlowy's DNS validation), no secrets. This satisfies REQ-007 by construction; the residual risk is only config-file conflict if two devices change hints simultaneously — identical to existing hint fields, accepted upstream behavior.
[SOURCE: src/data/types.ts:47-77; url_cell_bloc.dart:79-100 (counter-example)]

## Ruled out
- Bottom-sheet confirmation on every tap (friction without a demonstrated incident; revisit if accidental-navigation reports appear).
- Any network validation (offline-hostile).

## newInfoRatio: 0.5 (mostly consolidates prior findings onto REQ-006/007; new: tap-target styling note)

## Next Focus
010 — Verification matrix and residual gaps for synthesis.

---

# Iteration 010 — Verification Matrix & Residual Gaps

**Focus:** Convert findings into the objective pass/fail matrix synthesis will rank against; list what remains UNKNOWN.

## Test matrix (unit — vitest on the isolated module)

| ID | Input | Scheme | Expected |
|----|-------|--------|----------|
| T1 | `"www.acme.com"` | https | `https://www.acme.com` |
| T2 | `"https://x.io/a?b=1"` | https | unchanged (E2) |
| T3 | `"mailto:a@b.c"` under https | https | null → plain (E3) |
| T4 | `"javascript:alert(1)"` any | any | null (SC-003) |
| T5 | `"a@b.c"` | mailto | `mailto:a@b.c` |
| T6 | `"+31 20 123"` | tel | target `tel:+3120123`, label raw (E6) |
| T7 | `""` / `"   "` | any | null (SC/E1) |
| T8 | 2049-char value | any | null (E7) |
| T9 | `"line1\r\nline2"` | any | null (E8) |
| T10 | non-string (number/null) | any | null |

[SOURCE: iterations 006-008 decision tables]

## Build-time gates (fork package.json)
- `npm run build` (esbuild production), `npm run lint`; vitest configured at fork root (`vitest.config.ts`). SC-005's UNKNOWN resolves to these commands.
- Diff-confinement check: `git diff --stat` vs upstream shows ONLY types.ts, CellRenderer.ts (+ColumnMenu.ts/DatabaseView.ts if menu UX approved) + new module (Scenario 4).
[SOURCE: package.json:6-11; spec.md SC-003..005]

## Manual gates
- Desktop: click opens https/mailto/tel via OS handler; double-click still enters inline editor (delayed-open preserved).
- Mobile: tap targets ≥ comfortable size; double-tap edit unaffected; no layout shift vs plain cells.
- Zero-diff render check for unhinted columns (SC-002): screenshot/DOM compare pre/post.

## Residual gaps (UNKNOWN, flagged honestly)
1. Whether Obsidian's `window.open` dispatches `mailto:`/`tel:` correctly on iOS/Android builds — verify on-device; fallback would be `app.openWithDefaultApp(value)` style handling inside the click helper.
2. Exact serialization location of ColumnDef config (confirm additive field survives save/load round-trip).
3. Whether board/gallery/list views must honor the hint for parity or table-only suffices (scope call for the user).

## newInfoRatio: 0.4 (consolidation + explicit gap register; low novelty expected)

## Next Focus
SYNTHESIS — ranked enrichment report.

---
