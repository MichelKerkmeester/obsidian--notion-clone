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
Execute specs/005-component-surface-system to operator confirmation, with 006-list-view-deprecation, 007-gallery-view-deprecation and 008-calendar-timeline-chart-deprecation as siblings. Repo ~/MEGA/Development/Obsidian Plugin, main.

BINDING: every phase's goal.md binds as if written here — read <phase>/goal.md before working it. The parent DONE table references every open subgoal (043 T031, 044-075). roadmap.md §4 report-to-phase, §5.A phase state, §6A decisions, §7 conflicts; operator-checklist.md the device rows.

PRECEDENCE: D1-D15 outrank child detail, which outranks any summary. Name a conflict, never resolve it silently. An agent never ticks an operator row.

RESUME: handover.md, then _memory.continuity, then the canonical spec docs; confirm branch tips and worktrees first; any pinned sha is stale.

DELEGATION (D14, amended 2026-09-08 evening): GLM 5.3 flash max via cli-pi DevPass (`--provider llmgateway --model glm-5.3-flash --thinking high` — `max` hangs the launch, `high` opens reliably) carries implementation legs, landings, docs and releases, on scripted numbered briefs, judged by decoded pixel-delta scripts, monitored every 5 min with a 15-min stall relaunch. Every GLM brief is write-first (first tool call writes; ≤3 calls between writes) or it runs read-only 20-45 min and is killed and relaunched write-first; two write-free GLM runs on one leg escalates it to native Sonnet (070, 075, 008/002, 066 did). One Opus 5 xhigh sub-orchestrator at most, held under Fable as master orchestrator/reviewer; Sonnet 5 xhigh scaffolds phases; cap of four agents; every leg keeps its `<worktree>/.handover.md` note untracked (gitignored) and writes the packet handover entry; landers regenerate `screenshots/manifest.json` after any rebase; rebuild the spec-kit orchestrator only from a clean Public-repo tree. Resume ritual: refresh every open goal.md and parent first, then post the body here before continuing.

EVIDENCE: D1 a check not driving production proves nothing. D2 a criterion carries a threshold and a red before green. D3 shipped, verified, operator-confirmed are three states; only the third closes. D4 a fresh reviewer verifies. D15 Notion refinement is additive; a contradiction with a landed Anytype ruling is a Proposed ADR. Read $?; the FIRST RESULT line is a folder's verdict.

STATE (2026-09-08 ~22:29): 0.0.33 shipped at `f91370f1`, installed to the operator vault. Landed since the morning scaffold (`bf694181`): `070` (`a75a1ae2`), `008/001` (`7a6d4cc6`), `075` (`8aec7d64`), `071/001` (`31f712c3`), `008/002` (`b5f4ccd4`), `073` (`f846e605`), `074` (`f2df348d`), `072` (`91501ed5`). Built, landing pending (landers paused by the operator, worktrees untouched): `071/002` at `70ee0b95` (`.worktrees/242`, mid-rebase) and `066` AC-010/AC-011 (toast dwell 5000→3500ms, 56×67px close hit) at `8bc8f050` (`.worktrees/243`, mid-chain). In progress, uncommitted: `071/003` (`.worktrees/244`), `071/004` (`.worktrees/245`).

ORDER OF WORK: 1) land 071/002 (resume its paused rebase), then 066 (resume its paused chain); 2) cut 0.0.34; 3) 008/003 renderer removal + archive, then 008/004 README/description strip; 4) 071/003 and 071/004 finish + land; 5) 071/005, 071/006; 6) 058 AC-012 discoverability; 7) device rows, operator only (059 AC-010, 060 D1-D4, 061 AC-005, 062 C9, 063 AC-011, 064 AC-011, 065 AC-012, 066 AC-008, 067 AC-011, 058 AC-008, 069 AC-010, 070 AC-006, 072 AC-004, 073 AC-005, 075 AC-006, 074's two operator rows, 056 C10.1-4, 057 G12/G15+AC-010, 068 fresh-vault smoke, 054 OPS-004); 8) open residuals (067 T015/T020/T021, 062 cosmetic leftovers, engine-parity's 50 pre-existing width disagreements).

DONE WHEN: every phase goal.md's criteria are met or operator-owned; validate.sh --strict on all three top-level parents reports Errors 0 on the first RESULT line; npm run gate is green read from $?; replay holds with reversed 0; and every §4 report is confirmed on device or deferred with the deferral recorded.
