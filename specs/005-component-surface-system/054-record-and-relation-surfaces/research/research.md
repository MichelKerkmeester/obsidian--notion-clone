# Deep Research Synthesis — Notion's record/page surface vs our record surfaces

Lineages merged: 1 (`glm-openrouter-record`, executor `cli-pi` model `z-ai/glm-5.3-flash`, reasoning effort `max`, 5 iterations).
Topic: how Notion's record/page surface — header and icon/cover, property rows and their editors, relation and rollup rows, add property, hidden properties, comments, the phone record sheet — should refine the note-database plugin's record surfaces.
Evidence policy: every Notion claim cites a screen id in `notion-screens-digest.md`, which was the only permitted source of Notion facts (the loop opened no image). Local claims cite `[SOURCE: file:line]` read in this worktree. Inferences are marked as inferences.
Ruling policy: Anytype parity is the default for these surfaces (`051` ADR-007, `056`, `057`, `054/goal.md` D6). Notion refinements are additive. Every Notion-vs-Anytype tension is named with a winner and a reason, and no landed operator ruling is overridden.

## 1. Executive Summary

The digest's 97 screens produce **nine ranked candidates**. Their headline is that Notion's strongest corroborations point at changes **already ruled on Anytype evidence but not yet landed**, while Notion's genuinely new contributions are three smaller additive items and three operator questions.

The single highest-impact finding came from our own tree, not from the digest: **the board card never consults the empty-prompt primitive** (`board-renderer.ts:728-732`), so the A3/AC-004 rollout's board half is unlanded even inside its ruled scope. Notion sits on the *losing* side of that ruling (universal "Empty", screens `16ddd22c` / `bf2171ff`) and must not be adopted.

Ranked by user impact (records touched × surface frequency × defect visibility):

| # | Candidate | Provenance | Status | Gate |
|---|---|---|---|---|
| 1 | Finish the empty-value prompt rollout — board-card delegation plus format extension (F2.1) | A3 ruled on Anytype; Notion on the losing side | Ruled, half unlanded | lane |
| 2 | Equalise the desktop label/value type size (F2.2) | A2 ruled; Notion agrees as a third source | Ruled, open | lane |
| 3 | Consume the built-but-unused `renderOptionValue` split (F2.4) | A2 C9 ruled; Notion silent | Ruled, built, zero consumers | lane |
| 4 | Carry the typed name into format selection in the add-property picker (F4.1) | Notion P4 adapted onto A5's search-first grammar | New evidence, no ruling touched | unit |
| 5 | Trailing "+ Add a property" row on the record sheet (F2.6) | Notion P1 placement; Anytype `+` divergence named | New, additive | lane |
| 6 | Hidden-group enrichment — per-row eye, bulk link, population semantics (F3.1/F3.2/F3.3) | Notion P3; A4 silent on the extension | Operator question | operator |
| 7 | Featured line under the title (F1.2) | A1 ruled on Anytype; Notion corroborates placement only | Ruled direction, unlanded | operator |
| 8 | Record-level cover/icon system (F1.3) | Notion P5 only; unowned | Decision question, not a task | operator |
| 9 | P7 display-mode naming in docs and labels (F1.4) | Notion P7; `006`'s placement ruling untouched | Zero-code | none |

Already have, no action: icon picker richness (F1.1), value left-alignment (F2.3), header open/close (F1.5), empty-title and body ghost (F1.6), conditional hidden section plus entry-point count plus re-render survival (F3.4), visibility-row anatomy and select-all (F3.3/F3.6), relation editor grammar (F4.3), rollup-as-ordinary-row (F4.4), gated format list (F4.5), the phone record sheet's ruled grammar (F5.2).

## 2. Research Question and Decision Standard

Six questions were dispatched: which Notion patterns from the digest would improve this surface for a user, ranked by impact; for each, the concrete change to our code and CSS with a measurable threshold; which Notion behaviours we already have; which conflict with an Anytype ruling; which need a device-only check; and a ranked remediation plan sized as phase tasks.

"Improvement" means a change a user would feel on a surface they touch every session, not a resemblance to Notion. A Notion pattern that merely agrees with our pre-fix state is not evidence to revert a landed ruling — the digest says so itself at §5(1). A finding is *actionable* only when it names a file, a function or rule, a value, a threshold, and a red-first check that fails today.

## 3. Scope, Boundaries, and Code Surface

Bounded source set, as dispatched: `src/views/record-surface/*.ts`, `src/views/record-detail-panel.ts`, `src/views/table-record-peek.ts`, the record blocks of `styles.css`, `054`'s `goal.md` / `design-trueup.md` / `decision-record.md` / `tasks.md`, `058`'s `goal.md` / `spec.md`, `specs/005-component-surface-system/design-system.md`, and `roadmap.md`'s §6A rulings. Four extra source files were opened, each because a finding required it: `icon-picker-popover.ts` (F1.1), `board-renderer.ts`'s card-field path (F2.1), `column-manager-renderer.ts` plus the `database-view.ts` modal handoff (F4.1), and `hidden-properties.ts`'s two consumers (F3.1).

