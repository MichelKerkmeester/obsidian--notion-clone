---
title: "Feature Specification: Mobile Name Column and New-Button Reach"
description: "Three device-confirmed phone defects that survived the 011 mobile auto-fit work: the title/name column collapses to a minimum while every value column hugs its content, the record-open affordance still shows a text label that eats the name column, and the floating New button lands under Obsidian's phone footer nav bar and cannot be tapped."
trigger_phrases:
  - "mobile name column and fab"
  - "title column too narrow on phone"
  - "name column truncates mobile auto-fit"
  - "open text label eats title column width"
  - "floating new button unreachable under nav bar"
  - "fab hidden behind obsidian mobile navbar"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/012-mobile-name-column-and-fab"
    last_updated_at: "2026-08-29T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Fixed three phone defects; all gates green"
    next_safe_action: "Confirm on device"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-012"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Mobile Name Column and New-Button Reach

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `011-mobile-table-and-panel-ux`, successor none.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 012-mobile-name-column-and-fab |
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | Complete |
| **Created** | 2026-08-29 |
| **Branch** | `impl` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Phase 011 gave the phone its own table layout: on `body.is-phone` the table switches to `table-layout: auto` (`styles.css:4508`) so every column hugs its content instead of keeping desktop fixed widths. Three defects survived that work, all confirmed on the operator's real device.

1. **The title/name column is too narrow while every other column is correct.** Under `table-layout: auto` a column's width is decided by the intrinsic width of its content. The value cells are intrinsically sized (nowrap badges and text), so they hug their content. The title cell is not: its link is `.db-title-cell a { width: 100%; max-width: 100% }` (`styles.css:5380`) wrapped in `.db-file-title-inline { overflow: hidden }` (`5395`). A `width: 100%` element inside an `overflow: hidden` box contributes essentially no intrinsic width, so the auto algorithm collapses the name column to its minimum while the value columns keep theirs. Names read "20 • Au", "Adobe Creati…". This is specific to the title cell because it is the only column whose content declares its own width instead of being sized by it.

2. **The record-open affordance shows a text label that eats the name column.** `attachTitleOpenAffordance` built the button with `button.textContent = t("panel.open")` (`table-record-peek.ts:78` pre-fix). The button is absolutely positioned at the cell's right edge and is always visible on touch (`styles.css:18115`), so on a phone the "Open" word sits over the already-narrow name. The sibling `record-detail-panel.ts:225` already renders its equivalent open control as an icon via `setIcon(openBtn, "maximize-2")` — the affordance just never adopted that form here.

3. **The floating New button is unreachable on a phone.** On touch the toolbar renders the New button as a fixed FAB, `.db-new-button-primary.is-mobile-fab { position: fixed; inset-block-end: calc(20px + env(safe-area-inset-bottom)) }` (`styles.css:18985` pre-fix). That offset reserves the home-indicator safe area but not the height of Obsidian's phone footer navigation bar, which overlays the viewport bottom. The FAB renders beneath the bar and cannot be tapped. The codebase already measures that bar elsewhere: `popover-position.ts:272` queries `.mobile-navbar` and subtracts its height plus `--safe-area-inset-bottom` when clamping popover bounds.

### Purpose
Finish the phone table so the name column sizes to its content like every other column with a sensible mobile floor and a cap; make the open affordance a compact icon on touch so its width goes to the note name; and lift the floating New button clear of both the safe-area inset and Obsidian's measured footer nav bar. Key strictly off `is-phone` for mobile layout and off pointer capability only where that is the real question; leave desktop untouched.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Title column sizing (phone)**: `.is-phone .note-database-container td.db-title-cell a` gets `width: max-content; min-width: 128px; max-width: 60vw` so the name column's intrinsic width reaches the auto-layout algorithm, floored for a short name and capped for a very long one (`styles.css:18153`).
- **Open-affordance clearance (phone)**: `.is-phone .note-database-container td.db-record-open-host` gets `padding-right: 32px` so the always-visible affordance does not sit over the note name (`styles.css:18161`).
- **Open affordance as icon (touch)**: `attachTitleOpenAffordance` renders `setIcon(button, "maximize-2")` with a `db-record-open-btn-icon` marker class on touch, keeping the `aria-label`; desktop keeps the text label since it appears only on hover (`table-record-peek.ts:83-90`). Icon sizing at `styles.css:18137`.
- **FAB nav-bar clearance (phone)**: the FAB's `inset-block-end` adds `var(--db-mobile-navbar-height, 0px)` on top of the safe-area inset (`styles.css:18988`); `ToolbarRenderer.reserveMobileFabInset` measures `.mobile-navbar` (default 50px, 0 off the phone) and publishes it via `setCssProps` on the container (`toolbar-renderer.ts:2239`).
- **Reproduction**: the `table-mobile` scenario now renders the real title cell (`db-title-cell` → link → `db-file-title-inline` → `db-file-title-name`) plus the icon affordance, so it exercises the collapse and its fix (`core.mjs`).
- **Coverage**: a `table-record-peek.test.ts` case asserting the touch icon path (icon set, aria-label kept, no text label).

