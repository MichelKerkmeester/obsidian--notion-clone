---
title: "Goal: Sheet Design Fundamentals"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "015-sheet-design-fundamentals goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/015-sheet-design-fundamentals"
    last_updated_at: "2026-09-10T00:00:00Z"
    last_updated_by: "284-sheet-design-review"
    recent_action: "Scaffolded from the sk-design-fundamentals review; not implemented"
    next_safe_action: "Execute tasks.md T001-T009"
    blockers: []
    key_files:
      - "spec.md"
      - "../sheet-design-review.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "015-sheet-design-fundamentals-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "28px (matching the sibling controls) or 44px (matching the thumb floor) for the calendar nav?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Design Fundamentals

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The two cross-sheet findings from `../sheet-design-review.md` that no single
existing child owns — the 24×24px calendar-navigation control shared by three sheet families, and
the toolbar Group-by sheet's missing screenshot scenario — are closed or made reviewable in one
small, additive child.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Neither finding is a Notion-parity question; no numeric target here is derived from a Notion asset. The touch-target floor comes from `interaction-craft.md` §3 and the app's own sibling-control precedent |
| D2 | This child does not reopen any landed ruling. The Properties sheet's 34px row density (the review's F-2/ADR-D) is explicitly **not** in scope here — it is recorded as a Proposed ADR in `roadmap.md` §7, not a task, because `009` already ruled on it by name |
| D3 | Only the operator's own device recheck may close a device-level completion row; no agent ticks it |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] `.obnotion-calendar-mini-nav` measures ≥28×28px under a coarse pointer, lane RED→GREEN
  — RED: the named-28px assertion in `touch-targets.mjs`'s unconditional RAISED enforcement
  exited 1 with eight misses at `measured 24x24, under its named 28px floor`; GREEN: exit 0
  after the `min-width`/`min-height: 28px` raise, census 127→123 and 655→651
- [x] A `group` scenario is registered, captured (light + dark, mobile), and opened and looked at
  — `id: "group"`, phone-only, `toolbar-renderer.ts` first in `sources`; the two captures
  (32068/31175 bytes, 804x1748) show the Group-by bottom sheet: grab bar, the Group/Close
  header, the checked No-group row, the 012 Shown/Hidden partition with both bulk actions, one
  property hidden. Judged from the decoded numbers per this worktree's measurement ruling:
  every pixel theme-inverted, top-100 rows uniform, bottom-200 painted — bottom-anchored. The
  criterion's look was the review-continuation's, as `acceptance-criteria.md`'s criterion-2
  wording allows; the operator's device read (D3) stays the packet's standing habit, not a
  criterion here
- [x] No regression on any landed sheet clause — sheet-grammar 0 both engines,
  touch-targets 0, render-assertions 0, vitest 1614/1614, placement 418/420 (2 declared),
  evidence 16/16 after the eleven named stamps were re-run by their own writers, scans 0/0,
  check-lane 0, gate 28 green / 0 red, exit 0
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | Scaffolded 2026-09-10 from `../sheet-design-review.md` §6 F-5 and §9 F-7, worktree `284-sheet-design-review` |
| Implementation | Done 2026-09-10, this worktree | Both findings landed, RED→GREEN; battery and lane evidence in the criteria above and in `tasks.md`'s completion notes. Two of the twelve judged capture paths (`table-frozen-column-desktop-light` 37px@32, `board-view-desktop-dark` 8px@1) are today's-engine moves — proven by recapturing with this packet's stylesheet backed out and named in the lane release for that reason; a third, `board-mobile-desktop-dark` (2px@1, one judged run), was restored to its committed bytes and its convergence pass returned it exactly |

### Deviations and findings

| Item | Note |
|------|------|
| Level 2, not 3 | Two small, independent, additive changes with no architectural decision between them; a lighter documentation level than its siblings, which each carried a real row-model or order redesign |
<!-- /ANCHOR:log -->
