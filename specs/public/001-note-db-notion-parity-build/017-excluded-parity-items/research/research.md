# Deep Research: Excluded parity items

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.745.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 1: Fork Baseline — textRenderMode, Relations, EuroFormat Pattern

## Focus

Map the fork surfaces the five exclusions touch: the markdown `textRenderMode` (style()/unstyle() redundancy claim), the relation column system (person/people → `Clients` relation stand-in), the formula engine (output types), and the EuroFormat isolated-module pattern (fork integration contract for any future build).

## Findings

1. **`textRenderMode: "markdown"` renders inline styled text today.** The per-column render mode is declared in `data/types.ts:62` (`"plain" | "link" | "markdown"`) and documented as "renders inline markdown (bold/italic/strike/highlight/code/links)". The renderer path is `views/CellRenderer.ts:212-228`: when `col.textRenderMode === "markdown"` it parses with `parseInlineMarkdown` and renders via `renderInlineMarkdown` (links open via workspace, images resolve). The parser supports exactly: `**bold**`, `*italic*`/`_italic_`, `~~strike~~`, `==highlight==`, `` `code` ``, `[label](target)`, `[[wikilink]]`/`[[t|l]]` — `data/InlineMarkdown.ts:8-9` and node types at `InlineMarkdown.ts:25-29`. Plain-text fallback exists (CellRenderer.ts:226-228). This confirms the spec's redundancy claim at the code level: styled text output already exists for text values in markdown-mode columns. [SOURCE: file:/Users/michelkerkmeester/MEGA/Development/Obsidian%20Plugin/src/data/types.ts:62] [SOURCE: file:.../views/CellRenderer.ts:212-228] [SOURCE: file:.../data/InlineMarkdown.ts:8-9]

2. **Relation columns resolve against note records, not a user directory.** `ColumnDef.type` includes `"relation"` and `"rollup"` (`data/types.ts:50`). `RelationConfig` is just `{ targetDatabaseId: string }` (types.ts:34-37); values are "stored as native Obsidian wikilinks in frontmatter" (types.ts:67-68). There is no user/identity type anywhere in the column model — a relation can only point at records of another database. A "Clients" relation is therefore exactly this: a relation column to a Clients database. Person/people in Notion resolves against the workspace member directory; in the fork the only resolvable "people" are notes. [SOURCE: file:.../data/types.ts:34-37,50,67-68]

3. **Rollups are display-only with a fixed aggregation set.** `RollupConfig` supports `count | sum | avg | list` only (types.ts:39-45) — matching the packet's "display-only rollups" scope note. [SOURCE: file:.../data/types.ts:39-45]

4. **The EuroFormat isolated-module pattern is real and minimal.** `data/EuroFormat.ts` is a 42-line standalone module exporting exactly three functions (`formatEuroNumber`, `formatEuroNumber2`, `formatEuroCurrency`), consumed at exactly two call sites: `views/CellRenderer.ts:13,198,2576` (currency + number cells) and `views/SummaryRenderer.ts:7,556` (footer summaries). Header comment states the intent: "Local fork override. Kept in one module so it stays a small, rebasable diff." This is the fork's established integration contract: new module under `src/data/` + 1-3 call-site edits, rebase-safe. Any future excluded-item build would be expected to follow this shape. [SOURCE: file:.../data/EuroFormat.ts:1-42] [SOURCE: file:.../views/CellRenderer.ts:13,198,2576] [SOURCE: file:.../views/SummaryRenderer.ts:7,556]

5. **Two formula syntaxes exist; neither has a styled-text output type.** `ComputedFieldDef` declares `expressionSyntax?: "note-database" | "base"` (`data/types.ts:108`) and computed output types are `"number" | "text" | "date" | "datetime" | "checkbox"` (types.ts:106) — no "rich text" type. The Bases-compatible evaluator (`data/BaseExpression.ts`, e.g. `evaluateBaseExpression` at :64, normalization pipeline at :95+) runs through `SafeEval`; tokenizer is `data/FormulaTokenizer.ts`. Notion's `style()`/`unstyle()` produce styled strings — a value type the fork's formula engine does not model today. [SOURCE: file:.../data/types.ts:106-108] [SOURCE: file:.../data/BaseExpression.ts:64]

6. **Fork has no code-level "person/people" or "me()" concept.** Grep for `Clients` in src found no code matches — it is a vault-level relation (data), not a plugin type. There is no user/profile/identity type in `types.ts` or the data layer. [SOURCE: grep Clients in /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src → 0 matches]

## Sources Consulted

- `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types.ts` (read lines 30-149)
- `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/EuroFormat.ts` (full read)
- `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/CellRenderer.ts` (read lines 195-254, 490-529; grep)
- `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/InlineMarkdown.ts` (grep + head)
- `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/BaseExpression.ts` (grep)
- `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/FormulaFields.ts` (grep)
- Fork tree listing + grep `textRenderMode` (10 files) + grep `Clients` (0 files)

## Assessment

- newInfoRatio: 0.95 — first pass on the fork; all six findings are new, but the fork surface is large and later iterations will re-derive related details (file fields, column catalog) so a small overlap is expected.
- Confidence: high — all claims are direct reads of fork source with line numbers.

## Reflection

- What worked: targeted greps (`textRenderMode`, `Clients`, `formatEuro*`) plus focused reads of types.ts/EuroFormat.ts gave a precise surface map with minimal tool calls.
- What failed: nothing this iteration.
- Ruled out: "Clients" as a plugin-level type (it is vault data); "textRenderMode absent" (it exists and renders styled markdown).

## Recommended Next Focus

Iteration 2: Notion source of truth — fetch Notion docs for the person/people property, formula `style()`/`unstyle()` and `me()`, file CDN/secure URLs, and any GoodBases description, to pin exactly what parity would require.

---

# Iteration 2: Notion Source of Truth — People, style()/unstyle(), me()

## Focus

Pin exactly what Notion parity for the five excluded items would require, from Notion's own documentation: the people property model, formula `style()`/`unstyle()` and `me()`, and the person formula type.

## Findings

1. **Notion has a first-class `people` property type backed by workspace user objects.** The API property enum includes `"people"` alongside `relation`, `created_by`, `last_edited_by` (developers.notion.com/reference/property-object). The people property "Contains people mentions" with an empty type object; values are "an array of user objects with `id`". `created_by`/`last_edited_by` likewise return user objects. So Notion's people property is a reference into the workspace member directory — the plugin fork has no such directory. [SOURCE: https://developers.notion.com/reference/property-object] [SOURCE: file:.../data/types.ts:34-37 (fork relation model, for contrast)]

