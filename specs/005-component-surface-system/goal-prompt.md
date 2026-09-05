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
Execute specs/005-component-surface-system to operator confirmation, with specs/006-list-view-deprecation and specs/007-gallery-view-deprecation as its sibling packets. Repo ~/MEGA/Development/Obsidian Plugin, branch main.

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working a phase. The parent goal.md's DONE table references every open subgoal (043 T031, 044, 045, 046, 047, plus siblings 006 and 007). roadmap.md §4 maps report to phase, §5.A is every phase 000-047 with its current state, §6A carries the operator decisions, §7 names conflicts. operator-checklist.md gathers the rows only a device can close.

PRECEDENCE: the parent's D1-D14 outrank child detail; child detail outranks any summary of it, including a roadmap row. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs. Confirm each in-flight branch tip before assuming its state; five legs moved this evening.

DELEGATION (D14): devin DeepSeek first (deepseek-v4-flash-max, --permission-mode dangerous) -> codex Luna (gpt-5.6-luna, model_reasoning_effort=max, service_tier=fast) -> GLM 5.3 flash max via cli-opencode/llmgateway -> Grok 4.6 xhigh fast via cli-cursor when devin is out of usage -> claude2 Sonnet. Research cap 5 iterations. Model ids pass exactly as each transport spells them, never a near-miss. Verification is not delegable: a fresh in-runtime agent runs npm run gate and validate.sh --strict itself, because sandboxed and cloud lanes cannot reach Chrome. A delegate's report is a claim, not a result. Never Fable, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value observed red before green (D2). Shipped, verified and operator-confirmed are three states and only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Read exit status from $?, never through a pipe, and take the FIRST RESULT line as a folder's own verdict.

STATE (2026-09-05): shipped build 0.0.22, next cut 0.0.23. The 0.0.22 device check DEFERRED twelve §4 rows (29-36, 39-41, 43) on one blocker — a tap inside an open sheet dismisses it on iOS, fix in flight on worktrees/056-sheet-inside-tap under 031 — re-asked after the next iCloud build. Rows 37/38 got "align closer" plus Anytype and AppFlowy captures, owned by new child 047. The operator retired the gallery outright; specs/007-gallery-view-deprecation carries it, phased, four children. 045's two questions are answered (ADR-001, ADR-002); its AC-006 is deferred with the twelve. DONE rows 1 and 2 stay the only open parent rows and both are the operator's.

ORDER OF WORK: 1) land the sheet-inside-tap fix (worktrees/056, packet 031), cut 0.0.23 to GitHub + iCloud, re-ask the twelve deferred rows; 2) 046 linked views capability pass (worktrees/054); 3) 044's remaining sheet grammar work — header everywhere, sheet row inset 16px, sheet header title 16px; 4) 007 gallery deprecation children 001 -> 004, in that order, 030 as its precedent; 5) 047 competitor references (Anytype, AppFlowy: official images plus Homebrew-installed apps, under screenshots/anytype/ and screenshots/appflowy/) then the board and gantt fidelity pass for rows 37/38. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's completion criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is 24 green read from $? (25 before 007 removed the list-window lane); npm run replay holds with reversed 0; and every operator report in roadmap.md §4 is confirmed on device or deferred with the deferral recorded.