### Out of Scope
- **Desktop layout** — every layout rule is `is-phone`-scoped; the desktop title cell keeps `width: 100%` under `table-layout: fixed`, which is correct there.
- **The FAB when there is no nav bar** (tablet, narrow desktop split) — `reserveMobileFabInset` publishes 0 off `is-phone`, so those surfaces are unchanged.
- **The 60vw cap being a hard ellipsis ceiling** — as recorded in 011, Chrome does not always honour `max-width` on a table-cell in auto layout; the real bound is intrinsic content, capped best-effort, with horizontal scroll as the fallback.
- Note frontmatter / markdown writes, telemetry, new dependencies.

### Files to Change

| File Path | Change Type | Description |
|---|---|---|
| `styles.css` | Modify | Phone title-cell sizing + affordance padding, touch icon-button sizing, FAB nav-bar term |
| `src/views/table-record-peek.ts` | Modify | Touch open affordance as a `maximize-2` icon, desktop keeps the text label |
| `src/views/toolbar-renderer.ts` | Modify | `reserveMobileFabInset` — measure the phone nav bar, publish `--db-mobile-navbar-height` |
| `src/views/table-record-peek.test.ts` | Modify | Complete the obsidian mock (`Platform`, `setIcon`); add the touch icon-path test |
| `tools/screenshots/scenarios/core.mjs` | Modify | `table-mobile` renders the real title cell + icon affordance |
| `screenshots/**` | Regenerate | Recaptured PNGs + `manifest.json` + `README.md` |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | The name column sizes to its content on the phone like every value column | `.is-phone .note-database-container td.db-title-cell a` declares `width: max-content`, a `min-width` floor and a `max-width` cap; in `table-mobile-mobile-*.png` "Adobe Creative Cloud" and "Google Workspace" render in full and only the deliberately-overlong name is capped. |
| REQ-002 | The record-open affordance does not consume the name column on touch | On touch the button carries `db-record-open-btn-icon` and a `maximize-2` icon (not the `panel.open` text), keeps its `aria-label`; the touch title cell reserves `padding-right` so the name is not clipped under it. |
| REQ-003 | The floating New button is tappable on a phone | The FAB `inset-block-end` adds `var(--db-mobile-navbar-height, 0px)`; `reserveMobileFabInset` sets that property from the measured `.mobile-navbar` height (default 50px) on the phone and 0 elsewhere, via `setCssProps`. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-004 | The desktop title cell and open label are unchanged | Every title/affordance rule is `is-phone`-scoped; on desktop `isTouchDevice` is false so the text label path runs and the hover-only button is unchanged. |
| REQ-005 | The fix is reproduced and guarded | `table-mobile` carries the real title-cell DOM + icon affordance; `table-record-peek.test.ts` asserts the touch icon path; the fixture class guard passes (no invented `.db-*`). |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: On the phone the name column hugs its content with a floor and a cap; no name reads as truncated to a few characters while its neighbours are full.
- **SC-002**: On the phone the open affordance is a compact icon that leaves the name column its width, and stays announced through its `aria-label`.
- **SC-003**: On the phone the floating New button sits above Obsidian's footer nav bar and the home-indicator inset, and can be tapped.
- **SC-004**: Desktop table, title cell, hover open label and toolbar New button are visually unchanged.
- **SC-005**: Display-only: zero writes to note frontmatter or bodies, no telemetry, no new dependency.

### Acceptance Scenarios

