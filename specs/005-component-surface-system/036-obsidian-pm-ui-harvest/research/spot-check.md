# Citation spot-check

Read-only in-runtime check performed against the current vendored source tree on 2026-09-02. The
check opened each cited file, read the requested line, and matched the expected fragment.

| # | Citation | Expected fragment | Result |
|---:|---|---|---|
| 1 | `specs/context/obsidian-pm-main/src/views/gantt/TimelineConfig.ts:5` | `ROW_HEIGHT = 44` | PASS |
| 2 | `specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts:75` | `refresh(): void` | PASS |
| 3 | `specs/context/obsidian-pm-main/src/views/gantt/GanttTaskBarRenderer.ts:51` | `A task due on E occupies day E` | PASS |
| 4 | `specs/context/obsidian-pm-main/src/views/gantt/GanttDragHandler.ts:49` | `Dragging a bar edge moves the date` | PASS |
| 5 | `specs/context/obsidian-pm-main/src/views/KanbanView.ts:44` | `for (const status of this.config.statuses)` | PASS |
| 6 | `specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:75` | `if (props.descriptionPreview)` | PASS |
| 7 | `specs/context/obsidian-pm-main/src/store/TaskIndex.ts:10` | `buildTaskIndex` | PASS |
| 8 | `specs/context/obsidian-pm-main/src/store/YamlSerializer.ts:80` | `buildTaskFrontmatter` | PASS |
| 9 | `specs/context/obsidian-pm-main/src/modals/SubtasksPanel.ts:75` | `const addRow` | PASS |
| 10 | `specs/context/obsidian-pm-main/LICENSE:12` | `copyright notice and this permission notice` | PASS |

**Result: 10/10 PASS.** No browser or external-source claim was used.
