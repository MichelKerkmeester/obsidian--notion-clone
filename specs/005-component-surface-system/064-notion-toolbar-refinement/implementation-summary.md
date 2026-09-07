---
title: "Implementation Summary: Notion Toolbar Refinement"
description: "What landed: a delete-view toast (no confirm — an existing undo path already covered it), a filter zero-rule entry tier, three searchable dropdowns, a collapse rung, a chip-rail add control, and a conditional-colour view-settings row. All 26 gate lanes green; the operator's device row is the one criterion left open."
trigger_phrases:
  - "064 implementation summary"
  - "notion toolbar refinement summary"
  - "what shipped"
  - "validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/064-notion-toolbar-refinement"
    last_updated_at: "2026-09-07T00:00:00Z"
    last_updated_by: "implementation-session"
    recent_action: "Implemented all six code REQs; 26 gate lanes green"
    next_safe_action: "AC-011 rides 053 AC-111 — only the operator's device sitting closes it"
    blockers:
      - "AC-011 is the operator's and rides 053 AC-111; nothing here can close it"
    key_files:
      - "src/views/database-view.ts"
      - "src/views/toolbar-renderer.ts"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/sort-panel-renderer.ts"
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
      - "tools/live/sheet-rebuild-harness.ts"
      - "tools/live/sheet-rebuild.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-064-summary"
      parent_session_id: null
    completion_pct: 92
    open_questions: []
    answered_questions:
      - "ADR-005's persistence-layer read: a deleted view is already recoverable through the generic config-history undo path every other view mutation already takes — Branch B applies, no confirm was built"
      - "The zero-rule entry tier's height genuinely exceeds the one-row tree it collapses into on the first pick, which the sheet-rebuild lane's stability check needed to learn to tell apart from the historical re-entrance-replay bug it exists to catch"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 064-notion-toolbar-refinement |
| **Completed** | Implemented — the operator's device row (AC-011) is the one criterion left open |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Six changes, each closing a red measured on this tree first.

1. **A view can no longer be destroyed without the operator being told, and can be undone.**
   `deleteView` (`database-view.ts:3445`) already saves through the same generic
   `saveCurrentViewConfigInBackground` → `saveViewEntryConfig` → `recordConfigHistory` path every
   other view mutation in this class takes, and that path already pushes an undoable `"config"`
   history entry the toolbar's own persistent Undo action and Ctrl+Z already read. Reading the
   persistence layer first, as ADR-005 required, found this: **a deleted view is already
   recoverable by an existing undo path**, so Branch B applies and no confirm was built. `deleteView`
   now labels the history entry (`undo.deleteViewConfig`) and raises a toast naming the deleted view
   with an Undo action — the same config-history-plus-toast shape `migrateGalleryViewOnOpen`
   already ships, adapted from an automatic migration to an operator-initiated delete. Both
   toolbar call sites are unchanged; the toast lives once, in the shared implementation.
2. **The first filter rule costs one click from an empty panel.** The zero-rule branch of
   `filter-panel-renderer.ts` now renders a searchable flat property list (reusing the dropdown
   primitive's own `db-dropdown-search`/`db-dropdown-options` classes and the shared
   `filterPickerRows` search filter, so it mints no new CSS) with a distinct "+ Add advanced
   filter" footer beneath it. Picking a property creates the first leaf through the existing
   `createDefaultFilterRule`/`appendLeaf` path and lands on the untouched tree. A panel already
   holding a rule renders through the identical, unmoved tree-branch code.
3. **Three condition dropdowns search when the list is long.** `searchable: true` reaches the
   filter field dropdown, the select/status value dropdown and the sort field dropdown — the gate
   itself (phone: more than 8 options; desktop: always) already lived inside the primitive and was
   untouched.
4. **The New button's label collapses before any control is dropped.** One rung, added at the head
   of `applyToolbarChromeCollapse`, hides the label span before the landed `[newCluster, query,
   props, add]` order runs; the order itself is unmoved. The rung is visual only — the button's
   `aria-label` is untouched at every width.
5. **The chip rail can add the next rule from the rail.** One `db-active-control-add` control per
   rule group (sort, filter), present exactly when that group has rendered at all — the zero-chip
   case is the control — wired to the same panel-toggle actions the toolbar's own filter/sort
   buttons use. Reuses the landed 28px chip pitch and 11%/17% tints.
6. **Conditional row colour has its own named view-settings row.** A fourth summary row beside
   Properties/Filters/Sorts, reading `config.conditionalFormats.length`, carrying an explainer, and
   opening the existing conditional-formatting section on click rather than building a second one.
   Reuses the already-shipped `db-view-config-row-clickable` class, so this leg needed no
   `styles.css` edit despite the file being named in scope.

