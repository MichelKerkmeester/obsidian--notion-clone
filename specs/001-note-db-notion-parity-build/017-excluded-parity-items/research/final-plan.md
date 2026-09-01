# Final Plan: Excluded parity items
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

**Verdict: DO-NOT-BUILD / HOLD. Confirm it; do not schedule a module.** Parent Wave 6 already names 017 as out of scope unless an owner reopens it (`roadmap.md:66-70`, `spec.md:72,90`). Synthesis (`research/synthesis.md:5-6`) and the rewritten packet agree: ship the ruling, not code. Fork grep today is clean of the five surfaces (`people` hits are emoji-category keys in `IconPickerCatalog.ts:8` / `i18n.ts:116`, not a property type; no `created_by` / `me()` / `style(` / `fetch(` in `src/data`).

**Solid.** The five exclusions are evidence-backed, not vibes. Markdown mode already paints bold/italic/strike/highlight/code/links (`InlineMarkdown.ts:8-9`, `CellRenderer.ts:212-228`); computed outputs are still `number | text | date | datetime | checkbox` (`types.ts:106`). People resolve only as relation wikilinks (`types.ts:34-37,50,67-68`; `CellRenderer.ts:193-195`). Notion `file` URLs expire in one hour and must not be cached (`research.md` iteration 10; `012-files-column/spec.md:66,86`). GoodBases is chrome over Bases with no own formulas/rollups and footers marked “next” (`research.md` iteration 6). Obsidian `App` still has no `user`/`account`/`profile` (`research.md` iteration 7). Edge cases in synthesis (`research/synthesis.md:28-36`) are real: `stringifyValue` JSON-falls-through objects (`Stringify.ts:1-14`); `ComputedSyncMode` includes `"automatic"` (`types.ts:111`, `ComputedSync.ts:42-44`) while the default is `"display-only"` (`ComputedSync.ts:3`); a settings-stored `me()` is per-vault, not per-viewer; `src/views` has no `pointerType`/`touchstart`.

**Wrong trigger width.** REQ-003 / SC-003 / spec line 157 say “the excluded set reopens” on an identity API. Operator decision 4 and `implementation-summary.md:117` already contradict that: CDN and GoodBases **never** reopen, even after identity. `style()` is not identity-gated and is still skip (`research/synthesis.md:10`). A later owner who only reads REQ-003 will treat Wave 6 as a single unlock. That is the packet’s load-bearing correctness trap.

**Wrong reserved people shape in T005.** Plan/synthesis lock “map a plugin-visible user id onto the existing relation/wikilink value model — do **not** add a parallel directory” (`plan.md:85-89`, `research/synthesis.md:26`). T005 then tells the implementer to edit `ColumnDef.type` (`tasks.md:75`). A new `"people"` union member is a parallel type, blows `COLUMN_TYPE_LABELS()` / `isColumnType` (`ColumnTypes.ts:108,125`) the same way 012’s `"files"` does, and is exactly the home-grown directory the HOLD exists to prevent. Relation pills already exist (`CellRenderer.ts:193-195`); a future `PersonIdentity.ts` should not retarget them.

**`style()` cannot fit EuroFormat if forced.** Synthesis lists six files if built (`research/synthesis.md:10`: `types.ts`, `BaseExpression.ts`, `Stringify.ts`, `ComputedSync.ts`, `InlineMarkdown.ts`, `CellRenderer.ts`). Plan’s reserved `FormulaStyle.ts` at evaluator + `Stringify.ts` + `CellRenderer.ts` (`plan.md:90`) under-counts: no styled output type (`types.ts:106`), no underline/colors in the parser (`InlineMarkdown.ts:8-9`), and `automatic` sync would persist `**`/`==` into YAML then re-parse under `textRenderMode: "markdown"` (`Stringify.ts:9-10`, `ComputedSync.ts:42-44`, `CellRenderer.ts:212-228`). Effort **L** is right; “1–3 call sites” is not.

**`me()` call sites are misnamed.** T006 points at `FormulaTokenizer.ts` as an evaluator. That file is a dependency scanner; builtins live in `FORMULA_BUILTIN_CONSTANTS` (`FormulaTokenizer.ts:22-24`) so `me` is not treated as a column. Evaluation is `ComputedField.ts` (native) and `evaluateBaseExpression` / `createBaseScope` (`BaseExpression.ts:64,1099`). The unnamed “filter path” is `QueryEngine.matchesFilter` (`QueryEngine.ts:91-126`); UI operators are `FilterPanelRenderer.ts:19-43` (relation falls through to `eq`/`contains`). The existing dynamic-value pattern is `ConditionalFormatRule.valueSource: "literal" | "today"` (`types.ts:147`, `ConditionalFormatting.ts:12-20`), not a new column type.