2. **Person is a distinct formula type with name/email/id accessors.** The formula syntax reference maps Created By/Edited By to formula type `Person`, and Person properties to `Person (list)`; examples: `prop("Person").at(0).name()`, `prop("Person").map(current.email())`. Third-party reference (thomasjfrank.com/formulas/data-types/person) confirms: "The Person data type is specific to database properties that allow for users to be selected or displayed, such as the Person, Created by, and Last edited by properties," with `name`, `email`, and `id` functions. The fork's computed fields have no person type: output types are number/text/date/datetime/checkbox (`data/types.ts:106`). [SOURCE: https://www.notion.com/help/formula-syntax] [SOURCE: https://thomasjfrank.com/formulas/data-types/person/] [SOURCE: file:.../data/types.ts:106]

3. **`style()` adds bold/underline/italics/code/strikethrough plus text and background colors; `unstyle()` strips them.** Notion help formula-syntax: style — "Adds styles and colors to the text. Valid formatting styles: `"b"` (bold), `"u"` (underline), `"i"` (italics), `"c"` (code), or `"s"` (strikethrough). Valid colors: gray, brown, orange, yellow, green, blue, purple, pink, red. Add `_background` to colors to set background colors." unstyle — "Removes formatting styles from the text. If no styles are specified, all styles are removed." Examples: `style("Notion", "b", "u")`, `unstyle("Text", "b")`. Note the style vocabulary: underline is NOT in the fork's inline markdown set (bold/italic/strike/highlight/code per InlineMarkdown.ts:8-9), and per-argument text/background colors are NOT either — so Notion's styling API is a *richer* value type than what the fork renders today, but the fork's markdown mode covers the core (b/i/s/c + highlight). [SOURCE: https://www.notion.com/help/formula-syntax] [SOURCE: file:.../data/InlineMarkdown.ts:8-9]

4. **`me()`/"Me" resolves the currently viewing workspace user.** Notion filters support a special "Me" token in Person properties "that expands to the currently viewing user" (notionmastery.com); the formula `me()` returns the current user as a Person. Both depend on authenticated workspace identity. The plugin fork runs in a vault with no authenticated user; Obsidian has no per-user identity API for plugins. This confirms the spec's dependency chain: `me()` → person/people → user/identity model. [SOURCE: https://notionmastery.com/the-power-of-me-pages-in-notion/] [SOURCE: https://thomasjfrank.com/formulas/functions/]

5. **Notion files are remote-hosted with expiring URLs.** The API file objects are either `external` (URL) or `file` (uploaded, with a Notion-hosted URL) — the files property holds "files uploaded to Notion or external links" (developers.notion.com/reference/property-object, Files section). Uploaded files therefore live on Notion's servers, not in the local workspace — fetching them for vault-local display is exactly the network + duplication cost the 012 files-column ruling rejects. [SOURCE: https://developers.notion.com/reference/property-object]

## Sources Consulted

- https://developers.notion.com/reference/property-object (full fetch; people/files/created_by sections)
- https://www.notion.com/help/formulas (style() documented in Example 1)
- https://www.notion.com/help/formula-syntax (style/unstyle/name/email/person type tables)
- https://thomasjfrank.com/formulas/functions/ , /formulas/data-types/person/ (third-party formula reference)
- https://notionmastery.com/the-power-of-me-pages-in-notion/ ("Me" filter token)
- Fork: `data/types.ts:106`, `data/InlineMarkdown.ts:8-9` (contrast evidence)

## Assessment

