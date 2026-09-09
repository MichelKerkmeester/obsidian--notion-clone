---
title: "Feature Specification: Phase 7: Settings Sheet Strict Notion Alignment"
description: "Close the operator's 0.0.36 report that the phone Settings sheet still has bad UI and needs strict alignment with Notion's own database-settings sheet, after 002 already redesigned it once on the Notion row grammar."
trigger_phrases:
  - "071 phase 7"
  - "settings sheet strict alignment"
  - "0.0.36 settings sheet still bad"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Phase 7: Settings Sheet Strict Notion Alignment

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The operator reports, verbatim (iOS, 0.0.36, 2026-09-09 ~20:38): *"Settings sheet still has bad ui
overall and needs strict alignment with notion sheets."* `002-settings-sheet` already redesigned
this sheet once against a Notion-shaped row grammar (single-line compact rows, 44-52px pitch, 16px
section insets, sheet-native pickers) and landed+verified — the operator's own device recheck (D3
of `071/goal.md`) is what this report answers, and it says the redesign did not go far enough.
Read against a real Notion database-settings capture found for this packet
(`screenshots/notion/ios/flows/database-settings/`), the gap is structural, not cosmetic: Notion
renders its Settings sheet as **two or three separate rounded card groups on a neutral canvas**,
each card holding its own rows, with a visible gap between cards and a section label sitting above
its own card. Our sheet renders **one continuous flat list** — rows share a single background,
separated only by hairlines and a plain section-title line. That single structural fact is the most
plausible reason a redesigned-and-passing sheet still reads as "bad ui overall" on a device: the
row-level grammar converged in `002`, but the sheet's overall silhouette never did.

**Key Decisions**: This phase does not redesign row-internal grammar that `002`/`004` already
converged (pitch, dividers, sheet-native pickers) — it adds the card-grouping shell Notion's own
sheet visibly has and ours does not. Where a Notion pixel number cannot be read off the only local
capture (a 299x678px Mobbin thumbnail, no native-resolution asset), the target stays `TBD` rather
than invented, per the same discipline `002` decision D-005 already established.

**Critical Dependencies**: `002-settings-sheet`'s row grammar (unchanged, regression-checked);
the reference captures inventoried in §13 below.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft — scaffolded, not implemented |
| **Created** | 2026-09-09 |
| **Branch** | `worktrees/268-settings-sheet-strict` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `071-sheet-notion-anytype-alignment` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 7** of the Sheet family alignment to Notion x Anytype specification — a strict
follow-on to Phase 2, opened because the operator's device recheck of Phase 2's landing (071/goal.md
D3) found the redesign insufficient.

**Scope Boundary**: The phone Settings sheet's overall card/grouping shell only (the sheet reached
from the view's gear/settings affordance, `src/views/database-view.ts:5169`,
`view-config-panel-renderer.ts` / `mobile-bottom-sheet.ts`) — not its row-internal grammar (pitch,
dividers, control types), which `002` already converged and this phase regression-checks rather
than re-designs. The desktop settings panel is out of scope (`roadmap.md` §4 row 57 owns it
elsewhere).

**Dependencies**: `002-settings-sheet`'s landed row grammar; the reference inventory in §13.

**Deliverables**:
- A gap table (§13) naming every measurable shell property, our current value, Notion's reference
  reading (measured where the asset allows, `TBD` where it does not), and a numeric or structural
  target
- A task list a GLM 5.3 flash implementation leg can execute write-first, RED before GREEN, against
  the sheet-grammar lane

