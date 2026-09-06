---
title: "Resource Map — Research the phone-sheet family of the note-database Obsidian plugin (specs/005-component-surface-system children 044-phone-sheet-alignment, 048-stacked-sheets, 051-modal-and-sheet-componentization) for the remaining defects and parity gaps against Anytype's mobile sheets, to feed an Opus synthesis that will update or add phases. Bounded scope, explicit file list -- read these and nothing beyond them unless a finding requires one more file: src/views/mobile-bottom-sheet.ts, src/views/overlay-stack.ts, src/views/surface-shell.ts, src/views/popover-host.ts, src/views/sheet-grammar.ts, src/views/modals/confirm-modal.ts, src/views/confirm-sheet.ts, src/views/column-manager-renderer.ts, src/views/view-config-panel-renderer.ts, src/views/record-surface/record-header.ts, the sheet blocks of styles.css (grep for db-mobile-bottom-sheet, db-shell-, db-sheet-), tools/live/sheet-grammar.mjs and tools/live/host-modal-stand-in.ts, tools/live/sheet-rebuild.mjs, tools/storybook/verify-placement.mjs, specs/005-component-surface-system/044-phone-sheet-alignment/{goal.md,design-trueup.md,decision-record.md,tasks.md}, 048-stacked-sheets/{goal.md,decision-record.md,tasks.md,acceptance-criteria.md}, 051-modal-and-sheet-componentization/{goal.md,design-trueup.md,decision-record.md,tasks.md,acceptance-criteria.md,implementation-summary.md}, specs/005-component-surface-system/design-system.md and roadmap.md section 4 rows 40, 41, 43, 59 and section 6A, and the Anytype README index screenshots/anytype/README.md plus the measured values already recorded in 051/design-trueup.md (DO NOT open image files -- you cannot read PNGs; use the recorded measurements and README descriptions only). Operator reports to explain and close: 2026-09-06 10:04 iOS 'this sheet is really bad bugged' (duplicate close control, split header/body backgrounds, blank space above the title, parent bleed -- fixed at be578988/e632a1e1, device confirmation pending); earlier reports that sheets still looked like the old ones, that some sheets overflowed horizontally, and that stacked sheets did not look or work right. Questions to answer with file:line evidence: which grammar elements still diverge from Anytype's measured sheet (frame, handle, header, rows, actions, safe area, motion, scrim, stacking depth rules); which DbModal subclasses and FuzzySuggestModal outliers still bypass the shell (051 T010); where the lane coverage has holes (which shell deliverables have no permanent row); which iOS/WebKit-specific behaviours the Chromium harness cannot see (keyboard avoidance, safe-area insets, rubber-band scrolling, sheet drag-to-dismiss, focus/scroll restoration) and how each could be verified; what a ranked remediation plan looks like as concrete phase tasks with thresholds and red-first checks. Rank findings by user impact; cite every claim by file:line or a recorded measurement; mark inferences as inferences."
description: "Auto-generated research resource map from convergence evidence."
---
# Resource Map

<!-- SPECKIT_TEMPLATE_SOURCE: resource-map | v1.1 -->

---

## Summary

- **Total references**: 0
- **By category**: READMEs=0, Documents=0, Commands=0, Agents=0, Skills=0, Specs=0, Scripts=0, Tests=0, Config=0, Meta=0
- **Missing on disk**: 0
- **Scope**: research convergence output for 051-modal-and-sheet-componentization
- **Generated**: 2026-09-06T14:48:36.236Z

> **Action vocabulary**: `Created` · `Updated` · `Analyzed` · `Removed` · `Cited` · `Validated` · `Moved` · `Renamed`.
> **Status vocabulary**: `OK` · `MISSING` · `PLANNED`.

---

## Lineage Delta Sources

| Lineage | Delta |
|---------|-------|
| glm-devpass | lineages/glm-devpass/deltas/iter-001.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-002.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-003.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-004.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-005.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-006.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-007.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-008.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-009.jsonl |
| glm-devpass | lineages/glm-devpass/deltas/iter-010.jsonl |
