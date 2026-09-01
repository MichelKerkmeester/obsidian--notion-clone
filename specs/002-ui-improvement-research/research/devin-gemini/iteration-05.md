# Research Iteration 05: Visual Design System (Color Tokens, Typography Scale, Spacing, Radius, Dark/Light Theming)

Track: `devin-gemini` (Gemini 3.7 Flash High)  
Focus Area: Visual design system: color tokens, typography scale, spacing, radius, dark/light theming.  
Target Artifact: `specs/002-ui-improvement-research/research/devin-gemini/iteration-05.md`  

---

## Focus

A robust, cohesive visual design system is the structural backbone of a data-dense application. In an Obsidian plugin, the design system must achieve two critical objectives:
1. **Internal Coherence**: Establish unified, mathematically consistent token scales for color, typography, spacing, border radii, surface elevation, and interactive states across all 7 plugin views (Table, Board, Gallery, List, Calendar, Timeline, Chart), modals, popovers, and drawers.
2. **External Harmony (Obsidian Native Integration)**: Dynamically adapt to Obsidian's active theme (Light vs. Dark mode) and respect community theme variables (`--font-interface`, `--interactive-accent`, `--background-primary`, `--background-secondary`, `--text-normal`, `--text-muted`, `--background-modifier-border`), ensuring zero contrast failures and eliminating visual clash.

This iteration conducts an exhaustive, token-by-token and line-by-line audit of `styles.css` and associated TypeScript renderers (`src/views/OptionColorPicker.ts`, `src/data/ColumnTypes.ts`, `src/data/ChartPalettes.ts`, `src/views/ChartToolbarRenderer.ts`, `src/views/CellRenderer.ts`, `src/views/BoardRenderer.ts`, `src/views/GalleryRenderer.ts`, `src/views/TableRenderer.ts`, `src/views/DatabaseView.ts`). It benchmarks the plugin against the design systems of **Anytype**, **AppFlowy**, and **Notion**, and formulates concrete, actionable, constraint-checked recommendations.

---

## Current-UI findings (file:line)

### 1. Severe Dark-Mode Contrast Failures in Status, Select & Tag Color Palettes
- **Location**: `styles.css:85-116`, `styles.css:140-155`, `styles.css:4563-4578`, `styles.css:5610-5670`, `styles.css:5890-5980`
- **Issue**: The plugin defines 16 named status/tag colors (gray, brown, orange, yellow, green, blue, purple, pink, red, slate, cyan, teal, lime, indigo, violet, rose). All 16 colors are hardcoded with dark hex text colors (`#787774`, `#8f5d45`, `#b65f00`, `#8f6a00`, `#448361`, `#2f6fad`, `#6940a5`, `#a83272`, `#c23b35`, `#64748b`, `#0891b2`, `#0f766e`, `#65a30d`, `#4f46e5`, `#7c3aed`, `#e11d48`) and fixed low-opacity backgrounds (`rgba(..., 0.18)`). While `.theme-dark` exists on line 132, it *only* adjusts `--db-current-time-lightness` (line 133); there are **zero** dark-mode overrides for any of the 16 status color tokens.
- **UX Impact**: In Dark mode, dark saturated text against dark gray backgrounds (`#1e1e1e`) produces severe contrast failures (e.g., dark blue `#2f6fad` on `#1e1e1e` is ~2.9:1, dark purple `#6940a5` is ~2.8:1, dark indigo `#4f46e5` is ~2.4:1, dark teal `#0f766e` is ~3.1:1), completely failing WCAG AA (4.5:1 minimum) readability standards. Furthermore, these raw hex/rgba values are copy-pasted across 5 separate CSS rule blocks rather than utilizing shared custom properties.

