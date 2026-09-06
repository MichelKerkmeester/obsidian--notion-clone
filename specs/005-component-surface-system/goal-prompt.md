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

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working it. The parent DONE table references every open subgoal (043 T031, 044-058) and reserves 059-066. roadmap.md §4 maps report to phase, §5.A every phase's state, §6A the decisions, §7 the conflicts. operator-checklist.md holds the device rows.

PRECEDENCE: the parent's D1-D15 outrank child detail, which outranks any summary including a roadmap row. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first, main moves fast and any pinned sha is stale.

DELEGATION (D14): Sonnet implements and measures via cli-claude-code on the second login, one worktree per leg, "do the work yourself, never spawn a sub-agent"; in-runtime Opus does true-ups, debugging and landing verification (gate + validate --strict, from $?). Harvests run one at a time, each verified before the next. Notion refinement (D15) per surface: a Sonnet digest of the captures at <phase>/notion-screens-digest.md because GLM cannot read images, then /deep:research:auto 5 iterations max-iterations on GLM 5.3 flash max, then an Opus synthesis opens the reserved child and a fresh Opus verifier lands it — never open 059-066 by hand. GLM route: openrouter/z-ai/glm-5.3-flash until its credit is 0, then llmgateway (DevPass). A delegate's report is a claim. Never fork.

EVIDENCE: a check not driving the production path proves nothing (D1). A criterion carries a threshold and a red before green (D2). Shipped, verified, operator-confirmed are three states; only the third closes (D3). A fresh reviewer verifies, never self-certify (D4). Notion refinement is additive and never overrides a landed Anytype ruling; a contradiction is a Proposed ADR (D15, §7.15). Read exit status from $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-06 16:35): 0.0.29 shipped. Landed since 11:05: unscheduled chip 071041b7, wrap precedence 2c3c499a, stacked sheet e632a1e1, sheet-family reconciliation 6b16b87a (044 6/7, 048 7/8, 051 2/9), no-confirm delete 32411403, combobox a952e5e7. Harvests landed: Notion bab72104 (1,315 iOS + 2,332 web, non-flow groups query-derived), Evernote 28e680fc (555 + 1,002, content-grouped). Three rulings: run the sheet-family research now on the current state (10 iterations, worktree 172); Notion refinement across every UI phase (059-066 reserved, wave 1 059-062 running since 16:14 in 174-177, wave 2 queued); OpenRouter-then-DevPass. In flight: 150 Fibery, 151 ClickUp, 165 calendar rebuild (12 of 15 gestalt rows green), 167 board page-scroll, 170 Notion reclassification, 171 shell lane rows, 172 sheet research, 173 comment hygiene, 174-177 Notion wave 1.

ORDER OF WORK: 1) land 165, 167, 170, 171 and 173, each rebased and verified, then cut 0.0.30; 2) the wave-1 syntheses open 059-062, then wave 2 opens 063-066, each landed by a fresh verifier; 3) the sheet-family research synthesis updates the sheet phases; 4) Fibery then ClickUp, then the reclassification passes; 5) 058's title formats, and 056's T014-T016 after 167 lands; 6) the device rows. Gate-green per phase; run the gate with stdin from /dev/null or verify.mjs hangs at 0% CPU; finish-research.sh resumes a synthesis whose print session ended when the fan-out detached; rebase before landing a branch with parallel doc edits.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
