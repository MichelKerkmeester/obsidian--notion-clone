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

BINDING: every phase's goal.md binds as if written here — read <phase>/goal.md before working it. The parent DONE table references every open subgoal (043 T031, 044-068). roadmap.md §4 report-to-phase, §5.A phase state, §6A decisions, §7 conflicts; operator-checklist.md the device rows.

PRECEDENCE: D1-D15 outrank child detail, which outranks any summary. Name a conflict, never resolve it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first; any pinned sha is stale.

DELEGATION (D14): native agents do the work: Sonnet implements, Opus verifies and lands (gate + validate --strict from $?), one worktree per leg, never spawn a sub-agent, never a Fable sub-agent, never fork. GLM 5.3 flash max runs alongside via cli-pi; OpenRouter credit hit 0 at 20:10, so: `--provider llmgateway --model glm-5.3-flash --thinking max` (DevPass). Use GLM where possible on text-only legs; images and live verification stay native. claude2 print-mode legs stay for the Mobbin harvests (MCP config). Both logins share a session-cap window (hit 17:05, 18:57; reset 19:40): keep a continuation prompt per leg. A delegate's report is a claim.

EVIDENCE: D1 a check not driving production proves nothing. D2 a criterion carries a threshold and a red before green. D3 shipped, verified, operator-confirmed are three states; only the third closes. D4 a fresh reviewer verifies. D15 Notion refinement is additive; a contradiction with a landed Anytype ruling is a Proposed ADR. Read $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-06 20:10): 0.0.30 shipped e016e75c (calendar rebuild, board page scroll, sheet fixes, README). Landed since 16:35: c6fde2a2 calendar, dc1d54a9 board page-scroll, 3e1c3c65 month-chip ellipsis, 52598819/dc6df4b4/e9cb2417 067, 9d9515ae 059, c49ca7f6+870d87a2 061, f52109c1 062, 7e44e487+21e6366a 063, cf15a636 065, 1b3aecf7 066, 3ab83d8b 060, a70dd113+dfb416ab 056 edge-only, b4c78e98 068 plan, cb27def3+9ad2fb34 README, f88c17c9 Notion reclassification, 64f9853f Fibery harvest (1,800 files). 061 set the cell model from four apps: tap edits, long-press selects, a 3-control anchored pill, a "..." sheet, the cell's editor claiming the dock, a 30px desktop bar. 068 renames everything: id, `obnotion-` prefix, data.json migration, author MichelKerkmeester; ONE leg after all in-flight landings. Rulings today (verbatim in §6A after the fold): 062 ADR-003/005/006/007, 059 ADR-004/010/011, 066 ADR-001/002, 065 ADR-005..008, 063 ADR-005, 068 prefix/author, 057 month-chip ellipsis, 056 edge-only scrollbar. In flight: the 064 synthesis (GLM DevPass + Opus lander), the 058 lander, the fold, ClickUp (wt 151), 061 impl on GLM.

ORDER OF WORK: 1) land 058, 064, the fold; 2) ClickUp lands, then T035 content reclassification for Fibery and ClickUp; 3) implementation legs in order: 061 (cell model + confirm card), 063 (labelled colour list + sheet escalation), 059 (Groups panel, hide-empty default on, wire hide), 062 (freeze + shadow, per-view noun, all Notion types), 065 (hidden-row grammar, view-hidden semantics, trailing add row), 066 (phone-centred toasts), 060, 064 (+ conditional-colour view-settings row), 067 - GLM/Sonnet implements, Opus lands; 4) 068 rename as one leg, then release 0.0.31; 5) device rows. Gate-green per phase; gate with stdin from /dev/null; rebase before landing doc edits.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