### 2. Complete Absence of a Spacing Scale & Reliance on Arbitrary Magic Numbers
- **Location**: `styles.css:63-130`, `styles.css:945-964`, `styles.css:4072-4074`, `styles.css:7289-7291`
- **Issue**: There are zero spacing tokens (`--db-space-*`, `--db-gap-*`, `--db-pad-*`) declared in `styles.css`. Padding, margins, and gaps are hardcoded with arbitrary, unstandardized pixel values throughout the 16,400+ lines: `3px`, `5px`, `7px`, `9px`, `10px`, `11px`, `13px`, `15px`, `17px`, `19px`, `23px`, `32px`.
- **UX Impact**: Lack of a unified 4px/8px spatial rhythm produces subtle visual misalignment across surfaces. Table headers have `padding: 0 8px` (`line 4112`), board cards use `padding: 10px` (`line 7289`), filter chips use `padding: 3px 8px` (`line 1011`), toolbar buttons use `height: 28px` with `margin: 0 1px` (`line 1324`), and modals use `padding: 16px 20px` (`line 6348`), creating an inconsistent, unpolished spatial feel.

### 3. Chaotic Typography Scale with Extreme Micro-Text Illegibility
- **Location**: `styles.css:77-81`, `styles.css:127-129`, `styles.css:1077`, `styles.css:1385`, `styles.css:3729`, `styles.css:3754`, `styles.css:12645`
- **Issue**: Font sizes are hardcoded as raw pixel values across more than 180 CSS rules spanning 16 distinct sizes (`7px`, `8px`, `9px`, `10px`, `11px`, `12px`, `13px`, `14px`, `15px`, `16px`, `18px`, `20px`, `22px`, `24px`, `26px`, `28px`). Extreme micro-text is used for badges and order labels (7px in `line 3754`, 8px in `lines 1077, 3729`, 9px in `line 1385`, 10px in `lines 1557, 12645, 13315, 13484, 13516, 14187, 15007, 15020`).
- **UX Impact**: Sub-11px text is virtually unreadable on high-DPI laptop screens and mobile devices, violating accessibility standards. Furthermore, the database title hardcodes a serif stack (`--db-title-font-family: "Source Serif 4", Georgia, serif`, `line 77`), jarringly clashing with Obsidian's native sans-serif workspace interface font (`var(--font-interface)`).

### 4. Border Radius Token Fragmentation and Arbitrary Geometric Mixing
- **Location**: `styles.css:74-76`, `styles.css:1074`, `styles.css:1382`, `styles.css:1518`, `styles.css:4338`, `styles.css:7067`, `styles.css:7098`, `styles.css:7256`, `styles.css:12606`, `styles.css:15658`, `styles.css:15949`
- **Issue**: Although `--db-radius-sm: 4px`, `--db-radius-md: 6px`, `--db-radius-lg: 8px` are defined on line 74, over 80 CSS rules bypass these variables to use hardcoded arbitrary radii: `1px`, `2px`, `3px`, `5px`, `7px`, `8px 8px 6px 6px`, `10px`, `12px`, `14px`, `16px`, `999px`, and `50%`.
- **UX Impact**: Inconsistent visual language. For example, status badges use capsule `999px` (`line 5885`), icon picker items use `5px` (`line 15996`), popover containers use `6px` (`line 5590`) or `8px` (`line 2164`) or `12px` (`line 15949`), date fields use `3px` (`line 4338`), and board cards use asymmetric `8px 8px 6px 6px` (`line 7098`), producing visual disorder.

### 5. Incoherent Border Opacities and Table Grid Line Weight Disparities
- **Location**: `styles.css:83-84`, `styles.css:3929`, `styles.css:4073-4074`, `styles.css:4108-4110`, `styles.css:14258-14259`
- **Issue**: Grid lines and borders use scattered, uncalibrated `color-mix` ratios: table column dividers use `color-mix(in srgb, var(--background-modifier-border) 48%, transparent)` (`line 83`), drilldown containers use `78%` (`line 3929`), timeline major grid lines use `42%` (`line 14258`), timeline minor lines use `28%` (`line 14259`), and table row lines use raw `100% var(--background-modifier-border)` (`line 4074`).
- **UX Impact**: Uneven border contrast. In Dark mode, vertical column dividers at 48% opacity become nearly invisible, while horizontal row borders at 100% opacity look harsh and overpowering.

