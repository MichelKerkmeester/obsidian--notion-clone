---
title: "Implementation Summary: Notion Table Refinement"
description: "All four legs landed: the five guards, per-column freeze, the date range/type-set/handle/vertical-lines/peek/add-row-noun batch, and the harness/capture/gate close. AC-001 through AC-008 are Met; AC-009 is the operator's device read."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/062-notion-table-refinement"
    last_updated_at: "2026-09-07T09:10:00Z"
    last_updated_by: "defect-closure-session"
    recent_action: "Closed six recorded defects and the missing AC harness rows (Leg 5)"
    next_safe_action: "AC-009 (the operator's device read) is the only remaining open row"
    blockers:
      - "T033 is the operator's device read"
    key_files:
      - "specs/005-component-surface-system/062-notion-table-refinement/goal.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/research/research.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/notion-screens-digest.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-062-impl"
      parent_session_id: null
    completion_pct: 95
    open_questions:
      - "A type-picker row ahead of its data type"
    answered_questions:
      - "The research's second-ranked item landed on main at 41513bd3 and 1a2c7e00 and is not carried"
      - "The digest's two second-hand line citations are exact; a third and fourth registry exist"
      - "The frozen divider in dark theme: themed per surface, measured 3.21:1 dark / 1.83:1 light"
      - "The add-row noun source: a per-view configured string, fallback today's 'New'"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Packet** | `005-component-surface-system/062-notion-table-refinement` |
| **Level** | 3 |
| **Status** | In Progress — AC-001 through AC-008 Met, AC-009 Unmet (operator device read) |
| **Tree at opening** | `94f03c88` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Leg 1 — guards.** Five permanent assertions added to `tools/live/render-assertion-harness.ts` /
`tools/live/render-assertions.mjs`: the footer's zero-row skip plus its 44px `.is-phone` floor, the
header's icon/label/aria-sort/multi-sort-ordinal composition, the inline chip container's
`display`/`gap`, per-option pill colour computed-style distinctness, and the conditional-format
tint's `td` paint. Each was observed red under the named control (removing the guarded behaviour)
before being trusted, then restored green — see Verification below for the exact commands run per
row. One pre-existing guard (`table-renderer-footer-visibility.test.ts`) already covered the
zero-row-skip row-count half; this leg's own addition is the 44px phone floor and the four other
rows that had no coverage anywhere in the tree.

**Leg 2 — freeze.** `ViewConfig.frozenColumnKeys`, a `freezeColumn`/`isColumnFrozen` pair on
`ColumnMenuActions` with a checked menu row beside Wrap, and a sticky `th`/`td` implementation in
`TableRenderer` — offsets computed once per render (`computeFrozenLayout`), applied per cell
(`applyFrozenCellStyle`), with a `scroll`-listener-driven `is-scrolled-x` class gating a soft
right-edge shadow that paints only once the table has scrolled sideways. Desktop-only via
`:not(.is-phone)` in the CSS. A stale `frozenColumnKeys` entry is simply never visited by the offset
loop, which is what keeps it inert rather than fatal. Round-tripped through
`DataSource.parseDatabaseConfig`/`toViewPayload` with a new unit test.

**Leg 3 — quality of life.** A date-range end value under a derived companion frontmatter key
(`col.key + "::end"`), a new "End date" row in the date editor's popover, and
`formatDateRangeDisplay` (an existing utility) wired into `renderDate`. Eight new `ColumnDef` types
(`url`, `email`, `phone`, `person`, `created-time`, `created-by`, `last-edited-time`,
`last-edited-by`) across all four registries (`types.ts`, `type-picker.ts`'s `PROPERTY_TYPES`,
`property-type-icon.ts`'s icon map, `column-types.ts`'s label map), with the grouped submenu's slice
boundaries moved from 6/9 to 10/13 — Basic now ends at Person, Advanced now includes the four audit
types. Person's and the two "by" audit types' vault value source is ADR-008 (new, Accepted): Person
reuses the existing link-mode text renderer/editor verbatim; created-by/last-edited-by are a
frontmatter passthrough, read-only. A visible resize-handle line on `th:hover`
(`--interactive-accent`). A `showVerticalLines` view field gating a `db-no-vertical-lines` class
that removes only the right border. A muted empty-property placeholder in the docked peek
(`.db-record-peek-field-value-empty`, distinct from the table cell's intentionally-blank
`.db-empty-value`). A per-view `addRowNoun` field, a text row for it in the view-settings panel, and
`toolbar.newNoun` framing in all three locales.

