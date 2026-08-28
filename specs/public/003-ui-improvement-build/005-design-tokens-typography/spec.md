---
title: "Feature Specification: Design Tokens and Typography"
description: "Comprehensive visual design system: dual-theme status and tag color token system with WCAG AA contrast, base-4 spatial scale tokens, harmonized 5-tier typography scale with Obsidian native font integration, 4-tier border radius hierarchy, calibrated border and grid divider contrast, 3-tier adaptive surface elevation with dark-mode luminance steps, layered emphasis conditional formatting, theme-adaptive chart color palettes, configurable row density tokens, scoped color-scheme policy for native controls and body portals, standardized Obsidian dynamic accent focus rings, consolidated scrollbar tokens with horizontal edge fade masks, and unified interactive state physics."
trigger_phrases:
  - "design tokens and typography"
  - "color tokens"
  - "typography scale"
  - "spacing tokens"
  - "radius hierarchy"
  - "dark light theming"
  - "dual theme status colors"
  - "surface elevation"
  - "row density tokens"
  - "theme adaptive chart palette"
  - "focus ring contrast"
  - "border divider tokens"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/005-design-tokens-typography"
    last_updated_at: "2026-08-28T01:12:27Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled design tokens and typography feature specification"
    next_safe_action: "Proceed to next implementation phase"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-005"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Feature Specification: Design Tokens and Typography

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `004-toolbar-and-view-controls`, successor `006-views-parity-polish`.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-27 |
| **Branch** | `impl` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The visual design system of the Note Database plugin forms the foundational aesthetic and structural substrate across all 7 view layouts (Table, Board, Gallery, List, Calendar, Timeline, Chart), modals, popovers, and drawers. However, the existing CSS codebase (`styles.css:63-156, 4560-4650, 5610-5670, 5890-5980, 16429-16460`) and associated renderer logic suffer from severe contrast failures, arbitrary magic numbers, font clashes, and uncalibrated dark-mode behaviors:
1. **Severe Dark-Mode Contrast Failures Across All 16 Status/Tag Color Tokens (`styles.css:85-116, 132-155, 4563-4578, 5610-5670, 5890-5980`)**: All 16 named status and tag colors (gray, brown, orange, yellow, green, blue, purple, pink, red, slate, cyan, teal, lime, indigo, violet, rose) hardcode dark hex text colors (`#2f6fad`, `#6940a5`, `#4f46e5`, `#0f766e`, etc.) and fixed low-opacity backgrounds (`rgba(..., 0.18)`). The `.theme-dark` block only adjusts `--db-current-time-lightness` (`line 133`) and provides zero dark-mode overrides for status colors, resulting in severe contrast failures (< 3.0:1 on `#1e1e1e` backgrounds, far below WCAG AA 4.5:1 minimums). Furthermore, identical hex codes are duplicated across 5 disconnected CSS rule blocks.
2. **Complete Absence of a Spacing Scale & Reliance on Arbitrary Pixel Values (`styles.css:63-130, 945-964, 4072-4074, 7289-7291`)**: There are zero spacing tokens (`--db-space-*`) declared in `styles.css`. Padding, margins, and gaps use unstandardized magic numbers (`3px`, `5px`, `7px`, `9px`, `10px`, `11px`, `13px`, `15px`, `17px`, `19px`, `23px`, `32px`), producing subtle spatial misalignments between table headers, board cards, filter chips, and modals.
3. **Chaotic Typography Scale & Unreadable Micro-Text (`styles.css:77-81, 127-129, 1077, 1385, 3729, 3754, 12645`)**: Over 180 CSS rules hardcode arbitrary font sizes spanning 16 distinct pixel values (`7px` to `28px`). Sub-11px micro-text (`7px`, `8px`, `9px`, `10px`) is used in badges and order labels, violating accessibility readability standards. In addition, the database title hardcodes a serif font stack (`--db-title-font-family: "Source Serif 4", Georgia, serif`, `line 77`) that clashes with Obsidian's native sans-serif workspace font (`var(--font-interface)`).
4. **Border Radius Fragmentation (`styles.css:74-76, 136-139, 1074, 1382, 1518, 4338, 7098, 15949`)**: Although basic radii are defined (`sm: 4px`, `md: 6px`, `lg: 8px`), over 80 CSS rules bypass them to use ad-hoc values (`1px`, `2px`, `3px`, `5px`, `7px`, `8px 8px 6px 6px`, `10px`, `12px`, `14px`, `16px`, `999px`), fracturing component curvature consistency.
5. **Incoherent Border Opacities & Grid Divider Disparities (`styles.css:83-84, 3929, 4073-4074, 4108-4110, 14258-14259`)**: Table column dividers use `48%` opacity (`line 83`), drilldowns use `78%` (`line 3929`), timeline minor lines use `28%` (`line 14259`), and table row lines use raw `100% var(--background-modifier-border)` (`line 4074`). In dark mode, vertical column borders vanish while horizontal rows look harsh.
6. **Flat Surface Elevation & Dark-Mode Shadow Invisibility (`styles.css:2166, 2364, 4075, 5591-5592, 7287-7295, 16429-16460`)**: Components rely solely on black drop-shadows over `var(--background-primary)`. In dark mode, black shadows blend invisibly into dark backgrounds, flattening floating popovers, cards, and modal dialogs without surface luminance stepping or luminous borders.
7. **Opaque Heavy Conditional Formatting Paints (`src/data/ConditionalFormatting.ts:135-165, styles.css:469-496`)**: Conditional formatting applies heavy opaque background fills that overpower cell hover and range selection, produce low dark-mode text contrast, and fail to consume foreground text variables.
8. **Static Hardcoded Chart Palettes Lacking Dark/Light Theme Calibration (`src/data/ChartPalettes.ts:9-23, src/views/ChartRenderer.ts:75-93, 1565-1594, src/views/ChartToolbarRenderer.ts:46-55`)**: Chart presets hardcode static hex values and read CSS variables from un-scoped `document.body`, causing dark-mode chart series to disappear against dark canvas backgrounds.
9. **Missing Row Density System (`styles.css:4070-4077, src/views/TableRenderer.ts:74-86`)**: Row heights are hardcoded to a single `34px` metric without compact or comfortable density alternatives for data-dense vs relaxed viewing.
10. **Unscoped `color-scheme` & Inconsistent Portal Focus Rings (`styles.css:63-156, 189-206, 2936-2992, src/views/OptionColorPicker.ts:15-16, src/views/IconPickerPopover.ts:23-27`)**: Native controls and body-hosted floating pickers lack an explicit `color-scheme` declaration, causing light native controls to render inside dark modals, while focus rings alternate haphazardly between `outline: none`, raw 2px inset shadows, and disparate accent opacities.
11. **Fragmented Scrollbar Styling & Missing Scroll Fade Masks (`styles.css:72-73, 159-188, 813-825, 9834-9835, 10807-10825`)**: Custom scrollbar thumb styling is redefined across 6 separate CSS blocks with conflicting opacities (36% vs 62%), and wide tables or filter rails lack horizontal gradient fade masks.