**Changelog**:
- When this phase closes, add an entry to `../changelog/` named `071-007-settings-sheet-strict-alignment.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The phone Settings sheet's card/grouping shell never matched Notion's own grouped-card
presentation, even after `002-settings-sheet` closed every row-level defect the operator's earlier
report (row 74, `roadmap.md` §4) named or implied — the lane still proves those numbers today (§8
Risks records the regression check). The operator's 0.0.36 report is a second whole-surface
judgement on the same sheet, in the same pattern as the calendar's gestalt reopening (`057`,
`roadmap.md` §4 row 63): a measured-green surface can still read wrong as a whole, and only the
operator's own reading settles that (D3). Reading the sheet against a Notion database-settings
capture this packet located (§13) surfaces a real, previously unexamined structural gap: Notion
groups its settings rows into separate rounded cards on a neutral canvas; our sheet is one
continuous list on one background. `002`'s own gap table (its §13) recorded the Notion reference
row counts but did not open the specific flow captures that show this — the card shell was never
compared.

### Purpose
The Settings sheet's overall shell — card grouping, canvas-vs-card background contrast, and
section-label placement — matches Notion's own database-settings sheet as closely as the plugin's
token ladder allows, without regressing any row-internal grammar `002`/`004` already converged, and
the operator's whole-surface judgement is answered with a before/after comparison against a named
reference rather than another point fix.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The Settings sheet's card/grouping shell: canvas background, per-group card background and
  radius, inter-card gap, section-label placement relative to its card
- Regression-checking `002`'s row-internal grammar (pitch, dividers, sheet-native pickers) under
  the new card wrapper
- Recapturing the sheet phone-only, light and dark, and recording a before/after

### Out of Scope
- Row-internal grammar `002`/`004` already converged (pitch, divider inset, control types) —
  touched only if the card wrapper regresses it
- The desktop settings panel (`roadmap.md` §4 row 57)
- The shared `createSheetHeader` builder's title alignment and close-button affordance — Notion's
  sheet centers its title and carries no visible close button, but `createSheetHeader` is shared by
  every phone sheet in the app; changing it here would widen this phase's blast radius past one
  sheet. Recorded as REQ-006, Proposed only, pending an explicit operator ruling (§7, §12)

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/views/view-config-panel-renderer.ts` | Modify | Wrap each section's rows in a card container element — a producer change, since CSS alone cannot introduce a new box around an existing flat DOM sequence |
| `styles.css` | Modify | Card background/radius/gap tokens, canvas background, section-label-above-card placement |
| `tools/live/sheet-grammar.mjs` | Modify | Card-grouping and footer-card lane assertions (RED before GREEN) |
| `src/views/view-config-sheet-row-grammar.test.ts` | Modify | Revert-proof unit test for the new card-wrapper class |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Read this scaffold's reference inventory (§13) before any implementation work starts |
| REQ-002 | The sheet's rows render inside ≥2 visually distinct rounded card groups on a neutral canvas background, each card's background token distinct from the canvas, replacing today's single continuous flat list |
| REQ-003 | No regression on `002`'s row-internal grammar (44-52px pitch, 16px section inset, 1px hairline dividers, 0 native `<select>` elements, no horizontal overflow at 402px) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | Section labels render above their own card rather than as a hairline-prefixed inline label inside one continuous list |
| REQ-005 | Any sheet-level action rows (e.g. a footer-style row set, if the renderer has one) render inside their own trailing card, separated from the property-setting cards — or this requirement is recorded N/A if no such rows exist on this sheet today (do not fabricate rows to satisfy it) |
| REQ-007 | Recapture the Settings sheet phone-only, light and dark, and record a measured before/after against §13's gap table |

### P2 - Proposed, pending operator ruling

| ID | Requirement |
|----|-------------|
| REQ-006 | Center the sheet title and consider dropping the explicit close button in favor of handle-only dismissal, matching Notion's header — held Proposed because `createSheetHeader` (`mobile-bottom-sheet.ts:212`) is the shared header builder for every phone sheet in the app, and either change there is a whole-app change, not a Settings-sheet-only one |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A side-by-side capture shows the redesigned Settings sheet's card shell converged on
  Notion's grouped-card silhouette (structurally measured — card count, background contrast,
  visible inter-card gap — not merely eyeballed)
- **SC-002**: No regression on `002`'s row-grammar and overflow lane assertions
- **SC-003**: The operator's own device re-read of the Settings sheet reports it aligned (D3 — no
  agent ticks this row)
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The only local Notion reference asset is a 299x678px Mobbin thumbnail (confirmed via `sips -g pixelWidth -g pixelHeight`); it carries no native-resolution numbers | A pixel-exact card-radius/gap/inset target cannot be measured, only estimated | Target those three numeric cells `TBD` in §13; Task 1 asks the operator for a full-resolution device capture to replace them (never invent a number, per `002` D-005) |
| Risk | The card wrapper is a producer (DOM) change, unlike `002`'s CSS-only scope (its D-001) | Wider blast radius than a stylesheet-only redesign; risks regressing `002`'s row grammar if the new wrapper changes row layout context | Wrap only the existing row sequence in a non-semantic container; keep every row-internal class and CSS selector `002`/`004` already contracted on unchanged; regression-check (REQ-003) before closing |
| Dependency | `002-settings-sheet`'s landed row grammar | Card wrapper must not disturb it | Regression check is REQ-003, verified by rerunning `002`'s own lane assertions unchanged |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. NON-FUNCTIONAL REQUIREMENTS