**Leg 4 — harness, captures, gate.** Two new capture scenarios (`table-frozen-column`,
`table-vertical-lines-off`), registered in the same change that creates the states, both opened and
read in both themes and both devices. A full recapture (596 entries, `verify.mjs` exit 0); 24
pre-existing captures moved bytes but not `pixelHash`/`layoutHash` (encoder noise) and were restored
to their committed bytes. `styles.css`'s CSS lane taken over from `058-card-title-and-title-formats`
and released back with the 8 content-changed captures named. Eight stale evidence artefacts
(`cascade-audit`, `checkbox-appearance`, `checkbox-inventory`, `design-conformance`,
`engine-parity`, `surface-census`, `token-census`, `view-census`) re-measured against the moved
`styles.css`/`table-record-peek.ts`. `npm run gate`: 26/26 green.

**Leg 5 — the six recorded defects, closed at the source.** A second pass over the landed packet,
fixing what the independent landing verification recorded rather than absorbed:

1. **The dark-theme frozen-column shadow was invisible.** Themed per surface instead of through
   Obsidian's own (undefined) shadow token: light keeps `rgba(0,0,0,0.25)`, dark switches to
   `rgba(255,255,255,0.35)` — lightening instead of darkening, the only direction with room to move
   against a surface this dark. Measured by a new WCAG-contrast pass in `render-assertions.mjs`
   (alpha-composited over `--db-surface-canvas`, computed in Node since `box-shadow` is a paint
   effect `getComputedStyle` cannot hand back as a resolved pixel): **green** 1.83:1 light /
   3.21:1 dark, plus a "nothing at rest" assertion (`scrollLeft === 0` paints no shadow) in both
   themes. Its own negative control is the shipped defect, not a removed shadow: reverting the dark
   token to the light literal takes the dark leg to **1.08:1**, under the 1.15:1 floor, and the pass
   goes red naming it — the light leg was never the defect and reads 1.83:1 on either token, which
   is why the floor has to catch the dark leg alone.
2. **`.note-database-container:not(.is-phone)` was inert.** `is-phone` sits on the `body`, an
   ancestor of the container, never on the container itself, so the negation always matched and the
   freeze rules were never actually scoped away from phone. Rewritten to apply unconditionally and
   turn off explicitly under `.is-phone` (`position: static`, `left: auto`, `box-shadow: none`).
   Three of the scenario's four captures moved real pixels and all three are committed:
   `mobile-light` 11,751 of 1,405,392 and `mobile-dark` 4,418 (the `.is-phone` override removing a
   shadow the phone should never have painted), and `desktop-dark` 22,510 (the dark shadow flipping
   from darkening to lightening — luminance 30 → 67 at the frozen edge, against 30 → 26 before).
   Only `desktop-light` is pixel-identical, because the light token is the same
   `rgba(0, 0, 0, 0.25)` literal the old shared fallback resolved to. `pixelHash` cannot separate
   these — it averages a 16×16 grid into 32 buckets, and a 6px blurred band moves a cell's average
   by less than one bucket — so `pixelHash`-identical is NOT a restore signal for this scenario.
3. **Grouped tables never toggled `is-scrolled-x`.** `.db-grouped-table` owns the horizontal
   overflow, not the outer `.note-database-container`, and `scroll` does not bubble — the listener
   bound to the container the way the ungrouped path binds it never fired.
   `setupFrozenScrollTracking` now takes a `scrollTarget`/`classTarget` pair; the grouped call site
   binds the listener to `.db-grouped-table` while keying the class off the container, matching the
   ungrouped path's own convention.
4. **The chip measurer's 560px cap had no assertion.** `column-width.test.ts` now bounds it from
   both sides: a short chip set sizes under the cap, a long one collapses to exactly 560.
5. **The duplicate conditional-tint `td` rule pair was collapsed to one.** The older,
   lower-specificity selector (`tr.db-conditional-format > td:not(.db-conditional-format)`) was
   dead weight next to the newer one that actually won the cascade
   (`tr.db-conditional-format > td:not(.db-cell-selected):not(.db-cell-range-selected)`); removing
   it means a future regression in the live selector now has nothing left to mask it.
