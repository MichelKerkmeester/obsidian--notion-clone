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

RESUME: handover.md, then _memory.continuity, then the canonical spec docs. Confirm each branch tip and worktree before assuming its state.

DELEGATION (D14): devin DeepSeek first (deepseek-v4-flash-max, --permission-mode dangerous) -> codex Luna (gpt-5.6-luna, model_reasoning_effort=max, service_tier=fast) -> GLM 5.3 flash via cli-pi/cli-opencode, OpenRouter first with DevPass as fallback -> Grok 4.6 xhigh fast via cli-cursor. Parallel GLM waves are for PLANNING only, and every wave needs a landing pass that reads each leaf's output — a leaf can die silently mid-run. Verification is not delegable: a fresh in-runtime agent runs npm run gate and validate.sh --strict itself. A delegate's report is a claim. Never Fable, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value observed red before green (D2) — a wrongly asserted failing value cannot be observed red (050's true-up found six). Shipped, verified and operator-confirmed are three states and only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Where a capture and code-derived research disagree, the capture wins and the contradiction is named (050 ADR-003). Read exit status from $?, never a pipe; take the FIRST RESULT line as a folder's verdict.

STATE (2026-09-05 15:30): 0.0.25 shipped — the five desktop fixes (§4 rows 47-51) and everything 0.0.24 carried (048 stacked sheets, 044 grammar, 046 linked-view chrome, 007 gallery migration); every device row is re-asked against 0.0.25 and none is confirmed yet. Reference set: Anytype only (AppFlowy removed) — 120 desktop set captures, 600 menu captures, 118 iOS-simulator sheets, 20 official mobile images, all on main; simulator and demo space stay running. 050's T001 done (design-trueup.md: capture beats research, seven contradictions named, six thresholds restated). 051-055 landed with binding goal.md each; their T001 true-ups run on GLM (DevPass) in worktrees 087-092, then a landing pass reconciles them. 053's three ADRs and 051's fullscreen and sub-page ADRs are Accepted (§6A). Record-open docking for every no-anchor caller is in flight (worktree 085, packet 006). Screenshot regrouping into platform/subject subfolders is queued behind the true-ups.

ORDER OF WORK: 1) land the 051-055 true-ups and the record-open fix, cut 0.0.26; 2) the operator checks the phone and desktop rows on that build; 3) implement by family, 053 toolbar first (it carries 050 items 1, 2, 4, 7, 10, 12), then 051, 052, 054, 055 by inventory rank, 048 stacking and 044 grammar as constraints, a build after each family; 4) 046's device rows and 050's remaining legs; 5) 007 children 003-004 after the next cut; 6) 047 rows 37/38 align-closer pass. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