### Purpose
Modernize the visual design system inspired by **Anytype**, **AppFlowy**, and **Notion**:
- Deliver a **Dual-Theme Status & Tag Color Token System** with WCAG AA compliance (>4.5:1 contrast) across all 16 named colors in both Light and Dark modes.
- Declare a clean **Base-4 Spatial Scale** (`--db-space-1` to `--db-space-8`) and eliminate arbitrary pixel gaps.
- Harmonize a **5-Tier Typography Scale** (`--db-font-xs` to `--db-font-title`), integrate Obsidian's native `var(--font-interface)`, eliminate sub-11px micro-text, and enforce tabular numerals.
- Standardize a **4-Tier Border Radius Hierarchy** (`--db-radius-xs` to `--db-radius-lg`, `--db-radius-full`).
- Calibrate **Border & Grid Divider Contrast** (`--db-border-subtle`, `--db-border-regular`, `--db-border-emphasis`) for OLED and dark themes.
- Implement **3-Tier Adaptive Surface Elevation** with dark-mode luminance step-ups (+3% cards, +7% popovers with blur, +12% modals with luminous borders).
- Recast conditional formatting into **Layered Emphasis Tints** preserving cell hover, selection, and readable text contrast.
- Establish **Theme-Adaptive Chart Palettes** adjusting luminance dynamically for dark backgrounds.
- Introduce **Configurable Row Density Tokens** (Compact 28px, Default 34px, Comfortable 40px).
- Enforce a scoped **`color-scheme` Policy** across container, modal, and body-portal hosts.
- Unify **Obsidian Dynamic Accent Focus Rings** (`--db-accent-focus-ring`) and standardized interactive state physics.
- Consolidate **Scrollbar Tokens & Horizontal Edge Fade Masks** across all overflowing view surfaces.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Dual-Theme Status & Tag Color Token System (WCAG AA)**: Define dual semantic tokens (`--status-color-bg-*` and `--status-color-fg-*`) across all 16 status colors (gray, brown, orange, yellow, green, blue, purple, pink, red, slate, cyan, teal, lime, indigo, violet, rose) with calibrated Light mode (dark saturated text, 14-18% pastel bg) and `.theme-dark` overrides (luminous pastel text, 22-26% tinted bg + 1px subtle border) in `styles.css:85-116, 132-156, 4563-4578, 5610-5670, 5890-5980`. Eliminate duplicate hex blocks across `.db-option-color-*`, `.db-num-color-*`, `.status-badge`, and record icons (`src/data/OptionRegistration.ts:9-12`, `src/data/RecordIcon.ts:1-12`).
- **Base-4 Spatial Scale Tokens**: Declare `--db-space-1` (2px), `--db-space-2` (4px), `--db-space-3` (6px), `--db-space-4` (8px), `--db-space-5` (12px), `--db-space-6` (16px), `--db-space-8` (24px) in `styles.css:63-130` and replace arbitrary magic padding/margins in toolbars, table cells, cards, filter chips, and popovers (`styles.css:945-964, 4070-4077, 7289-7291`).
- **Harmonized 5-Tier Typography Scale & Native Font Integration**: Declare `--db-font-xs` (11px, weight 500), `--db-font-sm` (12px), `--db-font-md` (13px), `--db-font-lg` (16px, weight 600), and `--db-font-title` (22px, weight 700) in `styles.css:77-81, 120-130`. Replace hardcoded serif font stack (`--db-title-font-family`) with Obsidian's native `var(--font-interface)` in `styles.css:77, 705-750, 900-929`. Eliminate all sub-11px micro-text (`7px`, `8px`, `9px`, `10px` in `styles.css:1077, 1385, 3729, 3754, 12645`). Apply `font-variant-numeric: tabular-nums` to numbers, dates, summaries, and record counts.
- **Standardized 4-Tier Border Radius Hierarchy**: Unify radius tokens into `--db-radius-xs` (3px), `--db-radius-sm` (4px), `--db-radius-md` (6px), `--db-radius-lg` (8px), and `--db-radius-full` (9999px) across container, modal, and portal scopes (`styles.css:74-76, 136-139, 1074, 1382, 1518, 2931-2933, 4338, 7098, 9830-9833, 15949`).
- **Calibrated Border & Grid Divider Contrast**: Unify divider rules into `--db-border-subtle` (`color-mix(in srgb, var(--background-modifier-border) 40%, transparent)`), `--db-border-regular` (`color-mix(in srgb, var(--background-modifier-border) 70%, transparent)`), and `--db-border-emphasis` (`var(--background-modifier-border)`) in `styles.css:83-84, 3929, 4073-4074, 4108-4110, 14258-14259`. Equalize table column and row divider contrast on dark/OLED themes.
- **3-Tier Adaptive Surface Elevation & Dark Mode Luminance Steps**: Define `--db-elevation-1`, `--db-elevation-2`, and `--db-elevation-3` with box-shadows and dark-mode background lightness step-ups (+3% cards, +7% popovers with the shared `backdrop-filter: blur(12px)` contract, +12% modals with luminous 1px borders) in `styles.css:2166, 2364, 4075, 5591-5592, 7287-7295, 16429-16460`.
- **Layered Emphasis Conditional Formatting**: Recast conditional formatting from opaque block paints to theme-derived background tints (`--db-conditional-format-bg: color-mix(in srgb, var(--status-color-bg-[color]) 60%, transparent)`), readable foregrounds (`--db-conditional-format-fg: var(--status-color-fg-[color])`), and 2px left accent indicators in `src/data/ConditionalFormatting.ts:135-165` and `styles.css:469-496, 498-653`.
- **Theme-Adaptive Chart Color Palettes**: Dynamically calibrate chart preset palettes (`colorful`, `pastel`, `vivid`, `warm`, `cool`, `mono`) for dark/light themes in `src/data/ChartPalettes.ts:9-23`. Scope `ThemeColors` resolution in `src/views/ChartRenderer.ts:75-93, 1565-1594` to the database container context, and map reference lines (`src/views/ChartToolbarRenderer.ts:46-55`) to semantic theme colors.
- **Configurable Row Density Tokens**: Define `--db-row-height-compact: 28px`, `--db-row-height-default: 34px`, and `--db-row-height-comfortable: 40px` with harmonious padding and font adjustments in `styles.css:4070-4077`; Phase 002 consumes this scale in `TableRenderer.ts:74-86`.
- **Scoped `color-scheme` Policy & Portal Token Propagation**: Declare `color-scheme: light dark` on `.note-database-container`, `.note-database-modal`, and all body-hosted floating portals (`.db-color-picker-popup`, `.db-icon-picker-popover`, `.db-dropdown-popover`) in `styles.css:63-156, 2936-2992`, `src/views/OptionColorPicker.ts:15-16`, and `src/views/IconPickerPopover.ts:23-27`.
- **Standardized Obsidian Dynamic Accent System & Focus Rings**: Define `--db-accent-primary: var(--interactive-accent)`, `--db-accent-hover`, `--db-accent-subtle`, and `--db-accent-focus-ring: 0 0 0 2px var(--background-primary), 0 0 0 4px var(--interactive-accent)`. Apply standardized `:focus-visible` outlines across cells, buttons, inputs, tabs, and swatches (`styles.css:117-119, 189-206, 5607, 5750, 14204`).
- **Consolidated Scrollbar Tokens & Horizontal Edge Fade Masks**: Unify custom scrollbars across container, popovers, and modals via `--db-scrollbar-thumb` and `--db-scrollbar-thumb-hover` in `styles.css:72-73, 159-188, 813-825, 9834-9835, 10807-10825`. Add horizontal CSS gradient fade masks to overflowing table containers and active filter rails.
- **Unified Interactive State Physics & Disabled Token Contract**: Declare `--db-transition-fast: 120ms ease`, `--db-hover-bg`, `--db-active-bg`, `--db-disabled-opacity: 0.40`, and `--db-disabled-cursor: not-allowed` in `styles.css:364-375, 1312-1315, 1346-1350, 5456-5457, 7290-7296`. Require non-color cues (weight, border, icon) for semantic state indication.