No production code, stylesheet or spec document was changed by the loop. The loop opened no PNG.

The code seam the findings converge on is: `record-detail-panel.ts` builds the sheet's field list and its hidden group, `property-row.ts` owns the row primitives (`buildPropertyRow`, `renderPropertyValue`, `renderOptionValue`, `getPropertyEmptyPrompt`, `buildCheckboxPropertyRow`), `board-renderer.ts` carries a **parallel** empty-value path that does not consult that primitive, and `column-manager-renderer.ts` owns the add-property picker's wiring into `database-view.ts`'s create modal.

## 4. Method and Convergence Record

One fan-out lineage, five iterations, one focus each: header and icon/cover (P5, P7) → property rows (P1) → hidden properties and the two Properties destinations (P2, P3) → add property, relation and rollup (P4) → comments (P6), phone sheet, and consolidation. Stop policy was `max-iterations`, so convergence was telemetry only and early synthesis was forbidden.

`newInfoRatio` ran 0.80 → 0.75 → 0.70 → 0.65 → 0.45. The iteration-5 drop reflects consolidation rather than exhaustion: every P-pattern in the digest had been dispositioned by iteration 4. Twenty-seven findings were registered across the lineage; the merge coerced the lineage registry's non-canonical `findings` key to `keyFindings` and recorded the mismatch (`fanout-attribution.md`, `findings-registry.json.schema_mismatch`).

## 5. Header, Icon and Cover (P5, P7)

**Icon picker (F1.1) — already have.** Notion shows an 8-colour swatch row, a Recent row and emoji category grids [screens `b1b9d218`, `4dd0854f`]. Ours ships all three: `recent?: string[]` with `onRecentChange` persistence [SOURCE: src/views/icon-picker-popover.ts:43, :94], `RECORD_ICON_COLORS` serialized as `lucide:<id>@<color>` [SOURCE: src/views/icon-picker-popover.ts:12, :69-71], and `EMOJI_CATEGORIES` / `LUCIDE_CATEGORY_DEFINITIONS` tabs with search and arrow-key grid navigation [SOURCE: src/views/icon-picker-popover.ts:3-5, :11, :69-70]. Notion's "Ask every time" toggle [`b1b9d218`] is a template-creation setting, not a record-surface affordance.

**Featured line (F1.2) — ruled, unlanded.** `design-trueup.md` §A1 rules that the object page reads as a page because of a featured line: one inline row of middot-separated relations directly under the title, secondary colour, one line. The ruling is landed in the design record and not in code — `buildDesktopRecordHeader` renders only icon → title → trailing buttons [SOURCE: src/views/record-surface/record-header.ts:50-57], and no `featured` token exists in any record-surface file (grep, zero hits). Notion corroborates the **placement** only: a metadata line sits directly under the title [screen `d2b6da49`], and a caption/link row sits between cover and body [screen `62fe716c`]. Notion's content model is a freeform mention; A1's is featured relations. **Not a true conflict; A1 wins.** Concrete change for the leg that lands A1: give `buildDesktopRecordHeader` an optional `renderFeatured?: (header: HTMLElement) => void` slot between the title [SOURCE: src/views/record-surface/record-header.ts:53-56] and the trailing buttons, so the peek's title-only header [SOURCE: src/views/record-surface/record-header.ts:91-98, consumed at src/views/table-record-peek.ts:213-221] and the properties panel's select-all header stay unaffected; the caller [SOURCE: src/views/record-detail-panel.ts:350-367] supplies the middot row.

**Cover (F1.3) — a real, unowned gap.** Notion's cover system is large: a six-tab picker [screen `18d621d0`], a separate Reposition drag mode with Save/Cancel [screen `bfddb457`], an ALT badge opening an alt-text dialog [screens `9d90280d` → `3ebe4893`], an upload-in-progress state [screen `b5352c94`], hover ghost buttons on an unset header [screen `56e2ae1a`], and the icon overlapping the cover's bottom-left corner [screen `ab313e42`]. Cover height ≈29% of page height, eyeballed by the digest's analyst. We have no cover on any record file (grep, zero hits), and the digest records the ownership question as `051`'s shell question (goal.md D8) before it is a content question. **Recommendation (inference): do not fold a cover into this refinement phase.** It is sized like the icon picker multiplied by upload, reposition and alt-text states; the AI tab is excluded by `054/goal.md` D6; and no Anytype evidence for a record-level cover exists in the bounded sources.