REQ-006 (per-group visibility) was **not built** — ADR-007 declined it, 2026-09-07, verbatim
*"Groups panel only"*; the axis stays `059`'s to write.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/database-view.ts` | Modify | `deleteView` labels its history entry and raises the Undo toast (REQ-001); wires `addFilter`/`addSort` to `toggleHeaderPopover` (REQ-005). Follow-up: `deleteView` now passes the deleted view's own id through an explicit mutation override, so undo restores the selected tab along with the view (AC-001, was T015's recorded gap) |
| `src/views/toolbar-renderer.ts` | Modify | Collapse rung ahead of the cluster ladder (REQ-004); the New label span gained a class for the sweep to read; the two `deleteView` call sites are unchanged |
| `src/views/filter-panel-renderer.ts` | Modify | Zero-rule entry tier (REQ-002); `searchable: true` on two dropdowns (REQ-003) |
| `src/views/sort-panel-renderer.ts` | Modify | `searchable: true` on the field dropdown (REQ-003) |
| `src/views/active-view-controls-renderer.ts` | Modify | Optional `addFilter`/`addSort` actions and the per-group `db-active-control-add` control (REQ-005) |
| `src/views/view-config-panel-renderer.ts` | Modify | Fourth conditional-colour summary row, opening the existing section (REQ-009) |
| `src/i18n.ts` | Modify | Six new English keys: `undo.deleteViewConfig`, `notice.deletedView`, `panel.addAdvancedFilter`, `toolbar.noConditionalColors`, `viewConfig.conditionalColor`, `viewConfig.conditionalColorHint` |
| `styles.css` | Modify | One class, `.db-active-control-add` (REQ-005), at the landed chip pitch and tints. No other new selector — the entry tier and the conditional-colour row both reuse shipped classes. Follow-up: `.is-phone .db-toast-action` gains a 46px min-width/min-height, closing T016(c) |
| `tools/live/toolbar-collapse-sweep.ts` | Modify | `newLabelVisible`/`newButtonAriaLabel` readings (REQ-004) |
| `tools/live/run-toolbar-collapse-sweep.mjs` | Modify | Direct assertions for the label-ahead-of-ladder, non-vacuous and aria-stable checks |
| `tools/live/sheet-rebuild-harness.ts` | Modify | Widened a stale `/condition/i` button-finder to also match the entry tier's "advanced filter" wording (two call sites) |
| `tools/live/sheet-rebuild.mjs` | Modify | The "holds still while it rebuilds" check now detects a replayed entrance (top reaches the viewport floor) rather than any downward movement, so a legitimate content-driven resize is no longer mistaken for the historical re-entrance bug |
| `tools/live/render-assertion-harness.ts` | Modify | Follow-up: the `active-view-controls` scenario's actions bag now supplies `addFilter`/`addSort`, and `chipRailAssertions` checks each present rule group carries its own add control — closes T016(b) |
| `tools/live/touch-targets.mjs` | Modify | Follow-up: `RAISED` list gains a `db-toast-action` entry at the 44px floor — closes T016(c) |
| `tools/live/touch-targets-baseline.json` | Modify | Follow-up: fixture ceiling 186 → 185, since `db-toast-action` now clears its own named floor instead of sitting in the generic under-28px count |
| `tools/lane/css-lane.json` | Modify | Acquired, edited, released — zero captures carried this packet's content at the landing. Follow-up: two further release cycles, one for T016(b)'s add control (2 captures named) and one for T016(c)'s toast fix (an `edit` entry plus a `release` naming 4 captures) |
| `src/views/database-view.test.ts` | Modify | New "DatabaseView deleteView" suite (2 cases); harness gained a second-view fixture and an `activeDocument.querySelectorAll` stub. Follow-up: a third case proving undo restores the selected tab, and the harness exposes `currentViewIndex` |
| `src/views/toolbar-renderer.test.ts` | Modify | Pins that neither delete-view call site gained a confirm primitive |
| `src/views/view-config-panel-renderer.test.ts` | Modify | New conditional-colour summary-row suite (3 cases) |
| `src/views/filter-panel-renderer.test.ts` | New | Entry-tier and searchable-dropdown assertions (7 cases at the landing). Follow-up: the entry-tier assertions now mount the real renderer and drive a click, closing T016(a)'s named `addFirstLeaf` gap; still 7 cases |
| `src/views/sort-panel-renderer.test.ts` | New | Searchable-dropdown assertions (2 cases at the landing). Follow-up: mounts the real renderer with `createDropdownField` mocked, reading which call received `searchable: true`; still 2 cases |
| `src/views/active-view-controls-renderer.test.ts` | New | Chip-rail add-control assertions (3 cases at the landing). Follow-up: mounts the real renderer and drives the add control's click through to `actions.addFilter`/`actions.addSort` (4 cases) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Each requirement landed as its own change against its own file group, in the order `tasks.md`
lays out: the two red-first probes (T001) and the inventories (T002) before any fix, the CSS lane
acquired (T003) before the one `styles.css` edit, then the six requirement legs (T004-T008, T014),
REQ-006 settled Waived with no code (T009), the record re-verified (T010), and the three
verification legs (T011-T013) — the last of which, the operator's device sitting, is not this
agent's to close.

ADR-005's read (T004) determined the confirm this packet opened with was never going to be built:
the persistence layer already makes a deleted view recoverable, so the leg is an Undo toast
consuming the existing config-history mechanism, not a new confirm surface. Every other leg matched
its plan without a branch decision.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| ADR-005's read found Branch B, not Branch A | `deleteView` already routes through the generic config-history save path every other mutation here uses, and that path already made the deletion undoable before this leg touched anything. Building a confirm anyway would have added friction a device already didn't need |
| The toast lives in `deleteView`, not at the two toolbar call sites | One owner per shared primitive (`053` D8's rule, applied to this new case): both call sites still just call `actions.deleteView(index)` unchanged, and the toast is the shared implementation's job |
| The entry tier and the conditional-colour row reuse existing classes rather than inventing new ones | D7: no new CSS value is minted. `db-dropdown-search`/`db-dropdown-options`/`db-menu-item` and `db-view-config-row-clickable` already carried the exact shapes needed |
| The zero-rule branch's own "+ Add advanced filter" footer is a separate control from the tree's "+ Add condition" button, not a relabeling of it | The tree's button is the negative control (AC-005) — it had to stay byte-identical, so it moved into the `else` block unedited rather than being merged with the new footer |
| `sheet-rebuild`'s stability check was corrected, not routed around | The check's own assumption — adding a rule only ever grows the sheet — predates a feature where the zero-rule state is genuinely taller than the first rule it collapses into. The fix teaches the check to detect the actual historical failure (a replayed entrance reaching the viewport floor) instead of widening a tolerance or skipping the case |
| REQ-006 stays Waived | ADR-007, Declined 2026-09-07: per-group visibility is `059`'s Groups panel's to build; this packet's popover keeps its existing switch and gains no eye toggle |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit **0** |
| `npm run build` | Exit **0** (`main.js` regenerated) |
| `npx vitest run` | Exit **0** — **149 files, 1600 tests** on the rebased tree (146 / 1557 before it; the difference is main's own landings). Follow-up: **1602 tests** (2 new cases: the `addFirstLeaf`-mutant click test, the undo-selection test) |
| `node tools/live/sheet-grammar.mjs` | Exit **0** |
| `node tools/live/render-assertions.mjs` | Exit **0**. Follow-up: still exit **0** with `chipRailAssertions`'s new add-control check |
| `node tools/live/touch-targets.mjs` | Follow-up: Exit **0** — fixture baseline 185 (was 186), constructed baseline 810 (unchanged); red-proved by reverting the `.db-toast-action` CSS alone (`30x15, under its named 44px floor`) |
| `node tools/naming/scan-comments.mjs` | Exit **0** — no artifact ids, comment grammar intact |
| `node tools/naming/scan-failing-values.mjs` | Exit **0** |
| `npm run gate` | Exit **0** — **26 green, 0 red for a declared reason**, read twice on the rebased tree; the first run was RED on `evidence` alone (8 of 15 artefacts still describing the pre-rebase tree) and was cleared by re-running each artefact's own tool. Includes `toolbar-collapse` (red in T001, green after T007) and `sheet-rebuild` (three scoped fixes, `tasks.md` T011). Follow-up: read again after the `.db-toast-action` `styles.css` edit moved its hash — RED on `evidence` alone again (8 of 15 artefacts, the same 8 that read `styles.css` as an input), cleared the same way; **26 green** on the re-run |
| `npm run screenshots` + `npm run screenshots:verify` | Full recapture (**604 entries**) on the rebased tree; exit **0**. Zero captures carry this packet's content — **4** moved bytes at identical pixelHash/layoutHash (rerun jitter) and were restored to committed bytes, with the manifest's `bytes` fields reconciled to them. Follow-up: two further full recaptures. T016(b)'s: 2 captures carry real content (`constructed-active-view-controls-desktop-{dark,light}`), 2 are byte-identical mobile pixelHash matches with a `layoutHash`-only move, 5 further captures are rerun jitter, restored. T016(c)'s: 2 further captures carry real content (`chrome-toast-success-mobile-{dark,light}`), 6 are rerun jitter, restored |
| `node tools/lane/check-lane.mjs` | Follow-up: exit **0** after each of the two release cycles above — `"release names all 2 changed capture(s)"`, then `"release names all 4 changed capture(s)"` |
| Mutation testing, one per new surface | Every mutation red except one: the entry tier's per-row property binding survives its suite. `tasks.md` T015, gap in T016(a). Follow-up: closed — the mutant (`addFirstLeaf(columns[0].key)` for `addFirstLeaf(col.key)`) now fails `filter-panel-renderer.test.ts` |
| Captures opened and read | `constructed-toolbar-{desktop,mobile}-{dark,light}` and `chrome-toast-success-{desktop,mobile}-{dark,light}`. Follow-up: `constructed-active-view-controls-desktop-{dark,light}` (twice, across both release cycles) and `chrome-toast-success-mobile-{dark,light}` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The operator's device row (AC-011) is open.** Icon-only rail discoverability on a phone, the
   entry tier inside the phone filter sheet, the delete confirm as a stacked sheet (moot now that
   Branch B builds a toast instead — the phone-toast presentation is what actually wants a device
   read), and tabs against the view switcher. These ride `053` AC-111 and nothing in this
   repository can answer them.
2. **AC-003 is Superseded, not Met.** It was written for Branch A's phone-confirm presentation;
   Branch A never ships, so the criterion's own precondition is never reached. This is recorded as
   a supersession citing ADR-005 rather than a pass, so a later reader does not mistake "never
   applicable" for "verified."
3. **The `sheet-rebuild` re-basing was wrong once and is now measured.** The leg's first
   correction tested for the viewport's own floor and did **not** catch the failure mode it named:
   with the entrance replay reintroduced, the filter sheet bottomed out at 836 on an 844px screen,
   because this sheet floats 8px off the bottom, so `>= 840` read the replay as held. The landed
   check measures against the deeper of the two resting positions — the opening top and the
   rebuilt top — which catches the replay (836 against a 626 floor) and still allows the
   legitimate 100px content change (626 against the same floor). Both directions were observed;
   `tasks.md` T011 carries the numbers. It is still a loosening of a shared, cross-packet lane
   relative to the original downward-only rule, made because that rule was already false for a
   shipped feature.
4. **Engine-parity's Chrome/WebKit sub-pixel disagreements are pre-existing and unrelated.**
   Re-running `tools/live/engine-parity.mjs` to refresh its staleness stamp (a step `evidence.mjs`
   required once `styles.css` moved) surfaced 44 elements disagreeing across engines — none of them
   in a surface this packet touched (add-view-popover, dropdown-field, calendar widgets, the base
   import modal). Recorded rather than silently absorbed; not investigated further as out of scope.
   `engine-parity` is not a `gate.mjs` row — only its artefact's freshness is gated — so its
   non-zero exit does not enter the 26.
5. ~~**The Undo does not restore the selected tab.**~~ **RESOLVED by a follow-up.** Measured at
   the landing: deleting the selected view and pressing the toast's Undo brought the view and its
   whole config back, and left the selection on the neighbour the delete had moved it to. Fixed by
   passing the deleted view's own id through an explicit mutation override to
   `saveCurrentViewConfigInBackground`, rather than letting `recordConfigHistory` fall back to
   `this.getConfig()?.id` — the *current* view's id, read after `currentViewIndex` had already
   moved. Proven with a new case in `src/views/database-view.test.ts`, red-proved against the
   reverted capture.
6. ~~**Three of this packet's five suites are source greps.**~~ **RESOLVED by a follow-up.**
   `filter-panel-renderer.test.ts`, `sort-panel-renderer.test.ts` and
   `active-view-controls-renderer.test.ts` now mount real DOM on a hand-built tree, matching
   `view-config-panel-renderer.test.ts`'s own idiom; the named mutant
   (`addFirstLeaf(columns[0].key)` for `addFirstLeaf(col.key)`) now fails the first suite. The
   chip-rail add control's missing capture and `.db-toast-action`'s 29x14 px tap target are also
   resolved — `render-assertion-harness.ts` now supplies `addFilter`/`addSort` to the one capture
   that mounts the real rail, and `.is-phone .db-toast-action` carries a 46px min-width/min-height
   with a matching `RAISED` entry in `tools/live/touch-targets.mjs`. Full evidence: `tasks.md`
   T016.
<!-- /ANCHOR:limitations -->

---
