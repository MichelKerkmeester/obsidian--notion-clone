---
title: "Tasks: Design Tokens and Typography"
description: "Ranked task breakdown for the visual design system: dual-theme status and tag color token system with WCAG AA compliance, base-4 spatial scale tokens, harmonized 5-tier typography scale with Obsidian native font integration, 4-tier border radius hierarchy, calibrated border divider contrast, 3-tier adaptive surface elevation with dark-mode luminance steps, layered emphasis conditional formatting, theme-adaptive chart color palettes, configurable row density tokens, scoped color-scheme policy, standardized Obsidian dynamic accent focus rings, and consolidated scrollbar tokens."
trigger_phrases:
  - "design tokens tasks"
  - "color tokens tasks"
  - "typography scale tasks"
  - "spacing tokens tasks"
  - "radius hierarchy tasks"
  - "dark light theming tasks"
  - "dual theme status colors tasks"
  - "surface elevation tasks"
  - "row density tasks"
  - "theme adaptive chart palette tasks"
  - "focus ring tasks"
  - "border divider tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/005-design-tokens-typography"
    last_updated_at: "2026-08-28T04:30:57Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled design tokens and typography task documentation"
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
# Tasks: Design Tokens and Typography

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|---|---|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred out of this phase |

**Task Format**: `T### [P?] Description (file path) [effort tier]`

Tasks below follow the research synthesis's RANKED BACKLOG order (rank # in parentheses). Effort tiers (S/M/L) come from the research synthesis.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read this phase's decision-ready findings and evidence trail (`specs/public/002-ui-improvement-research/research/synthesis.md:1-20`, `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-05.md`, `specs/public/002-ui-improvement-research/research/codex-luna/iteration-05.md`) [S]
- [x] T002 Record the fork's baseline build and test state (`npx tsc --noEmit`, `npm run build`, `npx vitest run`) (`vitest.config.ts:1-9`) [S]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Task order follows the research synthesis RANKED BACKLOG (rank # shown per task).