**Display-mode naming (F1.4) — zero code.** Notion names the three shells Side peek / Center peek / Full page with a per-view default [screen `0cb59457`]. Our three shells are the table peek rail [SOURCE: src/views/table-record-peek.ts:214-239], the record sheet [SOURCE: src/views/record-detail-panel.ts], and the full note (`openRow`). `054/goal.md` §5 already rules the desktop anchored panel's placement is `006`'s. Adopt the vocabulary in docs and labels only.

**Header chrome (F1.5) and empty states (F1.6) — already have.** Our header carries open-note and close [SOURCE: src/views/record-surface/record-header.ts:66-90] with the desktop close CSS-hidden and the phone close persistent [SOURCE: styles.css:21046-21070]. Notion's "···" page menu carries 17 rows [screen `9484e185`]; P8 is out of this packet's file group — `051`/`052` own menu chrome, confirmed by `054/goal.md` D8. We render `is-empty-title` styling [SOURCE: src/views/record-surface/record-header.ts:57-58] and a note-body placeholder [SOURCE: src/views/record-detail-panel.ts:294; src/i18n.ts:564] against Notion's template ghost line [screen `bf2171ff`].

## 6. Property Rows (P1)

**Empty-value copy (F2.1) — rank 1 overall.** Notion renders the literal word "Empty" universally, every type, grey [screens `16ddd22c`, `bf2171ff`]. Our A3 ruling went the other way on Anytype evidence: a format-specific prompt naming the action, with Anytype's placeholder *colours* refused below 4.5:1 [SOURCE: design-trueup.md §A3]. **A3 wins.** The new evidence is that A3's board half never landed: the record sheet consumes the primitive [SOURCE: src/views/record-detail-panel.ts:515], while `board-renderer.ts` carries its own `getEmptyDisplayValue` that never imports it and returns `t("common.empty")` for every non-checkbox format, including the three ruled formats `select` / `multi-select` / `relation` [SOURCE: src/views/board-renderer.ts:728-732]. `054/goal.md` §3 criterion 2 reads "on the record sheet **and board cards**, with the word 'Empty' gone where an editor exists". Concrete change: delegate `getEmptyDisplayValue` to `getPropertyEmptyPrompt(displayType)`, preserving the `multi-select → [prompt]` array shape and the `checkbox → false` case exactly as `record-detail-panel.ts:514-519` already does; the card's empty `select` row then reads `t("field.emptySelectPrompt")` = "Select option" [SOURCE: src/i18n.ts:79] rather than "Empty" [SOURCE: src/i18n.ts:78]. Extension beyond the three ruled formats: A3's captured Anytype copy prompts non-option formats too ("Enter number"), and our implementation scoped the prompt to three [SOURCE: src/views/record-surface/property-row.ts:280-284]; the copy for `date` / `datetime` / `currency` / `text` / `files` is ours to mint in the same verb+noun shape (**inference** — no capture in the bounded sources shows an Anytype date or text empty row).

**Desktop label/value type size (F2.2) — rank 2.** A2 rules the desktop label equalised with the value, "hierarchy is colour, not size" [SOURCE: design-trueup.md §A2]. The digest adds a third independent observation: every Notion row read shows label and value at the same visual weight, distinguished by colour and icon [screens `16ddd22c`, `01cde7f6`, `9867cb76`]. Our desktop rule still sets the record-sheet label to `var(--font-smaller)` against an inherited larger value size [SOURCE: styles.css:10258-10264]. Concrete change: drop that declaration from `.db-record-detail-field-label` on the desktop arm only — the phone arm [SOURCE: styles.css:10417-10430] keeps `--db-font-base` under the iOS 16px input-zoom floor, which A2 explicitly does not reopen. **No Notion-measured ratio is available** — the digest declines to supply one — so the threshold stays A2's equal-size rule read as a computed-style assertion.

**Value alignment (F2.3) — already have.** `styles.css:10213-10223` sets `text-align: left` on the record sheet's value, scoped away from the board card whose right-alignment is ruled to stay (D5/D7); `:10230-10235` does the same for the badge wrapper. This state is **more current** than `design-trueup.md`'s own `:10161` citation — recorded so a later leg does not re-apply the drifted true-up line.

**Option split (F2.4) — rank 3.** A2's C9 rules single-select as coloured text and multi-select as chips, with a 4.5:1 pair floor. The corrected renderer exists [SOURCE: src/views/record-surface/property-row.ts:250-273, contract at :246-249] and **no file consumes it**; the live path renders both as filled `status-badge` chips [SOURCE: src/views/record-surface/property-row.ts:76-101]. Notion's evidence here is thin by the digest's own admission: no screen in the 97 shows a single-select rendered as bare coloured text, and multi-select renders as chips in the one populated read [screen `c3b86c01`]. **The adoption stands on Anytype evidence; Notion neither supports nor contradicts it.**

