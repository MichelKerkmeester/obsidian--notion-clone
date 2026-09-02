---
title: "Implementation Plan: Board / Kanban Port"
description: "Ordered port steps for the board/Kanban visual and information-hierarchy rewrite, following the catalog's gate order."
trigger_phrases: ["038 plan"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from 036's adoption plan row 2"
    next_safe_action: "Record today's board behaviour before any rewrite line lands"
    blockers: []
    key_files: ["spec.md", "goal.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Board / Kanban Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. ORDER

Follows `research/research.md`'s "Final adoption plan" row 2 gate order: group/card contract →
drop matrix → keyboard/touch/cover → screenshot → `npm run gate`.

1. **A check that fails on the current renderer.** Before any rewrite line lands, record today's
   passing state of every local extension named in `spec.md` REQ-005 (WIP/visible counts,
   swimlanes, summaries, conditional formatting, multi-select, roving keyboard, edge auto-scroll,
   blank-space drop, touch long-press, cover-target scheme safety) and today's card information
   hierarchy and hover/drag/drop visual language, so the rewrite has an observed red — the current
   gap against catalog rows 2, 5, 8, 10, 11 — to close rather than an assumed one (parent D3).
2. **Group/card contract.** Rewrite the status-column information hierarchy (`renderColumn`,
   `board-renderer.ts:463-577`) and card field density (`renderCard`, `:750-951`) against catalog
   rows 1, 2, 5, 8, keeping `RowData.file.path` identity (REQ-003) and every local field the
   reference has no equivalent for.
3. **Drop matrix.** Rewrite hover/drag/drop visual language (catalog rows 7, 9, 10, 11) while
   proving the path/batch-order transaction (`resolveBoardContainerDropOrder`, `moveCardAndOrder`)
   unchanged across same-group, cross-group, and blank-space drop.
4. **Keyboard/touch/cover.** Re-prove roving keyboard (`wireCardKeyboard`), touch long-press
   (`attachLongPress`, `isTouchDevice`), and cover-target scheme safety (report 032,
   `renderCover`, `:953-991`) against the rewritten card shell.
5. **Screenshot.** Recapture the board scenario fixtures and swimlane/collapsed states; read every
   changed capture rather than trusting a diff count (parent trap: "a file count is the wrong
   instrument for capture churn").
6. **`npm run gate`.** Exit 0, `$?` read directly, not through a pipe.
<!-- /ANCHOR:summary -->

<!-- ANCHOR:architecture -->
## 2. EXTERNAL LANE ORDER AND CSS LANE PROTOCOL

**External delegation (parent `goal.md` D14).** Initial pass through `cli-devin` on
`deepseek-v4-flash-max` under `--permission-mode dangerous` (operator-approved for this repo's
worktree); then `gpt-5.6-luna` at `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`,
through `cli-codex` or `cli-opencode`; then in-runtime verification by a fresh agent that runs the
browser gate and `validate.sh` itself — a delegate's report is a claim until that fresh read
confirms it (D4, parent D14). Before composing any `cli-devin` or `cli-codex` prompt, read that
CLI's own `SKILL.md` under `.opencode/skills/cli-external-orchestration/` first.

**CSS lane (`styles.css` §17 BOARD VIEW).** Acquire the holder and history entry in
`tools/lane/css-lane.json` before editing any line in the section; the `css-lane` gate lane
refuses an unclaimed edit. Release only after a recapture that is actually read, naming the
changed captures in a `reviewed` array — not merely regenerated.

**Screenshots.** Recaptured after step 5 above and read, not assumed from a file-count diff (the
parent's own recorded trap on this exact instrument).
<!-- /ANCHOR:architecture -->

<!-- ANCHOR:testing -->
## 3. VERIFICATION

Each of REQ-001 through REQ-006 gets its own check, run once before the rewrite (step 1) and once
after (steps 2-4), so the before/after comparison is against an observed number rather than a
memory of the old behaviour. `SURFACE_PHASE=038-board-kanban-port npm run gate` is the
authoritative final gate; a lane's own log lives at `tools/lane/gate-logs/<lane>.log` and is read,
not assumed, on any red.
<!-- /ANCHOR:testing -->

<!-- ANCHOR:rollback -->
## 4. ROLLBACK

The rewrite is contained to `board-renderer.ts`'s column/card rendering methods and `styles.css`
§17. Reverting either file restores the pre-port renderer and stylesheet, which is correct but
lacks the adopted visual language — so rollback is safe, and the risk is losing the port's benefit,
not correctness.
<!-- /ANCHOR:rollback -->

<!-- ANCHOR:quality-gates -->
## AI EXECUTION PROTOCOL

### Pre-Task Checklist
- [ ] Every check named above has been observed failing before it is trusted.
- [ ] Exit codes are read directly; a pipe makes `$?` the pipe's status.
- [ ] The `css-lane` is acquired before any `styles.css` edit and released only after a recapture
      that was read.

### Execution Rules
1. Observe red before green; a check that never failed is not evidence.
2. No spec path, phase number, task id, or requirement id in any code comment (Comment Hygiene
   HARD BLOCK) — a copied-code landing point would get an MIT notice instead, and this phase
   copies none.
3. Regenerate metadata after any spec-doc edit in this folder.

### Status Reporting Format
Task id, what ran, exit code read directly, and the observation that closes it. Shipped, verified
and operator-confirmed are distinct and not interchangeable.

### Blocked Task Protocol
Halt and report with evidence and the decision needed rather than routing around a blocker.
<!-- /ANCHOR:quality-gates -->
