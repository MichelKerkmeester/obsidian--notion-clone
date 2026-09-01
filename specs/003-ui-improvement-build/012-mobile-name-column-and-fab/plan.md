---
title: "Implementation Plan: Mobile Name Column and New-Button Reach"
description: "How three phone defects left by 011 are fixed: give the title cell an intrinsic content width so the auto-layout name column stops collapsing, render the open affordance as a touch icon so its width goes to the name, and add the measured phone nav-bar height to the floating New button's bottom offset so it clears the footer bar."
trigger_phrases:
  - "mobile name column and fab plan"
  - "title column auto-fit correction plan"
  - "fab nav bar clearance plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/012-mobile-name-column-and-fab"
    last_updated_at: "2026-08-29T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored plan from the 011 auto-fit reading"
    next_safe_action: "None; gates green"
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
# Implementation Plan: Mobile Name Column and New-Button Reach

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Three independent phone defects, each a small, `is-phone`-scoped correction on top of the untouched desktop CSS and the 011 auto-fit work.

The **name column** collapses because it is the only column whose content declares its own width instead of being sized by it: the title link is `width: 100%` inside an `overflow: hidden` wrapper, which contributes no intrinsic width, so `table-layout: auto` shrinks it to the minimum while the intrinsically-sized value cells hug their content. The fix gives the link an intrinsic `max-content` width with a floor and a cap on the phone, so the name column reaches the auto algorithm like the others.

The **open affordance** still carries a text label; on touch it is always visible over the narrow name. The sibling record-detail panel already renders its open control as a `maximize-2` icon — the fix adopts the same `setIcon` form on touch and keeps the text on desktop, where the button appears only on hover.

The **floating New button** is fixed to the viewport and offset only by the safe-area inset, so it lands under Obsidian's footer nav bar. The fix reuses the codebase's existing `.mobile-navbar` measurement (from `popover-position.ts`) to publish the bar's height as a custom property the FAB's bottom offset adds to the safe-area inset.

<!-- /ANCHOR:summary -->
<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

Run from the repo root; read output and exit status, never `$?` through a pipe.

| Gate | Baseline | Required |
|------|----------|----------|
| `npx tsc --noEmit` | 0 | 0 |
| `npm run build` | 0 | 0 |
| `npx vitest run` | 396 passing | no fewer; new coverage may raise it |
| `npm run screenshots` | 196 captured | recaptured after the styles.css / fixture change |
| `npm run screenshots:verify` | 196 entries current | all current |
| `npm run lint` | 115 problems (100 errors, 15 warnings) | no increase — known baseline, not a target |
| `run-source-gates.sh` | all PASS | all PASS |

<!-- /ANCHOR:quality-gates -->
<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Title column sizing (REQ-001)
`.is-phone .note-database-container td.db-title-cell a { width: max-content; min-width: 128px; max-width: 60vw }` (`styles.css:18153`). Higher specificity and later in the file than the base `.db-title-cell a { width: 100% }` (`5380`), so it wins on the phone only. `width: max-content` lets the link's intrinsic width propagate to the auto-layout column; `128px` floors a short name; `60vw` caps a long one, after which `.db-file-title-name`'s existing `overflow: hidden; text-overflow: ellipsis` (`5462`) takes over.

### Open-affordance clearance and icon (REQ-002)
- `.is-phone .note-database-container td.db-record-open-host { padding-right: 32px }` (`styles.css:18161`) reserves the always-visible affordance's width so the name is not clipped under it.
- `attachTitleOpenAffordance` branches on `isTouchDevice(td)`: on touch it adds `db-record-open-btn-icon` and calls `setIcon(button, "maximize-2")`; on desktop it keeps `button.textContent = t("panel.open")` (`table-record-peek.ts:83-90`). The `aria-label` is set unconditionally. Icon sizing: `.db-record-open-btn.db-record-open-btn-icon { width: 24px; padding: 0 }` with a 16px `.svg-icon` (`styles.css:18137`).

### FAB nav-bar clearance (REQ-003)
- The FAB offset becomes `inset-block-end: calc(20px + env(safe-area-inset-bottom) + var(--db-mobile-navbar-height, 0px))` (`styles.css:18988`).
- `ToolbarRenderer.reserveMobileFabInset` (`toolbar-renderer.ts:2239`), called when the New button renders on touch, reads `.mobile-navbar`'s height (50px fallback, 0 off `is-phone`) and publishes it via `container.setCssProps({ "--db-mobile-navbar-height": ... })`. The container is an ancestor of the FAB, so the custom property inherits to it through the fixed-positioned element.

### Reproduction & regression (REQ-005)
`table-mobile` (`core.mjs`) renders the real title cell — `db-title-cell` → `a.internal-link` → `db-file-title-inline` → `db-file-title-name` — plus the `db-record-open-btn-icon` button, so the mobile capture exercises the collapse and its fix. `table-record-peek.test.ts` gains the touch icon-path assertion; the fixture class guard confirms every class exists in the shipped tree.

<!-- /ANCHOR:architecture -->
<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

1. Read the 011 auto-fit CSS and the title-cell/affordance/FAB code to pin why the name column is special under `table-layout: auto`.
2. Title-cell phone sizing + affordance right-padding (CSS).
3. Open affordance as a touch icon (renderer) + icon sizing (CSS); complete the test's obsidian mock and add the touch-path test.
4. FAB nav-bar term (CSS) + `reserveMobileFabInset` measurement (renderer).
5. Enrich the `table-mobile` scenario with the real title cell + icon; recapture; eyeball the mobile PNG.
6. Whole gate from the final state.

<!-- /ANCHOR:phases -->
<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

- **Visual**: `table-mobile` at phone width — eyeballed; the name column hugs content, the overlong name caps, and the affordance is an icon.
- **Unit**: `table-record-peek.test.ts` asserts the touch path sets the `maximize-2` icon, keeps the `aria-label` and carries no text label; the desktop path keeps the text label.
- **Whole gate**: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots`, `npm run screenshots:verify`, `npm run lint`, `run-source-gates.sh`.
- **Honest gaps**: the FAB clearance and the pointer/measurement path are not visible in a static shot; they are verified by the CSS term, the code and the `popover-position.ts` precedent, and left to the operator's on-device check.

<!-- /ANCHOR:testing -->
<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

- Obsidian supplies the `is-phone` body class and the `.mobile-navbar` element; the mobile rules key off the class and the FAB reserve measures the bar. A narrow viewport without `is-phone` is only a cramped desktop and is left unchanged.
- Pointer capability (`isTouchDevice`) gates the icon form; that is a different question from `is-phone` and the two are kept separate.
- `setCssProps` is required for the dynamic custom-property write; direct `element.style.*` assignment is rejected by the repository's Obsidian lint rule.
- The capture harness needs a system Chrome and renders fixture markup, not the real renderers, so it cannot prove the plugin emits this markup — only the device can.

<!-- /ANCHOR:dependencies -->
<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

The three fixes are independent and additive. Each reverts alone: the title-cell block and the affordance padding are `is-phone` CSS; the icon form is one `isTouchDevice` branch in `table-record-peek.ts` plus its sizing rule; the FAB reserve is one CSS term plus `reserveMobileFabInset`. Reverting all three restores the pre-phase behaviour with no schema, data or config change. Regenerating captures with `npm run screenshots` restores the manifest after any revert.

<!-- /ANCHOR:rollback -->
---

## 8. CROSS-REFERENCES

- **Specification**: See `spec.md`
- **Task Breakdown**: See `tasks.md`
- **Implementation Summary**: See `implementation-summary.md`