**Row-shell asymmetry (F2.5) — already planned.** `buildPropertyRow` [SOURCE: src/views/record-surface/property-row.ts:216-235] is consumed by the table peek [SOURCE: src/views/table-record-peek.ts:351] but not by the record sheet, whose rows still come through `renderCardField` [SOURCE: src/views/record-detail-panel.ts:520-535]. `054`'s ADR-004 already records that the desktop alignment override retires when P2 lands and `card-field-renderer.ts` becomes a shim, and ADR-007's source census makes that observable. Recorded so the remediation plan does not double-count it.

**Trailing add row (F2.6) — rank 5.** Notion ends its record property list with a plain-text "+ Add a property" row and puts "Add a comment…" below a hairline as its own zone [screens `16ddd22c`, `bf2171ff`]. Our record sheet renders **no add-property entry at all** [SOURCE: src/views/record-detail-panel.ts:41-46], although the search-first picker exists [SOURCE: src/views/record-surface/add-property-row.ts:37-116] and the column manager renders its own "+ New property" row. Anytype puts a `+` on the section header row instead [SOURCE: design-trueup.md §A4]. **Divergence is placement only, and neither placement is ruled for the record sheet** — A4 covers the hidden group, not the add entry. Proposal (inference): adopt Notion's trailing row, which matches our existing muted-text row idiom [SOURCE: styles.css:10277-10296], opening `buildAddPropertyRow` through `052`'s picker host per D8.

## 7. Hidden Properties and the Two Properties Destinations (P2, P3)

**Population semantics (F3.1) — new evidence, operator question.** The record sheet's group holds **empty fields**, filtered in because `config.showEmptyFields !== true` [SOURCE: src/views/record-detail-panel.ts:392-396]; view-hidden columns never reach the sheet, because the caller passes visible columns only [SOURCE: src/views/record-detail-panel.ts:118-119]. The table peek's group holds **view-hidden columns**, the complement of `visibleKeys` [SOURCE: src/views/table-record-peek.ts:247-253]. Notion's "Hidden in `<surface>`" section holds view-hidden columns [screens `cc8b241a`, `7ffa073f`]. So one label — "Hidden properties" [SOURCE: src/i18n.ts:569] — names two different populations on our two surfaces, and neither is Notion's. Neither the digest nor the true-up flags this. A user who hides a column in view config sees it vanish from the record sheet entirely and sees an unrelated "Hidden properties (3)" counting empties. **The landed A4 shape is not reopened by this; the population question is a real operator question.**

**Per-row eye (F3.2) — rank 6, operator question.** Notion's grammar gives every row a drag handle, type icon, name, eye toggle and chevron, with per-section bulk links, the Hidden section rendered only when non-empty, and the count on the entry-point row [screens `2f52d1bc`, `406e67e2`, `9867cb76`, `cc8b241a`, `01cde7f6`, `52348672`, `794591f5`]. Ours is a disclosure only: a toggle button with a count and a fields container [SOURCE: src/views/record-surface/hidden-properties.ts:32-76]; rows come from the caller's callback with no per-row affordance host, and re-showing a hidden field means re-editing the view's column config. **A4's ruling stands and never covered a per-row eye**; the digest files this as new evidence against a closed ruling needing an operator call, not an inference. The row anatomy already exists to reuse [SOURCE: src/views/record-surface/property-row.ts:330-395].

**Bulk show/hide (F3.3) — partially have.** One bulk control exists, the column-manager header's select-all toggle [SOURCE: src/views/column-manager-renderer.ts:245-252], with shift-range toggles at `:333`. It does not cover the record sheet's group. If F3.2 is approved, a "Show all" link in the group header is the same persist path and belongs to that task, not a separate one.

**Conditional section and entry-point count (F3.4) — already have.** The group renders nothing when empty [SOURCE: src/views/record-surface/hidden-properties.ts:47-49], matching Notion's conditional Hidden section [screens `9867cb76` vs `cc8b241a`]; the count lives on the group's own toggle label [SOURCE: src/views/record-surface/hidden-properties.ts:54-56; src/i18n.ts:569], the entry-point phrasing Notion uses [screens `52348672`, `794591f5`]; expanded state survives a re-render [SOURCE: src/views/record-surface/hidden-properties.ts:18-21].

**Deleted-properties tier (F3.5) — out of scope.** Desktop-only in Notion [screens `01cde7f6`, `7ffa073f`], absent from the iOS sample. We have no analogue, the digest flags a possible collision with `045`'s card-hiding mechanism, and a soft-delete tier implies a property-deletion lifecycle this file group does not own.

**Management vs visibility destinations (F3.6) — named non-defect.** Notion sends "Properties" to two near-identical sheets with different affordances: management [screen `8bb9115f`] and visibility [screen `9867cb76`]. Our `buildCheckboxPropertyRow` rows are structurally the visibility sheet [SOURCE: src/views/record-surface/property-row.ts:330-395]; management happens through the create/edit modal's type picker. The guard worth keeping: a future "manage properties" destination must not be built as a variant of the visibility list. `checkboxDisabled` already exists on the row options [SOURCE: src/views/record-surface/property-row.ts:355]; whether the title row disables its checkbox is **UNKNOWN** (see §12).

