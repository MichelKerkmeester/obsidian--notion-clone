---
title: "Implementation Plan: Design Tokens and Typography"
description: "Locked build plan for the visual design system: dual-theme status and tag color token system with WCAG AA compliance, base-4 spatial scale tokens, harmonized 5-tier typography scale with Obsidian native font integration, 4-tier border radius hierarchy, calibrated border divider contrast, 3-tier adaptive surface elevation with dark-mode luminance steps, layered emphasis conditional formatting, theme-adaptive chart color palettes, configurable row density tokens, scoped color-scheme policy, standardized Obsidian dynamic accent focus rings, and consolidated scrollbar tokens."
trigger_phrases:
  - "design tokens plan"
  - "color tokens plan"
  - "typography scale plan"
  - "spacing tokens plan"
  - "radius hierarchy plan"
  - "dark light theming plan"
  - "dual theme status colors plan"
  - "surface elevation plan"
  - "row density plan"
  - "theme adaptive chart palette plan"
  - "focus ring plan"
  - "border divider plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/005-design-tokens-typography"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for design tokens and typography phase"
    next_safe_action: "Implement phase 005 tasks starting with dual-theme color tokens"
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
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Design Tokens and Typography

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | TypeScript, CSS3 Custom Properties, Obsidian Theme Engine |
| **Framework** | Native Obsidian DOM helpers (`createDiv`, `createSpan`, `setIcon`, `t`), Canvas / SVG Charting |
| **Storage** | None — strictly display-only; zero frontmatter or note body writes (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin build (`npm run build`) |

### Overview
This plan implements the UI research synthesis's Top 10 recommendations #1 (Dual-Theme Status & Tag Color Token System with WCAG AA compliance), #9 (Focus Reset & Accent Focus Rings), Quick Win #2 (Native Interface Font Integration), and Themed Backlog #4 (Design Tokens & Typography). It delivers a comprehensive visual design system across the Note Database plugin: (1) defining dual-mode status/tag color tokens with luminous dark-theme overrides, (2) declaring a base-4 spatial scale (`--db-space-1` to `--db-space-8`), (3) harmonizing a 5-tier typography scale with native `var(--font-interface)` font integration, sub-11px text elimination, and tabular numerals, (4) enforcing a 4-tier border radius hierarchy, (5) calibrating border divider contrast for dark/OLED themes, (6) implementing 3-tier adaptive surface elevation with dark-mode background luminance step-ups (+3% cards, +7% popovers with blur, +12% modals with luminous borders), (7) recasting conditional formatting into layered emphasis tints, (8) creating theme-adaptive chart color palettes, (9) introducing configurable row density tokens (Compact, Default, Comfortable), (10) enforcing a scoped `color-scheme` policy for native controls and body portals, (11) standardizing Obsidian dynamic accent focus rings (`--db-accent-focus-ring`), (12) consolidating custom scrollbar tokens with horizontal edge fade masks, and (13) establishing a unified interactive state physics contract.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Codebase audited: all token declarations, status color usages, typography rules, spacing magic numbers, and chart palettes located with precise `file:line` evidence.
- [x] Dual-theme color values, spatial scale, typography metrics, and radius tiers benchmarked and locked against Anytype, AppFlowy, and Notion standards.
- [x] Standing constraints verified: 100% display-only rendering, zero note-body writes, mobile-safe, MIT-forkable, rebase-clean isolated diff.

### Definition of Done
- [ ] Dual-theme status and tag color token system implemented in `styles.css:85-116, 132-156` with `.theme-dark` overrides meeting WCAG AA (>4.5:1 contrast) across all 16 colors.
- [ ] Base-4 spatial scale tokens (`--db-space-1` to `--db-space-8`) declared and applied across toolbars, cells, cards, chips, and modals (`styles.css:63-130, 945-964, 4070-4077, 7289-7291`).
- [ ] 5-tier typography scale implemented with native `var(--font-interface)` integration, zero sub-11px text, and tabular numerals on all numeric/date fields (`styles.css:77-81, 120-130, 705-750`).
- [ ] 4-tier border radius hierarchy (`--db-radius-xs` to `--db-radius-lg`, `--db-radius-full`) enforced vault-wide (`styles.css:74-76, 136-139, 1074, 1518, 7098, 9830-9833`).
- [ ] Border and grid divider contrast calibrated into subtle, regular, and emphasis tokens (`styles.css:83-84, 3929, 4073-4074, 4108-4110`).
- [ ] 3-tier adaptive surface elevation implemented with dark-mode background luminance step-ups (+3% cards, +7% popovers with blur, +12% modals with luminous borders) in `styles.css:2166, 2364, 4075, 5591-5592, 7287-7295, 16429-16460`.
- [ ] Conditional formatting refactored into layered emphasis tints preserving hover/selection and text contrast (`src/data/ConditionalFormatting.ts:135-165, styles.css:469-496`).
- [ ] Theme-adaptive chart color palette generator implemented in `src/data/ChartPalettes.ts:9-23` and container-scoped `ThemeColors` wired in `src/views/ChartRenderer.ts:75-93, 1565-1594`.
- [ ] Row density tokens (Compact 28px, Default 34px, Comfortable 40px) defined in `styles.css:4070-4077` and consumed by Phase 002 in `src/views/TableRenderer.ts:74-86`.
- [ ] Scoped `color-scheme` policy and portal token propagation applied to container, modal, and body pickers (`src/views/OptionColorPicker.ts:15-16, src/views/IconPickerPopover.ts:23-27`).
- [ ] Standardized Obsidian dynamic accent focus rings (`--db-accent-focus-ring`) and interactive state physics established (`styles.css:117-119, 189-206, 5607, 5750`).
- [ ] Scrollbar tokens consolidated and horizontal edge fade masks applied to table containers and active filter rails (`styles.css:72-73, 159-188, 813-825, 9834-9835`).
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, and `npx vitest run`.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
The visual design system follows the **Semantic Multi-Tier Token Architecture** inspired by Anytype and AppFlowy:
- **Tier 1: Foundation Primitives**: Base spatial scale (base-4), mathematical font scale (5-tier), border radii (4-tier), and raw Obsidian theme hooks (`--font-interface`, `--interactive-accent`, `--background-primary`, `--background-secondary`, `--text-normal`, `--text-muted`, `--background-modifier-border`).
- **Tier 2: Semantic Role Tokens**: Surface luminance steps (`--db-surface-canvas`, `--db-surface-raised`, `--db-surface-overlay`, `--db-surface-modal`), border contrast tokens (`--db-border-subtle`, `--db-border-regular`, `--db-border-emphasis`), and dual-theme status/tag color pairs (`--status-color-bg-[color]` and `--status-color-fg-[color]`).
- **Tier 3: Component Presentation Tokens**: Row density heights (`--db-row-height-*`), focus rings (`--db-accent-focus-ring`), scrollbar tokens, and interactive physics (`--db-transition-fast`, `--db-hover-bg`, `--db-disabled-opacity`).

```
+----------------------------------------------------------------------------------------------------+
|  OBSIDIAN THEME LAYER                                                                             |
|  --background-primary  --background-secondary  --text-normal  --interactive-accent  --font-ui     |
+----------------------------------------------------------------------------------------------------+
                                               │
                                               ▼
+----------------------------------------------------------------------------------------------------+
|  PLUGIN TOKEN LAYER (.note-database-container / .note-database-modal / .db-*-popover)             |
|  ├── Spacing:    --db-space-1 (2px) .. --db-space-8 (24px)                                         |
|  ├── Typography: --db-font-xs (11px) .. --db-font-title (22px) + tabular-nums                      |
|  ├── Radii:      --db-radius-xs (3px) .. --db-radius-lg (8px) + full (9999px)                      |
|  ├── Elevation:  Canvas (L0) -> Raised (+3%) -> Overlay (+7% + blur) -> Modal (+12% + border)      |
|  ├── Borders:    --db-border-subtle (40%) | --db-border-regular (70%) | --db-border-emphasis (100%)|
|  ├── Colors:     16 Dual-Theme Status & Tag Color Pairs (WCAG AA >4.5:1 Light & Dark)              |
|  └── Accents:    --db-accent-primary | --db-accent-subtle | --db-accent-focus-ring                 |
+----------------------------------------------------------------------------------------------------+
                                               │
                                               ▼
+----------------------------------------------------------------------------------------------------+
|  CONSUMER RENDERERS                                                                                |
|  TableRenderer  CellRenderer  ChartRenderer  BoardRenderer  OptionColorPicker  RecordDetailPanel   |
+----------------------------------------------------------------------------------------------------+
```

### Key Components
- **`styles.css`**: Central design system stylesheet. Declares foundational and semantic tokens on `.note-database-container`, `.note-database-modal`, `.theme-dark`, and body-portal scopes. Consolidates status colors, typography, spacing, radius, elevation, conditional formatting tints, row density, focus rings, and scrollbars.
- **`ChartPalettes.ts`**: Implements theme-adaptive chart color palette generators that dynamically calibrate luminance and saturation for dark and light backgrounds while preserving stable palette configuration keys.
- **`ConditionalFormatting.ts`**: Refactors formatting execution to apply layered background tints, readable foregrounds, and accent borders instead of opaque cell fills.
- **`ChartRenderer.ts`**: Resolves `ThemeColors` dynamically within the database container's CSS custom property scope and integrates theme-adaptive chart palettes.
- **`ChartToolbarRenderer.ts`**: Maps chart reference line options to theme-aware semantic color tokens.
- **`OptionColorPicker.ts`**: Ensures body-hosted color picker popups declare `color-scheme: light dark` and inherit plugin design tokens.
- **`IconPickerPopover.ts`**: Scopes body-hosted icon pickers with `color-scheme` and design tokens.
- **`CellRenderer.ts`**: Applies tabular numerals and semantic status badge styles while consuming the shared design tokens (`:332-407`). Phase 002 consumes the row density tokens in `TableRenderer.ts:74-86`.
- **`GroupLabelRenderer.ts` & `NumberDisplayRenderer.ts`**: Consume centralized dual-theme status color tokens and ensure accessible non-color cues.

### Data Flow
1. **Theme Resolution**: On render or theme change, CSS custom properties resolve from the root container and active `.theme-dark` / `.theme-light` context.
2. **Color & Elevation Application**: Renderers apply class-based semantic hooks (`.status-badge`, `.db-option-color-*`, `.db-surface-overlay`, `.is-density-compact`) which inherit token variables with zero JS computation.
3. **Chart Palette Resolution**: When building chart configs, `ChartRenderer` and `ChartPalettes` resolve theme-adaptive RGB/HSL values matching the active container's luminance context.
4. **Interactive Focus & States**: Keyboard tabbing triggers native `:focus-visible` pseudo-classes rendering `--db-accent-focus-ring` consistently across all surfaces.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup & Baseline
- [ ] Inspect existing token declarations in `styles.css:63-156, 4563-4578, 5610-5670, 5890-5980` and record baseline build/test state (`npx tsc --noEmit`, `npm run build`, `npx vitest run`).
- [ ] Verify contrast ratios of all 16 status colors against `#1e1e1e` dark canvas baseline.

### Phase 2: Dual-Theme Color Tokens, Spatial Scale & Typography
- [ ] Implement dual-theme status and tag color token system with `.theme-dark` overrides in `styles.css:85-116, 132-156` guaranteeing WCAG AA (>4.5:1 contrast) across all 16 colors.
- [ ] Deduplicate and unify option color declarations across `.status-badge`, `.db-option-color-*`, `.db-num-color-*`, and record icons (`styles.css:4371-4387, 4563-4578, 5606-5671, 5890-5998, 15922-16015`).
- [ ] Declare base-4 spatial scale tokens (`--db-space-1` to `--db-space-8`) and replace arbitrary pixel padding/margin magic numbers in `styles.css:63-130, 945-964, 4070-4077, 7289-7291`.
- [ ] Harmonize 5-tier typography scale (`--db-font-xs` to `--db-font-title`), integrate native `var(--font-interface)` for database titles, eliminate sub-11px micro-text (`:1077, 1385, 3729, 3754, 12645`), and apply `tabular-nums` (`styles.css:77-81, 120-130, 705-750, 900-929`).

### Phase 3: Radius, Borders, Surface Elevation & Layered Emphasis
- [ ] Standardize 4-tier border radius hierarchy (`--db-radius-xs` to `--db-radius-lg`, `--db-radius-full`) across container, modal, and portal scopes (`styles.css:74-76, 136-139, 1074, 1382, 1518, 2931-2933, 4338, 7098, 9830-9833, 15949`).
- [ ] Calibrate border divider tokens (`--db-border-subtle`, `--db-border-regular`, `--db-border-emphasis`) in `styles.css:83-84, 3929, 4073-4074, 4108-4110, 14258-14259` to equalize vertical/horizontal grid contrast on dark/OLED themes.
- [ ] Define `--db-elevation-1`, `--db-elevation-2`, and `--db-elevation-3` with adaptive surface elevation and dark-mode background luminance step-ups (+3% cards, +7% popovers with the shared 12px blur contract, +12% modals with luminous borders) in `styles.css:2166, 2364, 4075, 5591-5592, 7287-7295, 16429-16460`.
- [ ] Refactor conditional formatting to layered emphasis tints with explicit foreground contrast and accent borders in `src/data/ConditionalFormatting.ts:135-165` and `styles.css:469-496`.

### Phase 4: Chart Palettes, Row Density, Accent Focus Rings & Scrollbars
- [ ] Implement theme-adaptive chart color palette generator in `src/data/ChartPalettes.ts:9-23` and container-scoped `ThemeColors` resolution in `src/views/ChartRenderer.ts:75-93, 1565-1594` and `src/views/ChartToolbarRenderer.ts:46-55`.
- [ ] Define configurable row density tokens (Compact 28px, Default 34px, Comfortable 40px) in `styles.css:4070-4077`; Phase 002 consumes them in `src/views/TableRenderer.ts:74-86`.
- [ ] Enforce scoped `color-scheme: light dark` policy on container, modal, and body pickers (`styles.css:63-156, 2936-2992`, `src/views/OptionColorPicker.ts:15-16`, `src/views/IconPickerPopover.ts:23-27`).
- [ ] Standardize Obsidian dynamic accent tokens and unified `:focus-visible` focus rings (`--db-accent-focus-ring`) in `styles.css:117-119, 189-206, 5607, 5750, 14204`.
- [ ] Consolidate scrollbar tokens and apply horizontal CSS gradient edge fade masks in `styles.css:72-73, 159-188, 813-825, 9834-9835, 10807-10825`.
- [ ] Declare unified interactive state physics and disabled state tokens (`styles.css:364-375, 1312-1315, 1346-1350, 5456-5457, 7290-7296`).

### Phase 5: Verification & Quality Gate
- [ ] Run full test suite (`npx vitest run`), TypeScript compilation (`npx tsc --noEmit`), and plugin build (`npm run build`).
- [ ] Verify WCAG AA contrast compliance across all 16 status colors in both Light and Dark modes.
- [ ] Verify display-only rendering (no frontmatter/body writes during theme switching, token evaluation, or density toggling).
- [ ] Complete `checklist.md` and `implementation-summary.md`.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|---|---|---|
| Unit | Theme-adaptive chart palette resolution, conditional formatting color resolution, option registration color mapping | Vitest (`npx vitest run`) |
| Contrast & Accessibility | WCAG AA contrast validation across all 16 status colors in Light and Dark modes, sub-11px text elimination, tabular numerals | Chrome DevTools Contrast / Accessibility Inspector |
| Theme Adaptation | Dynamic switching between Light, Dark, and high-contrast OLED themes across Table, Board, Gallery, Chart, Popover, and Modal surfaces | Obsidian Theme Switcher / Vitest DOM fixtures |
| Density & Responsive | Compact (28px), Default (34px), and Comfortable (40px) row heights across narrow split panes and mobile viewports | Chrome Device Mode / Responsive Inspector |
| Display-only / iCloud | Verify zero frontmatter or note body mutations during theme switching, token rendering, or density changes | Note content diff check |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|---|---|---|---|
| Research synthesis (`research/synthesis.md`, iteration 05) | Internal | Green (complete) | Token calibration specifications and contrast targets locked |
| `src/data/ChartPalettes.ts` | Internal | Green (available) | Required for theme-adaptive chart color resolution |
| `src/data/ConditionalFormatting.ts` | Internal | Green (available) | Required for layered emphasis formatting |
| `src/views/OptionColorPicker.ts` | Internal | Green (available) | Required for body portal token scoping |
| Phase `004-toolbar-and-view-controls` | Predecessor | Planned | Provides toolbar cluster containers consuming spacing/typography tokens |
| Phase `006-views-parity-polish` | Successor | Planned | Consumes design tokens across Board, Gallery, Calendar, List views |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: TypeScript compilation errors, contrast regressions, broken table layouts in custom community themes, or unhandled exceptions in chart palette resolution.
- **Procedure**: Revert commits touching `styles.css`, `ChartPalettes.ts`, `ConditionalFormatting.ts`, `ChartRenderer.ts`, `ChartToolbarRenderer.ts`, `OptionColorPicker.ts`, `IconPickerPopover.ts`, `CellRenderer.ts`, and `TableRenderer.ts`. All edits are isolated to presentation styling and pure view helper functions.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|---|---|---|
| Setup & Baseline | None | Dual-Theme Colors, Spacing & Typography |
| Dual-Theme Colors, Spacing & Typography | Setup & Baseline | Radius, Borders, Elevation & Emphasis |
| Radius, Borders, Elevation & Emphasis | Dual-Theme Colors, Spacing & Typography | Chart Palettes, Density & Focus Rings |
| Chart Palettes, Density & Focus Rings | Radius, Borders, Elevation & Emphasis | Verification & Quality Gate |
| Verification & Quality Gate | Chart Palettes, Density & Focus Rings | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Sub-Phase | Complexity | Estimated Effort |
|---|---|---|
| Setup & Baseline | Low | 15 minutes |
| Dual-Theme Colors, Spacing & Typography | Medium | 60 minutes |
| Radius, Borders, Elevation & Layered Emphasis | Medium | 50 minutes |
| Chart Palettes, Row Density, Accent Focus Rings & Scrollbars | Medium | 50 minutes |
| Verification & Quality Gate | Low | 30 minutes |
| **Total** | | **~3.5 hours** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Working tree clean and git status verified.
- [ ] Baseline test and compilation runs recorded.
- [ ] Display-only behavior confirmed: no note-body write paths introduced.

### Rollback Procedure
1. Revert the phase commits on branch `impl`.
2. Run `npx tsc --noEmit` and `npx vitest run` to verify clean baseline restoration.
3. Verify plugin renders in default Obsidian Light and Dark themes without console errors.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A — strictly display-only CSS custom properties and in-memory view styling; zero persistent note or configuration schema changes.

<!-- /ANCHOR:enhanced-rollback -->
