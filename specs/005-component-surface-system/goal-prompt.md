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

DELEGATION (D14): native Sonnet implements; NO Opus agents (operator 2026-09-07 18:40) — GLM 5.3 flash max via cli-pi DevPass (`--provider llmgateway --model glm-5.3-flash --thinking max`) carries landings, docs and releases on scripted numbered briefs, judged by decoded pixel-delta scripts, monitored every 5 min with a 15-min stall relaunch; an Opus may only orchestrate GLM workers; cap of four agents; every leg keeps <worktree>/.handover.md and the packet handover entry; landers regenerate `screenshots/manifest.json` after any rebase; rebuild the spec-kit orchestrator only from a clean Public-repo tree.

EVIDENCE: D1 a check not driving production proves nothing. D2 a criterion carries a threshold and a red before green. D3 shipped, verified, operator-confirmed are three states; only the third closes. D4 a fresh reviewer verifies. D15 Notion refinement is additive; a contradiction with a landed Anytype ruling is a Proposed ADR. Read $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-07 22:05): 0.0.31 shipped 5e7f1426, RENAME release — id `obnotion`, name Obnotion, prefix `obnotion-`, first-load data.json bridge, vault `.obsidian/plugins/obnotion/`, repo `obsidian_notion-clone`. Landed 2026-09-07: 064 child+rulings+impl b46f4ef2+follow-up 9d798c69, ClickUp 69c58159+reclass 21392233, 063 a88894e5+gaps 755f2eac, 067 fold 44101b47+impl 173f7d3a+follow-ups 53cb5bb4/7ffeecc6, 060 5fec918d, 065 a0d64df0+touch fix 8fb3c87e, 066 cbb854c4+lane row af0e8796+toast 38d5a986, 059 f2a7ec34, 062 2c8974fb+freeze 3a94e58b, 061 abb6827f+tap/dock 6ca4a5c3, Settings-sheet fix 232f5c38/b8876332+guard 258d52d7/440da14d, 030/056/057 doc fixes 31eafb60/6d222e6e, 068 rename 14e073b4/24b3d683. In flight: `live-host-model` (wt221 77397c4b, 009 T26 — ~10px overflow, expectFail); `067 follow-up 3` (wt222 6f4d026c — labels, registry depth, lane rows, header, divider audit); `069-board-cross-group-drag` (wt224 NEW — operator 21:40 verbatim: "board view needs to support dragging to other groups and thus updating that property to match grouped field. Like clickup for example. You have task on status 'open' and drag board card to 'in progress'" — desktop works, touch leg building); timeline→table switch residue (wt225 — operator 21:55 verbatim: "if you open timeline view then go back to table view, the timeline sits on top above table view for some reason and it glitches").

ORDER OF WORK: 1) land the four in-flight legs, one GLM lander at a time — 069 and timeline fix first, both 0.0.31 reports; 2) 009 T26 button padding (queued fix); 3) cut 0.0.32 once 069 and timeline fix land; 4) device rows, operator only (059 AC-010, 060 D1-D4, 061 AC-005, 062 C9, 063 AC-011, 064 AC-011, 065 AC-012, 066 AC-008, 067 AC-011, 058 AC-008, 056 C10.1-4, 057 G12/G15+AC-010, 068 fresh-vault smoke, 054 OPS-004); 5) anything further reported from 0.0.31/0.0.32.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
