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
Execute specs/005-component-surface-system to operator confirmation, with specs/006-list-view-deprecation as its sibling packet. Repo ~/MEGA/Development/Obsidian Plugin, branch main.

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working a phase. The parent goal.md's DONE table references every open subgoal (043 T031, 044, 045, 046, and 006). roadmap.md §4 maps report to phase, §5.A is every phase 000-046 with its current state, §7 names conflicts. operator-checklist.md gathers the 103 rows only a device can close.

PRECEDENCE: the parent's D1-D14 outrank child detail; child detail outranks any summary of it, including a roadmap row. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs. Confirm each in-flight branch tip before assuming its state; five legs moved this evening.

DELEGATION (D14): devin DeepSeek first (deepseek-v4-flash-max, --permission-mode dangerous) -> codex Luna (gpt-5.6-luna, model_reasoning_effort=max, service_tier=fast) -> GLM 5.3 flash max via cli-opencode/llmgateway -> Grok 4.6 xhigh fast via cli-cursor when devin is out of usage -> claude2 Sonnet. Research cap 5 iterations. Model ids pass exactly as each transport spells them, never a near-miss. Verification is not delegable: a fresh in-runtime agent runs npm run gate and validate.sh --strict itself, because sandboxed and cloud lanes cannot reach Chrome. A delegate's report is a claim, not a result. Never Fable, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value observed red before green (D2). Shipped, verified and operator-confirmed are three states and only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Read exit status from $?, never through a pipe, and take the FIRST RESULT line as a folder's own verdict.

STATE (now): main at ab116959, shipped build 0.0.20, next cut 0.0.21. Five legs in flight, none on main — branches/001-sheet-webkit (031's second bug: a toolbar rebuild behind an open sheet drops the sheet; the entrance fix already landed as c96467c9), worktrees/039-column-width-sheet and worktrees/040-settings-sheet (both 044), worktrees/037-reference-captures (043 T031, captures under screenshots/project-manager/), worktrees/042-screenshots-folders. Row 39 landed 1358927 and ships in 0.0.21. DONE rows 1 and 2 are the only open parent rows and both are the operator's.

ORDER OF WORK: 1) land the WebKit sheet fix + column-width + settings sheets, cut 0.0.21 to GitHub + iCloud; 2) reference captures (037) land, then fresh side-by-side reads close rows 37/38; 3) the screenshots folder split lands last; 4) 044 phone sheet alignment tasks by inventory rank (003/sheet-and-dropdown-inventory.md); 5) 006 list deprecation children 005 -> 008, in that order; 6) 045 board card properties; 7) 046 linked views, ADR-001 first and it is the operator's. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's completion criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is 24 green read from $? (25 before 007 removed the list-window lane); npm run replay holds with reversed 0; and every operator report in roadmap.md §4 is confirmed on device or deferred with the deferral recorded.
