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

STATE (2026-09-06 09:30): 0.0.29 shipped (03aa151d, cadence row 578991e8). Landed tonight: 047's gantt comparison (Met), 051-055's shells and the confirm primitive (4224b092), 056's board rebuild and its ten residuals (0e8185b6, R6/R7 open), 057's calendar through T017 (6c718f63, 8/10 Met). Opened: 058-card-title-and-title-formats — the title picker already ships; the gap is routing its display through the chosen column's own number/currency format. In flight, one worktree each: 146 footer, 147 dropdown anchoring, 153 side sheet, 154 no-confirm delete, 155 phone week, 156 board palette; 148-151 are 047's harvests, none dispatched. New rulings: no confirm for single-row delete, Undo toast carries it (051 ADR-007 E4 closed); desktop Settings becomes a right side sheet with a gear button (051 ADR-008, 053); every desktop dropdown becomes a combobox (052); the table footer hides at zero rows, 44px otherwise (053); 056's R6 ("Anytype tint fill") and R7 ("Neutral, match Anytype"); the phone week grid scrolls horizontally at a minimum column width (057 T018).

ORDER OF WORK: 1) land the six in-flight worktrees (146, 147, 153, 154, 155, 156), each rebased and verified before the next; 2) land 058 T003 on (format routing, the Title-slot picker, a cross-surface test); 3) close 056's remaining T012 rows and 057's T018; 4) dispatch 047's four harvests, one at a time; 5) cut 0.0.30 once those are green; 6) a build per family, operator checks each; 7) 046 device rows, remaining 050 legs, 007/004 follow-ups. Gate-green per phase; operator rows never ticked; rebase-and-reconcile before any branch with parallel doc edits lands.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 operator report is confirmed on device or deferred with the deferral recorded.
