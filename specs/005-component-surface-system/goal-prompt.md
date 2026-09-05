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

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working a phase. The parent goal.md's DONE table references every open subgoal (043 T031, 044-048, plus siblings 006 and 007). roadmap.md §4 maps report to phase, §5.A is every phase 000-048 with its state, §6A the operator decisions, §7 the conflicts. operator-checklist.md gathers the device-only rows.

PRECEDENCE: the parent's D1-D14 outrank child detail; child detail outranks any summary, including a roadmap row. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs. Confirm each branch tip and unread worktree before assuming its state.

DELEGATION (D14): devin DeepSeek first (deepseek-v4-flash-max, --permission-mode dangerous) -> codex Luna (gpt-5.6-luna, model_reasoning_effort=max, service_tier=fast) -> GLM 5.3 flash max via cli-opencode/llmgateway -> Grok 4.6 xhigh fast via cli-cursor when devin is out -> claude2 Sonnet. Research cap 5 iterations. Model ids pass exactly as each transport spells them. Verification is not delegable: a fresh in-runtime agent runs npm run gate and validate.sh --strict itself — sandboxed and cloud lanes cannot reach Chrome. A delegate's report is a claim. Never Fable, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value observed red before green (D2). Shipped, verified and operator-confirmed are three states and only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Read exit status from $?, never a pipe; take the FIRST RESULT line as a folder's verdict.

STATE (2026-09-05, 0.0.23 shipped and on the operator's phone): they confirmed the sheet-action fix — "Buttons work now" — so §4 rows 34-36 CLOSE. The other nine (29-33, 39-41, 43) keep their state and lose their blocker: not exercised on 0.0.23, and no subject of theirs is a sheet action. 045's AC-006 moves with them. New rows 44-46, same check: "stacked sheets dont look or work right" — owned by new child 048-stacked-sheets, Level 2; its T001 inventory is written and its D1 (do modals from a sheet present as sheets?) is OPERATOR-OWNED, open. 044 and 045 are landed, only their operator row open. 046: ADR-001/002 accepted, partial landing; AC-003/006 Met, AC-001/002/004/005 behind T002's host-layout question, T016 an operator call. 006's children 005-007 are done. Rows 37/38 still want "align closer" plus Anytype, owned by 047; AppFlowy left 09-05. DONE rows 1 and 2 stay the only open parent rows and both are the operator's.

ORDER OF WORK: 1) read the unread worktrees (059, 061) before resuming what they touch; 2) finish 046 — answer T002 and T016, close AC-001/002/004/005; 3) 044's grammar work — header everywhere, row inset 16px, title 16px; 4) 048 stacked sheets — answer D1, then the stacking model in mobile-bottom-sheet.ts/overlay-stack.ts, migrations by rank, a lane row per pair, red first; 5) 007 gallery children 001 -> 004 in order, 030 precedent; 6) 047 competitor references (Anytype: official + installed app) then the board/gantt pass for rows 37/38; 7) 050 anytype adoption — T001 reads the captures and trues up the 14 items before code. Cut a build after 048 and re-ask the nine deferred rows. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
