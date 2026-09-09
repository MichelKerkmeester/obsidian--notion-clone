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

DELEGATION (D14, amended 2026-09-08 evening): GLM 5.3 flash max via cli-pi DevPass (`--provider llmgateway --model glm-5.3-flash --thinking high` — `max` hangs the launch, `high` opens reliably) carries implementation legs, landings, docs and releases, on scripted numbered briefs, judged by decoded pixel-delta scripts, monitored every 5 min with a 15-min stall relaunch. Every GLM brief is write-first (first tool call writes; ≤3 calls between writes) or it runs read-only 20-45 min and is killed and relaunched write-first; two write-free GLM runs on one leg escalates it to native Sonnet (070, 075, 008/002, 066 did). One Opus 5 xhigh sub-orchestrator at most, held under Fable as master orchestrator/reviewer; Sonnet 5 xhigh scaffolds phases; cap of four agents; every leg keeps its `<worktree>/.handover.md` note untracked (gitignored) and writes the packet handover entry; landers regenerate `screenshots/manifest.json` after any rebase; rebuild the spec-kit orchestrator only from a clean Public-repo tree. Resume ritual: refresh every open goal.md and parent first, then post the body here before continuing.

EVIDENCE: D1 a check not driving production proves nothing. D2 a criterion carries a threshold and a red before green. D3 shipped, verified, operator-confirmed are three states; only the third closes. D4 a fresh reviewer verifies. D15 Notion refinement is additive; a contradiction with a landed Anytype ruling is a Proposed ADR. Read $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-09 ~09:56): 0.0.35 shipped at `97395196`, published with notes. All six 071 children landed (071 parent 4/4, no-regression criterion closed); 066 5/6 (dwell 3500ms, close target landed); 058 7/8 (AC-012 discoverability landed); 008 packet closed 4/4 (calendar/timeline/chart removed, archived, README stripped, release notes published). Open: `package.json`'s own description field (never in 008/004's scope); 067's residual capture reads; engine-parity's informational disagreements. Everything else below is operator-owned.

ORDER OF WORK: 1) device rows on 0.0.35, operator only: 059 AC-010, 060 D1-D4, 061 AC-005, 062 C9, 063 AC-011, 064 AC-011, 065 AC-012, 066 AC-008, 067 AC-011, 058 AC-008, 069 AC-010, 070 AC-006, 072 AC-004, 073 AC-005, 075 AC-006, 074's two rows, 071 D3 device recheck, 056 C10.1-4, 057 G12/G15+AC-010, 068 fresh-vault smoke, 054 OPS-004; 2) anything the operator reports from 0.0.35; 3) open residuals: `package.json`'s description field, 067's residual capture reads, engine-parity's informational disagreements.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on all three top-level parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
