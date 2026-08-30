---
title: "Feature Specification: Add View Surface Redesign"
description: "Rebuild the Add View surface against the design system: one control idiom per job, one affordance per action, a real grouping, and sheet presentation on a phone."
trigger_phrases:
  - "add view sheet"
  - "add view popover"
  - "duplicate current view"
  - "view type picker"
  - "013 add view"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/013-add-view-sheet"
    last_updated_at: "2026-08-30T21:15:00Z"
    last_updated_by: "criteria-adjudication"
    recent_action: "Redesign shipped and verified; criteria adjudicated in goal.md against the run"
    next_safe_action: "Run AC-6's two heading controls and vitest add-view-popover-layout.test.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "../../../../screenshots/components/add-view-popover-mobile-dark.png"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-013"
      parent_session_id: null
    completion_pct: 85
    open_questions: []
    answered_questions: []
---
# Feature Specification: Add View Surface Redesign

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md). Depends on `011-mobile-menu-presentation` for
> sheet presentation on a phone, and shares the row grammar that phase unified.

<!-- ANCHOR:problem -->
## 1. THE REPORT

The operator: *"Add view sheet is real bad for example, def needs fresh design agent review and
alignment with design system."*

The committed captures are `screenshots/components/add-view-popover-{desktop,mobile}-{light,dark}.png`.

## 2. WHAT IS VISIBLY WRONG, from the capture — each to be confirmed, not assumed

The mobile capture is the clearest. **Some of these may be fixture artifacts rather than product
defects; establish which before designing anything.** This surface's fixture is hand-written markup
like every other, and a previous phase in this program spent hours on a defect that existed only in
a fixture.

1. **"Duplicate current view" appears twice** — once as a checkbox row near the top, once as a menu
   row at the bottom. Either they do different things and are named identically, or they are the
   same action offered twice. Both are defects; which one decides the fix.
2. **An unlabelled `Cost` dropdown.** Nothing says what the field is. A control with no name is also
   a WCAG 4.1.2 failure, and this program has already found seven other unlabelled inputs in a
   sibling file.
3. **Six control idioms in one surface**: two text inputs, a select, a checkbox, four picker cards
   and a menu row — each with its own height, inset and border treatment.
4. **The four view-type cards each carry two horizontal rules under the icon** that read as skeleton
   placeholders rather than content. Check the fixture before believing it.
5. **No grouping.** Name, source, duplicate, icon and type are one flat stack; nothing separates the
   thing being made from the options that shape it.
6. **It is a popover on a phone, not a sheet** — the presentation `011` established for this family.

## 3. WHAT GOOD LOOKS LIKE

Judge against `sk-design` and against the surfaces this program has already brought into line: the
record sheet (`003`, `010`) and the owned menu (`001`, `011`). Concretely — one row grammar shared
with those surfaces, one control per job, the primary action distinguishable from the options, and
a phone presentation that matches every other sheet.

The stylesheet's own scales outrank the skill's defaults where they exist: `--db-space-*`,
`--db-font-*`, the three-step elevation at `styles.css:69-71`, and the sheet fill token every sheet
now shares.
<!-- /ANCHOR:problem -->

<!-- ANCHOR:scope -->
## 4. CONSTRAINTS

- **Desktop is in scope too** — the same surface is a popover there and has the same idiom problem.
- Do not regress the sheet checks in `verify-placement`; they cover the floor, the navigation bar,
  the backdrop and the grab band.
- The row grammar is now keyed to the row rather than to the owned menu's shell. Reuse it; do not
  author a seventh idiom.
- Comment hygiene: no spec paths, phase numbers or task ids in code comments.
<!-- /ANCHOR:scope -->

<!-- ANCHOR:success-criteria -->
## 5. ACCEPTANCE CRITERIA

Written by the phase. Each needs a number with a threshold shown failing first, a check that drives
the production path, and an image a person opened.
See [`acceptance-criteria.md`](acceptance-criteria.md).
<!-- /ANCHOR:success-criteria -->