## 8. Add Property, Relation and Rollup (P4)

**The picker drops the typed name (F4.1) — rank 4, new evidence.** Notion carries the name first, then the type list, so a property is named and typed in one pass [screen `1589e7c8`]. Ours is search-first over formats, A5's ruled grammar [SOURCE: design-trueup.md §A5], and the wiring loses the query in the common case: selecting a format calls `createProperty(type)` with no label [SOURCE: src/views/column-manager-renderer.ts:200], and only the create fall-through uses the query, forcing the new property to be **text** [SOURCE: src/views/column-manager-renderer.ts:201]. So typing "Due Date" and picking Date yields an unnamed Date column, and a named Date column is impossible in one pass — even though the modal handoff already forwards both [SOURCE: src/views/database-view.ts:5088]. Concrete change: capture the query at selection time and forward it, using the handle's exposed `searchInput` [SOURCE: src/views/record-surface/add-property-row.ts:110-112]; keep `onCreateNew` as-is. The create row's `Create "${query}"` label [SOURCE: src/views/record-surface/add-property-row.ts:91-95] already promises the name is wanted. **This adapts P4's insight without adopting its order.**

**Flow order (F4.2) — conflict, Anytype wins.** Notion puts a name field and AI Autofill chips above the search [screen `1589e7c8`]; Anytype opens with one search-or-create field [SOURCE: design-trueup.md §A5]. The digest's own ruling applies verbatim: there is no landed picker on the record sheet to protect, so Anytype's ordering stays on record until an operator says otherwise. The AI half is excluded regardless by `054/goal.md` D6.

**Relation rows and editor (F4.3) — already have.** The relation query's 9 screens were mostly off-topic; the one marginal screen is a database-to-database "Link to existing data source" picker, explicitly not a row-level relation picker [screen `b4fd8ac7`]. Our relation rows render as P1 label→value rows with linked badges [SOURCE: src/views/record-surface/property-row.ts:102-105], and our relation editor already ships search-first selection, multi-select, a selected-count footer, clear, per-record icons, keyboard navigation and a phone shell header [SOURCE: src/views/record-surface/cell-editor-relation.ts:96-101, :154-160, :170-224]. The bordered-card relation variant is template-specific [screen `263196dd`] and carries no general evidence.

**Rollup rows (F4.4) — already have.** Rollups appear in the sample only as a `Σ`-icon row in a visibility panel [screen `b69c8a59`] and as a "Summ…" property in a record's list [screen `16ddd22c`]: they render as ordinary property rows. Ours already do [SOURCE: src/views/record-detail-panel.ts:604-609], and `054`'s ADR-003 keeps formulas, rollups and calculations out of adoption entirely.

**Gated formats (F4.5) — keep ours.** Notion's format list is a plain selectable list [screen `1589e7c8`]. Ours disables non-applicable formats with a reason instead of omitting them [SOURCE: src/views/record-surface/type-picker.ts:37-72]. That is our own a11y ruling and the digest gives no reason to soften it.

## 9. Comments and the Phone Record Sheet (P6)

**Comments (F5.1) — inventory only.** Notion's comment evidence is three distinct UIs, not variants of one: a page-level thread anchored under the title with react/resolve/overflow rows [screen `1da73ef6`], an inline composer anchored beside a text selection [screens `92c51f39`, `39835a00`], and a dedicated "All discussions" side panel grouped by day [screen `388a29da`], with file attachments as cards [screen `37450ee`] and a reply/reaction badge on rows [screen `2c1900c8`]. The record page also carries "Add a comment…" as its own zone below the properties [screens `16ddd22c`, `bf2171ff`]. We have no comments surface on the record files at all (grep, zero tokens), and neither `054` nor `051` claims one. The digest warns that a future packet must decide up front whether it means the page-level thread, the inline composer, the discussions panel, or some combination — not "comments" as one undifferentiated feature. The single actionable residue for this surface: the comment zone's placement grammar is the same as our note-body zone [SOURCE: styles.css:10482-10490], so a future comments entry point should reuse it. **Guidance, not a task.**

**Phone record sheet (F5.2) — our deepest already-have.** The sheet already ships the ruled grammar: a 44px row floor [SOURCE: styles.css:10362-10381], flush rows with a faint hairline [SOURCE: styles.css:10404-10412], a fixed 96px label column [SOURCE: styles.css:10417-10430], a 50svh sheet floor [SOURCE: styles.css:10351-10360], chrome that does not scroll with a dedicated scroll region [SOURCE: styles.css:10335-10350], and drag-to-dismiss with keyboard-inset behaviour. Notion's phone record pages [screens `16ddd22c`, `bf2171ff`] show the same macro-structure — title, property list, add row, comment zone — with "Empty" placeholders (rejected, F2.1) and plain-text add rows (adopted direction, F2.6). **The phone sheet's remaining deltas are the property-row items of §6, not new phone work.** One threshold note: the phone value size is pinned at `--db-font-lg` for the iOS input-zoom floor [SOURCE: styles.css:10432-10437], so F2.2's desktop change must not propagate to the phone arm.

