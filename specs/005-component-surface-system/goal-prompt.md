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
Execute specs/005-component-surface-system to operator confirmation, with 006-list-view-deprecation and 007-gallery-view-deprecation as siblings. Repo ~/MEGA/Development/Obsidian Plugin, main.

BINDING: every phase's goal.md binds as if written here — read <phase>/goal.md before working it. The parent DONE table references every open subgoal (043 T031, 044-068). roadmap.md §4 report-to-phase, §5.A phase state, §6A decisions, §7 conflicts; operator-checklist.md the device rows.

PRECEDENCE: D1-D15 outrank child detail, which outranks any summary. Name a conflict, never resolve it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first; any pinned sha is stale.

DELEGATION (D14): native Sonnet implements; NO Opus agents (operator 2026-09-07 18:40) — GLM 5.3 flash max via cli-pi DevPass (`--provider llmgateway --model glm-5.3-flash --thinking max`) carries landings, docs and releases on scripted numbered briefs, judged by decoded pixel-delta scripts, monitored every 5 min with a 15-min stall relaunch; an Opus may only orchestrate GLM workers; cap of four agents; every leg keeps its `<worktree>/.handover.md` note untracked (gitignored — two legs committed it by mistake and needed a hygiene strip at `a35f17ab`/`f7101325`) and writes the packet handover entry; landers regenerate `screenshots/manifest.json` after any rebase; rebuild the spec-kit orchestrator only from a clean Public-repo tree.

EVIDENCE: D1 a check not driving production proves nothing. D2 a criterion carries a threshold and a red before green. D3 shipped, verified, operator-confirmed are three states; only the third closes. D4 a fresh reviewer verifies. D15 Notion refinement is additive; a contradiction with a landed Anytype ruling is a Proposed ADR. Read $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-08 ~06:50): 0.0.32 shipped at `f0597bcd` (tag 0.0.32, Release workflow `34188001070` success) as the FIX release, each landing verified by a fresh GLM lander: 009 live-host-model (`6f679e5e` + handover `3005e5bd`), timeline→table teardown fix (`f56931f8`/`b6a0f847` + `bf775938`, packet `037`, roadmap §4 row 67), 069 board cross-group touch drag (`86b2e618`..`87ec4c8f`, row 68, AC-010 operator-owned), 067 follow-up 3 (`82971d74`/`fa980f8c` + `5024fedf`), 058 reopened card-title format + persistence (`e634e5ef`/`42de57b6`/`1b96a10e` + `43f660b5`/`678d535a`, row 69, AC-008 operator-owned), 009 T26 panel-button padding (`40ac626a`/`e1142536` + `97ed0f81`; the gate's `expectFail` discharged, gate reads 26 green 0 red). Two hygiene commits `a35f17ab` and `f7101325` stripped a worktree note landers had committed by mistake — `.handover.md` is now gitignored, never staged.

ORDER OF WORK: 1) device rows, operator only (059 AC-010, 060 D1-D4, 061 AC-005, 062 C9, 063 AC-011, 064 AC-011, 065 AC-012, 066 AC-008, 067 AC-011, 058 AC-008, 069 AC-010, 056 C10.1-4, 057 G12/G15+AC-010, 068 fresh-vault smoke, 054 OPS-004) on 0.0.32; 2) anything the operator reports from 0.0.32; 3) open residuals (067 T015/T020/T021, 062 cosmetic leftovers, 066 AC-010 → 006, engine-parity's 50 pre-existing width disagreements, roadmap rows 67-69 awaiting device read).

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
