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
Execute specs/005-component-surface-system to operator confirmation, with specs/006-list-view-deprecation and specs/007-gallery-view-deprecation as sibling packets. Repo ~/MEGA/Development/Obsidian Plugin, branch main.

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working a phase. The parent goal.md's DONE table references every open subgoal (043 T031, 044-055, plus siblings 006 and 007). roadmap.md §4 maps report to phase, §5.A is every phase 000-055 with its state, §6A the operator decisions, §7 the conflicts. operator-checklist.md gathers the device-only rows.

PRECEDENCE: the parent's D1-D14 outrank child detail; child detail outranks any summary, including a roadmap row. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs. Confirm each branch tip and worktree before assuming state.

DELEGATION (D14, 2026-09-05 22:30): devin, codex and cursor are out of usage today. Sonnet does implementation, measurement and verification legs through cli-claude-code on the second login (CLAUDE_CONFIG_DIR=~/.claude-account2, claude -p, --model sonnet, --dangerously-skip-permissions, </dev/null, CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0, prompt opens "do all the work yourself, never spawn a sub-agent"), one worktree per leg, bounded briefs; in-runtime Opus does design true-ups, debugging and the final landing verification (gate </dev/null + validate --strict, read from $?). UI reviews run as Fable 5.1 at medium effort through the same second login, reviewer only, never spawning agents. GLM 5.3 flash (cli-pi) is for pure doc authoring only. A delegate's report is a claim. Never Fable in-runtime, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value observed red before green (D2); a wrongly asserted failing value cannot be seen red. Shipped, verified and operator-confirmed are three states and only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Where a capture and code-derived research disagree, the capture wins and the contradiction is named (050 ADR-003). Read exit status from $?, never a pipe; take the FIRST RESULT line as a folder's verdict.

STATE (2026-09-05 22:30): 0.0.27 shipped (a7e3db83) with 053's toolbar componentization; no device row is confirmed. Operator reports on 0.0.27: most sheets still look like the old ones (051's parity shell is only in its first code leg) and some sheets overflow horizontally (new §4 row, owner 044, fix in flight). Reference set: Anytype only (838 captures under screenshots/anytype/). Six true-ups, the 051/052/054 reds and the reconciliation are done; 051 is retargeted to Anytype parity by default with three named accessibility exceptions (ADR-007) and the delete confirm kept. In flight: Opus landings of 052, 054 and 055; second-login legs for 051's shell, 053's last three rows, 007/003 gallery removal, 047 board/gantt align-closer; a Fable UI review of 0.0.27 against Anytype.

ORDER OF WORK: 1) land 052/054/055 and the overflow fix, cut 0.0.28; 2) 051 shell then the 32 modal/sheet migrations by inventory rank, a build after each family, 048 stacking and 044 grammar as constraints; 3) act on the Fable review's P0/P1 by owner; 4) the operator checks phone and desktop on each build; 5) table text-wrap toggle per view and per column (operator ask, owner 053), 046's device rows, 050's remaining legs, 007 child 004, 047 rows 37/38. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