- newInfoRatio: 0.9 — all five findings new; Notion-side facts fully cited.
- Confidence: high for people property + style/unstyle (Notion's own docs); me() semantics corroborated across two secondary sources since Notion's help page truncated the function table.

## Reflection

- What worked: Notion help center pages are fetchable and include the exact function tables; the API property-object page is the canonical enum source.
- What failed: developers.notion.com/reference/formula returns 404 (moved to help center); the help center formula-syntax page truncates the middle function table (me() section not captured — corroborated via search snippets instead).
- Ruled out: any claim that style()/unstyle() is a trivial string transform — it is a styled-string value type with its own rendering semantics (underline + colors), which matters for the redundancy argument's precision.

## Recommended Next Focus

Iteration 3: AppFlowy data model — how flowy-database2 models users/members (user directory?), relation fields, and file/attachment fields in the Rust grid model.

---

# Iteration 3: AppFlowy Data Model — Users, Fields, Files in flowy-database2

## Focus

Mine the AppFlowy Rust grid model (`appflowy/frontend/rust-lib/flowy-database2`) for how it models users, database fields, and file/attachment cells — to test the person/people exclusion and the CDN-fetch exclusion against a real multi-user database engine.

## Findings

1. **AppFlowy's grid field catalog has NO person/people/member field type.** `FieldType` enum (src/entities/field_entities.rs:427-444): RichText, Number, DateTime, SingleSelect, MultiSelect, Checkbox, URL, Checklist, LastEditedTime, CreatedTime, Relation, Summary, Translate, Time, Media. There is no Member/Person variant and no `member`/`person` identifier anywhere in flowy-database2 (grep: 0 matches). AppFlowy runs a full multi-user collaboration stack with a real user directory — and still does not expose people as a database property. This is direct evidence that a people property is not a prerequisite of a table engine; it is a workspace-directory feature layered on top, which Obsidian lacks. [SOURCE: file:.../appflowy/frontend/rust-lib/flowy-database2/src/entities/field_entities.rs:427-444]

2. **Users exist only at the workspace/collaboration layer in AppFlowy.** `UserWorkspaceDatabase` exposes `fn user_id(&self) -> Result<i64, FlowyError>` (src/manager.rs:49); databases are initialized with `(user_id, is_local_user)` (manager.rs:154-175) and the database editor reads `self.user.user_id()?` at multiple sites (database_editor.rs:125,819; manager.rs:801-1144). The user identity is a numeric workspace ID used for authorization/ownership, not a value stored in cells. Even so, no created-by/last-edited-by person columns exist — only CreatedTime/LastEditedTime (field_entities.rs:437-438). AppFlowy's grid is deliberately people-free at the cell level. [SOURCE: file:.../flowy-database2/src/manager.rs:49,154-175] [SOURCE: file:.../flowy-database2/src/services/database/database_editor.rs:125,819] [SOURCE: file:.../flowy-database2/src/entities/field_entities.rs:437-438]

3. **AppFlowy distinguishes Local, Network, and Cloud file kinds — network files stay remote URLs, not downloaded copies.** `FileUploadTypePB` (src/entities/file_entities.rs:6-13): `LocalFile = 0, NetworkFile = 1, CloudFile = 2`, mapping 1:1 to `MediaUploadType::Local/Network/Cloud`. The media cell stores a list of files (`MediaCellData { files }`, media_type_option.rs:74-76) with per-file dedupe by id on insert (media_type_option.rs:88-92). A "Network" file is by definition a remote URL kept remote — the display-without-download pattern that the 012 files-column ruling (and this packet's CDN exclusion) presupposes. [SOURCE: file:.../flowy-database2/src/entities/file_entities.rs:6-13] [SOURCE: file:.../flowy-database2/src/services/field/type_options/media_type_option/media_type_option.rs:74-76,88-92]

4. **AppFlowy's Relation field (FieldType::Relation = 10) is the people-workaround pattern.** Since there is no person type, collaborative tables model "people" as rows referenced through the Relation field — exactly the fork's `Clients` relation stand-in (fork `data/types.ts:34-37`). A multi-user product with a user directory still chose relation-to-records over person values in the grid. [SOURCE: file:.../field_entities.rs:440] [SOURCE: file:.../data/types.ts:34-37 (fork, contrast)]

## Sources Consulted

- appflowy/frontend/rust-lib/flowy-database2/src/entities/field_entities.rs (FieldType enum, read 420-494)
- appflowy/frontend/rust-lib/flowy-database2/src/entities/file_entities.rs (full read, 53 lines)
- appflowy/frontend/rust-lib/flowy-database2/src/services/field/type_options/media_type_option/media_type_option.rs (full read, 124 lines)
- appflowy/frontend/rust-lib/flowy-database2/src/manager.rs + services/database/database_editor.rs (grep user_id)
- grep member|Member across flowy-database2/src → 0 matches

## Assessment

- newInfoRatio: 0.85 — AppFlowy model facts new; relation-as-people-workaround connects to iteration 1's fork findings.
- Confidence: high — enum and struct reads with line numbers; negative grep result is a full-tree scan.

## Reflection

- What worked: enum + negative-grep is a decisive combo for "no people property" claims; file_entities.rs is tiny and complete.
- What failed: MediaUploadType lives in the collab_database crate (not in this repo's rust-lib grep path) — cited the PB mapping instead, which is equally authoritative for the UI contract.
- Ruled out: the hypothesis "AppFlowy implements a people property" — disproven by the enum.

## Recommended Next Focus

Iteration 4: AppFlowy Flutter UI — how the database plugin renders cells (media/network files, relation pills), formula support, and any styling of text cells; then the same for anytype-ts.

---

# Iteration 4: AppFlowy Flutter UI — Cell Rendering, Network Files, Formulas

## Focus

Inspect the AppFlowy Flutter database plugin (`appflowy_flutter/lib/plugins/database`) for how cells render text, how network/cloud/local files are displayed, and whether any formula engine exists — to calibrate the fork's relative capability claims behind the exclusions.

## Findings

1. **AppFlowy's database plugin has NO formula feature.** Grep for `formula|Formula` across `lib/plugins/database` → 0 matches. The fork's computed-column engine with two syntaxes (`note-database` and `base`, `data/types.ts:108`) is strictly ahead of AppFlowy's grid. The `style()`/`unstyle()` exclusion therefore cannot be argued as "AppFlowy parity" — it is purely a Notion-surface redundancy judgment, and the fork already out-performs AppFlowy here. [SOURCE: grep formula|Formula in appflowy_flutter/lib/plugins/database → 0 matches] [SOURCE: file:.../data/types.ts:108 (fork)]

2. **Network files render as external (URL) images — display-only, no local copy.** `ToCustomImageType` maps `FileUploadTypePB.NetworkFile => CustomImageType.external`, `CloudFile => internal`, else `local` (widgets/cell_editor/media_cell_editor.dart:217-223). Users insert network files by pasting a URL (`onInsertNetworkFile: (url)` → `uploadType: FileUploadTypePB.NetworkFile`, media_cell_editor.dart:142,168; also desktop_row_detail_media_cell.dart:290,315 and row_banner.dart:319). The AppFlowy UI contract is: network file = remote URL rendered remotely. This is the display-only pattern the fork's 012 files-column ruling and the CDN exclusion rely on — and it applies to *user-pasted* URLs, not to fetching Notion's CDN bytes into the vault. [SOURCE: file:.../appflowy_flutter/lib/plugins/database/widgets/cell_editor/media_cell_editor.dart:142,168,217-223]

3. **AppFlowy grid text cells are plain `TextField`s — no inline markdown.** DesktopGridTextCellSkin builds a `TextField` with at most an emoji/notes icon (widgets/cell/desktop_grid/desktop_grid_text_cell.dart:21-60); same skeleton across mobile/row-detail skins. There is no bold/italic/strike rendering inside grid cells. The fork's `textRenderMode: "markdown"` (bold/italic/strike/highlight/code/links via `data/InlineMarkdown.ts:8-9`) exceeds AppFlowy's grid text capability. [SOURCE: file:.../desktop_grid_text_cell.dart:34-56]

4. **UI pattern corroboration for the Clients relation stand-in.** AppFlowy's Relation field renders related rows as pills/tags of record values (FieldType::Relation = 10, field_entities.rs:440); people-as-rows is the product's only people representation. The fork's relation column (wikilink values, `data/types.ts:67-68`) is the same UX shape: pick from records of a target database. A "Clients" relation gives the person/people UI (avatar-less pill = note name) without a user directory. [SOURCE: file:.../field_entities.rs:440] [SOURCE: file:.../data/types.ts:67-68]

## Sources Consulted

- appflowy_flutter/lib/plugins/database/widgets/cell_editor/media_cell_editor.dart (read 195-234; grep)
- appflowy_flutter/lib/plugins/database/widgets/cell/desktop_grid/desktop_grid_text_cell.dart (full read, 110 lines)
- appflowy_flutter/lib/plugins/database (grep formula → 0; grep NetworkFile → 6 matches across 3 files)
- Fork contrast: data/types.ts:108, InlineMarkdown.ts:8-9

## Assessment

- newInfoRatio: 0.7 — AppFlowy UI facts new; partly anticipated from iteration 3's model findings (media upload types) and iteration 1 (fork markdown mode).
- Confidence: high — direct widget reads and full-tree grep negatives.

## Reflection

- What worked: negative grep for formulas is decisive; the `ToCustomImageType` extension is the single best citation for display-only network files.
- What failed: nothing; AppFlowy UI structure was easy to navigate.
- Ruled out: "AppFlowy has formula parity" (no formulas at all); "AppFlowy grid renders styled text" (plain TextField).

## Recommended Next Focus

Iteration 5: Anytype — how anytype-ts models relations, the Profile object type, account/"me", and file handling (local vs CDN), then compare with the fork's exclusion logic.

---

# Iteration 5: Anytype — Relations, Human Objects, Identity, Files

## Focus

Mine `anytype-ts/src/ts` for how Anytype models people (relation formats, object layouts), resolves "me", and handles file URLs — the third reference point for the person/people, me(), and CDN-fetch exclusions.

## Findings

1. **Anytype has NO person relation format — people are ordinary objects of layout `Human`.** `RelationType` (interface/object.ts:36-51): LongText, ShortText, Number, Select, Date, File, Checkbox, Url, Email, Phone, Icon, MultiSelect, Object (100), Relations (101). No Person variant. `ObjectLayout.Human = 1` and `ObjectLayout.Participant = 19` (object.ts:1-34); util code explicitly calls these "human-like layouts (Human, Participant)" (lib/util/object.ts:543,584-588). A person in Anytype is a *record* whose object type has layout Human. [SOURCE: file:.../anytype-ts/src/ts/interface/object.ts:1-51] [SOURCE: file:.../anytype-ts/src/ts/lib/util/object.ts:543,584-588]

2. **References to people are `RelationType.Object` relations restricted by object type.** Relations of format Object hold `relationFormatObjectTypes` — the set of object types selectable as values (store/detail.ts:460-467: `object.relationFormatObjectTypes = Relation.getArrayValue(...)`); creating an object relation sets `relationFormat` + `ObjectLayout.Relation` (lib/relation.ts:661,726). So "who is involved" = an object relation to Human-layout records. This is structurally identical to the fork's relation column (wikilink to target-database records, `data/types.ts:34-37,67-68`) — i.e., the `Clients` relation stand-in is exactly how a directory-less engine expresses "people". [SOURCE: file:.../anytype-ts/src/ts/store/detail.ts:460-467] [SOURCE: file:.../anytype-ts/src/ts/lib/relation.ts:661,726] [SOURCE: file:.../data/types.ts:34-37,67-68 (fork)]

3. **"Me" is the account's Profile/Participant object — identity exists only because Anytype is an account-based product.** Space sharing reads `U.Space.getProfile()` for limits (component/page/main/settings/space/share.tsx:18); members are `Participant` objects with `ParticipantPermissions` from `SpaceInviteGenerate` (share.tsx:26,61,165); `canMyParticipantWrite`/`canMyParticipantModerate` gate actions (lib/util/object.ts:715). The "me" concept is a data object created at account provisioning — Obsidian provides no equivalent object, account, or participant store for a plugin to reference. [SOURCE: file:.../share.tsx:18,26,61,165] [SOURCE: file:.../lib/util/object.ts:715]

4. **Anytype files live in the local/P2P-synced space; downloads are explicit user-gesture exports, never automatic network fetch.** `downloadFile(s)` (lib/action.ts:304-334) resolves `S.Common.imageUrl/fileUrl(id)` from the space's own file store, opens a directory dialog, and sends a `download` IPC to the Electron main process. Files are already in the space (synced via the peer network); there is no "fetch remote CDN bytes into local storage" step. Notion's model is the opposite: uploaded files are hosted on Notion servers with expiring URLs (iteration 2, finding 5), so vault display requires either fetching or URL passthrough — and the fork's iCloud rule rejects the fetch-duplication path. [SOURCE: file:.../anytype-ts/src/ts/lib/action.ts:304-334]

## Sources Consulted

- anytype-ts/src/ts/interface/object.ts (full read, 94 lines — ObjectLayout + RelationType enums)
- anytype-ts/src/ts/lib/util/object.ts (grep human/participant layouts)
- anytype-ts/src/ts/store/detail.ts (relationFormatObjectTypes handling)
- anytype-ts/src/ts/lib/relation.ts (object relation creation)
- anytype-ts/src/ts/component/page/main/settings/space/share.tsx (members/participants/profile)
- anytype-ts/src/ts/lib/action.ts (downloadFiles implementation)

## Assessment

- newInfoRatio: 0.85 — Anytype internals fully new; directly corroborates iteration 1 + 3 conclusions about relation-to-records as the people pattern.
- Confidence: high — enum reads and function implementations with line numbers.

## Reflection

- What worked: the interface/object.ts enums are the fastest possible ground truth; following `I.RelationType` references led to the object-relation mechanics.
- What failed: none. (The generated middleware protobuf enums were avoided by using the checked-in interface files.)
- Ruled out: "Anytype has a person property type" — disproven (Object layout Human + Object relations instead); "Anytype auto-fetches remote files" — downloads are explicit user actions.

## Recommended Next Focus

Iteration 6: GoodBases verification + the 012 files-column ruling + fork integration surface (EuroFormat call-site map) — closing the two remaining exclusion claims.

---

# Iteration 6: GoodBases Verification, 012 Files-Column Ruling, Integration Surface

## Focus

Close the two remaining exclusion claims with primary evidence: (a) is GoodBases really "chrome-only, no formulas, rollups, or footers"; (b) does the 012 files-column ruling actually reject Notion CDN fetching; and (c) confirm the fork integration contract (EuroFormat model) that any reopened build would follow.

## Findings

1. **GoodBases is a chrome/view layer over Obsidian's Bases plugin — verified from its own repo and site.** GitHub `FrancescoUmberto/GoodBases`: "A custom Bases view for Obsidian that renders your databases as a Notion-style table: clean chrome, hover-reveal OPEN buttons, colored value pills, and inline cell editing." The project site adds: "Your notes stay yours; only the look changes." Capability inventory: (a) formulas — none of its own; `formula.*` columns are "read-only by nature" (delegated to Bases); (b) rollups — no rollup feature exists in its README/feature list; (c) footers — the changelog lists "Calculated footers (next): a Notion-style per-column Calculate row (count, sum, average, and more)" as a *future* item, i.e. not shipped. The spec's claim "chrome-only, with no formulas, rollups, or footers" is accurate as of the current release. [SOURCE: https://github.com/FrancescoUmberto/GoodBases] [SOURCE: https://francescoumberto.github.io/GoodBases/]

2. **GoodBases' own feature set is the hover-open idea already mined into phase 014.** "OPEN button — hover a row to reveal a button that opens the note, just like Notion's database rows." Phase 014's spec confirms the mining: "Hover-open chrome borrowed from GoodBases" (014 spec.md:75) and the caution "GoodBases also shows the trap: it restyled the core Obsidian toolbar and had to revert exactly that" (014 spec.md:62, REQ-003). The 014 lineage research also grounded GoodBases source directly ("GoodBases confirmed as the hover-open + page-panel reference", 014 research/lineages/deepseek-flash-max/logs/fanout-lineage.out:109). The exclusion's "take only its hover-open idea" is already executed in the roadmap. [SOURCE: file:.../014-record-detail-panel/spec.md:62,75] [SOURCE: file:.../014-record-detail-panel/research/lineages/deepseek-flash-max/logs/fanout-lineage.out:109]

3. **The 012 files-column ruling explicitly rejects CDN fetching with the exact cost argument.** "The hard constraint: files stay vault-local — rendering resolves wikilinks to files already inside the vault and never fetches Notion CDN URLs, avoiding both a network dependency and iCloud duplication of vault copies" (012 spec.md:66); Out of Scope: "Fetching or proxying Notion CDN URLs (explicitly excluded: network dependency + iCloud duplication)" (012 spec.md:82). Exclusion 5 is a direct application of this standing ruling. [SOURCE: file:.../012-files-column/spec.md:66,82]

4. **The fork integration contract for any excluded item, if ever reopened, is the EuroFormat isolated-diff model.** Verified twice: fork `data/EuroFormat.ts` is one module + 2 call-site files (CellRenderer.ts, SummaryRenderer.ts — iteration 1, findings 4), and phase 014 codifies the same shape as a requirement: "Diff follows the EuroFormat isolated-diff model — One new module under `src/data/` + 1-3 minimal call-site edits; clean `git rebase` onto upstream" (014 spec.md:116, REQ-004). Any reopened excluded item would follow this contract: new module + ≤3 call-site edits + rebase-safe. [SOURCE: file:.../data/EuroFormat.ts:1-42] [SOURCE: file:.../014-record-detail-panel/spec.md:116]

5. **Mobile/iCloud safety contract for future builds is also pre-defined.** Phase 014 REQ-005: "Mobile-safe and iCloud-safe — No desktop-only APIs; touch/tap fallback for hover; panel performs no writes" (014 spec.md:117). The display-only rule ("panel performs no writes") matches this packet's display-only constraint and the rollups display-only rule (fork `data/types.ts:69-70`). [SOURCE: file:.../014-record-detail-panel/spec.md:117] [SOURCE: file:.../data/types.ts:69-70]

## Sources Consulted

- https://github.com/FrancescoUmberto/GoodBases (README + changelog)
- https://francescoumberto.github.io/GoodBases/ (project site)
- specs/obsidian/002-note-db-notion-parity-build/012-files-column/spec.md (read 1-100)
- specs/obsidian/002-note-db-notion-parity-build/014-record-detail-panel/spec.md (grep GoodBases/hover)
- 014 lineage logs (fanout-lineage.out) — corroboration of GoodBases grounding

## Assessment

- newInfoRatio: 0.75 — GoodBases/012/014 facts new to this packet; integration-contract finding reuses iteration 1's EuroFormat evidence.
- Confidence: high — GoodBases claims checked against its own README/changelog; 012/014 are direct spec reads.

## Reflection

- What worked: verifying the exclusion claims against the artifacts they reference (GoodBases repo, 012 spec, 014 spec) rather than re-deriving them.
- What failed: nothing; one interesting note — the 014 lineage (same fan-out family) independently grounded GoodBases source, which cross-checks this iteration's conclusion.
- Ruled out: "GoodBases has footers" (changelog marks them "next"); "GoodBases has its own formula engine" (formula.* is read-only passthrough to Bases).

## Recommended Next Focus

Iteration 7: Obsidian identity model — verify whether Obsidian has or is gaining a user/identity model (plugin API, accounts, Sync identity), to validate the single revisit trigger.

---

# Iteration 7: Obsidian Identity Model — Revisit Trigger Validity

## Focus

Verify the packet's single revisit trigger — "reopen only if Obsidian gains a user/identity model" — against the current Obsidian API surface and product state (as of 2026-08-25).

## Findings

1. **The Obsidian plugin API exposes NO user/account/identity object.** The `App` class in the official `obsidian.d.ts` exposes: `keymap`, `scope`, `workspace`, `vault`, `metadataCache`, `fileManager`, `lastEvent: UserEvent | null` (a pointer to the last *keyboard/mouse* interaction, not a user identity), plus `loadLocalStorage`/`saveLocalStorage`. There is no `user`, `account`, `profile`, or `participant` accessor anywhere in the public API. The fork's premise — "Obsidian has no user directory to resolve people against" — is verified at the API contract level. [SOURCE: https://github.com/obsidianmd/obsidian-api/blob/main/obsidian.d.ts — `export class App`] [SOURCE: https://docs.obsidian.md/Reference/TypeScript+API/Plugin]

2. **Plugin access to account identity has been requested since 2022 and remains unimplemented.** Forum thread "How do I access user's Obsidian Account Info for my plugin?" (March 2022) asks for "some sort of ID that can identify the user across devices" — no API exists and none was added. A June 2026 feature request ("Expose user identity for Sync login") is still an open request. There is no `Plugin.onUserEnable`-style identity hook — `onUserEnable` fires on user *interaction*, not identity. [SOURCE: https://forum.obsidian.md/t/how-do-i-access-users-obsidian-account-info-for-my-plugin/34923] [SOURCE: https://forum.obsidian.md/t/expose-user-identity-for-sync-login/86637] [SOURCE: https://docs.obsidian.md/Reference/TypeScript+API/Plugin/onUserEnable]

3. **Obsidian has an account (for Sync/Publish billing) but it is deliberately not a user directory.** Sync setup requires an Obsidian account login (obsidian.md/help/sync/setup), yet independent analysis confirms: "Obsidian exposes no user management API of any kind... The application is architecturally local-first — Sync and Publish are optional per-user add-ons with no multi-tenant admin backend... There is no SCIM endpoint, no webhook for join or leave events." Even team-shared vaults ("Invite your team to a shared Obsidian vault", obsidian.md/sync) add participants without exposing a directory to plugins. A plugin home-grown people store would therefore be unowned, vault-local data with no authoritative source — exactly the risk the packet's spec records ("a home-grown one is unowned data"). [SOURCE: https://www.stitchflow.com/user-management/obsidian/api] [SOURCE: https://obsidian.md/help/sync/setup] [SOURCE: https://obsidian.md/sync]

4. **Revisit trigger verdict: still valid and correctly scoped as of 2026-08-25.** The trigger names a concrete, observable event (Obsidian gains a user/identity model) that has NOT occurred. Two reference products prove the dependency: Anytype's "me" is an account-provisioned Profile/Participant object (iteration 5), Notion's people property is workspace-directory-backed (iteration 2) — both require platform identity the plugin API cannot reach. The trigger is also future-proof: if Obsidian ever exposes an identity API, the excluded set (people + me()) reopens on evidence, not on Notion parity alone. [SOURCE: iteration 2 findings 1-4; iteration 5 findings 2-3]

## Sources Consulted

- https://github.com/obsidianmd/obsidian-api (obsidian.d.ts App class)
- https://docs.obsidian.md/Reference/TypeScript+API/Plugin , /Plugin/onUserEnable
- https://forum.obsidian.md/t/how-do-i-access-users-obsidian-account-info-for-my-plugin/34923 (2022)
- https://forum.obsidian.md/t/expose-user-identity-for-sync-login/86637 (June 2026, open)
- https://www.stitchflow.com/user-management/obsidian/api (no user management API)
- https://obsidian.md/help/sync/setup , https://obsidian.md/sync

## Assessment

- newInfoRatio: 0.8 — Obsidian identity evidence new; verdict integrates iteration 2/5 findings.
- Confidence: high on API absence (official .d.ts + docs); high on "no user management API" (independent analysis + two open feature requests spanning 2022-2026).

## Reflection

- What worked: checking the official .d.ts App class directly, then triangulating with forum feature requests and an independent API audit — three independent source classes.
- What failed: nothing; web sources were consistent.
- Ruled out: "Obsidian Sync accounts could serve as an identity model" — accounts are billing-level and not exposed to plugins; "team sharing implies a user directory" — participants exist without a plugin-visible directory.

## Recommended Next Focus

Iteration 8: Edge cases and counterfactuals — what concretely breaks (formula type system, offline vault, iCloud duplication, mobile rendering) if each excluded item were built, using fork + reference-repo mechanics.

---

# Iteration 8: Edge Cases & Counterfactuals — What Breaks If Built

## Focus

Translate each exclusion into concrete failure mechanics grounded in fork code and reference-product behavior: what edge cases and iCloud/mobile costs each item would introduce if a future owner reopened it.

## Findings

1. **`style()`/`unstyle()` counterfactual — four concrete breakages.** (a) No output type: computed outputs are `number | text | date | datetime | checkbox` (`data/types.ts:106`); a styled string is a new type the evaluator, serializer, and column registry would all need. (b) Serialization: `stringifyValue` (data/Stringify.ts:1-14) has no styled-value branch — a rich-text object falls through to `JSON.stringify(value)` (Stringify.ts:9-10), writing JSON blobs into frontmatter. (c) Write-back: `ComputedSyncMode` includes `automatic` (data/ComputedSync.ts:3,42-44) — styled values with markdown markers (`**`, `==`) persisted into YAML would then re-parse as formatting under `textRenderMode: "markdown"` (iteration 1, finding 1): round-trip corruption with no escaping layer. (d) Rendering ceiling: underline and per-argument text/background colors — the parts of Notion `style()` beyond bold/italic/strike/code (iteration 2, finding 3) — are not in the fork's inline parser (`data/InlineMarkdown.ts:8-9`), so even a clean implementation could not render full Notion style output. [SOURCE: file:.../data/types.ts:106] [SOURCE: file:.../data/Stringify.ts:1-14] [SOURCE: file:.../data/ComputedSync.ts:3,42-44] [SOURCE: file:.../data/InlineMarkdown.ts:8-9]

2. **`me()`/person counterfactual — identity breaks across iCloud devices and has no viewer notion.** A home-grown vault-local identity (e.g., a settings-stored id) is per-vault: the same iCloud-synced vault on two devices would resolve two different "me"s, and a shared vault would have no way to know the current viewer — the API exposes no user object (`App` class, iteration 7 finding 1). Notion's "Me" expands to the authenticated workspace user (iteration 2 finding 4); Anytype's me is an account-provisioned Profile/Participant object (iteration 5 finding 3). Neither substrate exists in Obsidian; any plugin identity would be unowned data with cross-device inconsistency as a guaranteed edge case. [SOURCE: iteration 7 finding 1; iteration 2 finding 4; iteration 5 finding 3]

3. **CDN fetch counterfactual — iCloud pays the network cost twice and serves stale bytes.** Downloading a Notion CDN file into the vault adds a network fetch, then iCloud re-uploads the same bytes to the user's other devices (double cost, per the 012 ruling: "network dependency and iCloud duplication of vault copies", 012 spec.md:66). Offline behavior degrades (remote URLs render from cache or fail) while Notion CDN URLs expire — cached vault copies diverge from the source of truth. The reference products deliberately avoid this: AppFlowy renders network files as external images without download (iteration 4 finding 2), Anytype only downloads on explicit user gesture to a chosen directory (iteration 5 finding 4). [SOURCE: file:.../012-files-column/spec.md:66] [SOURCE: iteration 4 finding 2; iteration 5 finding 4]

4. **GoodBases renderer counterfactual — adopting it means abandoning the fork's engines, not swapping chrome.** The fork carries 12 column types + 7 view types + computed fields (two syntaxes) + display-only rollups (`data/types.ts:50,106-108`); GoodBases ships none of formulas/rollups/footers (iteration 6 finding 1) and renders Bases databases (a different frontmatter-property model), not note-database columns. Adoption would be a data-model rewrite on top of a chrome layer, plus the toolbar-restyle trap phase 014 documents (014 spec.md:62). [SOURCE: file:.../data/types.ts:50,106-108] [SOURCE: iteration 6 findings 1-2]

5. **Mobile-safety baseline: the fork has zero hover/touch handling in views.** Grep for `pointerType|touchstart|ontouch|hover mobile` across `src/views` → 0 matches; hover chrome (GoodBases-style OPEN buttons, iteration 6 finding 2) is desktop-only by construction. Phase 014 already mandates touch/tap fallback for its hover-open (014 spec.md:117, REQ-005). Any reopened excluded item with hover- or avatar-style UI inherits the same mobile gap; the display-only rule ("panel performs no writes", 014 REQ-005) is the correct safety contract for all five. [SOURCE: grep touch/hover in src/views → 0 matches] [SOURCE: file:.../014-record-detail-panel/spec.md:117]

## Sources Consulted

- Fork: data/Stringify.ts (full read), data/ComputedSync.ts (full read, 45 lines), data/types.ts, data/InlineMarkdown.ts
- grep touch/hover/pointer in src/views → 0 matches
- 012 spec (012-files-column/spec.md:66), 014 spec (014-record-detail-panel/spec.md:117)
- Prior iteration evidence (2, 4, 5, 6, 7)

## Assessment

- newInfoRatio: 0.6 — counterfactual analysis is new, but it reuses fork mechanics established in iterations 1/2/4/5/6/7; the Stringify/ComputedSync edge case is genuinely new evidence.
- Confidence: high for mechanics (direct file reads); the multi-device "me" breakage is derived (stated as derivation).

## Reflection

- What worked: reading Stringify + ComputedSync completed the style() write-back failure chain that iterations 1/2 implied.
- What failed: nothing; this was a synthesis-heavy iteration with two new evidence reads.
- Ruled out: "style() output can be a plain string" (automatic sync + markdown re-parse breaks round-trip); "me() could use a device id" (iCloud multi-device inconsistency).

## Recommended Next Focus

Iteration 9: Cross-repo triangulation of the two positive claims — (a) people-as-records in AppFlowy/Anytype cell UI (pills, relation pickers), (b) rich-text rendering scope in reference apps — plus capture negative knowledge for the strategy file.

---

# Iteration 9: Cross-Repo Triangulation — People-as-Records UI and Grid Text Rendering

## Focus

Close the two positive claims with widget-level evidence from both reference apps: (a) people-as-records is how AppFlowy/Anytype actually present related records in cells and pickers; (b) neither reference app renders styled rich text inside grid cells, so the fork's markdown `textRenderMode` is not a downgrade.

## Findings

1. **AppFlowy's relation picker is a row list of a target database — people-as-records at the widget level.** `RelationCellEditor` renders `_RowListItem` entries typed `RelatedRowDataPB` (widgets/cell_editor/relation_cell_editor.dart:377-421); tapping a row either opens `RelatedRowDetailPage` for it (if already selected) or fires `RelationCellEvent.selectRow(row.rowId)` to add it (relation_cell_editor.dart:399-421). Rows come from the configured target database via `RelationRowSearchBloc` (application/cell/bloc/relation_row_search_bloc.dart). "Person" in AppFlowy = a row of some database selected through this picker — structurally identical to the fork's relation column selecting records of a target database (`data/types.ts:34-37,67-68`). [SOURCE: file:.../relation_cell_editor.dart:377-421] [SOURCE: file:.../data/types.ts:34-37,67-68]

2. **Anytype grid cells render no markdown styling — styled text is a block-editor feature, not a cell feature.** Grep for `markdown|bold|italic|Decorate|decorations` across `anytype-ts/src/ts/component/block/dataview` → 0 matches. Grid cells render by relation format: `Relation.className(relation.format)` with width/alignment classes and a name-cell special case (`body/cell.tsx:38,45,62-67`). Anytype's rich text lives in document blocks, not in dataview cells — the same separation the fork already has (markdown only when `textRenderMode: "markdown"` is set, `data/types.ts:62`). [SOURCE: file:.../anytype-ts/src/ts/component/block/dataview/view/grid/body/cell.tsx:38,45] [SOURCE: grep markdown/bold/italic in dataview → 0 matches] [SOURCE: file:.../data/types.ts:62]

3. **Triangulation conclusion — both exclusions match industry practice.** (a) People: Notion is the outlier with a directory-backed person property; AppFlowy (workspace user_id, no person field), Anytype (Human-layout objects + Object relations), and the fork (relation column) all express people as records. (b) Styled text: Notion's `style()` is a formula-level styled-string type; AppFlowy grid cells are plain `TextField`s (iteration 4 finding 3) and Anytype dataview cells are unstyled (finding 2) — the fork's markdown-mode text cells already exceed both reference products' grid rendering, which makes the "redundant, adds surface without new capability" ruling (spec REQ-001/002 rationale) stronger than mere duplication: it is capability the peers do not even ship in cells. [SOURCE: iteration 3 finding 1; iteration 5 finding 1; iteration 4 finding 3; this iteration findings 1-2]

4. **Negative knowledge captured for the strategy file.** Ruled out during triangulation: (a) "AppFlowy/Anytype render styled text in cells" — disproven (both render plain/pills); (b) "relation pickers are user-directory pickers" — disproven (both are target-database row lists); (c) "people pills carry avatars from an identity store" — neither reference app renders avatar-based person cells in grids (AppFlowy rows are name rows; Anytype cells are object-name pills). [SOURCE: this iteration; iterations 3-5]

## Sources Consulted

- appflowy_flutter/lib/plugins/database/widgets/cell_editor/relation_cell_editor.dart (read 377-421)
- appflowy_flutter/lib/plugins/database/application/cell/bloc/relation_row_search_bloc.dart (existence)
- anytype-ts/src/ts/component/block/dataview/view/grid/body/cell.tsx (read 1-80)
- grep markdown/bold/italic across anytype dataview → 0 matches
- Fork: data/types.ts

## Assessment

- newInfoRatio: 0.55 — triangulation largely consolidates prior iterations; the widget-level picker evidence and the dataview-styling negative are new.
- Confidence: high — direct widget reads + full-tree negative greps.

## Reflection

- What worked: negative greps + targeted widget reads; the two reference apps' cell layers are compact.
- What failed: Anytype's cell value components live in the shared `Cell` component (beyond dataview/) — the format-based class name evidence suffices without chasing that tree.
- Ruled out: three hypotheses listed in finding 4.

## Recommended Next Focus

Iteration 10: Gap sweep + ranked enrichment — verify all 8 key questions have evidence-backed answers, scan for missed source classes (Notion API files object, mobile-specific notes), and produce the ranked, evidence-cited enrichment of the five exclusions.

---

# Iteration 10: Gap Sweep + Ranked Enrichment of the Five Exclusions

## Focus

Final sweep: fill the last source gap (Notion file-object expiry semantics), verify all 8 key questions carry evidence-backed answers, and produce the ranked, evidence-cited enrichment of the "Excluded parity items" feature.

## Findings

1. **Notion-hosted file URLs expire hourly — the strongest cost evidence for exclusion 5.** The API file-object reference: Notion-hosted files (`type: "file"`) return "a temporary public url valid for 1 hour"; "Don't cache or statically reference these URLs. To refresh access, re-fetch the file object." External files (`type: "external"`) "never expire"; API uploads are ID-referenced (`file_upload`). Consequence: any vault-local copy fetched from a Notion CDN URL is frozen at download time while the authoritative URL rotates every hour — cached bytes diverge from the source by design, not by accident. Combined with the 012 ruling (network dependency + iCloud duplication, 012 spec.md:66), the exclusion is now supported by the strongest possible mechanism evidence: Notion itself forbids static/cached references. [SOURCE: https://developers.notion.com/reference/file-object]

2. **Gap sweep — all 8 key questions answered with evidence:**
   - Q1 (people property vs Clients relation): Notion people = workspace user objects (iter. 2); fork relation = wikilink to target-database records (iter. 1); AppFlowy/Anytype prove records-based people (iter. 3, 5, 9). **Answered.**
   - Q2 (style()/unstyle() vs textRenderMode): Notion styled-string type with b/u/i/c/s + colors (iter. 2); fork markdown mode covers b/i/s/highlight/code (iter. 1); peers render no styled cells (iter. 4, 9). **Answered.**
   - Q3 (AppFlowy/Anytype people models): AppFlowy no person field, users only at workspace layer (iter. 3); Anytype Human-layout objects + Object relations (iter. 5). **Answered.**
   - Q4 (GoodBases): chrome-only view over Bases; no formulas/rollups/footers (iter. 6). **Answered.**
   - Q5 (file URL architecture vs 012 ruling): AppFlowy Local/Network/Cloud kinds, network = display-only (iter. 3-4); Anytype explicit-gesture downloads (iter. 5); Notion expiring URLs (iter. 10); 012 ruling stands (iter. 6). **Answered.**
   - Q6 (Obsidian identity): no user object in API; accounts billing-only; feature requests open 2022-2026 (iter. 7). **Answered.**
   - Q7 (EuroFormat integration contract): one module + ≤3 call-site edits, rebase-safe; codified as REQ-004 in phase 014 (iter. 1, 6). **Answered.**
   - Q8 (edge cases): styled-value serialization/round-trip, multi-device me() identity, iCloud double network cost, engine loss on GoodBases, zero hover/touch handling (iter. 8). **Answered.**
   [SOURCE: iterations 1-9 as cited]

3. **Ranked enrichment of the five exclusions (evidence density, strongest first):**

   | Rank | Exclusion | Verdict | Evidence |
   |------|-----------|---------|----------|
   | 1 | Notion CDN URL fetch | KEEP EXCLUDED — now the strongest case | Hourly-expiring URLs Notion itself says not to cache (file-object ref); 012 ruling; AppFlowy/Anytype display-only patterns; iCloud double-cost |
   | 2 | GoodBases renderer | KEEP EXCLUDED — verified as chrome-only | Its own README/changelog (no formulas/rollups/footers; footers "next"); would discard fork engines; toolbar-restyle trap (014 spec) |
   | 3 | person/people property | KEEP EXCLUDED — industry-consistent | No user directory in Obsidian API; AppFlowy/Anytype both model people as records; Clients relation is the standard pattern |
   | 4 | `me()` | KEEP EXCLUDED — dependent, trigger-scoped | Depends on person/people (Q1); identity machinery (Profile/Participant objects, workspace user_id) absent in Obsidian |
   | 5 | `style()`/`unstyle()` | KEEP EXCLUDED — redundant, with a nuance | textRenderMode covers b/i/s/c/highlight; BUT underline + text/background colors are NOT covered — the redundancy claim is ~70% true; full parity would still need a styled-value type + serializer + escaping (iter. 8) |

   **Nuance for the packet (worth recording):** exclusion 5's reason ("already renders styled text") is precise only for bold/italic/strike/code/highlight. Notion style() also offers underline and 8 colors + 8 background colors as per-argument values (iteration 2 finding 3). The verdict stands (the fork has no styled-value type in its formula engine, so building it is new surface for marginal value in a vault that already types markdown), but a future owner reading the reason should know the exact overlap boundary. [SOURCE: iteration 2 finding 3; iteration 8 finding 1; iteration 1 findings 1,5]

4. **Mobile/iCloud safety synthesis for the packet's future readers.** All five items are display-only-eligible in the sense of phase 014 REQ-005 ("panel performs no writes"); the two write-adjacent risks are: CDN fetch (violates the iCloud no-duplication rule outright) and style() automatic sync (writes styled values into frontmatter). Hover/avatar chrome is desktop-only in the fork today (iter. 8 finding 5) — any reopened item must specify touch/tap fallbacks. [SOURCE: iteration 8 findings 1,3,5]

## Sources Consulted

- https://developers.notion.com/reference/file-object (full fetch)
- All prior iteration artifacts (1-9) and their cited sources

## Assessment

- newInfoRatio: 0.5 — the file-object expiry evidence is new; the ranked enrichment is consolidation of prior iterations (final sweep, expected plateau).
- Confidence: high — every ranked verdict cites at least two independent evidence classes.

## Reflection

- What worked: the gap sweep surfaced exactly one missing source class (file-object reference) and it materially strengthened the top-ranked exclusion.
- What failed: nothing; question coverage closed cleanly.
- Ruled out: no remaining questions; all 8 answered.

## Recommended Next Focus

Synthesis: compile `research.md` (ranked, evidence-cited enrichment), convergence report, and dashboard; mark config complete.

---
