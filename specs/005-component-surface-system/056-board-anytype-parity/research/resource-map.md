---
title: "Resource Map — Research how Notion's UI for the kanban board view (columns, column headers, cards, card properties, add-card, group menus, drag, page scrolling, sticky scrollbar, phone board) should refine the note-database Obsidian plugin's surface, using the Notion screen digest at specs/005-component-surface-system/056-board-anytype-parity/notion-screens-digest.md as the ONLY source of Notion facts (it was written by an image-capable analyst from the Mobbin captures; you cannot read PNG files - never open image files), against our implementation and design record: src/views/board-renderer.ts src/views/board-card-fields.ts src/views/board-card-properties-panel.ts the db-kanban-* block of styles.css specs/005-component-surface-system/056-board-anytype-parity/{goal.md,design-trueup.md,decision-record.md,tasks.md,acceptance-criteria.md}, specs/005-component-surface-system/design-system.md, and roadmap.md section 6A rulings. Bounded scope: read those files and nothing beyond them unless a finding requires one more source file. NEVER edit src/, styles.css or tools/. Operator context: Anytype parity is the default ruling for these surfaces (051 ADR-007, 056, 057); Notion refinements are additive - where Notion and Anytype disagree, name the conflict and propose which to adopt with the reason, never override a landed operator ruling. Questions to answer with file:line and screen-id evidence: which Notion patterns from the digest would improve this surface for a user (rank by user impact); for each, the concrete change to our code and CSS (file, rule/function, value) and its measurable threshold; which Notion behaviours we already have; which conflict with an Anytype ruling; which need a device-only check; and a ranked remediation plan as concrete phase tasks with thresholds and red-first checks suitable for a new child phase. Cite every claim; mark inferences as inferences."
description: "Auto-generated research resource map from convergence evidence."
---
# Resource Map

<!-- SPECKIT_TEMPLATE_SOURCE: resource-map | v1.1 -->

---

## Summary

- **Total references**: 0
- **By category**: READMEs=0, Documents=0, Commands=0, Agents=0, Skills=0, Specs=0, Scripts=0, Tests=0, Config=0, Meta=0
- **Missing on disk**: 0
- **Scope**: research convergence output for 056-board-anytype-parity
- **Generated**: 2026-09-06T14:42:19.648Z

> **Action vocabulary**: `Created` · `Updated` · `Analyzed` · `Removed` · `Cited` · `Validated` · `Moved` · `Renamed`.
> **Status vocabulary**: `OK` · `MISSING` · `PLANNED`.

---

## Lineage Delta Sources

| Lineage | Delta |
|---------|-------|
| glm-devpass-board | lineages/glm-devpass-board/deltas/iter-001.jsonl |
| glm-devpass-board | lineages/glm-devpass-board/deltas/iter-002.jsonl |
| glm-devpass-board | lineages/glm-devpass-board/deltas/iter-003.jsonl |
| glm-devpass-board | lineages/glm-devpass-board/deltas/iter-004.jsonl |
| glm-devpass-board | lineages/glm-devpass-board/deltas/iter-005.jsonl |