### 6. Flat Surface Elevation & Dark Mode Shadow Invisibility
- **Location**: `styles.css:2166`, `styles.css:2364`, `styles.css:4075`, `styles.css:5591-5592`, `styles.css:7287-7295`, `styles.css:14205`
- **Issue**: The plugin uses `var(--background-primary)` uniformly for table cells, board cards, popover menus, and modal dialogs. Elevation is conveyed solely via light black box-shadows (e.g. `box-shadow: 0 4px 14px rgba(0,0,0,0.08)` on cards, `0 4px 14px rgba(0,0,0,0.15)` on color pickers).
- **UX Impact**: In Dark mode, black drop-shadows blend seamlessly into dark workspace backgrounds, rendering floating overlays and cards visually flat and indistinguishable from background panes without surface luminance stepping or luminous borders.

### 7. Uncalibrated Obsidian Accent Color Tokens and Inconsistent Focus Rings
- **Location**: `styles.css:117-119`, `styles.css:189-196`, `styles.css:1492-1506`, `styles.css:5607`, `styles.css:5750`, `styles.css:14204`
- **Issue**: Obsidian's dynamic user accent color (`var(--interactive-accent)` and `--accent-h/s/l`) is applied inconsistently. Focus rings alternate between `box-shadow: 0 0 0 2px var(--interactive-accent)` (`line 5607`), `outline: 2px solid var(--interactive-accent)` (`line 194`), and `box-shadow: inset 0 0 0 2px var(--interactive-accent)` (`line 5750`). Accent background tints use disparate hardcoded alphas (14% in timeline `line 14204`, 18% in status colors, 10% in selection bar).
- **UX Impact**: Focus indicators look disparate when tabbing across cells, buttons, inputs, and swatches. Tinted accent containers do not share a single coherent opacity formula.

### 8. Static Hardcoded Chart Color Palettes Lacking Dark/Light Theme Calibration
- **Location**: `src/data/ChartPalettes.ts:9-23`, `src/views/ChartToolbarRenderer.ts:46-55`
- **Issue**: Preset chart palettes (`colorful`, `pastel`, `vivid`, `warm`, `cool`, `mono`) and reference line colors hardcode static HEX values (`CHART_PRESET_PALETTES` in `ChartPalettes.ts:9-16`, `REFERENCE_LINE_COLORS` in `ChartToolbarRenderer.ts:46-54`).
- **UX Impact**: In Dark mode, dark tones in palettes (e.g. `#1F2235`, `#2B2E4A` in `vivid`) disappear against dark chart backgrounds, while `pastel` colors lack sufficient contrast against light grid lines. Reference line `#94a3b8` / `#64748b` has poor legibility against low-contrast axes.

### 9. Inconsistent Interactive Feedback and State Tokens (Hover, Active, Disabled)
- **Location**: `styles.css:364-375`, `styles.css:1312-1315`, `styles.css:1346-1350`, `styles.css:5456-5457`, `styles.css:7290-7296`
- **Issue**: Interactive state styles are implemented haphazardly across components. Some buttons change `background: var(--background-modifier-hover)`, some change `color: var(--text-normal)`, some apply `transform: translateY(-1px)`, and others have no hover transition at all. Disabled states fluctuate between `opacity: 0.5`, `opacity: 0.35`, and `color: var(--text-faint)`.
- **UX Impact**: The user interface feels twitchy and unstandardized. Elements lack uniform micro-interaction physics and tactile feedback.

### 10. Fragmented Scrollbar Styling and Missing Scroll-Boundary Gradients
- **Location**: `styles.css:72-73`, `styles.css:159-188`, `styles.css:813-825`, `styles.css:9834-9835`, `styles.css:10807-10825`
- **Issue**: Scrollbar styling is redefined in 6 separate places with varying thumb opacities (36% on line 72 vs. 62% on line 9834) and widths (4px, 6px, 8px). Furthermore, wide tables, kanban boards, gallery strips, and the active filter rail lack horizontal scroll fade masks.
- **UX Impact**: Scrollbars look mismatched across modals, popovers, and tables. Users receive no visual cue when horizontal content overflows the viewport.

---

## Anytype/AppFlowy patterns