## 10. Verification Surfaces (Q5)

**Lane-verifiable — DOM or computed-style observable in existing constructed scenarios, or a unit test:** F2.1's empty prompts, F2.2's computed label size, F2.4's option split, F4.1's picker label carry, F2.6's add-row placement, and, if approved, F3.2's eye toggle and count and F1.2's featured line. Each red-first check is named with its finding.

**Operator-device-only:** everything cover-related **if** a record-level cover is ever adopted — the reposition drag is a touch gesture [screen `bfddb457`] and the icon-over-cover overlap is a phone-layout claim [screen `ab313e42`] — plus the standing operator device reads the program already owes (`051`/`056`/`057` rows and `054`'s final operator criterion). **No candidate in ranks 1-5 needs a device read to prove its mechanism.**

## 11. Recommendations

Sized to this program's leg conventions: one leg, one consumer group; `styles.css` serialized across legs; red-first thresholds; the repository gates per landing.

- **Leg A — empty copy and type size.** F2.1 board delegation, F2.1 format extension, F2.2 desktop label size. One recapture cycle covers the record sheet and the board card; the negative controls are the restored word and the unequalised label. Depends on nothing, and unblocks the operator's AC-004 read.
- **Leg B — option split.** F2.4, pointing the record sheet's and board card's option branches at `renderOptionValue`. Same two consumer groups as Leg A but a different primitive; sequenced after A so the capture baselines settle once.
- **Leg C — add-property surface.** F4.1's wiring fix (two lines plus a unit test) and F2.6's trailing row (new DOM on the sheet, needs a constructed scenario and a capture entry).
- **Leg D — operator-gated, not schedulable without a ruling.** F3.1/F3.2/F3.3 hidden-group enrichment, F1.2 featured line, F1.3 cover ownership. Each carries its threshold and red-first check above, so a ruling converts directly into a task row.
- **Zero-code.** F1.4's display-mode vocabulary in docs and labels.

## Eliminated Alternatives

| Approach | Reason eliminated | Evidence | Iteration(s) |
|---|---|---|---|
| Adopt Notion's universal "Empty" word | Directly against the landed A3 direction (format-specific prompts). Notion agreeing with our pre-fix state is not grounds to revert or pause a rollout. | screens `16ddd22c`, `bf2171ff`; `design-trueup.md` §A3; `notion-screens-digest.md` §5(1) | 1, 2 |
| Add a hover-only ghost-button layer to the header (`+ Add icon / + Add cover / + Add description`) | Our header is never unset — the title always renders — so the affordance would never show. Notion's screen exists because its header *is* unset by default. | screen `56e2ae1a`; F1.6 | 1 |
| Re-open `058` ADR-002 (title picker location) on this harvest | The digest's picker evidence is about property-format and cover pickers, not a title-field picker. The closest screen weakly supports reachability, which `058` D4 already provides. (Inference.) | screen `9484e185`; `058/goal.md` §1 D6 | 1 |
| Fold a record-level cover system into this refinement phase | New feature sized like the icon picker times upload/reposition/alt-text states; the AI tab is excluded by D6; no Anytype cover evidence in the bounded sources; ownership sits with `051` D8. (Inference.) | screens `18d621d0`, `bfddb457`, `9d90280d`, `b5352c94`; `notion-screens-digest.md` §4 P5 row | 1 |
| "Fix" the phone label column toward Notion's free-flowing rows | Notion carries no cross-row column alignment. Our `flex: 0 0 96px` is the Anytype iOS model A2 ruled to keep — an established value beats a neighbouring measurement of a different population. | `design-trueup.md` §A2 "Mobile label column"; styles.css:10417-10430 | 2 |
| Take a Notion-measured font-size ratio for F2.2 | The digest explicitly declines to supply one; no screen in the sample measures a ratio precisely enough. The threshold stays A2's equal-size rule. | `notion-screens-digest.md` §4 P1 row 3 | 2 |
| Rebuild the hidden group into two always-rendered labelled sections | The conditional single-group shape is A4's ruled outcome and matches Notion's own conditional Hidden section. A two-section panel re-opens a settled shape for no captured gain. | `design-trueup.md` §A4; F3.4; screens `9867cb76`, `cc8b241a` | 3 |
| Fold a "Deleted properties" tier into the group | Unowned property-deletion lifecycle this file group does not own; desktop-only in the sample; possible collision with `045`'s card-hiding mechanism; no captured user cost for its absence. | screens `01cde7f6`, `7ffa073f`; `notion-screens-digest.md` §6 second bullet | 3 |
| Add a name field above the picker's search (adopt P4's order) | Reorders A5's ruled grammar for a benefit F4.1 delivers without the reorder. | screen `1589e7c8`; `design-trueup.md` §A5; `notion-screens-digest.md` §5(3) | 4 |
| Adopt AI Autofill suggestion chips | Excluded by `054/goal.md` D6, which keeps AI-generated anything out. | screen `1589e7c8`; `054/goal.md` D6 | 4 |
| Build the template-style bordered relation card | One template's surface in the sample; no general evidence. | screens `ec0eb4a9`, `263196dd` | 4 |
| Soften the type picker's gated formats to Notion's plain list | Ours disables non-applicable formats with a reason rather than omitting them — our own a11y ruling, on `row-menu.ts`'s precedent. The digest gives no reason to soften it. | `src/views/record-surface/type-picker.ts:37-72`; screen `1589e7c8` | 4 |
| Treat P8's "···" page menu as this packet's work | Menu chrome belongs to `051`/`052`; `054/goal.md` D8 confirms the split. | screen `9484e185`; `notion-screens-digest.md` §4 P8 row | 1 |
| Scope a comments feature from this research | Unowned, and Notion's evidence is three distinct UIs. A future packet must scope which one before any task exists. | screens `1da73ef6`, `92c51f39`, `388a29da`; `notion-screens-digest.md` §4 P6 row, §6 third bullet | 5 |

