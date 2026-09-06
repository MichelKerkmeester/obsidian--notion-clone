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

BINDING: every phase carries its own goal.md and each binds as if written here — read <phase>/goal.md before working it. The parent goal.md's DONE table references every open subgoal (043 T031, 044-058, 006, 007). roadmap.md §4 maps report to phase, §5.A every phase's state, §6A the decisions, §7 the conflicts. operator-checklist.md holds the device rows.

PRECEDENCE: the parent's D1-D14 outrank child detail; child detail outranks any summary, a roadmap row included. Name a conflict rather than resolving it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first — main moves fast, treat any pinned sha as stale.

DELEGATION (D14): Sonnet implements and measures via cli-claude-code on the second login, one worktree per leg, "do the work yourself, never spawn a sub-agent"; in-runtime Opus does true-ups, debugging and landing verification (gate + validate --strict, from $?). Fable 5.1 medium reviews UI only, never in-runtime. The four Mobbin harvests run one at a time via Fable 5.1 medium / Opus xhigh by the scripted-loop method (one Code Mode execution per batch, both lanes, 40 req/min), each verified before the next. A delegate's report is a claim. Never fork.

EVIDENCE: a check not driving the production path proves nothing (D1). Every criterion carries a threshold and a red before green (D2). Shipped, verified, operator-confirmed are three states; only the third closes (D3). A fresh reviewer verifies, never self-certify (D4). Capture beats code-derived research (050 ADR-003). Read exit status from $?; the FIRST RESULT line is a folder's verdict. Re-derive a roadmap ratio from its goal.md, never quote it.

STATE (2026-09-06 10:50): 0.0.29 shipped. Landed since 09:30: the desktop combobox and popover align (0c3f6410, 537bbb61), no-confirm single delete (f962d626), the phone week's 80px min column (396bcae7), superseded within the hour. Five operator reports, §4 rows 59-63: the 10:04 iOS stacked sheet "really bad bugged" (duplicate close control, ink split, ~200px dead space, parent bleed; 048/051/044, leg 159); wrap off still drawing six-line rows (053, leg 160, producer unnamed); the board must page-scroll with desktop scrollbars hidden (056); the unscheduled band must go subtle (057, leg 161); and "our calendar looks nothing like anytype yet", which REOPENS 057. Rulings: 056 ADR-008 makes an operator ruling a third ground for declining a captured value (§7.13); "Stagger overlaps at 45px" supersedes the 80px landing (057 ADR-005); a 10-iteration deep-research loop is owed on the sheet family once 044/048/051 verify (051 T025). 057's Met rows stay ticked; its gestalt criterion gets no threshold until 162's review lands (§7.14). In flight: 148-151 harvests (Notion running), 153, 156, 159-162.

ORDER OF WORK: 1) land 153, 156, 159, 160 and 161, each rebased and verified; 2) read 162's review-ui-calendar-2026-09-06.md, fill 057 AC-013's threshold, then rebuild the calendar with the 45px stagger; 3) the board page-scroll and card-text leg after 156, then 058's formats; 4) 047's harvests one at a time; 5) cut 0.0.30, a build per family, operator checks each; 6) then the sheet-family deep research, then 046's device rows, the 050 legs and 007/004. Gate-green per phase; run the gate with stdin from /dev/null or verify.mjs hangs at 0% CPU; operator rows never ticked; rebase before landing a branch with parallel doc edits.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; npm run replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