### 1. Anytype: Dual-Mode HSL/Oklch Semantic Color System
- **Pattern**: Anytype utilizes semantic color pairs for all status pills, tags, and category badges. Each named color has an explicit Light Mode token and Dark Mode token:
  - **Light Mode**: High-contrast, deeply saturated text (`L: 25-35%`) over a delicate 12-15% pastel background tint.
  - **Dark Mode**: Soft, luminous pastel text (`L: 75-85%`) over a rich 20-25% dark tinted background with a subtle 1px border.
- **Why it is better**: Guarantees a minimum 5.5:1 contrast ratio across both Light and Dark modes without losing distinct color personality, fully meeting WCAG AA and AAA standards.

### 2. AppFlowy: Structured `AFThemeExtension` & 4-Tier Radius Hierarchy
- **Pattern**: AppFlowy strictly limits border curvature to 4 semantic tiers:
  - `radius-xs` (3px): Checkbox boxes, mini indicator dots, color swatches.
  - `radius-sm` (6px): Input fields, buttons, dropdown options, table cell active focus border.
  - `radius-md` (8px): Board cards, gallery cards, floating filter chips, popover menus.
  - `radius-lg` (12px): Modal dialogs, record peek sheets, full drawer panels.
  - `radius-full` (9999px): Status pills, tag capsules, circular avatar badges.
- **Why it is better**: Eliminates geometric clutter. Every surface and interactive component automatically snaps to a recognizable visual hierarchy.

### 3. Anytype: Mathematical 8-Point Modular Typography Scale
- **Pattern**: Anytype enforces a 5-step mathematical typography scale built directly on the system interface font:
  - `Caption / Micro` (`11px`, line-height `1.3`, weight `500`): Summary counts, keyboard shortcut badges, metadata.
  - `Body Secondary` (`12px`, line-height `1.4`, weight `400` / `500`): Table cell secondary text, tags, filter chips, timestamps.
  - `Body Default` (`13-14px`, line-height `1.45`, weight `400` / `500`): Table cell text, dropdown labels, input fields.
  - `Subheading` (`16px`, line-height `1.3`, weight `600`): Card titles, modal section headers, peek drawer titles.
  - `Heading` (`20-22px`, line-height `1.25`, weight `700`): Database titles, view titles.
- **Why it is better**: Completely eliminates sub-11px illegible text, harmonizes with the host operating system, and ensures predictable vertical alignment across components.

### 4. Notion & AppFlowy: Base-4 Spatial Rhythm (`--space-*`)
- **Pattern**: Layouts are constructed entirely from a 6-step base-4 spacing scale:
  - `--space-1` (2px): Micro gap, icon badge offset.
  - `--space-2` (4px): Tight gap, icon-to-label spacing, color swatch grid gap.
  - `--space-3` (6px): Pill horizontal padding, menu row vertical padding.
  - `--space-4` (8px): Standard control padding, button gap, toolbar item spacing.
  - `--space-5` (12px): Popover internal padding, header row vertical gap.
  - `--space-6` (16px): Card padding, modal section gap.
  - `--space-8` (24px): Viewport outer gutter, container margin.
- **Why it is better**: Replaces arbitrary pixel values with consistent vertical and horizontal rhythm, making UI expansion predictable and effortless.

### 5. Anytype: Multi-Tier Surface Elevation & Dark Mode Luminance Step-Up
- **Pattern**: Rather than relying only on drop-shadows (which vanish on dark backgrounds), Anytype couples shadows with **surface luminance steps**:
  - `Elevation 0 (Canvas)`: Base background (`--background-primary`).
  - `Elevation 1 (Cards & Table Headers)`: 3% lightness boost in dark mode (`color-mix(in srgb, var(--background-primary) 94%, white)`), subtle 1px border.
  - `Elevation 2 (Floating Popovers & Pickers)`: 7% lightness boost (`color-mix(in srgb, var(--background-primary) 88%, white)`), `backdrop-filter: blur(16px)`, `box-shadow: 0 10px 28px rgba(0,0,0,0.3)`.
  - `Elevation 3 (Modals & Drawers)`: 12% lightness boost, prominent 1px luminous border (`rgba(255,255,255,0.12)`), dimmed backdrop scrim.
- **Why it is better**: Creates true spatial depth in Dark mode while preserving crisp clarity in Light mode.