6. **The harness rows this packet's own acceptance criteria named as missing were built**: a new
   `table-renderer-freeze-and-switches.test.ts` drives the real `TableRenderer` against a mock DOM
   for the frozen `left`/unfreeze control, both scroll-listener paths, the vertical-lines gate and
   the add-row noun; `date-time-format.test.ts` covers `formatDateRangeDisplay`'s ordinary and three
   malformed cases plus `getDateEndFieldKey`; `cell-renderer-wrap.test.ts` and
   `table-record-peek.test.ts` each gained a case pinning their own half of the empty-value pair;
   `render-assertions.mjs`'s new frozen-column CSS pass also reads the resize handle's hover
   background in both themes.

Two further defects outside the six, named in the original brief rather than `goal.md`'s own list:
the dead `cell.auditReadonly` i18n key (present in `en`, `zh-CN` and `zh-TW`, referenced nowhere in
`src/`) was removed from all three; and `created-time`/`last-edited-time` cells switched from the
date-only formatter to `formatDateTimeValueDisplay` — the vault's own `ctime`/`mtime` carry a time
component (`parseDateTimeParts` already derives it for a numeric millisecond timestamp), and the
date-only display was silently dropping it. No decision-record entry was needed for this one: the
formatter already existed, so this was a fix rather than an open operator question.

### Files Changed

| File | Change |
|------|--------|
| `src/data/types.ts` | `ColumnDef["type"]` +8 members; `ViewConfig.frozenColumnKeys`/`showVerticalLines`/`addRowNoun` |
| `src/data/column-types.ts` | `COLUMN_TYPE_LABELS`, `isColumnType`, `isAuditColumnType` (new), `getDateEndFieldKey` (new) |
| `src/data/data-source.ts` | Parse/serialize + `legacyViewKeys` for the three new `ViewConfig` fields |
| `src/views/table-renderer.ts` | Frozen-layout computation/application, scroll tracking, vertical-lines class, add-row noun label |
| `src/views/cell-renderer.ts` | Render/edit dispatch for the 8 new types; date-range display; audit-type read-only guards |
| `src/views/column-menu.ts` | Freeze menu row; submenu slice boundaries |
| `src/views/database-view.ts` | `freezeColumn`/`isColumnFrozen` actions wired into `ColumnMenu` |
| `src/views/property-type-icon.ts` | 4 new icon defs (`user`, `world`, `mail`, `phone`); 8 new name-map entries |
| `src/views/record-surface/type-picker.ts` | `PROPERTY_TYPES` reordered to 21, grouped |
| `src/views/record-surface/cell-editor-date.ts` | End-date row + its own commit/validation path |
| `src/views/table-record-peek.ts` | Empty-property placeholder |
| `src/views/view-config-panel-renderer.ts` | Add-row-noun text field |
| `src/i18n.ts` | New keys across all three locales (columnType.\*, menu.freezeColumn, toolbar.newNoun, viewConfig.addRowNoun, date.\*, undo.\*); dead `cell.auditReadonly` key removed from all three (Leg 5) |
| `styles.css` | Freeze sticky/shadow, vertical-lines gate, resize-handle hover, peek-empty-value color |
| `tools/live/render-assertion-harness.ts` | 5 guard functions; `tableFooterEmpty`/`tableSortRules`/`tableHeaderNoop` scenario fields |
| `tools/live/render-assertions.mjs` | `TABLE_GUARD_SCENARIOS`, `__footerFloor`, guard reporting sections |
| `tools/screenshots/scenarios/core.mjs` | Two new scenarios |
| `tools/lane/css-lane.json` | Acquire + release entries for this phase |
| `src/data/data-source.test.ts`, `src/views/record-surface/type-picker.test.ts` | New/updated unit coverage |
| `screenshots/manifest.json`, 8 new PNGs under `screenshots/notion-clone/views/` | Recapture |
| Evidence artefacts (8 files under `tools/live/*.json`) | Re-measured against the moved tree |
| `src/views/cell-renderer.ts` (Leg 5) | `created-time`/`last-edited-time` now render through `formatDateTimeValueDisplay`, not the date-only formatter |
| `styles.css` (Leg 5) | Themed `--db-frozen-col-shadow`; `.is-phone` freeze/shadow reset; duplicate conditional-tint `td` rule removed |
| `src/views/table-renderer.ts` (Leg 5) | `setupFrozenScrollTracking(scrollTarget, classTarget?)`; grouped call site binds to `.db-grouped-table` |
| `tools/live/render-assertions.mjs` (Leg 5) | Frozen-column CSS pass: WCAG contrast, nothing-at-rest, `.is-phone` reset, resize-handle hover, in both themes |
| `src/views/table-renderer-freeze-and-switches.test.ts` (new) | Frozen `left`/unfreeze, both scroll-listener paths, vertical-lines gate, add-row noun |
| `src/data/date-time-format.test.ts` (new) | `formatDateRangeDisplay`'s ordinary and three malformed cases; `getDateEndFieldKey` |
| `src/views/cell-renderer-wrap.test.ts`, `src/views/table-record-peek.test.ts` (Leg 5) | The empty-value pair, one case per surface |
| `src/views/column-width.test.ts` (Leg 5) | The 560px chip-measurer cap, both sides |
| `tools/lane/css-lane.json` (Leg 5) | Release entry at the post-fix hash, naming the one real content-changed capture |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