## Divergence Map

| Pivot | What the research tested | Final disposition |
|---|---|---|
| Header → property rows | Whether P5/P7's header system carries a change outranking the row work | Saturated. F1.2 is Anytype-ruled and operator-gated; F1.3 is unowned; F1.4 is zero-code. Nothing in the header slice outranks §6. |
| Property rows → hidden group | Whether the row primitives were fully consumed on both surfaces | Retained as the highest-value branch. Produced F2.1's board-card gap and F2.4's zero consumers, neither visible in the digest or the true-up. |
| Hidden group → add property | Whether A4's closed ruling covers the affordances Notion carries | Retained as an operator branch. F3.1's population split is new evidence; F3.2 is an extension a closed ruling does not cover, not a contradiction of one. |
| Add property → comments and phone | Whether the picker's ruled grammar hides a concrete defect | Retained. F4.1 turned a stylistic observation into one test-pinned change without touching A5. |
| Comments and phone → consolidation | Whether any digest pattern remained undispositioned | Closed. Every P-pattern has exactly one disposition: improve, already-have, conflict-lost, device-only, or unowned. |

No divergent-mode pivot was invoked: the run used `convergenceMode: default` with `stopPolicy: max-iterations`, so `findings-registry.json` records no `divergence` block. This map documents the focus progression the five iterations actually took, and it documents breadth — it is not a claim that the topic converged.

## 12. Open Questions

Three are operator decisions, one is a verification gap:

- **Hidden-group population.** Should the record sheet's group include view-hidden columns beside empties, and should the table peek's group include empties? Today one label names two populations and neither is Notion's. Needs a ruling before any leg (F3.1).
- **Per-row eye in the hidden group.** A4 ruled the group's shape and never ruled on per-row affordances. Adopting Notion's eye plus "Show all" is an extension of a closed ruling and needs an operator call (F3.2).
- **Record-level cover and icon ownership.** Which packet owns it, and is it wanted at all? `051`'s D8 shell question precedes the content question (F1.3).
- **UNKNOWN — title-row checkbox state.** `checkboxDisabled` exists on the row options [SOURCE: src/views/record-surface/property-row.ts:355], but whether the title row already disables its checkbox was never verified. A one-line check the next time a column-manager leg runs (F3.6).

Two inherited unknowns are the digest's, not this loop's: screen `d9d61160`'s low-confidence crop, and the absence of any Notion per-format value-editor comparison in this harvest — the digest states a differently-targeted query set would be needed.

## 13. Confidence and Limitations

Confidence is **high** for every local code fact: the board-card empty path, the zero consumers of `renderOptionValue`, the picker's dropped query, the two hidden-group populations, and the CSS line ranges were all read directly in this worktree.

Confidence is **high** for the Notion facts *as digest claims* and **medium** for them as Notion behaviour: the loop could not open images and took the digest at its word, as dispatched. Where the digest itself marks a reading as eyeballed or low-confidence, that mark is carried forward rather than smoothed away.

Confidence is **low** for any copy this synthesis proposes minting — the verb+noun empty prompts for `date`, `datetime`, `currency`, `text` and `files` are an inference from A3's shape, with no capture behind them.

This is one lineage and one model. Its rankings are one opinion; the ADRs it feeds are proposals for the operator, not rulings.

## 14. Validation Matrix

