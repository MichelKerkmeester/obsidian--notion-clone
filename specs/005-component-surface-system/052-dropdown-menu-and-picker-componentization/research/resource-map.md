---
title: "Resource Map — Research how Notion's UI for dropdowns, context menus, option and relation pickers, icon and colour pickers, date pickers, search-in-menu, and submenus should refine the note-database Obsidian plugin's surface. Use the Notion screen digest at specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/notion-screens-digest.md as the ONLY source of Notion facts (written by an image-capable analyst from Mobbin captures; you cannot read PNG files - NEVER open image files). Compare against our implementation and design record: src/views/dropdown-field.ts, src/views/owned-menu.ts, src/views/menu-row.ts, src/views/popover-host.ts, src/views/popover-position.ts, src/views/record-surface/cell-editor-*.ts, the menu/popover blocks of styles.css, specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/{goal.md,design-trueup.md,decision-record.md,tasks.md}, specs/005-component-surface-system/design-system.md, and roadmap.md section 6A rulings. BOUNDED SCOPE: read those files and nothing beyond them unless a finding requires one more source file. OPERATOR CONTEXT: Anytype parity is the default ruling for these surfaces (051 ADR-007, 056, 057); Notion refinements are additive - where Notion and Anytype disagree, name the conflict and propose which to adopt with the reason, and NEVER override a landed operator ruling. Questions to answer with file:line and screen-id evidence: (1) which Notion patterns from the digest would improve this surface for a user, ranked by user impact; (2) for each, the concrete change to our code and CSS (file, rule/function, value) and its measurable threshold; (3) which Notion behaviours we already have; (4) which conflict with an Anytype ruling; (5) which need a device-only check; (6) a ranked remediation plan as concrete phase tasks with thresholds and red-first checks suitable for a new child phase. Cite every claim; mark inferences as inferences."
description: "Auto-generated research resource map from convergence evidence."
---
# Resource Map

<!-- SPECKIT_TEMPLATE_SOURCE: resource-map | v1.1 -->

---

## Summary

- **Total references**: 0
- **By category**: READMEs=0, Documents=0, Commands=0, Agents=0, Skills=0, Specs=0, Scripts=0, Tests=0, Config=0, Meta=0
- **Missing on disk**: 0
- **Scope**: research convergence output for 052-dropdown-menu-and-picker-componentization
- **Generated**: 2026-09-06T15:59:00.087Z

> **Action vocabulary**: `Created` · `Updated` · `Analyzed` · `Removed` · `Cited` · `Validated` · `Moved` · `Renamed`.
> **Status vocabulary**: `OK` · `MISSING` · `PLANNED`.

---

## Lineage Delta Sources

| Lineage | Delta |
|---------|-------|
| glm-openrouter-dropdowns | lineages/glm-openrouter-dropdowns/deltas/iter-001.jsonl |
| glm-openrouter-dropdowns | lineages/glm-openrouter-dropdowns/deltas/iter-002.jsonl |
| glm-openrouter-dropdowns | lineages/glm-openrouter-dropdowns/deltas/iter-003.jsonl |
| glm-openrouter-dropdowns | lineages/glm-openrouter-dropdowns/deltas/iter-004.jsonl |
| glm-openrouter-dropdowns | lineages/glm-openrouter-dropdowns/deltas/iter-005.jsonl |