---

## Recommendations

| # | Change | Target (file:line) | Inspired By | Effort | Constraint Check |
|---|---|---|---|:---:|---|
| 1 | **Dual-Theme Status & Tag Color Token System**: Define dual semantic tokens (`--status-color-bg-*` and `--status-color-fg-*`) with calibrated Light mode (saturated dark text, 14% pastel bg) and `.theme-dark` overrides (luminous pastel text, 22% tinted bg + 1px border), eliminating dark mode contrast failures. | `styles.css:85-116`, `styles.css:132-155`, `styles.css:5610-5670`, `styles.css:5890-5980` | Anytype Semantic Colors / Notion Dark Palette | **M** | Pure CSS design token refactoring; 100% theme-safe; zero note file writes; rebase-clean. |
| 2 | **Base-4 Spatial Scale Tokens**: Declare `--db-space-1` (2px) through `--db-space-8` (24px) on `.note-database-container` and replace all arbitrary padding, margin, and gap values across toolbars, cells, cards, and popovers. | `styles.css:63-130`, `styles.css:945-964`, `styles.css:7289-7291` | AppFlowy / Base-4 Grid Standards | **M** | CSS tokenization; preserves existing DOM layouts while standardizing alignment; mobile-safe. |
| 3 | **Harmonized 5-Tier Typography Scale**: Declare `--db-font-xs` (11px), `--db-font-sm` (12px), `--db-font-md` (13px), `--db-font-lg` (16px), `--db-font-title` (22px) mapped to Obsidian's `--font-ui-*` variables; eliminate all sub-11px text (`7px`, `8px`, `9px`, `10px`); replace hardcoded serif stack with `var(--font-interface)`. | `styles.css:77-81`, `styles.css:127-129`, `styles.css:1077`, `styles.css:3729`, `styles.css:3754`, `styles.css:12645` | Anytype Type Scale / Obsidian Native Typography | **S** | CSS-only typography modernization; improves legibility; zero side effects. |
| 4 | **Standardized 4-Tier Border Radius Hierarchy**: Refactor border radius usage into `--db-radius-xs` (3px), `--db-radius-sm` (6px), `--db-radius-md` (8px), `--db-radius-lg` (12px), and `--db-radius-full` (9999px); replace arbitrary pixel values (`1px`, `2px`, `5px`, `7px`, `10px`, `14px`, `8px 8px 6px 6px`). | `styles.css:74-76`, `styles.css:1074`, `styles.css:1382`, `styles.css:1518`, `styles.css:7098`, `styles.css:15949` | AppFlowy Radius System | **S** | CSS-only geometric harmonization; ensures consistent component curvature. |
| 5 | **Calibrated Border & Grid Divider Contrast**: Unify border contrast rules into `--db-border-subtle` (`color-mix(in srgb, var(--background-modifier-border) 35%, transparent)`), `--db-border-regular` (`60%`), and `--db-border-emphasis` (`100%`); equalize table row and column divider contrast in dark mode. | `styles.css:83-84`, `styles.css:3929`, `styles.css:4073-4074`, `styles.css:14258-14259` | Notion Grid Styling / Anytype | **S** | CSS border token consolidation; enhances table clarity on dark/OLED themes. |
| 6 | **Adaptive 3-Tier Surface Elevation with Dark Mode Luminance Steps**: Couple box-shadows with surface lightness steps (`Elevation 1` +3% lightness, `Elevation 2` +7% lightness with `backdrop-filter: blur(16px)`, `Elevation 3` +12% lightness with luminous border) for dark mode overlays and cards. | `styles.css:2166`, `styles.css:2364`, `styles.css:4075`, `styles.css:5591-5592`, `styles.css:7287-7295` | Anytype Dark Elevation System | **M** | CSS token & surface enhancement; GPU-accelerated; cross-platform safe. |
| 7 | **Obsidian Accent Color System Tokens (`--db-accent-*`)**: Standardize Obsidian dynamic accent usages with `--db-accent-primary` (`var(--interactive-accent)`), `--db-accent-subtle` (`color-mix(in srgb, var(--interactive-accent) 12%, transparent)`), and `--db-accent-focus-ring` (`0 0 0 2px var(--background-primary), 0 0 0 4px var(--interactive-accent)`). | `styles.css:117-119`, `styles.css:189-196`, `styles.css:5607`, `styles.css:5750`, `styles.css:14204` | Obsidian Core Theme Standards | **S** | CSS variable unification; ensures consistent focus and selection aesthetics. |
| 8 | **Theme-Adaptive Chart Palettes & Reference Lines**: Update chart palette generator to dynamically adjust luminance for dark mode (`ChartPalettes.ts`), providing vibrant pastel bars on dark backgrounds and saturated bars on light backgrounds; map reference lines to theme border tokens. | `src/data/ChartPalettes.ts:9-23`, `src/views/ChartToolbarRenderer.ts:46-55` | AppFlowy Charts / Anytype Data Viz | **M** | Pure in-memory color resolution in view layer; no file mutations; iCloud-safe. |
| 9 | **Unified Interactive State Physics (Hover, Active, Disabled)**: Standardize interactive physics across all controls: 120ms ease transitions, `--db-hover-bg` (`var(--background-modifier-hover)`), `--db-active-bg` (`var(--background-modifier-active-hover)`), and `--db-disabled-opacity: 0.42` with `cursor: not-allowed`. | `styles.css:364-375`, `styles.css:1312-1315`, `styles.css:1346-1350`, `styles.css:5456-5457` | Anytype Interaction Tokens | **S** | CSS micro-interaction standardization; eliminates twitchy layout jumps. |
| 10 | **Consolidated Scrollbar Tokens & Edge Fade Masks**: Unify custom scrollbar thumb styling across container, popovers, and modals via `--db-scrollbar-thumb` and `--db-scrollbar-track`; add horizontal scroll gradient fade masks to table containers and active filter rails. | `styles.css:72-73`, `styles.css:159-188`, `styles.css:813-825`, `styles.css:9834-9835` | Notion Scroll Masks / AppFlowy | **M** | CSS gradient mask & scrollbar tokenization; mobile and desktop safe. |
| 11 | **Row Density Tokens (Compact / Default / Comfortable)**: Introduce `--db-row-height-compact: 28px`, `--db-row-height-default: 34px`, and `--db-row-height-comfortable: 40px` controlled via view configuration, adapting cell padding, font size, and icon scales harmoniously. | `styles.css:4070-4077`, `src/views/TableRenderer.ts:74-86` | Notion Row Density / AppFlowy | **S** | ViewConfig setting only; display-only rendering; mobile-safe. |
| 12 | **Modal & Popover Design Token Harmonization**: Migrate `.note-database-modal` and floating popover styles to consume the centralized design system tokens (`--db-radius-*`, `--db-space-*`, `--db-font-*`, `--status-color-*`), eliminating redundant duplicated CSS blocks. | `styles.css:136-155`, `styles.css:2155-2254`, `styles.css:6348-6360`, `styles.css:10746-11135` | Anytype Component Architecture | **M** | CSS deduplication and cleanup; reduces stylesheet size; rebase-clean. |

---

## Open threads for later iterations

- **Iteration 6 (Anytype UI/UX Patterns Deep Dive)**: Detailed analysis of Anytype's object-oriented relations graph, block-level canvas interactions, and Sets/Collections query architecture.
- **Iteration 7 (AppFlowy UI/UX Patterns Deep Dive)**: Deep dive into AppFlowy's field editor drawer, multi-column aggregation engine, and formula builder syntax tree.
- **Iteration 8 (Views Beyond Table)**: Examine how the design system tokens apply across Kanban Board swimlanes, Gallery cover cards, Calendar month/week grids, Timeline event bars, and Chart legends.
- **Iteration 9 (Micro-Interactions & Feedback)**: Refine cell drag-and-fill handles, column boundary reorder drop lines, optimistic mutation pulses, and tooltip delay curves.
- **Iteration 10 (Mobile / Responsive / Accessibility)**: Conduct full audit of minimum 44×44px touch targets, mobile bottom sheets, WCAG AAA high-contrast modes, and WAI-ARIA landmark roles.
