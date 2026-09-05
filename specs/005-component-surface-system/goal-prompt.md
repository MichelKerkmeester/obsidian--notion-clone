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

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working a phase. The parent goal.md's DONE table references every open subgoal (043 T031, 044-057, siblings 006 and 007). roadmap.md §4 maps report to phase, §5.A is every phase 000-057 with its state, §6A the operator decisions, §7 the conflicts. operator-checklist.md holds the device-only rows.

PRECEDENCE: the parent's D1-D14 outrank child detail; child detail outranks any summary, including a roadmap row. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first.

DELEGATION (D14, 2026-09-05 22:30): devin, codex and cursor are out of usage today. Sonnet does implementation and measurement legs through cli-claude-code on the second login (CLAUDE_CONFIG_DIR=~/.claude-account2, claude -p --model sonnet --dangerously-skip-permissions </dev/null, CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0, prompt opens "do all the work yourself, never spawn a sub-agent"), one worktree per leg, bounded briefs; in-runtime Opus does design true-ups, debugging and the final landing verification (gate </dev/null + validate --strict, read from $?). UI reviews: Fable 5.1 at medium effort via the second login, reviewer only, never spawning agents. GLM (cli-pi) is for pure doc authoring only. A delegate's report is a claim. Never Fable in-runtime, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value seen red before green (D2). Shipped, verified and operator-confirmed are three states; only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Capture beats code-derived research; name the contradiction (050 ADR-003). Read exit status from $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-05 23:00): 0.0.27 shipped (a7e3db83) with 053's toolbar; no device row confirmed. Operator reports (§4): sheets still look old (051's shell is in its first leg), some sheets overflow horizontally (044, fix in flight), a phone table row is far too tall (debug in flight), and an easier wrap/no-wrap toggle for table rows (row 53, owner 053/052). Rulings tonight: 051 is Anytype parity by default with named accessibility exceptions (ADR-007); "Board UI/UX should almost be 1:1 Anytype, same for calendar" — new phases 056-board-anytype-parity and 057-calendar-anytype-parity replace the shipped PM board port; the gantt keeps the PM 1:1 port; the table stays ours; 047's align-closer narrows to the gantt. The Fable review (review-ui-2026-09-05.md): one P0 (linked-view embed paints empty 34px bands; fix in flight), eleven P1s by owner. Landed: six true-ups, the reds, 053, 052's primitive; landing: 054, 055; running: 051 shell, 052 consumers, 053 last rows, 007/003.

ORDER OF WORK: 1) land 054/055, the overflow, row-height and P0 fixes, cut 0.0.28; 2) 051 shell then the 32 modal/sheet migrations by rank, 048 and 044 as constraints; 3) the review's P1s by owner inside each family; 4) 056 board and 057 calendar: capture true-up, reds, rebuild to Anytype parity; 5) table wrap toggle (053/052); 6) a build after each family, operator checks each; 7) 046 device rows, 050 remaining legs, 007 child 004, 047 gantt align-closer. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