**Stale 014 citations.** Hover-open / GoodBases-toolbar claims cite `014-record-detail-panel/spec.md:62,75`; after the 014 rewrite, line 62 is title-cell navigation risk and line 75 is the OPEN-button in-scope bullet. The toolbar trap is Out of Scope line 82 / REQ-003 line 115. EuroFormat REQ-004 is line 121, not 116; mobile REQ-005 is line 122, not 117. `012-files-column/spec.md:82` is the in-scope “no CDN” bullet; the Out of Scope fetch line is `:86`. `ComputedSync.ts:13` is a comment closer; the default is `:3`.

**Task list is a sandbox pitfall.** T004–T008 sit under “Phase 2: Implementation” with real fork `file:line` and effort **L**/**M**. `[B]` is easy to misread as “blocked until unblocked,” which is how “not built” becomes “still TODO” — the spec’s stated risk (`spec.md:63`). T001–T003 are still `[ ]` even though the rewrite already recorded the ruling. `implementation-summary.md` still says “Not yet implemented (Planned)” and “Plugin typecheck / tests: Pending,” which fights Status: On Hold. No `checklist.md` (Level 1 is allowed); the HOLD still needs a three-line proof, not a build checklist.

**Ranking mismatch.** Synthesis “ranked backlog” leads with `style()` (`research/synthesis.md:10`). Iteration 10 ranked **keep-excluded strength** as CDN → GoodBases → person → `me()` → `style()` (`research.md` iteration 10 table). Leading with the only non-blocked item invites a “build the first backlog row” mistake. Effort estimates for T004–T008 are hypothetical-future, not this wave; this wave is **0 hours of fork work** (`plan.md:194`).

## Optimizations

1. **Split the reopen contract into three buckets**, matching operator decisions 1/3/4 (`spec.md:151-154`) and iteration 10:
   - Identity-gated: person/people + `me()` — reopen **only** if Obsidian ships a plugin-visible user object, **and** Wave 6 is explicitly entered (`roadmap.md:66-70`).
   - Never: Notion CDN fetch, GoodBases-as-renderer.
   - Still skip even with identity: `style()`/`unstyle()` (peers do not style grid cells; residual underline/colors is new formula surface).
2. **Do not add `ColumnDef.type` `"people"`.** Reserved module stays `src/data/PersonIdentity.ts` mapping platform id → existing relation wikilink (`RelationLinks.ts:23-26`). Leave `types.ts:50` and `CellRenderer.ts:193-195` alone. That is the only way the EuroFormat 1 module + ≤3 call-site budget can hold.
3. **Name the real `me()` sites** if the trigger ever fires: `PersonIdentity.ts`; `FORMULA_BUILTIN_CONSTANTS` (`FormulaTokenizer.ts:22-24`) + native evaluator; `createBaseContext` / `createBaseScope` (`BaseExpression.ts:1099`); `QueryEngine.matchesFilter` (`QueryEngine.ts:91`) with a `valueSource: "me"` analog to `"today"` (`types.ts:147`). Treat a fourth file (`FilterPanelRenderer.ts:19`) as out of budget unless the Me token is a literal `FilterRule.value` resolved in `QueryEngine` only.
4. **Retire T004–T008 as scheduled work.** They are exclusion reasons, not a queue. Do not keep them in an Implementation phase with effort tags.
5. **Treat T001–T003 as already satisfied by the rewritten packet.** Remaining operator work is the read-only confirmation below, not more prose.
6. **Fix citation drift if docs are touched later** (not this review’s job): 014 `:82`/`:115`/`:121`/`:122`; 012 `:66,:86`; `ComputedSync.ts:3,42-44`.
7. **Cut `FormulaStyle.ts` from the reserved design.** A forced `style()` build is a type-system project, not an isolated override. Recording a fake EuroFormat shape makes the next owner start too small and hit write-back corruption (`research/synthesis.md:30`).

## Final build plan (ordered)

This is **not** a build. Confirm HOLD, use the stand-ins, reopen only on the trigger below.

1. **Confirm DO-NOT-BUILD (S)** — no module, no call site. Deps: none.
   - Packet: `017-excluded-parity-items/spec.md` Status On Hold; `plan.md:55,194`; `tasks.md:60-72`; `research/synthesis.md:5-6,22`.
   - Parent: Wave 6 never-default (`roadmap.md:66-70`).
   - **Check:** `git -C "/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin" diff --stat` has no 017-authored paths. Grep `src/` for `style(`, `unstyle(`, `me()`, `ColumnDef.type` people, Notion CDN/`secure.notion`, GoodBases view class — all absent (emoji `people` keys do not count).

2. **Read-only stand-ins (S)** — vault/config only; do not edit the fork. Deps: 1.
   - **People:** relation column to a Clients (or equivalent) notes database — AppFlowy/Anytype pattern (`research/synthesis.md:12,44`; `types.ts:34-37,67-68`; pills already at `CellRenderer.ts:193-195`).
   - **Styled text:** per-column `textRenderMode: "markdown"` (`types.ts:59-62`, `InlineMarkdown.ts:8-9`, `CellRenderer.ts:212-228`). Do not add formula colors/underline.
   - **`me()`:** no honest substitute. Filter the relation column by a specific Client wikilink (`QueryEngine.ts:91-100`). Do not store a settings id (`research/synthesis.md:31,41`).
   - **Files:** vault-local wikilinks; 012 owns the type (`012-files-column/spec.md:66,86`).
   - **Chrome:** hover-open / side-peek only, already scoped to 014 (`014-record-detail-panel/spec.md:74-75,82,115`). Never swap `src/views/*` for GoodBases (`research/synthesis.md:18`).
   - **Check:** finance vault models assignees as relation pills; markdown columns render `**`/`==`; no plugin Person type; no network on file cells.

3. **Identity-gated reserved design (recorded, not built) (S)** — `src/data/PersonIdentity.ts` only if step 4 fires. Deps: 1–2, trigger.
   - Map plugin-visible user id → wikilink into the existing Clients relation. No `"people"` union member (`types.ts:50` stays as-is). No parallel directory.
   - Call-site cap: (1) Bases `me()` in `BaseExpression.ts:64` / `createBaseScope` `:1099`; (2) native `me` via `FormulaTokenizer.ts:22-24` + `ComputedField.ts`; (3) “Me” token in `QueryEngine.ts:91` (mirror `ConditionalFormatting.ts:12-20`). Skip `CellRenderer.ts` if pills stay `case "relation"`.
   - Build-order: people-as-relation mapping first; `me()` after; never invent `me()` from a settings id (`research/synthesis.md:14`). Effort if ever: **L** for the pair, **M** for `me()` once identity exists.
   - **Check:** not executed this wave. If someone opens a PR, reject it unless step 4’s observable is true and Wave 6 was explicitly entered.

4. **Exact revisit trigger** — reopen **person/`me()` only**.
   - **Observable:** official Obsidian plugin API exposes a user/identity object plugins can read (not `App.lastEvent`, not Sync/Publish billing, not `onUserEnable` as a click hook). Still absent as of 2026-08-25 (`research.md` iteration 7; forum requests 2022 and June 2026).
   - **Then:** explicit owner decision to enter Wave 6 (`roadmap.md:70`). Follow step 3. Default until then: **keep closed** (`spec.md:151`).
   - **Does not fire for:** Notion parity pressure, a vault named Me, device hostname, iCloud account email, team-shared vault participants without a plugin directory (`research/synthesis.md:40-41`).
   - **Never:** CDN fetch (hourly URLs + iCloud double transfer, `research/synthesis.md:16,32`); GoodBases renderer (drops 12 types / 7 views / two formula syntaxes / `count|sum|avg|list`, `types.ts:50,106-108`, `research/synthesis.md:18`).
   - **Still skip after identity:** `style()`/`unstyle()` (`research/synthesis.md:10,42`; iteration 10 rank 5).

5. **Negative proof (S)** — deps: 1.
   - No new file under fork `src/`. No CSS. No `fetch` added to file/formula paths (`BaseExpression.ts:32` already bans `fetch` in formulas).
   - Display-only by omission: no new frontmatter keys, no identity blob, no renderer swap (`research/synthesis.md:36`).
   - **Check:** SC-001 (`spec.md:123`). Packet remains On Hold.

## Risks & open decisions

| Item | Residual risk | Recommended default |
|------|----------------|---------------------|
| REQ-003 wording vs operator decision 4 | Owner reopens CDN/GoodBases/`style()` because “the excluded set” unlocked | Default: identity unlocks **only** person + `me()`. CDN/GoodBases never. `style()` still excluded. |
| Home-grown vault identity | Same iCloud vault, two devices, two `me()` values; shared vault has no viewer (`research/synthesis.md:31`) | Default: **reject** (`spec.md:152`). |
| T005 `ColumnDef.type` people | Fake directory + registry blast radius (`ColumnTypes.ts:108,125`) | Default: relation-only; no new type. |
| `style()` automatic sync | `**`/`==` written to YAML, re-parsed as markup (`Stringify.ts:9-10`, `ComputedSync.ts:3,42-44`, `CellRenderer.ts:212-228`) | Default: keep excluded; keep computed sync `"display-only"`. |
| `style()` overlap ~70% | Underline + 8 text + 8 background colors are real Notion surface (`research.md` iteration 10 nuance) | Default: still excluded — residual is formula surface, not missing cell render (`spec.md:153`). |
| GoodBases chrome envy after 014 | Toolbar restyle trap (`014-record-detail-panel/spec.md:82,115`); hover-only OPEN with zero touch handling in `src/views` | Default: 014 only; no desktop-only APIs (`014-record-detail-panel/spec.md:122`). |
| Wave 6 vs 017 trigger | Identity API ships and someone treats it as auto-build | Default: still need explicit Wave 6 owner decision (`roadmap.md:66-70`). |
| Stale `implementation-summary.md` | Reads as Planned/unbuilt, verification Pending | Default: treat packet as the deliverable; fork proof is empty diff, not a typecheck of new code. |

No operator decision is required to **keep HOLD**. The only decision that would change the plan is an identity API that does not yet exist.
