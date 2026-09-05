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

RESUME: handover.md, then _memory.continuity, then the canonical spec docs. Confirm each branch tip and unread worktree before assuming its state.

DELEGATION (D14): devin DeepSeek first (deepseek-v4-flash-max, --permission-mode dangerous) -> codex Luna (gpt-5.6-luna, model_reasoning_effort=max, service_tier=fast) -> GLM 5.3 flash via cli-pi/cli-opencode, OpenRouter first with DevPass as fallback -> Grok 4.6 xhigh fast via cli-cursor. Parallel GLM waves are allowed for PLANNING only, and every wave needs a landing pass that reads each leaf's output — a leaf can die silently mid-run and report as present. Verification is not delegable: a fresh in-runtime agent runs npm run gate and validate.sh --strict itself. A delegate's report is a claim. Never Fable, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value observed red before green (D2) — and a threshold whose failing value is asserted wrongly cannot be observed red, which is what 050's true-up found in six of them. Shipped, verified and operator-confirmed are three states and only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Where a capture and code-derived research disagree, the capture wins and the contradiction is named (050 ADR-003). Read exit status from $?, never a pipe; take the FIRST RESULT line as a folder's verdict.

STATE (2026-09-05): 0.0.25 is shipped, carrying the five desktop fixes from the operator's 0.0.23 desktop pass — §4 rows 47-51, all awaiting their look. 0.0.24 carried 048's stacked sheets, 044's sheet grammar, 046's linked-view chrome and 007's gallery migration. Every device row deferred against 0.0.23 is re-asked against 0.0.25. Phases 047-055 are open with their first legs: 047 research done and the fidelity pass owed; 050's T001 done (design-trueup.md: seven contradictions resolved in the captures' favour, six thresholds restated) and its nine legs pending; 051-055 drafted 2026-09-05, reviewed and landed, none past T001. 053's three ADRs are Proposed and are operator questions. AppFlowy left the reference set 2026-09-05.

ORDER OF WORK: 1) the operator re-checks the phone rows on 0.0.25; 2) 046's device rows — T002's host-layout question and T016's settings-flag call; 3) 050 T002 onward, by item rank, against the restated thresholds; 4) 051-055 T001 true-ups first, then implementation by inventory rank, with 048's stacking and 044's grammar as constraints neither re-specifies; 5) 007's children 003-004 after the release cut; 6) 047's rows 37/38 align-closer pass. Cut a build after each family phase and re-ask the rows it touches. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
