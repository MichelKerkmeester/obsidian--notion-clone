---
title: "Goal Prompt"
description: "The /goal string for this program, under the 4000-character cap the goal surface enforces."
trigger_phrases:
  - "goal prompt"
  - "005 goal prompt"
  - "goal string to set"
importance_tier: "important"
contextType: "planning"
---
Execute specs/005-component-surface-system to operator confirmation, with 006-list-view-deprecation, 007-gallery-view-deprecation and 008-calendar-timeline-chart-deprecation as siblings. Repo ~/MEGA/Development/Obsidian Plugin, main.

BINDING: every phase's goal.md binds as if written here — read <phase>/goal.md before working it. The parent DONE table references every open subgoal (043 T031, 044-075). roadmap.md §4 report-to-phase, §5.A phase state, §6A decisions, §7 conflicts; operator-checklist.md the device rows.

PRECEDENCE: D1-D15 outrank child detail, which outranks any summary. Name a conflict, never resolve it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first; any pinned sha is stale.

DELEGATION (D14, amended 2026-09-08): GLM 5.3 flash max via cli-pi DevPass (`--provider llmgateway --model glm-5.3-flash --thinking max`) now carries implementation legs too, alongside landings, docs and releases, on scripted numbered briefs, judged by decoded pixel-delta scripts, monitored every 5 min with a 15-min stall relaunch; one Opus 5 xhigh sub-orchestrator at most, held under Fable as master orchestrator/reviewer; Sonnet 5 xhigh scaffolds phases; cap of four agents; every leg keeps its `<worktree>/.handover.md` note untracked (gitignored) and writes the packet handover entry; landers regenerate `screenshots/manifest.json` after any rebase; rebuild the spec-kit orchestrator only from a clean Public-repo tree.

EVIDENCE: D1 a check not driving production proves nothing. D2 a criterion carries a threshold and a red before green. D3 shipped, verified, operator-confirmed are three states; only the third closes. D4 a fresh reviewer verifies. D15 Notion refinement is additive; a contradiction with a landed Anytype ruling is a Proposed ADR. Read $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-08 08:52): 0.0.32 shipped at `f0597bcd`, phone-loaded 08:06. The operator's 08:07-08:52 device pass opened seven packets — `070-ios-view-data-regression` (P0, iOS properties read empty; diagnosis: frontmatter intact, nothing lost), `071-sheet-notion-anytype-alignment` (phase parent, audit-first, six children), `072-linked-view-blocks-ux`, `073-checkbox-controls`, `074-test-data-consolidation`, `075-toolbar-labelled-buttons`, and the sibling `008-calendar-timeline-chart-deprecation` (phase parent, four children, archives removed code) — plus reopened `058` (AC-012, discoverability) and `066` (AC-010/011, toast dwell and close target). Scaffolded only; nothing implemented.

ORDER OF WORK: 1) 070 (P0, red-first cold-cache repro before any fix); 2) 008 calendar+timeline+chart deprecation, GLM implementation, starting with its own usage audit; 3) 071's sheet-story-coverage-audit (gates every other 071 child); 4) 075 toolbar labelled buttons; 5) 073 checkbox controls; 6) 074 test data consolidation; 7) 072 linked-view/drag surface determination; 8) device rows, operator only (059 AC-010, 060 D1-D4, 061 AC-005, 062 C9, 063 AC-011, 064 AC-011, 065 AC-012, 066 AC-008, 067 AC-011, 058 AC-008, 069 AC-010, 070 AC-006, 072 AC-004, 073 AC-005, 075 AC-006, 056 C10.1-4, 057 G12/G15+AC-010, 068 fresh-vault smoke, 054 OPS-004); 9) open residuals (067 T015/T020/T021, 062 cosmetic leftovers, 066 AC-010 → 006, engine-parity's 50 pre-existing width disagreements).

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on all three top-level parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
