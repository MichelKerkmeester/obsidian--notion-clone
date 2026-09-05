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

DELEGATION (D14, 2026-09-05 16:45): devin DeepSeek and codex Luna are out of usage today and cursor Grok is gone; implementation and planning legs run on GLM 5.3 flash max through cli-pi (openrouter/z-ai/glm-5.3-flash first, llmgateway/glm-5.3-flash on DevPass as fallback; --mode json to a log), with BOUNDED briefs: an explicit file list and acceptance rows, never open-ended exploration and never screenshot reading (GLM cannot read images and loops on exploration). Every GLM leg is verified and landed by a fresh in-runtime Sonnet agent that runs npm run gate </dev/null and validate --strict itself; Opus only for design true-ups and root-cause debugging. A delegate's report is a claim. Never Fable, never fork.

EVIDENCE: a check that does not drive the production path proves nothing (D1). Every criterion carries a threshold and a failing value observed red before green (D2) — a wrongly asserted failing value cannot be observed red (050's true-up found six). Shipped, verified and operator-confirmed are three states and only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Where a capture and code-derived research disagree, the capture wins and the contradiction is named (050 ADR-003). Read exit status from $?, never a pipe; take the FIRST RESULT line as a folder's verdict.

STATE (2026-09-05 16:30): 0.0.26 shipped (8c7b65aa) carrying 006's record-open docking for every anchorless caller (ae46da94, §4 row 52). No device row is confirmed. Reference set: Anytype only (120 set, 600 menu, 118 iOS shots). ALL SIX TRUE-UPS ARE DONE — 050's plus 051-055's — and reconciled together (f091a7ef). That pass found 050's own read wrong five times: the chip rail IS captured (eleven times, conditional), the per-view default IS in the New menu, REQ-013's "one + New filter row" is the EMPTY state against twelve captured formats, the 60 page limit is per-layout (Gallery 60, Kanban 10, else none), and hover WAS captured (37 menus). roadmap.md §7.10 settles four cross-family number conflicts and names one owner per shared primitive. 053's implementation runs in worktree 094 (GLM next); the Anytype captures regrouped under desktop/ and mobile/ (d486eab9) — cite that form.

ORDER OF WORK: 1) implement by family — 053 first (it carries 050 items 1, 2, 4, 7, 10, 12), then 052, 054, 051, 055 by inventory rank, 048 stacking and 044 grammar as constraints, a build after each; 2) the operator checks phone and desktop on 0.0.26; 3) 046's device rows and 050's remaining legs; 4) 007 children 003-004; 5) 047 rows 37/38. Each packet's T002 measures its own reds before its first code leg. Each phase gate-green and shipped; operator rows never ticked.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