A three-stage pipeline the parent's D15 defines. A **Sonnet digest** of the Notion table captures
was written to `../053-toolbar-and-view-controls/notion-screens-digest.md` — 98 screen ids, twelve
patterns, a divergence table and an Anytype cross-read — because GLM 5.3 flash cannot read images
and a capture reaches the loop as measured prose or not at all. Then `/deep:research:auto`, **five
iterations**, `--stop-policy=max-iterations`, lineage `glm-devpass-table` on
`llmgateway/glm-5.3-flash` at `reasoningEffort: max`, producing 26 merged findings. Then this Opus
synthesis, which re-verified every red against the tree rather than carrying the loop's report.

**The kit's `create.sh --phase --parent` form could not be used and the reason is recorded** rather
than worked around silently: it allocates the next child number after the highest existing one,
which is `067`, so it would have produced `068`. `062` is reserved and may not be renumbered. The
packet was therefore built from the contract-backed templates directly, which is the fallback `053`
recorded when the same script misparsed in a worktree.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | The title column keeps our disabled-row menu convention | Accepted |
| ADR-002 | The wrap phase is superseded; the resolution rule the research quoted is stale | Accepted |
| ADR-003 | Conditional row colour gets its own view-settings row; the work is `064`'s | **Accepted 2026-09-06 18:32** |
| ADR-004 | Every new colour derives from our tokens and clears the bar in both themes | Accepted |
| ADR-005 | Freeze is desktop-only; the divider is a soft right-edge shadow once scrolled past | **Accepted 2026-09-06 18:32** |
| ADR-006 | The add-row noun is a per-view configured string, fallback today's "New" | **Accepted 2026-09-06 18:32** |
| ADR-007 | All eight missing Notion types ship as real types; the count is 13 to 21 | **Accepted 2026-09-06 18:32** |

The four operator ADRs were ruled in one pass on **2026-09-06 18:32**, quoted verbatim in
`decision-record.md`. What each supplies: *"Yes, own row in view settings"* (ADR-003), *"Subtle
shadow when scrolled past"* (ADR-005), *"Per-view configured noun, fallback 'New'"* (ADR-006) and
*"All types or add more as needed"* (ADR-007). One question survives them and is an implementation
decision rather than a block: **Person's vault value source**, owed its own ADR before the Person
renderer (T021a).
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0 |
| `npx vitest run` | Exit 0, 147 files / 1600 tests |
| `npm run build` | Exit 0 |
| `node tools/live/sheet-grammar.mjs` | Exit 0 |
| `node tools/live/render-assertions.mjs` | Exit 0 — all 5 Leg-1 guards green as before; the new frozen-column CSS pass green in both themes (contrast 1.83:1 light / 3.21:1 dark, nothing at rest, `.is-phone` reset, resize-handle hover) |
| `npm run screenshots` → `npm run screenshots:verify` | 604 entries; exit 0 |
| `npm run gate` | 26/26 green |
| `node tools/naming/scan-comments.mjs` | Exit 0 — no artifact-id or commented-code violations |
| `node tools/naming/scan-failing-values.mjs` | Exit 0 |
| `node tools/lane/check-lane.mjs` (no `SURFACE_PHASE` needed — baseline now matches) | Exit 0 |
| `node tools/live/evidence.mjs --check-all` | Exit 0 — 15/15 artefacts fresh |

