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

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working a phase. The parent goal.md's DONE table references every open subgoal (043 T031, 044-058, siblings 006 and 007). roadmap.md §4 maps report to phase, §5.A is every phase 000-058 with its state, §6A the operator decisions, §7 the conflicts. operator-checklist.md holds the device-only rows.

PRECEDENCE: the parent's D1-D14 outrank child detail; child detail outranks any summary, including a roadmap row. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first — main moves fast tonight, treat any pinned sha as stale until re-checked.

DELEGATION (D14, 2026-09-06): Sonnet implements and measures via cli-claude-code on the second login, one worktree per leg, "do all the work yourself, never spawn a sub-agent"; in-runtime Opus does true-ups, debugging and the final landing verification (gate + validate --strict, from $?). Fable 5.1 medium reviews UI only. The four Mobbin harvests (Notion, Evernote, Fibery, ClickUp) run one at a time via Fable 5.1 medium / Opus xhigh, each landed and verified before the next. A delegate's report is a claim. Never Fable in-runtime, never fork.

EVIDENCE: a check not driving the production path proves nothing (D1). Every criterion carries a threshold and a red seen before green (D2). Shipped, verified, operator-confirmed are three states; only the third closes (D3). A fresh reviewer verifies; never self-certify (D4). Capture beats code-derived research (050 ADR-003). Read exit status from $?; the FIRST RESULT line is a folder's verdict. Re-derive a roadmap ratio from its goal.md; don't quote it.

STATE (2026-09-06 09:10): 0.0.28 shipped (d3433d81); main is advancing concurrently past this snapshot toward 0.0.29 — re-check HEAD before trusting any sha here. Landed tonight: 047's gantt comparison (Met), 048 shipped in 0.0.24, 050's T001, 051-055's shells/primitives, 056's board-to-Anytype rebuild (T012's ten residuals partly ruled on), 057's calendar rebuild (7 of 10 Met). Opened: 058-card-title-and-title-formats — the per-view title picker already ships; the gap is routing its display through the chosen column's own number/currency format. New rulings: no confirm for single-row delete, Undo toast carries it (051 ADR-007 E4 closed); the desktop Settings surface becomes a right side sheet with a dedicated gear button (051 ADR-008, 053); every desktop dropdown becomes a combobox (052); the table footer hides at zero rows, 44px otherwise (053); 056's R6 ("Anytype tint fill") and R7 ("Neutral, match Anytype") ruled on.

ORDER OF WORK: 1) land 058 T003 on (format routing, the Title-slot picker affordance, a cross-surface test); 2) land the six amendments' code (051 side sheet + E4/055 delete confirm, 052 combobox + anchoring, 053 gear button + footer, 056 R6/R7); 3) close 056's remaining T012 rows and 057 ADR-002 (operator: do week/day scales survive parity); 4) dispatch 047's four Mobbin harvests, one at a time; 5) cut 0.0.29 once 056/057 are green; 6) a build per family, operator checks each; 7) 046 device rows, remaining 050 legs, 007/004 follow-ups. Gate-green and shipped per phase; operator rows never ticked; rebase-and-reconcile before any branch with parallel doc edits lands.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