- The card wrapper must not change any row's touch-target size, pitch, or the sheet's 90svH height
  cap — it is a background/grouping change, not a density change.

## 8. EDGE CASES

- A view with only one settings section (no "Data source settings" split) still renders inside a
  single card — REQ-002's "≥2 groups" only applies when the underlying data has ≥2 sections; a
  one-section view is not a defect.
- The keyboard-open state (a stacked dropdown/date-picker child sheet) must not be affected by the
  card wrapper — it is a sibling stacked sheet, not a descendant of the settings sheet's own DOM.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | Low-Medium | One producer file, one stylesheet region, one lane file, one unit test |
| Risk | Medium | Producer (DOM) change, unlike `002`'s CSS-only precedent; regression risk on `002`'s converged row grammar |
| Research | Low | Reference inventory and current-state measurement both complete in this scaffold |

## 10. RISK MATRIX

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Card wrapper regresses `002`'s row pitch/divider assertions | Low | Medium | REQ-003 regression check before closing; RED-first task order (tasks.md T002-T003 before T004-T005) |
| Numeric card-radius/gap targets stay unmeasured | Medium | Low | Structural assertion (REQ-002) does not require the exact number; Task 1 requests the operator capture separately |

## 11. USER STORIES

- As the operator, I want the Settings sheet to look like Notion's own grouped-card settings
  surface, not a single scrolling list, so the "bad ui overall" judgement has a named, closeable
  target instead of repeating on the next device pass

## 12. OPEN QUESTIONS

- Does the operator want REQ-006's header change (centered title, handle-only dismissal) applied
  app-wide, per-sheet, or not at all — it cannot be decided inside this phase's Settings-sheet-only
  scope