**Leg 5's own red/green pairs** (`render-assertions.mjs`'s frozen-column CSS pass, all four
before/after the fix): shadow contrast **1:1 both themes → 1.83:1 light / 3.21:1 dark**;
`.is-phone` freeze reset **`position: sticky` → `position: static`, shadow painted → `none`**;
grouped `is-scrolled-x` **never toggled → toggles on `.db-grouped-table`'s own `scroll`, not the
outer container's**; chip-measurer cap **unbounded (vitest green with the cap deleted) → bounded
both sides (`column-width.test.ts`)**.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The research is a five-iteration read, not a ten.** `newInfoRatio` fell 0.90 → 0.30 across the
  five passes without reaching the 0.05 convergence threshold, which never bound because the stop
  policy was `max-iterations`. The loop widened by plan rather than by pivot. Two areas are named as
  frontier rather than closed: create-on-type inside a table cell, and the column manager's
  title-eye disabled state.
- **No image was opened at any point in the loop, by construction.** Every Notion claim in this
  packet traces to a screen id in the digest, and the digest's own limits carry through: captures
  are thumbnail-scale so ratios beat absolute pixels, hover state is structurally unobservable, and
  all 102 screens are light theme.
- **The freeze design is inference.** Notion's frozen state appears in no capture; the sticky offset
  and the shadow are ours, and ADR-005 says so rather than citing Notion for them — the operator
  chose the shadow's behaviour on 2026-09-06 18:32, and its colour still derives from our tokens
  under ADR-004 because no capture could supply one.
- **One loose end is recorded and not scheduled.** `.db-numeric-value` is stamped
  (`src/views/cell-renderer.ts:318-321`, `:419`) and no stylesheet rule matches it, so numbers are
  left-aligned by inheritance and at parity by accident. A `text-align: left` assertion would pass
  today for the wrong reason. It belongs to whoever next opens that block.
- **The loop's own environment gap.** `resource-map.md` emission was skipped: `reduce-state.cjs`
  refused the path because `.opencode/` is a symlink into a different repository, so `REPO_ROOT`
  resolved there and this worktree was absent from that repo's worktree list. Non-blocking by
  contract, and an environment issue rather than a research finding — recorded because the same
  symlink is what made the create script unusable above.
- **AC-009 is not this implementation's to close.** Operator-owned by design; nothing here ticks it.
- **Column auto-fit width for `created-time`/`last-edited-time` is not tuned.** Both hosts'
  `getColumnDisplayText` (used for the auto-fit-column measurement, not for rendering) fall through
  to a `row.frontmatter[col.key]` read for these two types, which is always empty since the value
  comes from `row.file.stat` instead. Auto-fit sizes the column to its header alone rather than to a
  formatted date — a cosmetic gap, not a rendering defect (the cell itself renders the correct date;
  only the *width guess* undersizes it), left for whoever next opens that block.
- **The date-range end value has no dedicated clear affordance.** Clearing it means deleting all
  three segment fields by hand; there is no "×" button next to the End date row the way some other
  pickers in this surface offer. Functionally complete, ergonomically minimal.
- **The `Show vertical lines` switch has no exposed UI toggle.** T023's own file list is
  `src/data/types.ts` and `styles.css` only — the config field and the render-time CSS gate exist
  and are guarded, but no reader can set `showVerticalLines: false` from the app today short of
  editing the stored view config directly. Matches the task's stated scope; flagged here so it is
  not mistaken for a finished end-to-end feature.
- **The pre-existing duplicate CSS declaration named above is now closed (Leg 5).** The older,
  lower-specificity `tr.db-conditional-format > td:not(.db-conditional-format)` rule was removed;
  only `tr.db-conditional-format > td:not(.db-cell-selected):not(.db-cell-range-selected)` remains,
  so the guard now catches a single-rule regression instead of being masked by the duplicate.
<!-- /ANCHOR:limitations -->