| Candidate | Proof form | Red-first check that fails today |
|---|---|---|
| F2.1 board delegation | Render assertion on the board-card scenario | The empty `select` row reads "Empty" [SOURCE: src/views/board-renderer.ts:731] |
| F2.1 format extension | Render assertion on record-detail and board-card scenarios | "Empty" renders for `number`/`date`/`text` where an editor exists |
| F2.2 label size | Computed-style assertion, ADR-005's precedent | Label and value computed `font-size` differ in the record-detail scenario |
| F2.4 option split | Render assertion plus contrast check | Both single- and multi-select render `.status-badge` fills [SOURCE: src/views/record-surface/property-row.ts:79-84] |
| F4.1 picker name carry | Unit test over the picker wiring or the modal's `initialLabel` path | Typing "Due Date" and selecting `date` yields an empty-label Date column |
| F2.6 trailing add row | Render assertion plus 44px touch-target read | Zero add affordances on the record sheet [SOURCE: src/views/record-detail-panel.ts:41-46] |
| F3.2 per-row eye (gated) | Render assertion plus persist round-trip | Zero eye controls inside `db-record-detail-hidden-group` |
| F1.2 featured line (gated) | Render assertion, single-line clamp, `--text-muted` | Zero `featured` tokens in the record-surface files |

## 15. Traceability and Acceptance

Artifacts: five iteration narratives [`lineages/glm-openrouter-record/iterations/iteration-001.md` … `iteration-005.md`], five delta records [`lineages/glm-openrouter-record/deltas/iter-001.jsonl` … `iter-005.jsonl`], the lineage state log and its own synthesis [`lineages/glm-openrouter-record/research.md`], the merged registry [`findings-registry.json`, 27 findings], the fan-out attribution table [`fanout-attribution.md`], the merged resource map [`resource-map.md`], and this document.

Acceptance for the child phase this research opens: every criterion cites a Notion screen id and a `file:line`; every non-gated criterion carries a threshold and a red-first check that is red today; every Notion-vs-Anytype tension has an ADR with a named winner; and no operator-gated item is scheduled as a task before its ruling lands.

## 16. References

**Local code:** `src/views/record-surface/property-row.ts`, `record-header.ts`, `hidden-properties.ts`, `add-property-row.ts`, `type-picker.ts`, `cell-editor-relation.ts`, `icon-picker-popover.ts`; `src/views/record-detail-panel.ts`, `table-record-peek.ts`, `board-renderer.ts`, `column-manager-renderer.ts`, `database-view.ts`; `src/i18n.ts`; root `styles.css`. Line ranges are carried per finding above.

**Notion evidence:** `specs/005-component-surface-system/054-record-and-relation-surfaces/notion-screens-digest.md` — the only permitted source of Notion facts, cited by screen id throughout.

**Design record:** `054/design-trueup.md` (§A1-§A5), `054/goal.md` (§3, §5, D6, D8), `054/decision-record.md` (ADR-003, ADR-004, ADR-005, ADR-007), `058/goal.md` (D4, D6), `specs/005-component-surface-system/design-system.md`, `specs/005-component-surface-system/roadmap.md` (§6A rulings; rows 3, 4, 33, 40).

`resource-map.md` was generated by the reducer from the lineage deltas and records the delta sources; it carries no per-file inventory for this run.

## 17. Convergence Report

- Stop reason: **maxIterationsReached** — `stopPolicy: max-iterations` made convergence telemetry only and forbade early synthesis.
- Total iterations: 5 of 5 (`minIterations` 3).
- Questions answered: 6 / 6 (Q1-Q6).
- Remaining questions: 0 research questions; 3 operator decisions and 1 verification gap are recorded in §12.
- Last 3 iteration summaries: run 3 — hidden properties and the two Properties destinations (0.70); run 4 — add property, relation and rollup (0.65); run 5 — comments, phone sheet and consolidation (0.45).
- Convergence threshold: `0.05`; ratios `0.80, 0.75, 0.70, 0.65, 0.45` — the loop never reached the threshold and was stopped by the iteration cap, as dispatched.
- Divergence summary: no divergent pivots recorded (`convergenceMode: default`); the focus progression is in the Divergence Map.
- Findings: 27 merged from 1 lineage; 14 eliminated alternatives preserved in the required table.
- Source diversity: every finding pairs a digest screen id with a `file:line`; the three strongest (F2.1, F3.1, F4.1) rest on source reads the digest did not carry.
- Merge note: the lineage registry used the non-canonical key `findings`; `fanout-merge.cjs` coerced 27 entries to `keyFindings` and recorded the mismatch in `findings-registry.json`.
- Timestamp note: `orchestration-summary.json` records 6 timestamp anomalies in the lineage state log (executor-local clock offset, `+02:00` wall time against the pool's UTC window). Ordering within the log is intact; no artifact content depends on the offset.