- Can the operator supply a full-resolution Notion iOS database-settings screenshot from their own
  device, to replace §13's `TBD` numeric cells with measured ones (Task 1)
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`
- **Predecessor**: `../002-settings-sheet/`
- **Depends on**: `../002-settings-sheet/` (row grammar, unchanged)

---

<!-- ANCHOR:gap-table -->
## 13. GAP TABLE — Settings sheet shell vs Notion's database-settings sheet

**Reference inventory (evidence, not invention).** The Notion capture that actually shows this
sheet: `screenshots/notion/ios/flows/database-settings/notion-ios-flow-database-settings-0{2,3,4,5}-*.webp`
(Mobbin flow "Database settings", cited `screenshots/notion/README.md` lines 780-784) — a database
view's "Settings" bottom sheet, opened from the view's own controls. Viewed directly (this harness
can view `.webp`/`.png` images; confirmed by opening all four). Native resolution: **299x678px**
(`sips -g pixelWidth -g pixelHeight`, confirmed on `-02-52348672…`), a Mobbin marketing thumbnail,
not a device-native capture — no dimension metadata exists in `screenshots/notion/ios/harvest.json`
(confirmed: `grep` for the screen id returns `image_url`/`mobbin_url` only, no width/height key).
**`002`'s own gap table cited `notion/ios/settings` (24) and `notion/web/settings` (51) but those
are the *account-level* Settings pages** (`notion-ios-settings-settings-*.webp` — Password,
Passkeys, Theme, Subscription; confirmed by viewing `notion-ios-settings-settings-01-*.webp`), a
different surface from the per-database "Settings" bottom sheet this phase's Settings sheet
actually corresponds to. `anytype/mobile/sheets/anytype-mobile-sheet-view-edit-{dark,light}.png`
(1206x2622px, native device resolution, confirmed) is Anytype's nearest equivalent (its per-view
"Edit view" sheet) and is carried below as contrast, not as the target — the operator's report
names Notion specifically, and `goal.md` D15 makes Anytype the default only for the board and the
calendar, not for sheets.

Numbers in the Current column are measured by the sheet-grammar lane
(`node tools/live/sheet-grammar.mjs`) and by reading `styles.css` directly. Numbers in the Notion
column are `TBD` wherever the 299x678px thumbnail cannot support a pixel claim; where the structure
is visible regardless of resolution (grouping, presence/absence of a control, alignment), it is
recorded as observed structure, not a derived number.

| Property | Current (ours, measured) | Notion (ref, observed/measured) | Target |
|---|---|---|---|
| Row pitch | 44-52px band, measured 48.0px (`SETTINGS_ROW_PITCH_MIN/MAX_PX`, `sheet-grammar.mjs`) | TBD (thumbnail too low-res for a pixel reading); rows read touch-comfortable, consistent with iOS's 44pt row convention | **No change** — already converged by `002`; regression-checked (REQ-003), not re-targeted |
| Side inset (card-to-edge) | 16px (`--obnotion-sheet-inset`, applied to rows/section titles directly, no card wrapper) | Cards visibly inset from the screen edge with a margin; exact px TBD | Keep the existing 16px `--obnotion-sheet-inset` as the card's own margin from the sheet edge — no reference number to override it with |
| Header height / shape | No fixed height; `.obnotion-panel-header` is `flex, align-items:center, justify-content:space-between`; title left-anchored (`obnotion-panel-title` is the header's first child, close button its last) | Title centered, bold, no visible close button in the bottom-sheet capture (only the drag handle) | **No change in this phase** (REQ-006, Proposed) — `createSheetHeader` is shared by every phone sheet; a header-shape change here is out of this phase's scope |
| Title type | 16px / weight 600 (`--obnotion-font-lg` / `--obnotion-font-lg-weight`, confirmed in `styles.css`) | Bold, visually larger than row text; exact size TBD | No change (tied to REQ-006, Proposed) |
| Section label style | 12px / weight 700, plain text, `border-top: 1px solid` hairline before it (not first-of-type), sits inline inside the one continuous row list (`.obnotion-view-config-section-title`, `styles.css:12003-12016`, `12416-12420`) | Plain gray label ("Data source settings") sitting **above its own card**, not attached to an inline hairline inside a shared list | Section label renders above its own card container; no inline top-hairline once the card wrapper exists (REQ-004) |
| Card grouping / background layers | **None** — one continuous flat list; `.obnotion-panel-row` has no persistent background (only `:hover`, confirmed `styles.css:13495-13514`); the whole sheet paints one background | **Present** — rows partition into 2-3 separate rounded white/elevated cards on a neutral gray canvas, a visible gap between cards (viewed directly in all 4 flow captures) | ≥2 rounded card groups on a distinct canvas background, visible gap between cards (REQ-002) — the central structural gap this phase closes |
| Divider inset (within a card/list) | 1px hairline, 16px inset left / 0px right (asymmetric, `styles.css:12234-12247`, D-004 fallback `#333333`) | Rows within one card separated by a thin hairline; exact inset TBD (appears to start near the row's label, not full-bleed, but not measurable at this resolution) | **No change** — regression-checked (REQ-003), not re-targeted; the exact Notion inset stays TBD pending Task 1's operator capture |
| Control type per row | 0 native `<select>` elements; sheet-native dropdown/checkbox/switch components (`SETTINGS_ROW_GRAMMAR` assertion, confirmed passing) | Chevron-disclosure (`>`) for drill-in rows, plain text (no chevron) for a direct action ("Copy link to view"), grayed/disabled text for a read-only row ("Source") — no native pickers visible | **Already converged** — no action needed; recorded for completeness |
| Footer / actions | None distinct — no separate footer-style row set exists in `view-config-panel-renderer.ts` today (grep-confirmed: no "delete view" / "duplicate view" / destructive-row producer) | A third card, separated by a gap, holding "Open as full page" / "Manage data sources" / "Lock database" | REQ-005, recorded **N/A for this sheet's current row set** — no footer-style rows exist to move into a trailing card; do not fabricate them |
| Close affordance | Explicit 44x44 `x` button, top-right, plus swipe-down via the handle (`mobile-bottom-sheet.ts:212-227`, `styles.css:12298-12303`) | No visible close button in the bottom-sheet capture; dismissal reads as handle/swipe-only | **No change in this phase** (REQ-006, Proposed) — shared header builder, out of scope here |
| Corner radius (cards) | N/A today (no card exists); `--obnotion-radius-lg` = 8px is the token available if a card is introduced | Visibly rounded cards; exact radius TBD | Use the existing `--obnotion-radius-lg` (8px) token as the starting value; revise only if Task 1's operator capture measures a different reference radius |
| Top handle | Present, handle-to-title gap measured 14.4px (`sheet-grammar.mjs`, passing `≤50px`) | Present, small centered gray pill | **Already converged** — no action needed |
<!-- /ANCHOR:gap-table -->