- **Scenario 1**: **Given** the table on a phone with names of varied length, **when** it renders, **then** each name column hugs its content up to the cap and the value columns are unchanged.
- **Scenario 2**: **Given** a table row on a phone, **when** the open affordance shows, **then** it is a maximize icon, not the word "Open", and the name is not hidden underneath it.
- **Scenario 3**: **Given** a database view on a phone, **when** the New button renders, **then** it floats above the footer nav bar and is tappable.
- **Scenario 4**: **Given** any of these on desktop, **when** it renders, **then** it is unchanged because every rule is `is-phone`-scoped and the icon path is touch-only.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | `max-width: 60vw` on the title link is best-effort in auto layout | A pathological single name is wide-but-finite | Accepted and documented (carried over from 011): the real bound is intrinsic content; the table scrolls horizontally. Confirmed in `table-mobile-mobile-*.png` where the overlong name is capped and ellipsised. |
| Risk | `.mobile-navbar` measured at toolbar render, not on every orientation change | A stale height after rotation | The bar's height is constant across orientation on a phone; the safe-area term is handled live by `env()`. The measurement re-runs on every toolbar re-render. |
| Risk | 50px fallback when `.mobile-navbar` cannot be measured | Slightly wrong reserve if Obsidian's bar differs | Matches the existing `popover-position.ts` fallback for the same bar; worst case the FAB sits a few px high, still clear of the bar. |
| Dependency | Obsidian's `is-phone` body class and `.mobile-navbar` element | Gate the mobile rules and supply the measured height | Both are Obsidian-owned and already relied on by `popover-position.ts`. |
| Dependency | `setCssProps` for the dynamic custom-property write | Publishes `--db-mobile-navbar-height` | The repo's Obsidian lint rule rejects direct `element.style.*`; `setCssProps` is the sanctioned path and is already used in `table-column-layout-sync.ts`. |
| Dependency | The screenshot harness device matrix (`capture.mjs`) | Applies `is-phone` + 402×874 on the mobile pass | Unchanged; the scenario relies on it rather than declaring the class. |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The title-cell and icon fixes are declarative CSS plus one `setIcon` call; no listeners, timers or observers added.
- **NFR-P02**: `reserveMobileFabInset` does one `querySelector` + one `getBoundingClientRect` per toolbar render, on touch only; no per-frame work.

### Security
- **NFR-S01**: Zero network, telemetry or remote dependency; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: rendering, tapping the icon or the FAB produces 0 writes to note content.
- **NFR-R02**: Theme-safe: no literal colour added; the icon uses the button's existing tokens.
- **NFR-R03**: Desktop-safe: every layout rule is `is-phone`-scoped and the icon path is `isTouchDevice`-gated.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- **A very long single name** (the fixture's "A deliberately long service name that has to truncate"): the name column hugs it up to `60vw`, then ellipsises and the table scrolls; it does not collapse and does not run the layout away.
- **A very short name** ("Zoom"): the `128px` floor keeps the column tappable and the header ("Name") readable rather than collapsing to the word.
- **The title-hidden path** (no visible `file.name` column): the affordance attaches to the first visible column's cell, which also carries `db-record-open-host`, so the icon form and the right padding apply there too.

### Error Scenarios
- **`.mobile-navbar` absent** (not a phone, or Obsidian shell not mounted): `reserveMobileFabInset` publishes 0 off `is-phone` and 50 as the phone fallback; the FAB never lifts on a surface that has no bar.

### State Transitions
- **Toolbar re-render** (`rerenderToolbar`): `reserveMobileFabInset` re-measures and republishes the property; the FAB offset follows.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 9/25 | 3 shipped files (styles.css, table-record-peek.ts, toolbar-renderer.ts) + 1 fixture + 1 test; ~90 LOC; one surface family |
| Risk | 8/25 | No auth/API/breaking change; display-only; the risks are layout-bounding and one measured inset |
| Research | 12/20 | Traced why the title cell is special under `table-layout: auto` and reused the existing nav-bar measurement pattern |
| **Total** | **29/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## OPEN QUESTIONS

**The FAB clearance is proven at the CSS+JS layer, not by a static capture.** The floating New button
is `position: fixed` and its clearance depends on `env(safe-area-inset-bottom)` and a JS-measured
`.mobile-navbar` height. Headless Chrome reports no device insets and the fixture has no Obsidian
shell, so a static screenshot would show the FAB at its base offset whatever the fix. The fix is
verified by the CSS term, the measurement code and the existing `popover-position.ts` precedent for
the same bar. On-device confirmation remains the operator's check.

**The 60vw title cap is best-effort on a table-cell**, as recorded in 011. A hard ellipsis ceiling
would need the cap on an inner wrapper every cell type carries; deferred as a separate change. The
name column is bounded (intrinsic content, floor and cap) and the operator's ask — "size to its
content like the others" — is met, confirmed in `table-mobile-mobile-*.png`.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../011-mobile-table-and-panel-ux/spec.md`](../011-mobile-table-and-panel-ux/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
