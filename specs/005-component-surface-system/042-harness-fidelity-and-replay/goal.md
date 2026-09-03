---
title: "Goal: Harness Fidelity and Replay"
description: "What would make phase 042 worth having done, and the criteria that decide it."
trigger_phrases:
  - "042 goal"
  - "harness fidelity and replay goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/042-harness-fidelity-and-replay"
    last_updated_at: "2026-09-03T23:50:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from the parent's 2026-09-03 audit; no code written yet"
    next_safe_action: "Read render-assertion-harness.ts, then add the chart scenario with its negative control"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "tools/live/render-assertion-harness.ts"
      - "tools/live/replay.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-042-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the manifest-compare fix belong in check-lane.mjs or a shared comparator"
      - "Is the chart view constructed through the same bag pattern as the other six renderers"
    answered_questions: []
---
# Goal: Harness Fidelity and Replay

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Close the parent's three unticked DONE-table rows (renderer coverage, replay
backfill, harness-dependency audit) by making every check verified against the production path
and every replay claim honest about the number it holds.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | Every new render-assertion scenario carries its own owned negative control, observed red before green (parent D2, D4). |
| D2 | A replay entry's pre-fix number is the number the original verifier measured, cited from its own report — never derived after the fact. |
| D3 | A row-6 dependency is either removed or declared with the exact criterion it cannot prove. A dependency found and left silent is a worse state than the row staying unticked. |
| D4 | This phase reaches Verified by construction, per `026`'s D5. Operator-confirmed never — nothing here is a device-facing surface. |
| D5 | The manifest-compare fix must still catch a deliberately mutated capture in an A/B control (parent D12) before its tolerance is accepted. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] A render-assertion scenario constructs the production chart renderer and asserts a
      thresholded property of what it builds, with an owned negative control observed red before
      green.
- [ ] Render-assertion scenarios construct the production `CalendarRenderer` at `scale: "week"`
      and `scale: "day"`, each with an owned negative control and bounds set from measured reads.
      `renderer-coverage.json` moves from 6 of 22.
- [ ] `npm run replay` carries a claim for report 29, reports 34-36, and phases `037`-`041`, each
      held against its recorded pre-fix number; the replay lane reds when a required entry is
      missing.
- [ ] Every row-6 dependency (pinned `runtime-vars.css` calendar formula, `touch-targets.mjs` /
      `unstyled-links.mjs` fixture reads, `theme.css`'s absent `.mod-cta`) is removed or declared
      with the criterion it cannot prove.
- [ ] The capture manifest compare is corrected to a content/layout-hash or declared-tolerance
      basis, and the fix is A/B'd against a clean HEAD clone showing it still catches a
      deliberately mutated capture.
- [ ] `SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate` exits 0, read from `$?` directly.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow. Progress, evidence, deviations
and findings belong here.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase folder opened | Done | `specs/005-component-surface-system/042-harness-fidelity-and-replay/` scaffolded via `create.sh --phase --parent`, Level 3 |
| Chart renderer scenario | Pending | — |
| Calendar week/day scenarios | Pending | — |
| Replay backfill | Pending | — |
| Row-6 dependency audit | Pending | — |
| Manifest-compare fix | Pending | — |

### Deviations and findings

| Item | Note |
|------|------|
| Level raised over `recommend-level.sh`'s answer | The script scored 61/100 (loc=650, files=10) and 66/100 (loc=850, files=12, reflecting the touch-targets/unstyled-links refactor row 6 implies) — both mid-to-upper Level 2, neither past the 70-point Level 3 floor. Raised to Level 3 anyway, per the operator's explicit "go higher if in doubt" and parity with `020-harness-fidelity-repair`, the closest prior art for this exact class of harness-truthfulness work, which is itself Level 3. |
<!-- /ANCHOR:log -->
