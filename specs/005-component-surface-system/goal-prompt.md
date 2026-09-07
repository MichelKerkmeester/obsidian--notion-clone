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

DELEGATION (D14): native in-session agents only — Sonnet implements, Opus verifies/lands, never a Fable sub-agent, never fork. Cap of four native agents at once and ONLY ONE Opus at a time; landers strictly serial (operator 07:48, 13:05). Every leg keeps <worktree>/.handover.md and writes the packet's handover entry (operator 13:08). GLM 5.3 flash via cli-pi DevPass (`--provider llmgateway --model glm-5.3-flash --thinking max`) for text-only docs legs only — it cannot carry a code leg. claude2 print-mode legs only for Mobbin harvests. A delegate's report is a claim: landers re-run every check and judge moved captures by decoded pixel delta, never pixelHash. Rebuild the spec-kit orchestrator only from a clean Public-repo tree.

EVIDENCE: D1 a check not driving production proves nothing. D2 a criterion carries a threshold and a red before green. D3 shipped, verified, operator-confirmed are three states; only the third closes. D4 a fresh reviewer verifies. D15 Notion refinement is additive; a contradiction with a landed Anytype ruling is a Proposed ADR. Read $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-07 13:15): 0.0.30 shipped e016e75c. Landed 2026-09-07 (`git log --since=2026-09-07 --oneline origin/main` for SHAs): 064 child + rulings, ClickUp harvest 69c58159 + content reclassification 21392233 (047 T033-T035 all done), 063 a88894e5 + evidence gaps 755f2eac, 067 fold 44101b47 + implementation 173f7d3a (3/7; follow-up in flight), 060 5fec918d (5/5), 065 a0d64df0 + touch fix 8fb3c87e (9/10), 066 cbb854c4 + lane row af0e8796 (4/6), 059 f2a7ec34 (9/10), 062 2c8974fb + freeze defects 3a94e58b (8/9), 061 abb6827f + tap/dock 6ca4a5c3 (6/7; operator's cell-menu complaint closed in code), 064 impl b46f4ef2 (delete-view = undo branch), 030 status 31eafb60, 056/057 log anchors 6d222e6e, GitHub repo renamed to obsidian_notion-clone (origin repointed; 068 folds it in). In flight: 064 follow-ups (wt 212), toast-capture settle lander paused (214), 067 follow-up builder (215: menu card, scale 0.96, AC-003 light, lane pairs, 17 stale captures), Settings-sheet phone fix (216, operator report 10:20 on 0.0.30: two-column grid and overflowing select list on the phone Settings sheet).

ORDER OF WORK: 1) land 212, then 214, then 215 and 216 (one Opus lander at a time); 2) 068 rename as ONE leg with nothing else in flight (id obnotion, `obnotion-` prefix everywhere, data.json migration, author MichelKerkmeester, repo obsidian_notion-clone) → release 0.0.31 as the rename release; 3) the device rows (every child's operator row: 059 AC-010, 060 D1-D4, 061 AC-005, 062 C9, 063 AC-011, 064 AC-011, 065 AC-012, 066 AC-008, 067 AC-011, 058 AC-008, 056 C10.1-4, 057 G12/G15 + AC-010) — operator only.

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on both parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