- [x] T010 **(rank 1) Dual-Theme Status & Tag Color Token System (WCAG AA)**: Define dual semantic tokens (`--status-color-bg-*` and `--status-color-fg-*`) across all 16 status colors (gray, brown, orange, yellow, green, blue, purple, pink, red, slate, cyan, teal, lime, indigo, violet, rose) with calibrated Light mode (dark saturated text, 14-18% pastel bg) and `.theme-dark` overrides (luminous pastel text, 22-26% tinted bg + 1px subtle border) meeting WCAG AA (>4.5:1 contrast) (`styles.css:85-116, 132-156, 4563-4578, 5610-5670, 5890-5980`, `src/data/OptionRegistration.ts:9-12`, `src/data/RecordIcon.ts:1-12`) [M]
- [x] T011 **(rank 1, deduplication portion) Unify Option Color Declarations**: Deduplicate option palette hex literals across `.db-option-color-*`, `.db-num-color-*`, `.status-badge`, and record icons to consume central `--status-color-*` tokens (`styles.css:6632, 4563-4578, 5606-5671, 5890-5998, 15922-16015`) [S]
- [x] T012 **(design tokens backlog 2) Base-4 Spatial Scale Tokens**: Declare `--db-space-1: 2px` through `--db-space-8: 24px` on `.note-database-container` and `.note-database-modal` and replace arbitrary magic padding/margins across toolbars, table cells, cards, filter chips, and modals (`styles.css:63-130, 945-964, 4070-4077, 7289-7291`) [M]
- [x] T013 **(quick win 2) Harmonize Database Title Typography**: Replace hardcoded serif font stack (`--db-title-font-family: "Source Serif 4", ...`) with Obsidian's native `var(--font-interface)` and set default title size to `--db-font-title` (`styles.css:77, 705-750, 900-929`) [S]
- [x] T014 **(design tokens backlog 11) Harmonized 5-Tier Typography Scale & Tabular Numerals**: Declare `--db-font-xs: 11px` (caption, line-height 1.3, weight 500), `--db-font-sm: 12px` (secondary text, line-height 1.4), `--db-font-md: 13px` (body default, line-height 1.45), `--db-font-lg: 16px` (subheading, line-height 1.35, weight 600), and `--db-font-title: 22px` (heading, line-height 1.25, weight 700); eliminate sub-11px micro-text (`7px`, `8px`, `9px`, `10px` in `styles.css:1077, 1385, 3729, 3754, 12645`); apply `tabular-nums` to numbers, dates, summaries, and record counts (`styles.css:77-81, 120-130, 3425-3492, 4044-4119`) [S]
- [x] T015 **(design tokens backlog 3) Standardized 4-Tier Border Radius Hierarchy**: Unify all border radius declarations into `--db-radius-xs: 3px`, `--db-radius-sm: 4px`, `--db-radius-md: 6px`, `--db-radius-lg: 8px`, and `--db-radius-full: 9999px` across container, modal, and portal scopes (`styles.css:74-76, 136-139, 1074, 1382, 1518, 2931-2933, 4338, 7098, 9830-9833, 15949`) [S]
- [x] T016 **(design tokens backlog 4) Calibrated Border & Grid Divider Contrast**: Unify border divider tokens into `--db-border-subtle` (40%), `--db-border-regular` (70%), and `--db-border-emphasis` (100%) to equalize vertical/horizontal grid contrast on dark/OLED themes (`styles.css:83-84, 3929, 4073-4074, 4108-4110, 14258-14259`) [S]
- [x] T017 **(design tokens backlog 5) Define 3-tier adaptive surface elevation & dark mode luminance steps**: declare `--db-elevation-1`, `--db-elevation-2`, and `--db-elevation-3` with box-shadows and dark-mode background lightness step-ups (+3% cards, +7% popovers with the shared `backdrop-filter: blur(12px)` contract, +12% modals with luminous 1px border `rgba(255,255,255,0.12)`) (`styles.css:114, 2364, 4075, 5591-5592, 7287-7295, 16429-16460`) [M]
- [x] T018 **(design tokens backlog 6) Layered Emphasis Conditional Formatting**: Refactor conditional formatting from opaque background fills to layered, theme-aware background tints (`--db-conditional-format-bg: color-mix(in srgb, var(--status-color-bg-[color]) 60%, transparent)`), readable foregrounds (`--db-conditional-format-fg: var(--status-color-fg-[color])`), and 2px left accent indicators (`src/data/ConditionalFormatting.ts:135-165`, `styles.css:469-496`, `src/views/ViewConfigPanelRenderer.ts:829-893`) [M]
- [x] T019 **(design tokens backlog 7) Theme-Adaptive Chart Color Palettes & Container Scope**: Implement theme-adaptive chart color palette generation in `src/data/ChartPalettes.ts:9-23`, scope `ThemeColors` resolution in `src/views/ChartRenderer.ts:75-93, 1565-1594` to the database container context, and map reference lines in `src/views/ChartToolbarRenderer.ts:46-55` [L]
- [x] T020 **(design tokens backlog 8) Define Configurable Row Density Tokens**: Declare `--db-row-height-compact: 28px`, `--db-row-height-default: 34px`, and `--db-row-height-comfortable: 40px` with adapted padding and font size rules in `styles.css:4070-4077`; Phase 002 consumes them in `src/views/TableRenderer.ts:74-86` [S]
- [x] T021 **(design tokens backlog 9) Scoped `color-scheme` Policy & Portal Token Propagation**: Declare `color-scheme: light dark` on `.note-database-container`, `.note-database-modal`, and all body-hosted floating portals (`.db-color-picker-popup`, `.db-icon-picker-popover`, `.db-dropdown-popover`) in `styles.css:63-156, 2936-2992`, `src/views/OptionColorPicker.ts:15-16`, and `src/views/IconPickerPopover.ts:23-27` [S]
- [x] T022 **(rank 9, focus ring portion) Standardized Obsidian Dynamic Accent System & Focus Rings**: Define `--db-accent-primary`, `--db-accent-hover`, `--db-accent-subtle`, and `--db-accent-focus-ring: 0 0 0 2px var(--background-primary), 0 0 0 4px var(--interactive-accent)` with standardized `:focus-visible` styling (`styles.css:122, 189-206, 5607, 5750, 14204`) [S]
- [x] T023 **(design tokens backlog 10) Consolidated Scrollbar Tokens & Horizontal Edge Fade Masks**: Unify custom scrollbars via `--db-scrollbar-thumb` and `--db-scrollbar-thumb-hover` and apply horizontal CSS gradient fade masks to table containers and active filter rails (`styles.css:72-73, 159-188, 813-825, 9834-9835, 10807-10825`) [M]
- [x] T024 **(iteration 05 rec 9) Unified Interactive State Physics & Disabled Token Contract**: Declare `--db-transition-fast: 120ms ease`, `--db-hover-bg`, `--db-active-bg`, `--db-disabled-opacity: 0.40`, and `--db-disabled-cursor: not-allowed` across cells, cards, group labels, and pickers (`styles.css:125, 1312-1315, 1346-1350, 5456-5457, 7290-7296`, `src/views/GroupLabelRenderer.ts:35-46`, `src/views/NumberDisplayRenderer.ts:1-75`) [S]

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Unit & Integration Tests
- [x] T050 Run TypeScript compilation and build gate (`npx tsc --noEmit`, `npm run build`) (`package.json:1-38`) [S]
- [x] T051 Run Vitest test suite (`npx vitest run`, 355 tests across 45 files) (`vitest.config.ts:1-9`) [S]
- [x] T052 Verify WCAG AA contrast ratio (>= 4.5:1) across all 16 status colors in Light and Dark modes (`styles.css:85-116`) [S]
- [x] T053 Verify typography scale, native interface font integration, zero sub-11px micro-text, and tabular numerals (`styles.css:705-750`) [S]
- [x] T054 Verify 3-tier surface elevation, dark-mode luminance step-ups, and layered conditional formatting tints (`styles.css:2166-2368`) [S]
- [x] T055 Verify theme-adaptive chart color palettes and row density switching (Compact/Default/Comfortable) (`src/data/ChartPalettes.ts:9-23`, `styles.css:4070-4077`) [S]
- [x] T056 Verify display-only rendering: zero writes to note frontmatter or bodies occur during theme/token interactions (`styles.css:63-156`) [S]

### Documentation
- [x] T057 Update `checklist.md` evidence and `implementation-summary.md` with verification results (`checklist.md:1-10`) [S]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All 25 tasks completed and verified with zero compiler or test errors (`tasks.md:66-116`, `355 tests across 45 files`).
- [x] P0 acceptance criteria (REQ-001 through REQ-006) met and verified (`checklist.md:48-75`).
- [x] P1 acceptance criteria (REQ-007 through REQ-013) met or user-approved (`checklist.md:76-106`).
- [x] `checklist.md` fully verified with P0/P1 counts recorded (`checklist.md:48-106`).
- [x] `implementation-summary.md` updated with final build details (`implementation-summary.md:1-10`).

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:cross-refs -->