### Out of Scope
- Empty and first-run onboarding states (Phase 001: `001-empty-and-first-run-states`).
- Table grid single-header refactor, trailing add column, and calculation tfoot (Phase 002: `002-table-grid-experience`).
- Floating overlay stack lifecycle, collision flipping, and bottom sheets (Phase 003: `003-popovers-menus-elevation`).
- 4-cluster toolbar reorganization and WAI-ARIA tablist view switching (Phase 004: `004-toolbar-and-view-controls`).
- Board swimlanes, Gallery cover cards, Calendar time grids, List row layouts (Phase 006: `006-views-parity-polish`).
- Drag ghosts, selection bounding box, and fill handle (Phase 007: `007-micro-interactions`).
- Touch hit envelopes and mobile ARIA landmark roles (Phase 008: `008-mobile-and-accessibility`).
- Writing note frontmatter or markdown files on render, telemetry, or desktop-only Electron APIs (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `styles.css` | Edit | Declare dual-theme status colors with dark overrides, base-4 spatial tokens, 5-tier typography scale, native font interface title, 4-tier radius hierarchy, calibrated border tokens, 3-tier adaptive surface elevation, layered conditional formatting tints, row density tokens, scoped `color-scheme`, unified focus rings, scrollbar tokens, and horizontal scroll fade masks (`:63-156, 189-206, 469-496, 705-750, 900-929, 1074-1077, 1312-1385, 2155-2364, 2929-2992, 3425-3492, 3729-3754, 4070-4125, 4371-4387, 4563-4578, 5606-5671, 5890-5998, 7098, 7287-7295, 9830-9835, 12645, 14258-14259, 15922-16015, 16429-16460`) |
| `src/data/ChartPalettes.ts` | Edit | Implement theme-adaptive chart color palette generator dynamically calibrating luminance/saturation for dark and light modes (`:9-23`) |
| `src/data/ConditionalFormatting.ts` | Edit | Apply layered emphasis formatting with theme-aware background tints, explicit foreground contrast, and accent borders (`:135-165`) |
| `src/views/ChartRenderer.ts` | Edit | Resolve `ThemeColors` from container CSS context rather than un-scoped `document.body` fallbacks; integrate theme-adaptive palettes (`:75-93, 1565-1594`) |
| `src/views/ChartToolbarRenderer.ts` | Edit | Update reference line colors to consume theme-aware semantic color tokens (`:46-55`) |
| `src/views/OptionColorPicker.ts` | Edit | Scope body-hosted color picker popup to inherit plugin design tokens, declare `color-scheme`, and ensure accessible focus/selection (`:15-47`) |
| `src/views/IconPickerPopover.ts` | Edit | Scope body-hosted icon picker popup to inherit design tokens and declare `color-scheme` (`:23-47`) |
| `src/data/OptionRegistration.ts` | Edit | Align option registration color array with centralized semantic color tokens (`:9-12`) |
| `src/data/RecordIcon.ts` | Edit | Align record icon color list with centralized status color tokens (`:1-12`) |
| `src/views/CellRenderer.ts` | Edit | Consume semantic color tokens for status/select tags, apply tabular numerals to dates/numbers, and support row density classes (`:332-407`) |
| `src/views/GroupLabelRenderer.ts` | Edit | Consume dual-theme status color tokens on group header badges and ensure accessible non-color cues (`:35-46`) |
| `src/views/NumberDisplayRenderer.ts` | Edit | Align rating, progress bar, and ring tint colors with centralized `--db-num-color-*` tokens and tabular numerals (`:1-75`) |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | Dual-Theme Status & Tag Color Token System (WCAG AA Compliance) | In `styles.css:85-116, 132-156, 4563-4578, 5610-5670, 5890-5980`, define dual semantic tokens (`--status-color-bg-*` and `--status-color-fg-*`) across all 16 status colors (gray, brown, orange, yellow, green, blue, purple, pink, red, slate, cyan, teal, lime, indigo, violet, rose). Light mode uses saturated dark text (`L: 25-35%`) over 14-18% pastel background tints; `.theme-dark` uses luminous pastel text (`L: 75-85%`) over 22-26% tinted backgrounds plus a 1px subtle border (`color-mix(in srgb, currentColor 20%, transparent)`). All 16 colors meet WCAG AA (>4.5:1 contrast) in both themes. Single source of truth in CSS properties consumed across `.status-badge`, `.db-option-color-*`, `.db-num-color-*`, and record icons (`src/data/OptionRegistration.ts:9-12`, `src/data/RecordIcon.ts:1-12`). |
| REQ-002 | Base-4 Spatial Scale Tokens & Margin/Padding Harmonization | In `styles.css:63-130`, declare standardized base-4 spatial scale tokens: `--db-space-1: 2px`, `--db-space-2: 4px`, `--db-space-3: 6px`, `--db-space-4: 8px`, `--db-space-5: 12px`, `--db-space-6: 16px`, `--db-space-8: 24px` on `.note-database-container` and `.note-database-modal`. Replace arbitrary pixel padding, margins, and gaps across toolbars (`:945-964`), table cells (`:4070-4077`), board cards (`:7289-7291`), and modals (`:6348`) with spatial scale tokens. |
| REQ-003 | Harmonized 5-Tier Typography Scale & Native Font Integration | In `styles.css:77-81, 120-130`, declare named typography scale tokens: `--db-font-xs: 11px` (caption, line-height 1.3, weight 500), `--db-font-sm: 12px` (secondary text, line-height 1.4), `--db-font-md: 13px` (body default, line-height 1.45), `--db-font-lg: 16px` (subheading, line-height 1.35, weight 600), and `--db-font-title: 22px` (heading, line-height 1.25, weight 700). Replace hardcoded serif font stack (`--db-title-font-family`) with Obsidian's native `var(--font-interface)` in `styles.css:77, 705-750, 900-929`. Eliminate all sub-11px micro-text (`7px`, `8px`, `9px`, `10px` in `:1077, 1385, 3729, 3754, 12645`). Apply `font-variant-numeric: tabular-nums` to numbers, dates, summaries, and record counts. |
| REQ-004 | Standardized 4-Tier Border Radius Hierarchy | In `styles.css:74-76, 136-139, 1074, 1382, 1518, 2931-2933, 4338, 7098, 9830-9833, 15949`, unify all border radius declarations into 4 semantic tiers plus capsule: `--db-radius-xs: 3px` (checkboxes, swatches), `--db-radius-sm: 4px` (inputs, mini buttons, inline chips), `--db-radius-md: 6px` (toolbar buttons, dropdown options, table cells), `--db-radius-lg: 8px` (popovers, cards, modals), and `--db-radius-full: 9999px` (status pills, tag capsules, avatars). Eliminate arbitrary pixel radii (`1px`, `2px`, `5px`, `7px`, `10px`, `14px`, `16px`, `8px 8px 6px 6px`). |
| REQ-005 | Calibrated Border & Grid Divider Contrast | In `styles.css:83-84, 3929, 4073-4074, 4108-4110, 14258-14259`, unify border divider tokens: `--db-border-subtle: color-mix(in srgb, var(--background-modifier-border) 40%, transparent)` (table column dividers, timeline minor grid), `--db-border-regular: color-mix(in srgb, var(--background-modifier-border) 70%, transparent)` (table row borders, card outlines, popover dividers), and `--db-border-emphasis: var(--background-modifier-border)` (table header borders, modal boundaries). Equalizes vertical and horizontal grid line contrast in dark/OLED themes. |
| REQ-006 | 3-Tier Adaptive Surface Elevation & Dark-Mode Luminance Steps | In `styles.css:2166, 2364, 4075, 5591-5592, 7287-7295, 16429-16460`, define the shared `--db-elevation-1`, `--db-elevation-2`, and `--db-elevation-3` tokens with dark-mode luminance steps: Elevation 0 (canvas `--db-surface-canvas: var(--background-primary)`), Elevation 1 (cards/sticky headers `--db-surface-raised` with +3% lightness and subtle border), Elevation 2 (popovers `--db-surface-overlay` with +7% lightness, shared `backdrop-filter: blur(12px)`, and `box-shadow: 0 10px 28px rgba(0,0,0,0.45), 0 3px 8px rgba(0,0,0,0.30)`), and Elevation 3 (modals/drawers `--db-surface-modal` with +12% lightness and luminous 1px border `rgba(255,255,255,0.12)`). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-007 | Layered Emphasis Conditional Formatting | In `src/data/ConditionalFormatting.ts:135-165` and `styles.css:469-496`, refactor conditional formatting from opaque background fills to layered, theme-aware emphasis: apply low-alpha background tint `--db-conditional-format-bg: color-mix(in srgb, var(--status-color-bg-[color]) 60%, transparent)` combined with explicit readable `--db-conditional-format-fg: var(--status-color-fg-[color])` and a 2px left accent indicator / border. Row-level formatting preserves cell hover and selection visibility without obscuring text contrast. |
| REQ-008 | Theme-Adaptive Chart Color Palettes & Contrast Calibration | In `src/data/ChartPalettes.ts:9-23`, implement theme-adaptive chart color palette generation dynamically adjusting luminance and saturation for dark and light modes. In `src/views/ChartRenderer.ts:75-93, 1565-1594`, resolve `ThemeColors` from container CSS context rather than un-scoped `document.body` fallbacks. In `src/views/ChartToolbarRenderer.ts:46-55`, map reference lines to theme-aware semantic border and status colors. |
| REQ-009 | Configurable Row Density Tokens | Define row density height tokens in `styles.css:4070-4077`: `--db-row-height-compact: 28px` (compact: 28px row height, 11px/12px font, 4px cell padding), `--db-row-height-default: 34px` (default: 34px row height, 13px font, 8px cell padding), and `--db-row-height-comfortable: 40px` (comfortable: 40px row height, 14px font, 12px cell padding); Phase 002 consumes these tokens in `src/views/TableRenderer.ts:74-86` and adapts table cells and cards to the selected view density. |
| REQ-010 | Scoped `color-scheme` Policy & Portal Token Propagation | In `styles.css:63-156, 2936-2992`, `src/views/OptionColorPicker.ts:15-16`, and `src/views/IconPickerPopover.ts:23-27`, declare `color-scheme: light dark` on `.note-database-container`, `.note-database-modal`, and all body-hosted floating portals (`.db-color-picker-popup`, `.db-icon-picker-popover`, `.db-dropdown-popover`). Native inputs, selects, date pickers, and scrollbars automatically inherit the active Obsidian theme without light native controls appearing in dark modals or pickers. |
| REQ-011 | Standardized Obsidian Dynamic Accent System & Focus Rings | In `styles.css:117-119, 189-206, 5607, 5750, 14204`, define standardized accent tokens: `--db-accent-primary: var(--interactive-accent)`, `--db-accent-hover: var(--interactive-accent-hover)`, `--db-accent-subtle: color-mix(in srgb, var(--interactive-accent) 14%, transparent)`, and `--db-accent-focus-ring: 0 0 0 2px var(--background-primary), 0 0 0 4px var(--interactive-accent)`. Replace disparate focus ring styles (`outline: none`, raw 2px inset shadows) with a unified, visible `:focus-visible` ring across cells, buttons, inputs, tabs, and swatches. |
| REQ-012 | Consolidated Scrollbar Tokens & Horizontal Edge Fade Masks | In `styles.css:72-73, 159-188, 813-825, 9834-9835, 10807-10825`, unify custom scrollbars across container, popover, and modal scroll areas into `--db-scrollbar-thumb` and `--db-scrollbar-thumb-hover`. Apply smooth horizontal CSS gradient fade masks (`mask-image: linear-gradient(...)`) to scrollable table containers and active filter rails when content overflows. |
| REQ-013 | Unified Interactive State Physics & Disabled Token Contract | In `styles.css:364-375, 1312-1315, 1346-1350, 5456-5457, 7290-7296`, declare standardized interactive state transitions: `--db-transition-fast: 120ms ease`, `--db-hover-bg: var(--background-modifier-hover)`, `--db-active-bg: var(--background-modifier-active-hover)`, `--db-disabled-opacity: 0.40`, and `--db-disabled-cursor: not-allowed`. Require non-color cues (weight, border, icon) for semantic state indication across cells, cards, group labels, and pickers. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: In Dark mode, all 16 status/tag color pills (gray, brown, orange, yellow, green, blue, purple, pink, red, slate, cyan, teal, lime, indigo, violet, rose) achieve a contrast ratio >= 4.5:1 against dark backgrounds (`#1e1e1e` / `#202020`), meeting WCAG AA standards.
- **SC-002**: Database titles render using Obsidian's active interface font (`var(--font-interface)`) without serif font clashing, scaling harmoniously across desktop and mobile.
- **SC-003**: All text rendered across badges, order labels, summary chips, and metadata is >= 11px; zero sub-11px text (`7px`, `8px`, `9px`, `10px`) remains in the stylesheet.
- **SC-004**: Tabular numerals (`tabular-nums`) are active on all numeric cells, calculation footers, date timestamps, and badge count pills, preventing horizontal jitter during value updates.
- **SC-005**: Padding, margins, and gaps across toolbars, table cells, board cards, filter chips, and popovers conform strictly to the base-4 spatial scale (`--db-space-1` to `--db-space-8`).
- **SC-006**: Border curvature across all controls, buttons, cards, popovers, and modals adheres to the 4-tier radius hierarchy (`--db-radius-xs` to `--db-radius-lg`, `--db-radius-full`).
- **SC-007**: Vertical table column dividers and horizontal row borders maintain balanced visual contrast in Dark mode without column lines disappearing.
- **SC-008**: Floating popovers, board cards, and modal dialogs exhibit distinct 3-tier surface elevation with dark-mode background luminance step-ups and luminous borders.
- **SC-009**: Conditional formatting rules apply layered emphasis tints that preserve cell hover outlines and row selection states without overpowering text legibility.
- **SC-010**: Chart preset color palettes render with calibrated luminance and saturation in Dark mode, providing high contrast against dark chart backgrounds.
- **SC-011**: Body-appended color and icon pickers declare `color-scheme` and inherit plugin design tokens seamlessly.
- **SC-012**: Keyboard focus navigation across cells, buttons, inputs, tabs, and swatches displays a standardized, visible `--db-accent-focus-ring`.
- **SC-013**: Display-only rendering verified: zero writes to note frontmatter or bodies occur when rendering tokens, themes, or view density states (iCloud-safe).

### Acceptance Scenarios

- **Scenario 1**: **Given** Obsidian is in Dark mode, **when** viewing status pills with blue, purple, indigo, or teal tags in a table or board view, **then** the text renders in a luminous pastel tone with >= 4.5:1 contrast against the tag background and dark canvas.
- **Scenario 2**: **Given** a vault with a custom sans-serif interface font, **when** opening a database, **then** the database title renders in that interface font rather than a hardcoded serif font.
- **Scenario 3**: **Given** a table with row density set to Compact, **when** rendering records, **then** table row heights snap to 28px with 11px/12px font size and 4px padding.
- **Scenario 4**: **Given** a conditional formatting rule matching a table row, **when** the user hovers over or selects that row, **then** the hover highlight and selection outline remain clearly visible through the layered emphasis tint.
- **Scenario 5**: **Given** Obsidian is switched from Light to Dark mode, **when** viewing a bar chart, **then** chart series colors dynamically adjust their luminance and reference lines remain crisp and readable against dark grid axes.
- **Scenario 6**: **Given** a body-hosted color picker popup, **when** opening the picker in Dark mode, **then** the popup surface exhibits Elevation 2 luminance, 12px blur, and an explicit dark `color-scheme`.
- **Scenario 7**: **Given** keyboard tabbing across table cells and toolbar buttons, **when** focus lands on an interactive element, **then** a clear double-ring accent focus outline (`--db-accent-focus-ring`) is displayed.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | High-saturation community themes alter `--interactive-accent` contrast | Focus rings or accent tints become low-contrast | Use `color-mix` against `var(--background-primary)` for focus ring inner boundary and clamp lightness |
| Risk | Dark-mode luminance step-ups clash with translucent or glassmorphic themes | Popovers appear overly opaque or washed out | Couple luminance boost with `backdrop-filter: blur(12px)` and fall back to solid dark surface if unsupported |
| Risk | Dynamic font size scaling causes text overflow in fixed-width table columns | Text clipping in narrow columns | Enforce `text-overflow: ellipsis` and `overflow: hidden` on cell text spans across all density levels |
| Risk | Chart palette dynamic generation impacts rendering performance | Micro-stutter on chart render | Memoize resolved palette arrays in `ChartPalettes.ts` by theme key (light/dark) |
| Dependency | `styles.css` token declarations | Foundational styling substrate | Tokens declared at root `.note-database-container`, `.note-database-modal`, and portal scopes |
| Dependency | Research synthesis (`research/synthesis.md`, iteration 05) | Token calibration specifications | Requirements trace directly to synthesis Ranked Rec #1, #9, Quick Win #2, and Themed Backlog #4 items |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: CSS token evaluation adds zero runtime JS overhead; all color, spacing, and radius variables resolve via native browser CSS engine.
- **NFR-P02**: Theme-adaptive chart palette resolution executes in < 1ms in memory during chart configuration builds.
- **NFR-P03**: Horizontal scroll fade masks use GPU-accelerated CSS `mask-image` without causing layout reflows during scrolling.

### Security
- **NFR-S01**: Zero external web fonts, CDNs, telemetry, or remote dependencies; strictly local Obsidian CSS custom properties and native system fonts; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: visual token rendering, theme adaptation, and density switching produce zero writes to note frontmatter or markdown bodies.
- **NFR-R02**: Mobile-safe: design tokens scale seamlessly across iOS, iPadOS, and Android Obsidian clients with full dark mode and OLED theme compatibility.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Ultra-Dark / Pure Black OLED Themes**: On pure `#000000` backgrounds, `--db-border-subtle` and `--db-surface-raised` provide sufficient luminance (+3% to +5%) to ensure cards and column dividers remain clearly distinguishable without harsh borders.
- **High-Contrast Light Themes**: On pure `#ffffff` backgrounds, subtle borders retain 40% border opacity to prevent visual clutter while maintaining clear cell geometry.
- **User-Defined Custom Status Colors**: When a user configures a custom color option not in the 16 presets, fallback rules generate calibrated light/dark text and background pairs based on the custom hex luminance.
- **Deeply Grouped Nested Tables**: When tables are nested with multi-level grouping (`--db-group-depth`), base-4 indentation scaling (`calc(var(--db-space-4) * 2 * depth)`) prevents horizontal overflow in narrow viewports.

### Error Scenarios
- **Unsupported `backdrop-filter` in Older WebViews**: Floating popovers fall back gracefully to solid opaque surfaces (`--db-surface-overlay`) without rendering visual artifacts.
- **Missing Obsidian Font Variables**: If a custom theme deletes `--font-interface`, fallback stack `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` guarantees clean rendering.
- **Invalid CSS Custom Property in Chart Renderer**: If `getComputedStyle` returns empty strings during background tab rendering, `getFallbackThemeColors()` provides safe, theme-calibrated defaults.

### Concurrent Operations
- Live theme switching (Light <-> Dark mode or community theme change) updates all CSS variables instantly without requiring a plugin reload or view re-mount.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|---|---|---|
| Scope | 9/25 | Comprehensive tokenization across color, typography, spacing, radius, elevation, chart palettes, and density |
| Risk | 5/25 | Presentation-layer styling and pure view helpers only; database engine, query pipeline, and storage untouched |
| Research | 6/20 | Exhaustive line-by-line audit and token specifications established across both research tracks |
| **Total** | **20/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All implementation choices follow the research synthesis recommendations; no open blockers:
- **Title Font Family**: Harmonizing with `var(--font-interface)` is adopted as the primary default; users desiring serif headers can customize via Obsidian workspace CSS snippets.
- **Chart Palette Storage**: Preserved internal palette preset keys (`colorful`, `pastel`, `vivid`, `warm`, `cool`, `mono`) to maintain full backward compatibility with saved view configs while updating rendered hex values dynamically.
- **Conditional Format Fill**: Layered low-alpha background tint with accent border is adopted to resolve contrast and selection masking issues.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../004-toolbar-and-view-controls/spec.md`](../004-toolbar-and-view-controls/spec.md)
- **Research Synthesis**: `specs/public/002-ui-improvement-research/research/synthesis.md`
- **Research Iteration 05 (Devin Track)**: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-05.md`
- **Research Iteration 05 (Codex Track)**: `specs/public/002-ui-improvement-research/research/codex-luna/iteration-05.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
